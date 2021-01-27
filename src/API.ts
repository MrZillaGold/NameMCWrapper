import axios, { AxiosInstance, AxiosResponse } from "axios";

import { IRequestOptions, IMethods, MethodGroup } from "./interfaces";

const API_ENDPOINT = "https://api.namemc.com/"

const groups: MethodGroup[] = [
    "profile",
    "server"
];

export class API {

    worker: AxiosInstance;

    constructor() {
        this.worker = axios.create({
            baseURL: API_ENDPOINT
        });

        for (const group of groups) {
            // @ts-ignore
            this[group] = new Proxy(Object.create(null),{
                get: (object, prop: string) =>
                    ({ target, ...params }: { target?: string }): Promise<any> =>
                        this.request({
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
            .then(({ data }: AxiosResponse) => data);
    }
}

export interface API extends IMethods {}
