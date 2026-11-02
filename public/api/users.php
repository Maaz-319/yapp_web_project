<?php

require_once __DIR__ . '/../../src/common.php';
api_require_method('GET');

$username = trim((string) ($_GET['username'] ?? ''));
if ($username === '') {
    api_error(422, 'VALIDATION_ERROR', 'Username is required.', ['username' => 'Username is required.']);
}

$statement = app_db()->prepare(
    'SELECT u.id, u.username, u.display_name, u.bio, u.created_at,
        (SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id) AS follower_count,
        (SELECT COUNT(*) FROM follows f WHERE f.follower_id = u.id) AS following_count,
        (SELECT COUNT(*) FROM tweets t WHERE t.user_id = u.id AND t.deleted_at IS NULL) AS tweet_count
     FROM users u WHERE u.username = :username LIMIT 1'
);
$statement->execute(['username' => $username]);
$profile = $statement->fetch();
if (!$profile) {
    api_error(404, 'USER_NOT_FOUND', 'User not found.');
}

$viewerId = isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : 0;
$profile['id'] = (int) $profile['id'];
$profile['follower_count'] = (int) $profile['follower_count'];
$profile['following_count'] = (int) $profile['following_count'];
$profile['tweet_count'] = (int) $profile['tweet_count'];
$profile['is_me'] = $viewerId > 0 && $viewerId === $profile['id'];
$profile['is_following'] = false;
if ($viewerId > 0 && !$profile['is_me']) {
    $follow = app_db()->prepare(
        'SELECT 1 FROM follows WHERE follower_id = :viewer_id AND following_id = :profile_id LIMIT 1'
    );
    $follow->execute(['viewer_id' => $viewerId, 'profile_id' => $profile['id']]);
    $profile['is_following'] = (bool) $follow->fetchColumn();
}

api_success(['profile' => $profile]);
