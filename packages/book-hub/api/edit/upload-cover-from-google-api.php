<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");
Core::validatePostIsset("url");

Database::connect();
$id = Database::escape($_POST["id"]);
Core::validateBookExists($id);

$image = file_get_contents($_POST["url"]);
file_put_contents(Core::coverFilePathServer($id), $image);

if (file_exists(Core::coverFilePathServer($id)))
{
    if (is_array(getimagesize(Core::coverFilePathServer($id))))
    {
        Database::query("UPDATE `book-hub` SET `update_timestamp`=CURRENT_TIMESTAMP() WHERE `id`=$id");
        Core::result("file", Core::coverFilePathHTTP($id));
        Core::success("Upload successful");
    }
    else
    {
        Core::deleteFile(Core::coverFilePathServer($id));
        Core::fail("Unable to upload cover. Server side error #2");
    }
}
else
{
    Core::fail("Unable to upload cover. Server side error #1");
}