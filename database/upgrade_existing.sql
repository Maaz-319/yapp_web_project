-- Run once on a database created before the Phase 1 role field was added.
ALTER TABLE users
    ENGINE=InnoDB,
    CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    ADD COLUMN role ENUM('student', 'admin') NOT NULL DEFAULT 'student' AFTER display_name;

INSERT INTO users (username, email, password_hash, display_name, role, bio)
SELECT
    'admin',
    'admin@example.com',
    '$2y$10$BjeLT0q4qbzMc8T9mUKodeUTt/IATWUo.LmPh1b4GBOS72kmUcGie',
    'Yapp Admin',
    'admin',
    ''
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'admin'
);
