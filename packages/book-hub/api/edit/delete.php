<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");

Database::connect();
$id = Database::escape($_POST["id"]);
Core::validateBookExists($id);

Database::query("DELETE FROM `$bookHubTable` WHERE `id`=$id");
Core::deleteBookFolder($id);
Core::success("Book deleted");