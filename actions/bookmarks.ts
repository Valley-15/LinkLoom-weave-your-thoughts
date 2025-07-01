"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Server action to add a new bookmark for the logged-in user, with tags.
 * @param formData - FormData containing url, title, description, tags
 * @returns { status: string, error?: string }
 */
export async function addBookmark(formData: FormData) {
  const supabase = await createClient();
  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { status: "error", error: "User not authenticated." };
  }

  const url = formData.get("url") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const tagsString = formData.get("tags") as string;
  const tags = tagsString
    ? tagsString
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  if (!url || url.trim() === "") {
    return { status: "error", error: "URL is required." };
  }

  // Insert the new bookmark
  const { data: bookmarkData, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: userData.user.id,
      url,
      title,
      description,
    })
    .select("id")
    .single();

  if (error) {
    if (
      error.message.includes("unique constraint") ||
      error.message.includes("duplicate key")
    ) {
      return { status: "error", error: "You already saved this bookmark!" };
    }
    return {
      status: "error",
      error: "Failed to add bookmark. Please try again.",
    };
  }

  // Handle tags: upsert tags and link to bookmark
  for (const tag of tags) {
    // Upsert tag for this user
    const { data: tagData, error: tagError } = await supabase
      .from("tags")
      .upsert(
        { user_id: userData.user.id, name: tag },
        { onConflict: "user_id,name" }
      )
      .select("id")
      .single();
    if (tagError) continue; // skip tag if error
    // Link tag to bookmark
    await supabase.from("bookmark_tags").upsert({
      bookmark_id: bookmarkData.id,
      tag_id: tagData.id,
    });
  }

  return { status: "success" };
}

/**
 * Server action to delete a bookmark by ID for the logged-in user.
 * @param bookmarkId - The ID of the bookmark to delete
 * @returns { status: string, error?: string }
 */
export async function deleteBookmark(bookmarkId: string) {
  const supabase = await createClient();
  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { status: "error", error: "User not authenticated." };
  }

  // Delete the bookmark (RLS should ensure only the user's bookmarks are deleted)
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", bookmarkId)
    .eq("user_id", userData.user.id);

  if (error) {
    return { status: "error", error: error.message };
  }
  return { status: "success" };
}
