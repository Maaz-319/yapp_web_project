USE yapp;

CREATE TABLE IF NOT EXISTS users (
  id int unsigned auto_increment primary key,
  username varchar(20) not null,
  email varchar(255) not null,
  password_hash varchar(255) not null,
  display_name varchar(50) not null,
  role enum('user', 'admin') not null default 'user',
  bio varchar(160) default '',
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp,
  constraint uq_users_username unique (username),
  constraint uq_users_email unique (email),
  index idx_users_display_name (display_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS remember_tokens (
  id int unsigned auto_increment primary key,
  user_id int unsigned not null,
  selector char(24) not null,
  validator_hash char(64) not null,
  expires_at datetime not null,
  created_at datetime not null default current_timestamp,
  constraint uq_remember_selector unique (selector),
  constraint fk_remember_user foreign key (user_id) references users(id) on delete cascade,
  index idx_remember_user (user_id),
  index idx_remember_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tweets (
  id bigint unsigned auto_increment primary key,
  user_id int unsigned not null,
  content varchar(280) not null,
  created_at datetime not null default current_timestamp,
  edited_at datetime null,
  deleted_at datetime null,
  constraint fk_tweets_user foreign key (user_id) references users(id) on delete cascade,
  index idx_tweets_user_feed (user_id, deleted_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS follows (
  id bigint unsigned auto_increment primary key,
  follower_id int unsigned not null,
  following_id int unsigned not null,
  created_at datetime not null default current_timestamp,
  constraint uq_follows_pair unique (follower_id, following_id),
  constraint fk_follows_follower foreign key (follower_id)
    references users(id) on delete cascade,
  constraint fk_follows_following foreign key (following_id)
    references users(id) on delete cascade,
  index idx_follows_following (following_id, id),
  index idx_follows_follower (follower_id, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS likes (
  user_id int unsigned not null,
  tweet_id bigint unsigned not null,
  created_at datetime not null default current_timestamp,
  primary key (user_id, tweet_id),
  constraint fk_likes_user foreign key (user_id)
    references users(id) on delete cascade,
  constraint fk_likes_tweet foreign key (tweet_id)
    references tweets(id) on delete cascade,
  index idx_likes_tweet (tweet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
