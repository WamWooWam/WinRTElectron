import $d, { DOMBaseNode } from "../dom-tools"
import { BaseIpcHandlder } from "./IpcHandler";
import { IpcRequest } from "../../../../winrt-node/IpcRequest";
import { IpcMainEvent, IpcMessageEvent } from "electron";
import { CoreWindow } from "./CoreWindow";
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

        let dialogRoot: DOMBaseNode;

        let closeDialog = (c) => {
            frame.send(request.responseChannel, { commandId: c.id, status: "success" });
            windowRoot.removeChild(containerRoot.element);
        }

        let containerRoot = $d("<div>")
            .addClass("message-dialog-container")
            .append([
                dialogRoot = $d("<div>")
                    .addClass("message-dialog-root")
                    .append([
                        $d("<div>")
                            .addClass("message-dialog-content-root")
                            .append([
                                $d("<h1>")
                                    .addClass("message-dialog-title", request.data.title ? "visible" : "hidden")
                                    .text(request.data.title),
                                $d("<pre>")
                                    .addClass("message-dialog-content", request.data.content ? "visible" : "hidden")
                                    .text(request.data.content),
                                $d("<div>")
                                    .addClass("message-dialog-button-container")
                                    .append((request.data.commands as Array<any>).map(c => $d("<button>").text(c.label).addClass("message-dialog-button").click(() => { closeDialog(c); }, false))),
                            ])
                    ]),
            ])

        windowRoot.appendChild(containerRoot.element);
    }
}