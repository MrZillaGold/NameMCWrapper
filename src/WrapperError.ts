export enum ErrorDescription {
    UNKNOWN = "Unknown error.",
    CLOUDFLARE = "NameMC uses CloudFlare, which blocks requests from bots. Use CloudProxy. Check out the README for more information.",
    INVALID_NICKNAME = "$0 is invalid Minecraft nickname.",
    NOT_FOUND = "Resource not found.",
    NO_USEFUL = "There is no useful information in the data received, try later report this to the Github issue.",
    SERVER_OFFLINE = "Server $0 offline."
}

/**
 * @hidden
 */
export class WrapperError extends Error {

    readonly code: keyof typeof ErrorDescription;
    readonly name: string;

    constructor(error: keyof typeof ErrorDescription, params: string | string[] = []) {
        if (!Array.isArray(params)) {
            params = [params];
        }

        const code = error;

        let description = ErrorDescription[error] as string;

        params.forEach((param, index) => description = description.replace(`$${index}`, param));

        super(description);

        this.code = code;
        this.name = this.constructor.name;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error()).stack;
        }
    }

    get [Symbol.toStringTag](): string {
        return this.constructor.name;
    }

    toJSON(): any {
        return this;
    }
}
