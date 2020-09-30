<?php
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

Database::connect();

$dataIsValid = true;
$data = [];

//validate id
if (isset($_POST["id"]))
{
    $data["id"] = Database::escape($_POST["id"]);
}
else
{
    $return["result"]["success"] = false;
    $return["result"]["message"] = "ID data is missing";
    $dataIsValid = false;
}

//validate date
if ($dataIsValid === true)
{
    if (isset($_POST["date"]))
    {
        $date = Database::escape($_POST["date"]);
        $date = trim($date);
        if ($date == "")
        {
            $date = "null";
        }
        else
        {
            if (isRealDate($date))
            {
                $date = "'" . $date . "'";
            }
            else
            {
                $return["result"]["success"] = false;
                $return["result"]["message"] = "Cant understand date format";
                $dataIsValid = false;
            }
        }
        
        $data["date"] = $date;
    }
    else
    {
        $return["result"]["success"] = false;
        $return["result"]["message"] = "Date data is missing";
        $dataIsValid = false;
    }
}

//validate isbn
if ($dataIsValid === true)
{
    if (isset($_POST["isbn13"]))
    {
        $date = Database::escape($_POST["isbn13"]);
        $date = trim($date);
        if ($date == "")
        {
            $date = "null";
        }
        else
        {
            if (strlen($date) == 13)
            {
                $date = "'" . $date . "'";
            }
            else
            {
                $return["result"]["success"] = false;
                $return["result"]["message"] = "ISBN13 need to be 13 long";
                $dataIsValid = false;
            }
        }
        
        $data["isbn13"] = $date;
    }
    else
    {
        $return["result"]["success"] = false;
        $return["result"]["message"] = "ISBN 13 data is missing";
        $dataIsValid = false;
    }
    
    if (isset($_POST["isbn10"]))
    {
        $date = Database::escape($_POST["isbn10"]);
        $date = trim($date);
        if ($date == "")
        {
            $date = "null";
        }
        else
        {
            if (strlen($date) == 10)
            {
                $date = "'" . $date . "'";
            }
            else
            {
                $return["result"]["success"] = false;
                $return["result"]["message"] = "ISBN10 need to be 10 long";
                $dataIsValid = false;
            }
        }
        
        $data["isbn10"] = $date;
    }
    else
    {
        $return["result"]["success"] = false;
        $return["result"]["message"] = "ISBN 10 data is missing";
        $dataIsValid = false;
    }
}

//validate other
if ($dataIsValid === true)
{
    $nullableStrings = [
        "title",
        "subtitle",
        "description",
        "authors",
        "categories",
        "publisher"
    ];
    foreach ($nullableStrings as $item)
    {
        if (isset($_POST[$item]))
        {
            $data[$item] = Database::escape($_POST[$item]);
            $data[$item] = trim($data[$item]);
            if ($data[$item] == "")
            {
                $data[$item] = "null";
            }
            else
            {
                $data[$item] = "'" . $data[$item] . "'";
            }
        }
        else
        {
            $return["result"]["success"] = false;
            $return["result"]["message"] = "$item data is missing";
            $dataIsValid = false;
            break;
        }
    }
}

if ($dataIsValid === true)
{
    $id = $data["id"];
    $result = Database::query("SELECT `id` FROM `book-hub` WHERE `id`=" . $id);
    if ($result->num_rows === 1)
    {
        $title = $data["title"];
        $subtitle = $data["subtitle"];
        $categories = $data["categories"];
        $description = $data["description"];
        $authors = $data["authors"];
        $publisher = $data["publisher"];
        $date = $data["date"];
        $isbn13 = $data["isbn13"];
        $isbn10 = $data["isbn10"];
        $sql = "UPDATE `book-hub` SET `title`=$title, `subtitle`=$subtitle, `categories`=$categories, `description`=$description, `authors`=$authors, `publisher`=$publisher, `date`=$date, `isbn13`=$isbn13, `isbn10`=$isbn10 WHERE `id`=$id";
        $result = Database::query($sql);
        $return["result"]["success"] = true;
        $return["result"]["test"] = $sql;
        $return["result"]["message"] = "Save successful";
    }
    else
    {
        $return["result"]["success"] = false;
        $return["result"]["message"] = "Unable to find book with id $id";
    }
}


$return["status"] = "OK";
exit(json_encode($return));

function isRealDate($date)
{
    if (false === strtotime($date))
    {
        return false;
    }
    list($year, $month, $day) = explode('-', $date);
    return checkdate($month, $day, $year);
}