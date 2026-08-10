# Connecta Site — Audit Report

_Reviewed & updated: 10 August 2026 · 18 pages (landing + 17 secondary/legal/utility pages)_

## 1. Mobile responsiveness — status: PASS (two passes; issues fixed)

The site was built on a solid responsive foundation, verified across all pages:

- **Viewport meta** present on every page (`width=device-width, initial-scale=1`).
- **Fluid typography** — headings and body use `clamp()` everywhere, so text scales smoothly instead of jumping at breakpoints.
- **Sticky (not fixed) nav** — never overlaps or hides hero content on small screens.
- **Breakpoints at 960 / 640 / 560 / 380px** — multi-column grids (cards, sectors, bento, stats, footer, split layouts, contact form) all collapse to 1–2 columns; the desktop nav swaps to a hamburger + slide-in drawer at 640px.
- **`overflow-x:hidden`** guard on `<body>` in both the landing page and the shared stylesheet.
- **Store buttons wrap** (`flex-wrap`) so they stack on narrow screens.

**Pass 1 — bug found & fixed:** on the landing page, the phone mockup image had `min-width:520px`, which cropped the image on phones narrower than 520px. Fixed by overriding to `min-width:0; max-width:360px` below 640px, so the image now scales down to fit any phone.

**Pass 2 — deeper small-phone audit (≤560px and ≤380px), fixed:**
1. **Hero "woven network" clipped off-screen.** The floating talent cards (`.node-a`…`.node-d`) sat at negative offsets (`left:-4%`, `right:-8%`) with `white-space:nowrap`, and the 190px match-core never shrank — so below ~520px they were cut off by the overflow guard. Added a ≤560px block that pulls the cards in-bounds (0 offsets), shrinks the cards, rings and match-core, and caps the stage width (340px, then 290px ≤380px).
2. **Collabo "squad" cluster overlapped.** The 200px center card and four members (`.m1`…`.m4`) didn't scale, so on a narrow stage they piled on top of each other. Shrunk the center card (158px), members and avatars, and repositioned the members to the corners.
3. **Nav could clip on small phones.** Logo + "Join Connecta" button + hamburger together needed ~337px but only ~280px is available at 360px, risking a clipped hamburger (the menu control). Added ≤560px/≤380px rules that tighten nav gaps, compact the CTA button, shrink the logo, and trim the gutter — applied to **all 18 pages** (shared `site.css`) as well as the landing page.
4. **Footer legal bar** now stacks vertically ≤560px instead of squeezing three groups onto one line; **hero breadcrumbs** wrap; **CTA buttons** go full-width ≤380px for easier tapping.

Result: no horizontal scrolling, no clipped content, and readable text on phones down to ~320px wide across all 18 pages. Verified by CSS/markup analysis and a fixed-width scan (only remaining hard width is a flex-wrapping `min-width:220px` job row, which fits a 320px viewport) plus a brace-balance check on both stylesheets.

> Note: there is no browser in this environment to take live screenshots, so this was verified by CSS/markup analysis (breakpoints, fluid units, overflow guards, fixed-width scan). A quick eyeball on a real phone or Chrome DevTools device mode is still worth doing before launch.

## 2. What was missing — now resolved ✅

Everything from the original gap list that could be built without external accounts/credentials has been implemented, in the same design system and consistently across all 18 pages.

### High priority — DONE
1. **Privacy Policy, Terms of Service & Cookie Policy pages** — three new full pages (`privacy.html`, `terms.html`, `cookies.html`) written in plain language for a marketplace handling payments, escrow and identity verification. Linked from the footer of **every** page (new "Legal" row: Privacy · Terms · Cookies), from the contact form's consent line, and from the Trust & Safety page (which previously said "available in the app").
2. **Contact form now has a working backend** — wired to **FormSubmit** (`https://formsubmit.co/ajax/hello@connecta.app`) via a `fetch` AJAX POST in `site.js`. Includes: honeypot spam trap, native validation gate, a "Sending…" busy state, an inline success message, and a new **error state** that falls back to the mailto address if the request fails.
   - ⚠️ **One-time activation needed:** the first time the form is submitted from the live domain, FormSubmit emails `hello@connecta.app` a confirmation link that must be clicked once to start receiving messages. (Swap the email in `build_pages.py` if you prefer a different inbox, then re-run the build.)

### Medium priority (SEO & sharing) — DONE
3. **`sitemap.xml`** — lists all 17 indexable pages with priorities/change-frequencies (404 excluded).
4. **`robots.txt`** — allows crawling, disallows `/404.html`, and points to the sitemap.
5. **Structured data (JSON-LD `Organization`)** — added to all 18 pages (name, URL, logo, description, `areaServed: Africa`, and real social profiles), improving how the brand appears in search.
6. **Favicon** (uses `app_icon.png`) and **Open Graph + Twitter cards** — on all 18 pages, so tabs show the icon and shared links show a title/description/image.

### Accessibility polish — DONE
7. **Skip-to-content link** — on all 18 pages (visible on keyboard focus, jumps to `#top`).
8. **`aria-current="page"`** on the active nav item across the generated pages.
9. Existing good practices retained: alt text, form labels, focus states, and hamburger/drawer ARIA.

### Utility — DONE
10. **Branded 404 page** (`404.html`) — on-brand "Error 404" hero with routes back to home/help and three popular-page cards. (For it to serve automatically, point your host's not-found handler at `404.html` — e.g. Netlify/Apache/Nginx config.)

## 3. Still requires YOUR real values (can't be invented)

These are wired to sensible placeholders and just need the real destinations dropped in:

- **App Store URL** — the **Google Play** button is now live (`play.google.com/store/apps/details?id=com.connecta.app`) on `index.html` and `download.html`. The **App Store** (iOS) buttons still point to `#` — drop in the real listing URL once the iOS app is published (in `index.html` and `build_pages.py`, then re-run the build).
- **"Sign in" / "Join Connecta"** — currently route to internal pages; point them at the real app/login URL when ready.
- **Analytics** — none installed. Add a privacy-friendly snippet (e.g. Plausible or GA4) if you want traffic data.
- **Social preview image** — OG/Twitter currently reuse `app_mockup.jpg`; a purpose-made 1200×630 image would look cleaner.
- **Contact inbox** — confirm `hello@connecta.app` (and activate FormSubmit as noted above), or change it.

## 4. Nice-to-have (optional, not blocking)

- **Image weight** — several hero/mockup images are large (`iphone17_mockup.png` ~594 KB, `iphone17_front.png` ~518 KB, `d.jpg`/`f.jpg` ~350–385 KB). Compressing or serving WebP would speed up mobile load.
- **Pricing/FAQ page** — "Free to join · No subscription" is stated inline; a dedicated page could reinforce it if the model grows.

## 5. How the site is built (for future edits)

- `index.html` is a standalone landing page (inline `<style>` + `<script>`). Edit it directly.
- The other 17 pages are **generated** — do **not** hand-edit the `.html`. Edit `build_pages.py` (per-page content) or `_build.py` (shared head/nav/footer partials), then run `python3 _build.py` from the `Lpage/` folder. Shared styling lives in `site.css`; shared behavior in `site.js`.
