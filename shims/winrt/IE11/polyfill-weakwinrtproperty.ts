const weakRefs = Symbol("weakRefs")

Object.assign(globalThis, {
    msGetWeakWinRTProperty: (winRtObject: any, name: string) => {
        let retVal = null;
        if (winRtObject[weakRefs]) {
            let val = winRtObject[weakRefs].get(name);
            retVal = val?.deref();
        }

        //console.log(`winrt-weakref: get %O['%s'] -> %O`, winRtObject, name, retVal);        
        return retVal;
    },
    msSetWeakWinRTProperty: (winRtObject: any, name: string, objectToReference: any) => {
        if (!!!winRtObject[weakRefs]) {
            winRtObject[weakRefs] = new Map();
        }

        winRtObject[weakRefs].set(name, new WeakRef(objectToReference));
        //console.log(`winrt-weakref: set %O['%s'] -> %O`, winRtObject, name, objectToReference);
    }
})