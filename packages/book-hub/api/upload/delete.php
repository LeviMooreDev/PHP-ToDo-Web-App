<?php
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

$uploadFolder = Packages::serverPath("book-hub") . "/uploads/";

if (isset($_POST["name"]))
{
    $fileName = $_POST["name"];
    $fileName = Helper::escapeFileName($fileName);
    $finalPath = $uploadFolder . $fileName;

    if (file_exists($finalPath))
    {
        chmod($finalPath, 0777);
        unlink($finalPath);
        $return["result"]["success"] = true;
        $return["result"]["message"] = "File removed";
    }
    else
    {
        $return["result"]["success"] = false;
        $return["result"]["message"] = "Cant find file";
    }
}
else
{
    $return["result"]["success"] = false;
    $return["result"]["message"] = "Name data is missing";
}

$return["status"] = "OK";
exit(json_encode($return));