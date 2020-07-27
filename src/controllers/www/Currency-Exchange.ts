import {Controller, Get, Locals, PathParams, QueryParams, Render, Res, Use, UseBefore} from "@tsed/common";
import * as model from '../../models/';
import * as middleware from '../../middleware/v1';
import base from '../base'
// Models

@Controller("/currency-exchange")
export class CurrencyExchangeController extends base {
    constructor() {
        super();
    }

    @Render('currency-exchange/index')
    @Get('/')
    @Use(middleware.auth.YesAuth)
    public async subCategory(
        @Locals('userInfo') userData: model.UserSession,
    ) {
        return new model.WWWTemplate({title: 'Currency Exchange'});
    }
}