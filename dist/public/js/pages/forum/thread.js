var forumData = $('#threaddata');
// https://stackoverflow.com/questions/11890664/how-can-i-strip-certain-html-tags-out-of-a-string

$('.forumSubCategory').hide();
var template = $('.forumSubCategory');

// Setup Markdown Stuff
showdown.setOption('headerLevelStart', 3);
showdown.setOption('tables', true);
showdown.setOption('emoji', true);
showdown.setOption('simplifiedAutoLink ', false);
showdown.setOption('simpleLineBreaks ', true);
showdown.setOption('strikethrough ', true);

var offset = parseInt(forumData.attr("data-page"));
if (offset === 0) {
    offset = 1;
}
var offset = offset * 25 - 25;
loadPosts(offset);

var staff = parseInt(forumData.attr("data-userstaff"));
var userid = parseInt($('#userdata').attr("data-userid"));
var isLoading = false;
var allowAutoScroll = true;
var totalPagesAmt = 0;
var goToPostId = false;
let pageNum = 0;
function loadPosts(offset) {
    if (isNaN(offset)) {
        offset = 0;
    }
    if (isLoading) {
        return;
    }
    if (offset === 0) {
        allowAutoScroll = true;
    }
    isLoading = true;
    request("/forum/thread/" + forumData.attr("data-threadid") + "/posts?sort=asc&offset=" + offset, "GET")
        .then(function (d) {
            $('.pagination').children().remove();
            if (d.total < offset) {
                isLoading = false;
                goToPostId = false;
                loadPosts(0);
                return;
            }
            pageNum = offset / 25 + 1;
            totalPagesAmt = Math.trunc(d.total / 25) + 1;
            var i = pageNum;
            if (pageNum !== 1) {
                var n = pageNum - 1;
                $('.pagination').append('<li class="page-item"><a class="page-link" href="#">' + n + '</a></li>');
            }
            var firstPage = i;
            while (totalPagesAmt >= i) {
                if (i > 6) {
                    break;
                }
                var extraclass = "";
                if (i === firstPage) {
                    extraclass = "active";
                } else {
                    extraclass = "";
                }
                // Add
                $('.pagination').append('<li class="page-item ' + extraclass + '"><a class="page-link" href="#">' + i + '</a></li>');
                i++;
            }

            window.history.replaceState(null, null, "/forum/thread/" + forumData.attr("data-threadid") + "?page=" + pageNum);
            $(window).scrollTop(0);
            $('#loader').remove();
            isLoading = false;
            var userIds = [];
            var postDeletedSpanInfo = "";
            d.posts.forEach(function (k) {
                var converter = new showdown.Converter(),
                    text = k.body,
                    html = converter.makeHtml(text);
                var markdownString = html.escapeAllowFormatting();
                userIds.push(k.userId);
                var underPostString = "";
                if (staff >= 1 || k.userId === userid) {
                    if (k.postDeleted === 1) {
                        underPostString = `
                    <button type="button" class="btn btn-light" style="margin:0auto;display:block;width:3rem;float:right;font-size:0.85rem;" data-toggle="dropdown" aria-expanded="false" aria-haspopup="true"><i class="fas fa-chevron-circle-down" aria-hidden="true"></i></button><div class="dropdown-menu dropdown-menu-right fade">
                                                        <a class="dropdown-item unDeletePost" data-id="`+ k.postId + `" href="#">Undelete Post</a>
                                                    </div>`;
                    } else if (k.postDeleted === 2) {
                        underPostString = ``;
                    } else {
                        underPostString = `
                    <button type="button" class="btn btn-light" style="margin:0auto;display:block;width:3rem;float:right;font-size:0.85rem;" data-toggle="dropdown" aria-expanded="false" aria-haspopup="true"><i class="fas fa-chevron-circle-down" aria-hidden="true"></i></button><div class="dropdown-menu dropdown-menu-right fade">
                                                        <a class="dropdown-item deletePost" data-id="`+ k.postId + `" href="#">Delete Post</a>
                                                        <a data-currentpost="`+ k.body.escape() + `" class="dropdown-item editReply" data-id="` + k.postId + `" href="#">Edit Post</a>
                                                    </div>`;
                    }
                }
                if (k.postDeleted === 1 || k.postDeleted === 2) {
                    postDeletedSpanInfo = 'opacity:0.5';
                } else {
                    postDeletedSpanInfo = "";
                }
                var append = $(`<div class="forumPost" style="border-bottom: 1px solid rgba(0,0,0,.125);` + postDeletedSpanInfo + `" data-postid="` + k.postId + `">
                    <div class="card" style="border-radius:0;border:none;box-shadow:none;">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-12 col-md-4 col-lg-3 d-none d-md-block" style="max-width: 200px;">
                                    <img style="width:100%;max-width: 150px;display: block;margin: 0 auto;" data-userid="`+ k.userId + `" />
                                    <a href="/users/`+ k.userId + `/profile"><h6 class="text-truncate font-weight-bold"><span style="font-weight:600;"></span><span data-stafftype-userid="` + k.userId + `" class="staffRankLevel"></span><span data-userid="` + k.userId + `">Loading...</span></h6></a>
                                    <p style="margin-bottom:0;font-size:0.75rem;" title="${moment(k.dateCreated).format("MMMM Do YYYY, h:mm a")}"><span style="font-weight:600;">Posted: </span>` + moment(k.dateCreated).fromNow() + `</p>
                                    <p style="margin-bottom:0;font-size:0.75rem;"><span style="font-weight:600;">Post Count: </span><span data-postcount-userid="`+ k.userId + `"></span></p>
                                    <p style="margin-bottom:0;"></p>
                                </div>
                                <div class="col-12 d-block d-md-none">
                                    <div class="row">
                                        <div class="col-4">
                                            <img style="width:100%;max-width: 150px;display: block;margin: 0 auto;" data-userid="`+ k.userId + `" />
                                        </div>
                                        <div class="col-8">
                                            <a href="/users/`+ k.userId + `/profile"><h6 class="text-truncate font-weight-bold"><span style="font-weight:600;"></span><span data-stafftype-userid="` + k.userId + `" class="staffRankLevel"></span><span data-userid="` + k.userId + `">Loading...</span></h6></a>

                                            <p style="margin-bottom:0;font-size:0.75rem;" title="${moment(k.dateCreated).format("MMMM Do YYYY, h:mm a")}"><span style="font-weight:600;">Posted: </span>` + moment(k.dateCreated).fromNow() + `</p>
                                            <p style="margin-bottom:0;font-size:0.75rem;"><span style="font-weight:600;">Post Count: </span><span data-postcount-userid="`+ k.userId + `"></span></p>
                                            <p style="margin-bottom:0;"></p>
                                            ${underPostString}
                                        </div>
                                    </div>
                                </div>
                                <div class="col text-left">
                                    <div class="row">
                                        <div class="col-12 col-md-10">
                                            <div style="font-weight: 500;font-size:0.85rem;">`+ markdownString + `</div>
                                        </div>
                                        <div class="col-4 col-md-2 d-none d-md-block">
                                            `+ underPostString + `
                                        </div>
                                    </div>
                                    <br>
                                    <hr />
                                    <p style="margin-bottom:0;font-size:0.85rem;" data-signature-userid="`+ k.userId + `"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`);
                $('#forumPosts').append(append);
            });
            if (d.posts.length < 25) {
                allowAutoScroll = false;
                $('#loader').hide();
            } else {
                allowAutoScroll = true;
            }
            setUserNames(userIds);
            setUserThumbs(userIds);
            setUserPostCount(userIds);
            setUserPermissionType(userIds);
            setUserSignature(userIds);

            if (goToPostId) {
                $('.forumPost').each(function () {
                    if (parseInt($(this).attr('data-postid')) === goToPostId) {
                        $("html, body").animate({ scrollTop: $(this).offset().top - 100 }, 250);
                        goToPostId = false;
                    }
                });
                if (goToPostId) {
                    loadPosts(offset + 25);
                    return;
                }
            }
        })
        .catch(function (e) {
            console.log(e);
            if (offset === 0) {
                $('#alert').show();
            } else {
                isLoading = true;
            }
        });
}
var currentPage = 0;
$(document).on('click', '.page-link', function () {
    var page = parseInt($(this).html());
    $('.forumPost').remove();
    loadPosts(page * 25 - 25);
});
/*
$('#nextPage').click(function(event) {
    event.preventDefault();
    if (!allowAutoScroll) {
        return;
    }
    $('#previousPage').removeAttr("disabled");
    offset += 25;
    loadPosts(offset);
    $('.forumPost').remove();
});

$('#previousPage').click(function(event) {
    event.preventDefault();
    offset -= 25;
    if (offset < 0) {
        offset = 0;
        return;
    }
    $('#previousPage').attr("disabled","disabled");
    loadPosts(offset);
    $('.forumPost').remove();
});
*/

