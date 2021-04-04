<?php
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();
Authentication::Auth403();
Database::connect();

$table = Database::tableName("tasks");

if (isset($_POST["id"]))
{
	$id = Database::escape($_POST["id"]);

	$updateSql = [];
	if(isset($_POST["done"])){
		$done = Database::escape($_POST["done"]);
		$updateSql[] = "`done`=$done";
	}
	if(isset($_POST["name"])){
		$name = Database::escape($_POST["name"]);
		$updateSql[] = "`name`='$name'";
	}
	if(isset($_POST["list"])){
		$list = Database::escape($_POST["list"]);
		$updateSql[] = "`list`='$list'";
	}
	if(isset($_POST["priority"])){
		$priority = Database::escape($_POST["priority"]);
		$updateSql[] = "`priority`=$priority";
	}
	if(isset($_POST["description"])){
		$description = Database::escape($_POST["description"]);
		$updateSql[] = "`description`='$description'";
	}
	if(isset($_POST["date"])){
		if($_POST["date"] == ""){
			$updateSql[] = "`date`=null";
		}
		else{
			$date = Database::escape($_POST["date"]);
			$updateSql[] = "`date`='$date'";
		}
	}
	$updateSql = join(", ", $updateSql);

	Database::query("UPDATE `$table` SET $updateSql WHERE `id`=$id");

	API::success("Updated");
}
else
{
	API::fail("missing id");
}

