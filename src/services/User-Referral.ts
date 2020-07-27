import base, { IBaseOptions } from './base';
import * as model from '../models/index';
export default class UserReferral extends base {

    constructor(data?: IBaseOptions) {
        super();
        if (data) {
            const updatedBase = new base(data);

            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }
    /**
     * Get info for the {referralId}
     * @param referralId
     */
    public async getInfoById(referralId: number): Promise<model.UserReferral.ReferralInfo> {
        const info = await this.v1.get('/user-referral/code/'+referralId+'/info');
        return info.data;
    }


}