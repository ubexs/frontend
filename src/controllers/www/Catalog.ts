import base from '../base';
import { Controller, Get, Header, HeaderParams, Render, Use, Res, Locals, PathParams, Req } from '@tsed/common';
import * as model from '../../models/index';
import * as middleware from '../../middleware/v1';
import { Summary } from "@tsed/swagger";

@Controller('/catalog')
export class CatalogController extends base {

    @Get('/')
    @Render('catalog/index')
    @Summary('Catalog page')
    public Index() {
        return new model.WWWTemplate({
            title: 'Catalog',
        })
    }

    @Get('/create')
    @Summary('Create a catalog item')
    @Render('catalog_create')
    @Use(middleware.auth.YesAuth)
    public async catalogItemCreate(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        return new model.WWWTemplate({
            title: 'Create an Item',
            page: {
                // todo: switch to staff permissions...
                loadStaffPage: userInfo.staff >= 1,
            }
        })
    }

    @Get('/:catalogId/:catalogName/edit')
    @Use(middleware.auth.YesAuth)
    @Render('catalog/edit')
    public async catalogItemEdit(
        @Locals('userInfo') userInfo: model.UserSession,
        @PathParams('catalogId', Number) catalogId: number
    ) {
        catalogId = base.ValidateId(catalogId);
        let ViewData = new model.WWWTemplate<any>({ 'title': '' });
        let catalogData;
        let salesCount = 0;
        try {
            catalogData = await this.Catalog.getInfo(catalogId);
            let _salesData = await this.Catalog.countSales(catalogId);
            salesCount = _salesData.sales;
        } catch (e) {
            throw new this.BadRequest('InvalidCatalogId');
        }
        if (userInfo.staff >= 2) {
            // idk yet
        } else if (catalogData.creatorType === model.Catalog.creatorType.Group) {
            const groupRole = await this.Groups.getUserRole(catalogData.creatorId, userInfo.userId);
            if (groupRole.permissions.manage === 0) {
                throw new this.BadRequest('InvalidPermissions');
            }
        } else if (catalogData.creatorType === model.Catalog.creatorType.User) {
            if (catalogData.creatorId !== userInfo.userId) {
                throw new this.BadRequest('InvalidPermissions');
            }
        }
        ViewData.page = {};
        // todo: REPLACE WITH STAFF PERMISSION SYSTEM
        ViewData.page.loadStaffPage = userInfo.staff >= 2;

        ViewData.page.catalogId = catalogData.catalogId;
        ViewData.page.catalogEncodedName = model.urlEncode(catalogData.catalogName);
        ViewData.page.catalogName = catalogData.catalogName;
        ViewData.page.description = catalogData.description;
        ViewData.page.collectible = catalogData.collectible;
        ViewData.page.category = catalogData.category;
        ViewData.page.forSale = catalogData.forSale;
        ViewData.page.userId = catalogData.creatorId;
        ViewData.page.category = catalogData.category;
        ViewData.page.dateCreated = catalogData.dateCreated;
        ViewData.page.maxSales = catalogData.maxSales;
        ViewData.page.price = catalogData.price;
        ViewData.page.currency = catalogData.currency;
        ViewData.page.sales = salesCount;
        ViewData.page.status = catalogData.status;
        ViewData.title = catalogData.catalogName;
        ViewData.page.categories = model.Catalog.category;
        return ViewData;
    }


    @Get('/:catalogId')
    @Summary('Redirect /:id/ to /:id/:name')
    public async redirectToCatalogItem(
        @Res() res: Res,
        @PathParams('catalogId') catalogId: any,
    ) {
        catalogId = base.ValidateId(catalogId);
        let catalogData = await this.Catalog.getInfo(catalogId);
        const encodedName = model.urlEncode(catalogData.catalogName);
        return res.redirect("/catalog/" + catalogId + "/" + encodedName);
    }

    @Get('/:catalogId/:catalogName')
    @Summary('Catalog item page')
    @Render('catalog/item')
    public async catalogItem(
        @PathParams('catalogId') catalogId: number,
        @Req() req: Req,
    ) {
        catalogId = base.ValidateId(catalogId);
        let catalogData = await this.Catalog.getInfo(catalogId);
        let _salesData = await this.Catalog.countSales(catalogId);
        let salesCount = _salesData.sales;
        let ViewData = new model.WWWTemplate<any>({ 'title': '' });
        ViewData.page = {};
        ViewData.page.catalogId = catalogData.catalogId;
        ViewData.page.catalogEncodedName = model.urlEncode(catalogData.catalogName);
        ViewData.page.catalogName = catalogData.catalogName;
        ViewData.page.description = catalogData.description;
        ViewData.page.collectible = catalogData.collectible;
        ViewData.page.forSale = catalogData.forSale;
        ViewData.page.creatorType = catalogData.creatorType;
        ViewData.page.creatorId = catalogData.creatorId;
        ViewData.page.userId = catalogData.userId;
        ViewData.page.category = catalogData.category;
        ViewData.page.dateCreated = catalogData.dateCreated;
        ViewData.page.maxSales = catalogData.maxSales;
        if (catalogData.maxSales > 0) {
            ViewData.page.unique = 1;
        } else {
            ViewData.page.unique = 0;
        }
        ViewData.page.price = catalogData.price;
        ViewData.page.currency = catalogData.currency;
        ViewData.page.sales = salesCount;
        ViewData.page.averagePrice = catalogData.averagePrice;
        ViewData.title = catalogData.catalogName;
        return ViewData;
    }

}