"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Staff_1 = require("./Staff");
const chai_1 = require("chai");
const model = require("../../models");
const staff = new Staff_1.WWWStaffController();
staff.Users = {};
staff.Forums = {};
staff.Games = {};
staff.Support = {};
staff.Staff = {};
describe('StaffController.almost everything()', () => {
    const methods = [
        'searchUsers',
        'staffTickets',
        'editBanner',
        'giveCurrency',
        'giveItem',
        'reportAbuseUserStatus',
        'catalogPending',
        'resetPassword',
        'unban',
        'ban',
        'currencyProductEditor',
        'createItem',
        'directoryStaff',
        'listOfStaff',
    ];
    for (const method of methods) {
        it('Should return WWWTemplate (' + method + ')', () => {
            const res = staff[method]();
            chai_1.expect(res).to.be.instanceOf(model.WWWTemplate);
        });
    }
});
describe('StaffController.modifyForums()', () => {
    it('Should resolve with wwwtemplate and forum cats/subcats', async () => {
        const cats = [
            {
                categoryId: 1,
            },
            {
                categoryId: 2,
            }
        ];
        const subs = [
            {
                categoryId: 1,
            },
            {
                categoryId: 2,
            }
        ];
        staff.Forums = {
            getCategories: async () => {
                return cats;
            },
            getSubCategories: async () => {
                return subs;
            },
        };
        const results = await staff.modifyForums({ userId: 1, username: 'hello' }, '');
        chai_1.expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('Page is undefined');
        }
        chai_1.expect(results.page.cats).to.be.an('array');
        chai_1.expect(results.page.subs).to.be.an('array');
    });
});
describe('StaffController.moderationGroup()', () => {
    it('Should resolve with wwwtemplate and group info', async () => {
        const groupId = 1;
        staff.Groups = {
            getInfo: (providedId) => {
                chai_1.expect(providedId).to.equal(groupId);
                return {
                    groupId,
                };
            }
        };
        const results = await staff.moderationGroup(groupId);
        chai_1.expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('Page is undefined');
        }
        chai_1.expect(typeof results.page.groupInfo).to.equal('object');
        chai_1.expect(results.page.groupInfo.groupId).to.equal(groupId);
    });
});
describe('StaffController.modifyUserInventory()', () => {
    it('Should resolve with wwwtemplate and user info', async () => {
        const userId = 1;
        staff.Users = {
            getInfo: (providedId) => {
                chai_1.expect(providedId).to.equal(userId);
                return {
                    userId,
                };
            }
        };
        const results = await staff.modifyUserInventory(userId, '');
        chai_1.expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('Page is undefined');
        }
        chai_1.expect(typeof results.page.profileData).to.equal('object');
        chai_1.expect(results.page.profileData.userId).to.equal(userId);
    });
});
