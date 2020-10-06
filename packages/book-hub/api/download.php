<?php
include("core.php");
set_time_limit(300);

Core::validateGetIsset("id");

Database::connect();
$id = Database::escape($_GET["id"]);
$result = Database::query("SELECT `title` FROM `book-hub` WHERE `id`=$id");
if ($result->num_rows === 1)
{
    $title = $result->fetch_assoc()["title"];
    $filePath = Core::bookFilePathServer($id);

    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $title . '.pdf"');
    header('Pragma: public');
    header('Cache-Control: max-age=86400');
    header('Content-Length: ' . filesize($filePath));
    session_write_close();
    readfile($filePath);
    exit;
}
else
{
    die("Unable to find book with id $id");
}