"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClientComponent() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setUser(null);
      } else {
        setUser(data?.user);
      }
    }
    getUser();
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
        <p className="mb-6">Sign in to manage your bookmarks.</p>
        <Link
          href="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-12 bg-[var(--panel)] rounded-xl shadow-lg p-8 flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold mb-2 text-center">
        All Your Bookmarks
      </h1>
      <div className="flex flex-col w-full gap-4 mt-4">
        <Link
          href="/bookmarks"
          className="w-full flex items-center justify-between bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-4 rounded-lg shadow transition-colors text-lg group"
        >
          <span>View existing bookmarks</span>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">
            &rarr;
          </span>
        </Link>
        <Link
          href="/bookmarks/new"
          className="w-full flex items-center justify-between bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-4 rounded-lg shadow transition-colors text-lg group"
        >
          <span>+ Create a new bookmark</span>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">
            &rarr;
          </span>
        </Link>
      </div>
    </div>
  );
}
