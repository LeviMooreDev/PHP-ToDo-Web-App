<?php
include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

 //Check if we already have a database settings file and if so don't allow the setup to run.
if (Database::isReady()) {
    $return["result"]["error"] = "Database setup has already been performed.";
    $return["status"] = "OK";
    exit(json_encode($return));
}
 
//Get login information
$host = $_POST["host"];
$database = $_POST["database"];
$username = $_POST["username"];
$password = $_POST["password"];

//Disable error messages and try to login to database.
ini_set('display_errors', 0);
$mysqliTest = new mysqli($host, $username, $password, $database);
ini_set('display_errors', 1);

//wait
sleep(1);

//If something went wrong write error message and stop.
if ($mysqliTest->connect_error) {
    $return["result"]["error"] = $mysqliTest->connect_error;
}
//If we were successful
else {
    $mysqliTest->close();
    try {
        $file = fopen(Database::getConfigFile(), "w") or exit("Unable to open file.");
        $content = "<?php\n";
        $content .= "define('DB_HOST', '$host');\n";
        $content .= "define('DB_DATABASE', '$database');\n";
        $content .= "define('DB_USERNAME', '$username');\n";
        $content .= "define('DB_PASSWORD', '$password');\n";
        fwrite($file, $content);
        fclose($file);

        //Create database tables.
        Database::connect();

        $packages = Packages::all();
        foreach ($packages as &$package) {
            $file = Packages::serverPath($package) . "/database/setup.sql";
            if (file_exists($file)) {
                Database::queryFile($file);
            }
        }
        foreach ($packages as &$package) {
            $file = Packages::serverPath($package) . "/database/setup.php";
            if (file_exists($file)) {
                include($file);
            }
        }

        $return["result"]["success"] = true;
    }
    //If something went wrong, delete the database settings file again.
    catch (\Throwable $e) { //PHP 7
        if (file_exists(Database::getConfigFile())) {
            chmod(Database::getConfigFile(), 0777);
            unlink(Database::getConfigFile());
        }

        $return["result"]["error"] = $e->getMessage();
    } catch (\Exception $e) { //PHP 5
        if (file_exists(Database::getConfigFile())) {
            chmod(Database::getConfigFile(), 0777);
            unlink(Database::getConfigFile());
        }

        $return["result"]["error"] = $e->getMessage();
    }
}

$return["status"] = "OK";
exit(json_encode($return));
