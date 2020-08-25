import {ReportAbuseController} from './Report-Abuse';
import {expect} from 'chai';
import * as model from '../../models';
import * as viewModel from '../../viewmodels';

const ra = new ReportAbuseController();

// overwrite services
ra.Users = {} as any;
ra.Forums = {} as any;
ra.Games = {} as any;
ra.Support = {} as any;
ra.Staff = {} as any;

describe('ra.reportUserStatus()', () => {
    it('Should return WWWTemplate ', () => {
        const userStatusId = 1;
        const res = ra.reportUserStatus(userStatusId);
        expect(res).to.be.instanceOf(model.WWWTemplate);
        if (!res.page) {
            throw new Error('Page is undefined');
        }
        expect(res.page.userStatusId).to.equal(userStatusId);
    })
});
