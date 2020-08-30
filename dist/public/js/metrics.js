"use strict";/**
 * Initial Compatibility Check
 */var pageLoadBegin=Date.now(),wsSupported=!1;function supportsLocalStorage(){try{return localStorage.setItem("localStorageTestKey","localStorageTestValue"),localStorage.removeItem("localStorageTestKey"),!0}catch(a){return!1}}function supportsWebSockets(){return"WebSocket"in window||"MozWebSocket"in window}wsSupported=supportsWebSockets();function onInitialScriptLoad(){Date.now()-pageLoadBegin;/*
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
    */}document.addEventListener("DOMContentLoaded",function(){}),window.addEventListener("load",function(){onInitialScriptLoad(),wsSupported||console.log("ws not supported")});