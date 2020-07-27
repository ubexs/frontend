request('/report-abuse/metadata/reasons', 'GET').then(data => {
    for (const reason in data) {
        let key = parseInt(reason, 10);
        if (isNaN(key)) {
            continue;
        }
        let value = data[key];
        $('#report-reason').append(`<option value="${key}">${value}</option>`);
    }
})

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