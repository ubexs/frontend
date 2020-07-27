(() => {
    let dataForUser = $('.metadata-for-profile');
    let userId = parseInt(dataForUser.attr('data-userid'), 10);

    var curDisplay = "";
    window.transactionoffset = 0;
    $('#transactionsBodyDisplay').parent().parent().append('<button type="button" class="btn btn-small btn-success loadMoreButtonClick" style="margin:0 auto;display: hidden;">Load More</button>');
    function loadTransactions(offset) {
        $('.loadMoreButtonClick').hide();
        request("/staff/user/"+userId+"/transactions?offset="+offset, "GET")
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

})();