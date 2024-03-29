// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { InvokeEvent } from "../../Foundation/Interop/InvokeEvent";
import { TypedEventHandler } from "../../Foundation/TypedEventHandler`2";
import { EdgeGestureEventArgs } from "./EdgeGestureEventArgs";
import { EdgeGestureKind } from "./EdgeGestureKind";

@GenerateShim('Windows.UI.Input.EdgeGesture')
export class EdgeGesture {
    static getForCurrentView(): EdgeGesture {
        return new EdgeGesture();
    }

    constructor() {
        document.addEventListener("mouseup", (ev) => {
            if (ev.button == 2) {
                var gesture = new EdgeGestureEventArgs();
                gesture.kind = EdgeGestureKind.mouse;
                InvokeEvent(this.#completed, "completed", gesture)
            }
        })

        document.addEventListener("keypress", (ev) => {
            if(ev.key == "k" && ev.ctrlKey) {
                var gesture = new EdgeGestureEventArgs();
                gesture.kind = EdgeGestureKind.keyboard;
                InvokeEvent(this.#completed, "completed", gesture)
            }
        })
    }

    #canceled: Set<TypedEventHandler<EdgeGesture, EdgeGestureEventArgs>> = new Set();
    @Enumerable(true)
    set oncanceled(handler: TypedEventHandler<EdgeGesture, EdgeGestureEventArgs>) {
        this.#canceled.add(handler);
    }

    #completed: Set<TypedEventHandler<EdgeGesture, EdgeGestureEventArgs>> = new Set();
    @Enumerable(true)
    set oncompleted(handler: TypedEventHandler<EdgeGesture, EdgeGestureEventArgs>) {
        this.#completed.add(handler);
    }

    #starting: Set<TypedEventHandler<EdgeGesture, EdgeGestureEventArgs>> = new Set();
    @Enumerable(true)
    set onstarting(handler: TypedEventHandler<EdgeGesture, EdgeGestureEventArgs>) {
        this.#starting.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'canceled':
                this.#canceled.add(handler);
                break;
            case 'completed':
                this.#completed.add(handler);
                break;
            case 'starting':
                this.#starting.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'canceled':
                this.#canceled.delete(handler);
                break;
            case 'completed':
                this.#completed.delete(handler);
                break;
            case 'starting':
                this.#starting.delete(handler);
                break;
        }
    }
}
