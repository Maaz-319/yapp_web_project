<?php

require_once __DIR__ . '/../../../src/common.php';
api_require_method('PATCH');
$user = app_require_user();
$data = api_json_input();
$errors = [];
$updates = [];

if (array_key_exists('display_name', $data)) {
    if (!is_string($data['display_name'])) {
        $errors['display_name'] = 'Display name must be text.';
    } else {
        $name = trim($data['display_name']);
        if ($name === '' || mb_strlen($name, 'UTF-8') > 50) {
            $errors['display_name'] = 'Display name must be between 1 and 50 characters.';
        } else {
            $updates['display_name'] = $name;
        }
    }
}
if (array_key_exists('bio', $data)) {
    if (!is_string($data['bio'])) {
        $errors['bio'] = 'Bio must be text.';
    } else {
        $bio = trim($data['bio']);
        if (mb_strlen($bio, 'UTF-8') > 160) {
            $errors['bio'] = 'Bio must be 160 characters or fewer.';
        } else {
            $updates['bio'] = $bio;
        }
    }
}
if (!$errors && !$updates) {
    $errors['display_name'] = 'Provide a display name or bio to update.';
}
if ($errors) {
    api_error(422, 'VALIDATION_ERROR', 'Please check the profile fields.', $errors);
}

$sets = [];
$params = ['id' => $user['id']];
foreach ($updates as $field => $value) {
    $sets[] = $field . ' = :' . $field;
    $params[$field] = $value;
}
$statement = app_db()->prepare('UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = :id');
$statement->execute($params);

$read = app_db()->prepare(
    'SELECT id, username, display_name, bio, created_at FROM users WHERE id = :id LIMIT 1'
);
$read->execute(['id' => $user['id']]);
$profile = $read->fetch();
$profile['id'] = (int) $profile['id'];
api_success(['profile' => $profile]);
