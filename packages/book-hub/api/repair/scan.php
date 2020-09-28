<?php
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

$return["result"]["missing-file"] = [];
$return["result"]["missing-database-entry"] = [];

$booksFolder = Packages::serverPath("book-hub") . "/books/";

$sql = "SELECT `id`,`file` FROM `book-hub`";
Database::connect();
$result = Database::query($sql);
$databaseBookFiles = [];
if ($result->num_rows > 0)
{
    while ($book = $result->fetch_assoc())
    {
        $bookFilePath = $booksFolder . $book["file"];
        if (!file_exists($bookFilePath))
        {
            $return["result"]["missing-file"][] = $book;
        }
        else
        {
            $databaseBookFiles[] = $book["file"];
        }
    }
}

$files = array_diff(scandir($booksFolder), array('..', '.'));
foreach ($files as $file)
{
    if (!in_array($file, $databaseBookFiles))
    {
        $fileName = pathinfo($file)['filename'];
        $return["result"]["missing-database-entry"][] = $file;
    }
}

sleep(1);

$return["status"] = "OK";
exit(json_encode($return));