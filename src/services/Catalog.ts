import base, { IBaseOptions } from './base';
import * as model from '../models/index';
export default class Catalog extends base {

    constructor(data?: IBaseOptions) {
        super();
        if (data) {
            const updatedBase = new base(data);

            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }
    /**
     * Get info for the {catalogId}
     * @param catalogId
     */
    public async getInfo(catalogId: number): Promise<model.Catalog.CatalogInfo> {
        const info = await this.v1.get('/catalog/'+catalogId+'/info');
        return info.data;
    }

    /**
     * count sales for the {catalogId}
     * @param catalogId
     */
    public async countSales(catalogId: number): Promise<{sales: number}> {
        const info = await this.v1.get('/catalog/'+catalogId+'/sales/count');
        return info.data;
    }




}