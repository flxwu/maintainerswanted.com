/// <reference types="request" />
import * as r from 'request';
export declare type RequestBody = any;
export declare type RequestResponse = r.Response;
export declare type Request = r.Request;
export declare type RequestOptions = r.OptionsWithUri;
export declare type RequestCallback = (err: Error | null, response?: r.Response, body?: RequestBody) => void;
export declare type AuthorizeRequestCallback = (err: Error | null, authorizedReqOpts: RequestOptions) => void;
