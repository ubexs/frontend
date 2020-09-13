
const statuses = {
    1: `<span class="badge badge-warning">Pending Support Response</span>`,
    2: `<span class="badge badge-dark">Pending Customer Response</span>`,
    3: `<span class="badge badge-success">Closed</span>`,
    4: `<span class="badge badge-warning">Staff Need More Time</span>`,
}
let searchStatus = $('.ticket-search-mode').val();
const sleep = (amt) => {
    return new Promise(res => {
        setTimeout(res, amt);
    })
}

$(document).on('change', '.ticket-search-mode', function (e) {
    e.preventDefault();
    let val = $(this).val();
    searchStatus = val;
    loadTickets();
});
let currentTicketsResponse = [];
const loadTickets = () => {
    let url = '/staff/support/tickets?status=' + searchStatus;
    request(url, 'GET')
        .then(d => {
            currentTicketsResponse = d;
            let t = $('#tickets').empty();
            if (d.length === 0) {
                return t.append(`<p>Thare are no tickets at this time.</p>`);
            }
            let ids = [];
            for (const ticket of d) {
                ids.push(ticket.userId);
                t.append(`
                <div class="row" style="margin-bottom:0.5rem;">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="ticket-click" data-ticket-id="${ticket.ticketId}" data-open="false" style="cursor:pointer;">
                                    <div class="row">
                                        <div class="col-8 ticket-overview">
                                            <p style="font-weight: bold">${ticket.ticketTitle}</p>
                                            <p style="font-size:0.75rem;">Created ${moment(ticket.createdAt).fromNow()}</p>
                                            <p style="font-size:0.75rem;">By <a href="/staff/user/profile?userId=${ticket.userId}"><span data-userid="${ticket.userId}">Loading...</span></a></p>
                                        </div>
                                        <div class="col-4">
                                            <p style="text-align:right;">${statuses[ticket.ticketStatus]}</p>
                                        </div>
                                    </div>
                                    <div class="row ticket-data-row"></div>
                                </a>
                            </div>
                        </div>
                    </div>  
                </div>
                
                `);
            }
            setUserNames(ids);
        }).catch(e => {
            console.error('fetch tickets error', e);
        });
}
loadTickets();
$(document).on('click', '.ticket-close', function (e) {
    e.preventDefault();
    let par = $(this).parent().parent().parent();
    if ($(par).attr('data-loading') === 'true') {
        console.log('loading');
        return;
    }
    if ($(par).attr('data-open') === 'true') {
        console.log('empty');
        $(par).find('div.row.ticket-data-row').first().empty();
        $(par).attr('data-open', 'false');
        $(par).attr('data-loading', 'true');
        setTimeout(() => {
            $(par).attr('data-loading', 'false');
        }, 500);
        $(par).css('cursor', 'pointer');
        $(this).remove();
    }
});
$(document).on('click', 'div.ticket-click', function (e) {
    // e.preventDefault();
    console.log('ticket click');
    let ticketId = parseInt($(this).attr('data-ticket-id'), 10);
    let ticketInfo = currentTicketsResponse.filter(val => {
        return val.ticketId === ticketId;
    })[0] || {};
    if ($(this).attr('data-loading') === 'true') {
        return;
    }
    let isOpen = $(this).attr('data-open') === 'true';
    if (isOpen) {
        console.log('is open');
        return;
        // Close it
        $(this).find('div.row.ticket-data-row').first().empty();
        $(this).attr('data-open', 'false');
    } else {
        console.log('is closed');
        $(this).css('cursor', 'default');
        $(this).find('.ticket-overview').first().append(`<span class="badge badge-warning ticket-close" style="cursor:pointer;">Hide Replies</span>`);
        // Open it
        $(this).css('opacity', '0.5').attr('data-open', 'true').attr('data-loading', 'true');
        let dat = $(this).find('div.row.ticket-data-row').first();
        let ticketMeta = dat.append(`<div class="col-12 ticket-meta" style="margin-top:1rem;"></div>`).find(`.ticket-meta`);
        ticketMeta.append(`
        
            <p class="support-ticket-text-box">${ticketInfo.ticketBody}</p>
            <hr />
        
        `);
        let ticketReplies = dat.append(`<div class="col-12 ticket-replies"></div>`).find(`.ticket-replies`);
        Promise.all([
            sleep(250),
            request('/staff/support/ticket/' + ticketId + '/replies', 'GET').then(d => {
                if (d.length === 0) {
                    ticketReplies.append(`
                            <p>There are 0 replies to this ticket.</p>
                    `);
                } else {
                    let ids = [];
                    for (const reply of d) {
                        ids.push(reply.userId);
                        ticketReplies.append(`
                        
                        <p style="font-weight:bold;font-size:0.85rem;margin-bottom:0.5rem;">
                        <a href="/staff/user/profile?userId=${reply.userId}"><span data-userid="${reply.userId}">Loading...</span></a> on ${moment(reply.createdAt).format('MMM DD YYYY')}:</p>
                        <p class="support-ticket-text-box" style="margin:1rem;">${reply.ticketBody}</p>
                        <hr />
                        
                        `);
                    }
                    setUserNames(ids);
                }
                ticketReplies.append(`
                <br>
                <h4>REPLY</h4>
                <textarea class="form-control reply-body" data-id="${ticketId}" rows="4" placeholder="Reply Text." maxlength="4096"></textarea>
                <div class="row" style="margin-top:1rem;">
                    <div class="col-6">
                        <p style="font-weight:bold;font-size:0.85rem;">Reply Mode<p>
                        <select class="form-control hide-reply" data-id="${ticketId}">
                            <option value="true">Show Reply to customer</option>
                            <option value="false">Hide Reply from customer</option>
                        </select>
                    </div>
                    <div class="col-6">
                        <p style="font-weight:bold;font-size:0.85rem;">Ticket Status<p>
                        <select class="form-control reply-mode-on-ticket" data-id="${ticketId}">
                            <option value="2">Require Customer Response</option>
                            <option value="4">Require More Time</option>
                            <option value="3">Close</option>
                        </select>
                    </div>
                    <div class="col-12" style="margin-top:1rem">
                        <button class="btn btn-success submit-reply" data-id="${ticketId}">Submit</button>
                    </div>
                </div>
                
                `);
            }),
        ]).finally(() => {
            $(this).css('opacity', '1').attr('data-loading', 'false');
        });
    }
});
$(document).on('click', '.submit-reply', function (e) {
    e.preventDefault();
    loading();
    let id = $(this).attr('data-id');
    let body = $('.reply-body[data-id="' + id + '"]').val();
    let reply = $(`.reply-mode-on-ticket[data-id="${id}"]`).val();
    let hideReplyMode = $(`.hide-reply[data-id="${id}"]`).val();

    let promises = [];
    promises.push(request('/staff/support/ticket/' + id + '/status', 'PATCH', {
        'status': reply,
    }));
    if (body) {
        promises.push(request('/staff/support/ticket/' + id + '/reply', 'POST', {
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

/*
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
*/
