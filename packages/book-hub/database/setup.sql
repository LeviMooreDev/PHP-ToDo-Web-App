DROP TABLE IF EXISTS `book-hub`;

CREATE TABLE `book-hub` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_bin NOT NULL,
  `subtitle` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `categories` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `description` text COLLATE utf8_bin,
  `authors` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `publishers` varchar(255) COLLATE utf8_bin DEFAULT NULL,
  `date` date DEFAULT NULL,
  `pages` int(11) NOT NULL DEFAULT '0',
  `page` int(11) NOT NULL DEFAULT '1',
  `status` enum('unread', 'reading', 'finished', 'abandoned') COLLATE utf8_bin NOT NULL DEFAULT 'unread',
  `isbn13` varchar(13) COLLATE utf8_bin DEFAULT NULL,
  `isbn10` varchar(10) COLLATE utf8_bin DEFAULT NULL,
  `cover-color` varchar(6) COLLATE utf8_bin NOT NULL DEFAULT 'FFFFFF',
  `created_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_bin;