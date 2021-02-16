$(document).on('click', '#createReply', function(e) {
    e.preventDefault();
    loading();
    let body = $('#body').val();
    let id = $('#ticketid').val();

    request('/support/ticket/'+id+'/reply', 'POST', {
        'body': body,
        'v2Token': grecaptcha.getResponse(),
    }).then(() => {
        window.location.href = '/support/ticket/'+id;
    })
    .catch(e => {
        console.error(e);
        return warning(e.responseJSON.message);
    })
}) 