import { ISkin } from "./skin";
import { ICape } from "./cape";
import { IFriend } from "../API/friend";
import { INickname } from "./nickname";

export type BasePlayerInfo = Pick<IPlayer, "names" | "views" | "uuid" | "link">;

export interface IPlayer {
    uuid: string;
    views: number;
    link: string;
    skins: ISkin[];
    capes: ICape[];
    friends: IFriend[];
    names: INickname[];
}
