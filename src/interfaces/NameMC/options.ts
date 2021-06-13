import { Model, ModelUnion } from "./contexts";
import { ICloudProxyCookie } from "./cloudProxy";

export interface IOptions {
    /**
     * Proxy url for requests
     * Support {@link https://github.com/NoahCardoza/CloudProxy | CloudProxy}
     */
    proxy?: string;
    /**
     * CloudProxy options for requests
     * NameMC often uses CloudFlare to protect against DDoS attacks
     * If you want the library to work at such times, you need to deploy your own Cloud Proxy instance
     *
     * @example
     * ```
     * new NameMC({
     *     proxy: "http://192.168.1.51:25565/v1" // CloudProxy URL
     *     cloudProxy: {}
     *     // CloudProxy options.
     *     // Optional.
     *     // To enable CloudProxy support, you cannot delete an object!
     * });
     * ```
     *
     * @see {@link https://github.com/NoahCardoza/CloudProxy | CloudProxy}
     * @see {@link https://github.com/NoahCardoza/CloudProxy#-requestget | CloudProxy Request Get options description}
     */
    cloudProxy?: {
        session?: string;
        headers?: Record<string, any>;
        maxTimeout?: number;
        cookies?: ICloudProxyCookie[];
    };
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
