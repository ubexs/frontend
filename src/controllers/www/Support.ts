import {
    Controller,
    Get,
    All,
    Next,
    Req,
    Res,
    UseBefore,
    Render,
    QueryParams,
    PathParams,
    Redirect,
    Response,
    Request,
    Locals,
    UseAfter,
    Required,
    Use,
    UseBeforeEach,
    HeaderParams
} from "@tsed/common";
import { Description, Summary, Hidden } from "@tsed/swagger"; // import swagger Ts.ED module
import { Exception, NotFound, BadRequest } from "ts-httpexceptions";
import * as Express from 'express';
import * as model from '../../models';
import base from '../base'
import moment = require("moment");
import * as middleware from '../../middleware/v1';
import xss = require('xss');
import Config from '../../helpers/config';
// Models


@Hidden()
@Controller("/support")
export class WWWSupportController extends base {
    constructor() {
        super();
    }

    @Get("/")
    @Render('support')
    public async SupportPage() {
        return new model.WWWTemplate({
            title: "Support",
        });
    }

    @Get("/ticket/:ticketId")
    @Render('support_ticket')
    @Use(middleware.auth.YesAuth)
    public async SupportTicket(
        @HeaderParams('cookie') cookies: string,
        @Locals('userInfo') userInfo: model.UserSession,
        @PathParams('ticketId', Number) ticketId: number,
    ) {
        const baseService = new base({
            cookie: cookies,
        });
        let info = await baseService.Support.getTicketById(ticketId);
        info['createdAt'] = moment(info['createdAt']).fromNow();
        info['updatedAt'] = moment(info['updatedAt']).fromNow();
        let replies = await baseService.Support.getTicketReplies(ticketId);
        for (const reply of replies) {
            reply['createdAt'] = moment(reply['createdAt']).fromNow();
            reply['updatedAt'] = moment(reply['updatedAt']).fromNow();
        }
        return new model.WWWTemplate({
            title: "Support",
            page: {
                ticket: info,
                replies: replies,
            },
        });
    }

    @Get("/ticket/:ticketId/reply")
    @Render('support_ticket_reply')
    @Use(middleware.auth.YesAuth)
    public async SupportTicketReply(
        @HeaderParams('cookie') cookies: string,
        @Locals('userInfo') userInfo: model.UserSession,
        @PathParams('ticketId', Number) ticketId: number,
    ) {
        const baseService = new base({
            cookie: cookies,
        });
        let info = await baseService.Support.getTicketById(ticketId);
        if (info.ticketStatus !== model.Support.TicketStatus.PendingCustomerResponse) {
            throw new this.BadRequest('InvalidTicketId');
        }
        info['createdAt'] = moment(info['createdAt']).fromNow();
        info['updatedAt'] = moment(info['updatedAt']).fromNow();
        return new model.WWWTemplate({
            title: "Support Ticket Reply",
            page: {
                ticket: info,
            },
        });
    }

    @Get("/refund-policy")
    @Render('refund_policy')
    public async RefundPolicy() {
        return new model.WWWTemplate({
            title: "Refund Policy",
        });
    }

    @Get('/browser-not-compatible')
    @Render('support_article')
    public BrowserNotCompatible() {
        return new model.WWWTemplate({
            title: 'Browser Not Compatible',
            page: {
                article: `
                <h1>Browser Not Supported</h1>
                <p>
                Unfortunately, due to security concerns, your browser cannot be supported. We do not block browsers from using our games unless we absolutely have to, in order to protect users from account theft, viruses, or other malicious activity.
                </p>
                <p style="margin-top:1rem;">
                Please use a more up-to-date browser, such as <a href="https://www.google.com/chrome/" rel="nofollow">Google Chrome</a> or <a rel="nofollow" href="https://www.mozilla.org/firefox/">Mozilla Firefox</a>.
                </p>`
            }
        })
    }

