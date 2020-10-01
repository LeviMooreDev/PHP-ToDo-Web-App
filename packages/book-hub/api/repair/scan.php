<?php
header('Content-Type: application/json');
include("../core.php");

$databaseEntries = [];

$missingFolders = [];
$missingBooks = [];
$missingDatabaseEntries = [];
$leftoverFiles = [];

Database::connect();
$result = Database::query("SELECT `id`,`title` FROM `book-hub`");
if ($result->num_rows > 0)
{
    while ($book = $result->fetch_assoc())
    {
        $databaseEntries[] = $book;
    }
}

foreach ($databaseEntries as $entry)
{
    if (!file_exists(Core::bookFolderPathServer($entry["id"])))
    {
        $missingFolders[] = $entry;
    }
    else if (!file_exists(Core::bookFilePathServer($entry["id"])))
    {
        $missingBooks[] = $entry;
    }
}

foreach (array_diff(scandir(Core::booksFolderServer()), array('..', '.')) as $entry)
{
    $missingDatabaseEntry = true;
    foreach ($databaseEntries as $dbEntry)
    {
        if ($dbEntry["id"] == $entry)
        {
            $missingDatabaseEntry = false;
        }
    }
    if ($missingDatabaseEntry === true)
    {
        $id = $entry;
        $title = "Unknown";
        if (file_exists(Core::originalFileNamePathServer($id)))
        {
            $fileReader = fopen(Core::originalFileNamePathServer($id), "r");
            if ($fileReader !== false)
            {
                $title = fread($fileReader, filesize(Core::originalFileNamePathServer($id)));
                fclose($fileReader);
            }
        }
        $entry = [];
        $entry["id"] = $id;
        $entry["title"] = $title;

        if (file_exists(Core::bookFilePathServer($id)))
        {
            $missingDatabaseEntries[] = $entry;
        }
        else
        {
            $leftoverFiles[] = $entry;
        }
    }
}

Core::result("missing-folders", $missingFolders);
Core::result("missing-books", $missingBooks);
Core::result("missing-database-entries", $missingDatabaseEntries);
Core::result("leftover-files", $leftoverFiles);
Core::success("Scan complete");

//sleep(1);