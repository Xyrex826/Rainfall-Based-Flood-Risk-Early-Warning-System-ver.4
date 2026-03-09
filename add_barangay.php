<?php

require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$sql = "INSERT INTO barangays (id,name,lat,lon,elev,low_land)
VALUES (?,?,?,?,?,?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssi",
$data["id"],
$data["name"],
$data["lat"],
$data["lon"],
$data["elev"],
$data["low_land"]
);

$stmt->execute();

echo json_encode(["success"=>true]);