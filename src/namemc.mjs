import axios from "axios";
import qs from "qs";

import minecraftCapes from "./minecraftCapes.mjs"
import ErrorHandler from "./error.mjs";

import { nameRegExp, profileRegExp, skinRegExp } from "./utils.mjs";

const WrapperError = new ErrorHandler();

export default class NameMC {

    constructor() {
        this.options = {
            endpoint: "namemc.com"
        };
    }

    /**
     * @description Sets options
     * @param {Object} options - Object with parameters for the class
     * @param {string} [options.proxy] - Proxy for requests
     * @param {string} [options.endpoint=namemc.com] - NameMC Endpoint
     */
    setOptions(options) {
        this.options = {
            ...this.options,
            ...options
        };
    }

    /**
     * @description Get skin history by nickname
     * @param {string} nickname - Player nickname
     * @param {(number|string)} [page=1] - Page number
     * @returns {Promise} Promise array with skins objects
     */
    skinHistory(nickname, page = 1) {
        return new Promise((resolve, reject) => {
            if (nickname.match(nameRegExp)) {
                axios.get(`${this.getEndpoint()}/profile/${nickname}`)
                    .then(({ request, data }) => {
                        if (((request.res && request.res.responseUrl) || request.responseURL).match(profileRegExp)) {

                            const [, userId] = /<\s*a href="\/minecraft-skins\/profile\/([^]+?)"[^>]*>(?:.*?)<\s*\/\s*a>/.exec(data);

                            axios.get(`${this.getEndpoint()}/minecraft-skins/profile/${userId}?page=${page}`)
                                .then(({ data })  => {
                                        const skins = this.parseSkins(data);

                                        if (skins) {
                                            resolve(
                                                skins
                                            );
                                        } else {
                                            reject(WrapperError.get(4));
                                        }
                                })
                                .catch(error => reject(WrapperError.get(1, error)));
                        } else {
                            reject(WrapperError.get(3, nickname));
                        }
                    })
                    .catch(error => {
                        console.log(error)

                        reject(WrapperError.get(1, error))
                    });
            } else {
                reject(WrapperError.get(2))
            }
        })
    }

    /**
     * @description Get capes by nickname
     * @param {string} nickname - Player nickname
     * @returns {Promise} Promise array with capes objects
     */
    getCapes(nickname) {
        return new Promise((resolve, reject) => {
            if (nickname.match(nameRegExp)) {
                axios.get(`${this.getEndpoint()}/profile/${nickname}`)
                    .then(({ request, data }) => {
                        if (((request.res && request.res.responseUrl) || request.responseURL).match(profileRegExp)) {

                            const capes = data.match(/<\s*canvas class="cape-2d align-top (?:skin-button|skin-button skin-button-selected)" width="(?:[^]+?)" height="(?:[^]+?)" data-cape-hash="([^]+?)"[^>]*>(?:.*?)<\s*\/\s*canvas>/g);

                            if (capes) {
                                resolve(
                                    capes.map(cape => {
                                        const regExp = /data-cape-hash="([^]+?)"/;

                                        const [, hash] = regExp.exec(cape);

                                        return {
                                            hash,
                                            url: `${this.getEndpoint()}/texture/${hash}.png`,
                                            ...this.getCapeType(hash)
                                        };
                                    })
                                );
                            }

                        } else {
                            reject(WrapperError.get(3, nickname));
                        }
                    })
                    .catch(error => reject(WrapperError.get(1, error)));
            } else {
                reject(WrapperError.get(2))
            }
        })
    }

    /**
     * @description Get skin renders
     * @param {Object} options - Object with parameters for generating renders
     * @param {string} options.skin="12b92a9206470fe2" - Skin hash
     * @param {"classic"|"slim"} [options.model="classic"] - Skin type for model
     * @param {(number|string)} [options.width=600] - Width for 3d render image
     * @param {(number|string)} [options.height=300] - Height for 3d render image
     * @param {(number|string)} [options.theta=-30] - Angle to rotate the 3d model in a circle. (-360 - 360)
     * @param {(number|string)} [options.scale=4] - Scale for 2d face render, 32 max (8px * scale)
     * @param {boolean} [options.overlay=true] - Use skin overlay on 2d face render
     * @returns {Object} Object with renders skin
     */
    getRenders({ skin = "12b92a9206470fe2", model = "classic", width = 600, height = 300, scale = 4, overlay = true, theta = -30 }) {
        const endpoint = this.getEndpoint("render");

        return {
            body: {
                front: `${endpoint}/skin/3d/body.png?skin=${skin}&model=${model}&width=${width}&height=${height}&theta=${theta}`,
                front_and_back: `${endpoint}/skin/3d/body.png?skin=${skin}&model=${model}&width=${width}&height=${height}&front_and_back&theta=${theta}`
            },
            face: `${endpoint}/skin/2d/face.png?skin=${skin}&overlay=${overlay}&scale=${scale}`
        };
    }

