import { WWWStaffController } from './Staff';
import { expect } from 'chai';
import * as model from '../../models';
import * as viewModel from '../../viewmodels';
const staff = new WWWStaffController();

// overwrite services
staff.Users = {} as any;
staff.Forums = {} as any;
staff.Games = {} as any;
staff.Support = {} as any;
staff.Staff = {} as any;

// If you ever need proof testing controllers is useless 99% of the time, here ya go
describe('StaffController.almost everything()', () => {
    const methods = [
        'searchUsers',
        'staffTickets',
        'editBanner',
        // 'modifyUserInventory',
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
            // @ts-ignore
            const res = staff[method]();
            expect(res).to.be.instanceOf(model.WWWTemplate);
        })
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
        ]
        staff.Forums = {
            getCategories: async () => {
                return cats;
            },
            getSubCategories: async () => {
                return subs;
            },
        } as any;

        // @ts-ignore
        const results = await staff.modifyForums({ userId: 1, username: 'hello' }, '');
        expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('Page is undefined');
        }
        expect(results.page.cats).to.be.an('array');
        expect(results.page.subs).to.be.an('array');
    });
});

describe('StaffController.moderationGroup()', () => {
    it('Should resolve with wwwtemplate and group info', async () => {
        const groupId = 1;

        staff.Groups = {
            getInfo: (providedId: number) => {
                expect(providedId).to.equal(groupId);
                return {
                    groupId,
                }
            }
        } as any;

        const results = await staff.moderationGroup(groupId, '');
        expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('Page is undefined');
        }
        expect(typeof results.page.groupInfo).to.equal('object');
        expect(results.page.groupInfo.groupId).to.equal(groupId);
    });
});

describe('StaffController.modifyUserInventory()', () => {
    it('Should resolve with wwwtemplate and user info', async () => {
        const userId = 1;

        staff.Users = {
            getInfo: (providedId: number) => {
                expect(providedId).to.equal(userId);
                return {
                    userId,
                }
            }
        } as any;

        const results = await staff.modifyUserInventory(userId, '');
        expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('Page is undefined');
        }
        expect(typeof results.page.profileData).to.equal('object');
        expect(results.page.profileData.userId).to.equal(userId);
    });
});