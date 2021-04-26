import { Nickname } from "./contexts";

export interface IGetSkinHistoryOptions {
    nickname: Nickname;
    page?: number;
}

export type Tab = "trending" | "new" | "random" | "tag";
export type Section = "daily" | "weekly" | "monthly" | "top" | string | undefined;

export interface IGetSkinsOptions<T, S, P> {
    tab?: T;
    section?: S;
    page?: P;
}
