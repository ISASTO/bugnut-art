import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL("https://bugnut.art"),
  title: {
    default: "Bugnut | Comics & Drawings",
    template: "%s | Bugnut",
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
  openGraph: {
    title: "Bugnut | Comics & Drawings",
    type: "website",
    url: "https://bugnut.art",
    images: [`${basePath}/comics/feed/thumb.jpg`],
  },
  alternates: {
    canonical: "https://bugnut.art",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
