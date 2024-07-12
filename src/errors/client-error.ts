export class ClientError extends Error {
    message : string;
    statusCode : number;
    
    constructor(message : string, statusCode : number = 500) {
        super();
        this.message    = message;
        this.statusCode = statusCode;
    }    
}