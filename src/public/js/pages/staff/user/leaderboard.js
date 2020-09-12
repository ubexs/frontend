let limit = 25;
let offset = 0;
let isLoading = false;
let sort = $('.users-search-mode').val();
let accountStatusConstraint = $('.users-status-mode').val();

const accountStatus = {
    1: `<span class="badge badge-warning">BANNED</span>`,
    2: `<span class="badge badge-warning">TERMINATED</span>`,
    0: `<span class="badge badge-success">OK</span>`,
    3: `<span class="badge badge-danger">DELETED</span>`,
}
$('#next-page').css('opacity', '0.5');
$('#previous-page').css('opacity', '0.5');
const load = () => {
    if (isLoading) {
        return;
    }
    isLoading = true;
    $('#next-page').css('opacity', '0.5');
    $('#previous-page').css('opacity', '0.5');
    request('/staff/user/leaderboard?sortBy=' + encodeURIComponent(sort) + '&limit=' + limit + '&offset=' + offset + '&accountStatus=' + accountStatusConstraint, 'GET')
        .then(d => {
            let div = $('#users').empty();
            if (d.length === 0) {
                div.append(`<div class="row"><div class="col-12"><p>Your query returned 0 results.</p></div></div>`);
                offset = 0;
                return;
            }
            if (d.length >= limit) {
                $('#next-page').css('opacity', '1');
            }
            if (offset > 0) {
                $('#previous-page').css('opacity', '1');
            }
            offset += limit;
            for (const user of d) {
                let additionalInfo = '';
                if (user.staff >= 1) {
                    additionalInfo = `<span class="badge badge-dark">STAFF</span>`;
                }
                div.append(`
                
                <div class="row" style="margin-bottom:0.5rem;">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-3">
                                        <p>${additionalInfo} <a href="/staff/user/profile?userId=${user.userId}" style="font-weight:bold;" class="text-truncate">${user.username}</a></p>
                                        <p style="margin:0;font-size:0.85rem;">UserID: ${user.userId}</p>
                                    </div>
                                    <div class="col-3">
                                        ${formatCurrency(1)} ${user.primaryBalance}<br>
                                        ${formatCurrency(2)} ${user.secondaryBalance}
                                    </div>
                                    <div class="col-3">
                                        ${moment(user.lastOnline).fromNow()}
                                    </div>
                                    <div class="col-3">
                                        ${accountStatus[user.accountStatus]}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                `);
            }
        }).finally(() => {
            isLoading = false;
        })
}
load();


$(document).on('change', '.users-search-mode', function (e) {
    e.preventDefault();
    sort = $(this).val();
    offset = 0;
    load();
});

$(document).on('change', '.users-status-mode', function (e) {
    e.preventDefault();
    accountStatusConstraint = $(this).val();
    offset = 0;
    load();
});

$(document).on('click', '#next-page', function (e) {
    e.preventDefault();
    $('html,body').scrollTop(0);
    load();
});

$(document).on('click', '#previous-page', function (e) {
    e.preventDefault();
    $('html,body').scrollTop(0);
    offset -= (limit * 2);
    if (offset < 0) {
        offset = 0;
    }
    load();
});