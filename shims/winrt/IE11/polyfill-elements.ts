// custom elements to polyfill IE behavour

import MSProgressElement from "./Elements/MSProgress"
customElements.define("ms-progress", MSProgressElement);

const __addEventListener = Element.prototype.addEventListener;
const __removeEventListener = Element.prototype.removeEventListener;

const MSEventMap = {
    mspointerdown: "pointerdown",
    mspointerup: "pointerup",
    mspointercancel: "pointercancel",
    mspointerout: "pointerout",
}

const IgnoredEvents = [
    "usercontrolconstructed",
    "usercontrolinitialized"
]

Object.assign(Element.prototype, {
    setActive: HTMLElement.prototype.focus,
    msMatchesSelector: Element.prototype.matches,
    createTextRange: function () {
        return { offsetTop: 0, scrollIntoView: (() => { }) }
    },
    getComputedStyle: function () { return window.getComputedStyle(this); },
    removeNode: function (fDeep: boolean) {
        this.remove();
    },

    addEventListener: function (...args) {
        const event = String(args[0]).toLowerCase();

        if (!IgnoredEvents.includes(event)) {
            const mappedEvent = MSEventMap[event];
            if (("on" + event) in this) {
                console.log("addEventListener: '%s' %O, %O", args[0], this, args[1]);
            }
            else if (mappedEvent) {
                console.warn("addEventListener: '%s' -> '%s' %O, %O", args[0], mappedEvent, this, args[1]);
                args[0] = mappedEvent;
            }
            else {
                console.error("addEventListener: '%s' %O, %O", args[0], this, args[1]);
            }
        }

        return __addEventListener.apply(this, args);
    },

    removeEventListener: function (...args) {
        const event = String(args[0]).toLowerCase();
        if (!IgnoredEvents.includes(event)) {
            const mappedEvent = MSEventMap[event];
            if (("on" + event) in this) {
                console.log("removeEventListener: '%s' %O, %O", args[0], this, args[1]);
            }
            else if (mappedEvent) {
                console.warn("removeEventListener: '%s' -> '%s' %O, %O", args[0], mappedEvent, this, args[1]);
                args[0] = mappedEvent;
            }
            else {
                console.error("removeEventListener: '%s' %O, %O", args[0], this, args[1]);
            }
        }
        return __removeEventListener.apply(this, args);
    }
});

Object.assign(HTMLMediaElement.prototype, {
    msSetMediaProtectionManager: function(mediaProtectionManager) {

    }
})

Object.defineProperty(HTMLElement.prototype, 'currentStyle', {
    get: function () { return this.getComputedStyle() },
    enumerable: true
})

Object.assign(CSSStyleDeclaration.prototype, {
    // TODO: transform like postcss-modernise-ie11.js 
    setAttribute: function (property: string, value: string) {
        console.log(`style-transform: ${property}: ${value}`);
        return this.setProperty(property, value);
    }
});