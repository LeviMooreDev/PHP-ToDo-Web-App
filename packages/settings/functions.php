<?php
function setting($name, $clearCache = false)
{
    //If we don't have a cached version of our settings, get them from the database and cache them in $_SESSION.
    if ($clearCache || !isset($_SESSION["cached-settings"]) || $_SESSION["cached-settings"] !== true) {
        $result = query("SELECT * FROM `settings`");
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $value = $row["value"];
                if ($row["data_type"] === "number") {
                    $value = (int) $value;
                } else if ($row["data_type"] === "boolean") {
                    $value = ($value === "true" ? true : false);
                }

                $_SESSION["settings-" . $row["name"]] = $value; 
            }
        }

        $_SESSION["cached-settings"] = true;
    }

    //Find setting in cache and return it.
    return $_SESSION["settings-" . $name];
}