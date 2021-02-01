import { Nickname } from "./nickname";

export interface IServerPreview {
    ip: string;
    title: string;
    icon: string;
    motd: {
        clear: string;
        html: string;
    };
    players: {
        online: number;
        max: number;
    };
    country: {
        name: string;
        image: string;
        emoji: string;
    } | null;
    rating: number;
}

export interface IServer extends IServerPreview {
    version: string;
    uptime: number;
}

export interface ICheckServerLikeOptions {
    ip: string;
    nickname: Nickname;
}
