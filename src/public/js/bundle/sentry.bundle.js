(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserBackend = void 0;
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var types_1 = require("@sentry/types");
var utils_1 = require("@sentry/utils");
var eventbuilder_1 = require("./eventbuilder");
var transports_1 = require("./transports");
/**
 * The Sentry Browser SDK Backend.
 * @hidden
 */
var BrowserBackend = /** @class */ (function (_super) {
    tslib_1.__extends(BrowserBackend, _super);
    function BrowserBackend() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @inheritDoc
     */
    BrowserBackend.prototype.eventFromException = function (exception, hint) {
        return eventbuilder_1.eventFromException(this._options, exception, hint);
    };
    /**
     * @inheritDoc
     */
    BrowserBackend.prototype.eventFromMessage = function (message, level, hint) {
        if (level === void 0) { level = types_1.Severity.Info; }
        return eventbuilder_1.eventFromMessage(this._options, message, level, hint);
    };
    /**
     * @inheritDoc
     */
    BrowserBackend.prototype._setupTransport = function () {
        if (!this._options.dsn) {
            // We return the noop transport here in case there is no Dsn.
            return _super.prototype._setupTransport.call(this);
        }
        var transportOptions = tslib_1.__assign(tslib_1.__assign({}, this._options.transportOptions), { dsn: this._options.dsn });
        if (this._options.transport) {
            return new this._options.transport(transportOptions);
        }
        if (utils_1.supportsFetch()) {
            return new transports_1.FetchTransport(transportOptions);
        }
        return new transports_1.XHRTransport(transportOptions);
    };
    return BrowserBackend;
}(core_1.BaseBackend));
exports.BrowserBackend = BrowserBackend;

},{"./eventbuilder":3,"./transports":18,"@sentry/core":24,"@sentry/types":36,"@sentry/utils":43,"tslib":57}],2:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserClient = void 0;
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
var backend_1 = require("./backend");
var helpers_1 = require("./helpers");
var integrations_1 = require("./integrations");
var version_1 = require("./version");
/**
 * The Sentry Browser SDK Client.
 *
 * @see BrowserOptions for documentation on configuration options.
 * @see SentryClient for usage documentation.
 */
var BrowserClient = /** @class */ (function (_super) {
    tslib_1.__extends(BrowserClient, _super);
    /**
     * Creates a new Browser SDK instance.
     *
     * @param options Configuration options for this SDK.
     */
    function BrowserClient(options) {
        if (options === void 0) { options = {}; }
        return _super.call(this, backend_1.BrowserBackend, options) || this;
    }
    /**
     * Show a report dialog to the user to send feedback to a specific event.
     *
     * @param options Set individual options for the dialog
     */
    BrowserClient.prototype.showReportDialog = function (options) {
        if (options === void 0) { options = {}; }
        // doesn't work without a document (React Native)
        var document = utils_1.getGlobalObject().document;
        if (!document) {
            return;
        }
        if (!this._isEnabled()) {
            utils_1.logger.error('Trying to call showReportDialog with Sentry Client disabled');
            return;
        }
        helpers_1.injectReportDialog(tslib_1.__assign(tslib_1.__assign({}, options), { dsn: options.dsn || this.getDsn() }));
    };
    /**
     * @inheritDoc
     */
    BrowserClient.prototype._prepareEvent = function (event, scope, hint) {
        event.platform = event.platform || 'javascript';
        event.sdk = tslib_1.__assign(tslib_1.__assign({}, event.sdk), { name: version_1.SDK_NAME, packages: tslib_1.__spread(((event.sdk && event.sdk.packages) || []), [
                {
                    name: 'npm:@sentry/browser',
                    version: version_1.SDK_VERSION,
                },
            ]), version: version_1.SDK_VERSION });
        return _super.prototype._prepareEvent.call(this, event, scope, hint);
    };
    /**
     * @inheritDoc
     */
    BrowserClient.prototype._sendEvent = function (event) {
        var integration = this.getIntegration(integrations_1.Breadcrumbs);
        if (integration) {
            integration.addSentryBreadcrumb(event);
        }
        _super.prototype._sendEvent.call(this, event);
    };
    return BrowserClient;
}(core_1.BaseClient));
exports.BrowserClient = BrowserClient;

},{"./backend":1,"./helpers":5,"./integrations":9,"./version":20,"@sentry/core":24,"@sentry/utils":43,"tslib":57}],3:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventFromString = exports.eventFromUnknownInput = exports.eventFromMessage = exports.eventFromException = void 0;
var types_1 = require("@sentry/types");
var utils_1 = require("@sentry/utils");
var parsers_1 = require("./parsers");
var tracekit_1 = require("./tracekit");
/**
 * Builds and Event from a Exception
 * @hidden
 */
function eventFromException(options, exception, hint) {
    var syntheticException = (hint && hint.syntheticException) || undefined;
    var event = eventFromUnknownInput(exception, syntheticException, {
        attachStacktrace: options.attachStacktrace,
    });
    utils_1.addExceptionMechanism(event, {
        handled: true,
        type: 'generic',
    });
    event.level = types_1.Severity.Error;
    if (hint && hint.event_id) {
        event.event_id = hint.event_id;
    }
    return utils_1.SyncPromise.resolve(event);
}
exports.eventFromException = eventFromException;
/**
 * Builds and Event from a Message
 * @hidden
 */
function eventFromMessage(options, message, level, hint) {
    if (level === void 0) { level = types_1.Severity.Info; }
    var syntheticException = (hint && hint.syntheticException) || undefined;
    var event = eventFromString(message, syntheticException, {
        attachStacktrace: options.attachStacktrace,
    });
    event.level = level;
    if (hint && hint.event_id) {
        event.event_id = hint.event_id;
    }
    return utils_1.SyncPromise.resolve(event);
}
exports.eventFromMessage = eventFromMessage;
/**
 * @hidden
 */
function eventFromUnknownInput(exception, syntheticException, options) {
    if (options === void 0) { options = {}; }
    var event;
    if (utils_1.isErrorEvent(exception) && exception.error) {
        // If it is an ErrorEvent with `error` property, extract it to get actual Error
        var errorEvent = exception;
        // eslint-disable-next-line no-param-reassign
        exception = errorEvent.error;
        event = parsers_1.eventFromStacktrace(tracekit_1.computeStackTrace(exception));
        return event;
    }
    if (utils_1.isDOMError(exception) || utils_1.isDOMException(exception)) {
        // If it is a DOMError or DOMException (which are legacy APIs, but still supported in some browsers)
        // then we just extract the name and message, as they don't provide anything else
        // https://developer.mozilla.org/en-US/docs/Web/API/DOMError
        // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
        var domException = exception;
        var name_1 = domException.name || (utils_1.isDOMError(domException) ? 'DOMError' : 'DOMException');
        var message = domException.message ? name_1 + ": " + domException.message : name_1;
        event = eventFromString(message, syntheticException, options);
        utils_1.addExceptionTypeValue(event, message);
        return event;
    }
    if (utils_1.isError(exception)) {
        // we have a real Error object, do nothing
        event = parsers_1.eventFromStacktrace(tracekit_1.computeStackTrace(exception));
        return event;
    }
    if (utils_1.isPlainObject(exception) || utils_1.isEvent(exception)) {
        // If it is plain Object or Event, serialize it manually and extract options
        // This will allow us to group events based on top-level keys
        // which is much better than creating new group when any key/value change
        var objectException = exception;
        event = parsers_1.eventFromPlainObject(objectException, syntheticException, options.rejection);
        utils_1.addExceptionMechanism(event, {
            synthetic: true,
        });
        return event;
    }
    // If none of previous checks were valid, then it means that it's not:
    // - an instance of DOMError
    // - an instance of DOMException
    // - an instance of Event
    // - an instance of Error
    // - a valid ErrorEvent (one with an error property)
    // - a plain Object
    //
    // So bail out and capture it as a simple message:
    event = eventFromString(exception, syntheticException, options);
    utils_1.addExceptionTypeValue(event, "" + exception, undefined);
    utils_1.addExceptionMechanism(event, {
        synthetic: true,
    });
    return event;
}
exports.eventFromUnknownInput = eventFromUnknownInput;
/**
 * @hidden
 */
function eventFromString(input, syntheticException, options) {
    if (options === void 0) { options = {}; }
    var event = {
        message: input,
    };
    if (options.attachStacktrace && syntheticException) {
        var stacktrace = tracekit_1.computeStackTrace(syntheticException);
        var frames_1 = parsers_1.prepareFramesForEvent(stacktrace.stack);
        event.stacktrace = {
            frames: frames_1,
        };
    }
    return event;
}
exports.eventFromString = eventFromString;

},{"./parsers":13,"./tracekit":15,"@sentry/types":36,"@sentry/utils":43}],4:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("@sentry/types");
Object.defineProperty(exports, "Severity", { enumerable: true, get: function () { return types_1.Severity; } });
Object.defineProperty(exports, "Status", { enumerable: true, get: function () { return types_1.Status; } });
var core_1 = require("@sentry/core");
Object.defineProperty(exports, "addGlobalEventProcessor", { enumerable: true, get: function () { return core_1.addGlobalEventProcessor; } });
Object.defineProperty(exports, "addBreadcrumb", { enumerable: true, get: function () { return core_1.addBreadcrumb; } });
Object.defineProperty(exports, "captureException", { enumerable: true, get: function () { return core_1.captureException; } });
Object.defineProperty(exports, "captureEvent", { enumerable: true, get: function () { return core_1.captureEvent; } });
Object.defineProperty(exports, "captureMessage", { enumerable: true, get: function () { return core_1.captureMessage; } });
Object.defineProperty(exports, "configureScope", { enumerable: true, get: function () { return core_1.configureScope; } });
Object.defineProperty(exports, "getHubFromCarrier", { enumerable: true, get: function () { return core_1.getHubFromCarrier; } });
Object.defineProperty(exports, "getCurrentHub", { enumerable: true, get: function () { return core_1.getCurrentHub; } });
Object.defineProperty(exports, "Hub", { enumerable: true, get: function () { return core_1.Hub; } });
Object.defineProperty(exports, "makeMain", { enumerable: true, get: function () { return core_1.makeMain; } });
Object.defineProperty(exports, "Scope", { enumerable: true, get: function () { return core_1.Scope; } });
Object.defineProperty(exports, "startTransaction", { enumerable: true, get: function () { return core_1.startTransaction; } });
Object.defineProperty(exports, "setContext", { enumerable: true, get: function () { return core_1.setContext; } });
Object.defineProperty(exports, "setExtra", { enumerable: true, get: function () { return core_1.setExtra; } });
Object.defineProperty(exports, "setExtras", { enumerable: true, get: function () { return core_1.setExtras; } });
Object.defineProperty(exports, "setTag", { enumerable: true, get: function () { return core_1.setTag; } });
Object.defineProperty(exports, "setTags", { enumerable: true, get: function () { return core_1.setTags; } });
Object.defineProperty(exports, "setUser", { enumerable: true, get: function () { return core_1.setUser; } });
Object.defineProperty(exports, "withScope", { enumerable: true, get: function () { return core_1.withScope; } });
var client_1 = require("./client");
Object.defineProperty(exports, "BrowserClient", { enumerable: true, get: function () { return client_1.BrowserClient; } });
var helpers_1 = require("./helpers");
Object.defineProperty(exports, "injectReportDialog", { enumerable: true, get: function () { return helpers_1.injectReportDialog; } });
var eventbuilder_1 = require("./eventbuilder");
Object.defineProperty(exports, "eventFromException", { enumerable: true, get: function () { return eventbuilder_1.eventFromException; } });
Object.defineProperty(exports, "eventFromMessage", { enumerable: true, get: function () { return eventbuilder_1.eventFromMessage; } });
var sdk_1 = require("./sdk");
Object.defineProperty(exports, "defaultIntegrations", { enumerable: true, get: function () { return sdk_1.defaultIntegrations; } });
Object.defineProperty(exports, "forceLoad", { enumerable: true, get: function () { return sdk_1.forceLoad; } });
Object.defineProperty(exports, "init", { enumerable: true, get: function () { return sdk_1.init; } });
Object.defineProperty(exports, "lastEventId", { enumerable: true, get: function () { return sdk_1.lastEventId; } });
Object.defineProperty(exports, "onLoad", { enumerable: true, get: function () { return sdk_1.onLoad; } });
Object.defineProperty(exports, "showReportDialog", { enumerable: true, get: function () { return sdk_1.showReportDialog; } });
Object.defineProperty(exports, "flush", { enumerable: true, get: function () { return sdk_1.flush; } });
Object.defineProperty(exports, "close", { enumerable: true, get: function () { return sdk_1.close; } });
Object.defineProperty(exports, "wrap", { enumerable: true, get: function () { return sdk_1.wrap; } });
var version_1 = require("./version");
Object.defineProperty(exports, "SDK_NAME", { enumerable: true, get: function () { return version_1.SDK_NAME; } });
Object.defineProperty(exports, "SDK_VERSION", { enumerable: true, get: function () { return version_1.SDK_VERSION; } });

},{"./client":2,"./eventbuilder":3,"./helpers":5,"./sdk":14,"./version":20,"@sentry/core":24,"@sentry/types":36}],5:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectReportDialog = exports.wrap = exports.ignoreNextOnError = exports.shouldIgnoreOnError = void 0;
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
var ignoreOnError = 0;
/**
 * @hidden
 */
function shouldIgnoreOnError() {
    return ignoreOnError > 0;
}
exports.shouldIgnoreOnError = shouldIgnoreOnError;
/**
 * @hidden
 */
function ignoreNextOnError() {
    // onerror should trigger before setTimeout
    ignoreOnError += 1;
    setTimeout(function () {
        ignoreOnError -= 1;
    });
}
exports.ignoreNextOnError = ignoreNextOnError;
/**
 * Instruments the given function and sends an event to Sentry every time the
 * function throws an exception.
 *
 * @param fn A function to wrap.
 * @returns The wrapped function.
 * @hidden
 */
function wrap(fn, options, before) {
    if (options === void 0) { options = {}; }
    if (typeof fn !== 'function') {
        return fn;
    }
    try {
        // We don't wanna wrap it twice
        if (fn.__sentry__) {
            return fn;
        }
        // If this has already been wrapped in the past, return that wrapped function
        if (fn.__sentry_wrapped__) {
            return fn.__sentry_wrapped__;
        }
    }
    catch (e) {
        // Just accessing custom props in some Selenium environments
        // can cause a "Permission denied" exception (see raven-js#495).
        // Bail on wrapping and return the function as-is (defers to window.onerror).
        return fn;
    }
    /* eslint-disable prefer-rest-params */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var sentryWrapped = function () {
        var args = Array.prototype.slice.call(arguments);
        try {
            if (before && typeof before === 'function') {
                before.apply(this, arguments);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            var wrappedArguments = args.map(function (arg) { return wrap(arg, options); });
            if (fn.handleEvent) {
                // Attempt to invoke user-land function
                // NOTE: If you are a Sentry user, and you are seeing this stack frame, it
                //       means the sentry.javascript SDK caught an error invoking your application code. This
                //       is expected behavior and NOT indicative of a bug with sentry.javascript.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                return fn.handleEvent.apply(this, wrappedArguments);
            }
            // Attempt to invoke user-land function
            // NOTE: If you are a Sentry user, and you are seeing this stack frame, it
            //       means the sentry.javascript SDK caught an error invoking your application code. This
            //       is expected behavior and NOT indicative of a bug with sentry.javascript.
            return fn.apply(this, wrappedArguments);
        }
        catch (ex) {
            ignoreNextOnError();
            core_1.withScope(function (scope) {
                scope.addEventProcessor(function (event) {
                    var processedEvent = tslib_1.__assign({}, event);
                    if (options.mechanism) {
                        utils_1.addExceptionTypeValue(processedEvent, undefined, undefined);
                        utils_1.addExceptionMechanism(processedEvent, options.mechanism);
                    }
                    processedEvent.extra = tslib_1.__assign(tslib_1.__assign({}, processedEvent.extra), { arguments: args });
                    return processedEvent;
                });
                core_1.captureException(ex);
            });
            throw ex;
        }
    };
    /* eslint-enable prefer-rest-params */
    // Accessing some objects may throw
    // ref: https://github.com/getsentry/sentry-javascript/issues/1168
    try {
        for (var property in fn) {
            if (Object.prototype.hasOwnProperty.call(fn, property)) {
                sentryWrapped[property] = fn[property];
            }
        }
    }
    catch (_oO) { } // eslint-disable-line no-empty
    fn.prototype = fn.prototype || {};
    sentryWrapped.prototype = fn.prototype;
    Object.defineProperty(fn, '__sentry_wrapped__', {
        enumerable: false,
        value: sentryWrapped,
    });
    // Signal that this function has been wrapped/filled already
    // for both debugging and to prevent it to being wrapped/filled twice
    Object.defineProperties(sentryWrapped, {
        __sentry__: {
            enumerable: false,
            value: true,
        },
        __sentry_original__: {
            enumerable: false,
            value: fn,
        },
    });
    // Restore original function name (not all browsers allow that)
    try {
        var descriptor = Object.getOwnPropertyDescriptor(sentryWrapped, 'name');
        if (descriptor.configurable) {
            Object.defineProperty(sentryWrapped, 'name', {
                get: function () {
                    return fn.name;
                },
            });
        }
        // eslint-disable-next-line no-empty
    }
    catch (_oO) { }
    return sentryWrapped;
}
exports.wrap = wrap;
/**
 * Injects the Report Dialog script
 * @hidden
 */
function injectReportDialog(options) {
    if (options === void 0) { options = {}; }
    if (!options.eventId) {
        utils_1.logger.error("Missing eventId option in showReportDialog call");
        return;
    }
    if (!options.dsn) {
        utils_1.logger.error("Missing dsn option in showReportDialog call");
        return;
    }
    var script = document.createElement('script');
    script.async = true;
    script.src = new core_1.API(options.dsn).getReportDialogEndpoint(options);
    if (options.onLoad) {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        script.onload = options.onLoad;
    }
    (document.head || document.body).appendChild(script);
}
exports.injectReportDialog = injectReportDialog;

},{"@sentry/core":24,"@sentry/utils":43,"tslib":57}],6:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transports = exports.Integrations = void 0;
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./exports"), exports);
var core_1 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
var BrowserIntegrations = require("./integrations");
var Transports = require("./transports");
exports.Transports = Transports;
var windowIntegrations = {};
// This block is needed to add compatibility with the integrations packages when used with a CDN
var _window = utils_1.getGlobalObject();
if (_window.Sentry && _window.Sentry.Integrations) {
    windowIntegrations = _window.Sentry.Integrations;
}
var INTEGRATIONS = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, windowIntegrations), core_1.Integrations), BrowserIntegrations);
exports.Integrations = INTEGRATIONS;

},{"./exports":4,"./integrations":9,"./transports":18,"@sentry/core":24,"@sentry/utils":43,"tslib":57}],7:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.Breadcrumbs = void 0;
var tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable max-lines */
var core_1 = require("@sentry/core");
var types_1 = require("@sentry/types");
var utils_1 = require("@sentry/utils");
/**
 * Default Breadcrumbs instrumentations
 * TODO: Deprecated - with v6, this will be renamed to `Instrument`
 */
