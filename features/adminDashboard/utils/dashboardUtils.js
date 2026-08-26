import { IconHome, IconPosts, IconUsers, IconWriter, IconMail, IconFlag, IconPost, IconJoin, IconHelpCircle } from "../icons/icons";

export const NAV = [
  { label: "Dashboard",       view: "overview", href: "/admin/dashboard",                 Icon: IconHome },
  { label: "Posts",           view: "posts",    href: "/admin/dashboard/posts",           Icon: IconPosts },
  { label: "Users",           view: "users",    href: "/admin/dashboard/users",           Icon: IconUsers },
  { label: "Writer Requests", view: "writers",  href: "/admin/dashboard/writers",         Icon: IconWriter },
  { label: "Reports",         view: "reports",  href: "/admin/dashboard/reports",         Icon: IconFlag },
  { label: "Audit Logs",      view: "audit",    href: "/admin/dashboard/audit",           Icon: IconFlag },
  { label: "Contact",         view: "contact",  href: "/admin/dashboard/contact",         Icon: IconMail },
  { label: "FAQs",            view: "faqs",     href: "/admin/dashboard/faqs",            Icon: IconHelpCircle },
  { label: "My Profile",      view: "profile",  href: "/admin/dashboard/profile",         Icon: IconUsers },
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
