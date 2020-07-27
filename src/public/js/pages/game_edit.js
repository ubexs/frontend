const gdetails = $('#gamedetails');
const gameId = parseInt(gdetails.attr('data-gameid'), 10);

$(document).on('click', '#updateDescAndTitleOnClick', function() {
    if (typeof $('#assetName').val() === "undefined" || $('#assetName').val() === null || $('#assetName').val() === "") {
        warning("Please enter a name, then try again.");
        return;
    }

    request('/game/'+gameId, 'PATCH', JSON.stringify({
        'name': $('#assetName').val(),
        'description': $('#assetDescription').val(),
        'maxPlayers': parseInt($('#assetMaxPlayers').val(), 10),
        'genre': parseInt($('#game-genre-selection').val(), 10),
    })).then((d) => {
        success('This game\'s info has been updated.');
    }).catch((e) => {
        warning(e.responseJSON.message);
    })
});


$(document).on('click', '#updateMapScript', () => {
    const script = $('#mapScriptContent').val();
    request('/game/'+gameId+'/map', 'PATCH', JSON.stringify({
        'script': script,
    })).then((d) => {
        success('This game\'s map script has been updated.');
    }).catch((e) => {
        warning(e.responseJSON.message);
    });
});

$(document).on('click', '#createClientScript', () => {
    request('/game/'+gameId+'/script/client', 'POST', JSON.stringify({
        'script': 'console.log("Hello World!");',
    })).then(() => {
        window.location.reload();
    }).catch((e) => {
        warning(e.responseJSON.message);
    })
});

$(document).on('click', '#createServerScript', () => {
    request('/game/'+gameId+'/script/server', 'POST', JSON.stringify({
        'script': 'console.log("Hello World!");',
    })).then(() => {
        window.location.reload();
    }).catch((e) => {
        warning(e.responseJSON.message);
    })
});

$(document).on('click', '.updateScriptOnCLick', function () {
    const scriptId = $(this).attr('data-scriptid');
    const textbox = $("textarea[data-scriptid='"+scriptId+"']").val();
    request('/game/'+gameId+'/script/'+scriptId, 'PATCH', JSON.stringify({
        'script': textbox,
    })).then(() => {
        success('This script has been updated.');
    }).catch((e) => {
        warning(e.responseJSON.message);
    })
});

$(document).on('click', '.deleteScriptOnClick', function () {
    const scriptId = $(this).attr('data-scriptid');
    request('/game/'+gameId+'/script/'+scriptId, 'DELETE', JSON.stringify({})).then(() => {
        window.location.reload();
    }).catch((e) => {
        warning(e.responseJSON.message);
    })
});