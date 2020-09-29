<?php
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

if (isset($_POST["id"]))
{
    $booksFolder = Packages::serverPath("book-hub") . "/books/";

    Database::connect();
    $id = Database::escape($_POST["id"]);
    $sql = "SELECT * FROM `book-hub` WHERE `id`=$id";
    $result = Database::query($sql);
    if ($result->num_rows === 1)
    {
        $return["result"]["metadata"] = $result->fetch_assoc();
        $coverFileServer = Packages::serverPath("book-hub") . "/books/" . $return["result"]["metadata"]["file"] . ".jpg";
        if (file_exists($coverFileServer))
        {
            $return["result"]["metadata"]["cover"] = Packages::httpPath("book-hub") . "/books/" . $return["result"]["metadata"]["file"] . ".jpg";
        }
        else
        {
            $return["result"]["metadata"]["cover"] = Packages::httpPath("book-hub") . "/cover-placeholder.png";
        }
        $return["result"]["success"] = true;
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