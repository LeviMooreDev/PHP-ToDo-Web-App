<?php
header('Content-Type: application/json');
include("../core.php");

Database::connect();
$data = new Data();
Core::validateBookExists($data->id);

$sql = "UPDATE `book-hub` SET `title`=$data->title, `subtitle`=$data->subtitle, `categories`=$data->categories, `description`=$data->description, `authors`=$data->authors, `publisher`=$data->publisher, `date`=$data->date, `isbn13`=$data->isbn13, `isbn10`=$data->isbn10 WHERE `id`=$data->id";
Database::query($sql);
Core::result("sql", $sql);
Core::success("Save successful");

class Data
{
    public $id;
    public $title;
    public $subtitle;
    public $description;
    public $authors;
    public $categories;
    public $publisher;
    public $isbn13;
    public $isbn10;
    public $date;

    function __construct()
    {
        $this->id = $this->validateID();
        $this->isbn13 = $this->validateISBN(13);
        $this->isbn10 = $this->validateISBN(10);
        $this->date = $this->validateDate();
        $this->title = $this->validateNullableString("title");
        $this->subtitle = $this->validateNullableString("subtitle");
        $this->description = $this->validateNullableString("description");
        $this->authors = $this->validateNullableString("authors");
        $this->categories = $this->validateNullableString("categories");
        $this->publisher = $this->validateNullableString("publisher");
    }

    function validateID()
    {
        Core::validatePostIsset("id");
        return Database::escape($_POST["id"]);
    }

    function validateDate()
    {
        if (Core::validatePostIsset("date"))
        {
            $data = Database::escape($_POST["date"]);
            $data = trim($data);
            if ($data == "")
            {
                $data = "null";
            }
            else
            {
                if (false === strtotime($data))
                {
                    $realDate = false;
                }
                else
                {
                    list($year, $month, $day) = explode('-', $data);
                    $realDate = checkdate($month, $day, $year);
                }

                if ($realDate)
                {
                    $data = "'" . $data . "'";
                }
                else
                {
                    Core::fail("Cant understand date format");
                }
            }
        }
        return $data;
    }

    function validateISBN($length)
    {
        if (Core::validatePostIsset("isbn$length"))
        {
            $data = Database::escape($_POST["isbn$length"]);
            $data = trim($data);
            if ($data == "")
            {
                $data = "null";
            }
            else
            {
                if (strlen($data) == $length)
                {
                    $data = "'" . $data . "'";
                }
                else
                {
                    Core::fail("ISBN$length need to be $length long");
                }
            }
        }
        return $data;
    }

    function validateNullableString($name)
    {
        if (isset($_POST[$name]))
        {
            $data = Database::escape($_POST[$name]);
            $data = trim($data);
            if ($data == "")
            {
                $data = "null";
            }
            else
            {
                $data = "'" . $data . "'";
            }
        }
        else
        {
            Core::fail("$name data is missing");
        }
        return $data;
    }
}