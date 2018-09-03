/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
export interface Transporter {
    request<T>(opts: AxiosRequestConfig): AxiosPromise<T>;
    request<T>(opts: AxiosRequestConfig, callback?: BodyResponseCallback<T>): void;
    request<T>(opts: AxiosRequestConfig, callback?: BodyResponseCallback<T>): AxiosPromise | void;
}
export interface BodyResponseCallback<T> {
    (err: Error | null, res?: AxiosResponse<T> | null): void;
}
export interface RequestError extends AxiosError {
    errors: Error[];
}
export declare class DefaultTransporter {
    /**
     * Default user agent.
     */
    static readonly USER_AGENT: string;
    /**
     * Configures request options before making a request.
     * @param opts AxiosRequestConfig options.
     * @return Configured options.
     */
    configure(opts?: AxiosRequestConfig): AxiosRequestConfig;
    /**
     * Makes a request using Axios with given options.
     * @param opts AxiosRequestConfig options.
     * @param callback optional callback that contains AxiosResponse object.
     * @return AxiosPromise, assuming no callback is passed.
     */
    request<T>(opts: AxiosRequestConfig): AxiosPromise<T>;
    request<T>(opts: AxiosRequestConfig, callback?: BodyResponseCallback<T>): void;
    /**
     * Changes the error to include details from the body.
     */
    private processError;
}
