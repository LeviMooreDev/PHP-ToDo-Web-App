<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");
Database::connect();
$id = Database::escape($_POST["id"]);
Core::validateBookExists($id);

$result = Database::query("SELECT `status` FROM `$bookHubTable` WHERE `id`=$id");
$status = $result->fetch_assoc()["status"];

Core::result("status", $status);
Core::success("Successful");