import { applyPayload } from "./utils";

import { IGetEndpointOptions, IOptions } from "./interfaces";

export class Options implements IOptions {

    readonly proxy: IOptions["proxy"] = "";
    readonly rendersIgnoreProxy: IOptions["rendersIgnoreProxy"];
    readonly endpoint: IOptions["endpoint"] = "namemc.com";
    readonly defaultSkinsModel: IOptions["defaultSkinsModel"];

    constructor(options: IOptions) {
        const urlOptions: ("proxy" | "endpoint")[] = [
            "proxy",
            "endpoint"
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
        const { proxy, endpoint, rendersIgnoreProxy } = this;

        return `${rendersIgnoreProxy && subdomain === "render" ? "" : proxy ? `${proxy}/` : ""}https://${subdomain ? `${subdomain}.` : ""}${domain || endpoint}`;
    }
}
