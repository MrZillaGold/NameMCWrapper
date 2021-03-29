import cheerio from "cheerio";

import { WrapperError } from "./WrapperError";

import { profileSkinsRegExp, escapeColorsClasses, escapeHtml, skinRegExp } from "./utils";

import { IOptions, ISkin, IExtendedSkin, INamedSkin, ICape, ICapeResponse, IRender, IGetEndpointOptions, IGetRendersOptions, ISkinResponse, ICapeInfo, IServerPreview, IServer, Hash, BasePlayerInfo, Model } from "./interfaces";
import TagElement = cheerio.TagElement;
import Root = cheerio.Root;

export abstract class DataParser {

    options: IOptions;

    protected constructor(options: IOptions) {
        this.options = options;
    }

    protected abstract getEndpoint(options: IGetEndpointOptions): string;
    abstract getRenders(options: IGetRendersOptions): IRender;
    abstract getCapeInfo(hash: Hash): ICapeInfo;

    protected parseSkins(data: string): (ISkin | INamedSkin)[] {
        const $ = cheerio.load(data);

        const skins = $("div.card-body.position-relative.text-center.checkered.p-1")
            .map((index, card) => {
                const cardLinkHash = (card.parent as TagElement).attribs.href.replace(skinRegExp, "$1");
                const cardHeader = ((card.parent as TagElement).children as TagElement[]).filter(({ name, attribs: { class: className = "" } = {} }) => name === "div" && className.includes("card-header"))[0];
                const cardName = cardHeader ? cardHeader.children[0]?.data : null;

                const $ = cheerio.load(card);

                const [skin] = $("div > img.drop-shadow") // @ts-ignore
                    .map((index, { attribs: { src } }) => {
                        const isValidSkin = this.checkSkinLink(src);

                        return {
                            ...isValidSkin,
                            hash: cardLinkHash
                        };
                    })
                    .get();

                return {
                    ...skin,
                    name: cardName,
                    rating: this.parseSkinRating($)
                };
            })
            .get();

        return skins.map((skin) => this.extendResponse({
            ...skin,
            type: "skin"
        }));
    }

    protected parseSkin(data: string): IExtendedSkin | void {
        const $ = cheerio.load(data);

        const { attribs: { href } } = $("#render-button.btn")
            .get(0);

        const isValidSkin = this.checkSkinLink(href);

        if (isValidSkin) {
            const tags = $("div.card-body.text-center.py-1 > a.badge.badge-pill")
                .map((index, element) => {
                    const { children: [{ data: tag }] } = element as TagElement;

                    return tag;
                })
                .get();

            return {
                ...this.extendResponse({
                    ...isValidSkin,
                    rating: this.parseSkinRating($),
                    type: "skin"
                }),
                createdAt: this.parseSkinTime($),
                tags
            };
        }
    }

    protected parseCapes(data: string): ICape[] {
        const $ = cheerio.load(data);

        return $("canvas.cape-2d.align-top") // @ts-ignore
            .map((index, { attribs: { "data-cape-hash": hash } }: TagElement) => this.extendResponse({
                hash,
                type: "cape"
            }))
            .get();
    }

