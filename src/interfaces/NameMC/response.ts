import { Model } from "./skin";

export interface IResponse {
    hash: string;
}

export interface ISkinResponse extends IResponse  {
    type: "skin";
    model: Model;
    name?: string;
    rating?: number;
}

export interface ICapeResponse extends IResponse  {
    type: "cape";
}
