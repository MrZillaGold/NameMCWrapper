import axios from "axios";
import qs from "qs";

import minecraftCapes from "./minecraftCapes.mjs"
import ErrorHandler from "./error.mjs";

import {
    nameRegExp, profileRegExp, skinRegExp
} from "./utils.mjs";

const WrapperError = new ErrorHandler();

export default class NameMC {

    options = {
        endpoint: "namemc.com"
    };

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
     * @returns {Promise} Promise array with skins objects
     */
    skinHistory(nickname) {
        return new Promise(async (resolve, reject) => {
            if (nickname.match(nameRegExp)) {
                const skinHistory = [];

                await axios.get(`${this.getEndpoint()}/profile/${nickname}`)
                    .then(response => {
                        if (response.request.res.responseUrl.match(profileRegExp)) {

                            const skins = response.data.match(/<\s*canvas class="skin-2d align-top (?:skin-button|skin-button skin-button-selected) title-time" width="32" height="32" title="([^]+?)" data-skin-hash="([^]+?)" data-model="([^]+?)"[^>]*>(?:.*?)<\s*\/\s*canvas>/g);

                            if (skins) {
                                skins.forEach(skin => {
                                    const regExp = /title="([^]+?)" data-skin-hash="([^]+?)" data-model="([^]+?)"/;

                                    const exec = regExp.exec(skin).slice(1, 4);

                                    skinHistory.push({
                                        date: exec[0],
                                        url: `${this.getEndpoint()}/texture/${exec[1]}.png`,
                                        hash: exec[1],
                                        isSlim: exec[2] !== "classic",
                                        renders: this.getRenders({
                                            skin: exec[1],
                                            model: exec[2],
                                            overlay: true
                                        })
                                    });
                                })
                            } else {
                                reject(WrapperError.get(4));
                            }

                        } else {
                            reject(WrapperError.get(3, nickname));
                        }
                    })
                    .catch(error => reject(WrapperError.get(1, error)));

                return resolve(skinHistory);
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
        return new Promise(async (resolve, reject) => {
            if (nickname.match(nameRegExp)) {
                const capesData = [];

                await axios.get(`${this.getEndpoint()}/profile/${nickname}`)
                    .then(response => {
                        if (response.request.res.responseUrl.match(profileRegExp)) {

                            const capes = response.data.match(/<\s*canvas class="cape-2d align-top (?:skin-button|skin-button skin-button-selected)" width="(?:[^]+?)" height="(?:[^]+?)" data-cape-hash="([^]+?)"[^>]*>(?:.*?)<\s*\/\s*canvas>/g);

                            if (capes) {
                                capes.forEach(cape => {
                                    const regExp = /data-cape-hash="([^]+?)"/;

                                    const exec = regExp.exec(cape);

                                    capesData.push({
                                        hash: exec[1],
                                        url: `${this.getEndpoint()}/texture/${exec[1]}.png`,
                                        ...this.getCapeType(exec[1])
                                    });
                                })
                            }

                        } else {
                            reject(WrapperError.get(3, nickname));
                        }
                    })
                    .catch(error => reject(WrapperError.get(1, error)));

                return resolve(capesData);
            } else {
                reject(WrapperError.get(2))
            }
        })
    }

    /**
     * @description Get skin renders
     * @param {Object} options - Object with parameters for generating renders
     * @param {string} options.skin=12b92a9206470fe2 - Skin hash
     * @param {"classic"|"slim"} [options.model=classic] - Skin type for model
     * @param {(number|string)} [options.width=600] - Width for 3d render image
     * @param {(number|string)} [options.height=300] - Height for 3d render image
     * @param {(number|string)} [options.theta=-30] - Angle to rotate the 3d model in a circle. (-360 - 360)
     * @param {(number|string)} [options.scale=4] - Scale for 2d face render, 32 max (8px * scale)
     * @param {boolean} [options.overlay=true] - Use skin overlay on 2d face render
     * @returns {Object} Object with renders skin
     */
    getRenders({ skin, model, width, height, scale, overlay, theta }) {
        const endpoint = this.getEndpoint("render");

        skin = skin || "12b92a9206470fe2";
        model = model || "classic";
        overlay = overlay || overlay !== false ? "&overlay" : "";

        width = width || 600;
        height = height || 300;

        theta = theta || theta === 0 ? `&theta=${theta}` : "";

        scale = scale || 4;

        return {
            body: {
                front: `${endpoint}/skin/3d/body.png?skin=${skin}&model=${model}&width=${width}&height=${height}${theta}`,
                front_and_back: `${endpoint}/skin/3d/body.png?skin=${skin}&model=${model}&width=${width}&height=${height}&front_and_back${theta}`
            },
            face: `${endpoint}/skin/2d/face.png?skin=${skin}${overlay}&scale=${scale}`
        };
    }

    /**
     * @description Transform skin method
     * @param {Object} options - Object with parameters for skin transformation
     * @param {string} options.skin - Skin hash
     * @param {"grayscale"|"invert"|"rotate-hue-180"|"rotate-head-left"|"rotate-head-right"} options.transformation - Transformation type
     * @returns {Promise} Promise url string on transformed skin
     */
    transformSkin({ skin, transformation }) {
        const endpoint = this.getEndpoint();

        return new Promise((resolve, reject) => {
            const data = {
                skin,
                transformation
            };

            if (!(skin && transformation)) reject(WrapperError.get(7));

            const transformations = ["grayscale", "invert", "rotate-hue-180", "rotate-head-left", "rotate-head-right"];

            if (!transformations.includes(transformation)) reject(WrapperError.get(6, transformation));

            axios.post(`${endpoint}/transform-skin`, qs.stringify(data), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "origin": "https://ru.namemc.com"
                }
            })
                .then(response => {
                    const hash = response.request.res.responseUrl.match(skinRegExp);

                    if (hash) {
                        resolve(`${endpoint}/texture/${hash[1]}.png`);
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
     * @class
     * @ignore
     */
    getEndpoint(subdomain, domain) {
        const {
            proxy, endpoint
        } = this.options;

        return `${proxy ? `${proxy}/` : ""}https://${subdomain ? `${subdomain}.` : ""}${domain || endpoint}`;
    }

}