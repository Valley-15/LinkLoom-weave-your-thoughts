"use client";
import React, { useState } from "react";
import { addBookmark } from "@/actions/bookmarks";
import TagInput from "@/components/TagInput";
import { useRouter } from "next/navigation";

export default function NewBookmarkForm() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [descCount, setDescCount] = useState(0);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!title.trim()) {
      setError("Title is required.");
      setLoading(false);
      return;
    }
    if (title.length > 60) {
      setError("Title must be 60 characters or less.");
      setLoading(false);
      return;
    }
    if (desc.length > 300) {
      setError("Description must be 300 characters or less.");
      setLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("url", url);
    formData.set("title", title);
    formData.set("description", desc);
    const result = await addBookmark(formData);

    if (result.status === "success") {
      setSuccess(true);
      setUrl("");
      setTitle("");
      setDesc("");
      router.push("/bookmarks"); // Redirect to bookmarks after success
    } else {
      setError(result.error || "Something went wrong.");
    }
    setLoading(false);
  }

  // Micro-preview for details
  // Only use desc for preview for now (no document access)
  const detailsPreview = (
    <div className="text-xs text-gray-400 mt-1">
      {desc && <span>📝 Note saved.</span>}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 space-y-4 bg-[var(--background)] p-4 sm:p-6 rounded-xl shadow-md max-w-xl mx-auto transition-colors duration-200 text-[var(--foreground)]"
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
        Add New Bookmark
      </h2>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
          URL<span className="text-red-500">*</span>
        </label>
        <input
          name="url"
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline focus:outline-2 focus:outline-blue-500 transition-colors"
          placeholder="https://example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
          Title<span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline focus:outline-2 focus:outline-blue-500 transition-colors"
          placeholder="Give this bookmark a name"
        />
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {title.length}/60
        </span>
      </div>
      <div className="mt-4 ml-1 flex items-center gap-2">
        <button
          type="button"
          aria-expanded={showMore}
          aria-controls="bookmark-details"
          className={`flex items-center px-3 py-1 rounded border border-gray-300 dark:border-gray-700 text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline focus:outline-2 focus:outline-blue-500 ${
            showMore ? "text-blue-600" : "text-gray-600 dark:text-gray-300"
          }`}
          style={{ minHeight: 44 }}
          onClick={() => setShowMore((v) => !v)}
        >
          {showMore ? (
            <span className="mr-1">➖</span>
          ) : (
            <span className="mr-1">➕</span>
          )}
          {showMore ? "Hide details" : "Add details (description, tags)"}
        </button>
        {!showMore && (desc || false) && detailsPreview}
      </div>
      <div
        id="bookmark-details"
        aria-hidden={!showMore}
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          showMore ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {showMore && (
          <>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                Description
              </label>
              <textarea
                name="description"
                value={desc}
                onChange={(e) => {
                  setDesc(e.target.value);
                  setDescCount(e.target.value.length);
                }}
                maxLength={300}
                className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:outline focus:outline-2 focus:outline-blue-500 transition-colors"
                placeholder="Add a short note (optional)."
                rows={2}
              />
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {descCount}/300
              </span>
            </div>
            <TagInput name="tags" />
          </>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 focus:outline focus:outline-2 focus:outline-blue-500 transition-colors"
      >
        {loading ? "Adding..." : "Add Bookmark"}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm mt-2">Bookmark added!</p>
      )}
    </form>
  );
}
