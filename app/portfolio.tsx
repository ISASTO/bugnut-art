"use client";

/* eslint-disable @next/next/no-img-element -- artwork is pre-optimized and exported statically */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type Artwork,
  artworks,
  featuredMinis,
  longerComics,
  miniComics,
  otherWork,
  pagePath,
  siteSettings,
  thumbnailPath,
} from "./artworks";

const marqueeComics = [...miniComics, ...longerComics];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function artworkType(artwork: Artwork) {
  if (artwork.kind === "mini") return "Mini comic";
  if (artwork.kind === "long") return "Longer comic";
  return "One-pager";
}

function CoverMarquee({
  onOpen,
}: {
  onOpen: (artwork: Artwork) => void;
}) {
  return (
    <div className="cover-marquee" aria-label="Browse comic covers">
      <div className="cover-marquee__fade cover-marquee__fade--left" />
      <div className="cover-marquee__fade cover-marquee__fade--right" />
      <div className="cover-marquee__track">
        {[0, 1].map((copyIndex) => (
          <div
            className="cover-marquee__set"
            aria-hidden={copyIndex === 1}
            key={copyIndex}
          >
            {marqueeComics.map((artwork, index) => (
              <button
                className={`marquee-cover marquee-cover--${index % 4}`}
                key={`${copyIndex}-${artwork.id}`}
                onClick={() => onOpen(artwork)}
                tabIndex={copyIndex === 1 ? -1 : 0}
                type="button"
                aria-label={`Read ${artwork.title}`}
              >
                <img
                  src={thumbnailPath(artwork)}
                  alt=""
                  width="500"
                  height="714"
                  loading={copyIndex === 0 && index < 6 ? "eager" : "lazy"}
                />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SaleLink({ artwork }: { artwork: Artwork }) {
  if (!artwork.shopUrl) return null;

  return (
    <a
      className="text-link"
      href={artwork.shopUrl}
      target="_blank"
      rel="noreferrer"
    >
      Buy a physical copy <span aria-hidden="true">↗</span>
    </a>
  );
}

function MiniCard({
  artwork,
  onOpen,
}: {
  artwork: Artwork;
  onOpen: (artwork: Artwork) => void;
}) {
  return (
    <article className="mini-card">
      <button
        className="mini-card__reader"
        onClick={() => onOpen(artwork)}
        type="button"
        aria-label={`Read ${artwork.title}`}
      >
        <span className="mini-card__image">
          <img
            src={thumbnailPath(artwork)}
            alt={`${artwork.title} cover`}
            width="500"
            height="714"
            loading="lazy"
          />
          <span className="read-sticker">Read it</span>
        </span>
        <span className="mini-card__copy">
          <strong>{artwork.title}</strong>
          <span>{formatDate(artwork.completed)}</span>
        </span>
      </button>
      <SaleLink artwork={artwork} />
    </article>
  );
}

function FeaturedCard({
  artwork,
  index,
  onOpen,
}: {
  artwork: Artwork;
  index: number;
  onOpen: (artwork: Artwork) => void;
}) {
  return (
    <article className={`featured-card featured-card--${index + 1}`}>
      <div className="featured-card__number" aria-hidden="true">
        0{index + 1}
      </div>
      <button
        className="featured-card__cover"
        onClick={() => onOpen(artwork)}
        type="button"
      >
        <img
          src={thumbnailPath(artwork)}
          alt={`${artwork.title} cover`}
          width="500"
          height="714"
          loading="lazy"
        />
      </button>
      <div className="featured-card__copy">
        <h3>{artwork.title}</h3>
        <div className="featured-card__actions">
          <button
            className="button button--ink"
            onClick={() => onOpen(artwork)}
            type="button"
          >
            Read <span aria-hidden="true">→</span>
          </button>
          <SaleLink artwork={artwork} />
        </div>
      </div>
    </article>
  );
}

function buildReaderGroups(artwork: Artwork, narrow: boolean) {
  if (narrow || artwork.kind !== "mini" || artwork.pageCount <= 2) {
    return Array.from({ length: artwork.pageCount }, (_, index) => [index]);
  }

  const groups: number[][] = [[0]];
  const backCoverIndex = artwork.pageCount - 1;
  let index = 1;

  while (index < backCoverIndex) {
    const fileNumber = index + 1;
    const isDoubleWidth = artwork.doubleWidthFiles?.includes(fileNumber);

    if (isDoubleWidth) {
      groups.push([index]);
      index += 1;
      continue;
    }

    if (index + 1 < backCoverIndex) {
      groups.push([index, index + 1]);
      index += 2;
    } else {
      groups.push([index]);
      index += 1;
    }
  }

  if (backCoverIndex > 0) groups.push([backCoverIndex]);
  return groups;
}

function readerPositionLabel(artwork: Artwork, pages: number[]) {
  const first = pages[0];

  if (artwork.kind === "other") return "Single-page comic";
  if (artwork.kind === "long") {
    return `Page ${first + 1} of ${artwork.pageCount}`;
  }

  const backCoverIndex = artwork.pageCount - 1;
  if (first === 0) return "Front cover";
  if (first === backCoverIndex) return "Back cover";

  const interiorTotal =
    artwork.pageCount - 2 + (artwork.doubleWidthFiles?.length ?? 0);
  const fileNumber = first + 1;
  const isDoubleWidth = artwork.doubleWidthFiles?.includes(fileNumber);
  const start = first;
  const end = isDoubleWidth ? start + 1 : pages.at(-1) ?? start;

  return start === end
    ? `Page ${start} of ${interiorTotal}`
    : `Pages ${start}–${end} of ${interiorTotal}`;
}

function ComicReader({
  artwork,
  onClose,
}: {
  artwork: Artwork;
  onClose: () => void;
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setNarrow(media.matches);
    const frame = window.requestAnimationFrame(update);
    media.addEventListener("change", update);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", update);
    };
  }, [artwork.id]);

  const groups = useMemo(
    () => buildReaderGroups(artwork, narrow),
    [artwork, narrow],
  );
  const groupIndex = Math.max(
    0,
    groups.findIndex((group) => group.includes(pageIndex)),
  );
  const visiblePages = groups[groupIndex] ?? [0];

  const previous = useCallback(() => {
    const target = groups[groupIndex - 1];
    if (target) setPageIndex(target[0]);
  }, [groupIndex, groups]);

  const next = useCallback(() => {
    const target = groups[groupIndex + 1];
    if (target) setPageIndex(target[0]);
  }, [groupIndex, groups]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [next, onClose, previous]);

  useEffect(() => {
    const nextGroup = groups[groupIndex + 1];
    if (!nextGroup) return;

    nextGroup.forEach((index) => {
      const image = new Image();
      image.src = pagePath(artwork, index);
    });
  }, [artwork, groupIndex, groups]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await stageRef.current?.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  const canGoBack = groupIndex > 0;
  const canGoForward = groupIndex < groups.length - 1;
  const positionLabel = readerPositionLabel(artwork, visiblePages);

  return (
    <div
      className="reader"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-title"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <header className="reader__header">
        <div>
          <p>{artworkType(artwork)}</p>
          <h2 id="reader-title">{artwork.title}</h2>
        </div>
        <div className="reader__header-actions">
          <a
            href={pagePath(artwork, visiblePages[0])}
            target="_blank"
            rel="noreferrer"
            className="reader__utility"
          >
            Full-size <span aria-hidden="true">↗</span>
          </a>
          <button
            className="reader__utility reader__fullscreen"
            onClick={toggleFullscreen}
            type="button"
          >
            Fullscreen
          </button>
          <button
            ref={closeButtonRef}
            className="reader__close"
            onClick={onClose}
            type="button"
            aria-label="Close reader"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </header>

      <div className="reader__body">
        <button
          className="reader__nav reader__nav--previous"
          onClick={previous}
          type="button"
          disabled={!canGoBack}
          aria-label="Previous page"
        >
          <span aria-hidden="true">←</span>
        </button>

        <div
          className={`reader__stage ${
            visiblePages.length > 1 ? "reader__stage--spread" : ""
          }`}
          ref={stageRef}
        >
          <div className="reader__paper">
            {visiblePages.map((index) => (
              <img
                key={index}
                className={
                  artwork.doubleWidthFiles?.includes(index + 1)
                    ? "reader__page reader__page--wide"
                    : "reader__page"
                }
                src={pagePath(artwork, index)}
                alt={`${artwork.title}, page ${index + 1}`}
                onClick={canGoForward ? next : undefined}
              />
            ))}
          </div>
        </div>

        <button
          className="reader__nav reader__nav--next"
          onClick={next}
          type="button"
          disabled={!canGoForward}
          aria-label="Next page"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <footer className="reader__footer">
        <button
          className="reader__mobile-nav"
          onClick={previous}
          type="button"
          disabled={!canGoBack}
          aria-label="Previous page"
        >
          ←
        </button>
        <div className="reader__progress">
          <span>{positionLabel}</span>
          <div className="reader__progress-track" aria-hidden="true">
            <i
              style={{
                width: `${((groupIndex + 1) / groups.length) * 100}%`,
              }}
            />
          </div>
        </div>
        <button
          className="reader__mobile-nav"
          onClick={next}
          type="button"
          disabled={!canGoForward}
          aria-label="Next page"
        >
          →
        </button>
      </footer>
    </div>
  );
}

export default function Portfolio() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeArtwork =
    artworks.find((artwork) => artwork.id === activeId) ?? null;

  useEffect(() => {
    const syncHash = () => {
      const match = window.location.hash.match(/^#read-(.+)$/);
      const id = match?.[1] ?? null;
      setActiveId(artworks.some((artwork) => artwork.id === id) ? id : null);
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, []);

  const openReader = useCallback((artwork: Artwork) => {
    setActiveId(artwork.id);
    window.history.pushState(null, "", `#read-${artwork.id}`);
  }, []);

  const closeReader = useCallback(() => {
    setActiveId(null);
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }, []);

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Bugnut home">
          <span className="brand__name">BUGNUT</span>
          <span className="brand__imprint">{siteSettings.imprintName}</span>
        </a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#comics">Comics</a>
          <a href="#other-work">Other work</a>
          <a href="#about">About</a>
          <a href="#bazaar">Bazaar</a>
        </nav>
        <a
          className="header-contact"
          href={`mailto:${siteSettings.contactEmail}`}
        >
          Contact <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero__intro">
            <h1>BUGNUT</h1>
            <p className="hero__descriptor">Comics &amp; drawings</p>
            <a className="button button--red" href="#featured">
              Browse comics <span aria-hidden="true">↓</span>
            </a>
          </div>
          <CoverMarquee onOpen={openReader} />
        </section>

        <section className="section section--featured" id="featured">
          <div className="section-heading">
            <h2>Featured minis</h2>
          </div>
          <div className="featured-grid">
            {featuredMinis.map((artwork, index) => (
              <FeaturedCard
                artwork={artwork}
                index={index}
                key={artwork.id}
                onOpen={openReader}
              />
            ))}
          </div>
        </section>

        <section className="section section--minis" id="comics">
          <div className="section-heading section-heading--line">
            <h2>All mini comics</h2>
          </div>
          <div className="mini-grid">
            {miniComics.map((artwork) => (
              <MiniCard
                artwork={artwork}
                key={artwork.id}
                onOpen={openReader}
              />
            ))}
          </div>
        </section>

        <section className="section section--long">
          <div className="section-heading">
            <h2>Longer comics</h2>
          </div>
          <div className="long-grid">
            {longerComics.map((artwork, index) => (
              <article className={`long-card long-card--${index + 1}`} key={artwork.id}>
                <button
                  className="long-card__cover"
                  onClick={() => openReader(artwork)}
                  type="button"
                >
                  <img
                    src={thumbnailPath(artwork)}
                    alt={`${artwork.title} cover`}
                    width="500"
                    height="714"
                    loading="lazy"
                  />
                </button>
                <div className="long-card__copy">
                  <p className="eyebrow">
                    {artwork.pageCount} pages · {formatDate(artwork.completed)}
                  </p>
                  <h3>{artwork.title}</h3>
                  <button
                    className="button button--paper"
                    onClick={() => openReader(artwork)}
                    type="button"
                  >
                    Read <span aria-hidden="true">→</span>
                  </button>
                  <SaleLink artwork={artwork} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--other" id="other-work">
          <div className="section-heading section-heading--line">
            <h2>Other work</h2>
          </div>
          <div className="other-grid">
            {otherWork.map((artwork, index) => (
              <article className={`other-card other-card--${index + 1}`} key={artwork.id}>
                <button
                  className="other-card__image"
                  onClick={() => openReader(artwork)}
                  type="button"
                >
                  <img
                    src={pagePath(artwork, 0)}
                    alt={artwork.title}
                    loading="lazy"
                  />
                </button>
                <div>
                  <h3>{artwork.title}</h3>
                  <button
                    className="text-button"
                    onClick={() => openReader(artwork)}
                    type="button"
                  >
                    View <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about" id="about">
          <div className="about__label">
            <span>Why I make comics</span>
            <span className="about__doodle" aria-hidden="true">
              ☺
            </span>
          </div>
          <div className="about__copy">
            <p className="about__lead">
              I make comics because it&apos;s fun.
            </p>
            <p>
              Nothing to me is more satisfying than sitting down, pouring hours
              of thought, love, and care into a page, and as a result getting a
              little sharable physical piece of media that wouldn&apos;t
              otherwise have existed. I get to listen to music, I get to refine
              my process, and I get to enjoy every step of it.
            </p>
            <p>
              The thing I find most fun about comics is the freedom. I get to
              turn my silly ideas into silly scenarios, and figure out a way to
              turn those scenarios into easily digestible visual punchlines.
            </p>
            <p>
              My comics tend to be a bit silly. I aim to subvert expectations
              at least once per comic, and figuring out ways to do that is a fun
              (but difficult!) part of the process for me.
            </p>
          </div>
          <aside className="about__aside">
            <p className="about__yes">YES, YOU CAN!</p>
            <p>
              If you exist and are reading this, you can make art. Comics
              aren&apos;t about realism. They&apos;re about expression. And you
              don&apos;t have to be “good” at drawing in order to express
              yourself.
            </p>
            <p>
              I could never communicate it as well as Lynda Barry, so I&apos;d
              recommend her book <cite>Making Comics</cite>{" "}to anybody who
              thinks they can&apos;t draw.
            </p>
          </aside>
        </section>

        <section className="bazaar" id="bazaar">
          <div className="bazaar__checker" aria-hidden="true" />
          <div className="bazaar__copy">
            <h2>{siteSettings.shopName}</h2>
            {siteSettings.shopUrl ? (
              <a
                className="button button--paper"
                href={siteSettings.shopUrl}
                target="_blank"
                rel="noreferrer"
              >
                Visit the Bazaar <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="coming-soon">Opening soon</span>
            )}
          </div>
          <div className="bazaar__stamp" aria-hidden="true">
            <span>BUGNUT</span>
            <strong>BAZAAR</strong>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <span className="site-footer__brand">BUGNUT</span>
        </div>
        <div className="site-footer__contact">
          <p>Contact</p>
          <a href={`mailto:${siteSettings.contactEmail}`}>
            {siteSettings.contactEmail} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <a className="back-to-top" href="#top">
          Back to top <span aria-hidden="true">↑</span>
        </a>
        <p className="site-footer__fine">
          © {new Date().getFullYear()} Bugnut · Published by{" "}
          {siteSettings.imprintName}
        </p>
      </footer>

      {activeArtwork ? (
        <ComicReader
          artwork={activeArtwork}
          key={activeArtwork.id}
          onClose={closeReader}
        />
      ) : null}
    </>
  );
}
