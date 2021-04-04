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
$lists = [];
if ($result->num_rows > 0)
{
    while ($row = $result->fetch_assoc())
    {
		$row["done"] = $row["done"] == 1 ? true : false;
		$row["priority"] = $row["priority"] == 1 ? true : false;
        $lists[$row["list"]][] = $row;
    }
}

krsort($lists);

//return
API::result("lists", $lists);
API::success("");