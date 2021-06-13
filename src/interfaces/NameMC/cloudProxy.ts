export interface ICloudProxyResponse {
    status: "ok" | "warning" | "error";
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
    cookies: ICloudProxyCookie[];
    userAgent: string;
}

export interface ICloudProxyCookie {
    name: string;
    value: string;
    url?: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax";
}
