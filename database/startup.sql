CREATE DATABASE IF NOT EXISTS yapp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'yapp_app'@'127.0.0.1'
  IDENTIFIED BY 'choose-a-local-password';

ALTER USER 'yapp_app'@'127.0.0.1'
  IDENTIFIED BY 'choose-a-local-password';

GRANT ALL PRIVILEGES ON yapp.* TO 'yapp_app'@'127.0.0.1';

FLUSH PRIVILEGES;
