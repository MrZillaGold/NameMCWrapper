import { Model } from "./skin";

export interface IOptions {
    proxy?: string;
    rendersIgnoreProxy?: boolean;
    endpoint?: string;
    defaultSkinsModel?: Exclude<Model, "unknown">;
}
