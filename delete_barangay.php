<?php
// 1. Force error reporting to see what's wrong if it crashes again
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");

// 2. Clean any accidental output from config.php
ob_start();
require_once __DIR__ . "/config.php";
ob_end_clean(); 

if(!isset($conn)){
    echo json_encode(["success"=>false,"message"=>"Database connection missing"]);
    exit;
}

if(!isset($_GET['id']) || empty($_GET['id'])){
    // FIXED: Removed 'value:' which causes 500 errors on older PHP versions
    echo json_encode(["success"=>false,"message"=>"Barangay ID not provided"]);
    exit;
}

$id = trim($_GET['id']);

// 3. Prepare and Execute
$stmt = $conn->prepare("DELETE FROM barangays WHERE id = ?");
if(!$stmt){
    echo json_encode(["success"=>false,"message"=>"Prepare failed: ".$conn->error]);
    exit;
}

// Using "s" because your ID "camaman-an" is a string
$stmt->bind_param("s", $id);

if($stmt->execute()){
    echo json_encode(["success"=>true]);
} else {
    echo json_encode(["success"=>false,"error"=>$stmt->error]);
}

$stmt->close();
$conn->close();
?>