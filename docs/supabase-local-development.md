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

Open `http://localhost:3000` on the PC or `http://192.168.1.5:3000` on a phone on the same Wi-Fi (replace the IP with the PC's current address). In development, when Supabase is configured with a loopback HTTP URL, the browser sends Auth, REST and Storage calls through `/__supabase` on the Next.js origin. Next.js forwards them to the local stack. This avoids sending the phone's requests to its own `127.0.0.1`. Cloud configurations and production builds do not enable this proxy.

Create a new account using the app's email/password form. Local accounts and data are separate from Cloud; production credentials do not log into the local stack. Local Auth currently auto-confirms email signups. If you enable email confirmation later, use the local mail inbox and add the exact phone-facing app origin to `auth.additional_redirect_urls` before restarting Supabase.

Local Auth sessions use a separate browser storage key from Cloud sessions. To return development to Cloud, rename `.env.development.local` to `.env.development.disabled.local`, verify the Cloud values in `.env.local`, and restart Next.js. Rename it back to select local again. Production builds keep using their normal environment variables.

With Next.js running, `node scripts/verify-local-auth.mjs` checks guest catalogue access, signup, login, token refresh, role lookup, photo upload/read, and logout through the Next.js proxy. It creates and deletes a temporary local account and photo. This check expects local email auto-confirmation and never loads Cloud credentials.

## Catalogue connection errors

The catalogue error can mean an unreachable Supabase host, invalid key, or missing schema/grants. Development logs now include the configured URL and original Supabase error. Check that Docker is running, run `npm run supabase:env`, apply pending migrations with `npm exec -- supabase migration up --local`, and restart Next.js. Starting Supabase alone does not override an existing Cloud URL.

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
