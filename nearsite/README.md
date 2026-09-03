# Nearsite — modular static directory

A directory of local businesses where every listed business gets a full page:
services, service area, hours, photos, tags and a direct WhatsApp button.

The published site is **plain HTML, CSS and vanilla JavaScript**. No backend, no
database, no framework. Node is used once, at build time, to turn the JSON data
into static pages. You can host the result on GitHub Pages, Netlify, Vercel,
Cloudflare Pages or any ordinary web host.

---

## 1. How it fits together

```
data/*.json  ──►  generator/build.js  ──►  static HTML  ──►  git push  ──►  live site
                        │
                        └── templates/  (page shells and components)
```

Everything a visitor sees is real HTML on disk. JavaScript only powers the
search page and the autocomplete — no content depends on it.

### Directory layout

```
/                       index.html and all generated pages
/data/                  the only files you edit day to day
  site.json             portal name, domain, contact, indexing rules
  categories.json       categories + subcategories
  locations.json        states + cities
  tags.json             tag dictionary (definitions make a tag indexable)
  providers.json        the businesses
/templates/             page templates (Node modules)
  layout.js             <head>, header, breadcrumb, footer, JSON-LD
  components.js         cards, rows, tags, FAQ, CTA, search form
  pages/                home, directory, provider, tags, static pages
/generator/
  build.js              JSON → HTML, sitemap.xml, robots.txt
  make-placeholders.js  SVG stand-ins for missing images
/css/style.css          one stylesheet, sectioned and commented
/js/                    whatsapp.js, providers.js, categories.js, search.js, app.js
/assets/providers/<slug>/   logo, hero and gallery images per business
```

### URL architecture (do not change casually)

| Page | URL |
|---|---|
| Home | `/` |
| Category | `/categories/solar-energy/` |
| Subcategory | `/categories/solar-energy/residential-solar-installation/` |
| Locations index | `/locations/` |
| State | `/locations/texas/` |
| City | `/locations/texas/austin/` |
| City + category | `/locations/texas/austin/solar-energy/` |
| **Business (canonical)** | `/providers/bright-ridge-solar/` |
| Tag | `/tags/battery-storage/` |
| Search | `/search/` (noindex) |

A business has **one canonical URL**: `/providers/<slug>/`. Category, city and
tag pages link to it; they never duplicate its content. That is why there is no
`/austin/solar-energy/company/` page — a business that serves three cities would
otherwise need three near-identical pages, which is exactly the duplication this
architecture avoids.

---

## 2. Build and preview

```bash
node generator/make-placeholders.js   # only needed while images are missing
node generator/build.js               # writes all HTML + sitemap.xml + robots.txt
python3 -m http.server 8000           # open http://localhost:8000
```

Build with your real domain (required before publishing):

```bash
SITE_URL=https://yourdomain.com node generator/build.js
```

Publishing to a GitHub Pages **project** site (`user.github.io/repo`):

```bash
SITE_URL=https://user.github.io BASE_PATH=/repo node generator/build.js
```

The build prints which pages were marked `noindex` and why, so you can audit the
index footprint on every run.

---

## 3. Adding a business

1. **Add the record** to `data/providers.json`:

```json
{
  "id": "example-company",
  "slug": "example-company",
  "name": "Example Company",
  "active": true,
  "featured": false,
  "sponsored": false,
  "verified": false,
  "category": "solar-energy",
  "subcategory": "residential-solar-installation",
  "tags": ["rooftop-solar", "free-estimates"],
  "city": "austin",
  "state": "TX",
  "tagline": "One line the business would say about itself",
  "shortDescription": "One sentence used on cards and in meta descriptions.",
  "description": ["First paragraph.", "Second paragraph."],
  "services": [{ "name": "Service name", "description": "What it covers." }],
  "differentials": ["How they work, in the business's own words"],
  "serviceAreaNote": "Where they actually travel.",
  "areasServed": ["Austin", "Round Rock"],
  "address": "",
  "hours": [{ "days": "Monday to Friday", "time": "8:00 – 17:00" }],
  "whatsapp": "15125550137",
  "phone": "+1 512-555-0137",
  "website": "",
  "instagram": "",
  "googleBusinessProfile": "",
  "faq": [{ "q": "A question they get asked", "a": "Their answer." }],
  "gallery": [{ "file": "01.webp", "alt": "Describe this specific photo" }],
  "theme": { "primary": "#1F5E4A", "accent": "#E9A020" }
}
```

2. **Add images** to `assets/providers/example-company/`:
   `logo.webp`, `hero.webp`, `01.webp`, `02.webp`… Then point at them with
   `"logo": "logo.webp"` and `"heroImage": "hero.webp"`. Without those fields the
   build looks for `logo.svg` / `hero.svg`. Use WebP, keep hero images under
   ~200 KB, and write a real `alt` for every gallery image.

3. **Rebuild and publish**: `node generator/build.js && git add -A && git commit -m "Add Example Company" && git push`.

Every section is optional. Leave `gallery`, `faq`, `instagram` or `address` out
and the section simply does not render. Nothing is invented to fill space.

### Required vs optional

| Required | Optional |
|---|---|
| `id`, `slug`, `name`, `category`, `city`, `state` | `subcategory`, `tags`, `gallery`, `faq` |
| `tagline`, `shortDescription`, `description` | `address`, `website`, `instagram`, `googleBusinessProfile` |
| `serviceAreaNote`, `whatsapp` | `phone`, `hours`, `differentials`, `theme` |

---

## 4. Adding a category, city or tag

**Category** — append to `data/categories.json` with `intro` (two paragraphs of
original text), `shortDescription`, `buyerNotes`, `faq` and `subcategories`, then
rebuild. Icons available: `sun`, `ledger`, `hammer`, `tooth`, `signal`, `pin`,
`tag` (add more in `templates/components.js`).

