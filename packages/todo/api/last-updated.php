<?php
include "core.php";

startEncryption();
$userDeviceID = escape(encrypt(userDeviceID()));
endEncryption();

$result = Database::query("SELECT `updated_at` FROM `$table` WHERE NOT `updated_by`='$userDeviceID' ORDER BY `updated_at` DESC LIMIT 1");

if ($result->num_rows > 0)
{
    while ($row = $result->fetch_assoc())
    {
		API::result("updated_at", $row["updated_at"]);
    }
}
API::success("");