<?php
header('Content-Type: application/json');
include("../core.php");

Core::validatePostIsset("name");
$postFile = Helper::escapeFileName($_POST["name"]);

if (!empty($postFile))
{
    $uploadFilePath = Core::uploadFilePath($postFile);
    if (file_exists($uploadFilePath))
    {
        $id;
        Database::connect();

        //pages
        $bookDate = file_get_contents($uploadFilePath);
        $pages = preg_match_all("/\/Page\W/", $bookDate, $dummy);

        //file name
        $fileName = Database::escape(pathinfo($uploadFilePath)['filename']);
        
        //insert entry
        $result = Database::queries("INSERT INTO `book-hub`(`title`,`pages`) VALUES ('$fileName',$pages); SELECT LAST_INSERT_ID();");
        
        //get id
        if ($result->field_count == 1 && $result->num_rows == 0)
        {
            $row = $result->fetch_assoc();
            if (array_key_exists("LAST_INSERT_ID()", $row))
            {
                $id = $row["LAST_INSERT_ID()"];
            }
        }

        if (isset($id))
        {
            $bookFile = Core::bookFilePathServer($id);

            //move from upload to book folder
            Core::createFolder(Core::bookFolderPathServer($id));
            rename($uploadFilePath, $bookFile);

            //write original file name file
            $fileWrite = fopen(Core::originalFileNamePathServer($id), "w");
            if ($fileWrite !== false)
            {
                fwrite($fileWrite, $fileName);
                fclose($fileWrite);
            }
            else
            {
                Core::deleteBookFolder($id);
                Core::fail("Cant commit book. Database error #2");
            }

            Core::result("id", $id);
            Core::success("Committed");
        }
        else
        {
            Core::fail("Cant commit book. Database error #1");
        }
    }
    else
    {
        Core::fail("Cant find file");
    }
}
else
{
    Core::fail("Name data empty");
}