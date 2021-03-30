<?php
header('Content-Type: application/json');
include("../core.php");

if(isset($_FILES["files"]) == false || sizeof($_FILES["files"]["name"]) == 0)
{
    Core::fail("Files are missing");
}

if(Core::fileFormatSupported($_FILES["files"]["name"]) == false)
{
    Core::fail("File format $fileType not supported");
}

$id = $_POST["id"];
if(Core::uploadFiles($id, $_FILES) == false)
{
    Core::fail("Unable to upload files. Server side error");
}

Core::setPageTotalFromPdf($id);

Core::result("uploaded", $uploaded);
Core::success("Upload successful!");