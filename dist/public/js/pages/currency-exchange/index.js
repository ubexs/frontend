if (localStorage.getItem('has-seen-forex-warning') !== 'true') {
    note('Trading virtual currencies is dangerous, and can lead to large loses. Nobody will be able to assist you in the event of a currency crash. Only trade what you can afford to lose.', function(e) {
        localStorage.setItem('has-seen-forex-warning','true');
    })
}

const reloadBalance = () => {
    return request('/auth/current-user', 'GET').then(d => {
        $('#currencyBalanceOne').attr('data-original-title', '$'+d.primaryBalance.toString()).attr('data-amt', d.primaryBalance.toString()).html(bigNum2Small(d.primaryBalance));
        $('#currencyBalanceTwo').attr('data-original-title', '$'+d.secondaryBalance.toString()).attr('data-amt', d.secondaryBalance.toString()).html(bigNum2Small(d.secondaryBalance));
    })
}
setInterval(() => {
    reloadBalance();
}, 15000);

let currentMode = 2;
let twentyFourHourAvg = 0;

let _oldChartJson = '';
let _isLockedChart = false;
const loadChart = (currencyType) => {
    if (_isLockedChart) {
        return;
    }
    _isLockedChart = true;
    return request('/currency-exchange/positions/charts/'+currencyType, 'GET').then(d => {
        _isLockedChart = false;
        let _newChartJson = JSON.stringify(d);
        if (_newChartJson === _oldChartJson) {
            return;
        }
        _oldChartJson = _newChartJson;
        $("#chartContainer").empty();
        let txt = '';
        let chartColor = '';
        if (currencyType === 1) {
            txt= 'Rate per 1 secondary';
            $('#chart-heading').html(formatCurrency(2)+' to '+formatCurrency(1)+' Price History');
            chartColor = 'rgb(40, 167, 69)';
        }else{
            txt = 'Rate per 1 primary';
            $('#chart-heading').html(formatCurrency(1)+' to '+formatCurrency(2)+' Price History');
            chartColor = 'rgb(255, 193, 7)';
        }
        let latest = $('#latest-transactions');
        latest.empty();

        let priceArr = [];
        let dateArr = [];
        let _i = 0;
        let _ids = [];
        d.forEach(el => {
            priceArr.push(el.rate);
            dateArr.push(new Date(el.createdAt).toISOString());
            twentyFourHourAvg += el.rate;

            if (_i > 50) {
                return;
            }
            _ids.push(el.buyerUserId, el.sellerUserId);
            latest.append(`
            
            <div class="row">
                <div class="col-12">
                    <p style="font-size:0.75rem;"><span data-userid="${el.buyerUserId}">Loading...</span> purchased <span class="font-weight-bold">${formatCurrency(currencyType,'0.75rem')}${number_format(el.amountPurchased)}</span> for <span class="font-weight-bold">${formatCurrency(currencyType === 1 ? 2 : 1,'0.75rem')}${number_format(el.amountSold)}</span> from <span data-userid="${el.sellerUserId}">Loading...</span> ${moment(el.createdAt).fromNow()} (rate: <span class="font-weight-bold">${el.rate}</span>)</p>
                    <hr />
                </div>
                            
            </div>
                            
            `);
            _i++;
        });
        setUserNames(_ids);
        setUserThumbs(_ids);
        twentyFourHourAvg = twentyFourHourAvg / d.length;
        let chartTextColor = '#212529';
        let themeForCharts = 'light';
        if (getTheme() === 1) {
            chartTextColor = '#FFFFFF';
            themeForCharts = 'dark';
        }
        let options = {
            series: [{
                name: txt,
                data: priceArr,
            }],
            chart: {
                height: 350,
                type: 'area',
                foreColor: chartTextColor,
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth'
            },
            xaxis: {
                type: 'datetime',
                categories: dateArr,
                foreColor: chartTextColor,
            },
            colors: [chartColor],
            tooltip: {
                theme: themeForCharts,
                x: {
                    format: 'dd/MM/yy HH:mm',
                },
            },
        };

        let chart = new ApexCharts(document.querySelector("#chartContainer"), options);
        chart.render();
    })
}
setInterval(() => {
    if (!_isLockedChart) {
        loadChart(currentMode);
    }
}, 2500);

