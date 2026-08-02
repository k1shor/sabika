"use client";

import UserRow from "./UserRow";

export default function UsersList({
  users,
  busyId,
  currentUserId,
  onUpdateRole,
  onToggleBan,
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-blue-400/20">
      {users.map((user) => (
        <UserRow
          key={user._id}
          user={user}
          isBusy={busyId === user._id}
          isCurrentUser={user._id === currentUserId}
          onUpdateRole={onUpdateRole}
          onToggleBan={onToggleBan}
        />
      ))}
    </div>
  );
}
