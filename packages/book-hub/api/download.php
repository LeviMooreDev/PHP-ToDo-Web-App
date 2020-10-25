<?php
include("core.php");
set_time_limit(300);

Core::validateGetIsset("id");
Core::validateGetIsset("format");
Database::connect();
$id = Database::escape($_GET["id"]);

$format = $_GET["format"];

$result = Database::query("SELECT `title` FROM `book-hub` WHERE `id`=$id");
if ($result->num_rows === 1)
{
    $filename = $result->fetch_assoc()["title"];

    if ($format == "pdf")
    {
        $filePath = Core::pdfFilePathServer($id);
        $filename = $filename . ".pdf";
    }
    else if ($format == "epub")
    {
        $filePath = Core::epubFilePathServer($id);
        $filename = $filename . ".epub";
    }
    else
    {
        exit("No file with format $format");
    }

    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
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