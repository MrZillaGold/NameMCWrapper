export type Nickname = string;

export interface INickname {
    nickname: Nickname;
    changed_at: string | null;
    timestamp: number | null;
}
