"use client";
import { useEffect, useState } from "react";
import BookmarkListWithTagFilter from "./BookmarkListWithTagFilter";

export default function BookmarksListWithState({ searchTerm = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ bookmarks: [], tags: [] });
  const [retryCount, setRetryCount] = useState(0);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookmarks");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Couldn’t load bookmarks. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [retryCount]);

  if (loading) {
    return (
      <div>
        {/* Shimmer filter panel */}
        <div className="bg-[var(--panel)] rounded-xl shadow-lg p-6 mb-8 animate-pulse">
          <div className="h-11 w-1/2 bg-gray-800 rounded mb-4" />
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-11 w-20 bg-gray-800 rounded-full" />
            ))}
          </div>
        </div>
        {/* Skeleton cards */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <li key={i} className="bg-[#23272e] rounded-xl p-4 min-h-[180px] animate-pulse border border-gray-800 shadow-lg" />
          ))}
        </ul>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6">
        <div className="flex items-center bg-red-800 text-white px-4 py-3 rounded shadow border-l-4 border-red-500 mb-4">
          <span className="mr-2">⚠️</span>
          <span className="flex-1">{error}</span>
          <button
            className="ml-4 bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded font-semibold text-sm"
            onClick={() => setRetryCount((c) => c + 1)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <BookmarkListWithTagFilter
      bookmarks={data.bookmarks}
      tags={data.tags}
      searchTerm={searchTerm}
    />
  );
}
