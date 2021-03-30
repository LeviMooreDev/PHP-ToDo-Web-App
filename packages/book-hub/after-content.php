<!-- New -->
<div id="new-modal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h3>New Book</h3>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="new-name">Book Name</label>
                    <input type="text" id="new-name" class="form-control">
                </div>
                <div class="form-group">
                    <label>Files</label><br>
                    <input type="submit" id="new-submit" class="btn btn-primary float-right" value="Upload">
                    <input type="file" id="new-files" accept=".pdf,.epub" multiple>
                </div>
            </div>
            <div class="modal-footer">
                <div class="progress w-100">
                    <div class="progress-bar" id="new-progress-bar" style="width: 0%;">0%</div>
                </div>
            </div>
        </div>
    </div>
</div>