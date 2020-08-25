import {UsersController} from './Users';
import {expect} from 'chai';
import * as model from '../../models';
import * as viewModel from '../../viewmodels';
const users = new UsersController();
// overwrite services

users.Users = {} as any;
users.Forums = {} as any;
users.Groups = {} as any;
users.Games = {} as any;


describe('UsersController().search', function () {
    it('Should return the search viewmodel', async () => {
        const result = users.search();
        expect(result).to.be.instanceOf(model.WWWTemplate);
        expect(result.title).to.equal('Users');
        // lol this is pretty much all we can do...
    })
});

describe('UsersController.trade()', function () {
    it('Should resolve with user trade data since user can trade', async () => {
        const userId = 25;
        const username = 'UnitTest';
        const tradingEnabled = 1;
        users.Users = {
            getInfo: async (providedId: number) => {
                expect(providedId).to.equal(userId);
                return {
                    userId,
                    username,
                    tradingEnabled,
                }
            },
        } as any;

        const result = await users.trade(userId);
        expect(result).to.be.instanceOf(model.WWWTemplate);
    })
    it('Should reject with 409 UserCannotBeTradedWith since userId has trading disabled', async () => {
        const userId = 25;
        const username = 'UnitTest';
        const tradingEnabled = 0;
        users.Users = {
            getInfo: async (providedId: number) => {
                expect(providedId).to.equal(userId);
                return {
                    userId,
                    username,
                    tradingEnabled,
                }
            },
        } as any;

        try {
            const result = await users.trade(userId);
            throw new Error('Request completed despite user having trading disabled');
        }catch(expectedError) {
            let isConflict = expectedError instanceof users.Conflict;
            console.log('isConflict',isConflict);
            if (isConflict) {
                expect(expectedError.message).to.equal('UserCannotBeTradedWith');
                return;
            }
            throw expectedError;
        }
    })
});

describe('UsersController().inventory, UsersController().groups, UsersController().friends, UsersController().games', function () {
    const methods = [
        'inventory',
        'friends',
        'groups',
        'games',
    ];
    for (const item of methods) {
        it('Should return the requested data ('+item+')', async () => {
            const userId = 25;
            const username = 'UnitTest';
            users.Users = {
                getInfo: async (providedId: number) => {
                    expect(providedId).to.equal(userId);
                    return {
                        userId,
                        username,
                    }
                },
            } as any;
            // @ts-ignore
            const result = await users[item](userId);
            expect(result).to.be.instanceOf(model.WWWTemplate);
            // lol this is pretty much all we can do...
        })
    }
});


describe('UsersController().profile', () => {
    it('Should get user profile viewmodel (normal) ', async () => {
        // default user information
        let userId = 1;
        let username = 'Test';
        let blurb = 'String Blurb Here';
        let status = 0;
        let banned = 0;
        let pastUsernames: string[] = [];
        let postCount = 10;
        // mock forums service
        users.Forums = {
            multiGetUserForumInfo: async (userIdArray: number[]) => {
                console.log('get forum info for',userIdArray);
                // expect(userIdArray.length).to.equal(1);
                // expect(userIdArray[0]).to.equal(userId);
                return [
                    {
                        postCount,
                    }
                ]
            },
        } as any;
        // mock users service
        users.Users = {
            getInfo: async (getInfoUserId: number) => {
                // expect(getInfoUserId).to.equal(userId);
                return {
                    userId,
                    username,
                    blurb,
                    status,
                    banned,
                }
            },
            getPastUsernames: async (getPastID: number) => {
                console.log('get past names for',getPastID);
                // expect(getPastID).to.equal(userId);
                return pastUsernames;
            },
        } as any;

        const result = await users.profile(userId)

        if (!result.page) {
            throw new Error('Page is undefined');
        }
        expect(result).to.be.instanceOf(model.WWWTemplate)
        // expect(result.page).to.be.instanceOf(viewModel.Users.Profile)
        expect(result.page.userId).to.equal(userId);
        expect(result.page.username).to.equal(username);
        expect(result.page.deleted).to.equal(false);
    });
    it('Should get user profile viewmodel (banned)', async () => {
        // default user information
        let userId = 1;
        let username = 'Test';
        let blurb = 'String Blurb Here';
        let status = 1;
        let banned = 1;
        let pastUsernames: string[] = [];
        let postCount = 10;
        // mock forums service
        users.Forums = {
            multiGetUserForumInfo: async (userIdArray: number[]) => {
                expect(userIdArray.length).to.equal(1);
                expect(userIdArray[0]).to.equal(userId);
                return [
                    {
                        postCount,
                    }
                ]
            },
        } as any;
        // mock users service
        users.Users = {
            getInfo: async (getInfoUserId: number) => {
                expect(getInfoUserId).to.equal(userId);
                return {
                    userId,
                    username,
                    blurb,
                    status,
                    banned,
                }
            },
            getPastUsernames: async (getPastID: number) => {
                expect(getPastID).to.equal(userId);
                return pastUsernames;
            },
        } as any;

        const result = await users.profile(userId)

        if (!result.page) {
            throw new Error('Page is undefined');
        }
        expect(result).to.be.instanceOf(model.WWWTemplate)
        // expect(result.page).to.be.instanceOf(viewModel.Users.Profile)
        expect(result.page.deleted).to.equal(true);
        expect(result.page.userId).to.equal(userId);
        expect(result.page.username).to.equal(username);
    });
});