"use strict";function _toConsumableArray(a){return _arrayWithoutHoles(a)||_iterableToArray(a)||_unsupportedIterableToArray(a)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(a,b){if(a){if("string"==typeof a)return _arrayLikeToArray(a,b);var c=Object.prototype.toString.call(a).slice(8,-1);return"Object"===c&&a.constructor&&(c=a.constructor.name),"Map"===c||"Set"===c?Array.from(a):"Arguments"===c||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(c)?_arrayLikeToArray(a,b):void 0}}function _iterableToArray(a){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(a))return Array.from(a)}function _arrayWithoutHoles(a){if(Array.isArray(a))return _arrayLikeToArray(a)}function _arrayLikeToArray(a,b){(null==b||b>a.length)&&(b=a.length);for(var c=0,d=Array(b);c<b;c++)d[c]=a[c];return d}window.subsitutionimageurl="https://cdn.blockshub.net/thumbnails/d8f9737603db2d077e9c6f2d5bd3eec1db8ff9fc8ef64784a5e4e6580c4519ba.png";// Get UserData
var userData=$("#userdata"),xss=function(a){return filterXSS(a,{whiteList:{}})};function urlencode(a){return a?(a=a.replace(/\s| /g,"-"),a=a.replace(/[^a-zA-Z\d-]+/g,""),a=a.replace(/--/g,"-"),a?a:"unnamed"):"unnamed"}/*
setInterval(() => {
    $('img').on('error', function(e) {
        let oldSrc = $(this).attr('src');
        $(this).attr('src', window.subsitutionimageurl);
        setTimeout(() => {
            $(this).attr('src', oldSrc);
        }, 250);
    });
}, 100);
*/ /*
var retries = 0;
$.imgReload = function() {
    var loaded = 1;

    $("img").each(function() {
        if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {

            var src = $(this).attr("src");
            var date = new Date();
            $(this).attr("src", src + "?v=" + date.getTime()); //slightly change url to prevent loading from cache
            loaded =0;
        }
    });
}

setInterval(() => {
    $.imgReload();
}, 2500);
*/$(document).on("error","img",function(){console.log("Image load error")}),$("[data-toggle=\"tooltip\"]").tooltip(),$(".formatDate").each(function(){var a=moment($(this).attr("data-date")),b=moment(a).local();$(this).html(b.format("MMMM Do YYYY, h:mm a"))}),$(".formatDateNoTime").each(function(){var a=moment($(this).attr("data-date")),b=moment(a).local();$(this).html(b.format("MMMM Do YYYY"))}),$(".formatDateFromNow").each(function(){var a=moment($(this).attr("data-date")),b=moment(a).local();$(this).html(b.fromNow())});var _userIdsToSet=[];$(".setUserName").each(function(){_userIdsToSet.push($(this).attr("data-userid"))}),setUserNames(_userIdsToSet);function formatDate(a){var b=moment(a),c=moment(b).local();return c.format("MMMM Do YYYY, h:mm a")}// Idea is you pass the value (1 or 2) into this function and get an html span that will represent the currency name & color (since we don't know it yet)
function formatCurrency(a){var b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:"1rem";return 1===a?"<span style=\"color:#28a745;\"><img alt=\"$\" style=\"height: "+b+";\" src=\"https://cdn.blockshub.net/static/money-green-2.svg\"/> </span>":"<span style=\"color:#ffc107;\"><img alt=\"$\" style=\"height: "+b+";\" src=\"https://cdn.blockshub.net/static/coin-stack-yellow.svg\"/> </span>"}function bigNum2Small(a){return isNaN(parseInt(a))?0:1e3>a?a.toString():1e4>a?a.toString().slice(0,-3)+"K+":1e5>a?a.toString().slice(0,-3)+"K+":1e6>a?a.toString().slice(0,-3)+"K+":1e7>a?a.toString().slice(0,-6)+"M+":1e8>a?a.toString().slice(0,-6)+"M+":1e9>a?a.toString().slice(0,-6)+"M+":1e10>a?a.toString().slice(0,-9)+"B+":1e11>a?a.toString().slice(0,-9)+"B+":1e12>a?a.toString().slice(0,-9)+"B+":1e13>a?a.toString().slice(0,-12)+"T+":a.toString().slice(0,-12)+"T+"}// xss() alias w/ default options
// Allows certain text-formatting based tags
String.prototype.escapeAllowFormatting=function(){if(this){var a=filterXSS(this,{whiteList:{h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],// Import from below
p:[],br:[],hr:[],bold:[],strong:[],i:[],em:[],mark:[],small:[],del:[],ins:[],sub:[],sup:[],blockquote:[],ul:[],li:[],ol:[],code:[],pre:[]}});return a}},String.prototype.escapeAllowFormattingBasic=function(){if(this){var a=filterXSS(this,{whiteList:{p:[],br:[],bold:[],strong:[],i:[],em:[],mark:[],small:[],del:[],ins:[],sub:[],sup:[]}});return a}},String.prototype.escape=function(){if(this){var a=filterXSS(this,{whiteList:{}}),b={'"':"&quot;","’":"&rsquo;","‘":"&lsquo;","'":"&#39;"};return a.replace(/[&<>"']/g,function(a){return b[a]||a})}};// Setup Escape Method
/*
String.prototype.escape = function () {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '’': '&rsquo;',
        '‘': '&lsquo;',
        "'": '&#39;',
    };
    return this.replace(/[&<>"']/g, function (tag) {
        return tagsToReplace[tag] || tag;
    });
};
*/function isAuth(){return!("true"!==userData.attr("data-authenticated"))}var auth=!1;if("true"===userData.attr("data-authenticated")){auth=!0;var userId=userData.attr("data-userid"),username=userData.attr("data-username");request("/notifications/count","GET").then(function(a){var b=[];if(100<=a.count?a.count="99+":a=a.unreadMessageCount.toString(),"0"===a);else{$("#notificationCount").html("<span class=\"badge badge-danger\">"+a+"</span>"),$("#notifications-dropdown").empty().append("\n                <div class=\"row\" style=\"padding-left: 0.5rem;padding-right: 0.5rem;\">\n                    <div class=\"col-sm-12\">\n                        <a href=\"#\" id=\"clear-notifications\">\n                            <p style=\"text-align:right;font-size:0.75rem;\">Clear</p>\n                        </a>\n                    </div>\n                    <div class=\"col-sm-12\" id=\"notifications-area\">\n\n                    </div>\n                </div>\n                ");var f=!1;$("#dropdownNotifications").on("click",function(){f||(f=!0,$("#notifications-area").empty().append("<div class=\"spinner-border\" role=\"status\" style=\"margin: 2rem auto 0 auto;display:block;\"></div>"),request("/notifications/messages","GET").then(function(a){$("#notifications-area").empty();var c=[];a.forEach(function(a){0===a.read&&(b.push(a.messageId),$("#notifications-area").append("\n                                    \n                                    <div class=\"row\">\n                                        <div class=\"col-sm-4\">\n                                            <img src=\"".concat(window.subsitutionimageurl,"\" style=\"width:100%;height:100%;\" data-userid=\"").concat(a.userId,"\" />\n                                        </div>\n                                        <div class=\"col-sm-8\">\n                                            <p data-userid=\"").concat(a.userId,"\" style=\"font-weight:600;font-size:0.75rem;\">Loading...</p>\n                                            <a href=\"/notifications\">\n                                                <p style=\"font-size:0.75rem;\" class=\"text-truncate\">").concat(a.subject,"</p>\n                                            </a>\n                                        </div>\n                                    </div>\n                                    \n                                    ")),c.push(a.userId))}),setUserNames(c),setUserThumbs(c)})["catch"](function(a){console.error(a),$("#notifications-area").empty().append("<p style=\"margin-top:3rem;font-size:0.75rem;text-align:center;\">Oops, lets try that again.</p>"),f=!1}))})}$(document).on("click","#notifications-dropdown a",function(a){a.stopPropagation()});var c=!1;$(document).on("click","#clear-notifications",function(a){a.preventDefault(),c||0===b.length||(// do web request
c=!0,$("#notifications-dropdown").children().css("opacity","0.5"),request("/notifications/message/multi-mark-as-read","POST",{ids:b}).then(function(){$("#notifications-dropdown").empty().append("\n                    <div class=\"row\" style=\"padding-left: 0.5rem;padding-right: 0.5rem;\">\n                        <div class=\"col-sm-12\">\n                            <p style=\"padding:0.5rem 1rem;font-size:0.75rem;text-align:center;\">You do not have any notifications.</p>\n                        </div>\n                    </div>"),$("#notificationCount").html("0")})["catch"](function(a){console.error(a)}))})})["catch"](function(){});/*
    var tabId = (new Date).getTime()+Math.random();
    tabId = Math.floor(tabId);
    tabId = tabId.toString();
    var c = localStorage.getItem('crossTabNotifications');
    if (c === false || c === null || c === "" || typeof c === "undefined" || JSON.parse(c)["type"] === 99) {
        localStorage.setItem('crossTabNotifications',tabId);
    }
    // Notification Poll
    window.onbeforeunload = function() {
        if (localStorage.getItem('crossTabNotifications') === tabId) {
            request("/notification/abort?tabId="+tabId, "GET")
                .then((d) => {

                })
                .catch((e) => {

                });
            localStorage.setItem("crossTabNotifications", JSON.stringify({"type":99}));
        }
    }
    function onNotification(d) {
        var types = {
            1: {
                "title":"Friend Request",
                "desc":"has sent you a friend request!",
            },
            2: {
                "title":"Trade Request",
                "desc":"has sent you a trade request!"
            }
        };
        var data = types[d["type"]];
        if (d["type"] === 1) {
            var notifCount = $('#notificationCount').html();
            if (notifCount !== "99+" && !isNaN(notifCount)) {
                notifCount = parseInt(notifCount);
                notifCount += 1;
                if (notifCount >= 100) {
                    notifCount = "99+";
                }
                $('#notificationCount').html(notifCount);
            }
        }
    }
    function pollNotifications() {
        if (localStorage.getItem('crossTabNotifications') === tabId) {
            window.notificationsSetup = true;
            request('/notification/poll?tabId='+tabId, "GET")
                .then((d) => {
                    onNotification(d);
                    message_broadcast(d);
                    pollNotifications();
                })
                .catch((e) => {
                    if (e.status === 409) {
                        pollNotifications();
                    }else{
                        if (e.status !== 503 && e.status !== 502 && e.status !== 500) {
                            message_broadcast({type:99,message:"Notification failed"});
                        }
                    }
                });
        }
    }
    pollNotifications();
    $(window).on('storage', message_receive);

    // use local storage for messaging. Set message in local storage and clear it right away
    // This is a safe way how to communicate with other tabs while not leaving any traces
    //
    function message_broadcast(message)
    {
        localStorage.setItem('message',JSON.stringify(message));
        localStorage.removeItem('message');
    }


    // receive message
    //
    function message_receive(ev)
    {
        if (ev.originalEvent.key!='message') return; // ignore other keys
        var message=JSON.parse(ev.originalEvent.newValue);
        if (!message) return; // ignore empty msg or msg reset

        // here you act on messages.
        // you can send objects like { 'command': 'doit', 'data': 'abcd' }
        if (message.type == 1) {
        }
        if (message.type == 99) {
            localStorage.removeItem("crossTabNotifications");
            localStorage.setItem('crossTabNotifications',tabId);
            pollNotifications();
        }

        // etc.
    }
    */var balOne=$("#currencyBalanceOne").attr("data-amt");balOne=bigNum2Small(parseInt(balOne)),$("#currencyBalanceOne").html(balOne);var balTwo=$("#currencyBalanceTwo").attr("data-amt");/*
        // Load Balance
        request("/balance", "GET")
            .then(function (bals) {
                var balOne = bigNum2Small(bals[1]);
                var balTwo = bigNum2Small(bals[2]);
                $('#currencyBalanceOne').html(balOne);
                $('#currencyBalanceTwo').html(balTwo);
                localStorage.setItem("balOne", bals[1]);
                localStorage.setItem("balTwo", bals[2]);
            })
            .catch(function (e) {
                $('#currencyBalanceOne').html(bigNum2Small(0));
                $('#currencyBalanceTwo').html(bigNum2Small(0));
            });
            */balTwo=bigNum2Small(parseInt(balTwo)),$("#currencyBalanceTwo").html(balTwo),$("[data-toggle=\"currency\"]").tooltip(),$(".displayCurrency").show(),$(document).on("click","#logoutAClick",function(){request("/auth/logout","POST","{}").then(function(){window.location.reload()})["catch"](function(){warning("There was an error logging you out. Please reload the page, and try again.")})})}else;function toast(a,b){a=a?"success":"error";var c=Swal.mixin({toast:!0,position:"top-end",showConfirmButton:!1,timer:3e3});c.fire({type:a,title:b})}function nform(a,b,c,d){return number_format(a,b,c,d)}// @Import: /js/functions/number_format.js
function number_format(a,b,c,d){a=(a+"").replace(/[^0-9+\-Ee.]/g,"");var e=isFinite(+a)?+a:0,f=isFinite(+b)?Math.abs(b):0,g="undefined"==typeof d?",":d,h="undefined"==typeof c?".":c,i="";// Fix for IE parseFloat(0.55).toFixed(0) = 0;
return i=(f?function toFixedFix(a,b){var c=Math.pow(10,b);return""+Math.round(a*c)/c}(e,f):""+Math.round(e)).split("."),3<i[0].length&&(i[0]=i[0].replace(/\B(?=(?:\d{3})+(?!\d))/g,g)),(i[1]||"").length<f&&(i[1]=i[1]||"",i[1]+=Array(f-i[1].length+1).join("0")),i.join(h)}/**
 * Set the names of users or items on a page
 * @param {string} type user | catalog
 * @param {array} idsarray An array of ids
 */function setNames(a,b){// Setup names for divs
function c(b,c){c=xss(c),$("h6[data-"+a+"id='"+b+"']").html(c),$("h5[data-"+a+"id='"+b+"']").html(c),$("h4[data-"+a+"id='"+b+"']").html(c),$("h3[data-"+a+"id='"+b+"']").html(c),$("h2[data-"+a+"id='"+b+"']").html(c),$("h1[data-"+a+"id='"+b+"']").html(c),$("p[data-"+a+"id='"+b+"']").html(c),$("a[data-"+a+"id='"+b+"']").html(c),$("span[data-"+a+"id='"+b+"']").html(c)}// Filter ids
// Only supports catalog and user for now
if("user"!==a&&"catalog"!==a&&"group"!==a)return{success:!1};// Setup Globals
window["nameArray"+a]===void 0&&(window["nameArray"+a]={}),window["pendingNameArray"+a]===void 0&&(window["pendingNameArray"+a]={});// Global to Variable
var d=window["nameArray"+a],e=window["pendingNameArray"+a],f=_toConsumableArray(new Set(b)),g=JSON.parse(JSON.stringify(f));25<g.length&&(setNames(a,g.slice(25)),g=g.slice(0,25)),f.forEach(function(a){"undefined"!=typeof d[a]&&null!==d[a]||e[a]!==void 0?(g.forEach(function(b,c){b===a&&g.splice(c,1)}),c(a,d[a])):e[a]=!0}),0<g.length&&(g=arrayToCsv(g),request("/"+a+"/names?ids="+g,"GET").then(function(a){$.each(a,function(a,b){b.username?(c(b.userId,b.username,{whiteList:{}}),d[b.userId]=b.username):b.catalogName?(c(b.catalogId,b.catalogName),d[b.catalogId]=b.catalogName):b.groupName?(c(b.groupId,b.groupName),d[b.groupId]=b.groupName):c(b.id,"Loading")})})["catch"](function(){// Invalid IDs or possibly pending
}))}function setUserNames(a){setNames("user",a)}function setGroupNames(a){setNames("group",a)}function setCatalogNames(a){setNames("catalog",a)}// Setup names for divs
function setDivsForStaffTag(a,b){b=b.permissionLevel;$("h6[data-stafftype-userid='"+a+"']").html(b),$("h5[data-stafftype-userid='"+a+"']").html(b),$("h4[data-stafftype-userid='"+a+"']").html(b),$("h3[data-stafftype-userid='"+a+"']").html(b),$("h2[data-stafftype-userid='"+a+"']").html(b),$("h1[data-stafftype-userid='"+a+"']").html(b),$("p[data-stafftype-userid='"+a+"']").html(b),$("a[data-stafftype-userid='"+a+"']").html(b),$("span[data-stafftype-userid='"+a+"']").html(b)}// Setup names for divs
function setDivsForCount(a,b){b=b.postCount;$("h6[data-postcount-userid='"+a+"']").html(b),$("h5[data-postcount-userid='"+a+"']").html(b),$("h4[data-postcount-userid='"+a+"']").html(b),$("h3[data-postcount-userid='"+a+"']").html(b),$("h2[data-postcount-userid='"+a+"']").html(b),$("h1[data-postcount-userid='"+a+"']").html(b),$("p[data-postcount-userid='"+a+"']").html(b),$("a[data-postcount-userid='"+a+"']").html(b),$("span[data-postcount-userid='"+a+"']").html(b)}// Setup names for divs
function setDivsForSignature(a,b){b=b.signature,b&&(b=b.escape());$("h6[data-signature-userid='"+a+"']").html(b),$("h5[data-signature-userid='"+a+"']").html(b),$("h4[data-signature-userid='"+a+"']").html(b),$("h3[data-signature-userid='"+a+"']").html(b),$("h2[data-signature-userid='"+a+"']").html(b),$("h1[data-signature-userid='"+a+"']").html(b),$("p[data-signature-userid='"+a+"']").html(b),$("a[data-signature-userid='"+a+"']").html(b),$("span[data-signature-userid='"+a+"']").html(b)}function setForumDivs(a,b){setDivsForCount(a,b),setDivsForStaffTag(a,b),setDivsForSignature(a,b)}/**
 * Set a user's post count for the Forums
 * @param {array<number>} idsUnInt Array of UserIds
 */function setUserPostCount(a){window["postCountArrayforumdata-user"]===void 0&&(window["postCountArrayforumdata-user"]={}),window["pendingPostCountArrayforumdata-user"]===void 0&&(window["pendingPostCountArrayforumdata-user"]={});// Global to Variable
var b=window["postCountArrayforumdata-user"],c=window["pendingPostCountArrayforumdata-user"],d=_toConsumableArray(new Set(a)),e=JSON.parse(JSON.stringify(d));d.forEach(function(a){"undefined"!=typeof b[a]&&null!==b[a]||c[a]!==void 0?(e.forEach(function(b,c){b===a&&e.splice(c,1)}),b[a]&&setForumDivs(a,b[a])):c[a]=!0}),0<e.length&&(e=arrayToCsv(e),request("/user/forum?ids="+e,"GET").then(function(a){$.each(a,function(a,c){c&&(b[c.userId]=c,setForumDivs(c.userId,b[c.userId]))})})["catch"](function(a){console.log(a)}))}/**
 * Set a user's signature for the Forums
 * @param {array<number>} idsUnInt Array of UserIds
 */function setUserSignature(a){window["postCountArrayforumdata-user"]===void 0&&(window["postCountArrayforumdata-user"]={}),window["pendingPostCountArrayforumdata-user"]===void 0&&(window["pendingPostCountArrayforumdata-user"]={});// Global to Variable
var b=window["postCountArrayforumdata-user"],c=window["pendingPostCountArrayforumdata-user"],d=_toConsumableArray(new Set(a)),e=JSON.parse(JSON.stringify(d));d.forEach(function(a){"undefined"!=typeof b[a]&&null!==b[a]||c[a]!==void 0?(e.forEach(function(b,c){b===a&&e.splice(c,1)}),b[a]&&setForumDivs(a,b[a])):c[a]=!0}),0<e.length&&request("/user/forum","POST",JSON.stringify({ids:e})).then(function(a){$.each(a,function(a,c){c&&(b[c.id]=c,setForumDivs(c.id,b[c.id]))})})["catch"](function(a){console.log(a)})}/**
 * Set a user's Permission Type for the forums
 * @param {array<number>} idsUnInt Array of UserIds
 */function setUserPermissionType(a){window["postCountArrayforumdata-user"]===void 0&&(window["postCountArrayforumdata-user"]={}),window["pendingPostCountArrayforumdata-user"]===void 0&&(window["pendingPostCountArrayforumdata-user"]={});// Global to Variable
var b=window["postCountArrayforumdata-user"],c=window["pendingPostCountArrayforumdata-user"],d=_toConsumableArray(new Set(a)),e=JSON.parse(JSON.stringify(d));d.forEach(function(a){"undefined"!=typeof b[a]&&null!==b[a]||c[a]!==void 0?(e.forEach(function(b,c){b===a&&e.splice(c,1)}),b[a]&&setForumDivs(a,b[a])):c[a]=!0}),0<e.length&&request("/user/forum","POST",JSON.stringify({ids:e})).then(function(a){$.each(a,function(a,c){c&&(b[c.id]=c,setForumDivs(c.id,b[c.id]))})})["catch"](function(){// Invalid IDs or possibly pending
})}/**
 * Set the thumbs for images on the page
 * @param {string} type user | catalog
 * @param {array} idsUnInit array of ids
 */function setThumbs(a,b){function c(b,c){// TODO: Remove this and possible return a promise or something to tell the calling function when to show it's parent (or parent's parent, or parent's parent's parent, etc [you can see how this doesn't work well])
$("img[data-"+a+"id='"+b+"']").attr("src",c),$("img[data-"+a+"id='"+b+"']").parent().show()}// Setup Subsitution URL
var d=window.subsitutionimageurl;// Only supports catalog and user for now
if("user"!==a&&"catalog"!==a&&"game"!==a)return console.warn("warning: invalid type passed to setThumbs: "+a),!1;// Setup Globals
window["thumbArray"+a]===void 0&&(window["thumbArray"+a]={}),window["pendingThumbArray"+a]===void 0&&(window["pendingThumbArray"+a]={});// Global to Variable
var e=window["thumbArray"+a],f=window["pendingThumbArray"+a],g=_toConsumableArray(new Set(b)),h=JSON.parse(JSON.stringify(g));25<h.length&&(setThumbs(a,h.slice(25)),h=h.slice(0,25)),g.forEach(function(a){"undefined"!=typeof e[a]&&null!==e[a]||f[a]!==void 0?h.forEach(function(b,c){b===a&&h.splice(c,1)}):f[a]=!0,e[a]===void 0?c(a,window.subsitutionimageurl):c(a,e[a])}),0<h.length&&(h=arrayToCsv(h),request("/"+a+"/thumbnails?ids="+h,"GET").then(function(b){// Repair any broken images
$.each(b,function(b,f){f.userId?(f.url?(e[f.userId]=f.url,c(f.userId,f.url)):c(f.userId,d),$("img[data-"+a+"id='"+f.userId+"']").parent().show()):f.catalogId?(f.url?(e[f.catalogId]=f.url,c(f.catalogId,f.url)):c(f.catalogId,d),$("img[data-"+a+"id='"+f.catalogId+"']").parent().show()):f.gameId&&(f.url?(e[f.gameId]=f.url,c(f.gameId,f.url)):c(f.gameId,d),$("img[data-"+a+"id='"+f.gameId+"']").parent().show())}),$("img[data-"+a+"id]").each(function(){"undefined"==typeof $(this).attr("src")&&($(this).attr("src",d),$(this).parent().show())})})["catch"](function(){// Reset
$("img[data-"+a+"id]").each(function(){"undefined"==typeof $(this).attr("src")&&($(this).attr("src",d),$(this).parent().show())})}))}function arrayToCsv(a){var b="";return a.forEach(function(a){b=b+","+a}),b=b.slice(1,b.length),b}function setUserThumbs(a){setThumbs("user",a)}function setGroupThumbs(a){setThumbs("catalog",a)}function setCatalogThumbs(a){setThumbs("catalog",a)}function setGameThumbs(a){console.log("set game thumbs"),setThumbs("game",a)}function doSwalStuff(a){$(".swal2-popup").fadeOut(100).dequeue(),$(".swal2-container").fadeOut(100).dequeue(),setTimeout(function(){$("body").removeClass("swal2-shown"),$("body").attr("style","")},100),setTimeout(function(){$(".swal2-popup").remove(),$(".swal2-container").remove(),a()},250)}function success(a,b){Swal.fire({type:"success",title:"Success",text:a,heightAuto:!1,animation:!1,customClass:{popup:"animated fadeInUp"}}).then(function(){doSwalStuff(function(){"function"==typeof b&&b()})})}function note(a,b){Swal.fire({title:"Note",text:a,heightAuto:!1,animation:!1,customClass:{popup:"animated fadeInUp"}}).then(function(a){doSwalStuff(function(){a&&a.value&&!0===a.value&&("function"!=typeof b||b())})})}function questionYesNoHtml(a,b){Swal.fire({title:"Are you sure?",html:a,type:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"Yes",heightAuto:!1,animation:!1,customClass:{popup:"animated fadeInUp"}}).then(function(a){doSwalStuff(function(){a.value&&b()})})}function questionYesNo(a,b){Swal.fire({title:"Are you sure?",text:a,type:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"Yes",heightAuto:!1,animation:!1,customClass:{popup:"animated fadeInUp"}}).then(function(a){doSwalStuff(function(){a.value&&b()})})}function question(a,b,c,d){("undefined"==typeof c||null===c)&&(c="text"),("undefined"==typeof d||null===d)&&(d={}),Swal.fire({title:a,input:c,inputPlaceholder:"",inputOptions:d,heightAuto:!1,animation:!1,customClass:{popup:"animated fadeInUp"}}).then(function(a){"select"===c&&(a={},a.value=$(".swal2-select").val(),console.log(a)),doSwalStuff(function(){a.value&&"function"==typeof b&&b(a.value)})})}function warning(a,b){Swal.fire({type:"error",title:"Error",text:a,heightAuto:!1,animation:!1,customClass:{popup:"animated fadeInUp"}}).then(function(){doSwalStuff(function(){"function"==typeof b&&b()})})}function loading(){Swal.fire({title:"Loading...",onBeforeOpen:function onBeforeOpen(){Swal.showLoading()},heightAuto:!1,animation:!1,customClass:{popup:"animated fadeInUp"}})}$(window).on("resize",function(){resizeBottomNav()}),$(document).ready(function(){resizeBottomNav()});function resizeBottomNav(){var a=$(".navbar.navbar-expand-lg.navbar-dark.bg-success.fixed-top").outerHeight();100<a||$(".row.paddingForStickyNav").css("margin-top",a+"px")}try{sessionStorage.setItem("test","test"),sessionStorage.removeItem("test","test")}catch(a){// fallback if incognito or something
var object={};sessionStorage={},sessionStorage.setItem=function(a,b){object[a]=b},sessionStorage.getItem=function(a){return object[a]},sessionStorage.removeItem=function(a){delete object[a]}}/**
 * Why did I re-invent the wheel? I think what you should be asking is why *didn't* i reinvent the wheel
 */ /*
var callingPage = {};
callingPage.calls = [];
callingPage.register = function(callback) {
    console.log("Register");
    callingPage.calls.push(callback);
}
callingPage.callAll = function(page) {
    callingPage.calls.forEach(function(call) {
        call(page);
    })
}
*/ /*
$(document).on('click', 'a', function(e) {
    e.preventDefault();
    var url = $(this).attr('href');
    if (url.slice(0, 1) === '/') {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            window.history.replaceState(null, null, url);
            if (this.readyState == 4) {
                var body = $(this.responseText);
                $('.content').first().html($(body).find('.content').first().html());
                $('title').html($(body).find('title').html());
                callingPage.callAll(url);
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }else{
        window.location.href = url;
    }
});
$(document).ready(function() {
    var path = window.location.pathname;
    callingPage.callAll(path);
});
*/$(document).on("click",".onClickShowTabs",function(a){a.preventDefault();var b=$(this).parent().attr("data-tabs"),c=$(this).attr("id");$("."+b).children().each(function(){$(this).hide(),$(this).attr("data-id")===c&&$(this).show()})});var apiBaseUrl=$("#meta").attr("data-api-base-url");/**
 *  load ads
 */$(".leaderboard-ad").each(function(){var a=this;request("/ad/random/1","GET").then(function(b){$(a).append("\n        <div class=\"col-12\" style=\"margin-top:1rem;\">\n            <div style=\"display:block;margin:0 auto;max-width:728px;\">\n                <a href=\"".concat(apiBaseUrl,"/api/v1/ad/").concat(b.adId,"/click\">\n                    <img style=\"width:100%;\" src=\"").concat(b.imageUrl,"\" title=\"").concat(xss(b.title),"\" />\n                    <p class=\"ad-alert-text\" style=\"color: rgba(33, 37, 41, 0.95);\"><i class=\"fas fa-ad\"></i></p>\n                </a>\n            </div>\n        </div>\n        ")),$(a).find("img").on("load",function(){console.log("ad image loaded"),$(a).find(".whitespace-ad").remove()})})["catch"](function(){// default ad url https://cdn.blockshub.net/thumbnails/684bc763f1459a12ac64c74d5b6154216f2bf26bd1b76cb976449ffad5e163d8.png
$(a).append("\n        <div class=\"col-12\" style=\"margin-top:1rem;\">\n            <div style=\"display:block;margin:0 auto;max-width:728px;\">\n                <a href=\"/ads\">\n                    <img style=\"width:100%;\" src=\"https://cdn.blockshub.net/thumbnails/684bc763f1459a12ac64c74d5b6154216f2bf26bd1b76cb976449ffad5e163d8.png\" />\n                    <p class=\"ad-alert-text\"><i class=\"fas fa-ad\"></i></p>\n                </a>\n            </div>\n        </div>\n        "),$(a).find("img").on("load",function(){console.log("ad image loaded"),$(a).find(".whitespace-ad").remove()})})}),991<window.innerWidth&&$(".skyscraper-ads").each(function(){var a=this;request("/ad/random/2","GET").then(function(b){$(a).append("\n                    <a href=\"".concat(apiBaseUrl,"/api/v1/ad/").concat(b.adId,"/click\">\n                        <img style=\"width:160px;height:600px;\" src=\"").concat(b.imageUrl,"\" title=\"").concat(xss(b.title),"\" />\n                        <p class=\"ad-alert-text\" style=\"color: rgba(33, 37, 41, 0.95);\"><i class=\"fas fa-ad\"></i></p>\n                    </a>\n            "))})["catch"](function(){// default ad url https://cdn.blockshub.net/thumbnails/684bc763f1459a12ac64c74d5b6154216f2bf26bd1b76cb976449ffad5e163d8.png
$(a).append("\n                    <a href=\"/ads\">\n                        <img style=\"width:160px;height:600px;\" src=\"https://cdn.blockshub.net/thumbnails/81082ace029ca2526b6a54e6f2d9914b2397a22c3d4e3260de402f872e093f97.png\" />\n                        <p class=\"ad-alert-text\"><i class=\"fas fa-ad\"></i></p>\n                    </a>\n            "),$(a).find("img").on("load",function(){console.log("ad image loaded"),$(a).find(".whitespace-ad").remove()})})});function getTheme(){if(!auth)return 0;var a=$("#userdata").attr("data-theme");return parseInt(a)}// handler for mobile menu
$(document).on("click","#expand-more-mobile",function(a){a.preventDefault(),$("#more-expanded").fadeToggle({duration:100})});