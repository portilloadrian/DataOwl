# DataOwls

DataOwls is a social platform for data storytelling. Users upload datasets, turn them into interactive charts, and arrange charts with explanatory writing into publishable stories. Readers can discover stories, interact with their visualizations, and participate through comments.

The product goal is simple: make data easier to understand by pairing visual evidence with context and a clear point of view.

## Project status

The React/Vite client is now the active frontend. Supabase Auth is connected to the client, and the initial PostgreSQL migrations are in `database/`. The Express API is still under construction.

## Quick start

See [`docs/development-setup.md`](docs/development-setup.md) for the full contributor setup, including Supabase configuration and database migrations.

From `CS2250-Project/`:

```powershell
npm install
npm run dev --workspace client
```

The client requires `client/.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Copy [`client/.env.example`](client/.env.example) to create the template.

## Repository structure

```text
CS2250-Project/
├── client/                 # React + Vite browser application
├── server/                 # Node.js + Express API
├── shared/                 # Browser/server-safe contracts and schemas
├── database/               # Migrations and development seeds
├── docs/                   # Architecture, API, data model, and demo notes
├── legacy/                 # Preserved static prototype backup; do not add new product code
├── .github/                # CI and repository automation
├── .env.example            # Documented environment-variable template
├── CONTRIBUTING.md         # Naming and collaboration standards
└── LICENSE
```

See [`docs/project-structure.md`](docs/project-structure.md) for the responsibility of each folder and rules for placing new files.

## Target audience

- Curious readers who want accessible explanations of data and current topics.
- Students, researchers, journalists, and analysts who want to communicate findings visually.
- Creators who have a dataset or idea but want more context than a standalone chart allows.

## MVP scope

### Accounts and profiles

- Email/password sign up and log in.
- JWT-backed sessions.
- Basic profile with username, avatar, and bio.

### Data and charts

- CSV upload with file-size validation, parsing, and column type detection.
- Bar, line, and scatter chart generation.
- Basic chart configuration: chart type, title, and X/Y columns.

### Story editor

- Create stories from ordered text and chart blocks.
- Add, remove, and reorder blocks with drag-and-drop.
- Save drafts and publish stories.

### Public experience

- Paginated feed/gallery of published stories.
- Story viewer that renders blocks in order.
- Interactive chart hover states/tooltips.
- Flat comment section for each story.

### Security and ownership

- Sanitize user-provided story text, comments, and chart labels.
- Require authentication for publishing and commenting.
- Enforce author ownership for edit and delete operations.

### Dashboard

- “My stories” list containing drafts and published stories.
- Basic view counts.

## Future features

These should only be attempted after the MVP is stable:

- Filterable and zoomable charts.
- Comments pinned to a specific story block.
- Co-author invitations and permissions.
- Following authors and personalized feeds.
- Topic tags and search.
- View and engagement analytics.
- Static story export.
- Real-time collaborative editing.

The recommended first stretch features are pinned comments and filterable charts because they improve the demo significantly without the complexity of real-time collaboration.

## Proposed technology

- Frontend: React + Vite.
- Charts: Recharts initially; D3 only where lower-level control is valuable.
- Styling: existing CSS design system initially, with Tailwind remaining an optional future decision.
- Editor interactions: `dnd-kit`.
- Backend: Node.js + Express.
- Database: PostgreSQL through Supabase or Neon.
- Authentication: Supabase Auth.
- Data processing: process CSV files and retain only chart-ready derived data; do not store original CSV files.
- Hosting: Vercel for the frontend and Render/Railway for the API, or an all-in-one deployment.

## Development standards

- Use `PascalCase` for React component files and component names.
- Use `camelCase` for JavaScript functions, variables, hooks, and service modules.
- Use `kebab-case` for route paths, documentation files, and asset filenames.
- Use plural nouns for REST collection routes, such as `/stories` and `/comments`.
- Keep route handlers thin; business logic belongs in services.
- Keep database queries in repositories and schema changes in migrations.
- Validate and sanitize user-controlled input at the API boundary.
- Never commit secrets, local `.env` files, uploaded datasets, or generated build output.
- Add loading, empty, error, and unauthorized states to user-facing features.
- Test authentication, ownership checks, validation, and the critical create-publish-view flow.

More collaboration guidance is available in [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Planned milestones

1. Foundations: finalize the stack, establish the database schema, add authentication, and finish the application shell.
2. Core data flow: implement CSV upload, validation, storage, and chart rendering.
3. Story editor: implement text/chart blocks, reordering, CRUD, ownership checks, and publishing.
4. Public experience: implement the feed, story viewer, comments, and interactive charts.
5. Polish: improve responsive behavior, loading/error states, accessibility, testing, security, and one or two stretch features.

## Current limitations

- The Express API is not implemented yet; the current client uses Supabase Auth directly.
- Story drafts and chart processing are not persisted yet.
- Automated tests and server-side authorization are still planned work.
