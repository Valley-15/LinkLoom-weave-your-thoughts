import { createClient } from "@/utils/supabase/server";
import EditBookmarkForm from "@/components/EditBookmarkForm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: { id: string };
}

export const metadata: Metadata = {
  title: "Edit Bookmark | LinkLoom",
};

export default async function EditBookmarkPage({ params }: PageProps) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    notFound();
  }

  // Fetch the bookmark and its tags for this user
  const { data: bookmark, error } = await supabase
    .from("bookmarks")
    .select(
      "id, title, url, description, bookmark_tags:bookmark_tags(tag:tags(id, name))"
    )
    .eq("id", params.id)
    .eq("user_id", userData.user.id)
    .single();

  if (error || !bookmark) {
    notFound();
  }

  // Flatten tags, handling both array and object cases
  const initialTags = (bookmark.bookmark_tags || [])
    .map((bt: { tag: { id: string; name: string } | { id: string; name: string }[] | null }) => {
      if (Array.isArray(bt.tag)) {
        return bt.tag[0] || null;
      }
      return bt.tag;
    })
    .filter((tag): tag is { id: string; name: string } => Boolean(tag));

  return (
    <EditBookmarkForm
      id={bookmark.id}
      initialTitle={bookmark.title}
      initialUrl={bookmark.url}
      initialDescription={bookmark.description || ""}
      initialTags={initialTags}
    />
  );
}
