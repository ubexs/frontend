let offset = 0;
let limit = 25;
let onlyShowCompletable = parseInt($('#trade-ads-filter-completable').val(), 10);
let isRunning = 1;

/**
 * @typedef TradeAdItemEntry
 * @property {number} tradeAdId
 * @property {number} catalogId
 * @property {number|null} userInventoryId
 * @property {1|2} side
 * @property {number} averagePrice
 */

/**
 * @typedef TradeAdEntry
 * @property {number} tradeAdId
 * @property {0|1} isRunning
 * @property {string} date
 * @property {number} userId
 * @property {number} offerPrimary
 * @property {number} requestPrimary
 * @property {TradeAdItemEntry[]} requestItems
 * @property {TradeAdItemEntry[]} offerItems
 */


/**
 * makeOfferOrRequestDiv
 * @param {TradeAdItemEntry} item 
 */
const makeOfferOrRequestDiv = (item) => {
    return `
                
    <div class="col-6 col-lg-4" style="margin-bottom:1rem;">
        <div class="card">
            <a href="/catalog/${item.catalogId}/--">
                <img data-catalogid="${item.catalogId}" style="width:100%;height:auto;display:block;margin:0 auto;padding:5px;" />
            </a>
            <div class="card-body" style="padding: 0.75rem;">
                <p style="font-size:0.7rem;" class="text-truncate">
                    <a href="/catalog/${item.catalogId}/--">
                        <span data-catalogid="${item.catalogId}">Loading...</span>
                    </a>
                </p>
            </div>
        </div>
    </div>

    `;
}

const loadAds = () => {
    let d = $('#trade-ads');
    request('/trade-ads/search?offset=' + offset + '&limit=' + limit + '&isRunning=' + isRunning + '&onlyShowCompletable=' + onlyShowCompletable, 'GET').then(resp => {
        d.empty();
        /**
         * @type {TradeAdEntry[]}
         */
        let ads = resp.data;
        /**
         * @type {number}
         */
        let total = resp.total;
        if (!total) {
            return d.append(`<p>Your search query returned 0 results.</p>`);
        }

        let catalogIds = [];
        let userIds = [];
        for (const ad of ads) {
            userIds.push(ad.userId);
            ad.offerItems.forEach(val => { catalogIds.push(val.catalogId) });

            let offer = '';
            let request = '';
            let requestASP = 0;
            let offerASP = 0;
            for (const item of ad.requestItems) {
                requestASP += item.averagePrice;
                catalogIds.push(item.catalogId)
                request += makeOfferOrRequestDiv(item);
            }
            for (const item of ad.offerItems) {
                offerASP += item.averagePrice;
                catalogIds.push(item.catalogId)
                offer += makeOfferOrRequestDiv(item);
            }
            let acceptButtonDisabled = '';
            if (ad.isRunning === 0) {
                acceptButtonDisabled = `disabled="disabled" title="This trade ad is no longer running, so you cannot accept it."`;
            }
            d.append(`
            
            <div class="row">
                <div class="col-12" style="margin-bottom:0.5rem;">
                    <p style="font-size:0.75rem;font-weight:300;"><a href="/users/${ad.userId}/profile"><span data-userid="${ad.userId}">Loading</span>'s</a> Trade Request (created ${moment(ad.date).fromNow()})</p>
                </div>
                <div class="col-12 col-lg-6">
                    <h2 style="font-weight:700;font-size:1rem;">OFFERING</h2>
                    <div class="row">
                        ${offer}
                    </div>
                    <p style="font-weight:600;font-size:0.8rem;"><span class="tooltipped-asp" title="The sum of the average sales price of all items offered">Total ASP: ${offerASP}</span></p>
                </div>
                <div class="col-12 col-lg-6">
                    <h2 style="font-weight:700;font-size:1rem;">REQUESTING</h2>
                    <div class="row">
                        ${request}
                    </div>
                    <p style="font-weight:600;font-size:0.8rem;"><span class="tooltipped-asp" title="The sum of the average sales price of all items requested">Total ASP: ${requestASP}</span></p>
                </div>
                <div class="col-12" style="margin-top:1rem;">
                    <button type="button" class="btn btn-outline-success" ${acceptButtonDisabled}>Accept</button>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <hr />
                </div>
            </div>
            
            `);
        }

        setUserNames(userIds);
        setUserThumbs(userIds);
        setCatalogNames(catalogIds)
        setCatalogThumbs(catalogIds);
        $('.tooltipped-asp').tooltip();
    }).catch(err => {
        console.error('error loading trade ads', err);
        d.empty();
        d.append(`<p>Oops, looks like something went wrong loading the page.<br><span class="on-click-reload-page">Try again?</span></p>`);
    })
}
loadAds();