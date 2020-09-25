<?php
class Authentication
{
    static function Auth() : bool
    {
        if (session_status() != PHP_SESSION_ACTIVE) {
            session_start();
        }
        if(isset($_SESSION["logged_in"]) && $_SESSION["logged_in"] === true)
        {
            return true;
        }
        
        //If the remember login key cookie matches one of the ones in the database, set the user to logged in without the need for a password.
        if (isset($_COOKIE["authentication-remember-key"]))
        {
            $ipHashed = hash("sha256", isset($_SERVER['HTTP_CLIENT_IP']) ? $_SERVER['HTTP_CLIENT_IP'] : isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR']);
            $keyHashed = hash("sha256", $_COOKIE["authentication-remember-key"]);
        
            //Remove all keys that are more than 14 days old before looking for a matching key.
            Database::connect();
            Database::query("DELETE FROM `authentication_remember_keys` WHERE `expire` < CURRENT_DATE()");
            if (Database::query("SELECT 1 FROM `authentication_remember_keys` WHERE `key_`='$keyHashed' AND `ip`='$ipHashed'")->num_rows === 1)
            {
                $_SESSION["logged_in"] = true;
                return true;
            }
        }
        
        return false; 
    }
}