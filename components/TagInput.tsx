"use client";
import React, { useState, KeyboardEvent, useEffect } from "react";

/**
 * TagInput component: lets users add tags as chips and integrates with FormData.
 * Usage: <TagInput name="tags" tags={initialTags} onChange={setTags} />
 * On submit, tags are sent as a comma-separated string in a hidden input.
 */
export default function TagInput(props: {
  name?: string;
  tags?: { id?: string; name: string }[] | string[];
  onChange?: (tags: { id?: string; name: string }[] | string[]) => void;
  placeholder?: string;
  fullWidth?: boolean;
}) {
  const {
    name = "tags",
    tags: initialTags = [],
    onChange,
    placeholder = "Press Enter to add tag",
    fullWidth = false,
  } = props;

  // Normalize initial tags to string[]
  const initial = Array.isArray(initialTags)
    ? initialTags.map((t) => (typeof t === "string" ? t : t.name))
    : [];
  const [input, setInput] = useState("");
  const [tags, setTags] = useState<string[]>(initial);

  useEffect(() => {
    if (onChange) onChange(tags);
    // eslint-disable-next-line
  }, [tags]);

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
    <div className={fullWidth ? "w-full" : ""}>
      <div className="flex flex-wrap gap-2 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-[var(--background)] w-full min-h-[44px]">
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
          className="flex-1 min-w-[120px] border-none bg-transparent outline-none text-sm py-1 px-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder={placeholder}
          autoComplete="off"
          style={{ width: "auto" }}
        />
      </div>
      {/* Hidden input for FormData submission */}
      <input type="hidden" name={name} value={tags.join(",")} />
    </div>
  );
}
