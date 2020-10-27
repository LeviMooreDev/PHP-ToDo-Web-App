<?php
class Authentication
{
    static function Auth(): bool
    {
        if (Authentication::IsBanned())
        {
            header('HTTP/1.0 403 Banned');
            die();
        }

        if (session_status() != PHP_SESSION_ACTIVE)
        {
            session_start();
        }

        if (isset($_SESSION["logged_in"]) && $_SESSION["logged_in"] === true)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    static function Auth403()
    {
        if (Authentication::Auth())
        {
            Authentication::RegisterSuccess();
        }
        else
        {
            Authentication::RegisterFail();
            header('HTTP/1.0 403 Forbidden');
            die();
        }
    }

    static function RegisterFail($max = 2)
    {
        Database::connect();
        $ip = Database::escape(Authentication::GetIP());

        Database::query("INSERT INTO `authentication-ips` (`ip`) VALUES('$ip') ON DUPLICATE KEY UPDATE `fails` = `fails` + 1");

        $result = Database::query("SELECT `id` FROM `authentication-ips` WHERE `ip`='$ip' AND `fails` > $max");
        if ($result->num_rows !== 0)
        {
            Database::query("UPDATE `authentication-ips` SET `banned`=1 WHERE `ip`='$ip'");
        }
    }

    static function RegisterSuccess()
    {
        Database::connect();
        $ip = Database::escape(Authentication::GetIP());

        Database::query("INSERT INTO `authentication-ips` (`ip`) VALUES('$ip') ON DUPLICATE KEY UPDATE `fails`=0");
    }

    static function IsBanned()
    {
        Database::connect();
        $ip = Database::escape(Authentication::GetIP());

        $result = Database::query("SELECT `id` FROM `authentication-ips` WHERE `ip`='$ip' AND `banned`=1");
        if ($result->num_rows === 0)
        {
            return false;
        }
        else
        {
            return true;
        }
    }


    static function GetIP()
    {
        $ip = $_SERVER["REMOTE_ADDR"];
        return $ip;
    }
}