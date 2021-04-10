<?php
class Authentication
{
	static function Auth(): bool
	{
		if (Authentication::IsBanned())
		{
			header('HTTP/1.0 403 Banned');
			die();
		}

		if (session_status() != PHP_SESSION_ACTIVE)
		{
			session_start();
		}

		return (isset($_SESSION["authentication_logged_in"]) && $_SESSION["authentication_logged_in"] === true);
	}
	static function Auth403()
	{
		if (!Authentication::Auth())
		{
			header('HTTP/1.0 403 Forbidden');
			die();
		}
	}


	static function LoginSuccess()
	{
		Database::connect();
		$tableName = Database::tableName("authentication_banned");

		$ip = Database::escape(Authentication::GetIP());

		Database::query("INSERT INTO `$tableName` (`ip`) VALUES('$ip') ON DUPLICATE KEY UPDATE `failed_attempts`=0");
	}
	static function LoginFail($max = 10)
	{
		Database::connect();
		$tableName = Database::tableName("authentication_banned");

		$ip = Database::escape(Authentication::GetIP());

		Database::query("INSERT INTO `$tableName` (`ip`) VALUES('$ip') ON DUPLICATE KEY UPDATE `failed_attempts` = `failed_attempts` + 1");

		$result = Database::query("SELECT `id` FROM `$tableName` WHERE `ip`='$ip' AND `failed_attempts` > $max");
		if ($result->num_rows !== 0)
		{
			Database::query("UPDATE `$tableName` SET `banned`=1 WHERE `ip`='$ip'");
		}
	}

	static function IsBanned()
	{
		Database::connect();
		$tableName = Database::tableName("authentication_banned");
		$ip = Database::escape(Authentication::GetIP());

		$result = Database::query("SELECT `id` FROM `$tableName` WHERE `ip`='$ip' AND `banned`=1");
		return !($result->num_rows === 0);
	}

	static function HashedId()
	{
		if (Authentication::Auth())
		{
			return $_SESSION["authentication_hashed_id"];
		}
		die();
	}

	static function GetIP()
	{
		$ip = $_SERVER["REMOTE_ADDR"];
		return $ip;
	}
}