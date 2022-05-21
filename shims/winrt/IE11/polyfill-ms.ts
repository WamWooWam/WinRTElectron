const __setImmediate = (...args) => {
    args.splice(1, 0, 0)
    return setTimeout.apply(null, args);
};

const __clearImmediate = (handle) => {
    return clearTimeout(handle);
}

Object.assign(globalThis, {
    setImmediate: __setImmediate,
    msSetImmediate: __setImmediate,
    clearImmediate: __clearImmediate,
    msClearImmediate: __clearImmediate,
    msWriteProfilerMark: (bstrProfilerMarkName: string) => performance.mark(bstrProfilerMarkName),
    msRequestAnimationFrame: (callback) => window.requestAnimationFrame(callback),
    msMatchMedia: (selector) => window.matchMedia(selector),
    toStaticHTML: (html: string) => html, // i can't really do this lol
    Debug: {
        write: console.log,
        msTraceAsyncOperationStarting: () => { },
        msTraceAsyncOperationCompleted: () => { },
        msTraceAsyncCallbackStarting: () => { },
        msTraceAsyncCallbackCompleted: () => { },
    },

    MSPointerEvent: PointerEvent
})