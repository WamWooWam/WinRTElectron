import { CoreWindow } from "./CoreWindow";
import { BaseIpcHandlder } from "./IpcHandler";
import { IpcMessageEvent } from "electron";
import { IpcRequest } from "../../../../winrt-node/IpcRequest";
import $d, { DOMBaseNode } from "../dom-tools"
import "./settings-pane.css"

enum MessageType {
    show,
    hide,
    requestContent,
    contentInvoked
}

export class SettingsPaneHandler extends BaseIpcHandlder {
    private rootElement: DOMBaseNode;
    private paneElement: DOMBaseNode;
    private contentElement: DOMBaseNode;
    private listElement: DOMBaseNode;

    constructor(window: CoreWindow) {
        super("settings-pane", window);
    }

    setup() { // TODO: adapt to other charms
        this.rootElement = $d("<div>")
            .addClass("charms-overlay")

        var app = this.window.app;
        var pack = this.window.pack;
        this.paneElement = $d("<div>")
            .addClass("charms-pane", "hidden")
            .append([
                $d("<h2>").addClass("charms-pane-header").text("Settings"),
                this.contentElement = $d("<div>")
                    .addClass("charms-pane-content", "hidden")
                    .append([
                        $d("<div>").addClass("charms-pane-info-text").append([
                            $d("<p>").text(app.visualElements.displayName),
                            $d("<p>").appendText(`By ${pack.properties.publisherDisplayName}`)
                        ]),
                        this.listElement = $d("<ul>").addClass("charms-pane-list")
                    ]),
            ]);

        this.rootElement.on("mousedown", () => { this.hide() });
        this.paneElement.on("mousedown", (event: Event) => { event.cancelBubble = true; });
        this.rootElement.append(this.paneElement);
        this.window.root.appendChild(this.rootElement.element);
    }

    populateSettings(settings: any[]) {
        let els = [];

        for (const item of settings) {
            els.push(
                $d("<a>")
                    .addClass("settings-pane-item")
                    .text(item.label)
                    .on("click", () => { this.hide(); this.window.frame.send('settings-pane', { type: MessageType.contentInvoked, index: item.id }); })
            );
        }

        this.listElement.append(els);
    }

    handleCore(event: IpcMessageEvent, request: IpcRequest) {
        let windowRoot = this.window.root ?? document.body;
        let frame = this.window.frame;

        if (request.data.type == MessageType.show) {
            this.show();
        }

        if (request.data.type == MessageType.requestContent) {
            this.contentElement.removeClass("hidden");
            this.populateSettings(request.data.commands);
        }

        if (request.data.type == MessageType.hide) {
            this.hide();
        }
    }

    show() {
        this.paneElement.removeClass("hidden");
        this.rootElement.addClass("visible");
        if (this.contentElement.hasClass("hidden")) {
            this.window.frame.send('settings-pane', { type: MessageType.requestContent });
        }
    }

    hide() {
        this.rootElement.removeClass("visible");
        this.paneElement.addClass("hidden");
    }
}