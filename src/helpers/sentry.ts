import * as Sentry from '@sentry/node';

let _isEnabled = false;
export let isEnabled = () => {
    return _isEnabled;
}

export const init = () => {
    Sentry.init({ dsn: 'https://dccc8567d5714c75a7b884ffd1d73843@sentry.io/2506252' });
    _isEnabled = true;
}

export {
    Sentry
};