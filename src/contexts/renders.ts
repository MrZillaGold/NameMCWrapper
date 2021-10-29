import { Context, IContextOptions } from './context';
import { Model, ModelUnion } from './skin';
import { Hash } from './player';

import { steveSkinHash, kSerializeData, pickProperties } from '../utils';

export interface IRendersContextOptions extends IContextOptions<RendersContext> {
    /**
     * Skin id
     */
    skin: Hash;
    /**
     * Cape hash
     */
    cape?: Hash;
    /**
     * Skin model
     */
    model?: Model | ModelUnion;
    /**
     * Image render width
     */
    width?: number;
    /**
     * Image render height
     */
    height?: number;
    /**
     * Model horizontal rotation angle
     */
    theta?: number;
    /**
     * Model vertical rotation angle
     */
    phi?: number;
    /**
     * Model animation time
     */
    time?: number;
    /**
     * Image render scale
     */
    scale?: number;
    /**
     * Show skin overlay
     */
    overlay?: boolean;
    /**
     * Model HEX shadow color
     *
     * @see {@link https://www.color-hex.com/ | HEX Color generator}
     */
    shadow_color?: string;
    /**
     * Model shadow color
     */
    shadow_radius?: number;
    /**
     * Model horizontal shadow offset
     */
    shadow_x?: number;
    /**
     * Model vertical shadow offset
     */
    shadow_y?: number;
}

export class RendersContext extends Context<RendersContext> {

    /**
     * Skin id
     */
    readonly skin: IRendersContextOptions['skin'] = steveSkinHash;
    /**
     * Cape hash
     */
    readonly cape: IRendersContextOptions['cape'] = '';
    /**
     * Skin model
     */
    readonly model: IRendersContextOptions['model'] = Model.UNKNOWN;
    /**
     * Image render width
     */
    readonly width: IRendersContextOptions['width'] = 600;
    /**
     * Image render height
     */
    readonly height: IRendersContextOptions['height'] = 300;
    /**
     * Image render scale
     */
    readonly scale: IRendersContextOptions['scale'] = 4;
    /**
     * Show skin overlay
     */
    readonly overlay: IRendersContextOptions['overlay'] = true;
    /**
     * Model horizontal rotation angle
     */
    readonly theta: IRendersContextOptions['theta'] = 30;
    /**
     * Model vertical rotation angle
     */
    readonly phi: IRendersContextOptions['phi'] = 20;
    /**
     * Model animation time
     */
    readonly time: IRendersContextOptions['time'] = 90;
    /**
     * Model HEX shadow color
     *
     * @see {@link https://www.color-hex.com/ | HEX Color generator}
     */
    readonly shadow_color: IRendersContextOptions['shadow_color'] = '000';
    /**
     * Model shadow color
     */
    readonly shadow_radius: IRendersContextOptions['shadow_radius'] = 0;
    /**
     * Model horizontal shadow offset
     */
    readonly shadow_x: IRendersContextOptions['shadow_x'] = 0;
    /**
     * Model vertical shadow offset
     */
    readonly shadow_y: IRendersContextOptions['shadow_y'] = 0;

    /**
     * @hidden
     */
    protected endpoint = this.options.getEndpoint({ domain: 'r.n-mc.co' });

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
