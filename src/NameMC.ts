import * as axios from "axios";

import { API } from "./API";
import { Options } from "./Options";
import { DataParser } from "./DataParser";
import { WrapperError } from "./WrapperError";

import { RendersContext, ServerContext, SkinContext, CapeContext, PlayerContext } from "./contexts";

import { nameRegExp, profileRegExp, getUUID } from "./utils";

import { IOptions, ITransformSkinOptions, ICheckServerLikeOptions, IFriend, IGetSkinsOptions, IGetSkinHistoryOptions, IRendersContextOptions, IContextOptions, Tab, Section, Username, CapeHash, CapeName, CapeType, Model, Transformation, Sort } from "./interfaces";
import AxiosInstance = axios.AxiosInstance;

const DESKTOP_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36";

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

        const { proxy, cloudProxy } = options;

        this.options = new Options(options);
        this.api = new API();
        // @ts-ignore
        this.client = axios.create({
            baseURL: this.options.getEndpoint(),
            headers: typeof window === "undefined" ?
                {
                    "User-Agent": DESKTOP_USER_AGENT
                }
                :
                {}
        });

        if (proxy && cloudProxy) {
            this.addCloudProxyInterceptor();
        }
    }

    /**
     * Get skin history by nickname
     */
    skinHistory({ username, page = 1 }: IGetSkinHistoryOptions): Promise<SkinContext[]> {
        return new Promise((resolve, reject) => {
            if (username.match(nameRegExp)) {
                this.client.get(`/profile/${username}`)
                    .then(({ request, headers, data }) => {
                        if ((headers["x-final-url"] || request?.res?.responseUrl || request.responseURL).match(profileRegExp)) {
                            const userId: string = this.getProfileId(data);

                            if (!userId) {
                                return resolve([]);
                            }

                            this.client.get(`/minecraft-skins/profile/${userId}?page=${page}`)
                                .then(({ data }) => {
                                    const skins = this.parseSkins(data);

                                    if (skins[0]?.hash) {
                                        return resolve(skins);
                                    }

                                    reject(
                                        new WrapperError("NO_USEFUL")
                                    );
                                })
                                .catch(reject);
                        } else {
                            reject(
                                new WrapperError("NOT_FOUND", username)
                            );
                        }
                    })
                    .catch(reject);
            } else {
                reject(
                    new WrapperError("INVALID_NICKNAME", username)
                );
            }
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
    transformSkin({ skin, transformation = "grayscale", model = Model.CLASSIC }: ITransformSkinOptions): Promise<SkinContext> {
        return new SkinContext({
            ...this,
            payload: {
                hash: skin,
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
        const endpoint = this.options.getEndpoint({ domain: "api.ashcon.app" });
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
    getSkins(options: IGetSkinsOptions<"new", undefined, number>): Promise<SkinContext[]>;
    /**
     * Get skins tags
     *
     * @see {@link https://namemc.com/minecraft-skins/tag | NameMC Tagged Skins}
     */
    getSkins(options: IGetSkinsOptions<"tag", undefined, number>): Promise<SkinContext[]>;
    /**
     * Get skins by tag
     *
     * @see {@link https://namemc.com/minecraft-skins/tag/girl | NameMC Girl Tag Skins}
     */
    getSkins(options: IGetSkinsOptions<"tag", string, number>): Promise<SkinContext[]>;
    /**
     * Get daily trending skins
     *
     * @see {@link https://namemc.com/minecraft-skins/trending/daily | NameMC Daily Trending Skins}
     */
    getSkins(options: IGetSkinsOptions<"trending", "daily", number>): Promise<SkinContext[]>;
    /**
     * Get weekly trending skins
     *
     * @see {@link https://namemc.com/minecraft-skins/trending/weekly | NameMC Weekly Trending Skins}
     */
    getSkins(options: IGetSkinsOptions<"trending", "weekly", number>): Promise<SkinContext[]>;
    /**
     * Get monthly trending skins
     *
     * @see {@link https://namemc.com/minecraft-skins/trending/monthly | NameMC Monthly Trending Skins}
     */
    getSkins(options: IGetSkinsOptions<"trending", "monthly", number>): Promise<SkinContext[]>;
    /**
     * Get top trending skins
     *
     * @see {@link https://namemc.com/minecraft-skins/trending/top | NameMC Top Trending Skins}
     */
    getSkins(options: IGetSkinsOptions<"trending", "top", number>): Promise<SkinContext[]>;
    /**
     * Get random skins
     *
     * @see {@link https://namemc.com/minecraft-skins/random | NameMC Random Skins}
     */
    getSkins(options: IGetSkinsOptions<"random">): Promise<SkinContext[]>;
    /**
     * Get skins from a specific tab of the site
     */
    getSkins({ tab, page = 1, section = "weekly" }: IGetSkinsOptions<Tab, Section, number | undefined>): Promise<SkinContext[]> {
        return new Promise(((resolve, reject) => {
            this.client.get(`/minecraft-skins/${tab}${tab === "trending" || (tab === "tag" && section !== "weekly") ? `/${section}` : ""}`, {
                params: {
                    page
                }
            })
                .then(({ data }) => {
                    const skins = this.parseSkins(data);

                    if (!skins.length) {
                        reject(
                            new WrapperError("NO_USEFUL")
                        );
                    }

                    resolve(skins);
                })
                .catch((error) => {
                    reject(
                        error?.response?.status === 404 ?
                            new WrapperError("NOT_FOUND", section)
                            :
                            error
                    );
                });
        }));
    }

    /**
     * Get information about skin
     */
    async getSkin(hash: SkinContext["hash"]): Promise<SkinContext> {
        const skin = new SkinContext({
            ...this,
            payload: {
                hash
            }
        });

        await skin.loadPayload();

        return skin;
    }

    /**
     * Get servers list
     */
    getServers(page = 1): Promise<ServerContext[]> {
        return new Promise((resolve, reject) => {
            this.client.get(`/minecraft-servers/${page}`)
                .then(({ data }) => {
                    const servers = this.parseServers(data);

                    if (!servers[0]?.ip) {
                        return reject(
                            new WrapperError("NO_USEFUL")
                        );
                    }

                    resolve(servers);
                })
                .catch(reject);
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
     * @hidden
     */
    private addCloudProxyInterceptor(): void {
        const { proxy, cloudProxy } = this.options;

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
            config.method = "post";
            config.data = {
                ...cloudProxy,
                url: `${baseURL}${url}${searchParams ? `?${searchParams}` : ""}`,
                cmd: `request.${method}`,
                headers: config.headers,
                postData: method === "post" ?
                    data
                    :
                    undefined
            };

            return config;
        });

        this.client.interceptors.response.use((response) => {
            const { data: { solution: { url, response: htmlPage } } } = response;

            response.request.res.responseUrl = url;
            response.data = htmlPage;

            return response;
        });
    }
}

export * from "./interfaces";

export {
    API,

    RendersContext,
    ServerContext,
    SkinContext,
    CapeContext,
    PlayerContext,

    Transformation,
    CapeHash,
    CapeName,
    CapeType,
    Model,
    Sort
};
