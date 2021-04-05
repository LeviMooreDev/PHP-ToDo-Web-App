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

//get name
if(!isset($_POST["name"])){
	API::fail("missing name");
}
$name = Database::escape($_POST["name"]);

//get description
if(!isset($_POST["description"])){
	API::fail("missing description");
}
$description = Database::escape($_POST["description"]);

//get list
if(!isset($_POST["list"])){
	API::fail("missing list");
}
$list = Database::escape($_POST["list"]);

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

//query
$sql = "INSERT INTO `$table` (`priority`, `name`, `description`, `list`, `date`) VALUES
							 ($priority, '$name','$description','$list',$date)";
Database::query($sql);

//return
API::success("Created");



