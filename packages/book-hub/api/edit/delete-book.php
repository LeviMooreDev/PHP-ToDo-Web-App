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
    $result = Database::query("SELECT `file` FROM `book-hub` WHERE `id`=$id");
    if ($result->num_rows === 1)
    {
        $fileName = $result->fetch_assoc()["file"];
        $bookFile = $booksFolder . $fileName;
        $coverFile = $booksFolder . $fileName . ".jpg";

        Database::query("DELETE FROM `book-hub` WHERE `id`=$id");

        if (file_exists($bookFile))
        {
            chmod($bookFile, 0777);
            unlink($bookFile);
        }
        if (file_exists($coverFile))
        {
            chmod($coverFile, 0777);
            unlink($coverFile);
        }
        $return["result"]["success"] = true;
        $return["result"]["message"] = "Book deleted";
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