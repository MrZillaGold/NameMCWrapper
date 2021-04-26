import * as cheerio from "cheerio";

import { IContextOptions } from "./context";
import { IRendersContext } from "./renders";
import Element = cheerio.Element;

export interface ISkinContextOptions extends IContextOptions<ISkinContext> {
    data?: string | Element | Element[];
    type?: "extended";
}

export enum Model {
    UNKNOWN = "unknown",
    CLASSIC = "classic",
    SLIM = "slim"
}
export type Hash = string;

export interface ISkinContext {
    hash: Hash;
    model: Model;
    url: string;
    transformation: Transformation | null;
    renders: IRendersContext;
    rating: number;
    name: string;
    tags: string[];
    createdAt: number;
}

export type Transformation = "grayscale" | "invert" | "rotate-hue-180" | "rotate-head-left" | "rotate-head-right" | "hat-pumpkin-mask-1" | "hat-pumpkin-mask-2" | "hat-pumpkin-mask-3" | "hat-pumpkin-mask-4" | "hat-pumpkin" | "hat-pumpkin-creeper" | "hat-santa";

export interface ITransformSkinOptions {
    skin: Hash;
    transformation?: Transformation;
    model?: Model;
}
