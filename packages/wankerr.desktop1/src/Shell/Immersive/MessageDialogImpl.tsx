import { BaseIpcHandlder } from "../IpcHandler";
import { IpcRequest } from "winrt/Windows/Foundation/Interop/IpcRequest";
import { IpcMainEvent, IpcMessageEvent } from "electron";
import { CoreWindow } from "./CoreWindow";
import jsx from "jsx-no-react";
import "./message-dialog.css"
import { MessageDialogV1, MessageDialogV2 } from "winrt/Windows/Foundation/Interop/IpcConstants";

export interface MessageDialogRequest {
    title: string,
    content: string;
    commands: Array<any>
}

export class MessageDialogHandler extends BaseIpcHandlder {
    constructor(v2: boolean, window: CoreWindow) {
        super(v2 ? MessageDialogV2 : MessageDialogV1, window);
    }

    handleCore(event: IpcMessageEvent, request: IpcRequest) {
        let windowRoot = this.window.root ?? document.body;
        let frame = this.window.frame;

        if (windowRoot.querySelectorAll(".message-dialog-container").length != 0) {
            // winrt also does this
            frame.send(request.responseChannel, { message: "Can only open one MessageDialog at a time!", status: "error" })
            return;
        }

        let containerRoot = <div className="message-dialog-container"></div>
        let closeDialog = (c) => {
            frame.send(request.responseChannel, { commandId: c.id, status: "success" });
            windowRoot.removeChild(containerRoot);
        }

        let titleClass = "message-dialog-title " + (request.data.title ? "visible" : "hidden");
        let contentClass = "message-dialog-content " + (request.data.content ? "visible" : "hidden");
        let buttons = [];
        let commands = request.data.commands as Array<any>;
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            const classList = i === (commands.length - 1) ? "message-dialog-button primary" : "message-dialog-button";
            buttons.push(<button innerText={command.label} classList={classList} onclick={() => { closeDialog(command); }} />)
        }

        let containerContent = (
            <div className="message-dialog-root">
                <div className="message-dialog-content-root">
                    <h1 className={titleClass}>{request.data.title}</h1>
                    <pre className={contentClass}>{request.data.content}</pre>
                    <div className="message-dialog-button-container">{buttons}</div>
                </div>
            </div>)

        containerRoot.appendChild(containerContent);
        windowRoot.appendChild(containerRoot);
    }
}