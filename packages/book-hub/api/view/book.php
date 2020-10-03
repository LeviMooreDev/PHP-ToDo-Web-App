<?php
header('Content-Type: application/json');
include("../core.php");

Database::connect();
$id = Database::escape($_POST["id"]);
$result = Database::query("SELECT * FROM `book-hub` WHERE `id`=$id");
if ($result->num_rows === 1)
{
    $data = $result->fetch_assoc();
    if (file_exists(Core::coverFilePathServer($id)))
    {
        $data["cover"] = Core::coverFilePathHTTP($id);
    }
    else
    {
        $data["cover"] = Core::coverPlaceholderFilePathHTTP();
    }
    Core::result("data", $data);
    Core::success("");
}
else
{
    Core::fail("Unable to find book with id $id");
}