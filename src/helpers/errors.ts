import {
    BadRequest,
    NotFound,
    Conflict,
    InternalServerError,
    Unauthorized,
} from 'ts-httpexceptions';

/**
 * HTTP Errors Base Class
 */
export default class HTTPErrorsBase {
    public BadRequest = BadRequest;
    public NotFound = NotFound;
    public Conflict = Conflict;
    public InternalServerError = InternalServerError;
    public Unauthorized = Unauthorized;
}