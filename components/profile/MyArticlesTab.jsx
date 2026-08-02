"use client";

import { useEffect, useState } from "react";
import { formatDate, STATUS_FILTERS, statusStyle } from "./profileUtils";

export default function MyArticlesTab() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/blogs?mine=true")
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) setArticles(data.posts || []);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    approved: articles.filter((article) => article.status === "approved").length,
    pending: articles.filter((article) => article.status === "pending").length,
    draft: articles.filter((article) => article.status === "draft").length,
  };

  const filtered = filter === "all"
    ? articles
    : articles.filter((article) => article.status === filter);

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 dark:text-blue-100/50">
        Loading articles...
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">My Articles</h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-blue-100/50">All articles you have written.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Published", count: counts.approved, color: "text-green-600 dark:text-green-400" },
          { label: "Pending", count: counts.pending, color: "text-yellow-600 dark:text-yellow-400" },
          { label: "Drafts", count: counts.draft, color: "text-slate-500 dark:text-slate-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-blue-400/20 dark:bg-blue-950/20">
            <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.count}</div>
            <div className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-blue-100/60">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition border ${
              filter === status
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-blue-400/20 dark:text-blue-100/70"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-blue-400/10">
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-blue-100/50">
            No articles found.
          </p>
        )}
        {filtered.map((article) => (
          <div key={article._id || article.slug} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{article.title}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-blue-100/50">
                {formatDate(article.publishedAt || article.createdAt)}
                {article.isAnonymous && (
                  <span className="ml-2 text-slate-400 dark:text-blue-100/30">· Anonymous</span>
                )}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(article.status)}`}>
              {article.status === "approved" ? "Published" : article.status.charAt(0).toUpperCase() + article.status.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
