<?php
// force_error_log.php
// Sets PHP to log all errors into my_custom_error.log in this folder

// Turn on error logging
ini_set('log_errors', 'On');

// Define log file path (same folder as this script)
$logFile = __DIR__ . '/my_custom_error.log';
ini_set('error_log', $logFile);

// Optional: Show errors on screen too (useful for debugging, disable in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// (Optional) Uncomment below if you want to log a test entry once
// error_log("=== Test log entry from " . __FILE__ . " at " . date('Y-m-d H:i:s') . " ===");
