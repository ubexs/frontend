
let _metaDiv = $('#meta');
window.HTTPMeta = {
    baseUrl: _metaDiv.attr('data-api-base-url'),
}
if (HTTPMeta.baseUrl.slice(HTTPMeta.baseUrl.length - 1) === '/') {
    HTTPMeta.baseUrl = HTTPMeta.baseUrl.slice(0, HTTPMeta.baseUrl.length - 1);
}

function request(url, method, body) {
    if (typeof body === 'object') {
        body = JSON.stringify(body);
    }
    return new Promise((resolve, reject) => {
        let csrfRetry = 0;
        ajax($('#userdata').attr("data-csrf"));
        function ajax(csrf) {
            $.ajax({
                xhrFields: {
                    withCredentials: true
                },
                type: method,
                data: body,
                url: HTTPMeta.baseUrl + "/api/v1" + url,
                headers: {
                    "content-type": "application/json",
                    "x-csrf-token": csrf,
                    "accept": "application/json",
                },
                dataType: "json",
                contentType: "application/json",  // what you are sending
                xhr: function () {
                    var xhr = jQuery.ajaxSettings.xhr();
                    var setRequestHeader = xhr.setRequestHeader;
                    xhr.setRequestHeader = function (name, value) {
                        if (name === 'X-Requested-With') return;
                        setRequestHeader.call(this, name, value);
                    }
                    return xhr;
                },
                complete: function (xhr, textStatus) {
                    if (xhr.status === 200) {
                        resolve(xhr)
                    } else if (xhr.status === 403) { //Csrf Validation Failed
                        csrfRetry++;
                        if (csrfRetry >= 10) {
                            return reject('CSRF Retry count exhausted');
                        }
                        console.log('csrf', xhr.getResponseHeader('x-csrf-token'));
                        $('#userdata').attr("data-csrf", xhr.getResponseHeader('x-csrf-token'));
                        return ajax(xhr.getResponseHeader('x-csrf-token'));
                    } else {
                        if (!xhr.responseJSON) {
                            xhr.responseJSON = {};
                        }
                        let code = 'ERR1';
                        if (xhr.responseJSON && typeof xhr.responseJSON.error === 'object' && typeof xhr.responseJSON.error.code === 'string') {
                            code = xhr.responseJSON.error.code;
                            xhr.responseJSON.message = errorTransform(xhr.responseJSON.error.code) + ' Code: ' + code;
                        }
                        if (typeof xhr.responseJSON.message === "undefined") {
                            xhr.responseJSON.message = "An unknown error has occurred. Code: " + code;
                        }
                        if (xhr.responseJSON && xhr.responseJSON.error && xhr.responseJSON.error.code === 'TwoStepVerificationRequired') {
                            question('<span style="font-size:1rem;font-weight:400;">For security reasons, please enter your two-factor authentication token to continue.</span>', function (code) {
                                if (!body) {
                                    body = {};
                                }
                                if (typeof body === 'string') {
                                    body = JSON.parse(body);
                                }
                                body['twoStepToken'] = code;
                                request(url, method, JSON.stringify(body)).then(d => { resolve(d) }).catch(e => { reject(e) });
                            });
                            return;
                        }
                        if (xhr.responseJSON && xhr.responseJSON.error && xhr.responseJSON.error.code === 'TwoStepRequiredVerificationFailed') {
                            question('<span style="font-size:1rem;font-weight:400;"><span style="color:red;">The code you entered was invalid.</span> For security reasons, please enter your two-factor authentication token to continue.</span>', function (code) {
                                if (!body) {
                                    body = {};
                                }
                                if (typeof body === 'string') {
                                    body = JSON.parse(body);
                                }
                                body['twoStepToken'] = code;
                                request(url, method, JSON.stringify(body)).then(d => { resolve(d) }).catch(e => { reject(e) });
                            });
                            return;
                        }
                        reject(xhr);
                    }
                },
                failure: function (err) {
                    if (!err.responseJSON) {
                        err.responseJSON = {};
                        err.responseJSON.message = "An unknown error has occurred. Code: NET1";
                    }
                    if (err.responseJSON && err.responseJSON.error && err.responseJSON.error.code) {
                        err.responseJSON.message = errorTransform(err.responseJSON.error.code);
                    }
                    reject(err);
                }
            });
        }
    });
}

// send ping
request('/auth/ping', 'POST', { url: window.location.href }).then(ok => {

}).catch(err => {
    console.error('ping event error', err);
})