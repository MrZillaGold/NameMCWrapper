export class DataParser {

    parseSkins(data) {
        const skinRegExp = /<\s*img class="lazy drop-shadow auto-size" width="(?:[^]+?)" height="(?:[^]+?)" src="(?:[^]+?)" data-src="https:\/\/render\.namemc\.com\/skin\/3d\/body\.png\?skin=([^]+?)&amp;model=([^]+?)&amp;width=(?:[^]+?)&amp;height=(?:[^]+?)" loading="lazy"[^>]*>/;

        const skins = data.match(new RegExp(skinRegExp, "g"));

        if (skins) {
            const ratings = data.match(/★([\d]+)/g);

            return skins.map((skin, index) => {
                const [, hash, model] = skinRegExp.exec(skin);

                const [, rating] = /★([\d]+)/.exec(ratings[index]);

                return {
                    url: `${this.getEndpoint()}/texture/${hash}.png`,
                    hash,
                    model,
                    isSlim: model !== "classic",
                    renders: this.getRenders({
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

    parseCapes(data) {
        const capes = data.match(/<\s*canvas class="cape-2d align-top (?:skin-button|skin-button skin-button-selected)" width="(?:[^]+?)" height="(?:[^]+?)" data-cape-hash="([^]+?)"[^>]*>(?:.*?)<\s*\/\s*canvas>/g);

        if (capes) {
            return capes.map((cape) => {
                const regExp = /data-cape-hash="([^]+?)"/;

                const [, hash] = regExp.exec(cape);

                return {
                    hash,
                    url: `${this.getEndpoint()}/texture/${hash}.png`,
                    ...this.getCapeType(hash)
                };
            })
        } else {
            return [];
        }
    }
}
