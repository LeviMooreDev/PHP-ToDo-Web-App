<?php
foreach ($packages as &$package) {
    $file = Packages::serverPath($package) . "/user-settings/setup.php";
    if (file_exists($file)) {
        include($file);
    }
}