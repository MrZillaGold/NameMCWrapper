import * as cheerio from "cheerio";
import { Element } from "cheerio";

import { Context } from "./context";
import { WrapperError } from "../WrapperError";

import { escapeColorsClasses, escapeHtml, getUUID, kSerializeData, pickProperties } from "../utils";

import { ICheckServerLikeOptions, IServerContext, IServerContextOptions } from "../interfaces";

export class ServerContext extends Context<IServerContext> implements IServerContext {

    /**
     * Server ip
     */
    readonly ip: IServerContext["ip"] = "";
    /**
     * Server title
     */
    readonly title: IServerContext["title"] = "";
    /**
     * Server icon url
     */
    readonly icon: IServerContext["icon"] = "";
    /**
     * Server motd
     */
    readonly motd: IServerContext["motd"] = {
        clear: "",
        html: ""
    };
    /**
     * Server current players stats
     */
    readonly players: IServerContext["players"] = {
        online: 0,
        max: 0
    };
    /**
     * Server country
     */
    readonly country: IServerContext["country"] = null;
    /**
     * Server rating
     */
    readonly rating: IServerContext["rating"] = 0;
    /**
     * Server version
     */
    readonly version: IServerContext["version"] = null;
    /**
     * Server uptime
     */
    readonly uptime: IServerContext["uptime"] = null;

    /**
     * Payload loaded
     * @hidden
     */
    private extended = false;

    /**
     * @hidden
     */
    constructor({ data, extended, isSearch, ...options }: IServerContextOptions) {
        super(options);

        this.setupPayload();

        if (!data) {
            return;
        }

        const $ = cheerio.load(data);

        if (isSearch) {
            this.payload.players = {};

            $("td")
                .get()
                .forEach((element, index) => {
                    const $ = cheerio.load(element);

                    const image = $("img");
                    const row = $("td");
                    const title = $("a");

                    switch (index) {
                        case 0:
                            this.payload.icon = image
                                .attr()
                                .src;
                            break;
                        case 1:
                            this.payload.country = this.parseServerCountry(
                                image.get(0)
                            );
                            break;
                        case 2:
                            this.payload.title = title.text();
                            this.payload.ip = this.parseIP(title.get(0));
                            break;
                        case 3:
                            this.payload.motd = {
                                clear: row.attr().title,
                                html: ""
                            };
                            break;
                        case 4:
                            this.payload.players.online = Number(row.text());
                            break;
                        case 6:
                            this.payload.players.max = Number(row.text());
                            break;
                        case 7:
                            this.payload.rating = Number(row.text().slice(1));
                            break;
                    }
                });

            this.setupPayload();

            return;
        }

        const serverCard = extended ?
            this.parseServerCard(
                $("div.card.mb-3")
                    .filter((index, element) => element?.attribs?.style?.includes("#0F0F0F"))
                    .get(0),
                !extended
            )
            :
            this.parseServerCard(data as cheerio.Element, !extended);

        if (extended) {
            this.extended = extended;

            const [, infoCard] = $("div.row > div.col-12.col-lg-5")
                .children()
                .filter("div.card.mb-3")
                .get()
                .map((element) => {
                    const $ = cheerio.load(element);

                    return $("div.card.mb-3 > div.card-body")
                        .children();
                });

            const { version = null, uptime = null, country = null } = Object.assign.apply(
                {},
                [{}, ...infoCard.map((index, element) => {
                    const $ = cheerio.load(element);

                    const rowValue = $("div.row > div.text-right");

                    if (rowValue.children().length) {
                        return {
                            country: this.parseServerCountry(
                                rowValue.children("img")
                                    .get(0)
                            )
                        };
                    }

                    const content = rowValue.contents()
                        .get(0) // @ts-ignore
                        .data;

                    const isUptime = content.endsWith("%");

                    return {
                        [isUptime ? "uptime" : "version"]: content ?
                            isUptime ?
                                parseFloat(content)
                                :
                                content
                            :
                            null
                    };
                })
                    .get()
                ]
            );

            this.payload = {
                version,
                country,
                uptime
            };

            this.setupPayload();

            return;
        }

        this.payload = serverCard;

        this.setupPayload();
    }

