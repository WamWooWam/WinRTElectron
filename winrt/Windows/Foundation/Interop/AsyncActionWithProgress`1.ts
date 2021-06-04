import { AsyncActionProgressHandler } from "../AsyncActionProgressHandler`1";
import { AsyncActionWithProgressCompletedHandler } from "../AsyncActionWithProgressCompletedHandler`1";
import { IAsyncActionWithProgress } from "../IAsyncActionWithProgress`1";

export class AsyncActionWithProgress<TProgress> extends Promise<void> implements IAsyncActionWithProgress<TProgress> {
    progress: AsyncActionProgressHandler<TProgress>;
    completed: AsyncActionWithProgressCompletedHandler<TProgress>;
    
    getResults(): void {
        
    }

    constructor(executor: (resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => void) {
        super(executor);
    }

    done(onComplete: any, onError: any, onProgress: any) {
        this.then(onComplete, onError);
    }

    static from<TProgress>(promise: () => Promise<void>) {
        return new AsyncActionWithProgress<TProgress>((res, rej) => promise().then(res, rej));
    }

    static to<TProgress>(action: IAsyncActionWithProgress<TProgress>): Promise<void> {
        return new Promise<void>((res, rej) => (<any>action as PromiseLike<void>).then(res, rej));
    }
}