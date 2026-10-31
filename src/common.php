<?php

$config = require __DIR__ . '/../config/config.php';
date_default_timezone_set('UTC');
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../storage/logs/app.log');
error_reporting(E_ALL);

function app_db(): PDO
{
    global $config;
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $db = $config['db'];
    $dsn = 'mysql:host=' . $db['host'] . ';dbname=' . $db['dbname'] . ';charset=utf8mb4';
    $pdo = new PDO($dsn, $db['user'], $db['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $pdo->exec("SET time_zone = '+00:00'");

    return $pdo;
}

function api_success(array $data = [], int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

function api_error(
    int $status,
    string $code,
    string $message,
    array $fields = []
): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error' => [
            'code' => $code,
            'message' => $message,
            'fields' => (object) $fields,
        ],
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function api_require_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        header('Allow: ' . $method);
        api_error(405, 'METHOD_NOT_ALLOWED', 'Method not allowed.');
    }
}

function api_json_input(): array
{
    $raw = file_get_contents('php://input');

    try {
        $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $exception) {
        api_error(400, 'INVALID_JSON', 'Request body must contain valid JSON.');
    }

    if (!is_array($data)) {
        api_error(400, 'INVALID_JSON', 'Request body must be a JSON object.');
    }

    return $data;
}
