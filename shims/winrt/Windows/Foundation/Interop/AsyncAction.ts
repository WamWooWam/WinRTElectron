import { AsyncActionCompletedHandler } from "../AsyncActionCompletedHandler";
import { IAsyncAction } from "../IAsyncAction";

export class AsyncAction extends Promise<void> implements IAsyncAction {
    completed: AsyncActionCompletedHandler;
    getResults(): void {

    }

    constructor(executor: (resolve: (value?: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => void) {
        super(executor);
    }

    done(onComplete: any, onError: any, onProgress: any) {
        this.catch(onError).then(onComplete);
    }

    cancel() {
        
    }

    static default() {
        return new AsyncAction((res, rej) => res());
    }

    static error(error: any = null) {
        return new AsyncAction((res, rej) => rej(error));
    }

    static from(promise: () => Promise<void>) {
        return new AsyncAction((res, rej) => promise().then(res, rej));
    }

    static to(action: IAsyncAction): Promise<void> {
        return new Promise((res, rej) => (<any>action as PromiseLike<void>).then(res, rej));
    }
}
