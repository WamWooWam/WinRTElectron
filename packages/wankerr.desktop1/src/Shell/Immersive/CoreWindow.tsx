import { PackageApplication } from "../PackageApplication";
import { Shell } from "../Shell"
import { createSplashElement } from "../Util";
import { WebviewTag, IpcMessageEvent, WillNavigateEvent, shell } from "electron";
import { MessageDialogHandler } from "./MessageDialogImpl";
import { SettingsPaneHandler, SettingsPaneV1Handler } from "./SettingsPane";
import { IpcHandler } from "../IpcHandler";
import { CharmsBar } from "./CharmsBar";
import { Package } from "../Package";

import { ActivationKind } from "winrt/Windows/ApplicationModel/Activation/ActivationKind"
import { AppLifecycleV1, AppLifecycleV2, SplashScreenV1, SplashScreenV2 } from "winrt/Windows/Foundation/Interop/IpcConstants"

import jsx from "jsx-no-react";
import * as _ from "lodash"
import "./core-window.css"
import "./splash-screen.css"

const electron = require('electron').remote.app

export interface ICoreWindowActivateArgs {
    args?: string,
    files?: string[]
}

export class CoreWindow {
    private _package: Package;
    private _app: PackageApplication;
    private _rootElement: HTMLElement;
    private _titleBarElement: HTMLDivElement;
    // private titleBarIconElement: HTMLImageElement;
    // private titleBarTitleElement: HTMLSpanElement;
    // private titleBarMinimiseButton: HTMLButtonElement;
    // private titleBarCloseButton: HTMLButtonElement;

    private _frame: WebviewTag;
    private _frameLoaded: boolean;
    private _splash: HTMLDivElement;
    private _suspended: boolean;
    private _titleBarVisible: boolean;
    private _ipcHandlers: IpcHandler[];
    private _settingsPane: SettingsPaneHandler;

    private static foreground: CoreWindow;
    private static rootElement: HTMLElement;
    private static mainWindowMap: Map<string, CoreWindow>;
    private static windowSet: Array<CoreWindow>;
    private _launchArgs: ICoreWindowActivateArgs;

    public static get windows() {
        CoreWindow.ensureRootElement();
        return CoreWindow.windowSet;
    }

    public get frame() {
        return this._frame;
    }

    public get root() {
        return this._rootElement;
    }

    public get app() {
        return this._app;
    }

    public get pack() {
        return this._package;
    }

    public get settingsPane() {
        return this._settingsPane;
    }

    public get title() {
        return this._app.visualElements.displayName; // for now
    }

    constructor(pack: Package, app: PackageApplication) {
        this.showTitlebar = this.showTitlebar.bind(this);
        this.hideTitlebar = this.hideTitlebar.bind(this);
        this.onCloseButtonClicked = this.onCloseButtonClicked.bind(this);
        this.onWindowMouseMoved = this.onWindowMouseMoved.bind(this);

        this._package = pack;
        this._app = app;
        this._titleBarVisible = false;
        this._rootElement = document.createElement("div");
        this._rootElement.classList.add("core-window");

        this._frame = document.createElement("webview");
        this._frame.nodeintegration = true;
        this._frame.nodeintegrationinsubframes = true;
        this._frame.disablewebsecurity = true;
        this._frame.webpreferences = "contextIsolation=no"
        this._frame.classList.add("core-window-frame");

        this._frame.addEventListener("did-start-loading", () => { this._frame.openDevTools() });
        this._frame.addEventListener("dom-ready", this.onFrameLoaded.bind(this));
        this._frame.addEventListener("ipc-message", this.onFrameMessage.bind(this));
        this._frame.addEventListener("will-navigate", this.onNavigating.bind(this));
        this._frame.addEventListener("crashed", this.onFrameCrashed.bind(this))
        this._settingsPane = new SettingsPaneHandler(this);

        this._ipcHandlers = [
            new MessageDialogHandler(true, this),
            new MessageDialogHandler(false, this),
            new SettingsPaneV1Handler(this._settingsPane),
            this._settingsPane
        ]

        this._splash = createSplashElement(app);
        this._titleBarElement =
            <div classList="core-window-titlebar">
                <div classList="core-window-icon-container" style={{ background: this._app.visualElements.backgroundColor }}>
                    <img classList="core-window-icon" src={app.visualElements.square30x30Logo} />
                </div>

                <div classList="core-window-title" innerText={this.title} />
                <button className="core-window-minimise" />
                <button className="core-window-close" onclick={this.onCloseButtonClicked} />
            </div>

        this._rootElement.appendChild(this._frame);
        this._rootElement.appendChild(this._splash);
        this._rootElement.appendChild(this._titleBarElement);
        this._rootElement.addEventListener("mousemove", this.onWindowMouseMoved);
        this._settingsPane.setup();

        CoreWindow.rootElement.appendChild(this._rootElement);
    }

    onCloseButtonClicked(ev: Event) {
        this.suspend();
        window.location.hash = "";
    }

    onWindowMouseMoved(ev: MouseEvent) {
        let x = ev.pageX;
        let y = ev.pageY;

        // console.log(y);

        if (this._titleBarVisible) {
            if (y > 30) {
                this.hideTitlebar();
            }
        }
        else {
            if (y <= 5) {
                this.showTitlebar();
            }
        }

        Shell.getInstance().charmsbar.notifyMouseMove(ev);
    }

