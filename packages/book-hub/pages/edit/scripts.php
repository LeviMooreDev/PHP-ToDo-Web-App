<script src="<?= Packages::httpPath("book-hub") ?>/awesomplete/awesomplete.min.js"></script>
<script>
    var maxUploadSize = <?=preg_replace("/[^0-9]/", "", ini_get('post_max_size'))?>;
</script>