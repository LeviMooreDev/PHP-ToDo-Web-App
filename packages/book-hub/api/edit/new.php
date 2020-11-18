<?php
header('Content-Type: application/json');
include("../core.php");

Database::connect();

//name
Core::validatePostIsset("name");
$name = $_POST["name"];
$name = Database::escape($name);

//files
if(isset($_FILES["files"]) == false || sizeof($_FILES["files"]["name"]) == 0)
{
    Core::fail("Files are missing");
}
if(Core::fileFormatSupported($_FILES["files"]["name"]) == false)
{
    Core::fail("File format $fileType not supported");
}

//insert entry
$result = Database::queries("INSERT INTO `$bookHubTable` (`title`, `pages`) VALUES ('$name', 0); SELECT LAST_INSERT_ID();");

//get id
$id;
if ($result->field_count == 1 && $result->num_rows == 0)
{
    $row = $result->fetch_assoc();
    if (array_key_exists("LAST_INSERT_ID()", $row))
    {
        $id = $row["LAST_INSERT_ID()"];
    }
}

if (isset($id))
{
    if(Core::uploadFiles($id, $_FILES) == false)
    {
        removeEntry($id);
        Core::fail("Unable to upload files. Server error");
    }

    $fileWrite = fopen(Core::originalFileNamePathServer($id), "w");
    if ($fileWrite !== false)
    {
        fwrite($fileWrite, $name);
        fclose($fileWrite);
    }
    else
    {
        removeEntry($id);
        Core::fail("Cant add book. Database error #2");
    }

    Core::setPageTotalFromPdf($id);

    Core::result("id", $id);
    Core::success("Upload successful!");
}
else
{
    Core::fail("Cant add book. Database error #1");
}

function removeEntry($id)
{
    Database::query("DELETE FROM `$bookHubTable` WHERE `id`=$id");
}