import {GroupsController} from './Groups';

import {expect} from 'chai';
import * as model from '../../models';
import * as viewModel from '../../viewmodels';

const groups = new GroupsController();

// overwrite services
groups.Users = {} as any;
groups.Forums = {} as any;
groups.Games = {} as any;
groups.Support = {} as any;
groups.Staff = {} as any;
groups.Groups = {} as any;

describe('groups.Index()', () => {
    it('Should return WWWTemplate ', () => {
        const res = groups.Index();
        expect(res).to.be.instanceOf(model.WWWTemplate);
    })
});

describe('groups.Index()', () => {
    it('Should return WWWTemplate ', () => {
        const res = groups.Index();
        expect(res).to.be.instanceOf(model.WWWTemplate);
    })
});

describe('groups.groupCreate()', () => {
    it('Should return WWWTemplate ', () => {
        const res = groups.groupCreate();
        expect(res).to.be.instanceOf(model.WWWTemplate);
    })
});

describe('groups.redirectToGroupPage()', () => {
    it('Should redirect to groups page (OK)', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 0;
        let callsToRedirect = 0;
        const res: any = {
            redirect: (url: string) => {
                expect(url).to.equal('/groups/'+groupId+'/'+groupName);
                callsToRedirect++;
            },
        };
        groups.Groups = {
            getInfo: async (providedId: number) => {
                expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                }
            }
        } as any;
        await groups.redirectToGroupPage(res, groupId);
        expect(callsToRedirect).to.equal(1);
    })
    it('Should redirect to groups page (locked)', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 1;
        let callsToRedirect = 0;
        const res: any = {
            redirect: (url: string) => {
                expect(url).to.equal('/groups/'+groupId+'/Locked-Group');
                callsToRedirect++;
            },
        };
        groups.Groups = {
            getInfo: async (providedId: number) => {
                expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                }
            }
        } as any;
        await groups.redirectToGroupPage(res, groupId);
        expect(callsToRedirect).to.equal(1);
    })
});

describe('groups.GroupPage()', () => {
    it('Should return WWWtemplate with group info (OK)', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 0;

        groups.Groups = {
            getInfo: async (providedId: number) => {
                expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                }
            }
        } as any;
        const data = await groups.GroupPage(groupId, groupName);
        expect(data).to.be.instanceOf(model.WWWTemplate);
        if (!data.page) {
            throw new Error('data.page is undefined');
        }
    })
    it('Should return WWWtemplate with minimal group info (Locked)', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 1;

        groups.Groups = {
            getInfo: async (providedId: number) => {
                expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                }
            }
        } as any;
        const data = await groups.GroupPage(groupId, groupName);
        expect(data).to.be.instanceOf(model.WWWTemplate);
        if (!data.page) {
            throw new Error('data.page is undefined');
        }
        expect(data.page.groupEncodedName).to.equal('Locked-Group');
    })

});

