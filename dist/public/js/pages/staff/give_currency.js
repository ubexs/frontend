$(document).on('click', '#giveCurrency', function() {
    var currency = parseInt($('#currencyType').val());
    var amount = parseInt($('#amount').val());
    var userId = parseInt($('#userId').val());
    request("/staff/user/"+userId+"/currency", "PUT", JSON.stringify({amount: amount,currency: currency}))
        .then((d) => {
            success("Currency has been added to the specified user's balance.", function() {
            });
        })
        .catch((e) => {
            warning(e.responseJSON.message);
        })
});