<div class="row">
    <div class="col-lg-2"></div>
    <div class="col-lg-8">
        <form id="form" action="javascript:submitForm()">
            <div class="card">
                <h3 class="card-header">Setup</h3>
                <?php if (Database::isReady()) : ?>
                    <div class="card-body">
                        <p>The setup process has already been performed. If you want to run it again you need to delete the database config file before returning to this page.</p>
                    </div>
                    <div class="card-footer">
                        <a href="/" class="btn btn-primary">Go to home page</a>
                    </div>
                <?php else : ?>
                    <div class="card-body">
                        <p>You need to setup your database before you can use the web app. You only have to do this the first time. Please enter your database and website login information below and click the setup button. When you click the setup button, your login information will be saved, and the necessary database tables will be created.</p>

                        <h5>Database</h5>
                        <div class="form-group">
                            <label for="host">Host</label>
                            <input id="host" name="host" class="form-control" type="text" placeholder="host" required>
                        </div>
                        <div class="form-group">
                            <label for="database">Database</label>
                            <input id="database" name="database" class="form-control" type="text" placeholder="database" required>
                        </div>
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input id="username" name="username" class="form-control" type="text" placeholder="username" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input id="password" name="password" class="form-control" type="password" placeholder="password" required>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button name="submit" class="btn btn-primary" type="submit">Setup Database</button>
                    </div>
                <?php endif; ?>
            </div>
        </form>
    </div>
</div>