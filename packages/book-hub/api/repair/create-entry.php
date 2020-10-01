<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");
Core::validatePostIsset("title");
Database::connect();
$oldId = Database::escape($_POST["id"]);
$title = Database::escape($_POST["title"]);

if (!file_exists(Core::bookFolderPathServer($oldId)))
{
    Core::fail("Can't find folder for id $id");
}
if (!file_exists(Core::bookFilePathServer($oldId)))
{
    Core::fail("Can't find book for id $id");
}

$result = Database::query("SELECT * FROM `book-hub` WHERE `id`='$oldId'");
if ($result->num_rows !== 0)
{
    Core::fail("Database entry with id $oldId already exists");
}

$newId;
$result = Database::queries("INSERT INTO `book-hub`(`title`) VALUES ('$title'); SELECT LAST_INSERT_ID();");
if ($result->field_count == 1 && $result->num_rows == 0)
{
    $row = $result->fetch_assoc();
    if (array_key_exists("LAST_INSERT_ID()", $row))
    {
        $newId = $row["LAST_INSERT_ID()"];
    }
}

if (!isset($newId))
{
    Core::fail("Can't create entry. Server side error.");
}

rename(Core::bookFolderPathServer($oldId), Core::bookFolderPathServer($newId));
Core::success("Fix successful");