var Breadcrumbs = /** @class */ (function () {
    /**
     * @inheritDoc
     */
    function Breadcrumbs(options) {
        /**
         * @inheritDoc
         */
        this.name = Breadcrumbs.id;
        this._options = tslib_1.__assign({ console: true, dom: true, fetch: true, history: true, sentry: true, xhr: true }, options);
    }
    /**
     * Create a breadcrumb of `sentry` from the events themselves
     */
    Breadcrumbs.prototype.addSentryBreadcrumb = function (event) {
        if (!this._options.sentry) {
            return;
        }
        core_1.getCurrentHub().addBreadcrumb({
            category: "sentry." + (event.type === 'transaction' ? 'transaction' : 'event'),
            event_id: event.event_id,
            level: event.level,
            message: utils_1.getEventDescription(event),
        }, {
            event: event,
        });
    };
    /**
     * Instrument browser built-ins w/ breadcrumb capturing
     *  - Console API
     *  - DOM API (click/typing)
     *  - XMLHttpRequest API
     *  - Fetch API
     *  - History API
     */
    Breadcrumbs.prototype.setupOnce = function () {
        var _this = this;
        if (this._options.console) {
            utils_1.addInstrumentationHandler({
                callback: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this._consoleBreadcrumb.apply(_this, tslib_1.__spread(args));
                },
                type: 'console',
            });
        }
        if (this._options.dom) {
            utils_1.addInstrumentationHandler({
                callback: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this._domBreadcrumb.apply(_this, tslib_1.__spread(args));
                },
                type: 'dom',
            });
        }
        if (this._options.xhr) {
            utils_1.addInstrumentationHandler({
                callback: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this._xhrBreadcrumb.apply(_this, tslib_1.__spread(args));
                },
                type: 'xhr',
            });
        }
        if (this._options.fetch) {
            utils_1.addInstrumentationHandler({
                callback: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this._fetchBreadcrumb.apply(_this, tslib_1.__spread(args));
                },
                type: 'fetch',
            });
        }
        if (this._options.history) {
            utils_1.addInstrumentationHandler({
                callback: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this._historyBreadcrumb.apply(_this, tslib_1.__spread(args));
                },
                type: 'history',
            });
        }
    };
    /**
     * Creates breadcrumbs from console API calls
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Breadcrumbs.prototype._consoleBreadcrumb = function (handlerData) {
        var breadcrumb = {
            category: 'console',
            data: {
                arguments: handlerData.args,
                logger: 'console',
            },
            level: types_1.Severity.fromString(handlerData.level),
            message: utils_1.safeJoin(handlerData.args, ' '),
        };
        if (handlerData.level === 'assert') {
            if (handlerData.args[0] === false) {
                breadcrumb.message = "Assertion failed: " + (utils_1.safeJoin(handlerData.args.slice(1), ' ') || 'console.assert');
                breadcrumb.data.arguments = handlerData.args.slice(1);
            }
            else {
                // Don't capture a breadcrumb for passed assertions
                return;
            }
        }
        core_1.getCurrentHub().addBreadcrumb(breadcrumb, {
            input: handlerData.args,
            level: handlerData.level,
        });
    };
    /**
     * Creates breadcrumbs from DOM API calls
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Breadcrumbs.prototype._domBreadcrumb = function (handlerData) {
        var target;
        // Accessing event.target can throw (see getsentry/raven-js#838, #768)
        try {
            target = handlerData.event.target
                ? utils_1.htmlTreeAsString(handlerData.event.target)
                : utils_1.htmlTreeAsString(handlerData.event);
        }
        catch (e) {
            target = '<unknown>';
        }
        if (target.length === 0) {
            return;
        }
        core_1.getCurrentHub().addBreadcrumb({
            category: "ui." + handlerData.name,
            message: target,
        }, {
            event: handlerData.event,
            name: handlerData.name,
        });
    };
    /**
     * Creates breadcrumbs from XHR API calls
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Breadcrumbs.prototype._xhrBreadcrumb = function (handlerData) {
        if (handlerData.endTimestamp) {
            // We only capture complete, non-sentry requests
            if (handlerData.xhr.__sentry_own_request__) {
                return;
            }
            core_1.getCurrentHub().addBreadcrumb({
                category: 'xhr',
                data: handlerData.xhr.__sentry_xhr__,
                type: 'http',
            }, {
                xhr: handlerData.xhr,
            });
            return;
        }
    };
    /**
     * Creates breadcrumbs from fetch API calls
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Breadcrumbs.prototype._fetchBreadcrumb = function (handlerData) {
        // We only capture complete fetch requests
        if (!handlerData.endTimestamp) {
            return;
        }
        if (handlerData.fetchData.url.match(/sentry_key/) && handlerData.fetchData.method === 'POST') {
            // We will not create breadcrumbs for fetch requests that contain `sentry_key` (internal sentry requests)
            return;
        }
        if (handlerData.error) {
            core_1.getCurrentHub().addBreadcrumb({
                category: 'fetch',
                data: handlerData.fetchData,
                level: types_1.Severity.Error,
                type: 'http',
            }, {
                data: handlerData.error,
                input: handlerData.args,
            });
        }
        else {
            core_1.getCurrentHub().addBreadcrumb({
                category: 'fetch',
                data: tslib_1.__assign(tslib_1.__assign({}, handlerData.fetchData), { status_code: handlerData.response.status }),
                type: 'http',
            }, {
                input: handlerData.args,
                response: handlerData.response,
            });
        }
    };
    /**
     * Creates breadcrumbs from history API calls
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Breadcrumbs.prototype._historyBreadcrumb = function (handlerData) {
        var global = utils_1.getGlobalObject();
        var from = handlerData.from;
        var to = handlerData.to;
        var parsedLoc = utils_1.parseUrl(global.location.href);
        var parsedFrom = utils_1.parseUrl(from);
        var parsedTo = utils_1.parseUrl(to);
        // Initial pushState doesn't provide `from` information
        if (!parsedFrom.path) {
            parsedFrom = parsedLoc;
        }
        // Use only the path component of the URL if the URL matches the current
        // document (almost all the time when using pushState)
        if (parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host) {
            to = parsedTo.relative;
        }
        if (parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host) {
            from = parsedFrom.relative;
        }
        core_1.getCurrentHub().addBreadcrumb({
            category: 'navigation',
            data: {
                from: from,
                to: to,
            },
        });
    };
    /**
     * @inheritDoc
     */
    Breadcrumbs.id = 'Breadcrumbs';
    return Breadcrumbs;
}());
exports.Breadcrumbs = Breadcrumbs;

},{"@sentry/core":24,"@sentry/types":36,"@sentry/utils":43,"tslib":57}],8:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalHandlers = void 0;
var tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
var core_1 = require("@sentry/core");
var types_1 = require("@sentry/types");
var utils_1 = require("@sentry/utils");
var eventbuilder_1 = require("../eventbuilder");
var helpers_1 = require("../helpers");
/** Global handlers */
var GlobalHandlers = /** @class */ (function () {
    /** JSDoc */
    function GlobalHandlers(options) {
        /**
         * @inheritDoc
         */
        this.name = GlobalHandlers.id;
        /** JSDoc */
        this._onErrorHandlerInstalled = false;
        /** JSDoc */
        this._onUnhandledRejectionHandlerInstalled = false;
        this._options = tslib_1.__assign({ onerror: true, onunhandledrejection: true }, options);
    }
    /**
     * @inheritDoc
     */
    GlobalHandlers.prototype.setupOnce = function () {
        Error.stackTraceLimit = 50;
        if (this._options.onerror) {
            utils_1.logger.log('Global Handler attached: onerror');
            this._installGlobalOnErrorHandler();
        }
        if (this._options.onunhandledrejection) {
            utils_1.logger.log('Global Handler attached: onunhandledrejection');
            this._installGlobalOnUnhandledRejectionHandler();
        }
    };
    /** JSDoc */
    GlobalHandlers.prototype._installGlobalOnErrorHandler = function () {
        var _this = this;
        if (this._onErrorHandlerInstalled) {
            return;
        }
        utils_1.addInstrumentationHandler({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callback: function (data) {
                var error = data.error;
                var currentHub = core_1.getCurrentHub();
                var hasIntegration = currentHub.getIntegration(GlobalHandlers);
                var isFailedOwnDelivery = error && error.__sentry_own_request__ === true;
                if (!hasIntegration || helpers_1.shouldIgnoreOnError() || isFailedOwnDelivery) {
                    return;
                }
                var client = currentHub.getClient();
                var event = utils_1.isPrimitive(error)
                    ? _this._eventFromIncompleteOnError(data.msg, data.url, data.line, data.column)
                    : _this._enhanceEventWithInitialFrame(eventbuilder_1.eventFromUnknownInput(error, undefined, {
                        attachStacktrace: client && client.getOptions().attachStacktrace,
                        rejection: false,
                    }), data.url, data.line, data.column);
                utils_1.addExceptionMechanism(event, {
                    handled: false,
                    type: 'onerror',
                });
                currentHub.captureEvent(event, {
                    originalException: error,
                });
            },
            type: 'error',
        });
        this._onErrorHandlerInstalled = true;
    };
    /** JSDoc */
    GlobalHandlers.prototype._installGlobalOnUnhandledRejectionHandler = function () {
        var _this = this;
        if (this._onUnhandledRejectionHandlerInstalled) {
            return;
        }
        utils_1.addInstrumentationHandler({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callback: function (e) {
                var error = e;
                // dig the object of the rejection out of known event types
                try {
                    // PromiseRejectionEvents store the object of the rejection under 'reason'
                    // see https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
                    if ('reason' in e) {
                        error = e.reason;
                    }
                    // something, somewhere, (likely a browser extension) effectively casts PromiseRejectionEvents
                    // to CustomEvents, moving the `promise` and `reason` attributes of the PRE into
                    // the CustomEvent's `detail` attribute, since they're not part of CustomEvent's spec
                    // see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent and
                    // https://github.com/getsentry/sentry-javascript/issues/2380
                    else if ('detail' in e && 'reason' in e.detail) {
                        error = e.detail.reason;
                    }
                }
                catch (_oO) {
                    // no-empty
                }
                var currentHub = core_1.getCurrentHub();
                var hasIntegration = currentHub.getIntegration(GlobalHandlers);
                var isFailedOwnDelivery = error && error.__sentry_own_request__ === true;
                if (!hasIntegration || helpers_1.shouldIgnoreOnError() || isFailedOwnDelivery) {
                    return true;
                }
                var client = currentHub.getClient();
                var event = utils_1.isPrimitive(error)
                    ? _this._eventFromIncompleteRejection(error)
                    : eventbuilder_1.eventFromUnknownInput(error, undefined, {
                        attachStacktrace: client && client.getOptions().attachStacktrace,
                        rejection: true,
                    });
                event.level = types_1.Severity.Error;
                utils_1.addExceptionMechanism(event, {
                    handled: false,
                    type: 'onunhandledrejection',
                });
                currentHub.captureEvent(event, {
                    originalException: error,
                });
                return;
            },
            type: 'unhandledrejection',
        });
        this._onUnhandledRejectionHandlerInstalled = true;
    };
    /**
     * This function creates a stack from an old, error-less onerror handler.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    GlobalHandlers.prototype._eventFromIncompleteOnError = function (msg, url, line, column) {
        var ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i;
        // If 'message' is ErrorEvent, get real message from inside
        var message = utils_1.isErrorEvent(msg) ? msg.message : msg;
        var name;
        if (utils_1.isString(message)) {
            var groups = message.match(ERROR_TYPES_RE);
            if (groups) {
                name = groups[1];
                message = groups[2];
            }
        }
        var event = {
            exception: {
                values: [
                    {
                        type: name || 'Error',
                        value: message,
                    },
                ],
            },
        };
        return this._enhanceEventWithInitialFrame(event, url, line, column);
    };
    /**
     * This function creates an Event from an TraceKitStackTrace that has part of it missing.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    GlobalHandlers.prototype._eventFromIncompleteRejection = function (error) {
        return {
            exception: {
                values: [
                    {
                        type: 'UnhandledRejection',
                        value: "Non-Error promise rejection captured with value: " + error,
                    },
                ],
            },
        };
    };
    /** JSDoc */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    GlobalHandlers.prototype._enhanceEventWithInitialFrame = function (event, url, line, column) {
        event.exception = event.exception || {};
        event.exception.values = event.exception.values || [];
        event.exception.values[0] = event.exception.values[0] || {};
        event.exception.values[0].stacktrace = event.exception.values[0].stacktrace || {};
        event.exception.values[0].stacktrace.frames = event.exception.values[0].stacktrace.frames || [];
        var colno = isNaN(parseInt(column, 10)) ? undefined : column;
        var lineno = isNaN(parseInt(line, 10)) ? undefined : line;
        var filename = utils_1.isString(url) && url.length > 0 ? url : utils_1.getLocationHref();
        if (event.exception.values[0].stacktrace.frames.length === 0) {
            event.exception.values[0].stacktrace.frames.push({
                colno: colno,
                filename: filename,
                function: '?',
                in_app: true,
                lineno: lineno,
            });
        }
        return event;
    };
    /**
     * @inheritDoc
     */
    GlobalHandlers.id = 'GlobalHandlers';
    return GlobalHandlers;
}());
exports.GlobalHandlers = GlobalHandlers;

},{"../eventbuilder":3,"../helpers":5,"@sentry/core":24,"@sentry/types":36,"@sentry/utils":43,"tslib":57}],9:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var globalhandlers_1 = require("./globalhandlers");
Object.defineProperty(exports, "GlobalHandlers", { enumerable: true, get: function () { return globalhandlers_1.GlobalHandlers; } });
var trycatch_1 = require("./trycatch");
Object.defineProperty(exports, "TryCatch", { enumerable: true, get: function () { return trycatch_1.TryCatch; } });
var breadcrumbs_1 = require("./breadcrumbs");
Object.defineProperty(exports, "Breadcrumbs", { enumerable: true, get: function () { return breadcrumbs_1.Breadcrumbs; } });
var linkederrors_1 = require("./linkederrors");
Object.defineProperty(exports, "LinkedErrors", { enumerable: true, get: function () { return linkederrors_1.LinkedErrors; } });
var useragent_1 = require("./useragent");
Object.defineProperty(exports, "UserAgent", { enumerable: true, get: function () { return useragent_1.UserAgent; } });

},{"./breadcrumbs":7,"./globalhandlers":8,"./linkederrors":10,"./trycatch":11,"./useragent":12}],10:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedErrors = void 0;
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
var parsers_1 = require("../parsers");
var tracekit_1 = require("../tracekit");
var DEFAULT_KEY = 'cause';
var DEFAULT_LIMIT = 5;
/** Adds SDK info to an event. */
var LinkedErrors = /** @class */ (function () {
    /**
     * @inheritDoc
     */
    function LinkedErrors(options) {
        if (options === void 0) { options = {}; }
        /**
         * @inheritDoc
         */
        this.name = LinkedErrors.id;
        this._key = options.key || DEFAULT_KEY;
        this._limit = options.limit || DEFAULT_LIMIT;
    }
    /**
     * @inheritDoc
     */
    LinkedErrors.prototype.setupOnce = function () {
        core_1.addGlobalEventProcessor(function (event, hint) {
            var self = core_1.getCurrentHub().getIntegration(LinkedErrors);
            if (self) {
                return self._handler(event, hint);
            }
            return event;
        });
    };
    /**
     * @inheritDoc
     */
    LinkedErrors.prototype._handler = function (event, hint) {
        if (!event.exception || !event.exception.values || !hint || !utils_1.isInstanceOf(hint.originalException, Error)) {
            return event;
        }
        var linkedErrors = this._walkErrorTree(hint.originalException, this._key);
        event.exception.values = tslib_1.__spread(linkedErrors, event.exception.values);
        return event;
    };
    /**
     * @inheritDoc
     */
    LinkedErrors.prototype._walkErrorTree = function (error, key, stack) {
        if (stack === void 0) { stack = []; }
        if (!utils_1.isInstanceOf(error[key], Error) || stack.length + 1 >= this._limit) {
            return stack;
        }
        var stacktrace = tracekit_1.computeStackTrace(error[key]);
        var exception = parsers_1.exceptionFromStacktrace(stacktrace);
        return this._walkErrorTree(error[key], key, tslib_1.__spread([exception], stack));
    };
    /**
     * @inheritDoc
     */
    LinkedErrors.id = 'LinkedErrors';
    return LinkedErrors;
}());
exports.LinkedErrors = LinkedErrors;

},{"../parsers":13,"../tracekit":15,"@sentry/core":24,"@sentry/utils":43,"tslib":57}],11:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.TryCatch = void 0;
var tslib_1 = require("tslib");
var utils_1 = require("@sentry/utils");
var helpers_1 = require("../helpers");
var DEFAULT_EVENT_TARGET = [
    'EventTarget',
    'Window',
    'Node',
    'ApplicationCache',
    'AudioTrackList',
    'ChannelMergerNode',
    'CryptoOperation',
    'EventSource',
    'FileReader',
    'HTMLUnknownElement',
    'IDBDatabase',
    'IDBRequest',
    'IDBTransaction',
    'KeyOperation',
    'MediaController',
    'MessagePort',
    'ModalWindow',
    'Notification',
    'SVGElementInstance',
    'Screen',
    'TextTrack',
    'TextTrackCue',
    'TextTrackList',
    'WebSocket',
    'WebSocketWorker',
    'Worker',
    'XMLHttpRequest',
    'XMLHttpRequestEventTarget',
    'XMLHttpRequestUpload',
];
/** Wrap timer functions and event targets to catch errors and provide better meta data */
var TryCatch = /** @class */ (function () {
    /**
     * @inheritDoc
     */
    function TryCatch(options) {
        /**
         * @inheritDoc
         */
        this.name = TryCatch.id;
        this._options = tslib_1.__assign({ XMLHttpRequest: true, eventTarget: true, requestAnimationFrame: true, setInterval: true, setTimeout: true }, options);
    }
    /**
     * Wrap timer functions and event targets to catch errors
     * and provide better metadata.
     */
    TryCatch.prototype.setupOnce = function () {
        var global = utils_1.getGlobalObject();
        if (this._options.setTimeout) {
            utils_1.fill(global, 'setTimeout', this._wrapTimeFunction.bind(this));
        }
        if (this._options.setInterval) {
            utils_1.fill(global, 'setInterval', this._wrapTimeFunction.bind(this));
        }
        if (this._options.requestAnimationFrame) {
            utils_1.fill(global, 'requestAnimationFrame', this._wrapRAF.bind(this));
        }
        if (this._options.XMLHttpRequest && 'XMLHttpRequest' in global) {
            utils_1.fill(XMLHttpRequest.prototype, 'send', this._wrapXHR.bind(this));
        }
        if (this._options.eventTarget) {
            var eventTarget = Array.isArray(this._options.eventTarget) ? this._options.eventTarget : DEFAULT_EVENT_TARGET;
            eventTarget.forEach(this._wrapEventTarget.bind(this));
        }
    };
    /** JSDoc */
    TryCatch.prototype._wrapTimeFunction = function (original) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var originalCallback = args[0];
            args[0] = helpers_1.wrap(originalCallback, {
                mechanism: {
                    data: { function: utils_1.getFunctionName(original) },
                    handled: true,
                    type: 'instrument',
                },
            });
            return original.apply(this, args);
        };
    };
    /** JSDoc */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TryCatch.prototype._wrapRAF = function (original) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return function (callback) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return original.call(this, helpers_1.wrap(callback, {
                mechanism: {
                    data: {
                        function: 'requestAnimationFrame',
                        handler: utils_1.getFunctionName(original),
                    },
                    handled: true,
                    type: 'instrument',
                },
            }));
        };
    };
    /** JSDoc */
    TryCatch.prototype._wrapEventTarget = function (target) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var global = utils_1.getGlobalObject();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        var proto = global[target] && global[target].prototype;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
            return;
        }
        utils_1.fill(proto, 'addEventListener', function (original) {
            return function (eventName, fn, options) {
                try {
                    if (typeof fn.handleEvent === 'function') {
                        fn.handleEvent = helpers_1.wrap(fn.handleEvent.bind(fn), {
                            mechanism: {
                                data: {
                                    function: 'handleEvent',
                                    handler: utils_1.getFunctionName(fn),
                                    target: target,
                                },
                                handled: true,
                                type: 'instrument',
                            },
                        });
                    }
                }
                catch (err) {
                    // can sometimes get 'Permission denied to access property "handle Event'
                }
                return original.call(this, eventName, 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                helpers_1.wrap(fn, {
                    mechanism: {
                        data: {
                            function: 'addEventListener',
                            handler: utils_1.getFunctionName(fn),
                            target: target,
                        },
                        handled: true,
                        type: 'instrument',
                    },
                }), options);
            };
        });
        utils_1.fill(proto, 'removeEventListener', function (original) {
            return function (eventName, fn, options) {
                /**
                 * There are 2 possible scenarios here:
                 *
                 * 1. Someone passes a callback, which was attached prior to Sentry initialization, or by using unmodified
                 * method, eg. `document.addEventListener.call(el, name, handler). In this case, we treat this function
                 * as a pass-through, and call original `removeEventListener` with it.
                 *
                 * 2. Someone passes a callback, which was attached after Sentry was initialized, which means that it was using
                 * our wrapped version of `addEventListener`, which internally calls `wrap` helper.
                 * This helper "wraps" whole callback inside a try/catch statement, and attached appropriate metadata to it,
                 * in order for us to make a distinction between wrapped/non-wrapped functions possible.
                 * If a function was wrapped, it has additional property of `__sentry_wrapped__`, holding the handler.
                 *
                 * When someone adds a handler prior to initialization, and then do it again, but after,
                 * then we have to detach both of them. Otherwise, if we'd detach only wrapped one, it'd be impossible
                 * to get rid of the initial handler and it'd stick there forever.
                 */
                try {
                    original.call(this, eventName, fn.__sentry_wrapped__, options);
                }
                catch (e) {
                    // ignore, accessing __sentry_wrapped__ will throw in some Selenium environments
                }
                return original.call(this, eventName, fn, options);
            };
        });
    };
    /** JSDoc */
    TryCatch.prototype._wrapXHR = function (originalSend) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            var xhr = this;
            var xmlHttpRequestProps = ['onload', 'onerror', 'onprogress', 'onreadystatechange'];
            xmlHttpRequestProps.forEach(function (prop) {
                if (prop in xhr && typeof xhr[prop] === 'function') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    utils_1.fill(xhr, prop, function (original) {
                        var wrapOptions = {
                            mechanism: {
                                data: {
                                    function: prop,
                                    handler: utils_1.getFunctionName(original),
                                },
                                handled: true,
                                type: 'instrument',
                            },
                        };
                        // If Instrument integration has been called before TryCatch, get the name of original function
                        if (original.__sentry_original__) {
                            wrapOptions.mechanism.data.handler = utils_1.getFunctionName(original.__sentry_original__);
                        }
                        // Otherwise wrap directly
                        return helpers_1.wrap(original, wrapOptions);
                    });
                }
            });
            return originalSend.apply(this, args);
        };
    };
    /**
     * @inheritDoc
     */
    TryCatch.id = 'TryCatch';
    return TryCatch;
}());
exports.TryCatch = TryCatch;

},{"../helpers":5,"@sentry/utils":43,"tslib":57}],12:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAgent = void 0;
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
var global = utils_1.getGlobalObject();
/** UserAgent */
var UserAgent = /** @class */ (function () {
    function UserAgent() {
        /**
         * @inheritDoc
         */
        this.name = UserAgent.id;
    }
    /**
     * @inheritDoc
     */
    UserAgent.prototype.setupOnce = function () {
        core_1.addGlobalEventProcessor(function (event) {
            if (core_1.getCurrentHub().getIntegration(UserAgent)) {
                if (!global.navigator || !global.location) {
                    return event;
                }
                var request = event.request || {};
                request.url = request.url || global.location.href;
                request.headers = request.headers || {};
                request.headers['User-Agent'] = global.navigator.userAgent;
                return tslib_1.__assign(tslib_1.__assign({}, event), { request: request });
            }
            return event;
        });
    };
    /**
     * @inheritDoc
     */
    UserAgent.id = 'UserAgent';
    return UserAgent;
}());
exports.UserAgent = UserAgent;

},{"@sentry/core":24,"@sentry/utils":43,"tslib":57}],13:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareFramesForEvent = exports.eventFromStacktrace = exports.eventFromPlainObject = exports.exceptionFromStacktrace = void 0;
var utils_1 = require("@sentry/utils");
var tracekit_1 = require("./tracekit");
var STACKTRACE_LIMIT = 50;
/**
 * This function creates an exception from an TraceKitStackTrace
 * @param stacktrace TraceKitStackTrace that will be converted to an exception
 * @hidden
 */
function exceptionFromStacktrace(stacktrace) {
    var frames = prepareFramesForEvent(stacktrace.stack);
    var exception = {
        type: stacktrace.name,
        value: stacktrace.message,
    };
    if (frames && frames.length) {
        exception.stacktrace = { frames: frames };
    }
    if (exception.type === undefined && exception.value === '') {
        exception.value = 'Unrecoverable error caught';
    }
    return exception;
}
exports.exceptionFromStacktrace = exceptionFromStacktrace;
/**
 * @hidden
 */
function eventFromPlainObject(exception, syntheticException, rejection) {
    var event = {
        exception: {
            values: [
                {
                    type: utils_1.isEvent(exception) ? exception.constructor.name : rejection ? 'UnhandledRejection' : 'Error',
                    value: "Non-Error " + (rejection ? 'promise rejection' : 'exception') + " captured with keys: " + utils_1.extractExceptionKeysForMessage(exception),
                },
            ],
        },
        extra: {
            __serialized__: utils_1.normalizeToSize(exception),
        },
    };
    if (syntheticException) {
        var stacktrace = tracekit_1.computeStackTrace(syntheticException);
        var frames_1 = prepareFramesForEvent(stacktrace.stack);
        event.stacktrace = {
            frames: frames_1,
        };
    }
    return event;
}
exports.eventFromPlainObject = eventFromPlainObject;
/**
 * @hidden
 */
function eventFromStacktrace(stacktrace) {
    var exception = exceptionFromStacktrace(stacktrace);
    return {
        exception: {
            values: [exception],
        },
    };
}
exports.eventFromStacktrace = eventFromStacktrace;
/**
 * @hidden
 */
function prepareFramesForEvent(stack) {
    if (!stack || !stack.length) {
        return [];
    }
    var localStack = stack;
    var firstFrameFunction = localStack[0].func || '';
    var lastFrameFunction = localStack[localStack.length - 1].func || '';
    // If stack starts with one of our API calls, remove it (starts, meaning it's the top of the stack - aka last call)
    if (firstFrameFunction.indexOf('captureMessage') !== -1 || firstFrameFunction.indexOf('captureException') !== -1) {
        localStack = localStack.slice(1);
    }
    // If stack ends with one of our internal API calls, remove it (ends, meaning it's the bottom of the stack - aka top-most call)
    if (lastFrameFunction.indexOf('sentryWrapped') !== -1) {
        localStack = localStack.slice(0, -1);
    }
    // The frame where the crash happened, should be the last entry in the array
    return localStack
        .slice(0, STACKTRACE_LIMIT)
        .map(function (frame) { return ({
        colno: frame.column === null ? undefined : frame.column,
        filename: frame.url || localStack[0].url,
        function: frame.func || '?',
        in_app: true,
        lineno: frame.line === null ? undefined : frame.line,
    }); })
        .reverse();
}
exports.prepareFramesForEvent = prepareFramesForEvent;

},{"./tracekit":15,"@sentry/utils":43}],14:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrap = exports.close = exports.flush = exports.onLoad = exports.forceLoad = exports.lastEventId = exports.showReportDialog = exports.init = exports.defaultIntegrations = void 0;
var core_1 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
var client_1 = require("./client");
var helpers_1 = require("./helpers");
var integrations_1 = require("./integrations");
exports.defaultIntegrations = [
    new core_1.Integrations.InboundFilters(),
    new core_1.Integrations.FunctionToString(),
    new integrations_1.TryCatch(),
    new integrations_1.Breadcrumbs(),
    new integrations_1.GlobalHandlers(),
    new integrations_1.LinkedErrors(),
    new integrations_1.UserAgent(),
];
/**
 * The Sentry Browser SDK Client.
 *
 * To use this SDK, call the {@link init} function as early as possible when
 * loading the web page. To set context information or send manual events, use
 * the provided methods.
 *
 * @example
 *
 * ```
 *
 * import { init } from '@sentry/browser';
 *
 * init({
 *   dsn: '__DSN__',
 *   // ...
 * });
 * ```
 *
 * @example
 * ```
 *
 * import { configureScope } from '@sentry/browser';
 * configureScope((scope: Scope) => {
 *   scope.setExtra({ battery: 0.7 });
 *   scope.setTag({ user_mode: 'admin' });
 *   scope.setUser({ id: '4711' });
 * });
 * ```
 *
 * @example
 * ```
 *
 * import { addBreadcrumb } from '@sentry/browser';
 * addBreadcrumb({
 *   message: 'My Breadcrumb',
 *   // ...
 * });
 * ```
 *
 * @example
 *
 * ```
 *
 * import * as Sentry from '@sentry/browser';
 * Sentry.captureMessage('Hello, world!');
 * Sentry.captureException(new Error('Good bye'));
 * Sentry.captureEvent({
 *   message: 'Manual',
 *   stacktrace: [
 *     // ...
 *   ],
 * });
 * ```
 *
 * @see {@link BrowserOptions} for documentation on configuration options.
 */
function init(options) {
    if (options === void 0) { options = {}; }
    if (options.defaultIntegrations === undefined) {
        options.defaultIntegrations = exports.defaultIntegrations;
    }
    if (options.release === undefined) {
        var window_1 = utils_1.getGlobalObject();
        // This supports the variable that sentry-webpack-plugin injects
        if (window_1.SENTRY_RELEASE && window_1.SENTRY_RELEASE.id) {
            options.release = window_1.SENTRY_RELEASE.id;
        }
    }
    core_1.initAndBind(client_1.BrowserClient, options);
}
exports.init = init;
/**
 * Present the user with a report dialog.
 *
 * @param options Everything is optional, we try to fetch all info need from the global scope.
 */
function showReportDialog(options) {
    if (options === void 0) { options = {}; }
    if (!options.eventId) {
        options.eventId = core_1.getCurrentHub().lastEventId();
    }
    var client = core_1.getCurrentHub().getClient();
    if (client) {
        client.showReportDialog(options);
    }
}
exports.showReportDialog = showReportDialog;
/**
 * This is the getter for lastEventId.
 *
 * @returns The last event id of a captured event.
 */
function lastEventId() {
    return core_1.getCurrentHub().lastEventId();
}
exports.lastEventId = lastEventId;
/**
 * This function is here to be API compatible with the loader.
 * @hidden
 */
function forceLoad() {
    // Noop
}
exports.forceLoad = forceLoad;
/**
 * This function is here to be API compatible with the loader.
 * @hidden
 */
function onLoad(callback) {
    callback();
}
exports.onLoad = onLoad;
/**
 * A promise that resolves when all current events have been sent.
 * If you provide a timeout and the queue takes longer to drain the promise returns false.
 *
 * @param timeout Maximum time in ms the client should wait.
 */
