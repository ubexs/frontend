import base, { IBaseOptions } from './base';
import * as model from '../models/index';
export default class Games extends base {

    constructor(data?: IBaseOptions) {
        super();
        if (data) {
            const updatedBase = new base(data);

            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }

    /**
     * Get info for the {gameId}
     * @param gameId
     */
    public async getInfo(gameId: number): Promise<model.Games.GameInfo> {
        const info = await this.v1.get('/game/'+gameId+'/info');
        return info.data;
    }

    /**
     * Get game thumbnail for the {gameId}
     * @param gameId
     */
    public async getGameThumbnail(gameId: number): Promise<model.Games.GameThumbnail> {
        const info = await this.v1.get('/game/'+gameId+'/thumbnail');
        return info.data;
    }

}