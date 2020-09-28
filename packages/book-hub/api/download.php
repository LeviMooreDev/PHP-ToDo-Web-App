<?php
include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

if (isset($_POST["id"]))
{
    Database::connect();
    $id = Database::escape($_POST["id"]);
    $sql = "SELECT `file` FROM `book-hub` WHERE `id`=$id";
    $result = Database::query($sql);
    if ($result->num_rows === 1)
    {
        $file = $result->fetch_assoc()["file"];
        header('Content-type: application/pdf');
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        header('Content-Transfer-Encoding: binary');
        readfile(Packages::serverPath("book-hub") . "/books/" . $file);
    }
    else
    {
        die("Unable to find book with id $id");
    }

}
else
{
    die("Id data is missing");
}