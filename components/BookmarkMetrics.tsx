"use client";

import React from "react";

interface TagMetric {
  name: string;
  count: number;
}

export default function BookmarkMetrics({
  total,
  topTags,
  onTagClick,
}: {
  total: number;
  topTags: TagMetric[];
  onTagClick?: (tag: string) => void;
}) {
  return (
    <div className="bg-gray-800 rounded-xl px-6 py-4 mb-6 flex flex-col gap-2 shadow-md">
      <div className="flex items-center gap-2 text-base font-semibold text-gray-100">
        <span role="img" aria-label="book">
          📚
        </span>
        You have {total} bookmark{total !== 1 ? "s" : ""}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
        <span className="font-medium">Top tags:</span>
        {topTags.length === 0 ? (
          <span className="italic text-gray-500">None yet</span>
        ) : (
          topTags.map((tag) => (
            <button
              key={tag.name}
              className="px-3 py-1 rounded-full bg-blue-900 text-blue-200 font-semibold flex items-center gap-1 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm"
              onClick={() => onTagClick && onTagClick(tag.name)}
              type="button"
            >
              {tag.name}
              <span className="ml-1 bg-blue-700 text-blue-100 rounded-full px-2 py-0.5 text-xs font-bold">
                {tag.count}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
