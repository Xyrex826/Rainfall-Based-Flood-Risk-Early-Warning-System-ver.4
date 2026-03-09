<?php

require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$sql = "UPDATE barangays
SET name=?, lat=?, lon=?, elev=?, low_land=?
WHERE id=?";

$stmt = $conn->prepare($sql);

$stmt->bind_param(
"ssssis",
$data["name"],
$data["lat"],
$data["lon"],
$data["elev"],
$data["low_land"],
$data["id"]
);

if($stmt->execute()){
    echo json_encode(["success"=>true]);
}else{
    echo json_encode([
        "success"=>false,
        "error"=>$stmt->error
    ]);
}