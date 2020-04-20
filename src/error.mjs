export default class WrapperError {

    constructor() {
        this.errors = [
            `Unknown error.\n$params`, // 0
            `Axios request error.\n$params`, // 1
            `Invalid Minecraft nickname. (/^[A-Za-z0-9_]{2,16}$/)`, // 2
            `Nickname $params does not exist.`, // 3
            `There is no useful information in the data received, if the problem repeats please report this to the Github issue.`, // 4
            `Skin hash $params does not exist.`, // 5
            `Invalid transformation type $params. Check available types in docs.`, // 6
            `The required parameters were not passed to the method. Check the necessary parameters in docs.` // 7
        ];
    }

    get(code, params) {
        const errors = this.errors;

        return {
            error:
                errors[code] ?
                    {
                        code,
                        reason: errors[code].replace("$params", params || "")
                    }
                    :
                    {
                        code: 0,
                        reason: errors[0]
                    }
        }
    }
}