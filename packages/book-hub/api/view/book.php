<?php
header('Content-Type: application/json');
include("../core.php");

Database::connect();
$id = Database::escape($_POST["id"]);
$result = Database::query("SELECT * FROM `book-hub` WHERE `id`=$id");
if ($result->num_rows === 1)
{
    $data = $result->fetch_assoc();
    if (file_exists(Core::coverFile50PathServer($id)))
    {
        $data["cover-20"] = Core::coverFile20PathHTTP($id);
        $data["cover-50"] = Core::coverFile50PathHTTP($id);
        $data["cover-100"] = Core::coverFile100PathHTTP($id);
    }
    else
    {
        $data["cover-20"] = Core::coverPlaceholderFilePathHTTP();
        $data["cover-50"] = Core::coverPlaceholderFilePathHTTP();
        $data["cover-100"] = Core::coverPlaceholderFilePathHTTP();
    }
    Core::result("data", $data);
    Core::success("");
}
else
{
    Core::fail("Unable to find book with id $id");
}