import { AxiosInstance } from "axios";

import { Options } from "../../../Options";
import { API } from "../../../API";

export interface IContextOptions<P = any | void> {
    options: Options;
    client: AxiosInstance;
    api: API;
    payload?: {
        [K in keyof P]?: P[keyof P];
    };
}
