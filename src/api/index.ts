import axios, { AxiosInstance } from 'axios';

import { IFriend, IParams, IServerLikesParams } from './methods';

// @ts-ignore
import * as packageMeta from '../../package.json' assert { type: 'json' };

const { version, homepage } = packageMeta;

export interface IRequestOptions {
    group: Group;
    target?: string;
    prop: string;
    params?: any;
}

export enum Group {
    PROFILE = 'profile',
    SERVER = 'server'
}

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
export class API {

    static ENDPOINT = 'https://api.namemc.com';

    /**
     * Profile API section methods
     */
    readonly profile!: {
        /**
         * Get player friends
         */
        friends(params: IParams): Promise<IFriend[]>;
    };
    /**
     * Server API section methods
     */
    readonly server!: {
        /**
         * Check player server like
         */
        likes(params: IParams): Promise<string[]>;
        /**
         * Get all players list server likes
         */
        likes(params: IServerLikesParams): Promise<boolean>;
    };

    /**
     * @hidden
     */
    private worker: AxiosInstance;

    /**
     * @hidden
     */
    constructor() {
        this.worker = axios.create({
            baseURL: API.ENDPOINT,
            headers: typeof window === 'undefined' ?
                {
                    'User-Agent': `NameMCWrapper/${version} (${homepage})`
                }
                :
                {}
        });

        for (const group of Object.values(Group)) {
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
        return this.worker.get(`/${group}/${target ? `${target}/` : ''}${prop}`, {
            params
        })
            .then(({ data }) => data);
    }
}

export * from './methods';
