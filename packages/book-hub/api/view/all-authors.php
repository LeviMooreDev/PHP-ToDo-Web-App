<?php
header('Content-Type: application/json');
include("../core.php");

Database::connect();
$result = Database::query("SELECT `authors` FROM `$bookHubTable`");

$authors = [];
if ($result->num_rows > 0)
{
    while ($row = $result->fetch_assoc())
    {
        foreach (explode(",", $row["authors"]) as $value) {
            $value = ucwords(strtolower($value));
            $authors[] = $value;
        }
    }
}

$authors = array_filter($authors);
$authors = array_map('trim', $authors);
$authors = array_unique($authors);
$authors = array_values($authors);
sort($authors);

Core::result("authors", $authors);
Core::success("");