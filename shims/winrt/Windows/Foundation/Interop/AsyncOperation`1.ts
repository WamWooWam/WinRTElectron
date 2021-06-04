import { AsyncOperationCompletedHandler } from "../AsyncOperationCompletedHandler`1";
import { IAsyncOperation } from "../IAsyncOperation`1";

export class AsyncOperation<TResult> extends Promise<TResult> implements IAsyncOperation<TResult> {
    completed: AsyncOperationCompletedHandler<TResult>;
    getResults(): TResult {
        return null;
    }

    constructor(executor: (resolve: (value: TResult | PromiseLike<TResult>) => void, reject: (reason?: any) => void) => void) {
        super(executor);
    }

    done(onComplete: any, onError: any, onProgress: any) {
        this.then(onComplete, onError);
    }

    static from<TResult>(promise: () => Promise<TResult>) {
        return new AsyncOperation<TResult>((res, rej) => promise().then(res, rej));
    }

    static fromT<TResult>(promise: Promise<TResult>) {
        return new AsyncOperation<TResult>((res, rej) => promise.then(res, rej));
    }

    static to<TResult>(action: IAsyncOperation<TResult>): Promise<TResult> {
        return new Promise<TResult>((res, rej) => (<any>action as PromiseLike<TResult>).then(res, rej));
    }
}
