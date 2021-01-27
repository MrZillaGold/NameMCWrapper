const errors: Map<number, string> = new Map([
    [0, "Unknown error."],
    [1, "Axios request error. $0"],
    [2, "Invalid Minecraft nickname."],
    [3, "Resource $0 does not exist."],
    [4, "There is no useful information in the data received, if the problem repeats please report this to the Github issue."],
    [5, ""],
    [6, "Invalid argument type $0. Check available types in docs."],
    [7, "The required parameters were not passed to the method. Check the necessary parameters in docs."]
]);

export class WrapperError extends Error {

    code: number;
    name: string;

    constructor(code: number, params: string[] = []) {
        let error = errors.get(code);

        params.forEach((param, index) => error = error?.replace(`$${index}`, param));

        super(error);

        this.code = code;
        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }

    get [Symbol.toStringTag](): string {
        return this.constructor.name;
    }

    toJSON(): object {
        return {
            ...this
        };
    }
}
