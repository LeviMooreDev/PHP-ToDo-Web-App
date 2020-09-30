<?php
//https://www.googleapis.com/books/v1/volumes?langRestrict=en&maxResults=1&printType=BOOKS&q=12%20Rules%20for%20Life
//https://www.googleapis.com/books/v1/volumes?q=isbn:0345816021
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

if (isset($_POST["query"]))
{
    $query = $_POST["query"];
    if ((strlen($query) == 10 || strlen($query) == 13) && ctype_digit($query))
    {
        $googleUrl = "https://www.googleapis.com/books/v1/volumes?q=isbn:$query";
    }
    else
    {
        $lang = "en";
        $limit = 3;
        $googleUrl = "https://www.googleapis.com/books/v1/volumes?langRestrict=$lang&maxResults=$limit&printType=BOOKS&q=" . urlencode($query);
    }

    $googleAPIResult = json_decode(file_get_contents($googleUrl));

    $metadata = [];
    foreach ($googleAPIResult->items as $item)
    {
        $book = [];
        $book["title"] = $item->volumeInfo->title;
        $book["subtitle"] = $item->volumeInfo->subtitle;
        $book["categories"] = $item->volumeInfo->categories;
        if ($book["categories"] !== null)
        {
            $book["categories"] = implode(", ", $item->volumeInfo->categories);
        }
        $book["description"] = $item->volumeInfo->description;
        $book["authors"] = $item->volumeInfo->authors;
        if ($book["authors"] !== null)
        {
            $book["authors"] = implode(", ", $item->volumeInfo->authors);
        }
        $book["publisher"] = $item->volumeInfo->publisher;
        $book["date"] = $item->volumeInfo->publishedDate;
        $book["isbn13"] = null;
        $book["isbn10"] = null;
        if(isset($item->volumeInfo->industryIdentifiers))
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
        $metadata[] = $book;
    }

    $return["result"]["success"] = true;
    $return["result"]["message"] = "Search successful";
    $return["result"]["metadata"] = $metadata;
}
else
{
    $return["result"]["success"] = false;
    $return["result"]["message"] = "Query data is missing";
}

$return["status"] = "OK";
exit(json_encode($return));