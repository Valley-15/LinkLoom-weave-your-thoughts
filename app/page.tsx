import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] gap-10 p-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 text-white drop-shadow-lg">
        Welcome to LinkLoom
      </h1>
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md justify-center">
        <Link
          href="/dashboard"
          className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-5 px-6 rounded-2xl shadow-lg text-lg text-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          + Add a New Bookmark
        </Link>
        <Link
          href="/bookmarks"
          className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-5 px-6 rounded-2xl shadow-lg text-lg text-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Show Existing Bookmarks
        </Link>
      </div>
    </main>
  );
}