$("body").on('DOMSubtreeModified', ".staffRankLevel", function () {
    if (!$(this).attr("data-stafftype-userid")) {
        return;
    }
    $(this).removeAttr("data-stafftype-userid");
    var level = parseInt($(this).html());
    if (level >= 1) {
        $(this).html('<i style="color:red;" class="fas fa-user-shield" data-toggle="tooltip" data-placement="top" title="This user is an administrator."></i> ');
        $('[data-toggle="tooltip"]').tooltip();
    } else {
        $(this).html("");
    }
});

$(document).on('click', '.deletePost', function (e) {
    e.preventDefault();
    var id = parseInt($(this).attr("data-id"));
    questionYesNo("Are you sure you'd like to delete this post?", function () {
        request("/forum/post/" + id, "DELETE")
            .then(function (d) {
                success("This post has been deleted", function () {
                    window.location.reload();
                });
            })
            .catch(function (e) {
                console.log(e);
                warning(e.responseJSON.message);
            });
    });
});

$(document).on('click', '.deleteThread', function (e) {
    e.preventDefault();
    var id = parseInt($(this).attr("data-id"));
    questionYesNo("Are you sure you'd like to delete this thread? This will replace the title with \"[ Deleted " + id + " ]\" and hide it from search results.", function () {
        request("/forum/thread/" + id, "DELETE")
            .then(function (d) {
                success("This thread has been deleted", function () {
                    window.location.reload();
                });
            })
            .catch(function (e) {
                console.log(e);
                warning(e.responseJSON.message);
            });
    });
});
// Edit a Thread

