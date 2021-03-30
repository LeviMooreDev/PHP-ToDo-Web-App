<?php
$authenticationTable = Database::tableName("authentication");
if (Routing::url() === "auth/login")
{
    if (Authentication::Auth())
    {
        header("Location: /");
        die();
    }

    Database::connect();
    $result = Database::query("SELECT * FROM `$authenticationTable` LIMIT 1");
    if ($result->num_rows == 0)
    {
        header("Location: /auth/setup");
        die();
    }
}
else if (Routing::url() === "auth/setup")
{
    Database::connect();
    $result = Database::query("SELECT * FROM `$authenticationTable` LIMIT 1");
    if ($result->num_rows !== 0)
    {
        header("Location: /auth/login");
        die();
    }
}
else
{
    if (Configuration::get("protected") == true)
    {
        if (!Authentication::Auth())
        {
            header("Location: /auth/login");
            die();
        }
    }
}
