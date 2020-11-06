<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("id");
$id = $_POST["id"];

Core::validatePostIsset("type");
$type = Helper::escapeFileName($_POST["type"]);

$allowTypes = array('pdf','epub');
for ($i = 0; $i < $count; $i++)
{
    if (!in_array($type, $allowTypes))
    {
        Core::fail("File format $type not supported");
    }
}

$filePath = Core::bookFolderPathServer($id) . "book." . $type;
if (file_exists($filePath))
{
    Core::deleteFile($filePath);
    Core::success("File removed");
}
else
{
    Core::fail("Can't find file");
}