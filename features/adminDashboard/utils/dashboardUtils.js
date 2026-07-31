import { IconHome, IconPosts, IconUsers, IconWriter, IconMail, IconFlag, IconPost, IconJoin } from "../icons/icons";

export const NAV = [
  { label: "Dashboard",       href: "/admin/dashboard",           Icon: IconHome },
  { label: "Posts",           href: "/admin/posts",               Icon: IconPosts },
  { label: "Users",           href: "/admin/users/manage",        Icon: IconUsers },
  { label: "Writer Requests", href: "/admin/writer-applications", Icon: IconWriter },
  { label: "Reports",         href: "/admin/reports",             Icon: IconFlag },
  { label: "Audit Logs",      href: "/admin/audit-logs",          Icon: IconFlag },
  { label: "Contact",         href: "/admin/contact-messages",    Icon: IconMail },
];

export function activityIcon(action) {
  if (action?.includes("writer")) return IconWriter;
  if (action?.includes("blog"))   return IconPost;
  return IconJoin;
}

export function timeAgo(value) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
