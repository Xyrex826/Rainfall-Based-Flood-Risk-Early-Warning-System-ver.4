<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$API_KEY = $_ENV['API_KEY'];

$lat = $_GET['lat'] ?? null;
$lon = $_GET['lon'] ?? null;

if (!$lat || !$lon) {
    http_response_code(400);
    echo json_encode(["error" => "lat and lon required"]);
    exit;
}

$url = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&appid={$API_KEY}&units=metric";

$response = file_get_contents($url);
$data = json_decode($response, true);

$result = [];

foreach ($data['list'] as $forecast) {

    $result[] = [
        "time" => $forecast['dt_txt'],
        "temperature" => $forecast['main']['temp'],
        "humidity" => $forecast['main']['humidity'],
        "rainfall_mm" => $forecast['rain']['3h'] ?? 0,
        "weather" => $forecast['weather'][0]['description']
    ];
}

echo json_encode($result);