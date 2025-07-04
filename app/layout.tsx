import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkLoom",
  description: "A modern, dark-mode-only bookmark manager.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>LinkLoom</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)] min-h-screen`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="mx-auto w-full max-w-screen-lg min-h-screen flex flex-col px-2 sm:px-4 md:px-8">
            <Navbar />
            <main className="flex-grow flex flex-col w-full">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
