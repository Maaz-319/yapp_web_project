<?php

require_once __DIR__ . '/../../../src/common.php';
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['POST', 'DELETE'], true)) {
    header('Allow: POST, DELETE');
    api_error(405, 'METHOD_NOT_ALLOWED', 'Method not allowed.');
}
$viewer = app_require_user();
$username = trim((string) ($_GET['username'] ?? ''));
if ($username === '') {
    api_error(422, 'VALIDATION_ERROR', 'Username is required.', ['username' => 'Username is required.']);
}
$find = app_db()->prepare('SELECT id FROM users WHERE username = :username LIMIT 1');
$find->execute(['username' => $username]);
$targetId = $find->fetchColumn();
if (!$targetId) {
    api_error(404, 'USER_NOT_FOUND', 'User not found.');
}
$targetId = (int) $targetId;
if ($targetId === $viewer['id']) {
    api_error(422, 'CANNOT_FOLLOW_SELF', 'You cannot follow yourself.');
}

if ($method === 'POST') {
    $statement = app_db()->prepare(
        'INSERT IGNORE INTO follows (follower_id, following_id) VALUES (:follower_id, :following_id)'
    );
    $statement->execute(['follower_id' => $viewer['id'], 'following_id' => $targetId]);
    $isFollowing = true;
} else {
    $statement = app_db()->prepare(
        'DELETE FROM follows WHERE follower_id = :follower_id AND following_id = :following_id'
    );
    $statement->execute(['follower_id' => $viewer['id'], 'following_id' => $targetId]);
    $isFollowing = false;
}
$count = app_db()->prepare('SELECT COUNT(*) FROM follows WHERE following_id = :user_id');
$count->execute(['user_id' => $targetId]);
api_success([
    'is_following' => $isFollowing,
    'follower_count' => (int) $count->fetchColumn(),
]);
