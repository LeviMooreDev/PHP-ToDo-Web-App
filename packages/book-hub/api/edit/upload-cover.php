<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");
Database::connect();
$id = Database::escape($_POST["id"]);
Core::validateBookExists($id);
$file = validateFile();

if (Core::convertCoverImage($file["type"], $file["tmp_name"], $id) === true)
{
    if (file_exists(Core::coverFile100PathServer($id)))
    {
        $coverColor = CORE::getMainColor(Core::coverFile100PathServer($id));
        $coverColor = Database::escape($coverColor);
        Database::query("UPDATE `book-hub` SET `cover-color`='$coverColor' WHERE `id`=$id");

        Core::result("cover-color", $coverColor);
        Core::result("file", Core::coverFile100PathHTTP($id));
        Core::success("Upload successful");
    }
    else
    {
        Core::fail("Unable to convert file. Server side error #2");
    }
}
else
{
    Core::fail("Unable to convert file. Server side error #1");
}

function validateFile()
{
    if (isset($_FILES["file"]))
    {
        $allowTypes = array("jpg", "jpeg", "png", "gif", "bmp");
        $file = $_FILES["file"];
        $fileType = pathinfo(basename($file["name"]), PATHINFO_EXTENSION);
        $fileTypeLowerCase = strtolower($fileType);
        if (in_array($fileTypeLowerCase, $allowTypes))
        {
            if (is_array(getimagesize($file["tmp_name"])))
            {
                return $_FILES["file"];
            }
            else
            {
                Core::fail("File data does not match an image");
            }
        }
        else
        {
            Core::fail("File format $fileTypeLowerCase not supported");
        }
    }
    else
    {
        Core::fail("File data is missing");
    }
    return false;
}