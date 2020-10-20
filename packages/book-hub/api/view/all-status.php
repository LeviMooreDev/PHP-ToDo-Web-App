<?php
header('Content-Type: application/json');
include("../core.php");

Database::connect();
$result = Database::query("SHOW COLUMNS FROM `book-hub` WHERE Field = 'status'");
if ($result->num_rows > 0)
{
    while ($row = $result->fetch_assoc())
    {
        preg_match("/^enum\(\'(.*)\'\)$/", $row["Type"], $matches);
        $enum = explode("','", $matches[1]);
        Core::result("options", $enum);
        Core::success("");
    }
}
Core::fail("Server error #1");