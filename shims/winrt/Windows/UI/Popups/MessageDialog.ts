
import { IpcHelper } from "../../../IpcHelper";
import { IVector } from "../../Foundation/Collections/IVector`1";
import { AsyncOperation, IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { MessageDialogV2 } from "../../Foundation/Interop/IpcConstants";
import { uuidv4 } from "../../Foundation/Interop/Utils";
import { Vector } from "../../Foundation/Interop/Vector`1";
import { IUICommand } from "./IUICommand";
import { MessageDialogOptions } from "./MessageDialogOptions";
import { UICommand } from "./UICommand";

interface MessageDialogResponse {
    status: string
    message: string
    commandId: number
}

@GenerateShim('Windows.UI.Popups.MessageDialog')
export class MessageDialog {
    private id: string;

    title: string = null;
    options: MessageDialogOptions = null;
    defaultCommandIndex: number = null;
    content: string = null;
    cancelCommandIndex: number = null;
    commands: Vector<IUICommand> = null;

    constructor(content: string, title: string = "") {
        this.id = uuidv4();
        this.content = content;
        this.title = title;
        this.commands = new Vector<UICommand>([]);
    }

    showAsync(): IAsyncOperation<IUICommand> {
        if (this.commands.size == 0) {
            this.commands.append(new UICommand("Close"));
        }

        for (let i = 0; i < this.commands.size; i++) {
            const el = this.commands.getAt(i);
            el.id = i;
        }

        let message = {
            title: this.title,
            content: this.content,
            commands: this.commands.getArray().map(c => { return { id: c.id, label: c.label } })
        };

        return AsyncOperation.from(async() => {
            let resp = await IpcHelper.send(MessageDialogV2, message) as MessageDialogResponse;
            
            if (resp.status === "success") {
                let command = this.commands.getAt(resp.commandId);
                if (command.invoked != null) {
                    command.invoked(command);
                }

                return command;
            }
            else {
                throw new Error(resp.status);
            }
        });
    }
}