function flush(timeout) {
    var client = core_1.getCurrentHub().getClient();
    if (client) {
        return client.flush(timeout);
    }
    return utils_1.SyncPromise.reject(false);
}
exports.flush = flush;
/**
 * A promise that resolves when all current events have been sent.
 * If you provide a timeout and the queue takes longer to drain the promise returns false.
 *
 * @param timeout Maximum time in ms the client should wait.
 */
function close(timeout) {
    var client = core_1.getCurrentHub().getClient();
    if (client) {
        return client.close(timeout);
    }
    return utils_1.SyncPromise.reject(false);
}
exports.close = close;
/**
 * Wrap code within a try/catch block so the SDK is able to capture errors.
 *
 * @param fn A function to wrap.
 *
 * @returns The result of wrapped function call.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrap(fn) {
    return helpers_1.wrap(fn)();
}
exports.wrap = wrap;

},{"./client":2,"./helpers":5,"./integrations":9,"@sentry/core":24,"@sentry/utils":43}],15:[function(require,module,exports){
/**
 * This was originally forked from https://github.com/occ/TraceKit, but has since been
 * largely modified and is now maintained as part of Sentry JS SDK.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeStackTrace = void 0;
var tslib_1 = require("tslib");
// global reference to slice
var UNKNOWN_FUNCTION = '?';
// Chromium based browsers: Chrome, Brave, new Opera, new Edge
var chrome = /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
// gecko regex: `(?:bundle|\d+\.js)`: `bundle` is for react native, `\d+\.js` also but specifically for ram bundles because it
// generates filenames without a prefix like `file://` the filenames in the stacktrace are just 42.js
// We need this specific case for now because we want no other regex to match.
var gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:file|https?|blob|chrome|webpack|resource|moz-extension).*?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js))(?::(\d+))?(?::(\d+))?\s*$/i;
var winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
var geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
var chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/;
// Based on our own mapping pattern - https://github.com/getsentry/sentry/blob/9f08305e09866c8bd6d0c24f5b0aabdd7dd6c59c/src/sentry/lang/javascript/errormapping.py#L83-L108
var reactMinifiedRegexp = /Minified React error #\d+;/i;
/** JSDoc */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
function computeStackTrace(ex) {
    var stack = null;
    var popSize = 0;
    if (ex) {
        if (typeof ex.framesToPop === 'number') {
            popSize = ex.framesToPop;
        }
        else if (reactMinifiedRegexp.test(ex.message)) {
            popSize = 1;
        }
    }
    try {
        // This must be tried first because Opera 10 *destroys*
        // its stacktrace property if you try to access the stack
        // property first!!
        stack = computeStackTraceFromStacktraceProp(ex);
        if (stack) {
            return popFrames(stack, popSize);
        }
    }
    catch (e) {
        // no-empty
    }
    try {
        stack = computeStackTraceFromStackProp(ex);
        if (stack) {
            return popFrames(stack, popSize);
        }
    }
    catch (e) {
        // no-empty
    }
    return {
        message: extractMessage(ex),
        name: ex && ex.name,
        stack: [],
        failed: true,
    };
}
exports.computeStackTrace = computeStackTrace;
/** JSDoc */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, complexity
function computeStackTraceFromStackProp(ex) {
    if (!ex || !ex.stack) {
        return null;
    }
    var stack = [];
    var lines = ex.stack.split('\n');
    var isEval;
    var submatch;
    var parts;
    var element;
    for (var i = 0; i < lines.length; ++i) {
        if ((parts = chrome.exec(lines[i]))) {
            var isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
            isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
            if (isEval && (submatch = chromeEval.exec(parts[2]))) {
                // throw out eval line/column and use top-most line/column number
                parts[2] = submatch[1]; // url
                parts[3] = submatch[2]; // line
                parts[4] = submatch[3]; // column
            }
            element = {
                // working with the regexp above is super painful. it is quite a hack, but just stripping the `address at `
                // prefix here seems like the quickest solution for now.
                url: parts[2] && parts[2].indexOf('address at ') === 0 ? parts[2].substr('address at '.length) : parts[2],
                func: parts[1] || UNKNOWN_FUNCTION,
                args: isNative ? [parts[2]] : [],
                line: parts[3] ? +parts[3] : null,
                column: parts[4] ? +parts[4] : null,
            };
        }
        else if ((parts = winjs.exec(lines[i]))) {
            element = {
                url: parts[2],
                func: parts[1] || UNKNOWN_FUNCTION,
                args: [],
                line: +parts[3],
                column: parts[4] ? +parts[4] : null,
            };
        }
        else if ((parts = gecko.exec(lines[i]))) {
            isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
            if (isEval && (submatch = geckoEval.exec(parts[3]))) {
                // throw out eval line/column and use top-most line number
                parts[1] = parts[1] || "eval";
                parts[3] = submatch[1];
                parts[4] = submatch[2];
                parts[5] = ''; // no column when eval
            }
            else if (i === 0 && !parts[5] && ex.columnNumber !== void 0) {
                // FireFox uses this awesome columnNumber property for its top frame
                // Also note, Firefox's column number is 0-based and everything else expects 1-based,
                // so adding 1
                // NOTE: this hack doesn't work if top-most frame is eval
                stack[0].column = ex.columnNumber + 1;
            }
            element = {
                url: parts[3],
                func: parts[1] || UNKNOWN_FUNCTION,
                args: parts[2] ? parts[2].split(',') : [],
                line: parts[4] ? +parts[4] : null,
                column: parts[5] ? +parts[5] : null,
            };
        }
        else {
            continue;
        }
        if (!element.func && element.line) {
            element.func = UNKNOWN_FUNCTION;
        }
        stack.push(element);
    }
    if (!stack.length) {
        return null;
    }
    return {
        message: extractMessage(ex),
        name: ex.name,
        stack: stack,
    };
}
/** JSDoc */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeStackTraceFromStacktraceProp(ex) {
    if (!ex || !ex.stacktrace) {
        return null;
    }
    // Access and store the stacktrace property before doing ANYTHING
    // else to it because Opera is not very good at providing it
    // reliably in other circumstances.
    var stacktrace = ex.stacktrace;
    var opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i;
    var opera11Regex = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^)]+))\((.*)\))? in (.*):\s*$/i;
    var lines = stacktrace.split('\n');
    var stack = [];
    var parts;
    for (var line = 0; line < lines.length; line += 2) {
        var element = null;
        if ((parts = opera10Regex.exec(lines[line]))) {
            element = {
                url: parts[2],
                func: parts[3],
                args: [],
                line: +parts[1],
                column: null,
            };
        }
        else if ((parts = opera11Regex.exec(lines[line]))) {
            element = {
                url: parts[6],
                func: parts[3] || parts[4],
                args: parts[5] ? parts[5].split(',') : [],
                line: +parts[1],
                column: +parts[2],
            };
        }
        if (element) {
            if (!element.func && element.line) {
                element.func = UNKNOWN_FUNCTION;
            }
            stack.push(element);
        }
    }
    if (!stack.length) {
        return null;
    }
    return {
        message: extractMessage(ex),
        name: ex.name,
        stack: stack,
    };
}
/** Remove N number of frames from the stack */
function popFrames(stacktrace, popSize) {
    try {
        return tslib_1.__assign(tslib_1.__assign({}, stacktrace), { stack: stacktrace.stack.slice(popSize) });
    }
    catch (e) {
        return stacktrace;
    }
}
/**
 * There are cases where stacktrace.message is an Event object
 * https://github.com/getsentry/sentry-javascript/issues/1949
 * In this specific case we try to extract stacktrace.message.error.message
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMessage(ex) {
    var message = ex && ex.message;
    if (!message) {
        return 'No error message';
    }
    if (message.error && typeof message.error.message === 'string') {
        return message.error.message;
    }
    return message;
}

},{"tslib":57}],16:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTransport = void 0;
var core_1 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
/** Base Transport class implementation */
var BaseTransport = /** @class */ (function () {
    function BaseTransport(options) {
        this.options = options;
        /** A simple buffer holding all requests. */
        this._buffer = new utils_1.PromiseBuffer(30);
        this._api = new core_1.API(this.options.dsn);
        // eslint-disable-next-line deprecation/deprecation
        this.url = this._api.getStoreEndpointWithUrlEncodedAuth();
    }
    /**
     * @inheritDoc
     */
    BaseTransport.prototype.sendEvent = function (_) {
        throw new utils_1.SentryError('Transport Class has to implement `sendEvent` method');
    };
    /**
     * @inheritDoc
     */
    BaseTransport.prototype.close = function (timeout) {
        return this._buffer.drain(timeout);
    };
    return BaseTransport;
}());
exports.BaseTransport = BaseTransport;

},{"@sentry/core":24,"@sentry/utils":43}],17:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchTransport = void 0;
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var types_1 = require("@sentry/types");
var utils_1 = require("@sentry/utils");
var base_1 = require("./base");
var global = utils_1.getGlobalObject();
/** `fetch` based transport */
var FetchTransport = /** @class */ (function (_super) {
    tslib_1.__extends(FetchTransport, _super);
    function FetchTransport() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** Locks transport after receiving 429 response */
        _this._disabledUntil = new Date(Date.now());
        return _this;
    }
    /**
     * @inheritDoc
     */
    FetchTransport.prototype.sendEvent = function (event) {
        var _this = this;
        if (new Date(Date.now()) < this._disabledUntil) {
            return Promise.reject({
                event: event,
                reason: "Transport locked till " + this._disabledUntil + " due to too many requests.",
                status: 429,
            });
        }
        var sentryReq = core_1.eventToSentryRequest(event, this._api);
        var options = {
            body: sentryReq.body,
            method: 'POST',
            // Despite all stars in the sky saying that Edge supports old draft syntax, aka 'never', 'always', 'origin' and 'default
            // https://caniuse.com/#feat=referrer-policy
            // It doesn't. And it throw exception instead of ignoring this parameter...
            // REF: https://github.com/getsentry/raven-js/issues/1233
            referrerPolicy: (utils_1.supportsReferrerPolicy() ? 'origin' : ''),
        };
        if (this.options.fetchParameters !== undefined) {
            Object.assign(options, this.options.fetchParameters);
        }
        if (this.options.headers !== undefined) {
            options.headers = this.options.headers;
        }
        return this._buffer.add(new utils_1.SyncPromise(function (resolve, reject) {
            global
                .fetch(sentryReq.url, options)
                .then(function (response) {
                var status = types_1.Status.fromHttpCode(response.status);
                if (status === types_1.Status.Success) {
                    resolve({ status: status });
                    return;
                }
                if (status === types_1.Status.RateLimit) {
                    var now = Date.now();
                    /**
                     * "The name is case-insensitive."
                     * https://developer.mozilla.org/en-US/docs/Web/API/Headers/get
                     */
                    var retryAfterHeader = response.headers.get('Retry-After');
                    _this._disabledUntil = new Date(now + utils_1.parseRetryAfterHeader(now, retryAfterHeader));
                    utils_1.logger.warn("Too many requests, backing off till: " + _this._disabledUntil);
                }
                reject(response);
            })
                .catch(reject);
        }));
    };
    return FetchTransport;
}(base_1.BaseTransport));
exports.FetchTransport = FetchTransport;

},{"./base":16,"@sentry/core":24,"@sentry/types":36,"@sentry/utils":43,"tslib":57}],18:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = require("./base");
Object.defineProperty(exports, "BaseTransport", { enumerable: true, get: function () { return base_1.BaseTransport; } });
var fetch_1 = require("./fetch");
Object.defineProperty(exports, "FetchTransport", { enumerable: true, get: function () { return fetch_1.FetchTransport; } });
var xhr_1 = require("./xhr");
Object.defineProperty(exports, "XHRTransport", { enumerable: true, get: function () { return xhr_1.XHRTransport; } });

},{"./base":16,"./fetch":17,"./xhr":19}],19:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.XHRTransport = void 0;
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var types_1 = require("@sentry/types");
var utils_1 = require("@sentry/utils");
var base_1 = require("./base");
/** `XHR` based transport */
var XHRTransport = /** @class */ (function (_super) {
    tslib_1.__extends(XHRTransport, _super);
    function XHRTransport() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** Locks transport after receiving 429 response */
        _this._disabledUntil = new Date(Date.now());
        return _this;
    }
    /**
     * @inheritDoc
     */
    XHRTransport.prototype.sendEvent = function (event) {
        var _this = this;
        if (new Date(Date.now()) < this._disabledUntil) {
            return Promise.reject({
                event: event,
                reason: "Transport locked till " + this._disabledUntil + " due to too many requests.",
                status: 429,
            });
        }
        var sentryReq = core_1.eventToSentryRequest(event, this._api);
        return this._buffer.add(new utils_1.SyncPromise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState !== 4) {
                    return;
                }
                var status = types_1.Status.fromHttpCode(request.status);
                if (status === types_1.Status.Success) {
                    resolve({ status: status });
                    return;
                }
                if (status === types_1.Status.RateLimit) {
                    var now = Date.now();
                    /**
                     * "The search for the header name is case-insensitive."
                     * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getResponseHeader
                     */
                    var retryAfterHeader = request.getResponseHeader('Retry-After');
                    _this._disabledUntil = new Date(now + utils_1.parseRetryAfterHeader(now, retryAfterHeader));
                    utils_1.logger.warn("Too many requests, backing off till: " + _this._disabledUntil);
                }
                reject(request);
            };
            request.open('POST', sentryReq.url);
            for (var header in _this.options.headers) {
                if (_this.options.headers.hasOwnProperty(header)) {
                    request.setRequestHeader(header, _this.options.headers[header]);
                }
            }
            request.send(sentryReq.body);
        }));
    };
    return XHRTransport;
}(base_1.BaseTransport));
exports.XHRTransport = XHRTransport;

},{"./base":16,"@sentry/core":24,"@sentry/types":36,"@sentry/utils":43,"tslib":57}],20:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDK_VERSION = exports.SDK_NAME = void 0;
exports.SDK_NAME = 'sentry.javascript.browser';
exports.SDK_VERSION = '5.21.4';

},{}],21:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = void 0;
var utils_1 = require("@sentry/utils");
var SENTRY_API_VERSION = '7';
/** Helper class to provide urls to different Sentry endpoints. */
var API = /** @class */ (function () {
    /** Create a new instance of API */
    function API(dsn) {
        this.dsn = dsn;
        this._dsnObject = new utils_1.Dsn(dsn);
    }
    /** Returns the Dsn object. */
    API.prototype.getDsn = function () {
        return this._dsnObject;
    };
    /** Returns the prefix to construct Sentry ingestion API endpoints. */
    API.prototype.getBaseApiEndpoint = function () {
        var dsn = this._dsnObject;
        var protocol = dsn.protocol ? dsn.protocol + ":" : '';
        var port = dsn.port ? ":" + dsn.port : '';
        return protocol + "//" + dsn.host + port + (dsn.path ? "/" + dsn.path : '') + "/api/";
    };
    /** Returns the store endpoint URL. */
    API.prototype.getStoreEndpoint = function () {
        return this._getIngestEndpoint('store');
    };
    /**
     * Returns the store endpoint URL with auth in the query string.
     *
     * Sending auth as part of the query string and not as custom HTTP headers avoids CORS preflight requests.
     */
    API.prototype.getStoreEndpointWithUrlEncodedAuth = function () {
        return this.getStoreEndpoint() + "?" + this._encodedAuth();
    };
    /**
     * Returns the envelope endpoint URL with auth in the query string.
     *
     * Sending auth as part of the query string and not as custom HTTP headers avoids CORS preflight requests.
     */
    API.prototype.getEnvelopeEndpointWithUrlEncodedAuth = function () {
        return this._getEnvelopeEndpoint() + "?" + this._encodedAuth();
    };
    /** Returns only the path component for the store endpoint. */
    API.prototype.getStoreEndpointPath = function () {
        var dsn = this._dsnObject;
        return (dsn.path ? "/" + dsn.path : '') + "/api/" + dsn.projectId + "/store/";
    };
    /**
     * Returns an object that can be used in request headers.
     * This is needed for node and the old /store endpoint in sentry
     */
    API.prototype.getRequestHeaders = function (clientName, clientVersion) {
        var dsn = this._dsnObject;
        var header = ["Sentry sentry_version=" + SENTRY_API_VERSION];
        header.push("sentry_client=" + clientName + "/" + clientVersion);
        header.push("sentry_key=" + dsn.user);
        if (dsn.pass) {
            header.push("sentry_secret=" + dsn.pass);
        }
        return {
            'Content-Type': 'application/json',
            'X-Sentry-Auth': header.join(', '),
        };
    };
    /** Returns the url to the report dialog endpoint. */
    API.prototype.getReportDialogEndpoint = function (dialogOptions) {
        if (dialogOptions === void 0) { dialogOptions = {}; }
        var dsn = this._dsnObject;
        var endpoint = this.getBaseApiEndpoint() + "embed/error-page/";
        var encodedOptions = [];
        encodedOptions.push("dsn=" + dsn.toString());
        for (var key in dialogOptions) {
            if (key === 'user') {
                if (!dialogOptions.user) {
                    continue;
                }
                if (dialogOptions.user.name) {
                    encodedOptions.push("name=" + encodeURIComponent(dialogOptions.user.name));
                }
                if (dialogOptions.user.email) {
                    encodedOptions.push("email=" + encodeURIComponent(dialogOptions.user.email));
                }
            }
            else {
                encodedOptions.push(encodeURIComponent(key) + "=" + encodeURIComponent(dialogOptions[key]));
            }
        }
        if (encodedOptions.length) {
            return endpoint + "?" + encodedOptions.join('&');
        }
        return endpoint;
    };
    /** Returns the envelope endpoint URL. */
    API.prototype._getEnvelopeEndpoint = function () {
        return this._getIngestEndpoint('envelope');
    };
    /** Returns the ingest API endpoint for target. */
    API.prototype._getIngestEndpoint = function (target) {
        var base = this.getBaseApiEndpoint();
        var dsn = this._dsnObject;
        return "" + base + dsn.projectId + "/" + target + "/";
    };
    /** Returns a URL-encoded string with auth config suitable for a query string. */
    API.prototype._encodedAuth = function () {
        var dsn = this._dsnObject;
        var auth = {
            // We send only the minimum set of required information. See
            // https://github.com/getsentry/sentry-javascript/issues/2572.
            sentry_key: dsn.user,
            sentry_version: SENTRY_API_VERSION,
        };
        return utils_1.urlEncode(auth);
    };
    return API;
}());
exports.API = API;

},{"@sentry/utils":43}],22:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseBackend = void 0;
var utils_1 = require("@sentry/utils");
var noop_1 = require("./transports/noop");
/**
 * This is the base implemention of a Backend.
 * @hidden
 */
var BaseBackend = /** @class */ (function () {
    /** Creates a new backend instance. */
    function BaseBackend(options) {
        this._options = options;
        if (!this._options.dsn) {
            utils_1.logger.warn('No DSN provided, backend will not do anything.');
        }
        this._transport = this._setupTransport();
    }
    /**
     * @inheritDoc
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    BaseBackend.prototype.eventFromException = function (_exception, _hint) {
        throw new utils_1.SentryError('Backend has to implement `eventFromException` method');
    };
    /**
     * @inheritDoc
     */
    BaseBackend.prototype.eventFromMessage = function (_message, _level, _hint) {
        throw new utils_1.SentryError('Backend has to implement `eventFromMessage` method');
    };
    /**
     * @inheritDoc
     */
    BaseBackend.prototype.sendEvent = function (event) {
        this._transport.sendEvent(event).then(null, function (reason) {
            utils_1.logger.error("Error while sending event: " + reason);
        });
    };
    /**
     * @inheritDoc
     */
    BaseBackend.prototype.getTransport = function () {
        return this._transport;
    };
    /**
     * Sets up the transport so it can be used later to send requests.
     */
    BaseBackend.prototype._setupTransport = function () {
        return new noop_1.NoopTransport();
    };
    return BaseBackend;
}());
exports.BaseBackend = BaseBackend;

},{"./transports/noop":31,"@sentry/utils":43}],23:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseClient = void 0;
var tslib_1 = require("tslib");
/* eslint-disable max-lines */
var hub_1 = require("@sentry/hub");
var utils_1 = require("@sentry/utils");
var integration_1 = require("./integration");
/**
 * Base implementation for all JavaScript SDK clients.
 *
 * Call the constructor with the corresponding backend constructor and options
 * specific to the client subclass. To access these options later, use
 * {@link Client.getOptions}. Also, the Backend instance is available via
 * {@link Client.getBackend}.
 *
 * If a Dsn is specified in the options, it will be parsed and stored. Use
 * {@link Client.getDsn} to retrieve the Dsn at any moment. In case the Dsn is
 * invalid, the constructor will throw a {@link SentryException}. Note that
 * without a valid Dsn, the SDK will not send any events to Sentry.
 *
 * Before sending an event via the backend, it is passed through
 * {@link BaseClient.prepareEvent} to add SDK information and scope data
 * (breadcrumbs and context). To add more custom information, override this
 * method and extend the resulting prepared event.
 *
 * To issue automatically created events (e.g. via instrumentation), use
 * {@link Client.captureEvent}. It will prepare the event and pass it through
 * the callback lifecycle. To issue auto-breadcrumbs, use
 * {@link Client.addBreadcrumb}.
 *
 * @example
 * class NodeClient extends BaseClient<NodeBackend, NodeOptions> {
 *   public constructor(options: NodeOptions) {
 *     super(NodeBackend, options);
 *   }
 *
 *   // ...
 * }
 */
