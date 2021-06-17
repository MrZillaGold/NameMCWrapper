import { IContextOptions } from "./context";
import { Hash, Model, ModelUnion } from "./skin";

export interface IRendersContextOptions extends IContextOptions<IRendersContext> {
    /**
     * Skin hash
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

export interface IRendersContext {
    /**
     * Body render model
     */
    body: {
        /**
         * Body front render model url
         */
        front: string;
        /**
         * Body front & back render model url
         */
        front_and_back: string;
    };
    /**
     * Face render model URL
     */
    face: string;
}
