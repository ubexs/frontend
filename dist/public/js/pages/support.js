request('/support/my/tickets')
.then(d => {
    if (d.length === 0) {
        return $('#existing-tickets').find('p').text('You have not created any tickets.');
    }
    $('#existing-tickets').empty();
    for (const message of d) {
        let status = 'Awaiting Support Response';
        if (message.ticketStatus === 2) {
            status = 'Awaiting Your Response';
        }else if (message.ticketStatus === 3) {
            status = 'Closed';
        }
        $('#existing-tickets').append(`
        
        <div class="row">
            <div class="col-12 col-lg-6">
                <a href="/support/ticket/${message.ticketId}">
                    <h2 style="font-size:1rem;margin-bottom:0;">${message.ticketTitle.escape()}</h2>
                </a>
                <p>Created ${moment(message.createdAt).fromNow()}</p>
                <p>Latest Update: ${moment(message.updatedAt).fromNow()}</p>
                <p>Status: ${status}</p>
                <hr />
            </div>
        </div>
        
        `);
    }
})
.catch(e => {

})

$(document).on('click', '#createReply', function(e) {
    e.preventDefault();
    loading();
    request('/support/ticket/create', "POST", {
        'body': $('#body').val(),
        'title': $('#title').val(),
        'v2Token': grecaptcha.getResponse(),
    }).then(d => {
        window.location.reload();
    })
    .catch(e => {
        return warning(e.responseJSON.message);
    })
});