import { IContextOptions } from "./context";
import { Hash, Model, ModelUnion } from "./skin";

export interface IRendersContextOptions extends IContextOptions<IRendersContext> {
    skin: Hash;
    cape?: Hash;
    model?: Model | ModelUnion;
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
