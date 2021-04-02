<?php
class API
{
    static $response = [];
	
	static function result($name, $data)
    {
        API::$response["result"][$name] = $data;
    }
    static function fail($message)
    {
        API::result("success", false);
        API::result("message", $message);
        API::$response["status"] = "OK";
        exit(json_encode(API::$response));
    }
    static function success($message)
    {
        API::result("success", true);
        API::result("message", $message);
        API::$response["status"] = "OK";
        exit(json_encode(API::$response));
    }
}