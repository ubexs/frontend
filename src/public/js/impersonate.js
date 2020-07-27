$(document).on('click', '#leave-impersonate', function(e) {
    e.preventDefault();
    request('/staff/user/session-impersonation', 'DELETE', {}).then(d => {
        window.location.reload();
    }).catch(err => {
        console.error(err);
    })
});
$(document).on('click', '#impersonate-user', function(e) {
    e.preventDefault();
    request('/staff/user/session-impersonation', 'PUT', {
        userId: parseInt($(this).attr('data-userId'), 10)
    }).then(d => {
        window.location.reload();
    }).catch(err => {
        console.error(err);
    })
});