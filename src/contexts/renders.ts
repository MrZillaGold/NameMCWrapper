import { Context } from "./context";

import { applyPayload, steveSkinHash, kSerializeData, pickProperties } from "../utils";

import { IRendersContext, IRendersContextOptions, Model } from "../interfaces";

export class RendersContext extends Context {

    readonly skin: IRendersContextOptions["skin"] = steveSkinHash;
    readonly cape: IRendersContextOptions["cape"] = "";
    readonly model: IRendersContextOptions["model"] = Model.UNKNOWN;
    readonly width: IRendersContextOptions["width"] = 600;
    readonly height: IRendersContextOptions["height"] = 300;
    readonly scale: IRendersContextOptions["scale"] = 4;
    readonly overlay: IRendersContextOptions["overlay"] = true;
    readonly theta: IRendersContextOptions["theta"] = 30;
    readonly phi: IRendersContextOptions["phi"] = 20;
    readonly time: IRendersContextOptions["time"] = 90;
    readonly shadow_color: IRendersContextOptions["shadow_color"] = "000";
    readonly shadow_radius: IRendersContextOptions["shadow_radius"] = 0;
    readonly shadow_x: IRendersContextOptions["shadow_x"] = 0;
    readonly shadow_y: IRendersContextOptions["shadow_y"] = 0;

    protected endpoint = this.options.getEndpoint({ subdomain: "render" });

    constructor({ options, client, payload, api, ...rendersOptions }: IRendersContextOptions) {
        super({
            options,
            client,
            payload,
            api
        });

        applyPayload(this, rendersOptions);
    }

    get body(): IRendersContext["body"] {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { endpoint, options, client, api, payload, ...params } = this;

        const front = `${endpoint}/skin/3d/body.png?${new URLSearchParams(params as unknown as Record<string, string>)}`;

        return {
            front,
            front_and_back: `${front}&front_and_back=true`
        };
    }

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
