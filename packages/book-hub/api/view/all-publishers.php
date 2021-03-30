<?php
header('Content-Type: application/json');
include("../core.php");

Database::connect();
$result = Database::query("SELECT `publishers` FROM `$bookHubTable`");

$publishers = [];
if ($result->num_rows > 0)
{
    while ($row = $result->fetch_assoc())
    {
        foreach (explode(",", $row["publishers"]) as $value)
        {
            $value = ucwords(strtolower($value));
            $publishers[] = $value;
        }
    }
}

$publishers = array_filter($publishers);
$publishers = array_map('trim', $publishers);
$publishers = array_unique($publishers);
$publishers = array_values($publishers);
sort($publishers);

Core::result("publishers", $publishers);
Core::success("");