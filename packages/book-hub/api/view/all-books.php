<?php
header('Content-Type: application/json');
include("../core.php");

Database::connect();
$result = Database::query("SELECT `id`, `title`, `subtitle`, `categories`, `authors`, `publishers`, `date`, `page`, `pages`, `status`, `isbn13`, `isbn10`, `cover-color`, `update_timestamp`, `created_timestamp` as added FROM `book-hub`");

$books = [];
if ($result->num_rows > 0)
{
    while ($row = $result->fetch_assoc())
    {
        if (file_exists(Core::coverFile20PathServer($row["id"])))
        {
            $row["cover-20"] = Core::coverFile20PathHTTP($row["id"]);
            $row["cover-50"] = Core::coverFile50PathHTTP($row["id"]);
            $row["cover-100"] = Core::coverFile100PathHTTP($row["id"]);
        }
        else
        {
            $row["cover-20"] = Core::coverPlaceholderFilePathHTTP();
            $row["cover-50"] = Core::coverPlaceholderFilePathHTTP();
            $row["cover-100"] = Core::coverPlaceholderFilePathHTTP();
        }
        $books[] = $row;
    }
}
Core::result("books", $books);
Core::success("");