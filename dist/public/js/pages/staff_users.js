

search();

function search() {
    function ban(c) {
        if (c === 1) {
            return 'style="opacity: 0.5;"'
        }
    }
    $('#userSearchResultsDiv').children().each(function(k) {
        $(this).css("opacity", 0.5)
    })
    request("/staff/search?offset=0")
    .then(function(d) {
        $('#userSearchResultsDiv').empty();
        var userIdThumbs = [];
        d.forEach(function(k) {
            if (k.status === null) {
                k.status = '""';
            }else{
                k.status = '"'+k.status+'"';
            }
            if (k.staff >= 1) {
                k.staff = '<p style="margin-bottom: 0;color:red;opacity: 0.75;"><i class="fas fa-user-shield" data-toggle="staffTooltip" data-placement="top" title="This user is an administrator."></i></p>';
            }else{
                k.staff = "";
            }
            $('#userSearchResultsDiv').append(`
            <div class="col-12" >
                <div class="card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-3 col-md-2 col-lg-1">
                                <a href="/users/`+k.userId+`/profile">
                                    <img src="" data-userid="`+k.userId+`" style="width: 100%;margin: 0 auto;max-width: 150px; display: block;" />
                                    `+k.staff+`
                                </a>
                            </div>
                            <div class="col-7 col-md-8 col-lg-11">
                                <h5 style="margin-bottom:0;margin-top:0;"> <a href="/users/`+k.userId+`/profile">`+k.username+`</a></h5>
                                <p style="font-size:0.75rem;margin-bottom:0.25rem;">Last Online: `+moment(k.lastOnline).local().fromNow()+`</p>
                                <p>`+k.status.escape()+`</p>
                            </div>
                            <div class="col-12">
                                <hr style="margin-bottom: 0;" />
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
        }else{
            window.searchOffset = 0;
            $('.loadMorePlayer').hide();
        }
        if (d.length <= 0) {
            $('#userSearchResultsDiv').append('<div class="col-12"><h3 class="text-center" style="margin-top:1rem;">Your search query returned 0 results.</h3></div>');
        }
        setUserThumbs(userIdThumbs);
        $("html, body").animate({ scrollTop: 0 }, 250);
    })
    .catch(function(e) {
        console.log(e);
    })
}