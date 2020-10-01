<?php
header('Content-Type: application/json');
include("../core.php");

$count = sizeof($_FILES["files"]["name"]);
$allowTypes = array('pdf');
$uploaded = [];

//check if any files has been uploaded
if ($count != 0)
{
    //check if files are in a unsupported format
    for ($i = 0; $i < $count; $i++)
    {
        $fileType = pathinfo(basename($_FILES["files"]["name"][$i]), PATHINFO_EXTENSION);
        if (!in_array($fileType, $allowTypes))
        {
            Core::fail("File format $fileType not supported");
        }
    }

    $test = [];

    for ($i = 0; $i < $count; $i++)
    {
        $test[] = $i;
        $fileName = Helper::escapeFileName(basename($_FILES["files"]["name"][$i]));

        //if the file has not already been uploaded
        if (!file_exists(Core::uploadFilePath($fileName)))
        {
            if (move_uploaded_file($_FILES["files"]["tmp_name"][$i], Core::uploadFilePath($fileName)))
            {
                $uploaded[] = $fileName;
            }
            else
            {
                foreach ($uploaded as $file)
                {
                    Core::deleteFile(Core::uploadFilePath($file));
                }
                Core::fail("Unable to upload files. Server side error");
            }
        }
    }

    Core::result("uploaded", $uploaded);
    if (sizeof($uploaded) == 0)
    {
        Core::success("Files already uploaded");
    }
    else
    {
        Core::success("Upload successful!");
    }
}
else
{
    Core::fail("Files are missing");
}