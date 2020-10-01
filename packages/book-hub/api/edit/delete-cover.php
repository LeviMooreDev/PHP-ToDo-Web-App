<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");

Database::connect();
$id = Database::escape($_POST["id"]);
Core::validateBookExists($id);

if (file_exists(Core::coverFilePathServer($id)))
{
    Database::query("UPDATE `book-hub` SET `update_timestamp`=CURRENT_TIMESTAMP() WHERE `id`=$id");
    Core::deleteFile(Core::coverFilePathServer($id));
    Core::success("Cover removed");
}
else
{
    Core::fail("Cant find cover file.");
}