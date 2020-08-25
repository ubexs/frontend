
var userid = $('#profiledata').attr("data-userid");
if (userid === $('#userdata').attr("data-userid")) {
    $('#tradingButton').hide();
}
if (userid !== $('#userdata').attr("data-userid")) {
    request("/user/" + userid + "/friend", "GET")
        .then(function (data) {
            if (data.areFriends === true) {
                $('#acceptFriendRequest').html("Remove Friend");
                $(document).on('click', '#acceptFriendRequest', function () {
                    request('/user/' + userid + '/friend/', "DELETE")
                        .then(function (d) {
                            success("You are no longer friends with this user.");
                        })
                        .catch(function (e) {
                            warning(e.responseJSON.message);
                        });
                });
            } else if (data.canSendFriendRequest === true) {
                $('#acceptFriendRequest').html("Send Friend Request");
                $(document).on('click', '#acceptFriendRequest', function () {
                    request('/user/' + userid + '/friend/request', "POST")
                        .then(function (d) {
                            success("Your friend request was sent!");
                        })
                        .catch(function (e) {
                            warning(e.responseJSON.message);
                        });
                });
            } else if (data.canAcceptFriendRequest === true) {
                $('#acceptFriendRequest').html("Accept Friend Request");
                $(document).on('click', '#acceptFriendRequest', function () {
                    request('/user/' + userid + '/friend/', "PUT")
                        .then(function (d) {
                            success("This user is now your friend!");
                        })
                        .catch(function (e) {
                            warning(e.responseJSON.message);
                        });
                });
            } else {
                $('#acceptFriendRequest').html("Awaiting Response");
                $('#acceptFriendRequest').attr("disabled", "disabled");
            }
        })
        .catch(function (e) {
            if (e.responseJSON.success === true) {
                $('#acceptFriendRequest').html("Awaiting Response");
                $('#acceptFriendRequest').attr("disabled", "disabled");
            } else {
                $('#acceptFriendRequest').hide();
            }
        });
} else {
    $('#acceptFriendRequest').hide();
}

request('/user/' + userid + '/inventory?category=1&limit=6', "GET")
    .then(function (d) {
        var div = $('#profileCollectionsDiv');
        var catalogIdsRequest = [];
        var extraclass = "";
        $.each(d["items"], function (index, value) {
            if (index < 6) {
                if (index > 3) {
                    extraclass = "d-none d-md-block"
                } else {
                    extraclass = "";
                }
                $('#profileCollectionsDiv').append('<div style="display:none;" class="' + extraclass + ' col-3 col-md-2 col-lg-2"><img style="width:100%;" data-catalogid=' + value.catalogId + ' /><a style="color:#212529;" href="/catalog/' + value.catalogId + '/"><p class="text-center text-truncate" style="font-size:0.75rem;">' + value.catalogName.escape() + '</p></a></div>');
            }
            catalogIdsRequest.push(value.catalogId);
        });
        if (d["items"].length > 0) {
            $('#items').show();
            setCatalogThumbs(catalogIdsRequest);
        } else {
            $('#items').parent().remove();
            $('#friends').parent().attr("class", "col-12");
        }
    })
    .catch(function (e) {
        console.log(e);
        $('#items').hide();
    });

request('/user/' + userid + '/groups', "GET")
    .then(function (d) {
        var thumbIdsRequest = [];
        $.each(d["groups"], function (index, value) {
            if (index < 6) {
                $('#profileGroupsDiv').append('<div class="col-6 col-md-4 col-lg-2" style="padding-bottom: 1rem;padding-left:0.5rem;padding-right:0.5rem;"><div class="card"><img style="width:100%;" data-catalogid=' + value.groupIconCatalogId + ' /><div class="card-body" style="padding:0.25rem;"><div class="row" style="max-width: 100%;overflow: hidden;padding: 0;margin: 0;"></div><div class="card-title text-left" style="margin-bottom:0;"><a style="color:#212529;" href="/groups/' + value.groupId + '/"><h5 class="text-left text-truncate">' + value.groupName.escape() + '</h5></a><p class="text-left text-truncate">Members: ' + value.groupMemberCount + '</p><p class="text-left text-truncate">Rank: ' + value.userRolesetName.escape() + '</p></div></div></div>');
            }
            thumbIdsRequest.push(value.groupIconCatalogId);
        });
        if (d["groups"].length > 0) {
            $('#groups').show();
            setCatalogThumbs(thumbIdsRequest);
            $('#groupsCountDiv').html('(' + d.total + ')');
        } else {
            $('#groups').hide();
        }
    })
    .catch(function (e) {
        var msg = "This user is not a member of any groups.";
        $('#profileGroupsDiv').attr("class", "");
        $('#profileGroupsDiv').html(msg);
    });

