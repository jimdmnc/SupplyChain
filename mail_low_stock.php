<?php
// mail_low_stock.php
// Reusable function to send low/out-of-stock emails without cURL

ini_set('log_errors', 'On');
ini_set('error_log', __DIR__ . '/my_php_error.log'); // logs to your project folder

require_once __DIR__ . '/PHPMailer/src/Exception.php';
require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/**
 * Sends a low stock / out of stock email for a raw material.
 *
 * @param mysqli $conn          Active DB connection
 * @param int    $materialId    raw_materials.id
 * @param string $materialName  Material name (optional but nice to include)
 * @param int    $quantity      Current quantity
 * @param bool   $debug         Enable SMTP debug to error_log (default false)
 * @return array                ['success' => bool, 'message' => string]
 */



// ---------------------------
// Helper: create notification
// ---------------------------
function createLowStockNotification($conn, $user_id, $material_id, $material_name, $quantity) {
    // Build message (no ID shown)
    $status = ((int)$quantity <= 0) ? 'Out of Stock' : 'Low Stock';
    // Message format: "Low Stock — Flour (Qty: 5)" or "Out of Stock — Flour (Qty: 0)"
    $message = sprintf('%s — %s (Qty: %d)', $status, $material_name, $quantity);

    // Type to allow client-side routing/handling
    $type = 'raw_material_low_stock';

    // Ensure we have integers
    $user_id = intval($user_id);
    $material_id = intval($material_id);
    $quantity = intval($quantity);

    $sql = "INSERT INTO notifications (user_id, message, related_id, type, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())";
    $stmt = mysqli_prepare($conn, $sql);
    if (!$stmt) {
        error_log("createLowStockNotification prepare failed: " . mysqli_error($conn));
        return false;
    }
    mysqli_stmt_bind_param($stmt, 'issi', $user_id, $message, $material_id, $type);
    $ok = mysqli_stmt_execute($stmt);
    if (!$ok) {
        error_log("createLowStockNotification execute failed: " . mysqli_stmt_error($stmt));
    }
    mysqli_stmt_close($stmt);
    return $ok;
}





function sendLowStockEmail(mysqli $conn, int $materialId, string $materialName, int $quantity, bool $debug = false): array
{
    error_log("sendLowStockEmail() called for material_id={$materialId}, name={$materialName}, qty={$quantity}");

    // Look up supplier for this material
    $sql = "SELECT s.name AS supplier_name, s.email AS supplier_email
            FROM raw_materials rm
            JOIN suppliers s ON rm.supplier_id = s.id
            WHERE rm.id = ?";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        $msg = "Prepare failed: " . $conn->error;
        error_log($msg);
        return ['success' => false, 'message' => $msg];
    }
    $stmt->bind_param('i', $materialId);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res ? $res->fetch_assoc() : null;
    $stmt->close();

    if (!$row || empty($row['supplier_email'])) {
        $msg = "No supplier email found for raw_materials.id={$materialId}";
        error_log($msg);
        return ['success' => false, 'message' => $msg];
    }

    $supplierName  = $row['supplier_name'];
    $supplierEmail = $row['supplier_email'];
    error_log("Email target: {$supplierName} <{$supplierEmail}>");

    // Build email contents
$status  = ($quantity <= 0) ? "Out of Stock" : "Low Stock";
$subject = "{$status} Alert - {$materialName}";
$body    = "Dear {$supplierName},\n\n"
         . "We would like to inform you that we are currently running {$status} on {$materialName}. "
         . "Please give me a call to confirm the order before proceeding with delivery, so we can discuss "
         . "the quantities needed, delivery schedule, and other important details.\n\n"
         . "Thank you for your prompt attention to this matter.\n\n"
         . "Best regards,\n"
         . "Pinana Gourmet";


    // Send via PHPMailer
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'pinyanagfp.scm@gmail.com';
        $mail->Password   = 'yuiq iriu khmi qden'; // App Password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        if ($debug) {
            $mail->SMTPDebug  = 2; // verbose
            $mail->Debugoutput = function($str, $level) {
                error_log("SMTP DEBUG [$level]: $str");
            };
        }

        $mail->setFrom('pinyanagfp.scm@gmail.com', 'Pinana Gourmet');
        $mail->addAddress($supplierEmail, $supplierName);

        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->isHTML(false);
        $mail->CharSet = 'UTF-8';

        $mail->send();
        $ok = "Email sent to {$supplierEmail} for material '{$materialName}' (Qty: {$quantity})";
        error_log($ok);
        return ['success' => true, 'message' => $ok];

    } catch (Exception $e) {
        $msg = "PHPMailer error: " . $e->getMessage();
        error_log($msg);
        return ['success' => false, 'message' => $msg];
    }
}
