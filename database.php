<?php

/**
 * Functions to connect and query database.
 */

/**
 * Establishes a connection to the database. Remember to call disconnect when done. Login info is the inside function.
 */
function connect()
{
    global $databaseConfigFile;
    include_once($databaseConfigFile);

    global $mysqli;
    if(!$mysqli || !$mysqli->ping())
    {
        $mysqli = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE);
        if ($mysqli->connect_error)
            exit("Connection failed: " . $mysqli->connect_error);
    }
}

/**
 * Runs a query on the connected database. Remember to call connect first.
 * @param string $query The query you want to run.
 * @return mixed The result from the query.
 */
function query($query)
{
    global $mysqli;
    return $mysqli->query($query);
}

/**
 * Runs multiple queries on the connected database. Remember to call connect first.
 * @param string $queries The queries you want to run.
 */
function queries($queries)
{
    global $mysqli;
    $mysqli->multi_query($queries);
    while ($mysqli->more_results() && $mysqli->next_result()) {;}
}

/**
 * Runs a query on the connected database. Remember to call connect first.
 * @param string $query The query you want to run.
 */
function queryFile($file)
{
    queries(file_get_contents($file));
}

/**
 * Escapes a string so it is safe to use in a database query.
 * @param string $value The string you want to escape.
 * @return string The escaped string.
 */
function escape($value)
{
    global $mysqli;
    return $mysqli->real_escape_string($value);
}

/**
 * Closes the connection to the database made with connect()
 */
function disconnect()
{
    global $mysqli;
    $mysqli->close();
}

function validatePOST($name)
{
    if (!isset($_POST[$name])) {
        return null;
    }
    return escape($_POST[$name]);
}