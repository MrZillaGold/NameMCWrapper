import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

import { DataParser } from "./DataParser";
import { WrapperError } from "./WrapperError";

import { nameRegExp, profileRegExp, skinRegExp, capes } from "./utils";

import { IRender, IOptions, ISkin, INickname, ICape, ICapeInfo, Transformation, ITransformSkinOptions, IFriend, CapeName, IGetSkinsOptions, Tab, Section, IGetEndpointOptions, IPlayer, IGetSkinHistoryOptions, Nickname, Hash, IGetRendersOptions } from "./interfaces";

export class NameMC extends DataParser {

    readonly client: AxiosInstance;
    readonly options: IOptions;

    constructor(options: IOptions = {}) {
        super();

        this.options = {
            endpoint: "namemc.com",
            ...options
        };

        this.client = axios.create({
            baseURL: this.getEndpoint()
        });
    }

    /*
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
                                .then(({ data }: AxiosResponse) => {
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
                                new WrapperError(3, nickname)
                            );
                        }
                    })
                    .catch(reject);
            } else {
                reject(
                    new WrapperError(2)
                );
            }
        })
    }

    /*
     * Get capes by nickname
     */
    getCapes(nickname: Nickname): Promise<ICape[]> {
        return new Promise((resolve, reject) => {
            if (nickname.match(nameRegExp)) {
                this.client.get(`/profile/${nickname}`)
                    .then(({ request, data }: AxiosResponse) => {
                        if ((request?.res?.responseUrl || request.responseURL).match(profileRegExp)) {
                            resolve(this.parseCapes(data));
                        } else {
                            reject(
                                new WrapperError(3, nickname)
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

    /*
     * Get nickname history
     */
    getNicknameHistory(nickname: Nickname): Promise<INickname[]> {
        return new Promise((resolve, reject) => {
            if (nickname.match(nameRegExp)) {
                this.client.get(`/profile/${nickname}`)
                    .then(({ request, data }: AxiosResponse) => {
                        if ((request?.res?.responseUrl || request.responseURL).match(profileRegExp)) {
                            resolve(this.parseNicknameHistory(data));
                        } else {
                            reject(
                                new WrapperError(3, nickname)
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


    /*
     * Get player info by nickname
     */
    getPlayerInfo(nickname: Nickname): Promise<IPlayer> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.skinHistory({ nickname }),
                this.getCapes(nickname),
                this.getFriends(nickname),
                this.getNicknameHistory(nickname)
            ])
                .then(([skins, capes, friends, names]) =>
                    resolve({
                        skins,
                        capes,
                        friends,
                        names
                    })
                )
                .catch(reject)
        });
    }

    /*
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
                front_and_back: `${endpoint}/skin/3d/body.png?skin=${skin}&model=${model}&width=${width}&height=${height}&front_and_back&theta=${theta}&phi=${phi}&time=${time}`
            },
            face: `${endpoint}/skin/2d/face.png?skin=${skin}&overlay=${overlay}&scale=${scale}`
        };
    }

    /*
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
                reject(new WrapperError(6, transformation));
            }

            this.client.post(`/transform-skin`, `skin=${skin}&transformation=${transformation}`, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "origin": "https://ru.namemc.com"
                }
            })
                .then(({ request }: AxiosResponse) => {
                    const [, hash] = (request?.res?.responseUrl || request.responseURL).match(skinRegExp);

                    if (hash) {
                        resolve(this.extendResponse({ hash, model, type: "skin" }));
                    } else {
                        reject(
                            new WrapperError(4)
                        );
                    }
                })
                .catch((error: AxiosError) => {
                    if (error?.response?.status === 404) {
                        reject(
                            new WrapperError(5, skin)
                        );
                    }

                    reject(error);
                })
        });
    }

    /*
     * Get cape info by cape hash
     */
    getCapeInfo(hash: Hash): ICapeInfo {
        const cape: CapeName | undefined = capes.get(hash);

        return {
            type: cape ? "minecraft" : "optifine",
            name: cape ?? "Optifine"
        };
    }

    /*
     * Get player friends by nickname
     */
    getFriends(nickname: Nickname): Promise<IFriend[]> {
        return new Promise(async (resolve, reject) => {
            const nicknameMatch = nickname.match(nameRegExp);

            if (nicknameMatch) {
                const uuid: string = nicknameMatch.groups?.uuid ?? await this.client.get(`${this.getEndpoint({ domain: "api.ashcon.app" })}/mojang/v2/user/${nickname}`)
                    .then(({ data: { uuid } }: AxiosResponse) => uuid)
                    .catch((error: AxiosError) => {
                        if (error?.response?.status === 404) {
                            reject(
                                new WrapperError(3, nickname)
                            );
                        }

                        reject(error);
                    });

                this.client.get(`${this.getEndpoint({ subdomain: "api" })}/profile/${uuid}/friends`)
                    .then(({ data }: AxiosResponse) => resolve(data))
                    .catch(reject);
            } else {
                reject(
                    new WrapperError(2)
                );
            }
        });
    }

    /*
     * Get skins from a specific tab of the site
     */
    getSkins({ tab = "trending", page = 1, section = "weekly" }: IGetSkinsOptions = {}): Promise<ISkin[]> {
        const tabs: Tab[] = ["trending", "new", "random"];
        const sections: Section[] = ["daily", "weekly", "monthly", "top"];

        return new Promise(((resolve, reject) => {
            if (!tabs.includes(tab)) {
                reject(new WrapperError(6, tab));
            }
            if (!sections.includes(section)) {
                reject(new WrapperError(6, section));
            }

            this.client.get(`/minecraft-skins/${tab}${tab === "trending" ? `/${section}` : ""}?page=${page}`)
                .then(({ data }: AxiosResponse) => {
                    const skins = this.parseSkins(data);

                    if (skins.length) {
                        resolve(skins);
                    } else {
                        reject(new WrapperError(4));
                    }
                })
                .catch(reject)
        }));
    }

    getEndpoint({ subdomain = "", domain = "" }: IGetEndpointOptions = {}): string {
        const { proxy, endpoint }: IOptions = this.options;

        return `${proxy ? `${proxy}/` : ""}https://${subdomain ? `${subdomain}.` : ""}${domain || endpoint}`;
    }
}
