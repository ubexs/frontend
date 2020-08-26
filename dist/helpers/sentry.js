"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sentry = require("@sentry/node");
exports.Sentry = Sentry;
let _isEnabled = false;
exports.isEnabled = () => {
    return _isEnabled;
};
exports.init = () => {
    Sentry.init({ dsn: 'https://dccc8567d5714c75a7b884ffd1d73843@sentry.io/2506252' });
    _isEnabled = true;
};
