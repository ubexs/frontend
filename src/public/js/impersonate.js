$(document).on('click', '#leave-impersonate', function (e) {
    e.preventDefault();
    request('/staff/user/session-impersonation', 'DELETE', {}).then(d => {
        window.location.reload();
    }).catch(err => {
        if (!err.responseJSON) {
            err.responseJSON = {
                message: 'An internal error has ocurred. Stack Info: ' + JSON.stringify(err, Object.getOwnPropertyNames(err)),
            }
        }
        warning(err.responseJSON.message);
        console.error(err);
    })
});

$(document).on('click', '#impersonate-user', function (e) {
    e.preventDefault();
    request('/staff/user/session-impersonation', 'PUT', {
        userId: parseInt($(this).attr('data-userId'), 10)
    }).then(d => {
        window.location.reload();
    }).catch(err => {
        if (!err.responseJSON) {
            err.responseJSON = {
                message: 'An internal error has ocurred. Stack Info: ' + JSON.stringify(err, Object.getOwnPropertyNames(err)),
            }
        }
        warning(err.responseJSON.message);
        console.error(err);
    })
});