let isBestPositionsLoading = false;
let attempts = 0;
const loadBestPositions = (currencyType) => {
    if (isBestPositionsLoading) {
        return;
    }
    isBestPositionsLoading = true;
    return request('/currency-exchange/positions/currency-type/'+currencyType).then(d => {
        isBestPositionsLoading = false;
        let el = $('#all-positions');
        attempts++;
        if (attempts === 1) {
            el.empty();

            el.append(`
<div class="row">
    <div class="col-3">You Give</div>
    <div class="col-3">You Get</div>
    <div class="col-3">Available</div>
</div>`);
        }
        /*
        if (attempts >= 3) {
            d[0]['balance'] = d[0]['balance'] + 100;
        }
        if (attempts >= 4) {
            d[0]['rate'] = d[1]['rate'] + 25.9;
        }
        let _newArr = [];
        if (attempts >= 6) {
            d.forEach((el, i) => {
                console.log(i);
                if (i !== 0) {
                    _newArr.push(el);
                }
            })
            d = _newArr;
        }
        isBestPositionsLoading=false;
        */

        // el.empty();
       if (d.length === 0) {
           attempts = 0;
           el.empty().append(`<p>There are no open positions for this query.</p>`);
       }else{

           // First, lets go through all the children
           let existingIds = [];
           $('.currency-exchange-entry').each(function(){
                let id = parseInt($(this).attr('data-id'));
                let rate = parseFloat($(this).attr('data-rate'));
                let balance = parseInt($(this).attr('data-balance'));

                let stillExists = false;
                d.forEach(pos => {
                     if (pos.positionId === id) {
                         stillExists = pos;
                     }
                });
                // No longer exists
                if (!stillExists) {
                    $(this).fadeOut(250).delay(250).remove();
                    return;
                }
                existingIds.push(id);

                let modified = false;
                if (stillExists.balance !== balance) {
                    // update balance
                    $(this).find('.full-rate-formatted').html(`${formatCurrency(stillExists.currencyType === 1 ? 2 : 1, '0.85rem')}${stillExists.rate}`);
                    $(this).find('.full-balance').find('p').html(`${formatCurrency(stillExists.currencyType, '0.85rem')}${number_format(stillExists.balance)}`);
                    $(this).find('.amount-to-buy').attr('data-balance',stillExists.balance);
                    modified = true;
                }
                if (stillExists.rate !== rate) {
                    // update rate
                    $(this).find('.amount-to-buy').attr('data-rate',stillExists.rate);
                    modified = true;
                }

                if (modified) {
                    let amToBuy = $(this).find('.amount-to-buy');
                    let rate = parseFloat($(amToBuy).attr('data-rate'));
                    let max = parseInt($(amToBuy).attr('data-balance'), 10);
                    let enteredValue = parseInt($(amToBuy).val(), 10);

                    let currencyType = parseInt($(amToBuy).attr('data-currencytype'), 10);
                    let userIsPaying = Math.trunc(enteredValue*rate * 100) / 100;
                    if (isNaN(userIsPaying)) {
                        userIsPaying = 0;
                    }
                    if (isNaN(enteredValue)) {
                        enteredValue = 0;
                        $(amToBuy).parent().find('.submit-buy-position').attr('disabled','disabled');
                    }else{
                        if (enteredValue > max) {
                            enteredValue = max;
                            $(amToBuy).parent().find('.submit-buy-position').attr('disabled','disabled');
                        }else{
                            if (userIsPaying < 1 || userIsPaying.toString().includes('.')) {
                                $(amToBuy).parent().find('.submit-buy-position').attr('disabled','disabled');
                            }else{
                                $(amToBuy).parent().find('.submit-buy-position').removeAttr('disabled');
                            }
                        }
                    }
                    $(amToBuy).parent().find('.youll-pay').html(`${formatCurrency(currencyType === 1 ? 2 : 1)}`+userIsPaying);
                    $(amToBuy).attr('data-youll-pay',userIsPaying);
                }
           });

           let ids = [];
           d.forEach(pos => {
               if (existingIds.includes(pos.positionId)) {
                   return; // skip
               }
               ids.push(pos.userId);
               let buyBtn = `<button type="button" class="btn btn-success buy-position" style="padding-top:0.25rem;padding-bottom:0.25rem;font-size:0.85rem;float:right;" data-id="${pos.positionId}">Buy</button>`;
               if (pos.userId === userId) {
                   buyBtn = `<button type="button" class="btn btn-success" style="padding-top:0.25rem;padding-bottom:0.25rem;font-size:0.85rem;float:right;" disabled="disabled"><span title="You are selling this." data-buyposition-tooltip-toggle="true">Buy</span></button>`;
               }
              el.append(`
              
              <div class="row currency-exchange-entry" data-id="${pos.positionId}" data-rate="${pos.rate}" data-balance="${pos.balance}">
                    <div class="col-3">
                        <p style="font-size:0.85rem;" class="full-rate-formatted">${formatCurrency(pos.currencyType === 1 ? 2 : 1, '0.85rem')}${pos.rate}</p>
                    </div>
                    <div class="col-3">
                        <p style="font-size:0.85rem;">
                            ${formatCurrency(pos.currencyType, '0.85rem')}1
                        </p>
                    </div>
                    <div class="col-6" class="full-balance">
                        <p style="font-size:0.85rem;float:left;">${formatCurrency(pos.currencyType, '0.85rem')}${number_format(pos.balance)}</p>
                        ${buyBtn}
                    </div>
                    <div class="col-12 open-position-full" data-id="${pos.positionId}" style="display:none;">
                        <div class="row" style="margin-top:1rem;">
                            <div class="col-3">
                                <img src="${window.subsitutionimageurl}" data-userid="${pos.userId}" style="width:100%;" />
                                <p data-userid="${pos.userId}" style="font-size:0.75rem;">Loading...</p>
                            </div>
                            <div class="col-9">
                                <input type="text" class="form-control amount-to-buy" placeholder="Amount of the currency you want to buy." style="font-size:0.75rem;" data-rate="${pos.rate}" data-balance="${pos.balance}" data-currencytype="${pos.currencyType}">
                                <p style="font-size:0.75rem;margin-top:1rem;">You'll Pay: <span class="youll-pay">${formatCurrency(pos.currencyType === 1 ? 2 : 1)}0</span></p>
                                <button type="button" class="btn btn-outline-success submit-buy-position" style="padding-top:0.25rem;padding-bottom:0.25rem;font-size:0.85rem;float:right;" data-id="${pos.positionId}" disabled="disabled">Submit</button>
                            </div>
                        </div>
                    
                    </div>
                    <div class="col-12">
                        <hr />
                    </div>
               </div>
               
              
              `);
           });
           setUserNames(ids);
           setUserThumbs(ids);

           $('[data-buyposition-tooltip-toggle="true"]').tooltip();
       }
    });
}
setInterval(() => {
    console.log('load best positions');
    loadBestPositions(currentMode);
}, 2500);

