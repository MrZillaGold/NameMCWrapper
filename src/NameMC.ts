import * as axios from "axios";

import { API } from "./API";
import { Options } from "./Options";
import { DataParser } from "./DataParser";
import { WrapperError } from "./WrapperError";

import { RendersContext, ServerContext, SkinContext, CapeContext, PlayerContext } from "./contexts";

import { nameRegExp, profileRegExp, getUUID } from "./utils";

import { IOptions, ITransformSkinOptions, ICheckServerLikeOptions, IFriend, IGetSkinsOptions, IGetSkinHistoryOptions, IRendersContextOptions, IContextOptions, Tab, Section, Nickname, CapeHash, CapeName, CapeType, Model } from "./interfaces";
import AxiosInstance = axios.AxiosInstance;
import AxiosResponse = axios.AxiosResponse;

const DESKTOP_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36";

export class NameMC extends DataParser {

    readonly client: AxiosInstance;
    readonly options: Options;
    readonly api: API;

    constructor(options: IOptions = {}) {
        super();

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
    }

    /**
     * Get skin history by nickname
     */
    skinHistory({ nickname, page = 1 }: IGetSkinHistoryOptions): Promise<SkinContext[]> {
        return new Promise((resolve, reject) => {
            if (nickname.match(nameRegExp)) {
                this.client.get(`/profile/${nickname}`)
                    .then(({ request, headers, data }: AxiosResponse) => {
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
                                new WrapperError("NOT_FOUND", [nickname])
                            );
                        }
                    })
                    .catch(reject);
            } else {
                reject(
                    new WrapperError("INVALID_NICKNAME", nickname)
                );
            }
        });
    }

    /**
     * Get player info by nickname
     */
    getPlayer(nickname: Nickname): Promise<PlayerContext> {
        return new Promise((resolve, reject) => {
            if (!nickname.match(nameRegExp)) {
                reject(
                    new WrapperError("INVALID_NICKNAME", nickname)
                );
            }

            this.client.get(`/profile/${nickname}`)
                .then(({ request, headers, data }) => {
                    if ((headers["x-final-url"] || request?.res?.responseUrl || request.responseURL).match(profileRegExp)) {
                        resolve(
                            new PlayerContext({
                                data,
                                ...this
                            })
                        );
                    } else {
                        reject(
                            new WrapperError("NOT_FOUND", nickname)
                        );
                    }
                })
                .catch(reject);
        });
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
    async getFriends(nickname: Nickname): Promise<IFriend[]> {
        const uuid = await getUUID(this.client, this.options.getEndpoint({ domain: "api.ashcon.app" }), nickname);

        return this.api.profile.friends({
            target: uuid
        });
    }

    /**
     * Get skins from a specific tab of the site
     */
    getSkins(options: IGetSkinsOptions<"new", undefined, number>): Promise<SkinContext[]>;
    getSkins(options: IGetSkinsOptions<"tag", undefined, number>): Promise<SkinContext[]>;
    getSkins(options: IGetSkinsOptions<"tag", string, number>): Promise<SkinContext[]>;
    getSkins(options: IGetSkinsOptions<"trending", "top", number>): Promise<SkinContext[]>;
    getSkins(options: IGetSkinsOptions<"random", undefined, undefined>): Promise<SkinContext[]>;
    getSkins({ tab, page = 1, section = "weekly" }: IGetSkinsOptions<Tab, Section, number | undefined>): Promise<SkinContext[]> {
        return new Promise(((resolve, reject) => {
            this.client.get(`/minecraft-skins/${tab}${tab === "trending" || (tab === "tag" && section !== "weekly") ? `/${section}` : ""}?page=${page}`)
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
                            new WrapperError("NOT_FOUND", [section])
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
     * Check server like value by nickname
     */
    checkServerLike({ ip, nickname }: ICheckServerLikeOptions): Promise<boolean> {
        return new ServerContext({
            ...this,
            payload: {
                ip
            }
        })
            .checkLike(nickname);
    }
}

export {
    API,

    RendersContext,
    ServerContext,
    SkinContext,
    CapeContext,
    PlayerContext,

    CapeHash,
    CapeName,
    CapeType,
    Model
};
