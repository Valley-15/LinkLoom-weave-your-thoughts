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
 * Deletes a bookmark for the current user.
 * - Only deletes if the bookmark belongs to the user (RLS enforced).
 * @param bookmarkId The ID of the bookmark to delete
 * @returns { status: 'success' | 'error'; error?: string }
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

/**
 * Server action to update an existing bookmark for the logged-in user, with tags.
 * - Updates bookmark fields and upserts/links tags.
 * @param input { id, title, url, description, tags }
 * @returns { status: string, error?: string }
 */
export async function updateBookmark({ id, title, url, description, tags }: {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
}) {
  const supabase = await createClient();
  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { status: "error", error: "User not authenticated." };
  }

  // 1. Update the main bookmark fields
  const { error: updateError } = await supabase
    .from("bookmarks")
    .update({ title, url, description })
    .eq("id", id)
    .eq("user_id", userData.user.id);
  if (updateError) {
    return { status: "error", error: updateError.message };
  }

  // 2. Upsert tags and collect their IDs
  const tagIds: string[] = [];
  for (const tag of tags) {
    const { data: tagData, error: tagError } = await supabase
      .from("tags")
      .upsert(
        { user_id: userData.user.id, name: tag },
        { onConflict: "user_id,name" }
      )
      .select("id")
      .single();
    if (!tagError && tagData?.id) {
      tagIds.push(tagData.id);
    }
  }

  // 3. Remove all old tag links for this bookmark
  await supabase.from("bookmark_tags").delete().eq("bookmark_id", id);

  // 4. Insert new tag links
  for (const tagId of tagIds) {
    await supabase.from("bookmark_tags").upsert({ bookmark_id: id, tag_id: tagId });
  }

  return { status: "success" };
}
