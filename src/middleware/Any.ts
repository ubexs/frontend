/**
 * The purpose of this middleware is to set relevant res.locals, and to set relevant headers (content-security-policy mostly)
 */

import {Request, Response, NextFunction} from 'express';
import crypto = require('crypto');
import os = require('os');
import util = require('util');
// @ts-ignore
import moment = require('moment');
const randomBytes = util.promisify(crypto.randomBytes);


import { BadRequest } from 'ts-httpexceptions';
// User model
import base from '../controllers/base';
import {
    UserSession,
} from '../models/index';
import * as model from '../models';
/**
 * Errors
 */
import { Unauthorized } from 'ts-httpexceptions';
import config from "../helpers/config";
/**
 * Pre-Generated CSP
 */
export const csp = {
    'form-action': `'self'`,
    'media-src': `'none'`,
    'frame-ancestors': `'self'`,
    'img-src': `'self' data: https://cdn.blockshub.net/ https://hindigamerclub-game.ewr1.vultrobjects.com/ https://www.google-analytics.com/ ${config.baseUrl.frontend}`,
    'connect-src': `'self' ws://localhost:8080/ https://sentry.io/ https://ka-f.fontawesome.com/releases/v5.13.1/css/free.min.css ${config.baseUrl.frontend} ${config.baseUrl.play}`,
    'object-src': `'none'`,
    'base-uri': `'self'`,
} as any;
let cspString = '';
Object.keys(csp).forEach((cspKey) => {
    cspString = cspString + cspKey + ' ' + csp[cspKey] + '; ';
});
// Setup ID stuff
export const processId = process.pid;
export const environment = process.env.NODE_ENV;
export const hostName = os.hostname();

export const getCspString = (): string => {
    return cspString;
}

export const lbOrigin = crypto.randomBytes(8).toString('base64');
export const version = crypto.randomBytes(8).toString('hex');
/**
 * Generate CSP with nonce middleware
 */
export const generateCspWithNonce = async (req: Request, res: Response, next: NextFunction, randomBytesFunction = randomBytes): Promise<void> => {
    res.set({
        'x-lb-origin':lbOrigin,
    })
    res.locals['x-lb-origin'] = lbOrigin;
    // temp
    if (process.env.NODE_ENV === 'development'  && !req.headers['cf-connecting-ip']) {
        req.headers['cf-connecting-ip'] = '127.0.0.1';
    }
    if (req.url === '/docs' || req.url === '/docs/') {
        return next();
    }
    res.set({
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '0',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-Environment': environment,
        // 'X-Process-ID': processId,
        // 'X-HostName': hostName,
        'X-Permitted-Cross-Domain-Policies': 'none',
    });
    if (req.url.slice(0,'/api/'.length) === '/api/') {
        return next();
    }
    const nonceBuffer = await randomBytesFunction(48);
    let nonce = nonceBuffer.toString('base64');

    let headerString;
    if (req.originalUrl.match(/\/game\/(\d+)\/sandbox/g)) {
        headerString = 'script-src \'nonce-' + nonce + '\' ' + "'unsafe-eval'; " + getCspString();
    }else{
        headerString = 'script-src \'nonce-' + nonce + '\'; ' + getCspString();
    }
    if (req.url.slice(0,'/v1/authenticate-to-service'.length) === '/v1/authenticate-to-service') {
        headerString = headerString.replace(/form-action 'self'; /g, '');
    }
    res.set({
        // CSP Headers
        'Content-Security-Policy': headerString,
    });
    // Version
    res.locals.version =
    // Nonce
    res.locals.nonce = nonce;
    // Setup js
    res.locals.javascript = getJavascript(nonce, version);
    // OK
    next();
}

export const getIp = (req: Request): string => {
    const cloudflareIP = req.get('cf-connecting-ip');
    if (cloudflareIP) {
        return cloudflareIP;
    }else{
        if (!req.connection.remoteAddress) {
            return '127.0.0.1';
        }
        return req.connection.remoteAddress;
    }
}

export const getJavascript = (nonce: string, version: string): string => {
    return `
        <script nonce="${nonce}" src="/js/warning.js"></script>
        <script nonce="${nonce}" src="/js/bundle/sentry.bundle.js?v=${version}"></script>
        <script nonce="${nonce}">
            Sentry.init({ dsn: 'https://a5c3a9adef4a4e149a1e2d1651b9da4d@sentry.io/2505702' });
        </script>
        <script nonce="${nonce}" src="/js/bundle/main.bundle.js?v=${version}"></script>
        <script nonce="${nonce}" src="/js/bundle/bootstrap.bundle.js?v=${version}"></script>`;
}

