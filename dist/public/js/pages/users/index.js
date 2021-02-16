window.searchOffset = 0;
window.sortBy = "id";
window.sort = "asc";
var q = "";

var url = new URL(window.location.href);
if (url.searchParams.get("sortBy")) {
    window.sortBy = url.searchParams.get("sortBy");
}
if (url.searchParams.get("sort")) {
    window.sort = url.searchParams.get("sort");
}
if (url.searchParams.get("q")) {
    q = url.searchParams.get("q");
}

if (window.sortBy == "id" && window.sort == "asc") {
    $("#newSortOrder option[value=1]").attr("selected", "selected");
}
if (window.sortBy == "id" && window.sort == "desc") {
    $("#newSortOrder option[value=2]").attr("selected", "selected");
}

if (window.sortBy == "user_lastonline" && window.sort == "desc") {
    $("#newSortOrder option[value=3]").attr("selected", "selected");
}

search(0);

$('#newSortOrder').on('change', function () {
    window.searchOffset = 0;
    var val = parseInt($(this).val());
    window.sort = val;
    if (val == 1) {
        window.sortBy = "id";
        window.sort = "asc";
    } else if (val == 2) {
        window.sortBy = "id";
        window.sort = "desc";
    } else if (val == 3) {
        window.sortBy = "user_lastonline";
        window.sort = "desc";
    }
    $('#userSearchResultsDiv').empty();
    search(0);
});

function search(offset) {
    function ban(c) {
        if (c === 1) {
            return 'style="opacity: 0.5;"'
        }
    }
    /*
    $('#userSearchResultsDiv').children().each(function(k) {
        $(this).css("opacity", 0.5)
    })
    */
    request("/user/search?limit=25&username=" + q + "&offset=" + offset + "&sort=" + window.sort + "&sortBy=" + window.sortBy)
        .then(function (d) {
            // $('#userSearchResultsDiv').empty();
            var userIdThumbs = [];
            d.forEach(function (k) {
                if (k.status === null) {
                    k.status = '""';
                } else {
                    k.status = '"' + k.status + '"';
                }
                if (k.staff >= 1) {
                    k.staff = '<p style="margin-bottom: 0;color:red;opacity: 0.75;"><i class="fas fa-user-shield" data-toggle="staffTooltip" data-placement="top" title="This user is an administrator."></i></p>';
                } else {
                    k.staff = "";
                }
                $('#userSearchResultsDiv').append(`
            <div class="col-12">
                <div class="card" style="border-radius: 0;">
                    <div class="card-body groupChangeBgOnHover" style="border-bottom-radius:0;border-radius: 0;">
                        <div class="row">
                            <div class="col-3 col-md-2 col-lg-1" style="padding-right:0.25rem;">
                                <a href="/users/`+ k.userId + `/profile">
                                    <img src="" data-userid="`+ k.userId + `" style="width: 100%;margin: 0 auto;max-width: 150px; display: block;" />
                                    `+ k.staff + `
                                </a>
                            </div>
                            <div class="col-7 col-md-8 col-lg-11">
                                <h5 style="margin-bottom:0;"><a href="/users/`+ k.userId + `/profile">` + k.username + `</a></h5>
                                <p style="font-size:0.75rem;margin-bottom:0.25rem;">Last Online: `+ moment(k.lastOnline).local().fromNow() + `</p>
                                <p style="font-size:0.85rem;">`+ xss(k.status) + `</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`)
                userIdThumbs.push(k.userId);
                $('[data-toggle="staffTooltip"]').tooltip();
            });
            if (d.length >= 25) {
                window.searchOffset = window.searchOffset + 25;
                $('.loadMorePlayer').show();
            } else {
                window.searchOffset = 0;
                $('.loadMorePlayer').hide();
            }
            if (d.length <= 0) {
                $('#userSearchResultsDiv').append('<div class="col-12"><h3 class="text-center" style="margin-top:1rem;">Your search query returned 0 results.</h3></div>');
            }
            setUserThumbs(userIdThumbs);
            window.history.replaceState(null, null, "/users?sort=" + window.sort + "&sortBy=" + window.sortBy + "&q=" + q);
        })
        .catch(function (e) {
            console.log(e);
        })
}

$(document).on("click", "#searchForUserClick", function () {
    q = $('#searchForUserInput').val();
    window.searchOffset = 0;
    $('#userSearchResultsDiv').empty();
    search(0);
});
$(document).on('click', '.loadMorePlayer', function () {
    q = $('#searchForUserInput').val();
    search(window.searchOffset);
})