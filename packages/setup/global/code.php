<?php
if ($url != "setup") {
    if (!file_exists($databaseConfigFile)) {
        header("Location: /setup");
        die();
    }
} 