// open modal
$(document).on('click', '.editThread', function (e) {
    e.preventDefault();
    var id = parseInt($(this).attr("data-id"));

    // ...
    // uhh prompt a modal here or something allowing you to lock/unlock
    // ...
    $('#editThreadModal').hide();
    $('#editThreadModal').fadeIn(250).css('display', 'none').slideDown(250).dequeue();

});
// close modal
$(document).on('click', '#editThreadClose', function (e) {
    e.preventDefault();
    $('#editThreadModal').fadeOut(100).slideUp(250).dequeue();
});
// submit changes
$(document).on('click', '#editThreadClick', function (e) {
    $('#editThreadClose').attr('disabled', 'disabled');
    $('#editThreadClick').attr('disabled', 'disabled');
    $('#threadPinned').attr('disabled', 'disabled');
    $('#threadLocked').attr('disabled', 'disabled');
    var id = parseInt($(this).attr("data-id"));
    const unDisable = () => {
        $('#editThreadClose').removeAttr('disabled');
        $('#editThreadClick').removeAttr('disabled');
        $('#threadPinned').removeAttr('disabled');
        $('#threadLocked').removeAttr('disabled');
    }
    // ok
    var locked = parseInt($('#threadLocked').val());
    var pinned = parseInt($('#threadPinned').val());
    if (isNaN(locked) || isNaN(pinned)) {
        locked = 0;
        pinned = 0;
    }
    request("/forum/thread/" + id + "/update", "PATCH", JSON.stringify({
        "isLocked": locked,
        "isPinned": pinned,
    }))
        .then(function (d) {
            console.log(d);
            success("This thread has been updated.", () => {
                window.location.reload();
            });
        })
        .catch(function (e) {
            unDisable();
            console.log(e);
            warning(e.responseJSON.message);
        });
});


$(document).on('click', '.unDeletePost', function (e) {
    e.preventDefault();
    var id = parseInt($(this).attr("data-id"));
    questionYesNo("Are you sure you'd like to undelete this post?", function () {
        request("/forum/post/" + id + "/undelete", "POST")
            .then(function (d) {
                success("This post has been undeleted", function () {
                    window.location.reload();
                });
            })
            .catch(function (e) {
                console.log(e);
                warning(e.responseJSON.message);
            });
    });
});
$(document).on('click', '.unDeleteThread', function (e) {
    e.preventDefault();
    var id = parseInt($(this).attr("data-id"));
    questionYesNo("Are you sure you'd like to undelete this thread?", function () {
        request("/forum/thread/" + id + "/undelete", "POST")
            .then(function (d) {
                success("This thread has been undeleted", function () {
                    window.location.reload();
                });
            })
            .catch(function (e) {
                console.log(e);
                warning(e.responseJSON.message);
            });
    });
});
/**
 * Reply System
 */
