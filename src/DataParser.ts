import cheerio from "cheerio";

import { profileSkinsRegExp, escapeColorsClasses, escapeHtml } from "./utils";

import { ISkin, ICape, INickname, ICapeResponse, IRender, IGetEndpointOptions, IGetRendersOptions, ISkinResponse, ICapeInfo, IServerPreview, IServer, Hash } from "./interfaces";
import TagElement = cheerio.TagElement;

export abstract class DataParser {

    abstract getEndpoint(options: IGetEndpointOptions): string;
    abstract getRenders(options: IGetRendersOptions): IRender;
    abstract getCapeInfo(hash: Hash): ICapeInfo;

    protected parseSkins(data: string): ISkin[] {
        const $ = cheerio.load(data);

        const skins = $("div.card-body.position-relative.text-center.checkered.p-1")
            .map((index, card) => {
                const $ = cheerio.load(card);

                const [skin] = $("div > img.drop-shadow") // @ts-ignore
                    .map((index, { attribs: { src: skin } }) => {
                        const skinRegExp = /skin=([^]+?)&model=([^]+?)&[^]+/;

                        const idValidSkin = skinRegExp.exec(skin);

                        if (idValidSkin) {
                            const [, hash, model] = idValidSkin;

                            return {
                                hash,
                                model
                            };
                        }
                    })
                    .get();

                const [{ children: [{ data: rating }] }] = $("div.position-absolute.bottom-0.right-0.text-muted.mx-1.small-xs.normal-sm")
                    .get();

                return {
                    ...skin,
                    rating: Number(rating.slice(1))
                };
            })
            .get();

        return skins.map((skin) => this.extendResponse({
            ...skin,
            type: "skin"
        }));
    }

    protected parseCapes(data: string): ICape[] {
        const $ = cheerio.load(data);

        return $("canvas.cape-2d.align-top") // @ts-ignore
            .map((index, { attribs: { "data-cape-hash": hash } }) =>
                this.extendResponse({
                    hash,
                    type: "cape"
                })
            )
            .get();
    }

    protected parseNicknameHistory(data: string): INickname[] {
        const $ = cheerio.load(data);

        const history = $("div.card.mb-3 > div.card-body.py-1 > div.row.no-gutters")
            .filter((index, element) => (element as TagElement).attribs.class === "row no-gutters")
            .map((index, element) => {
                const $ = cheerio.load(element);

                const name = $("div.col.order-md-2.col-md-4.text-nowrap > a").get(0);
                const time = $("div.col-12.order-md-3.col-md > time").get(0);

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
            .get();

        return history.reverse();
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

        const [version, uptime, country] = infoCard.map((index, element) => {
            const $ = cheerio.load(element);

            const rowValue = $("div.row > div.text-right");

            if (rowValue.children().length) {
                return this.parseServerCountry(
                    rowValue.children("img")
                        .get(0)
                );
            }

            return rowValue.contents()
                .get(0)
                .data;
        })
            .get();

        return {
            ...serverCard,
            ip,
            version,
            country,
            uptime: Number(uptime.replace("%", ""))
        };
    }

    protected parseServerCard(data: TagElement, isPreview: true): IServerPreview;
    protected parseServerCard(data: TagElement, isPreview: false): Exclude<IServerPreview, "country" | "ip">;
    protected parseServerCard(data: TagElement, isPreview: boolean) {
        const $ = cheerio.load(data);

        const header = $("div.card-header.p-0 > div.row.no-gutters");
        const { children: [{ data: title }] } = header.find(`div.col.text-center.text-nowrap.text-ellipsis.mc-bold${isPreview ? ".p-1" : ".p-2.mc-white"}`)
            .get(0);
        const { children: [{ data: rating }] } = header.find(`div.col-auto.mc-gray${isPreview ? ".p-1" : ".p-2"}`)
            .get(1);

        const body = $("div.card-body.p-0 > div.row.no-gutters.flex-nowrap.align-items-center");
        const { attribs: { src: icon } } = body.find(`div.col-auto${isPreview ? ".p-1" : ".p-2"} > img`)
            .get(0);

        const rawMotd = body.find(`div.col.mc-reset${isPreview ? ".p-1" : ".p-2"}`)
            .children();
        const { attribs: { title: motdClear } } = rawMotd.get(0);
        const [{ children: [{ data: onlinePlayers }, , { data: maxPlayers }] }, { children: motdRawHtml }] = rawMotd.children()
            .get();
        // @ts-ignore Invalid lib type
        const motdHtml = cheerio.html(escapeColorsClasses(motdRawHtml));

        const parsedData = {
            title,
            icon,
            motd: {
                clear: isPreview ?
                    motdClear
                    :
                    escapeHtml(motdRawHtml),
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

    protected parseServerCountry(data: TagElement): IServer["country"] {
        const { attribs: { title: name, src: image, alt: emoji } } = data;

        return {
            name,
            image,
            emoji
        };
    }

    protected extendResponse(response: ISkinResponse): ISkin;
    protected extendResponse(response: ICapeResponse): ICape;
    protected extendResponse(response: ISkinResponse | ICapeResponse) {
        // @ts-ignore
        const { hash, model, type, rating = 0 } = response;

        const url = `${this.getEndpoint({})}/texture/${hash}.png`;

        switch(type) {
            case "skin":
                return {
                    url,
                    hash,
                    model,
                    rating,
                    renders: this.getRenders({
                        skin: hash,
                        model
                    }),
                    isSlim: model !== "classic"
                };
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
}
