import { Model, ModelUnion, RendersContext } from './contexts';

import { applyPayload } from './utils';

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
        /**
         * Session ID
         */
        session?: string;
        /**
         * Headers for requests
         */
        headers?: Record<string, any>;
        /**
         * Max request timeout
         */
        maxTimeout?: number;
        /**
         * Cookies for requests
         */
        cookies?: ICloudProxyResponse['cookies'];
    };
    /**
     * Ignore proxy url for renders
     */
    rendersIgnoreProxy?: boolean;
    /**
     * Model for skins by default, if an error occurred while trying to parse it
     */
    defaultSkinsModel?: Exclude<Model, 'unknown'> | Exclude<ModelUnion, 'unknown'>;
}

export interface IGetEndpointOptions {
    subdomain?: string;
    domain?: string;
}

export interface ICloudProxyResponse {
    status: 'ok' | 'warning' | 'error';
    message: string;
    startTimestamp: number;
    endTimestamp: number;
    version: string;
    solution: {
        url: string;
        status: number;
        headers: Record<string, any>;
        response: string;
    };
    cookies: {
        name: string;
        value: string;
        url?: string;
        domain?: string;
        path?: string;
        expires?: number;
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: 'Strict' | 'Lax';
    }[];
    userAgent: string;
}

export class Options implements IOptions {

    readonly proxy: IOptions['proxy'] = '';
    readonly cloudProxy: IOptions['cloudProxy'];
    readonly rendersIgnoreProxy: IOptions['rendersIgnoreProxy'];
    readonly endpoint = 'namemc.com';
    readonly defaultSkinsModel: IOptions['defaultSkinsModel'];

    constructor(options: IOptions) {
        const urlOptions = <const>[
            'proxy'
        ];

        urlOptions.forEach((option) => {
            const optionValue = options[option];

            if (optionValue?.endsWith('/')) {
                options[option] = optionValue.slice(0, optionValue.length - 1);
            }
        });

        applyPayload(this, options);
    }

    getEndpoint({ subdomain = '', domain = '' }: IGetEndpointOptions = {}): string {
        const { proxy, endpoint, rendersIgnoreProxy, cloudProxy } = this;

        const prefix =
            (rendersIgnoreProxy && domain === RendersContext.DOMAIN) ||
            (cloudProxy && proxy) ?
                ''
                : proxy ?
                    `${proxy}/`
                    :
                    '';

        return `${prefix}https://${subdomain ? `${subdomain}.` : ''}${domain || endpoint}`;
    }
}
