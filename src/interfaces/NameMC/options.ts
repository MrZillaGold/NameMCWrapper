import { Model } from "./skin";

export interface IOptions {
    proxy?: string;
    endpoint?: string;
    defaultSkinsModel?: Exclude<Model, "unknown">;
}
