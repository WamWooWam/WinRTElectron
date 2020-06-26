import { CoreWindow } from "./CoreWindow";
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

    private _isInGesture: boolean;
    private _initialX: number;
    private _initialY: number;
    private _lightOverlayTimeout: number;

    constructor() {
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        this._rootElement = document.querySelector(".charms-bar-container");
        this._appSwitcherElement = this._rootElement.querySelector(".app-switcher");

        this._appSwitcherOverlayElement = document.createElement("div");
        this._appSwitcherOverlayImage = document.createElement("img");
        this._appSwitcherOverlayList = document.createElement("ul");

        this._appSwitcherOverlayElement.classList.add("app-switcher-light-overlay", "hidden");
        this._appSwitcherOverlayImage.classList.add("app-switcher-overlay-image");
        this._appSwitcherOverlayList.classList.add("app-switcher-overlay-list");

        this._appSwitcherOverlayElement.appendChild(this._appSwitcherOverlayImage);
        this._appSwitcherOverlayElement.appendChild(this._appSwitcherOverlayList);
        this._appSwitcherElement.appendChild(this._appSwitcherOverlayElement);
    }

    notifyMouseMove(event: MouseEvent) {
        this.onMouseMove(event);
    }

    private beginGesture(x: number, y: number) {
        console.log("begin switcher gesture");
        this._initialX = x;
        this._initialY = y;
    }

    private endGesture() {
        console.log("no gesture");

        window.clearTimeout(this._lightOverlayTimeout);
        this.closeLightOverlays();

        this._isInGesture = true;
        this._lightOverlayTimeout = 0;
        this._initialX = 0;
        this._initialY = 0;
    }

    private onMouseMove(event: MouseEvent) {
        var x = event.pageX;
        var y = event.pageY;

        var pageWidth = document.body.clientWidth;
        var pageHeight = document.body.clientHeight;

        if (!this._isInGesture) {
            if (x > 0 && x <= 20 && y > 0 && y <= 20 && CoreWindow.windows.length > 0) {
                // left side, app switcher
                this._lightOverlayTimeout = window.setTimeout(this.showAppSwitcherLightOverlay.bind(this), 1000);
                this.beginGesture(x, y);
            }
        }
        else {
            if (!(x > 0 && x <= 35)) {
                this.endGesture();
            }

            
        }
    }

    private closeLightOverlays() {
        this._appSwitcherOverlayElement.classList.add("hidden");
    }

    private showAppSwitcherLightOverlay() {
        this._appSwitcherOverlayList.innerHTML = "";

        let window = CoreWindow.windows[CoreWindow.windows.length - 1];
        let otherWindows = CoreWindow.windows.slice(0, CoreWindow.windows.length - 1);

        window.grabScreenshot().then(img => {
            img = img.resize({width: 150, quality: 'better'})
            this._appSwitcherOverlayImage.src = img.toDataURL();
        });

        for (const otherWindow of otherWindows) {
            let li = document.createElement("li");
            this._appSwitcherOverlayList.appendChild(li);
        }

        this._appSwitcherOverlayElement.classList.remove("hidden");
    }

    private showCharmsLightOverlay() {

    }
}