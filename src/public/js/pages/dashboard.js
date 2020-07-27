$('#newStatusValue').css('overflow-y','hidden').autogrow({vertical: true, horizontal: false});
$(document).on('click', '#updateStatusClick', function (e) {
    e.preventDefault();
    $('#newStatusValue').attr('disabled','disabled');
    var status = $('#newStatusValue').val();
    if (status !== "" && status.length >= 1 && status.length <= 255) {
        request("/feed/status", "PATCH", JSON.stringify({ "status": status }))
            .then(function (d) {
                $('#newStatusValue').val('');
                $('#newStatusValue').removeAttr('disabled');
                success("Success! Your status has been updated.");

                let k = {
                    statusId: d.statusId,
                    didReactWithHeart: false,
                    heartReactionCount: 0,
                    commentCount: 0,
                    status: status,
                    userId: userId,
                };
                let reactionBox = `
                    <div class="col text-center add-reaction" data-id="${k.statusId}">
                        <p style="font-size:0.85rem;"><i class="far fa-heart"></i> Heart</p>
                    </div>`;
                    if (k.didReactWithHeart) {
                        reactionBox = `
                        <div class="col text-center remove-reaction" data-id="${k.statusId}">
                            <p style="font-size:0.85rem;color:red;"><i class="fas fa-heart"></i> Unheart</p>
                        </div>`;
                    }
                    var dateDisplay = moment(k["date"]).format('MMMM Do YYYY, h:mm a');
                    let reactionCountDisplay = `
                    
                    <p style="font-size:0.65rem;text-align:center;"><i class="fas fa-heart"></i> <span class="formated-total-reactions" data-count="${k.heartReactionCount}" data-id="${k.statusId}">0 Hearts</span></p>`;

                    if (k.heartReactionCount !== 0) {
                        let heartWithS = 'Heart';
                        if (k.heartReactionCount > 1) {
                            heartWithS = 'Hearts';
                        }
                        reactionCountDisplay = `
                        
                        <p style="font-size:0.65rem;text-align:center;"><i class="fas fa-heart"></i> <span class="formated-total-reactions" data-count="${k.heartReactionCount}" data-id="${k.statusId}">${number_format(k.heartReactionCount)} ${heartWithS}</span></p>
                        
                        `;
                    }


                    let commentCountDisplay = `
                    
                    <p style="font-size:0.65rem;text-align:center;" class="add-comment" data-id="${k.statusId}">
                        <span class="formated-total-comments" data-count="${k.commentCount}" data-id="${k.statusId}">${k.commentCount}</span> Comment
                    </p>
                    
                    `;
                    if (k.commentCount === 0 || k.commentCount > 1) {
                        commentCountDisplay = `
                    
                        <p style="font-size:0.65rem;text-align:center;" class="add-comment" data-id="${k.statusId}">
                            <span class="formated-total-comments" data-count="${k.commentCount}" data-id="${k.statusId}">${number_format(k.commentCount)}</span> Comments
                        </p>
                        
                        `;
                    }
                    let divData = `
                    <div class="col-12">
                        <div class="row">
                            <div class="col-12">
                                <hr style="margin-top:0;" />
                            </div>
                            <div style="" class="col-4 col-lg-2">
                                <img style="width:100%;display:block;margin:0 auto;" data-userid="${k.userId}" src="${window.subsitutionimageurl}" />
                            </div>
                            <div class="col-8 col-lg-10" style="padding-left: 0;">
                                <div class="row">
                                    <div class="col-12">
                                        <h6 class="text-left" style="margin-bottom: 0;">
                                            <a class="normal" href="/users/${k.userId}/profile">
                                                <span data-userid="${k.userId}"></span>
                                            </a>
                                            <span style="font-size:0.65rem;font-weight:400;opacity:1;cursor:pointer;" title="${dateDisplay}">
                                                ( ${ moment(k["date"]).fromNow()} )
                                            </span>
                                        </h6>
                                    </div>
                                </div>
                                <div class="col-12" style="padding-left:0;padding-right:0;">
                                    <p style="font-size:0.8rem;white-space:pre-wrap;">${xss(k["status"])}</p>
                                </div>
                            </div>
                            <div class="col-12" style="margin-top:0.5rem;">
                                <div class="row">
                                    <div class="col-6 col-md-4">
                                        ${reactionCountDisplay}
                                    </div>
                                    <div class="col-6 col-md-4">
                                        ${commentCountDisplay}
                                    </div>
                                    <div class="col-12 col-md-4">
                                        <a class="normal" href="/report-abuse/user-status/${k.statusId}">
                                            <p style="font-size:0.65rem;text-align:center;">
                                                <i class="fas fa-flag"></i> Report Abuse
                                            </p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12">
                                <hr style="margin-bottom:0;" />
                            </div>
                            <div class="col-12" style="margin-bottom:0;">
                                <div class="row">
                                    ${reactionBox}
                                    <div class="col text-center add-comment" data-id="${k.statusId}">
                                        <p style="font-size:0.85rem;"><i class="far fa-comments"></i> Comment</p>
                                    </div>
                                </div>
                                <div class="row comments-area" data-id="${k.statusId}">

                                </div>
                            </div>
                        </div>
                    </div>`;
                    $('#userFeedDiv').prepend(divData);
                setUserThumbs([userId]);
                setUserNames([userId]);
            })
            .catch(function (e) {
                console.error(e);
                $('#newStatusValue').removeAttr('disabled');
                warning(e.responseJSON.message);
            });
    } else {
        $('#newStatusValue').removeAttr('disabled');
        warning("Error: Your status must be between 1 and 255 characters. Please try again.");
    }
});

