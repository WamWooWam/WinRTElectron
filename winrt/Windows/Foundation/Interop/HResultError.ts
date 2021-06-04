export class HResultError extends Error {
    number: number;
    constructor(message: string, hresult: number){
        super(message);
        this.number = hresult;
    }
}