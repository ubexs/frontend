import * as Sentry from '../helpers/sentry';
import {Err, Middleware, OverrideProvider, Req, Res, GlobalErrorHandlerMiddleware, Next} from "@tsed/common";
import * as xss from 'xss';
const logError = (status: number, code: string, path: string, method: string) => {
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    return console.log('['+method.toUpperCase()+'] '+path+' ['+status.toString()+'] - '+code);
}

const ErrorTemplate = (title: string, body: string) => {
    return `<!DOCTYPE html><html><head><title>${title}</title><body><p>${body}</p></body></html>`;
}


/**
 * Handler for non-404 errors
 */
@OverrideProvider(GlobalErrorHandlerMiddleware)
export class GlobalErrorHandler extends GlobalErrorHandlerMiddleware {

    public use(
        @Err() error: any, 
        @Req() request: Req, 
        @Res() response: Res
    ) {
        if (error && error.message) {
            if (error.message === 'LogoutRequired') {
                logError(302, 'LogoutRequired', request.originalUrl, request.method);
                return response.redirect('/dashboard');
            }else if (error.message === 'LoginRequired') {
                logError(302, 'LoginRequired', request.originalUrl, request.method);
                return response.redirect('/login');
            }
        }

        if (process.env.NODE_ENV === 'development' && request.accepts('html')) {
            return response.send(`<h1>HTTP ${error.status || 500} - ${error.name || 'Internal Server Error'}</h1><p style="white-space: pre-wrap;font-family:monospace;">${xss.filterXSS(error.stack, {whiteList: {}})}</p>\n\n<!-- Original Error Message\n${error.message}\n-->`).end();
        }
        // transform backend api errors to normal http errors
        if (error.isAxiosError && error.response) {
            if (error.response.status === 404) {
                error.name = 'NOT_FOUND';
            }else if (error.response.status === 400) {
                error.name = 'BAD_REQUEST';
            }else if (error.response.status === 409) {
                error.name = 'CONFLICT';
            }else if (error.response.status === 401) {
                error.name = 'UNAUTHORIZED';
            }else if (error.response.status === 403) {
                error.name = 'FORBIDDEN';
            }
        }
        try {
            if (error.name === 'BAD_REQUEST') {
               return response.status(400).send(ErrorTemplate('400: Bad Request', 'You or your browser sent an invalid request.')).end();
            } else if (error.name === 'NOT_FOUND') {
                logError(404, 'NOT_FOUND', request.originalUrl, request.method);
                return response.status(404).send(ErrorTemplate('404: Not Found', 'The page you tried to view does not seem to exist.')).end();
            } else if (error.name === 'CONFLICT') {
                logError(409, error.code, request.originalUrl, request.method);
                return response.status(409).send(ErrorTemplate('409: Conflict', 'Resource conflict. Please go back and try again.')).end();
            } else if (error.name === 'UNAUTHORIZED') {
                return response.status(401).send(ErrorTemplate('401: Unauthorized', 'Unauthorized. Please go back and try again.')).end();
            } else if (error.name === 'FORBIDDEN') {
                return response.status(401).send(ErrorTemplate('403: Forbidden', 'Forbidden. Please go back and try again.')).end();
            }else{
                throw error;
            }
        } catch (e) {
            // Log exception
            if (Sentry.isEnabled()) {
                Sentry.Sentry.captureException(e);
            }
        }

        // default if internal error / something goes wrong in error handler
        // return response.status(500).send(ErrorTemplate('500: Internal Server Error', 'BlocksHub seems to be experiencing some issues right now. Please try again later.')).end();
        return super.use(error, request, response);
    }
}

/**
 * Middleware for not found (aka 404) response
 */
@Middleware()
export class NotFoundMiddleware {
    use(@Req() request: Req, @Res() response: Res, @Next() next: Next) {
        response.status(404)
        if (process.env.NODE_ENV === 'development') {
            return response.send(`<h1>HTTP 404 - Not Found</h1><p>A controller or static file could not be found for <code>${request.url}</code></p>`).end();
        }
        return response.send(ErrorTemplate('404: Not Found', 'The resource you tried to view could not be found.')).end();
    }
}
