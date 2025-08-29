<?php
ini_set('log_errors', 'On');
ini_set('error_log', __DIR__ . '/my_php_error.log');
error_log("This is a test log message.");
echo "Log test complete.";
