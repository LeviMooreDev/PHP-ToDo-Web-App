function callAPI(package, end, data, successCallback) {
    var url = `/packages/${package}/api/${end}.php`;
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
                    messageError("Something went wrong. See console (F12) for more info.");
                    console.log("API call error: START");
                    console.log(`Package: ${package}`);
                    console.log(`Endpoint: ${end}`);
                    console.log(`URL: ${url}`);
                    console.log(`Data: ${data}`);
                    console.log(`Json: ${responseJson}`);
                    console.log(`Object: ${responseObject}`);
                    console.log("API call error: END");
                }
            } catch (error) {
                messageError("Something went wrong. See console (F12) for more info.");
                console.log("API call error: START");
                console.log(`Catch: ${error}`);
                console.log(`Package: ${package}`);
                console.log(`Endpoint: ${end}`);
                console.log(`URL: ${url}`);
                console.log(`Data: ${data}`);
                console.log(`Json: ${responseJson}`);
                console.log(`Object: ${responseObject}`);
                console.log("API call error: END");
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            messageError("Something went wrong. See console (F12) for more info.");
            console.log("API call error: START");
            console.log(`Package: ${package}`);
            console.log(`Endpoint: ${end}`);
            console.log(`URL: ${url}`);
            console.log(`Data: ${data}`);
            console.log(`Status code: ${xhr.status}`);
            console.log(`Status text: ${xhr.statusText}`);
            console.log(`Thrown: ${thrownError}`);
            console.log("API call error: END");
        }
    });
}
function validateForm(form) {
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