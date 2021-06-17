import * as cheerio from "cheerio";

import { IContextOptions } from "./context";
import { IRendersContext } from "./renders";

export interface ISkinContextOptions extends IContextOptions<ISkinContext> {
    data?: string | cheerio.Element | cheerio.Element[];
    type?: "extended";
}

/**
 * Skin model type
 */
export enum Model {
    UNKNOWN = "unknown",
    CLASSIC = "classic",
    SLIM = "slim"
}
export type ModelUnion = "unknown" | "classic" | "slim";

export type Hash = string;

/**
 * Skin transformation type
 */
export enum Transformation {
    GRAYSCALE = "grayscale",
    INVERT = "invert",
    ROTATE_HUE_180 = "rotate-hue-180",
    ROTATE_HEAD_LEFT = "rotate-head-left",
    ROTATE_HEAD_RIGHT = "rotate-head-right",
    HAT_PUMPKIN_MASK_1 = "hat-pumpkin-mask-1",
    HAT_PUMPKIN_MASK_2 = "hat-pumpkin-mask-2",
    HAT_PUMPKIN_MASK_3 = "hat-pumpkin-mask-3",
    HAT_PUMPKIN_MASK_4 = "hat-pumpkin-mask-4",
    HAT_PUMPKIN = "hat-pumpkin",
    HAT_PUMPKIN_CREEPER =  "hat-pumpkin-creeper",
    HAT_SANTA = "hat-santa"
}
export type TransformationUnion =
    "grayscale"
    | "invert"
    | "rotate-hue-180"
    | "rotate-head-left"
    | "rotate-head-right"
    | "hat-pumpkin-mask-1"
    | "hat-pumpkin-mask-2"
    | "hat-pumpkin-mask-3"
    | "hat-pumpkin-mask-4"
    | "hat-pumpkin"
    | "hat-pumpkin-creeper"
    | "hat-santa";

export interface ISkinContext {
    /**
     * Skin hash
     */
    hash: Hash;
    /**
     * Skin model
     */
    model: Model | ModelUnion;
    /**
     * Skin url
     */
    url: string;
    /**
     * Skin transformation type
     */
    transformation: Transformation | TransformationUnion | null;
    /**
     * Skin renders
     */
    renders: IRendersContext;
    /**
     * Skin rating
     */
    rating: number;
    /**
     * Skin name
     */
    name: string;
    /**
     * Skin tags
     */
    tags: string[];
    /**
     * Skin creation timestamp
     */
    createdAt: number;
}

export interface ITransformSkinOptions {
    /**
     * Skin hash
     */
    skin: Hash;
    /**
     * Skin transformation type
     */
    transformation?: Transformation | TransformationUnion;
    /**
     * Skin model
     */
    model?: Model | ModelUnion;
}
