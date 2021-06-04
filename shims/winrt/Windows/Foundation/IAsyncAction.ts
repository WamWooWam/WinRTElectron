
import { AsyncActionCompletedHandler } from "./AsyncActionCompletedHandler";
import { IAsyncInfo } from "./IAsyncInfo";
export * from "./Interop/AsyncAction"

export interface IAsyncAction extends IAsyncInfo {
    completed: AsyncActionCompletedHandler;
    getResults(): void;
}
