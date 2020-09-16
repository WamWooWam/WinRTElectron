import { BaseIpcHandlder } from "./IpcHandler";
import { IpcRequest } from "winrt-node/IpcRequest";
import { IpcMainEvent, IpcMessageEvent } from "electron";
import { CoreWindow } from "./CoreWindow";
import jsx from "jsx-no-react";
import "./message-dialog.css"

export interface MessageDialogRequest {
    title: string,
    content: string;
    commands: Array<any>
}

export class MessageDialogHandler extends BaseIpcHandlder {
    constructor(window: CoreWindow) {
        super("message-dialog", window);
    }

    handleCore(event: IpcMessageEvent, request: IpcRequest) {
        let windowRoot = this.window.root ?? document.body;
        let frame = this.window.frame;

        if (windowRoot.querySelectorAll(".message-dialog-container").length != 0) {
            // winrt also does this
            frame.send(request.responseChannel, { message: "Can only open one MessageDialog at a time!", status: "error" })
            return;
        }

        let closeDialog = (c) => {
            frame.send(request.responseChannel, { commandId: c.id, status: "success" });
            windowRoot.removeChild(containerRoot.element);
        }

        let titleClass = "message-dialog-title " + request.data.title ? "visible" : "hidden";
        let contentClass = "message-dialog-content " + request.data.content ? "visible" : "hidden";
        let buttons = [];
        for (const command of (request.data.commands as Array<any>)) {
            buttons.push(<a innerText={command.label} classList="message-dialog-button" onclick={() => { closeDialog(command); }} />)
        }

        let containerRoot = <div className="message-dialog-container">
            <div className="message-dialog-root">
                <div className="message-dialog-content-root">
                    <h1 classList={titleClass}>{request.data.title}</h1>
                    <pre classList={contentClass}>{request.data.content}</pre>
                    <div className="message-dialog-button-container">{buttons}</div>
                </div>
            </div>
        </div>

        windowRoot.appendChild(containerRoot);
    }
}