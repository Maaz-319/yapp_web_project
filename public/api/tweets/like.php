<?php

require_once __DIR__ . '/../../../src/common.php';

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method !== 'POST' && $method !== 'DELETE') {
    header('Allow: POST, DELETE');
    api_error(405, 'METHOD_NOT_ALLOWED', 'Method not allowed.');
}

$user = app_require_user();
$tweetId = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1],
]);
if ($tweetId === false || $tweetId === null) {
    api_error(422, 'VALIDATION_ERROR', 'Tweet ID is required.', [
        'id' => 'Provide a valid tweet ID.',
    ]);
}

$tweet = app_db()->prepare(
    'SELECT id FROM tweets WHERE id = :id AND deleted_at IS NULL LIMIT 1'
);
$tweet->execute(['id' => $tweetId]);
if (!$tweet->fetchColumn()) {
    api_error(404, 'TWEET_NOT_FOUND', 'Tweet not found.');
}

if ($method === 'POST') {
    $like = app_db()->prepare(
        'INSERT IGNORE INTO likes (user_id, tweet_id) VALUES (:user_id, :tweet_id)'
    );
    $like->execute(['user_id' => $user['id'], 'tweet_id' => $tweetId]);
} else {
    $unlike = app_db()->prepare(
        'DELETE FROM likes WHERE user_id = :user_id AND tweet_id = :tweet_id'
    );
    $unlike->execute(['user_id' => $user['id'], 'tweet_id' => $tweetId]);
}

$count = app_db()->prepare('SELECT COUNT(*) FROM likes WHERE tweet_id = :tweet_id');
$count->execute(['tweet_id' => $tweetId]);

api_success([
    'tweet_id' => (int) $tweetId,
    'liked_by_me' => $method === 'POST',
    'like_count' => (int) $count->fetchColumn(),
]);
