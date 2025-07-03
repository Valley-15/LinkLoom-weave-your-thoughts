"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TagInput from "./TagInput";
import { updateBookmark } from "@/actions/bookmarks";
import Link from "next/link";

// Props: id (string), initialTitle, initialUrl, initialDescription, initialTags (array of {id, name})
export default function EditBookmarkForm({
  id,
  initialTitle,
  initialUrl,
  initialDescription,
  initialTags,
}: {
  id: string;
  initialTitle: string;
  initialUrl: string;
  initialDescription?: string;
  initialTags: { id: string; name: string }[];
}) {
  // State for each field, initialized with the current bookmark values
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription || "");
  const [tags, setTags] = useState<{ id?: string; name: string }[]>(
    initialTags || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [titleError, setTitleError] = useState("");
  const router = useRouter();

  // Validation helpers
  const TITLE_MAX = 60;
  const DESC_MAX = 300;

  function validateUrl(value: string) {
    try {
      new URL(value);
      setUrlError("");
      return true;
    } catch {
      setUrlError("Please enter a valid URL.");
      return false;
    }
  }

  function validateTitle(value: string) {
    if (!value.trim()) {
      setTitleError("Title is required.");
      return false;
    }
    setTitleError("");
    return true;
  }

  // Handles form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validUrl = validateUrl(url);
    const validTitle = validateTitle(title);
    if (!validUrl || !validTitle) return;
    setLoading(true);
    setError("");
    const result = await updateBookmark({
      id,
      title,
      url,
      description,
      tags: tags.map((t) => t.name),
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/bookmarks");
    }
  }

  return (
    <>
      {/* Back to list link */}
      <Link
        href="/bookmarks"
        className="inline-flex items-center text-sm font-medium text-blue-400 hover:bg-blue-900/20 focus:outline-none px-2 py-1 rounded transition-colors gap-1 mb-2"
        style={{ alignSelf: "flex-start" }}
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to list
      </Link>
      <form
        onSubmit={handleSubmit}
        className="bg-[#181a20] rounded-2xl shadow-2xl p-8 flex flex-col gap-8 max-w-lg mx-auto border border-gray-800"
      >
        <h2 className="text-3xl font-extrabold mb-4 text-center text-white tracking-tight">
          Edit Bookmark
        </h2>
        {/* URL input */}
        <label className="font-semibold text-base text-gray-200">
          URL
          <input
            type="url"
            className="mt-2 w-full px-4 py-3 rounded-lg bg-[#23272e] border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base transition"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={(e) => validateUrl(e.target.value)}
            required
            autoFocus
          />
          <span className="text-xs text-gray-500 block mt-1">
            Paste the link you want to save.
          </span>
          {urlError && (
            <span className="text-xs text-red-500 block mt-1">{urlError}</span>
          )}
        </label>
        {/* Title input */}
        <label className="font-semibold text-base text-gray-200">
          Title
          <input
            type="text"
            className="mt-2 w-full px-4 py-3 rounded-lg bg-[#23272e] border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base transition"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              validateTitle(e.target.value);
            }}
            maxLength={TITLE_MAX}
            required
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">
              Give your bookmark a title.
            </span>
            <span className="text-xs text-gray-500">
              {title.length}/{TITLE_MAX}
            </span>
          </div>
          {titleError && (
            <span className="text-xs text-red-500 block mt-1">
              {titleError}
            </span>
          )}
        </label>
        {/* Details subheader */}
        <div className="font-semibold text-base text-gray-400 mt-2 mb-1 tracking-wide uppercase letter-spacing-[0.05em]">
          Details
        </div>
        {/* Description input */}
        <label className="font-semibold text-base text-gray-200">
          Description
          <textarea
            className="mt-2 w-full px-4 py-3 rounded-lg bg-[#23272e] border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[96px] text-base transition"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={DESC_MAX}
            rows={4}
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
              {description.length}/{DESC_MAX}
            </span>
          </div>
        </label>
        {/* Tags section */}
        <div className="flex flex-col gap-3 mt-4">
          <label className="font-semibold text-base text-gray-200 mb-1">
            Tags
          </label>
          {/* Existing tags as chips */}
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {tags.length === 0 && (
              <span className="text-xs text-gray-400 italic">No tags yet</span>
            )}
            {tags.map((tag, idx) => (
              <span
                key={tag.id ? `${tag.id}-${idx}` : `${tag.name}-${idx}`}
                className="flex items-center bg-blue-800 text-white dark:bg-blue-900 dark:text-white rounded-full px-3 py-1 text-sm font-medium shadow-sm min-w-[32px]"
                style={{ letterSpacing: "0.01em" }}
              >
                <span className="pr-1">{tag.name || "Tag"}</span>
                <button
                  type="button"
                  className="ml-1 text-blue-200 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-full transition-colors"
                  onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                  aria-label={`Remove tag ${tag.name}`}
                  tabIndex={0}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {/* Tag input field only */}
          <TagInput
            tags={[]}
            onChange={(newTags) => {
              // Only add if not already present
              const toAdd = (Array.isArray(newTags) ? newTags : [])
                .map((t) => (typeof t === "string" ? t : t.name))
                .filter((t) => !tags.some((tag) => tag.name === t));
              if (toAdd.length > 0) {
                setTags([...tags, ...toAdd.map((name) => ({ name }))]);
              }
            }}
            placeholder="Add tag and press Enter"
            fullWidth
          />
        </div>
        {/* Error message */}
        {error && (
          <div className="text-red-500 text-sm text-center font-semibold">
            {error}
          </div>
        )}
        {/* Action buttons */}
        <div className="flex gap-4 mt-4 justify-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow transition-colors text-base disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800 font-bold px-6 py-2 rounded-lg transition-colors text-base"
            onClick={() => router.push("/bookmarks")}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
