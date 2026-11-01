<?php

function app_present_tweet(array $row, int $viewerId): array
{
    $deleted = $row['deleted_at'] !== null;
    return [
        'id' => (int) $row['id'],
        'content' => $deleted ? '' : (string) $row['content'],
        'created_at' => $row['created_at'],
        'edited_at' => $row['edited_at'],
        'is_mine' => (int) $row['user_id'] === $viewerId,
        'is_edited' => $row['edited_at'] !== null,
        'is_deleted' => $deleted,
        'like_count' => (int) ($row['like_count'] ?? 0),
        'liked_by_me' => (bool) ($row['liked_by_me'] ?? false),
        'author' => $deleted ? null : [
            'id' => (int) $row['user_id'],
            'username' => (string) $row['username'],
            'display_name' => (string) $row['display_name'],
        ],
    ];
}

function app_tweet_query(): string
{
    return 'SELECT t.id, t.user_id, t.content, t.created_at, t.edited_at, t.deleted_at,
        u.username, u.display_name,
        (SELECT COUNT(*) FROM likes l WHERE l.tweet_id = t.id) AS like_count,
        EXISTS(SELECT 1 FROM likes l2 WHERE l2.tweet_id = t.id AND l2.user_id = :viewer_likes)
            AS liked_by_me
        FROM tweets t JOIN users u ON u.id = t.user_id';
}

function app_get_live_tweet(int $tweetId, int $viewerId): array
{
    $statement = app_db()->prepare(
        app_tweet_query() . ' WHERE t.id = :id AND t.deleted_at IS NULL LIMIT 1'
    );
    $statement->execute(['id' => $tweetId, 'viewer_likes' => $viewerId]);
    $tweet = $statement->fetch();
    if (!$tweet) {
        api_error(404, 'TWEET_NOT_FOUND', 'Tweet not found.');
    }
    return $tweet;
}
