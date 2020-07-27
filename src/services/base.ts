import errors from '../helpers/errors';
import client from '../helpers/axios';
import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface IBaseOptions {
    cookie?: string;
}
/**
 * Service base class
 */
export default class ServiceBase extends errors {
    private clientOptions: AxiosRequestConfig = {};
    constructor(opts?: IBaseOptions) {
        super();
        const customClientOptions: AxiosRequestConfig = {
            headers: {
                'accept': 'application/json',
            },
            maxRedirects: 0,
        };
        if (opts) {
            if (opts.cookie) {
                customClientOptions.headers['cookie'] = opts.cookie;
            }
        }
        this.clientOptions = customClientOptions;
        this.v1 = client('v1', this.clientOptions);
        this.v2 = client('v2', this.clientOptions);
    }
    /**
     * BlocksHub V1 API
     */
    public v1: AxiosInstance;
    /**
     * BlocksHub V2 API
     */
    public v2: AxiosInstance;
}