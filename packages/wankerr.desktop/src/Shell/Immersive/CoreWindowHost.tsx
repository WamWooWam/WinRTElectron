import { WebviewTag } from "electron";
import { IpcMessageEvent, WillNavigateEvent } from "electron/main";
import { Component } from "preact";
import { WebViewManager } from "../WebViewManager";

interface CoreWindowHostProps {
    id: string;
    partition: string;
    didStartLoading?: (event: Electron.Event) => void;
    domReady?: (event: Electron.Event) => void;
    ipcMessage?: (event: IpcMessageEvent) => void;
    willNavigate?: (event: WillNavigateEvent) => void;
    crashed?: (event: any) => void;
}

// 
// Hosts the Electron WebView for a CoreWindow
//
export class CoreWindowHost extends Component<CoreWindowHostProps> {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
        let view = WebViewManager.getWebViewForId(this.props.id);
        // view.style.width = "1600px";
        // view.style.height = "900px";
        view.nodeintegration = true;
        view.nodeintegrationinsubframes = true;
        view.disablewebsecurity = true;
        view.webpreferences = "contextIsolation=no,websecurity=no,nodeintegrationinsubframes=true";
        view.partition = "persist:" + this.props.partition;
        view.classList.add("core-window-frame")

        if (this.props.didStartLoading)
            view.addEventListener("did-start-loading", this.props.didStartLoading);
        if (this.props.domReady)
            view.addEventListener("dom-ready", this.props.domReady);
        if (this.props.ipcMessage)
            view.addEventListener("ipc-message", this.props.ipcMessage);
        if (this.props.willNavigate)
            view.addEventListener("will-navigate", this.props.willNavigate);
        if (this.props.crashed)
            view.addEventListener("crashed", this.props.crashed);

        this.base.appendChild(view);
    }

    componentWillUnmount() {
        let view = WebViewManager.getWebViewForId(this.props.id);
        if (this.props.didStartLoading)
            view.removeEventListener("did-start-loading", this.props.didStartLoading);
        if (this.props.domReady)
            view.removeEventListener("dom-ready", this.props.domReady);
        if (this.props.ipcMessage)
            view.removeEventListener("ipc-message", this.props.ipcMessage);
        if (this.props.willNavigate)
            view.removeEventListener("will-navigate", this.props.willNavigate);
        if (this.props.crashed)
            view.removeEventListener("crashed", this.props.crashed);

    }

    render() {
        return (
            <div class="core-window-host" />
        );
    }
}