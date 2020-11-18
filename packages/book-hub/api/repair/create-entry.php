<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("folder");
Database::connect();
$oldFolder = Database::escape($_POST["folder"]);

if (!file_exists(Core::bookFolderPathServer($oldFolder)))
{
    Core::fail("Can't find folder $oldFolder");
}
if (!file_exists(Core::pdfFilePathServer($oldFolder)))
{
    Core::fail("Can't find book in folder $oldFolder");
}

$result = Database::query("SELECT * FROM `$bookHubTable` WHERE `id`='$oldFolder'");
if ($result->num_rows !== 0)
{
    Core::fail("Database entry using folder $oldFolder already exists");
}

$title = "Unknown";
if (file_exists(Core::originalFileNamePathServer($oldFolder)))
{
    $fileReader = fopen(Core::originalFileNamePathServer($oldFolder), "r");
    if ($fileReader !== false)
    {
        $title = fread($fileReader, filesize(Core::originalFileNamePathServer($oldFolder)));
        fclose($fileReader);
    }
}

$id;
$result = Database::queries("INSERT INTO `$bookHubTable`(`title`) VALUES ('$title'); SELECT LAST_INSERT_ID();");
if ($result->field_count == 1 && $result->num_rows == 0)
{
    $row = $result->fetch_assoc();
    if (array_key_exists("LAST_INSERT_ID()", $row))
    {
        $id = $row["LAST_INSERT_ID()"];
    }
}

if (!isset($id))
{
    Core::fail("Can't create entry. Server side error.");
}

rename(Core::bookFolderPathServer($oldFolder), Core::bookFolderPathServer($id));
$fileWrite = fopen(Core::originalFileNamePathServer($id), "w");
if ($fileWrite !== false)
{
    fwrite($fileWrite, $title);
    fclose($fileWrite);
}

Core::success("Fix successful");