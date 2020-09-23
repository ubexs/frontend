import base, { IBaseOptions } from './base';
import * as model from '../models/index';
export default class Staff extends base {

    constructor(data?: IBaseOptions) {
        super();
        if (data) {
            const updatedBase = new base(data);

            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }
    /**
     * Get permissions for the {userId}. Returns an array of permission IDs
     * @param userId
     */
    public async getPermissions(userId: number): Promise<number[]> {
        const info = await this.v1.get('/staff/permissions/' + userId);
        let permissionArray: number[] = [];
        for (let perm in info.data) {
            let num = parseInt(perm, 10);
            if (Number.isInteger(num)) {
                permissionArray.push(num);
            }
        }
        return permissionArray;
    }

    public getModerationHistory(userId: number): Promise<model.Staff.ModerationHistory[]> {
        return this.v1.get('/staff/user/moderation-history?userId=' + userId).then(d => { return d.data });
    }

    public getUserEmail(userId: number): Promise<model.Staff.EmailModel | undefined> {
        return this.v1.get('/staff/user/email?userId=' + userId).then(d => { return d.data });
    }

    public getUserEmails(userId: number): Promise<model.Staff.EmailModel[]> {
        return this.v1.get('/staff/user/emails?userId=' + userId).then(d => { return d.data });
    }

    public searchUsers(req: Partial<{ userId: number; email: string; username: string }>): Promise<{ userId: number; username: string }[]> {
        return this.v1.get('/staff/user/search?userId=' + (req.userId || '') + '&username=' + (req.username || '') + '&email=' + (req.email || '')).then(d => { return d.data });
    }

    /**
     * Guess user country based off IPs
     * @param userId 
     */
    public getUserCountry(userId: number): Promise<{ country: string; countryCode: string; }> {
        return this.v1.get('/staff/user/' + userId + '/country').then(d => { return d.data });
    }
}