    @Get('/game-help')
    @Render('support_article')
    public GameHelpSupport() {
        return new model.WWWTemplate({
            title: 'Help Playing Games',
            page: {
                article: `<h1>General Game Help</h1><br><p>We're really sorry for the inconvenience you may be experiencing right now. Our game engine is still in the very early stages, so unfortunately, there will be many bugs.<br><br>You should read through this article and try any of the troubleshooting steps provided. If nothing matches your problem, or nothing fixes your problem, you can <a href="/support">create a support ticket here</a>.</p>

                <div style="margin-top:1rem;"></div>

                <h3>Unsupported Setups/Browsers</h3>
                <p>Although we try to support as many browsers and operating systems as we can, there are some that we just cannot support either for technical or privacy/security reasons. Below is a list of browsers and operating systems we do not support and will not offer support for.</p>
                <ul>
                    <li>All versions of Microsoft Internet Explorer <span style="font-style: italic;">(does not include edge)</span></li>
                    <li>Operating systems that are not currently receiving security updates (Windows: currently Windows 7 and below, Mac: macOS 12 and below)</li>
                </ul>

                <div style="margin-top:1rem;"></div>


                <h3>White screen when trying to play any game</h3>
                <p>
                This error usually means that something couldn't be loaded. Although a white screen is expected for a second or two while the game loads, if a white screen persists for any longer than 3 seconds or so, the game was likely unable to be loaded. This usually means that you should try to update your web browser, and disable any browsing extensions (if any) that might be causing issues. If the problem is still not solved after using a modern web browser, contact our support team for more info.
                </p>

                <div style="margin-top:1rem;"></div>

                <h3>"This content cannot be displayed in an iframe"</h3>
                <img src="https://cdn.blockshub.net/static/support-img/Screenshot_1.png" style="width:100%;height: auto;max-width:600px;" />
                <p>Unfortunately, this error means that your browser is not supported by our game engine. We are currently working on a downloadable game engine to elevate problems like this on older operating systems, but until we release it, you will have to use a more up-to-date web browser such as <a href="https://www.google.com/chrome/" rel="nofollow">Google Chrome</a> or <a rel="nofollow" href="https://www.mozilla.org/firefox/">Mozilla Firefox</a>. If you are using the most up-to-date version of either browser, then your operating system is likely not supported by us.</p>
                
                `,
            }
        });
    }

    @Get('/account-banned-help')
    @Render('support_article')
    public AccountBannedSupport() {
        return new model.WWWTemplate({
            title: 'Account Banned',
            page: {
                article: `<h1>Why was my account banned?</h1>
                <p style="margin-bottom:1rem">
                Accounts are banned and/or deleted when they are found to breach our terms of service. We always attempt to resolve conflicts with the account owner before an account is deleted, but in some cases, the terms of service breach is so severe that our moderators agree on terminating an account.
                </p>
                <h3>What can get me banned?</h3>
                <p style="margin-bottom:1rem">
                All forms of violating our <a href="/terms">terms of service</a> can lead to your account being banned and/or deleted.
                <br>
                For instance, <span class="font-weight-bold">your account can be banned when<span>:
                </p>
                <ul>
                    <li>You harass users on the forums</li>
                    <li>You upload a very inappropriate TShirt</li>
                    <li>You spam (e.g. on the forums, on a catalog item's comments, on a group wall, on your friend's status through comments, etc)</li>
                </ul>
                <p class="font-weight-bold">Your account can be deleted when:</p>
                <ul>
                    <li>You signup with an inappropriate username</li>
                    <li>You repeatedly harass users on the forums</li>
                    <li>You scam or attempt to scam other users of their in-game items/currency</li>
                    <li>You attempt to steal accounts not belonging to you</li>
                    <li>Your account is compromised by another user and we cannot determine who the original owner is</li>
                </ul>


                <p style="margin-bottom:1rem;">There are also many other reasons as to why an account can be banned or deleted, so make sure to view the <a href="/terms">full terms of service</a> for more information. We may also terminate accounts for something that would get other users banned, or vice-versa, as all bans are handled on a case-by-case basis (with severity taken into account).</p>

                <h3>Banned Accounts</h3>
                <p style="margin-bottom:1rem">
                When a temporary ban is placed on your account, you will have to wait until the ban has expired in order to start using our website again. Attempting to bypass bans by creating new accounts during a ban may lead to account deletion. You are allowed to appeal the ban in our ticket system, although we do not approve appeals very often since we try to be careful and take precautions when banning accounts.
                </p>
                <h3>Terminated (a.k.a. "Deleted") Accounts</h3>
                <p style="margin-bottom:1rem">
                When an account is terminated (a.k.a. "Deleted"), you are free to rejoin on a new account. Once an account has been terminated, we do not allow users to access anything on the account, other than a page detailing the reason for the termination and some support articles. We also allow terminated accounts to appeal their terminated through our ticket system, for up to 30 days after a termination. Once an account has been terminated for 30 days, we do not allow you to appeal it's deletion.
                </p>

                `,
            }
        });
    }

