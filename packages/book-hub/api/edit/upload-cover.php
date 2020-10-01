<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");
Database::connect();
$id = Database::escape($_POST["id"]);
Core::validateBookExists($id);
$file = validateFile();

if (convertImage($file["type"], $file["tmp_name"], Core::coverFilePathServer($id)) === true)
{
    if (file_exists(Core::coverFilePathServer($id)))
    {
        Database::query("UPDATE `book-hub` SET `update_timestamp`=CURRENT_TIMESTAMP() WHERE `id`=$id");
        Core::result("file", Core::coverFilePathHTTP($id));
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

//https://stackoverflow.com/questions/14549446/how-can-i-convert-all-images-to-jpg
//Davide Berra
function convertImage($originalType, $originalImage, $outputImage)
{
    if ($originalType == "image/jpeg" || $originalType == "image/jpg")
    {
        $imageTmp = imagecreatefromjpeg($originalImage);
    }
    else if ($originalType == "image/png")
    {
        $imageTmp = imagecreatefrompng($originalImage);
    }
    else if ($originalType == "image/gif")
    {
        $imageTmp = imagecreatefromgif($originalImage);
    }
    else if ($originalType == "image/bmp")
    {
        $imageTmp = imagecreatefrombmp($originalImage);
    }
    else
    {
        return false;
    }

    imagejpeg($imageTmp, $outputImage, 100);
    imagedestroy($imageTmp);

    return true;
}

function validateFile()
{
    if (isset($_FILES["file"]))
    {
        $allowTypes = array("jpg", "jpeg", "png", "gif", "bmp");
        $file = $_FILES["file"];
        $fileType = pathinfo(basename($file["name"]), PATHINFO_EXTENSION);
        if (in_array($fileType, $allowTypes))
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
            Core::fail("File format $fileType not supported");
        }
    }
    else
    {
        Core::fail("File data is missing");
    }
    return false;
}