import base from '../base';
import {Controller, Get, Locals, PathParams, Render, Res, Use} from '@tsed/common';
import * as model from '../../models/index';
import * as middleware from '../../middleware/v1';
import {Summary} from "@tsed/swagger";

@Controller('/ads')
export class AdsWWWController extends base {

    @Get('/')
    @Summary('User ads manage page/overview')
    @Render('ads/dashboard')
    @Use(middleware.auth.YesAuth)
    public ads(
        @Res() res: Res,
        @Locals('userInfo') info: model.UserSession
    ) {
        return new model.WWWTemplate({
            title: 'Ads',
        })
    }


    @Get('/catalog/create/:catalogId')
    @Render('ads/catalog_create')
    @Use(middleware.auth.YesAuth)
    public async createCatalogAd(
        @Locals('userInfo') userInfo: model.UserSession,
        @PathParams('catalogId', Number) catalogId: number
    ) {
        let info = await this.Catalog.getInfo(catalogId);
        if (info.creatorType === model.Catalog.creatorType.User && info.creatorId !== userInfo.userId) {
            throw new this.BadRequest('InvalidCatalogId');
        } else if (info.creatorType === model.Catalog.creatorType.Group) {
            let groupInfo = await this.Groups.getInfo(info.creatorId);
            if (groupInfo.groupOwnerUserId !== userInfo.userId) {
                throw new this.BadRequest('InvalidCatalogId');
            }
        }
        return new model.WWWTemplate({
            title: 'Create Catalog Ad', page: {
                catalogInfo: info,
                adDisplayTypes: model.Ads.AdDisplayType,
            }
        });
    }

    @Get('/group/create/:groupId')
    @Render('ads/group_create')
    @Use(middleware.auth.YesAuth)
    public async createGroupAd(
        @Locals('userInfo') userInfo: model.UserSession,
        @PathParams('groupId', Number) groupId: number
    ) {
        let info = await this.Groups.getInfo(groupId);
        if (info.groupStatus === model.Groups.groupStatus.locked || info.groupOwnerUserId !== userInfo.userId) {
            throw new this.BadRequest('InvalidGroupId');
        }
        return new model.WWWTemplate({
            title: 'Create Group Ad', page: {
                groupInfo: info,
                adDisplayTypes: model.Ads.AdDisplayType,
            }
        });
    }

    @Get('/thread/create/:threadId')
    @Render('ads/thread_create')
    @Use(middleware.auth.YesAuth)
    public async createThreadAd(
        @Locals('userInfo') userInfo: model.UserSession,
        @PathParams('threadId', Number) threadId: number
    ) {
        let info = await this.Forums.getThreadById(threadId);
        if (info.userId !== userInfo.userId) {
            throw new this.BadRequest('InvalidThreadId');
        }
        return new model.WWWTemplate({
            title: 'Create Thread Ad', page: {
                threadInfo: info,
                adDisplayTypes: model.Ads.AdDisplayType,
            }
        });
    }

}