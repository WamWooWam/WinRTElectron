
import { AsyncOperationCompletedHandler } from "./AsyncOperationCompletedHandler`1";
import { IAsyncInfo } from "./IAsyncInfo";
export * from "./Interop/AsyncOperation`1"

export interface IAsyncOperation<TResult> extends IAsyncInfo {
    completed: AsyncOperationCompletedHandler<TResult>;
    getResults(): TResult;
}