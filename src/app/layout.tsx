import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  let session;
  try {
    session = await auth();
  } catch (e) {
    console.error("Auth error in RootLayout:", e);
    session = null;
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
        </ThemeProvider>
      </body>
    </html>
  );
}