    protected parsePlayer(data: string): BasePlayerInfo {
        const $ = cheerio.load(data);

        let [baseInfo, nicknameHistory] = $("div.card.mb-3")
            .map((index, element) => {
                const $ = cheerio.load(element);

                return $("div.card-body.py-1")
                    .children("div.row.no-gutters");
            })
            .get();

        baseInfo = baseInfo
            .map((index: number, element: TagElement) => {
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

        nicknameHistory = nicknameHistory
            .map((index: number, element: TagElement) => {
                const $ = cheerio.load(element);

                const name = $("div.col > a").get(0);
                const time = $("div.col-12 > time").get(0);

                if (name) {
                    const { children: [{ data: nickname }] } = name;
                    const changed_at = time?.attribs?.datetime || null;

                    return {
                        nickname,
                        changed_at,
                        timestamp: changed_at ? new Date(changed_at).getTime() : null
                    };
                }
            })
            .get()
            .reverse();

        const [uuid, , link, views] = baseInfo;

        return {
            uuid,
            link,
            views,
            names: nicknameHistory
        };
    }

    protected parseServers(data: string): IServerPreview[] {
        const $ = cheerio.load(data);

        return $("a.card-link")
            .map((index, element) => this.parseServerCard(element as TagElement, true))
            .get();
    }

    protected parseServer(data: string, ip: string): IServer {
        const $ = cheerio.load(data);

        const serverCard = this.parseServerCard(
            $("div.card.mb-3")
                .filter((index, element) => (element as TagElement)?.attribs?.style?.includes("#0F0F0F"))
                .get(0),
            false
        );

        const [, infoCard] = $("div.row > div.col-12.col-lg-5")
            .children()
            .filter("div.card.mb-3")
            .get()
            .map((element) => {
                const $ = cheerio.load(element);

                return $("div.card.mb-3 > div.card-body").children();
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
                        content.replace("%", "")
                        :
                        content
                    :
                    null
            };
        })
            .get()
        ]);

        return {
            ...serverCard,
            ip,
            version,
            country,
            uptime
        };
    }

    private parseServerCard(data: TagElement, isPreview: true): IServerPreview;
    private parseServerCard(data: TagElement, isPreview: false): Exclude<IServerPreview, "country" | "ip">;
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private parseServerCard(data: TagElement, isPreview: boolean) {
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
            throw new WrapperError(5, [title]);
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

    private parseServerCountry = (data: TagElement | undefined): IServer["country"] => {
        if (data) {
            const { attribs: { title: name, src: image, alt: emoji } } = data;

            return {
                name,
                image,
                emoji
            };
        }

        return null;
    };

    protected extendResponse(response: ISkinResponse): ISkin;
    protected extendResponse(response: ICapeResponse): ICape;
    protected extendResponse(response: ISkinResponse | ICapeResponse): ISkin | ICape {
        const { hash, type } = response;

        const url = `${this.getEndpoint({})}/texture/${hash}.png`;

        switch(type) {
            case "skin": {
                const name = (response as ISkinResponse).name || null;
                const rating = (response as ISkinResponse).rating ?? 0;
                const model = (response as ISkinResponse).model || this.options.defaultSkinsModel || "unknown";

                return {
                    url,
                    hash,
                    name,
                    model,
                    rating,
                    renders: this.getRenders({
                        skin: hash,
                        model
                    }),
                    isSlim: model !== "classic"
                };
            }
            case "cape":
                return {
                    hash,
                    url,
                    ...this.getCapeInfo(hash)
                };
        }
    }

    protected getProfileId(data: string): string {
        const $ = cheerio.load(data);

        const [profileId] = $("div.card-header.py-1 > strong > a")
            .map((index, element) => { // @ts-ignore
                const isProfileSkinsUrl = profileSkinsRegExp.exec(element.attribs.href);

                if (isProfileSkinsUrl) {
                    return isProfileSkinsUrl[1];
                }
            })
            .get();

        return profileId;
    }

    private parseSkinRating = ($: Root): number => {
        const ratingElement = $(".position-absolute.bottom-0.right-0.text-muted")
            .get(0)
            .children;

        const rating = (
            ratingElement.length > 1 ?
                ratingElement[1]
                :
                ratingElement[0]
        )
            .data;

        return Number(rating.replace(/(?:[^\d]+)([\d]+)/, "$1"));
    };

    private parseSkinTime = ($: Root): number => {
        const date = $(".position-absolute.bottom-0.left-0.text-muted.title-time")
            .get(0)
            .attribs
            .title;

        return new Date(date)
            .getTime();
    };

    private checkSkinLink = (link: string) => {
        const skinRegExp = /skin=([^]+?)(?:&[^]+)?&model=([^]+?)&[^]+/;
        const idValidSkin = skinRegExp.exec(link);

        if (idValidSkin) {
            const [, hash, model] = idValidSkin;

            return {
                hash,
                model: model as Model
            };
        }
    };
}
