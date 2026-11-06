# Local setup with Apache

These steps are for a local Ubuntu-style Apache, PHP, and MySQL setup. Point the Apache virtual host's document root to this project's `public/` directory. Enable `mod_rewrite` and allow `.htaccess` rules, because the API uses them to map clean URLs to PHP files.

## Requirements

- Apache with PHP support and `mod_rewrite` enabled.
- PHP 8 or newer, with PDO MySQL and mbstring extensions.
- MySQL 8 or a compatible MySQL server.

## Configure the database

Create a database and a local database user with access to it. For example, run these statements in MySQL and choose your own password:

```sql
CREATE DATABASE yapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'yapp_app'@'localhost' IDENTIFIED BY 'choose-a-local-password';
GRANT ALL PRIVILEGES ON yapp.* TO 'yapp_app'@'localhost';
FLUSH PRIVILEGES;
```

Copy the example configuration and enter the same database details in `config/config.php`:

```bash
cp config/config.example.php config/config.php
```

Import the schema and, if you want demo accounts and posts, the seed data:

```bash
mysql -u yapp_app -p yapp < database/schema.sql
mysql -u yapp_app -p yapp < database/seed.sql
```

The seed has regular demo accounts with password `password123` and an admin account with username `admin` and password `admin`. These are public coursework credentials. Use them only in a local database.

## Apache and writable folders

Enable Apache rewrite rules with `sudo a2enmod rewrite`. In the active Apache site, set `DocumentRoot` to this project's full path ending in `/public`. Do not point it at the repository root. The matching `<Directory>` block needs `AllowOverride All` so the API `.htaccess` file works. Reload Apache after changing its site configuration.

For example, replace `/var/www/yapp` below with the actual project path and use the hostname configured on your machine:

```apache
DocumentRoot /var/www/yapp/public
<Directory /var/www/yapp/public>
    AllowOverride All
    Require all granted
</Directory>
```

Ensure PHP can read the config and project files. Give the Apache user write access to `storage/logs/` and, if file sessions are configured there, `storage/sessions/`.

Open the local host name configured in Apache, then sign in or create an account. For an existing database that predates the admin role, review and run `database/upgrade_existing.sql` instead of re-importing the schema and seed data.
