import { AxiosRequestConfig, AxiosResponse } from 'axios';
export declare const HOST_ADDRESS = "http://metadata.google.internal";
export declare const BASE_PATH = "/computeMetadata/v1";
export declare const BASE_URL: string;
export declare const HEADER_NAME = "Metadata-Flavor";
export declare const HEADER_VALUE = "Google";
export declare const HEADERS: Readonly<{
    [HEADER_NAME]: string;
}>;
export declare type Options = AxiosRequestConfig & {
    [index: string]: {} | string | undefined;
    property?: string;
    uri?: string;
};
export declare function instance(options?: string | Options): Promise<AxiosResponse<any>>;
export declare function project(options?: string | Options): Promise<AxiosResponse<any>>;
/**
 * Determine if the metadata server is currently available.
 */
export declare function isAvailable(): Promise<boolean>;
