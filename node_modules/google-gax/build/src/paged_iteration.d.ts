/// <reference types="node" />
import { Transform } from 'stream';
import { NormalApiCaller, APICall, APICallback } from './api_callable';
export declare class PagedIteration extends NormalApiCaller {
    pageDescriptor: PageDescriptor;
    /**
     * Creates an API caller that returns a stream to performs page-streaming.
     *
     * @private
     * @constructor
     * @param {PageDescriptor} pageDescriptor - indicates the structure
     *   of page streaming to be performed.
     */
    constructor(pageDescriptor: PageDescriptor);
    createActualCallback(request: {
        [index: string]: {};
    }, callback: APICallback): (err: Error | null, response: {
        [index: string]: {};
    }) => void;
    wrap(func: Function): (argument: any, metadata: any, options: any, callback: any) => any;
    init(settings: {}, callback: APICallback): any;
    call(apiCall: APICall, argument: {
        [index: string]: {};
    }, settings: any, canceller: any): void;
}
export declare class PageDescriptor {
    requestPageTokenField: string;
    responsePageTokenField: string;
    requestPageSizeField?: string;
    resourceField: string;
    /**
     * Describes the structure of a page-streaming call.
     *
     * @property {String} requestPageTokenField
     * @property {String} responsePageTokenField
     * @property {String} resourceField
     *
     * @param {String} requestPageTokenField - The field name of the page token in
     *   the request.
     * @param {String} responsePageTokenField - The field name of the page token in
     *   the response.
     * @param {String} resourceField - The resource field name.
     *
     * @constructor
     */
    constructor(requestPageTokenField: string, responsePageTokenField: string, resourceField: string);
    /**
     * Creates a new object Stream which emits the resource on 'data' event.
     * @private
     * @param {ApiCall} apiCall - the callable object.
     * @param {Object} request - the request object.
     * @param {CallOptions=} options - the call options to customize the api call.
     * @return {Stream} - a new object Stream.
     */
    createStream(apiCall: any, request: any, options: any): Transform;
    /**
     * Returns a new API caller.
     * @private
     * @return {PageStreamable} - the page streaming caller.
     */
    apiCaller(): PagedIteration;
}
