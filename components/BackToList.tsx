import Link from "next/link";

export default function BackToList() {
  return (
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
  );
}