var BaseClient = /** @class */ (function () {
    /**
     * Initializes this client instance.
     *
     * @param backendClass A constructor function to create the backend.
     * @param options Options for the client.
     */
    function BaseClient(backendClass, options) {
        /** Array of used integrations. */
        this._integrations = {};
        /** Is the client still processing a call? */
        this._processing = false;
        this._backend = new backendClass(options);
        this._options = options;
        if (options.dsn) {
            this._dsn = new utils_1.Dsn(options.dsn);
        }
    }
    /**
     * @inheritDoc
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    BaseClient.prototype.captureException = function (exception, hint, scope) {
        var _this = this;
        var eventId = hint && hint.event_id;
        this._processing = true;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._getBackend()
            .eventFromException(exception, hint)
            .then(function (event) {
            eventId = _this.captureEvent(event, hint, scope);
        });
        return eventId;
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.captureMessage = function (message, level, hint, scope) {
        var _this = this;
        var eventId = hint && hint.event_id;
        this._processing = true;
        var promisedEvent = utils_1.isPrimitive(message)
            ? this._getBackend().eventFromMessage("" + message, level, hint)
            : this._getBackend().eventFromException(message, hint);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        promisedEvent.then(function (event) {
            eventId = _this.captureEvent(event, hint, scope);
        });
        return eventId;
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.captureEvent = function (event, hint, scope) {
        var _this = this;
        var eventId = hint && hint.event_id;
        this._processing = true;
        this._processEvent(event, hint, scope)
            .then(function (finalEvent) {
            // We need to check for finalEvent in case beforeSend returned null
            eventId = finalEvent && finalEvent.event_id;
            _this._processing = false;
        })
            .then(null, function (reason) {
            utils_1.logger.error(reason);
            _this._processing = false;
        });
        return eventId;
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.getDsn = function () {
        return this._dsn;
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.getOptions = function () {
        return this._options;
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.flush = function (timeout) {
        var _this = this;
        return this._isClientProcessing(timeout).then(function (status) {
            clearInterval(status.interval);
            return _this._getBackend()
                .getTransport()
                .close(timeout)
                .then(function (transportFlushed) { return status.ready && transportFlushed; });
        });
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.close = function (timeout) {
        var _this = this;
        return this.flush(timeout).then(function (result) {
            _this.getOptions().enabled = false;
            return result;
        });
    };
    /**
     * Sets up the integrations
     */
    BaseClient.prototype.setupIntegrations = function () {
        if (this._isEnabled()) {
            this._integrations = integration_1.setupIntegrations(this._options);
        }
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.getIntegration = function (integration) {
        try {
            return this._integrations[integration.id] || null;
        }
        catch (_oO) {
            utils_1.logger.warn("Cannot retrieve integration " + integration.id + " from the current Client");
            return null;
        }
    };
    /** Waits for the client to be done with processing. */
    BaseClient.prototype._isClientProcessing = function (timeout) {
        var _this = this;
        return new utils_1.SyncPromise(function (resolve) {
            var ticked = 0;
            var tick = 1;
            var interval = 0;
            clearInterval(interval);
            interval = setInterval(function () {
                if (!_this._processing) {
                    resolve({
                        interval: interval,
                        ready: true,
                    });
                }
                else {
                    ticked += tick;
                    if (timeout && ticked >= timeout) {
                        resolve({
                            interval: interval,
                            ready: false,
                        });
                    }
                }
            }, tick);
        });
    };
    /** Returns the current backend. */
    BaseClient.prototype._getBackend = function () {
        return this._backend;
    };
    /** Determines whether this SDK is enabled and a valid Dsn is present. */
    BaseClient.prototype._isEnabled = function () {
        return this.getOptions().enabled !== false && this._dsn !== undefined;
    };
    /**
     * Adds common information to events.
     *
     * The information includes release and environment from `options`,
     * breadcrumbs and context (extra, tags and user) from the scope.
     *
     * Information that is already present in the event is never overwritten. For
     * nested objects, such as the context, keys are merged.
     *
     * @param event The original event.
     * @param hint May contain additional information about the original exception.
     * @param scope A scope containing event metadata.
     * @returns A new event with more information.
     */
    BaseClient.prototype._prepareEvent = function (event, scope, hint) {
        var _this = this;
        var _a = this.getOptions().normalizeDepth, normalizeDepth = _a === void 0 ? 3 : _a;
        var prepared = tslib_1.__assign(tslib_1.__assign({}, event), { event_id: event.event_id || (hint && hint.event_id ? hint.event_id : utils_1.uuid4()), timestamp: event.timestamp || utils_1.timestampWithMs() });
        this._applyClientOptions(prepared);
        this._applyIntegrationsMetadata(prepared);
        // If we have scope given to us, use it as the base for further modifications.
        // This allows us to prevent unnecessary copying of data if `captureContext` is not provided.
        var finalScope = scope;
        if (hint && hint.captureContext) {
            finalScope = hub_1.Scope.clone(finalScope).update(hint.captureContext);
        }
        // We prepare the result here with a resolved Event.
        var result = utils_1.SyncPromise.resolve(prepared);
        // This should be the last thing called, since we want that
        // {@link Hub.addEventProcessor} gets the finished prepared event.
        if (finalScope) {
            // In case we have a hub we reassign it.
            result = finalScope.applyToEvent(prepared, hint);
        }
        return result.then(function (evt) {
            if (typeof normalizeDepth === 'number' && normalizeDepth > 0) {
                return _this._normalizeEvent(evt, normalizeDepth);
            }
            return evt;
        });
    };
    /**
     * Applies `normalize` function on necessary `Event` attributes to make them safe for serialization.
     * Normalized keys:
     * - `breadcrumbs.data`
     * - `user`
     * - `contexts`
     * - `extra`
     * @param event Event
     * @returns Normalized event
     */
    BaseClient.prototype._normalizeEvent = function (event, depth) {
        if (!event) {
            return null;
        }
        var normalized = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, event), (event.breadcrumbs && {
            breadcrumbs: event.breadcrumbs.map(function (b) { return (tslib_1.__assign(tslib_1.__assign({}, b), (b.data && {
                data: utils_1.normalize(b.data, depth),
            }))); }),
        })), (event.user && {
            user: utils_1.normalize(event.user, depth),
        })), (event.contexts && {
            contexts: utils_1.normalize(event.contexts, depth),
        })), (event.extra && {
            extra: utils_1.normalize(event.extra, depth),
        }));
        // event.contexts.trace stores information about a Transaction. Similarly,
        // event.spans[] stores information about child Spans. Given that a
        // Transaction is conceptually a Span, normalization should apply to both
        // Transactions and Spans consistently.
        // For now the decision is to skip normalization of Transactions and Spans,
        // so this block overwrites the normalized event to add back the original
        // Transaction information prior to normalization.
        if (event.contexts && event.contexts.trace) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            normalized.contexts.trace = event.contexts.trace;
        }
        return normalized;
    };
    /**
     *  Enhances event using the client configuration.
     *  It takes care of all "static" values like environment, release and `dist`,
     *  as well as truncating overly long values.
     * @param event event instance to be enhanced
     */
    BaseClient.prototype._applyClientOptions = function (event) {
        var _a = this.getOptions(), environment = _a.environment, release = _a.release, dist = _a.dist, _b = _a.maxValueLength, maxValueLength = _b === void 0 ? 250 : _b;
        if (event.environment === undefined && environment !== undefined) {
            event.environment = environment;
        }
        if (event.release === undefined && release !== undefined) {
            event.release = release;
        }
        if (event.dist === undefined && dist !== undefined) {
            event.dist = dist;
        }
        if (event.message) {
            event.message = utils_1.truncate(event.message, maxValueLength);
        }
        var exception = event.exception && event.exception.values && event.exception.values[0];
        if (exception && exception.value) {
            exception.value = utils_1.truncate(exception.value, maxValueLength);
        }
        var request = event.request;
        if (request && request.url) {
            request.url = utils_1.truncate(request.url, maxValueLength);
        }
    };
    /**
     * This function adds all used integrations to the SDK info in the event.
     * @param sdkInfo The sdkInfo of the event that will be filled with all integrations.
     */
    BaseClient.prototype._applyIntegrationsMetadata = function (event) {
        var sdkInfo = event.sdk;
        var integrationsArray = Object.keys(this._integrations);
        if (sdkInfo && integrationsArray.length > 0) {
            sdkInfo.integrations = integrationsArray;
        }
    };
    /**
     * Tells the backend to send this event
     * @param event The Sentry event to send
     */
    BaseClient.prototype._sendEvent = function (event) {
        this._getBackend().sendEvent(event);
    };
    /**
     * Processes an event (either error or message) and sends it to Sentry.
     *
     * This also adds breadcrumbs and context information to the event. However,
     * platform specific meta data (such as the User's IP address) must be added
     * by the SDK implementor.
     *
     *
     * @param event The event to send to Sentry.
     * @param hint May contain additional information about the original exception.
     * @param scope A scope containing event metadata.
     * @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
     */
    BaseClient.prototype._processEvent = function (event, hint, scope) {
        var _this = this;
        // eslint-disable-next-line @typescript-eslint/unbound-method
        var _a = this.getOptions(), beforeSend = _a.beforeSend, sampleRate = _a.sampleRate;
        if (!this._isEnabled()) {
            return utils_1.SyncPromise.reject('SDK not enabled, will not send event.');
        }
        var isTransaction = event.type === 'transaction';
        // 1.0 === 100% events are sent
        // 0.0 === 0% events are sent
        // Sampling for transaction happens somewhere else
        if (!isTransaction && typeof sampleRate === 'number' && Math.random() > sampleRate) {
            return utils_1.SyncPromise.reject('This event has been sampled, will not send event.');
        }
        return new utils_1.SyncPromise(function (resolve, reject) {
            _this._prepareEvent(event, scope, hint)
                .then(function (prepared) {
                if (prepared === null) {
                    reject('An event processor returned null, will not send event.');
                    return;
                }
                var finalEvent = prepared;
                var isInternalException = hint && hint.data && hint.data.__sentry__ === true;
                // We skip beforeSend in case of transactions
                if (isInternalException || !beforeSend || isTransaction) {
                    _this._sendEvent(finalEvent);
                    resolve(finalEvent);
                    return;
                }
                var beforeSendResult = beforeSend(prepared, hint);
                if (typeof beforeSendResult === 'undefined') {
                    utils_1.logger.error('`beforeSend` method has to return `null` or a valid event.');
                }
                else if (utils_1.isThenable(beforeSendResult)) {
                    _this._handleAsyncBeforeSend(beforeSendResult, resolve, reject);
                }
                else {
                    finalEvent = beforeSendResult;
                    if (finalEvent === null) {
                        utils_1.logger.log('`beforeSend` returned `null`, will not send event.');
                        resolve(null);
                        return;
                    }
                    // From here on we are really async
                    _this._sendEvent(finalEvent);
                    resolve(finalEvent);
                }
            })
                .then(null, function (reason) {
                _this.captureException(reason, {
                    data: {
                        __sentry__: true,
                    },
                    originalException: reason,
                });
                reject("Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: " + reason);
            });
        });
    };
    /**
     * Resolves before send Promise and calls resolve/reject on parent SyncPromise.
     */
    BaseClient.prototype._handleAsyncBeforeSend = function (beforeSend, resolve, reject) {
        var _this = this;
        beforeSend
            .then(function (processedEvent) {
            if (processedEvent === null) {
                reject('`beforeSend` returned `null`, will not send event.');
                return;
            }
            // From here on we are really async
            _this._sendEvent(processedEvent);
            resolve(processedEvent);
        })
            .then(null, function (e) {
            reject("beforeSend rejected with " + e);
        });
    };
    return BaseClient;
}());
exports.BaseClient = BaseClient;

},{"./integration":25,"@sentry/hub":33,"@sentry/utils":43,"tslib":57}],24:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.Integrations = void 0;
var minimal_1 = require("@sentry/minimal");
Object.defineProperty(exports, "addBreadcrumb", { enumerable: true, get: function () { return minimal_1.addBreadcrumb; } });
Object.defineProperty(exports, "captureException", { enumerable: true, get: function () { return minimal_1.captureException; } });
Object.defineProperty(exports, "captureEvent", { enumerable: true, get: function () { return minimal_1.captureEvent; } });
Object.defineProperty(exports, "captureMessage", { enumerable: true, get: function () { return minimal_1.captureMessage; } });
Object.defineProperty(exports, "configureScope", { enumerable: true, get: function () { return minimal_1.configureScope; } });
Object.defineProperty(exports, "startTransaction", { enumerable: true, get: function () { return minimal_1.startTransaction; } });
Object.defineProperty(exports, "setContext", { enumerable: true, get: function () { return minimal_1.setContext; } });
Object.defineProperty(exports, "setExtra", { enumerable: true, get: function () { return minimal_1.setExtra; } });
Object.defineProperty(exports, "setExtras", { enumerable: true, get: function () { return minimal_1.setExtras; } });
Object.defineProperty(exports, "setTag", { enumerable: true, get: function () { return minimal_1.setTag; } });
Object.defineProperty(exports, "setTags", { enumerable: true, get: function () { return minimal_1.setTags; } });
Object.defineProperty(exports, "setUser", { enumerable: true, get: function () { return minimal_1.setUser; } });
Object.defineProperty(exports, "withScope", { enumerable: true, get: function () { return minimal_1.withScope; } });
var hub_1 = require("@sentry/hub");
Object.defineProperty(exports, "addGlobalEventProcessor", { enumerable: true, get: function () { return hub_1.addGlobalEventProcessor; } });
Object.defineProperty(exports, "getCurrentHub", { enumerable: true, get: function () { return hub_1.getCurrentHub; } });
Object.defineProperty(exports, "getHubFromCarrier", { enumerable: true, get: function () { return hub_1.getHubFromCarrier; } });
Object.defineProperty(exports, "Hub", { enumerable: true, get: function () { return hub_1.Hub; } });
Object.defineProperty(exports, "makeMain", { enumerable: true, get: function () { return hub_1.makeMain; } });
Object.defineProperty(exports, "Scope", { enumerable: true, get: function () { return hub_1.Scope; } });
var api_1 = require("./api");
Object.defineProperty(exports, "API", { enumerable: true, get: function () { return api_1.API; } });
var baseclient_1 = require("./baseclient");
Object.defineProperty(exports, "BaseClient", { enumerable: true, get: function () { return baseclient_1.BaseClient; } });
var basebackend_1 = require("./basebackend");
Object.defineProperty(exports, "BaseBackend", { enumerable: true, get: function () { return basebackend_1.BaseBackend; } });
var request_1 = require("./request");
Object.defineProperty(exports, "eventToSentryRequest", { enumerable: true, get: function () { return request_1.eventToSentryRequest; } });
var sdk_1 = require("./sdk");
Object.defineProperty(exports, "initAndBind", { enumerable: true, get: function () { return sdk_1.initAndBind; } });
var noop_1 = require("./transports/noop");
Object.defineProperty(exports, "NoopTransport", { enumerable: true, get: function () { return noop_1.NoopTransport; } });
var Integrations = require("./integrations");
exports.Integrations = Integrations;

},{"./api":21,"./basebackend":22,"./baseclient":23,"./integrations":28,"./request":29,"./sdk":30,"./transports/noop":31,"@sentry/hub":33,"@sentry/minimal":35}],25:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIntegrations = exports.setupIntegration = exports.getIntegrationsToSetup = exports.installedIntegrations = void 0;
var tslib_1 = require("tslib");
var hub_1 = require("@sentry/hub");
var utils_1 = require("@sentry/utils");
exports.installedIntegrations = [];
/** Gets integration to install */
function getIntegrationsToSetup(options) {
    var defaultIntegrations = (options.defaultIntegrations && tslib_1.__spread(options.defaultIntegrations)) || [];
    var userIntegrations = options.integrations;
    var integrations = [];
    if (Array.isArray(userIntegrations)) {
        var userIntegrationsNames_1 = userIntegrations.map(function (i) { return i.name; });
        var pickedIntegrationsNames_1 = [];
        // Leave only unique default integrations, that were not overridden with provided user integrations
        defaultIntegrations.forEach(function (defaultIntegration) {
            if (userIntegrationsNames_1.indexOf(defaultIntegration.name) === -1 &&
                pickedIntegrationsNames_1.indexOf(defaultIntegration.name) === -1) {
                integrations.push(defaultIntegration);
                pickedIntegrationsNames_1.push(defaultIntegration.name);
            }
        });
        // Don't add same user integration twice
        userIntegrations.forEach(function (userIntegration) {
            if (pickedIntegrationsNames_1.indexOf(userIntegration.name) === -1) {
                integrations.push(userIntegration);
                pickedIntegrationsNames_1.push(userIntegration.name);
            }
        });
    }
    else if (typeof userIntegrations === 'function') {
        integrations = userIntegrations(defaultIntegrations);
        integrations = Array.isArray(integrations) ? integrations : [integrations];
    }
    else {
        integrations = tslib_1.__spread(defaultIntegrations);
    }
    // Make sure that if present, `Debug` integration will always run last
    var integrationsNames = integrations.map(function (i) { return i.name; });
    var alwaysLastToRun = 'Debug';
    if (integrationsNames.indexOf(alwaysLastToRun) !== -1) {
        integrations.push.apply(integrations, tslib_1.__spread(integrations.splice(integrationsNames.indexOf(alwaysLastToRun), 1)));
    }
    return integrations;
}
exports.getIntegrationsToSetup = getIntegrationsToSetup;
/** Setup given integration */
function setupIntegration(integration) {
    if (exports.installedIntegrations.indexOf(integration.name) !== -1) {
        return;
    }
    integration.setupOnce(hub_1.addGlobalEventProcessor, hub_1.getCurrentHub);
    exports.installedIntegrations.push(integration.name);
    utils_1.logger.log("Integration installed: " + integration.name);
}
exports.setupIntegration = setupIntegration;
/**
 * Given a list of integration instances this installs them all. When `withDefaults` is set to `true` then all default
 * integrations are added unless they were already provided before.
 * @param integrations array of integration instances
 * @param withDefault should enable default integrations
 */
function setupIntegrations(options) {
    var integrations = {};
    getIntegrationsToSetup(options).forEach(function (integration) {
        integrations[integration.name] = integration;
        setupIntegration(integration);
    });
    return integrations;
}
exports.setupIntegrations = setupIntegrations;

},{"@sentry/hub":33,"@sentry/utils":43,"tslib":57}],26:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionToString = void 0;
var originalFunctionToString;
/** Patch toString calls to return proper name for wrapped functions */
var FunctionToString = /** @class */ (function () {
    function FunctionToString() {
        /**
         * @inheritDoc
         */
        this.name = FunctionToString.id;
    }
    /**
     * @inheritDoc
     */
    FunctionToString.prototype.setupOnce = function () {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        originalFunctionToString = Function.prototype.toString;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Function.prototype.toString = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var context = this.__sentry_original__ || this;
            return originalFunctionToString.apply(context, args);
        };
    };
    /**
     * @inheritDoc
     */
    FunctionToString.id = 'FunctionToString';
    return FunctionToString;
}());
exports.FunctionToString = FunctionToString;

},{}],27:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboundFilters = void 0;
var tslib_1 = require("tslib");
var hub_1 = require("@sentry/hub");
var utils_1 = require("@sentry/utils");
// "Script error." is hard coded into browsers for errors that it can't read.
// this is the result of a script being pulled in from an external domain and CORS.
var DEFAULT_IGNORE_ERRORS = [/^Script error\.?$/, /^Javascript error: Script error\.? on line 0$/];
/** Inbound filters configurable by the user */
var InboundFilters = /** @class */ (function () {
    function InboundFilters(_options) {
        if (_options === void 0) { _options = {}; }
        this._options = _options;
        /**
         * @inheritDoc
         */
        this.name = InboundFilters.id;
    }
    /**
     * @inheritDoc
     */
    InboundFilters.prototype.setupOnce = function () {
        hub_1.addGlobalEventProcessor(function (event) {
            var hub = hub_1.getCurrentHub();
            if (!hub) {
                return event;
            }
            var self = hub.getIntegration(InboundFilters);
            if (self) {
                var client = hub.getClient();
                var clientOptions = client ? client.getOptions() : {};
                var options = self._mergeOptions(clientOptions);
                if (self._shouldDropEvent(event, options)) {
                    return null;
                }
            }
            return event;
        });
    };
    /** JSDoc */
    InboundFilters.prototype._shouldDropEvent = function (event, options) {
        if (this._isSentryError(event, options)) {
            utils_1.logger.warn("Event dropped due to being internal Sentry Error.\nEvent: " + utils_1.getEventDescription(event));
            return true;
        }
        if (this._isIgnoredError(event, options)) {
            utils_1.logger.warn("Event dropped due to being matched by `ignoreErrors` option.\nEvent: " + utils_1.getEventDescription(event));
            return true;
        }
        if (this._isDeniedUrl(event, options)) {
            utils_1.logger.warn("Event dropped due to being matched by `denyUrls` option.\nEvent: " + utils_1.getEventDescription(event) + ".\nUrl: " + this._getEventFilterUrl(event));
            return true;
        }
        if (!this._isAllowedUrl(event, options)) {
            utils_1.logger.warn("Event dropped due to not being matched by `allowUrls` option.\nEvent: " + utils_1.getEventDescription(event) + ".\nUrl: " + this._getEventFilterUrl(event));
            return true;
        }
        return false;
    };
    /** JSDoc */
    InboundFilters.prototype._isSentryError = function (event, options) {
        if (!options.ignoreInternal) {
            return false;
        }
        try {
            return ((event &&
                event.exception &&
                event.exception.values &&
                event.exception.values[0] &&
                event.exception.values[0].type === 'SentryError') ||
                false);
        }
        catch (_oO) {
            return false;
        }
    };
    /** JSDoc */
    InboundFilters.prototype._isIgnoredError = function (event, options) {
        if (!options.ignoreErrors || !options.ignoreErrors.length) {
            return false;
        }
        return this._getPossibleEventMessages(event).some(function (message) {
            // Not sure why TypeScript complains here...
            return options.ignoreErrors.some(function (pattern) { return utils_1.isMatchingPattern(message, pattern); });
        });
    };
    /** JSDoc */
    InboundFilters.prototype._isDeniedUrl = function (event, options) {
        // TODO: Use Glob instead?
        if (!options.denyUrls || !options.denyUrls.length) {
            return false;
        }
        var url = this._getEventFilterUrl(event);
        return !url ? false : options.denyUrls.some(function (pattern) { return utils_1.isMatchingPattern(url, pattern); });
    };
    /** JSDoc */
    InboundFilters.prototype._isAllowedUrl = function (event, options) {
        // TODO: Use Glob instead?
        if (!options.allowUrls || !options.allowUrls.length) {
            return true;
        }
        var url = this._getEventFilterUrl(event);
        return !url ? true : options.allowUrls.some(function (pattern) { return utils_1.isMatchingPattern(url, pattern); });
    };
    /** JSDoc */
    InboundFilters.prototype._mergeOptions = function (clientOptions) {
        if (clientOptions === void 0) { clientOptions = {}; }
        return {
            allowUrls: tslib_1.__spread((this._options.whitelistUrls || []), (this._options.allowUrls || []), (clientOptions.whitelistUrls || []), (clientOptions.allowUrls || [])),
            denyUrls: tslib_1.__spread((this._options.blacklistUrls || []), (this._options.denyUrls || []), (clientOptions.blacklistUrls || []), (clientOptions.denyUrls || [])),
            ignoreErrors: tslib_1.__spread((this._options.ignoreErrors || []), (clientOptions.ignoreErrors || []), DEFAULT_IGNORE_ERRORS),
            ignoreInternal: typeof this._options.ignoreInternal !== 'undefined' ? this._options.ignoreInternal : true,
        };
    };
    /** JSDoc */
    InboundFilters.prototype._getPossibleEventMessages = function (event) {
        if (event.message) {
            return [event.message];
        }
        if (event.exception) {
            try {
                var _a = (event.exception.values && event.exception.values[0]) || {}, _b = _a.type, type = _b === void 0 ? '' : _b, _c = _a.value, value = _c === void 0 ? '' : _c;
                return ["" + value, type + ": " + value];
            }
            catch (oO) {
                utils_1.logger.error("Cannot extract message for event " + utils_1.getEventDescription(event));
                return [];
            }
        }
        return [];
    };
    /** JSDoc */
    InboundFilters.prototype._getEventFilterUrl = function (event) {
        try {
            if (event.stacktrace) {
                var frames_1 = event.stacktrace.frames;
                return (frames_1 && frames_1[frames_1.length - 1].filename) || null;
            }
            if (event.exception) {
                var frames_2 = event.exception.values && event.exception.values[0].stacktrace && event.exception.values[0].stacktrace.frames;
                return (frames_2 && frames_2[frames_2.length - 1].filename) || null;
            }
            return null;
        }
        catch (oO) {
            utils_1.logger.error("Cannot extract url for event " + utils_1.getEventDescription(event));
            return null;
        }
    };
    /**
     * @inheritDoc
     */
    InboundFilters.id = 'InboundFilters';
    return InboundFilters;
}());
exports.InboundFilters = InboundFilters;

},{"@sentry/hub":33,"@sentry/utils":43,"tslib":57}],28:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var functiontostring_1 = require("./functiontostring");
Object.defineProperty(exports, "FunctionToString", { enumerable: true, get: function () { return functiontostring_1.FunctionToString; } });
var inboundfilters_1 = require("./inboundfilters");
Object.defineProperty(exports, "InboundFilters", { enumerable: true, get: function () { return inboundfilters_1.InboundFilters; } });

},{"./functiontostring":26,"./inboundfilters":27}],29:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventToSentryRequest = void 0;
var utils_1 = require("@sentry/utils");
/** Creates a SentryRequest from an event. */
function eventToSentryRequest(event, api) {
    var useEnvelope = event.type === 'transaction';
    var req = {
        body: JSON.stringify(event),
        url: useEnvelope ? api.getEnvelopeEndpointWithUrlEncodedAuth() : api.getStoreEndpointWithUrlEncodedAuth(),
    };
    // https://develop.sentry.dev/sdk/envelopes/
    // Since we don't need to manipulate envelopes nor store them, there is no
    // exported concept of an Envelope with operations including serialization and
    // deserialization. Instead, we only implement a minimal subset of the spec to
    // serialize events inline here.
    if (useEnvelope) {
        var envelopeHeaders = JSON.stringify({
            event_id: event.event_id,
            // We need to add * 1000 since we divide it by 1000 by default but JS works with ms precision
            // The reason we use timestampWithMs here is that all clocks across the SDK use the same clock
            sent_at: new Date(utils_1.timestampWithMs() * 1000).toISOString(),
        });
        var itemHeaders = JSON.stringify({
            type: event.type,
        });
        // The trailing newline is optional. We intentionally don't send it to avoid
        // sending unnecessary bytes.
        //
        // const envelope = `${envelopeHeaders}\n${itemHeaders}\n${req.body}\n`;
        var envelope = envelopeHeaders + "\n" + itemHeaders + "\n" + req.body;
        req.body = envelope;
    }
    return req;
}
exports.eventToSentryRequest = eventToSentryRequest;

},{"@sentry/utils":43}],30:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAndBind = void 0;
var hub_1 = require("@sentry/hub");
var utils_1 = require("@sentry/utils");
/**
 * Internal function to create a new SDK client instance. The client is
 * installed and then bound to the current scope.
 *
 * @param clientClass The client class to instanciate.
 * @param options Options to pass to the client.
 */
function initAndBind(clientClass, options) {
    if (options.debug === true) {
        utils_1.logger.enable();
    }
    var hub = hub_1.getCurrentHub();
    var client = new clientClass(options);
    hub.bindClient(client);
}
exports.initAndBind = initAndBind;

},{"@sentry/hub":33,"@sentry/utils":43}],31:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoopTransport = void 0;
var types_1 = require("@sentry/types");
var utils_1 = require("@sentry/utils");
/** Noop transport */
var NoopTransport = /** @class */ (function () {
    function NoopTransport() {
    }
    /**
     * @inheritDoc
     */
    NoopTransport.prototype.sendEvent = function (_) {
        return utils_1.SyncPromise.resolve({
            reason: "NoopTransport: Event has been skipped because no Dsn is configured.",
            status: types_1.Status.Skipped,
        });
    };
    /**
     * @inheritDoc
     */
    NoopTransport.prototype.close = function (_) {
        return utils_1.SyncPromise.resolve(true);
    };
    return NoopTransport;
}());
exports.NoopTransport = NoopTransport;

},{"@sentry/types":36,"@sentry/utils":43}],32:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.setHubOnCarrier = exports.getHubFromCarrier = exports.getCurrentHub = exports.makeMain = exports.getMainCarrier = exports.Hub = exports.API_VERSION = void 0;
var tslib_1 = require("tslib");
var utils_1 = require("@sentry/utils");
var scope_1 = require("./scope");
/**
 * API compatibility version of this hub.
 *
 * WARNING: This number should only be incresed when the global interface
 * changes a and new methods are introduced.
 *
 * @hidden
 */
