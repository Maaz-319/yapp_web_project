# Yapp — PHP Twitter Clone

A small course project built with procedural PHP, PDO prepared statements, MySQL, and plain HTML, CSS, and JavaScript. The PHP application does not use custom classes, frameworks, or a package manager. PDO's required API is the one database-only OOP exception.

## Local setup

The current development machine serves this project at `http://maaz.local/` with `public/` as the document root. On another machine, configure an Apache virtual host for that machine's local hostname, point it to this project's `public/` directory, and allow `.htaccess` overrides.

Create a database and a dedicated local account (use your own password):

```sql
CREATE DATABASE yapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'yapp_app'@'localhost' IDENTIFIED BY 'choose-a-local-password';
GRANT ALL PRIVILEGES ON yapp.* TO 'yapp_app'@'localhost';
FLUSH PRIVILEGES;
```

Then configure and import the database:

```bash
cp config/config.example.php config/config.php
# Edit config/config.php with the database host, name, username, and password.
mysql -u yapp_app -p yapp < database/schema.sql
mysql -u yapp_app -p yapp < database/seed.sql
```

The seed includes ordinary demo users (password `password123`) and a local admin (`admin` / `admin`). These are local coursework credentials only. The database stores password hashes.

## Pages and API

- `/` — signed-in home page
- `/login.html` — login with username or email
- `/register.html` — create an account; log in afterward
- `/search.html` — find users by username or display name
- `/profile.html?u=username` — view and edit profiles, follow users, and browse posts
- `/connections.html?u=username&tab=followers|following` — browse paginated connections
- `/admin.html` — admin-only user list

Auth API routes return JSON with a `success` field. Successful responses include `data`; errors include `error.code`, `error.message`, and `error.fields`.

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Start a session |
| GET | `/api/auth/me` | Signed in | Get the current user |
| POST | `/api/auth/logout` | Public | End the current session |
| GET | `/api/admin/users` | Admin | List users without password hashes |
| GET | `/api/users?username=` | Public | View a profile and counts |
| PATCH | `/api/users/me` | Signed in | Edit the current profile |
| GET | `/api/users/search?q=` | Signed in | Search users |
| POST/DELETE | `/api/users/follow?username=` | Signed in | Follow or unfollow a user |
| GET | `/api/users/followers?username=&cursor=` | Signed in | List followers |
| GET | `/api/users/following?username=&cursor=` | Signed in | List followed users |
| GET | `/api/users/tweets?username=&cursor=` | Signed in | List a user's posts |
| POST | `/api/tweets` | Signed in | Create a post |
| GET/PATCH/DELETE | `/api/tweets?id=` | Signed in | Read, edit, or delete a post |

The API uses HttpOnly, SameSite=Lax cookies, strict cookie-only sessions, login session-ID rotation, and a two-hour idle timeout. Login can optionally create a 30-day Remember Me token; tokens rotate when restored and are stored in the database as hashes. State-changing API requests use the app's JSON request pattern and SameSite=Lax cookies.

For an existing database created before the admin role was added, run `database/upgrade_existing.sql` once instead of re-importing the schema and seed. If case variants of the same username already exist, resolve those duplicates before running the migration. Give the Apache user write access to `storage/logs/` only so PHP can record unexpected errors.
