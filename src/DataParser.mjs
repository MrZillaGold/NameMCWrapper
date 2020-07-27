export class DataParser {

    constructor(data, context) {
        this.data = data;

        this.context = context;
    }

    parseSkins() {
        const { data, context } = this;

        const skins = data.match(/<\s*a href="\/skin\/([^]+?)"[^>]*>/g);

        const models = data.match(/model=(classic|slim)/g);

        const ratings = data.match(/★([\d]+)/g);

        if (skins) {
            return skins.map((skin, index) => {
                const [, hash] = /\/skin\/([\da-z]+)/.exec(skin);
                const [, model] = /model=(classic|slim)/.exec(models[index]);

                const [, rating] = /★([\d]+)/.exec(ratings[index]);

                return {
                    url: `${context.getEndpoint()}/texture/${hash}.png`,
                    hash,
                    isSlim: model !== "classic",
                    renders: context.getRenders({
                        skin: hash,
                        model
                    }),
                    rating: parseInt(rating)
                }
            });
        } else {
            return null;
        }
    }

    parseCapes() {
        const { data, context } = this;

        const capes = data.match(/<\s*canvas class="cape-2d align-top (?:skin-button|skin-button skin-button-selected)" width="(?:[^]+?)" height="(?:[^]+?)" data-cape-hash="([^]+?)"[^>]*>(?:.*?)<\s*\/\s*canvas>/g);

        if (capes) {
            return capes.map(cape => {
                const regExp = /data-cape-hash="([^]+?)"/;

                const [, hash] = regExp.exec(cape);

                return {
                    hash,
                    url: `${context.getEndpoint()}/texture/${hash}.png`,
                    ...context.getCapeType(hash)
                };
            })
        } else {
            return [];
        }
    }
}
