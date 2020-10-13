DROP TABLE IF EXISTS `user-settings`;

CREATE TABLE `user-settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `package` varchar(255) COLLATE utf8_bin NOT NULL,
  `name` varchar(255) COLLATE utf8_bin NOT NULL,
  `selected` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `options` varchar(255) COLLATE utf8_bin NOT NULL,
  `tooltip` varchar(255) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `full_name` (`package`, `name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_bin;