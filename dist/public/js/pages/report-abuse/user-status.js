$(document).on('click', '#submit', function(e) {
    loading();
    request('/report-abuse/feed/friends/'+$('#user-status-id').val(), 'POST', {
        reason: $('#report-reason').val(),
    }).then(d => {
        success('The abuse report has been sent and our moderators will review it. Thank you for keeping our website safe.', () => {
            window.history.back();
        })
    }).catch(e => {
        warning(e.responseJSON.message);
    })
});