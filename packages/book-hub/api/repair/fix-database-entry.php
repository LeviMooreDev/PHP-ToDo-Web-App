<?php
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();
Database::connect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

if (isset($_POST["file"]))
{
    $booksFolder = Packages::serverPath("book-hub") . "/books/";
    $file = Database::escape($_POST["file"]);
    $fileName = Database::escape(pathinfo($file)['filename']);
    if (file_exists($booksFolder . $file))
    {
        $result = Database::query("SELECT * FROM `book-hub` WHERE `file`='$file'");
        if ($result->num_rows === 0)
        {
            $sql = "INSERT INTO `book-hub`(`title`, `file`) VALUES ('$fileName', '$file');";
            Database::query($sql);

            $return["result"]["success"] = true;
            $return["result"]["message"] = "Fix successful";
        }
        else
        {
            $return["result"]["success"] = false;
            $return["result"]["message"] = "Entry for file already exists";
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
    $return["result"]["message"] = "File data is missing";
}

$return["status"] = "OK";
exit(json_encode($return));