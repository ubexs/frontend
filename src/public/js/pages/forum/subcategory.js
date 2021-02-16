var forumData = $('#forumdata');

function loadVerticalAlign() {
    $('.vertical-align-text').each(function () {
        var size = $(this).outerHeight(true);
        size /= 2;
        $(this).children().each(function () {
            $(this).css("padding-top", size + "px");
        });
    });
}
$(window).on('resize', function () {
    loadVerticalAlign();
});
loadVerticalAlign();

$('.forumSubCategory').hide();
var template = $('.forumSubCategory');
var offset = parseInt(forumData.attr("data-page"));
if (offset === 0) {
    offset = 1;
}
var offset = offset * 25 - 25;
var isLoading = false;
var preventForward = false;
var currentPage = 0;
$('.pagination').css('opacity','0.5');
preventForward = true;

const cached_pages = {};


loadThreads();

const loadThreadData = (d) => {
    $('.pagination').css('opacity','1');
    $(window).scrollTop(0);
    var pageNum = Math.trunc(offset/25);
    pageNum += 1;
    let totalThreadPageCount = Math.trunc(d.total/25)+1;
    if (totalThreadPageCount > pageNum) {
        preventForward = false;
        $('#nextPage').css('opacity','1');
    }else{
        preventForward = true;
        $('#nextPage').css('opacity','0.5');
    }
    if (pageNum !== 1) {
        $('#previousPage').css('opacity','1');
    }else{
        $('#previousPage').css('opacity','0.5');
    }
    window.history.replaceState(null, null, "/forum/"+forumData.attr("data-categoryid")+"?page="+pageNum);
    $('.forumThreads').children().each(function() {
        $(this).remove();
    });
    isLoading = false;
    var userIds = [];
    d.threads.forEach(function (k) {
        var clonetemp = template.clone().appendTo('.forumThreads');
        clonetemp.find("h6").each(function (i) {
            if (i == 0) {
                $(this).html('<a href="/users/' + k.userId + '/profile"><span data-userid=' + k["userId"] + '></span></a>');
                userIds.push(k["userId"]);
            }
            if (i == 1) {
                $(this).html(k["postCount"] - 1);
            }
            if (i == 2) {
                $(this).addClass("update-timestamp");
                $(this).attr("data-timestamp", k.latestReply);
                $(this).html(moment(k.latestReply).fromNow());
            }
        });
        clonetemp.find("h5").html(k.title.escape());
        clonetemp.find("a").first().attr("href", "/forum/thread/" + k.threadId + "?page=1");
        if (k.threadPinned === 1) {
            clonetemp.find('.pinned').first().html('<i class="fas fa-thumbtack"></i>');
        }
        clonetemp.show();
    });
    setUserNames(userIds);
    $('.forumThreads').show();
}

function loadThreads() {
    if (isLoading) {
        return;
    }
    $('.forumThreads').children().each(function() {
        $(this).css("opacity", "0.5");
    });
    isLoading = true;
    if (cached_pages[offset]) {
        return loadThreadData(cached_pages[offset]);
    }
    request("/forum/" + forumData.attr("data-categoryid") + "/threads?sort=desc&limit=25&offset=" + offset, "GET")
        .then(function (d) {
            cached_pages[offset] = d;
            loadThreadData(d);
        })
        .catch(function (e) {
            console.log(e);
            $('#alert').show();
        });
}



$('#nextPage').click(function(event) {
    event.preventDefault();
    if (preventForward) {
        return;
    }
    $('#previousPage').removeAttr("disabled");
    offset += 25;
    loadThreads();
});

$('#previousPage').click(function(event) {
    event.preventDefault();
    offset -= 25;
    if (offset < 0) {
        offset = 0;
        return;
    }
    $('#previousPage').attr("disabled","disabled");
    loadThreads();
});


setInterval(function () {
    $('.update-timestamp').each(function () {
        var time = $(this).attr("data-timestamp");
        var update = moment(time).fromNow();
        $(this).html(update);
    });
}, 60000);


/**
 * Thread Creation System
 */
// Open modal
$(document).on('click', '#createThread', function() {
    if (isNaN(parseInt($('#userdata').attr('data-userid')))) {
        window.location.href = "/login";
        return;
    }
    $('#threadCreationModal').hide();
    $('#threadCreationModal').fadeIn(250).css('display', 'none').slideDown(250).dequeue();
});
// Close modal
$(document).on('click', '#closeThreadCreate', function() {
    $('#threadCreationModal').fadeOut(100).slideUp(250).dequeue();
    setTimeout(function() {
        $('#threadTitle').val('','');
        $('#threadBody').val('','');
    }, 100);
});

// Submit Thread
$(document).on('click', '#createThreadClick', function () {
    var title = $('#threadTitle').val();
    if (title.length > 64 || title.length < 3) {
        warning("Your title must be at least 3 characters, and at most 64 characters.");
        return;
    }
    var body = $('#threadBody').val();
    if (body.length > 4096 || body.length < 10) {
        warning("Your body must be at least 10 characters, and at most 4096 characters.");
        return;
    }
    $('#createThreadClick').attr("disabled", "disabled");
    $('#closeThreadCreate').attr("disabled", "disabled");
    $('#threadTitle').attr("disabled", "disabled");
    $('#threadBody').attr("disabled", "disabled");
    var sub = parseInt($('#threadSubCategory').val());
    var locked = parseInt($('#threadLocked').val());
    var pinned = parseInt($('#threadPinned').val());
    if (isNaN(locked) || isNaN(pinned)) {
        locked = 0;
        pinned = 0;
    }
    request("/forum/thread/create", "PUT", JSON.stringify({
        "title": title,
        "body": body,
        "subCategoryId": sub,
        "locked": locked,
        "pinned": pinned,
    }))
        .then(function (d) {
            window.location.href = "/forum/thread/"+d.threadId+"?page=1";
        })
        .catch(function (e) {
            warning(e.responseJSON.message);
            $('#createThreadClick').removeAttr("disabled");
            $('#closeThreadCreate').removeAttr("disabled");
            $('#threadTitle').removeAttr("disabled");
            $('#threadBody').removeAttr("disabled");
        });
});