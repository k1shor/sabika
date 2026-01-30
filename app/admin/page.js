import Container from "@/components/Container";

export default function AdminPage() {
  return (
    <Container>
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin</h1>
        <p className="mt-3 text-slate-600">
          Protected route. Next step: we’ll build CMS CRUD editor (create/update/delete posts).
        </p>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="font-semibold">Coming next</div>
          <ul className="mt-2 text-sm text-slate-600 list-disc pl-5 space-y-1">
            <li>Create Post form</li>
            <li>Edit Post</li>
            <li>Delete Post</li>
            <li>Upload image support</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
