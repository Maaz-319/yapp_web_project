<?php

require_once __DIR__ . '/../../../src/common.php';
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
$find = app_db()->prepare('SELECT id FROM users WHERE username = :username LIMIT 1');
$find->execute(['username' => $username]);
$targetId = $find->fetchColumn();
if (!$targetId) {
    api_error(404, 'USER_NOT_FOUND', 'User not found.');
}
$sql =
    'SELECT f.id AS cursor_id, u.id, u.username, u.display_name, u.bio,
        EXISTS(SELECT 1 FROM follows mine WHERE mine.follower_id = :viewer_id AND mine.following_id = u.id) AS is_following
     FROM follows f JOIN users u ON u.id = f.follower_id
     WHERE f.following_id = :target_id';
$params = ['viewer_id' => $viewer['id'], 'target_id' => (int) $targetId];
if ($cursor !== false && $cursor !== null) {
    $sql .= ' AND f.id < :cursor';
    $params['cursor'] = $cursor;
}
$sql .= ' ORDER BY f.id DESC LIMIT 21';
$statement = app_db()->prepare($sql);
$statement->execute($params);
$rows = $statement->fetchAll();
$hasMore = count($rows) > 20;
if ($hasMore) {
    array_pop($rows);
}
foreach ($rows as &$row) {
    $row['id'] = (int) $row['id'];
    $row['is_following'] = (bool) $row['is_following'];
}
unset($row);
$nextCursor = $hasMore && $rows ? (int) end($rows)['cursor_id'] : null;
foreach ($rows as &$row) {
    unset($row['cursor_id']);
}
unset($row);
api_success(['users' => $rows, 'next_cursor' => $nextCursor]);
