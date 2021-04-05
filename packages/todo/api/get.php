<?php
//set json header
header('Content-Type: application/json');

//include framework
include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

//check that the user is logged in
Authentication::Auth403();

//connect to database
Database::connect();

//get tasks
$table = Database::tableName("tasks");
$result = Database::query("SELECT * FROM `$table` ORDER BY priority DESC, -date DESC");

//build list of tasks
$tasks = [];
if ($result->num_rows > 0)
{
    while ($row = $result->fetch_assoc())
    {
		$taskEncryptionName = "todo_tasks";
		Encryption::Start($taskEncryptionName, Authentication::HashedId());
		$row["name"] = Encryption::Decrypt($taskEncryptionName, $row["name"]);
		$row["description"] = Encryption::Decrypt($taskEncryptionName, $row["description"]);
		$row["list"] = Encryption::Decrypt($taskEncryptionName, $row["list"]);
		Encryption::Stop();

		$row["done"] = $row["done"] == 1 ? true : false;
		$row["priority"] = $row["priority"] == 1 ? true : false;
        $tasks[] = $row;
    }
}

//return
API::result("by", $_SERVER["REMOTE_ADDR"]);
API::result("tasks", $tasks);
API::success("");