exports.API_VERSION = 3;
/**
 * Default maximum number of breadcrumbs added to an event. Can be overwritten
 * with {@link Options.maxBreadcrumbs}.
 */
var DEFAULT_BREADCRUMBS = 100;
/**
 * Absolute maximum number of breadcrumbs added to an event. The
 * `maxBreadcrumbs` option cannot be higher than this value.
 */
var MAX_BREADCRUMBS = 100;
/**
 * @inheritDoc
 */
var Hub = /** @class */ (function () {
    /**
     * Creates a new instance of the hub, will push one {@link Layer} into the
     * internal stack on creation.
     *
     * @param client bound to the hub.
     * @param scope bound to the hub.
     * @param version number, higher number means higher priority.
     */
    function Hub(client, scope, _version) {
        if (scope === void 0) { scope = new scope_1.Scope(); }
        if (_version === void 0) { _version = exports.API_VERSION; }
        this._version = _version;
        /** Is a {@link Layer}[] containing the client and scope */
        this._stack = [];
        this._stack.push({ client: client, scope: scope });
        this.bindClient(client);
    }
    /**
     * @inheritDoc
     */
    Hub.prototype.isOlderThan = function (version) {
        return this._version < version;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.bindClient = function (client) {
        var top = this.getStackTop();
        top.client = client;
        if (client && client.setupIntegrations) {
            client.setupIntegrations();
        }
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.pushScope = function () {
        // We want to clone the content of prev scope
        var stack = this.getStack();
        var parentScope = stack.length > 0 ? stack[stack.length - 1].scope : undefined;
        var scope = scope_1.Scope.clone(parentScope);
        this.getStack().push({
            client: this.getClient(),
            scope: scope,
        });
        return scope;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.popScope = function () {
        return this.getStack().pop() !== undefined;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.withScope = function (callback) {
        var scope = this.pushScope();
        try {
            callback(scope);
        }
        finally {
            this.popScope();
        }
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.getClient = function () {
        return this.getStackTop().client;
    };
    /** Returns the scope of the top stack. */
    Hub.prototype.getScope = function () {
        return this.getStackTop().scope;
    };
    /** Returns the scope stack for domains or the process. */
    Hub.prototype.getStack = function () {
        return this._stack;
    };
    /** Returns the topmost scope layer in the order domain > local > process. */
    Hub.prototype.getStackTop = function () {
        return this._stack[this._stack.length - 1];
    };
    /**
     * @inheritDoc
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    Hub.prototype.captureException = function (exception, hint) {
        var eventId = (this._lastEventId = utils_1.uuid4());
        var finalHint = hint;
        // If there's no explicit hint provided, mimick the same thing that would happen
        // in the minimal itself to create a consistent behavior.
        // We don't do this in the client, as it's the lowest level API, and doing this,
        // would prevent user from having full control over direct calls.
        if (!hint) {
            var syntheticException = void 0;
            try {
                throw new Error('Sentry syntheticException');
            }
            catch (exception) {
                syntheticException = exception;
            }
            finalHint = {
                originalException: exception,
                syntheticException: syntheticException,
            };
        }
        this._invokeClient('captureException', exception, tslib_1.__assign(tslib_1.__assign({}, finalHint), { event_id: eventId }));
        return eventId;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.captureMessage = function (message, level, hint) {
        var eventId = (this._lastEventId = utils_1.uuid4());
        var finalHint = hint;
        // If there's no explicit hint provided, mimick the same thing that would happen
        // in the minimal itself to create a consistent behavior.
        // We don't do this in the client, as it's the lowest level API, and doing this,
        // would prevent user from having full control over direct calls.
        if (!hint) {
            var syntheticException = void 0;
            try {
                throw new Error(message);
            }
            catch (exception) {
                syntheticException = exception;
            }
            finalHint = {
                originalException: message,
                syntheticException: syntheticException,
            };
        }
        this._invokeClient('captureMessage', message, level, tslib_1.__assign(tslib_1.__assign({}, finalHint), { event_id: eventId }));
        return eventId;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.captureEvent = function (event, hint) {
        var eventId = (this._lastEventId = utils_1.uuid4());
        this._invokeClient('captureEvent', event, tslib_1.__assign(tslib_1.__assign({}, hint), { event_id: eventId }));
        return eventId;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.lastEventId = function () {
        return this._lastEventId;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.addBreadcrumb = function (breadcrumb, hint) {
        var top = this.getStackTop();
        if (!top.scope || !top.client) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/unbound-method
        var _a = (top.client.getOptions && top.client.getOptions()) || {}, _b = _a.beforeBreadcrumb, beforeBreadcrumb = _b === void 0 ? null : _b, _c = _a.maxBreadcrumbs, maxBreadcrumbs = _c === void 0 ? DEFAULT_BREADCRUMBS : _c;
        if (maxBreadcrumbs <= 0) {
            return;
        }
        var timestamp = utils_1.timestampWithMs();
        var mergedBreadcrumb = tslib_1.__assign({ timestamp: timestamp }, breadcrumb);
        var finalBreadcrumb = beforeBreadcrumb
            ? utils_1.consoleSandbox(function () { return beforeBreadcrumb(mergedBreadcrumb, hint); })
            : mergedBreadcrumb;
        if (finalBreadcrumb === null) {
            return;
        }
        top.scope.addBreadcrumb(finalBreadcrumb, Math.min(maxBreadcrumbs, MAX_BREADCRUMBS));
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.setUser = function (user) {
        var top = this.getStackTop();
        if (!top.scope) {
            return;
        }
        top.scope.setUser(user);
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.setTags = function (tags) {
        var top = this.getStackTop();
        if (!top.scope) {
            return;
        }
        top.scope.setTags(tags);
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.setExtras = function (extras) {
        var top = this.getStackTop();
        if (!top.scope) {
            return;
        }
        top.scope.setExtras(extras);
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.setTag = function (key, value) {
        var top = this.getStackTop();
        if (!top.scope) {
            return;
        }
        top.scope.setTag(key, value);
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.setExtra = function (key, extra) {
        var top = this.getStackTop();
        if (!top.scope) {
            return;
        }
        top.scope.setExtra(key, extra);
    };
    /**
     * @inheritDoc
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Hub.prototype.setContext = function (name, context) {
        var top = this.getStackTop();
        if (!top.scope) {
            return;
        }
        top.scope.setContext(name, context);
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.configureScope = function (callback) {
        var top = this.getStackTop();
        if (top.scope && top.client) {
            callback(top.scope);
        }
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.run = function (callback) {
        var oldHub = makeMain(this);
        try {
            callback(this);
        }
        finally {
            makeMain(oldHub);
        }
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.getIntegration = function (integration) {
        var client = this.getClient();
        if (!client) {
            return null;
        }
        try {
            return client.getIntegration(integration);
        }
        catch (_oO) {
            utils_1.logger.warn("Cannot retrieve integration " + integration.id + " from the current Hub");
            return null;
        }
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.startSpan = function (context) {
        return this._callExtensionMethod('startSpan', context);
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.startTransaction = function (context) {
        return this._callExtensionMethod('startTransaction', context);
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.traceHeaders = function () {
        return this._callExtensionMethod('traceHeaders');
    };
    /**
     * Internal helper function to call a method on the top client if it exists.
     *
     * @param method The method to call on the client.
     * @param args Arguments to pass to the client function.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Hub.prototype._invokeClient = function (method) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var top = this.getStackTop();
        if (top && top.client && top.client[method]) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
            (_a = top.client)[method].apply(_a, tslib_1.__spread(args, [top.scope]));
        }
    };
    /**
     * Calls global extension method and binding current instance to the function call
     */
    // @ts-ignore Function lacks ending return statement and return type does not include 'undefined'. ts(2366)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Hub.prototype._callExtensionMethod = function (method) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var carrier = getMainCarrier();
        var sentry = carrier.__SENTRY__;
        if (sentry && sentry.extensions && typeof sentry.extensions[method] === 'function') {
            return sentry.extensions[method].apply(this, args);
        }
        utils_1.logger.warn("Extension method " + method + " couldn't be found, doing nothing.");
    };
    return Hub;
}());
exports.Hub = Hub;
/** Returns the global shim registry. */
function getMainCarrier() {
    var carrier = utils_1.getGlobalObject();
    carrier.__SENTRY__ = carrier.__SENTRY__ || {
        extensions: {},
        hub: undefined,
    };
    return carrier;
}
exports.getMainCarrier = getMainCarrier;
/**
 * Replaces the current main hub with the passed one on the global object
 *
 * @returns The old replaced hub
 */
function makeMain(hub) {
    var registry = getMainCarrier();
    var oldHub = getHubFromCarrier(registry);
    setHubOnCarrier(registry, hub);
    return oldHub;
}
exports.makeMain = makeMain;
/**
 * Returns the default hub instance.
 *
 * If a hub is already registered in the global carrier but this module
 * contains a more recent version, it replaces the registered version.
 * Otherwise, the currently registered hub will be returned.
 */
function getCurrentHub() {
    // Get main carrier (global for every environment)
    var registry = getMainCarrier();
    // If there's no hub, or its an old API, assign a new one
    if (!hasHubOnCarrier(registry) || getHubFromCarrier(registry).isOlderThan(exports.API_VERSION)) {
        setHubOnCarrier(registry, new Hub());
    }
    // Prefer domains over global if they are there (applicable only to Node environment)
    if (utils_1.isNodeEnv()) {
        return getHubFromActiveDomain(registry);
    }
    // Return hub that lives on a global object
    return getHubFromCarrier(registry);
}
exports.getCurrentHub = getCurrentHub;
/**
 * Try to read the hub from an active domain, fallback to the registry if one doesnt exist
 * @returns discovered hub
 */
function getHubFromActiveDomain(registry) {
    try {
        var property = 'domain';
        var carrier = getMainCarrier();
        var sentry = carrier.__SENTRY__;
        if (!sentry || !sentry.extensions || !sentry.extensions[property]) {
            return getHubFromCarrier(registry);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var domain = sentry.extensions[property];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        var activeDomain = domain.active;
        // If there no active domain, just return global hub
        if (!activeDomain) {
            return getHubFromCarrier(registry);
        }
        // If there's no hub on current domain, or its an old API, assign a new one
        if (!hasHubOnCarrier(activeDomain) || getHubFromCarrier(activeDomain).isOlderThan(exports.API_VERSION)) {
            var registryHubTopStack = getHubFromCarrier(registry).getStackTop();
            setHubOnCarrier(activeDomain, new Hub(registryHubTopStack.client, scope_1.Scope.clone(registryHubTopStack.scope)));
        }
        // Return hub that lives on a domain
        return getHubFromCarrier(activeDomain);
    }
    catch (_Oo) {
        // Return hub that lives on a global object
        return getHubFromCarrier(registry);
    }
}
/**
 * This will tell whether a carrier has a hub on it or not
 * @param carrier object
 */
function hasHubOnCarrier(carrier) {
    if (carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub) {
        return true;
    }
    return false;
}
/**
 * This will create a new {@link Hub} and add to the passed object on
 * __SENTRY__.hub.
 * @param carrier object
 * @hidden
 */
function getHubFromCarrier(carrier) {
    if (carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub) {
        return carrier.__SENTRY__.hub;
    }
    carrier.__SENTRY__ = carrier.__SENTRY__ || {};
    carrier.__SENTRY__.hub = new Hub();
    return carrier.__SENTRY__.hub;
}
exports.getHubFromCarrier = getHubFromCarrier;
/**
 * This will set passed {@link Hub} on the passed object's __SENTRY__.hub attribute
 * @param carrier object
 * @param hub Hub
 */
function setHubOnCarrier(carrier, hub) {
    if (!carrier) {
        return false;
    }
    carrier.__SENTRY__ = carrier.__SENTRY__ || {};
    carrier.__SENTRY__.hub = hub;
    return true;
}
exports.setHubOnCarrier = setHubOnCarrier;

},{"./scope":34,"@sentry/utils":43,"tslib":57}],33:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var scope_1 = require("./scope");
Object.defineProperty(exports, "addGlobalEventProcessor", { enumerable: true, get: function () { return scope_1.addGlobalEventProcessor; } });
Object.defineProperty(exports, "Scope", { enumerable: true, get: function () { return scope_1.Scope; } });
var hub_1 = require("./hub");
Object.defineProperty(exports, "getCurrentHub", { enumerable: true, get: function () { return hub_1.getCurrentHub; } });
Object.defineProperty(exports, "getHubFromCarrier", { enumerable: true, get: function () { return hub_1.getHubFromCarrier; } });
Object.defineProperty(exports, "getMainCarrier", { enumerable: true, get: function () { return hub_1.getMainCarrier; } });
Object.defineProperty(exports, "Hub", { enumerable: true, get: function () { return hub_1.Hub; } });
Object.defineProperty(exports, "makeMain", { enumerable: true, get: function () { return hub_1.makeMain; } });
Object.defineProperty(exports, "setHubOnCarrier", { enumerable: true, get: function () { return hub_1.setHubOnCarrier; } });

},{"./hub":32,"./scope":34}],34:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGlobalEventProcessor = exports.Scope = void 0;
var tslib_1 = require("tslib");
var utils_1 = require("@sentry/utils");
/**
 * Holds additional event information. {@link Scope.applyToEvent} will be
 * called by the client before an event will be sent.
 */
var Scope = /** @class */ (function () {
    function Scope() {
        /** Flag if notifiying is happening. */
        this._notifyingListeners = false;
        /** Callback for client to receive scope changes. */
        this._scopeListeners = [];
        /** Callback list that will be called after {@link applyToEvent}. */
        this._eventProcessors = [];
        /** Array of breadcrumbs. */
        this._breadcrumbs = [];
        /** User */
        this._user = {};
        /** Tags */
        this._tags = {};
        /** Extra */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._extra = {};
        /** Contexts */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._contexts = {};
    }
    /**
     * Inherit values from the parent scope.
     * @param scope to clone.
     */
    Scope.clone = function (scope) {
        var newScope = new Scope();
        if (scope) {
            newScope._breadcrumbs = tslib_1.__spread(scope._breadcrumbs);
            newScope._tags = tslib_1.__assign({}, scope._tags);
            newScope._extra = tslib_1.__assign({}, scope._extra);
            newScope._contexts = tslib_1.__assign({}, scope._contexts);
            newScope._user = scope._user;
            newScope._level = scope._level;
            newScope._span = scope._span;
            newScope._transactionName = scope._transactionName;
            newScope._fingerprint = scope._fingerprint;
            newScope._eventProcessors = tslib_1.__spread(scope._eventProcessors);
        }
        return newScope;
    };
    /**
     * Add internal on change listener. Used for sub SDKs that need to store the scope.
     * @hidden
     */
    Scope.prototype.addScopeListener = function (callback) {
        this._scopeListeners.push(callback);
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.addEventProcessor = function (callback) {
        this._eventProcessors.push(callback);
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setUser = function (user) {
        this._user = user || {};
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setTags = function (tags) {
        this._tags = tslib_1.__assign(tslib_1.__assign({}, this._tags), tags);
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setTag = function (key, value) {
        var _a;
        this._tags = tslib_1.__assign(tslib_1.__assign({}, this._tags), (_a = {}, _a[key] = value, _a));
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setExtras = function (extras) {
        this._extra = tslib_1.__assign(tslib_1.__assign({}, this._extra), extras);
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setExtra = function (key, extra) {
        var _a;
        this._extra = tslib_1.__assign(tslib_1.__assign({}, this._extra), (_a = {}, _a[key] = extra, _a));
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setFingerprint = function (fingerprint) {
        this._fingerprint = fingerprint;
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setLevel = function (level) {
        this._level = level;
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setTransactionName = function (name) {
        this._transactionName = name;
        this._notifyScopeListeners();
        return this;
    };
    /**
     * Can be removed in major version.
     * @deprecated in favor of {@link this.setTransactionName}
     */
    Scope.prototype.setTransaction = function (name) {
        return this.setTransactionName(name);
    };
    /**
     * @inheritDoc
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Scope.prototype.setContext = function (key, context) {
        var _a;
        this._contexts = tslib_1.__assign(tslib_1.__assign({}, this._contexts), (_a = {}, _a[key] = context, _a));
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setSpan = function (span) {
        this._span = span;
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.getSpan = function () {
        return this._span;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.getTransaction = function () {
        var span = this.getSpan();
        if (span && span.spanRecorder && span.spanRecorder.spans[0]) {
            return span.spanRecorder.spans[0];
        }
        return undefined;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.update = function (captureContext) {
        if (!captureContext) {
            return this;
        }
        if (typeof captureContext === 'function') {
            var updatedScope = captureContext(this);
            return updatedScope instanceof Scope ? updatedScope : this;
        }
        if (captureContext instanceof Scope) {
            this._tags = tslib_1.__assign(tslib_1.__assign({}, this._tags), captureContext._tags);
            this._extra = tslib_1.__assign(tslib_1.__assign({}, this._extra), captureContext._extra);
            this._contexts = tslib_1.__assign(tslib_1.__assign({}, this._contexts), captureContext._contexts);
            if (captureContext._user) {
                this._user = captureContext._user;
            }
            if (captureContext._level) {
                this._level = captureContext._level;
            }
            if (captureContext._fingerprint) {
                this._fingerprint = captureContext._fingerprint;
            }
        }
        else if (utils_1.isPlainObject(captureContext)) {
            // eslint-disable-next-line no-param-reassign
            captureContext = captureContext;
            this._tags = tslib_1.__assign(tslib_1.__assign({}, this._tags), captureContext.tags);
            this._extra = tslib_1.__assign(tslib_1.__assign({}, this._extra), captureContext.extra);
            this._contexts = tslib_1.__assign(tslib_1.__assign({}, this._contexts), captureContext.contexts);
            if (captureContext.user) {
                this._user = captureContext.user;
            }
            if (captureContext.level) {
                this._level = captureContext.level;
            }
            if (captureContext.fingerprint) {
                this._fingerprint = captureContext.fingerprint;
            }
        }
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.clear = function () {
        this._breadcrumbs = [];
        this._tags = {};
        this._extra = {};
        this._user = {};
        this._contexts = {};
        this._level = undefined;
        this._transactionName = undefined;
        this._fingerprint = undefined;
        this._span = undefined;
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.addBreadcrumb = function (breadcrumb, maxBreadcrumbs) {
        var mergedBreadcrumb = tslib_1.__assign({ timestamp: utils_1.timestampWithMs() }, breadcrumb);
        this._breadcrumbs =
            maxBreadcrumbs !== undefined && maxBreadcrumbs >= 0
                ? tslib_1.__spread(this._breadcrumbs, [mergedBreadcrumb]).slice(-maxBreadcrumbs)
                : tslib_1.__spread(this._breadcrumbs, [mergedBreadcrumb]);
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.clearBreadcrumbs = function () {
        this._breadcrumbs = [];
        this._notifyScopeListeners();
        return this;
    };
    /**
     * Applies the current context and fingerprint to the event.
     * Note that breadcrumbs will be added by the client.
     * Also if the event has already breadcrumbs on it, we do not merge them.
     * @param event Event
     * @param hint May contain additional informartion about the original exception.
     * @hidden
     */
    Scope.prototype.applyToEvent = function (event, hint) {
        if (this._extra && Object.keys(this._extra).length) {
            event.extra = tslib_1.__assign(tslib_1.__assign({}, this._extra), event.extra);
        }
        if (this._tags && Object.keys(this._tags).length) {
            event.tags = tslib_1.__assign(tslib_1.__assign({}, this._tags), event.tags);
        }
        if (this._user && Object.keys(this._user).length) {
            event.user = tslib_1.__assign(tslib_1.__assign({}, this._user), event.user);
        }
        if (this._contexts && Object.keys(this._contexts).length) {
            event.contexts = tslib_1.__assign(tslib_1.__assign({}, this._contexts), event.contexts);
        }
        if (this._level) {
            event.level = this._level;
        }
        if (this._transactionName) {
            event.transaction = this._transactionName;
        }
        // We want to set the trace context for normal events only if there isn't already
        // a trace context on the event. There is a product feature in place where we link
        // errors with transaction and it relys on that.
        if (this._span) {
            event.contexts = tslib_1.__assign({ trace: this._span.getTraceContext() }, event.contexts);
        }
        this._applyFingerprint(event);
        event.breadcrumbs = tslib_1.__spread((event.breadcrumbs || []), this._breadcrumbs);
        event.breadcrumbs = event.breadcrumbs.length > 0 ? event.breadcrumbs : undefined;
        return this._notifyEventProcessors(tslib_1.__spread(getGlobalEventProcessors(), this._eventProcessors), event, hint);
    };
    /**
     * This will be called after {@link applyToEvent} is finished.
     */
    Scope.prototype._notifyEventProcessors = function (processors, event, hint, index) {
        var _this = this;
        if (index === void 0) { index = 0; }
        return new utils_1.SyncPromise(function (resolve, reject) {
            var processor = processors[index];
            if (event === null || typeof processor !== 'function') {
                resolve(event);
            }
            else {
                var result = processor(tslib_1.__assign({}, event), hint);
                if (utils_1.isThenable(result)) {
                    result
                        .then(function (final) { return _this._notifyEventProcessors(processors, final, hint, index + 1).then(resolve); })
                        .then(null, reject);
                }
                else {
                    _this._notifyEventProcessors(processors, result, hint, index + 1)
                        .then(resolve)
                        .then(null, reject);
                }
            }
        });
    };
    /**
     * This will be called on every set call.
     */
    Scope.prototype._notifyScopeListeners = function () {
        var _this = this;
        if (!this._notifyingListeners) {
            this._notifyingListeners = true;
            setTimeout(function () {
                _this._scopeListeners.forEach(function (callback) {
                    callback(_this);
                });
                _this._notifyingListeners = false;
            });
        }
    };
    /**
     * Applies fingerprint from the scope to the event if there's one,
     * uses message if there's one instead or get rid of empty fingerprint
     */
    Scope.prototype._applyFingerprint = function (event) {
        // Make sure it's an array first and we actually have something in place
        event.fingerprint = event.fingerprint
            ? Array.isArray(event.fingerprint)
                ? event.fingerprint
                : [event.fingerprint]
            : [];
        // If we have something on the scope, then merge it with event
        if (this._fingerprint) {
            event.fingerprint = event.fingerprint.concat(this._fingerprint);
        }
        // If we have no data at all, remove empty array default
        if (event.fingerprint && !event.fingerprint.length) {
            delete event.fingerprint;
        }
    };
    return Scope;
}());
exports.Scope = Scope;
/**
 * Retruns the global event processors.
 */
function getGlobalEventProcessors() {
    var global = utils_1.getGlobalObject();
    global.__SENTRY__ = global.__SENTRY__ || {};
    global.__SENTRY__.globalEventProcessors = global.__SENTRY__.globalEventProcessors || [];
    return global.__SENTRY__.globalEventProcessors;
}
/**
 * Add a EventProcessor to be kept globally.
 * @param callback EventProcessor to add
 */
function addGlobalEventProcessor(callback) {
    getGlobalEventProcessors().push(callback);
}
exports.addGlobalEventProcessor = addGlobalEventProcessor;

},{"@sentry/utils":43,"tslib":57}],35:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTransaction = exports._callOnClient = exports.withScope = exports.setUser = exports.setTag = exports.setExtra = exports.setTags = exports.setExtras = exports.setContext = exports.addBreadcrumb = exports.configureScope = exports.captureEvent = exports.captureMessage = exports.captureException = void 0;
var tslib_1 = require("tslib");
var hub_1 = require("@sentry/hub");
/**
 * This calls a function on the current hub.
 * @param method function to call on hub.
 * @param args to pass to function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function callOnHub(method) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var hub = hub_1.getCurrentHub();
    if (hub && hub[method]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return hub[method].apply(hub, tslib_1.__spread(args));
    }
    throw new Error("No hub defined or " + method + " was not found on the hub, please open a bug report.");
}
/**
 * Captures an exception event and sends it to Sentry.
 *
 * @param exception An exception-like object.
 * @returns The generated eventId.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
function captureException(exception, captureContext) {
    var syntheticException;
    try {
        throw new Error('Sentry syntheticException');
    }
    catch (exception) {
        syntheticException = exception;
    }
    return callOnHub('captureException', exception, {
        captureContext: captureContext,
        originalException: exception,
        syntheticException: syntheticException,
    });
}
exports.captureException = captureException;
/**
 * Captures a message event and sends it to Sentry.
 *
 * @param message The message to send to Sentry.
 * @param level Define the level of the message.
 * @returns The generated eventId.
 */
function captureMessage(message, captureContext) {
    var syntheticException;
    try {
        throw new Error(message);
    }
    catch (exception) {
        syntheticException = exception;
    }
    // This is necessary to provide explicit scopes upgrade, without changing the original
    // arrity of the `captureMessage(message, level)` method.
    var level = typeof captureContext === 'string' ? captureContext : undefined;
    var context = typeof captureContext !== 'string' ? { captureContext: captureContext } : undefined;
    return callOnHub('captureMessage', message, level, tslib_1.__assign({ originalException: message, syntheticException: syntheticException }, context));
}
exports.captureMessage = captureMessage;
/**
 * Captures a manually created event and sends it to Sentry.
 *
 * @param event The event to send to Sentry.
 * @returns The generated eventId.
 */
function captureEvent(event) {
    return callOnHub('captureEvent', event);
}
exports.captureEvent = captureEvent;
/**
 * Callback to set context information onto the scope.
 * @param callback Callback function that receives Scope.
 */
function configureScope(callback) {
    callOnHub('configureScope', callback);
}
exports.configureScope = configureScope;
/**
 * Records a new breadcrumb which will be attached to future events.
 *
 * Breadcrumbs will be added to subsequent events to provide more context on
 * user's actions prior to an error or crash.
 *
 * @param breadcrumb The breadcrumb to record.
 */
function addBreadcrumb(breadcrumb) {
    callOnHub('addBreadcrumb', breadcrumb);
}
exports.addBreadcrumb = addBreadcrumb;
/**
 * Sets context data with the given name.
 * @param name of the context
 * @param context Any kind of data. This data will be normalized.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setContext(name, context) {
    callOnHub('setContext', name, context);
}
exports.setContext = setContext;
/**
 * Set an object that will be merged sent as extra data with the event.
 * @param extras Extras object to merge into current context.
 */
function setExtras(extras) {
    callOnHub('setExtras', extras);
}
exports.setExtras = setExtras;
/**
 * Set an object that will be merged sent as tags data with the event.
 * @param tags Tags context object to merge into current context.
 */
function setTags(tags) {
    callOnHub('setTags', tags);
}
exports.setTags = setTags;
/**
 * Set key:value that will be sent as extra data with the event.
 * @param key String of extra
 * @param extra Any kind of data. This data will be normalized.
 */
function setExtra(key, extra) {
    callOnHub('setExtra', key, extra);
}
exports.setExtra = setExtra;
/**
 * Set key:value that will be sent as tags data with the event.
 * @param key String key of tag
 * @param value String value of tag
 */
function setTag(key, value) {
    callOnHub('setTag', key, value);
}
exports.setTag = setTag;
/**
 * Updates user context information for future events.
 *
 * @param user User context object to be set in the current context. Pass `null` to unset the user.
 */
function setUser(user) {
    callOnHub('setUser', user);
}
exports.setUser = setUser;
/**
 * Creates a new scope with and executes the given operation within.
 * The scope is automatically removed once the operation
 * finishes or throws.
 *
 * This is essentially a convenience function for:
 *
 *     pushScope();
 *     callback();
 *     popScope();
 *
 * @param callback that will be enclosed into push/popScope.
 */
function withScope(callback) {
    callOnHub('withScope', callback);
}
exports.withScope = withScope;
/**
 * Calls a function on the latest client. Use this with caution, it's meant as
 * in "internal" helper so we don't need to expose every possible function in
 * the shim. It is not guaranteed that the client actually implements the
 * function.
 *
 * @param method The method to call on the client/client.
 * @param args Arguments to pass to the client/fontend.
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _callOnClient(method) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    callOnHub.apply(void 0, tslib_1.__spread(['_invokeClient', method], args));
}
exports._callOnClient = _callOnClient;
/**
 * Starts a new `Transaction` and returns it. This is the entry point to manual
 * tracing instrumentation.
 *
 * A tree structure can be built by adding child spans to the transaction, and
 * child spans to other spans. To start a new child span within the transaction
 * or any span, call the respective `.startChild()` method.
 *
 * Every child span must be finished before the transaction is finished,
 * otherwise the unfinished spans are discarded.
 *
 * The transaction must be finished with a call to its `.finish()` method, at
 * which point the transaction with all its finished child spans will be sent to
 * Sentry.
 *
 * @param context Properties of the new `Transaction`.
 */
function startTransaction(context) {
    return callOnHub('startTransaction', tslib_1.__assign({}, context));
}
exports.startTransaction = startTransaction;

},{"@sentry/hub":33,"tslib":57}],36:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var loglevel_1 = require("./loglevel");
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return loglevel_1.LogLevel; } });
var severity_1 = require("./severity");
Object.defineProperty(exports, "Severity", { enumerable: true, get: function () { return severity_1.Severity; } });
var status_1 = require("./status");
Object.defineProperty(exports, "Status", { enumerable: true, get: function () { return status_1.Status; } });

},{"./loglevel":37,"./severity":38,"./status":39}],37:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = void 0;
/** Console logging verbosity for the SDK. */
var LogLevel;
(function (LogLevel) {
    /** No logs will be generated. */
    LogLevel[LogLevel["None"] = 0] = "None";
    /** Only SDK internal errors will be logged. */
    LogLevel[LogLevel["Error"] = 1] = "Error";
    /** Information useful for debugging the SDK will be logged. */
    LogLevel[LogLevel["Debug"] = 2] = "Debug";
    /** All SDK actions will be logged. */
    LogLevel[LogLevel["Verbose"] = 3] = "Verbose";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));

},{}],38:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.Severity = void 0;
/** JSDoc */
// eslint-disable-next-line import/export
var Severity;
(function (Severity) {
    /** JSDoc */
    Severity["Fatal"] = "fatal";
    /** JSDoc */
    Severity["Error"] = "error";
    /** JSDoc */
    Severity["Warning"] = "warning";
    /** JSDoc */
    Severity["Log"] = "log";
    /** JSDoc */
    Severity["Info"] = "info";
    /** JSDoc */
    Severity["Debug"] = "debug";
    /** JSDoc */
    Severity["Critical"] = "critical";
})(Severity = exports.Severity || (exports.Severity = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace, import/export
(function (Severity) {
    /**
     * Converts a string-based level into a {@link Severity}.
     *
     * @param level string representation of Severity
     * @returns Severity
     */
    function fromString(level) {
        switch (level) {
            case 'debug':
                return Severity.Debug;
            case 'info':
                return Severity.Info;
            case 'warn':
            case 'warning':
                return Severity.Warning;
            case 'error':
                return Severity.Error;
            case 'fatal':
                return Severity.Fatal;
            case 'critical':
                return Severity.Critical;
            case 'log':
            default:
                return Severity.Log;
        }
    }
    Severity.fromString = fromString;
})(Severity = exports.Severity || (exports.Severity = {}));

},{}],39:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
/** The status of an event. */
// eslint-disable-next-line import/export
var Status;
(function (Status) {
    /** The status could not be determined. */
    Status["Unknown"] = "unknown";
    /** The event was skipped due to configuration or callbacks. */
    Status["Skipped"] = "skipped";
    /** The event was sent to Sentry successfully. */
    Status["Success"] = "success";
    /** The client is currently rate limited and will try again later. */
    Status["RateLimit"] = "rate_limit";
    /** The event could not be processed. */
    Status["Invalid"] = "invalid";
    /** A server-side error ocurred during submission. */
    Status["Failed"] = "failed";
})(Status = exports.Status || (exports.Status = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace, import/export
(function (Status) {
    /**
     * Converts a HTTP status code into a {@link Status}.
     *
     * @param code The HTTP response status code.
     * @returns The send status or {@link Status.Unknown}.
     */
    function fromHttpCode(code) {
        if (code >= 200 && code < 300) {
            return Status.Success;
        }
        if (code === 429) {
            return Status.RateLimit;
        }
        if (code >= 400 && code < 500) {
            return Status.Invalid;
        }
        if (code >= 500) {
            return Status.Failed;
        }
        return Status.Unknown;
    }
    Status.fromHttpCode = fromHttpCode;
})(Status = exports.Status || (exports.Status = {}));

},{}],40:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.forget = void 0;
/**
 * Consumes the promise and logs the error when it rejects.
 * @param promise A promise to forget.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function forget(promise) {
    promise.then(null, function (e) {
        // TODO: Use a better logging mechanism
        // eslint-disable-next-line no-console
        console.error(e);
    });
}
exports.forget = forget;

},{}],41:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dsn = void 0;
var tslib_1 = require("tslib");
var error_1 = require("./error");
/** Regular expression used to parse a Dsn. */
var DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+))?@)([\w.-]+)(?::(\d+))?\/(.+)/;
/** Error message */
var ERROR_MESSAGE = 'Invalid Dsn';
/** The Sentry Dsn, identifying a Sentry instance and project. */
var Dsn = /** @class */ (function () {
    /** Creates a new Dsn component */
    function Dsn(from) {
        if (typeof from === 'string') {
            this._fromString(from);
        }
        else {
            this._fromComponents(from);
        }
        this._validate();
    }
    /**
     * Renders the string representation of this Dsn.
     *
     * By default, this will render the public representation without the password
     * component. To get the deprecated private representation, set `withPassword`
     * to true.
     *
     * @param withPassword When set to true, the password will be included.
     */
    Dsn.prototype.toString = function (withPassword) {
        if (withPassword === void 0) { withPassword = false; }
        var _a = this, host = _a.host, path = _a.path, pass = _a.pass, port = _a.port, projectId = _a.projectId, protocol = _a.protocol, user = _a.user;
        return (protocol + "://" + user + (withPassword && pass ? ":" + pass : '') +
            ("@" + host + (port ? ":" + port : '') + "/" + (path ? path + "/" : path) + projectId));
    };
    /** Parses a string into this Dsn. */
    Dsn.prototype._fromString = function (str) {
        var match = DSN_REGEX.exec(str);
        if (!match) {
            throw new error_1.SentryError(ERROR_MESSAGE);
        }
        var _a = tslib_1.__read(match.slice(1), 6), protocol = _a[0], user = _a[1], _b = _a[2], pass = _b === void 0 ? '' : _b, host = _a[3], _c = _a[4], port = _c === void 0 ? '' : _c, lastPath = _a[5];
        var path = '';
        var projectId = lastPath;
        var split = projectId.split('/');
        if (split.length > 1) {
            path = split.slice(0, -1).join('/');
            projectId = split.pop();
        }
        if (projectId) {
            var projectMatch = projectId.match(/^\d+/);
            if (projectMatch) {
                projectId = projectMatch[0];
            }
        }
        this._fromComponents({ host: host, pass: pass, path: path, projectId: projectId, port: port, protocol: protocol, user: user });
    };
    /** Maps Dsn components into this instance. */
    Dsn.prototype._fromComponents = function (components) {
        this.protocol = components.protocol;
        this.user = components.user;
        this.pass = components.pass || '';
        this.host = components.host;
        this.port = components.port || '';
        this.path = components.path || '';
        this.projectId = components.projectId;
    };
    /** Validates this Dsn and throws on error. */
    Dsn.prototype._validate = function () {
        var _this = this;
        ['protocol', 'user', 'host', 'projectId'].forEach(function (component) {
            if (!_this[component]) {
                throw new error_1.SentryError(ERROR_MESSAGE + ": " + component + " missing");
            }
        });
        if (!this.projectId.match(/^\d+$/)) {
            throw new error_1.SentryError(ERROR_MESSAGE + ": Invalid projectId " + this.projectId);
        }
        if (this.protocol !== 'http' && this.protocol !== 'https') {
            throw new error_1.SentryError(ERROR_MESSAGE + ": Invalid protocol " + this.protocol);
        }
        if (this.port && isNaN(parseInt(this.port, 10))) {
            throw new error_1.SentryError(ERROR_MESSAGE + ": Invalid port " + this.port);
        }
    };
    return Dsn;
}());
exports.Dsn = Dsn;

},{"./error":42,"tslib":57}],42:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentryError = void 0;
var tslib_1 = require("tslib");
var polyfill_1 = require("./polyfill");
/** An error emitted by Sentry SDKs and related utilities. */
var SentryError = /** @class */ (function (_super) {
    tslib_1.__extends(SentryError, _super);
    function SentryError(message) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        _this.message = message;
        _this.name = _newTarget.prototype.constructor.name;
        polyfill_1.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return SentryError;
}(Error));
exports.SentryError = SentryError;

},{"./polyfill":51,"tslib":57}],43:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./async"), exports);
tslib_1.__exportStar(require("./error"), exports);
tslib_1.__exportStar(require("./is"), exports);
tslib_1.__exportStar(require("./logger"), exports);
tslib_1.__exportStar(require("./memo"), exports);
tslib_1.__exportStar(require("./misc"), exports);
tslib_1.__exportStar(require("./object"), exports);
tslib_1.__exportStar(require("./path"), exports);
tslib_1.__exportStar(require("./promisebuffer"), exports);
tslib_1.__exportStar(require("./string"), exports);
tslib_1.__exportStar(require("./supports"), exports);
tslib_1.__exportStar(require("./syncpromise"), exports);
tslib_1.__exportStar(require("./instrument"), exports);
tslib_1.__exportStar(require("./dsn"), exports);

},{"./async":40,"./dsn":41,"./error":42,"./instrument":44,"./is":45,"./logger":46,"./memo":47,"./misc":48,"./object":49,"./path":50,"./promisebuffer":52,"./string":53,"./supports":54,"./syncpromise":55,"tslib":57}],44:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.addInstrumentationHandler = void 0;
var tslib_1 = require("tslib");
var is_1 = require("./is");
var logger_1 = require("./logger");
var misc_1 = require("./misc");
var object_1 = require("./object");
var supports_1 = require("./supports");
var global = misc_1.getGlobalObject();
/**
 * Instrument native APIs to call handlers that can be used to create breadcrumbs, APM spans etc.
 *  - Console API
 *  - Fetch API
 *  - XHR API
 *  - History API
 *  - DOM API (click/typing)
 *  - Error API
 *  - UnhandledRejection API
 */
