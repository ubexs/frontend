import { EndpointInfo, IMiddleware, Middleware, Req } from "@tsed/common";
import { NotAcceptable } from "ts-httpexceptions";
import { Request, Response, Res, Next } from "@tsed/common";
import { BadRequest } from 'ts-httpexceptions';
import { NextFunction } from "express";
import axios, { AxiosResponse } from 'axios';

import config from '../helpers/config';


export const MigrateUBXSession = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (typeof req.cookies === 'object' && req.cookies !== null) {
            let cookie = req.cookies['ubxsession'];
            if (typeof cookie === 'string') {
                res.cookie('10allday-session', cookie, {
                    secure: true,
                    maxAge: (86400 * 30 * 12) * 1000,
                    sameSite: 'lax',
                    domain: '.10allday.com',
                })
                res.clearCookie('ubxsession');
                res.redirect('/');
                return
            }
        }
        next();
    }
}