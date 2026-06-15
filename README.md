# SchemaSprint

SchemaSprint is a local-business schema studio that generates validated JSON-LD packs and implementation handoff notes for local businesses and micro-agencies.

## MVP Highlights

- Vite + React + TypeScript single-page SaaS product.
- Marketing page plus authenticated schema studio dashboard.
- Demo magic-link auth stored in `localStorage`.
- Business profile editor for NAP, geo, hours, services, sameAs links, reviews, and FAQs.
- JSON-LD generator for `LocalBusiness`, `Service`, `FAQPage`, `Review`, `Product`, and `BreadcrumbList`.
- Validation checklist with weighted completeness score and warning queue.
- Export center with copy, download, saved history, implementation instructions, and client handoff note.
- Pricing and feature gating for Free, Pro, and Agency plans.
- Dark mode, responsive layout, motion, and realistic seeded data.
- Serverless API stubs under `api/` for production wiring.

## Local Development

```bash
npm install
npm run dev
```

Open the printed Vite URL, then use **Demo login** or **Open demo studio**.

## Verification

```bash
npm run lint
npm run build
```

## Environment

Copy `.env.example` to `.env` for production-like local configuration.

Required production values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_AGENCY_PRICE_ID`

The current MVP runs without these values because auth, profile data, plan state, and export history are local demo state.

## Supabase Schema

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  plan text not null default 'free',
  agency_name text,
  created_at timestamptz not null default now()
);

create table businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  url text not null,
  phone text,
  address_json jsonb not null default '{}',
  geo_json jsonb not null default '{}',
  opening_hours_json jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  description text,
  area_served text,
  price_range text
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  question text not null,
  answer text not null
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  author text not null,
  rating numeric not null,
  body text,
  date_published date
);

create table schema_exports (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  schema_type text not null,
  jsonld jsonb not null,
  score integer not null,
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null,
  status text not null,
  created_at timestamptz not null default now()
);
```

## API Stubs

The `api/` directory contains production-ready contracts with placeholder implementations:

- `POST /api/businesses`
- `POST /api/schema/generate`
- `POST /api/schema/validate`
- `GET /api/schema/exports`
- `POST /api/stripe/webhook`

Replace the stub bodies with Supabase queries, shared schema-builder logic, Stripe checkout creation, and webhook signature verification.

## Stripe Plan Mapping

- Free: one location, `LocalBusiness` and `FAQPage`, copy exports.
- Pro, `$12/mo`: one location, all schema generators, downloads, handoff notes.
- Agency, `$39/mo`: multi-location placeholder, client handoff workflows, priority export history.

## Deployment

The included GitHub Actions workflow builds the app and uploads the `dist/` artifact. For hosted deployment, connect the repository to Vercel, Netlify, or another static host and set:

- Build command: `npm run build`
- Output directory: `dist`

Serverless endpoints under `api/` follow Vercel-style handlers and can be adapted to other providers.

## Analytics Snippet

Add a privacy-friendly analytics provider after replacing the domain:

```html
<script defer data-domain="schemasprint.example.com" src="https://plausible.io/js/script.js"></script>
```

For Umami, use the hosted script URL and website ID from your Umami project instead.

## Launch Checklist

- Publish the production URL and verify Open Graph previews with LinkedIn, X/Twitter, and Slack.
- Launch on Product Hunt with sample schema exports for a dentist, restaurant, and home-services business.
- Post an Indie Hackers teardown of why local businesses still ship incomplete structured data.
- Share a free local schema audit checklist in relevant Reddit SEO/local-business communities before linking the app.
- Announce on X/Twitter with screenshots of the validation score, warnings, and export handoff.
- Create comparison pages for free schema generators versus implementation-ready schema packs.
- Install Plausible or Umami and track `demo_started`, `schema_generated`, `warning_resolved`, `export_downloaded`, and `plan_upgraded` events.
