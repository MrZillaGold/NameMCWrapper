import * as axios from "axios";

import { API } from "./API";
import { DataParser } from "./DataParser";
import { WrapperError } from "./WrapperError";

import { nameRegExp, profileRegExp, skinRegExp, capes, getUUID } from "./utils";

import { IRender, IOptions, ISkin, IExtendedSkin, ICape, ICapeInfo, Transformation, ITransformSkinOptions, ICheckServerLikeOptions, IFriend, IGetSkinsOptions, IServerPreview, IGetEndpointOptions, IPlayer, IGetSkinHistoryOptions, IGetRendersOptions, IServer, Tab, Section, Nickname, CapeHash, BasePlayerInfo, INamedSkin } from "./interfaces";
import AxiosInstance = axios.AxiosInstance;
import AxiosResponse = axios.AxiosResponse;

export class NameMC extends DataParser {

    readonly client: AxiosInstance;
    readonly options: IOptions;
    readonly api: API;

    constructor(options: IOptions = {}) {
        super(options);

        const urlOptions: ("proxy" | "endpoint")[] = [
            "proxy",
            "endpoint"
        ];

        urlOptions.forEach((option) => {
            const optionValue = options[option];

            if (optionValue?.endsWith("/")) {
                options[option] = optionValue.slice(0, optionValue.length - 1);
            }
        });

        this.options = {
            endpoint: "namemc.com",
            proxy: "",
            ...options
        };

        // @ts-ignore
        this.client = axios.create({
            baseURL: this.getEndpoint()
        });

        this.api = new API();
    }

    /**
     * Get skin history by nickname
     */
    skinHistory({ nickname, page = 1 }: IGetSkinHistoryOptions): Promise<ISkin[]> {
        return new Promise((resolve, reject) => {
            if (nickname.match(nameRegExp)) {
                this.client.get(`/profile/${nickname}`)
                    .then(({ request, data }: AxiosResponse) => {
                        if ((request?.res?.responseUrl || request.responseURL).match(profileRegExp)) {
                            const userId: string = this.getProfileId(data);

                            if (!userId) {
                                return resolve([]);
                            }

                            this.client.get(`/minecraft-skins/profile/${userId}?page=${page}`)
                                .then(({ data }) => {
                                    const skins: ISkin[] = this.parseSkins(data);

                                    if (skins.length) {
                                        resolve(skins);
                                    } else {
                                        reject(
                                            new WrapperError(4)
                                        );
                                    }
                                })
                                .catch(reject);
                        } else {
                            reject(
                                new WrapperError(3, [nickname])
                            );
                        }
                    })
                    .catch(reject);
            } else {
                reject(
                    new WrapperError(2)
                );
            }
        });
    }

    /**
     * Get capes by nickname
     */
    getCapes(nickname: Nickname): Promise<ICape[]> {
        return new Promise((resolve, reject) => {
            if (nickname.match(nameRegExp)) {
                this.client.get(`/profile/${nickname}`)
                    .then(({ request, data }) => {
                        if ((request?.res?.responseUrl || request.responseURL).match(profileRegExp)) {
                            resolve(this.parseCapes(data));
                        } else {
                            reject(
                                new WrapperError(3, [nickname])
                            );
                        }
                    })
                    .catch(reject);
            } else {
                reject(
                    new WrapperError(2)
                );
            }
        });
    }

    /**
     * Get player info by nickname
     */
    getPlayerInfo(nickname: Nickname): Promise<BasePlayerInfo> {
        return new Promise((resolve, reject) => {
            if (nickname.match(nameRegExp)) {
                this.client.get(`/profile/${nickname}`)
                    .then(({ request, data }) => {
                        if ((request?.res?.responseUrl || request.responseURL).match(profileRegExp)) {
                            resolve(this.parsePlayer(data));
                        } else {
                            reject(
                                new WrapperError(3, [nickname])
                            );
                        }
                    })
                    .catch(reject);
            } else {
                reject(
                    new WrapperError(2)
                );
            }
        });
    }

