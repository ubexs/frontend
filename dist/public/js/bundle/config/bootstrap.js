// jquery
const jQueryLib = require('jquery');
window.jQuery = jQueryLib;
window.$ = jQueryLib;
window.jquery = jQueryLib;

// Linkify and linkify jquery
const linkify = require('linkifyjs');
const linkifyJquery = require('linkifyjs/jquery');
linkifyJquery($);
// jquery auto grow
require('jquery.ns-autogrow');

// bootstrap

const Popper = require('popper.js');
window.Popper = Popper;

const bootstrap = require('bootstrap');
window.bootstrap = bootstrap;