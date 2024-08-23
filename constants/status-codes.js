export const httpStatusCodes = {
    // Success Responses
    OK: 200, // The request was successful.
    CREATED: 201, // The request was successful and a new resource was created.
    ACCEPTED: 202, // The request has been accepted for processing, but the processing has not been completed.
    NO_CONTENT: 204, // The request was successful, but there is no content to send in the response.
  
    // Client Error Responses
    BAD_REQUEST: 400, // The server could not understand the request due to invalid syntax.
    UNAUTHORIZED: 401, // The client must authenticate itself to get the requested response.
    FORBIDDEN: 403, // The client does not have access rights to the content.
    NOT_FOUND: 404, // The server can not find the requested resource.
    METHOD_NOT_ALLOWED: 405, // The request method is not allowed for the requested resource.
    NOT_ACCEPTABLE: 406, // The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.
    REQUEST_TIMEOUT: 408, // The server timed out waiting for the request.
    CONFLICT: 409, // The request could not be processed because of a conflict in the current state of the resource.
    GONE: 410, // The requested resource is no longer available and will not be available again.
    LENGTH_REQUIRED: 411, // The server refuses to accept the request without a defined Content-Length.
    PRECONDITION_FAILED: 412, // One or more conditions in the request header fields evaluated to false.
    PAYLOAD_TOO_LARGE: 413, // The request entity is larger than the server is willing or able to process.
    UNSUPPORTED_MEDIA_TYPE: 415, // The request entity has a media type that the server or resource does not support.
    UNPROCESSABLE_ENTITY: 422, // The request was well-formed but was unable to be followed due to semantic errors.
    TOO_MANY_REQUESTS: 429, // The user has sent too many requests in a given amount of time ("rate limiting").
  
    // Server Error Responses
    INTERNAL_SERVER_ERROR: 500, // The server has encountered a situation it does not know how to handle.
    NOT_IMPLEMENTED: 501, // The request method is not supported by the server and cannot be handled.
    BAD_GATEWAY: 502, // The server, while acting as a gateway or proxy, received an invalid response from an inbound server.
    SERVICE_UNAVAILABLE: 503, // The server is not ready to handle the request. Common causes are a server that is down for maintenance or that is overloaded.
    GATEWAY_TIMEOUT: 504, // The server is acting as a gateway or proxy and did not receive a timely response from an upstream server.
    NETWORK_AUTHENTICATION_REQUIRED: 511, // The client needs to authenticate to gain network access.
  };
  