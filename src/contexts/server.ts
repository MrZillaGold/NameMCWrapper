import * as cheerio from "cheerio";

import { Context } from "./context";
import { WrapperError } from "../WrapperError";

import { applyPayload, escapeColorsClasses, escapeHtml, getUUID, kSerializeData, pickProperties } from "../utils";

import { ICheckServerLikeOptions, IServerContext, IServerContextOptions } from "../interfaces";
import TagElement = cheerio.TagElement;

export class ServerContext extends Context implements IServerContext {

    readonly ip: IServerContext["ip"] = "";
    readonly title: IServerContext["title"] = "";
    readonly icon: IServerContext["icon"] = "";
    readonly motd: IServerContext["motd"] = {
        clear: "",
        html: ""
    };
    readonly players: IServerContext["players"] = {
        online: 0,
        max: 0
    };
    readonly country: IServerContext["country"] = null;
    readonly rating: IServerContext["rating"] = 0;
    readonly version: IServerContext["version"] = null;
    readonly uptime: IServerContext["uptime"] = null;

    private extended = false;

    constructor({ data, extended, ...options }: IServerContextOptions) {
        super(options);

        this.setupPayload();

        if (!data) {
            return;
        }

        const $ = cheerio.load(data as string);

        const serverCard = extended ?
            this.parseServerCard(
                $("div.card.mb-3")
                    .filter((index, element) => (element as TagElement)?.attribs?.style?.includes("#0F0F0F"))
                    .get(0),
                !extended
            )
            :
            this.parseServerCard(data as TagElement, !extended);

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

            const { version = null, uptime = null, country = null } = Object.assign.apply({}, [{}, ...infoCard.map((index, element) => {
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
                    .get(0)
                    .data;

                const isUptime = content.endsWith("%");

                return {
                    [isUptime ? "uptime" : "version"]: content ?
                        isUptime ?
                            Number(content.replace("%", ""))
                            :
                            content
                        :
                        null
                };
            })
                .get()
            ]);

            applyPayload(this, {
                version,
                country,
                uptime
            });
        }

        applyPayload(this, serverCard);
    }

    get isExtended(): boolean {
        return this.extended;
    }

    async checkLike(nickname: ICheckServerLikeOptions["nickname"]): Promise<boolean> {
        const uuid = await getUUID(this.client, this.options.getEndpoint({ domain: "api.ashcon.app" }), nickname);

        return this.api.server.likes({
            target: this.ip,
            profile: uuid
        });
    }

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
            }))
            .catch((error) => {
                throw error?.response?.status === 404 ?
                    new WrapperError("NOT_FOUND", this.ip)
                    :
                    error;
            });
        this.extended = true;

        this.setupPayload();
    }

    protected parseServerCard<P = boolean>(data: TagElement, isPreview: P): Omit<IServerContext, "version" | "uptime"> | Omit<IServerContext, "country" | "ip" | "version" | "uptime"> {
        const $ = cheerio.load(data);

        const header = $("div.card-header.p-0 > div.row.no-gutters");
        const { children: [{ data: title }] } = header.find(`div.col.text-center.text-nowrap.text-ellipsis.mc-bold${isPreview ? ".p-1" : ".p-2.mc-white"}`)
            .get(0);
        const { children: [{ data: rating }] } = header.find(`div.col-auto.mc-gray${isPreview ? ".p-1" : ".p-2"}`)
            .get(1);

        const body = $("div.card-body.p-0 > div.row.no-gutters.flex-nowrap.align-items-center");
        const { attribs: { src: icon } } = body.find(`div.col-auto${isPreview ? ".p-1" : ".p-2"} > img`)
            .get(0);

        const bodyMotd = body.find(`div.col.mc-reset${isPreview ? ".p-1" : ".p-2"}`)
            .children();

        if (!(bodyMotd.children()[0] as TagElement)?.attribs?.class?.includes("float-right") && !bodyMotd.children()[0]?.next) {
            throw new WrapperError("SERVER_OFFLINE", title);
        }

        const { attribs: { title: motdTitle } } = bodyMotd.get(0);
        let [{ children: [{ data: onlinePlayers }, , { data: maxPlayers }], next: bodyMotdNext }, rawMotd] = bodyMotd.children()
            .get();

        if (!bodyMotdNext) {
            bodyMotdNext = {
                data: ""
            };
        }

        const { data: textMotd } = bodyMotdNext;

        const motdHtml = typeof rawMotd === "object" ? // @ts-ignore Invalid lib type
            cheerio.html(escapeColorsClasses(rawMotd.children))
            :
            textMotd;
        const motdClear = isPreview ?
            motdTitle
            :
            typeof rawMotd === "object" ?
                escapeHtml(rawMotd.children)
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
            const ip = data.attribs.href.replace(/\/[^]+\//, "");

            const country = this.parseServerCountry(
                header.find("div.col-auto.p-1")
                    .children("img")
                    .get(0)
            );

            return {
                ...parsedData,
                ip,
                country
            };
        }

        return parsedData;
    }

    protected parseServerCountry(data?: TagElement): IServerContext["country"] {
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

    [kSerializeData](): Record<string, unknown> {
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