$(document).on('input', '.amount-to-buy', function(e) {
    let rate = parseFloat($(this).attr('data-rate'));
    let max = parseInt($(this).attr('data-balance'), 10);
    let enteredValue = parseInt($(this).val(), 10);

    let currencyType = parseInt($(this).attr('data-currencytype'), 10);
    let userIsPaying = Math.trunc(enteredValue*rate * 100) / 100;
    if (isNaN(userIsPaying)) {
        userIsPaying = 0;
    }
    if (isNaN(enteredValue)) {
        enteredValue = 0;
        $(this).parent().find('.submit-buy-position').attr('disabled','disabled');
    }else{
        if (enteredValue > max) {
            enteredValue = max;
            $(this).parent().find('.submit-buy-position').attr('disabled','disabled');
        }else{
            if (userIsPaying < 1 || userIsPaying.toString().includes('.')) {
                $(this).parent().find('.submit-buy-position').attr('disabled','disabled');
            }else{
                $(this).parent().find('.submit-buy-position').removeAttr('disabled');
            }
        }
    }
    $(this).parent().find('.youll-pay').html(`${formatCurrency(currencyType === 1 ? 2 : 1)}`+userIsPaying);
    $(this).attr('data-youll-pay',userIsPaying);
});

$(document).on('click', '.submit-buy-position', function(e) {
    let amountToBuy = parseInt($(this).parent().find('.amount-to-buy').val(), 10);
    let currencyToBuy = parseInt($(this).parent().find('.amount-to-buy').attr('data-currencytype'), 10);
    let youllPay = parseInt($(this).parent().find('.amount-to-buy').attr('data-youll-pay'), 10);
    let id = parseInt($(this).attr('data-id'), 10);
    questionYesNoHtml(`Please confirm that you would like to buy ${formatCurrency(currencyToBuy)}${amountToBuy} for ${formatCurrency(currencyToBuy === 1 ? 2 : 1)}${youllPay}.`, function(e) {
        loading();
        request('/currency-exchange/positions/'+id+'/purchase', 'POST', {
            amount: amountToBuy,
        }).then(d => {
            success('Your transaction has been completed.');
            loadMyPositions(currentMode);
            loadBestPositions(currentMode);
            reloadBalance();
        }).catch(e => {warning(e.responseJSON.message)})
    });
});

