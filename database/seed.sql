-- Seed data for yapp
-- Passwords are bcrypt hashes of "password123" (cost 10)
-- Hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

INSERT INTO users (username, email, password_hash, display_name, bio, created_at) VALUES
('alice', 'alice@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice Johnson', 'Software developer | Coffee enthusiast', '2026-01-15 10:00:00'),
('bob', 'bob@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob Smith', 'Full-stack engineer', '2026-01-16 11:30:00'),
('carol', 'carol@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carol Davis', 'UX designer', '2026-01-17 09:15:00'),
('dave', 'dave@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dave Wilson', 'DevOps engineer', '2026-01-18 14:20:00'),
('eve', 'eve@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Eve Brown', 'Frontend developer', '2026-01-19 16:45:00'),
('frank', 'frank@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Frank Miller', 'Backend developer', '2026-01-20 08:00:00'),
('grace', 'grace@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Grace Lee', 'Mobile developer', '2026-01-21 12:30:00'),
('henry', 'henry@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Henry Taylor', 'Security engineer', '2026-01-22 15:00:00'),
('iris', 'iris@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Iris Anderson', 'Data engineer', '2026-01-23 10:30:00'),
('jack', 'jack@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jack Thomas', 'Cloud architect', '2026-01-24 13:45:00');

-- Local demo administrator: username "admin", password "admin".
-- The password is stored as a bcrypt hash and is only for local coursework.
INSERT INTO users (username, email, password_hash, display_name, role, bio, created_at) VALUES
('admin', 'admin@example.com', '$2y$10$BjeLT0q4qbzMc8T9mUKodeUTt/IATWUo.LmPh1b4GBOS72kmUcGie', 'Yapp Admin', 'admin', '', '2026-01-25 09:00:00');

-- Follow relationships
INSERT INTO follows (follower_id, following_id, created_at) VALUES
(1, 2, '2026-01-25 10:00:00'), -- alice follows bob
(1, 3, '2026-01-25 10:05:00'), -- alice follows carol
(1, 4, '2026-01-25 10:10:00'), -- alice follows dave
(2, 1, '2026-01-25 11:00:00'), -- bob follows alice
(2, 3, '2026-01-25 11:05:00'), -- bob follows carol
(2, 5, '2026-01-25 11:10:00'), -- bob follows eve
(3, 1, '2026-01-25 12:00:00'), -- carol follows alice
(3, 2, '2026-01-25 12:05:00'), -- carol follows bob
(3, 4, '2026-01-25 12:10:00'), -- carol follows dave
(4, 1, '2026-01-25 13:00:00'), -- dave follows alice
(4, 5, '2026-01-25 13:05:00'), -- dave follows eve
(5, 2, '2026-01-25 14:00:00'), -- eve follows bob
(5, 3, '2026-01-25 14:05:00'), -- eve follows carol
(6, 1, '2026-01-25 15:00:00'), -- frank follows alice
(6, 2, '2026-01-25 15:05:00'), -- frank follows bob
(7, 3, '2026-01-25 16:00:00'), -- grace follows carol
(8, 4, '2026-01-25 17:00:00'), -- henry follows dave
(9, 5, '2026-01-25 18:00:00'), -- iris follows eve
(10, 1, '2026-01-25 19:00:00'); -- jack follows alice

-- Tweets
INSERT INTO tweets (user_id, content, created_at) VALUES
(3, 'Just deployed my first project! 🚀', '2026-02-01 09:00:00'),
(3, 'Learning something new every day. #coding', '2026-02-02 10:30:00'),
(5, 'Code review done. Time for coffee ☕', '2026-02-01 11:00:00'),
(4, 'New feature shipped to production!', '2026-02-03 14:20:00'),
(3, 'Design systems are fascinating.', '2026-02-01 15:45:00'),
(3, 'Accessibility matters. Always.', '2026-02-04 09:15:00'),
(4, 'Infrastructure as code changed my life.', '2026-02-02 16:30:00'),
(4, 'Monitoring is not optional.', '2026-02-05 10:00:00'),
(5, 'React hooks make components so clean.', '2026-02-03 11:20:00'),
(5, 'CSS Grid is amazing for layouts.', '2026-02-06 13:40:00'),
(6, 'Database indexing saved the day.', '2026-02-04 14:50:00'),
(6, 'Writing tests is actually fun now.', '2026-02-07 09:30:00'),
(7, 'SwiftUI is a game changer for iOS.', '2026-02-05 16:10:00'),
(7, 'Cross-platform development challenges.', '2026-02-08 10:45:00'),
(8, 'Security first, always. 🔒', '2026-02-06 12:00:00'),
(8, 'Penetration testing insights.', '2026-02-09 11:30:00'),
(9, 'Data pipelines and ETL processes.', '2026-02-07 13:20:00'),
(9, 'Real-time analytics with Kafka.', '2026-02-10 14:00:00'),
(10, 'Serverless architecture patterns.', '2026-02-08 15:30:00'),
(10, 'Cloud cost optimization tips.', '2026-02-11 09:15:00');

