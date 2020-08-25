"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Support_1 = require("./Support");
const chai_1 = require("chai");
const model = require("../../models");
const support = new Support_1.WWWSupportController();
support.Users = {};
support.Forums = {};
support.Groups = {};
support.Games = {};
support.Support = {};
describe('SupportController.SupportTicket()', () => {
    it('Should return valid ticket info', async () => {
        const cookie = 'fakecookie=session;';
        const ticketId = 1;
        support.base = class {
            constructor(data) {
                this.Support = {
                    getTicketById: async (ticketIdProvided) => {
                        chai_1.expect(ticketIdProvided).to.equal(ticketId);
                        return {
                            createdAt: '2020-01-03',
                            updatedAt: '2020-01-04',
                        };
                    },
                    getTicketReplies: async (ticketIdProvided) => {
                        chai_1.expect(ticketIdProvided).to.equal(ticketId);
                        return [
                            {
                                createdAt: '2020-01-03',
                                updatedAt: '2020-01-04',
                            }
                        ];
                    },
                };
                chai_1.expect(data.cookie).to.equal(cookie);
            }
        };
        const session = {
            userId: 1,
            username: 'hello',
        };
        const result = await support.SupportTicket(cookie, session, ticketId);
        chai_1.expect(result).to.be.instanceOf(model.WWWTemplate);
    });
});
describe('SupportController.SupportTicketReply()', () => {
    it('Should return valid ticket info for reply page', async () => {
        const cookie = 'fakecookie=session;';
        const ticketId = 1;
        support.base = class {
            constructor(data) {
                this.Support = {
                    getTicketById: async (ticketIdProvided) => {
                        chai_1.expect(ticketIdProvided).to.equal(ticketId);
                        return {
                            createdAt: '2020-01-03',
                            updatedAt: '2020-01-04',
                            ticketStatus: 2,
                        };
                    },
                };
                chai_1.expect(data.cookie).to.equal(cookie);
            }
        };
        const session = {
            userId: 1,
            username: 'hello',
        };
        const result = await support.SupportTicketReply(cookie, session, ticketId);
        chai_1.expect(result).to.be.instanceOf(model.WWWTemplate);
    });
    it('Should 400 with InvalidTicketId due to ticket not awaiting response', async () => {
        const cookie = 'fakecookie=session;';
        const ticketId = 1;
        support.base = class {
            constructor(data) {
                this.Support = {
                    getTicketById: async (ticketIdProvided) => {
                        chai_1.expect(ticketIdProvided).to.equal(ticketId);
                        return {
                            createdAt: '2020-01-03',
                            updatedAt: '2020-01-04',
                            ticketStatus: 1,
                        };
                    },
                };
                chai_1.expect(data.cookie).to.equal(cookie);
            }
        };
        const session = {
            userId: 1,
            username: 'hello',
        };
        try {
            const result = await support.SupportTicketReply(cookie, session, ticketId);
            throw new Error('Ticket reply method should have errored with 400');
        }
        catch (err) {
            if (!(err instanceof support.BadRequest)) {
                throw err;
            }
            chai_1.expect(err.message).to.equal('InvalidTicketId');
        }
    });
});
describe('SupportController.SupportPage()', () => {
    it('Should return wwwdata', () => {
        const res = support.SupportPage();
        chai_1.expect(res).to.be.instanceOf(model.WWWTemplate);
    });
});
describe('SupportController.RefundPolicy()', () => {
    it('Should return wwwdata', () => {
        const res = support.RefundPolicy();
        chai_1.expect(res).to.be.instanceOf(model.WWWTemplate);
    });
});
describe('SupportController.BrowserNotCompatible()', () => {
    it('Should return wwwdata', () => {
        const res = support.BrowserNotCompatible();
        chai_1.expect(res).to.be.instanceOf(model.WWWTemplate);
        if (!res.page) {
            throw new Error('res.page is undefined');
        }
        chai_1.expect(typeof res.page.article).to.equal('string');
    });
});
describe('SupportController.GameHelpSupport()', () => {
    it('Should return wwwdata', () => {
        const res = support.GameHelpSupport();
        chai_1.expect(res).to.be.instanceOf(model.WWWTemplate);
        if (!res.page) {
            throw new Error('res.page is undefined');
        }
        chai_1.expect(typeof res.page.article).to.equal('string');
    });
});
describe('SupportController.AccountBannedSupport()', () => {
    it('Should return wwwdata', () => {
        const res = support.AccountBannedSupport();
        chai_1.expect(res).to.be.instanceOf(model.WWWTemplate);
        if (!res.page) {
            throw new Error('res.page is undefined');
        }
        chai_1.expect(typeof res.page.article).to.equal('string');
    });
});
describe('SupportController.AccountHackedSupport()', () => {
    it('Should return wwwdata', () => {
        const res = support.AccountHackedSupport();
        chai_1.expect(res).to.be.instanceOf(model.WWWTemplate);
        if (!res.page) {
            throw new Error('res.page is undefined');
        }
        chai_1.expect(typeof res.page.article).to.equal('string');
    });
});
describe('SupportController.ScammedSupport()', () => {
    it('Should return wwwdata', () => {
        const res = support.ScammedSupport();
        chai_1.expect(res).to.be.instanceOf(model.WWWTemplate);
        if (!res.page) {
            throw new Error('res.page is undefined');
        }
        chai_1.expect(typeof res.page.article).to.equal('string');
    });
});
describe('SupportController.AdSystemSupport()', () => {
    it('Should return wwwdata', () => {
        const res = support.AdSystemSupport();
        chai_1.expect(res).to.be.instanceOf(model.WWWTemplate);
        if (!res.page) {
            throw new Error('res.page is undefined');
        }
        chai_1.expect(typeof res.page.article).to.equal('string');
    });
});
//# sourceMappingURL=Support.spec.js.map