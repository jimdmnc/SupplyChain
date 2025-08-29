<?php
// syncSanity.php

ini_set('display_errors', 1);
error_reporting(E_ALL);

// === CONFIG ===
$sanityProjectId = '29vxjvjm';
$sanityDataset = 'production';
$sanityToken = 'skFSThqjCPcFJ1glaIVKeoZfoZ8uJC4Po9fODAJPbm4qXrooQVmpamen279JFVOcZCjlH3vMwgGhwWbsUrexQgAdJQfkF3ZCeYbcTPDeNClBFZy9WM3GzWA6ONyKyzV1v87R5kC5d6PtvnonKtRhjYAoaKbqnTjXkXrHCeF1hSvZjgw1h6xH'; // ⚠️ Move to ENV in production

// === MYSQL CONNECTION ===
include("db_connection.php");

if ($conn->connect_error) {
  error_log("❌ MySQL connection failed: " . $conn->connect_error);
  exit("MySQL connection error.");
}

// === FETCH PRODUCTS FROM MYSQL ===
$sql = "SELECT product_name, price, stocks FROM products";
$result = $conn->query($sql);

if (!$result) {
  error_log("❌ MySQL query failed: " . $conn->error);
  exit("MySQL query error.");
}

$mysqlProducts = [];
while ($row = $result->fetch_assoc()) {
  $mysqlProducts[$row['product_name']] = [
    "name" => $row['product_name'],
    "price" => (float)$row['price'],
    "stock" => (int)$row['stocks'],
  ];
}

$conn->close();

// === FETCH ALL PRODUCTS FROM SANITY ===
$query = urlencode("*[_type == 'product']{_id, slug, stock}");
$url = "https://$sanityProjectId.api.sanity.io/v2023-01-01/data/query/$sanityDataset?query=$query";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $sanityToken"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);

if ($result === false) {
  error_log("❌ cURL error fetching Sanity products: " . curl_error($ch));
  exit("Sanity query error.");
}
curl_close($ch);

$sanityProducts = [];
$data = json_decode($result, true);

if (isset($data['result'])) {
  foreach ($data['result'] as $doc) {
    if (isset($doc['slug']['current'])) {
      $sanityProducts[$doc['slug']['current']] = [
        "id" => $doc['_id'],
        "stock" => $doc['stock'] ?? 0
      ];
    }
  }
} else {
  error_log("❌ Failed to fetch products from Sanity");
  exit("Sanity fetch error.");
}

// === Helper: Generate Slug from Product Name ===
function generateSlug($string) {
  $slug = iconv('UTF-8', 'ASCII//TRANSLIT', $string); // remove accents
  $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $slug)));
  return $slug;
}

// === SYNC LOGIC ===
foreach ($mysqlProducts as $productName => $product) {
  $slug = generateSlug($productName);

  if (isset($sanityProducts[$slug])) {
    // ✅ Exists in both -> Update stock if different
    $id = $sanityProducts[$slug]['id'];
    if ($sanityProducts[$slug]['stock'] !== $product['stock']) {
      $patchUrl = "https://$sanityProjectId.api.sanity.io/v2023-01-01/data/mutate/$sanityDataset";
      $payload = json_encode([
        "mutations" => [[
          "patch" => [
            "id" => $id,
            "set" => ["stock" => $product['stock']]
          ]
        ]]
      ]);

      $ch = curl_init($patchUrl);
      curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $sanityToken",
        "Content-Type: application/json"
      ]);
      curl_setopt($ch, CURLOPT_POST, true);
      curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      $patchResult = curl_exec($ch);
      curl_close($ch);

      error_log("✅ Updated '$slug' stock to {$product['stock']}");
    } else {
      error_log("ℹ️ No change needed for '$slug'");
    }
  } else {
    // 🚀 Exists in MySQL but not Sanity -> Create with defaults
    $createUrl = "https://$sanityProjectId.api.sanity.io/v2023-01-01/data/mutate/$sanityDataset";

    $payload = [
  "mutations" => [[
    "create" => [
      "_type" => "product",
      "name" => $product['name'],
      "slug" => ["_type" => "slug", "current" => $slug],
      "price" => $product['price'],
      "stock" => $product['stock'],
      "description" => "lorem ipsum",
      "discount" => 0,
      "status" => "new",
      "variant" => "others",
      "isFeatured" => false,
      "categories" => [],
      "images" => [[
        "_type" => "image",
        "_key" => uniqid(), // 👈 generate a unique key for this array item
        "asset" => [
          "_type" => "reference",
          "_ref" => "image-e145fb849c91ffb0ab64c94d98e0997eeb937070-720x720-png"
        ]
      ]]
    ]
  ]]
];



    $ch = curl_init($createUrl);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
      "Authorization: Bearer $sanityToken",
      "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $createResult = curl_exec($ch);
    curl_close($ch);

    error_log("➕ Created Sanity product '{$product['name']}' (slug: '$slug')");
  }
}

// === CHECK FOR SANITY PRODUCTS NOT IN MYSQL ===
foreach ($sanityProducts as $slug => $info) {
  // You could archive here if needed
  error_log("⚠️ Sanity product '$slug' has no match in MySQL (consider archiving/deleting)");
}

echo "Sync complete.\n";
?>
