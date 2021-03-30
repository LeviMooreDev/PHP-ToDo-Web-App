<?php
if (Routing::url() != "database/setup")
{
    if (Database::isReady())
    {
        Database::connect();
    }
    else
    {
        header("Location: /database/setup");
    }
}
