<?php

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

//authentication check
if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

//create upload folder
$targetFolder = Packages::serverPath("book-hub") . "/uploads/";
if (!file_exists($targetFolder))
{
    mkdir($targetFolder, 0777, true);
}

$count = sizeof($_FILES["files"]["name"]);
$allowTypes = array('pdf');
$uploaded = [];

//check if any files has been uploaded
if ($count != 0)
{
    //check if files are in a unsupported format
    $stop = false;
    for ($i = 0; $i < $count && !$stop; $i++)
    {
        $fileType = pathinfo(basename($_FILES["files"]["name"][$i]), PATHINFO_EXTENSION);
        if (!in_array($fileType, $allowTypes))
        {
            $return["result"]["success"] = false;
            $return["result"]["message"] = "File format $fileType not supported.";
            $stop = true;
        }
    }

    //if all files are in correct format
    if (!$stop)
    {
        //default result is success 
        $return["result"]["success"] = true;
        $return["result"]["message"] = "Upload successful!";
        
        //loop files
        $stop = false;
        for ($i = 0; $i < $count && !$stop; $i++)
        {
            //file path 
            $fileName = basename($_FILES["files"]["name"][$i]);
            $fileName = Helper::escapeFileName($fileName);
            $targetFilePath = $targetFolder . $fileName;

            //if the file has not already been uploaded
            if (!file_exists($targetFilePath))
            {
                //move from tmp to upload folder 
                if (move_uploaded_file($_FILES["files"]["tmp_name"][$i], $targetFilePath))
                {
                    $uploaded[] = $fileName;
                }
                //if something went wrong mark as unsuccessful and stop the loop
                else
                {
                    $return["result"]["success"] = false;
                    $return["result"]["message"] = "Unable to upload files. Server side error.";
                    $stop = true;
                }
            }
        }

        //if successful
        if ($return["result"]["success"] === true)
        {
            //return what files was uploaded
            $return["result"]["uploaded"] = $uploaded;
            //check if no files were uploaded (all already existed)
            if (sizeof($uploaded) == 0)
            {
                $return["result"]["message"] = "Files already uploaded.";
            }
        }
        //if unsuccessful remove all files that were uploaded before the error happened
        else
        {
            foreach ($uploaded as $file)
            {
                $targetFilePath = $targetFolder . $file;
                if (file_exists($targetFilePath))
                {
                    chmod($targetFilePath, 0777);
                    unlink($targetFilePath);
                }
            }
        }
    }
}
else
{
    $return["result"]["success"] = false;
    $return["result"]["message"] = "Files are missing.";
}

$return["status"] = "OK";
exit(json_encode($return));