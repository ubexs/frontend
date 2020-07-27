import base from '../../controllers/base';
import { Locals, Middleware } from '@tsed/common';
import * as model from '../../models/index';

@Middleware()
export class YesAuth extends base {
    public use(
        @Locals('userInfo') info?: model.UserSession,
    ) {
        if (!info) {
            throw new this.Unauthorized('LoginRequired');
        }
        // Continue
    }
}

@Middleware()
export class NoAuth extends base {
    public use(
        @Locals('userInfo') info?: model.UserSession,
    ) {
        if (info) {
            throw new this.Unauthorized('LogoutRequired');
        }
        // Continue
    }
}