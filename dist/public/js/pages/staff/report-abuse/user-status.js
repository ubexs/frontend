let isLoading = false;
let noReports = false;
$(document).on('click', '.confirm-status-ok', function (e) {
    e.preventDefault();
    if (isLoading) {
        return;
    }
    let reportId = parseInt($(this).attr('data-reportid'), 10);
    let userStatusId = parseInt($(this).attr('data-statusid'), 10);
    request('/staff/feed/friends/abuse-report/' + reportId + '/', 'PATCH', {
        'status': 3,
    }).then(d => {
        // yay
    })
    loadStatus();
});
$(document).on('click', '.confirm-status-bad', function (e) {
    e.preventDefault();
    if (isLoading) {
        return;
    }
    let reportId = parseInt($(this).attr('data-reportid'), 10);
    let userStatusId = parseInt($(this).attr('data-statusid'), 10);
    request('/staff/feed/friends/abuse-report/' + reportId + '/', 'PATCH', {
        'status': 2,
    }).then(d => {
        // yay
    })
    request('/staff/feed/friends/' + userStatusId + '/', 'DELETE', {}).then(d => {
        // yay
    })
    loadStatus();
});

setInterval(() => {
    if (noReports && isLoading === false) {
        loadStatus();
    }
}, 5000);

const loadStatus = () => {
    isLoading = true;
    $('div#pendingAssetsDiv').empty();
    request('/staff/feed/friends/abuse-reports', 'GET').then(d => {
        let ids = [];
        if (d.length === 0) {
            noReports = true;
            isLoading = false;
            $('div#pendingAssetsDiv').append(`<div class="col-12"><h3>There are no user status reports at this time.</h3></div>`);
            return;
        }
        noReports = false;
        let item = d[0];
        console.log(item);
        ids.push(item.userId, item.reportUserId);
        $('div#pendingAssetsDiv').append(`
            
            <div class="col-12" style="margin-bottom:1rem;">
                <div class="card">
                    <div class="card-body">
                        <p style="font-size:0.75rem;" class="font-weight-bold">Reported By: <span data-userid="${item.reportUserId}"></span> (${moment(item.createdAt).fromNow()})</p>
                        <div id="user-status">
                            <p style="white-space:pre-wrap;margin-top:1rem;" class="user-status-linkify">${xss(item.status)}</p>
                        </div>
                        <div class="row" style="margin-top:1rem;">
                            <div class="col-6">
                                <button type="button" class="btn btn-success confirm-status-ok" data-statusid="${item.userStatusId}" data-reportid="${item.reportId}" style="width: 100%;" disabled="disabled">STATUS OK</button>
                            </div>
                            <div class="col-6">
                                <button type="button" class="btn btn-danger confirm-status-bad" data-statusid="${item.userStatusId}" data-reportid="${item.reportId}" style="width: 100%;" disabled="disabled">STATUS BAD</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            `);
        if (item.status.match(/https:\/\/[a-zA-Z\d-]+\./g)) {
            request('/feed/friends/multi-get-og-info?ids='+item.userStatusId).then(d => {
                for (const thumbData of d) {
                    let htmlThing = ``;
                    console.log(thumbData);
                    if (thumbData.ogInfo) {
                        let og = thumbData.ogInfo;
                        if (og.title) {
                            htmlThing += `<p><span class="font-weight-bold">Title: </span>${xss(og.title)}</p>`;
                        }
                        if (og.description) {
                            htmlThing += `<p><span class="font-weight-bold">Description: </span>${xss(og.description)}</p>`;
                        }
                        if (og.thumbnailUrl) {
                            htmlThing += `<p><span class="font-weight-bold">Image: </span></p> <img class="hover-to-view-image" src="${xss(og.thumbnailUrl)}" />`;
                        }
                        htmlThing += `<hr />`
                    }
                    $('#user-status').append(htmlThing);
                }
                setTimeout(() => {
                    isLoading = false;
                    $('.confirm-status-bad').removeAttr('disabled');
                    $('.confirm-status-ok').removeAttr('disabled');
                }, 750);
            }).catch(e => {
                console.error(e);
                setTimeout(() => {
                    isLoading = false;
                    $('.confirm-status-bad').removeAttr('disabled');
                    $('.confirm-status-ok').removeAttr('disabled');
                }, 500);
            });
        } else {
            setTimeout(() => {
                isLoading = false;
                $('.confirm-status-bad').removeAttr('disabled');
                $('.confirm-status-ok').removeAttr('disabled');
            }, 500);
        }
        setUserNames(ids);
        $('.user-status-linkify').linkify({
            target: "_blank",
            attributes: {
                'rel': 'noopener nofollow',
            }
        })
    })
        .catch(e => {
            isLoading = false;
            console.error(e);
            warning(e.responseJSON.message);
        })
}
loadStatus()