request("/user/" + userid + "/friends?sort=desc&limit=6", "GET")
    .then(function (d) {
        $(document).ready(function () {
            var userIdsRequest = [];
            var extraclass = "";
            $.each(d["friends"], function (index, value) {
                if (index < 6) {
                    if (index > 3) {
                        extraclass = "d-none d-md-block"
                    } else {
                        extraclass = "";
                    }
                    $('#profileFriendsDiv').append('<div class="' + extraclass + ' col-3 col-sm-3 col-md-2 col-lg-2"><img data-userid="' + value.userId + '" style="width:100%;" /><a style="color:#212529;" href="/users/' + value.userId + '/profile"><p class="text-center text-truncate" data-userid="' + value.userId + '" style="font-size:0.75rem;"></p></a></div>');
                    userIdsRequest.push(value.userId);
                }
            });
            $('#friends').show();
            setUserThumbs(userIdsRequest);
            setUserNames(userIdsRequest);
            $('#friendCountDiv').html('(' + d.total + ')');
            if (d.total === 0) {
                $('#friends').hide();
                $('#friends').parent().remove();
                $('#items').parent().attr("class", "col-12");
            }
        })
    })
    .catch(function (e) { // no friends
        var msg = "This user has no friends.";
        $('#profileFriendsDiv').html(msg);
        $('#friends').hide();
    });

request("/user/" + userid + "/avatar", "GET")
    .then(function (d) {
        if (typeof d["avatar"] !== "undefined" && d["avatar"].length >= 1) {
            var catalogIds = [];
            d["avatar"].forEach(function (k) {
                $('#userAvatarDiv').append('<div class="col-6 col-md-3 col-lg-2"><a style="color:#212529;" href="/catalog/' + k.catalogId + '/"><img style="width:100%;" data-catalogid="' + k.catalogId + '"><p style="font-size:0.75rem;" class="text-center text-truncate" data-catalogid="' + k.catalogId + '"></p></a></div>');
                catalogIds.push(k.catalogId);
            });
            setCatalogNames(catalogIds);
            setCatalogThumbs(catalogIds);
        } else {
            $('#userAvatarDiv').append('<div class="col-12"><p class="text-center text-truncate">This user is not wearing anything.</div>');
        }
    })
    .catch(function (e) {
        console.log(e);
        $('#userAvatarDiv').append('<div class="col-12"><p class="text-center text-truncate">This user is not wearing anything.</div>');
    });

$(document).on('click', '#regenAvatar', function (e) {
    e.preventDefault();
    request("/staff/user/" + userid + "/avatar", "POST")
        .then(function (d) {
            success("This user's avatar will be regenerated soon.");
        })
        .catch(function (e) {
            warning(e.responseJSON.message);
        })
});


request('/game/search?genre=1&limit=4&offset=0&creatorType=0&creatorId='+userid, 'GET').then(games => {
    if (games.total === 0) {
        $('#user-games-div').append(`
        
            <div class="col-12">
                <p>This user has not created any games.</p>
            </div>
        
        `);
        return;
    }
    let gameIds = [];
    for (const game of games.data) {
        gameIds.push(game.gameId);
        $('#user-games-div').append(`
        
        <div class="col-6" style="padding-left:1px;padding-right:1px;padding-bottom:1px;">
            <a href="/game/${game.gameId}/" class="normal">
                <div class="card" style="background: #f8f9fa;">
                    <img src="${window.subsitutionimageurl}" data-gameid="${game.gameId}" style="
                    width: 100%;
                    object-fit: fill;
                    display: block;
                    margin: 0 auto;
                    height: 150px;" />
                    <div class="card-body game-profile-card">

                        <h1 style="
                        overflow: hidden;
                        font-size: 0.65rem;
                        margin-bottom: 0;
                        line-height: 1rem;
                        height: 1.5rem;
                        ">${xss(game.gameName)}</h1>
                        <p style="font-size:0.6rem;"><span class="font-weight-bold">${number_format(game.playerCount)}</span> People Playing</p>
                    </div>
                </div>
            </a>
        </div>
        
        `);
    }
    setGameThumbs(gameIds);
});