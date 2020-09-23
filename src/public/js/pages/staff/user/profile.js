$('#deleteUserBlurb').click(function () {
    // delete here
    request('/staff/user/' + $('#userId').val() + '/blurb', 'DELETE')
        .then(d => {
            success("This user's blurb has been deleted.");
            $('#userblurb').val('[ Content Deleted ]');
        })
        .catch(e => {
            warning(e.responseJSON.message);
        });
});
$('#deleteUserStatus').click(function () {
    // delete
    request('/staff/user/' + $('#userId').val() + '/status', 'DELETE')
        .then(d => {
            success("This user's status has been deleted.");
            $('#userstatus').val('[ Content Deleted ]');
        })
        .catch(e => {
            warning(e.responseJSON.message);
        });
});
$('#deleteUserForumSignature').click(function () {
    // delete
    request('/staff/user/' + $('#userId').val() + '/forum/signature', 'DELETE')
        .then(d => {
            success("This user's forum signature has been deleted.");
            $('#userforumsignature').val('[ Content Deleted ]');
        })
        .catch(e => {
            warning(e.responseJSON.message);
        });
});

$('#disableTwoFactor').click(function () {
    questionYesNo('Are you sure you\'d like to disable 2FA for this user?', (resp) => {
        request('/staff/user/' + $('#userId').val() + '/two-factor', 'DELETE')
            .then(d => {
                success('This user\'s two-factor authentication has been disabled.');
                $('#two-factor-enabled').empty().append(`<span style="font-weight:600;" id="two-factor-enabled">2-Factor Enabled: </span><span style="font-weight:100;">No</span>`);
            })
            .catch(e => {
                warning(e.responseJSON.message);
            })
    });
});

$('#deleteUserPrimaryBalance').click(function () {
    questionYesNo('Are you sure you\'d like to clear the primary balance of this user?', (resp) => {
        request('/staff/user/' + $('#userId').val() + '/clear-balance/1', 'DELETE')
            .then(d => {
                success('This user\'s balance has been cleared.');
                $('#user-balance-primary').empty().append(`0`);
            })
            .catch(e => {
                warning(e.responseJSON.message);
            })
    });
});
$('#deleteUserSecondaryBalance').click(function () {
    questionYesNo('Are you sure you\'d like to clear the secondary balance of this user?', (resp) => {
        request('/staff/user/' + $('#userId').val() + '/clear-balance/2', 'DELETE')
            .then(d => {
                success('This user\'s balance has been cleared.');
                $('#user-balance-secondary').empty().append(`0`);
            })
            .catch(e => {
                warning(e.responseJSON.message);
            })
    });
});

/**
 * Create a Comment on a User Profile
 */
$(document).on('click', '#sendStaffComment', function () {
    let comment = $('#staffCommentText').val();
    request('/staff/user/' + $('#userId').val() + '/comment', 'POST', JSON.stringify({
        'comment': comment,
    })).then(() => {
        window.location.reload();
    }).catch(e => {
        warning(e.responseJSON.message);
    });
});

/**
 * Load Associated Accounts
 */
request('/staff/user/' + $('#userId').val() + '/associated-accounts')
    .then(d => {
        const getReason = (reason) => {
            switch (reason) {
                case 1: {
                    return 'Same IP Address';
                }
            }
        }
        let ids = [];
        for (const account of d.accounts) {
            ids.push(account.userId);
            $('#associatedAccountsArray').append(`
        <div class="row" style="padding-top:1rem;">
            <div class="col-12">
                <p>Username: <a href="/staff/user/profile?userId=${account.userId}"><span data-userid="${account.userId}">N/A</span></a></p>
                <p>Reason: ${getReason(account.reason)}</p>
                <hr />
            </div>
        </div>`);
        }
        setUserNames(ids);
    })
    .catch(e => {
        $('#associatedAccountsArray').html(`<p>There was an error loading the accounts. Try again later.</p>`);
    })


