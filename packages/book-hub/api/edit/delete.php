<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");

Database::connect();
$id = Database::escape($_POST["id"]);
Core::validateBookExists($id);

Database::query("DELETE FROM `book-hub` WHERE `id`=$id");
Core::deleteFile(Core::bookFilePathServer($id));
Core::deleteFile(Core::coverFilePathServer($id));
rmdir(Core::bookFolderPathServer($id));
Core::success("Book deleted");