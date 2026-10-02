# Thinking of You

Tap a name when someone crosses your mind; replay the week as bubbles. Static, offline-capable PWA. All data stays in the browser's localStorage (backup/restore as JSON), no backend.

Deploys to Netlify from `public/` (see `netlify.toml`). Netlify site: `thinking-of-you-onyy`.

## Sync (optional)

Signed-out visitors keep everything on-device. Signing in with an email code syncs friends and moments through Supabase (project `thinking-of-you`, schema in `supabase/migrations/`, row-level security so each user only sees their own rows). On first sign-in, a device's existing on-device data is merged into the account.
