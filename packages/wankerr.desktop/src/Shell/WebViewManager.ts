import { WebviewTag } from "electron";

export class WebViewManager {
    static webViewMap: Map<string, WebviewTag> = new Map();
    static getWebViewForId(id: string): WebviewTag {
        // todo: https://github.com/electron/electron/issues/15040#issuecomment-428391230 ?
        return this.webViewMap.has(id) ? this.webViewMap.get(id) : this.webViewMap.set(id, document.createElement("webview")).get(id); 
    }
}