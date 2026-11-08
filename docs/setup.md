# Local setup with Apache

These steps are for a local Ubuntu-style Apache, PHP, and MySQL setup. Point the Apache virtual host's document root to this project's `public/` directory. Enable `mod_rewrite` and allow `.htaccess` rules, because the API uses them to map clean URLs to PHP files.

## Requirements

- Apache with PHP support and `mod_rewrite` enabled.
- PHP 8 or newer, with PDO MySQL and mbstring extensions.
- MySQL 8 or a compatible MySQL server.

## Configure the database

Copy the example configuration and enter the database details in `config/config.php`:

```bash
cp config/config.example.php config/config.php
```

The setup script uses the example database `yapp`, user `yapp_app`, host `127.0.0.1`, and password `choose-a-local-password`. If you choose a different password, use the same value in `config/config.php` and `database/startup.sql`.

Run the setup script from the project folder:

```bash
bash src/setup.sh
```

It asks for your system password for `sudo`, creates the database and app user through local MySQL root access, then runs the full schema and seed. Use it only for a new or empty database because the seed inserts demo records. Existing databases are not upgraded by this setup script.

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

Open the local host name configured in Apache, then sign in or create an account.
