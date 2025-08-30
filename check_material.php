<?php
require_once 'config.php';

header('Content-Type: application/json');

if (isset($_GET['name'])) {
    $materialName = trim($_GET['name']);
    
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM raw_materials WHERE name = ?");
    $stmt->bind_param("s", $materialName);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    echo json_encode([
        'exists' => $row['count'] > 0
    ]);
} else {
    echo json_encode([
        'error' => 'No material name provided'
    ]);
}
?>