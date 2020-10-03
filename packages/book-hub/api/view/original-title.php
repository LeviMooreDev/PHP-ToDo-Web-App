<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");
$id = $_POST["id"];

if (file_exists(Core::originalFileNamePathServer($id)))
{
    $fileReader = fopen(Core::originalFileNamePathServer($id), "r");
    if ($fileReader !== false)
    {
        $title = fread($fileReader, filesize(Core::originalFileNamePathServer($id)));
        fclose($fileReader);

        Core::result("title", $title);
        Core::success("Successful");
    }
    else
    {
        Core::fail("Can't read original title file");
    }
}
else
{
    Core::fail("Can't find original title file");
}