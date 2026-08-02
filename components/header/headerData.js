export const THEME_EVENT = "nursing-theme-change";

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/blogs", label: "Articles" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function getDesktopNavItems({ isAdmin, canApplyAsWriter, canWritePosts }) {
  if (isAdmin) {
    return [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/blogs", label: "Articles" },
      { href: "/faq", label: "FAQ" },
      { href: "/admin/dashboard", label: "Admin Dashboard" },
    ];
  }

  return [
    ...NAV_ITEMS,
    ...(canWritePosts ? [{ href: "/writers/posts", label: "My Posts" }] : []),
    ...(canApplyAsWriter ? [{ href: "/apply-writer", label: "Apply Writer" }] : []),
  ];
}

export function getMobileNavItems({ isAdmin, canApplyAsWriter, canWritePosts, isLoggedIn }) {
  if (isAdmin) {
    return [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/blogs", label: "Articles" },
      { href: "/faq", label: "FAQ" },
      { href: "/admin/dashboard", label: "Admin Dashboard" },
    ];
  }

  return [
    ...NAV_ITEMS,
    ...(canWritePosts ? [{ href: "/writers/posts", label: "My Posts" }] : []),
    ...(canApplyAsWriter ? [{ href: "/apply-writer", label: "Apply Writer" }] : []),
    ...(isLoggedIn ? [
      { href: "/profile", label: "My Profile" },
      { href: "/saved", label: "My Bookmarks" },
      { href: "/following", label: "Following" },
      { href: "/notifications", label: "Notifications" },
      { href: "/dashboard", label: "Dashboard" },
    ] : []),
  ];
}
