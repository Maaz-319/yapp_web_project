<?php

require_once __DIR__ . '/../../../src/common.php';
api_require_method('GET');
$viewer = app_require_user();
$query = trim((string) ($_GET['q'] ?? ''));
if ($query === '') {
    api_success(['users' => []]);
}

$escaped = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $query);
$statement = app_db()->prepare(
    "SELECT u.id, u.username, u.display_name, u.bio,
        EXISTS(SELECT 1 FROM follows f WHERE f.follower_id = :viewer_id AND f.following_id = u.id) AS is_following
     FROM users u
     WHERE u.username LIKE :username_pattern ESCAPE '!' OR u.display_name LIKE :name_pattern ESCAPE '!'
     ORDER BY (u.username = :exact_username) DESC, u.username ASC
     LIMIT 20"
);
$pattern = '%' . $escaped . '%';
$statement->execute([
    'viewer_id' => $viewer['id'],
    'username_pattern' => $pattern,
    'name_pattern' => $pattern,
    'exact_username' => $query,
]);
$users = $statement->fetchAll();
foreach ($users as &$user) {
    $user['id'] = (int) $user['id'];
    $user['is_following'] = (bool) $user['is_following'];
}
unset($user);
api_success(['users' => $users]);
