<div class="d-flex justify-content-center">
    <div class="card">
        <h3 class="card-header">Add Books</h3>
        <div class="card-body">
            <form id="form" enctype="multipart/form-data" action="javascript:upload()">

                <div class="form-group">
                    <input type="submit" class="btn btn-primary float-right" value="Upload" name="submit" id="submit">
                    <input type="file" name="files[]" id="files" accept=".pdf" multiple required>
                </div>

                <div class="progress"><div class="progress-bar" id="progress-bar"></div></div>
            </form>
        </div>
        <div class="card-footer">
        <table id="uploadedFiles" class="table table-striped w-100">
            <thead>
                <tr>
                    <th>Uploaded files</th>
                    <th id="delete-th"></th>
                </tr>
            </thead>
            <tbody id="uploadedFiles-body">
            </tbody>
        </table>
        </div>
    </div>
</div>
<?php
$uploadFolder = Packages::serverPath("book-hub") . "/uploads/";
$files = array_diff(scandir($uploadFolder), array('..', '.'));
sort($files);
$json = json_encode($files);
echo "<script>var uploadedServerList = $json;</script>";