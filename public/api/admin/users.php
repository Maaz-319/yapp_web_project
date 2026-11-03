<?php

require_once __DIR__ . '/../../../src/common.php';
api_require_method('GET');
app_require_admin();

$statement = app_db()->query(
    'SELECT id, username, email, display_name, role, created_at
     FROM users ORDER BY id ASC'
);
$users = $statement->fetchAll();
foreach ($users as &$user) {
    $user['id'] = (int) $user['id'];
}
unset($user);

api_success(['users' => $users]);
