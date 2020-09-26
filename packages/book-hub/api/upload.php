<?php
include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
//Authentication::Auth403();
}

$targetFolder = Packages::serverPath("book-hub") . "/uploads/";
if (!file_exists($targetFolder))
{
    mkdir($targetFolder, 0777, true);
}

// Upload file 
$uploadedFile = '';
if (!empty($_FILES["file"]))
{
    // File path config 
    $fileName = basename($_FILES["file"]["name"]);
    $targetFilePath = $targetFolder . $fileName;
    $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);

    if (!file_exists($targetFilePath))
    {
        $allowTypes = array('pdf');
        if (in_array($fileType, $allowTypes))
        {
            // Upload file to the server 
            if (move_uploaded_file($_FILES["file"]["tmp_name"], $targetFilePath))
            {
                $return["result"]["success"] = true;
                //$return["result"]["message"] = $targetFilePath;
            }
            else
            {
                $return["result"]["success"] = false;
                $return["result"]["message"] = "Unable to upload file. Server side error.";
            }
        }
        else
        {
            $return["result"]["success"] = false;
            $return["result"]["message"] = "File format not supported.";
        }
    }
    else
    {
        $return["result"]["success"] = false;
        $return["result"]["message"] = "File already uploaded";
    }
}
else
{
    $return["result"]["success"] = false;
    $return["result"]["message"] = "File is missing.";
}

$return["status"] = "OK";
exit(json_encode($return));