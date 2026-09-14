# Supabase local development

This project uses the Supabase CLI configuration in `supabase/config.toml`. Local services are intentionally separate from the Next.js app; the browser reads the Supabase URL and anonymous key from `.env.local`.

## Prerequisites

- Node.js and the project dependencies installed (`npm install`)
- Docker Desktop running (required by the Supabase CLI for local services)
- The Supabase CLI available through the project dependency or `npx supabase`

Do not commit `.env.local`, local service secrets, or anything in `supabase/.temp/`.

## Start the environment

From the repository root, start Supabase first:

```powershell
npx supabase start
```

The configured local endpoints are:

| Service | Address |
| --- | --- |
| API | `http://127.0.0.1:54321` |
| PostgreSQL | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Studio | `http://127.0.0.1:54323` |
| Next.js | `http://localhost:3000` (when started below) |

The CLI prints the local API URL, anonymous key, and service-role key. Copy only the API URL and anonymous key into `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<the-local-anon-key-output-by-supabase-start>
```

Then run the web app in a second terminal:

```powershell
npm run dev
```

Open Studio to inspect tables and run safe development queries. Auth accepts `http://127.0.0.1:3000` and `http://localhost:3000` redirects, as configured in `supabase/config.toml`.

## Database change workflow

1. Create a timestamped migration:

   ```powershell
   npx supabase migration new describe_the_change
   ```

2. Edit the generated SQL in `supabase/migrations/`. Make migrations additive and reversible where practical.
3. Apply locally and verify the schema/data:

   ```powershell
   npx supabase db reset
   ```

   This recreates the local database, applies all migrations in order, and runs `supabase/seed.sql` when present. It destroys only local Supabase database data.
4. Exercise the app against the local API and run the production build:

   ```powershell
   npm run build
   ```
5. Commit the migration with the code that needs it. Never edit an already-deployed migration; make a new corrective migration instead.

## Recipe imports

The import UI is served at `/admin/import`. Its API routes are under `app/api/recipe-import/` and write recipe records to Supabase. Before importing:

- start the local stack and confirm the API URL in `.env.local`;
- use a small sample first;
- inspect imported recipes in Studio;
- keep source URLs/pages and canonical-ingredient status so the recipe remains traceable.

The SQL files in `supabase/new-import/` are source/import artifacts. Review them before applying them to any environment.

## Useful commands

```powershell
# Show local project status and connection values
npx supabase status

# Stop local containers (data remains in Docker volumes)
npx supabase stop

# Stop and remove local volumes when a full clean start is wanted
npx supabase stop --no-backup

# Compare migration history with a linked remote project (only after `supabase link`)
npx supabase migration list
```

## Remote-environment safety

Linking, pushing, or resetting a remote Supabase project can affect shared data. Confirm the project reference and take a backup before using commands such as `supabase db push` or `supabase db reset --linked`. Local commands above do not deploy anything remotely.
