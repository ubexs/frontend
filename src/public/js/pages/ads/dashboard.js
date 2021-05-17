request('/ad/my/created-ads', 'GET')
.then(d => {
    if (d.length === 0) {
        return $('#running-ads').empty().append(`<p>Get started advertising on Ubexs!</p>`);
    }
    $('#running-ads').empty();
    let groupIds = [];
    let catalogIds = [];
    for (const ad of d) {
        let imageUrl = window.subsitutionimageurl;
        if (ad.imageUrl) {
            imageUrl = ad.imageUrl;
        }
        if (!ad.title || ad.title == '') {
            ad.title = 'N/A';
        }
        let adForText = '';
        let spanText = '';
        if (ad.adType === 1) {
            adForText = 'Catalog';
            catalogIds.push(ad.adRedirectId);
            spanText = '<a href="/catalog/'+ad.adRedirectId+'"/<span data-catalogid="'+ad.adRedirectId+'">Loading...</span></a>';
        }else if (ad.adType === 2) {
            adForText = 'Group';
            groupIds.push(ad.adRedirectId);
            spanText = '<a href="/groups/'+ad.adRedirectId+'"/<span data-groupid="'+ad.adRedirectId+'">Loading...</span></a>';
        }else if (ad.adType === 3) {
            adForText = 'Forum Thread';
            spanText = '<a href="/forum/thread/'+ad.adRedirectId+'?page=1">Forum Thread</a>';
        }
        let running = '<p style="font-weight:500;cursor:pointer;" class="onClickRunAd" data-id="'+ad.adId+'">Status: <span style="color:red;">Not Running</span> (click me to run)</p>';
        if (ad.bidAmount !== 0 && moment(ad.updatedAt).add(24, 'hours').isSameOrAfter(moment())) {
            running = '<p style="font-weight:500;">Status: <span style="color:green;">Running</span> (for '+moment(ad.updatedAt).fromNow(true)+')</p>';
        }
        let adDisplay = `<p>Error</p>`;
        if (ad.adDisplayType === 1) {
            adDisplay = `<a href="${imageUrl}" target="_blank"><img src="${imageUrl}" style="width:100%;height:auto;display:block;margin:0 auto;max-width:700px;" /></a>`;
        }else if (ad.adDisplayType === 2) {
            adDisplay = `<a href="${imageUrl}" target="_blank"><img src="${imageUrl}" style="width:80px;height:auto;display:block;margin:0 auto;max-width:160px;" /></a>`;
        }
        
        $('#running-ads').append(`
        
        <div class="row">
            <div class="col-6 col-md-4 col-lg-3">
                ${adDisplay}
            </div>
            <div class="col-6 col-md-8 col-lg-9">
                <h2 style="font-size:1.25rem;margin-bottom:0;">${ad.title.escape()}</h2>
                <p>${adForText} advertisement for ${spanText}</p>
                ${running}
            </div>
            <div class="col-12">
                <p>Stats:</p>
                <div class="row">
                    <div class="col-6 col-lg-3">
                        <p title="Clicks: ${ad.clicks}">CTR: ${ ad.clicks !== 0 ? Math.trunc(ad.clicks / ad.views * 100) : 0}%</p>
                    </div>
                    <div class="col-6 col-lg-3">
                        <p>Views: ${number_format(ad.views)}</p>
                    </div>
                    <div class="col-6 col-lg-3">
                        <p title="Total Clicks: ${ad.totalClicks}">Total CTR: ${ad.totalClicks !== 0 ? Math.trunc(ad.totalClicks / ad.totalViews * 100) : 0}%</p>
                    </div>
                    <div class="col-6 col-lg-3">
                        <p>Total Views: ${number_format(ad.totalViews)}</p>
                    </div>
                </div>
            </div>
            <div class="col-12">
                <hr />
            </div>
        </div>

        
        `);
    }
    setGroupNames(groupIds);
    setCatalogNames(catalogIds);
})
.catch(e => {
    $()
})

$(document).on('click', '.onClickRunAd', function(e) {
    e.preventDefault();
    let id = $(this).attr('data-id');
    question('How much primary currency would you like to bid?', function(d) {
        if (!d) {
            return;
        }
        d = parseInt(d, 10);
        if (isNaN(d) || d > 1000000000 || d < 1) {
            return warning('Please specify a valid number between 1 and 1,000,000,000. (1 × 10⁹)');
        }
        console.log(d);
        loading();
        // create
        request('/ad/'+id+'/bid', 'POST', {
            amount: d,
        }).then(d => {
            console.log(d);
            return success('Your bid is now running!', () => {window.location.reload()});
        })
        .catch(e => {
            warning(e.responseJSON.message);
        })
    });
});
