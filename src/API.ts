import * as axios from "axios";

// @ts-ignore
import { version, homepage } from "../package.json";

import { IRequestOptions, IMethods, MethodGroup } from "./interfaces";
import AxiosInstance = axios.AxiosInstance;

const API_ENDPOINT = "https://api.namemc.com/";

const groups: MethodGroup[] = [
    "profile",
    "server"
];

/**
 * Make requests to NameMC API
 * @example
 * Get player friends
 * ```
 * const api = new API();
 *
 * api.profile.friends({
 *     target: '2e9d9da1-97e9-4564-890b-6f056c4e372f'
 * });
 * ```
 */
export class API implements IMethods {

    /**
     * @hidden
     */
    private worker: AxiosInstance;

    /**
     * @hidden
     */
    constructor() {
        // @ts-ignore
        this.worker = axios.create({
            baseURL: API_ENDPOINT,
            headers: typeof window === "undefined" ?
                {
                    "User-Agent": `NameMCWrapper/${version} (${homepage})`
                }
                :
                {}
        });

        for (const group of groups) {
            this[group] = new Proxy(Object.create(null), {
                get: (object, prop: string) => ({ target, ...params }: { target?: string }): Promise<any> => this.request({
                    group,
                    target,
                    prop,
                    params
                })
            });
        }
    }

    /**
     * @hidden
     */
    get [Symbol.toStringTag](): string {
        return this.constructor.name;
    }

    /**
     * @hidden
     */
    protected request({ group, target, prop, params }: IRequestOptions): Promise<any> {
        return this.worker.get(`/${group}/${target ? `${target}/` : ""}${prop}`, {
            params
        })
            .then(({ data }) => data);
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface API extends IMethods {}
