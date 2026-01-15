import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's role. */
            role: string
            /** The user's unique ID. */
            id: string
        } & DefaultSession["user"]
    }

    interface User {
        role?: string
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        role: string
    }
}
