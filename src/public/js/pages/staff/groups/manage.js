var groupdata = $('#metadata-for-group');
var groupId = groupdata.attr('data-groupid');
$(document).on('click', '#update-group-status', function (e) {
    e.preventDefault();
    loading();
    let val = parseInt($('#group-status').val(), 10);
    var newStatusReason = $('#new-status-reason').val();
    request('/staff/groups/' + groupId + '/status', 'PATCH', {
        status: val,
        reason: newStatusReason,
    }).then(d => {
        success('This group\'s status has been updated.')
    }).catch(e => {
        warning(e.responseJSON.message);
    })
});

$(document).on('click', '#update-group-name', function (e) {
    e.preventDefault();
    loading();
    var newName = $('#new-name').val();
    var reason = $('#new-name-reason').val();
    request('/staff/groups/' + groupId + '/name', 'PATCH', {
        name: newName,
        reason: reason,
    }).then(() => {
        success(`This group's name has been updated.`, () => {
            window.location.reload();
        })
    }).catch(err => {
        warning(err.responseJSON.message);
    });
});

let statusToName = {
    0: 'Unlocked',
    1: 'Locked',
}

// load status update logs
function loadStatusLogs() {
    request(`/staff/groups/${groupId}/status?limit=100&offset=0`, 'GET').then(d => {
        let res = d.data;
        let div = $('#status-update-logs');
        if (res.length === 0) {
            return div.append(`<p>This group has not had its status updated.</p>`);
        }
        let userIds = [];
        for (const item of res) {
            userIds.push(item.userId);
            div.append(`
            <div class="row">
                <div class="col-4">
                    <p class="text-truncate"><a href="/users/${item.userId}/profile"><span data-userid="${item.userId}">Loading...</span></a></p>
                </div>
                <div class="col-4">
                    <p><span class="font-weight-bold">${statusToName[item.oldStatus]}</span> to <span class="font-weight-bold">${statusToName[item.newStatus]}</span></p>
                    <p>Reason: &quot;${item.reason}&quot;</p>
                </div>
                <div class="col-4">
                    <p class="text-truncate">${moment(item.createdAt).format('DD MMM YYYY')} (${moment(item.createdAt).fromNow()})</p>
                </div>
                <div class="col-12">
                    <hr />
                </div>
            </div>
            
            `);
        }
        setUserNames(userIds);
    }).catch(err => {
        console.error('error loading status update logs', err);
    })
}
loadStatusLogs();

// load name update logs
function loadNameLogs() {
    request(`/staff/groups/${groupId}/name?limit=100&offset=0`, 'GET').then(d => {
        let res = d.data;
        let div = $('#name-update-logs');
        if (res.length === 0) {
            return div.append(`<p>This group has not had its name updated.</p>`);
        }
        let userIds = [];
        for (const item of res) {
            userIds.push(item.userId);
            div.append(`
            <div class="row">
                <div class="col-4">
                    <p class="text-truncate"><a href="/users/${item.userId}/profile"><span data-userid="${item.userId}">Loading...</span></a></p>
                </div>
                <div class="col-4">
                    <p><span class="font-weight-bold">&quot;${item.oldName}&quot;</span> <i class="fas fa-angle-right"></i> <span class="font-weight-bold">&quot;${item.newName}&quot;</span></p>
                    <p>Reason: &quot;${item.reason}&quot;</p>
                </div>
                <div class="col-4">
                    <p class="text-truncate">${moment(item.createdAt).format('DD MMM YYYY')} (${moment(item.createdAt).fromNow()})</p>
                </div>
                <div class="col-12">
                    <hr />
                </div>
            </div>
            
            `);
        }
        setUserNames(userIds);
    }).catch(err => {
        console.error('error loading name update logs', err);
    })
}
loadNameLogs();