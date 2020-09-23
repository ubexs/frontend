import base from '../base';
import {
    Controller,
    Get,
    Header,
    HeaderParams,
    Render,
    Use,
    Res,
    Locals,
    PathParams,
    Required,
    QueryParams
} from '@tsed/common';
import * as model from '../../models/index';
import * as viewModel from '../../viewmodels';
import * as middleware from '../../middleware/v1';
import { Summary } from "@tsed/swagger";

@Controller('/trades')
export class TradesController extends base {

    @Get('/')
    @Get('/default')
    @Summary('User trades page/overview')
    @Render('trades/default')
    @Use(middleware.auth.YesAuth)
    public async trades() {
        let info = await this.TradeAds.metadata();
        return new model.WWWTemplate({
            title: 'Trades',
            page: {
                tradeAdsMetadata: info,
            }
        })
    }

    @Get('/ads')
    @Get('/ads/default')
    @Summary('Trade ads dashboard')
    @Render('trades/ads')
    @Use(middleware.auth.YesAuth)
    public async tradeAds() {
        let info = await this.TradeAds.metadata();
        if (!info.isEnabled) {
            throw new this.Conflict('NotEnabled');
        }
        return new model.WWWTemplate({
            title: 'Trade Ads',
        })
    }

    @Get('/create')
    @Summary("Create a trade ad")
    @Render('users/trade')
    public async trade() {
        let info = await this.TradeAds.metadata();
        if (!info.isEnabled) {
            throw new this.Conflict('NotEnabled');
        }
        return new model.WWWTemplate<{ mode: string }>({
            title: 'Create a Trade Ad',
            page: {
                mode: 'CreateTradeAd',
            },
        })
    }
}