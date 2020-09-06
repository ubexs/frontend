"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrateRBXSession = void 0;
exports.MigrateRBXSession = () => {
    return (req, res, next) => {
        if (typeof req.cookies === 'object' && req.cookies !== null) {
            let cookie = req.cookies['rbxsession'];
            if (typeof cookie === 'string') {
                res.cookie('blockshub-session', cookie, {
                    secure: true,
                    maxAge: (86400 * 30 * 12) * 1000,
                    sameSite: 'lax',
                    domain: '.blockshub.net',
                });
                res.clearCookie('rbxsession');
                res.redirect('/');
                return;
            }
        }
        next();
    };
};
