import { CoreWindow } from "./CoreWindow";
import { BaseIpcHandlder } from "./IpcHandler";
import { desktopCapturer, IpcMessageEvent } from "electron";
import { IpcRequest } from "../../../../winrt-node/IpcRequest";
import "./settings-pane.css"

enum MessageType {
    show,
    hide,
    requestContent,
    contentInvoked
}

export class SettingsPaneHandler extends BaseIpcHandlder {
    private rootElement: HTMLDivElement;
    private paneElement: HTMLDivElement;
    private contentElement: HTMLDivElement;
    private listElement: HTMLUListElement;

    constructor(window: CoreWindow) {
        super("settings-pane", window);
    }

    setup() { // TODO: adapt to other charms
        this.rootElement = document.createElement("div");
        this.rootElement.classList.add("charms-overlay");

        var app = this.window.app;
        var pack = this.window.pack;
        this.paneElement = document.createElement("div");
        this.paneElement.classList.add("charms-pane", "hidden");

        let header = document.createElement("h2");
        header.classList.add("charms-pane-header");
        header.innerText = "Settings";
        this.paneElement.appendChild(header);

        this.contentElement = document.createElement("div");
        this.contentElement.classList.add("charms-pane-content", "hidden");

        let infoText = document.createElement("div");
        infoText.classList.add("charms-pane-info-text");

        let displayNameText = document.createElement("p");
        displayNameText.innerText = app.visualElements.displayName;
        infoText.append(displayNameText);

        let publisherNameText = document.createElement("p");
        publisherNameText.innerText = `By ${pack.properties.publisherDisplayName}`;
        infoText.append(publisherNameText);
        this.contentElement.appendChild(infoText);

        this.listElement = document.createElement("ul");
        this.listElement.classList.add("charms-pane-list");
        this.contentElement.appendChild(this.listElement);

        this.paneElement.appendChild(this.contentElement);
        this.rootElement.addEventListener("mousedown", () => { this.hide() });
        this.paneElement.addEventListener("mousedown", (event: Event) => { event.cancelBubble = true; });
        this.rootElement.append(this.paneElement);
        this.window.root.appendChild(this.rootElement);
    }

    populateSettings(settings: any[]) {
        for (const item of settings) {
            let link = document.createElement("a");
            link.classList.add("settings-pane-item");
            link.innerText = item.label;
            link.addEventListener("click", () => { this.hide(); this.window.frame.send('settings-pane', { type: MessageType.contentInvoked, index: item.id }); });

            this.listElement.append(link);
        }
    }

    handleCore(event: IpcMessageEvent, request: IpcRequest) {
        let windowRoot = this.window.root ?? document.body;
        let frame = this.window.frame;

        if (request.data.type == MessageType.show) {
            this.show();
        }

        if (request.data.type == MessageType.requestContent) {
            this.contentElement.classList.remove("hidden");
            this.populateSettings(request.data.commands);
        }

        if (request.data.type == MessageType.hide) {
            this.hide();
        }
    }

    show() {
        this.paneElement.classList.remove("hidden");
        this.rootElement.classList.add("visible");
        if (this.contentElement.classList.contains("hidden")) {
            this.window.frame.send('settings-pane', { type: MessageType.requestContent });
        }
    }

    hide() {
        this.rootElement.classList.remove("visible");
        this.paneElement.classList.add("hidden");
    }
}