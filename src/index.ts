import axios, { AxiosInstance, AxiosResponse } from 'axios';

import { API, IFriend } from './api';
import { ICloudProxyResponse, IOptions, Options } from './options';
import { DataParser } from './parser';
import { WrapperError } from './error';

import {
    RendersContext,
    ServerContext,
    SkinContext,
    CapeContext,
    PlayerContext,
    SearchContext,
    Username,
    IRendersContextOptions,
    IContextOptions,
    Transformation,
    Model,
    ITransformSkinOptions,
    CapeHash,
    ICheckServerLikeOptions
} from './contexts';

import { getUUID, profileRegExp, serverRegExp } from './utils';

const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

export interface IGetSkinHistoryOptions {
    /**
     * Player username
     */
    username: Username;
    /**
     * Page
     */
    page?: number;
}

export interface IGetSkinsOptions<T extends Tab | TabUnion, S extends Section | SectionUnion, P extends number | undefined = number> {
    /**
     * Tab
     */
    tab?: T;
    /**
     * Section
     */
    section?: S;
    /**
     * Page
     */
    page?: P;
}

export enum Tab {
    TRENDING = 'trending',
    NEW = 'new',
    RANDOM = 'random',
    TAG = 'tag'
}
export type TabUnion = `${Tab}`;

export enum Section {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    TOP = 'top'
}
export type SectionUnion = `${Section}` | string | undefined;

export class NameMC extends DataParser {

    /**
     * @hidden
     */
    readonly client: AxiosInstance;
    /**
     * Parameters passed to the constructor during class initialization
     */
    readonly options: Options;
    /**
     * Class for API Requests
     */
    readonly api: API;

    constructor(options: IOptions = {}) {
        super();

        this.options = new Options(options);
        this.api = new API();
        this.client = axios.create({
            baseURL: this.options.getEndpoint(),
            headers: typeof window === 'undefined' ?
                {
                    'User-Agent': DESKTOP_USER_AGENT
                }
                :
                {}
        });

        this.#addInterceptors();
    }

    /**
     * Get skin history by nickname
     */
    async skinHistory({ username, page = 1 }: IGetSkinHistoryOptions): Promise<SkinContext[]> {
        const { uuid } = await this.getPlayer(username);

        return this.client.get<string>(`/minecraft-skins/profile/${uuid}`, {
            params: {
                page
            }
        })
            .then(({ data }) => {
                const skins = this.parseSkins(data);

                if (skins[0]?.id) {
                    return skins;
                }

                throw new WrapperError('NO_USEFUL');
            });
    }

    /**
     * Get player info by nickname
     */
    async getPlayer(username: Username): Promise<PlayerContext> {
        const context = new PlayerContext({
            payload: {
                username
            },
            ...this
        });

        await context.loadPayload();

        return context;
    }

    /**
     * Get skin renders
     */
    getRenders(options: Omit<IRendersContextOptions, keyof IContextOptions>): RendersContext {
        return new RendersContext({
            ...this,
            ...options
        });
    }

    /**
     * Transform skin method
     */
    transformSkin({ skin, transformation = Transformation.GRAYSCALE, model = Model.CLASSIC }: ITransformSkinOptions): Promise<SkinContext> {
        return new SkinContext({
            ...this,
            payload: {
                id: skin,
                model
            }
        })
            .transform(transformation);
    }

    /**
     * Get cape info by cape hash
     */
    getCapeInfo(hash: CapeHash): CapeContext {
        return new CapeContext({
            hash,
            ...this
        });
    }

    /**
     * Get player friends by nickname
     */
    async getFriends(username: Username): Promise<IFriend[]> {
        const endpoint = this.options.getEndpoint({
            domain: 'api.ashcon.app'
        });
        const uuid = await getUUID(endpoint, username);

        return this.api.profile.friends({
            target: uuid
        });
    }

