import { IRender } from "./render";
import { Nickname } from "./nickname";

export type Model = "classic" | "slim";
export type Hash = string;

export interface ISkin {
    url: string;
    renders: IRender;
    isSlim: boolean;
    hash: Hash;
    model: Model;
    rating: number;
}

export interface IGetSkinHistoryOptions {
    nickname: Nickname;
    page?: number;
}

export type Transformation = "grayscale" | "invert" | "rotate-hue-180" | "rotate-head-left" | "rotate-head-right" | "hat-pumpkin-mask-1" | "hat-pumpkin-mask-2" | "hat-pumpkin-mask-3" | "hat-pumpkin-mask-4" | "hat-pumpkin" | "hat-pumpkin-creeper" | "hat-santa";

export interface ITransformSkinOptions {
    skin: Hash;
    transformation?: Transformation;
    model?: Model;
}

export type Tab = "trending" | "new" | "random" | "tag";
export type Section = "daily" | "weekly" | "monthly" | "top" | string;

export interface IGetSkinsOptions {
    tab?: Tab;
    section?: Section;
    page?: number;
}
