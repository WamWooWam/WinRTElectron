import { AsyncOperationProgressHandler } from "../AsyncOperationProgressHandler`2";
import { AsyncOperationWithProgressCompletedHandler } from "../AsyncOperationWithProgressCompletedHandler`2";
import { IAsyncOperationWithProgress } from "../IAsyncOperationWithProgress`2";

export class AsyncOperationWithProgress<TResult, TProgress> extends Promise<TResult> implements IAsyncOperationWithProgress<TResult, TProgress> {
    progress: AsyncOperationProgressHandler<TResult, TProgress>;
    completed: AsyncOperationWithProgressCompletedHandler<TResult, TProgress>;
    getResults(): TResult {
        return null;
    }

    constructor(executor: (resolve: (value: TResult | PromiseLike<TResult>) => void, reject: (reason?: any) => void) => void) {
        super(executor);
    }

    done(onComplete: any, onError: any, onProgress: any) {
        this.then(onComplete, onError);
    }

    static from<TResult, TProgress>(promise: () => Promise<TResult>) {
        return new AsyncOperationWithProgress<TResult, TProgress>((res, rej) => promise().then(res, rej));
    }

    static to<TResult, TProgress>(action: IAsyncOperationWithProgress<TResult, TProgress>): Promise<TResult> {
        return new Promise<TResult>((res, rej) => (<any>action as PromiseLike<TResult>).then(res, rej));
    }
}