var handlers = {};
var instrumented = {};
/** Instruments given API */
function instrument(type) {
    if (instrumented[type]) {
        return;
    }
    instrumented[type] = true;
    switch (type) {
        case 'console':
            instrumentConsole();
            break;
        case 'dom':
            instrumentDOM();
            break;
        case 'xhr':
            instrumentXHR();
            break;
        case 'fetch':
            instrumentFetch();
            break;
        case 'history':
            instrumentHistory();
            break;
        case 'error':
            instrumentError();
            break;
        case 'unhandledrejection':
            instrumentUnhandledRejection();
            break;
        default:
            logger_1.logger.warn('unknown instrumentation type:', type);
    }
}
/**
 * Add handler that will be called when given type of instrumentation triggers.
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addInstrumentationHandler(handler) {
    if (!handler || typeof handler.type !== 'string' || typeof handler.callback !== 'function') {
        return;
    }
    handlers[handler.type] = handlers[handler.type] || [];
    handlers[handler.type].push(handler.callback);
    instrument(handler.type);
}
exports.addInstrumentationHandler = addInstrumentationHandler;
/** JSDoc */
function triggerHandlers(type, data) {
    var e_1, _a;
    if (!type || !handlers[type]) {
        return;
    }
    try {
        for (var _b = tslib_1.__values(handlers[type] || []), _c = _b.next(); !_c.done; _c = _b.next()) {
            var handler = _c.value;
            try {
                handler(data);
            }
            catch (e) {
                logger_1.logger.error("Error while triggering instrumentation handler.\nType: " + type + "\nName: " + misc_1.getFunctionName(handler) + "\nError: " + e);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
/** JSDoc */
function instrumentConsole() {
    if (!('console' in global)) {
        return;
    }
    ['debug', 'info', 'warn', 'error', 'log', 'assert'].forEach(function (level) {
        if (!(level in global.console)) {
            return;
        }
        object_1.fill(global.console, level, function (originalConsoleLevel) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                triggerHandlers('console', { args: args, level: level });
                // this fails for some browsers. :(
                if (originalConsoleLevel) {
                    Function.prototype.apply.call(originalConsoleLevel, global.console, args);
                }
            };
        });
    });
}
/** JSDoc */
function instrumentFetch() {
    if (!supports_1.supportsNativeFetch()) {
        return;
    }
    object_1.fill(global, 'fetch', function (originalFetch) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var commonHandlerData = {
                args: args,
                fetchData: {
                    method: getFetchMethod(args),
                    url: getFetchUrl(args),
                },
                startTimestamp: Date.now(),
            };
            triggerHandlers('fetch', tslib_1.__assign({}, commonHandlerData));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return originalFetch.apply(global, args).then(function (response) {
                triggerHandlers('fetch', tslib_1.__assign(tslib_1.__assign({}, commonHandlerData), { endTimestamp: Date.now(), response: response }));
                return response;
            }, function (error) {
                triggerHandlers('fetch', tslib_1.__assign(tslib_1.__assign({}, commonHandlerData), { endTimestamp: Date.now(), error: error }));
                // NOTE: If you are a Sentry user, and you are seeing this stack frame,
                //       it means the sentry.javascript SDK caught an error invoking your application code.
                //       This is expected behavior and NOT indicative of a bug with sentry.javascript.
                throw error;
            });
        };
    });
}
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/** Extract `method` from fetch call arguments */
function getFetchMethod(fetchArgs) {
    if (fetchArgs === void 0) { fetchArgs = []; }
    if ('Request' in global && is_1.isInstanceOf(fetchArgs[0], Request) && fetchArgs[0].method) {
        return String(fetchArgs[0].method).toUpperCase();
    }
    if (fetchArgs[1] && fetchArgs[1].method) {
        return String(fetchArgs[1].method).toUpperCase();
    }
    return 'GET';
}
/** Extract `url` from fetch call arguments */
function getFetchUrl(fetchArgs) {
    if (fetchArgs === void 0) { fetchArgs = []; }
    if (typeof fetchArgs[0] === 'string') {
        return fetchArgs[0];
    }
    if ('Request' in global && is_1.isInstanceOf(fetchArgs[0], Request)) {
        return fetchArgs[0].url;
    }
    return String(fetchArgs[0]);
}
/* eslint-enable @typescript-eslint/no-unsafe-member-access */
/** JSDoc */
function instrumentXHR() {
    if (!('XMLHttpRequest' in global)) {
        return;
    }
    var xhrproto = XMLHttpRequest.prototype;
    object_1.fill(xhrproto, 'open', function (originalOpen) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            var xhr = this;
            var url = args[1];
            xhr.__sentry_xhr__ = {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                method: is_1.isString(args[0]) ? args[0].toUpperCase() : args[0],
                url: args[1],
            };
            // if Sentry key appears in URL, don't capture it as a request
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (is_1.isString(url) && xhr.__sentry_xhr__.method === 'POST' && url.match(/sentry_key/)) {
                xhr.__sentry_own_request__ = true;
            }
            var onreadystatechangeHandler = function () {
                if (xhr.readyState === 4) {
                    try {
                        // touching statusCode in some platforms throws
                        // an exception
                        if (xhr.__sentry_xhr__) {
                            xhr.__sentry_xhr__.status_code = xhr.status;
                        }
                    }
                    catch (e) {
                        /* do nothing */
                    }
                    triggerHandlers('xhr', {
                        args: args,
                        endTimestamp: Date.now(),
                        startTimestamp: Date.now(),
                        xhr: xhr,
                    });
                }
            };
            if ('onreadystatechange' in xhr && typeof xhr.onreadystatechange === 'function') {
                object_1.fill(xhr, 'onreadystatechange', function (original) {
                    return function () {
                        var readyStateArgs = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            readyStateArgs[_i] = arguments[_i];
                        }
                        onreadystatechangeHandler();
                        return original.apply(xhr, readyStateArgs);
                    };
                });
            }
            else {
                xhr.addEventListener('readystatechange', onreadystatechangeHandler);
            }
            return originalOpen.apply(xhr, args);
        };
    });
    object_1.fill(xhrproto, 'send', function (originalSend) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            triggerHandlers('xhr', {
                args: args,
                startTimestamp: Date.now(),
                xhr: this,
            });
            return originalSend.apply(this, args);
        };
    });
}
var lastHref;
/** JSDoc */
function instrumentHistory() {
    if (!supports_1.supportsHistory()) {
        return;
    }
    var oldOnPopState = global.onpopstate;
    global.onpopstate = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var to = global.location.href;
        // keep track of the current URL state, as we always receive only the updated state
        var from = lastHref;
        lastHref = to;
        triggerHandlers('history', {
            from: from,
            to: to,
        });
        if (oldOnPopState) {
            return oldOnPopState.apply(this, args);
        }
    };
    /** @hidden */
    function historyReplacementFunction(originalHistoryFunction) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var url = args.length > 2 ? args[2] : undefined;
            if (url) {
                // coerce to string (this is what pushState does)
                var from = lastHref;
                var to = String(url);
                // keep track of the current URL state, as we always receive only the updated state
                lastHref = to;
                triggerHandlers('history', {
                    from: from,
                    to: to,
                });
            }
            return originalHistoryFunction.apply(this, args);
        };
    }
    object_1.fill(global.history, 'pushState', historyReplacementFunction);
    object_1.fill(global.history, 'replaceState', historyReplacementFunction);
}
/** JSDoc */
function instrumentDOM() {
    if (!('document' in global)) {
        return;
    }
    // Capture breadcrumbs from any click that is unhandled / bubbled up all the way
    // to the document. Do this before we instrument addEventListener.
    global.document.addEventListener('click', domEventHandler('click', triggerHandlers.bind(null, 'dom')), false);
    global.document.addEventListener('keypress', keypressEventHandler(triggerHandlers.bind(null, 'dom')), false);
    // After hooking into document bubbled up click and keypresses events, we also hook into user handled click & keypresses.
    ['EventTarget', 'Node'].forEach(function (target) {
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        var proto = global[target] && global[target].prototype;
        // eslint-disable-next-line no-prototype-builtins
        if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
            return;
        }
        /* eslint-enable @typescript-eslint/no-unsafe-member-access */
        object_1.fill(proto, 'addEventListener', function (original) {
            return function (eventName, fn, options) {
                if (fn && fn.handleEvent) {
                    if (eventName === 'click') {
                        object_1.fill(fn, 'handleEvent', function (innerOriginal) {
                            return function (event) {
                                domEventHandler('click', triggerHandlers.bind(null, 'dom'))(event);
                                return innerOriginal.call(this, event);
                            };
                        });
                    }
                    if (eventName === 'keypress') {
                        object_1.fill(fn, 'handleEvent', function (innerOriginal) {
                            return function (event) {
                                keypressEventHandler(triggerHandlers.bind(null, 'dom'))(event);
                                return innerOriginal.call(this, event);
                            };
                        });
                    }
                }
                else {
                    if (eventName === 'click') {
                        domEventHandler('click', triggerHandlers.bind(null, 'dom'), true)(this);
                    }
                    if (eventName === 'keypress') {
                        keypressEventHandler(triggerHandlers.bind(null, 'dom'))(this);
                    }
                }
                return original.call(this, eventName, fn, options);
            };
        });
        object_1.fill(proto, 'removeEventListener', function (original) {
            return function (eventName, fn, options) {
                try {
                    original.call(this, eventName, fn.__sentry_wrapped__, options);
                }
                catch (e) {
                    // ignore, accessing __sentry_wrapped__ will throw in some Selenium environments
                }
                return original.call(this, eventName, fn, options);
            };
        });
    });
}
var debounceDuration = 1000;
var debounceTimer = 0;
var keypressTimeout;
var lastCapturedEvent;
/**
 * Wraps addEventListener to capture UI breadcrumbs
 * @param name the event name (e.g. "click")
 * @param handler function that will be triggered
 * @param debounce decides whether it should wait till another event loop
 * @returns wrapped breadcrumb events handler
 * @hidden
 */
function domEventHandler(name, handler, debounce) {
    if (debounce === void 0) { debounce = false; }
    return function (event) {
        // reset keypress timeout; e.g. triggering a 'click' after
        // a 'keypress' will reset the keypress debounce so that a new
        // set of keypresses can be recorded
        keypressTimeout = undefined;
        // It's possible this handler might trigger multiple times for the same
        // event (e.g. event propagation through node ancestors). Ignore if we've
        // already captured the event.
        if (!event || lastCapturedEvent === event) {
            return;
        }
        lastCapturedEvent = event;
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        if (debounce) {
            debounceTimer = setTimeout(function () {
                handler({ event: event, name: name });
            });
        }
        else {
            handler({ event: event, name: name });
        }
    };
}
/**
 * Wraps addEventListener to capture keypress UI events
 * @param handler function that will be triggered
 * @returns wrapped keypress events handler
 * @hidden
 */
