import { inspectable } from "inspectable";

import { IContextOptions } from "../interfaces";

import { applyPayload, kSerializeData } from "../utils";

export class Context {

    readonly options: IContextOptions["options"];
    readonly client: IContextOptions["client"];
    readonly api: IContextOptions["api"];

    payload: IContextOptions["payload"];

    constructor({ options, client, api, payload }: IContextOptions) {
        this.options = options;
        this.client = client;
        this.api = api;
        this.payload = payload;
    }

    protected setupPayload(): void {
        if (this.payload) {
            applyPayload(this, this.payload);
        }
    }

    toJSON(): any {
        return this[kSerializeData]();
    }

    [kSerializeData](): any {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { options, client, ...payload } = this;

        return payload;
    }
}

inspectable(Context, {
    serialize: (instance) => instance.toJSON(),
    stringify: (instance, payload, context): string => (
        `${context.stylize(instance.constructor.name, "special")} ${context.inspect(payload)}`
    )
});
