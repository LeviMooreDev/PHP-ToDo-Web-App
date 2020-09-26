<div class="d-flex justify-content-center">
    <div class="card">
        <h3 class="card-header">Add Books</h3>
        <div class="card-body">
            <form id="form" enctype="multipart/form-data" action="javascript:upload()">

                <div class="form-group">
                    <input type="submit" class="btn btn-primary float-right" value="Upload" name="submit">
                    <input type="file" name="file" id="file" accept=".pdf" required>
                </div>

                <div class="progress"><div class="progress-bar" id="progress-bar"></div></div>
            </form>
        </div>
        <div class="card-footer">
        <table id="uploadedFiles" class="table table-striped w-100">
            <thead>
                <tr>
                    <th>Uploaded files</th>
                </tr>
            </thead>
            <tbody id="uploadedFiles-body">
            <?php
            $uploadFolder = Packages::serverPath("book-hub") . "/uploads/";
            $files = array_diff(scandir($uploadFolder), array('..', '.'));
            sort($files);
            foreach ($files as $file)
            {
                echo "<tr>";
                echo "<td>$file</td>";
                echo "</tr>";
            }
            ?>
            </tbody>
        </table>
        </div>
    </div>
</div>