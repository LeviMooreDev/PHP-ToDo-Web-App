<?php
class Encryption
{
	private static $ivs = array();
	private static $keys = array();

	public static function Start($name, $key)
	{
		Database::connect();
		$tableName = Database::tableName("encryption_keys");

		$result = Database::query("SELECT `_key` FROM `$tableName` WHERE `name` = '$name'");
		$row = $result->fetch_row();
		if(!isset($row))
		{
			$iv = base64_encode(openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc')));
			Database::query("INSERT INTO `$tableName` (`name`, `_key`) VALUES ('$name', '$iv')");
		}
		else{
			$iv = $row[0];
		}
		$iv = base64_decode($iv);

		self::$ivs[$name] = $iv;
		self::$keys[$name] = $key;
	}
	public static function Stop()
	{
		self::$ivs = array();
		self::$keys = array();
	}

    public static function Encrypt($name, $data)
	{
		return openssl_encrypt($data, 'aes-256-cbc', self::$keys[$name], 0, self::$ivs[$name]);
    }

	public static function Decrypt($name, $data)
	{
		return openssl_decrypt($data, 'aes-256-cbc', self::$keys[$name], 0, self::$ivs[$name]);
	}
}
