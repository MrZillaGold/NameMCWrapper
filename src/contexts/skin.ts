import * as cheerio from "cheerio";

import { Context } from "./context";
import { RendersContext } from "./renders";
import { WrapperError } from "../WrapperError";

import { kSerializeData, pickProperties, skinRegExp } from "../utils";

import { ISkinContext, ISkinContextOptions, Model, Transformation, TransformationUnion } from "../interfaces";

export class SkinContext extends Context<ISkinContext> implements ISkinContext {

    /**
     * SKin hash
     */
    readonly hash: ISkinContext["hash"] = "";
    /**
     * Skin name
     */
    readonly name: ISkinContext["name"] = "";
    /**
     * Skin model
     */
    readonly model: ISkinContext["model"] = Model.UNKNOWN;
    /**
     * Skin tags
     */
    readonly tags: ISkinContext["tags"] = [];
    /**
     * Skin rating
     */
    readonly rating: ISkinContext["rating"] = 0;
    /**
     * Skin creation timestamp
     */
    readonly createdAt: ISkinContext["createdAt"] = 0;
    /**
     * Skin transformation type
     */
    readonly transformation: ISkinContext["transformation"] = null;

    /**
     * Payload loaded
     * @hidden
     */
    private extended = false;

    /**
     * @hidden
     */
    constructor({ data, type, ...options }: ISkinContextOptions) {
        super(options);

        this.setupPayload();

        if (!data) {
            return;
        }

        switch (type) {
            case "extended": {
                this.extended = true;

                const $ = cheerio.load(data);

                const { attribs: { href } } = $("#render-button.btn")
                    .get(0);

                const isValidSkin = this.checkSkinLink(href);

                if (isValidSkin) {
                    const { hash, model } = isValidSkin;

                    this.hash = hash;
                    this.model = model;
                    this.rating = this.parseSkinRating($);
                    this.createdAt = this.parseSkinTime($);
                    this.tags = $("div.card-body.text-center.py-1 > a.badge.badge-pill")
                        .map((index, element) => {
                            // @ts-ignore
                            const { children: [{ data: tag }] } = element;

                            return tag;
                        })
                        .get();
                }

                break;
            }
            default: {
                // @ts-ignore
                const cardLinkHash = (data as cheerio.Element)?.parent?.attribs.href
                    .replace(skinRegExp, "$1");
                const cardHeader = (data as cheerio.Element)?.parent?.children
                    // @ts-ignore
                    .filter(({ name, attribs: { class: className = "" } = {} }) => name === "div" && className.includes("card-header"))[0];
                const cardName = cardHeader ?
                    // @ts-ignore
                    (cardHeader as cheerio.NodeWithChildren).children[0]?.data as string
                    :
                    "";

                const $ = cheerio.load(data as string);

                const [{ hash, model }] = $("div > img.drop-shadow")
                    .map((index, { attribs: { "data-src": src } }) => {
                        const isValidSkin = this.checkSkinLink(src);

                        return {
                            model: Model.UNKNOWN,
                            ...isValidSkin,
                            hash: cardLinkHash
                        };
                    })
                    .get();

                this.model = model;
                this.hash = hash;
                this.name = cardName;
                this.rating = this.parseSkinRating($);
            }
        }
    }

    /**
     * Get skin url
     */
    get url(): ISkinContext["url"] {
        return `${this.options.getEndpoint()}/texture/${this.hash}.png`;
    }

    /**
     * Get skin renders
     */
    get renders(): ISkinContext["renders"] {
        const { options, client, api } = this;

        return new RendersContext({
            skin: this.hash,
            model: this.model,
            options,
            client,
            api
        });
    }

    /**
     * Check is slim skin model
     */
    get isSlim(): boolean {
        return this.model === Model.SLIM;
    }

    /**
     * Check payload loaded
     */
    get isExtended(): boolean {
        return this.extended;
    }

    /**
     * Check is transformed
     */
    get isTransformed(): boolean {
        return Boolean(this.transformation);
    }

    /**
     * Transform skin
     *
     * @see {@link https://namemc.com/skin/ee40191789e621d3 | Check "Tools" card}
     */
    transform(transformation: Transformation | TransformationUnion): Promise<SkinContext> {
        return this.client.post("/transform-skin", `skin=${this.hash}&transformation=${transformation}`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                origin: "https://ru.namemc.com"
            }
        })
            .then(({ request }) => {
                const [, hash] = (request?.res?.responseUrl || request.responseURL).match(skinRegExp);

                if (!hash) {
                    throw new WrapperError("NO_USEFUL");
                }

                this.payload = {
                    hash,
                    transformation
                };

                this.setupPayload();

                return this;
            })
            .catch((error) => {
                throw error?.response?.status === 404 ?
                    new WrapperError("NOT_FOUND", this.hash)
                    :
                    error;
            });
    }

    /**
     * Load all skin information
     */
    async loadPayload(): Promise<void> {
        if (this.isExtended) {
            return;
        }

        this.payload = await this.client.get(`/skin/${this.hash}`)
            .then(({ data }) => {
                const skin = new SkinContext({
                    ...this,
                    data,
                    type: "extended",
                    payload: {
                        name: this.name
                    }
                });

                if (!skin.hash) {
                    throw new WrapperError("NO_USEFUL");
                }

                return skin;
            })
            .catch((error) => {
                throw error?.response?.status === 404 ?
                    new WrapperError("NOT_FOUND", this.hash)
                    :
                    error;
            });
        this.extended = true;

        this.setupPayload();
    }

    /**
     * @hidden
     */
    protected checkSkinLink(link: string): Pick<ISkinContext, "hash" | "model"> | void {
        const skinRegExp = /skin=([^]+?)(?:&[^]+)?&model=([^]+?)&[^]+/;
        const idValidSkin = skinRegExp.exec(link);

        if (idValidSkin) {
            const [, hash, model] = idValidSkin;

            return {
                hash,
                model: model as Model
            };
        }
    }

    /**
     * @hidden
     */
    protected parseSkinRating($: cheerio.CheerioAPI): number {
        const ratingElement = $(".position-absolute.bottom-0.right-0.text-muted")
            .get(0)
            .children;

        const rating = (
            ratingElement.length > 1 ?
                ratingElement[1]
                :
                ratingElement[0]
        )
            // @ts-ignore
            .data;

        return Number(rating.replace(/[^\d]+([\d]+)/, "$1"));
    }

    /**
     * @hidden
     */
    protected parseSkinTime($: cheerio.CheerioAPI): number {
        const date = $(".position-absolute.bottom-0.left-0.text-muted.title-time")
            .get(0)
            .attribs
            .title;

        return new Date(date)
            .getTime();
    }

    /**
     * @hidden
     */
    [kSerializeData](): ISkinContext {
        return pickProperties(this, [
            "hash",
            "name",
            "url",
            "model",
            "isSlim",
            "transformation",
            "isTransformed",
            "renders",
            "tags",
            "rating",
            "createdAt"
        ]);
    }
}
