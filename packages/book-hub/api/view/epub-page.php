<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");
Database::connect();
$id = Database::escape($_POST["id"]);
Core::validateBookExists($id);

$result = Database::query("SELECT `epub-page` FROM `$bookHubTable` WHERE `id`=$id");
$status = $result->fetch_assoc()["epub-page"];

Core::result("page", $status);
Core::success("Successful");