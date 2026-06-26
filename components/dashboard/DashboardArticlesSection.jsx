"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import DashboardArticleCard from "./DashboardArticleCard";
import { DASHBOARD_ARTICLES_PAGE_SIZE, stagger } from "./dashboardUtils";

const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
];

function getAuthorId(post) {
    const author = post?.authorId;
    if (!author) return "";
    if (typeof author === "string") return author;
    return String(author._id || author.id || "");
}

function getPostDate(post) {
    return new Date(post?.publishedAt || post?.createdAt || 0).getTime();
}

export default function DashboardArticlesSection({ posts, myPosts, user, loading }) {
    const [view, setView] = useState("latest");
    const [sort, setSort] = useState("");
    const [page, setPage] = useState(1);

    const visiblePosts = useMemo(() => {
        const source = view === "mine"
            ? myPosts
            : posts.filter((post) => getAuthorId(post) !== String(user?.id || ""));

        return [...source].sort((a, b) => {
            const diff = getPostDate(b) - getPostDate(a);
            return sort === "newest" ? diff : -diff;
        });
    }, [myPosts, posts, sort, user?.id, view]);

    const totalPages = Math.max(1, Math.ceil(visiblePosts.length / DASHBOARD_ARTICLES_PAGE_SIZE));
    const start = (page - 1) * DASHBOARD_ARTICLES_PAGE_SIZE;
    const pagePosts = visiblePosts.slice(start, start + DASHBOARD_ARTICLES_PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [sort, view]);

    useEffect(() => {
        setPage((current) => Math.min(current, totalPages));
    }, [totalPages]);

    if (loading) return <ArticleSkeletons />;

    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {view === "mine" ? "Your Articles" : "Latest Articles"}
                    </h2>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {visiblePosts.length} article{visiblePosts.length === 1 ? "" : "s"}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setView("latest")} className={tabClass(view === "latest")}>
                        Latest Articles
                    </button>
                    <button type="button" onClick={() => setView("mine")} className={tabClass(view === "mine")}>
                        Your Articles
                    </button>
                    <select
                        value={sort}
                        onChange={(event) => setSort(event.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                        <option value="">Filter</option>

                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {pagePosts.length === 0 ? (
                <EmptyArticlesNotice view={view} user={user} />
            ) : (
                <>
                    <motion.div variants={stagger} className="flex flex-col gap-3">
                        {pagePosts.map((post) => (
                            <DashboardArticleCard key={post._id || post.slug} post={post} />
                        ))}
                    </motion.div>
                    <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
            )}
        </section>
    );
}

function tabClass(active) {
    return `rounded-xl px-3 py-2 text-xs font-bold transition ${active
            ? "bg-[#DC143C] text-white"
            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        }`;
}

function PaginationControls({ page, totalPages, onPageChange }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange((current) => Math.max(1, current - 1))}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
            >
                Previous
            </button>
            <span className="text-xs">
                Page {page} of {totalPages}
            </span>
            <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange((current) => Math.min(totalPages, current + 1))}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
            >
                Next
            </button>
        </div>
    );
}

function ArticleSkeletons() {
    return (
        <div className="flex flex-col gap-3">
            {[...Array(DASHBOARD_ARTICLES_PAGE_SIZE)].map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
                    className="h-28 rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50"
                />
            ))}
        </div>
    );
}

function EmptyArticlesNotice({ view, user }) {
    const isMine = view === "mine";

    return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/30">
            <p className="text-sm font-semibold text-slate-500">
                {isMine ? "You have not written any articles yet." : "No articles from other writers yet."}
            </p>
            {isMine && user.role === "blog_writer" && user.writerVerification?.status === "approved" && (
                <Link href="/writers/posts" className="mt-3 inline-block text-sm font-bold text-[#DC143C] hover:underline">
                    Write your first article
                </Link>
            )}
            {isMine && user.role === "blog_writer" && user.writerVerification?.status === "pending" && (
                <p className="mt-3 text-sm font-semibold text-amber-600 dark:text-amber-400">
                    Your writer application is under review.
                </p>
            )}
        </div>
    );
}
