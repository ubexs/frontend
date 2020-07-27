$(document).on('click', '#close-ticket', function(e) {
    e.preventDefault();
    questionYesNo('Are you sure you\'d like to close this ticket? You will be unable to re-open it.', () => {
        request('/support/ticket/'+$('#ticketid').val()+'/close', "POST").then(d => {
            success('This ticket has been closed.', () => {
                window.location.href = '/support';
            })
        })
        .catch(e => {
            warning(e.responseJSON.message);
        })
    })
});