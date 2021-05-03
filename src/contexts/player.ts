import * as cheerio from "cheerio";
import * as moment from "moment";

import { Context, SkinContext, CapeContext, ServerContext } from "./";

import { kSerializeData, serverRegExp, parseDuration, pickProperties } from "../utils";

import { IPlayerContext, IPlayerContextOptions } from "../interfaces";
import TagElement = cheerio.TagElement;

export class PlayerContext extends Context implements IPlayerContext {

    readonly uuid: IPlayerContext["uuid"] = "";
    readonly username: IPlayerContext["username"] = "";
    readonly url: IPlayerContext["url"] = "";
    readonly views: IPlayerContext["views"] = 0;
    readonly names: IPlayerContext["names"] = [];
    readonly skins: IPlayerContext["skins"] = [];
    readonly capes: IPlayerContext["capes"] = [];
    readonly friends: IPlayerContext["friends"] = [];
    readonly servers: IPlayerContext["servers"] = [];
    readonly badlion: IPlayerContext["badlion"] = null;

    private extended = false;

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
                    createdAt: moment(title).unix()
                }
            }))
            .get();

        this.capes = $("canvas.cape-2d") // @ts-ignore
            .map((index, { attribs: { "data-cape-hash": hash } }) => new CapeContext({
                ...this,
                hash
            }))
            .get();

        this.servers = $("a > img.server-icon")
            .map((index, element) => {
                const ip = ((element as unknown as TagElement).parent as TagElement).attribs.href
                    .replace(serverRegExp, "$1");
                const title = element.next?.data || "";
                const { attribs: { src: icon } } = element as TagElement;

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

        const rawBadlionStatistic: (TagElement | any)[] = $("div.card.badlion > div.card-body > div.row.no-gutters")
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

        let [baseInfo, nicknameHistory] = $("div.card.mb-3 > div.card-body")
            .map((index, element) => {
                const $ = cheerio.load(element);

                return $("div.card-body")
                    .children("div.row.no-gutters");
            })
            .get();

        baseInfo = baseInfo.map((index: number, element: TagElement) => {
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
            .get();

        nicknameHistory = nicknameHistory.map((index: number, element: TagElement) => {
            const $ = cheerio.load(element);

            const name = $("div.col > a").get(0);
            const time = $("div.col-12 > time").get(0);

            if (name) {
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

    get isExtended(): boolean {
        return this.extended;
    }

    get usesBadlion(): boolean {
        return Boolean(this.badlion);
    }

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
