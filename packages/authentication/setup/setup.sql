DROP TABLE IF EXISTS `authentication`;
CREATE TABLE `authentication` (
  `id` int(11) NOT NULL,
  `password` varchar(255) COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS `authentication_remember_keys`;
CREATE TABLE `authentication_remember_keys` (
  `id` int(11) NOT NULL,
  `key_` varchar(64) COLLATE utf8_bin NOT NULL,
  `ip` varchar(64) COLLATE utf8_bin NOT NULL,
  `expire` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

ALTER TABLE `authentication`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `authentication_remember_keys`
  ADD PRIMARY KEY (`id`);