function keypressEventHandler(handler) {
    // TODO: if somehow user switches keypress target before
    //       debounce timeout is triggered, we will only capture
    //       a single breadcrumb from the FIRST target (acceptable?)
    return function (event) {
        var target;
        try {
            target = event.target;
        }
        catch (e) {
            // just accessing event properties can throw an exception in some rare circumstances
            // see: https://github.com/getsentry/raven-js/issues/838
            return;
        }
        var tagName = target && target.tagName;
        // only consider keypress events on actual input elements
        // this will disregard keypresses targeting body (e.g. tabbing
        // through elements, hotkeys, etc)
        if (!tagName || (tagName !== 'INPUT' && tagName !== 'TEXTAREA' && !target.isContentEditable)) {
            return;
        }
        // record first keypress in a series, but ignore subsequent
        // keypresses until debounce clears
        if (!keypressTimeout) {
            domEventHandler('input', handler)(event);
        }
        clearTimeout(keypressTimeout);
        keypressTimeout = setTimeout(function () {
            keypressTimeout = undefined;
        }, debounceDuration);
    };
}
var _oldOnErrorHandler = null;
/** JSDoc */
function instrumentError() {
    _oldOnErrorHandler = global.onerror;
    global.onerror = function (msg, url, line, column, error) {
        triggerHandlers('error', {
            column: column,
            error: error,
            line: line,
            msg: msg,
            url: url,
        });
        if (_oldOnErrorHandler) {
            // eslint-disable-next-line prefer-rest-params
            return _oldOnErrorHandler.apply(this, arguments);
        }
        return false;
    };
}
var _oldOnUnhandledRejectionHandler = null;
/** JSDoc */
function instrumentUnhandledRejection() {
    _oldOnUnhandledRejectionHandler = global.onunhandledrejection;
    global.onunhandledrejection = function (e) {
        triggerHandlers('unhandledrejection', e);
        if (_oldOnUnhandledRejectionHandler) {
            // eslint-disable-next-line prefer-rest-params
            return _oldOnUnhandledRejectionHandler.apply(this, arguments);
        }
        return true;
    };
}

},{"./is":45,"./logger":46,"./misc":48,"./object":49,"./supports":54,"tslib":57}],45:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInstanceOf = exports.isSyntheticEvent = exports.isThenable = exports.isRegExp = exports.isElement = exports.isEvent = exports.isPlainObject = exports.isPrimitive = exports.isString = exports.isDOMException = exports.isDOMError = exports.isErrorEvent = exports.isError = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/**
 * Checks whether given value's type is one of a few Error or Error-like
 * {@link isError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isError(wat) {
    switch (Object.prototype.toString.call(wat)) {
        case '[object Error]':
            return true;
        case '[object Exception]':
            return true;
        case '[object DOMException]':
            return true;
        default:
            return isInstanceOf(wat, Error);
    }
}
exports.isError = isError;
/**
 * Checks whether given value's type is ErrorEvent
 * {@link isErrorEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isErrorEvent(wat) {
    return Object.prototype.toString.call(wat) === '[object ErrorEvent]';
}
exports.isErrorEvent = isErrorEvent;
/**
 * Checks whether given value's type is DOMError
 * {@link isDOMError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isDOMError(wat) {
    return Object.prototype.toString.call(wat) === '[object DOMError]';
}
exports.isDOMError = isDOMError;
/**
 * Checks whether given value's type is DOMException
 * {@link isDOMException}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isDOMException(wat) {
    return Object.prototype.toString.call(wat) === '[object DOMException]';
}
exports.isDOMException = isDOMException;
/**
 * Checks whether given value's type is a string
 * {@link isString}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isString(wat) {
    return Object.prototype.toString.call(wat) === '[object String]';
}
exports.isString = isString;
/**
 * Checks whether given value's is a primitive (undefined, null, number, boolean, string)
 * {@link isPrimitive}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isPrimitive(wat) {
    return wat === null || (typeof wat !== 'object' && typeof wat !== 'function');
}
exports.isPrimitive = isPrimitive;
/**
 * Checks whether given value's type is an object literal
 * {@link isPlainObject}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isPlainObject(wat) {
    return Object.prototype.toString.call(wat) === '[object Object]';
}
exports.isPlainObject = isPlainObject;
/**
 * Checks whether given value's type is an Event instance
 * {@link isEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isEvent(wat) {
    return typeof Event !== 'undefined' && isInstanceOf(wat, Event);
}
exports.isEvent = isEvent;
/**
 * Checks whether given value's type is an Element instance
 * {@link isElement}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isElement(wat) {
    return typeof Element !== 'undefined' && isInstanceOf(wat, Element);
}
exports.isElement = isElement;
/**
 * Checks whether given value's type is an regexp
 * {@link isRegExp}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isRegExp(wat) {
    return Object.prototype.toString.call(wat) === '[object RegExp]';
}
exports.isRegExp = isRegExp;
/**
 * Checks whether given value has a then function.
 * @param wat A value to be checked.
 */
function isThenable(wat) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return Boolean(wat && wat.then && typeof wat.then === 'function');
}
exports.isThenable = isThenable;
/**
 * Checks whether given value's type is a SyntheticEvent
 * {@link isSyntheticEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isSyntheticEvent(wat) {
    return isPlainObject(wat) && 'nativeEvent' in wat && 'preventDefault' in wat && 'stopPropagation' in wat;
}
exports.isSyntheticEvent = isSyntheticEvent;
/**
 * Checks whether given value's type is an instance of provided constructor.
 * {@link isInstanceOf}.
 *
 * @param wat A value to be checked.
 * @param base A constructor to be used in a check.
 * @returns A boolean representing the result.
 */
function isInstanceOf(wat, base) {
    try {
        return wat instanceof base;
    }
    catch (_e) {
        return false;
    }
}
exports.isInstanceOf = isInstanceOf;

},{}],46:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
var misc_1 = require("./misc");
// TODO: Implement different loggers for different environments
var global = misc_1.getGlobalObject();
/** Prefix for logging strings */
var PREFIX = 'Sentry Logger ';
/** JSDoc */
var Logger = /** @class */ (function () {
    /** JSDoc */
    function Logger() {
        this._enabled = false;
    }
    /** JSDoc */
    Logger.prototype.disable = function () {
        this._enabled = false;
    };
    /** JSDoc */
    Logger.prototype.enable = function () {
        this._enabled = true;
    };
    /** JSDoc */
    Logger.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this._enabled) {
            return;
        }
        misc_1.consoleSandbox(function () {
            global.console.log(PREFIX + "[Log]: " + args.join(' '));
        });
    };
    /** JSDoc */
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this._enabled) {
            return;
        }
        misc_1.consoleSandbox(function () {
            global.console.warn(PREFIX + "[Warn]: " + args.join(' '));
        });
    };
    /** JSDoc */
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this._enabled) {
            return;
        }
        misc_1.consoleSandbox(function () {
            global.console.error(PREFIX + "[Error]: " + args.join(' '));
        });
    };
    return Logger;
}());
// Ensure we only have a single logger instance, even if multiple versions of @sentry/utils are being used
global.__SENTRY__ = global.__SENTRY__ || {};
var logger = global.__SENTRY__.logger || (global.__SENTRY__.logger = new Logger());
exports.logger = logger;

},{"./misc":48}],47:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memo = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/**
 * Memo class used for decycle json objects. Uses WeakSet if available otherwise array.
 */
var Memo = /** @class */ (function () {
    function Memo() {
        this._hasWeakSet = typeof WeakSet === 'function';
        this._inner = this._hasWeakSet ? new WeakSet() : [];
    }
    /**
     * Sets obj to remember.
     * @param obj Object to remember
     */
    Memo.prototype.memoize = function (obj) {
        if (this._hasWeakSet) {
            if (this._inner.has(obj)) {
                return true;
            }
            this._inner.add(obj);
            return false;
        }
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (var i = 0; i < this._inner.length; i++) {
            var value = this._inner[i];
            if (value === obj) {
                return true;
            }
        }
        this._inner.push(obj);
        return false;
    };
    /**
     * Removes object from internal storage.
     * @param obj Object to forget
     */
    Memo.prototype.unmemoize = function (obj) {
        if (this._hasWeakSet) {
            this._inner.delete(obj);
        }
        else {
            for (var i = 0; i < this._inner.length; i++) {
                if (this._inner[i] === obj) {
                    this._inner.splice(i, 1);
                    break;
                }
            }
        }
    };
    return Memo;
}());
exports.Memo = Memo;

},{}],48:[function(require,module,exports){
(function (process,global){
Object.defineProperty(exports, "__esModule", { value: true });
exports.addContextToFrame = exports.getFunctionName = exports.parseRetryAfterHeader = exports.parseSemver = exports.timestampWithMs = exports.crossPlatformPerformance = exports.htmlTreeAsString = exports.getLocationHref = exports.addExceptionMechanism = exports.addExceptionTypeValue = exports.consoleSandbox = exports.getEventDescription = exports.parseUrl = exports.uuid4 = exports.getGlobalObject = exports.isNodeEnv = exports.dynamicRequire = void 0;
var is_1 = require("./is");
var string_1 = require("./string");
/**
 * Requires a module which is protected against bundler minification.
 *
 * @param request The module path to resolve
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function dynamicRequire(mod, request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return mod.require(request);
}
exports.dynamicRequire = dynamicRequire;
/**
 * Checks whether we're in the Node.js or Browser environment
 *
 * @returns Answer to given question
 */
function isNodeEnv() {
    return Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
}
exports.isNodeEnv = isNodeEnv;
var fallbackGlobalObject = {};
/**
 * Safely get global scope object
 *
 * @returns Global scope object
 */
function getGlobalObject() {
    return (isNodeEnv()
        ? global
        : typeof window !== 'undefined'
            ? window
            : typeof self !== 'undefined'
                ? self
                : fallbackGlobalObject);
}
exports.getGlobalObject = getGlobalObject;
/**
 * UUID4 generator
 *
 * @returns string Generated UUID4.
 */
function uuid4() {
    var global = getGlobalObject();
    var crypto = global.crypto || global.msCrypto;
    if (!(crypto === void 0) && crypto.getRandomValues) {
        // Use window.crypto API if available
        var arr = new Uint16Array(8);
        crypto.getRandomValues(arr);
        // set 4 in byte 7
        // eslint-disable-next-line no-bitwise
        arr[3] = (arr[3] & 0xfff) | 0x4000;
        // set 2 most significant bits of byte 9 to '10'
        // eslint-disable-next-line no-bitwise
        arr[4] = (arr[4] & 0x3fff) | 0x8000;
        var pad = function (num) {
            var v = num.toString(16);
            while (v.length < 4) {
                v = "0" + v;
            }
            return v;
        };
        return (pad(arr[0]) + pad(arr[1]) + pad(arr[2]) + pad(arr[3]) + pad(arr[4]) + pad(arr[5]) + pad(arr[6]) + pad(arr[7]));
    }
    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        // eslint-disable-next-line no-bitwise
        var r = (Math.random() * 16) | 0;
        // eslint-disable-next-line no-bitwise
        var v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
exports.uuid4 = uuid4;
/**
 * Parses string form of URL into an object
 * // borrowed from https://tools.ietf.org/html/rfc3986#appendix-B
 * // intentionally using regex and not <a/> href parsing trick because React Native and other
 * // environments where DOM might not be available
 * @returns parsed URL object
 */
function parseUrl(url) {
    if (!url) {
        return {};
    }
    var match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
    if (!match) {
        return {};
    }
    // coerce to undefined values to empty string so we don't get 'undefined'
    var query = match[6] || '';
    var fragment = match[8] || '';
    return {
        host: match[4],
        path: match[5],
        protocol: match[2],
        relative: match[5] + query + fragment,
    };
}
exports.parseUrl = parseUrl;
/**
 * Extracts either message or type+value from an event that can be used for user-facing logs
 * @returns event's description
 */
function getEventDescription(event) {
    if (event.message) {
        return event.message;
    }
    if (event.exception && event.exception.values && event.exception.values[0]) {
        var exception = event.exception.values[0];
        if (exception.type && exception.value) {
            return exception.type + ": " + exception.value;
        }
        return exception.type || exception.value || event.event_id || '<unknown>';
    }
    return event.event_id || '<unknown>';
}
exports.getEventDescription = getEventDescription;
/** JSDoc */
function consoleSandbox(callback) {
    var global = getGlobalObject();
    var levels = ['debug', 'info', 'warn', 'error', 'log', 'assert'];
    if (!('console' in global)) {
        return callback();
    }
    var originalConsole = global.console;
    var wrappedLevels = {};
    // Restore all wrapped console methods
    levels.forEach(function (level) {
        if (level in global.console && originalConsole[level].__sentry_original__) {
            wrappedLevels[level] = originalConsole[level];
            originalConsole[level] = originalConsole[level].__sentry_original__;
        }
    });
    // Perform callback manipulations
    var result = callback();
    // Revert restoration to wrapped state
    Object.keys(wrappedLevels).forEach(function (level) {
        originalConsole[level] = wrappedLevels[level];
    });
    return result;
}
exports.consoleSandbox = consoleSandbox;
/**
 * Adds exception values, type and value to an synthetic Exception.
 * @param event The event to modify.
 * @param value Value of the exception.
 * @param type Type of the exception.
 * @hidden
 */
function addExceptionTypeValue(event, value, type) {
    event.exception = event.exception || {};
    event.exception.values = event.exception.values || [];
    event.exception.values[0] = event.exception.values[0] || {};
    event.exception.values[0].value = event.exception.values[0].value || value || '';
    event.exception.values[0].type = event.exception.values[0].type || type || 'Error';
}
exports.addExceptionTypeValue = addExceptionTypeValue;
/**
 * Adds exception mechanism to a given event.
 * @param event The event to modify.
 * @param mechanism Mechanism of the mechanism.
 * @hidden
 */
function addExceptionMechanism(event, mechanism) {
    if (mechanism === void 0) { mechanism = {}; }
    // TODO: Use real type with `keyof Mechanism` thingy and maybe make it better?
    try {
        // @ts-ignore Type 'Mechanism | {}' is not assignable to type 'Mechanism | undefined'
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        event.exception.values[0].mechanism = event.exception.values[0].mechanism || {};
        Object.keys(mechanism).forEach(function (key) {
            // @ts-ignore Mechanism has no index signature
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            event.exception.values[0].mechanism[key] = mechanism[key];
        });
    }
    catch (_oO) {
        // no-empty
    }
}
exports.addExceptionMechanism = addExceptionMechanism;
/**
 * A safe form of location.href
 */
function getLocationHref() {
    try {
        return document.location.href;
    }
    catch (oO) {
        return '';
    }
}
exports.getLocationHref = getLocationHref;
/**
 * Given a child DOM element, returns a query-selector statement describing that
 * and its ancestors
 * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
 * @returns generated DOM path
 */
function htmlTreeAsString(elem) {
    // try/catch both:
    // - accessing event.target (see getsentry/raven-js#838, #768)
    // - `htmlTreeAsString` because it's complex, and just accessing the DOM incorrectly
    // - can throw an exception in some circumstances.
    try {
        var currentElem = elem;
        var MAX_TRAVERSE_HEIGHT = 5;
        var MAX_OUTPUT_LEN = 80;
        var out = [];
        var height = 0;
        var len = 0;
        var separator = ' > ';
        var sepLength = separator.length;
        var nextStr = void 0;
        // eslint-disable-next-line no-plusplus
        while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
            nextStr = _htmlElementAsString(currentElem);
            // bail out if
            // - nextStr is the 'html' element
            // - the length of the string that would be created exceeds MAX_OUTPUT_LEN
            //   (ignore this limit if we are on the first iteration)
            if (nextStr === 'html' || (height > 1 && len + out.length * sepLength + nextStr.length >= MAX_OUTPUT_LEN)) {
                break;
            }
            out.push(nextStr);
            len += nextStr.length;
            currentElem = currentElem.parentNode;
        }
        return out.reverse().join(separator);
    }
    catch (_oO) {
        return '<unknown>';
    }
}
exports.htmlTreeAsString = htmlTreeAsString;
/**
 * Returns a simple, query-selector representation of a DOM element
 * e.g. [HTMLElement] => input#foo.btn[name=baz]
 * @returns generated DOM path
 */
function _htmlElementAsString(el) {
    var elem = el;
    var out = [];
    var className;
    var classes;
    var key;
    var attr;
    var i;
    if (!elem || !elem.tagName) {
        return '';
    }
    out.push(elem.tagName.toLowerCase());
    if (elem.id) {
        out.push("#" + elem.id);
    }
    // eslint-disable-next-line prefer-const
    className = elem.className;
    if (className && is_1.isString(className)) {
        classes = className.split(/\s+/);
        for (i = 0; i < classes.length; i++) {
            out.push("." + classes[i]);
        }
    }
    var allowedAttrs = ['type', 'name', 'title', 'alt'];
    for (i = 0; i < allowedAttrs.length; i++) {
        key = allowedAttrs[i];
        attr = elem.getAttribute(key);
        if (attr) {
            out.push("[" + key + "=\"" + attr + "\"]");
        }
    }
    return out.join('');
}
var INITIAL_TIME = Date.now();
var prevNow = 0;
var performanceFallback = {
    now: function () {
        var now = Date.now() - INITIAL_TIME;
        if (now < prevNow) {
            now = prevNow;
        }
        prevNow = now;
        return now;
    },
    timeOrigin: INITIAL_TIME,
};
exports.crossPlatformPerformance = (function () {
    if (isNodeEnv()) {
        try {
            var perfHooks = dynamicRequire(module, 'perf_hooks');
            return perfHooks.performance;
        }
        catch (_) {
            return performanceFallback;
        }
    }
    var performance = getGlobalObject().performance;
    if (!performance || !performance.now) {
        return performanceFallback;
    }
    // Polyfill for performance.timeOrigin.
    //
    // While performance.timing.navigationStart is deprecated in favor of performance.timeOrigin, performance.timeOrigin
    // is not as widely supported. Namely, performance.timeOrigin is undefined in Safari as of writing.
    if (performance.timeOrigin === undefined) {
        // As of writing, performance.timing is not available in Web Workers in mainstream browsers, so it is not always a
        // valid fallback. In the absence of a initial time provided by the browser, fallback to INITIAL_TIME.
        // @ts-ignore ignored because timeOrigin is a readonly property but we want to override
        // eslint-disable-next-line deprecation/deprecation
        performance.timeOrigin = (performance.timing && performance.timing.navigationStart) || INITIAL_TIME;
    }
    return performance;
})();
/**
 * Returns a timestamp in seconds with milliseconds precision since the UNIX epoch calculated with the monotonic clock.
 */
function timestampWithMs() {
    return (exports.crossPlatformPerformance.timeOrigin + exports.crossPlatformPerformance.now()) / 1000;
}
exports.timestampWithMs = timestampWithMs;
// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
var SEMVER_REGEXP = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
/**
 * Parses input into a SemVer interface
 * @param input string representation of a semver version
 */
function parseSemver(input) {
    var match = input.match(SEMVER_REGEXP) || [];
    var major = parseInt(match[1], 10);
    var minor = parseInt(match[2], 10);
    var patch = parseInt(match[3], 10);
    return {
        buildmetadata: match[5],
        major: isNaN(major) ? undefined : major,
        minor: isNaN(minor) ? undefined : minor,
        patch: isNaN(patch) ? undefined : patch,
        prerelease: match[4],
    };
}
exports.parseSemver = parseSemver;
var defaultRetryAfter = 60 * 1000; // 60 seconds
/**
 * Extracts Retry-After value from the request header or returns default value
 * @param now current unix timestamp
 * @param header string representation of 'Retry-After' header
 */
function parseRetryAfterHeader(now, header) {
    if (!header) {
        return defaultRetryAfter;
    }
    var headerDelay = parseInt("" + header, 10);
    if (!isNaN(headerDelay)) {
        return headerDelay * 1000;
    }
    var headerDate = Date.parse("" + header);
    if (!isNaN(headerDate)) {
        return headerDate - now;
    }
    return defaultRetryAfter;
}
exports.parseRetryAfterHeader = parseRetryAfterHeader;
var defaultFunctionName = '<anonymous>';
/**
 * Safely extract function name from itself
 */
function getFunctionName(fn) {
    try {
        if (!fn || typeof fn !== 'function') {
            return defaultFunctionName;
        }
        return fn.name || defaultFunctionName;
    }
    catch (e) {
        // Just accessing custom props in some Selenium environments
        // can cause a "Permission denied" exception (see raven-js#495).
        return defaultFunctionName;
    }
}
exports.getFunctionName = getFunctionName;
/**
 * This function adds context (pre/post/line) lines to the provided frame
 *
 * @param lines string[] containing all lines
 * @param frame StackFrame that will be mutated
 * @param linesOfContext number of context lines we want to add pre/post
 */
function addContextToFrame(lines, frame, linesOfContext) {
    if (linesOfContext === void 0) { linesOfContext = 5; }
    var lineno = frame.lineno || 0;
    var maxLines = lines.length;
    var sourceLine = Math.max(Math.min(maxLines, lineno - 1), 0);
    frame.pre_context = lines
        .slice(Math.max(0, sourceLine - linesOfContext), sourceLine)
        .map(function (line) { return string_1.snipLine(line, 0); });
    frame.context_line = string_1.snipLine(lines[Math.min(maxLines - 1, sourceLine)], frame.colno || 0);
    frame.post_context = lines
        .slice(Math.min(sourceLine + 1, maxLines), sourceLine + 1 + linesOfContext)
        .map(function (line) { return string_1.snipLine(line, 0); });
}
exports.addContextToFrame = addContextToFrame;

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./is":45,"./string":53,"_process":56}],49:[function(require,module,exports){
(function (global){
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropUndefinedKeys = exports.extractExceptionKeysForMessage = exports.normalize = exports.walk = exports.normalizeToSize = exports.urlEncode = exports.fill = void 0;
var tslib_1 = require("tslib");
var is_1 = require("./is");
var memo_1 = require("./memo");
var misc_1 = require("./misc");
var string_1 = require("./string");
/**
 * Wrap a given object method with a higher-order function
 *
 * @param source An object that contains a method to be wrapped.
 * @param name A name of method to be wrapped.
 * @param replacement A function that should be used to wrap a given method.
 * @returns void
 */
function fill(source, name, replacement) {
    if (!(name in source)) {
        return;
    }
    var original = source[name];
    var wrapped = replacement(original);
    // Make sure it's a function first, as we need to attach an empty prototype for `defineProperties` to work
    // otherwise it'll throw "TypeError: Object.defineProperties called on non-object"
    if (typeof wrapped === 'function') {
        try {
            wrapped.prototype = wrapped.prototype || {};
            Object.defineProperties(wrapped, {
                __sentry_original__: {
                    enumerable: false,
                    value: original,
                },
            });
        }
        catch (_Oo) {
            // This can throw if multiple fill happens on a global object like XMLHttpRequest
            // Fixes https://github.com/getsentry/sentry-javascript/issues/2043
        }
    }
    source[name] = wrapped;
}
exports.fill = fill;
/**
 * Encodes given object into url-friendly format
 *
 * @param object An object that contains serializable values
 * @returns string Encoded
 */
function urlEncode(object) {
    return Object.keys(object)
        .map(function (key) { return encodeURIComponent(key) + "=" + encodeURIComponent(object[key]); })
        .join('&');
}
exports.urlEncode = urlEncode;
/**
 * Transforms any object into an object literal with all it's attributes
 * attached to it.
 *
 * @param value Initial source that we have to transform in order to be usable by the serializer
 */
function getWalkSource(value) {
    if (is_1.isError(value)) {
        var error = value;
        var err = {
            message: error.message,
            name: error.name,
            stack: error.stack,
        };
        for (var i in error) {
            if (Object.prototype.hasOwnProperty.call(error, i)) {
                err[i] = error[i];
            }
        }
        return err;
    }
    if (is_1.isEvent(value)) {
        var event_1 = value;
        var source = {};
        source.type = event_1.type;
        // Accessing event.target can throw (see getsentry/raven-js#838, #768)
        try {
            source.target = is_1.isElement(event_1.target)
                ? misc_1.htmlTreeAsString(event_1.target)
                : Object.prototype.toString.call(event_1.target);
        }
        catch (_oO) {
            source.target = '<unknown>';
        }
        try {
            source.currentTarget = is_1.isElement(event_1.currentTarget)
                ? misc_1.htmlTreeAsString(event_1.currentTarget)
                : Object.prototype.toString.call(event_1.currentTarget);
        }
        catch (_oO) {
            source.currentTarget = '<unknown>';
        }
        if (typeof CustomEvent !== 'undefined' && is_1.isInstanceOf(value, CustomEvent)) {
            source.detail = event_1.detail;
        }
        for (var i in event_1) {
            if (Object.prototype.hasOwnProperty.call(event_1, i)) {
                source[i] = event_1;
            }
        }
        return source;
    }
    return value;
}
/** Calculates bytes size of input string */
function utf8Length(value) {
    // eslint-disable-next-line no-bitwise
    return ~-encodeURI(value).split(/%..|./).length;
}
/** Calculates bytes size of input object */
function jsonSize(value) {
    return utf8Length(JSON.stringify(value));
}
/** JSDoc */
function normalizeToSize(object, 
// Default Node.js REPL depth
depth, 
// 100kB, as 200kB is max payload size, so half sounds reasonable
maxSize) {
    if (depth === void 0) { depth = 3; }
    if (maxSize === void 0) { maxSize = 100 * 1024; }
    var serialized = normalize(object, depth);
    if (jsonSize(serialized) > maxSize) {
        return normalizeToSize(object, depth - 1, maxSize);
    }
    return serialized;
}
exports.normalizeToSize = normalizeToSize;
/** Transforms any input value into a string form, either primitive value or a type of the input */
function serializeValue(value) {
    var type = Object.prototype.toString.call(value);
    // Node.js REPL notation
    if (typeof value === 'string') {
        return value;
    }
    if (type === '[object Object]') {
        return '[Object]';
    }
    if (type === '[object Array]') {
        return '[Array]';
    }
    var normalized = normalizeValue(value);
    return is_1.isPrimitive(normalized) ? normalized : type;
}
/**
 * normalizeValue()
 *
 * Takes unserializable input and make it serializable friendly
 *
 * - translates undefined/NaN values to "[undefined]"/"[NaN]" respectively,
 * - serializes Error objects
 * - filter global objects
 */
function normalizeValue(value, key) {
    if (key === 'domain' && value && typeof value === 'object' && value._events) {
        return '[Domain]';
    }
    if (key === 'domainEmitter') {
        return '[DomainEmitter]';
    }
    if (typeof global !== 'undefined' && value === global) {
        return '[Global]';
    }
    if (typeof window !== 'undefined' && value === window) {
        return '[Window]';
    }
    if (typeof document !== 'undefined' && value === document) {
        return '[Document]';
    }
    // React's SyntheticEvent thingy
    if (is_1.isSyntheticEvent(value)) {
        return '[SyntheticEvent]';
    }
    if (typeof value === 'number' && value !== value) {
        return '[NaN]';
    }
    if (value === void 0) {
        return '[undefined]';
    }
    if (typeof value === 'function') {
        return "[Function: " + misc_1.getFunctionName(value) + "]";
    }
    return value;
}
/**
 * Walks an object to perform a normalization on it
 *
 * @param key of object that's walked in current iteration
 * @param value object to be walked
 * @param depth Optional number indicating how deep should walking be performed
 * @param memo Optional Memo class handling decycling
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function walk(key, value, depth, memo) {
    if (depth === void 0) { depth = +Infinity; }
    if (memo === void 0) { memo = new memo_1.Memo(); }
    // If we reach the maximum depth, serialize whatever has left
    if (depth === 0) {
        return serializeValue(value);
    }
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    // If value implements `toJSON` method, call it and return early
    if (value !== null && value !== undefined && typeof value.toJSON === 'function') {
        return value.toJSON();
    }
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
    // If normalized value is a primitive, there are no branches left to walk, so we can just bail out, as theres no point in going down that branch any further
    var normalized = normalizeValue(value, key);
    if (is_1.isPrimitive(normalized)) {
        return normalized;
    }
    // Create source that we will use for next itterations, either objectified error object (Error type with extracted keys:value pairs) or the input itself
    var source = getWalkSource(value);
    // Create an accumulator that will act as a parent for all future itterations of that branch
    var acc = Array.isArray(value) ? [] : {};
    // If we already walked that branch, bail out, as it's circular reference
    if (memo.memoize(value)) {
        return '[Circular ~]';
    }
    // Walk all keys of the source
    for (var innerKey in source) {
        // Avoid iterating over fields in the prototype if they've somehow been exposed to enumeration.
        if (!Object.prototype.hasOwnProperty.call(source, innerKey)) {
            continue;
        }
        // Recursively walk through all the child nodes
        acc[innerKey] = walk(innerKey, source[innerKey], depth - 1, memo);
    }
    // Once walked through all the branches, remove the parent from memo storage
    memo.unmemoize(value);
    // Return accumulated values
    return acc;
}
exports.walk = walk;
/**
 * normalize()
 *
 * - Creates a copy to prevent original input mutation
 * - Skip non-enumerablers
 * - Calls `toJSON` if implemented
 * - Removes circular references
 * - Translates non-serializeable values (undefined/NaN/Functions) to serializable format
 * - Translates known global objects/Classes to a string representations
 * - Takes care of Error objects serialization
 * - Optionally limit depth of final output
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function normalize(input, depth) {
    try {
        return JSON.parse(JSON.stringify(input, function (key, value) { return walk(key, value, depth); }));
    }
    catch (_oO) {
        return '**non-serializable**';
    }
}
exports.normalize = normalize;
/**
 * Given any captured exception, extract its keys and create a sorted
 * and truncated list that will be used inside the event message.
 * eg. `Non-error exception captured with keys: foo, bar, baz`
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function extractExceptionKeysForMessage(exception, maxLength) {
    if (maxLength === void 0) { maxLength = 40; }
    var keys = Object.keys(getWalkSource(exception));
    keys.sort();
    if (!keys.length) {
        return '[object has no keys]';
    }
    if (keys[0].length >= maxLength) {
        return string_1.truncate(keys[0], maxLength);
    }
    for (var includedKeys = keys.length; includedKeys > 0; includedKeys--) {
        var serialized = keys.slice(0, includedKeys).join(', ');
        if (serialized.length > maxLength) {
            continue;
        }
        if (includedKeys === keys.length) {
            return serialized;
        }
        return string_1.truncate(serialized, maxLength);
    }
    return '';
}
exports.extractExceptionKeysForMessage = extractExceptionKeysForMessage;
/**
 * Given any object, return the new object with removed keys that value was `undefined`.
 * Works recursively on objects and arrays.
 */
function dropUndefinedKeys(val) {
    var e_1, _a;
    if (is_1.isPlainObject(val)) {
        var obj = val;
        var rv = {};
        try {
            for (var _b = tslib_1.__values(Object.keys(obj)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if (typeof obj[key] !== 'undefined') {
                    rv[key] = dropUndefinedKeys(obj[key]);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return rv;
    }
    if (Array.isArray(val)) {
        return val.map(dropUndefinedKeys);
    }
    return val;
}
exports.dropUndefinedKeys = dropUndefinedKeys;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./is":45,"./memo":47,"./misc":48,"./string":53,"tslib":57}],50:[function(require,module,exports){
// Slightly modified (no IE8 support, ES6) and transcribed to TypeScript
// https://raw.githubusercontent.com/calvinmetcalf/rollup-plugin-node-builtins/master/src/es6/path.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.basename = exports.dirname = exports.join = exports.isAbsolute = exports.normalizePath = exports.relative = exports.resolve = void 0;
/** JSDoc */
function normalizeArray(parts, allowAboveRoot) {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
        var last = parts[i];
        if (last === '.') {
            parts.splice(i, 1);
        }
        else if (last === '..') {
            parts.splice(i, 1);
            // eslint-disable-next-line no-plusplus
            up++;
        }
        else if (up) {
            parts.splice(i, 1);
            // eslint-disable-next-line no-plusplus
            up--;
        }
    }
    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
        // eslint-disable-next-line no-plusplus
        for (; up--; up) {
            parts.unshift('..');
        }
    }
    return parts;
}
// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^/]+?|)(\.[^./]*|))(?:[/]*)$/;
/** JSDoc */
function splitPath(filename) {
    var parts = splitPathRe.exec(filename);
    return parts ? parts.slice(1) : [];
}
// path.resolve([from ...], to)
// posix version
/** JSDoc */
function resolve() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var resolvedPath = '';
    var resolvedAbsolute = false;
    for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        var path = i >= 0 ? args[i] : '/';
        // Skip empty entries
        if (!path) {
            continue;
        }
        resolvedPath = path + "/" + resolvedPath;
        resolvedAbsolute = path.charAt(0) === '/';
    }
    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    // Normalize the path
    resolvedPath = normalizeArray(resolvedPath.split('/').filter(function (p) { return !!p; }), !resolvedAbsolute).join('/');
    return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
}
exports.resolve = resolve;
/** JSDoc */
function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
        if (arr[start] !== '') {
            break;
        }
    }
    var end = arr.length - 1;
    for (; end >= 0; end--) {
        if (arr[end] !== '') {
            break;
        }
    }
    if (start > end) {
        return [];
    }
    return arr.slice(start, end - start + 1);
}
// path.relative(from, to)
// posix version
/** JSDoc */
function relative(from, to) {
    /* eslint-disable no-param-reassign */
    from = resolve(from).substr(1);
    to = resolve(to).substr(1);
    /* eslint-enable no-param-reassign */
    var fromParts = trim(from.split('/'));
    var toParts = trim(to.split('/'));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
        }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
        outputParts.push('..');
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join('/');
}
exports.relative = relative;
// path.normalize(path)
// posix version
/** JSDoc */
function normalizePath(path) {
    var isPathAbsolute = isAbsolute(path);
    var trailingSlash = path.substr(-1) === '/';
    // Normalize the path
    var normalizedPath = normalizeArray(path.split('/').filter(function (p) { return !!p; }), !isPathAbsolute).join('/');
    if (!normalizedPath && !isPathAbsolute) {
        normalizedPath = '.';
    }
    if (normalizedPath && trailingSlash) {
        normalizedPath += '/';
    }
    return (isPathAbsolute ? '/' : '') + normalizedPath;
}
exports.normalizePath = normalizePath;
// posix version
/** JSDoc */
function isAbsolute(path) {
    return path.charAt(0) === '/';
}
exports.isAbsolute = isAbsolute;
// posix version
/** JSDoc */
function join() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return normalizePath(args.join('/'));
}
exports.join = join;
/** JSDoc */
function dirname(path) {
    var result = splitPath(path);
    var root = result[0];
    var dir = result[1];
    if (!root && !dir) {
        // No dirname whatsoever
        return '.';
    }
    if (dir) {
        // It has a dirname, strip trailing slash
        dir = dir.substr(0, dir.length - 1);
    }
    return root + dir;
}
exports.dirname = dirname;
/** JSDoc */
function basename(path, ext) {
    var f = splitPath(path)[2];
    if (ext && f.substr(ext.length * -1) === ext) {
        f = f.substr(0, f.length - ext.length);
    }
    return f;
}
exports.basename = basename;

},{}],51:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPrototypeOf = void 0;
exports.setPrototypeOf = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array ? setProtoOf : mixinProperties);
/**
 * setPrototypeOf polyfill using __proto__
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function setProtoOf(obj, proto) {
    // @ts-ignore __proto__ does not exist on obj
    obj.__proto__ = proto;
    return obj;
}
/**
 * setPrototypeOf polyfill using mixin
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function mixinProperties(obj, proto) {
    for (var prop in proto) {
        // eslint-disable-next-line no-prototype-builtins
        if (!obj.hasOwnProperty(prop)) {
            // @ts-ignore typescript complains about indexing so we remove
            obj[prop] = proto[prop];
        }
    }
    return obj;
}

},{}],52:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseBuffer = void 0;
var error_1 = require("./error");
var syncpromise_1 = require("./syncpromise");
/** A simple queue that holds promises. */
var PromiseBuffer = /** @class */ (function () {
    function PromiseBuffer(_limit) {
        this._limit = _limit;
        /** Internal set of queued Promises */
        this._buffer = [];
    }
    /**
     * Says if the buffer is ready to take more requests
     */
    PromiseBuffer.prototype.isReady = function () {
        return this._limit === undefined || this.length() < this._limit;
    };
    /**
     * Add a promise to the queue.
     *
     * @param task Can be any PromiseLike<T>
     * @returns The original promise.
     */
    PromiseBuffer.prototype.add = function (task) {
        var _this = this;
        if (!this.isReady()) {
            return syncpromise_1.SyncPromise.reject(new error_1.SentryError('Not adding Promise due to buffer limit reached.'));
        }
        if (this._buffer.indexOf(task) === -1) {
            this._buffer.push(task);
        }
        task
            .then(function () { return _this.remove(task); })
            .then(null, function () {
            return _this.remove(task).then(null, function () {
                // We have to add this catch here otherwise we have an unhandledPromiseRejection
                // because it's a new Promise chain.
            });
        });
        return task;
    };
    /**
     * Remove a promise to the queue.
     *
     * @param task Can be any PromiseLike<T>
     * @returns Removed promise.
     */
    PromiseBuffer.prototype.remove = function (task) {
        var removedTask = this._buffer.splice(this._buffer.indexOf(task), 1)[0];
        return removedTask;
    };
    /**
     * This function returns the number of unresolved promises in the queue.
     */
    PromiseBuffer.prototype.length = function () {
        return this._buffer.length;
    };
    /**
     * This will drain the whole queue, returns true if queue is empty or drained.
     * If timeout is provided and the queue takes longer to drain, the promise still resolves but with false.
     *
     * @param timeout Number in ms to wait until it resolves with false.
     */
    PromiseBuffer.prototype.drain = function (timeout) {
        var _this = this;
        return new syncpromise_1.SyncPromise(function (resolve) {
            var capturedSetTimeout = setTimeout(function () {
                if (timeout && timeout > 0) {
                    resolve(false);
                }
            }, timeout);
            syncpromise_1.SyncPromise.all(_this._buffer)
                .then(function () {
                clearTimeout(capturedSetTimeout);
                resolve(true);
            })
                .then(null, function () {
                resolve(true);
            });
        });
    };
    return PromiseBuffer;
}());
exports.PromiseBuffer = PromiseBuffer;

},{"./error":42,"./syncpromise":55}],53:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMatchingPattern = exports.safeJoin = exports.snipLine = exports.truncate = void 0;
var is_1 = require("./is");
/**
 * Truncates given string to the maximum characters count
 *
 * @param str An object that contains serializable values
 * @param max Maximum number of characters in truncated string
 * @returns string Encoded
 */
