<?php
include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

$packages = Packages::names();
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