    /**
     * @description Transform skin method
     * @param {Object} options - Object with parameters for skin transformation
     * @param {string} options.skin - Skin hash
     * @param {"grayscale"|"invert"|"rotate-hue-180"|"rotate-head-left"|"rotate-head-right"|"hat-pumpkin-mask-1"|"hat-pumpkin-mask-2"|"hat-pumpkin-mask-3"|"hat-pumpkin-mask-4"|"hat-pumpkin"|"hat-pumpkin-creeper"|"hat-santa"} options.transformation - Transformation type
     * @returns {Promise} Promise url string on transformed skin
     */
    transformSkin({ skin, transformation }) {
        const endpoint = this.getEndpoint();

        const transformations = [
            "grayscale", "invert", "rotate-hue-180", "rotate-head-left",
            "rotate-head-right", "hat-pumpkin-mask-1", "hat-pumpkin-mask-2", "hat-pumpkin-mask-3",
            "hat-pumpkin-mask-4", "hat-pumpkin", "hat-pumpkin-creeper", "hat-santa"
        ];

        return new Promise((resolve, reject) => {
            const data = {
                skin,
                transformation
            };

            if (!(skin && transformation)) reject(WrapperError.get(7));

            if (!transformations.includes(transformation)) reject(WrapperError.get(6, transformation));

            axios.post(`${endpoint}/transform-skin`, qs.stringify(data), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "origin": "https://ru.namemc.com"
                }
            })
                .then(({ request }) => {
                    const [, hash] = ((request.res && request.res.responseUrl) || request.responseURL).match(skinRegExp);

                    if (hash) {
                        resolve(`${endpoint}/texture/${hash}.png`);
                    } else {
                        reject(WrapperError.get(4));
                    }
                })
                .catch(error => {
                    if (error.response && error.response.status) {
                        if (error.response.status === 404) reject(WrapperError.get(5, skin));
                    }

                    reject(WrapperError.get(1, error));
                })
        });
    }

    /**
     * @description Get cape type by cape hash
     * @param {string} hash - Cape hash
     * @returns {Object} Object with cape information
     */
    getCapeType(hash) {
        const capeIndex = minecraftCapes.findIndex(cape => cape.hash === hash);

        return capeIndex !== -1 ?
            {
                type: "minecraft",
                ...minecraftCapes[capeIndex]
            }
            :
            {
                type: "optifine",
                name: "Optifine"
            }
    }

    /**
     * @description Get player friends by nickname
     * @param {string} nickname - Player nickname
     * @returns {Promise} Promise array with friends objects
     */
    getFriends(nickname) {
        return new Promise((resolve, reject) => {
            if (nickname.match(nameRegExp)) {

                axios.get(`${this.getEndpoint(null, "api.ashcon.app")}/mojang/v2/user/${nickname}`)
                    .then(response => response.data)
                    .then(data => {

                        axios.get(`${this.getEndpoint("api")}/profile/${data.uuid}/friends`)
                            .then(response => resolve(response.data))
                            .catch(error => reject(WrapperError.get(1, error)))

                    })
                    .catch(error => {
                        if (error.response && error.response.status === 404) reject(WrapperError.get(3, nickname));

                        reject(WrapperError.get(1, error))
                    });

            } else {
                reject(WrapperError.get(2))
            }
        })
    }

    /**
     * @description Get skins from a specific tab of the site
     * @param {"trending"|"new"|"random"} [tab="trending"] - Tab with which to get skins
     * @param {(number|string)} [page=1] - Tab page (1 - 100)
     * @param {"daily"|"weekly"|"monthly"|"top"} [section="weekly"] - Section, used when getting trending skins
     * @returns {Promise} Promise array with skins objects
     */
    getSkins(tab = "trending", page = 1, section = "weekly") {
        const tabs = ["trending", "new", "random"];
        const sections = ["daily", "weekly", "monthly", "top"];

        return new Promise(((resolve, reject) => {
            if (!tabs.includes(tab)) reject(WrapperError.get(6, tab));
            if (!sections.includes(section)) reject(WrapperError.get(6, section));

            axios.get(`${this.getEndpoint()}/minecraft-skins/${tab}${section === "trending" ? `/${section}` : ""}?page=${page}`)
                .then(({ data }) =>
                    resolve(this.parseSkins(data))
                )
                .catch(error => reject(WrapperError.get(1, error)))
        }));
    }

    /**
     * @class
     * @ignore
     */
    getEndpoint(subdomain, domain) {
        const {
            proxy, endpoint
        } = this.options;

        return `${proxy ? `${proxy}/` : ""}https://${subdomain ? `${subdomain}.` : ""}${domain || endpoint}`;
    }

    /**
     * @class
     * @ignore
     */
    parseSkins(data) {
        const skins = data.match(/<\s*a href="\/skin\/([^]+?)"[^>]*>/g);

        const models = data.match(/model=(classic|slim)/g);

        const ratings = data.match(/★([\d]+)/g);

        if (skins) {
            return skins.map((skin, index) => {
                const [, hash] = /\/skin\/([\da-z]+)/.exec(skin);
                const [, model] = /model=(classic|slim)/.exec(models[index]);

                const [, rating] = /★([\d]+)/.exec(ratings[index]);

                return {
                    url: `${this.getEndpoint()}/texture/${hash}.png`,
                    hash,
                    isSlim: model !== "classic",
                    renders: this.getRenders({
                        skin: hash,
                        model
                    }),
                    rating: parseInt(rating)
                }
            });
        } else {
            return null;
        }
    }
}