    @Get('/account-hacked')
    @Render('support_article')
    public AccountHackedSupport() {
        return new model.WWWTemplate({
            title: 'Account Hacked or Can\'t Login',
            page: {
                article: `<h1>I can't login to my account/Account Hacked</h1>
                <p style="margin-bottom:1rem">
                If you cannot login to your account, or your account was hacked (and items/currency was taken), follow this guide to help get access back to your account.
                </p>
                <h3>I can't login!</h3>
                <p style="margin-bottom:1rem">
                    If you have a verified email address on your account, you can <a href="/request/password-reset">reset your password here</a>. If you do not recieve a reset password email, your email may have been changed. You can email our support team at <a href="mailto:support@blockshub.net">support@blockshub.net</a> from your account's last known email for assistance. If you did not have a verified email, then we will be unable to help you.
                </p>
                <h3>Currency/Items are missing or I think someone's on my account</h3>
                <p style="margin-bottom:1rem">
                    If you are logged into your account, go to your settings and reset your password. Once your password is reset, it will log out all other users from your account (if anyone else is logged into it). Then, you can <a href="/support">contact support</a> and create a ticket in order to begin the account restoration process. We will try to help you regain any stolen currency/items/groups, although we cannot guarantee we will always be able to assist you.
                </p>
                <h3>My account was hacked, and then deleted!</h3>
                <p style="margin-bottom:1rem">
                    Depending on the reason for the deletion, we may be able to assist you. <a href="/support">Contact support</a> and create a support ticket explaining the problem, and will try our best to help you.
                </p>
                `,
            }
        });
    }

    @Get('/scammed')
    @Render('support_article')
    public ScammedSupport() {
        return new model.WWWTemplate({
            title: 'I was scammed',
            page: {
                article: `<h1>I was scammed by another user!</h1>
                <p style="margin-bottom:1rem">
                    Depending on the type of scam and how it occurred, we may be able to assist you, although generally we cannot help when users are scammed as it is impossible to view the full story, from both sides.
                </p>
                <h3>Someone scammed me on the website!</h3>
                <p style="margin-bottom:1rem">
                    If a user scammed something from you through the website, and you have a chat log of them scamming you (such as through the website chat function or forum posts), you can <a href="/support">contact support</a> to try and get the issue resolved. Although it is unlikely, we may be able to help you get your items/currency/group/game back. If you were scammed doing something against the terms of service, we will be unable to assist you.
                </p>
                <h3>Someone scammed me with another website!</h3>
                <p style="margin-bottom:1rem">
                    If another user scammed you through another service, such as discord, we will not be able to assist you. Without a clear record of what happened (through our own website chat logs and transaction/trading history), we would not be able to confirm whether or not you were actually scammed.
                </p>
                `,
            }
        });
    }

