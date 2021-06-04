import { CharmsBar } from "./Immersive/CharmsBar";
import { Start } from "./Immersive/Start";
import { AppSwitcher } from "./Immersive/AppSwitcher";
import { Settings } from "./Settings";
import { PackageRegistry } from "./PackageRegistry";
import { CoreWindow, ICoreWindowActivateArgs } from "./Immersive/CoreWindow";
import { PackageApplication } from "./PackageApplication";
import { TrayIcon } from "./Desktop/TrayIcon";
import { Package } from "./Package";
import { Desktop } from "./Desktop/Desktop";
import { Application } from "./Application";

import { createContext, h as jsx, render } from "preact";
import "./desktop.css"

export class Shell extends EventTarget {
    static coreWindowZ: number = 10;
    static _shell: Shell;
    static getInstance(): Shell {
        return Shell._shell ?? (Shell._shell = new Shell());
    }

    private _rootElement: HTMLElement;
    private _settings: Settings;
    private _start: Start;
    private _charmsbar: CharmsBar;
    private _taskbar: Taskbar;
    private _appSwitcher: AppSwitcher;
    private _apps: Map<string, Application>;

    get settings(): Settings {
        return this._settings;
    }

    get start(): Start {
        return this._start;
    }

    get charmsbar(): CharmsBar {
        return this._charmsbar;
    }

    get taskbar(): Taskbar {
        return this._taskbar;
    }

    get root(): HTMLElement {
        return this._rootElement;
    }

    constructor() {
        super();

        document.body.style.perspective = "2000px"
        this._rootElement = document.querySelector(".desktop");
        this._settings = new Settings();
        this._start = new Start(this);
        this._charmsbar = new CharmsBar(this);
        this._taskbar = new Taskbar(this);
        this._appSwitcher = new AppSwitcher();
        this._apps = new Map();
    }

    render() {
        render(<Desktop />, this.root)
    }

    launchImmersiveApp(pack: Package, packApp: PackageApplication, args?: ICoreWindowActivateArgs) {
        let id = pack.identity.name + "/" + packApp.id;
        if (this._apps.has(id)) {
            let app = this._apps.get(id);
            app.coreWindows[0].activate(args);
            this.dispatchEvent(new CustomEvent("immersive-app-activated", { detail: { app: app, package: pack, window: app.coreWindows[0] } }));
        }
        else {
            let app = Application.createForImmersiveApp(pack, packApp);
            this._apps.set(id, app);

            this.dispatchEvent(new CustomEvent("immersive-app-launched", { detail: { app: packApp, package: pack } }));

            let window = CoreWindow.createMainWindow(pack, packApp);
            app.coreWindows.push(window);
            window.activate(args);
        }
    }

    goToAppFromUrl(str?: string) {
        let hash = "#" + str ?? window.location.hash;
        if (hash != null) {
            hash = hash.substr(1);

            let split = hash.split('/');
            if (split.length == 2) {
                let packageName = split[0];
                let appName = split[1];

                let pack = PackageRegistry.getPackage(packageName);
                if (pack !== null) {
                    let app = pack.applications.get(appName);
                    if (app !== null) {
                        this.launchImmersiveApp(pack, app);
                        return;
                    }
                }
            }
        }

        this.start.show();
    }

    show() {

    }

    hide() {

    }
}

class Taskbar {
    shell: Shell;
    constructor(shell: Shell) {
        this.shell = shell;
    }

    show() {
        this.shell.dispatchEvent(new CustomEvent("taskbar-shown"));
    }

    hide() {
        this.shell.dispatchEvent(new CustomEvent("taskbar-hidden"));
    }
}

export const ShellContext = createContext(Shell.getInstance);