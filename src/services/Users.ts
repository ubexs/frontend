import base, { IBaseOptions } from './base';
import * as model from '../models/index';
export default class Users extends base {

    constructor(data?: IBaseOptions) {
        super();
        if (data) {
            const updatedBase = new base({
                cookie: data.cookie,
            });

            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }
    /**
     * Get info for the {userId}
     * @param userId 
     */
    public async getInfo(userId: number, specificColums: string[] = []): Promise<model.Users.Info> {
        const info = await this.v1.get('/user/' + userId + '/info?columns=' + specificColums.join(','));
        return info.data;
    }

    /**
     * Get ban data for the authenticated user, or 404
     */
    public async getBanData(): Promise<model.Users.ModerationAction> {
        const info = await this.v1.get('/auth/ban');
        return info.data;
    }

    /**
     * Get cookie consent info for the current session
     */
    public async getCookieConsentInfo(): Promise<{ googleAnalytics: boolean }> {
        const info = await this.v1.get('/auth/cookie-consent');
        return info.data;
    }

    /**
     * Get the authenticated user session info
     */
    public async getAuthenticatedUserInfo(): Promise<model.Users.AuthenticatedInfo> {
        const info = await this.v1.get('/auth/current-user');
        return info.data;
    }

    /**
     * Get past usernames for the {userId}
     * @param userId
     */
    public async getPastUsernames(userId: number): Promise<string[]> {
        const results = await this.v1.get('/user/' + userId + '/past-usernames');
        let pastNames: string[] = [];
        for (const name of results.data as { username: string }[]) {
            pastNames.push(name.username);
        }
        // todo: we might have to reverse this? check with backend to see what order it's in
        return pastNames;
    }
}