<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("name");

$fileName = Helper::escapeFileName($_POST["name"]);
$filePath = Core::uploadFilePath($fileName);

if (file_exists($filePath))
{
    Core::deleteFile($filePath);
    Core::success("File removed");
}
else
{
    Core::fail("Can't find file");
}