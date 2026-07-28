# BoxTech — AI Reporting Agent (Dashboard)

Next.js 16 · React 19 · Tailwind v4 · Recharts. Fully responsive, 20 report
pages implemented, both ERPNext lead pipelines supported.

## Run locally

```bash
npm install
npm run dev            # http://localhost:3000
```

## Deploy to the VPS (Docker)

```bash
# on the server, in the project folder
docker compose up -d --build
docker compose logs -f dashboard
```

The container binds to `127.0.0.1:3100` only — nginx is the sole public entry
point. Copy `nginx.conf.example` to `/etc/nginx/sites-available/`, change the
`server_name`, then:

```bash
sudo ln -s /etc/nginx/sites-available/boxtech-dashboard /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d reports.boxtech.ai      # HTTPS
```

Basic auth is on by default — this is demo data and shouldn't be openly
indexable. Create the password file with:

```bash
sudo htpasswd -c /etc/nginx/.htpasswd boxtech
```

`next.config.mjs` sets `output: "standalone"`, so the runtime image ships
without `node_modules`. The **build** stage needs internet (next/font fetches
Inter once and self-hosts it); the running container does not.

## Structure

```
src/
  app/
    page.js                 Dashboard
    ask-ai/page.js          Natural-language Q&A
    reports/page.js         Report hub
    reports/[slug]/page.js  All 20 reports, one renderer
    globals.css             Design tokens + motion layer
  components/
    shell/                  Sidebar, Topbar, AppShell
    ui/                     Card, Badge, ChartFrame
    dashboard/              KPI, AI summary, filters, charts
    reports/                ReportView, ReportChart, ReportTable
  lib/
    nav.js                  Report catalogue + source DocType map
    reports.js              Report definitions (registry)
    format.js               Currency / date / number helpers
    mock/                   Fixtures: leads, activities, sales, reference
```

## Three decisions worth knowing

### 1. `ChartFrame` is mandatory for every chart

Never call Recharts' `ResponsiveContainer` directly. The sparkline stretch bug
happens when a chart's parent sizes itself from its children — SVG renders,
parent grows, observer fires, chart runs away down the page. `ChartFrame`
breaks the loop three ways: explicit pixel height, `min-width: 0` so grid cells
can shrink back, and `overflow: hidden` as a hard stop. All three are needed;
`min-width: 0` is the one usually missing.

### 2. One renderer, twenty reports

`lib/reports.js` describes each report as data — KPI strip, charts, table
columns. `ReportView` renders that description. Twenty bespoke pages would mean
twenty places to fix every future layout change.

### 3. Mock data is deterministic and shared

Fixtures use a seeded PRNG (`lib/mock/rng.js`), not `Math.random()`. Module-level
data runs during prerender *and* on hydrate; random values would differ between
the two and React would throw a hydration mismatch.

The dashboard derives its numbers from the **same** fixtures the reports use, so
clicking from a dashboard figure into its report shows matching values.

## The two lead pipelines

Both are live in ERPNext and they are **not** duplicates:

| | `Lead` (standard) | `Leads` (custom) |
|---|---|---|
| Fields | 44 | 17 |
| Purpose | Top-of-funnel capture | Commercial deal tracker |
| Stages | 7 statuses + qualification | 13 `sales_status` stages |
| Value | none | `total`, `probability`, `expected_closing_date` |
| Extras | `utm_source`, territory | `category`, `manufacturer` |

The funnel runs **Lead (captured) → qualified → Leads (deal) → won**.

Lead Generation and Lead Conversion both carry a three-way switch — standard
only, custom only, or both joined end to end. Each mode swaps its own KPIs,
charts, table and source label.

## Schema findings

Checked against `last_clean_schema.json` (980 DocTypes, Frappe v16.18.3):

- **Activities and calls are not standalone DocTypes.** `Customer Activity Detail`
  is a *child table* of `Customer` (`custom_activity_details`). Same for
  `Customer Contacts`, `Customer Project Task`, `Customer Sales Opportunity`.
  Reports over these must join through `tabCustomer`.
- **`Call Log` exists** with `call_received_by → Employee` and `duration`, but
  only populates with a telephony integration.

### Open data issues (not UI problems)

1. **No salesperson field on `Customer Activity Detail`.** Attribution falls back
   to Frappe's `owner` column, which records who *typed* the row, not who made
   the call. Every "by salesperson" figure inherits this caveat.
2. **The supplied `.sql` backup is 108 bytes** — a metadata header only. Nothing
   here has been validated against real records.

## Responsive behaviour

| Breakpoint | Sidebar | KPIs | Tables |
|---|---|---|---|
| `< 640px` | Drawer | 1 col | Rows become stacked cards |
| `640–1024px` | Drawer | 2–3 col | Cards |
| `≥ 1024px` | Fixed 268px | 3 col | Full table |
| `≥ 1280px` | Fixed | 5 col | Full table |

Sidebar report groups start **collapsed**.

## Motion

CSS only — no animation library. It keeps the bundle small, works inside Server
Components without forcing `"use client"` everywhere, and one
`prefers-reduced-motion` block disables all of it. See the motion layer at the
bottom of `globals.css`.
