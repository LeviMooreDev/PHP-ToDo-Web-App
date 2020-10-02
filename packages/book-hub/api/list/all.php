<?php
header('Content-Type: application/json');
include("../core.php");

Database::connect();
$result = Database::query("SELECT `id`,`title`,`subtitle`,`categories`,`authors`,`date` FROM `book-hub`");

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