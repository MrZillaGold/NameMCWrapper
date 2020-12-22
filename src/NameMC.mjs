import axios from "axios";

import { DataParser } from "./DataParser.mjs";
import { WrapperError } from "./WrapperError.mjs";

import { nameRegExp, profileRegExp, skinRegExp, capes } from "./utils.mjs";

export class NameMC extends DataParser {

    /**
     * @param {Object} [options] - Object with parameters for the class
     * @param {string} [options.proxy] - Proxy for requests
     * @param {string} [options.endpoint=namemc.com] - NameMC Endpoint
     */
    constructor(options) {
        super();

        this.options = {
            endpoint: "namemc.com",
            ...options
        };

        this.client = axios.create({
            baseURL: this.getEndpoint()
        });
    }

    /**
     * Player skin
     * @typedef {object} Skin
     * @property {string} url - Skin URL
     * @property {SkinRenders} renders - Skin renders
     * @property {boolean} isSlim - Slim skin flag
     * @property {string} hash - Skin hash
     * @property {SkinModel} model - Skin model
     * @property {number} rating - Skin rating
     */

    /**
     * Skin model
     * @typedef {"classic"|"slim"} SkinModel
     */

    /**
     * @description Get skin history by nickname
     * @param {string} nickname - Player nickname
     * @param {(number|string)} [page=1] - Page number
     * @returns {Promise<Skin[]>} Promise array with skins objects
     */
    skinHistory(nickname, page = 1) {
        return new Promise((resolve, reject) => {
            if (nickname.match(nameRegExp)) {
                this.client.get(`/profile/${nickname}`)
                    .then(({ request, data }) => {
                        if ((request?.res?.responseUrl || request.responseURL).match(profileRegExp)) {

                            const userId = this.getProfileId(data);

                            if (!userId) {
                                return resolve([]);
                            }

                            this.client.get(`/minecraft-skins/profile/${userId}?page=${page}`)
                                .then(({ data })  => {
                                    const skins = this.parseSkins(data);

                                    if (skins.length) {
                                        resolve(
                                            skins
                                        );
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

    /**
     * @description Get capes by nickname
     * @param {string} nickname - Player nickname
     * @returns {Promise<Cape[]>} Promise array with capes objects
     */
    getCapes(nickname) {
        return new Promise((resolve, reject) => {
            if (nickname.match(nameRegExp)) {
                this.client.get(`/profile/${nickname}`)
                    .then(({ request, data }) => {
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

    /**
     * Nickname history
     * @typedef {object} NicknameHistory
     * @property {string} nickname - Nickname
     * @property {string} changed_at - Nickname change date
     * @property {number} timestamp - Nickname change timestamp
     */

    /**
     * @description Get nickname history
     * @param {string} nickname - Player nickname
     * @returns {Promise<NicknameHistory[]>} Array with nickname history
     */
    getNicknameHistory(nickname) {
        return new Promise((resolve, reject) => {
            if (nickname.match(nameRegExp)) {
                this.client.get(`/profile/${nickname}`)
                    .then(({ request, data }) => {
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

    /**
     * Player info
     * @typedef {object} Player
     * @property {Skin[]} skins - Player skin history
     * @property {Cape[]} capes - Player capes
     * @property {Friend[]} friends - Player friends
     * @property {NicknameHistory[]} names - Player nickname history
     */

    /**
     * @description Get player info by nickname
     * @param {string} nickname - Player nickname
     * @returns {Promise<Player>} Promise object with player info
     */
    getPlayerInfo(nickname) {
        return new Promise((resolve, reject) =>
            Promise.all([
                this.skinHistory(nickname),
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
        );
    }

    /**
     * Skin renders
     * @typedef {object} SkinRenders
     * @property {object} body - Body renders
     * @property {string} body.front - Front body render
     * @property {string} body.front_and_back - Front and back body render
     * @property {string} face - Face render
     */

    /**
     * @description Get skin renders
     * @param {object} options - Object with parameters for generating renders
     * @param {string} options.skin="12b92a9206470fe2" - Skin hash
     * @param {SkinModel} [options.model="classic"] - Skin type for model
     * @param {(number|string)} [options.width=600] - Width for 3d render image
     * @param {(number|string)} [options.height=300] - Height for 3d render image
     * @param {(number|string)} [options.theta=-30] - Horizontal rotation angle of the 3D model. (-360 - 360)
     * @param {(number|string)} [options.phi=20] - Vertical rotation angle of the 3D model. (-360 - 360)
     * @param {(number|string)} [options.time=90] - Animation time of the 3D model. (0 - 360)
     * @param {(number|string)} [options.scale=4] - Scale for 2d face render, 32 max (8px * scale)
     * @param {boolean} [options.overlay=true] - Use skin overlay on 2d face render
     * @returns {SkinRenders}
     */
    getRenders({
                   skin = "12b92a9206470fe2", model = "classic", width = 600,
                   height = 300, scale = 4, overlay = true, theta = -30,
                   phi = 20, time = 90
    }) {
        const endpoint = this.getEndpoint("render");

        return {
            body: {
                front: `${endpoint}/skin/3d/body.png?skin=${skin}&model=${model}&width=${width}&height=${height}&theta=${theta}&phi=${phi}&time=${time}`,
                front_and_back: `${endpoint}/skin/3d/body.png?skin=${skin}&model=${model}&width=${width}&height=${height}&front_and_back&theta=${theta}&phi=${phi}&time=${time}`
            },
            face: `${endpoint}/skin/2d/face.png?skin=${skin}&overlay=${overlay}&scale=${scale}`
        };
    }

    /**
     * @description Transform skin method
     * @param {object} options - Object with parameters for skin transformation
     * @param {string} options.skin - Skin hash
     * @param {"grayscale"|"invert"|"rotate-hue-180"|"rotate-head-left"|"rotate-head-right"|"hat-pumpkin-mask-1"|"hat-pumpkin-mask-2"|"hat-pumpkin-mask-3"|"hat-pumpkin-mask-4"|"hat-pumpkin"|"hat-pumpkin-creeper"|"hat-santa"} options.transformation - Transformation type
     * @param {SkinModel} [options.model="classic"] - Skin type for renders
     * @returns {Promise<string>} Url string on transformed skin
     */
    transformSkin({ skin, transformation, model = "classic" }) {
        const transformations = [
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
                .then(({ request }) => {
                    const [, hash] = (request?.res?.responseUrl || request.responseURL).match(skinRegExp);

                    if (hash) {
                        resolve(
                            this.extendResponse({ hash, model }, "skin")
                        );
                    } else {
                        reject(
                            new WrapperError(4)
                        );
                    }
                })
                .catch((error) => {
                    if (error?.response?.status === 404) {
                        reject(
                            new WrapperError(5, skin)
                        );
                    }

                    reject(error);
                })
        });
    }

    /**
     * @typedef {object} Cape
     * @property {string} type - Cape type
     * @property {string} name - Cape name
     */

    /**
     * @description Get cape type by cape hash
     * @param {string} hash - Cape hash
     * @returns {Cape} Object with cape information
     */
    getCapeType(hash) {
        const cape = capes.get(hash);

        return {
            type: cape ? "minecraft" : "optifine",
            name: cape ?? "Optifine"
        };
    }

    /**
     * Player friend
     * @typedef {object} Friend
     * @property {string} uuid - Friend uuid
     * @property {string} name - Friend name
     */

    /**
     * @description Get player friends by nickname
     * @param {string} nickname - Player nickname
     * @returns {Promise<Friend[]>} Promise array with friends objects
     */
    getFriends(nickname) {
        return new Promise(async (resolve, reject) => {
            const nicknameMatch = nickname.match(nameRegExp);

            if (nicknameMatch) {

                const uuid = nicknameMatch.groups.uuid ?? await this.client.get(`${this.getEndpoint(null, "api.ashcon.app")}/mojang/v2/user/${nickname}`)
                    .then(({ data: { uuid } }) => uuid)
                    .catch((error) => {
                        if (error?.response?.status === 404) {
                            reject(
                                new WrapperError(3, nickname)
                            );
                        }

                        reject(error);
                    });

                this.client.get(`${this.getEndpoint("api")}/profile/${uuid}/friends`)
                    .then(({ data }) => resolve(data))
                    .catch(reject);

            } else {
                reject(
                    new WrapperError(2)
                );
            }
        });
    }

    /**
     * @description Get skins from a specific tab of the site
     * @param {"trending"|"new"|"random"} [tab="trending"] - Tab with which to get skins
     * @param {(number|string)} [page=1] - Tab page (1 - 100)
     * @param {"daily"|"weekly"|"monthly"|"top"} [section="weekly"] - Section, used when getting trending skins
     * @returns {Promise<Skin[]>} Promise array with skins objects
     */
    getSkins(tab = "trending", page = 1, section = "weekly") {
        const tabs = ["trending", "new", "random"];
        const sections = ["daily", "weekly", "monthly", "top"];

        return new Promise(((resolve, reject) => {
            if (!tabs.includes(tab)) {
                reject(new WrapperError(6, tab));
            }
            if (!sections.includes(section)) {
                reject(new WrapperError(6, section));
            }

            this.client.get(`/minecraft-skins/${tab}${tab === "trending" ? `/${section}` : ""}?page=${page}`)
                .then(({ data }) => {
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

    /**
     * @private
     */
    getEndpoint(subdomain, domain) {
        const { proxy, endpoint } = this.options;

        return `${proxy ? `${proxy}/` : ""}https://${subdomain ? `${subdomain}.` : ""}${domain || endpoint}`;
    }
}
