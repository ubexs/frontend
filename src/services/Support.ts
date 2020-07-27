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
     * Get info for the {ticketId}
     * @param ticketId
     */
    public async getTicketById(ticketId: number): Promise<model.Support.TicketInfo> {
        const info = await this.v1.get('/support/ticket/'+ticketId+'/info');
        return info.data;
    }

    /**
     * Get replies to the {ticketId}
     * @param ticketId
     */
    public async getTicketReplies(ticketId: number): Promise<model.Support.SupportTicketReply[]> {
        const replies = await this.v1.get('/support/ticket/'+ticketId+'/replies');
        return replies.data;
    }


}