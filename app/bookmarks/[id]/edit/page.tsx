import EditBookmarkForm from "@/components/EditBookmarkForm";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function EditBookmarkPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return notFound();

  const { data: bookmark, error } = await supabase
    .from("bookmarks")
    .select(
      "id, title, url, description, created_at, bookmark_tags(tag:tags(id, name))"
    )
    .eq("id", params.id)
    .single();

  if (error || !bookmark) return notFound();

  // Flatten tags for form as string[]
  const tags = (bookmark.bookmark_tags || [])
    .map((bt: any) => bt.tag?.name)
    .filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-12">
      <h1 className="text-2xl font-bold mb-6 text-left">Edit Bookmark</h1>
      <EditBookmarkForm
        id={bookmark.id}
        initialTitle={bookmark.title}
        initialUrl={bookmark.url}
        initialDescription={bookmark.description}
        initialTags={tags}
      />
    </div>
  );
}
