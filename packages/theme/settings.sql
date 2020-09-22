
INSERT INTO `settings`(`name`, `value`, `data_type`, `group_`, `description`) VALUES ("always-show-sidebar","false","boolean","appearance","")
ON DUPLICATE KEY UPDATE `value`="false";

INSERT INTO `settings`(`name`, `value`, `data_type`, `group_`, `description`) VALUES ("dark-theme","false","boolean","appearance","")
ON DUPLICATE KEY UPDATE `value`="false";