import { PlatformObject } from "./PlatformObject";
import { ShimProxyHandler } from "winrt-node/ShimProxyHandler";

export class Person extends PlatformObject {
    constructor() {
        super("Person");

        return new Proxy(this, new ShimProxyHandler);
    }
}