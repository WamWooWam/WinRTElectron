import * as WindowsImpl from "./Windows"
import * as MSAppImpl from "./MSApp"

export const Windows = WindowsImpl;
export const MSApp = MSAppImpl;

class WeakWinRTProperties {
    static objectMap = new Map();

    static getWeakProperty(winRtObject, key) {
        if (WeakWinRTProperties.objectMap.has(winRtObject)) {
            let propertyMap = WeakWinRTProperties.objectMap.get(winRtObject);
            var val = propertyMap.get(key);

            console.log(val);

            return val;
        }

        return null;
    }

    static setWeakProperty(winRtObject, key, value) {
        let propertyMap = new Map();

        if (!WeakWinRTProperties.objectMap.has(winRtObject)) {
            WeakWinRTProperties.objectMap.set(winRtObject, propertyMap);
        }

        propertyMap = WeakWinRTProperties.objectMap.get(winRtObject);
        propertyMap.set(key, value);
        WeakWinRTProperties.objectMap.set(winRtObject, propertyMap);
    }

}

// set a bunch of globals to make apps happy. welcome to the IE11 emulator

const globalThis = (() => {
    if (typeof self !== 'undefined') {
        return self;
    } else if (typeof window !== 'undefined') {
        return window;
    } else {
        return Function('return this')();
    }
})();

if (globalThis.document) {
    globalThis["msMatchMedia"] = typeof globalThis["msMatchMedia"] === "function" ? globalThis["msMatchMedia"] : window.matchMedia;
    globalThis["MSPointerEvent"] = typeof MSPointerEvent !== "undefined" ? MSPointerEvent : PointerEvent;
    Element.prototype["msMatchesSelector"] = Element.prototype.matches;
}

globalThis["toStaticHTML"] = function (html) {
    return html; // imagine sanitising OMEGALUL
}

globalThis["msSetWeakWinRTProperty"] = WeakWinRTProperties.setWeakProperty;
globalThis["msGetWeakWinRTProperty"] = WeakWinRTProperties.getWeakProperty;
globalThis["msWriteProfilerMark"] = function (...args) { console.info("profiler:" + args[0]); performance.mark(args[0]) };
globalThis["msRequestAnimationFrame"] = requestAnimationFrame;

globalThis["setImmediate"] = typeof setImmediate === 'function' ? setImmediate : (...args) => {
    args.splice(1, 0, 0);
    setTimeout.apply(null, args);
};

globalThis["msSetImmediate"] = setImmediate;
globalThis["Debug"] = {
    write: console.log,
    msTraceAsyncOperationStarting: () => { },
    msTraceAsyncOperationCompleted: () => { },
    msTraceAsyncCallbackStarting: () => { },
    msTraceAsyncCallbackCompleted: () => { },
}

globalThis["Windows"] = WindowsImpl;
globalThis["MSApp"] = MSAppImpl;