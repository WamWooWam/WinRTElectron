import { CoreWindow } from "./CoreWindow";
import { Start } from "./Start";
import { Shell } from "../Shell";
import jsx from "jsx-no-react"
import "./app-switcher.css"

export class AppSwitcher {

    private static _instance: AppSwitcher;

    static getInstance(): AppSwitcher {
        return AppSwitcher._instance ?? (AppSwitcher._instance = new AppSwitcher());
    }

    private _rootElement: HTMLDivElement;

    // app switcher
    private _appSwitcherElement: HTMLDivElement;
    private _appSwitcherOverlayElement: HTMLDivElement;
    private _appSwitcherOverlayImage: HTMLImageElement;
    private _appSwitcherOverlayList: HTMLUListElement;
    private _appSwitcherAppsElement: HTMLDivElement;
    private _appSwitcherFooter: HTMLDivElement;

    private _isInGesture: boolean;
    private _initialX: number;
    private _initialY: number;
    private _lightOverlayTimeout: number;
    private _isOpen: boolean;

    constructor() {
        this._rootElement = document.querySelector(".app-switcher-container");
        this._appSwitcherElement = this._rootElement.querySelector(".app-switcher");
        this._appSwitcherAppsElement = this._appSwitcherElement.querySelector(".app-switcher-app-list");
        this._appSwitcherFooter = this._appSwitcherElement.querySelector(".app-switcher-footer");

        this._appSwitcherOverlayElement = document.createElement("div");
        this._appSwitcherOverlayImage = document.createElement("img");
        this._appSwitcherOverlayList = document.createElement("ul");

        this._appSwitcherOverlayElement.classList.add("app-switcher-light-overlay", "hidden");
        this._appSwitcherOverlayImage.classList.add("app-switcher-overlay-image");
        this._appSwitcherOverlayList.classList.add("app-switcher-overlay-list");

        this._appSwitcherOverlayElement.appendChild(this._appSwitcherOverlayImage);
        this._appSwitcherOverlayElement.appendChild(this._appSwitcherOverlayList);
        this._rootElement.appendChild(this._appSwitcherOverlayElement);
        this._isOpen = false;
        this._isInGesture = false;

        this._appSwitcherFooter.addEventListener("mousedown", (ev) => {
            this._appSwitcherFooter.classList.add("active");
        });

        this._appSwitcherOverlayImage.addEventListener("mousedown", (ev) => {
            this.endGesture();
            this.closeAll();

            Shell.getInstance().start.hide();
            CoreWindow.switchTo(this.getSwitchableWindows()[0]);
        });

        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        document.addEventListener("mouseup", (ev) => {
            if (this._appSwitcherFooter.classList.contains("active")) {
                this._appSwitcherFooter.classList.remove("active");
                this.closeAll();
                Shell.getInstance().start.show();
            }
        });
    }

    notifyMouseMove(event: MouseEvent) {
        this.onMouseMove(event);
    }

    private beginGesture(x: number, y: number) {
        console.log("begin switcher gesture");
        this._initialX = x;
        this._initialY = y;
        this._isInGesture = true;
    }

    private endGesture() {
        console.log("no gesture");

        window.clearTimeout(this._lightOverlayTimeout);
        this.closeLightOverlays();

        this._isInGesture = false;
        this._lightOverlayTimeout = 0;
        this._initialX = 0;
        this._initialY = 0;
    }

    private onMouseMove(event: MouseEvent) {
        var x = event.pageX;
        var y = event.pageY;

        if (!this._isOpen) {
            if (!this._isInGesture) {
                if (x <= 20 && y <= 20 && this.anySwitchableWindows()) {
                    // left side, app switcher
                    this._lightOverlayTimeout = window.setTimeout(this.showAppSwitcherLightOverlay.bind(this), 1000);
                    this.beginGesture(x, y);
                }
            }
            else {
                if (x > 125) {
                    this.endGesture();
                    this.closeAll();
                }

                let yDelta = Math.abs(this._initialY - y);
                if (yDelta > 100) {
                    this.showAppSwitcher();
                }
            }
        }
        else {
            if (x < 0 || x > 300) {
                this.endGesture();
                this.closeAll();
            }
        }
    }

    private async showAppSwitcher() {
        for (const window of this.getSwitchableWindows()) {
            let image = <img className="app-switcher-app-image" />
            window.grabScreenshotAsync().then(img => {
                img = img.resize({ width: 168, quality: 'better' })
                image.src = img.toDataURL();
            });

            let element = (
                <div className="app-switcher-app-container">
                    {image}
                    <div className="app-switcher-app-label-container">
                        <span className="app-switcher-app-label">{window.title}</span>
                    </div>
                </div>
            )

            element.addEventListener("mousedown", (ev) => {
                element.classList.add("active");
            });

            element.addEventListener("mouseup", (ev) => {
                this.endGesture();
                this.closeAll();

                Shell.getInstance().start.hide();
                CoreWindow.switchTo(window);
            });

            document.addEventListener("mouseup", (ev) => {
                element.classList.remove("active");
            });

            this._appSwitcherAppsElement.appendChild(element);
        }

        this.endGesture();
        this._isOpen = true;
        this._appSwitcherElement.classList.add("visible");
        console.log("app switcher shown");
    }

    private showAppSwitcherLightOverlay() {
        this._appSwitcherOverlayList.innerHTML = "";

        let windows = this.getSwitchableWindows();
        let window = windows[0];
        let otherWindows = windows.slice(1);

        window.grabScreenshotAsync().then(img => {
            img = img.resize({ width: 122, quality: 'better' })
            this._appSwitcherOverlayImage.src = img.toDataURL();
        });

        for (const otherWindow of otherWindows) {
            let li = document.createElement("li");
            li.classList.add("app-switcher-placeholder")
            this._appSwitcherOverlayList.appendChild(li);
        }

        this._appSwitcherOverlayElement.classList.remove("hidden");
    }

    private closeAll() {
        this.closeLightOverlays();
        this._isOpen = false;
        this._appSwitcherElement.classList.remove("visible");
        this._appSwitcherAppsElement.innerHTML = "";

        console.log("app switcher hidden");
    }

    private closeLightOverlays() {
        this._appSwitcherOverlayElement.classList.add("hidden");
    }

    private getSwitchableWindows() {
        let windows = [];
        for (const window of CoreWindow.windows) {
            if (window != CoreWindow.getForegroundWindow())
                windows.push(window);
        }

        return windows;
    }

    private anySwitchableWindows() {
        for (const window of CoreWindow.windows) {
            if (window != CoreWindow.getForegroundWindow())
                return true;
        }

        return false;
    }
}