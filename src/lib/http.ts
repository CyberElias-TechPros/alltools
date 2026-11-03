/**
 * HTTP status code reference.
 *
 * Facts only: the code, its registered name, what it means and when to send
 * it. This is a reference table, not a live checker — checking someone else's
 * response headers requires a server, which is why that tool is marked planned.
 */

export type StatusClass = "1xx" | "2xx" | "3xx" | "4xx" | "5xx";

export interface StatusCode {
  code: number;
  name: string;
  klass: StatusClass;
  summary: string;
  when: string;
  rfc?: string;
}

export const STATUS_CODES: StatusCode[] = [
  { code: 100, name: "Continue", klass: "1xx", summary: "The server has received the request headers and the client should send the body.", when: "Rarely needed by hand; used with Expect: 100-continue for large uploads." },
  { code: 101, name: "Switching Protocols", klass: "1xx", summary: "The server is switching protocols as requested by the client.", when: "WebSocket upgrades." },
  { code: 103, name: "Early Hints", klass: "1xx", summary: "Sends link headers before the final response so the browser can preload assets.", when: "Performance tuning with preload hints.", rfc: "RFC 8297" },
  { code: 200, name: "OK", klass: "2xx", summary: "The request succeeded and the body contains the result.", when: "The default success response for GET." },
  { code: 201, name: "Created", klass: "2xx", summary: "A new resource was created as a result of the request.", when: "POST that creates a record; include a Location header." },
  { code: 202, name: "Accepted", klass: "2xx", summary: "The request was accepted for processing but is not finished.", when: "Queued jobs and asynchronous workflows." },
  { code: 204, name: "No Content", klass: "2xx", summary: "The request succeeded and there is deliberately no body.", when: "DELETE or PUT where returning a body would be noise." },
  { code: 206, name: "Partial Content", klass: "2xx", summary: "Only part of the resource is returned, as requested by a Range header.", when: "Video streaming and resumable downloads." },
  { code: 301, name: "Moved Permanently", klass: "3xx", summary: "The resource has moved permanently; clients should update their links.", when: "Changing a URL for good — search engines transfer signals." },
  { code: 302, name: "Found", klass: "3xx", summary: "A temporary redirect.", when: "Short-lived redirects that should not be cached long-term." },
  { code: 303, name: "See Other", klass: "3xx", summary: "The response is at another URL and should be fetched with GET.", when: "Post/Redirect/Get after a form submission." },
  { code: 304, name: "Not Modified", klass: "3xx", summary: "The cached copy is still valid, so no body is sent.", when: "Conditional requests with If-None-Match or If-Modified-Since." },
  { code: 307, name: "Temporary Redirect", klass: "3xx", summary: "A temporary redirect that preserves the request method.", when: "Temporary redirects for non-GET requests." },
  { code: 308, name: "Permanent Redirect", klass: "3xx", summary: "A permanent redirect that preserves the request method.", when: "Permanent moves of POST endpoints or API versions." },
  { code: 400, name: "Bad Request", klass: "4xx", summary: "The request is malformed or fails validation.", when: "Invalid JSON, missing required fields, unparseable parameters." },
  { code: 401, name: "Unauthorized", klass: "4xx", summary: "Authentication is required and missing or invalid.", when: "No token, an expired token, wrong credentials. Send WWW-Authenticate." },
  { code: 403, name: "Forbidden", klass: "4xx", summary: "The server knows who you are but refuses the request.", when: "Authorised user lacking permission — distinct from 401 on purpose." },
  { code: 404, name: "Not Found", klass: "4xx", summary: "No resource exists at that URL.", when: "Unknown path or deleted record. Do not use it to hide a 403." },
  { code: 405, name: "Method Not Allowed", klass: "4xx", summary: "The URL exists but not for that HTTP method.", when: "PUT on a read-only endpoint; send an Allow header." },
  { code: 406, name: "Not Acceptable", klass: "4xx", summary: "No representation matches the client's Accept headers.", when: "Content negotiation failures." },
  { code: 408, name: "Request Timeout", klass: "4xx", summary: "The client did not finish sending the request in time.", when: "Slow uploads; close the connection." },
  { code: 409, name: "Conflict", klass: "4xx", summary: "The request conflicts with the current state of the resource.", when: "Duplicate unique keys, edit collisions, concurrent updates." },
  { code: 410, name: "Gone", klass: "4xx", summary: "The resource existed but has been intentionally removed.", when: "Deleted content you want search engines to drop promptly." },
  { code: 411, name: "Length Required", klass: "4xx", summary: "A Content-Length header is required.", when: "Uploads without a declared size." },
  { code: 412, name: "Precondition Failed", klass: "4xx", summary: "A conditional header such as If-Match did not hold.", when: "Optimistic concurrency control." },
  { code: 413, name: "Content Too Large", klass: "4xx", summary: "The request body is larger than the server accepts.", when: "Upload limits; advertise the limit in the response." },
  { code: 414, name: "URI Too Long", klass: "4xx", summary: "The request target is longer than the server will parse.", when: "Over-long query strings; cap them client-side." },
  { code: 415, name: "Unsupported Media Type", klass: "4xx", summary: "The Content-Type is not supported by the endpoint.", when: "Sending XML to a JSON-only API." },
  { code: 416, name: "Range Not Satisfiable", klass: "4xx", summary: "The requested byte range cannot be fulfilled.", when: "Resume requests beyond the file size." },
  { code: 417, name: "Expectation Failed", klass: "4xx", summary: "The Expect header cannot be met.", when: "Rare; Expect: 100-continue not supported." },
  { code: 418, name: "I'm a Teapot", klass: "4xx", summary: "An April Fools' code from RFC 2324, now a meme.", when: "Never in production, unless you want the joke." },
  { code: 422, name: "Unprocessable Content", klass: "4xx", summary: "The syntax is valid but the semantics are not.", when: "Validation errors that are deeper than shape — a well-formed but impossible date." },
  { code: 425, name: "Too Early", klass: "4xx", summary: "The server is unwilling to risk replaying an early-data request.", when: "TLS early data (0-RTT).", rfc: "RFC 8470" },
  { code: 426, name: "Upgrade Required", klass: "4xx", summary: "The client must switch to a different protocol.", when: "Requiring TLS via an Upgrade header." },
  { code: 428, name: "Precondition Required", klass: "4xx", summary: "The server requires a conditional request.", when: "Preventing lost updates on PUT." },
  { code: 429, name: "Too Many Requests", klass: "4xx", summary: "The client has sent too many requests in a given time.", when: "Rate limiting; include Retry-After." },
  { code: 431, name: "Request Header Fields Too Large", klass: "4xx", summary: "Headers exceed the server's limits.", when: "Oversized cookies — split or reduce them." },
  { code: 451, name: "Unavailable For Legal Reasons", klass: "4xx", summary: "Access is blocked for legal reasons.", when: "Court orders and geo-blocking." },
  { code: 500, name: "Internal Server Error", klass: "5xx", summary: "The server hit an unexpected condition.", when: "Unhandled exceptions. Log it; never leak stack traces." },
  { code: 501, name: "Not Implemented", klass: "5xx", summary: "The server does not support the functionality required.", when: "Unsupported HTTP method on the server as a whole." },
  { code: 502, name: "Bad Gateway", klass: "5xx", summary: "A proxy received an invalid response from upstream.", when: "Upstream crashed or returned garbage — check the gateway's logs." },
  { code: 503, name: "Service Unavailable", klass: "5xx", summary: "The server is temporarily overloaded or under maintenance.", when: "Deploys and load shedding; include Retry-After." },
  { code: 504, name: "Gateway Timeout", klass: "5xx", summary: "A proxy did not get a timely response from upstream.", when: "Slow database or backend exceeding the gateway timeout." },
  { code: 505, name: "HTTP Version Not Supported", klass: "5xx", summary: "The server does not support the HTTP version used.", when: "Very old or very new protocol versions." },
  { code: 507, name: "Insufficient Storage", klass: "5xx", summary: "The server cannot store the representation needed to complete the request.", when: "Disk-full conditions, from WebDAV." },
  { code: 511, name: "Network Authentication Required", klass: "5xx", summary: "The client must authenticate to gain network access.", when: "Captive portals.", rfc: "RFC 6585" },
];

export const STATUS_CLASSES: Array<{ klass: StatusClass; label: string; description: string }> = [
  { klass: "1xx", label: "Informational", description: "The request was received and processing continues." },
  { klass: "2xx", label: "Success", description: "The request was received, understood and accepted." },
  { klass: "3xx", label: "Redirection", description: "Further action is needed to complete the request." },
  { klass: "4xx", label: "Client error", description: "The request is wrong: bad syntax, missing auth or no permission." },
  { klass: "5xx", label: "Server error", description: "The server failed to fulfil a valid request." },
];

export function findStatus(code: number): StatusCode | undefined {
  return STATUS_CODES.find((status) => status.code === code);
}

export function searchStatuses(query: string): StatusCode[] {
  const term = query.trim().toLowerCase();
  if (!term) return STATUS_CODES;
  return STATUS_CODES.filter(
    (status) =>
      String(status.code).includes(term) ||
      status.name.toLowerCase().includes(term) ||
      status.summary.toLowerCase().includes(term) ||
      status.klass.includes(term),
  );
}
