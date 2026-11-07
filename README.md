# Yapp

Yapp is a small Twitter-style social app built as a course project. Users can publish short posts, follow people, and like posts. The project uses procedural PHP, MySQL, and plain HTML, CSS, and JavaScript.

## Project purpose

Yapp is a learning project for building a small web application with account login, role checks, database-backed pages, and a JSON API. It keeps the code simple and does not use a PHP framework or custom OOP application classes.

## Main features

- Create an account and sign in with a username or email.
- Publish, edit, delete, and like posts up to 280 characters.
- View a feed with your posts and posts from people you follow.
- Search for people, view profiles, and follow or unfollow accounts.
- Browse followers and followed accounts.
- Let administrators view the account list.

## Pages

- `/` shows the signed-in home feed.
- `/login.html` and `/register.html` provide account access.
- `/search.html`, `/profile.html`, and `/connections.html` support finding and viewing accounts.
- `/admin.html` shows the admin-only account list.

## Project guides

| Guide | What it explains |
|---|---|
| [Architecture](docs/architecture.md) | Main parts of the app and how requests move through them. |
| [API](docs/api.md) | Routes, request inputs, responses, and errors. |
| [Flows](docs/flows.md) | How the main user actions work from page to database. |
| [Database](docs/database.md) | Tables, fields, and relationships. |
| [Authentication and RBAC](docs/auth.md) | Sessions, Remember Me, roles, and permissions. |
| [Local setup](docs/setup.md) | How to run Yapp with local Apache and MySQL. |
| [Tech stack](docs/tech-stack.md) | Languages and software used by the project. |
| [Repository structure](docs/repo-structure.md) | What the main folders and files are for. |
