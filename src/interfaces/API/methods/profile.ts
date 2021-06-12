import { Nickname } from "../../NameMC";
import { IParams } from "./";

export interface IFriendsParams extends IParams {
    /**
     * Return html instead array
     */
    html?: boolean;
}

export interface IFriend {
    /**
     * Player uuid
     */
    uuid: string;
    /**
     * Player nickname
     */
    name: Nickname;
}
