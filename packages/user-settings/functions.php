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
                    $value = $row["value"];
                    if ($row["data_type"] === "number")
                    {
                        $value = (int)$value;
                    }
                    else if ($row["data_type"] === "boolean")
                    {
                        $value = ($value === "true" ? true : false);
                    }
                    return $value;
                }
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

    public static function add($package, $name, $value, $type, $description)
    {
        if (Database::isReady())
        {
            Database::connect();
            Database::query("INSERT INTO `user-settings`(`name`, `package`, `value`, `data_type`, `description`) VALUES ('$name','$package','$value','$type','$description')
            ON DUPLICATE KEY UPDATE `value`='$value'");
        }
    }
}