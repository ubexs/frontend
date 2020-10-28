"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJavascript = exports.getIp = exports.generateCspWithNonce = exports.version = exports.lbOrigin = exports.getCspString = exports.hostName = exports.environment = exports.processId = exports.csp = void 0;
const crypto = require("crypto");
const os = require("os");
const moment = require("moment");
const ts_httpexceptions_1 = require("ts-httpexceptions");
const base_1 = require("../controllers/base");
const model = require("../models");
const config_1 = require("../helpers/config");
const Numbers_1 = require("../helpers/Numbers");
exports.csp = {
    'form-action': `'self'`,
    'media-src': `'none'`,
    'frame-ancestors': `'self'`,
    'img-src': `'self' data: https://cdn.blockshub.net/ https://hindigamerclub-game.ewr1.vultrobjects.com/ https://www.google-analytics.com/ ${config_1.default.baseUrl.frontend}`,
    'connect-src': `'self' ws://localhost:8080/ https://www.google-analytics.com/ https://sentry.io/ https://ka-f.fontawesome.com/releases/v5.15.1/css/free.min.css ${config_1.default.baseUrl.frontend} ${config_1.default.baseUrl.play}`,
    'object-src': `'none'`,
    'base-uri': `'self'`,
};
let cspString = '';
Object.keys(exports.csp).forEach((cspKey) => {
    cspString = cspString + cspKey + ' ' + exports.csp[cspKey] + '; ';
});
exports.processId = process.pid;
exports.environment = process.env.NODE_ENV;
exports.hostName = os.hostname();
exports.getCspString = () => {
    return cspString;
};
exports.lbOrigin = crypto.randomBytes(8).toString('base64');
exports.version = crypto.randomBytes(8).toString('hex');
exports.generateCspWithNonce = async (req, res) => {
    res.set({
        'x-lb-origin': exports.lbOrigin,
    });
    res.locals['x-lb-origin'] = exports.lbOrigin;
    if (process.env.NODE_ENV === 'development' && !req.headers['cf-connecting-ip']) {
        req.headers['cf-connecting-ip'] = '127.0.0.1';
    }
    if (req.url === '/docs' || req.url === '/docs/') {
        return;
    }
    res.set({
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '0',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-Environment': exports.environment,
        'X-Permitted-Cross-Domain-Policies': 'none',
    });
    if (req.url.slice(0, '/api/'.length) === '/api/') {
        return;
    }
    let nonce = crypto.randomBytes(32).toString('base64');
    let headerString;
    if (req.originalUrl.match(/\/game\/(\d+)\/sandbox/g)) {
        headerString = 'script-src \'nonce-' + nonce + '\' ' + "'unsafe-eval'; " + exports.getCspString();
    }
    else {
        headerString = 'script-src \'nonce-' + nonce + '\'; ' + exports.getCspString();
    }
    if (req.url.slice(0, '/v1/authenticate-to-service'.length) === '/v1/authenticate-to-service') {
        headerString = headerString.replace(/form-action 'self'; /g, '');
    }
    res.set({
        'Content-Security-Policy': headerString,
    });
    res.locals.version = exports.version;
    res.locals.captchakey = config_1.default.recaptcha.v2.public;
    res.locals.nonce = nonce;
    res.locals.javascript = exports.getJavascript(nonce, exports.version);
};
exports.getIp = (req) => {
    const cloudflareIP = req.get('cf-connecting-ip');
    if (cloudflareIP) {
        return cloudflareIP;
    }
    else {
        if (!req.connection.remoteAddress) {
            return '127.0.0.1';
        }
        return req.connection.remoteAddress;
    }
};
exports.getJavascript = (nonce, version) => {
    return `
        <script nonce="${nonce}" src="/js/warning.js"></script>
        <script nonce="${nonce}" src="/js/bundle/sentry.bundle.js?v=${version}"></script>
        <script nonce="${nonce}">
            Sentry.init({ dsn: 'https://a5c3a9adef4a4e149a1e2d1651b9da4d@sentry.io/2505702' });
        </script>
        <script nonce="${nonce}" src="/js/bundle/main.bundle.js?v=${version}"></script>
        <script nonce="${nonce}" src="/js/bundle/bootstrap.bundle.js?v=${version}"></script>`;
};
exports.default = async (req, res, next) => {
    await exports.generateCspWithNonce(req, res);
    if (req.query.sort) {
        if (req.query.sort !== 'asc' && req.query.sort !== 'desc') {
            return next(new ts_httpexceptions_1.BadRequest('InvalidSort'));
        }
    }
    if (req.url.slice(0, 4) === '/js/' || req.url.slice(0, 5) === '/css/') {
        return next();
    }
    res.locals.ip = exports.getIp(req);
    const baseService = new base_1.default({
        cookie: req.headers['cookie'],
    });
    try {
        res.locals.cookieConsent = await baseService.Users.getCookieConsentInfo();
    }
    catch (err) {
    }
    try {
        const newUserInfo = await baseService.Users.getAuthenticatedUserInfo();
        res.locals.userInfo = newUserInfo;
        res.locals.userInfo.primaryBalanceFormatted = Numbers_1.bigNum2Small(newUserInfo.primaryBalance);
        res.locals.userInfo.secondaryBalanceFormatted = Numbers_1.bigNum2Small(newUserInfo.secondaryBalance);
        if (newUserInfo.banned) {
            if (req.url === "/Membership/NotApproved.aspx?ID=" + newUserInfo.userId) {
                let banData;
                try {
                    banData = await baseService.Users.getBanData();
                    banData.date = moment(banData.date).format();
                }
                catch (e) {
                    console.error(e);
                    banData = {
                        id: 0,
                        userId: newUserInfo.userId,
                        reason: "The reason for your account's termination was not specified.",
                        date: moment().format(),
                        untilUnbanned: new Date(),
                        terminated: 1,
                        unlock: false,
                        isEligibleForAppeal: false,
                    };
                }
                const template = new model.WWWTemplate({
                    title: 'Account Banned',
                    page: banData,
                });
                res.render("banned", template);
                return;
            }
            else if (req.url.toLowerCase().slice(0, '/support'.length) === '/support' ||
                req.url.toLowerCase() === '/terms') {
                return next();
            }
            else {
                return res.redirect(302, '/Membership/NotApproved.aspx?ID=' + newUserInfo.userId);
            }
        }
    }
    catch (err) {
        if (err.isAxiosError && err.response && err.response.status === 401) {
        }
        else {
            return next(err);
        }
    }
    next();
};