describe('groups.groupCatalogItemCreate()', () => {
    it('Should return WWWtemplate with group info (OK)', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 0;
        const info: any = {
            userId: 1,
        }

        groups.Groups = {
            getInfo: async (providedId: number) => {
                expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                }
            },
            getUserRole: async (providedGroup: number, providedUser: number) => {
                expect(providedGroup).to.equal(groupId);
                expect(providedUser).to.equal(info.userId);
                return {
                    permissions: {
                        manage: 1,
                    }
                }
            },
        } as any
        let callsToRedirect = 0;
        const res: any = {
            redirect: (url: string) => {
                callsToRedirect++;
            },
        };

        const data = await groups.groupCatalogItemCreate(res, info, groupId, groupName);
        expect(data).to.be.instanceOf(model.WWWTemplate);
        if (!data || !data.page) {
            throw new Error('data.page is undefined');
        }
        expect(callsToRedirect).to.equal(0);
    })
    it('Should redirect due to requester lacking permissions', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 0;
        const info: any = {
            userId: 1,
        }

        groups.Groups = {
            getInfo: async (providedId: number) => {
                expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                }
            },
            getUserRole: async (providedGroup: number, providedUser: number) => {
                expect(providedGroup).to.equal(groupId);
                expect(providedUser).to.equal(info.userId);
                return {
                    permissions: {
                        manage: 0,
                    }
                }
            },
        } as any
        let callsToRedirect = 0;
        const res: any = {
            redirect: (url: string) => {
                callsToRedirect++;
            },
        };

        await groups.groupCatalogItemCreate(res, info, groupId, groupName);
        expect(callsToRedirect).to.equal(1);
    })
    it('Should throw 404 due to locked group', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 1;
        const info: any = {
            userId: 1,
        }

        groups.Groups = {
            getInfo: async (providedId: number) => {
                expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                }
            },
            getUserRole: async (providedGroup: number, providedUser: number) => {
                expect(providedGroup).to.equal(groupId);
                expect(providedUser).to.equal(info.userId);
                return {
                    permissions: {
                        manage: 0,
                    }
                }
            },
        } as any
        let callsToRedirect = 0;
        const res: any = {
            redirect: (url: string) => {
                callsToRedirect++;
            },
        };

        try {
            await groups.groupCatalogItemCreate(res, info, groupId, groupName);
            throw new Error('Request passed for locked group');
        }catch(err) {
            if (!(err instanceof groups.NotFound)) {
                throw err;
            }
            expect(callsToRedirect).to.equal(0);
            expect(err.message).to.equal('InvalidGroupId')
        }
    })

});


describe('groups.groupManage()', () => {
    it('Should return WWWtemplate with group info (OK)', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 0;
        const info: any = {
            userId: 1,
        }

        groups.Groups = {
            getInfo: async (providedId: number) => {
                expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                }
            },
            getUserRole: async (providedGroup: number, providedUser: number) => {
                expect(providedGroup).to.equal(groupId);
                expect(providedUser).to.equal(info.userId);
                return {
                    permissions: {
                        manage: 1,
                    }
                }
            },
        } as any
        let callsToRedirect = 0;
        const res: any = {
            redirect: (url: string) => {
                callsToRedirect++;
            },
        };

        const data = await groups.groupManage(info, res, groupId, groupName);
        expect(data).to.be.instanceOf(model.WWWTemplate);
        if (!data || !data.page) {
            throw new Error('data.page is undefined');
        }
        expect(callsToRedirect).to.equal(0);
    })
    it('Should redirect due to requester lacking permissions', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 0;
        const info: any = {
            userId: 1,
        }

        groups.Groups = {
            getInfo: async (providedId: number) => {
                expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                }
            },
            getUserRole: async (providedGroup: number, providedUser: number) => {
                expect(providedGroup).to.equal(groupId);
                expect(providedUser).to.equal(info.userId);
                return {
                    permissions: {
                        manage: 0,
                    }
                }
            },
        } as any
        let callsToRedirect = 0;
        const res: any = {
            redirect: (url: string) => {
                callsToRedirect++;
            },
        };

        await groups.groupManage(info, res, groupId, groupName);
        expect(callsToRedirect).to.equal(1);
    })
    it('Should throw 404 due to locked group', async () => {
        const groupId = 25;
        const groupName = 'hello';
        const groupStatus = 1;
        const info: any = {
            userId: 1,
        }

        groups.Groups = {
            getInfo: async (providedId: number) => {
                expect(providedId).to.equal(groupId);
                return {
                    groupId,
                    groupName,
                    groupStatus,
                }
            },
            getUserRole: async (providedGroup: number, providedUser: number) => {
                expect(providedGroup).to.equal(groupId);
                expect(providedUser).to.equal(info.userId);
                return {
                    permissions: {
                        manage: 0,
                    }
                }
            },
        } as any
        let callsToRedirect = 0;
        const res: any = {
            redirect: (url: string) => {
                callsToRedirect++;
            },
        };

        try {
            await groups.groupManage(info, res, groupId, groupName);
            throw new Error('Request passed for locked group');
        }catch(err) {
            if (!(err instanceof groups.NotFound)) {
                throw err;
            }
            expect(callsToRedirect).to.equal(0);
            expect(err.message).to.equal('InvalidGroupId')
        }
    })

});
