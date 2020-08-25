import {WWWSupportController} from './Support';
import {expect} from 'chai';
import * as model from '../../models';
import * as viewModel from '../../viewmodels';
const support = new WWWSupportController();

// overwrite services
support.Users = {} as any;
support.Forums = {} as any;
support.Groups = {} as any;
support.Games = {} as any;
support.Support = {} as any;

describe('SupportController.SupportTicket()', () => {
    it('Should return valid ticket info', async () => {
        const cookie = 'fakecookie=session;';
        const ticketId = 1;
        support.base = class {
            constructor(data: {cookie: string}) {
                expect(data.cookie).to.equal(cookie);
            }

            public Support = {
                getTicketById: async (ticketIdProvided: number) => {
                    expect(ticketIdProvided).to.equal(ticketId);
                    return {
                        createdAt: '2020-01-03',
                        updatedAt: '2020-01-04',
                    }
                },
                getTicketReplies: async (ticketIdProvided: number) => {
                    expect(ticketIdProvided).to.equal(ticketId);
                    return [
                        {
                            createdAt: '2020-01-03',
                            updatedAt: '2020-01-04',
                        }
                    ];
                },
            }
        } as any;

        const session: any = {
            userId: 1,
            username: 'hello',
        }
        const result = await support.SupportTicket(cookie, session, ticketId);
        expect(result).to.be.instanceOf(model.WWWTemplate);
    });
})

describe('SupportController.SupportTicketReply()', () => {
    it('Should return valid ticket info for reply page', async () => {
        const cookie = 'fakecookie=session;';
        const ticketId = 1;
        support.base = class {
            constructor(data: {cookie: string}) {
                expect(data.cookie).to.equal(cookie);
            }

            public Support = {
                getTicketById: async (ticketIdProvided: number) => {
                    expect(ticketIdProvided).to.equal(ticketId);
                    return {
                        createdAt: '2020-01-03',
                        updatedAt: '2020-01-04',
                        ticketStatus: 2,
                    }
                },
            }
        } as any;

        const session: any = {
            userId: 1,
            username: 'hello',
        }
        const result = await support.SupportTicketReply(cookie, session, ticketId);
        expect(result).to.be.instanceOf(model.WWWTemplate);
    });
    it('Should 400 with InvalidTicketId due to ticket not awaiting response', async () => {
        const cookie = 'fakecookie=session;';
        const ticketId = 1;
        support.base = class {
            constructor(data: {cookie: string}) {
                expect(data.cookie).to.equal(cookie);
            }

            public Support = {
                getTicketById: async (ticketIdProvided: number) => {
                    expect(ticketIdProvided).to.equal(ticketId);
                    return {
                        createdAt: '2020-01-03',
                        updatedAt: '2020-01-04',
                        ticketStatus: 1, // idk what 1 means but all that matters is that it isn't "2"
                    }
                },
            }
        } as any;

        const session: any = {
            userId: 1,
            username: 'hello',
        }
        try {
            const result = await support.SupportTicketReply(cookie, session, ticketId);
            throw new Error('Ticket reply method should have errored with 400')
        }catch(err) {
            if (!(err instanceof support.BadRequest)) {
                throw err;
            }
            expect(err.message).to.equal('InvalidTicketId');
        }
    });
})

describe('SupportController.SupportPage()', () => {
   it('Should return wwwdata', () => {
       const res = support.SupportPage();
       expect(res).to.be.instanceOf(model.WWWTemplate);
   })
});

describe('SupportController.RefundPolicy()', () => {
    it('Should return wwwdata', () => {
        const res = support.RefundPolicy();
        expect(res).to.be.instanceOf(model.WWWTemplate);
    })
});

describe('SupportController.BrowserNotCompatible()', () => {
    it('Should return wwwdata', () => {
        const res = support.BrowserNotCompatible();
        expect(res).to.be.instanceOf(model.WWWTemplate);
        if (!res.page) {
            throw new Error('res.page is undefined');
        }
        expect(typeof res.page.article).to.equal('string');
    })
});

describe('SupportController.GameHelpSupport()', () => {
    it('Should return wwwdata', () => {
        const res = support.GameHelpSupport();
        expect(res).to.be.instanceOf(model.WWWTemplate);
        if (!res.page) {
            throw new Error('res.page is undefined');
        }
        expect(typeof res.page.article).to.equal('string');
    })
});

describe('SupportController.AccountBannedSupport()', () => {
    it('Should return wwwdata', () => {
        const res = support.AccountBannedSupport();
        expect(res).to.be.instanceOf(model.WWWTemplate);
        if (!res.page) {
            throw new Error('res.page is undefined');
        }
        expect(typeof res.page.article).to.equal('string');
    })
});

describe('SupportController.AccountHackedSupport()', () => {
    it('Should return wwwdata', () => {
        const res = support.AccountHackedSupport();
        expect(res).to.be.instanceOf(model.WWWTemplate);
        if (!res.page) {
            throw new Error('res.page is undefined');
        }
        expect(typeof res.page.article).to.equal('string');
    })
});

describe('SupportController.ScammedSupport()', () => {
    it('Should return wwwdata', () => {
        const res = support.ScammedSupport();
        expect(res).to.be.instanceOf(model.WWWTemplate);
        if (!res.page) {
            throw new Error('res.page is undefined');
        }
        expect(typeof res.page.article).to.equal('string');
    })
});

describe('SupportController.AdSystemSupport()', () => {
    it('Should return wwwdata', () => {
        const res = support.AdSystemSupport();
        expect(res).to.be.instanceOf(model.WWWTemplate);
        if (!res.page) {
            throw new Error('res.page is undefined');
        }
        expect(typeof res.page.article).to.equal('string');
    })
});