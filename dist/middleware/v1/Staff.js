"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model = require("../../models");
const base_1 = require("../../controllers/base");
exports.AddPermissionsToLocals = async (req, res, next) => {
    try {
        const service = new base_1.default({
            cookie: req.headers['cookie'],
        });
        let userInfo = res.locals.userInfo;
        if (!userInfo || userInfo.staff === 0) {
            return next();
        }
        userInfo.staffPermissions = await service.Staff.getPermissions(userInfo.userId);
        res.locals.hasPerm = (permission) => {
            return userInfo.staff >= 100 || userInfo.staffPermissions.includes(model.Staff.Permission[permission]);
        };
        next();
    }
    catch (err) {
        return next(err);
    }
};
exports.validate = (...requiredLevels) => {
    return async (req, res, next) => {
        const service = new base_1.default({
            cookie: req.headers['cookie'],
        });
        try {
            const session = req.session;
            const userInfo = Object.assign({}, res.locals.userInfo);
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
                }
                else {
                    throw new service.Conflict('InvalidPermissions');
                }
            }
            if (userInfo.staff >= 100) {
                return next();
            }
            const userPermissions = await service.Staff.getPermissions(userInfo.userId);
            let isOk = true;
            for (const perm of requiredLevels) {
                if (!userPermissions.includes(perm)) {
                    isOk = false;
                }
            }
            if (isOk) {
                return next();
            }
            throw new service.Conflict('InvalidPermissions');
        }
        catch (err) {
            return next(err);
        }
    };
};
