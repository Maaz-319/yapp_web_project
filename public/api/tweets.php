<?php

require_once __DIR__ . '/../../src/common.php';
require_once __DIR__ . '/../../src/tweet_helpers.php';
$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'POST') {
    $user = app_require_user();
    $data = api_json_input();
    $content = isset($data['content']) && is_string($data['content']) ? trim($data['content']) : '';
    $length = mb_strlen($content, 'UTF-8');
    if ($length < 1 || $length > 280) {
        api_error(422, 'VALIDATION_ERROR', 'Tweet must contain 1 to 280 characters.', [
            'content' => 'Tweet must contain 1 to 280 characters.',
        ]);
    }
    $statement = app_db()->prepare('INSERT INTO tweets (user_id, content) VALUES (:user_id, :content)');
    $statement->execute(['user_id' => $user['id'], 'content' => $content]);
    $tweet = app_get_live_tweet((int) app_db()->lastInsertId(), $user['id']);
    api_success(['tweet' => app_present_tweet($tweet, $user['id'])], 201);
}

if ($method === 'GET') {
    $user = app_require_user();
    $tweetId = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($tweetId === false || $tweetId === null) {
        api_error(422, 'VALIDATION_ERROR', 'Tweet ID is required.', ['id' => 'Provide a valid tweet ID.']);
    }
    $tweet = app_get_live_tweet($tweetId, $user['id']);
    api_success(['tweet' => app_present_tweet($tweet, $user['id'])]);
}

if ($method === 'PATCH') {
    $user = app_require_user();
    $tweetId = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($tweetId === false || $tweetId === null) {
        api_error(422, 'VALIDATION_ERROR', 'Tweet ID is required.', ['id' => 'Provide a valid tweet ID.']);
    }
    $tweet = app_get_live_tweet($tweetId, $user['id']);
    if ((int) $tweet['user_id'] !== $user['id']) {
        api_error(403, 'FORBIDDEN', 'You can only edit your own tweets.');
    }
    $data = api_json_input();
    $content = isset($data['content']) && is_string($data['content']) ? trim($data['content']) : '';
    $length = mb_strlen($content, 'UTF-8');
    if ($length < 1 || $length > 280) {
        api_error(422, 'VALIDATION_ERROR', 'Tweet must contain 1 to 280 characters.', [
            'content' => 'Tweet must contain 1 to 280 characters.',
        ]);
    }
    $update = app_db()->prepare(
        'UPDATE tweets SET content = :content, edited_at = UTC_TIMESTAMP() WHERE id = :id AND user_id = :user_id'
    );
    $update->execute(['content' => $content, 'id' => $tweetId, 'user_id' => $user['id']]);
    $tweet = app_get_live_tweet($tweetId, $user['id']);
    api_success(['tweet' => app_present_tweet($tweet, $user['id'])]);
}

if ($method === 'DELETE') {
    $user = app_require_user();
    $tweetId = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($tweetId === false || $tweetId === null) {
        api_error(422, 'VALIDATION_ERROR', 'Tweet ID is required.', ['id' => 'Provide a valid tweet ID.']);
    }
    $tweet = app_get_live_tweet($tweetId, $user['id']);
    if ((int) $tweet['user_id'] !== $user['id']) {
        api_error(403, 'FORBIDDEN', 'You can only delete your own tweets.');
    }
    $delete = app_db()->prepare(
        'UPDATE tweets SET deleted_at = UTC_TIMESTAMP() WHERE id = :id AND user_id = :user_id AND deleted_at IS NULL'
    );
    $delete->execute(['id' => $tweetId, 'user_id' => $user['id']]);
    api_success(['deleted' => true]);
}

header('Allow: GET, POST, PATCH, DELETE');
api_error(405, 'METHOD_NOT_ALLOWED', 'Method not allowed.');
