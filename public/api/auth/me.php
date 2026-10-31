<?php

require_once __DIR__ . '/../../../src/common.php';
api_require_method('GET');
api_success(['user' => app_require_user()]);
