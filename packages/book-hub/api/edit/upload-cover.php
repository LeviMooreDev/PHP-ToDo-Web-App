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
$allowTypes = array("jpg", "jpeg", "png", "gif", "bmp");

if (isset($_POST["id"]))
{
    if (isset($_FILES["file"]))
    {
        $file = $_FILES["file"];
        $fileType = pathinfo(basename($file["name"]), PATHINFO_EXTENSION);
        if (in_array($fileType, $allowTypes))
        {
            if (is_array(getimagesize($file["tmp_name"])))
            {
                Database::connect();
                $id = Database::escape($_POST["id"]);
                $sql = "SELECT `file` FROM `book-hub` WHERE `id`=$id";
                $result = Database::query($sql);
                if ($result->num_rows === 1)
                {
                    $targetFilePath = $booksFolder . $result->fetch_assoc()["file"] . ".jpg";
                    //$return["result"]["hej"] = $file;
                    if (convertImage($file["type"], $file["tmp_name"], $targetFilePath) === true)
                    {
                        if (file_exists($targetFilePath))
                        {
                            $return["result"]["success"] = true;
                            $return["result"]["message"] = "Upload successful";
                        }
                        else
                        {
                            $return["result"]["success"] = false;
                            $return["result"]["message"] = "Unable to convert file. Server side error #2";
                        }
                    }
                    else
                    {
                        $return["result"]["success"] = false;
                        $return["result"]["message"] = "Unable to convert file. Server side error #1";
                    }
                }
                else
                {
                    $return["result"]["success"] = false;
                    $return["result"]["message"] = "Unable to find book with id $id";
                }
            }
            else
            {
                $return["result"]["success"] = false;
                $return["result"]["message"] = "File data does not match an image";
            }
        }
        else
        {
            $return["result"]["success"] = false;
            $return["result"]["message"] = "File format $fileType not supported";
        }
    }
    else
    {
        $return["result"]["success"] = false;
        $return["result"]["message"] = "File data is missing";
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