import { Model } from "./contexts";

export interface IOptions {
    proxy?: string;
    rendersIgnoreProxy?: boolean;
    defaultSkinsModel?: Exclude<Model, "unknown">;
}

export interface IGetEndpointOptions {
    subdomain?: string;
    domain?: string;
}
