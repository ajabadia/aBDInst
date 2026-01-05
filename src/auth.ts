import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './lib/clientPromise';
import dbConnect from './lib/db';
import User from './models/User';
import bcrypt from 'bcryptjs';

import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
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
    // Callbacks are merged/overridden. We keep database-specific logic here if needed, 
    // but common logic is in authConfig. 
    // Since we moved role/id mapping to authConfig, we can rely on that.
    session: { strategy: "jwt" },
});
