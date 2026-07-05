"use client";

import WriterFollowCard from "./WriterFollowCard";

export default function WritersGrid({ writers, onUnfollow }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {writers.map((writer) => (
        <WriterFollowCard key={writer._id} writer={writer} onUnfollow={onUnfollow} />
      ))}
    </div>
  );
}
