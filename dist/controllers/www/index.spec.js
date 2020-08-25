"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const chai_1 = require("chai");
const model = require("../../models");
const www = new index_1.GenericWWWController();
www.Users = {};
www.Forums = {};
www.Games = {};
www.Support = {};
www.Staff = {};
describe('www.performanceTest()', () => {
    it('Should return string ', () => {
        const res = www.performanceTest();
        chai_1.expect(res).to.be.a('string');
    });
});
describe('www.almost everything()', () => {
    const methods = [
        'Terms',
        'dashboard',
        'avatar',
        'trades',
        'transactions',
        'ads',
        'settings',
        'moderation',
        'login',
        'resetPasswordRequest',
        'loadNotifications',
    ];
    for (const method of methods) {
        it('Should return WWWTemplate (' + method + ')', () => {
            const res = www[method]();
            chai_1.expect(res).to.be.instanceOf(model.WWWTemplate);
        });
    }
});
describe('www.V1AuthenticationFlow', () => {
    it('Should accept valid domain and return WWW data', async () => {
        const url = 'https://www.good-service.com/redirect';
        const expectedDisplayUrl = 'www.good-service.com';
        const results = await www.V1AuthenticationFlow(url);
        chai_1.expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('Page is undefined');
        }
        chai_1.expect(results.page.url).to.equal(url);
        chai_1.expect(results.page.parsedUrl).to.equal(expectedDisplayUrl);
    });
});
describe('www.resetPassword', () => {
    it('Should accept a valid code and return WWWtemplate', async () => {
        const code = 'gwaiuhogwauhoiwag';
        const userId = 1234;
        const results = await www.resetPassword(code, userId);
        chai_1.expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('Page is undefined');
        }
        chai_1.expect(results.page.code).to.equal(code);
        chai_1.expect(results.page.userId).to.equal(userId);
    });
});
describe('www.emailVerification', () => {
    it('Should accept a valid code and return WWWtemplate', async () => {
        const code = 'gwaiuhogwauhoiwag';
        const userId = 1234;
        const results = await www.emailVerification(code);
        chai_1.expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('Page is undefined');
        }
        chai_1.expect(results.page.code).to.equal(code);
    });
});
describe('www.buyCurrency', () => {
    it('Should count assets and return WWWtemplate', async () => {
        const itemCount = 25155;
        const session = undefined;
        www.Catalog = {
            countAllItemsForSale: async () => {
                return itemCount;
            }
        };
        const results = await www.buyCurrency();
        chai_1.expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('results.page is undefined');
        }
        chai_1.expect(results.page.catalogCount).to.equal(itemCount);
    });
    it('Should count assets, fail (default to 1500), and return WWWtemplate', async () => {
        const expectedItemCount = 1500;
        const session = undefined;
        www.Catalog = {
            countAllItemsForSale: async () => {
                throw new Error('Maybe pretend this is a 500 error?');
            }
        };
        const results = await www.buyCurrency();
        chai_1.expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('results.page is undefined');
        }
        chai_1.expect(results.page.catalogCount).to.equal(expectedItemCount);
    });
});
describe('www.Index', () => {
    it('Should return WWWtemplate', async () => {
        const session = undefined;
        const res = {
            redirect: () => {
                throw new Error('call to res.redirect()');
            },
        };
        const results = await www.Index(res, session);
        chai_1.expect(results).to.be.instanceOf(model.WWWTemplate);
    });
    it('Should redirect to dashboard', async () => {
        const session = { userId: 1 };
        let callsToRedirect = 0;
        const res = {
            redirect: (url) => {
                chai_1.expect(url).to.equal('/dashboard');
                callsToRedirect++;
            },
        };
        await www.Index(res, session);
        chai_1.expect(callsToRedirect).to.equal(1);
    });
});
describe('www.signup', () => {
    it('Should return WWWtemplate with no referral info', async () => {
        const referral = undefined;
        const req = {
            query: {
                r: referral,
            },
        };
        const res = {
            redirect: (url) => {
            },
        };
        const results = await www.signup(res, req);
        if (results) {
            chai_1.expect(results).to.be.instanceOf(model.WWWTemplate);
            if (!results.page) {
                throw new Error('Page is undefined');
            }
            chai_1.expect(results.page.referral).to.equal(undefined);
        }
    });
    it('Should return WWWtemplate with referral info', async () => {
        const referral = 1233;
        const referralUserId = 25;
        const req = {
            query: {
                r: referral.toString(),
            },
            headers: {
                referer: 'https://www.google.com',
            },
        };
        const res = {
            redirect: (url) => {
                throw new Error('call to res.redirect()');
            },
        };
        let callsToGetInfo = 0;
        www.UserReferral = {
            getInfoById: async (refId) => {
                chai_1.expect(refId).to.equal(referral);
                callsToGetInfo++;
                return {
                    referral,
                    userId: referralUserId,
                };
            },
        };
        const results = await www.signup(res, req);
        if (!results) {
            throw new Error('No results data');
        }
        chai_1.expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('Page is undefined');
        }
        if (!results.page.referral) {
            throw new Error('referral data is undefined');
        }
        chai_1.expect(results.page.referral.userId).to.equal(referralUserId);
        chai_1.expect(callsToGetInfo).to.equal(1);
    });
    it('Should redirect due to banned ref', async () => {
        const referral = 1233;
        const referralUserId = 25;
        const req = {
            query: {
                r: referral.toString(),
            },
            headers: {
                referer: 'https://finobe.com/forum/thread/1234',
            },
        };
        let redirectCalls = 0;
        const res = {
            redirect: (url) => {
                chai_1.expect(typeof url).to.equal('string');
                redirectCalls++;
            },
        };
        www.UserReferral = {
            getInfoById: async (refId) => {
                chai_1.expect(refId).to.equal(referral);
                return {
                    referral,
                    userId: referralUserId,
                };
            },
        };
        await www.signup(res, req);
        chai_1.expect(redirectCalls).to.equal(1);
    });
});
//# sourceMappingURL=index.spec.js.map