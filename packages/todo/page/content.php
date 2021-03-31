<div id="filter-panel" class="card">
    <div class="card-body">
        <div class="row">
            <div id="toolbar-left" class="col d-inline-flex">

                <div class="d-inline control">
                    <small class="form-text text-muted">Layout</small>
                    <select id="layout" class="form-control form-control-sm">
                        <option value="covers">Covers</option>
                        <option value="table">Table</option>
                    </select>
                </div>

                <div class="d-inline control">
                    <small class="form-text text-muted">Sort by</small>
                    <select id="sort-by" class="form-control form-control-sm">
                    </select>
                </div>

                <div class="d-inline control">
                    <small class="form-text text-muted">Status</small>
                    <select id="status" class="form-control form-control-sm"></select>
                </div>
            </div>
            <div id="toolbar-right" class="col d-inline-flex">
                <div class="d-inline control w-100">
                    <small class="form-text text-muted">Search</small>
                    <input id="search-query" class="form-control" type="text" data-toggle="tooltip" data-placement="bottom" title="&#xA; AND, OR, NOT &#xA;&#xA; 'Sam Harris AND 2011 OR Dawkins' &#xA; Find Sam Herris books from 2011 or any Dawkins book &#xA;&#xA; 'Religion NOT Sam Harris' &#xA; Find all books about religion not by Sam Harris &#xA; " data-delay='{"show":"1000", "hide":"0"}' placeholder="hover for advanced search options">
                </div>

                <div class="d-inline control">
                    <small class="form-text text-muted">&nbsp;</small>
                    <select id="search-include" class="selectpicker form-control form-control-sm float-right" multiple data-selected-text-format="static" title="include" data-actions-box="true" data-width="80px"></select>
                    </select>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="root">

</div>