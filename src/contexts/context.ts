import { inspectable } from 'inspectable';
import { AxiosInstance } from 'axios';

import { Options } from '../Options';
import { API } from '../API';

import { SkinContext } from './skin';
import { RendersContext } from './renders';
import { ServerContext } from './server';
import { SearchContext } from './search';
import { PlayerContext } from './player';
import { CapeContext } from './cape';

import { applyPayload, kSerializeData } from '../utils';

export interface IContextOptions<P = any | void> {
    options: Options;
    client: AxiosInstance;
    api: API;
    payload?: {
        [K in keyof P]?: P[keyof P];
    };
}

export type ContextUnion =
    SkinContext
    | CapeContext
    | RendersContext
    | PlayerContext
    | ServerContext
    | SearchContext;

/**
 * @hidden
 */
export class Context<T extends ContextUnion> {

    /**
     * Parameters passed to the constructor during NameMC class initialization
     *
     * @hidden
     */
    readonly options: IContextOptions['options'];
    /**
     * Class for API Requests
     *
     * @hidden
     */
    readonly api: IContextOptions['api'];
    /**
     * Axios Client for requests
     *
     * @hidden
     */
    readonly client: IContextOptions['client'];

    /**
     * @hidden
     */
    payload: Record<string, any> = {};

    /**
     * @hidden
     */
    constructor({ options, client, api, payload }: IContextOptions) {
        this.options = options;
        this.client = client;
        this.api = api;

        if (payload) {
            this.payload = payload;
        }
    }

    /**
     * @hidden
     */
    protected setupPayload(): void {
        if (this.payload) {
            applyPayload(this, this.payload);
        }
    }

    /**
     * Get context JSON
     */
    toJSON(): T {
        return this[kSerializeData]();
    }

    /**
     * @hidden
     */
    [kSerializeData](): any {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { options, client, ...payload } = this;

        return payload;
    }
}

inspectable(Context, {
    serialize: (instance) => instance.toJSON(),
    stringify: (instance, payload, context): string => (
        `${context.stylize(instance.constructor.name, 'special')} ${context.inspect(payload)}`
    )
});
