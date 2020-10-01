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
        $fileName = Database::escape(pathinfo($uploadFilePath)['filename']);
        $result = Database::queries("INSERT INTO `book-hub`(`title`) VALUES ('$fileName'); SELECT LAST_INSERT_ID();");
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
            Core::createFolder(Core::bookFolderPathServer($id));
            rename($uploadFilePath, $bookFile);

            $fileWrite = fopen(Core::originalFileNamePathServer($id), "w");
            if ($fileWrite !== false)
            {
                fwrite($fileWrite, $fileName);
                fclose($fileWrite);
            }
            else
            {
                Core::deleteBookFolder($id);
            }

            Core::result("id", $id);
            Core::success("Committed");
        }
        else
        {
            Core::fail("Cant commit book. Database error.");
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