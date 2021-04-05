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

//get table name
$table = Database::tableName("tasks");

//contains update part of the sql
$updateSql = [];

//check if we have an id to update
if (!isset($_POST["id"]))
{
	API::fail("missing id");
}
//get id
$id = Database::escape($_POST["id"]);

//get done
if(isset($_POST["done"])){
	$done = Database::escape($_POST["done"]);
	$updateSql[] = "`done`=$done";
}

//start encryption
$taskEncryptionName = "todo_tasks";
Encryption::Start($taskEncryptionName, Authentication::HashedId());

//get name
if(isset($_POST["name"])){
	$name = Encryption::Encrypt($taskEncryptionName, $_POST["name"]);
	$name = Database::escape($name);
	$updateSql[] = "`name`='$name'";
}

//get description
if(isset($_POST["description"])){
	$description = Encryption::Encrypt($taskEncryptionName, $_POST["description"]);
	$description = Database::escape($description);
	$updateSql[] = "`description`='$description'";
}

//get list
if(isset($_POST["list"])){
	$list = Encryption::Encrypt($taskEncryptionName, $_POST["list"]);
	$list = Database::escape($list);
	$updateSql[] = "`list`='$list'";
}

//stop encryption
Encryption::Stop();

//get priority
if(isset($_POST["priority"])){
	$priority = Database::escape($_POST["priority"]);
	$updateSql[] = "`priority`=$priority";
}

//get date
if(isset($_POST["date"])){
	//if there is no date set it to null
	if($_POST["date"] == ""){
		$updateSql[] = "`date`=null";
	}
	else{
		$date = Database::escape($_POST["date"]);
		$updateSql[] = "`date`='$date'";
	}
}

$ip = $_SERVER["REMOTE_ADDR"];
$updateSql[] = "`updated_by`='$ip'";

//join list of update sql into sql string
$updateSql = join(", ", $updateSql);


//query
Database::query("UPDATE `$table` SET $updateSql WHERE `id`=$id");

//return
API::success("Updated");

