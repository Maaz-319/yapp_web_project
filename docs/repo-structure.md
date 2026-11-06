# Repository structure

```text
yapp/
├── config/       Database configuration example and local config
├── database/     MySQL schema, seed data, and upgrade script
├── docs/         Project documentation
├── public/       Apache document root: pages, CSS, JS, images, and API
├── src/          Shared PHP database, session, and post helpers
├── storage/      Runtime logs and session files
├── DESIGN.md     Visual style notes
└── README.md     Project introduction and documentation links
```

## Main folders

- `public/*.html` contains the browser pages: home, login, registration, search, profile, connections, and admin.
- `public/api/` contains PHP API endpoints. Its `.htaccess` file maps clean paths such as `/api/auth/login` to PHP files.
- `public/assets/css/` contains page and shared styles.
- `public/assets/js/` contains browser API helpers and page behavior.
- `config/config.example.php` shows the required local settings. `config/config.php` is local and ignored by Git.
- `database/` contains SQL used to create or update the database.
- `src/common.php` shares PDO, JSON, session, and access-check helpers. `src/tweet_helpers.php` shares post query and response helpers.
- `storage/logs/` is where PHP writes unexpected errors. `storage/sessions/` can hold session data, depending on PHP configuration.

The Apache document root should be `public/`, which keeps `config/`, `src/`, and `storage/` outside direct browser access.