// Open modal
$(document).on('click', '#reply', function (e) {
    e.preventDefault();
    if (isNaN(userid)) {
        window.location.href = "/login";
        return;
    }
    // Grab if available
    var replyBody = "";
    replyBody = sessionStorage.getItem('forum_thread_' + forumData.attr("data-threadid"));
    $('#replyBody').val(replyBody);
    $('#replyCreationModal').hide();
    $('#replyCreationModal').fadeIn(250).css('display', 'none').slideDown(250).dequeue();
});
// Close modal
$(document).on('click', '#closeReply', function (e) {
    e.preventDefault();
    $('#replyCreationModal').fadeOut(100).slideUp(250).dequeue();
    // Save
    var html = $('#replyBody').val();
    // If empty and never saved before, then ignore
    if (!html && !sessionStorage.getItem('forum_thread_' + forumData.attr("data-threadid"))) {
        sessionStorage.removeItem('forum_thread_' + forumData.attr("data-threadid"));
        return;
    }
    sessionStorage.setItem('forum_thread_' + forumData.attr("data-threadid"), html);
    setTimeout(function () {
        $('#replyBody').val('', '');
    }, 250);
});

// Submit reply
$(document).on('click', '#createReply', function (e) {
    e.preventDefault();
    $('#createReply').attr("disabled", "disabled");
    $('#closeReply').attr("disabled", "disabled");
    $('#replyBody').attr("disabled", "disabled");
    var body = $('#replyBody').val();
    request("/forum/thread/" + forumData.attr("data-threadid") + "/reply", "PUT", JSON.stringify({
        "body": body,
    }))
        .then(function (d) {
            $('#createReply').removeAttr("disabled");
            $('#closeReply').removeAttr("disabled");
            $('#replyBody').removeAttr("disabled");
            toast(true, "Reply Posted!");
            sessionStorage.removeItem('forum_thread_' + forumData.attr("data-threadid"));
            $('.forumPost').remove();
            goToPostId = d.postId;
            loadPosts(totalPagesAmt * 25 - 25);
            $('#replyCreationModal').fadeOut(100).slideUp(250).dequeue();
            setTimeout(function () {
                $('#replyBody').val('', '');
            }, 250);
        })
        .catch(function (e) {
            $('#createReply').removeAttr("disabled");
            $('#closeReply').removeAttr("disabled");
            $('#replyBody').removeAttr("disabled");
            warning(e.responseJSON.message);
        });
});

/**
 * Edit System
 */
// Open modal
var editId = 0;
var oldreplytext = "";
$(document).on('click', '.editReply', function (e) {
    e.preventDefault();
    editId = $(this).attr("data-id");
    oldreplytext = $(this).attr('data-currentpost');
    if (isNaN(userid)) {
        window.location.href = "/login";
        return;
    }
    // Grab if available
    var replyBody = "";
    replyBody = sessionStorage.getItem('forum_reply_' + editId);
    if (!replyBody) {
        replyBody = $(this).attr("data-currentpost");
    }
    $('#editReplyBody').val(replyBody);
    $('#editReplyModal').hide();
    $('#editReplyModal').fadeIn(250).css('display', 'none').slideDown(250).dequeue();
});
// Close modal
$(document).on('click', '#closeEditReply', function () {
    $('#editReplyModal').fadeOut(100).slideUp(250).dequeue();
    // Save
    var html = $('#editReplyBody').val();
    // If empty and never saved before, then ignore
    if (!html && !sessionStorage.getItem('forum_reply_' + editId) || oldreplytext === html) {
        sessionStorage.removeItem('forum_reply_' + editId);
        return;
    }
    sessionStorage.setItem('forum_reply_' + editId, html);
    setTimeout(function () {
        $('#editReplyBody').val('', '');
    }, 250);
});

// Submit reply
$(document).on('click', '#editReplyClick', function () {
    $('#createReply').attr("disabled", "disabled");
    $('#closeEditReply').attr("disabled", "disabled");
    $('#editReplyBody').attr("disabled", "disabled");
    var body = $('#editReplyBody').val();
    request("/forum/post/" + editId + "/", "PATCH", JSON.stringify({
        "body": body,
    }))
        .then(function (d) {
            $('#editReplyClick').removeAttr("disabled");
            $('#closeEditReply').removeAttr("disabled");
            $('#editReplyBody').removeAttr("disabled");
            toast(true, "Reply Edited!");
            sessionStorage.removeItem('forum_reply_' + editId);
            $('.forumPost').remove();
            goToPostId = d.postId;
            loadPosts(totalPagesAmt * 25 - 25);
            $('#replyCreationModal').fadeOut(100).slideUp(250).dequeue();
            setTimeout(function () {
                $('#editReplyBody').val('', '');
                $('#editReplyModal').fadeOut(100).slideUp(250).dequeue();
            }, 250);
        })
        .catch(function (e) {
            $('#editReplyClick').removeAttr("disabled");
            $('#closeEditReply').removeAttr("disabled");
            $('#editReplyBody').removeAttr("disabled");
            warning(e.responseJSON.message);
        });
});