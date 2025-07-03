import type { Metadata } from "next";

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  // For MVP, use a generic title/description. For production, fetch bookmark title by id.
  return {
    title: `Edit Bookmark • LinkLoom`,
    description: `Edit or update your saved bookmark—view notes, tags, and metadata for quick recall.`,
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
      other: [
        { rel: "icon", url: "/icon-192x192.png", sizes: "192x192" },
        { rel: "icon", url: "/icon-512x512.png", sizes: "512x512" },
      ],
    },
    openGraph: {
      title: "Edit Bookmark • LinkLoom",
      description: "Edit or update your saved bookmark—view notes, tags, and metadata for quick recall.",
      url: `https://yourdomain.com/bookmarks/${params.id}/edit`,
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
      title: "Edit Bookmark • LinkLoom",
      description: "Edit or update your saved bookmark—view notes, tags, and metadata for quick recall.",
      images: ["https://yourdomain.com/twitter-image.png"],
    },
  };
}
