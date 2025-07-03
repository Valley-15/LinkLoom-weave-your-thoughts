import { createClient } from "@/utils/supabase/server";
import BookmarksListWithState from "@/components/BookmarksListWithState";
import Link from "next/link";

export default async function BookmarksPage({ searchParams }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return (
      <p className="p-8 text-center">
        You must be logged in to view your bookmarks.
      </p>
    );
  }

  // Get search term from searchParams
  const searchTerm = searchParams?.q || "";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-left tracking-tight select-none">
          All Your Bookmarks
        </h1>
        <Link
          href="/bookmarks/new"
          className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2 rounded-lg shadow transition-colors text-base flex items-center gap-2"
        >
          <span className="text-xl">+</span> New Bookmark
        </Link>
      </div>
      <BookmarksListWithState searchTerm={searchTerm} />
    </div>
  );
}
