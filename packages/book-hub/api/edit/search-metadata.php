<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("query");
Core::validatePostIsset("language");

$query = $_POST["query"];
$language = $_POST["language"];
if ((strlen($query) == 10 || strlen($query) == 13) && ctype_digit($query))
{
    $googleUrl = "https://www.googleapis.com/books/v1/volumes?q=isbn:$query";
}
else
{
    $limit = 5;
    $googleUrl = "https://www.googleapis.com/books/v1/volumes?langRestrict=$language&maxResults=$limit&printType=BOOKS&q=" . urlencode($query);
}

$googleAPIResult = json_decode(file_get_contents($googleUrl));

if ($googleAPIResult->totalItems > 0)
{
    foreach ($googleAPIResult->items as $item)
    {
        $book = [];
        $book["title"] = $item->volumeInfo->title;
        $book["subtitle"] = $item->volumeInfo->subtitle;
        $book["authors"] = $item->volumeInfo->authors;
        $book["publisher"] = $item->volumeInfo->publisher;
        $book["date"] = $item->volumeInfo->publishedDate;

        $book["categories"] = $item->volumeInfo->categories;
        $book["description"] = $item->volumeInfo->description;
        if ($book["categories"] !== null)
        {
            $book["categories"] = implode(", ", $item->volumeInfo->categories);
        }
        if ($book["authors"] !== null)
        {
            $book["authors"] = implode(", ", $item->volumeInfo->authors);
        }

        $book["isbn13"] = null;
        $book["isbn10"] = null;
        if (isset($item->volumeInfo->industryIdentifiers))
        {
            foreach ($item->volumeInfo->industryIdentifiers as $industryIdentifier)
            {
                if ($industryIdentifier->type == "ISBN_13")
                {
                    $book["isbn13"] = $industryIdentifier->identifier;
                }
                if ($industryIdentifier->type == "ISBN_10")
                {
                    $book["isbn10"] = $industryIdentifier->identifier;
                }
            }
        }

        $book["cover"] = $item->volumeInfo->imageLinks->thumbnail;
        
        $books[] = $book;
    }
    Core::result("books", $books);
    Core::success("Search successful");
}
else
{
    Core::result("books", []);
    Core::fail("Can't find any books");
}