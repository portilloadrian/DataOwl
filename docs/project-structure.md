# Project structure guide

This document explains the responsibility of each top-level folder and the boundaries between layers. New files should be placed in the narrowest folder that owns their responsibility.

## Root files

- `package.json`: workspace scripts and shared project metadata.
- `.env.example`: documented environment variables without real secrets.
- `.gitignore`: generated files, local secrets, and temporary uploads that must not be committed.
- `.editorconfig`: shared formatting defaults for contributors and editors.
- `README.md`: project purpose, setup, features, and roadmap.
- `CONTRIBUTING.md`: naming, testing, security, and collaboration standards.

## `client/`

The browser application. It owns routing, page composition, user interaction, API calls, chart rendering, and presentation.

- `public/`: static files referenced by URL that do not need to be imported by JavaScript.
- `src/app/`: application bootstrap, route definitions, and global providers.
- `src/assets/`: images, icons, and fonts imported by frontend code.
- `src/components/`: reusable components shared by multiple features.
- `src/features/`: feature-owned UI, hooks, API functions, and state. Group by product capability rather than file type.
- `src/pages/`: route-level page components that compose features.
- `src/services/`: API client setup and cross-feature integrations.
- `src/hooks/`: genuinely reusable React hooks.
- `src/lib/`: small framework-independent utilities.
- `src/styles/`: global CSS, tokens, resets, and shared styling primitives.
- `tests/`: frontend unit and component tests.

## `server/`

The HTTP API and backend application. It owns authentication, authorization, validation, business rules, persistence, and integrations.

- `src/config/`: environment loading and infrastructure configuration.
- `src/middleware/`: request-wide concerns such as authentication, errors, logging, and validation.
- `src/routes/`: URL-to-controller wiring only; keep handlers thin.
- `src/controllers/`: translate HTTP requests into service calls and responses.
- `src/services/`: business logic and use cases.
- `src/repositories/`: database queries and persistence access.
- `src/validators/`: request schemas and sanitization rules.
- `src/models/`: domain or database models when the selected ORM requires them.
- `tests/`: API, service, and authorization tests.

## `shared/`

Small definitions used by both client and server, such as validation schemas, enums, API response types, and block type constants. Shared code must not depend on browser-only or server-only APIs.

## `database/`

Database evolution and repeatable local data setup.

- `migrations/`: ordered schema changes committed to version control.
- `seeds/`: development/demo data only; never put real credentials or production data here.

## `docs/`

Architecture decisions, API documentation, data-model notes, demo preparation, and project planning. Documentation should explain decisions that are not obvious from code.

## `legacy/`

Temporary home for the current static prototype during the React migration. Nothing new should be developed here. Once its useful design or content has been migrated, the folder can be removed in a separate cleanup change.

## Placement rules

1. A page belongs in `client/src/pages`, even if it is currently large.
2. A reusable visual belongs in `client/src/components`.
3. Feature-specific code stays together under `client/src/features`.
4. API route files should not contain SQL or complex business logic.
5. SQL and persistence code stays in `server/src/repositories` or `database` migrations.
6. Cross-layer types and schemas belong in `shared`, not duplicated in client and server.
