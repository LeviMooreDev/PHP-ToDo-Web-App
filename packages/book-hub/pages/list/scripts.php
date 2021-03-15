<script src="<?= Packages::httpPath("book-hub") ?>/bootstrap-select/bootstrap-select.min.js"></script>
<script src="<?= Packages::httpPath("book-hub") ?>/asuggest/jquery.asuggest.js"></script>
<script src="<?= Packages::httpPath("book-hub") ?>/asuggest/jquery.a-tools-1.4.1.js"></script>
<script>
var coverQuality = "<?=str_replace("%","",UserSettings::get("book-hub", "cover-quality", "20%"));?>"; 
</script>