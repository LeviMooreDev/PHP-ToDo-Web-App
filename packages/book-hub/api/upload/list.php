<?php
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

$uploadFolder = Packages::serverPath("book-hub") . "/uploads/";
if (!file_exists($uploadFolder))
{
    mkdir($uploadFolder, 0777, true);
}

$files = array_diff(scandir($uploadFolder), array('..', '.'));
sort($files);
$return["result"]["success"] = true;
$return["result"]["files"] = $files;
$return["status"] = "OK";
exit(json_encode($return));