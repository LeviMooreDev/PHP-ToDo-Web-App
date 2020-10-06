<?php
header('Content-Type: application/json');
include("../core.php");

$issues = [];

$databaseEntries = [];
Database::connect();
$result = Database::query("SELECT `id`,`title` FROM `book-hub`");
if ($result->num_rows > 0)
{
    while ($book = $result->fetch_assoc())
    {
        $databaseEntries[] = $book;
    }
}


//scan database
foreach ($databaseEntries as $entry)
{
    $id = $entry["id"];
    $title = $entry["title"];
    //entry folder is missing
    if (!file_exists(Core::bookFolderPathServer($entry["id"])))
    {
        addIssues("(id: $id) $title is missing entry folder", "Fixed by removing database entry", "delete-entry", "{\"id\":$id}");
    }
    //book file is missing
    else if (!file_exists(Core::bookFilePathServer($entry["id"])))
    {
        addIssues("(id: $id) $title is missing book file", "Fixed by removing database entry", "delete-entry", "{\"id\":$id}");
    }
}

//scan books folder
foreach (array_diff(scandir(Core::booksFolderServer()), array('..', '.')) as $folder)
{
    $missingDatabaseEntry = true;
    foreach ($databaseEntries as $item)
    {
        $databaseId = $item["id"];
        if ($databaseId == $folder)
        {
            $missingDatabaseEntry = false;
        }
    }

    //database entry is missing
    if ($missingDatabaseEntry === true)
    {
        //there is a book file to create a entry from
        if (file_exists(Core::bookFilePathServer($folder)))
        {
            $title = basename(Core::bookFilePathServer($folder));
            if (file_exists(Core::originalFileNamePathServer($folder)))
            {
                $fileReader = fopen(Core::originalFileNamePathServer($folder), "r");
                if ($fileReader !== false)
                {
                    $title = fread($fileReader, filesize(Core::originalFileNamePathServer($folder)));
                    fclose($fileReader);
                }
            }

            addIssues("(folder: $folder) $title is missing database entry", "Fixed by creating database entry", "create-entry", "{\"folder\":$folder}");
        }
        //there are no files to create a entry from
        else
        {
            addIssues("(folder: $folder) Folder contains unused files", "Fixed by removing them", "delete-entry", "{\"id\":$folder}");
        }
    }
}

Core::result("issues", $issues);
Core::success("Scan complete");

$nextEntryID = 0;
function addIssues($issuesDescription, $fixDescription, $fixEndpoint, $fixData)
{
    global $issues;
    global $nextEntryID;
    $nextEntryID = $nextEntryID + 1;

    $issue = [];
    $issue["entryID"] = $nextEntryID;
    $issue["issues-description"] = $issuesDescription;
    $issue["fix-description"] = $fixDescription;
    $issue["fix-endpoint"] = $fixEndpoint;
    $issue["fix-data"] = $fixData;
    $issues[] = $issue;
}