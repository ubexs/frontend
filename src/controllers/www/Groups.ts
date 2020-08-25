import base from '../base';
import { Controller, Get, Header, HeaderParams, Render, Use, Res, Locals, PathParams } from '@tsed/common';
import * as model from '../../models/index';
import * as middleware from '../../middleware/v1';
import { Summary } from "@tsed/swagger";

@Controller('/groups')
export class GroupsController extends base {

    @Get('/')
    @Render('groups/index')
    @Summary('Groups search page')
    public Index() {
        return new model.WWWTemplate({
            title: 'Groups',
        })
    }

    @Get('/create')
    @Summary('Create group page')
    @Render('group_create')
    @Use(middleware.auth.YesAuth)
    public groupCreate() {
        return new model.WWWTemplate({ 'title': 'Create a Group' });
    }

    @Get('/:groupId')
    @Summary('Redirect /groups/{groupId} to /groups/{groupId}/{groupName} or 404 if invalid {groupId}')
    public async redirectToGroupPage(
        @Res() res: Res,
        @PathParams('groupId', Number) groupId: number
    ): Promise<void> {
        groupId = base.ValidateId(groupId);
        let groupData = await this.Groups.getInfo(groupId);
        let encodedName: string;
        if (groupData.groupStatus !== model.Groups.groupStatus.ok) {
            encodedName = model.urlEncode('Locked Group');
        } else {
            encodedName = model.urlEncode(groupData.groupName);
        }
        return res.redirect("/groups/" + groupId + "/" + encodedName);
    }

    @Get('/:groupId/:groupName')
    @Summary('Group Page')
    @Render('groups/group')
    public async GroupPage(
        @PathParams('groupId', Number) groupId: number,
        @PathParams('groupName', String) groupName: string,
    ) {
        groupId = base.ValidateId(groupId);
        let groupData = await this.Groups.getInfo(groupId);
        let viewData = new model.WWWTemplate<any>({ 'title': groupData.groupName || 'Locked Group' });
        if (groupData.groupStatus === model.Groups.groupStatus.locked) {
            // limited data
            viewData.page = {
                groupStatus: 1,
                groupId: groupId,
                groupEncodedName: model.urlEncode('Locked Group'),
            };
            return viewData;
        }
        viewData.page = {};
        viewData.page.groupId = groupData.groupId;
        viewData.page.groupName = groupData.groupName;
        viewData.page.groupEncodedName = model.urlEncode(groupData.groupName);
        viewData.page.groupOwnerUserId = groupData.groupOwnerUserId;
        viewData.page.groupMemberCount = groupData.groupMemberCount;
        viewData.page.groupDescription = groupData.groupDescription;
        viewData.page.groupIconCatalogId = groupData.groupIconCatalogId;
        return viewData;
    }

    @Get('/:groupId/:groupName/create')
    @Summary('Group item creation page')
    @Render('groups/create-item')
    @Use(middleware.auth.YesAuth)
    public async groupCatalogItemCreate(
        // If only someone could make a redirect decorator...
        @Res() res: Res,
        @Locals('userInfo') userInfo: model.UserSession,
        @PathParams('groupId', Number) groupId: number,
        @PathParams('groupName', String) groupName: string
    ) {
        groupId = base.ValidateId(groupId);
        let groupData = await this.Groups.getInfo(groupId);
        // If locked (aka banned), redirect to 404
        if (groupData.groupStatus === model.Groups.groupStatus.locked) {
            throw new this.NotFound('InvalidGroupId');
        }
        let userRole = await this.Groups.getUserRole(groupId, userInfo.userId);

        const encodedName = model.urlEncode(groupData.groupName);
        if (userRole.permissions.manage === 0) {
            return res.redirect("/groups/" + groupId + "/" + encodedName);
        }
        let viewData = new model.WWWTemplate<any>({ 'title': 'Create a Catalog Item' });
        viewData.page = {
            groupId: groupData.groupId,
            groupName: groupData.groupName,
            groupEncodedName: encodedName
        };
        return viewData;
    }

    @Get('/:groupId/:groupName/manage')
    @Summary('Group manage page')
    @Render('groups/manage')
    @Use(middleware.auth.YesAuth)
    public async groupManage(
        @Locals('userInfo') userInfo: model.UserSession,
        @Res() res: Res,
        @PathParams('groupId', Number) groupId: number,
        @PathParams('groupName', String) groupName: string
    ) {
        groupId = base.ValidateId(groupId);
        let groupData = await this.Groups.getInfo(groupId);
        // If locked (aka banned), redirect to 404
        if (groupData.groupStatus === model.Groups.groupStatus.locked) {
            throw new this.NotFound('InvalidGroupId');
        }
        let userRole = await this.Groups.getUserRole(groupId, userInfo.userId);
        const encodedName = model.urlEncode(groupData.groupName);
        if (userRole.permissions.manage === 0) {
            return res.redirect("/groups/" + groupId + "/" + encodedName);
        }
        let viewData = new model.WWWTemplate<any>({ 'title': groupData.groupName });
        viewData.page = {};
        viewData.page.groupId = groupData.groupId;
        // viewData.page.Primary = funds.Primary; // this has been moved to a web api and is now the frontend's job
        // viewData.page.Secondary = funds.Secondary; // same as above
        viewData.page.groupName = groupData.groupName;
        viewData.page.groupEncodedName = encodedName;
        viewData.page.groupOwnerUserId = groupData.groupOwnerUserId;
        viewData.page.groupMemberCount = groupData.groupMemberCount;
        viewData.page.groupDescription = groupData.groupDescription;
        viewData.page.groupIconCatalogId = groupData.groupIconCatalogId;
        viewData.page.groupMembershipApprovalRequired = groupData.groupMembershipApprovalRequired;
        return viewData;
    }
}