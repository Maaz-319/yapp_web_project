<?php

require_once __DIR__ . '/../../../src/common.php';
api_require_method('POST');
app_delete_remember_cookie_token();
app_logout_session();
api_success(['message' => 'Logged out.']);
