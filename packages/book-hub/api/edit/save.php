<?php
header('Content-Type: application/json');
include("../core.php");

Database::connect();
$data = new Data();
Core::validateBookExists($data->id);

$sql = "UPDATE `book-hub` SET `title`=$data->title, `subtitle`=$data->subtitle, `categories`=$data->categories, `description`=$data->description, `authors`=$data->authors, `publisher`=$data->publisher, `date`=$data->date, `isbn13`=$data->isbn13, `isbn10`=$data->isbn10, `status`='$data->status' WHERE `id`=$data->id";
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
    public $status;

    function __construct()
    {
        $this->id = $this->validateID();
        $this->isbn13 = $this->validateISBN(13);
        $this->isbn10 = $this->validateISBN(10);
        $this->date = $this->validateDate();
        $this->title = $this->validateString("title");
        $this->subtitle = $this->validateString("subtitle");
        $this->description = $this->validateString("description");
        $this->authors = $this->validateStringList("authors");
        $this->categories = $this->validateStringList("categories");
        $this->publisher = $this->validateString("publisher");
        $this->status = $this->validateStatus();
    }

    function validateID()
    {
        Core::validatePostIsset("id");
        return Database::escape($_POST["id"]);
    }

    function validateStatus()
    {
        $values = ["unread", "reading", "finished"];

        Core::validatePostIsset("status");
        $data = Database::escape($_POST["status"]);
        if (!in_array($data, $values))
        {
            Core::fail("$data is not a valid status. Use " . implode(", ", $values));
        }
        return Database::escape($_POST["status"]);
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

    function validateStringList($name)
    {
        if (isset($_POST[$name]))
        {
            $data = $_POST[$name];
            $data = trim($data);
            if ($data == "")
            {
                $data = "null";
            }
            else
            {
                $data = str_replace("&", ", ", $data);
                $data = ucwords(strtolower($data));
                $data = explode(",", $data);
                $data = array_map('trim', $data);
                $data = array_filter($data); 
                $data = array_unique($data);

                sort($data);
                $data = implode(", ", $data);

                $data = Database::escape($data);
                $data = "'" . $data . "'";
            }
        }
        else
        {
            Core::fail("$name data is missing");
        }
        return $data;
    }

    function validateString($name)
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