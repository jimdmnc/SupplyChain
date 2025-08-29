<?php
require 'config.php';

// Check if materials have supplier_id
$sql = "SELECT rm.id, rm.name, rm.quantity, rm.supplier_id, s.name as supplier_name, s.email 
        FROM raw_materials rm 
        LEFT JOIN suppliers s ON rm.supplier_id = s.id 
        WHERE rm.quantity <= 10 
        LIMIT 5";

$result = mysqli_query($conn, $sql);

echo "<h3>Low Stock Materials and Their Suppliers:</h3>";
while ($row = mysqli_fetch_assoc($result)) {
    echo "<p>";
    echo "Material: " . $row['name'] . " (Qty: " . $row['quantity'] . ")<br>";
    echo "Supplier ID: " . ($row['supplier_id'] ?? 'NULL') . "<br>";
    echo "Supplier Name: " . ($row['supplier_name'] ?? 'No supplier assigned') . "<br>";
    echo "Supplier Email: " . ($row['email'] ?? 'No email') . "<br>";
    echo "</p><hr>";
}
?>