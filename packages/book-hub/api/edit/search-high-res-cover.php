<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("query");
$query = $_POST["query"];

$queryUrlSafe = urlencode($query);
$apiResult = json_decode(file_get_contents("http://openlibrary.org/search.json?q=$queryUrlSafe&limit=5"));
$covers = [];

if (isset($apiResult) && isset($apiResult->docs))
{
    if (count($apiResult->docs) > 0)
    {
        foreach ($apiResult->docs as $item)
        {
            if (isset($item->cover_i))
            {
                $id = $item->cover_i;
                $url = "http://covers.openlibrary.org/b/id/$id-L.jpg";
                $covers[] = $url;
            }
        }
        Core::result("covers", $covers);
        Core::success("Search successful");
    }
}
Core::result("covers", []);
Core::fail("Can't find any covers");