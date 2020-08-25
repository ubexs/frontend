"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Report_Abuse_1 = require("./Report-Abuse");
const chai_1 = require("chai");
const model = require("../../models");
const ra = new Report_Abuse_1.ReportAbuseController();
ra.Users = {};
ra.Forums = {};
ra.Games = {};
ra.Support = {};
ra.Staff = {};
describe('ra.reportUserStatus()', () => {
    it('Should return WWWTemplate ', () => {
        const userStatusId = 1;
        const res = ra.reportUserStatus(userStatusId);
        chai_1.expect(res).to.be.instanceOf(model.WWWTemplate);
        if (!res.page) {
            throw new Error('Page is undefined');
        }
        chai_1.expect(res.page.userStatusId).to.equal(userStatusId);
    });
});
//# sourceMappingURL=Report-Abuse.spec.js.map