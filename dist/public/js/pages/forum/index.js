"use strict";/*
// LMAOBRUH.com
function loadVerticalAlign()
{
    $('.vertical-align-text').each(function() {
        var size = $(this).outerHeight(true);
        size /= 3;
        $(this).children().each(function() {
            $(this).css("padding-top", size + "px");
        });
    });
}
$(window).on('resize', function(){
    loadVerticalAlign();
});
loadVerticalAlign();

$('.forumSubCategory').hide();
var template = $('.forumSubCategory');

request("/forum/subcategories", "GET")
        .then(function(d) {
            var userIds = [];
            d.forEach(function(k) {
                var clonetemp = template.clone().appendTo('.forumcategories');
                clonetemp.find("h6").each(function(i) {
                    if (i == 0) {
                        $(this).html(number_format(k.threadCount));
                    }
                    if (i == 1) {
                        $(this).html(number_format(k.postCount));
                    }
                    if (i == 2) {
                        if (!k.latestPost || k.latestPost["threadId"] === undefined) {
                            $(this).html("N/A");
                        }else{
                            $(this).html('<a href="/forum/thread/'+k.latestPost.threadId+'">'+moment(k.latestPost["dateCreated"]).fromNow()+'</a><br>By <a href="/users/'+k.latestPost.userId+'/profile"><span data-userid='+k.latestPost["userId"]+'></span></a>');
                            userIds.push(k.latestPost["userId"]);
                        }
                    }
                });
                clonetemp.find("h5").html(k.title.escape());
                clonetemp.find("p").html(k.description.escape());
                clonetemp.find("a").first().attr("href", "/forum/"+k.subCategoryId+"?page=1");
                clonetemp.show();
                setUserNames(userIds);
            });
            $('.forumcategories').show();
            $('#forumpreloader').hide();
        })
        .catch(function(e) {
            console.log(e);
            $('#alert').show();
        });

        $(document).on('click', '#searchForumPostClick', function() {
            var query = $('#searchForForumInput').val();
            window.location.href = "/forum/search?q="+query;
        });
        */$(document).on("click","#searchForumPostClick",function(){var a=$("#searchForForumInput").val();window.location.href="/forum/search?q="+a});