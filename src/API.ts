import axios, { AxiosInstance } from "axios";

// @ts-ignore
import { version, homepage } from "../package.json";

import { IRequestOptions, IMethods, MethodGroup } from "./interfaces";

const API_ENDPOINT = "https://api.namemc.com/";

const groups: MethodGroup[] = [
    "profile",
    "server"
];

export class API {

    private worker: AxiosInstance;

    constructor() {
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

    get [Symbol.toStringTag](): string {
        return this.constructor.name;
    }

    protected request({ group, target, prop, params }: IRequestOptions): Promise<any> {
        return this.worker.get(`/${group}/${target ? `${target}/` : ""}${prop}`, {
            params
        })
            .then(({ data }) => data);
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface API extends IMethods {}
