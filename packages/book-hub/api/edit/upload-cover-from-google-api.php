<?php
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

//authentication check
if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

//create upload folder
$booksFolder = Packages::serverPath("book-hub") . "/books/";

$_POST["id"] = 231;
$_POST["url"] = "http://books.google.com/books/content?id=aVz_BgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api";

if (isset($_POST["id"]))
{
    if (isset($_POST["url"]))
    {
        Database::connect();
        $id = Database::escape($_POST["id"]);
        $sql = "SELECT `file` FROM `book-hub` WHERE `id`=$id";
        $result = Database::query($sql);
        if ($result->num_rows === 1)
        {
            $url = $_POST["url"];
            $image = file_get_contents($url);
            $targetFilePath = $booksFolder . $result->fetch_assoc()["file"] . ".jpg";
            file_put_contents($targetFilePath, $image);

            if (file_exists($targetFilePath))
            {
                if (is_array(getimagesize($targetFilePath)))
                {
                    $return["result"]["success"] = true;
                    $return["result"]["message"] = "Upload successful";
                }
                else
                {
                    chmod($targetFilePath, 0777);
                    unlink($targetFilePath);
                    $return["result"]["success"] = false;
                    $return["result"]["message"] = "Cover data does not match an image. Server side error #2";
                }
            }
            else
            {
                $return["result"]["success"] = false;
                $return["result"]["message"] = "Unable to upload cover. Server side error #1";
            }
        }
        else
        {
            $return["result"]["success"] = false;
            $return["result"]["message"] = "Unable to find book with id $id";
        }

    // $file = $_FILES["file"];
    // $fileType = pathinfo(basename($file["name"]), PATHINFO_EXTENSION);
    // if (in_array($fileType, $allowTypes))
    // {
    //     if (is_array(getimagesize($file["tmp_name"])))
    //     {

    //     }
    //     else
    //     {
    //         $return["result"]["success"] = false;
    //         $return["result"]["message"] = "File data does not match an image";
    //     }
    // }
    // else
    // {
    //     $return["result"]["success"] = false;
    //     $return["result"]["message"] = "File format $fileType not supported";
    // }
    }
    else
    {
        $return["result"]["success"] = false;
        $return["result"]["message"] = "URL data is missing";
    }
}
else
{
    $return["result"]["success"] = false;
    $return["result"]["message"] = "Id data is missing";
}

$return["status"] = "OK";
exit(json_encode($return));

//https://stackoverflow.com/questions/14549446/how-can-i-convert-all-images-to-jpg
//Davide Berra
function convertImage($originalType, $originalImage, $outputImage)
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

    imagejpeg($imageTmp, $outputImage, 100);
    imagedestroy($imageTmp);

    return true;
}