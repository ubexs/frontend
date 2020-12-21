import * as Sentry from '@sentry/node';
import config from './config';

let _isEnabled = false;
export let isEnabled = () => {
    return _isEnabled;
}

export const init = () => {
    if (config && config.sentry && config.sentry.backend) {
        Sentry.init({ dsn: config.sentry.backend });
        _isEnabled = true;
    }
}

export {
    Sentry
};