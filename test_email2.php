<?php
require_once __DIR__ . '/PHPMailer/src/Exception.php';
require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'pinyanagfp.scm@gmail.com';
    $mail->Password = 'yuiq iriu khmi qden';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('pinyanagfp.scm@gmail.com', 'Pinana Gourmet');
    $mail->addAddress('your-test-email@gmail.com', 'Test User'); // Replace with your email

    $mail->Subject = 'Test Email - Low Stock System';
    $mail->Body = 'This is a test email to verify the email system is working.';
    $mail->send();

    echo "Test email sent successfully!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>