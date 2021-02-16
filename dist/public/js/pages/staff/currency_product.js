let currencyProductId = 0;
request('/billing/currency/products')
.then((d) => {
    $('#currencyProductSelection').empty();
    let catalogIds = [];
    for (const item of d) {
        let bonus = '';
        if (item.bonusCatalogId !== 0) {
            bonus = '(+ a <span data-catalogid="'+item.bonusCatalogId.toString()+'"></span>)';
            catalogIds.push(item.bonusCatalogId);
        }
        $('#currencyProductSelection').append(`
        <div class="col-sm-12 col-md-6 col-4 onClickSelectItem" style="padding-bottom:0.5rem;" data-selected="false" data-productid="${item.currencyProductId}" data-bonusid="${item.bonusCatalogId}" data-usd="${item.usdPrice}" data-amt="${item.currencyAmount}">
            <div class="card">
                <div class="card-body">
                    <p class="text-center">$${item.usdPrice} USD - ${item.currencyAmount} Primary ${bonus}</p>
                </div>
            </div>
        </div>`);
    }
    setCatalogNames(catalogIds);
})
.catch(e => {
    warning(e.responseJSON.message);
});

$(document).on('click', '.onClickSelectItem', function () {
    if ($(this).attr('data-selected') === 'true') {
        $(this).attr('data-selected', 'false');
        // Unselect
        $(this).find('.card').css('border', 'none');
    }else{
        $('#currencyProductSelection').children().each(function() {
            $(this).attr('data-selected', 'false');
            $(this).find('.card').css('border', 'none');
        });
        $(this).attr('data-selected', 'true');
        // Select
        $(this).find('.card').css('border', '1px solid green');

        $('#bonusCatalogId').val($(this).attr('data-bonusid'));
        $('#usdPrice').val($(this).attr('data-usd'));
        $('#currencyAmount').val($(this).attr('data-amt'));
        currencyProductId = parseInt($(this).attr('data-productid'), 10);
        
    }
});

$(document).on('click', '#updateCurrencyProduct', function() {
    var currencyAmount = parseInt($('#currencyAmount').val(), 10);
    var usd = parseFloat($('#usdPrice').val());
    var bonusCatalogId = parseInt($('#bonusCatalogId').val(), 10);
    request("/billing/currency/product/"+currencyProductId, "PATCH", JSON.stringify({
        usdPrice: usd,
        currencyAmount: currencyAmount,
        bonusCatalogId: bonusCatalogId,
    }))
        .then((d) => {
            success("This item has been updated.", function() {
            });
        })
        .catch((e) => {
            warning(e.responseJSON.message);
        })
});