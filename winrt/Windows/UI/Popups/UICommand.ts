// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:09 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IUICommand } from "./IUICommand";
import { UICommandInvokedHandler } from "./UICommandInvokedHandler";

@GenerateShim('Windows.UI.Popups.UICommand')
export class UICommand implements IUICommand {
    label: string = null;
    invoked: UICommandInvokedHandler = null;
    id: any = null;
    // constructor();
    // constructor(label: string);
    // constructor(label: string, action: UICommandInvokedHandler);
    // constructor(label: string, action: UICommandInvokedHandler, commandId: any);
    constructor(label: string = null, action: UICommandInvokedHandler = null, commandId: any = null) {
        this.label = label;
        this.invoked = action;
        this.id = commandId;
    }
}