export default async (req: {session: any} & Request, res: Response, next: NextFunction): Promise<void> => {
    let doSkip = false;
    await generateCspWithNonce(req, res, () => {

    });
    if (req.query.sort) {
        if (req.query.sort !== 'asc' && req.query.sort !== 'desc') {
            return next(new BadRequest('InvalidSort'));
        }
    }
    if (req.url.slice(0,4) === '/js/' || req.url.slice(0,5) === '/css/') {
        return next();
    }
    // Setup IP
    res.locals.ip = getIp(req);

    const baseService = new base({
        cookie: req.headers['cookie'],
    });
    // Check if authenticated
    try {
        const newUserInfo = await baseService.Users.getAuthenticatedUserInfo();
        console.log('[info] user is logged in. info',newUserInfo);
        res.locals.userInfo = newUserInfo as UserSession;
    }catch(err) {
        if (err.isAxiosError && err.response && err.response.status === 401) {
            // Ignore
            console.log('[info] user is not logged in');
        }else{
            return next(err);
        }
    }
    next();
    /*
    // If sessions are up/working
    if (req.session) {
        const userData: SessionUserData = Object.assign({}, req.session.userdata);
        // If impersonating
        let impersonateUserId: number|undefined = req.session.impersonateUserId;
        let isImpersonating = typeof impersonateUserId === 'number';
        if (impersonateUserId) {
            userData.id = impersonateUserId;

            const impersonateUserInfo = await new UserModel().getInfo(impersonateUserId, ['passwordChanged','username']);
            userData.passwordUpdated = impersonateUserInfo.passwordChanged;
            userData.username = impersonateUserInfo.username;

            res.locals.impersonateUserId = impersonateUserId;
        }
        // If user data exists
        if (userData) {
            let userInfo;
            if (!userData.id || userData.passwordUpdated === undefined || !userData.username) {
                // Not logged in
                if (!userData.csrf) {
                    await setSession(req);
                }
                next();
                return;
            }
            // Grab Data if Authenticated
            try {
                userInfo = await new UserModel().getInfo(userData.id);
            } catch (e) {
                // Log out to be safe
                delete req.session.userdata;
            }
            // If user does not exist
            if (userInfo === undefined) {
                // Log out
                delete req.session.userdata;
            }
            // IF password has changed
            if (userInfo && userInfo.passwordChanged > userData.passwordUpdated) {
                // Log out
                delete req.session.userdata;
                await regenCsrf(req);
            }
            // If username has been changed
            if (userInfo && userInfo.username !== userData.username) {
                // Log out
                delete req.session.userdata;
                await regenCsrf(req);
            }
            // Setup Locals
            res.locals.userInfo = userInfo;
            // csrf local (so that it auto loads into the view)
            if (userData) {
                res.locals.csrf = userData.csrf;
            }
            // If not api request
            if (req.url.slice(0,5) !== '/api/' && userInfo) {
                let dal = new UserModel();
                // Update last online
                if (!isImpersonating) {
                    await dal.logOnlineStatus(userInfo.userId)

                    // Give currency for being online (if applicable)

                    // If over 24 hours since user got award for currency,
                    if (moment().isSameOrAfter(moment(userInfo.dailyAward).add(24, 'hours'))) {
                        // Create transaction
                        await new EconomyDAL().createTransaction(userInfo.userId, 1, 10, model.economy.currencyType.secondary, model.economy.transactionType.DailyStipendSecondary, 'Daily Stipend', model.catalog.creatorType.User, model.catalog.creatorType.User);
                        // Give money
                        await new EconomyDAL().addToUserBalance(userInfo.userId, 10, model.economy.currencyType.secondary);
                        // Log user as awarded (aka update the dailyAward date)
                        await dal.updateDailyAward(userInfo.userId);
                    }
                }
            }
            // If banned
            if (!isImpersonating && userInfo && userInfo.banned === Users.banned.true) {
                if (req.url === "/Membership/NotApproved.aspx?ID="+userData.id) {
                    let banData: Moderation.ModerationAction;
                    try {
                        banData = await new ModModel().getBanDataFromUserId(userData.id);
                        banData.date = moment(banData.date).format();
                    }catch(e) {
                        banData = {
                            id: 0,
                            userId: userData.id,
                            reason: "The reason for your account's termination is not specified.",
                            date: moment().format(),
                            untilUnbanned: new Date(),
                            terminated: Moderation.terminated.true,
                            unlock: false,
                            isEligibleForAppeal: false,
                        } as Moderation.ModerationAction;
                    }
                    // Return ban page
                    res.render("banned", {
                        csrf: userData.csrf,
                        ban: banData,
                        title: "Account Banned",
                        domain: "blockshub.net",
                        userid: userData.id,
                        username: userData.username,
                        theme: userInfo.theme,
                        primaryBalance: userInfo.primaryBalance,
                        secondaryBalance: userInfo.secondaryBalance,
                    });
                    return;
                }else if (
                    // Allow access to unlock
                    req.url.substr(0, "/api/v1/auth/unlock".length) === "/api/v1/auth/unlock" || 
                    // Logout
                    req.url.substr(0, "/api/v1/auth/logout".length) === "/api/v1/auth/logout" || 
                    // Support pages
                    req.url.toLowerCase().slice(0,'/support'.length) === '/support' || 
                    // Support pages
                    req.url.toLowerCase().slice(0,'/api/v1/support'.length) === '/api/v1/support' || 
                    // & Terms of Service
                    req.url.toLowerCase() === '/terms'
                ) {
                }else if (req.url.substr(0, 5) === "/api/") {
                    // Otherwise if api route, return auth error
                    return next(new Unauthorized('Unauthorized'));
                }else{
                    // Redirect all other requests to ban page
                    res.redirect("/Membership/NotApproved.aspx?ID="+userData.id);
                    return;
                }
            }
            // Next
            next();
        } else {
            // Not logged in & no session data, so set one
            await setSession(req);
            await regenCsrf(req);
            next();
        }
    } else {
        console.warn('[warning] sessions appear to be down');
        // Sessions are down/unavailable
        next();
    }
    */
};