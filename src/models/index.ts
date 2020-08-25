import * as Users from './Users';
import * as Games from './Games';
import * as Groups from './Groups';
import * as Forums from './Forums';
import * as Catalog from './Catalog';
import * as Ads from './Ads';
import * as UserReferral from './User-Referral';
import * as Support from './Support';
import * as Staff from './Staff';
import { Required } from '@tsed/common';
import {hostName} from '../middleware/Any';

export class UserSession {
    @Required()
    'userId': number;
    @Required()
    'username': string;
    @Required()
    'passwordChanged': number;
    @Required()
    'banned': Users.banned;
    @Required()
    'theme': Users.theme;
    @Required()
    'primaryBalance': number;
    @Required()
    'secondaryBalance': number;
    @Required()
    'staff': Users.staff;
    @Required()
    'dailyAward': string;
}

import * as crypto from 'crypto';
import config from "../helpers/config";
const versionStr = crypto.randomBytes(8).toString('hex');

export class WWWTemplate<PageType> {
    constructor(props: WWWTemplate<PageType>) {
        for (const [key, value] of Object.entries(props)) {
            // @ts-ignore
            this[key] = value;
        }
    }
    /**
     * The Current Year. Defaults to ```new Date().getFullYear();```
     */
    year?: number = new Date().getFullYear();

    /**
     * Page Title
     */
    title: string;
    /**
     * Recaptcha V2 Key
     */
    // captchakey? = config.recaptcha.v2.public;
    /**
     * Page Info to Send to View
     */
    page?: PageType;

    /**
     * JS Version String
     */
    v?: string = versionStr;

    /**
     * UserInfo Object
     */
    userInfo?: Users.AuthenticatedInfo;

    /**
     * Banner Thing
     */
    // bannerText?: string = currentBannerText;

    /**
     * Game Genres (for footer)
     */
    gameGenres?: any = Games.GameGenres;

    /**
     * Current ENV
     */
    env?: string = process.env.NODE_ENV;

    /**
     * is the server a staging server?
     */
    isStaging?: boolean = process.env.IS_STAGING === '1';

    /**
     * Os host name
     */
    hostName?: string = hostName;
    /**
     * API Base url for frontend
     */
    apiBaseUrl?: string = config.baseUrl.frontend;
}

/**
 * URL-Encode a String
 * @param string String to Encode
 */
export const urlEncode = (string: string|undefined): string => {
    if (!string) {
        return "unnamed";
    }
    string = string.replace(/\s| /g, '-');
    string = string.replace(/[^a-zA-Z\d-]+/g, '');
    string = string.replace(/--/g, '-');
    if (!string) {
        return "unnamed";
    }
    return string;
}

export {
    Users,
    Games,
    Groups,
    Forums,
    Catalog,
    Ads,
    UserReferral,
    Support,
    Staff,
}