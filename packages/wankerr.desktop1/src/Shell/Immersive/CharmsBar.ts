import { CoreWindow } from "./CoreWindow";
import "./charms-bar.css"
import { Start } from "./Start";
import { Shell } from "../Shell";

export class CharmsBar {
    private _rootElement: HTMLDivElement;
    private _charmsBar: HTMLDivElement;

    private _settingsButton: HTMLAnchorElement;
    private _startButton: HTMLAnchorElement;

    private _isInGesture: boolean;
    private _isOpen: boolean;
    private _initialX: number;
    private _initialY: number;
    private _lightOverlayTimeout: number;

    constructor(desktop: Shell) {
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        this._rootElement = document.querySelector(".charms-bar-container");
        this._charmsBar = document.querySelector(".charms-bar");

        this._settingsButton = document.querySelector(".charms-bar-settings");
        this._settingsButton.addEventListener("click", this.settingsInvoked.bind(this));

        this._startButton = document.querySelector(".charms-bar-start");
        this._startButton.addEventListener("click", this.startInvoked.bind(this));
    }

    notifyMouseMove(event: MouseEvent) {
        this.onMouseMove(event);
    }

    private beginGesture(x: number, y: number) {
        console.log("begin charms bar gesture");

        this._initialX = x;
        this._initialY = y;
        this._isInGesture = true;
    }

    private endGesture() {
        console.log("no gesture");
        window.clearTimeout(this._lightOverlayTimeout);

        this._isInGesture = false;
        this._lightOverlayTimeout = 0;
        this._initialX = 0;
        this._initialY = 0;
    }

    private onMouseMove(event: MouseEvent) {
        let x = event.pageX;
        let y = event.pageY;

        let pageWidth = document.body.clientWidth;
        let pageHeight = document.body.clientHeight;

        if (!this._isOpen) {
            if (!this._isInGesture) {
                if (x < pageWidth && x >= pageWidth - 20 && ((y > 0 && y <= 20) || (y > pageHeight - 20 && y <= pageHeight))) {
                    // right side, charms bar 
                    this._lightOverlayTimeout = window.setTimeout(this.showCharmsLightOverlay.bind(this), 1000);
                    this.beginGesture(x, y);
                }
            }
            else {
                if (!(x < pageWidth && x >= pageWidth - 50)) {
                    this.endGesture();
                    this.closeAll();
                }

                let yDelta = Math.abs(this._initialY - y);
                if (yDelta > 100) {
                    this.showCharms();
                }
            }
        }
        else {
            if (!(x < pageWidth && x >= pageWidth - 100)) {
                this.endGesture();
                this.closeAll();
            }
        }
    }

    private showCharmsLightOverlay() {
        console.log("show charms light");

        this._charmsBar.classList.add("charms-bar-visible");
    }

    private showCharms() {
        console.log("show charms");
        this.endGesture();

        this._charmsBar.classList.add("charms-bar-open")
        this._isOpen = true;
    }

    private closeAll() {
        console.log("close charms");

        this._charmsBar.classList.add("charms-bar-fade-out")
        this._charmsBar.classList.remove("charms-bar-visible", "charms-bar-open");
        this._isOpen = false;

        window.setTimeout(() => this._charmsBar.classList.remove("charms-bar-fade-out"), 500);
    }

    private startInvoked() {
        this.closeAll();
        Shell.getInstance().start.show();
    }

    private settingsInvoked() {
        this.closeAll();

        let window = CoreWindow.getForegroundWindow();
        window.settingsPane.show();
    }
}