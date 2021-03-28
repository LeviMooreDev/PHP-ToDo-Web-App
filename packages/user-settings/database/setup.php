<?php
$table = Database::tableName("user_settings");
Database::queries("
DROP TABLE IF EXISTS `$table`;

CREATE TABLE `$table` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `package` varchar(255) COLLATE utf8_bin NOT NULL,
  `name` varchar(255) COLLATE utf8_bin NOT NULL,
  `selected` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `options` varchar(255) COLLATE utf8_bin NOT NULL,
  `tooltip` varchar(255) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `full_name` (`package`, `name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_bin;
");

foreach ($packages as $package)
{
    $file = Packages::serverPath($package) . "/user-settings/setup.php";
    if (file_exists($file))
    {
        include($file);
    }
}