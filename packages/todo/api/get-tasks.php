<?php
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();
Authentication::Auth403();
Database::connect();

$table = Database::tableName("tasks");
$result = Database::query("SELECT * FROM `$table`");

$lists = [];
if ($result->num_rows > 0)
{
    while ($row = $result->fetch_assoc())
    {
		$row["done"] = $row["done"] == 1 ? true : false;
		$row["star"] = $row["star"] == 1 ? true : false;
        $lists[$row["list"]][] = $row;
    }
}

API::result("lists", $lists);
API::success("");