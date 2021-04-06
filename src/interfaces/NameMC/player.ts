import { ISkin } from "./skin";
import { ICape } from "./cape";
import { IFriend } from "../API/friend";
import { INickname } from "./nickname";

export type BasePlayerInfo = Omit<IPlayer, "skins" | "capes" | "friends">;

export interface IPlayer {
    uuid: string;
    username: string;
    views: number;
    link: string;
    skins: ISkin[];
    capes: ICape[];
    friends: IFriend[];
    names: INickname[];
}
