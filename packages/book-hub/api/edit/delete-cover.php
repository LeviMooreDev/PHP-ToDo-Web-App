<?php
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

//authentication check
if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

//create upload folder
$booksFolder = Packages::serverPath("book-hub") . "/books/";

if (isset($_POST["id"]))
{
    Database::connect();
    $id = Database::escape($_POST["id"]);
    $sql = "SELECT `file` FROM `book-hub` WHERE `id`=$id";
    $result = Database::query($sql);
    if ($result->num_rows === 1)
    {
        $filePath = $booksFolder . $result->fetch_assoc()["file"] . ".jpg";
        if (file_exists($filePath))
        {
            chmod($filePath, 0777);
            unlink($filePath);
            $return["result"]["success"] = true;
            $return["result"]["message"] = "Cover removed";
        }
        else
        {
            $return["result"]["success"] = false;
            $return["result"]["message"] = "Cant find cover file.";
        }
    }
    else
    {
        $return["result"]["success"] = false;
        $return["result"]["message"] = "Unable to find book with id $id";
    }
}
else
{
    $return["result"]["success"] = false;
    $return["result"]["message"] = "Id data is missing";
}

$return["status"] = "OK";
exit(json_encode($return));