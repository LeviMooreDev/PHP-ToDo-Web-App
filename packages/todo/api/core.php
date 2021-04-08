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

function startEncryption()
{
	Encryption::Start("todo_tasks", Authentication::HashedId());
}

function endEncryption()
{
	Encryption::Stop();
}
function encrypt($value)
{
	return Encryption::Encrypt("todo_tasks", $value);
}
function decrypt($value)
{
	return Encryption::Decrypt("todo_tasks", $value);
}

function get($name)
{
	if (!isset($_POST[$name]))
	{
		API::fail("Missing $name data");
	}
	return $_POST[$name];
}
function escape($value)
{
	return Database::escape($value);
}
function userDeviceID()
{
	return $_SERVER["REMOTE_ADDR"];
}