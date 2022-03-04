/**
 * The purpose of this middleware is to set relevant res.locals, and to set relevant headers (content-security-policy mostly)
 */

import { Request, Response, NextFunction } from 'express';
import crypto = require('crypto');
import os = require('os');
// @ts-ignore
import moment = require('moment');


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
import config from "../helpers/config";
import { bigNum2Small } from '../helpers/Numbers';
/**
 * Pre-Generated CSP
 */
export const csp = {
    'form-action': `'self'`,
    'media-src': `'none'`,
    'frame-ancestors': `'self'`,
    'img-src': `'self' data: ${config.baseUrl.cdn} ${config.baseUrl.storage} ${config.baseUrl.analytics} ${config.baseUrl.frontend}`,
    'connect-src': `'self' ws://10allday.com:8080/ ${config.baseUrl.analytics} ${config.baseUrl.monitoring} ${config.baseUrl.fonts} ${config.baseUrl.frontend} ${config.baseUrl.play}`,
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
export const generateCspWithNonce = async (req: Request, res: Response): Promise<void> => {
    res.set({
        'x-lb-origin': lbOrigin,
    })
    res.locals['x-lb-origin'] = lbOrigin;
    // temp
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
        'X-Environment': environment,
        // 'X-Process-ID': processId,
        // 'X-HostName': hostName,
        'X-Permitted-Cross-Domain-Policies': 'none',
    });
    if (req.url.slice(0, '/api/'.length) === '/api/') {
        return;
    }
    let nonce = crypto.randomBytes(32).toString('base64');

    let headerString;
    if (req.originalUrl.match(/\/game\/(\d+)\/sandbox/g)) {
        headerString = 'script-src \'nonce-' + nonce + '\' ' + "'unsafe-eval'; " + getCspString();
    } else {
        headerString = 'script-src \'nonce-' + nonce + '\'; ' + getCspString();
    }
    if (req.url.slice(0, '/v1/authenticate-to-service'.length) === '/v1/authenticate-to-service') {
        headerString = headerString.replace(/form-action 'self'; /g, '');
    }
    res.set({
        // CSP Headers
        'Content-Security-Policy': headerString,
    });
    // Version
    res.locals.version = version;
    // Recpatcha
    res.locals.captchakey = config.recaptcha.v2.public;
    // CSP Nonce
    res.locals.nonce = nonce;
    // Setup js
    res.locals.javascript = getJavascript(nonce, version);
    // OK
}

export const getIp = (req: Request): string => {
    const cloudflareIP = req.get('cf-connecting-ip');
    if (cloudflareIP) {
        return cloudflareIP;
    } else {
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
        ${config.sentry && config.sentry.frontend ? `
        <script nonce="${nonce}">
            Sentry.init({ dsn: '${config.sentry.frontend}' });
        </script>
        ` : ''}
        <script nonce="${nonce}" src="/js/bundle/main.bundle.js?v=${version}"></script>
        <script nonce="${nonce}" src="/js/bundle/bootstrap.bundle.js?v=${version}"></script>`;
}

export default async (req: { session: any } & Request, res: Response, next: NextFunction): Promise<void> => {
    // Generate the CSP and nonce
    await generateCspWithNonce(req, res);
    if (req.query.sort) {
        if (req.query.sort !== 'asc' && req.query.sort !== 'desc') {
            return next(new BadRequest('InvalidSort'));
        }
    }
    if (req.url.slice(0, 4) === '/js/' || req.url.slice(0, 5) === '/css/') {
        return next();
    }
    // Setup IP
    res.locals.ip = getIp(req);

    const baseService = new base({
        cookie: req.headers['cookie'],
    });
    try {
        res.locals.cookieConsent = await baseService.Users.getCookieConsentInfo()
    } catch (err) {
        // Ignore if error (since it defaults to all declined anyway so we dont risk legal issues)
    }
    // Check if authenticated
    try {
        const newUserInfo = await baseService.Users.getAuthenticatedUserInfo();
        res.locals.userInfo = newUserInfo as UserSession;
        res.locals.userInfo.primaryBalanceFormatted = bigNum2Small(newUserInfo.primaryBalance);
        res.locals.userInfo.secondaryBalanceFormatted = bigNum2Small(newUserInfo.secondaryBalance);

        if (newUserInfo.banned) {

            if (req.url === "/Membership/NotApproved.aspx?ID=" + newUserInfo.userId) {
                let banData;
                try {
                    banData = await baseService.Users.getBanData();
                    banData.date = moment(banData.date).format();
                } catch (e) {
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
                    } as any;
                }
                const template = new model.WWWTemplate({
                    title: 'Account Banned',
                    page: banData,
                })
                // Return ban page
                res.render("banned", template);
                return;
            } else if (
                // Support pages
                req.url.toLowerCase().slice(0, '/support'.length) === '/support' ||
                // & Terms of Service
                req.url.toLowerCase() === '/terms'
            ) {
                return next();
            } else {
                return res.redirect(302, '/Membership/NotApproved.aspx?ID=' + newUserInfo.userId)
            }
        }
    } catch (err) {
        if (err.isAxiosError && err.response && err.response.status === 401) {
            // Ignore
        } else {
            return next(err);
        }
    }
    // console.log('req', req);
    next();
};