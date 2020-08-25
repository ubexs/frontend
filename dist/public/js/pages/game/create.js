$(document).on('click', '#createGameClick', function() {
    if (typeof $('#assetName').val() === "undefined" || $('#assetName').val() === null || $('#assetName').val() === "") {
        warning("Please enter a name, then try again.");
        return;
    }

    request('/game/create', 'POST', JSON.stringify({
        'name': $('#assetName').val(),
        'description': $('#assetDescription').val(),
    })).then((d) => {
        window.location.href = '/game/'+d.gameId;
    }).catch((e) => {
        warning(e.responseJSON.message);
    })
});
