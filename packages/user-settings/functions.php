<?php
class UserSettings
{
    public static function get($package, $name, $default)
    {
        if (Database::isReady())
        {
            Database::connect();
            $result = Database::query("SELECT * FROM `user-settings` WHERE `package` = '$package' AND `name` = '$name'");
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
            Database::query("INSERT INTO `user-settings`(`package`, `name`, `selected`, `options`, `tooltip`) VALUES ('$package','$name','$selected','$options','$tooltip') 
            ON DUPLICATE KEY UPDATE `selected`='$selected'");
        }
    }
}