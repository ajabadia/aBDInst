import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSystemConfig } from "@/actions/admin";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Navbar from "@/components/Navbar";
import { auth } from "@/auth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/Toaster";
import { VaultModeProvider } from '@/context/VaultModeContext';
import { CommandPaletteProvider } from '@/context/CommandPaletteContext';
import CommandPalette from '@/components/CommandPalette';
import SessionWrapper from '@/components/SessionWrapper';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Instrument Collector",
  description: "Gestiona tu colección de instrumentos musicales",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Instrument Collector",
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || "";

  // Check Maintenance Mode
  const isMaintenance = await getSystemConfig('maintenance_mode');

  if (isMaintenance) {
    const isAdmin = session?.user?.role === 'admin';
    const isExempt = isAdmin || pathname === '/maintenance' || pathname === '/login' || pathname.startsWith('/auth') || pathname === '/manifest.json';

    if (!isExempt) {
      redirect('/maintenance');
    }
  }
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionWrapper session={session}>
            <VaultModeProvider>
              <CommandPaletteProvider>
                <CommandPalette />
                <Navbar session={session} />
                <main className="pt-24 pb-16 md:pb-0">
                  {children}
                </main>
                <Toaster position="top-center" />
              </CommandPaletteProvider>
            </VaultModeProvider>
          </SessionWrapper>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
