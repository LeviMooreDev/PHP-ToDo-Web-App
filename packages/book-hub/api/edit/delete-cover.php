<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");

Database::connect();
$id = Database::escape($_POST["id"]);
Core::validateBookExists($id);

if (file_exists(Core::coverFile100PathServer($id)))
{
    Database::query("UPDATE `book-hub` SET `update_timestamp`=CURRENT_TIMESTAMP() WHERE `id`=$id");
    Core::deleteFile(Core::coverFile20PathServer($id));
    Core::deleteFile(Core::coverFile50PathServer($id));
    Core::deleteFile(Core::coverFile100PathServer($id));
    Core::success("Cover removed");
}
else
{
    Core::fail("Cant find cover file.");
}