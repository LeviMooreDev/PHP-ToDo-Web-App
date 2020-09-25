DROP TABLE IF EXISTS `user-settings`;
CREATE TABLE `user-settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_bin NOT NULL,
  `package` varchar(255) COLLATE utf8_bin NOT NULL,
  `value` text COLLATE utf8_bin,
  `data_type` varchar(255) COLLATE utf8_bin NOT NULL,
  `description` varchar(255) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `full_name` (`name`,`package`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;