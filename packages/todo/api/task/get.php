<?php
include "../core.php";

$result = Database::query("SELECT * FROM `$table` ORDER BY `priority` DESC, -date DESC");

$tasks = [];
if ($result->num_rows > 0)
{
    while ($row = $result->fetch_assoc())
    {
		startEncryption();
		$row["name"] = decrypt($row["name"]);
		$row["description"] = decrypt($row["description"]);
		$row["list"] = decrypt($row["list"]);
		endEncryption();

		$row["done"] = $row["done"] == 1 ? true : false;
		$row["priority"] = $row["priority"] == 1 ? true : false;
        $tasks[] = $row;
    }
}

API::result("by", $_SERVER["REMOTE_ADDR"]);
API::result("tasks", $tasks);
API::success("");