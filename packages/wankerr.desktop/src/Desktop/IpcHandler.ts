import { IpcMainEvent, IpcMessageEvent } from "electron";
import { IpcRequest } from "../../../../winrt-node/IpcRequest";
import { CoreWindow } from "./CoreWindow";

export interface IpcHandler {
    name: string;
    handle(event: IpcMessageEvent, request: IpcRequest): void;
}

export abstract class BaseIpcHandlder implements IpcHandler {

    constructor(name: string, window: CoreWindow) {
        this.name = name;
        this.window = window;
    }

    name: string;
    window: CoreWindow;

    handle(event: IpcMessageEvent, request: IpcRequest): void {
        if (!request.responseChannel) {
            request.responseChannel = `${this.name}_rtx`;
        }

        this.handleCore(event, request);
    }

    abstract handleCore(event: IpcMessageEvent, request: IpcRequest);
}