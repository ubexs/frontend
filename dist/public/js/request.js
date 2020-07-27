function request(url, method, body) {
    return new Promise((resolve, reject) => {
        ajax('');
        function ajax(csrf) {
            $.ajax({
                type: method,
                data: body,
                url: HTTPMeta.baseUrl+"/api/v1" + url,
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrf,
                },
                dataType: "json",
                xhr: function () {
                    var xhr = jQuery.ajaxSettings.xhr();
                    var setRequestHeader = xhr.setRequestHeader;
                    xhr.setRequestHeader = function (name, value) {
                        if (name == 'X-Requested-With') return;
                        setRequestHeader.call(this, name, value);
                    }
                    return xhr;
                },
                complete: function (xhr, textStatus) {
                    if (xhr.status === 200) {
                        resolve(xhr)
                    } else if (xhr.status === 403) { //Csrf Validation Failed
                        return ajax(xhr.getResponseHeader('X-CSRF-Token'));
                    } else {
                        if (!xhr.responseJSON) {
                            xhr.responseJSON = {};
                        }
                        if (typeof xhr.responseJSON.message === "undefined") {
                            xhr.responseJSON.message = "An unknown error has ocurred.";
                        }
                        reject(xhr);
                    }
                },
                failure: function (err) {
                    if (!err.responseJSON || err.responseJSON.message === null) {
                        err.responseJSON = {};
                        err.responseJSON.message = "An unknown error has ocurred.";
                    }
                    reject(err);
                }
            });
        }
    });
}