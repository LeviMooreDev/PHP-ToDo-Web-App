<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");
Database::connect();
$id = Database::escape($_POST["id"]);
Core::validateBookExists($id);

$files["pdf"] = file_exists(Core::pdfFilePathServer($id));
$files["epub"] = file_exists(Core::epubFilePathServer($id));

Core::result("files", $files);
Core::success("Successful");