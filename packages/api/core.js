class API
{
    static simple(packageName, end, data, successCallback, errorCallback)
    {
        var debug = true;
        var url = `/packages/${packageName}/api/${end}.php`;
        $.ajax(
        {
            type: 'POST',
            url: url,
            data: data,
            success: function(responseObject)
            {
                try
                {
                    if (responseObject["status"] == "OK")
                    {
                        successCallback(responseObject["result"]);
                    }
                    else
                    {
                        errorCallback("Response did not contain a OK status.");
                    }
                }
                catch (error)
                {
                    errorCallback("Unable to parse json.");
                    if (debug)
                    {
                        console.log(`Catch: ${error}`);
                    }
                }
                if (debug)
                {
                    console.log(`Json: ${JSON.stringify(responseObject)}`);
                }
            },
            error: function(xhr, ajaxOptions, thrownError)
            {
                errorCallback("Ajax call failed.")
                if (debug)
                {
                    console.log(`Status code: ${xhr.status}`);
                    console.log(`Status text: ${xhr.statusText}`);
                    console.log(`Thrown: ${thrownError}`);
                }
            }
        });
        if (debug)
        {
            console.log(`URL: ${url}`);
            console.log(`Data: ${data}`);
        }
    }

    static upload(packageName, end, data, progress, successCallback, errorCallback)
    {
        var debug = true;
        if (!(progress instanceof jQuery))
        {
            progress = $(progress);
        }

        var url = `/packages/${packageName}/api/${end}.php`;
        $.ajax(
        {
            url: url,
            type: 'POST',
            data: data,
            cache: false,
            contentType: false,
            cache: false,
            processData: false,
            xhr: function()
            {
                if (progress != null)
                {
                    var xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress", function(e)
                    {
                        if (e.lengthComputable)
                        {
                            var percentComplete = Math.floor(((e.loaded / e.total) * 100));
                            percentComplete = Math.min(99, percentComplete);
                            $(progress).width(percentComplete + '%');
                            $(progress).html(percentComplete + '%');
                        }
                    }, false);

                }
                return xhr;
            },
            success: function(responseObject)
            {
                try
                {
                    if (responseObject["status"] == "OK")
                    {
                        successCallback(responseObject["result"]);
                    }
                    else
                    {
                        errorCallback("Response did not contain a OK status.");
                    }
                }
                catch (error)
                {
                    errorCallback("Unable to parse json.");
                    if (debug)
                    {
                        console.log(`Catch: ${error}`);
                    }
                }
                if (debug)
                {
                    console.log(`Json: ${JSON.stringify(responseObject)}`);
                }
                $(progress).width('100%');
                $(progress).html('Upload Complete');
            },
            error: function(xhr, ajaxOptions, thrownError)
            {
                errorCallback("Ajax call failed.")
                if (debug)
                {
                    console.log(`Status code: ${xhr.status}`);
                    console.log(`Status text: ${xhr.statusText}`);
                    console.log(`Thrown: ${thrownError}`);
                }
                $(progress).width('100%');
                $(progress).html('Upload Failed');
            }
        });
        if (debug)
        {
            console.log(`URL: ${url}`);
            console.log(`Data: ${data}`);
        }
    }


    static validateForm(form)
    {
        if (!(form instanceof jQuery))
        {
            form = $(form);
        }

        form.find('input').each(function()
        {
            $(this).removeClass("is-invalid");
        });

        form.find('input').each(function()
        {
            if ($(this).prop('required'))
            {
                if (!$(this).val())
                {
                    $($(this)).addClass("is-invalid");
                    return false;
                }
            }
        });

        return true;
    }

    static serializeForm(form)
    {
        if (!(form instanceof jQuery))
        {
            form = $(form);
        }

        return form.serialize();
    }
}