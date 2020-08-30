"use strict";(function b(c,d,e){function a(h,i){if(!d[h]){if(!c[h]){var j="function"==typeof require&&require;if(!i&&j)return j(h,!0);if(g)return g(h,!0);var k=new Error("Cannot find module '"+h+"'");throw k.code="MODULE_NOT_FOUND",k}var f=d[h]={exports:{}};c[h][0].call(f.exports,function(b){var d=c[h][1][b];return a(d?d:b)},f,f.exports,b,c,d,e)}return d[h].exports}for(var g="function"==typeof require&&require,f=0;f<e.length;f++)a(e[f]);return a})({1:[function(a,b,c){function d(){return{a:["target","href","title"],abbr:["title"],address:[],area:["shape","coords","href","alt"],article:[],aside:[],audio:["autoplay","controls","loop","preload","src"],b:[],bdi:["dir"],bdo:["dir"],big:[],blockquote:["cite"],br:[],caption:[],center:[],cite:[],code:[],col:["align","valign","span","width"],colgroup:["align","valign","span","width"],dd:[],del:["datetime"],details:["open"],div:[],dl:[],dt:[],em:[],font:["color","size","face"],footer:[],h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],header:[],hr:[],i:[],img:["src","alt","title","width","height"],ins:["datetime"],li:[],mark:[],nav:[],ol:[],p:[],pre:[],s:[],section:[],small:[],span:[],sub:[],sup:[],strong:[],table:["width","border","align","valign"],tbody:["align","valign"],td:["width","rowspan","colspan","align","valign"],tfoot:["align","valign"],th:["width","rowspan","colspan","align","valign"],thead:["align","valign"],tr:["rowspan","align","valign"],tt:[],u:[],ul:[],video:["autoplay","controls","loop","preload","src","height","width"]}}/**
     * default escapeHtml function
     *
     * @param {String} html
     */function e(a){return a.replace(q,"&lt;").replace(r,"&gt;")}/**
     * default safeAttrValue function
     *
     * @param {String} tag
     * @param {String} name
     * @param {String} value
     * @param {Object} cssFilter
     * @return {String}
     */ /**
     * escape doube quote
     *
     * @param {String} str
     * @return {String} str
     */function f(a){return a.replace(s,"&quot;")}/**
     * unescape double quote
     *
     * @param {String} str
     * @return {String} str
     */function g(a){return a.replace(t,"\"")}/**
     * escape html entities
     *
     * @param {String} str
     * @return {String}
     */function h(a){return a.replace(u,function(a,b){return"x"===b[0]||"X"===b[0]?String.fromCharCode(parseInt(b.substr(1),16)):String.fromCharCode(parseInt(b,10))})}/**
     * escape html5 new danger entities
     *
     * @param {String} str
     * @return {String}
     */function i(a){return a.replace(v,":").replace(w," ")}/**
     * clear nonprintable characters
     *
     * @param {String} str
     * @return {String}
     */function j(a){for(var b="",c=0,d=a.length;c<d;c++)b+=32>a.charCodeAt(c)?" ":a.charAt(c);return o.trim(b)}/**
     * get friendly attribute value
     *
     * @param {String} str
     * @return {String}
     */function k(a){return a=g(a),a=h(a),a=i(a),a=j(a),a}/**
     * unescape attribute value
     *
     * @param {String} str
     * @return {String}
     */function l(a){return a=f(a),a=e(a),a}/**
     * `onIgnoreTag` function for removing all the tags that are not in whitelist
     */ /**
     * default settings
     *
     * @author Zongmin Lei<leizongmin@gmail.com>
     */var m=a("cssfilter").FilterCSS,n=a("cssfilter").getDefaultWhiteList,o=a("./util"),p=new m,q=/</g,r=/>/g,s=/"/g,t=/&quot;/g,u=/&#([a-zA-Z0-9]*);?/gim,v=/&colon;?/gim,w=/&newline;?/gim,x=/((j\s*a\s*v\s*a|v\s*b|l\s*i\s*v\s*e)\s*s\s*c\s*r\s*i\s*p\s*t\s*|m\s*o\s*c\s*h\s*a)\:/gi,y=/e\s*x\s*p\s*r\s*e\s*s\s*s\s*i\s*o\s*n\s*\(.*/gi,z=/u\s*r\s*l\s*\(.*/gi;c.whiteList=d(),c.getDefaultWhiteList=d,c.onTag=/**
     * default onTag function
     *
     * @param {String} tag
     * @param {String} html
     * @param {Object} options
     * @return {String}
     */function(){// do nothing
}/**
     * default onIgnoreTag function
     *
     * @param {String} tag
     * @param {String} html
     * @param {Object} options
     * @return {String}
     */,c.onIgnoreTag=function(){// do nothing
}/**
     * default onTagAttr function
     *
     * @param {String} tag
     * @param {String} name
     * @param {String} value
     * @return {String}
     */,c.onTagAttr=function(){// do nothing
}/**
     * default onIgnoreTagAttr function
     *
     * @param {String} tag
     * @param {String} name
     * @param {String} value
     * @return {String}
     */,c.onIgnoreTagAttr=function(){// do nothing
},c.safeAttrValue=function(a,b,c,d){if(c=k(c),"href"===b||"src"===b){if(c=o.trim(c),"#"===c)return"#";if("http://"!==c.substr(0,7)&&"https://"!==c.substr(0,8)&&"mailto:"!==c.substr(0,7)&&"tel:"!==c.substr(0,4)&&"#"!==c[0]&&"/"!==c[0])return""}else if("background"===b){if(x.lastIndex=0,x.test(c))return"";}else if("style"===b){if(y.lastIndex=0,y.test(c))return"";// `url()`
if(z.lastIndex=0,z.test(c)&&(x.lastIndex=0,x.test(c)))return"";!1!==d&&(d=d||p,c=d.process(c))}// escape `<>"` before returns
return c=l(c),c}// RegExp list
,c.escapeHtml=e,c.escapeQuote=f,c.unescapeQuote=g,c.escapeHtmlEntities=h,c.escapeDangerHtml5Entities=i,c.clearNonPrintableCharacter=j,c.friendlyAttrValue=k,c.escapeAttrValue=l,c.onIgnoreTagStripAll=function(){return""}/**
     * remove tag body
     * specify a `tags` list, if the tag is not in the `tags` list then process by the specify function (optional)
     *
     * @param {array} tags
     * @param {function} next
     */,c.StripTagBody=function(a,b){function c(b){return!!d||-1!==o.indexOf(a,b)}"function"!=typeof b&&(b=function(){});var d=!Array.isArray(a),e=[],f=!1;return{onIgnoreTag:function onIgnoreTag(a,d,g){if(c(a)){if(g.isClosing){var h=g.position+10;return e.push([!1===f?g.position:f,h]),f=!1,"[/removed]"}return f||(f=g.position),"[removed]"}return b(a,d,g)},remove:function remove(a){var b="",c=0;return o.forEach(e,function(d){b+=a.slice(c,d[0]),c=d[1]}),b+=a.slice(c),b}}}/**
     * remove html comments
     *
     * @param {String} html
     * @return {String}
     */,c.stripCommentTag=function(a){return a.replace(/<!--[\s\S]*?-->/g,"")},c.stripBlankChar=/**
     * remove invisible characters
     *
     * @param {String} html
     * @return {String}
     */function(a){var b=a.split("");return b=b.filter(function(a){var b=a.charCodeAt(0);return 127!==b&&(!(31>=b)||10===b||13===b)}),b.join("")},c.cssFilter=p,c.getDefaultCSSWhiteList=n},{"./util":4,cssfilter:8}],2:[function(a,b,c){/**
     * filter xss function
     *
     * @param {String} html
     * @param {Object} options { whiteList, onTag, onTagAttr, onIgnoreTag, onIgnoreTagAttr, safeAttrValue, escapeHtml }
     * @return {String}
     */function d(a,b){var c=new g(b);return c.process(a)}/**
     * xss
     *
     * @author Zongmin Lei<leizongmin@gmail.com>
     */var e=a("./default"),f=a("./parser"),g=a("./xss");for(var h in c=b.exports=d,c.filterXSS=d,c.FilterXSS=g,e)c[h]=e[h];for(var h in f)c[h]=f[h];// using `xss` on the browser, output `filterXSS` to the globals
"undefined"!=typeof window&&(window.filterXSS=b.exports),// using `xss` on the WebWorker, output `filterXSS` to the globals
function(){return"undefined"!=typeof self&&"undefined"!=typeof DedicatedWorkerGlobalScope&&self instanceof DedicatedWorkerGlobalScope}()&&(self.filterXSS=b.exports)},{"./default":1,"./parser":3,"./xss":5}],3:[function(a,b,c){/**
     * get tag name
     *
     * @param {String} html e.g. '<a hef="#">'
     * @return {String}
     */function d(a){var b=l.spaceIndex(a);if(-1===b)var c=a.slice(1,-1);else var c=a.slice(1,b+1);return c=l.trim(c).toLowerCase(),"/"===c.slice(0,1)&&(c=c.slice(1)),"/"===c.slice(-1)&&(c=c.slice(0,-1)),c}/**
     * is close tag?
     *
     * @param {String} html 如：'<a hef="#">'
     * @return {Boolean}
     */function e(a){return"</"===a.slice(0,2)}/**
     * parse input html and returns processed html
     *
     * @param {String} html
     * @param {Function} onTag e.g. function (sourcePosition, position, tag, html, isClosing)
     * @param {Function} escapeHtml
     * @return {String}
     */function f(a,b){for(;b<a.length;b++){var d=a[b];if(" "!==d)return"="===d?b:-1}}function g(a,b){for(;0<b;b--){var d=a[b];if(" "!==d)return"="===d?b:-1}}function h(a){return!(("\""!==a[0]||"\""!==a[a.length-1])&&("'"!==a[0]||"'"!==a[a.length-1]))}function k(a){return h(a)?a.substr(1,a.length-2):a}/**
     * Simple HTML Parser
     *
     * @author Zongmin Lei<leizongmin@gmail.com>
     */var l=a("./util");c.parseTag=function(a,b,f){"use strict";var g="",h=0,i=!1,j=!1,k=0,l=a.length,m="",n="";for(k=0;k<l;k++){var o=a.charAt(k);if(!1===i){if("<"===o){i=k;continue}}else if(!1===j){if("<"===o){g+=f(a.slice(h,k)),i=k,h=k;continue}if(">"===o){g+=f(a.slice(h,i)),n=a.slice(i,k+1),m=d(n),g+=b(i,g.length,m,n,e(n)),h=k+1,i=!1;continue}if(("\""===o||"'"===o)&&"="===a.charAt(k-1)){j=o;continue}}else if(o===j){j=!1;continue}}return h<a.length&&(g+=f(a.substr(h))),g},c.parseAttr=/**
     * parse input attributes and returns processed attributes
     *
     * @param {String} html e.g. `href="#" target="_blank"`
     * @param {Function} onAttr e.g. `function (name, value)`
     * @return {String}
     */function(a,b){"use strict";function d(a,c){if(a=l.trim(a),a=a.replace(/[^a-zA-Z0-9_:\.\-]/gim,"").toLowerCase(),!(1>a.length)){var d=b(a,c||"");d&&h.push(d)}}// 逐个分析字符
for(var e=0,h=[],m=!1,n=a.length,o=0;o<n;o++){var p,q,r=a.charAt(o);if(!1===m&&"="===r){m=a.slice(e,o),e=o+1;continue}if(!1!==m&&o===e&&("\""===r||"'"===r)&&"="===a.charAt(o-1))if(q=a.indexOf(r,o+1),-1===q)break;else{p=l.trim(a.slice(e+1,q)),d(m,p),m=!1,o=q,e=o+1;continue}if(/\s|\n|\t/.test(r))if(a=a.replace(/\s|\n|\t/g," "),!1===m){if(q=f(a,o),-1===q){p=l.trim(a.slice(e,o)),d(p),m=!1,e=o+1;continue}else{o=q-1;continue}}else if(q=g(a,o-1),-1===q){p=l.trim(a.slice(e,o)),p=k(p),d(m,p),m=!1,e=o+1;continue}else continue}return e<a.length&&(!1===m?d(a.slice(e)):d(m,k(l.trim(a.slice(e))))),l.trim(h.join(" "))}},{"./util":4}],4:[function(a,b){b.exports={indexOf:function indexOf(a,b){var c,d;if(Array.prototype.indexOf)return a.indexOf(b);for(c=0,d=a.length;c<d;c++)if(a[c]===b)return c;return-1},forEach:function forEach(a,b,c){var d,e;if(Array.prototype.forEach)return a.forEach(b,c);for(d=0,e=a.length;d<e;d++)b.call(c,a[d],d,a)},trim:function trim(a){return String.prototype.trim?a.trim():a.replace(/(^\s*)|(\s*$)/g,"")},spaceIndex:function spaceIndex(a){var b=/\s|\n|\t/.exec(a);return b?b.index:-1}}},{}],5:[function(a,b){/**
     * returns `true` if the input value is `undefined` or `null`
     *
     * @param {Object} obj
     * @return {Boolean}
     */function c(a){return a===void 0||null===a}/**
     * get attributes for a tag
     *
     * @param {String} html
     * @return {Object}
     *   - {String} html
     *   - {Boolean} closing
     */function d(a){var b=l.spaceIndex(a);if(-1===b)return{html:"",closing:"/"===a[a.length-2]};a=l.trim(a.slice(b+1,-1));var c="/"===a[a.length-1];return c&&(a=l.trim(a.slice(0,-1))),{html:a,closing:c}}/**
     * shallow copy
     *
     * @param {Object} obj
     * @return {Object}
     */function e(a){var b={};for(var c in a)b[c]=a[c];return b}/**
     * FilterXSS class
     *
     * @param {Object} options
     *        whiteList, onTag, onTagAttr, onIgnoreTag,
     *        onIgnoreTagAttr, safeAttrValue, escapeHtml
     *        stripIgnoreTagBody, allowCommentTag, stripBlankChar
     *        css{whiteList, onAttr, onIgnoreAttr} `css=false` means don't use `cssfilter`
     */function f(a){a=e(a||{}),a.stripIgnoreTag&&(a.onIgnoreTag&&console.error("Notes: cannot use these two options \"stripIgnoreTag\" and \"onIgnoreTag\" at the same time"),a.onIgnoreTag=h.onIgnoreTagStripAll),a.whiteList=a.whiteList||h.whiteList,a.onTag=a.onTag||h.onTag,a.onTagAttr=a.onTagAttr||h.onTagAttr,a.onIgnoreTag=a.onIgnoreTag||h.onIgnoreTag,a.onIgnoreTagAttr=a.onIgnoreTagAttr||h.onIgnoreTagAttr,a.safeAttrValue=a.safeAttrValue||h.safeAttrValue,a.escapeHtml=a.escapeHtml||h.escapeHtml,this.options=a,!1===a.css?this.cssFilter=!1:(a.css=a.css||{},this.cssFilter=new g(a.css))}/**
     * start process and returns result
     *
     * @param {String} html
     * @return {String}
     */ /**
     * filter xss
     *
     * @author Zongmin Lei<leizongmin@gmail.com>
     */var g=a("cssfilter").FilterCSS,h=a("./default"),i=a("./parser"),j=i.parseTag,k=i.parseAttr,l=a("./util");f.prototype.process=function(a){if(a=a||"",a=a.toString(),!a)return"";var b=this,e=b.options,f=e.whiteList,g=e.onTag,i=e.onIgnoreTag,m=e.onTagAttr,n=e.onIgnoreTagAttr,o=e.safeAttrValue,p=e.escapeHtml,q=b.cssFilter;e.stripBlankChar&&(a=h.stripBlankChar(a)),e.allowCommentTag||(a=h.stripCommentTag(a));// if enable stripIgnoreTagBody
var r=!1;if(e.stripIgnoreTagBody){var r=h.StripTagBody(e.stripIgnoreTagBody,i);i=r.onIgnoreTag}var s=j(a,function(a,b,e,h,j){var r={sourcePosition:a,position:b,isClosing:j,isWhite:f.hasOwnProperty(e)},s=g(e,h,r);// call `onTag()`
if(!c(s))return s;if(r.isWhite){if(r.isClosing)return"</"+e+">";var t=d(h),u=f[e],v=k(t.html,function(a,b){// call `onTagAttr()`
var d=-1!==l.indexOf(u,a),f=m(e,a,b,d);if(!c(f))return f;if(d)return b=o(e,a,b,q),b?a+"=\""+b+"\"":a;// call `onIgnoreTagAttr()`
var f=n(e,a,b,d);return c(f)?void 0:f}),h="<"+e;return v&&(h+=" "+v),t.closing&&(h+=" /"),h+=">",h}// call `onIgnoreTag()`
var s=i(e,h,r);return c(s)?p(h):s},p);// if enable stripIgnoreTagBody
return r&&(s=r.remove(s)),s},b.exports=f},{"./default":1,"./parser":3,"./util":4,cssfilter:8}],6:[function(a,b){/**
     * 返回值是否为空
     *
     * @param {Object} obj
     * @return {Boolean}
     */function c(a){return a===void 0||null===a}/**
     * 浅拷贝对象
     *
     * @param {Object} obj
     * @return {Object}
     */function d(a){var b={};for(var c in a)b[c]=a[c];return b}/**
     * 创建CSS过滤器
     *
     * @param {Object} options
     *   - {Object} whiteList
     *   - {Function} onAttr
     *   - {Function} onIgnoreAttr
     *   - {Function} safeAttrValue
     */function e(a){a=d(a||{}),a.whiteList=a.whiteList||f.whiteList,a.onAttr=a.onAttr||f.onAttr,a.onIgnoreAttr=a.onIgnoreAttr||f.onIgnoreAttr,a.safeAttrValue=a.safeAttrValue||f.safeAttrValue,this.options=a}/**
     * cssfilter
     *
     * @author 老雷<leizongmin@gmail.com>
     */var f=a("./default"),g=a("./parser"),h=a("./util");e.prototype.process=function(a){if(a=a||"",a=a.toString(),!a)return"";var b=this,d=b.options,e=d.whiteList,f=d.onAttr,h=d.onIgnoreAttr,i=d.safeAttrValue,j=g(a,function(a,b,d,g,j){var k=e[d],l=!1;if(!0===k?l=k:"function"==typeof k?l=k(g):k instanceof RegExp&&(l=k.test(g)),!0!==l&&(l=!1),g=i(d,g),!!g){var m={position:b,sourcePosition:a,source:j,isWhite:l};if(l){var n=f(d,g,m);return c(n)?d+":"+g:n}var n=h(d,g,m);if(!c(n))return n}});return j},b.exports=e},{"./default":7,"./parser":9,"./util":10}],7:[function(a,b,c){/**
     * cssfilter
     *
     * @author 老雷<leizongmin@gmail.com>
     */function d(){// 白名单值说明：
// true: 允许该属性
// Function: function (val) { } 返回true表示允许该属性，其他值均表示不允许
// RegExp: regexp.test(val) 返回true表示允许该属性，其他值均表示不允许
// 除上面列出的值外均表示不允许
// default: auto
return{"align-content":!1,"align-items":!1,"align-self":!1,"alignment-adjust":!1,"alignment-baseline":!1,all:!1,"anchor-point":!1,animation:!1,"animation-delay":!1,"animation-direction":!1,"animation-duration":!1,"animation-fill-mode":!1,"animation-iteration-count":!1,"animation-name":!1,"animation-play-state":!1,"animation-timing-function":!1,azimuth:!1,"backface-visibility":!1,background:!0,"background-attachment":!0,"background-clip":!0,"background-color":!0,"background-image":!0,"background-origin":!0,"background-position":!0,"background-repeat":!0,"background-size":!0,"baseline-shift":!1,binding:!1,bleed:!1,"bookmark-label":!1,"bookmark-level":!1,"bookmark-state":!1,border:!0,"border-bottom":!0,"border-bottom-color":!0,"border-bottom-left-radius":!0,"border-bottom-right-radius":!0,"border-bottom-style":!0,"border-bottom-width":!0,"border-collapse":!0,"border-color":!0,"border-image":!0,"border-image-outset":!0,"border-image-repeat":!0,"border-image-slice":!0,"border-image-source":!0,"border-image-width":!0,"border-left":!0,"border-left-color":!0,"border-left-style":!0,"border-left-width":!0,"border-radius":!0,"border-right":!0,"border-right-color":!0,"border-right-style":!0,"border-right-width":!0,"border-spacing":!0,"border-style":!0,"border-top":!0,"border-top-color":!0,"border-top-left-radius":!0,"border-top-right-radius":!0,"border-top-style":!0,"border-top-width":!0,"border-width":!0,bottom:!1,"box-decoration-break":!0,"box-shadow":!0,"box-sizing":!0,"box-snap":!0,"box-suppress":!0,"break-after":!0,"break-before":!0,"break-inside":!0,"caption-side":!1,chains:!1,clear:!0,clip:!1,"clip-path":!1,"clip-rule":!1,color:!0,"color-interpolation-filters":!0,"column-count":!1,"column-fill":!1,"column-gap":!1,"column-rule":!1,"column-rule-color":!1,"column-rule-style":!1,"column-rule-width":!1,"column-span":!1,"column-width":!1,columns:!1,contain:!1,content:!1,"counter-increment":!1,"counter-reset":!1,"counter-set":!1,crop:!1,cue:!1,"cue-after":!1,"cue-before":!1,cursor:!1,direction:!1,display:!0,"display-inside":!0,"display-list":!0,"display-outside":!0,"dominant-baseline":!1,elevation:!1,"empty-cells":!1,filter:!1,flex:!1,"flex-basis":!1,"flex-direction":!1,"flex-flow":!1,"flex-grow":!1,"flex-shrink":!1,"flex-wrap":!1,float:!1,"float-offset":!1,"flood-color":!1,"flood-opacity":!1,"flow-from":!1,"flow-into":!1,font:!0,"font-family":!0,"font-feature-settings":!0,"font-kerning":!0,"font-language-override":!0,"font-size":!0,"font-size-adjust":!0,"font-stretch":!0,"font-style":!0,"font-synthesis":!0,"font-variant":!0,"font-variant-alternates":!0,"font-variant-caps":!0,"font-variant-east-asian":!0,"font-variant-ligatures":!0,"font-variant-numeric":!0,"font-variant-position":!0,"font-weight":!0,grid:!1,"grid-area":!1,"grid-auto-columns":!1,"grid-auto-flow":!1,"grid-auto-rows":!1,"grid-column":!1,"grid-column-end":!1,"grid-column-start":!1,"grid-row":!1,"grid-row-end":!1,"grid-row-start":!1,"grid-template":!1,"grid-template-areas":!1,"grid-template-columns":!1,"grid-template-rows":!1,"hanging-punctuation":!1,height:!0,hyphens:!1,icon:!1,"image-orientation":!1,"image-resolution":!1,"ime-mode":!1,"initial-letters":!1,"inline-box-align":!1,"justify-content":!1,"justify-items":!1,"justify-self":!1,left:!1,"letter-spacing":!0,"lighting-color":!0,"line-box-contain":!1,"line-break":!1,"line-grid":!1,"line-height":!1,"line-snap":!1,"line-stacking":!1,"line-stacking-ruby":!1,"line-stacking-shift":!1,"line-stacking-strategy":!1,"list-style":!0,"list-style-image":!0,"list-style-position":!0,"list-style-type":!0,margin:!0,"margin-bottom":!0,"margin-left":!0,"margin-right":!0,"margin-top":!0,"marker-offset":!1,"marker-side":!1,marks:!1,mask:!1,"mask-box":!1,"mask-box-outset":!1,"mask-box-repeat":!1,"mask-box-slice":!1,"mask-box-source":!1,"mask-box-width":!1,"mask-clip":!1,"mask-image":!1,"mask-origin":!1,"mask-position":!1,"mask-repeat":!1,"mask-size":!1,"mask-source-type":!1,"mask-type":!1,"max-height":!0,"max-lines":!1,"max-width":!0,"min-height":!0,"min-width":!0,"move-to":!1,"nav-down":!1,"nav-index":!1,"nav-left":!1,"nav-right":!1,"nav-up":!1,"object-fit":!1,"object-position":!1,opacity:!1,order:!1,orphans:!1,outline:!1,"outline-color":!1,"outline-offset":!1,"outline-style":!1,"outline-width":!1,overflow:!1,"overflow-wrap":!1,"overflow-x":!1,"overflow-y":!1,padding:!0,"padding-bottom":!0,"padding-left":!0,"padding-right":!0,"padding-top":!0,page:!1,"page-break-after":!1,"page-break-before":!1,"page-break-inside":!1,"page-policy":!1,pause:!1,"pause-after":!1,"pause-before":!1,perspective:!1,"perspective-origin":!1,pitch:!1,"pitch-range":!1,"play-during":!1,position:!1,"presentation-level":!1,quotes:!1,"region-fragment":!1,resize:!1,rest:!1,"rest-after":!1,"rest-before":!1,richness:!1,right:!1,rotation:!1,"rotation-point":!1,"ruby-align":!1,"ruby-merge":!1,"ruby-position":!1,"shape-image-threshold":!1,"shape-outside":!1,"shape-margin":!1,size:!1,speak:!1,"speak-as":!1,"speak-header":!1,"speak-numeral":!1,"speak-punctuation":!1,"speech-rate":!1,stress:!1,"string-set":!1,"tab-size":!1,"table-layout":!1,"text-align":!0,"text-align-last":!0,"text-combine-upright":!0,"text-decoration":!0,"text-decoration-color":!0,"text-decoration-line":!0,"text-decoration-skip":!0,"text-decoration-style":!0,"text-emphasis":!0,"text-emphasis-color":!0,"text-emphasis-position":!0,"text-emphasis-style":!0,"text-height":!0,"text-indent":!0,"text-justify":!0,"text-orientation":!0,"text-overflow":!0,"text-shadow":!0,"text-space-collapse":!0,"text-transform":!0,"text-underline-position":!0,"text-wrap":!0,top:!1,transform:!1,"transform-origin":!1,"transform-style":!1,transition:!1,"transition-delay":!1,"transition-duration":!1,"transition-property":!1,"transition-timing-function":!1,"unicode-bidi":!1,"vertical-align":!1,visibility:!1,"voice-balance":!1,"voice-duration":!1,"voice-family":!1,"voice-pitch":!1,"voice-range":!1,"voice-rate":!1,"voice-stress":!1,"voice-volume":!1,volume:!1,"white-space":!1,widows:!1,width:!0,"will-change":!1,"word-break":!0,"word-spacing":!0,"word-wrap":!0,"wrap-flow":!1,"wrap-through":!1,"writing-mode":!1,"z-index":!1}}/**
     * 匹配到白名单上的一个属性时
     *
     * @param {String} name
     * @param {String} value
     * @param {Object} options
     * @return {String}
     */c.whiteList=d(),c.getDefaultWhiteList=d,c.onAttr=function(){// do nothing
}/**
     * 匹配到不在白名单上的一个属性时
     *
     * @param {String} name
     * @param {String} value
     * @param {Object} options
     * @return {String}
     */,c.onIgnoreAttr=function(){// do nothing
},c.safeAttrValue=/**
     * 过滤属性值
     *
     * @param {String} name
     * @param {String} value
     * @return {String}
     */function(a,b){return /javascript\s*\:/img.test(b)?"":b}},{}],8:[function(a,b,c){/**
     * XSS过滤
     *
     * @param {String} css 要过滤的CSS代码
     * @param {Object} options 选项：whiteList, onAttr, onIgnoreAttr
     * @return {String}
     */function d(a,b){var c=new f(b);return c.process(a)}// 输出
/**
     * cssfilter
     *
     * @author 老雷<leizongmin@gmail.com>
     */var e=a("./default"),f=a("./css");for(var g in c=b.exports=d,c.FilterCSS=f,e)c[g]=e[g];// 在浏览器端使用
"undefined"!=typeof window&&(window.filterCSS=b.exports)},{"./css":6,"./default":7}],9:[function(a,b){/**
     * 解析style
     *
     * @param {String} css
     * @param {Function} onAttr 处理属性的函数
     *   参数格式： function (sourcePosition, position, name, value, source)
     * @return {String}
     */ /**
     * cssfilter
     *
     * @author 老雷<leizongmin@gmail.com>
     */var d=a("./util");b.exports=function(a,b){function e(){// 如果没有正常的闭合圆括号，则直接忽略当前属性
if(!g){var c=d.trim(a.slice(h,k)),e=c.indexOf(":");if(-1!==e){var f=d.trim(c.slice(0,e)),i=d.trim(c.slice(e+1));// 必须有属性名称
if(f){var j=b(h,l.length,f,i,c);j&&(l+=j+"; ")}}}h=k+1}a=d.trimRight(a),";"!==a[a.length-1]&&(a+=";");for(var f=a.length,g=!1,h=0,k=0,l="";k<f;k++){var m=a[k];if("/"===m&&"*"===a[k+1]){// 备注开始
var c=a.indexOf("*/",k+2);// 如果没有正常的备注结束，则后面的部分全部跳过
if(-1===c)break;// 直接将当前位置调到备注结尾，并且初始化状态
k=c+1,h=k+1,g=!1}else"("===m?g=!0:")"===m?g=!1:";"===m?g||e():"\n"===m&&e()}return d.trim(l)}},{"./util":10}],10:[function(a,b){b.exports={indexOf:function indexOf(a,b){var c,d;if(Array.prototype.indexOf)return a.indexOf(b);for(c=0,d=a.length;c<d;c++)if(a[c]===b)return c;return-1},forEach:function forEach(a,b,c){var d,e;if(Array.prototype.forEach)return a.forEach(b,c);for(d=0,e=a.length;d<e;d++)b.call(c,a[d],d,a)},trim:function trim(a){return String.prototype.trim?a.trim():a.replace(/(^\s*)|(\s*$)/g,"")},trimRight:function trimRight(a){return String.prototype.trimRight?a.trimRight():a.replace(/(\s*$)/g,"")}}},{}]},{},[2]);