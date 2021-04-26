import { Context } from "./context";

import { kSerializeData, pickProperties } from "../utils";

import { CapeHash, CapeName, CapeType, ICapeContext, ICapeContextOptions } from "../interfaces";

export class CapeContext extends Context implements ICapeContext {

    readonly hash: ICapeContext["hash"];

    protected endpoint = this.options.getEndpoint();

    constructor({ hash, ...options }: ICapeContextOptions) {
        super(options);

        this.hash = hash;
    }

    get url(): ICapeContext["url"] {
        return `${this.endpoint}/texture/${this.hash}.png`;
    }

    get type(): ICapeContext["type"] {
        return Object.values(CapeHash)
            .includes(this.hash as CapeHash) ?
            CapeType.MINECRAFT
            :
            CapeType.OPTIFINE;
    }

    get name(): ICapeContext["name"] {
        const cape = new Map(
            Object.entries(CapeHash)
                .map((entry) => entry.reverse() as [string, string])
        )
            .get(this.hash);

        if (cape) {
            const capeName = new Map(
                Object.entries(CapeName)
            )
                .get(cape);

            return capeName as CapeName;
        }

        return CapeName.OPTIFINE;
    }

    [kSerializeData](): ICapeContext {
        return pickProperties(this, [
            "hash",
            "url",
            "name",
            "type"
        ]);
    }
}
