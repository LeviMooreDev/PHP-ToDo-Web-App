<?php
class Authentication
{
    static function Auth(): bool
    {
        if (session_status() != PHP_SESSION_ACTIVE)
        {
            session_start();
        }
        if (isset($_SESSION["logged_in"]) && $_SESSION["logged_in"] === true)
        {
            return true;
        }

        return false;
    }

    static function Auth403()
    {
        if (!Authentication::Auth())
        {
            header('HTTP/1.0 403 Forbidden');
            die();
        }
    }
}