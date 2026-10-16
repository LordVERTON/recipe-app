# Supabase local development

This project uses the Supabase CLI configuration in `supabase/config.toml`. Local services are separate from Next.js. Local development credentials go in `.env.development.local`; existing Cloud credentials in `.env.local` are preserved. Next.js prefers the development file during `npm run dev` and ignores it during production builds.

## Prerequisites

- Docker Desktop running (required by the Supabase CLI for local services)
- The project dependencies installed with `npm ci` (this includes the pinned Supabase CLI)

The initial `npm run supabase:start` may download Docker service images. Once they are cached, the command deliberately hides any remote-link metadata during startup, so later starts do not contact Supabase Cloud and work without Internet.

Do not commit `.env*.local`, local service secrets, or anything in `supabase/.temp/`.

## Start the environment

From the repository root, start Supabase first:

```powershell
npm run supabase:start
```

The configured local endpoints are:

| Service | Address |
| --- | --- |
| API | `http://127.0.0.1:54321` |
| PostgreSQL | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Studio | `http://127.0.0.1:54323` |
| Next.js | `http://localhost:3000` (when started below) |

`npm exec -- supabase start` also starts the stack, but does not select it for the app. Generate `.env.development.local` from the running stack's URL and keys:

```powershell
npm run supabase:env
```

Then run the web app in a second terminal:

```powershell
npm run dev
```

Open Studio to inspect tables and run safe development queries. Auth accepts `http://127.0.0.1:3000` and `http://localhost:3000` redirects, as configured in `supabase/config.toml`.

Once the stack is running, `npm run dev:local -- --hostname 0.0.0.0` combines configuration generation and Next.js startup. It fails if local Supabase is unavailable rather than silently selecting Cloud.

## Auth and testing from a phone

### Confirmation emails with Mailpit

With Docker Desktop running:

```powershell
npm run mailpit
npm run dev
```

`npm run mailpit` starts the Mailpit container supplied by the pinned Supabase CLI.
If the local stack is missing or stopped, it starts Supabase first. It then writes
the local credentials to `.env.development.local`. Restart an already-running
Next.js dev server to apply them. Open **http://127.0.0.1:54324**, create an account
in the app, and click the confirmation link in the captured message. Local Auth
still requires confirmation; messages are captured locally instead of delivered
to real recipients. Local accounts are separate from production accounts.

```powershell
# Stop only Mailpit, leaving the database and other Supabase services running
npm run mailpit:stop

# Restart the inbox
npm run mailpit

# Verify delivery and consume a real email confirmation link (cleans up test data)
npm run mailpit:check
```

While Mailpit is stopped, local email operations can fail; restart it before
creating accounts or requesting password resets. `npm run supabase:start` also
starts Mailpit, and `npm run supabase:stop` stops the whole local stack.

The `[local_smtp]` section configures only the CLI's local inbox. There is no
custom production SMTP configuration: production continues to use Supabase Auth
and its email sender. `.env.development.local` is ignored by production builds.

### Local Auth and phone access