    /**
     * Check payload loaded
     */
    get isExtended(): boolean {
        return this.extended;
    }

    /**
     * Check like status for player
     */
    async checkLike(username: ICheckServerLikeOptions["username"]): Promise<boolean> {
        const endpoint = this.options.getEndpoint({ domain: "api.ashcon.app" });
        const uuid = await getUUID(endpoint, username);

        return this.api.server.likes({
            target: this.ip,
            profile: uuid
        });
    }

    /**
     * Load all server information
     */
    async loadPayload(): Promise<void> {
        if (this.isExtended) {
            return;
        }

        this.payload = await this.client.get(`/server/${this.ip}`)
            .then(({ data }) => new ServerContext({
                ...this,
                data,
                extended: true,
                payload: {
                    ip: this.ip
                }
            }));

        this.setupPayload();

        this.extended = true;
    }

    /**
     * @hidden
     */
    protected parseServerCard(data: cheerio.Element, isPreview: boolean): Omit<IServerContext, "version" | "uptime"> | Omit<IServerContext, "country" | "ip" | "version" | "uptime"> {
        const $ = cheerio.load(data);

        const header = $("div.card-header.p-0 > div.row.no-gutters");
        // @ts-ignore
        const [{ data: title }] = header.find(`div.col.text-center.text-nowrap.text-ellipsis.mc-bold${isPreview ? ".p-1" : ".p-2.mc-white"}`)
            .get(0)
            .children;
        // @ts-ignore
        const [{ data: rating }] = header.find(`div.col-auto.mc-gray${isPreview ? ".p-1" : ".p-2"}`)
            .get(1)
            .children;

        const body = $("div.card-body.p-0 > div.row.no-gutters.flex-nowrap.align-items-center");

        const icon = body.find(`div.col-auto${isPreview ? ".p-1" : ".p-2"} > img`)
            .attr()
            .src;

        const bodyMotd = body.find(`div.col.mc-reset${isPreview ? ".p-1" : ".p-2"}`)
            .children();

        if (!bodyMotd.children()[0]?.attribs?.class?.includes("float-right") && !bodyMotd.children()[0]?.next) {
            throw new WrapperError("SERVER_OFFLINE", title);
        }

        const motdTitle = bodyMotd
            .attr()
            .title;
        // @ts-ignore
        let [{ children: [{ data: onlinePlayers }, , { data: maxPlayers }], next: bodyMotdNext }, rawMotd] = bodyMotd.children()
            .get();

        if (!bodyMotdNext) {
            bodyMotdNext = {
                data: ""
            } as any;
        }

        // @ts-ignore
        const { data: textMotd } = bodyMotdNext;

        const motdHtml = typeof rawMotd === "object" ? // @ts-ignore Invalid lib type
            cheerio.default.html(escapeColorsClasses(rawMotd.children))
            :
            textMotd;
        const motdClear = isPreview ?
            motdTitle
            :
            typeof rawMotd === "object" ?
                escapeHtml(rawMotd.children as Element[])
                :
                textMotd;

        const parsedData = {
            title,
            icon,
            motd: {
                clear: motdClear,
                html: motdHtml
            },
            players: {
                online: Number(onlinePlayers),
                max: Number(maxPlayers)
            },
            rating: Number(rating.slice(1))
        };

        if (isPreview) {
            return {
                ...parsedData,
                ip: this.parseIP(data),
                country: this.parseServerCountry(
                    header.find("div.col-auto.p-1")
                        .children("img")
                        .get(0)
                )
            };
        }

        return parsedData;
    }

    /**
     * @hidden
     */
    protected parseServerCountry(data?: cheerio.Element): IServerContext["country"] {
        if (data) {
            const { attribs: { title: name, src: image, alt: emoji } } = data;

            return {
                name,
                image,
                emoji
            };
        }

        return null;
    }

    /**
     * @hidden
     */
    protected parseIP(data: cheerio.Element): IServerContext["ip"] {
        return data.attribs.href.replace(/\/[^]+\//, "");
    }

    /**
     * @hidden
     */
    [kSerializeData](): IServerContext {
        return pickProperties(this, [
            "ip",
            "title",
            "icon",
            "motd",
            "players",
            "country",
            "rating",
            "version",
            "uptime"
        ]);
    }
}
