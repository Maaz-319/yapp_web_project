<?php

require_once __DIR__ . '/../../../src/common.php';
app_require_admin();

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'PATCH') {
    $userId = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    $input = api_json_input();
    $role = $input['role'] ?? null;

    if (!$userId || !in_array($role, ['admin', 'user'], true)) {
        api_error(422, 'VALIDATION_ERROR', 'Choose a valid account and role.');
    }

    $database = app_db();
    $find = $database->prepare('SELECT id, role FROM users WHERE id = :id');
    $find->execute(['id' => $userId]);
    $target = $find->fetch();
    if (!$target) {
        api_error(404, 'USER_NOT_FOUND', 'Account not found.');
    }

    if ($target['role'] === 'admin' && $role === 'user') {
        $count = $database->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn();
        if ((int) $count <= 1) {
            api_error(422, 'LAST_ADMIN', 'The last administrator must remain an admin.');
        }
    }

    $update = $database->prepare('UPDATE users SET role = :role WHERE id = :id');
    $update->execute(['role' => $role, 'id' => $userId]);
    api_success(['user' => ['id' => (int) $userId, 'role' => $role]]);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'DELETE') {
    $userId = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if (!$userId) {
        api_error(422, 'VALIDATION_ERROR', 'Choose a valid account.');
    }
    if ((int) $admin['id'] === (int) $userId) {
        api_error(422, 'CANNOT_DELETE_SELF', 'You cannot delete your own account here.');
    }

    $database = app_db();
    $find = $database->prepare('SELECT id, role FROM users WHERE id = :id');
    $find->execute(['id' => $userId]);
    $target = $find->fetch();
    if (!$target) {
        api_error(404, 'USER_NOT_FOUND', 'Account not found.');
    }

    if ($target['role'] === 'admin') {
        $count = $database->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn();
        if ((int) $count <= 1) {
            api_error(422, 'LAST_ADMIN', 'The last administrator cannot be deleted.');
        }
    }

    $delete = $database->prepare('DELETE FROM users WHERE id = :id');
    $delete->execute(['id' => $userId]);
    api_success(['deleted' => true, 'id' => (int) $userId]);
}

api_require_method('GET');

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