Open `http://localhost:3000` on the PC or `http://192.168.1.5:3000` on a phone on the same Wi-Fi (replace the IP with the PC's current address). In development, when Supabase is configured with a loopback HTTP URL, the browser sends Auth, REST and Storage calls through `/__supabase` on the Next.js origin. Next.js forwards them to the local stack. This avoids sending the phone's requests to its own `127.0.0.1`. Cloud configurations and production builds do not enable this proxy.

Create a new account using the app's email/password form. Local accounts and data are separate from Cloud; production credentials do not log into the local stack. Email confirmation is enabled in the checked-in configuration. Use the local mail inbox for confirmation links and add the exact phone-facing app origin to `auth.additional_redirect_urls` before restarting Supabase.

Local Auth sessions use a separate browser storage key from Cloud sessions. To return development to Cloud, rename `.env.development.local` to `.env.development.disabled.local`, verify the Cloud values in `.env.local`, and restart Next.js. Rename it back to select local again. Production builds keep using their normal environment variables.

With Next.js running, `node scripts/verify-local-auth.mjs` checks guest catalogue access, signup without a session, rejection of login before email confirmation, confirmation, login, token refresh, role lookup, photo upload/read, and logout through the Next.js proxy. It creates and deletes a temporary local account and photo and never loads Cloud credentials. Email confirmation must remain enabled. The test generates a confirmation token through the local admin API and consumes it through Auth; it does not auto-confirm the account through an admin update. Inbox delivery and browser redirects still need a manual check using a fresh signup email.

## Catalogue connection errors

The catalogue error can mean an unreachable Supabase host, invalid key, or missing schema/grants. Development logs now include the configured URL and original Supabase error. Check that Docker is running, run `npm run supabase:env`, apply pending migrations with `npm exec -- supabase migration up --local`, and restart Next.js. Starting Supabase alone does not override an existing Cloud URL.

## Local JWT errors after idle periods

`PGRST303: JWT issued at future` can occur intermittently with PostgREST 14.5
even when Windows and Docker clocks agree. PostgREST
[14.18](https://github.com/PostgREST/postgrest/releases/tag/v14.18) fixes this
time-cache defect. `npm run supabase:start` pins this version through the CLI's
local `supabase/.temp/rest-version` file, including after linking to a Cloud
project that uses an older version. An already-running container must be
recreated once to pick up the image:

```powershell
npm run supabase:stop
npm run supabase:start
npm run supabase:env
node scripts/verify-local-jwt.mjs
npm run dev
```

The normal stop preserves database volumes; do not use `--no-backup` or reset
the database for this error. `supabase login` authenticates the CLI and does not
repair local application sessions. The JWT check signs up a temporary local
account, asserts that login is blocked before confirmation, then consumes an
Auth confirmation token generated by the local admin API. It checks the JWT
issued at confirmation, login and token refresh, then deletes the account.
This does not test inbox delivery or browser redirects. With Next.js
running, use `node scripts/verify-local-jwt.mjs http://localhost:3000` to test
through the development proxy too.

## Database change workflow

1. Create a timestamped migration:

   ```powershell
npm exec -- supabase migration new describe_the_change
   ```

2. Edit the generated SQL in `supabase/migrations/`. Make migrations additive and reversible where practical.
3. Apply locally and verify the schema/data:

   ```powershell
npm run supabase:reset
   ```

   This recreates the local database, applies all migrations in order, and runs `supabase/seed.sql` when present. It destroys only local Supabase database data.
4. Exercise the app against the local API and run the production build:

   ```powershell
   npm run build
   ```
5. Commit the migration with the code that needs it. Never edit an already-deployed migration; make a new corrective migration instead.

## Personal recipe form

`Ajouter ma recette` opens the creation modal. Sign in, enter ingredients and preparation steps, and optionally upload a JPG, PNG, or WebP photo (up to 5 MB). Saved recipes appear in `Mes recettes` and can be used in the owner's planning while awaiting moderation.

Photo uploads require the Storage service enabled in `supabase/config.toml`. After changing this setting on an existing local stack, stop and restart it with backups preserved. Apply pending migrations without resetting data:

```powershell
npm exec -- supabase migration up --local
node scripts/verify-personal-recipes.mjs
```

The verification script only targets the local stack and removes its temporary account, recipe, and photo. The app's `.env.development.local` must point to the same environment where `20261007190000_personal_recipes.sql` and `20261008120000_recipe_api_grants.sql` are applied. For local development, `npm run supabase:env` switches the app to the local stack; restart Next.js afterward. Cloud deployments need both migrations applied separately.

## Recipe imports

The import UI is served at `/admin/import`. Its API routes are under `app/api/recipe-import/` and write recipe records to Supabase. Before importing:

- start the local stack and confirm the API URL in `.env.development.local`;
- use a small sample first;
- inspect imported recipes in Studio;
- keep source URLs/pages and canonical-ingredient status so the recipe remains traceable.

The SQL files in `supabase/new-import/` are source/import artifacts. Review them before applying them to any environment.

## Useful commands

```powershell
# Show local project status and connection values
npm run supabase:status

# Stop local containers (data remains in Docker volumes)
npm run supabase:stop

# Stop and remove local volumes when a full clean start is wanted
npm exec -- supabase stop --no-backup

# Compare migration history with a linked remote project (only after `supabase link`)
npm exec -- supabase migration list
```

## Remote-environment safety

Linking, pushing, or resetting a remote Supabase project can affect shared data. Confirm the project reference and take a backup before using commands such as `supabase db push` or `supabase db reset --linked`. Local commands above do not deploy anything remotely.

## Production email confirmation redirects

Email confirmation is explicitly enabled in both `[auth.email]` and
`[remotes.production.auth.email]`. The local PostgREST JWT fix does not change
this requirement or bypass it for application users. Editing this file does not
apply settings to the running local stack or deploy Cloud configuration.

The 2026-10-09 Cloud redirect check is historical, not a verification of current settings.
The application now uses exact `/auth/complete` and `/auth/reset-password` returns.
The local and remote profiles in `supabase/config.toml` prepare the corresponding allow lists;
restart local Supabase without resetting data when applying local Auth changes.
Cloud changes must be reviewed separately. Mailpit remains the local SMTP target.
Mailjet Custom SMTP, Google and Turnstile are not activated by these file changes.
See [authentication](authentication.md) and [email delivery](email-delivery.md).

Local checks (Node 24+, local stack and Next running):

```powershell
node scripts/verify-auth-email.mjs
node scripts/verify-local-mailpit.mjs
node scripts/verify-local-recovery.mjs
node scripts/verify-local-auth.mjs
$env:TEST_APP_URL='http://localhost:3000'
node scripts/verify-personal-recipes.mjs
node scripts/verify-auth-browser.mjs
```

The browser check requires Playwright Chromium. Tests guard against Cloud targets,
create disposable accounts and remove only their own fixtures. Never log callback
URLs or session objects. Auth tests generate no real external email.
