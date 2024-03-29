import { Context } from "./context";

import { steveSkinHash, kSerializeData, pickProperties } from "../utils";

import { IRendersContext, IRendersContextOptions, Model } from "../interfaces";

export class RendersContext extends Context<IRendersContext> implements IRendersContext {

    /**
     * Skin hash
     */
    readonly skin: IRendersContextOptions["skin"] = steveSkinHash;
    /**
     * Cape hash
     */
    readonly cape: IRendersContextOptions["cape"] = "";
    /**
     * Skin model
     */
    readonly model: IRendersContextOptions["model"] = Model.UNKNOWN;
    /**
     * Image render width
     */
    readonly width: IRendersContextOptions["width"] = 600;
    /**
     * Image render height
     */
    readonly height: IRendersContextOptions["height"] = 300;
    /**
     * Image render scale
     */
    readonly scale: IRendersContextOptions["scale"] = 4;
    /**
     * Show skin overlay
     */
    readonly overlay: IRendersContextOptions["overlay"] = true;
    /**
     * Model horizontal rotation angle
     */
    readonly theta: IRendersContextOptions["theta"] = 30;
    /**
     * Model vertical rotation angle
     */
    readonly phi: IRendersContextOptions["phi"] = 20;
    /**
     * Model animation time
     */
    readonly time: IRendersContextOptions["time"] = 90;
    /**
     * Model HEX shadow color
     *
     * @see {@link https://www.color-hex.com/ | HEX Color generator}
     */
    readonly shadow_color: IRendersContextOptions["shadow_color"] = "000";
    /**
     * Model shadow color
     */
    readonly shadow_radius: IRendersContextOptions["shadow_radius"] = 0;
    /**
     * Model horizontal shadow offset
     */
    readonly shadow_x: IRendersContextOptions["shadow_x"] = 0;
    /**
     * Model vertical shadow offset
     */
    readonly shadow_y: IRendersContextOptions["shadow_y"] = 0;

    /**
     * @hidden
     */
    protected endpoint = this.options.getEndpoint({ subdomain: "render" });

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
     * Get body render model
     */
    get body(): IRendersContext["body"] {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { endpoint, options, client, api, payload, ...params } = this;

        const front = `${endpoint}/skin/3d/body.png?${new URLSearchParams(params as unknown as Record<string, string>)}`;

        return {
            front,
            front_and_back: `${front}&front_and_back=true`
        };
    }

    /**
     * Get face render model url
     */
    get face(): IRendersContext["face"] {
        const { endpoint, skin, overlay, scale } = this;

        return `${endpoint}/skin/2d/face.png?skin=${skin}&overlay=${overlay}&scale=${scale}`;
    }

    [kSerializeData](): IRendersContext {
        return pickProperties(this, [
            "body",
            "face"
        ]);
    }
}
