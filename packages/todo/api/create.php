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

//start encryption
$taskEncryptionName = "todo_tasks";
Encryption::Start($taskEncryptionName, Authentication::HashedId());

//get name
if(!isset($_POST["name"])){
	API::fail("missing name");
}
$name = Encryption::Encrypt($taskEncryptionName, $_POST["name"]);
$name = Database::escape($name);

//get description
if(!isset($_POST["description"])){
	API::fail("missing description");
}
$description = Encryption::Encrypt($taskEncryptionName, $_POST["description"]);
$description = Database::escape($description);

//get list
if(!isset($_POST["list"])){
	API::fail("missing list");
}
$list = Encryption::Encrypt($taskEncryptionName, $_POST["list"]);
$list = Database::escape($list);

//stop encryption
Encryption::Stop();

//get priority
if(!isset($_POST["priority"])){
	API::fail("missing priority");
}
$priority = Database::escape($_POST["priority"]);

//get date
if(!isset($_POST["date"])){
	API::fail("missing date");
}
$date = "'" . Database::escape($_POST["date"]). "'";
if($date == "''"){
	$date = "null";
}

//get table name
$table = Database::tableName("tasks");

$ip = $_SERVER["REMOTE_ADDR"];

//query
$sql = "INSERT INTO `$table` (`priority`, `name`, `description`, `list`, `date`, `updated_by`) VALUES
							 ($priority, '$name','$description','$list',$date, '$ip')";
Database::query($sql);

//return
API::result("id", Database::insert_id());
API::success("Created");



