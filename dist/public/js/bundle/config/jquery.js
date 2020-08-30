"use strict";// Jquery
var jQueryLib=require("jquery");window.jQuery=jQueryLib,window.$=jQueryLib,window.jquery=jQueryLib;// Linkify and linkify jquery
var linkify=require("linkifyjs"),linkifyJquery=require("linkifyjs/jquery");linkifyJquery(jQueryLib),require("jquery.ns-autogrow");