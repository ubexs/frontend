import base, { IBaseOptions } from './base';
import * as model from '../models/index';
export default class Support extends base {

    constructor(data?: IBaseOptions) {
        super();
        if (data) {
            const updatedBase = new base(data);

            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }

    /**
     * Get trade ads meta data
     * @param ticketId
     */
    public async metadata(): Promise<{ isEnabled: boolean }> {
        const replies = await this.v1.get('/trade-ads/metadata');
        return replies.data;
    }


}