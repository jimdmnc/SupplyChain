<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

try {
    $unreadOnly = isset($_GET['unread_only']) && $_GET['unread_only'] === 'true';
    
    // Build the SQL query without LIMIT
    $sql = "SELECT n.*, ro.po_number, ro.retailer_name, ro.expected_delivery, ro.delivery_mode, ro.pickup_date, ro.pickup_location, ro.status
            FROM notifications n
            LEFT JOIN retailer_orders ro ON n.related_id = ro.order_id
            WHERE (n.user_id = ? OR n.user_id = 0)";
    
    if ($unreadOnly) {
        $sql .= " AND n.is_read = 0";
    }
    
    $sql .= " ORDER BY n.created_at DESC";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    // Fetch all notifications
    $notifications = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $notifications[] = $row;
    }
    
    mysqli_stmt_close($stmt);
    
    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM notifications WHERE (user_id = ? OR user_id = 0)";
    if ($unreadOnly) {
        $countSql .= " AND is_read = 0";
    }
    $countStmt = mysqli_prepare($conn, $countSql);
    mysqli_stmt_bind_param($countStmt, 'i', $user_id);
    mysqli_stmt_execute($countStmt);
    $countResult = mysqli_stmt_get_result($countStmt);
    $totalCount = mysqli_fetch_assoc($countResult)['total'];
    mysqli_stmt_close($countStmt);
    
    // Return the notifications as JSON
    echo json_encode([
        'status' => 'success',
        'data' => $notifications,
        'count' => count($notifications),
        'total' => intval($totalCount)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

mysqli_close($conn);
?>