$(document).on('click', '.buy-position', function(e) {
    let id = parseInt($(this).attr('data-id'), 10);
    let el = $('.open-position-full[data-id="'+id+'"]');
    if ($(this).attr('data-open') === 'true') {
        // Open, so close it
        $(this).attr('data-open','false');
        el.hide();
    }else{
        // Closed, so open it
        $(this).attr('data-open','true');
        el.show()
    }
});

const loadMyPositions = (currencyType) => {
    return request('/currency-exchange/positions/users/'+userId).then(d => {
        let el = $('#my-positions');
        el.empty();
       if (d.length === 0) {
           el.append(`<p>You do not have any open positions.</p>`);
       }else{
           el.append(`
<div class="row">
    <div class="col-3">You Give</div>
    <div class="col-3">You Get</div>
    <div class="col-3">Available</div>
</div>
                    `);
            d.forEach(pos => {
               el.append(`
               
               <div class="row">
                    <div class="col-3">
                        <p style="font-size:0.85rem;">
                            ${formatCurrency(pos.currencyType, '0.85rem')}1
                        </p>
                    </div>
                    <div class="col-3">
                        <p style="font-size:0.85rem;">${formatCurrency(pos.currencyType === 1 ? 2 : 1, '0.85rem')}${pos.rate}</p>
                    </div>
                    <div class="col-6">
                        <p style="font-size:0.85rem;float:left;">${formatCurrency(pos.currencyType, '0.85rem')}${number_format(pos.balance)}</p>
                        <button type="button" class="btn btn-outline-danger close-position" style="padding-top:0.25rem;padding-bottom:0.25rem;font-size:0.85rem;float:right;" data-id="${pos.positionId}">Close</button>
                    </div>
                    <div class="col-12">
                        <hr />
                    </div>
               </div>
               
               
               `);
            });
       }
    });
}


Promise.all([loadChart(currentMode), loadMyPositions(currentMode), loadBestPositions(currentMode)]).then(() => {
    $('#type-selection').removeAttr('disabled');
})

$('#type-selection').change(function(e) {
    $(this).attr('disabled','disabled');
    currentMode = parseInt($(this).val());
    Promise.all([loadChart(currentMode), loadMyPositions(currentMode), loadBestPositions(currentMode)]).then(() => {
        $(this).removeAttr('disabled');
    })
});

$(document).on('click', '.close-position', function(e) {
    $(this).attr('disabled','disabled');
   request('/currency-exchange/positions/'+$(this).attr('data-id')+'/', 'DELETE').then(d => {
       loadMyPositions(currentMode);
       loadBestPositions(currentMode);
       reloadBalance();
   })
       .catch(e => {
           console.error(e);
       });
});

$(document).on('click', '.new-position', function(e) {
    let bd = $('body');
    bd.find(`#open-new-position-modal`).remove();
    bd.append(`<!-- Modal -->
    <div class="modal fade" id="open-new-position-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
                 <div class="modal-content">
                     <div class="modal-header">
                            <h5 class="modal-title">New Position</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                     </div>
                     <div class="modal-body">
                            <div class="row">
                                <div class="col-12">
                                    <p>Sell your ${formatCurrency(currentMode)} for ${formatCurrency(currentMode === 1 ? 2 : 1)}</p>
                                </div>
                                <div class="col-12" style="margin-top:1rem;margin-bottom:1rem;">
                                    <input id="new-position-rate" type="text" class="form-control" placeholder="Rate you want to sell your currency at." style="font-size:0.75rem;">
                                </div>
                                <div class="col-12">
                                    <input id="new-position-amount" type="text" class="form-control" placeholder="Amount of currency you want to sell." style="font-size:0.75rem;">
                                </div>
                            
                            </div>
                     </div>
                      <div class="modal-footer" style="border:none;">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-success create-new-position-submit">Submit</button>
                      </div>
                </div>
          </div>
    </div>
`);

    $('#open-new-position-modal').modal();
});
$(document).on('click', '.create-new-position-submit', function(e) {
    $(this).attr('disabled','disabled');
    let rate = $('#new-position-rate').attr('disabled','disabled');
    let amt = $('#new-position-amount').attr('disabled','disabled');
    // do stuff
    request('/currency-exchange/positions/create', 'POST', {
        balance: parseInt(amt.val(), 10),
        currency: currentMode,
        rate: parseFloat(rate.val()),
    }).then(d => {
        success('Your position has been created.');
        loadMyPositions(currentMode);
        loadBestPositions(currentMode);
        reloadBalance();
    }).catch(e => {
        warning(e.responseJSON.message);
    }).finally(() => {
        $('#open-new-position-modal').modal('toggle');
    })
    // $('#open-new-position-modal').modal('toggle');
})