    /**
     * Get new skins
     *
     * @see {@link https://namemc.com/minecraft-skins/new | NameMC New Skins}
     */
    getSkins(options: IGetSkinsOptions<'new', undefined>): Promise<SkinContext[]>;
    /**
     * Get skins tags
     *
     * @see {@link https://namemc.com/minecraft-skins/tag | NameMC Tagged Skins}
     */
    getSkins(options: IGetSkinsOptions<'tag', undefined>): Promise<SkinContext[]>;
    /**
     * Get skins by tag
     *
     * @see {@link https://namemc.com/minecraft-skins/tag/girl | NameMC Girl Tag Skins}
     */
    getSkins(options: IGetSkinsOptions<'tag', string>): Promise<SkinContext[]>;
    /**
     * Get daily trending skins
     *
     * @see {@link https://namemc.com/minecraft-skins/trending/daily | NameMC Daily Trending Skins}
     */
    getSkins(options: IGetSkinsOptions<'trending', 'daily'>): Promise<SkinContext[]>;
    /**
     * Get weekly trending skins
     *
     * @see {@link https://namemc.com/minecraft-skins/trending/weekly | NameMC Weekly Trending Skins}
     */
    getSkins(options: IGetSkinsOptions<'trending', 'weekly'>): Promise<SkinContext[]>;
    /**
     * Get monthly trending skins
     *
     * @see {@link https://namemc.com/minecraft-skins/trending/monthly | NameMC Monthly Trending Skins}
     */
    getSkins(options: IGetSkinsOptions<'trending', 'monthly'>): Promise<SkinContext[]>;
    /**
     * Get top trending skins
     *
     * @see {@link https://namemc.com/minecraft-skins/trending/top | NameMC Top Trending Skins}
     */
    getSkins(options: IGetSkinsOptions<'trending', 'top'>): Promise<SkinContext[]>;
    /**
     * Get random skins
     *
     * @see {@link https://namemc.com/minecraft-skins/random | NameMC Random Skins}
     */
    getSkins(options: IGetSkinsOptions<'random', undefined>): Promise<SkinContext[]>;
    /**
     * Get skins from a specific tab of the site
     */
    getSkins({ tab, section = Section.WEEKLY, page = 1 }: IGetSkinsOptions<Tab | TabUnion, Section | SectionUnion>): Promise<SkinContext[]> {
        return this.client.get<string>(`/minecraft-skins/${tab}${tab === 'trending' || (tab === 'tag' && section !== 'weekly') ? `/${section}` : ''}`, {
            params: {
                page
            }
        })
            .then(({ data }) => {
                const skins = this.parseSkins(data);

                if (!skins.length) {
                    throw new WrapperError('NO_USEFUL');
                }

                return skins;
            });
    }

    /**
     * Get information about skin
     */
    async getSkin(id: SkinContext['id']): Promise<SkinContext> {
        const skin = new SkinContext({
            ...this,
            payload: {
                id
            }
        });

        await skin.loadPayload();

        return skin;
    }

    /**
     * Get servers list
     */
    getServers(page = 1): Promise<ServerContext[]> {
        return this.client.get<string>(`/minecraft-servers/${page}`)
            .then(({ data }) => {
                const servers = this.parseServers(data);

                if (!servers[0]?.ip) {
                    throw new WrapperError('NO_USEFUL');
                }

                return servers;
            });
    }

    /**
     * Get server by ip
     */
    async getServer(ip: string): Promise<ServerContext> {
        const server = new ServerContext({
            ...this,
            payload: {
                ip
            }
        });

        await server.loadPayload();

        return server;
    }

    /**
     * Get server likes by ip
     */
    getServerLikes(ip: string): Promise<string[]> {
        return this.api.server.likes({
            target: ip
        });
    }

    /**
     * Check server like value by username
     */
    checkServerLike({ ip, username }: ICheckServerLikeOptions): Promise<boolean> {
        return new ServerContext({
            ...this,
            payload: {
                ip
            }
        })
            .checkLike(username);
    }

    /**
     * Search
     */
    search(query: string): Promise<SearchContext | PlayerContext | ServerContext> {
        return this.client.get<string>('/search', {
            params: {
                q: query
            }
        })
            .then(({ request, headers, data }) => {
                const finalUrl = headers['x-final-url'] || request?.res?.responseUrl || request.responseURL;

                if (profileRegExp.test(finalUrl)) {
                    return new PlayerContext({
                        ...this,
                        data
                    });
                }

                if (serverRegExp.test(finalUrl)) {
                    return new ServerContext({
                        ...this,
                        data,
                        extended: true
                    });
                }

                return new SearchContext({
                    ...this,
                    data,
                    payload: {
                        query
                    }
                });
            });
    }

    /**
     * @hidden
     */
    #addInterceptors(): void {
        const { proxy, cloudProxy } = this.options;

        if (proxy && cloudProxy) {
            this.client.interceptors.request.use((config) => {
                const { url, baseURL, method, data, params } = config;

                delete config.baseURL;
                delete config.params;

                const searchParams = params ?
                    new URLSearchParams(
                        Object.entries(params)
                    )
                        .toString()
                    :
                    null;

                config.url = proxy;
                config.method = 'post';
                config.data = {
                    ...cloudProxy,
                    url: `${baseURL}${url}${searchParams ? `?${searchParams}` : ''}`,
                    cmd: `request.${method}`,
                    headers: config.headers,
                    postData: method === 'post' ?
                        data
                        :
                        undefined
                };

                return config;
            });
        }

        this.client.interceptors.response.use((response) => {
            if (proxy && cloudProxy) {
                const { data: { solution: { url, response: htmlPage } } } = response as AxiosResponse<ICloudProxyResponse>;

                response.request.res.responseUrl = url;
                response.data = htmlPage;
            }

            return response;
        }, (error) => {
            switch (error?.response?.status) {
                case 403:
                    throw new WrapperError('CLOUDFLARE');
                case 404:
                    throw new WrapperError('NOT_FOUND');
                default:
                    throw error;
            }
        });
    }
}

export * from './api';
export * from './contexts';
export * from './options';
export * from './utils';
