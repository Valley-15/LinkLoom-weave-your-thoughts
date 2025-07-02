import { createClient } from "@/utils/supabase/server";
import BookmarkListWithTagFilter from "@/components/BookmarkListWithTagFilter";
import Link from "next/link";

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return (
      <p className="p-8 text-center">
        You must be logged in to view your bookmarks.
      </p>
    );
  }

  // Fetch bookmarks with their tags using a join
  const { data: bookmarksRaw, error } = await supabase
    .from("bookmarks")
    .select(
      `
      id, title, url, description, created_at,
      bookmark_tags (
        tag:tags (id, name)
      )
    `
    )
    .order("created_at", { ascending: false });

  // Fetch all tags for the user
  const { data: tagsRaw } = await supabase
    .from("tags")
    .select("id, name")
    .eq("user_id", userData.user.id)
    .order("name");

  if (error) {
    return (
      <p className="p-8 text-red-500">
        Error loading bookmarks: {error.message}
      </p>
    );
  }

  if (!bookmarksRaw || bookmarksRaw.length === 0) {
    return <p className="p-8 text-center">No bookmarks found.</p>;
  }

  // Format dates on the server and count tag usage
  type Tag = { id: string; name: string };
  type BookmarkTag = { tag: Tag };
  type TagCount = Record<string, number>;

  const tagCount: TagCount = {};
  const bookmarks = (bookmarksRaw as unknown[]).map((bmRaw) => {
    const { id, title, url, description, created_at, bookmark_tags } =
      bmRaw as {
        id: string;
        title: string;
        url: string;
        description?: string;
        created_at: string;
        bookmark_tags: { tag: Tag | Tag[] | null }[];
      };
    // Fix: ensure each bookmark_tag.tag is a single object, not an array
    const fixedBookmarkTags: BookmarkTag[] = (bookmark_tags || []).map(
      (bt: { tag: Tag | Tag[] | null }) => ({
        tag: Array.isArray(bt.tag) ? bt.tag[0] : (bt.tag as Tag),
      })
    );
    const tags: Tag[] = fixedBookmarkTags
      .map((bt: BookmarkTag) => bt.tag)
      .filter((tag: Tag | null): tag is Tag => Boolean(tag));
    tags.forEach((tag: Tag) => {
      tagCount[tag.name] = (tagCount[tag.name] || 0) + 1;
    });
    return {
      id,
      title,
      url,
      description,
      created_at,
      bookmark_tags: fixedBookmarkTags,
      created_at_formatted: new Date(created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
  });

  // Sort tags by usage count, then alphabetically
  const tags = (tagsRaw as Tag[])
    .map((tag) => ({ ...tag, count: tagCount[tag.name] || 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  // Get search term from searchParams
  const searchTerm = searchParams?.q || "";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-left tracking-tight select-none">
          All Your Bookmarks
        </h1>
        <Link
          href="/bookmarks/new"
          className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2 rounded-lg shadow transition-colors text-base flex items-center gap-2"
        >
          <span className="text-xl">+</span> New Bookmark
        </Link>
      </div>
      <BookmarkListWithTagFilter
        bookmarks={bookmarks}
        tags={tags}
        searchTerm={searchTerm}
      />
    </div>
  );
}
