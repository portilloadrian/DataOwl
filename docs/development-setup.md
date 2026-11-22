# Development setup

This guide gets a new contributor from a fresh clone to a running DataOwls client and a repeatable manual test flow.

## Requirements

- Node.js 20 or newer
- npm
- Git
- A modern browser
- A DataOwls Supabase project
- Permission to run SQL in the Supabase SQL Editor

The current client can run independently. The Express server is still being built, so use the client-specific command below rather than relying on the unfinished full-stack command.

## 1. Install dependencies

From the `CS2250-Project` directory:

```powershell
npm.cmd install
```

The root install also installs workspace dependencies. If PowerShell reports that `npm.ps1` is blocked, use `npm.cmd` for all npm commands.

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
3. `database/migrations/003_story_draft_policies.sql`
4. `database/migrations/004_story_dataset_policies.sql`
5. `database/migrations/005_scrollytelling_block.sql`
6. `database/migrations/006_published_story_policies.sql`
7. `database/migrations/007_repair_story_block_type.sql`
8. `database/seeds/001_topics.sql`

The first migration creates the MVP tables. The second creates a public profile automatically when a Supabase Auth user signs up. The third allows authenticated authors to save and reload their own story drafts and blocks. The fourth protects processed dataset metadata by story ownership. The fifth enables reusable scroll-reveal story blocks. The sixth allows anonymous readers to view published stories only. The seventh repairs the story-block type constraint if an earlier migration did not apply. The seed file adds the controlled story topics and descriptive tags.

Row Level Security should be enabled on the public tables. The Express API will eventually enforce application authorization; direct browser database access must remain restricted by RLS.

## 4. Run the client

```powershell
npm.cmd run dev --workspace client
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

Useful routes:

- `/` — home and discovery entry point
- `/discover` — story discovery
- `/login` — Supabase login
- `/signup` — Supabase signup
- `/stories/new` — authenticated story editor
- `/stories/new/preview` — public story-editor prototype preview
- `/stories/:storyId` — public viewer for published stories
- `/profile` — profile prototype route

## 5. Verify the project

Build the client:

```powershell
npm.cmd run build
```

The Express server is not yet a runnable feature. Do not use the root `dev`, `test`, or `lint` scripts as a project verification step yet; they include the unfinished server workspace and test runner placeholders.

## Manual verification checklist

Use this flow after setup:

1. Open `/stories/new/preview` and confirm the editor loads without signing in.
2. Select a CSV and confirm its row count, columns, and preview table appear.
3. Add a bar, table, or pie visualization and confirm it renders.
4. Add a scroll-reveal block, add narrative steps, and scroll through the preview.
5. Create a test account at `/signup` and sign in at `/login`.
6. Open `/stories/new`, save a draft, refresh, and confirm the draft reloads.
7. Publish the draft and copy its story UUID from Supabase.
8. Open `/stories/<story UUID>` in a private browser window and confirm the published story is visible.
9. Confirm an unpublished draft is not visible in the private browser window.
10. Sign out and confirm authenticated controls disappear.

The automated test command will be added when Vitest suites and the Express server are implemented.

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
