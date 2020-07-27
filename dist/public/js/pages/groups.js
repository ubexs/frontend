const groupData = groupData
var groupid = parseInt(groupData.attr("data-groupid"));

$(document).on('click', '#groupLeave', function() {
    if (parseInt(groupData.attr('data-groupowner')) === parseInt(userId)) {
        questionYesNo('Are you sure you would like to abbandon this group?', function() {
            cont();
        });
    }else{
        cont();
    }
    function cont() {
        request("/group/"+groupid+"/membership", "DELETE")
            .then(function() {
                success("You have left this group.", function() {
                    window.location.reload();
                });
            })
            .catch(function(e) {
                warning(e.responseJSON.message, function() {
                    window.location.reload();
                });
            });
    }
});

if ($('#userdata').attr("data-authenticated") === "true") {
    request("/user/"+$('#userdata').attr("data-userid")+"/groups", "GET")
        .then(function(d) {
            $('#groupDisplayCol').attr("class", "col-12 col-lg-8");
            $('#UserGroupsDiv').show();
            $('#groupDisplayCol').show();
            var groupIds = [];
            d["groups"].forEach(function(k) {
                groupIds.push(k.groupIconCatalogId);
                $('#myGroups').append('<div class="row" style="margin-bottom:0.75rem;margin-top:0.75rem;"><div class="col-12 col-md-4" style="padding-right:0;"><img style="width:100%;border-radius:25%;" data-catalogid="'+k.groupIconCatalogId+'" /></div><div class="col-6 col-md-8" style="padding-left:0.5rem;"><p class="text-truncate" style="font-size:0.85rem;padding-left:0;"><a href="/groups/'+k.groupId+'/'+urlencode(k.groupName)+'">'+k.groupName.escape()+'</a></p></div></div>');
            });
            setCatalogThumbs(groupIds);
        })
        .catch(function(e) {
            console.log(e);
            $('#UserGroupsDiv').attr('style', 'display:none !important;');
            $('#groupDisplayCol').attr("class", "col-12 col-lg-10");
            $('#groupDisplayCol').show(); 
        });
}else{
    $('#UserGroupsDiv').hide();
    $('#groupDisplayCol').attr("class", "col-12 col-lg-10");
    $('#groupDisplayCol').show(); 
}

