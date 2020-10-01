<?php
include("core.php");
Core::validatePostIsset("id");

Database::connect();
$id = Database::escape($_POST["id"]);
$result = Database::query("SELECT `title` FROM `book-hub` WHERE `id`=$id");
if ($result->num_rows === 1)
{
    $title = $result->fetch_assoc()["title"];
    header("Content-type: application/pdf");
    header("Content-Disposition: attachment; filename=$title.pdf");
    header("Content-Transfer-Encoding: binary");
    readfile(Core::bookFilePathServer($id));
}
else
{
    die("Unable to find book with id $id");
}