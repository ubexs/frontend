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
if (offset === 0 || isNaN(offset)) {
    offset = 1;
}
var offset = offset * 25 - 25;
var isLoading = false;
var preventForward = false;
var query = $('.query').attr('data-query');
loadThreads(query);

function loadThreads(query) {
    if (isLoading) {
        return;
    }
    $('.forumThreads').children().each(function() {
        $(this).css("opacity", "0.5");
    });
    isLoading = true;
    request("/forum/threads/search?q="+query+"&offset=" + offset, "GET")
        .then(function (d) {
            $(window).scrollTop(0);
            var pageNum = Math.trunc(offset/25);
            pageNum += 1;
            window.history.replaceState(null, null, "/forum/search?page="+pageNum+"&q="+query);
            $('.forumThreads').children().each(function() {
                $(this).remove();
            });
            isLoading = false;
            var userIds = [];
            d.forEach(function (k) {
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
                    clonetemp.find('.pinned').first().html('<i class="fas fa-thumbtack"></i> Pinned');
                }
                clonetemp.show();
            });
            setUserNames(userIds);
            if (d.length < 25) {
                preventForward = false;
            }
            $('.forumThreads').show();
        })
        .catch(function (e) {
            console.log(e);
            $('#alert').show();
        });
}
var currentPage = 0;
$('#nextPage').click(function(event) {
    if (preventForward) {
        return;
    }
    event.preventDefault();
    $('#previousPage').removeAttr("disabled");
    offset += 25;
    loadThreads(query);
});

$('#previousPage').click(function(event) {
    event.preventDefault();
    offset -= 25;
    if (offset < 0) {
        offset = 0;
        return;
    }
    $('#previousPage').attr("disabled","disabled");
    loadThreads(query);
});


setInterval(function () {
    $('.update-timestamp').each(function () {
        var time = $(this).attr("data-timestamp");
        var update = moment(time).fromNow();
        $(this).html(update);
    });
}, 60000);


$(document).on('click', '#searchForumPostClick', function() {
    query = $('#searchForForumInput').val();
    loadThreads(query);
});