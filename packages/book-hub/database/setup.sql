DROP TABLE IF EXISTS `book-hub`;

CREATE TABLE `book-hub` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `subtitle` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `categories` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `authors` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `publisher` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `date` date DEFAULT NULL,
  `page` int(11) NOT NULL DEFAULT '1',
  `status` enum('unread','reading','finished') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'unread',
  `ISBN13` varchar(13) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ISBN10` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;