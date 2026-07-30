export type ArtworkKind = "mini" | "long" | "other";

export type Artwork = {
  id: string;
  title: string;
  completed: string;
  kind: ArtworkKind;
  pageCount: number;
  featured?: boolean;
  doubleWidthFiles?: number[];
  shopUrl?: string | null;
};

export const siteSettings = {
  artistName: "Bugnut",
  imprintName: "Bugnut Books",
  contactEmail: "hello@bugnut.art",
  shopName: "Bugnut Bazaar",
  shopUrl: null as string | null,
};

export const artworks: Artwork[] = [
  {
    id: "cure",
    title: "The Cure",
    completed: "2026-07-15",
    kind: "mini",
    pageCount: 8,
    shopUrl: null,
  },
  {
    id: "mountain",
    title: "The Mountain",
    completed: "2026-05-27",
    kind: "mini",
    pageCount: 8,
    shopUrl: null,
  },
  {
    id: "orchard",
    title: "The Orchard",
    completed: "2026-05-23",
    kind: "mini",
    pageCount: 8,
    featured: true,
    shopUrl: null,
  },
  {
    id: "picnic",
    title: "The Picnic",
    completed: "2026-05-19",
    kind: "mini",
    pageCount: 8,
    shopUrl: null,
  },
  {
    id: "feed",
    title: "Feeding Time",
    completed: "2026-05-14",
    kind: "mini",
    pageCount: 8,
    featured: true,
    shopUrl: null,
  },
  {
    id: "garden",
    title: "The Garden",
    completed: "2026-05-09",
    kind: "mini",
    pageCount: 8,
    shopUrl: null,
  },
  {
    id: "thief",
    title: "The Thief",
    completed: "2026-04-28",
    kind: "mini",
    pageCount: 8,
    featured: true,
    shopUrl: null,
  },
  {
    id: "beach",
    title: "Beach Day",
    completed: "2026-04-19",
    kind: "mini",
    pageCount: 7,
    doubleWidthFiles: [6],
    shopUrl: null,
  },
  {
    id: "fire",
    title: "Fire Starter",
    completed: "2026-03-26",
    kind: "mini",
    pageCount: 7,
    doubleWidthFiles: [6],
    shopUrl: null,
  },
  {
    id: "born-a-clown",
    title: "Born a Clown",
    completed: "2026-01-12",
    kind: "long",
    pageCount: 12,
    shopUrl: null,
  },
  {
    id: "godly-powers",
    title: "What Would You Do With Godly Powers?",
    completed: "2025-11-28",
    kind: "long",
    pageCount: 9,
    shopUrl: null,
  },
  {
    id: "zebra",
    title: "Zebrelevator",
    completed: "2026-03-04",
    kind: "other",
    pageCount: 1,
  },
  {
    id: "pig",
    title: "Pig",
    completed: "2026-02-08",
    kind: "other",
    pageCount: 1,
  },
  {
    id: "snail-time",
    title: "Snail Time",
    completed: "2025-11-28",
    kind: "other",
    pageCount: 1,
  },
];

export const miniComics = artworks.filter((artwork) => artwork.kind === "mini");
export const featuredMinis = miniComics.filter((artwork) => artwork.featured);
export const longerComics = artworks.filter((artwork) => artwork.kind === "long");
export const otherWork = artworks.filter((artwork) => artwork.kind === "other");

export function assetPath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${basePath}${path}`;
}

export function pagePath(artwork: Artwork, index: number) {
  return assetPath(
    `/comics/${artwork.id}/${String(index + 1).padStart(3, "0")}.jpg`,
  );
}

export function thumbnailPath(artwork: Artwork) {
  return assetPath(`/comics/${artwork.id}/thumb.jpg`);
}
