<?php
class UserSettings
{
    public static function get($package, $name, $default)
    {
        if (Database::isReady())
        {
            Database::connect();
            $userSettingsTable = Database::tableName("user_settings");
            $result = Database::query("SELECT * FROM `$userSettingsTable` WHERE `package` = '$package' AND `name` = '$name'");
            if ($result->num_rows > 0)
            {
                while ($row = $result->fetch_assoc())
                {
                    $selected = $row["selected"];
                    if ($row["options"] === "#bool")
                    {
                        $selected = ($selected === "true" ? true : false);
                    }
                    if ($row["options"] === "#int")
                    {
                        $selected = (int)$selected;
                    }
                    return $selected;
                }
                return $default;
            }
            else
            {
                return $default;
            }
        }
        else
        {
            return $default;
        }
    }

    public static function add($package, $name, $selected, $options, $tooltip)
    {
        if (Database::isReady())
        {
            Database::connect();
            $userSettingsTable = Database::tableName("user_settings");
            Database::query("INSERT INTO `$userSettingsTable`(`package`, `name`, `selected`, `options`, `tooltip`) VALUES ('$package','$name','$selected','$options','$tooltip') 
            ON DUPLICATE KEY UPDATE `selected`='$selected'");
        }
    }
}