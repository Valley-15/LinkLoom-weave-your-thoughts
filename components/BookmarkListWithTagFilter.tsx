"use client";
import React, { useState, useRef, useEffect } from "react";
import { deleteBookmark } from "@/actions/bookmarks";
import { useRouter, useSearchParams } from "next/navigation";
import { getRelativeTime } from "@/utils/relativeTime";

interface Tag {
  id: string;
  name: string;
  count?: number;
}

interface BookmarkTag {
  tag: Tag;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  created_at: string;
  created_at_formatted?: string;
  bookmark_tags: BookmarkTag[];
}

interface Props {
  bookmarks: Bookmark[];
  tags: Tag[];
  searchTerm?: string;
}

// Snackbar component
function Snackbar({
  message,
  actionLabel,
  onAction,
  open,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
  open: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-3 rounded shadow flex items-center gap-4 animate-fade-in">
      <span>{message}</span>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium focus:outline focus:outline-2 focus:outline-blue-400"
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function getFavicon(url: string) {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return "/globe.svg";
  }
}

export default function BookmarkListWithTagFilter({
  bookmarks: initialBookmarks,
  tags,
  searchTerm = "",
}: Props) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [pendingDelete, setPendingDelete] = useState<{
    bookmark: Bookmark;
    timer: NodeJS.Timeout;
  } | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchTerm);

  // Show top 10 tags, rest in popover
  // Only show tags that have at least one bookmark associated
  const tagsWithBookmarks = tags.filter((tag) =>
    bookmarks.some((bm) =>
      (bm.bookmark_tags || []).some((bt) => bt.tag && bt.tag.id === tag.id)
    )
  );
  const TOP_TAGS = 10;
  const topTags = tagsWithBookmarks.slice(0, TOP_TAGS);
  const extraTags = tagsWithBookmarks.slice(TOP_TAGS);
  const filteredExtraTags = extraTags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // Accessibility: close popover on Esc
  useEffect(() => {
    if (!showAllTags) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowAllTags(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showAllTags]);

  // Filter bookmarks by selected tag and search term
  const filtered = (
    selectedTag
      ? bookmarks.filter((bm) =>
          (bm.bookmark_tags || []).some(
            (bt) => bt.tag && bt.tag.name === selectedTag
          )
        )
      : bookmarks
  ).filter((bm) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (bm.title && bm.title.toLowerCase().includes(q)) ||
      (bm.url && bm.url.toLowerCase().includes(q)) ||
      (bm.description && bm.description.toLowerCase().includes(q))
    );
  });

  // Update search param in URL and local state
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchValue(e.target.value);
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (e.target.value) {
      params.set("q", e.target.value);
    } else {
      params.delete("q");
    }
    router.replace(`?${params.toString()}`);
  }

  // Optimistic delete with undo
  function handleDelete(id: string) {
    const bookmark = bookmarks.find((b) => b.id === id);
    if (!bookmark) return;
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    setDeletingId(id);
    setSnackbarOpen(true);
    // Start timer to finalize delete after 3.5s
    const timer = setTimeout(async () => {
      await deleteBookmark(id);
      setDeletingId(null);
      setPendingDelete(null);
      setSnackbarOpen(false);
    }, 3500);
    setPendingDelete({ bookmark, timer });
  }

  function handleUndo() {
    if (pendingDelete) {
      clearTimeout(pendingDelete.timer);
      setBookmarks((prev) => [pendingDelete.bookmark, ...prev]);
      setDeletingId(null);
      setPendingDelete(null);
      setSnackbarOpen(false);
    }
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (pendingDelete) clearTimeout(pendingDelete.timer);
    };
  }, [pendingDelete]);

  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return { dateStr, timeStr, iso };
  };

  return (
    <>
      {/* Sticky, padded filter/search panel */}
      <div className="sticky top-4 z-10 mb-8">
        <div className="bg-[var(--panel)] rounded-xl shadow-lg p-6 flex flex-col gap-4 pr-4 sm:pr-6 lg:pr-8">
          {/* SearchBar */}
          <div className="w-full flex items-center gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 rounded-lg bg-[#23272e] text-gray-200 border border-gray-700 focus:outline focus:outline-2 focus:outline-blue-500 placeholder-gray-500 text-base"
              placeholder="Search bookmarks…"
              value={searchValue}
              onChange={handleSearchChange}
              aria-label="Search bookmarks"
              style={{ minHeight: 44 }}
            />
            <span className="text-gray-500 text-lg">🔍</span>
          </div>
          {/* Tag pills row */}
          <div className="flex flex-wrap gap-2 items-center w-full pt-1">
            <button
              className={`px-3 py-2 rounded-full border text-sm font-medium min-w-[44px] h-11 flex-shrink-0 focus:outline focus:outline-2 focus:outline-blue-500 transition-colors
                ${
                  !selectedTag
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-[#23272e] text-gray-200 border-gray-700 hover:bg-blue-900"
                }
              `}
              onClick={() => setSelectedTag(null)}
              aria-pressed={!selectedTag}
            >
              All
            </button>
            {topTags.map((tag) => (
              <button
                key={tag.id}
                className={`px-3 py-2 rounded-full border text-sm font-medium min-w-[44px] h-11 flex-shrink-0 focus:outline focus:outline-2 focus:outline-blue-500 transition-colors
                  ${
                    selectedTag === tag.name
                      ? "bg-blue-600 text-white border-blue-600 shadow"
                      : "bg-[#23272e] text-gray-200 border-gray-700 hover:bg-blue-900"
                  }
                `}
                onClick={() => setSelectedTag(tag.name)}
                aria-pressed={selectedTag === tag.name}
              >
                {tag.name}
              </button>
            ))}
            {extraTags.length > 0 && (
              <div className="relative">
                <button
                  className="px-3 py-2 rounded-full border text-sm font-medium min-w-[44px] h-11 flex-shrink-0 bg-[#23272e] text-gray-200 border-gray-700 hover:bg-gray-800 focus:outline focus:outline-2 focus:outline-blue-500"
                  aria-haspopup="listbox"
                  aria-expanded={showAllTags}
                  aria-controls="all-tags-popover"
                  onClick={() => setShowAllTags((v) => !v)}
                >
                  {showAllTags ? "Show fewer ▴" : "More ▾"}
                </button>
                {showAllTags && (
                  <div
                    id="all-tags-popover"
                    ref={popoverRef}
                    className="absolute z-20 left-0 mt-2 w-56 max-h-72 bg-[var(--panel)] border border-gray-700 rounded-lg shadow-lg p-2 flex flex-col animate-fade-in"
                    tabIndex={-1}
                    role="listbox"
                  >
                    <input
                      type="text"
                      className="mb-2 px-2 py-1 rounded border border-gray-700 w-full text-sm bg-[#23272e] text-gray-200 focus:outline focus:outline-2 focus:outline-blue-500"
                      placeholder="Filter tags…"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      aria-label="Filter tags"
                      autoFocus
                    />
                    <ul className="overflow-y-auto max-h-48" role="listbox">
                      {filteredExtraTags.length === 0 && (
                        <li className="text-xs text-gray-500 px-2 py-1">
                          No tags found.
                        </li>
                      )}
                      {filteredExtraTags.map((tag) => (
                        <li
                          key={tag.id}
                          role="option"
                          aria-selected={selectedTag === tag.name}
                          className={`px-2 py-1 rounded cursor-pointer text-sm ${
                            selectedTag === tag.name
                              ? "bg-blue-600 text-white"
                              : "hover:bg-blue-900 text-gray-200"
                          }`}
                          tabIndex={0}
                          onClick={() => {
                            setSelectedTag(tag.name);
                            setShowAllTags(false);
                            setTagSearch("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setSelectedTag(tag.name);
                              setShowAllTags(false);
                              setTagSearch("");
                            }
                          }}
                        >
                          {tag.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Bookmarks list */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <li className="col-span-full flex flex-col items-center justify-center text-center text-gray-400 py-16 text-lg font-medium bg-[var(--panel)] rounded shadow-inner min-h-[260px]">
            <svg
              width="64"
              height="64"
              fill="none"
              viewBox="0 0 64 64"
              className="mb-4 opacity-60"
            >
              <rect
                x="12"
                y="16"
                width="40"
                height="32"
                rx="6"
                fill="#23272e"
                stroke="#3b3b3b"
                strokeWidth="2"
              />
              <path
                d="M20 24h24M20 32h16M20 40h8"
                stroke="#555"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <h2 className="text-xl font-bold text-white mb-1">
              No bookmarks yet!
            </h2>
            <p className="text-gray-400 mb-4">
              Looks like you haven’t saved anything. Hit ‘+ New Bookmark’ to get
              started.
            </p>
            <a
              href="/bookmarks/new"
              className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2 rounded-lg shadow transition-colors text-base flex items-center gap-2"
            >
              <span className="text-xl">+</span> Add your first bookmark
            </a>
          </li>
        ) : (
          filtered.map((bm: Bookmark) => (
            <li
              key={bm.id}
              className="relative border border-gray-800 rounded-xl p-4 bg-[#23272e] shadow-lg transition-all duration-200 group hover:shadow-2xl focus-within:shadow-2xl flex flex-col min-h-[180px]"
              tabIndex={0}
              style={{ height: "240px" }}
            >
              {/* Favicon and delete icon row */}
              <div className="flex items-start justify-between mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getFavicon(bm.url)}
                  alt="Favicon"
                  className="w-6 h-6 rounded mr-2 flex-shrink-0 bg-[#18181b] border border-gray-700"
                  loading="lazy"
                />
                <div className="flex gap-1 items-center">
                  {/* Edit button */}
                  <a
                    href={`/bookmarks/${bm.id}/edit`}
                    className={`w-8 h-8 flex items-center justify-center rounded-full border border-transparent transition-all duration-150
                      bg-transparent
                      hover:bg-blue-900
                      focus:outline focus:outline-2 focus:outline-blue-500
                      active:scale-95
                      shadow-sm
                      group-hover:opacity-100 opacity-0
                      sm:opacity-0 sm:group-hover:opacity-100
                      md:opacity-0 md:group-hover:opacity-100
                      lg:opacity-0 lg:group-hover:opacity-100
                      [@media(max-width:640px)]:opacity-100
                    `}
                    aria-label="Edit bookmark"
                    title="Edit bookmark"
                    tabIndex={0}
                    style={{ position: "absolute", top: 12, right: 52 }}
                  >
                    {/* Pencil icon SVG */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 text-blue-400"
                      aria-hidden="true"
                    >
                      <path d="M17.414 2.586a2 2 0 0 0-2.828 0l-9.5 9.5A2 2 0 0 0 4 13.414V16a2 2 0 0 0 2 2h2.586a2 2 0 0 0 1.414-.586l9.5-9.5a2 2 0 0 0 0-2.828l-2-2zM6 15v-1.586l8.293-8.293 1.586 1.586L7.586 15H6zm2.586 1H6a1 1 0 0 1-1-1v-2.586l8.293-8.293 2.586 2.586-8.293 8.293z" />
                    </svg>
                    <span className="sr-only">Edit</span>
                  </a>
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(bm.id)}
                    disabled={deletingId === bm.id}
                    className={`w-8 h-8 flex items-center justify-center rounded-full border border-transparent transition-all duration-150
                      bg-transparent
                      hover:bg-red-900
                      focus:outline focus:outline-2 focus:outline-red-500
                      active:scale-95
                      shadow-sm
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${deletingId === bm.id ? "animate-pulse" : ""}
                      group-hover:opacity-100 opacity-0
                      sm:opacity-0 sm:group-hover:opacity-100
                      md:opacity-0 md:group-hover:opacity-100
                      lg:opacity-0 lg:group-hover:opacity-100
                      [@media(max-width:640px)]:opacity-100
                    `}
                    aria-label="Delete bookmark"
                    title="Delete bookmark"
                    tabIndex={0}
                    style={{ position: "absolute", top: 12, right: 12 }}
                  >
                    {/* Trash icon SVG */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-5 h-5 ${
                        deletingId === bm.id ? "text-red-400" : "text-red-500"
                      }`}
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.5 3A1.5 1.5 0 0 1 9 1.5h2A1.5 1.5 0 0 1 12.5 3H17a1 1 0 1 1 0 2h-1.07l-.86 11.18A2 2 0 0 1 13.08 18H6.92a2 2 0 0 1-1.99-1.82L4.07 5H3a1 1 0 1 1 0-2h4.5zm2.5 0V2h-2v1h2zm-4.43 2l.85 11h6.16l.85-11H5.57z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="sr-only">Delete</span>
                  </button>
                </div>
              </div>
              {/* Card content clickable */}
              <a
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-400 font-semibold text-lg sm:text-xl hover:text-blue-300 transition-colors break-all truncate"
                style={{
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                tabIndex={0}
                title={bm.title || bm.url}
              >
                {bm.title || bm.url}
              </a>
              {bm.description && (
                <p className="text-gray-400 mt-1 text-sm sm:text-base line-clamp-2">
                  {bm.description}
                </p>
              )}
              {/* Render tags (up to 3, +N more) */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {(bm.bookmark_tags || [])
                  .map((bt: BookmarkTag) => bt.tag)
                  .filter(Boolean)
                  .slice(0, 3)
                  .map((tag: Tag) => (
                    <span
                      key={tag.id}
                      className="bg-blue-900 text-blue-200 rounded-full px-2 py-0.5 text-xs sm:text-sm font-medium"
                    >
                      {tag.name}
                    </span>
                  ))}
                {(bm.bookmark_tags || []).length > 3 && (
                  <span className="bg-gray-800 text-gray-300 rounded-full px-2 py-0.5 text-xs sm:text-sm font-medium">
                    +{(bm.bookmark_tags || []).length - 3} more
                  </span>
                )}
              </div>
              <div className="mt-auto pt-2 flex items-center gap-4 text-xs text-gray-400">
                {/* Clock icon and relative time with tooltip */}
                {(() => {
                  const { dateStr, timeStr } = formatDateTime(bm.created_at);
                  const rel = getRelativeTime(bm.created_at);
                  return (
                    <span className="flex items-center gap-1 group relative">
                      <svg className="w-4 h-4 text-gray-500 mr-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
                      </svg>
                      <span className="cursor-default group-hover:underline" tabIndex={0} title={`${dateStr} at ${timeStr}`}>Added {rel}</span>
                      {/* Tooltip on hover/focus */}
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex group-focus:flex bg-gray-900 text-gray-100 px-3 py-1 rounded shadow text-xs z-20 whitespace-nowrap border border-gray-700">
                        {dateStr} at {timeStr}
                      </span>
                    </span>
                  );
                })()}
                {/* Tag count */}
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7a1 1 0 011-1h4.586a1 1 0 01.707.293l5.414 5.414a2 2 0 010 2.828l-7.586 7.586a2 2 0 01-2.828 0l-5.414-5.414a1 1 0 010-1.414l7.586-7.586A1 1 0 0111.586 5H13a1 1 0 011 1v1" />
                  </svg>
                  {bm.bookmark_tags?.length || 0} tags
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
      {/* Snackbar for undo */}
      <Snackbar
        message="Bookmark deleted."
        actionLabel="Undo"
        onAction={handleUndo}
        open={snackbarOpen}
      />
    </>
  );
}
