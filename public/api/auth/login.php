<?php

require_once __DIR__ . '/../../../src/common.php';
api_require_method('POST');
$data = api_json_input();
$errors = [];

if (!isset($data['identifier']) || !is_string($data['identifier']) || trim($data['identifier']) === '') {
    $errors['identifier'] = 'Username or email is required.';
}
if (!isset($data['password']) || !is_string($data['password']) || $data['password'] === '') {
    $errors['password'] = 'Password is required.';
}
if ($errors) {
    api_error(422, 'VALIDATION_ERROR', 'Please enter your username or email and password.', $errors);
}

$identifier = strtolower(trim($data['identifier']));
$password = $data['password'];
$field = str_contains($identifier, '@') ? 'email' : 'username';
$statement = app_db()->prepare(
    "SELECT id, username, email, password_hash, display_name, role
     FROM users WHERE {$field} = :identifier LIMIT 1"
);
$statement->execute(['identifier' => $identifier]);
$user = $statement->fetch();
$dummyHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
$verified = password_verify($password, $user ? $user['password_hash'] : $dummyHash);

if (!$user || !$verified) {
    api_error(401, 'INVALID_CREDENTIALS', 'Invalid username/email or password.');
}

if (password_needs_rehash($user['password_hash'], PASSWORD_BCRYPT)) {
    $newHash = password_hash($password, PASSWORD_BCRYPT);
    $update = app_db()->prepare('UPDATE users SET password_hash = :hash WHERE id = :id');
    $update->execute(['hash' => $newHash, 'id' => $user['id']]);
}

app_start_session();
session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['last_activity'] = time();
app_delete_remember_cookie_token();
if (($data['remember_me'] ?? false) === true) {
    app_issue_remember_token((int) $user['id']);
}
$user['id'] = (int) $user['id'];
unset($user['password_hash']);

api_success(['user' => $user]);
