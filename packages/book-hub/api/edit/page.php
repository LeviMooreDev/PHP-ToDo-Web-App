<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");
Core::validatePostIsset("page");
Database::connect();
$id = Database::escape($_POST["id"]);
$page = Database::escape($_POST["page"]);
Core::validateBookExists($id);

Database::query("UPDATE `book-hub` SET `page`=$page WHERE `id`=$id");

Core::success("Successful");