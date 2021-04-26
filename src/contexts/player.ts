import * as cheerio from "cheerio";

import { Context, SkinContext, CapeContext } from "./";

import { kSerializeData, pickProperties, parseDate } from "../utils";

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

    private extended = false;

    constructor({ data, ...options }: IPlayerContextOptions) {
        super(options);

        this.setupPayload();

        if (!data) {
            return;
        }

        const $ = cheerio.load(data as string);

        this.capes = $("canvas.cape-2d") // @ts-ignore
            .map((index, { attribs: { "data-cape-hash": hash } }) => new CapeContext({
                ...this,
                hash
            }))
            .get();
        this.skins = $("canvas.skin-2d.skin-button") // @ts-ignore
            .map((index, { attribs: { "data-skin-hash": hash, "data-model": model, title } }) => new SkinContext({
                ...this,
                payload: {
                    hash,
                    model,
                    createdAt: parseDate(title)
                }
            }))
            .get();

        let [baseInfo, nicknameHistory] = $("div.card.mb-3 > div.card-body")
            .map((index, element) => {
                const $ = cheerio.load(element);

                return $("div.card-body");
            })
            .get();

        baseInfo = baseInfo.children("div.row.no-gutters")
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

        const [uuid, , url, views] = baseInfo;

        this.uuid = uuid;
        this.username = nicknameHistory[nicknameHistory.length - 1].nickname;
        this.url = url;
        this.views = views;
        this.names = nicknameHistory;
    }

    get isExtended(): boolean {
        return this.extended;
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
            "friends"
        ]);
    }
}
