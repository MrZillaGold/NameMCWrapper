const errors = new Map([
    [0, "Unknown error."],
    [1, "Axios request error. $params"],
    [2, "Invalid Minecraft nickname."],
    [3, "Nickname $params does not exist."],
    [4, "There is no useful information in the data received, if the problem repeats please report this to the Github issue."],
    [5, "Skin hash $params does not exist."],
    [6, "Invalid argument type $params. Check available types in docs."],
    [7, "The required parameters were not passed to the method. Check the necessary parameters in docs."]
]);

export class WrapperError extends Error {

    constructor(code, params = "") {
        super(
            errors.get(code)
                .replace("$params", params)
        );

        this.code = code;
        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }

    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }

    toJSON() {
        return {
            ...this
        };
    }
}
