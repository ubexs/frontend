import base from '../base';
import {Controller, Get, Header, HeaderParams, Render, Use, Res, Locals, PathParams} from '@tsed/common';
import * as model from '../../models/index';
import * as middleware from '../../middleware/v1';
import {Summary} from "@tsed/swagger";

@Controller('/users')
export class UsersController extends base {

    @Get('/')
    @Render('users/index')
    @Summary('Users search page')
    public search() {
        return new model.WWWTemplate({
            title: 'Users',
        })
    }

    @Get('/:userId/profile')
    @Summary("Get the {userId}'s profile, or 404 if N/A")
    @Render('users/profile')
    public async profile(
        @PathParams('userId', Number) userId: number
    ) {
        // Grab user info
        let userData = await this.Users.getInfo(userId);
        let ViewData = new model.WWWTemplate({ title: userData.username+`'s Profile` });
        // If deleted, throw 404
        // we don't need this anymore since the above will throw 404 if the user is deleted anyway...
        /*
        if (userData.accountStatus === model.Users.accountStatus.deleted) {
            throw new this.NotFound('InvalidUserId');
        }
         */
        // Grab username changes (if any)
        let usernameChanges = await this.Users.getPastUsernames(userId);
        let filteredBlurb = '';
        // Process Blurb
        if (typeof userData.blurb === 'string') {
            // Define currency stuff:
            // Currency Variable Check
            const primarySpan = '<span style="color:#28a745;margin-right: -3px;"><img alt="$" style="height: 1rem;" src="https://cdn.blockshub.net/static/money-green-2.svg"/> </span>';
            const secondarySpan = '<span style="color:#ffc107;margin-right: -3px;"><img alt="$" style="height: 1rem;" src="https://cdn.blockshub.net/static/coin-stack-yellow.svg"/> </span>';
            // Define XSS Filter
            const xssfilter = new this.xss.FilterXSS({
                whiteList: {

                }
            });
            filteredBlurb = xssfilter.process(userData.blurb);
            // temporarily disabled while backend works on new method to get this data...
            /*
            // If blurb contains variables
            if (filteredBlurb && filteredBlurb.match(/\${primary}/g) || filteredBlurb && filteredBlurb.match(/\${secondary}/g)) {
                // Grab Balance
                const balances = await this.Users.getInfo(userId);
                // Setup Blurb
                filteredBlurb = filteredBlurb.replace(/\${primary}/g, '<span style="color: #28a745;">' + primarySpan + ' ' + this.numberWithCommas(balances.primaryBalance) + '</span>');
                filteredBlurb = filteredBlurb.replace(/\${secondary}/g, '<span style="color: #ffc107;">' + secondarySpan + ' ' + this.numberWithCommas(balances.secondaryBalance) + '</span>');
            }
             */
        }
        const forumData = await this.Forums.multiGetUserForumInfo([
            userData.userId,
        ]);
        // Setup View Info
        ViewData.page.userId = userData.userId;
        ViewData.page.username = userData.username;
        ViewData.page.blurb = filteredBlurb;
        ViewData.page.forumPostCount = forumData[0].postCount;
        ViewData.page.status = userData.status;
        ViewData.page.tradingEnabled = userData.tradingEnabled;
        ViewData.page.staff = userData.staff;
        ViewData.page.usernameChanges = usernameChanges;
        // If deleted, mark as deleted
        if (userData.banned !== 0) {
            ViewData.page.deleted = true;
        }
        ViewData.page.joinDate = this.moment(userData.joinDate);
        ViewData.page.lastOnline = this.moment(userData.lastOnline);
        // Show user as online if active in last 3 minutes
        ViewData.page.online = this.moment(userData.lastOnline).isSameOrAfter(this.moment().subtract(3, 'minutes'));
        return ViewData;
    }

    @Get('/:userId/inventory')
    @Summary("Get the inventory page for the {userId}, or 404 if N/A")
    @Render('users/inventory')
    public async inventory(
        @PathParams('userId', Number) userId: number
    ) {
        // Grab user info
        let userData = await this.Users.getInfo(userId);
        return new model.WWWTemplate({
            title: userData.username + "'s Inventory",
            page: userData,
        })
    }

    @Get('/:userId/friends')
    @Summary("Get the friends page for the {userId}, or 404 if N/A")
    @Render('users/friends')
    public async friends(
        @PathParams('userId', Number) userId: number
    ) {
        // Grab user info
        let userData = await this.Users.getInfo(userId);
        return new model.WWWTemplate({
            title: userData.username + "'s Friends",
            page: userData,
        })
    }

    @Get('/:userId/groups')
    @Summary("Get the groups page for the {userId}, or 404 if N/A")
    @Render('users/groups')
    public async groups(
        @PathParams('userId', Number) userId: number
    ) {
        // Grab user info
        let userData = await this.Users.getInfo(userId);
        return new model.WWWTemplate({
            title: userData.username + "'s Groups",
            page: userData,
        })
    }

    @Get('/:userId/games')
    @Summary("Get the games page for the {userId}, or 404 if N/A")
    @Render('users/games')
    public async games(
        @PathParams('userId', Number) userId: number
    ) {
        // Grab user info
        let userData = await this.Users.getInfo(userId);
        return new model.WWWTemplate({
            title: userData.username + "'s Games",
            page: userData,
        })
    }

    @Get('/:userId/trade')
    @Summary("Get the trade page for the {userId}, 404 if invalid userId/terminated, or 409 if cannot trade")
    @Render('users/trade')
    public async trade(
        @PathParams('userId', Number) userId: number
    ) {
        // Grab user info
        let userData = await this.Users.getInfo(userId);
        if (userData.tradingEnabled !== 1) {
            throw new this.Conflict('UserCannotBeTradedWith');
        }
        return new model.WWWTemplate({
            title: userData.username + "'s Games",
            page: userData,
        })
    }
}