**City** — append a city to the right state in `data/locations.json` with its own
`intro` and `neighborhoodsServed`. City + category pages appear automatically
wherever businesses exist.

**Tag** — a tag exists as soon as a business uses it in `tags`. Add a definition
in `data/tags.json` to make its page indexable. Tags are semantic capabilities
("battery storage", "evening hours"), not hashtags: if you cannot write two
honest sentences defining one, it should not have a page.

---

## 5. Indexing rules (why pages are or are not indexed)

Set in `data/site.json` under `indexRules`. A page is `noindex, follow` when:

| Page | Indexed when |
|---|---|
| Category | it has at least one business |
| Subcategory | ≥ `minProvidersForSubcategoryIndex` (default 1) |
| City | it has at least one business |
| City + category | ≥ `minProvidersForCityCategoryIndex` (default 2) |
| Tag | it has a written definition **and** ≥ `minProvidersForTagIndex` (default 2) |
| Search | never |

Pages below the threshold are still generated and still linked — visitors can
reach them, crawlers just are not asked to index them. `sitemap.xml` contains
only indexable URLs, and each noindex page carries an HTML comment stating the
reason, so an audit is a `grep` away:

```bash
grep -rl 'content="noindex' --include=index.html .
```

**What this project deliberately does not do:** generate city × category ×
neighbourhood permutations, invent "best of" claims, publish ratings or reviews,
or repeat the same text across pages. Indexation is a consequence of content,
not a goal pursued on its own.

---

## 6. WhatsApp and lead attribution

All WhatsApp links are built in one place (`js/whatsapp.js` for the client,
`whatsappHref()` in `templates/components.js` for generated HTML) and produce:

```
https://wa.me/<number>?text=Hi <Business>! I found you on Nearsite. I would like to know more about <service>.
```

The attribution sentence is what lets a business see the directory working. Set
the number in `providers.json` as digits only with country code
(`15125550137`). The portal's own number, used by the "list your business" form,
lives in `site.json` under `contactWhatsapp`.

---

## 7. Publishing on GitHub Pages

1. Push the repository to GitHub.
2. **Settings → Pages → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. `.nojekyll` is already committed, so directories work normally.
4. Custom domain: **Settings → Pages → Custom domain**, add a `CNAME` file, then
   set `url` in `data/site.json` to the same domain and rebuild.

Rebuild before every push. Committing HTML that is out of sync with the JSON is
the one way to break this setup.

---

## 8. Google Search Console

1. Add the property (prefer the **domain** property; verify with a DNS TXT record).
2. Submit `https://yourdomain.com/sitemap.xml`.
3. Use **URL Inspection** on one business page and one city + category page to
   confirm the rendered HTML contains the title, H1, content and JSON-LD.
4. Watch **Pages** for coverage. `Excluded by 'noindex' tag` is expected for thin
   pages — check the count matches what the build reported.
5. Watch **Core Web Vitals** and the **Rich results** report (LocalBusiness,
   BreadcrumbList, FAQPage).

If a business has a Google Business Profile, add its URL to
`googleBusinessProfile`; it is emitted in `sameAs` and linked on the page. Never
add one you have not been given.

---

## 9. Commercial fields

| Field | Effect |
|---|---|
| `featured: true` | "Featured" badge, appears on the home page |
| `sponsored: true` | discreet "Sponsored" label — advertising is always disclosed |
| `verified: true` | "Verified" badge — **only** use it if you actually run a verification step |
| `active: false` | removed from the build entirely |
| `theme` | the business's own colours applied inside its page only |

Paid placement never hides unpaid listings, and it never changes the order on a
listing page. That rule is stated publicly on `/about/` — keep it true.

---

## 10. Analytics (not installed)

`js/app.js` exposes `Nearsite.track(event, params)` and already fires:
`click_whatsapp`, `click_phone`, `click_website`, `click_directions`,
`search`, `filter_tag`, `filter_category`, `filter_city`, `lead_form_submit`.

Events queue in `Nearsite.trackQueue` and are forwarded automatically if
`dataLayer` or `gtag` exists. To enable a tool, add its snippet to
`templates/layout.js` (in `headExtra` or before the script block), fill in
`site.json → analytics`, and update `/privacy/` to say what you now collect.

---

## 11. Replacing the demo data

The build ships with ten fictional businesses so the structure can be reviewed.
They are marked `"demo": true`, which renders a "Demo listing" badge and the
banner at the top of every page. Remove the flag as you replace them; when no
provider has it, the banner disappears automatically.

Before going live:

- [ ] Replace `data/providers.json` with real, authorised businesses
- [ ] Set `url`, `name`, `contactEmail`, `contactWhatsapp` in `data/site.json`
- [ ] Replace the placeholder SVGs with real WebP images
- [ ] Have `/privacy/` and `/terms/` reviewed by a lawyer
- [ ] Rebuild, check the noindex report, submit the sitemap

---

## 12. Scaling and what comes next

The architecture holds from 10 to 500+ businesses without changes: pages are
generated from data, and internal linking grows with the dataset.

Planned, deliberately not built yet:

- `sitemap-index.xml` split into categories / locations / providers — add when a
  single sitemap passes a few thousand URLs
- `/admin/` — a browser editor writing the same JSON. `robots.txt` already
  blocks it
- Map view on city pages
- Reviews — the field exists in no schema on purpose. Do not add ratings until
  there is a real, verifiable process behind them
- Guides and comparison articles linking into categories and businesses

One rule to keep: **one URL, one intent**. A category page exists to find
businesses in a service. A business page exists to evaluate that business. An
article exists to explain something. Never mix them.
