<?php
include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}
Core::createFolder(Core::booksFolderServer());
Core::createFolder(Core::uploadFolder());

class Core
{
    static $response = [];

    static function uploadFolder()
    {
        return Packages::serverPath("book-hub") . "/uploads/";
    }
    static function uploadFilePath($name)
    {
        return Core::uploadFolder() . $name;
    }

    static function booksFolderServer()
    {
        return Packages::serverPath("book-hub") . "/books/";
    }
    static function booksFolderHTTP()
    {
        return Packages::httpPath("book-hub") . "/books/";
    }

    static function bookFolderPathServer($id)
    {
        return Core::booksFolderServer() . "$id/";
    }
    static function bookFolderPathHTTP($id)
    {
        return Core::booksFolderHTTP() . "$id/";
    }

    static function bookFilePathServer($id)
    {
        return Core::booksFolderServer() . "$id/book.pdf";
    }
    static function bookFilePathHTTP($id)
    {
        return Core::booksFolderHTTP() . "$id/book.pdf";
    }

    static function originalFileNamePathServer($id)
    {
        return Core::booksFolderServer() . "$id/original-file-name.txt";
    }
    static function originalFileNamePathHTTP($id)
    {
        return Core::booksFolderHTTP() . "$id/original-file-name.txt";
    }


    static function coverFilePathServer($id)
    {
        return Core::booksFolderServer() . "$id/cover.jpg";
    }
    static function coverFilePathHTTP($id)
    {
        return Core::booksFolderHTTP() . "$id/cover.jpg";
    }

    static function coverPlaceholderFilePathServer()
    {
        return Packages::serverPath("book-hub") . "/cover-placeholder.jpg";
    }
    static function coverPlaceholderFilePathHTTP()
    {
        return Packages::httpPath("book-hub") . "/cover-placeholder.jpg";
    }

    static function createFolder($path)
    {
        if (!file_exists($path))
        {
            mkdir($path, 0777, true);
        }
    }
    static function deleteFile($path)
    {
        if (file_exists($path))
        {
            chmod($path, 0777);
            unlink($path);
        }
    }

    static function deleteBookFolder($id)
    {
        $path = Core::bookFolderPathServer($id);
        if (file_exists($path))
        {
            foreach (array_diff(scandir($path), array('..', '.')) as $entry)
            {
                $file = $path . $entry;
                chmod($file, 0777);
                unlink($file);
            }
            rmdir($path);
        }
    }

    static function validatePostIsset($name)
    {
        if (isset($_POST[$name]))
        {
            return true;
        }
        else
        {
            Core::fail("$name data is missing");
        }
    }
    static function validateGetIsset($name)
    {
        if (isset($_GET[$name]))
        {
            return true;
        }
        else
        {
            Core::fail("$name data is missing");
        }
    }

    static function validateBookExists($id)
    {
        $id = Database::escape($id);
        $result = Database::query("SELECT `id` FROM `book-hub` WHERE `id`=$id");
        if ($result->num_rows !== 1)
        {
            Core::fail("Unable to find book with id $id");
        }
    }

    static function result($name, $data)
    {
        Core::$response["result"][$name] = $data;
    }
    static function fail($message)
    {
        Core::result("success", false);
        Core::result("message", $message);
        Core::$response["status"] = "OK";
        exit(json_encode(Core::$response));
    }
    static function success($message)
    {
        Core::result("success", true);
        Core::result("message", $message);
        Core::$response["status"] = "OK";
        exit(json_encode(Core::$response));
    }
 
    function getMainColor($file)
    {
        $image = imagecreatefromjpeg($file);
        $thumb = imagecreatetruecolor(1, 1);
        imagecopyresampled($thumb, $image, 0, 0, 0, 0, 1, 1, imagesx($image), imagesy($image));
        return strtoupper(dechex(imagecolorat($thumb, 0, 0)));
    }
}