var curDisplay = "";
window.transactionoffset = 0;
$('#transactionsBodyDisplay').parent().parent().append('<button type="button" class="btn btn-small btn-success loadMoreButtonClick" style="margin:0 auto;display: hidden;">Load More</button>');
function loadTransactions(offset) {
    $('.loadMoreButtonClick').hide();
    request("/economy/transactions?offset="+offset, "GET")
        .then(function(data) {
            $.each(data, function(key, value) {
                curDisplay = formatCurrency(value.currency);
                var description = value.description;
                if (value.catalogId !== 0) {
                    description += ' <a href="/catalog/'+value.catalogId+'">[link]</a>';
                }
                $('#transactionsBodyDisplay').append('<tr> <th scope="row">'+value.transactionId+'</th><td>'+curDisplay+value.amount+'</td><td>'+description+'</td><td>'+moment(value.date).local().format('MMMM Do YYYY, h:mm a')+'</td></tr><tr>')
            });
            if (data.length >= 25) {
                window.transactionoffset += 25;
                $('.loadMoreButtonClick').css("display", "block");
            }else{
                window.transactionoffset = 0;
                $('.loadMoreButtonClick').hide();
            }
        })
        .catch(function(e) {
            console.log(e);
        });
}
loadTransactions(window.transactionoffset);
$(document).on('click', '.loadMoreButtonClick', function() {
    loadTransactions(window.transactionoffset);
});

/*
$('#selectExchangeOption').change(function(e) {

});
*/

$(document).on('click', '#exchangeRateClick', function() {
    var from = parseInt($('#selectExchangeOption').val());
    var value = parseInt($('#exchangeRateAmt').val());
    if (isNaN(value)) {
        warning("You must convert at minimum 1 amount of currency.");
        return;
    }
    var newAmt = 0;
    var to = 0;
    if (from === 1) {
        value = Math.trunc(value);
        if (value <= 0){
            warning("You must convert at minimum 1 amount of currency.");
            return;
        }
        to = 2;
        newAmt = Math.trunc(value * 10);
    }else{
        to = 1;
        newAmt = Math.trunc(value / 10);
        if (value <= 9) {
            warning("You must convert at minimum 10 currency.");
            return;
        }
    }
    questionYesNoHtml("Are you sure you'd like to convert "+formatCurrency(from)+value.toString()+" to "+formatCurrency(to)+newAmt.toString()+"?", function() {
        // Confirmed
        request("/economy/currency/convert", "PUT", JSON.stringify({"amount":value,"currency":from}))
            .then((d) => {
                success("The currency was converted successfully!", function() {
                    window.location.reload();
                });
            })
            .catch((e) => {
                console.log(e);
                if (!e.responseJSON) {
                    e.responseJSON = {};
                    e.responseJSON.message = "There was an error performing the conversion. Please try again later.";
                }
                warning(e.responseJSON.message);
            })
    });
});