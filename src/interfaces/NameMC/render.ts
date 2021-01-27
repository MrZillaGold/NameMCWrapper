import { Model } from "./skin";

export interface IRender {
    body: {
        front: string;
        front_and_back: string;
    };
    face: string;
}

export interface IGetRendersOptions {
    skin: string;
    model?: Model;
    width?: number;
    height?: number;
    theta?: number;
    phi?: number;
    time?: number;
    scale?: number;
    overlay?: boolean;
}
