import { PlatformObject } from "./PlatformObject";
import { Foundation } from "winrt-node/Windows"
import { ShimProxyHandler } from "winrt-node/ShimProxyHandler";

export class MailResource extends PlatformObject {
    constructor() {
        super("MailResource");
        return new Proxy(this, new ShimProxyHandler("MailResource"));
    }

    @Foundation.Enumerable(true)
    public get isEnabled(): boolean {
        return true;
    }
}