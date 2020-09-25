<?php
include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (!Authentication::Auth()) {
    die();
}

$packages = Packages::all();
foreach ($packages as &$package)
{
    $file = Packages::serverPath($package) . "/user-settings/setup.php";
    if (file_exists($file))
    {
        include($file);
    }
}

$return["status"] = "OK";
exit(json_encode($return));