    /**
     * Get full player info by nickname
     */
    getPlayer(nickname: Nickname): Promise<IPlayer> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.skinHistory({ nickname }),
                this.getCapes(nickname),
                this.getFriends(nickname),
                this.getPlayerInfo(nickname)
            ])
                .then(([skins, capes, friends, info]) => resolve({
                    skins,
                    capes,
                    friends,
                    ...info
                }))
                .catch(reject);
        });
    }

    /**
     * Get skin renders
     */
    getRenders({
        skin = "12b92a9206470fe2", model = "classic", width = 600,
        height = 300, scale = 4, overlay = true, theta = 30,
        phi = 20, time = 90
    }: IGetRendersOptions): IRender {
        const endpoint: string = this.getEndpoint({ subdomain: "render" });

        return {
            body: {
                front: `${endpoint}/skin/3d/body.png?skin=${skin}&model=${model}&width=${width}&height=${height}&theta=${theta}&phi=${phi}&time=${time}`,
                front_and_back: `${endpoint}/skin/3d/body.png?skin=${skin}&model=${model}&width=${width}&height=${height}&theta=${theta}&phi=${phi}&time=${time}&front_and_back=true`
            },
            face: `${endpoint}/skin/2d/face.png?skin=${skin}&overlay=${overlay}&scale=${scale}`
        };
    }

    /**
     * Transform skin method
     */
    transformSkin({ skin, transformation = "grayscale", model = "classic" }: ITransformSkinOptions): Promise<ISkin> {
        const transformations: Transformation[] = [
            "grayscale", "invert", "rotate-hue-180", "rotate-head-left",
            "rotate-head-right", "hat-pumpkin-mask-1", "hat-pumpkin-mask-2", "hat-pumpkin-mask-3",
            "hat-pumpkin-mask-4", "hat-pumpkin", "hat-pumpkin-creeper", "hat-santa"
        ];

        return new Promise((resolve, reject) => {
            if (!(skin && transformation)) {
                reject(new WrapperError(7));
            }

            if (!transformations.includes(transformation)) {
                reject(new WrapperError(6, [transformation]));
            }

            this.client.post("/transform-skin", `skin=${skin}&transformation=${transformation}`, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    origin: "https://ru.namemc.com"
                }
            })
                .then(({ request }) => {
                    const [, hash] = (request?.res?.responseUrl || request.responseURL).match(skinRegExp);

                    if (hash) {
                        resolve(this.extendResponse({ hash, model, type: "skin" }));
                    }

                    reject(
                        new WrapperError(4)
                    );
                })
                .catch((error) => {
                    reject(
                        error?.response?.status === 404 ?
                            new WrapperError(3, [skin])
                            :
                            error
                    );
                });
        });
    }

    /**
     * Get cape info by cape hash
     */
    getCapeInfo(hash: CapeHash): ICapeInfo {
        const cape = capes.get(hash);

        return {
            type: cape ? "minecraft" : "optifine",
            name: cape ?? "Optifine"
        };
    }

    /**
     * Get player friends by nickname
     */
    getFriends(nickname: Nickname): Promise<IFriend[]> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            const uuid = await getUUID(this.client, this.getEndpoint({ domain: "api.ashcon.app" }), nickname)
                .catch(reject);

            if (uuid) {
                this.api.profile.friends({
                    target: uuid
                })
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    /**
     * Get skins from a specific tab of the site
     */
    getSkins(options: IGetSkinsOptions<"new", undefined, number>): Promise<INamedSkin[]>;
    getSkins(options: IGetSkinsOptions<"tag", undefined, number>): Promise<ISkin[]>;
    getSkins(options: IGetSkinsOptions<"tag", string, number>): Promise<ISkin[]>;
    getSkins(options: IGetSkinsOptions<"trending", "top", number>): Promise<ISkin[]>;
    getSkins(options: IGetSkinsOptions<"random", undefined, undefined>): Promise<ISkin[]>;
    getSkins({ tab, page, section = "weekly" }: IGetSkinsOptions<Tab, Section, number | undefined>): Promise<ISkin[] | INamedSkin[]> {
        const tabs: Tab[] = ["trending", "new", "random", "tag"];
        const sections: Section[] = ["daily", "weekly", "monthly", "top"];

        return new Promise(((resolve, reject) => {
            if (tab && !tabs.includes(tab)) {
                reject(new WrapperError(6, [tab]));
            }
            if (tab !== "tag" && !sections.includes(section)) {
                reject(new WrapperError(6, [section]));
            }

            this.client.get(`/minecraft-skins/${tab}${tab === "trending" || (tab === "tag" && section !== "weekly") ? `/${section}` : ""}?page=${page}`)
                .then(({ data }) => {
                    const skins = this.parseSkins(data);

                    if (skins.length) {
                        resolve(skins);
                    }

                    reject(new WrapperError(4));
                })
                .catch((error) => {
                    reject(
                        error?.response?.status === 404 ?
                            new WrapperError(3, [section])
                            :
                            error
                    );
                });
        }));
    }

    /**
     * Get information about skin
     */
    getSkin(hash: ISkin["hash"]): Promise<IExtendedSkin> {
        return new Promise((resolve, reject) => {
            this.client.get(`/skin/${hash}`)
                .then(({ data }) => {
                    const skin = this.parseSkin(data);

                    if (skin) {
                        resolve(skin);
                    } else {
                        reject(
                            new WrapperError(4)
                        );
                    }
                })
                .catch((error) => {
                    reject(
                        error?.response?.status === 404 ?
                            new WrapperError(3, [hash])
                            :
                            error
                    );
                });
        });
    }

    /**
     * Get servers list
     */
    getServers(page = 1): Promise<IServerPreview[]> {
        return new Promise((resolve, reject) => {
            this.client.get(`/minecraft-servers/${page}`)
                .then(({ data }) => {
                    const servers = this.parseServers(data);

                    if (servers.length) {
                        resolve(servers);
                    }

                    reject(new WrapperError(4));
                })
                .catch(reject);
        });
    }

    /**
     * Get server by ip
     */
    getServer(ip: string): Promise<IServer> {
        return new Promise((resolve, reject) => {
            this.client.get(`/server/${ip}`)
                .then(({ data }) => resolve(this.parseServer(data, ip)))
                .catch((error) => {
                    reject(
                        error?.response?.status === 404 ?
                            new WrapperError(3, [ip])
                            :
                            error
                    );
                });
        });
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
    async checkServerLike({ ip, nickname }: ICheckServerLikeOptions): Promise<boolean> {
        const uuid = await getUUID(this.client, this.getEndpoint({ domain: "api.ashcon.app" }), nickname);

        return this.api.server.likes({
            target: ip,
            profile: uuid
        });
    }

    protected getEndpoint({ subdomain = "", domain = "" }: IGetEndpointOptions = {}): string {
        const { proxy, endpoint, rendersIgnoreProxy }: IOptions = this.options;

        return `${rendersIgnoreProxy && subdomain === "render" ? "" : proxy ? `${proxy}/` : ""}https://${subdomain ? `${subdomain}.` : ""}${domain || endpoint}`;
    }
}

export { API } from "./API";
