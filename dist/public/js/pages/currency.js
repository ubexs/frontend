request('/billing/accepted-currencies', 'GET')
.then(d => {
    let possibleCurrencies = d;
    
    request("/billing/currency/products", 'GET')
    .then(function(amts) {
        $('#currencyOptions').empty();
        let catalogIds = [];
        amts.forEach(function(item) {
            //var extra = '<span style="font-weight:800;">Bonus Item: </span>N/A';
            var extra = "<span>&emsp;</span>";
            if (item.bonusCatalogId !== 0) {
                extra = `<span style="font-weight:800;">Bonus Item: </span><a href="/catalog/${item.bonusCatalogId}/--" target="_blank"><span data-catalogid="${item.bonusCatalogId}"></span></a>`;
                catalogIds.push(item.bonusCatalogId);
            }
            var prim = item["currencyAmount"];
            var secon = item["currencyAmount"] * 10;
            $('#currencyOptions').append(`
            <div class="col-12 col-md-6" style="margin-bottom:0.5rem;">
                <div class="card">
                    <div class="card-body">
                        <h1>`+formatCurrency(1)+` `+number_format(prim)+`<span style="font-weight:400;font-size: 1.25rem;"> $`+item.usdPrice+` USD</span></h1>
                        <p style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">`+extra+`</p>
                        <p><small>Converts to `+formatCurrency(2)+` `+number_format(secon)+` with our conversion system</small></p>
                        <button type="button" class="btn btn-success onClickPurchaseCurrency" data-price="`+item.usdPrice+`" data-id="`+item.currencyProductId+`" style="width:100%;margin-top:0.5rem;">Purchase</button>
                    </div>
                </div>
            </div>`);
        });
        setCatalogNames(catalogIds);
    })
    .catch(function(e) {
        $('#alerts').show();
    });

    console.log("There's gonna be a ton of errors here due to paypal not being compatible with our csp - but that's OK. This seems to just be metric logging right now so it does not matter");

    $(document).on('click', '.onClickPurchaseCurrency', function() {
    var amt = parseFloat($(this).attr('data-price'));
    var id = parseInt($(this).attr('data-id'));
    var append = $(this).parent().parent().parent().clone();
    $(append).find('button').hide();
    $(append).attr('class','');
    $('#currencyPurchaseArea').append(append);

    $('#currencyOptions').fadeOut(100);
    setTimeout(function() {
        $('#currencyPurchase').fadeIn(100);
    }, 100);
    $('#currencyPurchasePaypal').html(`
    <button type="button" class="btn btn-success onClickStartTransaction" data-id="${id}" style="width:100%;margin-top:0.5rem;"><i class="fab fa-bitcoin"></i> Continue to Coin Payments</button>
    `);
    /*
    // Setup Paypal
    paypal.Buttons({
        createOrder: function(data, actions) {
            // Set up the transaction
            return actions.order.create({
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: id,
                    amount: {
                        value: amt
                    }
                }]
            });
    },
    onApprove: function(data, actions) {
        return request('/billing/paypal/currency/purchase', 'POST', JSON.stringify({orderId: data.orderID}))
        .then(function(d) {
            success('Thank you for your purchase. The currency has been added to your account.', function() {
                window.location.reload();
            });
        })
        .catch(function(e) {
            warning(e.responseJSON.message);
        });
    },
    }).render('#currencyPurchasePaypal');
    */
    });

    $(document).on('click', '.onClickStartTransaction', function(e) {
        let kv = {};
        for (const item of possibleCurrencies) {
            kv[item.id] = item.name;
        }
        question('Please select the currency you\'d like to pay in.', (currency) => {
            note('Note: After payment, your transaction will be in a confirming state. This may take anywhere from 2 minutes to 24 hours, depending on network congestion. After the payment is confirmed, you will recieve the product you purchased.', () => {
                loading();
                request('/billing/currency/purchase', 'POST', JSON.stringify({
                    'currencyProductId': parseInt($(this).attr('data-id')),
                    'currency': currency,
                }))
                .then((d) => {
                    window.location.href = d.url;
                })
                .catch((e) => {
                    warning(e.responseJSON.message);
                });
            });
        }, 'select', kv);
    });

    $(document).on('click', '#goBackToPurchaseScreen', function(e) {
    e.preventDefault();
    $('#currencyPurchaseArea').empty();
    $('#currencyPurchasePaypal').empty();

    $('#currencyPurchase').fadeOut(100);
    setTimeout(function() {
        $('#currencyOptions').fadeIn(100);
    }, 100);
    });
})
.catch(e => {
    console.error(e);
    return warning('Sorry, our website seems to be having issues right now. Try again later.', () => {
        window.location.reload();
    });
});