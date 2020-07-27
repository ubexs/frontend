import * as model from '../../models';
import base from '../../controllers/base';
import * as Express from 'express';


export const AddPermissionsToLocals = async (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    try {
        const service = new base({
            cookie: req.headers['cookie'],
        });
        let userInfo = res.locals.userInfo;
        if (!userInfo || userInfo.staff === 0) {
            return next();
        }
        // Grab permissions
        userInfo.staffPermissions = await service.Staff.getPermissions(userInfo.userId);
        res.locals.hasPerm = (permission: string): boolean => {
            return userInfo.staff >= 100 || userInfo.staffPermissions.includes(model.Staff.Permission[permission as any]);
        }
        next();
    }catch(err) {
        return next(err);
    }
}


export const validate = (...requiredLevels: model.Staff.Permission[]) => {
    return async (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
        const service = new base({
            cookie: req.headers['cookie'],
        });
        try {
            // @ts-ignore
            const session = req.session;
            const userInfo: model.UserSession = Object.assign({}, res.locals.userInfo);
            if (!userInfo) {
                throw new service.Conflict('InvalidPermissions');
            }
            if (session && session.userdata) {
                if (session.impersonateUserId) {
                    const _newRequest = await service.Users.getInfo(session.userdata.id);
                    userInfo.userId = _newRequest.userId;
                    userInfo.username = _newRequest.username;
                    userInfo.staff = _newRequest.staff;
                }
            }
            if (!requiredLevels) {
                if (userInfo.staff >= 1) {
                    return next();
                } else {
                    throw new service.Conflict('InvalidPermissions');
                }
            }
            if (userInfo.staff >= 100) {
                return next(); // auto skip
            }
            const userPermissions = await service.Staff.getPermissions(userInfo.userId);
            let isOk = true;
            for (const perm of requiredLevels) {
                if (!userPermissions.includes(perm)) {
                    isOk = false;
                }
            }
            if (isOk) {
                return next(); // OK
            }
            throw new service.Conflict('InvalidPermissions');
        }catch(err) {
            return next(err);
        }
    };
}