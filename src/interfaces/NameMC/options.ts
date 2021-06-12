import { Model, ModelUnion } from "./contexts";

export interface IOptions {
    /**
     * Proxy url for requests
     */
    proxy?: string;
    /**
     * Ignore proxy url for renders
     */
    rendersIgnoreProxy?: boolean;
    /**
     * Model for skins by default, if an error occurred while trying to parse it
     */
    defaultSkinsModel?: Exclude<Model, "unknown"> | Exclude<ModelUnion, "unknown">;
}

export interface IGetEndpointOptions {
    subdomain?: string;
    domain?: string;
}
