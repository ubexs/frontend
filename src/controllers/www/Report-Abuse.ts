import { Controller, Get, All, Next, Req, Res, UseBefore, Render, QueryParams, PathParams, Redirect, Response, Request, Locals, UseAfter, Required, Use, UseBeforeEach } from "@tsed/common";
import * as model from '../../models';
import base from '../base'
// Models
import * as middleware from '../../middleware/v1';

@Controller("/report-abuse")
export class ReportAbuseController extends base {
    constructor() {
        super();
    }
    @Get('/user-status/:userStatusId')
    @Render('report-abuse/user-status')
    @Use(middleware.auth.YesAuth)
    public reportUserStatus(
        @PathParams('userStatusId', Number) userStatusId: number,
    ) {
        return new model.WWWTemplate({
            title: 'Report Abuse',
            page: {
                userStatusId: userStatusId,
            }
        });
    }
}