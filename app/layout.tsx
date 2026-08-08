import type { Metadata, Viewport } from "next";
import "@fontsource/chango/400.css";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#efe4ca",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://bugnut.art"),
  title: {
    default: "Bugnut | Comics & Drawings",
    template: "%s | Bugnut",
  },
  description:
    "I'm Bugnut. I make comics and other oddities. Have a look through my work, or buy yourself a copy or twelve.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: {
      url: `${basePath}/favicon.png`,
      type: "image/png",
    },
    shortcut: `${basePath}/favicon.png`,
  },
  openGraph: {
    title: "Bugnut | Comics & Drawings",
    description:
      "I'm Bugnut. I make comics and other oddities. Have a look through my work, or buy yourself a copy or twelve.",
    type: "website",
    url: "https://bugnut.art",
    images: [
      {
        url: `${basePath}/comics/feed/thumb.jpg`,
        width: 500,
        height: 714,
        alt: "Feeding Time comic cover by Bugnut",
      },
    ],
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
