import axios, { type AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import FilogError from './error';
import * as pkgJson from '../package.json'
import chalk from 'chalk'
import { AuthSchemes, ErrorPayload, GraphQlQuery } from './types';

export default class HttpClient {
    private auth: AuthSchemes
    private defaultHeaders: object
    private httpClient: AxiosInstance
    private target: string

    constructor(target: string, auth: AuthSchemes) {
        this.auth = auth
        this.defaultHeaders = {
            'content-type': 'application/json',
            'accept': 'application/json',
            'user-agent': `filog-client/${pkgJson.version}`,
        }
        this.target = target
        this.httpClient = axios.create()
    }

    send =  async (payload: ErrorPayload | GraphQlQuery): Promise<void> => {
        const instance = this;
        await instance.httpClient({
            url: this.target,
            method: 'POST',
            headers: { 
                ...this.defaultHeaders, 
                ...this.auth.type === 'ApiKey' ? { [this.auth.name]: this.auth.value } : {},
                ...this.auth.type === 'BasicAuth' ? { 'Authorization': this.auth.value } : {},
                ...this.auth.type === 'Cookie' ? { 'Cookie': `${this.auth.name}=${this.auth.value}`} : {}
            },
            data: payload,
            withCredentials: true
        }).then((response: any) => {
            // handling error with 200 statusCode (graphQL)
            if (response.data.errors) {
                const { message, extensions } = response.data.errors[0];
                delete extensions.stacktrace
                console.error(new FilogError('GraphQL Error', extensions.code, { message, extensions }));
                return;
            }
        }).catch((error: any) => {
            if (error.code === 'ECONNREFUSED') {
                console.log(chalk.redBright(`[5log-SDK] Error: Can not connect to ${error.config.url}`));
                return;
            }
            /**
             * TODO! 
             * error.response on graphql is different than the normal http response. so we need to refactor this
             * in order not to confuse users
             */
            let apiErrorResponse: {[key: string]: any} = null
            if (payload.hasOwnProperty('query') && payload.hasOwnProperty('variables') || error.response.data.errors) {
                apiErrorResponse = error.response.data.errors[0];
                delete apiErrorResponse.locations
                delete apiErrorResponse.extensions.stacktrace
            } else {
                apiErrorResponse = error.response.data
            }
            console.error(new FilogError(error.message, error.response.data.code, apiErrorResponse));
            return;
        })
    };
}