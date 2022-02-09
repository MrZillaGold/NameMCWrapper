import { Context, IContextOptions } from './context';
import { Model, ModelUnion } from './skin';
import { Hash } from './player';

import { steveSkinHash, kSerializeData, pickProperties } from '../utils';

type RenderOptions = Pick<RendersContext, 'skin'> & Partial<Omit<RendersContext, 'skin' | keyof IContextOptions>>;

export interface IRendersContextOptions extends IContextOptions<RenderOptions>, RenderOptions {}

export class RendersContext extends Context<RendersContext> {

    /**
     * Skin id
     */
    readonly skin: Hash = steveSkinHash;
    /**
     * Cape hash
     */
    readonly cape: Hash = '';
    /**
     * Skin model
     */
    readonly model: Model | ModelUnion = Model.UNKNOWN;
    /**
     * Image render width
     */
    readonly width: number = 600;
    /**
     * Image render height
     */
    readonly height: number = 300;
    /**
     * Image render scale
     */
    readonly scale: number = 4;
    /**
     * Show skin overlay
     */
    readonly overlay: boolean = true;
    /**
     * Model horizontal rotation angle
     */
    readonly theta: number = 30;
    /**
     * Model vertical rotation angle
     */
    readonly phi: number = 20;
    /**
     * Model animation time
     */
    readonly time: number = 90;
    /**
     * Model HEX shadow color
     *
     * @see {@link https://www.color-hex.com/ | HEX Color generator}
     */
    readonly shadow_color: string = '000';
    /**
     * Model shadow color
     */
    readonly shadow_radius: number = 0;
    /**
     * Model horizontal shadow offset
     */
    readonly shadow_x: number = 0;
    /**
     * Model vertical shadow offset
     */
    readonly shadow_y: number = 0;

    /**
     * @hidden
     */
    protected endpoint = this.options.getEndpoint({
        domain: RendersContext.DOMAIN
    });

    /**
     * NameMC renders domain
     */
    static DOMAIN = 'r.nmc1.net';

    /**
     * @hidden
     */
    constructor({ options, client, payload, api, ...rendersOptions }: IRendersContextOptions) {
        super({
            options,
            client,
            payload,
            api
        });

        this.payload = {
            ...this.payload,
            ...rendersOptions
        };

        this.setupPayload();
    }

    /**
     * Get body render models
     */
    get body(): ({
        /**
         * Body front render model url
         */
        front: string;
        /**
         * Body front & back render model url
         */
        front_and_back: string;
    }) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { endpoint, options, client, api, payload, ...params } = this;

        const front = `${endpoint}/skin/body.png?${new URLSearchParams(params as unknown as Record<string, string>)}`;

        return {
            front,
            front_and_back: `${front}&front_and_back=true`
        };
    }

    /**
     * Get face render model url
     */
    get face(): string {
        const { endpoint, skin, overlay, scale } = this;

        return `${endpoint}/skin/face.png?skin=${skin}&overlay=${overlay}&scale=${scale}`;
    }

    [kSerializeData](): any {
        return pickProperties(this, [
            'body',
            'face'
        ]);
    }
}
