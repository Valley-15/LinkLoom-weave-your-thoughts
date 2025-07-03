import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Bookmarks • LinkLoom",
  description:
    "Quickly save, tag, and browse all your web bookmarks in one place—powered by Next.js & Supabase.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "icon", url: "/icon-192x192.png", sizes: "192x192" },
      { rel: "icon", url: "/icon-512x512.png", sizes: "512x512" },
    ],
  },
  openGraph: {
    title: "LinkLoom • Your Bookmark Manager",
    description: "Save, tag, and revisit your favorite web pages with ease.",
    url: "https://yourdomain.com/bookmarks",
    images: [
      {
        url: "https://yourdomain.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkLoom • Your Bookmark Manager",
    description: "Save, tag, and revisit your favorite web pages with ease.",
    images: ["https://yourdomain.com/twitter-image.png"],
  },
};
