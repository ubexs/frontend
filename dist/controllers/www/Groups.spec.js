"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Groups_1 = require("./Groups");
const chai_1 = require("chai");
const model = require("../../models");
const groups = new Groups_1.GroupsController();
groups.Users = {};
groups.Forums = {};
groups.Games = {};
groups.Support = {};
groups.Staff = {};
groups.Groups = {};
describe('groups.Index()', () => {
    it('Should return WWWTemplate ', () => {
        const res = groups.Index();
        chai_1.expect(res).to.be.instanceOf(model.WWWTemplate);
    });
});
describe('groups.Index()', () => {
    it('Should return WWWTemplate ', () => {
        const res = groups.Index();
        chai_1.expect(res).to.be.instanceOf(model.WWWTemplate);
    });
});
describe('groups.groupCreate()', () => {
    it('Should return WWWTemplate ', () => {
        const res = groups.groupCreate();
        chai_1.expect(res).to.be.instanceOf(model.WWWTemplate);
    });
});
describe('groups.redirectToGroupPage()', () => {
    it('Should redirect to groups page (OK)', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 0;
        let callsToRedirect = 0;
        const res = {
            redirect: (url) => {
                chai_1.expect(url).to.equal('/groups/' + groupId + '/' + groupName);
                callsToRedirect++;
            },
        };
        groups.Groups = {
            getInfo: async (providedId) => {
                chai_1.expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                };
            }
        };
        await groups.redirectToGroupPage(res, groupId);
        chai_1.expect(callsToRedirect).to.equal(1);
    });
    it('Should redirect to groups page (locked)', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 1;
        let callsToRedirect = 0;
        const res = {
            redirect: (url) => {
                chai_1.expect(url).to.equal('/groups/' + groupId + '/Locked-Group');
                callsToRedirect++;
            },
        };
        groups.Groups = {
            getInfo: async (providedId) => {
                chai_1.expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                };
            }
        };
        await groups.redirectToGroupPage(res, groupId);
        chai_1.expect(callsToRedirect).to.equal(1);
    });
});
describe('groups.GroupPage()', () => {
    it('Should return WWWtemplate with group info (OK)', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 0;
        groups.Groups = {
            getInfo: async (providedId) => {
                chai_1.expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                };
            }
        };
        const data = await groups.GroupPage(groupId, groupName);
        chai_1.expect(data).to.be.instanceOf(model.WWWTemplate);
        if (!data.page) {
            throw new Error('data.page is undefined');
        }
    });
    it('Should return WWWtemplate with minimal group info (Locked)', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 1;
        groups.Groups = {
            getInfo: async (providedId) => {
                chai_1.expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                };
            }
        };
        const data = await groups.GroupPage(groupId, groupName);
        chai_1.expect(data).to.be.instanceOf(model.WWWTemplate);
        if (!data.page) {
            throw new Error('data.page is undefined');
        }
        chai_1.expect(data.page.groupEncodedName).to.equal('Locked-Group');
    });
});
describe('groups.groupCatalogItemCreate()', () => {
    it('Should return WWWtemplate with group info (OK)', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 0;
        const info = {
            userId: 1,
        };
        groups.Groups = {
            getInfo: async (providedId) => {
                chai_1.expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                };
            },
            getUserRole: async (providedGroup, providedUser) => {
                chai_1.expect(providedGroup).to.equal(groupId);
                chai_1.expect(providedUser).to.equal(info.userId);
                return {
                    permissions: {
                        manage: 1,
                    }
                };
            },
        };
        let callsToRedirect = 0;
        const res = {
            redirect: (url) => {
                callsToRedirect++;
            },
        };
        const data = await groups.groupCatalogItemCreate(res, info, groupId, groupName);
        chai_1.expect(data).to.be.instanceOf(model.WWWTemplate);
        if (!data || !data.page) {
            throw new Error('data.page is undefined');
        }
        chai_1.expect(callsToRedirect).to.equal(0);
    });
    it('Should redirect due to requester lacking permissions', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 0;
        const info = {
            userId: 1,
        };
        groups.Groups = {
            getInfo: async (providedId) => {
                chai_1.expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                };
            },
            getUserRole: async (providedGroup, providedUser) => {
                chai_1.expect(providedGroup).to.equal(groupId);
                chai_1.expect(providedUser).to.equal(info.userId);
                return {
                    permissions: {
                        manage: 0,
                    }
                };
            },
        };
        let callsToRedirect = 0;
        const res = {
            redirect: (url) => {
                callsToRedirect++;
            },
        };
        await groups.groupCatalogItemCreate(res, info, groupId, groupName);
        chai_1.expect(callsToRedirect).to.equal(1);
    });
    it('Should throw 404 due to locked group', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 1;
        const info = {
            userId: 1,
        };
        groups.Groups = {
            getInfo: async (providedId) => {
                chai_1.expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                };
            },
            getUserRole: async (providedGroup, providedUser) => {
                chai_1.expect(providedGroup).to.equal(groupId);
                chai_1.expect(providedUser).to.equal(info.userId);
                return {
                    permissions: {
                        manage: 0,
                    }
                };
            },
        };
        let callsToRedirect = 0;
        const res = {
            redirect: (url) => {
                callsToRedirect++;
            },
        };
        try {
            await groups.groupCatalogItemCreate(res, info, groupId, groupName);
            throw new Error('Request passed for locked group');
        }
        catch (err) {
            if (!(err instanceof groups.NotFound)) {
                throw err;
            }
            chai_1.expect(callsToRedirect).to.equal(0);
            chai_1.expect(err.message).to.equal('InvalidGroupId');
        }
    });
});
describe('groups.groupManage()', () => {
    it('Should return WWWtemplate with group info (OK)', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 0;
        const info = {
            userId: 1,
        };
        groups.Groups = {
            getInfo: async (providedId) => {
                chai_1.expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                };
            },
            getUserRole: async (providedGroup, providedUser) => {
                chai_1.expect(providedGroup).to.equal(groupId);
                chai_1.expect(providedUser).to.equal(info.userId);
                return {
                    permissions: {
                        manage: 1,
                    }
                };
            },
        };
        let callsToRedirect = 0;
        const res = {
            redirect: (url) => {
                callsToRedirect++;
            },
        };
        const data = await groups.groupManage(info, res, groupId, groupName);
        chai_1.expect(data).to.be.instanceOf(model.WWWTemplate);
        if (!data || !data.page) {
            throw new Error('data.page is undefined');
        }
        chai_1.expect(callsToRedirect).to.equal(0);
    });
    it('Should redirect due to requester lacking permissions', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 0;
        const info = {
            userId: 1,
        };
        groups.Groups = {
            getInfo: async (providedId) => {
                chai_1.expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                };
            },
            getUserRole: async (providedGroup, providedUser) => {
                chai_1.expect(providedGroup).to.equal(groupId);
                chai_1.expect(providedUser).to.equal(info.userId);
                return {
                    permissions: {
                        manage: 0,
                    }
                };
            },
        };
        let callsToRedirect = 0;
        const res = {
            redirect: (url) => {
                callsToRedirect++;
            },
        };
        await groups.groupManage(info, res, groupId, groupName);
        chai_1.expect(callsToRedirect).to.equal(1);
    });
    it('Should throw 404 due to locked group', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 1;
        const info = {
            userId: 1,
        };
        groups.Groups = {
            getInfo: async (providedId) => {
                chai_1.expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                };
            },
            getUserRole: async (providedGroup, providedUser) => {
                chai_1.expect(providedGroup).to.equal(groupId);
                chai_1.expect(providedUser).to.equal(info.userId);
                return {
                    permissions: {
                        manage: 0,
                    }
                };
            },
        };
        let callsToRedirect = 0;
        const res = {
            redirect: (url) => {
                callsToRedirect++;
            },
        };
        try {
            await groups.groupManage(info, res, groupId, groupName);
            throw new Error('Request passed for locked group');
        }
        catch (err) {
            if (!(err instanceof groups.NotFound)) {
                throw err;
            }
            chai_1.expect(callsToRedirect).to.equal(0);
            chai_1.expect(err.message).to.equal('InvalidGroupId');
        }
    });
});
