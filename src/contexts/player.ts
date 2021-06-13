import * as cheerio from "cheerio";
import * as moment from "moment";

import { Context, SkinContext, CapeContext, ServerContext } from "./";

import { kSerializeData, serverRegExp, parseDuration, pickProperties, convertDateToISO } from "../utils";

import { IPlayerContext, IPlayerContextOptions } from "../interfaces";

export class PlayerContext extends Context implements IPlayerContext {

    /**
     * Player uuid
     */
    readonly uuid: IPlayerContext["uuid"] = "";
    /**
     * Player username
     */
    readonly username: IPlayerContext["username"] = "";
    /**
     * NameMC profile short url
     */
    readonly url: IPlayerContext["url"] = "";
    /**
     * Profile views
     */
    readonly views: IPlayerContext["views"] = 0;
    /**
     * Nickname history
     */
    readonly names: IPlayerContext["names"] = [];
    /**
     * Skin history
     */
    readonly skins: IPlayerContext["skins"] = [];
    /**
     * Player capes
     */
    readonly capes: IPlayerContext["capes"] = [];
    /**
     * Player friends
     */
    readonly friends: IPlayerContext["friends"] = [];
    /**
     * Player favorite servers
     */
    readonly servers: IPlayerContext["servers"] = [];
    /**
     * Badlion Client statistics
     *
     * @see {@link https://www.badlion.net/forum/thread/309559 | Announce from Badlion Client}
     */
    readonly badlion: IPlayerContext["badlion"] = null;

    /**
     * Payload loaded
     * @hidden
     */
    private extended = false;

    /**
     * @hidden
     */
    constructor({ data, ...options }: IPlayerContextOptions) {
        super(options);

        this.setupPayload();

        if (!data) {
            return;
        }

        const $ = cheerio.load(data as string);

        this.skins = $("canvas.skin-2d.skin-button") // @ts-ignore
            .map((index, { attribs: { "data-skin-hash": hash, "data-model": model, title } }) => new SkinContext({
                ...this,
                payload: {
                    hash,
                    model, //@ts-ignore
                    createdAt: moment(convertDateToISO(title)).unix()
                }
            }))
            .get();

        this.capes = $("canvas.cape-2d")
            .map((index, { attribs: { "data-cape-hash": hash } }) => new CapeContext({
                ...this,
                hash
            }))
            .get();

        this.servers = $("a > img.server-icon")
            .map((index, element) => {
                // @ts-ignore
                const ip = element.parent?.attribs?.href
                    .replace(serverRegExp, "$1");
                // @ts-ignore
                const title = element.next?.data || "";
                const { attribs: { src: icon } } = element;

                return new ServerContext({
                    ...this,
                    extended: false,
                    payload: {
                        ip,
                        title,
                        icon
                    }
                });
            })
            .get();

        const rawBadlionStatistic: any[] = $("div.card.badlion > div.card-body > div.row.no-gutters")
            .get();

        if (rawBadlionStatistic.length === 4) {
            rawBadlionStatistic.splice(1, 0, {
                current: 0,
                max: 0
            });
        }

        const badlion: any[] = rawBadlionStatistic.map((element, index) => {
            const $ = cheerio.load(element);

            switch (index) {
                case 0: {
                    return moment.duration(
                        parseDuration(
                            $("div.col-12")
                                .text()
                        )
                    )
                        .asSeconds();
                }
                case 1: {
                    if (element?.current) {
                        return element;
                    }

                    const [current, max] = $("div.col-12").text()
                        .match(/([\d]+)/g) || [0, 0];

                    return {
                        current: Number(current),
                        max: Number(max)
                    };
                }
                case 3: {
                    const time = $("div.col-12 > time").get(0);
                    const lastOnline = time?.attribs?.datetime || null;

                    return lastOnline ?
                        new Date(lastOnline)
                            .getTime()
                        :
                        null;
                }
                case 2:
                case 4: {
                    return $("div.col-12").text();
                }
            }
        });

        const [baseInfoRaw, nicknameHistoryRaw] = $("div.card.mb-3 > div.card-body")
            .map((index, element) => {
                const $ = cheerio.load(element);

                return $("div.card-body")
                    .children("div.row.no-gutters");
            })
            .get();

        const baseInfo = baseInfoRaw.map((index, element) => {
            const $ = cheerio.load(element);

            switch (index) {
                case 0:
                case 1:
                    return $("div.col-12 > samp")
                        .text();
                case 2: {
                    const link = $("div.col-12 > a")
                        .text();

                    return `https://${link}`;
                }
                case 3: {
                    const views = $("div.col-auto")
                        .text()
                        .replace(/\s\/ [^]+/, "");

                    return Number(views);
                }
            }
        })
            .get() as [string, string, string, number];

        const nicknameHistory = nicknameHistoryRaw.map((index, element) => {
            const $ = cheerio.load(element);

            const name = $("div.col > a").get(0);
            const time = $("div.col-12 > time").get(0);

            if (name) {
                // @ts-ignore
                const { children: [{ data: nickname }] } = name;
                const changed_at = time?.attribs?.datetime || null;

                return {
                    nickname,
                    changed_at,
                    timestamp: changed_at ?
                        new Date(changed_at)
                            .getTime()
                        :
                        null
                };
            }
        })
            .get()
            .reverse();

        const [uuid, , url, views] = baseInfo;

        this.uuid = uuid;
        this.username = nicknameHistory[nicknameHistory.length - 1].nickname;
        this.url = url;
        this.views = views;
        this.names = nicknameHistory;

        if (badlion.length) {
            const [play_time, login_streak, last_server, last_online, version] = badlion;

            this.badlion = {
                play_time,
                login_streak,
                last_server,
                last_online,
                version
            };
        }
    }

    /**
     * Check payload loaded
     */
    get isExtended(): boolean {
        return this.extended;
    }

    /**
     * Does the player use Badlion Client
     */
    get usesBadlion(): boolean {
        return Boolean(this.badlion);
    }

    /**
     * Load all profile information
     */
    async loadPayload(): Promise<void> {
        if (this.isExtended) {
            return;
        }

        this.payload = await this.api.profile.friends({
            target: this.uuid
        })
            .then((friends) => ({
                friends
            }));
        this.extended = true;

        this.setupPayload();
    }

    /**
     * @hidden
     */
    [kSerializeData](): IPlayerContext {
        return pickProperties(this, [
            "uuid",
            "username",
            "url",
            "views",
            "names",
            "skins",
            "capes",
            "friends",
            "servers",
            "badlion"
        ]);
    }
}
