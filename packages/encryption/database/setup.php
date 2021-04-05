<?php
$table = Database::tableName("encryption_keys");
Database::queries("
CREATE TABLE IF NOT EXISTS `$table` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
	`_key` varchar(24) COLLATE utf8_unicode_ci NOT NULL,
	PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
");