    showTitlebar() {
        this._titleBarElement.classList.remove("hidden");
        this._titleBarVisible = true;
    }

    hideTitlebar() {
        this._titleBarElement.classList.add("hidden");
        this._titleBarVisible = false;
    }

    ensureVisible() {
        this._rootElement.style.zIndex = (++Shell.coreWindowZ).toString();
        this._rootElement.classList.remove("invisible");
    }

    activate(args: ICoreWindowActivateArgs) {
        this.ensureVisible();

        if (this._frame.src && this._frameLoaded) {
            this.doFadeOut(args);
            this._frame.setAudioMuted(false);
        }
        else {
            this._launchArgs = args;
            this._frame.src = this._app.startPage;
        }

        let taskbar = Shell.getInstance().taskbar;
        let hash = this._package.identity.name + "/" + this._app.id;
        if (window.location.hash != hash)
            window.location.hash = hash;

        let index = CoreWindow.windowSet.indexOf(this);
        if (index > -1) {
            CoreWindow.windowSet.splice(index, 1);
        }

        CoreWindow.windowSet.splice(0, 0, this);
        CoreWindow.foreground = this;
        taskbar.hide();
    }

    hide() {
        this.suspend();
        this._rootElement.classList.add("invisible");
        this._splash.classList.remove("hidden");
        CoreWindow.foreground = null;
    }

    suspend() {
        this._suspended = true;
        if (this._frame) {
            this._frame.send(AppLifecycleV1, "suspending");
            this._frame.send(AppLifecycleV2, { type: "suspending" });
            this._frame.setAudioMuted(true);
        }
    }

    terminate() {
        this._suspended = false;
        this._frame.src = "about:blank";
        this._rootElement.removeChild(this._frame);

        _.remove(CoreWindow.windows, this);

        if (CoreWindow.mainWindowMap.get(this.app.id) == this)
            CoreWindow.mainWindowMap.delete(this.app.id);

        CoreWindow.rootElement.removeChild(this._rootElement);
    }

    async grabScreenshotAsync(): Promise<Electron.NativeImage> {
        return await this._frame.capturePage();
    }

    private onNavigating(event: WillNavigateEvent) {
        var uri = new URL(event.url);
        if (uri.protocol !== "ms-appx") {
            event.preventDefault();
            event.cancelBubble = true;
            this._frame.stop();

            shell.openExternal(uri.toString())
        }
    }

    private onFrameLoaded() {
        if (!this._splash || !this._frame.src)
            return

        // this._frame.content.addEventListener("mousemove", this.onWindowMouseMoved);
        this._frameLoaded = true;
        this.doFadeOut(this._launchArgs);
    }

    private onFrameMessage(ev: IpcMessageEvent) {
        for (const obj of this._ipcHandlers) {
            if (ev.channel == obj.name) {
                obj.handle(ev, ev.args[0]);
            }
        }
    }

    private onFrameCrashed(ev) {
        // this.terminate();
    }

    private doFadeOut(args: ICoreWindowActivateArgs) {
        this._frame.send(AppLifecycleV1, this._suspended ? "resuming" : "activated");
        this._frame.send(SplashScreenV1);

        if (!this._suspended || (args && args.files)) {
            let element = this._splash.querySelector(".splashScreenImage");
            let bounds = element.getBoundingClientRect();
            let parentBounds = this._frame.getBoundingClientRect();

            let activationDetails = {
                kind: args?.files?.length ? ActivationKind.file : ActivationKind.launch,
                args: args?.args ?? "",
                files: args?.files ?? [],
                splashRect: {
                    x: bounds.x - parentBounds.x,
                    y: bounds.y - parentBounds.y,
                    width: bounds.width,
                    height: bounds.height
                }
            }
            this._frame.send(AppLifecycleV2, { type: "activated", details: activationDetails });
        }
        else {
            this._frame.send(AppLifecycleV2, { type: "resuming" });
        }

        this._frame.send(SplashScreenV2);
        this._suspended = false;

        this._splash.classList.add("invisible");
        setTimeout(() => {
            this._splash.classList.add("hidden");
            this._splash.classList.remove("invisible");
            this.hideTitlebar();
        }, 200);
    }

    static getForegroundWindow() {
        return CoreWindow.foreground;
    }

    static ensureRootElement() {
        if (CoreWindow.rootElement)
            return;

        CoreWindow.rootElement = document.getElementsByClassName("core-window-container")[0] as HTMLElement;
        CoreWindow.mainWindowMap = new Map<string, CoreWindow>();
        CoreWindow.windowSet = [];
    }

    static createMainWindow(pack: Package, app: PackageApplication) {
        CoreWindow.ensureRootElement();

        let id = pack.identity.name + "/" + app.id;

        if (this.mainWindowMap.has(id)) {
            return this.mainWindowMap.get(id);
        }
        else {
            let window = new CoreWindow(pack, app);
            this.mainWindowMap.set(id, window);
            this.windows.push(window);

            // todo: cleanup
            return window;
        }
    }

    static switchTo(window: CoreWindow) {
        const foreground = CoreWindow.getForegroundWindow();
        if (window != foreground) {
            if (foreground !== null)
                foreground.hide();
            window.activate({});
        }
    }
}