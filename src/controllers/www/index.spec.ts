import {GenericWWWController} from './index';
import {expect} from 'chai';
import * as model from '../../models';
import * as viewModel from '../../viewmodels';

const www = new GenericWWWController();

// overwrite services
www.Users = {} as any;
www.Forums = {} as any;
www.Games = {} as any;
www.Support = {} as any;
www.Staff = {} as any;

describe('www.performanceTest()', () => {
    it('Should return string ', () => {
        const res = www.performanceTest();
        expect(res).to.be.a('string');
    })
});

// More proof controller tests are useless 99% of the time...
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
            // @ts-ignore
            const res = www[method]();
            expect(res).to.be.instanceOf(model.WWWTemplate);
        })
    }
});

describe('www.V1AuthenticationFlow', () => {
    it('Should accept valid domain and return WWW data', async () => {
        const url = 'https://www.good-service.com/redirect';
        const expectedDisplayUrl = 'www.good-service.com';

        const results = await www.V1AuthenticationFlow(url);
        expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('Page is undefined');
        }
        expect(results.page.url).to.equal(url);
        expect(results.page.parsedUrl).to.equal(expectedDisplayUrl);
    });
});

describe('www.resetPassword', () => {
    it('Should accept a valid code and return WWWtemplate', async () => {
        const code = 'gwaiuhogwauhoiwag';
        const userId = 1234;

        const results = await www.resetPassword(code, userId);
        expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('Page is undefined');
        }
        expect(results.page.code).to.equal(code);
        expect(results.page.userId).to.equal(userId);
    });
});

describe('www.emailVerification', () => {
    it('Should accept a valid code and return WWWtemplate', async () => {
        const code = 'gwaiuhogwauhoiwag';
        const userId = 1234;

        const results = await www.emailVerification(code);
        expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('Page is undefined');
        }
        expect(results.page.code).to.equal(code);
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
        } as any;
        const results = await www.buyCurrency();
        expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('results.page is undefined');
        }
        expect(results.page.catalogCount).to.equal(itemCount);
    });
    it('Should count assets, fail (default to 1500), and return WWWtemplate', async () => {
        const expectedItemCount = 1500;
        const session = undefined;

        www.Catalog = {
            countAllItemsForSale: async () => {
                throw new Error('Maybe pretend this is a 500 error?')
            }
        } as any;
        const results = await www.buyCurrency();
        expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('results.page is undefined');
        }
        expect(results.page.catalogCount).to.equal(expectedItemCount);
    });
});

describe('www.Index', () => {
    it('Should return WWWtemplate', async () => {
        const session = undefined;

        const res = {
            redirect: () => {
                throw new Error('call to res.redirect()');
            },
        } as any;
        const results = await www.Index(res, session);
        expect(results).to.be.instanceOf(model.WWWTemplate);
    });
    it('Should redirect to dashboard', async () => {
        const session: any = {userId: 1};

        let callsToRedirect = 0;
        const res = {
            redirect: (url: string) => {
                expect(url).to.equal('/dashboard');
                callsToRedirect++;
            },
        } as any;
        await www.Index(res, session);
        expect(callsToRedirect).to.equal(1);
    });
});

describe('www.signup', () => {
    it('Should return WWWtemplate with no referral info', async () => {
        const referral = undefined;
        const req: any = {
            query: {
                r: referral,
            },
        }
        const res: any = {
            redirect: (url: string) => {

            },
        }
        const results = await www.signup(res,req);
        if (results) {
            expect(results).to.be.instanceOf(model.WWWTemplate);
            if (!results.page) {
                throw new Error('Page is undefined');
            }
            expect(results.page.referral).to.equal(undefined);
        }
    });
    it('Should return WWWtemplate with referral info', async () => {
        const referral = 1233;
        const referralUserId = 25;
        const req: any = {
            query: {
                r: referral.toString(),
            },
            headers: {
                referer: 'https://www.google.com',
            },
        }
        const res: any = {
            redirect: (url: string) => {
                throw new Error('call to res.redirect()');
            },
        }
        let callsToGetInfo = 0;
        www.UserReferral = {
            getInfoById: async (refId: number) => {
                expect(refId).to.equal(referral);
                callsToGetInfo++;
                return {
                    referral,
                    userId: referralUserId,
                }
            },
        } as any;
        const results = await www.signup(res, req);
        if (!results) {
            throw new Error('No results data');
        }

        expect(results).to.be.instanceOf(model.WWWTemplate);
        if (!results.page) {
            throw new Error('Page is undefined');
        }
        if (!results.page.referral) {
            throw new Error('referral data is undefined');
        }
        expect(results.page.referral.userId).to.equal(referralUserId);
        expect(callsToGetInfo).to.equal(1);
    });
    it('Should redirect due to banned ref', async () => {
        const referral = 1233;
        const referralUserId = 25;
        const req: any = {
            query: {
                r: referral.toString(),
            },
            headers: {
                referer: 'https://finobe.com/forum/thread/1234',
            },
        }
        let redirectCalls = 0;
        const res: any = {
            redirect: (url: string) => {
                expect(typeof url).to.equal('string');
                redirectCalls++;
            },
        }
        www.UserReferral = {
            getInfoById: async (refId: number) => {
                expect(refId).to.equal(referral);
                return {
                    referral,
                    userId: referralUserId,
                }
            },
        } as any;
        await www.signup(res, req);
        expect(redirectCalls).to.equal(1);
    });
});