$(document).on('click', '.delete-comment', function (e) {
    e.preventDefault();
    let id = parseInt($(this).attr('data-comment-id'), 10);
    console.log('delete comment', id);
    request('/staff/user/' + $('#userId').val() + '/comments/' + id, 'DELETE', {}).then(() => {
        window.location.reload();
    });
});

function onMessageContent() {
    let sub = $('#staffMessageSubject').val();
    let msg = $('#staffMessageText').val();
    if (msg.length >= 5 && sub.length >= 5) {
        $('#sendStaffMessage').removeAttr('disabled');
    } else {
        $('#sendStaffMessage').attr('disabled', 'disabled');
    }
}
$(document).on('change', '#staffMessageSubject', onMessageContent);
$(document).on('change', '#staffMessageText', onMessageContent);
$(document).on('click', '#sendStaffMessage', function (e) {
    e.preventDefault();
    questionYesNo('Are you sure you want to send a message?', function () {
        let sub = $('#staffMessageSubject').val();
        let msg = $('#staffMessageText').val();
        request('/staff/user/' + $('#userId').val() + '/message', 'POST', {
            'subject': sub,
            'message': msg,
        }).then(() => {
            success('The message has been sent.');
        }).catch(e => {
            warning(e.responseJSON.message);
        });
    });
});

$(document).on('click', '.remove-email', function (e) {
    e.preventDefault();
    questionYesNo('Are you sure you want to delete this email?', () => {
        request('/staff/user/email/' + $(this).attr('data-email-id'), 'DELETE', {}).then(d => {
            success('This email has been removed.');
            let currentLen = $('.associated-emails-table').find('tbody').children().length;
            console.log('current', currentLen);
            if (currentLen === 1) {
                $('.associated-emails-table').parent().append(`<p>This user does not have any associated emails</p>`);
                $('.associated-emails-table').remove()
            } else {
                $(this).parent().parent().remove();
            }
        })
    });
});

$(document).on('click', '#open-ban-data', function () {
    $('#ban-data-form').toggle();
});
$(document).on('click', '#open-moderation-history', function () {
    $('#moderation-history-table').toggle();
});
$(document).on('click', '#open-staff-message-board', function () {
    $('#staff-comments-list').toggle();
});

$(document).on('click', '#open-associated-accounts', function () {
    $('#associatedAccountsArray').toggle();
})

$(document).on('click', '#open-staff-permissions', function () {
    $('#staff-permissions').toggle();
})

$(document).on('click', '#open-cs-currency-list', function () {
    $('#cs-currency-list').toggle();
})

let givenCurrencyLoading = false;
let givenCurrencyOffset = 0;
let givenCurrencyLimit = 25;
let areMoreCurrencyGiven = false;
const loadGivenCurrency = () => {
    if (givenCurrencyLoading) {
        return;
    }
    givenCurrencyLoading = true;
    request('/staff/user/' + $('#userId').val() + '/received-currency?limit=' + givenCurrencyLimit + '&offset=' + givenCurrencyOffset, 'GET').then(data => {
        givenCurrencyLoading = false;
        areMoreCurrencyGiven = data.length >= givenCurrencyLimit;
        if (areMoreCurrencyGiven) {
            givenCurrencyOffset += givenCurrencyLimit;
        }
        let ids = [];
        for (const item of data) {
            ids.push(item.userIdGiver);
            $('#cs-currency-list').append(`
            
            <div class="row">
                <div class="col-6">
                    <p>${formatCurrency(item.currency)}  ${item.amount}</p>
                </div>
                <div class="col-6">
                    <p style="font-size:0.85rem;"><span data-userid="${item.userIdGiver}">Loading...</span> -  ${moment(item.date).fromNow()}</p>
                </div>
            </div>
            
            `);
        }
        setUserNames(ids);

    }).catch(err => {
        console.error('error loading currency', err);
        areMoreCurrencyGiven = false;
        givenCurrencyLoading = false;
    });
}
loadGivenCurrency();

/**
 * Load User Profile Comments
 */
