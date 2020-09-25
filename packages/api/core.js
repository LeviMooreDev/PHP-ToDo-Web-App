class API
{
    static call(packageName, end, data, successCallback, errorCallback)
    {
        var url = `/packages/${packageName}/api/${end}.php`;
        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            success: function (responseJson) {
                try {
                    var responseObject = JSON.parse(responseJson);
                    if (responseObject["status"] == "OK") {
                        successCallback(responseObject["result"]);
                    }
                    else {
                        errorCallback("Response did not contain a OK status.");
                        console.log(`Package: ${packageName}`);
                        console.log(`Endpoint: ${end}`);
                        console.log(`URL: ${url}`);
                        console.log(`Data: ${data}`);
                        console.log(`Json: ${responseJson}`);
                        console.log(`Object: ${responseObject}`);
                    }
                } catch (error) {
                    errorCallback("Unable to parse json.");
                    console.log(`Catch: ${error}`);
                    console.log(`Package: ${packageName}`);
                    console.log(`Endpoint: ${end}`);
                    console.log(`URL: ${url}`);
                    console.log(`Data: ${data}`);
                    console.log(`Json: ${responseJson}`);
                    console.log(`Object: ${responseObject}`);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                errorCallback("Ajax call failed.")
                console.log(`Package: ${packageName}`);
                console.log(`Endpoint: ${end}`);
                console.log(`URL: ${url}`);
                console.log(`Data: ${data}`);
                console.log(`Status code: ${xhr.status}`);
                console.log(`Status text: ${xhr.statusText}`);
                console.log(`Thrown: ${thrownError}`);
            }
        });
    }
    
    static validateForm(form) {
        form = $(form);

        form.find('input').each(function () {
            $(this).removeClass("is-invalid");
        });
    
        form.find('input').each(function () {
            if ($(this).prop('required')) {
                if (!$(this).val()) {
                    $($(this)).addClass("is-invalid");
                    return false;
                }
            }
        });
    
        return true;
    }

    static serializeForm(form)
    {
        return $(form).serialize();
    }
}