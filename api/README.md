# SchemaSprint API Stubs

These files document the production serverless shape for SchemaSprint. The local MVP runs fully in the browser with seeded data and `localStorage`; production deployments can replace the stub responses with Supabase reads/writes and Stripe webhook verification.

## Endpoints

- `POST /api/businesses` creates or updates a local business profile.
- `POST /api/schema/generate` generates a JSON-LD graph for requested schema types.
- `POST /api/schema/validate` returns checklist items and a completeness score.
- `GET /api/schema/exports` lists saved schema exports for the authenticated user.
- `POST /api/stripe/webhook` receives Stripe subscription lifecycle events.

## Production Wiring

Expected services:

- Supabase Auth for magic-link sessions.
- Supabase Postgres tables from the README schema section.
- Stripe Checkout for Pro and Agency subscriptions.
- Stripe webhook signature verification using `STRIPE_WEBHOOK_SECRET`.

The stubs intentionally avoid external imports so they can be read and adapted in any serverless target.
