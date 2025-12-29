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

                const user = await User.findOne({ email: credentials.email }).select('+password');
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
            if (session?.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.sub;
            }
            return session;
        }
    },
    session: { strategy: "jwt" },
    pages: {
        signIn: '/login', // We will create this page later
    }
});
