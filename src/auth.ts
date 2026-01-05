import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './lib/clientPromise';
import dbConnect from './lib/db';
import User from './models/User';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                await dbConnect();
                if (!credentials?.email || !credentials?.password) return null;

                const email = (credentials.email as string).toLowerCase();

                const user = await User.findOne({ email }).select('+password');
                if (!user) return null;

                const passwordsMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!passwordsMatch) return null;

                return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
            }
        })
    ],
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (session?.user && token.sub) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.sub;

                // Optimization: Rely on JWT token for user data instead of checking DB every request.
                // Profile updates will appear on next session refresh (logout/login or token rotation).
                // If immediate consistency is needed, consider client-side "update()" or unstable_cache.
            }
            return session;
        }
    },
    session: { strategy: "jwt" },
    pages: {
        signIn: '/login',
    }
});
