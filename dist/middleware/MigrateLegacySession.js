"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrateRBXSession = () => {
    return (req, res, next) => {
        let cookie = req.cookies['rbxsession'];
        if (cookie) {
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
        next();
    };
};
