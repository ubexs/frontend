import base from '../base';
import {Controller, Get, Header, HeaderParams, Render, Use, Res, Locals, PathParams, Req, All} from '@tsed/common';
import * as model from '../../models/index';
import * as middleware from '../../middleware/v1';
import axios from "../../helpers/axios";

@Controller('/api/v1/')
export class DevApiProxy extends base {

    @All('/*')
    public async allMethods(
        @Req() req: Req,
        @Res() res: Res,
    ) {
        if (process.env.NODE_ENV !== 'development') {
            throw new Error('Disabled');
        }
        const result = await axios('v1', {
            validateStatus: () => {
                return true;
            },
            headers: {
                cookie: req.headers['cookie'],
                'x-csrf-token': req.headers['x-csrf-token'] || 'null',
                'accept': req.headers['accept'] || 'application/json',
                // 'content-type': req.headers['content-type'],
            },
            maxRedirects: 0,
            responseType: 'arraybuffer',
        }).request({
            method: req.method as any,
            url: req.url,
            data: req.body,
        });

        // res.status(result.status);
        const headers: any = {};
        for (const key of Object.getOwnPropertyNames(result.headers)) {
            if (key === 'host') {
                continue;
            }
            let val = result.headers[key];
            if (!val || !key) {
                continue;
            }
            // res.set(key, val);
            headers[key] = val;
        }
        if ((result.headers['content-type'] as string).match(/json/g)) {
            res.set(headers);
            res.status(result.status);
            res.send(result.data).end();
            return;
        }
        res.writeHead(result.status, result.statusText, headers);
        res.write(result.data, err => {
            if (err) {
                console.error(err);
            }
            res.end()
        });
    }
}