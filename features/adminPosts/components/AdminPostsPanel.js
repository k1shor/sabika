"use client";

import { useState } from "react";
import CreatePostForm from "./CreatePostForm";
import CommunityPostsList from "./CommunityPostsList";

export default function AdminPostsPanel() {
  const [activeTab,  setActiveTab]  = useState("official");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="grid gap-6">
      <div className="flex w-fit gap-2 rounded-2xl border border-slate-200 bg-white/70 p-1.5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        {[
          { id: "official",  label: "✦ Official Posts"   },
          { id: "community", label: "👥 Community Posts"  },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`rounded-xl px-5 py-2 text-sm font-bold transition ${
              activeTab === id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-blue-100/70 dark:hover:bg-blue-950/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "official"  && <CreatePostForm onCreated={() => setRefreshKey((k) => k + 1)} />}
      {activeTab === "community" && <CommunityPostsList key={refreshKey} />}
    </div>
  );
}