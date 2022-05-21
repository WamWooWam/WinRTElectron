import { IpcMessageEvent, WillNavigateEvent } from "electron/main";
import { Component } from "preact";
import { uuidv4 } from "winrt/Windows/Foundation/Interop/Utils";
import { Package } from "../../Data/Package";
import { PackageApplication } from "../../Data/PackageApplication";
import { PackageRegistry } from "../../Data/PackageRegistry";
import { CoreWindowHost } from "./CoreWindowHost";
import { CoreWindowSplashScreen } from "./CoreWindowSplashScreen";
import { CoreWindowTitleBar } from "./CoreWindowTitleBar";
import { WebViewManager } from "../WebViewManager";
import { ActivationKind } from "winrt/Windows/ApplicationModel/Activation/ActivationKind"
import { ActivatedDeferralV1, AppLifecycleV1, AppLifecycleV2, SplashScreenV1, SplashScreenV2 } from "winrt/Windows/Foundation/Interop/IpcConstants"
import "./core-window.css"
import { CoreWindowManager } from "../../Data/CoreWindowManager";

interface CoreWindowProps {
    windowId: string;
    isInTile: boolean;
}

interface CoreWindowState {
    id: string;
    title: string;
    app: PackageApplication;
    pack: Package;
    splashScreenVisible: boolean;
    titlebarVisible: boolean;
    activatedDeferralId?: string;
    loaded?: boolean;
}

// 
// Represents a CoreWindow
//
export class CoreWindow extends Component<CoreWindowProps, Partial<CoreWindowState>> {
    constructor(props) {
        super(props);

        this.state = { splashScreenVisible: true, titlebarVisible: false }
        this.onCloseClicked = this.onCloseClicked.bind(this);
        this.onMinimiseClicked = this.onMinimiseClicked.bind(this);
        this.onDidStartLoading = this.onDidStartLoading.bind(this);
        this.onDomReady = this.onDomReady.bind(this);
        this.onIpcMessage = this.onIpcMessage.bind(this);
        this.onWillNavigate = this.onWillNavigate.bind(this);
        this.onCrashed = this.onCrashed.bind(this);
    }

    static getDerivedStateFromProps(props: CoreWindowProps, state: CoreWindowState): object {
        let coreWindowInfo = CoreWindowManager.getWindowById(props.windowId);
        return {
            id: props.windowId,
            pack: coreWindowInfo.pack,
            app: coreWindowInfo.app,
            title: coreWindowInfo.app.visualElements.displayName
        }
    }

    componentDidMount() {
        let frame = WebViewManager.getWebViewForId(this.state.id)
        if (!frame.src && !this.props.isInTile) {
            frame.src = this.state.app.startPage;
        }
    }

    render() {
        let primaryColour = this.state.app.visualElements.backgroundColor;
        let splashColour = this.state.app.visualElements.splashScreen.backgroundColor ?? primaryColour;
        let iconUrl = this.state.app.visualElements.square30x30Logo + "?scale=80";
        let splashUrl = this.state.app.visualElements.splashScreen.image;

        return (
            <div class="core-window">
                {this.props.isInTile ? null :
                    <CoreWindowHost id={this.state.id}
                        partition={this.state.pack.identity.packageFamilyName}
                        didStartLoading={this.onDidStartLoading}
                        domReady={this.onDomReady}
                        ipcMessage={this.onIpcMessage}
                        willNavigate={this.onWillNavigate}
                        crashed={this.onCrashed} />}
                <CoreWindowSplashScreen backgroundColour={splashColour}
                    splashImageUrl={splashUrl}
                    visible={this.state.splashScreenVisible} />
                <CoreWindowTitleBar title={this.state.title}
                    isVisible={this.state.titlebarVisible}
                    primaryColour={primaryColour}
                    iconUrl={iconUrl}
                    closeClicked={this.onCloseClicked}
                    minimiseClicked={this.onMinimiseClicked} />
            </div>
        );
    }

    private onCloseClicked() {

    }

    private onMinimiseClicked() {

    }

    private onDidStartLoading(event: Electron.Event) {
        let frame = WebViewManager.getWebViewForId(this.state.id)
        frame.openDevTools();
    }

    private onDomReady(event: Electron.Event) {
        if (this.state.loaded)
            return;

        let frame = WebViewManager.getWebViewForId(this.state.id)

        frame.send(AppLifecycleV1, "activated");
        frame.send(SplashScreenV1);

        let element = (this.base as HTMLElement).querySelector(".splash-screen-image");
        let bounds = element.getBoundingClientRect();
        let parentBounds = frame.getBoundingClientRect();

        let activationDetails = {
            kind: ActivationKind.launch,
            args: "",
            files: [],
            splashRect: {
                x: bounds.x - parentBounds.x,
                y: bounds.y - parentBounds.y,
                width: 620,
                height: 300
            }
        }

        frame.send(AppLifecycleV2, { type: "activated", details: activationDetails });
        this.setState({ loaded: true })
    }

    private onIpcMessage(event: IpcMessageEvent) {
        let frame = WebViewManager.getWebViewForId(this.state.id)

        if (event.channel === ActivatedDeferralV1) {
            let args = event.args[0].data;
            if (args.type == 'captured') {
                this.setState({ activatedDeferralId: args.deferralId });
                console.log(`Window ${this.state.id} captured ActivatedDeferral ${args.deferralId}`)
            }

            if (args.deferralId == this.state.activatedDeferralId && args.type == 'completed') {
                this.setState({ activatedDeferralId: null, splashScreenVisible: false });
                console.log(`Window ${this.state.id} completed ActivatedDeferral ${args.deferralId}`)
                frame.send(SplashScreenV2);
            }
        }

        if (event.channel === AppLifecycleV2) {
            if (!this.state.activatedDeferralId) {
                this.setState({ splashScreenVisible: false })
                frame.send(SplashScreenV2);
                console.log(`Window ${this.state.id} completed activation with no deferral.`)
            }
            else {
                console.log(`Window ${this.state.id} got lifecycle response but has captured ActivatedDeferral`)
            }
        }
    }

    private onWillNavigate(event: WillNavigateEvent) {

    }

    private onCrashed(event: any) {

    }
}