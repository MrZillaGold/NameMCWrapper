import cheerio, { CheerioAPI, Element } from 'cheerio';

import { Context, IContextOptions } from './context';
import { RendersContext } from './renders';
import { Hash } from './player';
import { WrapperError } from '../error';

import { convertDate, kSerializeData, pickProperties, skinRegExp } from '../utils';

export interface ISkinContextOptions extends IContextOptions<SkinContext> {
    data?: string | Element | Element[];
    isExtended?: boolean;
}

/**
 * Skin model type
 */
export enum Model {
    UNKNOWN = 'unknown',
    CLASSIC = 'classic',
    SLIM = 'slim'
}
export type ModelUnion = `${Model}`;

/**
 * Skin transformation type
 */
export enum Transformation {
    GRAYSCALE = 'grayscale',
    INVERT = 'invert',
    ROTATE_HUE_180 = 'rotate-hue-180',
    ROTATE_HEAD_LEFT = 'rotate-head-left',
    ROTATE_HEAD_RIGHT = 'rotate-head-right',
    HAT_PUMPKIN_MASK_1 = 'hat-pumpkin-mask-1',
    HAT_PUMPKIN_MASK_2 = 'hat-pumpkin-mask-2',
    HAT_PUMPKIN_MASK_3 = 'hat-pumpkin-mask-3',
    HAT_PUMPKIN_MASK_4 = 'hat-pumpkin-mask-4',
    HAT_PUMPKIN = 'hat-pumpkin',
    HAT_PUMPKIN_CREEPER =  'hat-pumpkin-creeper',
    HAT_SANTA = 'hat-santa'
}
export type TransformationUnion = `${Transformation}`;

export interface ITransformSkinOptions {
    /**
     * Skin id
     */
    skin: Hash;
    /**
     * Skin transformation type
     */
    transformation?: Transformation | TransformationUnion;
    /**
     * Skin model
     */
    model?: Model | ModelUnion;
}

export class SkinContext extends Context<SkinContext> {

    /**
     * Skin id
     */
    readonly id: string = '';
    /**
     * Skin name
     */
    readonly name: string = '';
    /**
     * Skin model
     */
    readonly model: Model | ModelUnion = Model.UNKNOWN;
    /**
     * Skin tags
     */
    readonly tags: string[] = [];
    /**
     * Skin rating
     */
    readonly rating: number = 0;
    /**
     * Skin favorite count
     */
    readonly favorite: number = 0;
    /**
     * Skin creation timestamp
     */
    readonly createdAt: number = 0;
    /**
     * Skin transformation type
     */
    readonly transformation: Transformation | TransformationUnion | null = null;

    /**
     * Payload loaded
     * @hidden
     */
    #extended = false;

    /**
     * @hidden
     */
    constructor({ data, isExtended, ...options }: ISkinContextOptions) {
        super(options);

        this.setupPayload();

        if (!data) {
            return;
        }

        const $ = cheerio.load(data);

        if (isExtended) {
            this.#extended = true;

            const { id, model } = this.#parseSkin($, data, isExtended);

            this.id = id;
            this.model = model;
            this.createdAt = this.#parseSkinTime($);
            this.tags = this.#parseSkinTags($);
        } else {
            const { id, model, name } = this.#parseSkin($, data, isExtended);

            this.id = id;
            this.model = model;
            this.name = name;
        }

        const counters = this.#parseSkinCounters($);

        if (counters) {
            const { rating, favorite } = counters;

            this.rating = rating;
            this.favorite = favorite;
        }
    }

    /**
     * Get skin url
     */
    get url(): string {
        return `${this.options.getEndpoint()}/texture/${this.id}.png`;
    }

