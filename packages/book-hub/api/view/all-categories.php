<?php
header('Content-Type: application/json');
include("../core.php");

Database::connect();
$result = Database::query("SELECT `categories` FROM `book-hub`");

$categories = [];
if ($result->num_rows > 0)
{
    while ($row = $result->fetch_assoc())
    {
        foreach (explode(",", $row["categories"]) as $value) {
            $value = ucwords(strtolower($value));
            $categories[] = $value;
        }
    }
}

$categories = array_filter($categories);
$categories = array_map('trim', $categories);
$categories = array_unique($categories);
$categories = array_values($categories);
sort($categories);

Core::result("categories", $categories);
Core::success("");