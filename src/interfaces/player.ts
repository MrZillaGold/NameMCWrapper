import { ISkin } from "./skin";
import { ICape } from "./cape";
import { IFriend } from "./friend";
import { INickname } from "./nickname";

export interface IPlayer {
    skins: ISkin[],
    capes: ICape[],
    friends: IFriend[],
    names: INickname[]
}