    /**
     * Get skin renders
     */
    get renders(): RendersContext {
        const { options, client, api } = this;

        return new RendersContext({
            skin: this.id,
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
        return this.#extended;
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
        return this.client.post('/transform-skin', `skin=${this.id}&transformation=${transformation}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                origin: 'https://ru.namemc.com'
            }
        })
            .then(({ request }) => {
                const [, hash] = (request?.res?.responseUrl || request.responseURL).match(skinRegExp);

                if (!hash) {
                    throw new WrapperError('NO_USEFUL');
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
                    new WrapperError('NOT_FOUND', this.id)
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

        this.payload = await this.client.get<string>(`/skin/${this.id}`)
            .then(({ data }) => {
                const skin = new SkinContext({
                    ...this,
                    data,
                    isExtended: true,
                    payload: {
                        name: this.name
                    }
                });

                if (!skin.id) {
                    throw new WrapperError('NO_USEFUL');
                }

                return skin;
            });

        this.setupPayload();

        this.#extended = true;
    }

    /**
     * @hidden
     */
    #parseSkin($: CheerioAPI, data?: ISkinContextOptions['data'], isExtended?: true): Pick<SkinContext, 'id' | 'model'> & Partial<Pick<SkinContext, 'name'>>;
    #parseSkin($: CheerioAPI, data?: ISkinContextOptions['data'], isExtended?: false): Pick<SkinContext, 'id' | 'model' | 'name'>;
    #parseSkin($: CheerioAPI, data?: ISkinContextOptions['data'], isExtended?: ISkinContextOptions['isExtended']): Pick<SkinContext, 'id' | 'model'> & Partial<Pick<SkinContext, 'name'>> {
        if (isExtended) {
            const { attribs: { 'data-id': id, 'data-model': model } } = $('.skin-3d')
                .get(0);

            return {
                id,
                model: model as Model
            };
        } else {
            const cardLinkHash = ((data as  Element)?.parent as Element)?.attribs.href
                .replace(skinRegExp, '$1');

            const cardHeader = ((data as Element)?.parent?.children as Element[])
                .filter(({ name, attribs: { class: className = '' } = {} }) => (
                    name === 'div' && className.includes('card-header')
                ))[0];
            const cardName = cardHeader ?
                ((cardHeader as Element).children[0] as unknown as Text)?.data as string
                :
                '';

            const $ = cheerio.load(data!);

            const { attribs: { 'data-src': src } } = $('div > img.drop-shadow')
                .get(0);

            const skin = SkinContext.parseSkinLink(src);

            return {
                id: cardLinkHash,
                name: cardName,
                model: Model.UNKNOWN,
                ...skin
            };
        }
    }

    /**
     * @hidden
     */
    static parseSkinLink(link: string): Pick<SkinContext, 'id' | 'model'> | void {
        const { searchParams, host } = new URL(link);

        const id = searchParams.get('id');

        if (id) {
            if (RendersContext.DOMAIN !== host) {
                RendersContext.DOMAIN = host;
            }

            return {
                id,
                model: searchParams.get('model') as Model || Model.UNKNOWN
            };
        }
    }

    /**
     * @hidden
     */
    #parseSkinCounters($: CheerioAPI): Pick<SkinContext, 'rating' | 'favorite'> | void {
        const ratingElement = $('.position-absolute.bottom-0.right-0.text-muted')
            .get(0)
            ?.children;

        if (!ratingElement) {
            return;
        }

        const [{ data: favoriteCount }, , { data: rating }] = ratingElement as unknown as Text[];

        return {
            rating: parseInt(rating),
            favorite: parseInt(favoriteCount)
        };
    }

    /**
     * @hidden
     */
    #parseSkinTime($: CheerioAPI): number {
        const { attribs: { title } } = $('.position-absolute.bottom-0.left-0.text-muted.title-time')
            .get(0);

        return convertDate(title);
    }

    #parseSkinTags($: CheerioAPI): SkinContext['tags'] {
        return $('div.card-body.text-center.py-1 > a.badge.badge-pill')
            .map((index, element) => {
                // @ts-ignore
                const { children: [{ data: tag }] } = element;

                return tag;
            })
            .get();
    }

    /**
     * @hidden
     */
    [kSerializeData](): any {
        return pickProperties(this, [
            'id',
            'name',
            'url',
            'model',
            'isSlim',
            'transformation',
            'isTransformed',
            'renders',
            'tags',
            'rating',
            'favorite',
            'createdAt'
        ]);
    }
}
