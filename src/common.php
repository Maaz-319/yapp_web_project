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

function app_start_session(): void
{
    global $config;

    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    $secure = $https || !empty($config['app']['secure_cookies']);

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();

    if (isset($_SESSION['user_id'], $_SESSION['last_activity'])
        && time() - (int) $_SESSION['last_activity'] > 7200) {
        $_SESSION = [];
        session_destroy();
        session_start();
    }

    if (isset($_SESSION['user_id'])) {
        $_SESSION['last_activity'] = time();
    }
}

function app_logout_session(): void
{
    global $config;
    app_start_session();
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
        $secure = $https || !empty($config['app']['secure_cookies']);
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => '/',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    session_destroy();
}

set_exception_handler(static function (Throwable $exception): void {
    error_log(sprintf(
        '%s in %s:%d',
        $exception->getMessage(),
        $exception->getFile(),
        $exception->getLine()
    ));

    if (!headers_sent()) {
        api_error(500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
    }
});

// Start/check sessions for every API request so idle time is measured consistently.
app_start_session();
