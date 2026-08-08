# Bugnut

The source for [bugnut.art](https://bugnut.art): hand-drawn comics, mini
books, and other work by Bugnut.

## Run it locally

The project uses Node 22.

```bash
npm ci
npm run dev
```

## Add a comic

1. Create `public/comics/<comic-id>/`.
2. Add a 500-pixel-wide cover thumbnail named `thumb.jpg`.
3. Add the reading images as `001.jpg`, `002.jpg`, and so on. Keep the longest
   edge at or below roughly 1800 pixels and strip image metadata before
   publishing.
4. Add one entry to `app/artworks.ts`.

For a mini comic, the first image is the front cover and the final image is the
back cover. On desktop, interior images are paired into physical page spreads.
On mobile, they appear one at a time.

If one file contains a complete two-page illustration, add its one-based file
number to `doubleWidthFiles`. `Beach Day`, for example, uses
`doubleWidthFiles: [6]`.

The main collection is ordered directly in `app/artworks.ts`. Set
`featured: true` to include a mini in the featured section.

## Add shop links

The site is ready for Big Cartel but hides empty purchase buttons.

- Set `siteSettings.shopUrl` in `app/artworks.ts` to open the Bugnut Bazaar.
- Set an individual artwork's `shopUrl` to show a “Buy a physical copy” link on
  that item's card.

No layout changes are necessary.

## Contact address

The public address is `BugnutBuglehorn@proton.me`.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` builds and publishes every push
to `main`. It initially uses `/bugnut-art` as the base path so the site works at
the normal project Pages URL.

When `bugnut.art` is connected as the custom domain:

1. Add a `public/CNAME` file containing `bugnut.art`.
2. Remove `NEXT_PUBLIC_BASE_PATH: "/bugnut-art"` from the Pages workflow.
3. Configure the domain's DNS records using the exact values GitHub provides.

The next deployment will then build for the domain root.

## Rights

All artwork and comics are © Bugnut. Please do not redistribute or reuse them
without permission.
