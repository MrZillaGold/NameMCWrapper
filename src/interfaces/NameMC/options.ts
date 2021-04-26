import { Model } from "./contexts";

export interface IOptions {
    proxy?: string;
    rendersIgnoreProxy?: boolean;
    endpoint?: string;
    defaultSkinsModel?: Exclude<Model, "unknown">;
}

export interface IGetEndpointOptions {
    subdomain?: string;
    domain?: string;
}
