<?php
if (session_status() != PHP_SESSION_ACTIVE)
{
    session_start();
}
$_SESSION["logged_in"] = false;

$authenticationTable = Database::tableName("authentication");
$authenticationIpsTable = Database::tableName("authentication_ips");
Database::queries("
DROP TABLE IF EXISTS `$authenticationTable`;

CREATE TABLE `$authenticationTable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(255) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_bin;

DROP TABLE IF EXISTS `$authenticationIpsTable`;

CREATE TABLE `$authenticationIpsTable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `fails` int(11) NOT NULL DEFAULT '0',
  `banned` tinyint(1) NOT NULL DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ip` (`ip`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_bin;
");