const loadGoup = () => {
    window.memberOffset = 0;
    window.wallLoading = false;
    window.wallOffset = 0;
    setUserNames([parseInt(groupData.attr("data-groupowner"))]);

    window.history.replaceState(null, null, "/groups/"+groupData.attr("data-groupid")+"/"+groupData.attr("data-encoded-name")+"/");

    var members = parseInt($('#memberCountSpan').attr("data-membercount"));
    $('#memberCountSpan').html(bigNum2Small(members));

    $('#aboutCategory').click(function() {
        $('#aboutSection').show();
        $('#relationsSection').hide();
        $('#catalogSection').hide();
    });

    $('#relationsCategory').click(function() {
        $('#relationsSection').show();
        $('#aboutSection').hide();
        $('#catalogSection').hide();
    });

    $('#catalogCategory').click(function() {
        $('#relationsSection').hide();
        $('#aboutSection').hide();
        $('#catalogSection').show();
    });

    $(document).on('click', '#groupJoin', function() {
        if ($('#userdata').attr("data-authenticated") === "true") {
            request("/group/"+groupid+"/membership", "PUT")
                .then(function(d) {
                    if (d.doesUserRequireApproval) {
                        success("You have requested to join this group. This group requires members to be approved by an admin.", function() {
                            window.location.reload();
                        });
                    }else{
                        success("You have joined this group.", function() {
                            window.location.reload();
                        });
                    }
                })
                .catch(function(e) {
                    console.log(e);
                    warning(e.responseJSON.message, function() {
                        window.location.reload();
                    });
                });
        }else{
            window.location.href = "/login?return=/groups/"+groupid+"/"
        }
    });

    $(document).on('click', '#claimOwnership', function(e) {
        e.preventDefault();
        if ($('#userdata').attr("data-authenticated") === "true") {
            request("/group/"+groupid+"/claim", "PUT")
                .then(function(d) {
                    success("You have claimed ownership of this group.", function() {
                        window.location.reload();
                    });
                })
                .catch(function(e) {
                    warning(e.responseJSON.message, function() {
                        window.location.reload();
                    });
                });
        }else{
            window.location.href = "/login?return=/groups/"+groupid+"/"
        }
    });

    $(window).on("scroll", function() {
        if($(window).scrollTop() + $(window).height() > $(document).height() - $('div#footerUpper').innerHeight()) {
            if (window.wallOffset >= 25 && window.wallLoading === false && window.managegroup !== undefined) {
                loadWall();
            }
        }
    });

    $(document).on('click', '.deletePost', function() {
        var id = parseInt($(this).attr("data-id"));
        var del = $(this).parent().parent();
        request("/group/"+groupid+"/wall/"+id+"/", "DELETE")
            .then(function(d) {
                success("This wall post has been deleted.");
                del.remove();
            })
            .catch(function(e) {
                warning(e.responseJSON.message);
            });
    });

    function loadWall() {
        window.wallLoading = true;
        request("/group/"+groupid+"/wall?offset="+window.wallOffset+"&sort=desc")
            .then(function(d) {
                if (window.wallOffset === 0) {
                    $('#hasGroupWallPostsDisplay').show();
                }
                var userids = [];
                d.forEach(function(k) {
                    userids.push(k.userId);
                    var customstyle = 'style="width:100%;padding-top:0.15rem;padding-bottom:0.15rem;font-size:0.75rem;margin-top:0.5rem;"';
                    if (!window.managegroup) {
                        customstyle = 'style="display:none;width:100%;margin-top:0.5rem;padding-top:0.15rem;padding-bottom:0.15rem;font-size:0.75rem;"'; 
                    }
                    if (!k.wallPost) {
                        k.wallPost = "";
                    }
                    $('#hasGroupWallPostsDisplay').append('<div class="row"><div style="" class="col-6 col-sm-3 col-lg-2"><img style="width:100%;" data-userid="'+k.userId+'"><a class="normal" href="/users/'+k.userId+'/profile"><h6 class="text-center text-truncate" data-userid="'+k.userId+'" style="font-size:0.75rem;font-weight:600;"></h6></a><button type="button" class="btn btn-outline-success deletePost" data-id="'+k.wallPostId+'" '+customstyle+'>Delete</button></div><div class="col-6 col-sm-9 col-lg-10"><p style="font-size:0.85rem;white-space: pre-wrap;font-weight:500;">'+xss(k.wallPost)+'</p><p class="text-left text-truncate" style="font-size: 0.75rem;font-weight:600;opacity:0.45;">'+moment(k["date"]).fromNow()+'</p></div><div class="col-12"><hr /></div></div>');
                });
                setUserThumbs(userids);
                setUserNames(userids);
                if (d.length >= 25) {
                    window.wallOffset += 25;
                }else{
                    window.wallOffset = 0;
                }
                window.wallLoading = false;
            })
            .catch(function(e) {
                if (window.wallOffset === 0) {
                    $('#noGroupWallPostsDisplay').show();
                }
            });
    }

    $(document).on('click', '#submitGroupWallText', function() {
        var msg = $('#groupWallText').val();
        msg = msg.replace(/\s+/g, " ").replace(/^\s|\s$/g, "");
        if (typeof msg !== "undefined" || msg.length > 255 || msg.length < 3) {
            request("/group/"+groupid+"/wall", "PUT", JSON.stringify({"content":msg}))
                .then(function(d) {
                    $('#groupWallText').val("");
                    window.wallLoading = false;
                    window.wallOffset = 0;
                    $('#hasGroupWallPostsDisplay').empty();
                    loadWall();
                    success("Your group wall post has been created.");
                })
                .catch(function(e) {
                    warning(e.responseJSON.message);
                });
        }else{
            warning("Group wall posts must be between 3 and 255 characters. Please try again.");
        }
    });

    request("/group/"+groupid+"/role", "GET")
        .then(function(roleData) {
            if (roleData.rank !== 0) {
                $('#authUserRank').html("Your Rank: "+roleData.name.escape());
                if (parseInt(groupData.attr('data-groupowner')) === 0) {
                    $('#claimOwnership').show();
                }
            }
            var perms = roleData["permissions"];
            if (perms["postWall"]) {
                $('#postToGroupWall').append(`
                <div class="col-12">
                    <form>
                        <div class="form-group">
                            <div class="row" style="margin-bottom:1rem;">
                                <div class="col-sm-12">
                                    <textarea class="form-control" id="groupWallText" rows="3" placeholder="Post to the Group Wall..."></textarea>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-sm-12">
                                    <button type="button" id="submitGroupWallText" class="btn btn-success">Submit</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>`)
            }
            if (perms["getWall"]) {
                // Load Group Wall
                $('#groupWallDiv').show();
                window.wallOffset = 0;
                loadWall();
            }else{
                $('#groupWallDiv').hide();
            }
            if (roleData["rank"] === 0) {
                $('#groupJoin').show();
            }else if (perms["manage"] === 1) {
                $('#groupManage').show();
                $('#advertise').show();
                $('.deletePost').show();
                window.managegroup = true;
                // Show create button
                $('#createGroupItemButton').show();
                $('#groupLeave').show();
            }else{
                $('#groupLeave').show();
            }
            if (perms["getShout"]) {
                // Load Group Shout
                request("/group/"+groupid+"/shout")
                    .then(function(d) {
                        if (!d || !d.userId) {
                            $('#shoutDiv').hide();
                            return;
                        }
                        $('#shoutDiv').show();
                        $('#groupShoutDisplayDiv').append('<div class="row"><div class="col-4 col-sm-2"><a class="normal" href="/users/'+d.userid+'/profile"><img data-userid="'+d.userId+'" style="width:100%;" /></a></div><div class="col-8 col-sm-10"><a class="normal" href="/users/'+d.userId+'/profile"><h5 data-userid="'+d.userId+'" style="margin-bottom:0;"></h5></a><p style="font-weight: 500;font-size:0.75rem;">'+xss(d.shout)+'</p> </div></div><div class="row"><div class="col-12"><p style="font-weight: 300;font-size: 0.75rem;font-weight:600;opacity:0.5;margin-top:0.5rem;">'+moment(d.date).format("MMMM Do YYYY, h:mm a")+'</p></div></div>');
                        setUserThumbs([d.userId]);
                        setUserNames([d.userId]);
                    })
                    .catch(function(e) {
                        $('#shoutDiv').hide();
                    });
            }else{
                $('#shoutDiv').hide();
            }
        })
        .catch(function(e) {
            $('#alert').show();
        });

    request("/group/"+groupid+"/roles", "GET")
        .then(function(d) {
            var membersLoaded = false;
            var i = 0;
            d.forEach(function(k) {
                if (k.rank !== 0) {
                    i++;
                    if (i === 1) {
                        window.roleId = k.roleSetId;
                    }
                    $('#groupRolesSelection').append("<option value="+k.roleSetId+">"+k.name.escape()+"</option>");
                    if (!membersLoaded) {
                        loadMembers(k.roleSetId);
                        membersLoaded = true;
                    }
                }
            });
        })
        .catch(function(e) {
            $('#alert').show();
            $('#noMembersDisplay').show();
        });

    $('#groupRolesSelection').change(function() {
        window.memberOffset = 0;
        var roleid = parseInt($(this).val());
        window.roleId = roleid;
        loadMembers(roleid);
        $('#hasMembersDisplay').empty();
    });

    $(document).on('click', '#loadMoreMembers', function() {
        window.memberOffset = window.memberOffset + 12;
        loadMembers(window.roleId);
    });
    $(document).on('click', '#loadLessMembers', function() {
        window.memberOffset = window.memberOffset - 12;
        loadMembers(window.roleId);
    });

    function loadMembers(id) {
        if (window.memberOffset === 0) {
            $('#noMembersDisplay').hide();
            $('#hasMembersDisplay').hide();
        }
        request("/group/"+groupid+"/members/"+id+"?sort=desc&offset="+window.memberOffset+"&limit=12", "GET")
            .then(function(d) {
                $('#hasMembersDisplay').empty();
                if (d.total === 0) {
                    $('#noMembersDisplay').show();
                }else{
                    $('#hasMembersDisplay').show();
                }
                var userIdsForReq = [];
                d["members"].forEach(function(k) {
                    $('#hasMembersDisplay').append('<div class="col-4 col-md-3 col-lg-2"><a class="normal" href="/users/'+k.userId+'/profile"><img data-userid="'+k.userId+'" style="width:100%;" /><p class="text-truncate text-center" data-userid="'+k.userId+'" style="font-size:0.75rem;"></p></a></div>');
                    userIdsForReq.push(k.userId);
                });
                setUserThumbs(userIdsForReq);
                setUserNames(userIdsForReq);
                if (window.memberOffset !== 0) {
                    $('#loadLessMembers').show();
                }else{
                    $('#loadLessMembers').hide();
                }
                if (d["total"] - window.memberOffset >= 12) {
                    $('#loadMoreMembers').show();
                }else{
                    $('#loadMoreMembers').hide();
                }
            })
            .catch(function(e) {
                if (window.memberOffset === 0) {
                    $('#noMembersDisplay').show();
                }else{
                    $('#hasMembersDisplay').show();
                }
            });
    }
    var catalogOffset = 0;

    request("/group/"+groupid+"/catalog?sort=desc&offset="+catalogOffset, "GET")
    .then(loadCatalogStuff)
    .catch(function(e) {
        console.log(e);
    })
    loadCatalogStuff();
    function loadCatalogStuff(d, dontUndoOffset)
    {
        if (dontUndoOffset !== true) {
            $('#catalogItemsDiv').empty();
        }
        $('#catalogItemsDiv').each(function(el) {
            $(this).css("opacity", "1");
        });
        if (!d || d.length <= 0) {
            if (catalogOffset === 0) {
                $('#catalogItemsDiv').html('<div class="col sm-12" style="margin-top:1rem;"><h5 class="text-center">This group does not have any items.</h5></div>');
            }
        }else{
            var catalogIdsRequest = [];
            $.each(d, function(index, value) {
                value.currency = formatCurrency(value.currency);
                $('#catalogItemsDiv').append('<div class="col-6 col-sm-4 col-md-4 col-lg-3 catalogItem" data-catalogid="'+value.catalogId+'"><div class="card" style="margin: 1rem 0 0 0;border: 0;box-shadow:none;"><a href="/catalog/'+value.catalogId+'/'+urlencode(value.catalogName)+'"><img data-catalogid="'+value.catalogId+'" style="width:100%;" /></a> <div class="card-body"><div class="card-title text-left text-truncate" style="margin-bottom:0;"><a href="/catalog/'+value.catalogId+'/'+urlencode(value.catalogName)+'">'+value.catalogName+'</a><p class="text-left text-truncate">'+value.currency+nform(value.price)+'</p></div></div></div></div>');
                catalogIdsRequest.push(value.catalogId);
            });
            $('[data-toggle="tooltip"]').tooltip();
            setCatalogThumbs(catalogIdsRequest);
        }
        if (d && d.length >= 25) {
            $('.loadMoreItems').css("display", "block");
        }else{
            $('.loadMoreItems').hide();
        }
    }
}

let groupStatus = parseInt(groupData.attr('data-status'), 10);

// parseInt() is failing in dist? Im really not sure, but we have to check it as
// both a number and a string for some reason anyway.
if (groupStatus === 1 || groupStatus === '1') {
    // If the group is locked and the user is a member,
    // show the "leave group" button. Otherwise, show
    // nothing.
    request("/group/"+groupid+"/role", "GET")
        .then(function(roleData) {
            if (roleData.rank !== 0) {
                $('#groupLeave').show();
            }
        })
        .catch(e => {
            console.error(e);
        });
}else{
    // Group is OK, so load everything
    loadGoup();
}
// setup page
window.history.replaceState(null, null, "/groups/"+groupData.attr("data-groupid")+"/"+groupData.attr("data-encoded-name")+"/");