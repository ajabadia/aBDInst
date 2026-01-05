import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') ||
                nextUrl.pathname.startsWith('/studio') ||
                (nextUrl.pathname.startsWith('/instruments') && nextUrl.pathname.includes('/edit'));

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
        jwt: async ({ token, user }) => {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (session?.user && token.sub) {
                session.user.role = token.role as string;
                session.user.id = token.sub;
            }
            return session;
        }
    },
    providers: [], // Providers configured in auth.ts
} satisfies NextAuthConfig;
