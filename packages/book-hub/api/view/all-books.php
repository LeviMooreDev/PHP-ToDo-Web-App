<?php
header('Content-Type: application/json');
include("../core.php");

Database::connect();
$result = Database::query("SELECT `id`, `title`, `subtitle`, `categories`, `authors`, `publisher`, `date`, `page`, `status`, `isbn13`, `isbn10`, `cover-color`, `update_timestamp`, `created_timestamp` as added FROM `book-hub`");

$books = [];
if ($result->num_rows > 0)
{
    while ($row = $result->fetch_assoc())
    {
        if(file_exists(Core::coverFilePathServer($row["id"])))
        {
            $row["cover"] = Core::coverFilePathHTTP($row["id"]);
        }
        else{
            $row["cover"] = Core::coverPlaceholderFilePathHTTP();
        }
        $books[] = $row;
    }
}
Core::result("books", $books);
Core::success("");