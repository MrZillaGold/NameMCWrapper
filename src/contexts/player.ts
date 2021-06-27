import * as cheerio from "cheerio";
import { Node } from "cheerio";

import { WrapperError } from "../WrapperError";
import { Context, SkinContext, CapeContext, ServerContext } from "./";

import { kSerializeData, serverRegExp, parseDuration, pickProperties, convertDate, nameRegExp, profileRegExp } from "../utils";

import { FollowersSection, IGetFollowersOptions, ILoadFollowersOptions, IPlayerContext, IPlayerContextOptions, Model } from "../interfaces";

const { FOLLOWING, FOLLOWERS } = FollowersSection;

export class PlayerContext extends Context<IPlayerContext> implements IPlayerContext {

    /**
     * Profile ID
     */
    readonly id: IPlayerContext["id"] = 0;
    /**
     * Player uuid
     */
    readonly uuid: IPlayerContext["uuid"] = "";
    /**
     * Player username
     */
    readonly username: IPlayerContext["username"] = "";
    /**
     * Profile short url
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
     * Player followers
     */
    readonly followers: IPlayerContext["followers"] = [];
    /**
     * Player following
     */
    readonly following: IPlayerContext["following"] = [];
    /**
     * Following date, available when receiving player followers/following
     */
    readonly followingDate: IPlayerContext["followingDate"] = 0;
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
    constructor({ data, isSearch, ...options }: IPlayerContextOptions) {
        super(options);

        this.setupPayload();

        if (!data) {
            return;
        }

        const $ = cheerio.load(data);

        this.skins = $(`canvas.skin-2d${!isSearch ? ".skin-button" : ""}`) // @ts-ignore
            .map((index, { attribs: { "data-skin-hash": hash, "data-model": model = Model.UNKNOWN, title } }) => new SkinContext({
                ...this,
                payload: {
                    hash,
                    model,
                    createdAt: !isSearch ?
                        convertDate(title)
                        :
                        0
                }
            }))
            .get();

        if (!isSearch) {
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
                        return parseDuration(
                            $("div.col-12")
                                .text()
                        );
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

            const [baseInfoRaw, usernameHistoryRaw] = $("div.card.mb-3 > div.card-body")
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
                        const views = parseInt(
                            $("div.col-auto")
                                .text()
                        );

                        return Number(views);
                    }
                }
            })
                .get() as [string, string, string, number];

            const usernameHistory = this.parseUsernameHistory(usernameHistoryRaw);

            const [uuid, , url, views] = baseInfo;

            this.id = Number(url.split(".").pop());
            this.uuid = uuid;
            this.url = url;
            this.views = views;
            this.names = usernameHistory;

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
        } else {
            const [, , id] = $("div.card-header > a")
                .get(0)
                .attribs
                .href
                .match(profileRegExp) as RegExpMatchArray;

            this.id = Number(id);
            this.uuid = $("samp")
                .text();
            this.names = this.parseUsernameHistory(
                $("div.card-body div.row.no-gutters")
            );
        }

        this.username = this.names[this.names.length - 1].username;
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
     * Get clean UUID
     */
    get cleanUUID(): string {
        return this.uuid.replace(/-/g, "");
    }

    /**
     * Load all profile information
     */
    async loadPayload(): Promise<void> {
        if (this.isExtended) {
            return;
        }

        if (!(this.username && this.uuid && this.url && this.id)) {
            const username = this.uuid || this.username;

            if (!username.match(nameRegExp)) {
                throw new WrapperError("INVALID_NICKNAME", username);
            }

            await this.client.get<string>(`/profile/${username}`)
                .then(({ request, headers, data }) => {
                    if ((headers["x-final-url"] || request?.res?.responseUrl || request.responseURL).match(profileRegExp)) {
                        this.payload = new PlayerContext({
                            data,
                            ...this
                        })
                            .toJSON();

                        return this.setupPayload();
                    }

                    throw new WrapperError("NOT_FOUND", username);
                });
        }

        this.payload = await this.api.profile.friends({
            target: this.uuid
        })
            .then((friends) => ({
                friends
            }));

        this.setupPayload();

        this.extended = true;
    }

    /**
     * Get player followers
     */
    getFollowers(options: IGetFollowersOptions): Promise<IPlayerContext["followers"]> {
        return this.loadFollowers({
            ...options,
            section: FOLLOWERS
        });
    }

    /**
     * Get player following
     */
    getFollowing(options: IGetFollowersOptions): Promise<IPlayerContext["followers"]> {
        return this.loadFollowers({
            ...options,
            section: FOLLOWING
        });
    }

    /**
     * @hidden
     */
    private async loadFollowers({ section, page = 1, sort = {} }: ILoadFollowersOptions): Promise<IPlayerContext["followers"]> {
        if (!this.extended) {
            await this.loadPayload();
        }

        const filter = Object.entries(sort)
            .map((filter) => filter.join(":"))
            .join(",");

        const loadedFollowers = await this.client.get<string>(`/profile/${this.uuid}/${section}`, {
            params: {
                page,
                sort: filter
            }
        })
            .then(({ data }) => (
                this.parseFollowers(data)
            ));

        const followers = loadedFollowers.reduce<IPlayerContext["followers"]>((acc, follower) => {
            if (!acc.filter(({ username }) => username === follower.username).length) {
                acc.push(follower);
            }

            return acc;
        }, this[section]);

        this.payload = {
            [section]: followers
        };

        this.setupPayload();

        return loadedFollowers;
    }

    /**
     * @hidden
     */
    private parseFollowers(data: string): IPlayerContext["followers"] {
        const $ = cheerio.load(data);

        const uuid = $("tbody > input[name='profile']")
            .map((index, { attribs: { value: uuid } }) => (
                uuid
            ))
            .get();

        const names = $("tbody > tr")
            .map((index, element) => {
                const $ = cheerio.load(element.children);

                const children = $("td");

                const name = cheerio.load(children.get(2));
                const username = name.text();

                // @ts-ignore
                const { attribs: { datetime } } = children.get(3)
                    .firstChild as Node;

                return {
                    username,
                    date: new Date(datetime)
                        .getTime()
                };
            })
            .get();

        return names.map(({ username, date: followingDate }, index) => (
            new PlayerContext({
                ...this,
                payload: {
                    username,
                    followingDate,
                    uuid: uuid[index]
                }
            })
        ));
    }

    /**
     * @hidden
     */
    private parseUsernameHistory(element: cheerio.Cheerio<cheerio.Element>): IPlayerContext["names"] {
        return element.map((index, element) => {
            const $ = cheerio.load(element);

            const name = $("div.col > a").get(0);
            const time = $("div.col-12 > time").get(0);

            if (name) {
                // @ts-ignore
                const { children: [{ data: username }] } = name;
                const changed_at = time?.attribs?.datetime || null;

                return {
                    username,
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
    }

    /**
     * @hidden
     */
    [kSerializeData](): IPlayerContext {
        return pickProperties(this, [
            "id",
            "uuid",
            "username",
            "url",
            "views",
            "names",
            "skins",
            "capes",
            "friends",
            "followers",
            "following",
            "followingDate",
            "badlion",
            "servers"
        ]);
    }
}
