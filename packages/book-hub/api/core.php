<?php
include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}
Core::createFolder(Core::booksFolderServer());
Core::createFolder(Core::uploadFolder());

$bookHubTable = Database::tableName("book_hub");

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

    static function pdfFilePathServer($id)
    {
        return Core::booksFolderServer() . "$id/book.pdf";
    }
    static function pdfFilePathHTTP($id)
    {
        return Core::booksFolderHTTP() . "$id/book.pdf";
    }

    static function epubFilePathServer($id)
    {
        return Core::booksFolderServer() . "$id/book.epub";
    }
    static function epubFilePathHTTP($id)
    {
        return Core::booksFolderHTTP() . "$id/book.epub";
    }

    static function originalFileNamePathServer($id)
    {
        return Core::booksFolderServer() . "$id/original-file-name.txt";
    }
    static function originalFileNamePathHTTP($id)
    {
        return Core::booksFolderHTTP() . "$id/original-file-name.txt";
    }

    static function coverFileTmpPathServer($id)
    {
        return Core::booksFolderServer() . "$id/cover.tmp.jpg";
    }
    static function coverFile100PathServer($id)
    {
        return Core::booksFolderServer() . "$id/cover.100.jpg";
    }
    static function coverFile50PathServer($id)
    {
        return Core::booksFolderServer() . "$id/cover.50.jpg";
    }
    static function coverFile20PathServer($id)
    {
        return Core::booksFolderServer() . "$id/cover.20.jpg";
    }
    static function coverFile100PathHTTP($id)
    {
        return Core::booksFolderHTTP() . "$id/cover.100.jpg";
    }
    static function coverFile50PathHTTP($id)
    {
        return Core::booksFolderHTTP() . "$id/cover.50.jpg";
    }
    static function coverFile20PathHTTP($id)
    {
        return Core::booksFolderHTTP() . "$id/cover.20.jpg";
    }

    static function coverPlaceholderFilePathServer()
    {
        return Packages::selfServerPath() . "/static/cover-placeholder.jpg";
    }
    static function coverPlaceholderFilePathHTTP()
    {
        return Packages::selfHttpPath() . "/static/cover-placeholder.jpg";
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
        global $bookHubTable;
        $id = Database::escape($id);
        $result = Database::query("SELECT `id` FROM `$bookHubTable` WHERE `id`=$id");
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
        $hex = dechex(imagecolorat($thumb, 0, 0));
        $hex = substr("000000" . $hex, -6);
        return strtoupper($hex);
    }

    function fileFormatSupported($fileNames)
    {
        $allowTypes = array('pdf','epub');
        $count = sizeof($fileNames);
        for ($i = 0; $i < $count; $i++)
        {
            $fileType = pathinfo(basename($fileNames[$i]), PATHINFO_EXTENSION);
            if (!in_array($fileType, $allowTypes))
            {
                return false;
            }
        }
        return true;
    }

    function uploadFiles($id, $files)
    {
        Core::createFolder(Core::bookFolderPathServer($id));

        $count = sizeof($files["files"]["name"]);
        for ($i = 0; $i < $count; $i++)
        {
            $fileName = Helper::escapeFileName(basename($files["files"]["name"][$i]));
            $fileType = pathinfo(basename($files["files"]["name"][$i]), PATHINFO_EXTENSION);
    
            $uploaded = [];
    
            if (move_uploaded_file($files["files"]["tmp_name"][$i], Core::bookFolderPathServer($id) . "book." . $fileType))
            {
                $uploaded[] = $fileName;
            }
            else
            {
                foreach ($uploaded as $file)
                {
                    Core::deleteFile(Core::uploadFilePath($file));
                }
                return false;
            }
        }
        return true;
    }

    function setPageTotalFromPdf($id)
    {
        global $bookHubTable;
        $filePath = Core::pdfFilePathServer($id);
        if(file_exists($filePath))
        {
            $bookDate = file_get_contents($filePath);
            $pages = preg_match_all("/\/Page\W/", $bookDate, $dummy);
            Database::connect();
            Database::query("UPDATE `$bookHubTable` SET `pages`='$pages' WHERE `id`=$id");
        }
    }

    //https://stackoverflow.com/questions/14549446/how-can-i-convert-all-images-to-jpg
    //Davide Berra
    function convertCoverImage($originalType, $originalImage, $id)
    {
        if ($originalType == "image/jpeg" || $originalType == "image/jpg")
        {
            $imageTmp = imagecreatefromjpeg($originalImage);
        }
        else if ($originalType == "image/png")
        {
            $imageTmp = imagecreatefrompng($originalImage);
        }
        else if ($originalType == "image/gif")
        {
            $imageTmp = imagecreatefromgif($originalImage);
        }
        else if ($originalType == "image/bmp")
        {
            $imageTmp = imagecreatefrombmp($originalImage);
        }
        else
        {
            return false;
        }

        if ($originalType == "image/jpeg")
        {
            copy($originalImage, Core::coverFile100PathServer($id));
        }
        else
        {
            imagejpeg($imageTmp, Core::coverFile100PathServer($id), 100);
        }
        imagejpeg($imageTmp, Core::coverFile50PathServer($id), 50);
        imagejpeg($imageTmp, Core::coverFile20PathServer($id), 20);
        imagedestroy($imageTmp);

        return true;
    }
}