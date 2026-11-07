# API

All endpoints return JSON. Successful responses have this shape:

```json
{"success":true,"data":{}}
```

Errors have this shape:

```json
{"success":false,"error":{"code":"VALIDATION_ERROR","message":"Details for the user.","fields":{}}}
```

`fields` maps input names to validation messages. Common status codes are `400` for invalid JSON, `401` when login is required, `403` for a forbidden action, `404` when a record or route is missing, `405` for an unsupported method, `422` for invalid input, and `500` for an unexpected server error. The browser sends JSON bodies for create and update requests and includes same-origin cookies.

## Routes

| Method and path | Access | Input | Successful `data` |
|---|---|---|---|
| `POST /api/auth/register` | Public | JSON: `username`, `email`, `display_name`, `password` | `user`: `id`, `username`, `email`, `display_name`, `role`; status `201`. New role is `student`. |
| `POST /api/auth/login` | Public | JSON: `identifier`, `password`, optional boolean `remember_me` | `user`: `id`, `username`, `email`, `display_name`, `role`, `bio`, `created_at`. |
| `GET /api/auth/me` | Signed in | None | `user`: current account details. |
| `POST /api/auth/logout` | Public | Empty JSON object | `message`. Clears the active session and remember token. |
| `GET /api/feed` | Signed in | Optional positive `cursor` | `tweets`: post list; `next_cursor`: number or `null`. Includes own and followed users' posts. |
| `POST /api/tweets` | Signed in | JSON: `content` (1–280 characters) | `tweet`; status `201`. |
| `GET /api/tweets?id={id}` | Signed in | Positive post `id` | `tweet`. |
| `PATCH /api/tweets?id={id}` | Post owner | JSON: `content` (1–280 characters) | Updated `tweet`. |
| `DELETE /api/tweets?id={id}` | Post owner | Positive post `id` | `deleted: true`. This is a soft delete. |
| `POST /api/tweets/like?id={id}` | Signed in | Positive post `id` | `tweet_id`, `liked_by_me: true`, `like_count`. |
| `DELETE /api/tweets/like?id={id}` | Signed in | Positive post `id` | `tweet_id`, `liked_by_me: false`, `like_count`. |
| `GET /api/users?username={name}` | Public | `username` | `profile`: public profile, follower/following/post counts, `is_me`, `is_following`. |
| `PATCH /api/users/me` | Signed in | JSON with `display_name` and/or `bio` | `profile`: updated profile. |
| `GET /api/users/search?q={text}` | Signed in | Search text `q` | `users`: matching accounts, maximum 20. Empty query returns an empty list. |
| `POST /api/users/follow?username={name}` | Signed in | Target `username` | `is_following: true`, `follower_count`. |
| `DELETE /api/users/follow?username={name}` | Signed in | Target `username` | `is_following: false`, `follower_count`. |
| `GET /api/users/followers?username={name}&cursor={id}` | Signed in | `username`, optional positive `cursor` | `users`, `next_cursor`. Up to 20 accounts per page. |
| `GET /api/users/following?username={name}&cursor={id}` | Signed in | `username`, optional positive `cursor` | `users`, `next_cursor`. Up to 20 accounts per page. |
| `GET /api/users/tweets?username={name}&cursor={id}` | Signed in | `username`, optional positive `cursor` | `tweets`, `next_cursor`. Up to 20 posts per page. |
| `GET /api/admin/users` | Admin | None | `users`: account list without password hashes. |

Post objects include `id`, `content`, `created_at`, `edited_at`, `is_mine`, `is_edited`, `is_deleted`, `like_count`, `liked_by_me`, and `author`. When a post is deleted, the API omits it from normal lists. Numeric IDs and counts are returned as numbers.

## Input rules and useful errors

- Registration lowercases usernames and email addresses. Usernames are 3–20 letters, numbers, or underscores. Display names are 1–50 characters. Passwords are 8–72 bytes and must contain a letter and a number. Duplicate usernames or emails return `409 ACCOUNT_EXISTS`.
- Login accepts `identifier` as either username or email. A wrong username/email or password returns `401 INVALID_CREDENTIALS`.
- Profile updates accept `display_name` (1–50 characters) and/or `bio` (up to 160 characters). They cannot change username, email, or role.
- Follow, follower, following, and post-list routes need an existing username. A missing account returns `404 USER_NOT_FOUND`. Following yourself returns `422 CANNOT_FOLLOW_SELF`.
- A missing post returns `404 TWEET_NOT_FOUND`. Trying to edit or delete another person's post returns `403 FORBIDDEN`.
- Feed, follower, following, and profile-post lists return up to 20 rows. `next_cursor` is `null` when there is no next page; otherwise, pass that value as `cursor` to load more.
- Invalid or missing required values return `422 VALIDATION_ERROR`. Invalid JSON returns `400 INVALID_JSON`.

The API is implemented by PHP files under `public/api/`. In particular, the profile URL maps to `public/api/users.php`; Apache has a rewrite rule for `/api/users`.
