export class CustomException extends Error {
    constructor(message: any) {
        super(message);
        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }
}
