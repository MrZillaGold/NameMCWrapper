import { IContextOptions } from "./context";
import { Hash, Model } from "./skin";

export interface IRendersContextOptions extends IContextOptions<IRendersContext> {
    skin: Hash;
    cape?: Hash;
    model?: Model;
    width?: number;
    height?: number;
    theta?: number;
    phi?: number;
    time?: number;
    scale?: number;
    overlay?: boolean;
    shadow_color?: string;
    shadow_radius?: number;
    shadow_x?: number;
    shadow_y?: number;
}

export interface IRendersContext {
    body: {
        front: string;
        front_and_back: string;
    };
    face: string;
}
