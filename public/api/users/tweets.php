<?php

require_once __DIR__ . '/../../../src/common.php';
require_once __DIR__ . '/../../../src/tweet_helpers.php';
api_require_method('GET');
$viewer = app_require_user();
$username = trim((string) ($_GET['username'] ?? ''));
$cursor = filter_var($_GET['cursor'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if ($username === '') {
    api_error(422, 'VALIDATION_ERROR', 'Username is required.', ['username' => 'Username is required.']);
}
if (isset($_GET['cursor']) && $cursor === false) {
    api_error(422, 'VALIDATION_ERROR', 'Cursor must be a positive number.', ['cursor' => 'Invalid cursor.']);
}
$owner = app_db()->prepare('SELECT id FROM users WHERE username = :username LIMIT 1');
$owner->execute(['username' => $username]);
$ownerId = $owner->fetchColumn();
if (!$ownerId) {
    api_error(404, 'USER_NOT_FOUND', 'User not found.');
}
$sql = app_tweet_query() . ' WHERE t.user_id = :user_id AND t.deleted_at IS NULL';
$params = ['user_id' => (int) $ownerId, 'viewer_likes' => $viewer['id']];
if ($cursor !== false && $cursor !== null) {
    $sql .= ' AND t.id < :cursor';
    $params['cursor'] = $cursor;
}
$sql .= ' ORDER BY t.id DESC LIMIT 21';
$statement = app_db()->prepare($sql);
$statement->execute($params);
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
