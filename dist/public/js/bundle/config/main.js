// CoreJS/Babel Stuff
const coreJs = require('core-js/stable');
const regeneratorRuntime = require('regenerator-runtime');
window.regeneratorRuntime = regeneratorRuntime;

// Sweetalert / swal2
const Swal = require('sweetalert2');
window.Swal = Swal;
window.swal = Swal;
window.swal2 = Swal;
window.Swal2 = Swal;

// Moment
const moment = require('moment');
window.moment = moment;

// xss (xss filter)
const xss = require("xss");
window.xss = xss;