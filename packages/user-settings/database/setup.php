<?php
include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
$packages = Packages::names();
Functions::collect();
foreach ($packages as $package)
{
    $file = Packages::serverPath($package) . "/user-settings/setup.php";
    if (file_exists($file))
    {
        include($file);
    }
}