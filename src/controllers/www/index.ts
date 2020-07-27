import base from '../base';
import {Controller, Get, Locals, QueryParams, Redirect, Render, Req, Required, Res, Use} from '@tsed/common';
import * as model from '../../models/index';
import * as middleware from '../../middleware/v1';
import {Summary} from "@tsed/swagger";

@Controller('/')
export class GenericWWWController extends base {

    // idk why this exists...
    @Get('/perf.txt')
    @Summary('Perf')
    public performanceTest() {
        return 'BWS OK';
    }

    @Get('/discord')
    @Redirect(302, 'https://discord.gg/CAjZfcZ')
    public redirectToDiscord() {}

    @Get('/play')
    @Redirect(302, '/game/play')
    public redirectOldPlayPage() {}

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
            // disabled for now. gotta wait for the api to make this available...
            // count = await this.Catalog.countAllItemsForSale();
        }catch(e) {
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
    public dashboard(
        @Res() res: Res,
        @Locals('userInfo') info: model.UserSession
    ) {
        return new model.WWWTemplate({
            title: 'Dashboard',
        })
    }

    // Ban Redirect
    @Get('/membership/notapproved.aspx')
    @Redirect('/')
    public redirectIfNoLongerBanned() { }

    @Get('/avatar')
    @Summary('Customize avatar page')
    @Render('avatar')
    @Use(middleware.auth.YesAuth)
    public avatar(
        @Res() res: Res,
        @Locals('userInfo') info: model.UserSession
    ) {
        return new model.WWWTemplate({
            title: 'Avatar',
        })
    }

    @Get('/trades')
    @Summary('User trades page/overview')
    @Render('trades')
    @Use(middleware.auth.YesAuth)
    public trades(
        @Res() res: Res,
        @Locals('userInfo') info: model.UserSession
    ) {
        return new model.WWWTemplate({
            title: 'Trades',
        })
    }

    @Get('/transactions')
    @Summary('User transactions page/overview')
    @Render('transactions')
    @Use(middleware.auth.YesAuth)
    public transactions(
        @Res() res: Res,
        @Locals('userInfo') info: model.UserSession
    ) {
        return new model.WWWTemplate({
            title: 'Transactions',
        })
    }

    @Get('/ads')
    @Summary('User ads manage page/overview')
    @Render('ad/dashboard')
    @Use(middleware.auth.YesAuth)
    public ads(
        @Res() res: Res,
        @Locals('userInfo') info: model.UserSession
    ) {
        return new model.WWWTemplate({
            title: 'Ads',
        })
    }

    @Get('/settings')
    @Summary('User account settings')
    @Render('settings')
    @Use(middleware.auth.YesAuth)
    public settings(
        @Res() res: Res,
        @Locals('userInfo') info: model.UserSession
    ) {
        return new model.WWWTemplate({
            title: 'Settings',
        })
    }

    @Get('/moderation')
    @Summary('User account moderation history/overview')
    @Render('moderation')
    @Use(middleware.auth.YesAuth)
    public moderation(
        @Res() res: Res,
        @Locals('userInfo') info: model.UserSession
    ) {
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
        @QueryParams('r', Number) referralId?: number,
    ) {
        // confirm referral is valid
        let referral = undefined;
        if (referralId) {
            referral = await this.UserReferral.getInfoById(referralId);

            let referer = req.headers['referer'];
            if (referer) {
                const badReferers = [
                    'brick-hill.com',
                    'finobe.com',
                ];
                for (const bad of badReferers) {
                    if (referer.indexOf(bad)) {
                        res.redirect('https://www.google.com');
                        return;
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
        return new model.WWWTemplate({'title': 'Email Verification', page: {'code': code}});
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
        return new model.WWWTemplate({
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
        @Locals('userInfo') userInfo: model.UserSession,
        @QueryParams('returnUrl', String) returnUrl: string,
    ) {
        // Try to parse the URL, removing any weird characters
        let parsedUrl = returnUrl.replace(/https:\/\//g, '');
        parsedUrl = parsedUrl.replace(/http:\/\//g, '');
        let positionOfFirstSlash = parsedUrl.indexOf('/');
        if (positionOfFirstSlash !== -1) {
            parsedUrl = parsedUrl.slice(0, positionOfFirstSlash);
        }
        return new model.WWWTemplate({
            title: "Sign Into "+parsedUrl,
            userInfo: userInfo,
            page: {
                url: returnUrl,
                parsedUrl: parsedUrl,
            }
        });
    }
}