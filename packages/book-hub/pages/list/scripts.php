<script src="<?= Packages::httpPath("book-hub") ?>/bootstrap-select/bootstrap-select.min.js"></script>
<script>
var coverQuality = "<?=str_replace("%","",UserSettings::get("book-hub", "cover-quality", "20%"));?>"; 
</script>