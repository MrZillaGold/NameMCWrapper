export enum ErrorDescription {
    UNKNOWN = "Unknown error.",
    AXIOS = "Axios request error. $0",
    INVALID_NICKNAME = "$0 is invalid Minecraft nickname.",
    NOT_FOUND = "Resource $0 not found.",
    NO_USEFUL = "There is no useful information in the data received, try later report this to the Github issue.",
    SERVER_OFFLINE = "Server $0 offline."
}

export class WrapperError extends Error {

    code: number;
    name: string;

    constructor(error: keyof typeof ErrorDescription, params: string | string[] = []) {
        if (typeof params === "string") {
            params = [params];
        }

        const code = Object.keys(ErrorDescription).indexOf(error);

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
