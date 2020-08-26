"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Users_1 = require("./Users");
const chai_1 = require("chai");
const model = require("../../models");
const users = new Users_1.UsersController();
users.Users = {};
users.Forums = {};
users.Groups = {};
users.Games = {};
describe('UsersController().search', function () {
    it('Should return the search viewmodel', async () => {
        const result = users.search();
        chai_1.expect(result).to.be.instanceOf(model.WWWTemplate);
        chai_1.expect(result.title).to.equal('Users');
    });
});
describe('UsersController.trade()', function () {
    it('Should resolve with user trade data since user can trade', async () => {
        const userId = 25;
        const username = 'UnitTest';
        const tradingEnabled = 1;
        users.Users = {
            getInfo: async (providedId) => {
                chai_1.expect(providedId).to.equal(userId);
                return {
                    userId,
                    username,
                    tradingEnabled,
                };
            },
        };
        const result = await users.trade(userId);
        chai_1.expect(result).to.be.instanceOf(model.WWWTemplate);
    });
    it('Should reject with 409 UserCannotBeTradedWith since userId has trading disabled', async () => {
        const userId = 25;
        const username = 'UnitTest';
        const tradingEnabled = 0;
        users.Users = {
            getInfo: async (providedId) => {
                chai_1.expect(providedId).to.equal(userId);
                return {
                    userId,
                    username,
                    tradingEnabled,
                };
            },
        };
        try {
            const result = await users.trade(userId);
            throw new Error('Request completed despite user having trading disabled');
        }
        catch (expectedError) {
            let isConflict = expectedError instanceof users.Conflict;
            console.log('isConflict', isConflict);
            if (isConflict) {
                chai_1.expect(expectedError.message).to.equal('UserCannotBeTradedWith');
                return;
            }
            throw expectedError;
        }
    });
});
describe('UsersController().inventory, UsersController().groups, UsersController().friends, UsersController().games', function () {
    const methods = [
        'inventory',
        'friends',
        'groups',
        'games',
    ];
    for (const item of methods) {
        it('Should return the requested data (' + item + ')', async () => {
            const userId = 25;
            const username = 'UnitTest';
            users.Users = {
                getInfo: async (providedId) => {
                    chai_1.expect(providedId).to.equal(userId);
                    return {
                        userId,
                        username,
                    };
                },
            };
            const result = await users[item](userId);
            chai_1.expect(result).to.be.instanceOf(model.WWWTemplate);
        });
    }
});
describe('UsersController().profile', () => {
    it('Should get user profile viewmodel (normal) ', async () => {
        let userId = 1;
        let username = 'Test';
        let blurb = 'String Blurb Here';
        let status = 0;
        let banned = 0;
        let pastUsernames = [];
        let postCount = 10;
        users.Forums = {
            multiGetUserForumInfo: async (userIdArray) => {
                console.log('get forum info for', userIdArray);
                return [
                    {
                        postCount,
                    }
                ];
            },
        };
        users.Users = {
            getInfo: async (getInfoUserId) => {
                return {
                    userId,
                    username,
                    blurb,
                    status,
                    banned,
                };
            },
            getPastUsernames: async (getPastID) => {
                console.log('get past names for', getPastID);
                return pastUsernames;
            },
        };
        const result = await users.profile(userId);
        if (!result.page) {
            throw new Error('Page is undefined');
        }
        chai_1.expect(result).to.be.instanceOf(model.WWWTemplate);
        chai_1.expect(result.page.userId).to.equal(userId);
        chai_1.expect(result.page.username).to.equal(username);
        chai_1.expect(result.page.deleted).to.equal(false);
    });
    it('Should get user profile viewmodel (banned)', async () => {
        let userId = 1;
        let username = 'Test';
        let blurb = 'String Blurb Here';
        let status = 1;
        let banned = 1;
        let pastUsernames = [];
        let postCount = 10;
        users.Forums = {
            multiGetUserForumInfo: async (userIdArray) => {
                chai_1.expect(userIdArray.length).to.equal(1);
                chai_1.expect(userIdArray[0]).to.equal(userId);
                return [
                    {
                        postCount,
                    }
                ];
            },
        };
        users.Users = {
            getInfo: async (getInfoUserId) => {
                chai_1.expect(getInfoUserId).to.equal(userId);
                return {
                    userId,
                    username,
                    blurb,
                    status,
                    banned,
                };
            },
            getPastUsernames: async (getPastID) => {
                chai_1.expect(getPastID).to.equal(userId);
                return pastUsernames;
            },
        };
        const result = await users.profile(userId);
        if (!result.page) {
            throw new Error('Page is undefined');
        }
        chai_1.expect(result).to.be.instanceOf(model.WWWTemplate);
        chai_1.expect(result.page.deleted).to.equal(true);
        chai_1.expect(result.page.userId).to.equal(userId);
        chai_1.expect(result.page.username).to.equal(username);
    });
});
