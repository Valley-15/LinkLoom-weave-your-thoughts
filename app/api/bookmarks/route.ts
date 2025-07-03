import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ bookmarks: [], tags: [] }, { status: 401 });
  }

  // Fetch bookmarks with their tags using a join
  const { data: bookmarksRaw, error } = await supabase
    .from("bookmarks")
    .select(
      `id, title, url, description, created_at, bookmark_tags ( tag:tags (id, name) )`
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch all tags for the user
  const { data: tagsRaw } = await supabase
    .from("tags")
    .select("id, name")
    .eq("user_id", userData.user.id)
    .order("name");

  type Tag = { id: string; name: string };
  type BookmarkTagRaw = { tag: Tag | Tag[] | null };
  type TagCount = Record<string, number>;
  const tagCount: TagCount = {};
  const bookmarks = (bookmarksRaw || []).map((bmRaw: {
    id: string;
    title: string;
    url: string;
    description?: string;
    created_at: string;
    bookmark_tags: BookmarkTagRaw[];
  }) => {
    const { id, title, url, description, created_at, bookmark_tags } = bmRaw;
    // Flatten tags to always be an array of {id, name}
    const fixedBookmarkTags = (bookmark_tags || []).map((bt: BookmarkTagRaw) => {
      let tag = bt.tag;
      if (Array.isArray(tag)) tag = tag[0];
      return { tag };
    });
    const tags = fixedBookmarkTags
      .map((bt) => bt.tag)
      .filter((tag): tag is Tag => Boolean(tag));
    tags.forEach((tag) => {
      tagCount[tag.name] = (tagCount[tag.name] || 0) + 1;
    });
    return {
      id,
      title,
      url,
      description,
      created_at,
      bookmark_tags: fixedBookmarkTags,
    };
  });

  const tags = (tagsRaw as Tag[])
    .map((tag) => ({ ...tag, count: tagCount[tag.name] || 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return NextResponse.json({ bookmarks, tags });
}
