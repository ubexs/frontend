import { Controller, Get, All, Next, Req, Res, UseBefore, Render, QueryParams, PathParams, Redirect, Response, Request, Locals, UseAfter, Required, Use, UseBeforeEach } from "@tsed/common";
import base from '../base'
// Models
import * as model from '../../models'
import * as middleware from '../../middleware/v1';
const {YesAuth, NoAuth} = middleware.auth;


@Controller("/")
@UseBefore(middleware.staff.AddPermissionsToLocals)
export class WWWStaffController extends base {
    constructor() {
        super();
    }

    @Get('/staff')
    @Render('staff_users')
    public async listOfStaff() {
        return new model.WWWTemplate({title: 'Staff'});
    }

    @Get('/staff/directory')
    @Use(YesAuth)
    @Render('staff/index')
    public async directoryStaff(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        return new model.WWWTemplate({title: 'Staff Directory', userInfo: userInfo});
    }

    @Get('/staff/create')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.UploadStaffAssets))
    @Render('staff/create')
    public async createItem(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        return new model.WWWTemplate({title: 'Staff Create', userInfo: userInfo});
    }

    @Get('/staff/currency-product')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManageCurrencyProducts))
    @Render('staff/currency_product')
    public async currencyProductEditor(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        return new model.WWWTemplate({title: 'Currency Products', userInfo: userInfo});
    }

    @Get('/staff/ban')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.BanUser))
    @Render('staff/ban')
    public async ban(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        return new model.WWWTemplate({title: 'Ban a User', userInfo: userInfo});
    }

    @Get('/staff/unban')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.UnbanUser))
    @Render('staff/unban')
    public async unban(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        return new model.WWWTemplate({title: 'Unban a User', userInfo: userInfo});
    }

    @Get('/staff/password')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ResetPassword))
    @Render('staff/password')
    public async resetPassword(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        return new model.WWWTemplate({title: 'Reset a password', userInfo: userInfo});
    }

    @Get('/staff/catalog')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ReviewPendingItems))
    @Render('staff/catalog_moderation')
    public async catalogPending(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        return new model.WWWTemplate({title: 'Items Awaiting Moderator Approval', userInfo: userInfo});
    }

    @Get('/staff/report-abuse/user-status')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ReviewAbuseReports))
    @Render('staff/report-abuse/user-status')
    public async reportAbuseUserStatus(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        return new model.WWWTemplate({title: 'User Status Reports', userInfo: userInfo});
    }

    @Get('/staff/give')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.GiveItemToUser))
    @Render('staff/give')
    public async giveItem(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        return new model.WWWTemplate({title: 'Give an Item', userInfo: userInfo});
    }

    @Get('/staff/give/currency')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.GiveCurrencyToUser))
    @Render('staff/give_currency')
    public async giveCurrency(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        return new model.WWWTemplate({title: 'Give Currency', userInfo: userInfo});
    }

    @Get('/staff/user/inventory')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.GiveItemToUser, model.Staff.Permission.TakeItemFromUser))
    @Render('staff/user/inventory')
    public async modifyUserInventory(
        @Locals('userInfo') userInfo: model.UserSession,
        @Required()
        @QueryParams('userId', Number) userId: number,
    ) {
        let infoOfUserToEdit = await this.Users.getInfo(userId);
        console.log('info', infoOfUserToEdit);
        return new model.WWWTemplate({title: 'Modify User Inventory', userInfo: userInfo, page: {
                profileData: infoOfUserToEdit
            }});
    }

    @Get('/staff/banner')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManageBanner))
    @Render('staff/banner')
    public async editBanner(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        return new model.WWWTemplate({title: 'Edit Banner', userInfo: userInfo});
    }

    @Get('/staff/user/profile')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ReviewUserInformation))
    @Render('staff/user/profile')
    public async moderationProfile(
        @Locals('userInfo') localUserData: model.UserSession,
        @Required()
        @QueryParams('userId', Number) userId: number
    ) {
        const staff = localUserData.staff > 1;
        if (!staff) {
            throw new this.BadRequest('InvalidPermissions');
        }
        let userInfo = await this.Users.getInfo(userId);
        let moderationHistory;
        let isOnline = false;
        let isOver13 = false;
        let isEmailVerified = false;
        let userEmails: any[] = [];
        let twoFactorEnabled = false;
        let allStaffPermissionTypes = model.Staff.Permission;
        let alreadySelectedPermissions = await this.Staff.getPermissions(userId);
        try {
            /*
            userInfo = await this.Users.getInfo(userId, ['accountStatus','userId','username','primaryBalance','secondaryBalance','blurb','staff','birthDate','dailyAward','lastOnline','status','joinDate','forumSignature', '2faEnabled', 'isDeveloper']);
            if (userInfo['2faEnabled'] === 1) {
                twoFactorEnabled = true;
            }
            if (moment().isSameOrAfter(moment(userInfo.birthDate).add(13, 'years'))) {
                isOver13 = true;
            }
            if (moment(userInfo.lastOnline).isSameOrAfter(moment().subtract(5, 'minutes'))) {
                isOnline = true;
            }
            moderationHistory = await this.staff.getModerationHistory(userId);

            const emailInfo = await this.settings.getUserEmail(userId);
            if (emailInfo && emailInfo.status === model.user.emailVerificationType.true) {
                isEmailVerified = true;
            }
            userEmails = await this.settings.getUserEmails(userId);
             */
        }catch(e) {
            console.log(e);
            throw new this.BadRequest('InvalidUserId');
        }
        let ViewData = new model.WWWTemplate({'title': userInfo.username+"'s Moderation Profile"});
        ViewData.page.online = isOnline;
        ViewData.page.isOver13 = isOver13;
        ViewData.page.isEmailVerified = isEmailVerified;
        ViewData.page.userInfo = userInfo;
        ViewData.page.ModerationHistory = moderationHistory;
        ViewData.page.userEmails = userEmails;
        ViewData.page.twoFactorEnabled = twoFactorEnabled;

        const staffPermissionSelect: {string: string; selected: boolean}[] = [];
        let currentUserInfo = await this.Staff.getPermissions(userInfo.userId);
        if (currentUserInfo.includes(model.Staff.Permission.ManageStaff) || localUserData.staff >= 100) {
            for (const perm of alreadySelectedPermissions) {
                let int = parseInt(perm as any, 10);
                if (!isNaN(int)) {
                    let str = model.Staff.Permission[int];
                    staffPermissionSelect.push({
                        string: str,
                        selected: true,
                    })
                }
            }

            for (const extraPerm in allStaffPermissionTypes) {
                let int = parseInt(extraPerm as any, 10);
                if (isNaN(int)) {
                    let isIncluded = false;
                    for (const val of staffPermissionSelect) {
                        if (val.string === extraPerm) {
                            isIncluded = true;
                            break;
                        }
                    }
                    if (!isIncluded) {
                        staffPermissionSelect.push({
                            string: extraPerm,
                            selected: false,
                        })
                    }
                }
            }
        }
        ViewData.page.staffPermissionSelect = staffPermissionSelect;
        return ViewData;
    }

    @Get('/staff/groups/manage')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManageGroup))
    @Render('staff/groups/manage')
    public async moderationGroup(
        @Locals('userInfo') localUserData: model.UserSession,
        @Required()
        @QueryParams('groupId', Number) groupId: number
    ) {
        const staff = localUserData.staff >= 2;
        if (!staff) {
            throw new this.BadRequest('InvalidPermissions');
        }
        let groupInfo: model.Groups.groupDetails;
        try {
            groupInfo = await this.Groups.getInfo(groupId);
        }catch(e) {
            console.log(e);
            throw new this.BadRequest('InvalidGroupId');
        }
        let ViewData = new model.WWWTemplate({'title': "Manage \""+groupInfo.groupName+"\""});
        ViewData.page = {
            groupInfo: groupInfo,
        };
        return ViewData;
    }

    @Get('/staff/forums')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManageForumCategories))
    @Render('staff/forums')
    public async modifyForums(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        let cats: any = await this.Forums.getCategories();
        let subs: any = await this.Forums.getSubCategories();
        for (const sub of subs) {
            for (const cat of cats) {
                if (sub.categoryId === cat.categoryId) {
                    sub['category'] = cat;
                }
            }
        }
        return new model.WWWTemplate({title: 'Modify Forum Categories/SubCategories', userInfo: userInfo, page: {
                subs: subs,
                cats: cats,
            }});
    }

    @Get('/staff/tickets')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManageSupportTickets))
    @Render('staff/tickets')
    public async staffTickets(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        return new model.WWWTemplate({title: 'View Tickets Awaiting Response', userInfo: userInfo});
    }

    @Get('/staff/user/search')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ReviewUserInformation))
    @Render('staff/user/search')
    public async searchUsers(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        return new model.WWWTemplate({title: 'Search Users', userInfo: userInfo});
    }

    @Get('/staff/user/search_results')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManagePublicUserInfo))
    @Render('staff/user/search_results')
    public async searchUsersResults(
        @Locals('userInfo') userInfo: model.UserSession,
        @Req() req: Req,
    ) {
        // has to be moved to json api...
    }
}
