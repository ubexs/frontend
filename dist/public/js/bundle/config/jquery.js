// Jquery

const jQueryLib = require('jquery');
window.jQuery = jQueryLib;
window.$ = jQueryLib;
window.jquery = jQueryLib;


// Linkify and linkify jquery
const linkify = require('linkifyjs');
const linkifyJquery = require('linkifyjs/jquery');
linkifyJquery(jQueryLib);

require('jquery.ns-autogrow');
