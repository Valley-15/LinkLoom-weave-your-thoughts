"use client";
import React, { useState, KeyboardEvent } from "react";

/**
 * TagInput component: lets users add tags as chips and integrates with FormData.
 * Usage: <TagInput name="tags" />
 * On submit, tags are sent as a comma-separated string in a hidden input.
 */
export default function TagInput({ name = "tags" }: { name?: string }) {
  const [input, setInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Add tag if not empty and not duplicate
  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInput("");
  };

  // Remove tag by index
  const removeTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  // Handle input key events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 border border-gray-300 rounded-lg px-2 py-2 bg-[var(--background)]">
        {tags.map((tag, idx) => (
          <span
            key={tag}
            className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-2 py-0.5 text-xs sm:text-sm font-medium shadow-sm"
          >
            {tag}
            <button
              type="button"
              className="ml-1 text-blue-500 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-full transition-colors"
              onClick={() => removeTag(idx)}
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[100px] border-none bg-transparent outline-none text-sm py-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder={tags.length === 0 ? "Add a tag and press Enter" : ""}
          autoComplete="off"
        />
      </div>
      {/* Hidden input for FormData submission */}
      <input type="hidden" name={name} value={tags.join(",")} />
    </div>
  );
}
