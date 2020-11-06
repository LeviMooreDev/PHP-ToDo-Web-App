<script>
$(document).ready(function ()
{
    NewBook.ready();
});

class NewBook
{
    static maxUploadSize = <?=preg_replace("/[^0-9]/", "", ini_get('post_max_size'))?>;
    static modal;
    static uploadButton;
    static name;
    static files;
    static progressBar;

    static ready()
    {
        NewBook.modal = $("#new-modal");
        NewBook.uploadButton = $("#new-submit");
        NewBook.name = $("#new-name");
        NewBook.files = $("#new-files");
        NewBook.progressBar = $("#new-progress-bar");

        NewBook.files.on('change', NewBook.filesSelectUpdate);
        NewBook.uploadButton.on('click', NewBook.upload);

        NewBook.progressBar.width('0%');
        NewBook.progressBar.html('0%');
    }

    static open()
    {
        NewBook.clearFiles();
        NewBook.modal.modal('show');
    }

    static upload()
    {
        var data = new FormData();
        
        //name
        var name = NewBook.name.val();
        name = name.trim();
        if(name == "")
        {
            Alert.error("The book need a name");
            return;
        }
        data.append("name", name);

        //files
        var files = NewBook.files.get(0).files;
        var count = files.length;
        if (count === 0)
        {
            Alert.error("No file selected.");
            return;
        }
        for (var i = 0; i < count; i++)
        {
            data.append("files[]", files[i]);
        }
    
        //call
        NewBook.disableForm();
        API.upload("book-hub", "edit/new", data, NewBook.progressBar,
            function(result)
            {
                if (result["success"] == true)
                {
                    Alert.success(result["message"]);
                    setTimeout(() =>
                    {
                        window.location.href = '/books/edit?id=' + result["id"];
                    }, 250);
                }
                else if (result["success"] == false)
                {
                    Alert.error(result["message"]);
                    NewBook.enableForm();
                    NewBook.clearFiles();
                }
            },
            function(result) //failed
            {
                Alert.error("Something went wrong. See console (F12) for more info.");
                NewBook.enableForm();
                NewBook.clearFiles();
            }
        );
    }

    static filesSelectUpdate()
    {
        var files = NewBook.files.get(0).files;
        var count = files.length;

        //check for unsupported files
        var supportedFormat = ['pdf', 'epub'];
        for (var i = 0; i < count; i++)
        {
            var type = files[i]["name"].split('.').pop();
            if ($.inArray(type, supportedFormat) < 0)
            {
                Alert.error("Format " + type + " not supported. Use " + supportedFormat.join(', '));
                NewBook.clearFiles();
                return;
            }
        }

        //file size
        var totalSize = 0;
        var maxMB = NewBook.maxUploadSize - 10;
        for (var i = 0; i < count; i++)
        {
            totalSize += files[i]["size"];
        }
        if (totalSize > 1048576 * maxMB)
        {
            Alert.error("Files are too big. Can only upload a combined " + maxMB + "MB");
            NewBook.clearFiles();
        }
    }

    static clearFiles()
    {
        NewBook.name.val("");
        NewBook.files.val(null);
    }

    static disableForm()
    {
        NewBook.uploadButton.attr("disabled", "disabled");
        NewBook.files.attr("disabled", "disabled");
    }

    static enableForm()
    {
        NewBook.uploadButton.removeAttr("disabled");
        NewBook.files.removeAttr("disabled");
    }
}
</script>