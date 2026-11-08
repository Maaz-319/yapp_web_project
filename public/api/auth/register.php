<?php

require_once __DIR__ . '/../../../src/common.php';
api_require_method('POST');
$data = api_json_input();
$errors = [];

foreach (['username', 'email', 'display_name', 'password'] as $field) {
    if (!isset($data[$field]) || !is_string($data[$field]) || trim($data[$field]) === '') {
        $errors[$field] = 'This field is required.';
    }
}

$username = isset($data['username']) && is_string($data['username'])
    ? strtolower(trim($data['username'])) : '';
$email = isset($data['email']) && is_string($data['email'])
    ? strtolower(trim($data['email'])) : '';
$displayName = isset($data['display_name']) && is_string($data['display_name'])
    ? trim($data['display_name']) : '';
$password = isset($data['password']) && is_string($data['password'])
    ? $data['password'] : '';

if (!isset($errors['username']) && !preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
    $errors['username'] = 'Username must be 3–20 letters, numbers, or underscores.';
}
if (!isset($errors['email']) && (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 255)) {
    $errors['email'] = 'Enter a valid email address.';
}
if (!isset($errors['display_name']) && (mb_strlen($displayName) < 1 || mb_strlen($displayName) > 50)) {
    $errors['display_name'] = 'Display name must be 1–50 characters.';
}
if (!isset($errors['password'])) {
    if (strlen($password) < 8 || strlen($password) > 72
        || !preg_match('/[A-Za-z]/', $password)
        || !preg_match('/[0-9]/', $password)) {
        $errors['password'] = 'Password must be 8–72 bytes and include a letter and a number.';
    }
}

if ($errors) {
    api_error(422, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', $errors);
}

$pdo = app_db();
$check = $pdo->prepare(
    'SELECT username, email FROM users
     WHERE username = :username OR email = :email'
);
$check->execute(['username' => $username, 'email' => $email]);
$existing = $check->fetchAll();
$duplicateFields = [];
foreach ($existing as $row) {
    if (strcasecmp($row['username'], $username) === 0) {
        $duplicateFields['username'] = 'Username is already taken.';
    }
    if (strcasecmp($row['email'], $email) === 0) {
        $duplicateFields['email'] = 'Email is already registered.';
    }
}
if ($duplicateFields) {
    api_error(409, 'ACCOUNT_EXISTS', 'An account already uses that username or email.', $duplicateFields);
}

$passwordHash = password_hash($password, PASSWORD_BCRYPT);
try {
    $insert = $pdo->prepare(
        'INSERT INTO users (username, email, password_hash, display_name)
         VALUES (:username, :email, :password_hash, :display_name)'
    );
    $insert->execute([
        'username' => $username,
        'email' => $email,
        'password_hash' => $passwordHash,
        'display_name' => $displayName,
    ]);
} catch (PDOException $exception) {
    if ($exception->getCode() !== '23000') {
        throw $exception;
    }

    $check->execute(['username' => $username, 'email' => $email]);
    $racedDuplicates = [];
    foreach ($check->fetchAll() as $row) {
        if (strcasecmp($row['username'], $username) === 0) {
            $racedDuplicates['username'] = 'Username is already taken.';
        }
        if (strcasecmp($row['email'], $email) === 0) {
            $racedDuplicates['email'] = 'Email is already registered.';
        }
    }
    api_error(409, 'ACCOUNT_EXISTS', 'An account already uses that username or email.', $racedDuplicates);
}

api_success([
    'user' => [
        'id' => (int) $pdo->lastInsertId(),
        'username' => $username,
        'email' => $email,
        'display_name' => $displayName,
        'role' => 'user',
    ],
], 201);
