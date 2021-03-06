/// <ref src="Windows.Foundation.ts"/>
/// <ref src="Windows.ApplicationModel.ts"/>

import { ApplicationModel } from "./Windows.ApplicationModel"
import { EventTarget } from "./Windows.Foundation";
import { isInWWA } from "./util";
import { ipcRenderer, TouchBarScrubber } from "electron";

export namespace UI.WebUI {
    export class WebUIApplication {
        private static source: EventTarget;

        static onWindowMessage(ev: MessageEvent) {

        }

        static init() {
            if (WebUIApplication.source == null) {
                WebUIApplication.source = new EventTarget();               
            }

            ipcRenderer.on("WinRTLifecycle", function (ev, ...data) {
                if (data[0] === "activated") {
                    WebUIApplication.dispatchEvent(new WebUILaunchActivatedEvent(ApplicationModel.Activation.ActivationKind.launch))
                }

                if (data[0] === "suspending") {
                    WebUIApplication.dispatchEvent(new SuspendingEvent())
                }

                if (data[0] === "resuming") {
                    WebUIApplication.dispatchEvent(new Event("resuming"))
                }
            })
        }

        static addEventListener(event: string, handler: EventListenerOrEventListenerObject) {
            console.log("adding event handler for: " + event)

            WebUIApplication.source.addEventListener(event, handler);
        }

        static removeEventListener(event: string, handler: EventListenerOrEventListenerObject) {
            console.log("removing event handler for: " + event)
            WebUIApplication.source.removeEventListener(event, handler);
        }

        static dispatchEvent(ev: Event) {
            console.log("dispatching: " + ev.type)
            WebUIApplication.source.dispatchEvent(ev)
        }
    }

    export class ActivatedDeferral {
        complete() {

        }
    }

    export class ActivatedOperation {
        getDeferral() {
            return new ActivatedDeferral();
        }
    }

    export class SuspendingOperation {
        getDeferral() {
            return new ActivatedDeferral();
        }
    }

    export class WebUILaunchActivatedEventArgs {
        activatedOperation: ActivatedOperation;

        public constructor(operation: ActivatedOperation) {
            this.activatedOperation = operation;
        }
    }

    export class SuspendingEventArgs {
        activatedOperation: ActivatedOperation;

        public constructor(operation: ActivatedOperation) {
            this.activatedOperation = operation;
        }
    }

    export class WebUILaunchActivatedEvent extends Event {
        public readonly kind: number;
        public readonly activatedOperation: ActivatedOperation;
        public readonly detail: WebUILaunchActivatedEventArgs[];
        public readonly splashScreen: ApplicationModel.Activation.SplashScreen;

        constructor(kind: ApplicationModel.Activation.ActivationKind) {
            super("activated")

            this.kind = kind;
            this.activatedOperation = new ActivatedOperation();
            this.detail = [new WebUILaunchActivatedEventArgs(this.activatedOperation)]
            this.splashScreen = new ApplicationModel.Activation.SplashScreen();
        }

    }

    export class SuspendingEvent extends Event {
        public readonly kind: number;
        public readonly suspendingOperation: SuspendingOperation;
        public readonly detail: SuspendingEventArgs[];

        constructor() {
            super("suspending")
            this.suspendingOperation = new SuspendingOperation();
            this.detail = [new SuspendingEventArgs(this.suspendingOperation)]
        }
    }
}

UI.WebUI.WebUIApplication.init();