let commentsLoading = false;
let areThereMoreComments = false;
const getComments = (offset) => {
    if (commentsLoading) { return; }
    commentsLoading = true;
    request('/staff/user/' + $('#userId').val() + '/comments?offset=' + offset)
        .then((d) => {
            let ids = [];
            if (d.comments.length === 0 && offset === 0) {
                $('#staffComments').append(`
            <div class="col-12">
                <p>This user does not have any comments</p>
            </div>
            `);
            }
            if (d.comments.length >= 25) {
                areThereMoreComments = true;
            }
            for (const comment of d.comments) {
                ids.push(comment.staffUserId);
                let extra = '';
                if (comment.staffUserId === userId) {
                    extra = `<p style="margin-top:1rem;color:red;cursor:pointer;" class="delete-comment" data-comment-id="${comment.userCommentId}">Delete</p>`;
                }
                $('#staffComments').append(`
            <div class="col-12" style="padding-top:0.5rem;">
                <div class="row">
                    <div class="col-12 col-md-2">
                        <img data-userid="${comment.staffUserId}" style="width:100%;max-width:150px;margin:0 auto;display: block;" />
                        <p class="text-center">
                            <span data-userid="${comment.staffUserId}" style="font-weight:600;"></span>
                        </p>
                        <p class="text-center">
                            <span>${moment(comment.dateCreated).format('DD MMM YYYY')}</span>
                        </p>
                    </div>
                    <div class="col-12 col-md-10">
                        <p>${comment.comment.escapeAllowFormattingBasic()}</p>
                        ${extra}
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <hr />
                    </div>
                </div>
            </div>
            `);
            }
            commentsLoading = false;
            setUserThumbs(ids);
            setUserNames(ids);
        }).catch((e) => {
            console.log(e);
            commentsLoading = false;
        });
}
getComments(0);

var _isDevLocked = false;
$('#is-developer').change(function (e) {
    console.log('Change');
    $(this).attr('disabled', 'disabled');
    _isDevLocked = true;
    request('/staff/user/' + $('#userId').val() + '/game-dev', 'POST', {
        isDeveloper: $(this).val() === 'true',
    }).then(d => {
        toast(true, 'This users game dev state has been modified.');
        $(this).removeAttr('disabled');
    }).catch(e => {
        $(this).removeAttr('disabled');
        warning(e.responseJSON.message);
    })
});



















$(document).on('click', '#uncheck-all-full-permissions', function (e) {
    e.preventDefault();
    $('.update-permissions-checkbox').each(function () {
        $(this).prop("checked", false);
    });
});

const loadModHistoryNames = () => {
    let ids = [];
    $('span.mod-history').each(function () {
        ids.push(parseInt($(this).attr('data-userid')));
    });
    setUserNames(ids);
}
loadModHistoryNames();


$(document).on('click', '#update-full-permissions', function (e) {
    e.preventDefault();
    var profileUserId = $('#userId').val();
    loading();
    request('/staff/permissions/' + profileUserId, 'GET').then(perms => {
        const edited = [];
        let permsProvidedByUser = [];
        $('.update-permissions-checkbox').each(function () {
            if ($(this).is(':checked')) {
                permsProvidedByUser.push({
                    name: $(this).attr('data-permission'),
                    selected: true,
                })
            } else {
                permsProvidedByUser.push({
                    name: $(this).attr('data-permission'),
                    selected: false,
                })
            }
        });

        let all = [];
        for (const edit of permsProvidedByUser) {
            let val = edit.name;
            console.log('name', val);
            let exists = perms[val];
            console.log('exists', exists);
            if (edit.selected) {
                if (typeof exists === 'undefined') {
                    all.push(request('/staff/permissions/' + profileUserId + '/' + edit.name, 'PUT').catch(err => { }));
                }
            } else {
                if (typeof exists !== 'undefined') {
                    all.push(request('/staff/permissions/' + profileUserId + '/' + edit.name, 'DELETE').catch(err => { }));
                }
            }
        }
        Promise.all(all).then(d => {
            success('The permissions for this user have been updated.');
        }).catch(err => {
            warning(err.responseJSON.message || 'An unknown error has occurred.');
            console.error(err);
            throw err;
        })


    }).catch(err => {
        console.error(err);
        throw err;
    })
});