    @Get('/ad-system')
    @Render('support_article')
    public AdSystemSupport() {
        return new model.WWWTemplate({
            title: 'Ad System Help',
            page : {
                'article': `<div class="col-12" style="margin-bottom:1rem;">
                <h1>Ad System Help</v>
            </div>
            <div class="col-12" style="margin-bottom:1rem;">
                <h4 style="font-size:1rem;margin-bottom:0;">How does the ad system work?</h4>
                <p>When you purchase an ad, each single primary currency you spend on it gives it a higher chance of being randomly picked and displayed to users. For instance, if John spends 90 primary on one ad and Jane spends 10 primary on one ad, you have a 90% chance of seeing John's ad (and a 10% chance of seeing Jane's ad). We do not offer any sort of targeting (i.e. based on country, signed in or signed out, based on gender, based on birth-year, etc), although we might look into more advanced offerings in the future.</p>
            </div>
            <div class="col-12" style="margin-bottom:1rem;">
                <h4 style="font-size:1rem;margin-bottom:0;">Can I advertise a link to something outside of this website?</h4>
                <p>No. At this time, you may only advertise links to catalog items and groups.</p>
            </div>
            <div class="col-12" style="margin-bottom:1rem;">
                <h4 style="font-size:1rem;margin-bottom:0;">I can't bid on my ad!</h4>
                <p>You cannot bid on ads that have been declined by moderation, or ads that are pending moderation approval. If your ad was declined, you'll recieve a message in your inbox, otherwise you should just wait for a moderator to approve it.</p>
            </div>
            <div class="col-12" style="margin-bottom:1rem;">
                <h4 style="font-size:1rem;margin-bottom:0;">What sort of analytics do you offer?</h4>
                <p>You can view the click-through rate of advertisements (i.e. out of x views, y users clicked your ad) & the amount of views your ad has. You can view both of those metrics per-advertisement session, and all-time. We do not store any sort of historical data for advertisements, other than all-time views and all-time clicks. We do not offer advanced metrics, tracking, or targetting as that would violate coppa laws.</p>
            </div>
            <div class="col-12" style="margin-top:0.5rem;">
                <h4 style="font-size:1rem;margin-bottom:0;">How do I advertise a catalog item, forum thread, or group?</h4>
                <p style="margin-top:1rem;">To advertise a group:</p>
                <p style="margin-left:1rem;">
                    <span class="font-weight-bold">1. Visit the page of the group you'd like to advertise.</span>
                    <br>
                    <span class="font-weight-bold">2. Click on the dropdown to the right of the group name</span>. Click on "Advertise" listed below Manage. If you do not see "Advertise", it means you cannot advertise this group.
                    <br>
                    <span class="font-weight-bold">3. Give your ad a name (optional) and select an image</span>. Tip: Your image should be 728x90 pixels (728 width, 90 height) for optimal results, although any image will work. If your image becomes really stretched or squished, try using a photo editing program to make it fit into 728x90.
                    <br>
                    <span class="font-weight-bold">4. Head to the <a href="/ads">Ad Dashboard</a>, and bid on your ad</span>. You can bid almost any amount of primary currency, with the minimum being 1 and the maximum being 100,000. Your ad will run for 24 hours after you bid on it.
                    <br>
                </p>
                <p style="margin-top:1rem;">To advertise a catalog item (TShirt, Shirt, Pants, etc):</p>
                <p style="margin-left:1rem;">
                    <span class="font-weight-bold">1. Visit the page of the catalog item you'd like to advertise.</span>
                    <br>
                    <span class="font-weight-bold">2. Click on the &quot;Advertise&quot; button, below "Edit"</span>. If you do not see "Advertise", it means you cannot advertise this item.
                    <br>
                    <span class="font-weight-bold">3. Give your ad a name (optional) and select an image</span>. Tip: If you are making a leaderboard ad, your image should be 728x90 pixels (728 width, 90 height) for optimal results, although any image will work. If your image becomes really stretched or squished, try using a photo editing program to make it fit into 728x90.
                    <br>
                    <span class="font-weight-bold">4. Head to the <a href="/ads">Ad Dashboard</a>, and bid on your ad</span>. You can bid almost any amount of primary currency, with the minimum being 1 and the maximum being 100,000. Your ad will run for 24 hours after you bid on it.
                    <br>
                </p>
                <p style="margin-top:1rem;">To advertise a forum thread:</p>
                <p style="margin-left:1rem;">
                    <span class="font-weight-bold">1. Visit the page of the thread you'd like to advertise.</span>
                    <br>
                    <span class="font-weight-bold">2. Click on the &quot;Three Dots&quot; button, to the right of the Thread Title</span>. If you do not see the "three dots" button, it means you cannot advertise this thread.
                    <br>
                    <span class="font-weight-bold">3. Give your ad a name (optional) and select an image</span>. Tip: If you are making a leaderboard ad, your image should be 728x90 pixels (728 width, 90 height) for optimal results, although any image will work. If your image becomes really stretched or squished, try using a photo editing program to make it fit into 728x90.
                    <br>
                    <span class="font-weight-bold">4. Head to the <a href="/ads">Ad Dashboard</a>, and bid on your ad</span>. You can bid almost any amount of primary currency, with the minimum being 1 and the maximum being 100,000. Your ad will run for 24 hours after you bid on it.
                    <br>
                </p>
            </div>`
            }
        });
    }
}
