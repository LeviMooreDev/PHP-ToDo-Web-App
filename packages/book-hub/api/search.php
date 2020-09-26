<?php
//https://www.googleapis.com/books/v1/volumes?langRestrict=en&maxResults=1&printType=BOOKS&q=12%20Rules%20for%20Life
//https://www.googleapis.com/books/v1/volumes?q=isbn:0345816021

header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

//Authentication::Auth403();

$lang = "en";
$limit = 1;
$query = "12 rules for life";
$url = "https://www.googleapis.com/books/v1/volumes?langRestrict=$lang&maxResults=$limit&printType=BOOKS&q=" . urlencode($query);
$googleAPIResult = json_decode(file_get_contents("http://books.levimoore.dk/test.json"));

$result = [];
foreach($googleAPIResult->items as $item)
{
    $book = [];
    $book["title"] = $item->volumeInfo->title;
    $book["subtitle"] = $item->volumeInfo->subtitle;
    $book["categories"] = $item->volumeInfo->categories;
    $book["description"] = $item->volumeInfo->description;
    $book["authors"] = $item->volumeInfo->authors;
    $book["publisher"] = $item->volumeInfo->publisher;
    $book["date"] = $item->volumeInfo->publishedDate;
    $book["identifiers"] = $item->volumeInfo->industryIdentifiers;
    $book["thumbnail"] = $item->volumeInfo->imageLinks->thumbnail;
    $book["language"] = $item->volumeInfo->language;
    $book["store-link"] = $item->volumeInfo->infoLink;
    $result[] = $book;
}

$return["result"] = $result;
$return["status"] = "OK";
exit(json_encode($return));
