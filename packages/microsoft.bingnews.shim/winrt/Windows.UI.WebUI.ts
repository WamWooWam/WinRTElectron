/// <ref src="Windows.Foundation.ts"/>
/// <ref src="Windows.ApplicationModel.ts"/>

import { ApplicationModel } from "./Windows.ApplicationModel"
import { EventTarget } from "./Windows.Foundation";
import { isInWWA } from "./util";

export namespace UI.WebUI {
    export class WebUIApplication {
        private static source: EventTarget;

        static onWindowMessage(ev: MessageEvent) {
            if (ev.data.target === "Windows.UI.WebUI.WebUIApplication") {
                if (ev.data.event === "activated") {
                    WebUIApplication.dispatchEvent(new WebUILaunchActivatedEvent(ApplicationModel.Activation.ActivationKind.launch))
                }

                if (ev.data.event === "suspending") {
                    WebUIApplication.dispatchEvent(new SuspendingEvent())
                }

                if (ev.data.event === "resuming") {
                    WebUIApplication.dispatchEvent(new Event("resuming"))
                }
            }
        }

        static init() {
            if (WebUIApplication.source == null) {
                WebUIApplication.source = new EventTarget();

                if (!isInWWA()) {
                    self.addEventListener("DOMContentLoaded", () => {
                        setTimeout(() => {
                            WebUIApplication.dispatchEvent(new WebUILaunchActivatedEvent(ApplicationModel.Activation.ActivationKind.launch))
                        }, 1000);
                    })
                }
            }

            self.addEventListener("message", WebUIApplication.onWindowMessage);
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

        constructor(kind: ApplicationModel.Activation.ActivationKind) {
            super("activated")

            this.kind = kind;
            this.activatedOperation = new ActivatedOperation();
            this.detail = [new WebUILaunchActivatedEventArgs(this.activatedOperation)]
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