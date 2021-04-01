<?php
$table = Database::tableName("tasks");
Database::queries("
CREATE TABLE IF NOT EXISTS `$table` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`done` tinyint(1) NOT NULL DEFAULT '0',
	`name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
	`description` text COLLATE utf8_unicode_ci NOT NULL,
	`list` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
	`date` date DEFAULT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
");