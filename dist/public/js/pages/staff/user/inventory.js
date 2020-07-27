const profile = {
    userId: parseInt($('#profile-info').attr('data-userid'), 10),
}

const takeItemsState = {
    loading: false,
    canLoadMore: true,
    offset: 0,
    limit: 100,
    query: '',
}

let card = $('#main-card');
$(document).on('click', '#take-items', function(e) {
    e.preventDefault();
    card.empty();
    card.append(`<div class="row"><div class="col s6"><h3>Take Items</h3></div><div class="col s6"><p style="text-align: right;" id="submit-take-items-request">Submit</p></div></div></div>`);

    card.append(`<div class="row" id="loading"><div class="col s12">Loading...</div></div>`);

    loadItemsToTake();
});

/**
 * Get selected user inventory ids
 * @returns {number[]}
 */
const getSelectedItems = () => {
    let ids = [];
    $('.remove-item-card').each(function() {
        if ($(this).attr('data-selected') === 'true') {
            ids.push(parseInt($(this).attr('data-user-inventory-id'), 10));
        }
    });
    return ids;
}

$(document).on('click', 'div.row.load-more-items-row', function(e) {
   e.preventDefault();
   loadItemsToTake();
});

$(document).on('click', '#submit-take-items-request', function(e) {
    e.preventDefault();
    let items = getSelectedItems();
    if (items.length === 0) {
        return warning('You must select at least one item.');
    }
    questionYesNoHtml('Please confirm the userInventoryIds are OK:<br>'+items.join('<br>'), () => {
        question('Enter the username of the new owner.', user => {
            loading();
            request('/user/username?username='+user, 'GET').then(userId => {
                let userIdToTransferTo = userId.userId;
                request('/staff/user/inventory/transfer-item', 'PATCH', {
                    userIdTo: userIdToTransferTo,
                    userIdFrom: profile.userId,
                    userInventoryIds: items,
                }).then(done => {
                    success('The items specified were transferred.', () => {
                        window.location.reload();
                    })
                }).catch(err => {
                    if (err.responseJSON && err.responseJSON.message) {
                        return warning(err.responseJSON.message);
                    }
                    return warning('An unknown error has occurred');
                })
            }).catch(err => {
                warning('The username you specified is invalid.');
            })
        })
        $('input.swal2-input').val('BadDecisions');
    });
});

$(document).on('click', '.remove-item-card', function(e) {
    e.preventDefault();
    let isSelected = $(this).attr('data-selected');
    if (isSelected === 'true') {
        // Unselect
        $(this).attr('data-selected','false');
        $(this).css('border','none');
    }else{
        // Select
        $(this).attr('data-selected',true);
        $(this).css('border','4px solid green');
    }
});

const loadItemsToTake = () => {
    let row = card.find('div.row.take-items-row');
    if (!row || !row.length) {
        card.append(`<div class="row take-items-row"></div>`);
        row = card.find('div.row.take-items-row');
    }
    let loadMoreItems = card.find('div.row.load-more-items-row');
    if (!loadMoreItems || !loadMoreItems.length) {
        card.append(`<div class="row load-more-items-row"></div>`);
        loadMoreItems = card.find('div.row.load-more-items-row');
        loadMoreItems.append(`<div class="col-12"><p style="margin-top:2rem;font-weight:700;">Load More</p></div>`);
    }
    if (takeItemsState.loading || !takeItemsState.canLoadMore) {
        return;
    }
    takeItemsState.loading = true;
    loadMoreItems.hide();
    request('/user/'+profile.userId+'/inventory/collectibles?offset='+takeItemsState.offset+'&limit='+takeItemsState.limit+'&query='+takeItemsState.query, 'GET').then(results => {
        console.log(results);
        takeItemsState.offset += 100;
        takeItemsState.canLoadMore = results.areMoreAvailable;
        if (takeItemsState.canLoadMore) {
            loadMoreItems.show();
        }else{
            loadMoreItems.hide()
        }
        card.find('#loading').remove();

        let ids = [];
        for (const entry of results.items) {
            ids.push(entry.catalogId);
            let serialDisplay = '<p style="font-size:0.75rem;">User Inventory ID: '+entry.userInventoryId+'</p>';
            if (entry.serial) {
                serialDisplay = '<p style="font-size:0.75rem;">Serial: #'+entry.serial+' ('+entry.userInventoryId+')</p>';
            }
            row.append(`
            <div class="col-6 col-md-4 col-lg-3 col-xl-2 remove-item-card" data-user-inventory-id="${entry.userInventoryId}">
                <img src="${window.subsitutionimageurl}" style="width: 100%;height:auto;display: block;" data-catalogid="${entry.catalogId}" />
                <p>${xss(entry.catalogName)}</p>
                ${serialDisplay}
            </div>
            
            `);
        }
        setCatalogThumbs(ids);
    }).finally(() => {
        takeItemsState.loading = false;
    })
}