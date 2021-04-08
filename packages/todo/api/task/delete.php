<?php
include "../core.php";

$id = escape(get("id"));

Database::query("DELETE FROM `$table` WHERE `id`=$id");

//this is a nasty hack to get auto refresh to work.
//when deleting a task we update another task which will trigger a refresh.
//need a better way to auto refresh when deleting.
Database::query("UPDATE `$table` SET `updated_at` = CURRENT_TIMESTAMP, `updated_by`='server' LIMIT 1;");

API::success("Deleted");