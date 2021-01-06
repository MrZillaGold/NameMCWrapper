import cheerio from "cheerio";

import { profileSkinsRegExp } from "./utils";

import { ISkin, ICape, INickname, ICapeResponse, IRender, IGetEndpointOptions, IGetRendersOptions, Hash, ISkinResponse, ICapeInfo } from "./interfaces";

export abstract class DataParser {

    abstract getEndpoint(options: IGetEndpointOptions): string;
    abstract getRenders(options: IGetRendersOptions): IRender;
    abstract getCapeInfo(hash: Hash): ICapeInfo;

    protected parseSkins(data: string): ISkin[] {
        const $ = cheerio.load(data);

        const skins = $("div.card-body.position-relative.text-center.checkered.p-1")
            .map((index, card) => {
                const $ = cheerio.load(card);

                const [skin] = $("div > img.drop-shadow.auto-size") // @ts-ignore
                    .map((index, { attribs: { src: skin } }) => {
                        const skinRegExp = /https:\/\/render\.namemc\.com\/skin\/3d\/body\.png\?skin=([^]+?)&model=([^]+?)&width=(?:[^]+?)&height=(?:[^]+?)/;

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

        const history = $("div.card.mb-3 > div.card-body.py-1 > div.row.no-gutters") // @ts-ignore
            .filter((index, element) => element.attribs.class === "row no-gutters")
            .map((index, element) => {
                const $ = cheerio.load(element);

                const name = $("div.col.order-md-2.col-md-4.text-nowrap > a").get();
                const time = $("div.col-12.order-md-3.col-md > time").get();

                if (name.length) {
                    const [{ children: [{ data: nickname }] }] = name;
                    const changed_at = time[0]?.attribs?.datetime || null;

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

    protected extendResponse(response: ISkinResponse): ISkin;
    protected extendResponse(response: ICapeResponse): ICape;
    protected extendResponse(response: ISkinResponse | ICapeResponse): ISkin | ICape {
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
