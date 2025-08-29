<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

try {
    // Prepare SQL query to fetch orders with pending payment status
    $sql = "SELECT ro.order_id, ro.retailer_name, ro.total_amount, ro.payment_status, ro.status
            FROM retailer_orders ro
            WHERE ro.payment_status = 'pending'
            ORDER BY ro.order_date DESC";

    // Use prepared statement
    if ($stmt = mysqli_prepare($conn, $sql)) {
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        $orders = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $orders[] = $row;
            }
        }

        // Return the orders as JSON
        header('Content-Type: application/json');
        echo json_encode($orders);

        mysqli_stmt_close($stmt);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to prepare statement: ' . mysqli_error($conn)]);
    }
} catch (Exception $e) {
    // Return error message
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}