request('/notifications/count', 'GET').then(d => {
    $('#user-notifications-mobile').html(number_format(d.count));
})


$(function () {
    // Get User Info
    request("/user/" + userId + "/info", "GET")
        .then((data) => {
            if (data.user_status !== null && data.user_status !== "") {
                $('#newStatusValue').attr("placeholder", data.user_status.escape());
            }
        })
        .catch((data) => {

        });

    // Get Friends
    request("/user/" + userId + "/friends?limit=5", "GET")
        .then((data) => {
            // Has Friends
            $('#userFriendsCountDiv').empty();
            $('#userFriendsDiv').empty();
            $('#userFriendsCountDiv').append('<p>' + data["total"] + '</p>');
            var friendsUserIds = [];
            $(data["friends"]).each(function (key, value) {
                if (key <= 4) {
                    if (value.UserStatus === null) {
                        value.UserStatus = "...";
                    }
                    friendsUserIds.push(value.userId);
                    $('#userFriendsDiv').append('<div class="row"><div class="col-6 col-sm-3 text-center" ><img src="' + window.subsitutionimageurl + '" data-userid="' + value.userId + '" class="card-img-top"></div><div class="col text-left"><a class="font-weight-bold normal" href="/users/' + value.userId + '/profile"><span data-userid="' + value.userId + '"></span></a><p style="font-size:0.75rem;">&quot;' + xss(value.UserStatus) + '&quot;</p></div></div>');
                }
            });
            if (data["friends"].length > 4) {
                $('#userFriendsDiv').append('<div class="row" style="margin-top:1rem;"><div class="col-sm-12 text-left"><a href="/users/' + userId + '/friends">See All</a></div></div>');
            }
            setUserThumbs(friendsUserIds);
            setUserNames(friendsUserIds);
            $('#myFriendsCount').html("(" + data["total"] + ")");
            if (data.total === 0) {
                $('#userFriendsDiv').append('You do not have any friends.');
                $('#userFriendsDiv').css("padding-top", "0");
            }
        })
        .catch((data) => {
            console.log(data);
            $('#userFriendsCountDiv').empty();
            $('#userFriendsDiv').empty();
            $('#userFriendsDiv').append('You do not have any friends.');
            $('#userFriendsDiv').css("padding-top", "0");
            // No friends
            $('#userFriendsCountDiv').append('<p>0</p>');
        });

    /*
// Get Forum Posts Count/Data
request("/user/"+userId+"/forum", "GET")
    .then((data)=>{
        // Has Friends
        $('#userForumPostsCountDiv').empty();
        $('#userForumPostsCountDiv').append('<p>'+data.length+'</p>');
    })
    .catch((data) => {
        // No friends
        $('#userForumPostsCountDiv').empty();
        $('#userForumPostsCountDiv').append('<p>0</p>');
    });

// Get Game Visits & Games
request("/user/"+userId+"/games", "GET")
    .then((data)=>{
        // Has Friends
        $('#userGameVisitsCountDiv').empty();
        $('#userGameVisitsCountDiv').append('<p>'+data.length+'</p>');
    })
    .catch((data) => {
        // No friends
        $('#userGameVisitsCountDiv').empty();
        $('#userGameVisitsCountDiv').append('<p>0</p>');
    });

*/
    var currentFeed = 'friends';
    var isLoading = false;
    var areMoreAvailable = true;
    var feedOffset = 0;
    $(window).scroll(function () {
        if (isLoading || !areMoreAvailable) {
            return;
        }
        if($(window).scrollTop() + $(window).height() > $(document).height() - $('div#footerUpper').innerHeight()) {
            if (currentFeed === 'friends') {
                getFeedFriends(feedOffset);
            } else if (currentFeed === 'groups') {
                getFeedGroups(feedOffset);
            }
        }
    });
    $('#use-feed-friends').click(function () {
        if (isLoading || currentFeed === 'friends') {
            return;
        }
        areMoreAvailable = true;
        currentFeed = 'friends';
        feedOffset = 0;
        $(this).removeClass('btn-outline-success').addClass('btn-success');
        $('#use-feed-groups').removeClass('btn-success').addClass('btn-outline-success');
        $('#userFeedDiv').empty();
        getFeedFriends(0);
    });
    $('#use-feed-groups').click(function () {
        if (isLoading || currentFeed === 'groups') {
            return;
        }
        areMoreAvailable = true;
        currentFeed = 'groups';
        feedOffset = 0;
        $(this).removeClass('btn-outline-success').addClass('btn-success');
        $('#use-feed-friends').removeClass('btn-success').addClass('btn-outline-success');
        $('#userFeedDiv').empty();
        getFeedGroups(0);
    });
    // Get Feed
    $(document).on('click', '.add-reaction', function(e) {
        if ($(this).parent().attr('data-react-disabled')) {
            return;
        }
        let id = $(this).attr('data-id');
        $(this).parent().attr('data-react-disabled','true');
        let elAppended = $(this).parent().prepend(`
        <div class="col text-center remove-reaction" data-id="${id}">
            <p style="font-size:0.85rem;color:red;"><i class="fas fa-heart"></i> Unheart</p>
        </div>`);
        let elToEdit = $('span.formated-total-reactions[data-id='+id+']');
        let oldHeartCount = parseInt(elToEdit.attr('data-count'));
        let newHeartCount = oldHeartCount + 1;
        if (newHeartCount > 1||newHeartCount === 0) {
            elToEdit.html(number_format(newHeartCount) + ' Hearts');
        }else{
            elToEdit.html(number_format(newHeartCount) + ' Heart');
        }
        elToEdit.attr('data-count', newHeartCount);
        console.log(elAppended);
        let changeTooltip = $('span.formated-total-reactions[data-id="'+id+'"]').attr('data-original-title');
        if (changeTooltip) {
            if (changeTooltip === 'Nobody') {
                changeTooltip = xss(username);
                $('span.formated-total-reactions[data-id="'+id+'"]').attr('data-original-title',changeTooltip);
            }else{
                changeTooltip = xss(username)+'<br>'+changeTooltip;
                if (changeTooltip === '' || newHeartCount === 0) {
                    changeTooltip = 'Nobody';
                }
                $('span.formated-total-reactions[data-id="'+id+'"]').attr('data-original-title',changeTooltip);
            }
        }
        request('/feed/friends/'+id+'/react', 'POST', {
            'reactionType': 'heart',
        }).then(() => {
            elAppended.removeAttr('data-react-disabled');
        })
        .catch(e => {
            console.error(e);
            toast(false,'Oops, let\'s try that again.')
            $(this).parent().prepend(`
            <div class="col text-center add-reaction" data-id="${id}">
                <p style="font-size:0.85rem;"><i class="far fa-heart"></i> Heart</p>
            </div>`);
        })
        $(this).remove();
    });
    $(document).on('click', '.remove-reaction', function(e) {
        if ($(this).parent().attr('data-react-disabled')) {
            return;
        }
        let id = $(this).attr('data-id');
        $(this).parent().attr('data-react-disabled','true');
        let elAppended = $(this).parent().prepend(`
        <div class="col text-center add-reaction" data-id="${id}">
            <p style="font-size:0.85rem;"><i class="far fa-heart"></i> Heart</p>
        </div>`);
        let elToEdit = $('span.formated-total-reactions[data-id='+id+']');
        let oldHeartCount = parseInt(elToEdit.attr('data-count'));
        let newHeartCount = oldHeartCount - 1;
        if (newHeartCount > 1||newHeartCount === 0) {
            elToEdit.html(number_format(newHeartCount) + ' Hearts');
        }else{
            elToEdit.html(number_format(newHeartCount) + ' Heart');
        }
        let changeTooltip = $('span.formated-total-reactions[data-id="'+id+'"]').attr('data-original-title');
        if (changeTooltip) {
            if (changeTooltip === 'Nobody') {
                // uhh
            }else{
                // changeTooltip = xss(username)+'<br>'+changeTooltip;
                changeTooltip = changeTooltip.replace(username+'<br>', '');
                if (changeTooltip === '' || newHeartCount === 0) {
                    changeTooltip = 'Nobody';
                }
                $('span.formated-total-reactions[data-id="'+id+'"]').attr('data-original-title',changeTooltip);
            }
        }
        elToEdit.attr('data-count', newHeartCount);
        console.log(elAppended);
        request('/feed/friends/'+id+'/react', 'DELETE', {
            'reactionType': 'heart',
        }).then(() => {
            elAppended.removeAttr('data-react-disabled');
        })
        .catch(e => {
            console.error(e);
            toast(false,'Oops, let\'s try that again.')
            $(this).parent().prepend(`
            <div class="col text-center remove-reaction" data-id="${id}">
                <p style="font-size:0.85rem;color:red;"><i class="far fa-heart"></i> Heart</p>
            </div>`);
        })
        $(this).remove();
    });
    let commentsLoaded = {};
    let loadingComments = {};
    $(document).on('click', '.add-comment-to-status-submit', function(e) {
        e.preventDefault();
        let id = $(this).attr('data-id');
        let commentBox = $('textarea.add-comment-to-status-textarea[data-id="'+id+'"]');
        commentBox.attr('disabled', 'disabled');
        $(this).attr('disabled','disabled');
        let commentText = commentBox.val();

        request('/feed/friends/'+id+'/comment', 'POST', {
            comment: commentText,
        }).then(d => {
            commentBox.removeAttr('disabled');
            commentBox.val('');
            $(this).removeAttr('disabled');

            if (commentsLoaded[id] === true) {
                let divToAddCommentsTo = $('.comments-area[data-id="'+id+'"]');
                divToAddCommentsTo.append(`
                    
                    <div class="col-12">
                        <div class="row">
                            <div class="col" style="max-width:75px;padding-right:0;">
                                <img src="${window.subsitutionimageurl}" style="width:100%;height: auto;display:block;margin:0 auto;border-radius:50%;" data-userid="${userId}" />
                            </div>
                            <div class="col">
                                <a class="normal" href="/users/${userId}/profile">
                                    <p style="font-weight:700;font-size:0.75rem;">
                                        <span data-userid="${userId}"></span>
                                    </p>
                                </a>
                                <p style="font-size:0.75rem;white-space: pre-line;font-weight:600;">${xss(commentText)}</p>
                                <p style="font-size:0.65rem;opacity:0.75;font-weight:500;">${moment().fromNow()}</p>
                            </div>
                        </div>
                    </div>
                    
                    `);
                    setUserThumbs([userId]);
                    setUserNames([userId]);
            }
        }).catch(e => {
            commentBox.removeAttr('disabled', 'disabled');
            $(this).removeAttr('disabled','disabled');
            console.error(e);
            toast(false, e.responseJSON.message);
        })
    });
    
    $(document).on('click', '.add-reply-to-comment-submit', function(e) {
        e.preventDefault();
        let commentId = $(this).attr('data-id');
        let statusId = $(this).attr('data-status-id');
        $('.add-reply-to-comment-textarea[data-id="'+commentId+'"]').attr('disabled','disabled');
        let text = $('.add-reply-to-comment-textarea[data-id="'+commentId+'"]').val();
        $(this).attr('disabled','disabled');
        console.log(text);
        request('/feed/friends/'+statusId+'/comment/'+commentId+'/reply', 'POST', {
            'reply': text,
        }).then(d => {
            // ok
            $(this).removeAttr('disabled');
            $('.add-reply-to-comment-textarea[data-id="'+commentId+'"]').removeAttr('disabled').val('');

            $(this).parent().parent().parent().parent().parent().append(`
                <div class="row">
                    <div class="col-10 offset-2">
                        <div class="row">
                        <div class="col" style="max-width:75px;padding-right:0;">
                            <img src="${window.subsitutionimageurl}" style="width:100%;height: auto;display:block;margin:0 auto;border-radius:50%;" data-userid="${userId}" />
                        </div>
                        <div class="col">
                            <a class="normal" href="/users/${userId}/profile">
                                <p style="font-weight:700;font-size:0.75rem;">
                                    <span data-userid="${userId}"></span>
                                </p>
                            </a>
                            <p style="font-size:0.75rem;white-space: pre-line;font-weight:600;">${xss(text)}</p>
                            <p style="font-size:0.65rem;opacity:0.75;font-weight:500;">${moment().fromNow()}</p>
                        </div>
                        </div>
                        </div>
                </div>`);
                setUserThumbs([userId]);
                setUserNames([userId]);
        })
        .catch(e => {
            console.log(e);
            $(this).removeAttr('disabled');
            $('.add-reply-to-comment-textarea[data-id="'+commentId+'"]').removeAttr('disabled');
            warning(e.responseJSON.message);
        })
    });

    let breakLoading = false;
    let repliesLoading = {};
    $(document).on('click', '.reply-to-comment', function(e) {
        e.preventDefault();
        let commentId = $(this).attr('data-id');
        let statusId = $(this).attr('data-status-id');
        if (repliesLoading[commentId]) {
            return;
        }
        if ($(this).attr('data-replybox-loaded')) {
            $(this).removeAttr('data-replybox-loaded');
            $('.add-reply-container[data-id="'+commentId+'"]').remove();
            $('.reply-to-comment[data-commentid="'+commentId+'"]').remove();
            return;
        }
        repliesLoading[commentId] = true;
        $(this).attr('data-replybox-loaded', 'true');
        // load comment box
        $(this).parent().parent().parent().append(`
        <div class="row add-reply-container" data-id="${commentId}" style="margin-top:0.5rem;">
            <div class="col-12 col-md-10 offset-md-2">
                <div class="row">
                    <div class="col">
                        <div class="form-group">
                                <textarea class="form-control add-reply-to-comment-textarea" data-id="${commentId}" rows="3" placeholder="Write a comment..." style="font-size:0.75rem;"></textarea>
                            </div>
                        </div>
                        <div class="col" style="padding-left:0;max-width:75px;">
                            <button type="button" class="btn btn-small btn-success add-reply-to-comment-submit" style="margin:0 auto;display: block;font-size:0.85rem;" data-id="${commentId}" data-status-id="${statusId}">Post</button>
                        </div>
                    </div>
                </div>
                </div>
        </div>`);
        // load replies
        request('/feed/friends/'+statusId+'/comment/'+commentId+'/replies?limit=25').then(d => {
            repliesLoading[commentId] = false;
            let userIds = [];
            for (const reply of d) {
                console.log(reply);
                $(this).parent().parent().parent().append(`
                <div class="row reply-to-comment" data-commentid="${commentId}">
                    <div class="col-10 offset-2">
                        <div class="row">
                        <div class="col" style="max-width:75px;padding-right:0;">
                            <img src="${window.subsitutionimageurl}" style="width:100%;height: auto;display:block;margin:0 auto;border-radius:50%;" data-userid="${reply.userId}" />
                        </div>
                        <div class="col">
                            <a class="normal" href="/users/${reply.userId}/profile">
                                <p style="font-weight:700;font-size:0.75rem;">
                                    <span data-userid="${reply.userId}"></span>
                                </p>
                            </a>
                            <p style="font-size:0.75rem;white-space: pre-line;font-weight:600;">${xss(reply.comment)}</p>
                            <p style="font-size:0.65rem;opacity:0.75;font-weight:500;">${moment(reply.createdAt).fromNow()}</p>
                        </div>
                        </div>
                        </div>
                </div>`);
                userIds.push(reply.userId);
            }
            setUserNames(userIds);
            setUserThumbs(userIds);
        }).catch(e => {
            repliesLoading[commentId] = false;
            console.error(e);
        });
    });

    $(document).on('click', '.add-comment', function(e) {
        console.log(loadingComments);
        e.preventDefault();
        let id = $(this).attr('data-id');
        if (loadingComments[id]) {
            return;
        }
        loadingComments[id] = true;

        let divToAddCommentsTo = $('.comments-area[data-id="'+id+'"]');
        if (commentsLoaded[id] === true) {
            commentsLoaded[id] = false;
            loadingComments[id] = false;
            divToAddCommentsTo.empty();
            $(this).removeAttr('data-loading-comments');
        }else{
            commentsLoaded[id] = true;
            divToAddCommentsTo.append(`<div class="col-12" style="margin-top:1rem;margin-bottom:1rem;"><div class="spinner-border text-success" role="status" style="display:block;margin:0 auto;"></div>`);
            request('/feed/friends/'+id+'/comments?limit=25', 'GET')
            .then(d => {
                divToAddCommentsTo.empty();
                divToAddCommentsTo.append(`
                    
                    <div class="col-12">
                        <div class="row">
                            <div class="col" style="max-width:75px;padding-right:0;">
                                <img src="${window.subsitutionimageurl}" style="width:100%;height: auto;display:block;margin:0 auto;border-radius:50%;" data-userid="${userId}" />
                            </div>
                            <div class="col">
                                <div class="form-group">
                                    <textarea class="form-control add-comment-to-status-textarea" data-id="${id}" rows="3" placeholder="Write a comment..." style="font-size:0.75rem;"></textarea>
                                </div>
                            </div>
                            <div class="col" style="padding-left:0;max-width:75px;">
                                <button type="button" class="btn btn-small btn-success add-comment-to-status-submit" style="margin:0 auto;display: block;font-size:0.85rem;" data-id="${id}">Post</button>
                            </div>
                        </div>
                    </div>
                    
                `);
                setUserThumbs([userId]);
                let userIdsWhoCommented = [];
                for (const comment of d) {
                    userIdsWhoCommented.push(comment.userId);
                    divToAddCommentsTo.append(`
                    
                    <div class="col-12">
                        <div class="row">
                            <div class="col" style="max-width:75px;padding-right:0;">
                                <img src="${window.subsitutionimageurl}" style="width:100%;height: auto;display:block;margin:0 auto;border-radius:50%;" data-userid="${comment.userId}" />
                            </div>
                            <div class="col">
                                <a class="normal" href="/users/${comment.userId}/profile">
                                    <p style="font-weight:700;font-size:0.75rem;">
                                        <span data-userid="${comment.userId}"></span>
                                    </p>
                                </a>
                                <p style="font-size:0.75rem;white-space: pre-line;font-weight:600;">${xss(comment.comment)}</p>
                                <p style="font-size:0.65rem;opacity:0.75;font-weight:500;">${moment(comment.createdAt).fromNow()} (${number_format(comment.replyCount)} replies)</p>
                                <p style="font-size:0.65rem;font-weight:500;" class="reply-to-comment" data-id="${comment.userStatusCommentId}" data-status-id="${comment.statusId}"><i class="fas fa-reply"></i> Reply</p>
                            </div>
                        </div>
                    </div>
                    
                    `);
                }
                divToAddCommentsTo.append(`<div class="col-12" style="margin-bottom:1rem;"></div>`);
                setUserNames(userIdsWhoCommented);
                setUserThumbs(userIdsWhoCommented);
            })
            .catch(e => {
                divToAddCommentsTo.empty();
                console.error(e);
                toast(false, 'Uh-oh, could you try that again?');
                commentsLoaded[id] = false;
            }).finally(() => {
                loadingComments[id] = false;
            })
        }
    });

    let loadingUsersWhoReacted = {};
    let loadedTotalReactions = {};
    $(document).on('mouseenter', '.formated-total-reactions', function(e) {
        e.preventDefault();
        let id = $(this).attr('data-id');
        if (loadedTotalReactions[id]) {
            // total reacts
            let allReactors = loadedTotalReactions[id];
        }
        if (loadingUsersWhoReacted[id]) {
            return;
        }
        $(this).attr('title', 'Loading...');
        $(this).attr('data-html', 'true');
        $(this).tooltip('show');
        loadingUsersWhoReacted[id] = true;
        request('/feed/friends/'+id+'/reactions', 'GET').then(d => {
            console.log(d);
            let allIds = [];
            for (const id of d) {
                allIds.push(id.userId);
            }
            if (d.length === 0) {
                $(this).tooltip('hide');
                let callOff = () => {
                    $(this).off('hidden.bs.tooltip');
                }
                $(this).on('hidden.bs.tooltip', function () {
                    // do something...
                    $(this).tooltip('show');
                    callOff();
                })
                $(this).attr('title', 'Nobody');
                $(this).attr('data-original-title', 'Nobody');
                return;
            }
            let newTitle = ``;
            request('/user/names?ids='+[...new Set(allIds)].join(',')).then(d => {
                console.log(d);
                for (const username of d) {
                    newTitle += username.username+'<br>';
                }
                if(d.length >= 25) {
                    newTitle += 'and others.';
                }else{
                    newTitle = newTitle.slice(0,newTitle.length-'<br>'.length);
                }
                $(this).attr('title', newTitle);
                $(this).attr('data-original-title', newTitle);

                $(this).tooltip('hide');
                let callOff = () => {
                    $(this).off('hidden.bs.tooltip');
                }
                $(this).on('hidden.bs.tooltip', function () {
                    // do something...
                    $(this).tooltip('show');
                    callOff();
                })
            })
        })
        console.log(id);
    });
    $(document).on('mouseleave', '.formated-total-reactions', function(e) {
        e.preventDefault();
    });
    getFeedFriends(0);
    function getFeedFriends(offset) {
        $('#feedLoader').show();
        isLoading = true;
        request("/feed/friends?limit=10&offset=" + offset, "GET")
            .then(data => {
                isLoading = false;
                if (offset === 0) {
                    $('#userFeedDiv').empty();
                }
                feedOffset += 10;
                // Has Feed
                var userIdsRequest = [];

                let idsToGrabOGDataFor = [];
                data.forEach(function (k, v) {
                    let ogTagInfo = ``;
                    if (k.status.match(/https:\/\/[a-zA-Z\d-]+\./g)) {
                        idsToGrabOGDataFor.push(k.statusId);

                        ogTagInfo = `
                        <div class="col-12 og-meta-info" data-id="${k.statusId}">
                            <div class="spinner-border text-success" role="status" style="margin:1rem auto 1rem auto;display: block;"></div>
                        </div>`;
                    }
                    let reactionBox = `
                    <div class="col text-center add-reaction" data-id="${k.statusId}">
                        <p style="font-size:0.85rem;"><i class="far fa-heart"></i> Heart</p>
                    </div>`;
                    if (k.didReactWithHeart) {
                        reactionBox = `
                        <div class="col text-center remove-reaction" data-id="${k.statusId}">
                            <p style="font-size:0.85rem;color:red;"><i class="fas fa-heart"></i> Unheart</p>
                        </div>`;
                    }
                    userIdsRequest.push(k.userId);
                    var dateDisplay = moment(k["date"]).format('MMMM Do YYYY, h:mm a');
                    let reactionCountDisplay = `
                    
                    <p style="font-size:0.65rem;text-align:center;"><i class="fas fa-heart"></i> <span class="formated-total-reactions" data-count="${k.heartReactionCount}" data-id="${k.statusId}">0 Hearts</span></p>`;

                    if (k.heartReactionCount !== 0) {
                        let heartWithS = 'Heart';
                        if (k.heartReactionCount > 1) {
                            heartWithS = 'Hearts';
                        }
                        reactionCountDisplay = `
                        
                        <p style="font-size:0.65rem;text-align:center;"><i class="fas fa-heart"></i> <span class="formated-total-reactions" data-count="${k.heartReactionCount}" data-id="${k.statusId}">${number_format(k.heartReactionCount)} ${heartWithS}</span></p>
                        
                        `;
                    }


                    let commentCountDisplay = `
                    
                    <p style="font-size:0.65rem;text-align:center;" class="add-comment" data-id="${k.statusId}">
                        <span class="formated-total-comments" data-count="${k.commentCount}" data-id="${k.statusId}">${k.commentCount}</span> Comment
                    </p>
                    
                    `;
                    if (k.commentCount === 0 || k.commentCount > 1) {
                        commentCountDisplay = `
                    
                        <p style="font-size:0.65rem;text-align:center;" class="add-comment" data-id="${k.statusId}">
                            <span class="formated-total-comments" data-count="${k.commentCount}" data-id="${k.statusId}">${number_format(k.commentCount)}</span> Comments
                        </p>
                        
                        `;
                    }
                    let divData = `
                    <div class="col-12">
                        <div class="row">
                            <div class="col-12">
                                <hr style="margin-top:0;" />
                            </div>
                            <div style="" class="col-4 col-lg-2">
                                <img style="width:100%;display:block;margin:0 auto;" data-userid="${k.userId}" src="${window.subsitutionimageurl}" />
                            </div>
                            <div class="col-8 col-lg-10" style="padding-left: 0;">
                                <div class="row">
                                    <div class="col-12">
                                        <h6 class="text-left" style="margin-bottom: 0;">
                                            <a class="normal" href="/users/${k.userId}/profile">
                                                <span data-userid="${k.userId}"></span>
                                            </a>
                                            <span style="font-size:0.65rem;font-weight:400;opacity:1;cursor:pointer;" title="${dateDisplay}" class="format-date-interval-fromnow" data-original-date="${xss(k["date"])}">
                                                ( ${ moment(k["date"]).fromNow()} )
                                            </span>
                                        </h6>
                                    </div>
                                </div>
                                <div class="col-12" style="padding-left:0;padding-right:0;">
                                    <p style="font-size:0.8rem;white-space:pre-wrap;" class="user-status-linkify">${xss(k["status"])}</p>
                                </div>

                            </div>
                            ${ogTagInfo}
                            <div class="col-12" style="margin-top:0.5rem;">
                                <div class="row">
                                    <div class="col-6 col-md-4">
                                        ${reactionCountDisplay}
                                    </div>
                                    <div class="col-6 col-md-4">
                                        ${commentCountDisplay}
                                    </div>
                                    <div class="col-12 col-md-4">
                                        <a class="normal" href="/report-abuse/user-status/${k.statusId}">
                                            <p style="font-size:0.65rem;text-align:center;">
                                                <i class="fas fa-flag"></i> Report Abuse
                                            </p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12">
                                <hr style="margin-bottom:0;" />
                            </div>
                            <div class="col-12" style="margin-bottom:0;">
                                <div class="row">
                                    ${reactionBox}
                                    <div class="col text-center add-comment" data-id="${k.statusId}">
                                        <p style="font-size:0.85rem;"><i class="far fa-comments"></i> Comment</p>
                                    </div>
                                </div>
                                <div class="row comments-area" data-id="${k.statusId}">

                                </div>
                            </div>
                        </div>
                    </div>`;
                    $('#userFeedDiv').append(divData);
                });
                $('.user-status-linkify').linkify({
                    target: "_blank",
                    attributes: {
                        'rel': 'noopener nofollow',
                    }
                })
                console.log(idsToGrabOGDataFor);
                if (idsToGrabOGDataFor.length > 0) {
                    // load og data
                    request('/feed/friends/multi-get-og-info?ids='+idsToGrabOGDataFor.join(','), 'GET').then(d => {
                        let claimedObj = {};
                        for (const item of d) {
                            $('div.og-meta-info[data-id="'+item.statusId+'"]').empty()
                        }
                        for (const item of d) {
                            claimedObj[item.statusId] = true;

                            let thumbThing = ``;
                            let specialPaddingIfThumb = ``;
                            if (item.ogInfo && item.ogInfo && item.ogInfo.thumbnailUrl) {
                                thumbThing = `
                                <img src="${window.HTTPMeta.baseUrl+item.ogInfo.thumbnailUrl}" style="width:100%;height:auto;display:block;margin:0 auto;" class="zoom-on-hover" />
                                `;
                                specialPaddingIfThumb = `padding-top:5px;`;
                            }
                            $('div.og-meta-info[data-id="'+item.statusId+'"]').append(`
                            
                            <div class="row" style="margin-top:1rem;">
                                <div class="col-12">
                                    <a class="normal" href="${xss(item.url)}" rel="nofollow noopener" target="_blank">
                                        <div class="card og-tags-card" style="background-color:rgba(0,0,0,0.05);">
                                            ${thumbThing}
                                            <div class="card-body" style="${specialPaddingIfThumb}">
                                                <p style="font-size:0.7rem;" class="text-truncate">${xss(item.url)}</p>
                                                <h1 style="font-size:0.75rem;" class="text-truncate">${xss(item.ogInfo.title)}</h1>
                                                <p style="font-size:0.7rem;" class="text-truncate">${xss(item.ogInfo.description)}</p>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                            
                            `);
                        }

                        for (const item of idsToGrabOGDataFor) {
                            if (!claimedObj[item]) {
                                $('div.og-meta-info[data-id="'+item+'"]').remove();
                            }
                        }
                    })
                    .catch(e => {
                        for (const item of idsToGrabOGDataFor) {
                            $('div.og-meta-info[data-id="'+item+':]').remove();
                        }
                        console.error(e);
                    })
                }
                setUserThumbs(userIdsRequest);
                setUserNames(userIdsRequest);
                if (data.length > 0) {
                    $('#feedLoader').show();
                } else {
                    areMoreAvailable = false;
                    $('#feedLoader').hide();
                }
                if (data.length === 0 && offset === 0) {
                    areMoreAvailable = false;
                    $('#userFeedDiv').append('<div class="col-12">Your feed is empty. Make some friends!</div>');
                }
            })
            .catch(data => {
                isLoading = false;
                areMoreAvailable = false;
                // No Feed
                if (offset === 0) {
                    $('#userFeedDiv').append('<div class="col-12">' + data.responseJSON.message + '</div>');
                }
            });
    }
    function getFeedGroups(offset) {
        $('#feedLoader').show();
        isLoading = true;
        request("/feed/groups?limit=10&offset=" + offset, "GET")
            .then(data => {
                isLoading = false;
                if (offset === 0) {
                    $('#userFeedDiv').empty();
                }
                feedOffset += 10;
                // Has Feed
                var groupIdsRequest = [];
                var thumbnailIds = [];
                data.forEach(function (k, v) {
                    thumbnailIds.push(k.thumbnailCatalogId);
                    groupIdsRequest.push(k.groupId);
                    var dateDisplay = moment(k["date"]).format('MMMM Do YYYY, h:mm a');
                    $('#userFeedDiv').append('<div class="col-sm-12"><hr /></div><div style="" class="col-4 col-lg-2"><img style="width:100%;display:block;margin:0 auto;" data-catalogid="' + k.thumbnailCatalogId + '" src="' + window.subsitutionimageurl + '" /></div><div class="col-8 col-lg-10" style="padding-left: 0;"><div class="row"><div class="col-12"><h6 class="text-left" style="margin-bottom: 0;"><a style="color:#212529;" href="/groups/' + k.groupId + '/--"><span data-groupid="' + k.groupId + '"></span></a> <span style="font-size:0.65rem;font-weight:400;opacity:1;cursor:pointer;" title="' + dateDisplay + '">(' + moment(k["date"]).fromNow() + ')</span></h6></div><div class="col-12"></div><div class="col-12 col-sm-9 col-lg-10"><p style="font-size:0.85rem;">' + xss(k["shout"]) + '</p></div></div></div>');
                });
                setGroupThumbs(thumbnailIds);
                setGroupNames(groupIdsRequest);
                if (data.length > 0) {
                    $('#feedLoader').show();
                } else {
                    areMoreAvailable = false;
                    $('#feedLoader').hide();
                }
                if (data.length === 0 && offset === 0) {
                    areMoreAvailable = false;
                    $('#userFeedDiv').append('<div class="col-12">Your feed is empty. Make some friends!</div>');
                }
            })
            .catch(data => {
                isLoading = false;
                areMoreAvailable = false;
                console.log(data);
                // No Feed
                if (offset === 0) {
                    $('#userFeedDiv').empty();
                    $('#userFeedDiv').append('<div class="col-12">' + data.responseJSON.message + '</div>');
                }
            });
    }

    setInterval(() => {
        $('.format-date-interval-fromnow').each(function() {
            let ogDate = $(this).attr('data-original-date');
            if (!ogDate) {
                return;
            }
            $(this).html('( '+moment(ogDate).fromNow()+' )');
        });
    }, 1000);
});