import base from '../base';
import { Controller, Get, Locals, QueryParams, Redirect, Render, Req, Required, Res, Use } from '@tsed/common';
import * as model from '../../models/index';
import * as middleware from '../../middleware/v1';
import { Summary } from "@tsed/swagger";
import { use } from 'chai';

@Controller('/')
export class GenericWWWController extends base {

    // idk why this exists...
    @Get('/perf.txt')
    @Summary('Perf')
    public performanceTest() {
        return 'BWS OK';
    }

    @Get('/api/group/GetUserRoleInGroupAsync')
    @Summary('GetUserRoleInGroupAsync')
    public async getUserRoleInGroup(
        @Required()
        @QueryParams('userId') userId: number,
        @Required()
        @QueryParams('groupId') groupId: number,
    ) {
        console.log('user', userId, 'group', groupId);
        userId = base.ValidateId(userId);
        groupId = base.ValidateId(groupId);
        const info = await this.Groups.getUserRole(groupId, userId);
        return info.name;
    }

    @Get('/discord')
    @Redirect(302, 'https://discord.gg/CAjZfcZ')
    public redirectToDiscord() { }

    @Get('/play')
    @Redirect(302, '/game/play')
    public redirectOldPlayPage() { }

    // Ban Redirect
    @Get('/membership/notapproved.aspx')
    @Redirect(302, '/')
    public redirectIfNoLongerBanned() { }

    @Get("/terms")
    @Render('terms')
    public Terms() {
        return new model.WWWTemplate({
            title: "Terms of Service",
        });
    }

    @Get('/currency')
    @Summary('Currency shop')
    @Use(middleware.auth.YesAuth)
    @Render('currency')
    public async buyCurrency() {
        // Grab Catalog Items
        let count = 1500;
        try {
            count = await this.Catalog.countAllItemsForSale();
        } catch (e) {
            // lol
        }
        return new model.WWWTemplate({
            title: 'Currency',
            page: {
                catalogCount: count,
            }
        });
    }

    @Get('/')
    @Render('index')
    public Index(
        @Res() res: Res,
        @Locals('userInfo') info?: model.UserSession
    ) {
        if (info) {
            return res.redirect('/dashboard');
        }
        return new model.WWWTemplate({
            title: 'Index',
        })
    }

    @Get('/dashboard')
    @Render('dashboard')
    @Use(middleware.auth.YesAuth)
    public dashboard() {
        return new model.WWWTemplate({
            title: 'Dashboard',
        })
    }

    @Get('/avatar')
    @Summary('Customize avatar page')
    @Render('avatar')
    @Use(middleware.auth.YesAuth)
    public avatar() {
        return new model.WWWTemplate({
            title: 'Avatar',
        })
    }

    @Get('/trades')
    @Summary('User trades page/overview')
    @Render('trades')
    @Use(middleware.auth.YesAuth)
    public trades() {
        return new model.WWWTemplate({
            title: 'Trades',
        })
    }

    @Get('/transactions')
    @Summary('User transactions page/overview')
    @Render('transactions')
    @Use(middleware.auth.YesAuth)
    public transactions() {
        return new model.WWWTemplate({
            title: 'Transactions',
        })
    }

    @Get('/ads')
    @Summary('User ads manage page/overview')
    @Render('ad/dashboard')
    @Use(middleware.auth.YesAuth)
    public ads() {
        return new model.WWWTemplate({
            title: 'Ads',
        })
    }

    @Get('/settings')
    @Summary('User account settings')
    @Render('settings')
    @Use(middleware.auth.YesAuth)
    public settings() {
        return new model.WWWTemplate({
            title: 'Settings',
        })
    }

    @Get('/moderation')
    @Summary('User account moderation history/overview')
    @Render('moderation')
    @Use(middleware.auth.YesAuth)
    public moderation() {
        return new model.WWWTemplate({
            title: 'Moderation History',
        })
    }

    @Get('/login')
    @Render('login')
    @Use(middleware.auth.NoAuth)
    public login() {
        return new model.WWWTemplate({
            title: 'Login',
        })
    }

    @Get('/signup')
    @Summary('Signup page')
    @Use(middleware.auth.NoAuth)
    @Render('signup')
    public async signup(
        @Res() res: Res,
        @Req() req: Req,
    ) {
        let referral = undefined;
        if (typeof req.query['r'] === 'string') {
            let referralId = parseInt(req.query['r'], 10);
            console.log('ref is', referralId, typeof referralId);
            // confirm referral is valid
            if (referralId && Number.isInteger(referralId)) {
                referral = await this.UserReferral.getInfoById(referralId);

                let referer = req.headers['referer'];
                if (referer) {
                    const badReferers = [
                        'brick-hill.com',
                        'finobe.com',
                    ];
                    for (const bad of badReferers) {
                        if (referer.indexOf(bad) !== -1) {
                            res.redirect('https://www.google.com');
                            return;
                        }
                    }
                }

            }
        }
        // return
        return new model.WWWTemplate({
            title: "Signup",
            page: {
                referral,
            }
        });
    }

    @Get('/email/verify')
    @Summary('Email verification page')
    @Use(middleware.auth.YesAuth)
    @Render('email_verify')
    public emailVerification(
        @QueryParams('code', String) code: string
    ) {
        return new model.WWWTemplate({ 'title': 'Email Verification', page: { 'code': code } });
    }

    @Get('/request/password-reset')
    @Summary('Request password reset email')
    @Render('request_password_reset')
    @Use(middleware.auth.NoAuth)
    public resetPasswordRequest() {
        return new model.WWWTemplate({
            title: 'Reset Your Password',
            page: {},
        });
    }

    @Get('/reset/password')
    @Summary('Reset the users password from an email URL')
    @Use(middleware.auth.NoAuth)
    @Render('reset_password')
    public async resetPassword(
        @Required()
        @QueryParams('code', String) code: string,
        @Required()
        @QueryParams('userId', Number) userId: number,
    ) {
        return new model.WWWTemplate<{ code: string; userId: number; }>({
            title: 'Reset Password',
            page: {
                code,
                userId,
            }
        });
    }

    @Get('/notifications')
    @Summary('Notifications page')
    @Use(middleware.auth.YesAuth)
    @Render('notifications')
    public loadNotifications() {
        return new model.WWWTemplate({
            title: 'Notifications',
        });
    }

    @Get('/v1/authenticate-to-service')
    @Summary('Authenticate to service')
    @Use(middleware.auth.YesAuth)
    @Render('authenticate-to-service')
    public V1AuthenticationFlow(
        @QueryParams('returnUrl', String) returnUrl: string,
    ) {
        // Try to parse the URL, removing any weird characters
        let parsedUrl = returnUrl.replace(/https:\/\//g, '');
        parsedUrl = parsedUrl.replace(/http:\/\//g, '');
        let positionOfFirstSlash = parsedUrl.indexOf('/');
        if (positionOfFirstSlash !== -1) {
            parsedUrl = parsedUrl.slice(0, positionOfFirstSlash);
        }
        return new model.WWWTemplate<{ url: string; parsedUrl: string }>({
            title: "Sign Into " + parsedUrl,
            page: {
                url: returnUrl,
                parsedUrl: parsedUrl,
            }
        });
    }
}