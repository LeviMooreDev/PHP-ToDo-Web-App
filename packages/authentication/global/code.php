<?php
if ($url === "auth/login") {
    connect();
    $result = query("SELECT * FROM `authentication` LIMIT 1");
    if ($result->num_rows == 0) {
        header("Location: /auth/setup");
        die();
    }
} else if ($url === "auth/setup") {
    connect();
    $result = query("SELECT * FROM `authentication` LIMIT 1");
    if ($result->num_rows !== 0) {
        header("Location: /auth/login");
        die();
    }
} else {
    if ($config["protected"] == true) {
        connect();
        if (!authCheck()) {
            header("Location: /auth/login");
            die();
        }
    }
}
