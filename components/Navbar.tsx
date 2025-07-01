import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import React from "react";
import Logout from "./Logout";
import { usePathname } from "next/navigation";

const Navbar = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="border-b w-full flex items-center bg-[var(--background)] text-[var(--foreground)] shadow-sm px-2 sm:px-4">
      <div className="flex w-full items-center justify-between my-4">
        <Link
          className={`font-bold px-2 py-1 rounded transition-colors hover:bg-[#23272e]`}
          href="/"
        >
          Home
        </Link>
        <div className="flex items-center gap-x-5">{/* No Private link */}</div>
        <div className="flex items-center gap-x-5">
          {!user ? (
            <Link href="/login">
              <div className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md shadow hover:bg-blue-700 transition-colors">
                Login
              </div>
            </Link>
          ) : (
            <>
              <div className="flex items-center gap-x-2 text-sm">
                {user.email}
              </div>
              <Logout />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
