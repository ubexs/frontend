$('#deleteUserBlurb').click(function() {
    // delete here
    request('/staff/user/'+$('#userId').val()+'/blurb', 'DELETE')
        .then(d => {
            success("This user's blurb has been deleted.");
            $('#userblurb').val('[ Content Deleted ]');
        })
        .catch(e => {
            warning(e.responseJSON.message);
        });
});
$('#deleteUserStatus').click(function() {
    // delete
    request('/staff/user/'+$('#userId').val()+'/status', 'DELETE')
        .then(d => {
            success("This user's status has been deleted.");
            $('#userstatus').val('[ Content Deleted ]');
        })
        .catch(e => {
            warning(e.responseJSON.message);
        });
});
$('#deleteUserForumSignature').click(function() {
    // delete
    request('/staff/user/'+$('#userId').val()+'/forum/signature', 'DELETE')
        .then(d => {
            success("This user's forum signature has been deleted.");
            $('#userforumsignature').val('[ Content Deleted ]');
        })
        .catch(e => {
            warning(e.responseJSON.message);
        });
});

$('#disableTwoFactor').click(function() {
    questionYesNo('Are you sure you\'d like to disable 2FA for this user?', (resp) => {
        request('/staff/user/'+$('#userId').val()+'/two-factor', 'DELETE')
        .then(d => {
            success('This user\'s two-factor authentication has been disabled.');
            $('#two-factor-enabled').empty().append(`<span style="font-weight:600;" id="two-factor-enabled">2-Factor Enabled: </span><span style="font-weight:100;">No</span>`);
        })
        .catch(e => {
            warning(e.responseJSON.message);
        })
    });
});

$('#deleteUserPrimaryBalance').click(function() {
    questionYesNo('Are you sure you\'d like to clear the primary balance of this user?', (resp) => {
        request('/staff/user/'+$('#userId').val()+'/clear-balance/1', 'DELETE')
        .then(d => {
            success('This user\'s balance has been cleared.');
            $('#user-balance-primary').empty().append(`0`);
        })
        .catch(e => {
            warning(e.responseJSON.message);
        })
    });
});
$('#deleteUserSecondaryBalance').click(function() {
    questionYesNo('Are you sure you\'d like to clear the secondary balance of this user?', (resp) => {
        request('/staff/user/'+$('#userId').val()+'/clear-balance/2', 'DELETE')
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
$(document).on('click', '#sendStaffComment', function() {
    let comment = $('#staffCommentText').val();
    request('/staff/user/'+$('#userId').val()+'/comment', 'POST', JSON.stringify({
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
request('/staff/user/'+$('#userId').val()+'/associated-accounts')
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
/**
 * Load User Profile Comments
 */
let commentsLoading = false;
let areThereMoreComments = false;
const getComments = (offset) => {
    if (commentsLoading) {return;}
    commentsLoading = true;
    request('/staff/user/'+$('#userId').val()+'/comments?offset='+offset)
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
            $('#staffComments').append(`
            <div class="col-12" style="padding-top:0.5rem;">
                <div class="row">
                    <div class="col-2">
                        <img data-userid="${comment.staffUserId}" style="width:100%;max-width:150px;margin:0 auto;display: block;" />
                        <p class="text-center">
                            <span data-userid="${comment.staffUserId}" style="font-weight:600;"></span>
                        </p>
                        <p class="text-center">
                            <span>${moment(comment.dateCreated).format('DD MMM YYYY')}</span>
                        </p>
                    </div>
                    <div class="col-10">
                        <p>${comment.comment.escapeAllowFormattingBasic()}</p>
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
$('#is-developer').change(function(e) {
    console.log('Change');
    $(this).attr('disabled','disabled');
    _isDevLocked = true;
    request('/staff/user/'+$('#userId').val()+'/game-dev', 'POST', {
        isDeveloper: $(this).val() === 'true',
    }).then(d => {
        toast(true, 'This users game dev state has been modified.');
        $(this).removeAttr('disabled');
    }).catch(e => {
        $(this).removeAttr('disabled');
        warning(e.responseJSON.message);
    })
});



















$(document).on('click', '#uncheck-all-full-permissions', function(e) {
    e.preventDefault();
    $('.update-permissions-checkbox').each(function() {
       $(this).attr("checked", false);
    });
});

$(document).on('click', '#update-full-permissions', function(e) {
   e.preventDefault();
   var profileUserId = $('#userId').val();
   loading();
   request('/staff/permissions/'+profileUserId, 'GET').then(perms => {
       const edited = [];
       let permsProvidedByUser = [];
       $('.update-permissions-checkbox').each(function() {
          if ($(this).is(':checked')) {
              permsProvidedByUser.push({
                  name: $(this).attr('data-permission'),
                  selected: true,
              })
          }else{
              permsProvidedByUser.push({
                  name: $(this).attr('data-permission'),
                  selected: false,
              })
          }
       });
       /*
       let includedPerms = [];
       for (const newPerm of permsProvidedByUser) {
           let found = false;
           for (const oldPerm in perms) {
               if (includedPerms.includes(oldPerm)) {
                   continue;
               }
               if (newPerm.name === oldPerm) {
                   found = true;
                   if (!newPerm.selected) {
                       edited.push(newPerm);
                       includedPerms.push(oldPerm);
                   }
               }
           }
           if (!found) {
               edited.push(newPerm);
               includedPerms.push(newPerm.name);
           }
       }

       console.log('edited',edited.length,edited);
       // bug...
       if (edited.length >= 250) {
           throw new Error('Over 250 perms to change...');
       }

*/
       let all = [];
       let pendingEditPerms = [];
       for (const edit of permsProvidedByUser) {
           if (edit.selected) {
               all.push(request('/staff/permissions/'+profileUserId+'/'+edit.name, 'PUT').catch(err => {}));
           }else{
               all.push(request('/staff/permissions/'+profileUserId+'/'+edit.name, 'DELETE').catch(err => {}));
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