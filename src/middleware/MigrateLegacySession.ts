import { EndpointInfo, IMiddleware, Middleware, Req } from "@tsed/common";
import { NotAcceptable } from "ts-httpexceptions";
import { Request, Response, Res, Next } from "@tsed/common";
import { BadRequest } from 'ts-httpexceptions';
import { NextFunction } from "express";
import axios, { AxiosResponse } from 'axios';

import config from '../helpers/config';


export const MigrateRBXSession = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        let cookie = req.cookies['rbxsession'];
        if (cookie) {
            res.cookie('blockshub-session', cookie, {
                secure: true,
                maxAge: (86400 * 30 * 12) * 1000,
                sameSite: 'lax',
                domain: '.blockshub.net',
            })
            res.clearCookie('rbxsession');
            res.redirect('/');
            return
        }
        next();
    }
}
