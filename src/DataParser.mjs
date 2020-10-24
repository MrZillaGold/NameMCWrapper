import cheerio from "cheerio";

export class DataParser {

    parseSkins(data) {
        const $ = cheerio.load(data);

        const skins = $("div.card-body.position-relative.text-center.checkered-light.p-1")
            .map((index, card) => {
                const $ = cheerio.load(card);

                const [skin] = $("div > img.drop-shadow.auto-size")
                    .map((index, { attribs: { src: skin } }) => {
                        const skinRegExp = /https:\/\/render\.namemc\.com\/skin\/3d\/body\.png\?skin=([^]+?)&model=([^]+?)&width=(?:[^]+?)&height=(?:[^]+?)/;

                        const [, hash, model] = skinRegExp.exec(skin);

                        return {
                            hash,
                            model
                        };
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

        return skins.map((skin) => this.extendResponse(skin, "skin"));
    }

    parseCapes(data) {
        const $ = cheerio.load(data);

        return $("canvas.cape-2d.align-top")
            .map((index, { attribs: { "data-cape-hash": hash } }) => {
                return this.extendResponse({ hash }, "cape");
            })
            .get();
    }

    parseNicknameHistory(data) {
        const $ = cheerio.load(data);

        const history = $("div.card.mb-3 > div.card-body.py-1 > div.row.no-gutters")
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

    extendResponse(response, responseType) {
        const { hash, model } = response;

        const url = `${this.getEndpoint()}/texture/${hash}.png`;

        switch(responseType) {
            case "skin":
                return {
                    ...response,
                    url,
                    isSlim: model !== "classic",
                    renders: this.getRenders({
                        skin: hash,
                        model
                    })
                }
            case "cape":
                return {
                    ...response,
                    url,
                    ...this.getCapeType(hash)
                }
        }
    }
}
