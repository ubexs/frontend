/**
 * Initial Compatibility Check
 */
var pageLoadBegin = Date.now();
var wsSupported = false;
function supportsLocalStorage() {
    try {
        localStorage.setItem('localStorageTestKey', 'localStorageTestValue');
        localStorage.removeItem('localStorageTestKey');
        return true;
    }catch(e) {
        return false;
    }
}

function supportsWebSockets() {
    return 'WebSocket' in window || 'MozWebSocket' in window;
}
wsSupported = supportsWebSockets();
function onInitialScriptLoad() {
    var newdate = Date.now() - pageLoadBegin;
    /*
    request("/metrics/report", "POST", JSON.stringify({
        'metricId': 1,
        'features': {
            'localStorage': supportsLocalStorage(),
            'webSockets': supportsWebSockets(),
        },
        'pageLoadTime': newdate,
    }))
    .then(function(d) {
        
    })
    .catch(function(e) {

    });
    */
}

document.addEventListener("DOMContentLoaded", function(){
});
window.addEventListener("load", function(){
    onInitialScriptLoad();

    if (!wsSupported) {
        console.log('ws not supported');
    }
});