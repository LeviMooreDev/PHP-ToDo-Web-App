<?php
class Database
{
    private static mysqli $mysqli;

    private static string $_configFile;
    public static function getConfigFile(): string
    {
        if (!isset(Database::$_configFile))
        {
            Database::$_configFile = Packages::selfServerPath() . "/database-config.php";
        }

        return Database::$_configFile;
    }

    public static function connect()
    {
        if (!isset(Database::$mysqli) || !Database::$mysqli->ping())
        {
            include(Database::getConfigFile());

            Database::$mysqli = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE);
            if (Database::$mysqli->connect_error)
            {
                exit("Connection failed: " . Database::$mysqli->connect_error);
            }
        }
    }
    public static function disconnect()
    {
        Database::$mysqli->close();
    }

    public static function isReady()
    {
        return file_exists(Database::getConfigFile());
    }

    public static function query($query)
    {
        return Database::$mysqli->query($query);
    }
    public static function queries($queries)
    {
        $result;
        Database::$mysqli->multi_query($queries);
        do
        {
            Database::$mysqli->next_result();
            $result = Database::$mysqli->use_result();
            if (Database::$mysqli->more_results())
            {
                continue;
            }
        } while (false);
        return $result;
    }
    public static function queryFile($file)
    {
        $sql = file_get_contents($file);
        Database::$mysqli->multi_query($sql);
        while(Database::$mysqli->more_results() && Database::$mysqli->next_result())
        {
            ;
        }
    }

    public static function insert_id()
    {
        return Database::$mysqli->insert_id;
    }
    public static function escape($value)
    {
        return Database::$mysqli->real_escape_string($value);
    }
    public static function validatePOST($name)
    {
        if (!isset($_POST[$name]))
        {
            return null;
        }
        return Database::escape($_POST[$name]);
    }

    public static function tableName($name)
    {
        if(defined('DB_PREFIX'))
        {
            return DB_PREFIX . "_" . $name;
        }
        return $name;
    }
}
