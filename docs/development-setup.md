# Development setup

This guide gets a new contributor from a fresh clone to a running DataOwls client.

## Requirements

- Node.js 20 or newer
- npm
- A DataOwls Supabase project

The current client can run independently. The Express server is still being built, so use the client-specific command below rather than relying on the unfinished full-stack command.

## 1. Install dependencies

From the `CS2250-Project` directory:

```powershell
npm install
```

## 2. Configure Supabase client variables

Copy the client template:

```powershell
Copy-Item client/.env.example client/.env.local
```

Edit `client/.env.local` and fill in the Project URL and publishable key from the Supabase dashboard:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

These are the only Supabase values currently required by the browser client. Never put a Supabase secret/service-role key in `client/.env.local`.

Local `.env` files are ignored by Git and must not be committed.

## 3. Set up the database

In the Supabase SQL Editor, run these files in order:

1. `database/migrations/001_initial_schema.sql`
2. `database/migrations/002_create_profile_on_signup.sql`
3. `database/seeds/001_topics.sql`

The first migration creates the MVP tables. The second creates a public profile automatically when a Supabase Auth user signs up. The seed file adds the controlled story topics and descriptive tags.

Row Level Security should be enabled on the public tables. The Express API will eventually enforce application authorization; direct browser database access must remain restricted by RLS.

## 4. Run the client

```powershell
npm run dev --workspace client
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

Useful routes:

- `/` — home and discovery entry point
- `/discover` — story discovery
- `/login` — Supabase login
- `/signup` — Supabase signup
- `/stories/new` — authenticated story editor
- `/profile` — profile prototype route

## 5. Verify the project

Build the client:

```powershell
npm run build
```

The automated test command is not ready until the test runner and test suites are added. The Express server is also not yet a runnable feature; its source currently contains architecture placeholders.

## Supabase signup behavior

The signup form sends the username and randomly assigned owl icon as Auth user metadata. The profile trigger creates the corresponding row in `public.profiles`.

If email confirmation is enabled, signup displays a confirmation message instead of immediately signing the user in.

## Troubleshooting

### Missing Supabase environment variables

Confirm the file is named `client/.env.local` and the variables begin with `VITE_`. Restart Vite after changing environment variables.

### Create Story redirects to login

The route requires an active Supabase session. Sign in again and refresh the page if the session was created in another browser tab.

### Profile row was not created

Confirm that `002_create_profile_on_signup.sql` ran successfully, then test with a newly created Auth user. The trigger does not run retroactively for users created before it existed.