-- More tweets for pagination testing (alice has 20 tweets total)
INSERT INTO tweets (user_id, content, created_at) VALUES
(1, 'Tweet 3 from alice', '2026-02-09 10:00:00'),
(1, 'Tweet 4 from alice', '2026-02-09 11:00:00'),
(1, 'Tweet 5 from alice', '2026-02-09 12:00:00'),
(1, 'Tweet 6 from alice', '2026-02-09 13:00:00'),
(1, 'Tweet 7 from alice', '2026-02-09 14:00:00'),
(1, 'Tweet 8 from alice', '2026-02-09 15:00:00'),
(1, 'Tweet 9 from alice', '2026-02-09 16:00:00'),
(1, 'Tweet 10 from alice', '2026-02-09 17:00:00'),
(1, 'Tweet 11 from alice', '2026-02-09 18:00:00'),
(1, 'Tweet 12 from alice', '2026-02-09 19:00:00'),
(1, 'Tweet 13 from alice', '2026-02-09 20:00:00'),
(1, 'Tweet 14 from alice', '2026-02-09 21:00:00'),
(1, 'Tweet 15 from alice', '2026-02-09 22:00:00'),
(1, 'Tweet 16 from alice', '2026-02-09 23:00:00'),
(1, 'Tweet 17 from alice', '2026-02-10 10:00:00'),
(1, 'Tweet 18 from alice', '2026-02-10 11:00:00'),
(1, 'Tweet 19 from alice', '2026-02-10 12:00:00'),
(1, 'Tweet 20 from alice', '2026-02-10 13:00:00');

-- Additional posts give Alice's home feed 45 tweets across three pages.
INSERT INTO tweets (user_id, content, created_at) VALUES
(2, 'Trying a new coffee shop before class.', '2026-02-12 09:00:00'),
(3, 'A small design improvement can make a big difference.', '2026-02-12 09:15:00'),
(4, 'Backups are only useful when you test restoring them.', '2026-02-12 09:30:00'),
(2, 'Today I learned to slow down and read the error message.', '2026-02-12 09:45:00'),
(3, 'Working on cleaner spacing for the next screen.', '2026-02-12 10:00:00'),
(4, 'Documenting the setup while it is still fresh.', '2026-02-12 10:15:00'),
(2, 'A short walk helped me solve a tricky bug.', '2026-02-12 10:30:00'),
(3, 'Keyboard testing catches details I usually miss.', '2026-02-12 10:45:00'),
(4, 'Keeping the deployment steps simple today.', '2026-02-12 11:00:00'),
(2, 'Pair programming made this task much clearer.', '2026-02-12 11:15:00'),
(3, 'Making the empty state useful, not just pretty.', '2026-02-12 11:30:00'),
(4, 'One clear log message can save a lot of time.', '2026-02-12 11:45:00'),
(2, 'The first version does not need every feature.', '2026-02-12 12:00:00'),
(3, 'Checking the page on a smaller screen now.', '2026-02-12 12:15:00'),
(4, 'A good checklist makes handoff easier.', '2026-02-12 12:30:00'),
(2, 'Taking a minute to tidy up before the next task.', '2026-02-12 12:45:00'),
(3, 'Small improvements add up over a semester.', '2026-02-12 13:00:00'),
(4, 'Finished the update and wrote down what changed.', '2026-02-12 13:15:00'),
(2, 'Ready to share the next build with everyone.', '2026-02-12 13:30:00');

-- Likes
INSERT INTO likes (user_id, tweet_id, created_at) VALUES
(1, 3, '2026-02-01 11:05:00'), -- alice likes bob's tweet
(1, 5, '2026-02-01 15:50:00'), -- alice likes carol's tweet
(2, 1, '2026-02-01 09:05:00'), -- bob likes alice's tweet
(2, 2, '2026-02-02 10:35:00'), -- bob likes alice's tweet
(3, 1, '2026-02-01 09:10:00'), -- carol likes alice's tweet
(3, 4, '2026-02-03 14:25:00'), -- carol likes bob's tweet
(4, 2, '2026-02-02 10:40:00'), -- dave likes alice's tweet
(5, 3, '2026-02-01 11:10:00'), -- eve likes bob's tweet
(6, 1, '2026-02-01 09:15:00'), -- frank likes alice's tweet
(7, 5, '2026-02-01 15:55:00'), -- grace likes carol's tweet
(8, 7, '2026-02-02 16:35:00'), -- henry likes dave's tweet
(9, 9, '2026-02-03 11:25:00'), -- iris likes eve's tweet
(10, 11, '2026-02-04 14:55:00'); -- jack likes frank's tweet
