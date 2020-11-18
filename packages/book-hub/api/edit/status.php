<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");
Core::validatePostIsset("status");
Database::connect();
$id = Database::escape($_POST["id"]);
$status = Database::escape($_POST["status"]);
Core::validateBookExists($id);

Database::query("UPDATE `$bookHubTable` SET `status`='$status' WHERE `id`=$id");

Core::success("Successful");