function truncate(str, max) {
    if (max === void 0) { max = 0; }
    if (typeof str !== 'string' || max === 0) {
        return str;
    }
    return str.length <= max ? str : str.substr(0, max) + "...";
}
exports.truncate = truncate;
/**
 * This is basically just `trim_line` from
 * https://github.com/getsentry/sentry/blob/master/src/sentry/lang/javascript/processor.py#L67
 *
 * @param str An object that contains serializable values
 * @param max Maximum number of characters in truncated string
 * @returns string Encoded
 */
function snipLine(line, colno) {
    var newLine = line;
    var ll = newLine.length;
    if (ll <= 150) {
        return newLine;
    }
    if (colno > ll) {
        // eslint-disable-next-line no-param-reassign
        colno = ll;
    }
    var start = Math.max(colno - 60, 0);
    if (start < 5) {
        start = 0;
    }
    var end = Math.min(start + 140, ll);
    if (end > ll - 5) {
        end = ll;
    }
    if (end === ll) {
        start = Math.max(end - 140, 0);
    }
    newLine = newLine.slice(start, end);
    if (start > 0) {
        newLine = "'{snip} " + newLine;
    }
    if (end < ll) {
        newLine += ' {snip}';
    }
    return newLine;
}
exports.snipLine = snipLine;
/**
 * Join values in array
 * @param input array of values to be joined together
 * @param delimiter string to be placed in-between values
 * @returns Joined values
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeJoin(input, delimiter) {
    if (!Array.isArray(input)) {
        return '';
    }
    var output = [];
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (var i = 0; i < input.length; i++) {
        var value = input[i];
        try {
            output.push(String(value));
        }
        catch (e) {
            output.push('[value cannot be serialized]');
        }
    }
    return output.join(delimiter);
}
exports.safeJoin = safeJoin;
/**
 * Checks if the value matches a regex or includes the string
 * @param value The string value to be checked against
 * @param pattern Either a regex or a string that must be contained in value
 */
function isMatchingPattern(value, pattern) {
    if (!is_1.isString(value)) {
        return false;
    }
    if (is_1.isRegExp(pattern)) {
        return pattern.test(value);
    }
    if (typeof pattern === 'string') {
        return value.indexOf(pattern) !== -1;
    }
    return false;
}
exports.isMatchingPattern = isMatchingPattern;

},{"./is":45}],54:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportsHistory = exports.supportsReferrerPolicy = exports.supportsReportingObserver = exports.supportsNativeFetch = exports.supportsFetch = exports.supportsDOMException = exports.supportsDOMError = exports.supportsErrorEvent = void 0;
var logger_1 = require("./logger");
var misc_1 = require("./misc");
/**
 * Tells whether current environment supports ErrorEvent objects
 * {@link supportsErrorEvent}.
 *
 * @returns Answer to the given question.
 */
function supportsErrorEvent() {
    try {
        new ErrorEvent('');
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.supportsErrorEvent = supportsErrorEvent;
/**
 * Tells whether current environment supports DOMError objects
 * {@link supportsDOMError}.
 *
 * @returns Answer to the given question.
 */
function supportsDOMError() {
    try {
        // Chrome: VM89:1 Uncaught TypeError: Failed to construct 'DOMError':
        // 1 argument required, but only 0 present.
        // @ts-ignore It really needs 1 argument, not 0.
        new DOMError('');
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.supportsDOMError = supportsDOMError;
/**
 * Tells whether current environment supports DOMException objects
 * {@link supportsDOMException}.
 *
 * @returns Answer to the given question.
 */
function supportsDOMException() {
    try {
        new DOMException('');
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.supportsDOMException = supportsDOMException;
/**
 * Tells whether current environment supports Fetch API
 * {@link supportsFetch}.
 *
 * @returns Answer to the given question.
 */
function supportsFetch() {
    if (!('fetch' in misc_1.getGlobalObject())) {
        return false;
    }
    try {
        new Headers();
        new Request('');
        new Response();
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.supportsFetch = supportsFetch;
/**
 * isNativeFetch checks if the given function is a native implementation of fetch()
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function isNativeFetch(func) {
    return func && /^function fetch\(\)\s+\{\s+\[native code\]\s+\}$/.test(func.toString());
}
/**
 * Tells whether current environment supports Fetch API natively
 * {@link supportsNativeFetch}.
 *
 * @returns true if `window.fetch` is natively implemented, false otherwise
 */
function supportsNativeFetch() {
    if (!supportsFetch()) {
        return false;
    }
    var global = misc_1.getGlobalObject();
    // Fast path to avoid DOM I/O
    // eslint-disable-next-line @typescript-eslint/unbound-method
    if (isNativeFetch(global.fetch)) {
        return true;
    }
    // window.fetch is implemented, but is polyfilled or already wrapped (e.g: by a chrome extension)
    // so create a "pure" iframe to see if that has native fetch
    var result = false;
    var doc = global.document;
    // eslint-disable-next-line deprecation/deprecation
    if (doc && typeof doc.createElement === "function") {
        try {
            var sandbox = doc.createElement('iframe');
            sandbox.hidden = true;
            doc.head.appendChild(sandbox);
            if (sandbox.contentWindow && sandbox.contentWindow.fetch) {
                // eslint-disable-next-line @typescript-eslint/unbound-method
                result = isNativeFetch(sandbox.contentWindow.fetch);
            }
            doc.head.removeChild(sandbox);
        }
        catch (err) {
            logger_1.logger.warn('Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ', err);
        }
    }
    return result;
}
exports.supportsNativeFetch = supportsNativeFetch;
/**
 * Tells whether current environment supports ReportingObserver API
 * {@link supportsReportingObserver}.
 *
 * @returns Answer to the given question.
 */
function supportsReportingObserver() {
    return 'ReportingObserver' in misc_1.getGlobalObject();
}
exports.supportsReportingObserver = supportsReportingObserver;
/**
 * Tells whether current environment supports Referrer Policy API
 * {@link supportsReferrerPolicy}.
 *
 * @returns Answer to the given question.
 */
function supportsReferrerPolicy() {
    // Despite all stars in the sky saying that Edge supports old draft syntax, aka 'never', 'always', 'origin' and 'default
    // https://caniuse.com/#feat=referrer-policy
    // It doesn't. And it throw exception instead of ignoring this parameter...
    // REF: https://github.com/getsentry/raven-js/issues/1233
    if (!supportsFetch()) {
        return false;
    }
    try {
        new Request('_', {
            referrerPolicy: 'origin',
        });
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.supportsReferrerPolicy = supportsReferrerPolicy;
/**
 * Tells whether current environment supports History API
 * {@link supportsHistory}.
 *
 * @returns Answer to the given question.
 */
function supportsHistory() {
    // NOTE: in Chrome App environment, touching history.pushState, *even inside
    //       a try/catch block*, will cause Chrome to output an error to console.error
    // borrowed from: https://github.com/angular/angular.js/pull/13945/files
    var global = misc_1.getGlobalObject();
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var chrome = global.chrome;
    var isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
    var hasHistoryApi = 'history' in global && !!global.history.pushState && !!global.history.replaceState;
    return !isChromePackagedApp && hasHistoryApi;
}
exports.supportsHistory = supportsHistory;

},{"./logger":46,"./misc":48}],55:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncPromise = void 0;
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
var is_1 = require("./is");
/** SyncPromise internal states */
var States;
(function (States) {
    /** Pending */
    States["PENDING"] = "PENDING";
    /** Resolved / OK */
    States["RESOLVED"] = "RESOLVED";
    /** Rejected / Error */
    States["REJECTED"] = "REJECTED";
})(States || (States = {}));
/**
 * Thenable class that behaves like a Promise and follows it's interface
 * but is not async internally
 */
var SyncPromise = /** @class */ (function () {
    function SyncPromise(executor) {
        var _this = this;
        this._state = States.PENDING;
        this._handlers = [];
        /** JSDoc */
        this._resolve = function (value) {
            _this._setResult(States.RESOLVED, value);
        };
        /** JSDoc */
        this._reject = function (reason) {
            _this._setResult(States.REJECTED, reason);
        };
        /** JSDoc */
        this._setResult = function (state, value) {
            if (_this._state !== States.PENDING) {
                return;
            }
            if (is_1.isThenable(value)) {
                value.then(_this._resolve, _this._reject);
                return;
            }
            _this._state = state;
            _this._value = value;
            _this._executeHandlers();
        };
        // TODO: FIXME
        /** JSDoc */
        this._attachHandler = function (handler) {
            _this._handlers = _this._handlers.concat(handler);
            _this._executeHandlers();
        };
        /** JSDoc */
        this._executeHandlers = function () {
            if (_this._state === States.PENDING) {
                return;
            }
            var cachedHandlers = _this._handlers.slice();
            _this._handlers = [];
            cachedHandlers.forEach(function (handler) {
                if (handler.done) {
                    return;
                }
                if (_this._state === States.RESOLVED) {
                    if (handler.onfulfilled) {
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        handler.onfulfilled(_this._value);
                    }
                }
                if (_this._state === States.REJECTED) {
                    if (handler.onrejected) {
                        handler.onrejected(_this._value);
                    }
                }
                handler.done = true;
            });
        };
        try {
            executor(this._resolve, this._reject);
        }
        catch (e) {
            this._reject(e);
        }
    }
    /** JSDoc */
    SyncPromise.resolve = function (value) {
        return new SyncPromise(function (resolve) {
            resolve(value);
        });
    };
    /** JSDoc */
    SyncPromise.reject = function (reason) {
        return new SyncPromise(function (_, reject) {
            reject(reason);
        });
    };
    /** JSDoc */
    SyncPromise.all = function (collection) {
        return new SyncPromise(function (resolve, reject) {
            if (!Array.isArray(collection)) {
                reject(new TypeError("Promise.all requires an array as input."));
                return;
            }
            if (collection.length === 0) {
                resolve([]);
                return;
            }
            var counter = collection.length;
            var resolvedCollection = [];
            collection.forEach(function (item, index) {
                SyncPromise.resolve(item)
                    .then(function (value) {
                    resolvedCollection[index] = value;
                    counter -= 1;
                    if (counter !== 0) {
                        return;
                    }
                    resolve(resolvedCollection);
                })
                    .then(null, reject);
            });
        });
    };
    /** JSDoc */
    SyncPromise.prototype.then = function (onfulfilled, onrejected) {
        var _this = this;
        return new SyncPromise(function (resolve, reject) {
            _this._attachHandler({
                done: false,
                onfulfilled: function (result) {
                    if (!onfulfilled) {
                        // TODO: ¯\_(ツ)_/¯
                        // TODO: FIXME
                        resolve(result);
                        return;
                    }
                    try {
                        resolve(onfulfilled(result));
                        return;
                    }
                    catch (e) {
                        reject(e);
                        return;
                    }
                },
                onrejected: function (reason) {
                    if (!onrejected) {
                        reject(reason);
                        return;
                    }
                    try {
                        resolve(onrejected(reason));
                        return;
                    }
                    catch (e) {
                        reject(e);
                        return;
                    }
                },
            });
        });
    };
    /** JSDoc */
    SyncPromise.prototype.catch = function (onrejected) {
        return this.then(function (val) { return val; }, onrejected);
    };
    /** JSDoc */
    SyncPromise.prototype.finally = function (onfinally) {
        var _this = this;
        return new SyncPromise(function (resolve, reject) {
            var val;
            var isRejected;
            return _this.then(function (value) {
                isRejected = false;
                val = value;
                if (onfinally) {
                    onfinally();
                }
            }, function (reason) {
                isRejected = true;
                val = reason;
                if (onfinally) {
                    onfinally();
                }
            }).then(function () {
                if (isRejected) {
                    reject(val);
                    return;
                }
                resolve(val);
            });
        });
    };
    /** JSDoc */
    SyncPromise.prototype.toString = function () {
        return '[object SyncPromise]';
    };
    return SyncPromise;
}());
exports.SyncPromise = SyncPromise;

},{"./is":45}],56:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],57:[function(require,module,exports){
(function (global){
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __spreadArrays;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
var __importStar;
var __importDefault;
var __classPrivateFieldGet;
var __classPrivateFieldSet;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            }
            else {
                exports.__esModule = true;
            }
        }
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    __extends = function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __exportStar = function (m, exports) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    };

    __values = function (o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    __spreadArrays = function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    __importStar = function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };

    __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    __classPrivateFieldGet = function (receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    };

    __classPrivateFieldSet = function (receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
    exporter("__classPrivateFieldGet", __classPrivateFieldGet);
    exporter("__classPrivateFieldSet", __classPrivateFieldSet);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],58:[function(require,module,exports){
"use strict";var Sentry=require("@sentry/browser");window.Sentry=Sentry;

},{"@sentry/browser":6}]},{},[58]);
