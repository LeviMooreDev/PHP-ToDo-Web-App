<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");
Database::connect();
$id = Database::escape($_POST["id"]);

Database::query("DELETE FROM `book-hub` WHERE `id`=" . $id);
Core::deleteBookFolder($id);

Core::success("Fix successful");