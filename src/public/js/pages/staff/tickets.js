$(document).on('click', '.submit-reply', function(e) {
    e.preventDefault();
    loading();
    let id = $(this).attr('data-id');
    let body = $('.reply-body[data-id="'+id+'"]').val();
    let reply = $(`.reply-mode-on-ticket[data-id="${id}"]`).val();
    let hideReplyMode = $(`.hide-reply[data-id="${id}"]`).val();

    let promises = [];
    promises.push(request('/staff/support/ticket/'+id+'/status', 'PATCH', {
        'status': reply,
    }));
    if (body) {
        promises.push(request('/staff/support/ticket/'+id+'/reply', 'POST', {
            body: body,
            'visibleToClient': hideReplyMode,
        }));
    }
    Promise.all(promises).then(d => {
        window.location.reload();
    })
    .catch(e => {
        warning(e.responseJSON.message);
    })
});

request('/staff/support/tickets-awaiting-response', 'GET')
.then(d => {
    if (d.length === 0) {
        return $('#tickets').empty().append(`<p>Thare are no tickets at this time.</p>`);
    }
    d = d.slice(0,5);
    $('#tickets').empty();
    let ids = [];
    for (const tick of d) {
        $('#tickets').append(`
        
        <div class="row">
            <div class="col-12 col-lg-6">
                <h1 style="font-size:1rem;margin-bottom:0;">${tick.ticketTitle.escape()}</h1>
                <p style="margin-bottom:1rem;">${tick.ticketBody.escape()}</p>
                <p>Created ${moment(tick.createdAt).fromNow()}</p>
                <p>By: <span data-userid="${tick.userId}">Loading...</span></p>
                <h1 style="font-size:1rem;">Reply</h1>
                <textarea class="form-control reply-body" data-id="${tick.ticketId}" rows="4" placeholder="Reply Text." maxlength="4096"></textarea>
                <div class="row">
                    <div class="col-12">
                        <select class="form-control hide-reply" data-id="${tick.ticketId}">
                            <option value="true">Show Reply to customer</option>
                            <option value="false">Hide Reply from customer</option>
                        </select>
                    </div>
                    <div class="col-8">
                        <select class="form-control reply-mode-on-ticket" data-id="${tick.ticketId}">
                            <option value="2">Require Customer Response</option>
                            <option value="4">Require More Time</option>
                            <option value="3">Close</option>
                        </select>
                    </div>
                    <div class="col-4">
                        <button class="btn btn-success submit-reply" data-id="${tick.ticketId}">Submit</button>
                    </div>
                </div>
            </div>
            <div class="col-12 col-lg-6" style="height:300px;overflow-y:auto;overflow-x:auto;">
                <h1 style="font-size:1rem;">Replies</h1>
                <div class="set-replies" data-id="${tick.ticketId}">
                </div>
            </div>
            <div class="col-12">
                <hr />
            </div>
        </div>
        
        
        `);
        ids.push(userId);
    }
    setUserNames(ids);
    $('.set-replies').each(function() {
        let id = $(this).attr('data-id');
        request('/staff/support/ticket/'+id+'/replies', 'GET').then(d => {
            if (d.length === 0) {
                return $(this).append(`<p>There are no replies to this ticket.</p>`);
            }
            let userIds = [];
            for (const reply of d) {
                userIds.push(reply.userId);
                $(this).append(`
                
                <div class="row">
                    <div class="col-12">
                        <p><span data-userid="${reply.userId}">Loading...</span> - ${moment(reply.createdAt).fromNow()}</p>
                        <p>${reply.ticketBody}</p>
                        <hr />
                    </div>
                </div>
                
                `);
            }
            setUserNames(userIds);
        })
    });
})
.catch(e => {
    $('#tickets').empty().append(`<p>Thare are no tickets at this time.</p>`);
});

request('/staff/support/tickets-all', 'GET')
.then(d => {
    if (d.length === 0) {
        return $('#tickets-any-state').empty().append(`<p>Thare are no tickets at this time.</p>`);
    }
    d = d.slice(0,5);
    $('#tickets-any-state').empty();
    let ids = [];
    for (const tick of d) {
        $('#tickets-any-state').append(`
        
        <div class="row">
            <div class="col-12 col-lg-6">
                <h1 style="font-size:1rem;margin-bottom:0;">${tick.ticketTitle.escape()}</h1>
                <p style="margin-bottom:1rem;">${tick.ticketBody.escape()}</p>
                <p>Created ${moment(tick.createdAt).fromNow()}</p>
                <p>By: <span data-userid="${tick.userId}">Loading...</span></p>
                <h1 style="font-size:1rem;">Reply</h1>
                <textarea class="form-control reply-body" data-id="${tick.ticketId}" rows="4" placeholder="Reply Text." maxlength="4096"></textarea>
                <div class="row">
                    <div class="col-12">
                        <select class="form-control hide-reply" data-id="${tick.ticketId}">
                            <option value="true">Show Reply to customer</option>
                            <option value="false">Hide Reply from customer</option>
                        </select>
                    </div>
                    <div class="col-8">
                        <select class="form-control reply-mode-on-ticket" data-id="${tick.ticketId}">
                            <option value="2">Require Customer Response</option>
                            <option value="4">Require More Time</option>
                            <option value="3">Close</option>
                        </select>
                    </div>
                    <div class="col-4">
                        <button class="btn btn-success submit-reply" data-id="${tick.ticketId}">Submit</button>
                    </div>
                </div>
            </div>
            <div class="col-12 col-lg-6" style="height:300px;overflow-y:auto;overflow-x:auto;">
                <h1 style="font-size:1rem;">Replies</h1>
                <div class="set-replies-any" data-id="${tick.ticketId}">
                </div>
            </div>
            <div class="col-12">
                <hr />
            </div>
        </div>
        
        
        `);
        ids.push(userId);
    }
    setUserNames(ids);
    $('.set-replies-any').each(function() {
        let id = $(this).attr('data-id');
        request('/staff/support/ticket/'+id+'/replies', 'GET').then(d => {
            if (d.length === 0) {
                return $(this).append(`<p>There are no replies to this ticket.</p>`);
            }
            let userIds = [];
            for (const reply of d) {
                userIds.push(reply.userId);
                $(this).append(`
                
                <div class="row">
                    <div class="col-12">
                        <p><span data-userid="${reply.userId}">Loading...</span> - ${moment(reply.createdAt).fromNow()}</p>
                        <p>${reply.ticketBody}</p>
                        <hr />
                    </div>
                </div>
                
                `);
            }
            setUserNames(userIds);
        })
    });
})
.catch(e => {
    $('#tickets-any-state').empty().append(`<p>Thare are no tickets at this time.</p>`);
});