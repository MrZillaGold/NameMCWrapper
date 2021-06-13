import { applyPayload } from "./utils";

import { IGetEndpointOptions, IOptions } from "./interfaces";

/**
 * @hidden
 */
export class Options implements IOptions {

    readonly proxy: IOptions["proxy"] = "";
    readonly cloudProxy: IOptions["cloudProxy"];
    readonly rendersIgnoreProxy: IOptions["rendersIgnoreProxy"];
    readonly endpoint = "namemc.com";
    readonly defaultSkinsModel: IOptions["defaultSkinsModel"];

    constructor(options: IOptions) {
        const urlOptions = <const>[
            "proxy"
        ];

        urlOptions.forEach((option) => {
            const optionValue = options[option];

            if (optionValue?.endsWith("/")) {
                options[option] = optionValue.slice(0, optionValue.length - 1);
            }
        });

        applyPayload(this, options);
    }

    getEndpoint({ subdomain = "", domain = "" }: IGetEndpointOptions = {}): string {
        const { proxy, endpoint, rendersIgnoreProxy, cloudProxy } = this;

        const prefix =
            (rendersIgnoreProxy && subdomain === "render")
            || (cloudProxy && proxy) ?
                ""
                : proxy ?
                    `${proxy}/`
                    :
                    "";

        return `${prefix}https://${subdomain ? `${subdomain}.` : ""}${domain || endpoint}`;
    }
}
