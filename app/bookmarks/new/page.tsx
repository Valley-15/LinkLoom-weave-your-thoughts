import BackToList from "@/components/BackToList";
import NewBookmarkForm from "@/components/NewBookmarkForm";

export default function NewBookmarkPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-12">
      <BackToList />
      <h1 className="text-2xl font-bold mb-6 text-left">Add a New Bookmark</h1>
      <NewBookmarkForm />
    </div>
  );
}
