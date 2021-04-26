import { Nickname } from "../../NameMC";
import { IParams } from "./";

export interface IFriendsParams extends IParams {
    html?: boolean;
}

export interface IFriend {
    uuid: string;
    name: Nickname;
}
