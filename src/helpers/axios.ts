/**
 * Axios library for making requests to api.ubexs.com
 */
import axios, { AxiosRequestConfig } from 'axios';
import config from './config';

const client = axios.create({
    baseURL: config.baseUrl.backend,
});

export default (version: string, configOptions: AxiosRequestConfig = {}) => {
    configOptions.baseURL = config.baseUrl.backend+'/api/'+version+'/';
    configOptions.headers = configOptions.headers || {};
    configOptions.headers['server-authorization'] = config.backendAuthorization;
    return axios.create(configOptions);
}