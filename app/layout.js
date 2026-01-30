import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nursing Nepal",
    template: "%s | Nursing Nepal",
  },
  description:
    "Nursing Nepal is a modern nursing care and health education platform providing nursing articles, patient care guidance, and learning resources for Nepal.",
  applicationName: "Nursing Nepal",
  keywords: [
    "Nursing Nepal",
    "nursing care",
    "nursing articles",
    "health education",
    "patient care",
    "home nursing",
    "vital signs",
    "wound care",
    "Nepal nursing",
  ],
  authors: [{ name: "Nursing Nepal" }],
  creator: "Nursing Nepal",
  publisher: "Nursing Nepal",

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Nursing Nepal",
    description:
      "Nursing Nepal is a modern nursing care and health education platform providing nursing articles, patient care guidance, and learning resources for Nepal.",
    siteName: "Nursing Nepal",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "Nursing Nepal",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Nursing Nepal",
    description:
      "Nursing Nepal - Nursing articles, patient care guidance, and health learning resources for Nepal.",
    images: ["/banner.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
