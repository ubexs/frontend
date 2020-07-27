var groupdata = $('#groupdata');
var groupid = groupdata.attr("data-groupid");
/**
 * @type {boolean}
 */
var isOwner = groupdata.attr('data-isowner');
if (isOwner === 'true') {
    isOwner = true;
} else {
    isOwner = false;
}

/**
 * @type {boolean}
 */
var groupMemberApprovalRequired = groupdata.attr('data-approvalrequired');
if (groupMemberApprovalRequired === '1') {
    groupMemberApprovalRequired = true;
} else {
    groupMemberApprovalRequired = false;
}


/**
 * @type {{maxRoles: number; rank: {min: number; max: number;}; roleName: {minLength: number; maxLength: number;} rolePermissions: {id: string; name: string}[];}}
 */
var configMetaData = {};
request('/group/metadata/manage', 'GET').then(d => {
    configMetaData = d;
    loadManagePage();
})

function loadManagePage() {

    function dynamicSort(property) {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            /* next line works with strings and numbers, 
             * and you may want to customize it to your needs
             */
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }


    window.membersOffset = 0;

    window.history.replaceState(null, null, "/groups/" + groupid + "/" + groupdata.attr("data-encoded-name") + "/manage");

    request("/group/" + groupid + "/shout", "GET")
        .then(function (d) {
            $('#newShoutValue').attr("placeholder", d.shout.escape());
        })
        .catch(function (e) {

        });

    $(document).on('click', '#updateShoutClick', function () {
        var newShout = $('#newShoutValue').val();
        request("/group/" + groupid + "/shout", "PATCH", JSON.stringify({ "shout": newShout }))
            .then(function (d) {
                success("Your group shout has been posted.");
            })
            .catch(function (e) {
                warning(e.responseJSON.message);
            });
    });

    $(document).on('click', '#updateIconClick', function () {
        var form = new FormData();
        if (typeof $('#textureFile')[0].files[0] !== "undefined") {
            form.append("png", $('#textureFile')[0].files[0]);
        } else {
            warning("A Group Logo is required. Please select one, and try again");
            return;
        }
        nigeriamoment("");
        function nigeriamoment(csrf) {
            $.ajax({
                type: "PATCH",
                enctype: 'multipart/form-data',
                url: HTTPMeta.baseUrl+"/api/v1/group/" + groupid + "/icon",
                headers: {
                    "x-csrf-token": csrf,
                },
                data: form,
                processData: false,
                contentType: false,
                cache: false,
                timeout: 600000,
                success: function (data) {
                    success("The group's icon has been updated.");
                },
                error: function (e) {
                    if (e.status === 403) {
                        console.log(e);
                        var head = e.getResponseHeader("x-csrf-token");
                        if (typeof head !== "undefined") {
                            return nigeriamoment(head);
                        } else {
                            console.log("bad");
                        }
                    } else {
                        if (e.responseJSON && e.responseJSON.message) {
                            warning(e.responseJSON.message);
                        } else {
                            warning("An unknown error has occured. Try reloading the page, and trying again.");
                        }
                    }
                }
            });
        }
    });

    // Transfer Ownership
    $(document).on('click', '#transferOwnerClick', function () {
        var newOwnerUsername = $('#newOwnerValue').val();
        request("/user/username?username=" + newOwnerUsername, "GET")
            .then(function (data) {
                request("/user/" + data.userId + "/groups/" + groupid + "/role", "GET")
                    .then(function (roleinfo) {
                        if (roleinfo.rank === 0) {
                            return warning("This user doesn't seem to be in this group");
                        }
                        // Ready
                        questionYesNo("Are you sure you'd like to transfer group ownership to " + data.username.escape() + "?", function () {
                            request("/group/" + groupid + "/transfer", "PATCH", JSON.stringify({ 'userId': data.userId }))
                                .then(function () {
                                    success("Group ownership has been transferred.", function () {
                                        window.location.reload();
                                    })
                                })
                                .catch(function (e) {
                                    warning(e.responseJSON.message);
                                });
                        })
                    })
                    .catch(function (err) {
                        warning("This user doesn't seem to be in this group")
                    });
            })
            .catch(function (err) {
                warning("This user doesn't seem to exist!");
            });
    });

    // Spend Group Funds
    $(document).on('click', '#spendGroupFunds', function () {
        var usernameToGive = $('#payoutUsername').val();
        var amount = parseInt($('#amountOfFunds').val());
        if (!amount) {
            return warning("Please enter a valid amount.");
        }
        var currency = parseInt($('#currencyType').val());
        request("/user/username?username=" + usernameToGive, "GET")
            .then(function (data) {
                request("/user/" + data.userId + "/groups/" + groupid + "/role", "GET")
                    .then(function (roleinfo) {
                        if (roleinfo.rank === 0) {
                            return warning("This user doesn't seem to be in this group");
                        }
                        // Ready
                        questionYesNoHtml("Are you sure you'd like to payout " + formatCurrency(currency) + " " + amount + " to " + data.username.escape() + "?", function () {
                            request("/group/" + groupid + "/payout", "PUT", JSON.stringify({ 'userId': data.userId, 'amount': amount, 'currency': currency }))
                                .then(function () {
                                    success("This user has been paid out.", function () {
                                        window.location.reload();
                                    })
                                })
                                .catch(function (e) {
                                    warning(e.responseJSON.message);
                                });
                        })
                    })
                    .catch(function (err) {
                        warning("This user doesn't seem to be in this group")
                    });
            })
            .catch(function (err) {
                warning("This user doesn't seem to exist!");
            });
    });

    $(document).on('click', '#updateGroupDescription', function () {
        var desc = $('#groupDescriptionText').val();
        request("/group/" + groupid + "/description", "PATCH", JSON.stringify({ "description": desc }))
            .then(function (d) {
                success("Your group description has been updated.");
            })
            .catch(function (e) {
                warning(e.responseJSON.message);
            });
    });

    function getGroupRoleManageHtml(arr) {
        var create = false;
        if (arr["type"] === "create") {
            create = true;
        }
        var viewGroupWall = "";
        var postGroupWall = "";
        var getShout = "";
        var postShout = "";
        var manage = "";
        var perms = arr.permissions;
        if (!perms) {
            perms = {};
        }
        if (perms.getWall === 0) {
            viewGroupWall = 'selected="selected"';
        }
        if (perms.postWall === 0) {
            postGroupWall = 'selected="selected"';
        }
        if (perms.getShout === 0) {
            getShout = 'selected="selected"';
        }
        if (perms.postShout === 0) {
            postShout = 'selected="selected"';
        }
        if (perms.manage === 0) {
            manage = 'selected="selected"';
        }
        let deleteHtml = '';
        if (!create) {
            deleteHtml = `<button type="button" class="btn btn-small btn-danger" id="deleteRoleset" data-id=` + arr.roleSetId + `>Delete</button>`;
        }
        $('#groupRolesOptionsDisplay').empty();
        $('#groupRolesOptionsDisplay').html(`
<div class="col-6">
                                                    <small class="form-text text-muted">Role Name</small>
                                                    <input type="text" class="form-control" id="newRoleName" placeholder="" value="`+ arr.name.escape() + `">
                                                </div>
                                                <div class="col-6">
                                                    <small class="form-text text-muted">Rank Value (between 1-254)</small>
                                                    <input type="text" class="form-control" id="newRoleValue" placeholder="" value="`+ arr.rank + `">
                                                </div>
                                                <div class="col-12">
                                                    <small class="form-text text-muted">Role Description</small>
                                                    <input type="text" class="form-control" id="newRoleDescription" placeholder="" value="`+ arr.description.escape() + `">
                                                </div>
                                                <div class="col-6 col-md-4">
                                                    <small class="form-text text-muted">View Group Wall</small>
                                                    <select class="form-control" id="getGroupWall">
                                                        <option value="1">Yes</option>
                                                        <option value="0" `+ viewGroupWall + `>No</option>
                                                    </select>
                                                </div>
                                                <div class="col-6 col-md-4">
                                                    <small class="form-text text-muted">Post to Group Wall</small>
                                                    <select class="form-control" id="postGroupWall">
                                                        <option value="1">Yes</option>
                                                        <option value="0" `+ postGroupWall + `>No</option>
                                                    </select>
                                                </div>
                                                <div class="col-6 col-md-4">
                                                    <small class="form-text text-muted">View Shout</small>
                                                    <select class="form-control" id="getShout">
                                                        <option value="1">Yes</option>
                                                        <option value="0" `+ getShout + `>No</option>
                                                    </select>
                                                </div>
                                                <div class="col-6 col-md-4">
                                                    <small class="form-text text-muted">Update Shout</small>
                                                    <select class="form-control" id="postShout">
                                                        <option value="1">Yes</option>
                                                        <option value="0" `+ postShout + `>No</option>
                                                    </select>
                                                </div>
                                                <div class="col-6 col-md-4">
                                                    <small class="form-text text-muted">Manage Group</small>
                                                    <select class="form-control" id="manageGroup">
                                                        <option value="1">Yes</option>
                                                        <option value="0" `+ manage + `>No</option>
                                                    </select>
                                                </div>
                                                <div class="col-6 col-md-4" style="margin-top:1rem;">
                                                    
                                                    <button type="button" class="btn btn-small btn-success" id="updateRoleset" data-create="`+ create + `" data-id=` + arr.roleSetId + `>Submit</button>

                                                    ${deleteHtml}
                                                </div>
`);
    }

    // Setup Member Update
    request("/group/" + groupid + "/roles", "GET")
        .then(function (d) {
            var membersLoaded = false;
            window.roles = d;
            var sel = true;
            d.forEach(function (k) {
                if (k.rank !== 0) {

                    $('#groupRolesSelection').append("<option value=" + k.roleSetId + ">" + k.name.escape() + "</option>");
                    if (!membersLoaded) {
                        loadMembers(k.roleSetId);
                        membersLoaded = true;
                    }

                    if (sel) {
                        $('#roleset-selection').prepend(`
                    
                        <div class="col-12">
                            <p data-id="${k.roleSetId}">${xss(k.name)}</p>
                        </div>
                        
                        `);
                        sel = false;
                        getGroupRoleManageHtml(k);
                    } else {
                        $('#roleset-selection').prepend(`
                    
                        <div class="col-12">
                            <p style="opacity: 0.5;" data-id="${k.roleSetId}">${xss(k.name)}</p>
                        </div>
                        
                        `);
                    }

                }
            });
            if (d.length < configMetaData.maxRoles) {
                $('#create-role').prepend(`<div class="col-12">
                <button id="create-new-role" style="margin-top:1rem;font-size:0.75rem;" class="btn btn-outline-success">Create New Role</button>
            </div>`);
            }
        })
        .catch(function (e) {
            console.log(e);
            $('#noMembersDisplay').show();
        });


    $(document).on('click', '#updateRoleset', function () {
        var roleid = parseInt($(this).attr("data-id"), 10);
        var uploadData = {
            "name": $('#newRoleName').val(),
            "rank": parseInt($('#newRoleValue').val()),
            "description": $('#newRoleDescription').val(),
            "permissions": {
                "getWall": parseInt($('#getGroupWall').val()),
                "postWall": parseInt($('#postGroupWall').val()),
                "getShout": parseInt($('#getShout').val()),
                "postShout": parseInt($('#postShout').val()),
                "manage": parseInt($('#manageGroup').val()),
            }
        };
        var check = $(this).attr("data-create");
        if (check === "false") {
            request("/group/" + groupid + "/role/" + roleid, "PATCH", uploadData)
                .then(function (d) {
                    toast(true, "This role has been updated.");
                    $('#roleset-selection').empty();
                    uploadData.roleSetId = roleid;
                    // simple ui bugs that need to be fixed...
                    window.roles.forEach(role => {
                        if (role.roleSetId === uploadData.roleSetId) {
                            if (role.rank === 255) {
                                uploadData.rank = 255;
                                uploadData.permissions.getShout = 1;
                                uploadData.permissions.getWall = 1;
                                uploadData.permissions.postWall = 1;
                                uploadData.permissions.postShout = 1;
                                uploadData.permissions.manage = 1;
                            }
                        }
                    });
                    let newArr = [];
                    window.roles.forEach(ar => {
                        if (ar.roleSetId !== roleid) {
                            newArr.push(ar);
                        }
                    });
                    newArr.push(uploadData);
                    window.roles = newArr.sort(dynamicSort('-rank'));
                    window.roles.forEach(role => {
                        if (role.rank === 0) {
                            return;
                        }
                        if (role.roleSetId === uploadData.roleSetId) {
                            $('#roleset-selection').append(`
                    
                    <div class="col-12">
                        <p data-id="${role.roleSetId}">${xss(role.name)}</p>
                    </div>
                    
                    `);
                        }else{
                            $('#roleset-selection').append(`
                    
                    <div class="col-12">
                        <p data-id="${role.roleSetId}" style="opacity:0.5;">${xss(role.name)}</p>
                    </div>
                    
                    `);
                        }
                    });
                    getGroupRoleManageHtml(uploadData);
                })
                .catch(function (e) {
                    console.log(e);
                    toast(false, e.responseJSON.message);
                });
        } else {
            request("/group/" + groupid + "/role", "PUT", uploadData)
                .then(function (d) {
                    toast(true, 'Role created!');
                    $('#roleset-selection').empty();
                    uploadData.roleSetId = d.roleSetId;
                    window.roles.push(uploadData);
                    window.roles = window.roles.sort(dynamicSort('-rank'));
                    window.roles.forEach(role => {
                        if (role.rank === 0) {
                            return;
                        }
                        if (role.roleSetId === uploadData.roleSetId) {
                            $('#roleset-selection').append(`
                    
                    <div class="col-12">
                        <p data-id="${role.roleSetId}">${xss(role.name)}</p>
                    </div>
                    
                    `);
                        }else{
                            $('#roleset-selection').append(`
                    
                    <div class="col-12">
                        <p data-id="${role.roleSetId}" style="opacity:0.5;">${xss(role.name)}</p>
                    </div>
                    
                    `);
                        }
                    });
                    getGroupRoleManageHtml(uploadData);
                })
                .catch(function (e) {
                    console.log(e);
                    toast(false, e.responseJSON.message);
                });
        }
    });
    $(document).on('click', '#create-new-role', function (e) {
        $('#roleset-selection p').each(function (el) {
            $(this).css('opacity', '0.5')
        });
        getGroupRoleManageHtml({
            "type": "create",
            "name": "New Role",
            "description": "New Role",
            "rank": 1,
        });
    });
    $(document).on('click', '#roleset-selection p', function (e) {
        var val = parseInt($(this).attr('data-id'));
        $('#roleset-selection p').each(function (el) {
            $(this).css('opacity', '0.5')
        });
        $(this).css('opacity', '1');
        window.roles.forEach(function (k) {
            if (k.roleSetId === val) {
                getGroupRoleManageHtml(k);
            }
        })

    });

    $('#groupRolesSelection').change(function () {
        window.membersOffset = 0;
        var roleid = parseInt($(this).val());
        loadMembers(roleid);
        $('#hasMembersDisplay').empty();
    });
    $(document).on('change', '.rankUser', function () {
        var role = parseInt($(this).val());
        var self = $(this);
        request("/group/" + groupid + "/member/" + $(this).attr("data-userid"), "PATCH", JSON.stringify({ "role": role }))
            .then(function (d) {
                toast(true, "This user has been ranked.");
                self.parent().remove();
            })
            .catch(function (e) {
                toast(false, e.responseJSON.message);
            })
    });

    $(document).on('click', '.kick-user', function (e) {
        e.preventDefault();
        let userId = $(this).attr('data-userid-to-kick');
        questionYesNo('Are you sure you\'d like to kick this user?', () => {
            loading();
            request('/group/' + groupid + '/member/' + userId, 'DELETE', {}).then(d => {
                loadMembers(window.curId);
                toast(true, 'User has been kicked.');
            })
                .catch(e => {
                    warning(e.responseJSON.message);
                })
        });
    });

    $(document).on('click', '#updateGroupApprovalRequiredStatus', function (e) {
        e.preventDefault();
        loading();
        request('/group/' + groupid + '/approval-required', 'PATCH', {
            approvalStatus: parseInt($('#groupApprovalRequired').val(), 10),
        }).then(d => {
            success('Member approval status has been updated for this group.', () => {
                window.location.reload();
            });
        })
            .catch(e => {
                warning(e.responseJSON.message);
            })
    });

    function loadMembers(id) {
        window.curId = id;
        $('#noMembersDisplay').hide();
        $('#hasMembersDisplay').hide();
        request("/group/" + groupid + "/members/" + id + "?sort=desc&offset=" + window.membersOffset + "&limit=12", "GET")
            .then(function (d) {
                if (d.total === 0) {
                    $('#noMembersDisplay').show();
                } else {
                    $('#hasMembersDisplay').show();
                }
                $('#hasMembersDisplay').empty();
                var userIdsForReq = [];
                d["members"].forEach(function (k) {
                    var selects = "";
                    window.roles.forEach(function (rankv) {
                        if (rankv.rank !== 0) {
                            if (rankv.roleSetId === k.roleSetId) {
                                selects += "<option selected=\"selected\" value=" + rankv.roleSetId + ">" + rankv.name.escape() + "</option>";
                            } else {
                                selects += "<option value=" + rankv.roleSetId + ">" + rankv.name.escape() + "</option>";
                            }
                        }
                    });
                    let kickButton = '';
                    if (isOwner) {
                        kickButton = '<p style="font-size: 0.75rem;color:red;cursor:pointer;" data-userid-to-kick="' + k.userId + '" class="kick-user">Kick</p>';
                    }
                    $('#hasMembersDisplay').append('<div class="col-4 col-md-3 col-lg-2">' + kickButton + '<a href="/users/' + k.userId + '/profile"><img data-userid="' + k.userId + '" style="width:100%;" /><p class="text-center text-truncate" data-userid="' + k.userId + '"></p></a><select data-userid="' + k.userId + '" class="form-control rankUser">' + selects + '</select></div>');
                    userIdsForReq.push(k.userId);
                });
                setUserThumbs(userIdsForReq);
                setUserNames(userIdsForReq);

                if (window.membersOffset !== 0) {
                    $('#loadLessMembers').show();
                } else {
                    $('#loadLessMembers').hide();
                }

                if (d["total"] - window.membersOffset >= 12) {
                    $('#loadMoreMembers').show();
                } else {
                    $('#loadMoreMembers').hide();
                }
            })
            .catch(function (e) {
                window.membersOffset = 0;
                $('#noMembersDisplay').show();
            });
    }

    $(document).on('click', '#loadMoreMembers', function () {
        window.membersOffset = window.membersOffset + 12;
        loadMembers(window.curId);
    });
    $(document).on('click', '#loadLessMembers', function () {
        window.membersOffset = window.membersOffset - 12;
        loadMembers(window.curId);
    });
    let transactionsLoading = false;
    let transactionsOffset = 0;
    const loadTransactions = () => {
        if (transactionsLoading) {
            return;
        }
        transactionsLoading = true;
        request('/economy/group/' + groupid + '/transactions?offset=' + transactionsOffset.toString(), 'GET')
            .then(d => {
                transactionsLoading = false;
                if (d.length === 0) {
                    return $('#group-transactions').empty().append('<p>This group has not had any transactions.</p>');
                }
                $('#group-transactions').append(`
        <table class="table">
            <thead>
                <tr>
                <th scope="col">#</th>
                <th scope="col">Amount</th>
                <th scope="col">Description</th>
                <th scope="col">Date</th>
                </tr>
            </thead>
            <tbody>
            
            </tbody>
        </table>`);
                for (const value of d) {
                    let curDisplay = formatCurrency(value.currency);
                    let description = value.description;
                    if (value.catalogId !== 0) {
                        description += ' <a href="/catalog/' + value.catalogId + '">[link]</a>';
                    }
                    $('#group-transactions').find('tbody').append('<tr> <th scope="row">' + value.transactionId + '</th><td>' + curDisplay + value.amount + '</td><td>' + description + '</td><td>' + moment(value.date).local().format('MMMM Do YYYY, h:mm a') + '</td></tr><tr>')
                }
                if (d.length >= 25) {
                    transactionsOffset += 25;
                    $('.loadMoreTransactionsClick').css("display", "block");
                } else {
                    $('.loadMoreTransactionsClick').hide();
                }
            })
            .catch(e => {

            });
    }
    loadTransactions();
    $(document).on('click', '.loadMoreTransactionsClick', function (e) {
        e.preventDefault();
        loadTransactions(transactionsOffset);
    });



    if (groupMemberApprovalRequired) {

        let pendingMembersOffset = 0;
        let pendingMembersLoading = false;
        function loadMembersAwaitingApproval() {
            if (pendingMembersLoading) {
                return;
            }
            $('#hasMembersPendingDisplay').empty();
            pendingMembersLoading = true;
            request('/group/' + groupid + '/join-requests?limit=12&offset=' + pendingMembersOffset)
                .then(d => {

                    if (pendingMembersOffset === 0 && d.length === 0) {
                        return $('#noMembersPendingDisplay').show();
                    }
                    $('#hasMembersPendingDisplay').show();

                    let userIdsToSetThumbsFor = [];
                    for (const user of d) {
                        userIdsToSetThumbsFor.push(user.userId);
                        $('#hasMembersPendingDisplay').append(`
                <div class="col-4 col-md-3 col-lg-2">
                <a href="/users/${user.userId}/profile"><img data-userid="${user.userId}" style="width:100%;" />
                    <p class="text-center text-truncate" data-userid="${user.userId}"></p>
                </a>
                
                    <button type="button" class="btn btn-success approveMemberJoinRequest" data-usertoapprove="${user.userId}" style="margin:0auto;display:block;width: 100%;">Approve</button>
                    <button type="button" class="btn btn-danger declineMemberJoinRequest" data-usertodecline="${user.userId}" style="margin:0auto;display:block;width: 100%;">Decline</button>
                
                </div>
                
                
                `);
                    }
                    setUserNames(userIdsToSetThumbsFor);
                    setUserThumbs(userIdsToSetThumbsFor);
                })
                .catch(e => {
                    warning(e.responseJSON.message);
                })
                .finally(() => {
                    pendingMembersLoading = false;
                })
        }
        loadMembersAwaitingApproval();

        $(document).on('click', '.approveMemberJoinRequest', function (e) {
            e.preventDefault();
            loading();
            request('/group/' + groupid + '/join-request', 'POST', {
                userId: parseInt($(this).attr('data-usertoapprove'), 10),
            })
                .then(d => {
                    toast(true, 'Member approved.');
                    loadMembersAwaitingApproval();
                }).catch(e => {
                    warning(e.responseJSON.message);
                    loadMembersAwaitingApproval();
                });
        });



    }


    $(document).on('click', '.group-settings-option', function (e) {
        e.preventDefault();

        $('.group-settings-option').css('opacity', '0.5');
        $(this).css('opacity', '1');

        $('.group-settings-panel').hide();

        $('.' + $(this).attr('data-class-to-toggle')).show();
    });

    $(document).on('click', '#deleteRoleset', function (e) {
        e.preventDefault();
        let rolesetId = parseInt($(this).attr('data-id'), 10);
        questionYesNo('Are you sure you\'d like to delete this role?', () => {
            loading();
            request('/group/' + groupid + '/roleset/' + rolesetId, 'DELETE')
                .then(d => {
                    toast(true, 'Role deleted.');
                    $('#roleset-selection').empty();
                    // simple ui bugs that need to be fixed...
                    let newArr = [];
                    window.roles.forEach(ar => {
                        if (ar.roleSetId !== rolesetId) {
                            newArr.push(ar);
                        }
                    });
                    window.roles = newArr.sort(dynamicSort('-rank'));
                    window.roles.forEach(role => {
                        if (role.rank === 0) {
                            return;
                        }
                            $('#roleset-selection').append(`
                    
                    <div class="col-12">
                        <p data-id="${role.roleSetId}" style="opacity:0.5;">${xss(role.name)}</p>
                    </div>
                    
                    `);
                        
                    });
                    getGroupRoleManageHtml({
                        "type": "create",
                        "name": "New Role",
                        "description": "New Role",
                        "rank": 1,
                    });
                })
                .catch(e => {
                    console.error(e);
                    warning(e.responseJSON.message);
                })
        });
    });

    request('/group/' + groupid + '/ownership-changes?limit=25', 'GET').then(d => {
        console.log(d);
        if (d.length === 0) {
            $('#group-ownership-changes').append(`
        
        <div class="col-12">
            <p>This group has not had any ownership changes.</p>
        </div>

        `);
        } else {
            $('#group-ownership-changes').append(`
            <div class="col-12">
                <table class="table" style="margin-bottom:0;">
                    <thead>
                        <tr>
                        <th scope="col" style="border-top: none;">Description</th>
                        <th scope="col" style="border-top: none;">Date</th>
                        </tr>
                    </thead>
                    <tbody id="groupOwnershipChangesTbody">
                    
                    </tbody>
                </table>
            </div>
        `);
            let table = $('#groupOwnershipChangesTbody');
            let ids = [];
            for (const item of d) {
                ids.push(item.actorUserId);
                ids.push(item.userId);
                let type = item.type;
                if (type === 1) {
                    table.append(`
            
                <tr>
                    <td><span data-userid="${item.actorUserId}"></span> abandoned the group, leaving nobody as the owner.</td>
                    <td>${moment(item.createdAt).fromNow()}</td>
                </tr>
                
                `);
                } else if (type === 2) {
                    table.append(`
            
                <tr>
                    <td><span data-userid="${item.actorUserId}"></span> claimed ownership of the group.</td>
                    <td>${moment(item.createdAt).fromNow()}</td>
                </tr>
                
                `);
                } else if (type === 3) {
                    table.append(`
            
                <tr>
                    <td><span data-userid="${item.actorUserId}"></span> transferred group ownership to <span data-userid="${item.userId}"></span>.</td>
                    <td>${moment(item.createdAt).fromNow()}</td>
                </tr>
                
                `);
                }
            }
            setUserNames(ids);
        }
    })
}