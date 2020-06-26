import { SuiteUpdateApplication } from "./Application"
import { EventTarget, IAsyncOperation, Shim } from "winrt-node/Windows.Foundation"

//
// checks for updates of the "suite" (i.e. the group of communication apps) 
// realistically not needed until we're in PWA territory so help me god
export class SuiteUpdate extends EventTarget {
    static loadAsync(...args) {
        return new IAsyncOperation<SuiteUpdate>((resolve, reject) => resolve(new SuiteUpdate()));
    }
    static loadPlatformAsync(...args) {
        return Shim.shimmedAsyncFunction<SuiteUpdate>(args);
    }
    static loadManagerAsync(...args) {
        return Shim.shimmedAsyncFunction<SuiteUpdate>(args);
    }
    static loadUriAsync(...args) {
        return Shim.shimmedAsyncFunction<SuiteUpdate>(args);
    }
    static loadStorageFileAsync(...args) {
        return Shim.shimmedAsyncFunction<SuiteUpdate>(args);
    }
    static loadXmlAsync(...args) {
        return Shim.shimmedAsyncFunction<SuiteUpdate>(args);
    }

    get app(): SuiteUpdateApplication {
        return new SuiteUpdateApplication()
    }
}