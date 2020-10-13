<div class="row">
    <div class="col-2"></div>
    <div class="col-lg-8">
        <form id="form" action="javascript:submitForm()">
            <div class="card">
                <h3 class="card-header">Settings</h3>
                <div class="card-body">
                    <?php
                    Database::connect();
                    $result = Database::query("SELECT * FROM `user-settings` ORDER BY `package`, `name`");
                    Database::disconnect();
                    if ($result->num_rows > 0)
                    {
                        $package = "";
                        while ($row = $result->fetch_assoc())
                        {
                            if ($row["package"] !== $package)
                            {
                                if ($package != "")
                                {
                                    echo "<br>";
                                }

                                $package = $row["package"];
                                echo "<h4>" . ucwords($package) . "</h4>";
                            }

                            $id = $row["id"];
                            $name = $row["name"];
                            $nameLabel = ucwords(str_replace("-", " ", $name));
                            $selected = $row["selected"];
                            $options = $row["options"];
                            $tooltip = $row["tooltip"];
                            ?>

                    <div class='form-group' data-toggle="tooltip" title="<?=$tooltip?>">
                        <label for='<?= $id ?>'><?= $nameLabel ?></label>
                        <?php
                        if ($options === "#string")
                        {
                            printString($id, $selected);
                        }
                        elseif ($options === "#int")
                        {
                            printInt($id, $selected);
                        }
                        elseif ($options === "#bool")
                        {
                            printBoolean($id, $selected);
                        }
                        else
                        {
                            printDropdown($id, $selected, $options);
                        }
                        ?>
                    </div>
                    <?php }
                    } ?>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary" type="submit">Save</button>
                    <button class="btn btn-warning float-right" onclick="resetSettings()" type="button">Reset</button>
                </div>
            </div>
        </form>
    </div>
</div>

<?php
function printBoolean($id, $selected)
{
?>
    <input type='hidden' name="<?= $id ?>" value="false" />
    <div class="custom-control custom-switch">
        <input type="checkbox" class="custom-control-input" id="<?= $id ?>" name="<?= $id ?>"
            value="true" <?= ($selected === "true" ? "checked" : "") ?>>
        <label class="custom-control-label" for="<?= $id ?>"></label>
    </div>
    <?php
}
function printString($id, $selected)
{
    ?>
    <input name='<?= $id ?>' class='form-control' type='text' value='<?= $selected ?>' required>
    <?php
}
function printInt($id, $selected)
{
    ?>
    <input name='<?= $id ?>' class='form-control' type='number' value='<?= $selected ?>' required>
    <?php
}
function printDropdown($id, $selected, $options)
{
    $options = explode(",", $options);
    echo "<select name='$id' class='custom-select'>";
    foreach ($options as $index => $option)
    {
        if($option == $selected)
        {
            echo "<option value='$option' selected>$option</option>";
        }
        else
        {
            echo "<option value='$option'>$option</option>";
        }
    }
    echo "</select>";
}