import { PlatformObject } from "./PlatformObject";
import { ShimProxyHandler } from "winrt-node/Windows.Foundation";

export class Person extends PlatformObject {
    constructor() {
        super("Person");

        return new Proxy(this, new ShimProxyHandler);
    }
}