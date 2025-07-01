import { createClient } from "@/utils/supabase/server";

export default async function PrivatePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  let username = "";
  if (data.user?.email) {
    // Fetch username from user_profiles table using email
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("username")
      .eq("email", data.user.email)
      .single();
    username = profile?.username || "";
  }
  return (
    <p className="flex min-h-screen flex-col items-center justify-between p-24">
      Hello, {username}
    </p>
  );
}
