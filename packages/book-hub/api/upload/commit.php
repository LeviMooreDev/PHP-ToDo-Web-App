<?php
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

if (isset($_POST["name"]))
{
    $uploadFolder = Packages::serverPath("book-hub") . "/uploads/";
    $booksFolder = Packages::serverPath("book-hub") . "/books/";
    $file = $_POST["name"];
    $file = Helper::escapeFileName($file);
    $fileName = pathinfo($file)['filename'];
    $fileType = pathinfo($file, PATHINFO_EXTENSION);
    $uploadFile = $uploadFolder . $file;

    if (!file_exists($booksFolder))
    {
        mkdir($booksFolder, 0777, true);
    }

    if (!empty($file))
    {
        if (file_exists($uploadFile))
        {
            $commitFile = "$booksFolder$fileName.$fileType";
            $postfix = 0;
            while (file_exists($commitFile))
            {
                $postfix = $postfix + 1;
                $commitFile = "$booksFolder$fileName $postfix.$fileType";
            }
            rename($uploadFile, $commitFile);
            $commitFileName = pathinfo($commitFile)['filename'];
            $commitFilePath = $commitFileName . ".$fileType";

            $id;
            $sql = "INSERT INTO `book-hub`(`title`, `file`) VALUES ('$commitFileName', '$commitFilePath'); SELECT LAST_INSERT_ID();";
            Database::connect();
            $result = Database::queries($sql);

            if ($result->field_count == 1 && $result->num_rows == 0)
            {
                $row = $result->fetch_assoc();
                if (array_key_exists("LAST_INSERT_ID()", $row))
                {
                    $id = $row["LAST_INSERT_ID()"];
                }
            }
            if (isset($id))
            {
                $return["result"]["success"] = true;
                $return["result"]["message"] = "Committed";
                $return["result"]["id"] = $id;
            }
            else
            {
                $return["result"]["success"] = false;
                $return["result"]["message"] = "Cant commit book. Database error.";
            }
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
        $return["result"]["message"] = "Name data empty";
    }
}
else
{
    $return["result"]["success"] = false;
    $return["result"]["message"] = "Name data is missing";
}

$return["status"] = "OK";
exit(json_encode($return));