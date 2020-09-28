<?php
header('Content-Type: application/json');

include_once($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();
Database::connect();

//Get login information.
$password = Database::validatePOST("password");
$remember = Database::validatePOST("remember");

//Get password from database.
$result = Database::query("SELECT `password` FROM `authentication`");

//If the password from the user matches the one from the database.
if (password_verify($password, $result->fetch_row()[0]))
{
    //Logged the user in.
    session_start();
    $_SESSION["logged_in"] = true;

    //Generate random remember login key.
    $rememberKey = generateRandomString();
    
    //If the remember toggle was selected, added the newly generated key to the database.
    if ($remember == true)
    {
        //We are hashing the key and ip so they are not the same in the database.
        $keyHashed = hash("sha256", $rememberID);
        $ipHashed = hash("sha256", isset($_SERVER['HTTP_CLIENT_IP']) ? $_SERVER['HTTP_CLIENT_IP'] : isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR']);
        
        //The expire is 14 days for now. 
        $date = new DateTime();
        $expire = $date->getTimestamp() + 86400 * 14;
        Database::query("INSERT INTO `authentication_remember_keys`(`key_`, `ip`, `expire`) VALUES ('$keyHashed', '$ipHashed', '$expire')");

        $return["result"]["remember-key"] = $rememberKey;
    }
    
    $return["result"]["success"] = true;
}
//If the password was wrong output WRONG.
else
{
    $return["result"]["success"] = false;
}
$return["status"] = "OK";

exit(json_encode($return));

/**
 * Generates a random string. Is 100 characters long.
 * 
 * @return string The generated string.
 */
function generateRandomString()
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < 100; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}
