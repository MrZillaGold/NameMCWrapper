export type MethodGroup = "profile" | "server";

export interface IRequestOptions {
    group: MethodGroup;
    target?: string;
    prop: string;
    params?: any;
}
