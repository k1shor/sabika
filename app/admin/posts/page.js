import AdminPostsPanel from "@/features/adminPosts/components/AdminPostsPanel";

export default function AdminPostsPage() {
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Manage Posts</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-blue-100/60">
          Review, approve, reject, edit, or remove posts from one focused page.
        </p>
      </div>
      <AdminPostsPanel />
    </div>
  );
}