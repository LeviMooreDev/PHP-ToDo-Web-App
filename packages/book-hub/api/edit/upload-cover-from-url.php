<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");
Core::validatePostIsset("url");

Database::connect();
$id = Database::escape($_POST["id"]);
Core::validateBookExists($id);

$image = file_get_contents($_POST["url"]);
file_put_contents(Core::coverFileTmpPathServer($id), $image);

if (file_exists(Core::coverFileTmpPathServer($id)))
{
    if (is_array(getimagesize(Core::coverFileTmpPathServer($id))))
    {
        if (Core::convertCoverImage("image/jpeg", Core::coverFileTmpPathServer($id), $id) === true)
        {
            Core::deleteFile(Core::coverFileTmpPathServer($id));
            
            $coverColor = CORE::getMainColor(Core::coverFile100PathServer($id));
            $coverColor = Database::escape($coverColor);
            Database::query("UPDATE `$bookHubTable` SET `cover-color`='$coverColor' WHERE `id`=$id");
    
            Core::result("cover-color", $coverColor);
            Core::result("file", Core::coverFile100PathHTTP($id));
            Core::success("Upload successful");
        }
        else
        {
            Core::deleteFile(Core::coverFile100PathServer($id));
            Core::fail("Unable to upload cover. Server side error #3");
        }
    }
    else
    {
        Core::deleteFile(Core::coverFile100PathServer($id));
        Core::fail("Unable to upload cover. Server side error #2");
    }
}
else
{
    Core::fail("Unable to upload cover. Server side error #1");
}