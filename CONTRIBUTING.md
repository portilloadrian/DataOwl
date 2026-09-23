# Contributing to DataOwls

## Naming conventions

- Use `PascalCase` for React component files and component names.
- Use `camelCase` for JavaScript functions, variables, hooks, and service modules.
- Use `kebab-case` for route paths, documentation files, and asset filenames.
- Use plural nouns for REST collection routes, such as `/stories` and `/comments`.
- Prefer descriptive names over abbreviations.

## General practices

- Keep secrets in local `.env` files and commit only `.env.example`.
- Validate and sanitize all user-controlled input at the API boundary.
- Keep database access inside repositories rather than route handlers.
- Keep business rules inside services rather than React components or controllers.
- Add loading, empty, error, and unauthorized states to user-facing features.
- Write tests for authentication, ownership checks, validation, and critical story flows.
- Keep pull requests focused on one feature or maintenance task.
