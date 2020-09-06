import { Controller, Get, All, Next, Req, Res, UseBefore, Render, QueryParams, PathParams, Redirect, Response, Request, Locals, UseAfter, Required, Use, UseBeforeEach, HeaderParams, Cookies } from "@tsed/common";
import base from '../base'
// Models
import * as model from '../../models'
import * as middleware from '../../middleware/v1';
import { Summary } from "@tsed/swagger";
const { YesAuth, NoAuth } = middleware.auth;


@Controller("/")
@UseBefore(middleware.staff.AddPermissionsToLocals)
export class WWWStaffController extends base {
    constructor() {
        super();
    }

    @Get('/staff')
    @Render('staff_users')
    public listOfStaff() {
        return new model.WWWTemplate({ title: 'Staff' });
    }

    @Get('/staff/directory')
    @Use(YesAuth)
    @Render('staff/index')
    public directoryStaff() {
        return new model.WWWTemplate({ title: 'Staff Directory' });
    }

    @Get('/staff/create')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.UploadStaffAssets))
    @Render('staff/create')
    public createItem() {
        return new model.WWWTemplate({ title: 'Staff Create' });
    }

    @Get('/staff/currency-product')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManageCurrencyProducts))
    @Render('staff/currency_product')
    public currencyProductEditor() {
        return new model.WWWTemplate({ title: 'Currency Products' });
    }

    @Get('/staff/ban')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.BanUser))
    @Render('staff/ban')
    public ban() {
        return new model.WWWTemplate({ title: 'Ban a User' });
    }

    @Get('/staff/unban')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.UnbanUser))
    @Render('staff/unban')
    public unban() {
        return new model.WWWTemplate({ title: 'Unban a User' });
    }

    @Get('/staff/password')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ResetPassword))
    @Render('staff/password')
    public resetPassword() {
        return new model.WWWTemplate({ title: 'Reset a password' });
    }

    @Get('/staff/catalog')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ReviewPendingItems))
    @Render('staff/catalog_moderation')
    public catalogPending() {
        return new model.WWWTemplate({ title: 'Items Awaiting Moderator Approval' });
    }

    @Get('/staff/report-abuse/user-status')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ReviewAbuseReports))
    @Render('staff/report-abuse/user-status')
    public reportAbuseUserStatus() {
        return new model.WWWTemplate({ title: 'User Status Reports' });
    }

    @Get('/staff/give')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.GiveItemToUser))
    @Render('staff/give')
    public giveItem() {
        return new model.WWWTemplate({ title: 'Give an Item' });
    }

    @Get('/staff/give/currency')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.GiveCurrencyToUser))
    @Render('staff/give_currency')
    public giveCurrency() {
        return new model.WWWTemplate({ title: 'Give Currency' });
    }

    @Get('/staff/user/inventory')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.GiveItemToUser, model.Staff.Permission.TakeItemFromUser))
    @Render('staff/user/inventory')
    public async modifyUserInventory(
        @Required()
        @QueryParams('userId', Number) userId: number,
        @HeaderParams('cookie') cookie: string,
    ) {
        let s = new base({ cookie })
        let infoOfUserToEdit = await s.Users.getInfo(userId);
        return new model.WWWTemplate<any>({
            title: 'Modify User Inventory', page: {
                profileData: infoOfUserToEdit
            }
        });
    }

    @Get('/staff/banner')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManageBanner))
    @Render('staff/banner')
    public editBanner() {
        return new model.WWWTemplate({ title: 'Edit Banner' });
    }

    @Get('/staff/user/profile')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ReviewUserInformation))
    @Render('staff/user/profile')
    public async moderationProfile(
        @Locals('userInfo') localUserData: model.UserSession,
        @QueryParams('userId') userId: any,
        @Req() req: Req,
    ) {
        let s = new base({ cookie: req.headers['cookie'] });
        let userInfo: any = await s.Users.getInfo(userId);
        let moderationHistory;
        let isOnline = false;
        let isOver13 = false;
        let isEmailVerified = false;
        let userEmails: any[] = [];
        let twoFactorEnabled = false;
        let allStaffPermissionTypes = model.Staff.Permission;
        let alreadySelectedPermissions = await s.Staff.getPermissions(userId);
        try {

            userInfo = await s.Users.getInfo(userId, ['accountStatus', 'userId', 'username', 'primaryBalance', 'secondaryBalance', 'blurb', 'staff', 'birthDate', 'dailyAward', 'lastOnline', 'status', 'joinDate', 'forumSignature', '2faEnabled', 'isDeveloper']);
            if (userInfo['2faEnabled'] === 1) {
                twoFactorEnabled = true;
            }
            if (this.moment().isSameOrAfter(this.moment(userInfo.birthDate).add(13, 'years'))) {
                isOver13 = true;
            }
            if (this.moment(userInfo.lastOnline).isSameOrAfter(this.moment().subtract(5, 'minutes'))) {
                isOnline = true;
            }
            moderationHistory = await s.Staff.getModerationHistory(userId);

            const emailInfo = await s.Staff.getUserEmail(userId);
            if (emailInfo && emailInfo.status === 1) {
                isEmailVerified = true;
            }
            userEmails = await s.Staff.getUserEmails(userId);

        } catch (e) {
            console.log(e);
            throw new this.BadRequest('InvalidUserId');
        }
        let ViewData = new model.WWWTemplate<any>({ 'title': userInfo.username + "'s Moderation Profile" });
        ViewData.page = {};
        ViewData.page.online = isOnline;
        ViewData.page.isOver13 = isOver13;
        ViewData.page.isEmailVerified = isEmailVerified;
        ViewData.page.userInfo = userInfo;
        ViewData.page.ModerationHistory = moderationHistory;
        ViewData.page.userEmails = userEmails;
        ViewData.page.twoFactorEnabled = twoFactorEnabled;

        const staffPermissionSelect: { string: string; selected: boolean }[] = [];
        let currentUserInfo = await s.Staff.getPermissions(userInfo.userId);
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
        @Required()
        @QueryParams('groupId', Number) groupId: number
    ) {
        groupId = base.ValidateId(groupId);
        let groupInfo = await this.Groups.getInfo(groupId);
        let ViewData = new model.WWWTemplate<any>({ 'title': "Manage \"" + groupInfo.groupName + "\"" });
        ViewData.page = {
            groupInfo: groupInfo,
        };
        return ViewData;
    }

    @Get('/staff/forums')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManageForumCategories))
    @Render('staff/forums')
    public async modifyForums(
        @Locals('userInfo') userData: model.UserSession,
        @HeaderParams('cookie') cookie: string,
    ) {
        let s = new base({ cookie });
        let cats: any = await s.Forums.getCategories();
        let subs: any = await s.Forums.getSubCategories(userData.staff);
        for (const sub of subs) {
            for (const cat of cats) {
                if (sub.categoryId === cat.categoryId) {
                    sub['category'] = cat;
                }
            }
        }
        return new model.WWWTemplate({
            title: 'Modify Forum Categories/SubCategories',
            page: {
                subs: subs,
                cats: cats,
            }
        });
    }

    @Get('/staff/tickets')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManageSupportTickets))
    @Render('staff/tickets')
    public staffTickets() {
        return new model.WWWTemplate({ title: 'View Tickets Awaiting Response' });
    }

    @Get('/staff/user/search')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ReviewUserInformation))
    @Render('staff/user/search')
    public searchUsers() {
        return new model.WWWTemplate({ title: 'Search Users' });
    }

    /*
    @Get('/staff/user/search_results')
    @Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManagePublicUserInfo))
    @Render('staff/user/search_results')
    public async searchUsersResults(
        @Req() req: Req,
    ) {
        // has to be moved to json api...
    }
    */
}
