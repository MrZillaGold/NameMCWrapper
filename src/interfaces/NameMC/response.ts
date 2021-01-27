import { Model } from "./skin";

export interface IResponse {
    hash: string;
}

export interface ISkinResponse extends IResponse  {
    model: Model;
    rating?: number;
    type: "skin";
}

export interface ICapeResponse extends IResponse  {
    type: "cape";
}
