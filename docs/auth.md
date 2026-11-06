# Authentication and permissions

Authentication checks who is signed in. Authorization checks what that account may do. Yapp handles both on the PHP server, so hiding a button in the browser is not a security check.

## Login sessions

After checking the password with `password_verify()`, PHP starts a session and regenerates its ID. The browser receives an HttpOnly, SameSite=Lax session cookie. Sessions use cookie-only and strict mode, and expire after two hours without activity. Passwords are stored as hashes made with `password_hash()`; API responses do not include the hash.

When the login form's Remember Me option is selected, Yapp also sets a 30-day cookie. The database stores a hash of its validator. When a remembered login is used, the token is checked, deleted, and replaced with a new token. If the validator does not match, all remember tokens for that account are deleted. Logging out clears the session and current remember token.

## Roles and rules

| Role | Allowed actions |
|---|---|
| Signed-out visitor | Register, log in, and view a public profile. |
| `student` | Use signed-in features, edit their own profile, create and manage their own posts, follow accounts, and like posts. |
| `admin` | All student actions and view the admin account list. |

Every new registration gets the `student` role. The registration request cannot choose a role. The API checks that the current user owns a post before editing or deleting it. Profile updates always apply to the signed-in account. Follow and like relationships use the signed-in account as their owner. Admin routes check the role on the server.

## Cookie and local security notes

Both the session cookie and Remember Me cookie use HttpOnly and SameSite=Lax. The Secure flag is enabled for HTTPS or when configured. Local HTTP development does not use HTTPS by default. The app has no CSRF token or request rate limiting, so use it as a course project and not as a production service without further security work.
