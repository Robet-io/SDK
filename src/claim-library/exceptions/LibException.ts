import { CustomException } from "./CustomException";

export class LibException extends CustomException {
    constructor(message: any) {
        super(message);
    }
}
