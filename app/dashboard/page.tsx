import { createClient } from "@/utils/supabase/server";
import NewBookmarkForm from "@/components/NewBookmarkForm";

export default async function DashboardPage() {
  const supabase = await createClient();
  // Get the current user
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return (
      <p className="p-8 text-center">
        You must be logged in to view your dashboard.
      </p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Add a New Bookmark</h1>
      <NewBookmarkForm />
    </div>
  );
}
