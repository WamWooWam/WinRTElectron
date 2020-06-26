export * as Windows from "./Windows"
export * as MSApp from "./MSApp"
import * as Windows from "./Windows"
import * as MSApp from "./MSApp"
import { ipcRenderer } from "electron";

const globalThis = (() => {
    if (typeof self !== 'undefined') {
        return self;
    } else if (typeof window !== 'undefined') {
        return window;
    } else {
        return Function('return this')();
    }
})();

if (globalThis.document)
    globalThis["msMatchMedia"] = typeof globalThis["msMatchMedia"] === "function" ? globalThis["msMatchMedia"] : window.matchMedia;

globalThis["toStaticHTML"] = function(html){
    return html; // imagine sanitising OMEGALUL
}

globalThis["msWriteProfilerMark"] = function (...args) { console.info("profiler:" + args[0]) };
globalThis["setImmediate"] = typeof setImmediate === 'function' ? setImmediate : (...args) => {
    args.splice(1, 0, 0);
    setTimeout.apply(null, args);
};
globalThis["msSetImmediate"] = setImmediate;
globalThis["Debug"] = {
    write: function (str) {
        console.log(str);
    }
}
globalThis["Windows"] = Windows;
globalThis["MSApp"] = MSApp;