import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

export default NextAuth(authConfig).auth((req) => {
    // Pass current URL to layout via headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-url', req.url);
    requestHeaders.set('x-pathname', req.nextUrl.pathname);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
});

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
