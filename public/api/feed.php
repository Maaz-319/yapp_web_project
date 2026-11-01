<?php

require_once __DIR__ . '/../../src/common.php';
require_once __DIR__ . '/../../src/tweet_helpers.php';
api_require_method('GET');
$viewer = app_require_user();
$cursor = isset($_GET['cursor'])
    ? filter_var($_GET['cursor'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])
    : null;
if ($cursor === false) {
    api_error(422, 'VALIDATION_ERROR', 'Cursor must be a positive number.', [
        'cursor' => 'Invalid cursor.',
    ]);
}

$statement = app_db()->prepare(
    'SELECT t.id, t.user_id, t.content, t.created_at, t.edited_at, t.deleted_at,
        u.username, u.display_name,
        (SELECT COUNT(*) FROM likes l WHERE l.tweet_id = t.id) AS like_count,
        EXISTS(SELECT 1 FROM likes l2 WHERE l2.tweet_id = t.id AND l2.user_id = :viewer_likes)
            AS liked_by_me
     FROM tweets t
     JOIN users u ON u.id = t.user_id
     WHERE t.deleted_at IS NULL
       AND (t.user_id = :viewer_own
            OR t.user_id IN (SELECT f.following_id FROM follows f WHERE f.follower_id = :viewer_follows))
       AND (:cursor_check IS NULL OR t.id < :cursor_after)
     ORDER BY t.id DESC
     LIMIT :limit'
);
$statement->bindValue(':viewer_likes', $viewer['id'], PDO::PARAM_INT);
$statement->bindValue(':viewer_own', $viewer['id'], PDO::PARAM_INT);
$statement->bindValue(':viewer_follows', $viewer['id'], PDO::PARAM_INT);
$statement->bindValue(':cursor_check', $cursor === null ? null : $cursor, $cursor === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
$statement->bindValue(':cursor_after', $cursor === null ? null : $cursor, $cursor === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
$statement->bindValue(':limit', 21, PDO::PARAM_INT);
$statement->execute();
$rows = $statement->fetchAll();
$hasMore = count($rows) > 20;
if ($hasMore) {
    array_pop($rows);
}

$tweets = [];
foreach ($rows as $row) {
    $tweets[] = app_present_tweet($row, $viewer['id']);
}
$nextCursor = $hasMore && $rows ? (int) end($rows)['id'] : null;
api_success(['tweets' => $tweets, 'next_cursor' => $nextCursor]);
