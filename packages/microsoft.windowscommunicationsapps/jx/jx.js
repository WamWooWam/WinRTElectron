(function () {
    function s(n) {
        return n !== f
    }

    function i(n) {
        return n === f
    }

    function o(n) {
        return typeof n == "string"
    }

    function h(n) {
        return n instanceof Object
    }

    function r(n) {
        return typeof n == "string" && !!n
    }

    function a(n) {
        return typeof n == "function"
    }

    function v(n) {
        return n instanceof HTMLElement
    }

    function ut(n) {
        return typeof n.length == "number"
    }

    function c(n, t) {
        for (var r = 0, i = 0, e = t.length, o = n.length, u; r < e; r++)
            u = t[r],
                u != null && (n[i++] = u);
        for (n.length = i; i < o;)
            n[i++] = f;
        return n
    }

    function l(n) {
        return new RegExp("(^|\\s)" + n + "(\\s|$)")
    }

    function y(n, t) {
        return l(t).test(n.className)
    }

    function p(n, t) {
        var i = n.className;
        n.className = i + (i ? " " : "") + t
    }

    function w(n, t) {
        n.className = n.className.replace(l(t), " ").trim()
    }

    function b(n, i) {
        if (n === t) {
            if (i === "body")
                return [t.body];
            if (g.test(i)) {
                var r = t.getElementById(RegExp.$1);
                return r ? [r] : []
            }
        }
        return n.querySelectorAll(i)
    }

    function ft(n, t) {
        return (t + "").toUpperCase()
    }

    function et(n) {
        return n.replace(nt, "ms-").replace(tt, ft)
    }

    function k(n, t, r) {
        if (h(n))
            for (var u in n)
                r(u, n[u]);
        else
            n.split(" ").forEach(function (n) {
                r(n, t)
            })
    }

    function ot(n, t, i) {
        k(t || "", i, function (t, i) {
            n.addEventListener(t, i, false)
        })
    }

    function st(n, t, i) {
        k(t || "", i, function (t, i) {
            n.removeEventListener(t, i, false)
        })
    }

    function n(t, i) {
        return new n.fn.init(t, i)
    }
    var d = /^\s*<(\w+)[^>]*>/,
        g = /^#([\w\-]+)$/,
        nt = /^-ms-/,
        tt = /-([a-z]|[0-9])/ig,
        it = /complete|loaded/,
        t = document,
        u = window,
        rt = [].forEach,
        e = t.createElement("div"),
        f;
    n.fn = n.prototype = {
        init: function (i, r) {
            if (i)
                if (v(i) || i === t || i === u || i instanceof DocumentFragment)
                    this[0] = i,
                        this.length = 1;
                else {
                    if (s(r))
                        return n(r).find(i);
                    if (o(i))
                        if (d.test(i)) {
                            e.innerHTML = i;
                            for (var f = e.firstChild; f;)
                                this.push(f),
                                    e.removeChild(f),
                                    f = e.firstChild
                        } else
                            i !== "" && (c(this, b(t, i)),
                                this.selector = i);
                    else {
                        if (a(i))
                            return n(t).ready(i);
                        ut(i) ? (c(this, i),
                            s(i.selector) && (this.selector = i.selector)) : h(i) && (this[0] = i,
                                this.length = 1)
                    }
                }
        },
        selector: "",
        length: 0,
        size: function () {
            return this.length
        },
        get: function (n) {
            return i(n) ? this : this[n]
        },
        push: function (n) {
            return this[this.length++] = n,
                this
        },
        each: function (n) {
            return rt.call(this, function (t, i) {
                n.call(t, i, t)
            }),
                this
        },
        find: function (t) {
            return this.length === 1 ? c(this, b(this[0], t)) : n()
        },
        eq: function (t) {
            return n(this[t])
        },
        first: function () {
            return n(this[0])
        },
        last: function () {
            return n(this[this.length - 1])
        },
        empty: function () {
            return this.each(function () {
                this.innerHTML = ""
            })
        },
        remove: function () {
            return this.each(function () {
                var n = this.parentNode;
                n && n.removeChild(this)
            })
        },
        ready: function (n) {
            return it.test(t.readyState) ? n() : t.addEventListener("DOMContentLoaded", n, false),
                this
        },
        hasClass: function (n) {
            return this.length < 1 ? false : l(n).test(this[0].className)
        },
        addClass: function (n) {
            return this.each(function () {
                y(this, n) || p(this, n)
            })
        },
        removeClass: function (n) {
            return this.each(function () {
                w(this, n)
            })
        },
        toggleClass: function (n, t) {
            return (i(t) || t) && this.each(function () {
                y(this, n) ? w(this, n) : p(this, n)
            }),
                this
        },
        val: function (n) {
            return i(n) ? this.length > 0 ? this[0].value : f : this.each(function () {
                this.value = n
            })
        },
        prop: function (n, t) {
            return i(t) ? this.length > 0 ? this[0][n] : f : this.each(function () {
                this[n] = t
            })
        },
        attr: function (n, t) {
            return i(t) ? this.length > 0 ? this[0].getAttribute(n) : f : this.each(function () {
                this.setAttribute(n, t)
            })
        },
        removeAttr: function (n) {
            return this.each(function () {
                this.removeAttribute(n)
            })
        },
        html: function (n) {
            return i(n) ? this[0].innerHTML : this.each(function () {
                this.innerHTML = n
            })
        },
        text: function (n) {
            return i(n) ? this[0].innerText : this.each(function () {
                this.innerText = n
            })
        },
        insertHTML: function (n, t) {
            return this.each(function () {
                this.insertAdjacentHTML(n, t)
            })
        },
        before: function (n) {
            return this.insertHTML("beforeBegin", n)
        },
        prepend: function (n) {
            return this.insertHTML("afterBegin", n)
        },
        append: function (n) {
            return this.insertHTML("beforeEnd", n)
        },
        after: function (n) {
            return this.insertHTML("afterEnd", n)
        },
        css: function (n, t) {
            var r, f = "";
            if (i(t) && o(n))
                return this[0].style[et(n)] || u.getComputedStyle(this[0], "").getPropertyValue(n);
            if (o(n))
                f = n + ":" + t;
            else
                for (r in n)
                    f += r + ":" + n[r] + ";";
            return this.each(function () {
                this.style.cssText += ";" + f
            })
        },
        on: function (n, t) {
            return this.each(function () {
                ot(this, n, t)
            })
        },
        off: function (n, t) {
            return this.each(function () {
                st(this, n, t)
            })
        },
        trigger: function (t, i) {
            return o(t) ? t = n.Event(t, i) : i && (t.data = i),
                this.each(function () {
                    this.dispatchEvent(t)
                })
        }
    };
    n.fn.init.prototype = n.fn;
    n.extend = function (n, t) {
        for (var i in t)
            t.hasOwnProperty(i) && (n[i] = t[i]);
        return n
    };
    n.isArray = function (n) {
        return n instanceof Array
    };
    n.isObject = h;
    n.isFunction = a;
    n.noop = function () { };
    n.id = function (n) {
        return t.getElementById(n)
    };
    n.Event = function (n, i) {
        var u = t.createEvent("Event"),
            f = true,
            r;
        if (i)
            for (r in i)
                r === "bubbles" ? f = !!i[r] : u[r] = i[r];
        return u.initEvent(n, f, true),
            u
    };
    "focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select keydown keypress keyup error contextmenu".split(" ").forEach(function (t) {
        n.fn[t] = function (n) {
            return i(n) ? this.trigger(t) : this.on(t, n)
        }
    });
    u.Qx = n;
    "$" in u || (u.$ = n)
})();
self.Jx = {};
Jx.isWWA = "Windows" in self;
Jx.isWorker = "WorkerGlobalScope" in self;
Jx.isTrident = "msCapture" in self;
Jx.inherit = function (n, t) {
    function i() { }
    i.prototype = t.prototype || t;
    n.prototype = new i;
    n.prototype.constructor = n
};
Jx.mix = function (n, t) {
    for (var i in t)
        t.hasOwnProperty(i) && (n[i] = t[i]);
    return n
};
Jx.augment = function (n, t) {
    return Jx.mix(n.prototype, t.prototype || t)
};
Jx.dispose = function (n) {
    n && n.dispose ? n.dispose() : n && n.close && n.close()
};
Jx._escapeRegex = /[&<>'"]/g;
Jx._escapeChars = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
};
Jx._escapeFn = function (n) {
    return Jx._escapeChars[n] || " "
};
Jx.escapeHtml = function (n) {
    return n.replace(Jx._escapeRegex, Jx._escapeFn)
};
Jx._escapeToSingleLineRegex = /[\n\r]+|[&<>'"]/g;
Jx.escapeHtmlToSingleLine = function (n) {
    return n.replace(Jx._escapeToSingleLineRegex, Jx._escapeFn)
};
Jx.fnEmptyString = function () {
    return ""
};
Jx.fnEmpty = function () { };
Jx.isString = function (n) {
    return typeof n == "string"
};
Jx.isNonEmptyString = function (n) {
    return typeof n == "string" && Boolean(n)
};
Jx.isDefined = function (n) {
    return n != null
};
Jx.isNullOrUndefined = function (n) {
    return n === undefined || n === null
};
Jx.isUndefined = function (n) {
    return n === undefined
};
Jx.isObject = function (n) {
    return n !== undefined && n !== null && typeof n == "object"
};
Jx.isInstanceOf = function (n, t) {
    if (!Jx.isObject(n))
        return false;
    return t === undefined || n instanceof t
};
Jx.isObjectType = function (n) {
    return typeof n == "object"
};
Jx.isFunction = function (n) {
    return typeof n == "function"
};
Jx.isArray = function (n) {
    return Array.isArray(n)
};
Jx.isNumber = function (n) {
    return typeof n == "number"
};
Jx.isValidNumber = function (n) {
    return typeof n == "number" && isFinite(n)
};
Jx.isBoolean = function (n) {
    return typeof n == "boolean"
};
Jx.isDate = function (n) {
    return n instanceof Date
};
Jx._uidLast = 0;
Jx.uid = function () {
    return ++this._uidLast
};
Jx._markPrefix = "";
Jx.setMarkPrefix = function (n) {
    Jx._markPrefix = n
};
Jx.mark = function (n) {
    msWriteProfilerMark(Jx._markPrefix + n)
};
Jx._startTA = function (n) {
    Jx.mark("Jx." + n + ",StartTA,Jx")
};
Jx._stopTA = function (n) {
    Jx.mark("Jx." + n + ",StopTA,Jx")
};
Jx.help = function (n) {
    var t, i;
    t = Windows.System;
    i = new t.LauncherOptions;
    i.desiredRemainingView = Windows.UI.ViewManagement.ViewSizePreference.useHalf;
    t.Launcher.launchUriAsync(new Windows.Foundation.Uri("http://go.microsoft.com/fwlink/p/?LinkId=" + {
        calendar: "282451",
        mail: "282452",
        people: "282453"
    }[n]), i).done()
};
Jx.abi = null;
Jx.initABI = function () {
    Jx._startTA("abi");
    Jx.abi = new Microsoft.WindowsLive.Jx;
    Jx._stopTA("abi");
    Jx.initABI = Jx.fnEmpty
};
Jx.etw = function (n) {
    Jx.initABI();
    Jx.abi.etw(n)
};
Jx.startSession = function () {
    Jx.initABI();
    Jx.abi.startSession()
};
Jx.flushSession = function () {
    Jx.abi && Jx.abi.flushSession()
};
Jx.ptStart = function (n, t) {
    Jx.initABI();
    Jx.abi.ptStart(n, t || "")
};
Jx.ptStop = function (n, t) {
    Jx.initABI();
    Jx.abi.ptStop(n, t || "")
};
Jx.ptStopData = function (n, t, i, r, u, f, e, o, s) {
    Jx.initABI();
    Jx.abi.ptStopData(n, t, i, r, u, f, e, o, s)
};
Jx.TimePoint = {
    visibleComplete: 0,
    responsive: 1
};
Jx.ptStopLaunch = function (n, t) {
    Jx.initABI();
    Jx.abi.ptStopLaunch(n, t)
};
Jx.ptStopResume = function (n) {
    Jx.initABI();
    Jx.abi.ptStopResume(n)
};
Jx.ptStopResize = function (n, t, i, r, u) {
    Jx.initABI();
    Jx.abi.ptStopResize(n, t, i, r, u)
};
Jx.fault = function (n, t, i) {
    var r = "Jx.fault: ( " + n + " ) : ( " + t + " )",
        u = -1;
    Jx.isValidNumber(i) && (i = {
        number: i,
        message: "From HRESULT"
    });
    i ? (Jx.log && Jx.log.exception(r, i),
        Jx.isNumber(i.number) && (u = i.number)) : Jx.log && Jx.log.error(r);
    Jx.initABI();
    Jx.abi.fault(n, t, u)
};
Jx.erRegisterFile = function (n) {
    Jx.log.info("Jx.erRegisterFile: " + n);
    Jx.initABI();
    Jx.abi.erRegisterFile(n)
};
Jx.promoteOriginalStack = function (n) {
    var t, i;
    n instanceof Error && (t = n.stack,
        Jx.isNonEmptyString(t) && (i = n.description,
            n.description = Jx.isNonEmptyString(i) && t.indexOf(i) === 0 ? t : JSON.stringify(i) + " " + t))
};
Jx.findKey = function (n, t) {
    for (var i in n)
        if (n[i] === t)
            return i
};
Jx.getAppNameFromId = function (n) {
    for (var r = Object.keys(Jx.AppId), u = r.length, i, t = 0; t < u; t++)
        if (i = r[t],
            Jx.AppId[i] === n && i !== "min")
            return i
};
Jx.terminateApp = function (n) {
    if (n || (n = new Error("[Jx.terminateApp: no original error]")),
        Jx.isString(n.description) || (n.description = n.message || "[Jx.terminateApp: no original description/message]"), !Jx.isString(n.stack)) {
        if (n instanceof Error)
            try {
                throw n
            } catch (t) {
                n.stack = "[Jx.terminateApp] " + t.stack
            }
        Jx.isString(n.stack) || (n.stack = "[Jx.terminateApp: no original stack]")
    }
    Jx.isValidNumber(n.number) || (n.number = 0);
    MSApp.terminateApp(n)
};
Jx.ensurePromiseErrorHandling = function () {
    var i;
    if (Boolean(window.WinJS) && Boolean(window.WinJS.Promise)) {
        Jx.ensurePromiseErrorHandling = function () { };
        var n = function (n) {
            if (n instanceof Error) {
                if (n.name === "Canceled")
                    return
            } else {
                var t;
                try {
                    t = JSON.stringify(n)
                } catch (i) {
                    t = "[Jx terminateOnError: unknown description]"
                }
                n = new Error(t)
            }
            Jx.terminateApp(n)
        },
            t = WinJS.Promise.wrapError(null),
            r = Object.getPrototypeOf(t).done;
        Object.getPrototypeOf(t).done = function (t, i, u) {
            i = i || n;
            r.call(this, t, i, u)
        };
        i = WinJS.Promise.wrap();
        Object.getPrototypeOf(i).done = function (t) {
            this.then(t).then(null, n)
        }
    }
};
Jx.appId = -1,
    function () {
        function i(t) {
            var r, i, u;
            return t in n || (r = "DTF:" + t,
                Jx._startTA(r),
                i = Jx.dtf(),
                u = t === "shortDate" ? i.shortDate : t === "longDate" ? i.longDate : t === "shortTime" ? i.shortTime : new i(t),
                n[t] = u,
                Jx._stopTA(r)),
                n[t]
        }
        var r, n, t;
        Jx.dtf = function () {
            return r || (r = Windows.Globalization.DateTimeFormatting.DateTimeFormatter)
        };
        n = {};
        t = Jx.DTFormatter = function (n) {
            this._pattern = n
        };
        t.prototype = {
            format: function (n) {
                return i(this._pattern).format(n)
            }
        };
        Object.defineProperty(t.prototype, "clock", {
            get: function () {
                return i(this._pattern).clock
            }
        })
    }();
Jx.isHTMLElement = function (n) {
    return Boolean(n && n.nodeType === 1)
};
Jx.isRtl = function () {
    return document.body.style.direction === "rtl"
};
Jx.addStyle = function (n) {
    if (Jx.isNonEmptyString(n)) {
        var t = document.createElement("style");
        t.type = "text/css";
        t.innerText = n;
        document.head.appendChild(t)
    }
};
Jx.addStyleToDocument = function (n, t) {
    var i;
    return Jx.isNonEmptyString(n) && (i = t.createElement("style"),
        i.type = "text/css",
        i.innerText = n,
        t.head.appendChild(i)),
        i
};
Jx.loadCss = function (n) {
    Jx.mark("Jx.loadCss:" + n + ",StartTA,Jx");
    var t = document.createElement("link");
    t.rel = "stylesheet";
    t.href = n;
    document.head.appendChild(t);
    Jx.mark("Jx.loadCss:" + n + ",StopTA,Jx")
};
Jx.hasClass = function (n, t) {
    return Boolean(n.className.match(new RegExp("(\\s|^)" + t + "(\\s|$)")))
};
Jx.addClass = function (n, t) {
    return this.hasClass(n, t) ? false : (n.className += " " + t,
        true)
};
Jx.removeClass = function (n, t) {
    if (this.hasClass(n, t)) {
        var i = new RegExp("(\\s|^)" + t + "(\\s|$)");
        return n.className = n.className.replace(i, " "),
            true
    }
    return false
};
Jx.setClass = function (n, t, i) {
    i ? this.addClass(n, t) : this.removeClass(n, t)
};
Jx.parseHash = function (n) {
    var r, u, t, f, i;
    for (r = {},
        u = n.split("&"),
        t = 0,
        f = u.length; t < f; t++)
        i = u[t].split("="),
            i[0] !== "" && (r[i[0]] = i[1]);
    return r
};
Jx.safeSetActive = function (n) {
    try {
        n.focus()
    } catch (t) {
        return Jx.log.exception("setActive() failed for element with Id = " + n.id, t),
            false
    }
    return true
};
Jx.observeMutation = function (n, t, i, r) {
    var u = new MutationObserver(i.bind(r));
    return u.observe(n, t),
        u
};
Jx.observeAttribute = function (n, t, i, r) {
    return Jx.observeMutation(n, {
        attributes: true,
        attributeFilter: [t]
    }, i, r)
};
Jx.intersectsNode = function (n, t, i) {
    var e, r, u, f;
    return e = t.ownerDocument,
        r = e.createRange(),
        r.selectNodeContents(t),
        u = r.compareBoundaryPoints(Range.START_TO_END, n),
        f = r.compareBoundaryPoints(Range.END_TO_START, n),
        i ? u > 0 && f < 0 : u >= 0 && f <= 0
};
Jx.loadScript = function (n) {
    return new WinJS.Promise(function (t, i) {
        var r = document.createElement("script");
        r.addEventListener("load", function () {
            t(n)
        });
        r.addEventListener("error", i);
        r.src = n;
        document.head.appendChild(r)
    })
};
Jx.loadScripts = function (n) {
    return WinJS.Promise.join(n.map(Jx.loadScript))
};
Jx.Log = function () { };
Jx.LOG_ALWAYS = 0;
Jx.LOG_CRITICAL = 1;
Jx.LOG_ERROR = 2;
Jx.LOG_WARNING = 3;
Jx.LOG_INFORMATIONAL = 4;
Jx.LOG_VERBOSE = 5;
Jx.Log.prototype = {
    enabled: true,
    piiEnabledInShip: false,
    level: Jx.LOG_VERBOSE,
    _writeMsg: function (n) {
        console.log(n)
    },
    write: function (n, t) {
        this.enabled && n <= this.level && this._writeMsg(t)
    },
    always: function (n) {
        this.write(Jx.LOG_ALWAYS, n)
    },
    critical: function (n) {
        this.write(Jx.LOG_CRITICAL, n)
    },
    error: function (n) {
        this.write(Jx.LOG_ERROR, n)
    },
    warning: function (n) {
        this.write(Jx.LOG_WARNING, n)
    },
    info: function (n) {
        this.write(Jx.LOG_INFORMATIONAL, n)
    },
    verbose: function (n) {
        this.write(Jx.LOG_VERBOSE, n)
    },
    perf: function (n, t) {
        this.info(n + (t ? " " + JSON.stringify(t) : ""))
    },
    exception: function (n, t) {
        this.write(Jx.LOG_ERROR, n + "\n" + (t.stack || t.description || t.message || t.toString()) + "\nError Code: " + t.number)
    },
    pii: function (n) {
        this.piiEnabledInShip && this.info(n)
    }
};
Jx.log = new Jx.Log;
Jx.Base = {
    _initBase: false,
    _shutdownBase: false,
    initBase: function () {
        this._initBase = true
    },
    shutdownBase: function () {
        this._shutdownBase = true
    },
    isInit: function () {
        return this._initBase
    },
    isShutdown: function () {
        return this._shutdownBase
    }
};
Jx.delayDefine = function (n, t, i) {
    if (Jx.isNonEmptyString(t))
        Object.defineProperty(n, t, {
            get: function () {
                return Object.defineProperty(n, t, {
                    value: undefined,
                    writable: true
                }),
                    Jx.mark("Jx.delayDefine:" + t + ",StartTA,Jx"),
                    i(),
                    Jx.mark("Jx.delayDefine:" + t + ",StopTA,Jx"),
                    n[t]
            },
            set: function (i) {
                Object.defineProperty(n, t, {
                    value: i,
                    writable: true
                })
            },
            enumerable: true,
            configurable: true
        });
    else if (Jx.isArray(t))
        for (var r = 0, u = t.length; r < u; r++)
            Jx.delayDefine(n, t[r], i)
};
Jx._delayGroups = {};
Jx.delayGroup = function (n, t) {
    var i = Jx._delayGroups,
        r = i[n] = i[n] || [];
    r.push(t)
};
Jx.delayGroupExec = function (n) {
    var r, t, i, u;
    if (r = Jx._delayGroups,
        t = r[n],
        t) {
        for (Jx.mark("Jx.delayGroupExec:" + n + ",StartTA,Jx"),
            i = 0,
            u = t.length; i < u; i++)
            t[i]();
        Jx.mark("Jx.delayGroupExec:" + n + ",StopTA,Jx");
        r[n] = null
    }
};
Jx.delayDefine(Jx, "Dep", function () {
    "use strict";

    function r(n) {
        Jx.mark("Jx.Dep." + n + ",Info,Jx")
    }

    function p(n) {
        Jx.mark("Jx.Dep." + n + ",StartTA,Jx")
    }

    function w(n) {
        Jx.mark("Jx.Dep." + n + ",StopTA,Jx")
    }

    function f(n) {
        Jx.mark("Jx.Dep." + n + ",StartTM,Jx")
    }

    function e(n) {
        Jx.mark("Jx.Dep." + n + ",StopTM,Jx")
    }

    function o(n) {
        var t = n.href;
        return t ? t.match(y)[1].toLowerCase() : ""
    }

    function s(t) {
        return t = t.toLowerCase(),
            t in n && n[t] === null
    }

    function b(t) {
        var i = t.target,
            f = "src" in i ? i.getAttribute("src") : o(i),
            s, u, h;
        for (s = n[f].fns,
            u = 0,
            h = s.length; u < h; u++)
            s[u]();
        i.onload = null;
        n[f] = null;
        e("load:" + f)
    }

    function h(i, r) {
        if (n[i])
            n[i].fns.push(r);
        else {
            f("load:" + i);
            var e = a.test(i),
                u = document.createElement(e ? "script" : "link");
            n[i] = {
                e: u,
                fns: [r]
            };
            e ? u.src = i : (u.type = "text/css",
                u.rel = "stylesheet",
                u.href = i);
            u.onload = b;
            t.appendChild(u)
        }
    }

    function u(n, t, i) {
        for (var f, r = 0, e = n.length; r < e; r++)
            f = n[r],
                f in t ? u(t[f], t, i) : i.push(f)
    }

    function k() {
        var u, t, r, i, f, e;
        for (p("depCollect"),
            u = document.scripts,
            t = 0,
            r = u.length; t < r; t++)
            i = u[t].getAttribute("src"),
                i && (i = i.toLowerCase(),
                    n[i] = null);
        for (f = document.styleSheets,
            t = 0,
            r = f.length; t < r; t++)
            e = o(f[t]),
                e && (n[e] = null);
        w("depCollect")
    }

    function c(n) {
        for (var t = 0, i = n.length; t < i; t++)
            n[t] = n[t].toLowerCase();
        return n
    }

    function d(n, t) {
        i[n.toLowerCase()] = c(t)
    }

    function l(o, s) {
        function w() {
            --y == 0 && (e("depLoad"),
                s())
        }
        var l, v, y, a, p;
        for (f("depLoad"),
            Jx.isString(o) && (o = [o]),
            t || (t = document.head),
            l = [],
            u(c(o), i, l),
            v = l.length,
            y = v,
            a = 0; a < v; a++)
            p = l[a],
                n[p] === null ? w() : h(p, w)
    }

    function g(n) {
        return new WinJS.Promise(function (t) {
            l(n, t)
        })
    }
    var a = /\.js$/i,
        v = /\.css$/i,
        y = /.+\/\/[^\/]+(\/.+)/,
        t = null,
        i = {},
        n = {};
    Jx.Dep = {
        collect: k,
        name: d,
        load: l,
        isLoaded: s,
        loadAsync: g
    }
});
Jx.delayDefine(Jx, ["Bici", "bici"], function () {
    Jx.Bici = function () {
        if (Jx.mark("Jx.Bici(),StartTA,Jx,Bici"),
            Jx.isWWA)
            try {
                this._bici = new Microsoft.WindowsLive.Instrumentation.Bici
            } catch (n) {
                this._reportError("Failed to create Microsoft.WindowsLive.Instrumentation.Bici, error message = " + n.message + ", error code = " + n.number)
            }
        Jx.mark("Jx.Bici(),StopTA,Jx,Bici")
    };
    var n = Jx.Bici.prototype;
    n._bici = null;
    n.dispose = function () {
        this._bici = null
    };
    n._safeCall = function (n, t, i, r, u, f, e, o, s, h, c) {
        var l;
        if (n !== null && n !== undefined)
            try {
                l = i === undefined ? n[t]() : r === undefined ? n[t](i) : u === undefined ? n[t](i, r) : f === undefined ? n[t](i, r, u) : e === undefined ? n[t](i, r, u, f) : o === undefined ? n[t](i, r, u, f, e) : s === undefined ? n[t](i, r, u, f, e, o) : h === undefined ? n[t](i, r, u, f, e, o, s) : c === undefined ? n[t](i, r, u, f, e, o, s, h) : n[t](i, r, u, f, e, o, s, h, c)
            } catch (a) {
                this._reportError("Failed to invoke method " + t + " , error message = " + a.message + ", error code = " + a.number);
                l = false
            }
        else
            l = false;
        return l
    };
    n._reportError = function (n) {
        Jx.log.error(n)
    };
    n._createValueList = function () {
        var t, i, u, n;
        try {
            t = new Microsoft.WindowsLive.Instrumentation.DatapointValueList
        } catch (r) {
            return this._reportError("Failed to create Microsoft.WindowsLive.Instrumentation.DatapointValueList, error message = " + r.message + ", error code = " + r.number),
                null
        }
        for (i = 0,
            u = arguments.length; i < u; i++) {
            n = arguments[i];
            switch (typeof n) {
                case "number":
                    if (this._safeCall(t, "add", n) === false)
                        return;
                    break;
                case "string":
                    if (this._safeCall(t, "addString", n) === false)
                        return;
                    break;
                default:
                    if (n === null) {
                        if (this._safeCall(t, "addString", null) === false)
                            return
                    } else
                        this._reportError("Invalid input: parameter #" + String(i) + " type is " + typeof n)
            }
        }
        return t
    };
    n.startExperience = function () {
        this._safeCall(this._bici, "startExperience")
    };
    n.endExperience = function () {
        this._safeCall(this._bici, "endExperience")
    };
    n.pauseExperience = function () {
        this._safeCall(this._bici, "pauseExperience")
    };
    n.continueExperience = function () {
        this._safeCall(this._bici, "continueExperience")
    };
    n.transferExperienceToWeb = function (n) {
        return this._safeCall(this._bici, "transferExperienceToWeb", n)
    };
    n.set = function (n, t) {
        this._safeCall(this._bici, "set", n, t)
    };
    n.setString = function (n, t) {
        this._safeCall(this._bici, "setString", n, t)
    };
    n.increment = function (n, t) {
        this._safeCall(this._bici, "increment", n, t)
    };
    n.addToStream = function (n, t) {
        if (n === undefined) {
            this._reportError("Invalid input: parameter datapointId is undefined");
            return
        }
        if (t === undefined) {
            this._reportError("Invalid input: parameter datapointValue is undefined");
            return
        }
        var i = Array.prototype.slice.call(arguments, 1),
            r = this._createValueList.apply(this, i);
        this._safeCall(this._bici, "addToStream", n, r)
    };
    n.getExperienceId = function () {
        var n = this._safeCall(this._bici, "getExperienceId");
        return n === false ? null : n
    };
    n.getApplicationId = function () {
        var n = null;
        if (this._bici !== null && this._bici !== undefined)
            try {
                n = this._bici.applicationId
            } catch (t) {
                this._reportError("Failed to get applicationId, error message = " + t.message + ", error code = " + t.number);
                n = null
            }
        return n
    };
    n.recordDependentApiQos = function (n, t, i, r, u, f, e, o) {
        var s = this._createValueList.apply(this, Array.prototype.slice.call(arguments, 8));
        this._safeCall(this._bici, "recordDependentApiQos", n, t, i, r, u, f, e, o, s)
    };
    n.recordIncomingApiQos = function (n, t, i, r, u, f, e, o) {
        var s = this._createValueList.apply(this, Array.prototype.slice.call(arguments, 8));
        this._safeCall(this._bici, "recordIncomingApiQos", n, t, i, r, u, f, e, o, s)
    };
    n.recordInternalApiQos = function (n, t, i, r, u, f, e) {
        var o = this._createValueList.apply(this, Array.prototype.slice.call(arguments, 7));
        this._safeCall(this._bici, "recordInternalApiQos", n, t, i, r, u, f, e, o)
    };
    n.recordScenarioQos = function (n, t, i, r, u, f) {
        var e = this._createValueList.apply(this, Array.prototype.slice.call(arguments, 6));
        this._safeCall(this._bici, "recordScenarioQos", n, t, i, r, u, f, e)
    };
    Jx.bici = null
});
Jx.delayDefine(Jx, "Bidi", function () {
    function i(n, t) {
        for (var r, u = 0, f = t.length; u < f; u++)
            if (r = t[u],
                r.start <= n && r.end >= n)
                return r.direction ? r.direction : i(n, r.values);
        return null
    }
    var r = Jx._Biditable,
        t = function (n) {
            this._str = n;
            this._index = 0;
            this._length = n.length
        },
        n;
    t.prototype.nextCharCode = function () {
        var n, t;
        if (this._index >= this._length)
            return null;
        for (n = this._str[this._index++];
            /\s\d/.test(n);) {
            if (this._index >= this._length)
                return null;
            n = this._str[this._index++]
        }
        if (/[\uD800-\uDFFF]/.test(n)) {
            if (this._index >= this._length)
                return null;
            t = this._str[this._index++];
            n = n.charCodeAt(0);
            t = t.charCodeAt(0);
            n = this._combineSurrogatePair(n, t)
        } else
            n = n.charCodeAt(0);
        return n
    };
    t.prototype._combineSurrogatePair = function (n, t) {
        return 65536 + (n - 55296) * 1024 + (t - 56320)
    };
    n = Jx.Bidi = {
        getTextDirection: function (u) {
            for (var o = new t(u), e, f = o.nextCharCode(); f;) {
                if (e = i(f, r),
                    e !== null)
                    return e;
                f = o.nextCharCode()
            }
            return n.Values.none
        },
        getDocumentDirection: function (t) {
            return n.getElementDirection(t.documentElement) || n.getElementDirection(t.body)
        },
        getElementDirection: function (n) {
            return n.dir || n.style.direction
        },
        Values: {
            ltr: "ltr",
            rtl: "rtl",
            none: "none"
        }
    }
});
Jx.delayDefine(Jx, "_Biditable", function () {
    Jx._Biditable = [{
        start: 65,
        end: 2307,
        values: [{
            start: 65,
            end: 660,
            values: [{
                start: 65,
                end: 90,
                direction: "ltr"
            }, {
                start: 97,
                end: 122,
                direction: "ltr"
            }, {
                start: 170,
                end: 170,
                direction: "ltr"
            }, {
                start: 181,
                end: 181,
                direction: "ltr"
            }, {
                start: 186,
                end: 186,
                direction: "ltr"
            }, {
                start: 192,
                end: 214,
                direction: "ltr"
            }, {
                start: 216,
                end: 246,
                direction: "ltr"
            }, {
                start: 248,
                end: 442,
                direction: "ltr"
            }, {
                start: 443,
                end: 443,
                direction: "ltr"
            }, {
                start: 444,
                end: 447,
                direction: "ltr"
            }, {
                start: 448,
                end: 451,
                direction: "ltr"
            }, {
                start: 452,
                end: 659,
                direction: "ltr"
            }, {
                start: 660,
                end: 660,
                direction: "ltr"
            }]
        }, {
            start: 661,
            end: 908,
            values: [{
                start: 661,
                end: 687,
                direction: "ltr"
            }, {
                start: 688,
                end: 696,
                direction: "ltr"
            }, {
                start: 699,
                end: 705,
                direction: "ltr"
            }, {
                start: 720,
                end: 721,
                direction: "ltr"
            }, {
                start: 736,
                end: 740,
                direction: "ltr"
            }, {
                start: 750,
                end: 750,
                direction: "ltr"
            }, {
                start: 880,
                end: 883,
                direction: "ltr"
            }, {
                start: 886,
                end: 887,
                direction: "ltr"
            }, {
                start: 890,
                end: 890,
                direction: "ltr"
            }, {
                start: 891,
                end: 893,
                direction: "ltr"
            }, {
                start: 902,
                end: 902,
                direction: "ltr"
            }, {
                start: 904,
                end: 906,
                direction: "ltr"
            }, {
                start: 908,
                end: 908,
                direction: "ltr"
            }]
        }, {
            start: 910,
            end: 1470,
            values: [{
                start: 910,
                end: 929,
                direction: "ltr"
            }, {
                start: 931,
                end: 1013,
                direction: "ltr"
            }, {
                start: 1015,
                end: 1153,
                direction: "ltr"
            }, {
                start: 1154,
                end: 1154,
                direction: "ltr"
            }, {
                start: 1162,
                end: 1319,
                direction: "ltr"
            }, {
                start: 1329,
                end: 1366,
                direction: "ltr"
            }, {
                start: 1369,
                end: 1369,
                direction: "ltr"
            }, {
                start: 1370,
                end: 1375,
                direction: "ltr"
            }, {
                start: 1377,
                end: 1415,
                direction: "ltr"
            }, {
                start: 1417,
                end: 1417,
                direction: "ltr"
            }, {
                start: 1424,
                end: 1424,
                direction: "rtl"
            }, {
                start: 1470,
                end: 1470,
                direction: "rtl"
            }]
        }, {
            start: 1472,
            end: 1547,
            values: [{
                start: 1472,
                end: 1472,
                direction: "rtl"
            }, {
                start: 1475,
                end: 1475,
                direction: "rtl"
            }, {
                start: 1478,
                end: 1478,
                direction: "rtl"
            }, {
                start: 1480,
                end: 1487,
                direction: "rtl"
            }, {
                start: 1488,
                end: 1514,
                direction: "rtl"
            }, {
                start: 1515,
                end: 1519,
                direction: "rtl"
            }, {
                start: 1520,
                end: 1522,
                direction: "rtl"
            }, {
                start: 1523,
                end: 1524,
                direction: "rtl"
            }, {
                start: 1525,
                end: 1535,
                direction: "rtl"
            }, {
                start: 1541,
                end: 1541,
                direction: "rtl"
            }, {
                start: 1544,
                end: 1544,
                direction: "rtl"
            }, {
                start: 1547,
                end: 1547,
                direction: "rtl"
            }]
        }, {
            start: 1549,
            end: 1749,
            values: [{
                start: 1549,
                end: 1549,
                direction: "rtl"
            }, {
                start: 1563,
                end: 1563,
                direction: "rtl"
            }, {
                start: 1564,
                end: 1565,
                direction: "rtl"
            }, {
                start: 1566,
                end: 1567,
                direction: "rtl"
            }, {
                start: 1568,
                end: 1599,
                direction: "rtl"
            }, {
                start: 1600,
                end: 1600,
                direction: "rtl"
            }, {
                start: 1601,
                end: 1610,
                direction: "rtl"
            }, {
                start: 1645,
                end: 1645,
                direction: "rtl"
            }, {
                start: 1646,
                end: 1647,
                direction: "rtl"
            }, {
                start: 1649,
                end: 1747,
                direction: "rtl"
            }, {
                start: 1748,
                end: 1748,
                direction: "rtl"
            }, {
                start: 1749,
                end: 1749,
                direction: "rtl"
            }]
        }, {
            start: 1765,
            end: 1957,
            values: [{
                start: 1765,
                end: 1766,
                direction: "rtl"
            }, {
                start: 1774,
                end: 1775,
                direction: "rtl"
            }, {
                start: 1786,
                end: 1788,
                direction: "rtl"
            }, {
                start: 1789,
                end: 1790,
                direction: "rtl"
            }, {
                start: 1791,
                end: 1791,
                direction: "rtl"
            }, {
                start: 1792,
                end: 1805,
                direction: "rtl"
            }, {
                start: 1806,
                end: 1806,
                direction: "rtl"
            }, {
                start: 1807,
                end: 1807,
                direction: "rtl"
            }, {
                start: 1808,
                end: 1808,
                direction: "rtl"
            }, {
                start: 1810,
                end: 1839,
                direction: "rtl"
            }, {
                start: 1867,
                end: 1868,
                direction: "rtl"
            }, {
                start: 1869,
                end: 1957,
                direction: "rtl"
            }]
        }, {
            start: 1969,
            end: 2095,
            values: [{
                start: 1969,
                end: 1969,
                direction: "rtl"
            }, {
                start: 1970,
                end: 1983,
                direction: "rtl"
            }, {
                start: 1984,
                end: 1993,
                direction: "rtl"
            }, {
                start: 1994,
                end: 2026,
                direction: "rtl"
            }, {
                start: 2036,
                end: 2037,
                direction: "rtl"
            }, {
                start: 2042,
                end: 2042,
                direction: "rtl"
            }, {
                start: 2043,
                end: 2047,
                direction: "rtl"
            }, {
                start: 2048,
                end: 2069,
                direction: "rtl"
            }, {
                start: 2074,
                end: 2074,
                direction: "rtl"
            }, {
                start: 2084,
                end: 2084,
                direction: "rtl"
            }, {
                start: 2088,
                end: 2088,
                direction: "rtl"
            }, {
                start: 2094,
                end: 2095,
                direction: "rtl"
            }]
        }, {
            start: 2096,
            end: 2307,
            values: [{
                start: 2096,
                end: 2110,
                direction: "rtl"
            }, {
                start: 2111,
                end: 2111,
                direction: "rtl"
            }, {
                start: 2112,
                end: 2136,
                direction: "rtl"
            }, {
                start: 2140,
                end: 2141,
                direction: "rtl"
            }, {
                start: 2142,
                end: 2142,
                direction: "rtl"
            }, {
                start: 2143,
                end: 2207,
                direction: "rtl"
            }, {
                start: 2208,
                end: 2208,
                direction: "rtl"
            }, {
                start: 2209,
                end: 2209,
                direction: "rtl"
            }, {
                start: 2210,
                end: 2220,
                direction: "rtl"
            }, {
                start: 2221,
                end: 2275,
                direction: "rtl"
            }, {
                start: 2303,
                end: 2303,
                direction: "rtl"
            }, {
                start: 2307,
                end: 2307,
                direction: "ltr"
            }]
        }]
    }, {
        start: 2308,
        end: 3058,
        values: [{
            start: 2308,
            end: 2423,
            values: [{
                start: 2308,
                end: 2361,
                direction: "ltr"
            }, {
                start: 2363,
                end: 2363,
                direction: "ltr"
            }, {
                start: 2365,
                end: 2365,
                direction: "ltr"
            }, {
                start: 2366,
                end: 2368,
                direction: "ltr"
            }, {
                start: 2377,
                end: 2380,
                direction: "ltr"
            }, {
                start: 2382,
                end: 2383,
                direction: "ltr"
            }, {
                start: 2384,
                end: 2384,
                direction: "ltr"
            }, {
                start: 2392,
                end: 2401,
                direction: "ltr"
            }, {
                start: 2404,
                end: 2405,
                direction: "ltr"
            }, {
                start: 2406,
                end: 2415,
                direction: "ltr"
            }, {
                start: 2416,
                end: 2416,
                direction: "ltr"
            }, {
                start: 2417,
                end: 2417,
                direction: "ltr"
            }, {
                start: 2418,
                end: 2423,
                direction: "ltr"
            }]
        }, {
            start: 2425,
            end: 2510,
            values: [{
                start: 2425,
                end: 2431,
                direction: "ltr"
            }, {
                start: 2434,
                end: 2435,
                direction: "ltr"
            }, {
                start: 2437,
                end: 2444,
                direction: "ltr"
            }, {
                start: 2447,
                end: 2448,
                direction: "ltr"
            }, {
                start: 2451,
                end: 2472,
                direction: "ltr"
            }, {
                start: 2474,
                end: 2480,
                direction: "ltr"
            }, {
                start: 2482,
                end: 2482,
                direction: "ltr"
            }, {
                start: 2486,
                end: 2489,
                direction: "ltr"
            }, {
                start: 2493,
                end: 2493,
                direction: "ltr"
            }, {
                start: 2494,
                end: 2496,
                direction: "ltr"
            }, {
                start: 2503,
                end: 2504,
                direction: "ltr"
            }, {
                start: 2507,
                end: 2508,
                direction: "ltr"
            }, {
                start: 2510,
                end: 2510,
                direction: "ltr"
            }]
        }, {
            start: 2519,
            end: 2608,
            values: [{
                start: 2519,
                end: 2519,
                direction: "ltr"
            }, {
                start: 2524,
                end: 2525,
                direction: "ltr"
            }, {
                start: 2527,
                end: 2529,
                direction: "ltr"
            }, {
                start: 2534,
                end: 2543,
                direction: "ltr"
            }, {
                start: 2544,
                end: 2545,
                direction: "ltr"
            }, {
                start: 2548,
                end: 2553,
                direction: "ltr"
            }, {
                start: 2554,
                end: 2554,
                direction: "ltr"
            }, {
                start: 2563,
                end: 2563,
                direction: "ltr"
            }, {
                start: 2565,
                end: 2570,
                direction: "ltr"
            }, {
                start: 2575,
                end: 2576,
                direction: "ltr"
            }, {
                start: 2579,
                end: 2600,
                direction: "ltr"
            }, {
                start: 2602,
                end: 2608,
                direction: "ltr"
            }]
        }, {
            start: 2610,
            end: 2728,
            values: [{
                start: 2610,
                end: 2611,
                direction: "ltr"
            }, {
                start: 2613,
                end: 2614,
                direction: "ltr"
            }, {
                start: 2616,
                end: 2617,
                direction: "ltr"
            }, {
                start: 2622,
                end: 2624,
                direction: "ltr"
            }, {
                start: 2649,
                end: 2652,
                direction: "ltr"
            }, {
                start: 2654,
                end: 2654,
                direction: "ltr"
            }, {
                start: 2662,
                end: 2671,
                direction: "ltr"
            }, {
                start: 2674,
                end: 2676,
                direction: "ltr"
            }, {
                start: 2691,
                end: 2691,
                direction: "ltr"
            }, {
                start: 2693,
                end: 2701,
                direction: "ltr"
            }, {
                start: 2703,
                end: 2705,
                direction: "ltr"
            }, {
                start: 2707,
                end: 2728,
                direction: "ltr"
            }]
        }, {
            start: 2730,
            end: 2819,
            values: [{
                start: 2730,
                end: 2736,
                direction: "ltr"
            }, {
                start: 2738,
                end: 2739,
                direction: "ltr"
            }, {
                start: 2741,
                end: 2745,
                direction: "ltr"
            }, {
                start: 2749,
                end: 2749,
                direction: "ltr"
            }, {
                start: 2750,
                end: 2752,
                direction: "ltr"
            }, {
                start: 2761,
                end: 2761,
                direction: "ltr"
            }, {
                start: 2763,
                end: 2764,
                direction: "ltr"
            }, {
                start: 2768,
                end: 2768,
                direction: "ltr"
            }, {
                start: 2784,
                end: 2785,
                direction: "ltr"
            }, {
                start: 2790,
                end: 2799,
                direction: "ltr"
            }, {
                start: 2800,
                end: 2800,
                direction: "ltr"
            }, {
                start: 2818,
                end: 2819,
                direction: "ltr"
            }]
        }, {
            start: 2821,
            end: 2903,
            values: [{
                start: 2821,
                end: 2828,
                direction: "ltr"
            }, {
                start: 2831,
                end: 2832,
                direction: "ltr"
            }, {
                start: 2835,
                end: 2856,
                direction: "ltr"
            }, {
                start: 2858,
                end: 2864,
                direction: "ltr"
            }, {
                start: 2866,
                end: 2867,
                direction: "ltr"
            }, {
                start: 2869,
                end: 2873,
                direction: "ltr"
            }, {
                start: 2877,
                end: 2877,
                direction: "ltr"
            }, {
                start: 2878,
                end: 2878,
                direction: "ltr"
            }, {
                start: 2880,
                end: 2880,
                direction: "ltr"
            }, {
                start: 2887,
                end: 2888,
                direction: "ltr"
            }, {
                start: 2891,
                end: 2892,
                direction: "ltr"
            }, {
                start: 2903,
                end: 2903,
                direction: "ltr"
            }]
        }, {
            start: 2908,
            end: 2972,
            values: [{
                start: 2908,
                end: 2909,
                direction: "ltr"
            }, {
                start: 2911,
                end: 2913,
                direction: "ltr"
            }, {
                start: 2918,
                end: 2927,
                direction: "ltr"
            }, {
                start: 2928,
                end: 2928,
                direction: "ltr"
            }, {
                start: 2929,
                end: 2929,
                direction: "ltr"
            }, {
                start: 2930,
                end: 2935,
                direction: "ltr"
            }, {
                start: 2947,
                end: 2947,
                direction: "ltr"
            }, {
                start: 2949,
                end: 2954,
                direction: "ltr"
            }, {
                start: 2958,
                end: 2960,
                direction: "ltr"
            }, {
                start: 2962,
                end: 2965,
                direction: "ltr"
            }, {
                start: 2969,
                end: 2970,
                direction: "ltr"
            }, {
                start: 2972,
                end: 2972,
                direction: "ltr"
            }]
        }, {
            start: 2974,
            end: 3058,
            values: [{
                start: 2974,
                end: 2975,
                direction: "ltr"
            }, {
                start: 2979,
                end: 2980,
                direction: "ltr"
            }, {
                start: 2984,
                end: 2986,
                direction: "ltr"
            }, {
                start: 2990,
                end: 3001,
                direction: "ltr"
            }, {
                start: 3006,
                end: 3007,
                direction: "ltr"
            }, {
                start: 3009,
                end: 3010,
                direction: "ltr"
            }, {
                start: 3014,
                end: 3016,
                direction: "ltr"
            }, {
                start: 3018,
                end: 3020,
                direction: "ltr"
            }, {
                start: 3024,
                end: 3024,
                direction: "ltr"
            }, {
                start: 3031,
                end: 3031,
                direction: "ltr"
            }, {
                start: 3046,
                end: 3055,
                direction: "ltr"
            }, {
                start: 3056,
                end: 3058,
                direction: "ltr"
            }]
        }]
    }, {
        start: 3073,
        end: 3980,
        values: [{
            start: 3073,
            end: 3203,
            values: [{
                start: 3073,
                end: 3075,
                direction: "ltr"
            }, {
                start: 3077,
                end: 3084,
                direction: "ltr"
            }, {
                start: 3086,
                end: 3088,
                direction: "ltr"
            }, {
                start: 3090,
                end: 3112,
                direction: "ltr"
            }, {
                start: 3114,
                end: 3123,
                direction: "ltr"
            }, {
                start: 3125,
                end: 3129,
                direction: "ltr"
            }, {
                start: 3133,
                end: 3133,
                direction: "ltr"
            }, {
                start: 3137,
                end: 3140,
                direction: "ltr"
            }, {
                start: 3160,
                end: 3161,
                direction: "ltr"
            }, {
                start: 3168,
                end: 3169,
                direction: "ltr"
            }, {
                start: 3174,
                end: 3183,
                direction: "ltr"
            }, {
                start: 3199,
                end: 3199,
                direction: "ltr"
            }, {
                start: 3202,
                end: 3203,
                direction: "ltr"
            }]
        }, {
            start: 3205,
            end: 3286,
            values: [{
                start: 3205,
                end: 3212,
                direction: "ltr"
            }, {
                start: 3214,
                end: 3216,
                direction: "ltr"
            }, {
                start: 3218,
                end: 3240,
                direction: "ltr"
            }, {
                start: 3242,
                end: 3251,
                direction: "ltr"
            }, {
                start: 3253,
                end: 3257,
                direction: "ltr"
            }, {
                start: 3261,
                end: 3261,
                direction: "ltr"
            }, {
                start: 3262,
                end: 3262,
                direction: "ltr"
            }, {
                start: 3263,
                end: 3263,
                direction: "ltr"
            }, {
                start: 3264,
                end: 3268,
                direction: "ltr"
            }, {
                start: 3270,
                end: 3270,
                direction: "ltr"
            }, {
                start: 3271,
                end: 3272,
                direction: "ltr"
            }, {
                start: 3274,
                end: 3275,
                direction: "ltr"
            }, {
                start: 3285,
                end: 3286,
                direction: "ltr"
            }]
        }, {
            start: 3294,
            end: 3404,
            values: [{
                start: 3294,
                end: 3294,
                direction: "ltr"
            }, {
                start: 3296,
                end: 3297,
                direction: "ltr"
            }, {
                start: 3302,
                end: 3311,
                direction: "ltr"
            }, {
                start: 3313,
                end: 3314,
                direction: "ltr"
            }, {
                start: 3330,
                end: 3331,
                direction: "ltr"
            }, {
                start: 3333,
                end: 3340,
                direction: "ltr"
            }, {
                start: 3342,
                end: 3344,
                direction: "ltr"
            }, {
                start: 3346,
                end: 3386,
                direction: "ltr"
            }, {
                start: 3389,
                end: 3389,
                direction: "ltr"
            }, {
                start: 3390,
                end: 3392,
                direction: "ltr"
            }, {
                start: 3398,
                end: 3400,
                direction: "ltr"
            }, {
                start: 3402,
                end: 3404,
                direction: "ltr"
            }]
        }, {
            start: 3406,
            end: 3517,
            values: [{
                start: 3406,
                end: 3406,
                direction: "ltr"
            }, {
                start: 3415,
                end: 3415,
                direction: "ltr"
            }, {
                start: 3424,
                end: 3425,
                direction: "ltr"
            }, {
                start: 3430,
                end: 3439,
                direction: "ltr"
            }, {
                start: 3440,
                end: 3445,
                direction: "ltr"
            }, {
                start: 3449,
                end: 3449,
                direction: "ltr"
            }, {
                start: 3450,
                end: 3455,
                direction: "ltr"
            }, {
                start: 3458,
                end: 3459,
                direction: "ltr"
            }, {
                start: 3461,
                end: 3478,
                direction: "ltr"
            }, {
                start: 3482,
                end: 3505,
                direction: "ltr"
            }, {
                start: 3507,
                end: 3515,
                direction: "ltr"
            }, {
                start: 3517,
                end: 3517,
                direction: "ltr"
            }]
        }, {
            start: 3520,
            end: 3675,
            values: [{
                start: 3520,
                end: 3526,
                direction: "ltr"
            }, {
                start: 3535,
                end: 3537,
                direction: "ltr"
            }, {
                start: 3544,
                end: 3551,
                direction: "ltr"
            }, {
                start: 3570,
                end: 3571,
                direction: "ltr"
            }, {
                start: 3572,
                end: 3572,
                direction: "ltr"
            }, {
                start: 3585,
                end: 3632,
                direction: "ltr"
            }, {
                start: 3634,
                end: 3635,
                direction: "ltr"
            }, {
                start: 3648,
                end: 3653,
                direction: "ltr"
            }, {
                start: 3654,
                end: 3654,
                direction: "ltr"
            }, {
                start: 3663,
                end: 3663,
                direction: "ltr"
            }, {
                start: 3664,
                end: 3673,
                direction: "ltr"
            }, {
                start: 3674,
                end: 3675,
                direction: "ltr"
            }]
        }, {
            start: 3713,
            end: 3760,
            values: [{
                start: 3713,
                end: 3714,
                direction: "ltr"
            }, {
                start: 3716,
                end: 3716,
                direction: "ltr"
            }, {
                start: 3719,
                end: 3720,
                direction: "ltr"
            }, {
                start: 3722,
                end: 3722,
                direction: "ltr"
            }, {
                start: 3725,
                end: 3725,
                direction: "ltr"
            }, {
                start: 3732,
                end: 3735,
                direction: "ltr"
            }, {
                start: 3737,
                end: 3743,
                direction: "ltr"
            }, {
                start: 3745,
                end: 3747,
                direction: "ltr"
            }, {
                start: 3749,
                end: 3749,
                direction: "ltr"
            }, {
                start: 3751,
                end: 3751,
                direction: "ltr"
            }, {
                start: 3754,
                end: 3755,
                direction: "ltr"
            }, {
                start: 3757,
                end: 3760,
                direction: "ltr"
            }]
        }, {
            start: 3762,
            end: 3863,
            values: [{
                start: 3762,
                end: 3763,
                direction: "ltr"
            }, {
                start: 3773,
                end: 3773,
                direction: "ltr"
            }, {
                start: 3776,
                end: 3780,
                direction: "ltr"
            }, {
                start: 3782,
                end: 3782,
                direction: "ltr"
            }, {
                start: 3792,
                end: 3801,
                direction: "ltr"
            }, {
                start: 3804,
                end: 3807,
                direction: "ltr"
            }, {
                start: 3840,
                end: 3840,
                direction: "ltr"
            }, {
                start: 3841,
                end: 3843,
                direction: "ltr"
            }, {
                start: 3844,
                end: 3858,
                direction: "ltr"
            }, {
                start: 3859,
                end: 3859,
                direction: "ltr"
            }, {
                start: 3860,
                end: 3860,
                direction: "ltr"
            }, {
                start: 3861,
                end: 3863,
                direction: "ltr"
            }]
        }, {
            start: 3866,
            end: 3980,
            values: [{
                start: 3866,
                end: 3871,
                direction: "ltr"
            }, {
                start: 3872,
                end: 3881,
                direction: "ltr"
            }, {
                start: 3882,
                end: 3891,
                direction: "ltr"
            }, {
                start: 3892,
                end: 3892,
                direction: "ltr"
            }, {
                start: 3894,
                end: 3894,
                direction: "ltr"
            }, {
                start: 3896,
                end: 3896,
                direction: "ltr"
            }, {
                start: 3902,
                end: 3903,
                direction: "ltr"
            }, {
                start: 3904,
                end: 3911,
                direction: "ltr"
            }, {
                start: 3913,
                end: 3948,
                direction: "ltr"
            }, {
                start: 3967,
                end: 3967,
                direction: "ltr"
            }, {
                start: 3973,
                end: 3973,
                direction: "ltr"
            }, {
                start: 3976,
                end: 3980,
                direction: "ltr"
            }]
        }]
    }, {
        start: 4030,
        end: 6601,
        values: [{
            start: 4030,
            end: 4169,
            values: [{
                start: 4030,
                end: 4037,
                direction: "ltr"
            }, {
                start: 4039,
                end: 4044,
                direction: "ltr"
            }, {
                start: 4046,
                end: 4047,
                direction: "ltr"
            }, {
                start: 4048,
                end: 4052,
                direction: "ltr"
            }, {
                start: 4053,
                end: 4056,
                direction: "ltr"
            }, {
                start: 4057,
                end: 4058,
                direction: "ltr"
            }, {
                start: 4096,
                end: 4138,
                direction: "ltr"
            }, {
                start: 4139,
                end: 4140,
                direction: "ltr"
            }, {
                start: 4145,
                end: 4145,
                direction: "ltr"
            }, {
                start: 4152,
                end: 4152,
                direction: "ltr"
            }, {
                start: 4155,
                end: 4156,
                direction: "ltr"
            }, {
                start: 4159,
                end: 4159,
                direction: "ltr"
            }, {
                start: 4160,
                end: 4169,
                direction: "ltr"
            }]
        }, {
            start: 4170,
            end: 4238,
            values: [{
                start: 4170,
                end: 4175,
                direction: "ltr"
            }, {
                start: 4176,
                end: 4181,
                direction: "ltr"
            }, {
                start: 4182,
                end: 4183,
                direction: "ltr"
            }, {
                start: 4186,
                end: 4189,
                direction: "ltr"
            }, {
                start: 4193,
                end: 4193,
                direction: "ltr"
            }, {
                start: 4194,
                end: 4196,
                direction: "ltr"
            }, {
                start: 4197,
                end: 4198,
                direction: "ltr"
            }, {
                start: 4199,
                end: 4205,
                direction: "ltr"
            }, {
                start: 4206,
                end: 4208,
                direction: "ltr"
            }, {
                start: 4213,
                end: 4225,
                direction: "ltr"
            }, {
                start: 4227,
                end: 4228,
                direction: "ltr"
            }, {
                start: 4231,
                end: 4236,
                direction: "ltr"
            }, {
                start: 4238,
                end: 4238,
                direction: "ltr"
            }]
        }, {
            start: 4239,
            end: 4685,
            values: [{
                start: 4239,
                end: 4239,
                direction: "ltr"
            }, {
                start: 4240,
                end: 4249,
                direction: "ltr"
            }, {
                start: 4250,
                end: 4252,
                direction: "ltr"
            }, {
                start: 4254,
                end: 4255,
                direction: "ltr"
            }, {
                start: 4256,
                end: 4293,
                direction: "ltr"
            }, {
                start: 4295,
                end: 4295,
                direction: "ltr"
            }, {
                start: 4301,
                end: 4301,
                direction: "ltr"
            }, {
                start: 4304,
                end: 4346,
                direction: "ltr"
            }, {
                start: 4347,
                end: 4347,
                direction: "ltr"
            }, {
                start: 4348,
                end: 4348,
                direction: "ltr"
            }, {
                start: 4349,
                end: 4680,
                direction: "ltr"
            }, {
                start: 4682,
                end: 4685,
                direction: "ltr"
            }]
        }, {
            start: 4688,
            end: 4880,
            values: [{
                start: 4688,
                end: 4694,
                direction: "ltr"
            }, {
                start: 4696,
                end: 4696,
                direction: "ltr"
            }, {
                start: 4698,
                end: 4701,
                direction: "ltr"
            }, {
                start: 4704,
                end: 4744,
                direction: "ltr"
            }, {
                start: 4746,
                end: 4749,
                direction: "ltr"
            }, {
                start: 4752,
                end: 4784,
                direction: "ltr"
            }, {
                start: 4786,
                end: 4789,
                direction: "ltr"
            }, {
                start: 4792,
                end: 4798,
                direction: "ltr"
            }, {
                start: 4800,
                end: 4800,
                direction: "ltr"
            }, {
                start: 4802,
                end: 4805,
                direction: "ltr"
            }, {
                start: 4808,
                end: 4822,
                direction: "ltr"
            }, {
                start: 4824,
                end: 4880,
                direction: "ltr"
            }]
        }, {
            start: 4882,
            end: 5869,
            values: [{
                start: 4882,
                end: 4885,
                direction: "ltr"
            }, {
                start: 4888,
                end: 4954,
                direction: "ltr"
            }, {
                start: 4960,
                end: 4968,
                direction: "ltr"
            }, {
                start: 4969,
                end: 4988,
                direction: "ltr"
            }, {
                start: 4992,
                end: 5007,
                direction: "ltr"
            }, {
                start: 5024,
                end: 5108,
                direction: "ltr"
            }, {
                start: 5121,
                end: 5740,
                direction: "ltr"
            }, {
                start: 5741,
                end: 5742,
                direction: "ltr"
            }, {
                start: 5743,
                end: 5759,
                direction: "ltr"
            }, {
                start: 5761,
                end: 5786,
                direction: "ltr"
            }, {
                start: 5792,
                end: 5866,
                direction: "ltr"
            }, {
                start: 5867,
                end: 5869,
                direction: "ltr"
            }]
        }, {
            start: 5870,
            end: 6088,
            values: [{
                start: 5870,
                end: 5872,
                direction: "ltr"
            }, {
                start: 5888,
                end: 5900,
                direction: "ltr"
            }, {
                start: 5902,
                end: 5905,
                direction: "ltr"
            }, {
                start: 5920,
                end: 5937,
                direction: "ltr"
            }, {
                start: 5941,
                end: 5942,
                direction: "ltr"
            }, {
                start: 5952,
                end: 5969,
                direction: "ltr"
            }, {
                start: 5984,
                end: 5996,
                direction: "ltr"
            }, {
                start: 5998,
                end: 6e3,
                direction: "ltr"
            }, {
                start: 6016,
                end: 6067,
                direction: "ltr"
            }, {
                start: 6070,
                end: 6070,
                direction: "ltr"
            }, {
                start: 6078,
                end: 6085,
                direction: "ltr"
            }, {
                start: 6087,
                end: 6088,
                direction: "ltr"
            }]
        }, {
            start: 6100,
            end: 6389,
            values: [{
                start: 6100,
                end: 6102,
                direction: "ltr"
            }, {
                start: 6103,
                end: 6103,
                direction: "ltr"
            }, {
                start: 6104,
                end: 6106,
                direction: "ltr"
            }, {
                start: 6108,
                end: 6108,
                direction: "ltr"
            }, {
                start: 6112,
                end: 6121,
                direction: "ltr"
            }, {
                start: 6160,
                end: 6169,
                direction: "ltr"
            }, {
                start: 6176,
                end: 6210,
                direction: "ltr"
            }, {
                start: 6211,
                end: 6211,
                direction: "ltr"
            }, {
                start: 6212,
                end: 6263,
                direction: "ltr"
            }, {
                start: 6272,
                end: 6312,
                direction: "ltr"
            }, {
                start: 6314,
                end: 6314,
                direction: "ltr"
            }, {
                start: 6320,
                end: 6389,
                direction: "ltr"
            }]
        }, {
            start: 6400,
            end: 6601,
            values: [{
                start: 6400,
                end: 6428,
                direction: "ltr"
            }, {
                start: 6435,
                end: 6438,
                direction: "ltr"
            }, {
                start: 6441,
                end: 6443,
                direction: "ltr"
            }, {
                start: 6448,
                end: 6449,
                direction: "ltr"
            }, {
                start: 6451,
                end: 6456,
                direction: "ltr"
            }, {
                start: 6470,
                end: 6479,
                direction: "ltr"
            }, {
                start: 6480,
                end: 6509,
                direction: "ltr"
            }, {
                start: 6512,
                end: 6516,
                direction: "ltr"
            }, {
                start: 6528,
                end: 6571,
                direction: "ltr"
            }, {
                start: 6576,
                end: 6592,
                direction: "ltr"
            }, {
                start: 6593,
                end: 6599,
                direction: "ltr"
            }, {
                start: 6600,
                end: 6601,
                direction: "ltr"
            }]
        }]
    }, {
        start: 6608,
        end: 8484,
        values: [{
            start: 6608,
            end: 6809,
            values: [{
                start: 6608,
                end: 6617,
                direction: "ltr"
            }, {
                start: 6618,
                end: 6618,
                direction: "ltr"
            }, {
                start: 6656,
                end: 6678,
                direction: "ltr"
            }, {
                start: 6681,
                end: 6683,
                direction: "ltr"
            }, {
                start: 6686,
                end: 6687,
                direction: "ltr"
            }, {
                start: 6688,
                end: 6740,
                direction: "ltr"
            }, {
                start: 6741,
                end: 6741,
                direction: "ltr"
            }, {
                start: 6743,
                end: 6743,
                direction: "ltr"
            }, {
                start: 6753,
                end: 6753,
                direction: "ltr"
            }, {
                start: 6755,
                end: 6756,
                direction: "ltr"
            }, {
                start: 6765,
                end: 6770,
                direction: "ltr"
            }, {
                start: 6784,
                end: 6793,
                direction: "ltr"
            }, {
                start: 6800,
                end: 6809,
                direction: "ltr"
            }]
        }, {
            start: 6816,
            end: 7018,
            values: [{
                start: 6816,
                end: 6822,
                direction: "ltr"
            }, {
                start: 6823,
                end: 6823,
                direction: "ltr"
            }, {
                start: 6824,
                end: 6829,
                direction: "ltr"
            }, {
                start: 6916,
                end: 6916,
                direction: "ltr"
            }, {
                start: 6917,
                end: 6963,
                direction: "ltr"
            }, {
                start: 6965,
                end: 6965,
                direction: "ltr"
            }, {
                start: 6971,
                end: 6971,
                direction: "ltr"
            }, {
                start: 6973,
                end: 6977,
                direction: "ltr"
            }, {
                start: 6979,
                end: 6980,
                direction: "ltr"
            }, {
                start: 6981,
                end: 6987,
                direction: "ltr"
            }, {
                start: 6992,
                end: 7001,
                direction: "ltr"
            }, {
                start: 7002,
                end: 7008,
                direction: "ltr"
            }, {
                start: 7009,
                end: 7018,
                direction: "ltr"
            }]
        }, {
            start: 7028,
            end: 7148,
            values: [{
                start: 7028,
                end: 7036,
                direction: "ltr"
            }, {
                start: 7042,
                end: 7042,
                direction: "ltr"
            }, {
                start: 7043,
                end: 7072,
                direction: "ltr"
            }, {
                start: 7073,
                end: 7073,
                direction: "ltr"
            }, {
                start: 7078,
                end: 7079,
                direction: "ltr"
            }, {
                start: 7082,
                end: 7082,
                direction: "ltr"
            }, {
                start: 7084,
                end: 7085,
                direction: "ltr"
            }, {
                start: 7086,
                end: 7087,
                direction: "ltr"
            }, {
                start: 7088,
                end: 7097,
                direction: "ltr"
            }, {
                start: 7098,
                end: 7141,
                direction: "ltr"
            }, {
                start: 7143,
                end: 7143,
                direction: "ltr"
            }, {
                start: 7146,
                end: 7148,
                direction: "ltr"
            }]
        }, {
            start: 7150,
            end: 7293,
            values: [{
                start: 7150,
                end: 7150,
                direction: "ltr"
            }, {
                start: 7154,
                end: 7155,
                direction: "ltr"
            }, {
                start: 7164,
                end: 7167,
                direction: "ltr"
            }, {
                start: 7168,
                end: 7203,
                direction: "ltr"
            }, {
                start: 7204,
                end: 7211,
                direction: "ltr"
            }, {
                start: 7220,
                end: 7221,
                direction: "ltr"
            }, {
                start: 7227,
                end: 7231,
                direction: "ltr"
            }, {
                start: 7232,
                end: 7241,
                direction: "ltr"
            }, {
                start: 7245,
                end: 7247,
                direction: "ltr"
            }, {
                start: 7248,
                end: 7257,
                direction: "ltr"
            }, {
                start: 7258,
                end: 7287,
                direction: "ltr"
            }, {
                start: 7288,
                end: 7293,
                direction: "ltr"
            }]
        }, {
            start: 7294,
            end: 7544,
            values: [{
                start: 7294,
                end: 7295,
                direction: "ltr"
            }, {
                start: 7360,
                end: 7367,
                direction: "ltr"
            }, {
                start: 7379,
                end: 7379,
                direction: "ltr"
            }, {
                start: 7393,
                end: 7393,
                direction: "ltr"
            }, {
                start: 7401,
                end: 7404,
                direction: "ltr"
            }, {
                start: 7406,
                end: 7409,
                direction: "ltr"
            }, {
                start: 7410,
                end: 7411,
                direction: "ltr"
            }, {
                start: 7413,
                end: 7414,
                direction: "ltr"
            }, {
                start: 7424,
                end: 7467,
                direction: "ltr"
            }, {
                start: 7468,
                end: 7530,
                direction: "ltr"
            }, {
                start: 7531,
                end: 7543,
                direction: "ltr"
            }, {
                start: 7544,
                end: 7544,
                direction: "ltr"
            }]
        }, {
            start: 7545,
            end: 8116,
            values: [{
                start: 7545,
                end: 7578,
                direction: "ltr"
            }, {
                start: 7579,
                end: 7615,
                direction: "ltr"
            }, {
                start: 7680,
                end: 7957,
                direction: "ltr"
            }, {
                start: 7960,
                end: 7965,
                direction: "ltr"
            }, {
                start: 7968,
                end: 8005,
                direction: "ltr"
            }, {
                start: 8008,
                end: 8013,
                direction: "ltr"
            }, {
                start: 8016,
                end: 8023,
                direction: "ltr"
            }, {
                start: 8025,
                end: 8025,
                direction: "ltr"
            }, {
                start: 8027,
                end: 8027,
                direction: "ltr"
            }, {
                start: 8029,
                end: 8029,
                direction: "ltr"
            }, {
                start: 8031,
                end: 8061,
                direction: "ltr"
            }, {
                start: 8064,
                end: 8116,
                direction: "ltr"
            }]
        }, {
            start: 8118,
            end: 8234,
            values: [{
                start: 8118,
                end: 8124,
                direction: "ltr"
            }, {
                start: 8126,
                end: 8126,
                direction: "ltr"
            }, {
                start: 8130,
                end: 8132,
                direction: "ltr"
            }, {
                start: 8134,
                end: 8140,
                direction: "ltr"
            }, {
                start: 8144,
                end: 8147,
                direction: "ltr"
            }, {
                start: 8150,
                end: 8155,
                direction: "ltr"
            }, {
                start: 8160,
                end: 8172,
                direction: "ltr"
            }, {
                start: 8178,
                end: 8180,
                direction: "ltr"
            }, {
                start: 8182,
                end: 8188,
                direction: "ltr"
            }, {
                start: 8206,
                end: 8206,
                direction: "ltr"
            }, {
                start: 8207,
                end: 8207,
                direction: "rtl"
            }, {
                start: 8234,
                end: 8234,
                direction: "ltr"
            }]
        }, {
            start: 8235,
            end: 8484,
            values: [{
                start: 8235,
                end: 8235,
                direction: "rtl"
            }, {
                start: 8237,
                end: 8237,
                direction: "ltr"
            }, {
                start: 8238,
                end: 8238,
                direction: "rtl"
            }, {
                start: 8305,
                end: 8305,
                direction: "ltr"
            }, {
                start: 8319,
                end: 8319,
                direction: "ltr"
            }, {
                start: 8336,
                end: 8348,
                direction: "ltr"
            }, {
                start: 8450,
                end: 8450,
                direction: "ltr"
            }, {
                start: 8455,
                end: 8455,
                direction: "ltr"
            }, {
                start: 8458,
                end: 8467,
                direction: "ltr"
            }, {
                start: 8469,
                end: 8469,
                direction: "ltr"
            }, {
                start: 8473,
                end: 8477,
                direction: "ltr"
            }, {
                start: 8484,
                end: 8484,
                direction: "ltr"
            }]
        }]
    }, {
        start: 8486,
        end: 42890,
        values: [{
            start: 8486,
            end: 8584,
            values: [{
                start: 8486,
                end: 8486,
                direction: "ltr"
            }, {
                start: 8488,
                end: 8488,
                direction: "ltr"
            }, {
                start: 8490,
                end: 8493,
                direction: "ltr"
            }, {
                start: 8495,
                end: 8500,
                direction: "ltr"
            }, {
                start: 8501,
                end: 8504,
                direction: "ltr"
            }, {
                start: 8505,
                end: 8505,
                direction: "ltr"
            }, {
                start: 8508,
                end: 8511,
                direction: "ltr"
            }, {
                start: 8517,
                end: 8521,
                direction: "ltr"
            }, {
                start: 8526,
                end: 8526,
                direction: "ltr"
            }, {
                start: 8527,
                end: 8527,
                direction: "ltr"
            }, {
                start: 8544,
                end: 8578,
                direction: "ltr"
            }, {
                start: 8579,
                end: 8580,
                direction: "ltr"
            }, {
                start: 8581,
                end: 8584,
                direction: "ltr"
            }]
        }, {
            start: 9014,
            end: 11557,
            values: [{
                start: 9014,
                end: 9082,
                direction: "ltr"
            }, {
                start: 9109,
                end: 9109,
                direction: "ltr"
            }, {
                start: 9372,
                end: 9449,
                direction: "ltr"
            }, {
                start: 9900,
                end: 9900,
                direction: "ltr"
            }, {
                start: 10240,
                end: 10495,
                direction: "ltr"
            }, {
                start: 11264,
                end: 11310,
                direction: "ltr"
            }, {
                start: 11312,
                end: 11358,
                direction: "ltr"
            }, {
                start: 11360,
                end: 11387,
                direction: "ltr"
            }, {
                start: 11388,
                end: 11389,
                direction: "ltr"
            }, {
                start: 11390,
                end: 11492,
                direction: "ltr"
            }, {
                start: 11499,
                end: 11502,
                direction: "ltr"
            }, {
                start: 11506,
                end: 11507,
                direction: "ltr"
            }, {
                start: 11520,
                end: 11557,
                direction: "ltr"
            }]
        }, {
            start: 11559,
            end: 11726,
            values: [{
                start: 11559,
                end: 11559,
                direction: "ltr"
            }, {
                start: 11565,
                end: 11565,
                direction: "ltr"
            }, {
                start: 11568,
                end: 11623,
                direction: "ltr"
            }, {
                start: 11631,
                end: 11631,
                direction: "ltr"
            }, {
                start: 11632,
                end: 11632,
                direction: "ltr"
            }, {
                start: 11648,
                end: 11670,
                direction: "ltr"
            }, {
                start: 11680,
                end: 11686,
                direction: "ltr"
            }, {
                start: 11688,
                end: 11694,
                direction: "ltr"
            }, {
                start: 11696,
                end: 11702,
                direction: "ltr"
            }, {
                start: 11704,
                end: 11710,
                direction: "ltr"
            }, {
                start: 11712,
                end: 11718,
                direction: "ltr"
            }, {
                start: 11720,
                end: 11726,
                direction: "ltr"
            }]
        }, {
            start: 11728,
            end: 12438,
            values: [{
                start: 11728,
                end: 11734,
                direction: "ltr"
            }, {
                start: 11736,
                end: 11742,
                direction: "ltr"
            }, {
                start: 12293,
                end: 12293,
                direction: "ltr"
            }, {
                start: 12294,
                end: 12294,
                direction: "ltr"
            }, {
                start: 12295,
                end: 12295,
                direction: "ltr"
            }, {
                start: 12321,
                end: 12329,
                direction: "ltr"
            }, {
                start: 12334,
                end: 12335,
                direction: "ltr"
            }, {
                start: 12337,
                end: 12341,
                direction: "ltr"
            }, {
                start: 12344,
                end: 12346,
                direction: "ltr"
            }, {
                start: 12347,
                end: 12347,
                direction: "ltr"
            }, {
                start: 12348,
                end: 12348,
                direction: "ltr"
            }, {
                start: 12353,
                end: 12438,
                direction: "ltr"
            }]
        }, {
            start: 12445,
            end: 12799,
            values: [{
                start: 12445,
                end: 12446,
                direction: "ltr"
            }, {
                start: 12447,
                end: 12447,
                direction: "ltr"
            }, {
                start: 12449,
                end: 12538,
                direction: "ltr"
            }, {
                start: 12540,
                end: 12542,
                direction: "ltr"
            }, {
                start: 12543,
                end: 12543,
                direction: "ltr"
            }, {
                start: 12549,
                end: 12589,
                direction: "ltr"
            }, {
                start: 12593,
                end: 12686,
                direction: "ltr"
            }, {
                start: 12688,
                end: 12689,
                direction: "ltr"
            }, {
                start: 12690,
                end: 12693,
                direction: "ltr"
            }, {
                start: 12694,
                end: 12703,
                direction: "ltr"
            }, {
                start: 12704,
                end: 12730,
                direction: "ltr"
            }, {
                start: 12784,
                end: 12799,
                direction: "ltr"
            }]
        }, {
            start: 12800,
            end: 13277,
            values: [{
                start: 12800,
                end: 12828,
                direction: "ltr"
            }, {
                start: 12832,
                end: 12841,
                direction: "ltr"
            }, {
                start: 12842,
                end: 12871,
                direction: "ltr"
            }, {
                start: 12872,
                end: 12879,
                direction: "ltr"
            }, {
                start: 12896,
                end: 12923,
                direction: "ltr"
            }, {
                start: 12927,
                end: 12927,
                direction: "ltr"
            }, {
                start: 12928,
                end: 12937,
                direction: "ltr"
            }, {
                start: 12938,
                end: 12976,
                direction: "ltr"
            }, {
                start: 12992,
                end: 13003,
                direction: "ltr"
            }, {
                start: 13008,
                end: 13054,
                direction: "ltr"
            }, {
                start: 13056,
                end: 13174,
                direction: "ltr"
            }, {
                start: 13179,
                end: 13277,
                direction: "ltr"
            }]
        }, {
            start: 13280,
            end: 42527,
            values: [{
                start: 13280,
                end: 13310,
                direction: "ltr"
            }, {
                start: 13312,
                end: 19893,
                direction: "ltr"
            }, {
                start: 19968,
                end: 40908,
                direction: "ltr"
            }, {
                start: 40960,
                end: 40980,
                direction: "ltr"
            }, {
                start: 40981,
                end: 40981,
                direction: "ltr"
            }, {
                start: 40982,
                end: 42124,
                direction: "ltr"
            }, {
                start: 42192,
                end: 42231,
                direction: "ltr"
            }, {
                start: 42232,
                end: 42237,
                direction: "ltr"
            }, {
                start: 42238,
                end: 42239,
                direction: "ltr"
            }, {
                start: 42240,
                end: 42507,
                direction: "ltr"
            }, {
                start: 42508,
                end: 42508,
                direction: "ltr"
            }, {
                start: 42512,
                end: 42527,
                direction: "ltr"
            }]
        }, {
            start: 42528,
            end: 42890,
            values: [{
                start: 42528,
                end: 42537,
                direction: "ltr"
            }, {
                start: 42538,
                end: 42539,
                direction: "ltr"
            }, {
                start: 42560,
                end: 42605,
                direction: "ltr"
            }, {
                start: 42606,
                end: 42606,
                direction: "ltr"
            }, {
                start: 42624,
                end: 42647,
                direction: "ltr"
            }, {
                start: 42656,
                end: 42725,
                direction: "ltr"
            }, {
                start: 42726,
                end: 42735,
                direction: "ltr"
            }, {
                start: 42738,
                end: 42743,
                direction: "ltr"
            }, {
                start: 42786,
                end: 42863,
                direction: "ltr"
            }, {
                start: 42864,
                end: 42864,
                direction: "ltr"
            }, {
                start: 42865,
                end: 42887,
                direction: "ltr"
            }, {
                start: 42889,
                end: 42890,
                direction: "ltr"
            }]
        }]
    }, {
        start: 42891,
        end: 64322,
        values: [{
            start: 42891,
            end: 43063,
            values: [{
                start: 42891,
                end: 42894,
                direction: "ltr"
            }, {
                start: 42896,
                end: 42899,
                direction: "ltr"
            }, {
                start: 42912,
                end: 42922,
                direction: "ltr"
            }, {
                start: 43e3,
                end: 43001,
                direction: "ltr"
            }, {
                start: 43002,
                end: 43002,
                direction: "ltr"
            }, {
                start: 43003,
                end: 43009,
                direction: "ltr"
            }, {
                start: 43011,
                end: 43013,
                direction: "ltr"
            }, {
                start: 43015,
                end: 43018,
                direction: "ltr"
            }, {
                start: 43020,
                end: 43042,
                direction: "ltr"
            }, {
                start: 43043,
                end: 43044,
                direction: "ltr"
            }, {
                start: 43047,
                end: 43047,
                direction: "ltr"
            }, {
                start: 43056,
                end: 43061,
                direction: "ltr"
            }, {
                start: 43062,
                end: 43063,
                direction: "ltr"
            }]
        }, {
            start: 43072,
            end: 43334,
            values: [{
                start: 43072,
                end: 43123,
                direction: "ltr"
            }, {
                start: 43136,
                end: 43137,
                direction: "ltr"
            }, {
                start: 43138,
                end: 43187,
                direction: "ltr"
            }, {
                start: 43188,
                end: 43203,
                direction: "ltr"
            }, {
                start: 43214,
                end: 43215,
                direction: "ltr"
            }, {
                start: 43216,
                end: 43225,
                direction: "ltr"
            }, {
                start: 43250,
                end: 43255,
                direction: "ltr"
            }, {
                start: 43256,
                end: 43258,
                direction: "ltr"
            }, {
                start: 43259,
                end: 43259,
                direction: "ltr"
            }, {
                start: 43264,
                end: 43273,
                direction: "ltr"
            }, {
                start: 43274,
                end: 43301,
                direction: "ltr"
            }, {
                start: 43310,
                end: 43311,
                direction: "ltr"
            }, {
                start: 43312,
                end: 43334,
                direction: "ltr"
            }]
        }, {
            start: 43346,
            end: 43487,
            values: [{
                start: 43346,
                end: 43347,
                direction: "ltr"
            }, {
                start: 43359,
                end: 43359,
                direction: "ltr"
            }, {
                start: 43360,
                end: 43388,
                direction: "ltr"
            }, {
                start: 43395,
                end: 43395,
                direction: "ltr"
            }, {
                start: 43396,
                end: 43442,
                direction: "ltr"
            }, {
                start: 43444,
                end: 43445,
                direction: "ltr"
            }, {
                start: 43450,
                end: 43451,
                direction: "ltr"
            }, {
                start: 43453,
                end: 43456,
                direction: "ltr"
            }, {
                start: 43457,
                end: 43469,
                direction: "ltr"
            }, {
                start: 43471,
                end: 43471,
                direction: "ltr"
            }, {
                start: 43472,
                end: 43481,
                direction: "ltr"
            }, {
                start: 43486,
                end: 43487,
                direction: "ltr"
            }]
        }, {
            start: 43520,
            end: 43641,
            values: [{
                start: 43520,
                end: 43560,
                direction: "ltr"
            }, {
                start: 43567,
                end: 43568,
                direction: "ltr"
            }, {
                start: 43571,
                end: 43572,
                direction: "ltr"
            }, {
                start: 43584,
                end: 43586,
                direction: "ltr"
            }, {
                start: 43588,
                end: 43595,
                direction: "ltr"
            }, {
                start: 43597,
                end: 43597,
                direction: "ltr"
            }, {
                start: 43600,
                end: 43609,
                direction: "ltr"
            }, {
                start: 43612,
                end: 43615,
                direction: "ltr"
            }, {
                start: 43616,
                end: 43631,
                direction: "ltr"
            }, {
                start: 43632,
                end: 43632,
                direction: "ltr"
            }, {
                start: 43633,
                end: 43638,
                direction: "ltr"
            }, {
                start: 43639,
                end: 43641,
                direction: "ltr"
            }]
        }, {
            start: 43642,
            end: 43754,
            values: [{
                start: 43642,
                end: 43642,
                direction: "ltr"
            }, {
                start: 43643,
                end: 43643,
                direction: "ltr"
            }, {
                start: 43648,
                end: 43695,
                direction: "ltr"
            }, {
                start: 43697,
                end: 43697,
                direction: "ltr"
            }, {
                start: 43701,
                end: 43702,
                direction: "ltr"
            }, {
                start: 43705,
                end: 43709,
                direction: "ltr"
            }, {
                start: 43712,
                end: 43712,
                direction: "ltr"
            }, {
                start: 43714,
                end: 43714,
                direction: "ltr"
            }, {
                start: 43739,
                end: 43740,
                direction: "ltr"
            }, {
                start: 43741,
                end: 43741,
                direction: "ltr"
            }, {
                start: 43742,
                end: 43743,
                direction: "ltr"
            }, {
                start: 43744,
                end: 43754,
                direction: "ltr"
            }]
        }, {
            start: 43755,
            end: 44002,
            values: [{
                start: 43755,
                end: 43755,
                direction: "ltr"
            }, {
                start: 43758,
                end: 43759,
                direction: "ltr"
            }, {
                start: 43760,
                end: 43761,
                direction: "ltr"
            }, {
                start: 43762,
                end: 43762,
                direction: "ltr"
            }, {
                start: 43763,
                end: 43764,
                direction: "ltr"
            }, {
                start: 43765,
                end: 43765,
                direction: "ltr"
            }, {
                start: 43777,
                end: 43782,
                direction: "ltr"
            }, {
                start: 43785,
                end: 43790,
                direction: "ltr"
            }, {
                start: 43793,
                end: 43798,
                direction: "ltr"
            }, {
                start: 43808,
                end: 43814,
                direction: "ltr"
            }, {
                start: 43816,
                end: 43822,
                direction: "ltr"
            }, {
                start: 43968,
                end: 44002,
                direction: "ltr"
            }]
        }, {
            start: 44003,
            end: 64217,
            values: [{
                start: 44003,
                end: 44004,
                direction: "ltr"
            }, {
                start: 44006,
                end: 44007,
                direction: "ltr"
            }, {
                start: 44009,
                end: 44010,
                direction: "ltr"
            }, {
                start: 44011,
                end: 44011,
                direction: "ltr"
            }, {
                start: 44012,
                end: 44012,
                direction: "ltr"
            }, {
                start: 44016,
                end: 44025,
                direction: "ltr"
            }, {
                start: 44032,
                end: 55203,
                direction: "ltr"
            }, {
                start: 55216,
                end: 55238,
                direction: "ltr"
            }, {
                start: 55243,
                end: 55291,
                direction: "ltr"
            }, {
                start: 57344,
                end: 63743,
                direction: "ltr"
            }, {
                start: 63744,
                end: 64109,
                direction: "ltr"
            }, {
                start: 64112,
                end: 64217,
                direction: "ltr"
            }]
        }, {
            start: 64256,
            end: 64322,
            values: [{
                start: 64256,
                end: 64262,
                direction: "ltr"
            }, {
                start: 64275,
                end: 64279,
                direction: "ltr"
            }, {
                start: 64285,
                end: 64285,
                direction: "rtl"
            }, {
                start: 64287,
                end: 64296,
                direction: "rtl"
            }, {
                start: 64298,
                end: 64310,
                direction: "rtl"
            }, {
                start: 64311,
                end: 64311,
                direction: "rtl"
            }, {
                start: 64312,
                end: 64316,
                direction: "rtl"
            }, {
                start: 64317,
                end: 64317,
                direction: "rtl"
            }, {
                start: 64318,
                end: 64318,
                direction: "rtl"
            }, {
                start: 64319,
                end: 64319,
                direction: "rtl"
            }, {
                start: 64320,
                end: 64321,
                direction: "rtl"
            }, {
                start: 64322,
                end: 64322,
                direction: "rtl"
            }]
        }]
    }, {
        start: 64323,
        end: 68184,
        values: [{
            start: 64323,
            end: 65019,
            values: [{
                start: 64323,
                end: 64324,
                direction: "rtl"
            }, {
                start: 64325,
                end: 64325,
                direction: "rtl"
            }, {
                start: 64326,
                end: 64335,
                direction: "rtl"
            }, {
                start: 64336,
                end: 64433,
                direction: "rtl"
            }, {
                start: 64434,
                end: 64449,
                direction: "rtl"
            }, {
                start: 64450,
                end: 64466,
                direction: "rtl"
            }, {
                start: 64467,
                end: 64829,
                direction: "rtl"
            }, {
                start: 64832,
                end: 64847,
                direction: "rtl"
            }, {
                start: 64848,
                end: 64911,
                direction: "rtl"
            }, {
                start: 64912,
                end: 64913,
                direction: "rtl"
            }, {
                start: 64914,
                end: 64967,
                direction: "rtl"
            }, {
                start: 64968,
                end: 64975,
                direction: "rtl"
            }, {
                start: 65008,
                end: 65019,
                direction: "rtl"
            }]
        }, {
            start: 65020,
            end: 65470,
            values: [{
                start: 65020,
                end: 65020,
                direction: "rtl"
            }, {
                start: 65022,
                end: 65023,
                direction: "rtl"
            }, {
                start: 65136,
                end: 65140,
                direction: "rtl"
            }, {
                start: 65141,
                end: 65141,
                direction: "rtl"
            }, {
                start: 65142,
                end: 65276,
                direction: "rtl"
            }, {
                start: 65277,
                end: 65278,
                direction: "rtl"
            }, {
                start: 65313,
                end: 65338,
                direction: "ltr"
            }, {
                start: 65345,
                end: 65370,
                direction: "ltr"
            }, {
                start: 65382,
                end: 65391,
                direction: "ltr"
            }, {
                start: 65392,
                end: 65392,
                direction: "ltr"
            }, {
                start: 65393,
                end: 65437,
                direction: "ltr"
            }, {
                start: 65438,
                end: 65439,
                direction: "ltr"
            }, {
                start: 65440,
                end: 65470,
                direction: "ltr"
            }]
        }, {
            start: 65474,
            end: 65792,
            values: [{
                start: 65474,
                end: 65479,
                direction: "ltr"
            }, {
                start: 65482,
                end: 65487,
                direction: "ltr"
            }, {
                start: 65490,
                end: 65495,
                direction: "ltr"
            }, {
                start: 65498,
                end: 65500,
                direction: "ltr"
            }, {
                start: 65536,
                end: 65547,
                direction: "ltr"
            }, {
                start: 65549,
                end: 65574,
                direction: "ltr"
            }, {
                start: 65576,
                end: 65594,
                direction: "ltr"
            }, {
                start: 65596,
                end: 65597,
                direction: "ltr"
            }, {
                start: 65599,
                end: 65613,
                direction: "ltr"
            }, {
                start: 65616,
                end: 65629,
                direction: "ltr"
            }, {
                start: 65664,
                end: 65786,
                direction: "ltr"
            }, {
                start: 65792,
                end: 65792,
                direction: "ltr"
            }]
        }, {
            start: 65794,
            end: 66378,
            values: [{
                start: 65794,
                end: 65794,
                direction: "ltr"
            }, {
                start: 65799,
                end: 65843,
                direction: "ltr"
            }, {
                start: 65847,
                end: 65855,
                direction: "ltr"
            }, {
                start: 66e3,
                end: 66044,
                direction: "ltr"
            }, {
                start: 66176,
                end: 66204,
                direction: "ltr"
            }, {
                start: 66208,
                end: 66256,
                direction: "ltr"
            }, {
                start: 66304,
                end: 66334,
                direction: "ltr"
            }, {
                start: 66336,
                end: 66339,
                direction: "ltr"
            }, {
                start: 66352,
                end: 66368,
                direction: "ltr"
            }, {
                start: 66369,
                end: 66369,
                direction: "ltr"
            }, {
                start: 66370,
                end: 66377,
                direction: "ltr"
            }, {
                start: 66378,
                end: 66378,
                direction: "ltr"
            }]
        }, {
            start: 66432,
            end: 67592,
            values: [{
                start: 66432,
                end: 66461,
                direction: "ltr"
            }, {
                start: 66463,
                end: 66463,
                direction: "ltr"
            }, {
                start: 66464,
                end: 66499,
                direction: "ltr"
            }, {
                start: 66504,
                end: 66511,
                direction: "ltr"
            }, {
                start: 66512,
                end: 66512,
                direction: "ltr"
            }, {
                start: 66513,
                end: 66517,
                direction: "ltr"
            }, {
                start: 66560,
                end: 66639,
                direction: "ltr"
            }, {
                start: 66640,
                end: 66717,
                direction: "ltr"
            }, {
                start: 66720,
                end: 66729,
                direction: "ltr"
            }, {
                start: 67584,
                end: 67589,
                direction: "rtl"
            }, {
                start: 67590,
                end: 67591,
                direction: "rtl"
            }, {
                start: 67592,
                end: 67592,
                direction: "rtl"
            }]
        }, {
            start: 67593,
            end: 67839,
            values: [{
                start: 67593,
                end: 67593,
                direction: "rtl"
            }, {
                start: 67594,
                end: 67637,
                direction: "rtl"
            }, {
                start: 67638,
                end: 67638,
                direction: "rtl"
            }, {
                start: 67639,
                end: 67640,
                direction: "rtl"
            }, {
                start: 67641,
                end: 67643,
                direction: "rtl"
            }, {
                start: 67644,
                end: 67644,
                direction: "rtl"
            }, {
                start: 67645,
                end: 67646,
                direction: "rtl"
            }, {
                start: 67647,
                end: 67669,
                direction: "rtl"
            }, {
                start: 67670,
                end: 67670,
                direction: "rtl"
            }, {
                start: 67671,
                end: 67671,
                direction: "rtl"
            }, {
                start: 67672,
                end: 67679,
                direction: "rtl"
            }, {
                start: 67680,
                end: 67839,
                direction: "rtl"
            }]
        }, {
            start: 67840,
            end: 68096,
            values: [{
                start: 67840,
                end: 67861,
                direction: "rtl"
            }, {
                start: 67862,
                end: 67867,
                direction: "rtl"
            }, {
                start: 67868,
                end: 67870,
                direction: "rtl"
            }, {
                start: 67872,
                end: 67897,
                direction: "rtl"
            }, {
                start: 67898,
                end: 67902,
                direction: "rtl"
            }, {
                start: 67903,
                end: 67903,
                direction: "rtl"
            }, {
                start: 67904,
                end: 67967,
                direction: "rtl"
            }, {
                start: 67968,
                end: 68023,
                direction: "rtl"
            }, {
                start: 68024,
                end: 68029,
                direction: "rtl"
            }, {
                start: 68030,
                end: 68031,
                direction: "rtl"
            }, {
                start: 68032,
                end: 68095,
                direction: "rtl"
            }, {
                start: 68096,
                end: 68096,
                direction: "rtl"
            }]
        }, {
            start: 68100,
            end: 68184,
            values: [{
                start: 68100,
                end: 68100,
                direction: "rtl"
            }, {
                start: 68103,
                end: 68107,
                direction: "rtl"
            }, {
                start: 68112,
                end: 68115,
                direction: "rtl"
            }, {
                start: 68116,
                end: 68116,
                direction: "rtl"
            }, {
                start: 68117,
                end: 68119,
                direction: "rtl"
            }, {
                start: 68120,
                end: 68120,
                direction: "rtl"
            }, {
                start: 68121,
                end: 68147,
                direction: "rtl"
            }, {
                start: 68148,
                end: 68151,
                direction: "rtl"
            }, {
                start: 68155,
                end: 68158,
                direction: "rtl"
            }, {
                start: 68160,
                end: 68167,
                direction: "rtl"
            }, {
                start: 68168,
                end: 68175,
                direction: "rtl"
            }, {
                start: 68176,
                end: 68184,
                direction: "rtl"
            }]
        }]
    }, {
        start: 68185,
        end: 120687,
        values: [{
            start: 68185,
            end: 68479,
            values: [{
                start: 68185,
                end: 68191,
                direction: "rtl"
            }, {
                start: 68192,
                end: 68220,
                direction: "rtl"
            }, {
                start: 68221,
                end: 68222,
                direction: "rtl"
            }, {
                start: 68223,
                end: 68223,
                direction: "rtl"
            }, {
                start: 68224,
                end: 68351,
                direction: "rtl"
            }, {
                start: 68352,
                end: 68405,
                direction: "rtl"
            }, {
                start: 68406,
                end: 68408,
                direction: "rtl"
            }, {
                start: 68416,
                end: 68437,
                direction: "rtl"
            }, {
                start: 68438,
                end: 68439,
                direction: "rtl"
            }, {
                start: 68440,
                end: 68447,
                direction: "rtl"
            }, {
                start: 68448,
                end: 68466,
                direction: "rtl"
            }, {
                start: 68467,
                end: 68471,
                direction: "rtl"
            }, {
                start: 68472,
                end: 68479,
                direction: "rtl"
            }]
        }, {
            start: 68480,
            end: 69810,
            values: [{
                start: 68480,
                end: 68607,
                direction: "rtl"
            }, {
                start: 68608,
                end: 68680,
                direction: "rtl"
            }, {
                start: 68681,
                end: 69215,
                direction: "rtl"
            }, {
                start: 69247,
                end: 69631,
                direction: "rtl"
            }, {
                start: 69632,
                end: 69632,
                direction: "ltr"
            }, {
                start: 69634,
                end: 69634,
                direction: "ltr"
            }, {
                start: 69635,
                end: 69687,
                direction: "ltr"
            }, {
                start: 69703,
                end: 69709,
                direction: "ltr"
            }, {
                start: 69734,
                end: 69743,
                direction: "ltr"
            }, {
                start: 69762,
                end: 69762,
                direction: "ltr"
            }, {
                start: 69763,
                end: 69807,
                direction: "ltr"
            }, {
                start: 69808,
                end: 69810,
                direction: "ltr"
            }]
        }, {
            start: 69815,
            end: 70066,
            values: [{
                start: 69815,
                end: 69816,
                direction: "ltr"
            }, {
                start: 69819,
                end: 69820,
                direction: "ltr"
            }, {
                start: 69821,
                end: 69821,
                direction: "ltr"
            }, {
                start: 69822,
                end: 69825,
                direction: "ltr"
            }, {
                start: 69840,
                end: 69864,
                direction: "ltr"
            }, {
                start: 69872,
                end: 69881,
                direction: "ltr"
            }, {
                start: 69891,
                end: 69926,
                direction: "ltr"
            }, {
                start: 69932,
                end: 69932,
                direction: "ltr"
            }, {
                start: 69942,
                end: 69951,
                direction: "ltr"
            }, {
                start: 69952,
                end: 69955,
                direction: "ltr"
            }, {
                start: 70018,
                end: 70018,
                direction: "ltr"
            }, {
                start: 70019,
                end: 70066,
                direction: "ltr"
            }]
        }, {
            start: 70067,
            end: 74850,
            values: [{
                start: 70067,
                end: 70069,
                direction: "ltr"
            }, {
                start: 70079,
                end: 70080,
                direction: "ltr"
            }, {
                start: 70081,
                end: 70084,
                direction: "ltr"
            }, {
                start: 70085,
                end: 70088,
                direction: "ltr"
            }, {
                start: 70096,
                end: 70105,
                direction: "ltr"
            }, {
                start: 71296,
                end: 71338,
                direction: "ltr"
            }, {
                start: 71340,
                end: 71340,
                direction: "ltr"
            }, {
                start: 71342,
                end: 71343,
                direction: "ltr"
            }, {
                start: 71350,
                end: 71350,
                direction: "ltr"
            }, {
                start: 71360,
                end: 71369,
                direction: "ltr"
            }, {
                start: 73728,
                end: 74606,
                direction: "ltr"
            }, {
                start: 74752,
                end: 74850,
                direction: "ltr"
            }]
        }, {
            start: 74864,
            end: 119142,
            values: [{
                start: 74864,
                end: 74867,
                direction: "ltr"
            }, {
                start: 77824,
                end: 78894,
                direction: "ltr"
            }, {
                start: 92160,
                end: 92728,
                direction: "ltr"
            }, {
                start: 93952,
                end: 94020,
                direction: "ltr"
            }, {
                start: 94032,
                end: 94032,
                direction: "ltr"
            }, {
                start: 94033,
                end: 94078,
                direction: "ltr"
            }, {
                start: 94099,
                end: 94111,
                direction: "ltr"
            }, {
                start: 110592,
                end: 110593,
                direction: "ltr"
            }, {
                start: 118784,
                end: 119029,
                direction: "ltr"
            }, {
                start: 119040,
                end: 119078,
                direction: "ltr"
            }, {
                start: 119081,
                end: 119140,
                direction: "ltr"
            }, {
                start: 119141,
                end: 119142,
                direction: "ltr"
            }]
        }, {
            start: 119146,
            end: 119980,
            values: [{
                start: 119146,
                end: 119148,
                direction: "ltr"
            }, {
                start: 119149,
                end: 119154,
                direction: "ltr"
            }, {
                start: 119171,
                end: 119172,
                direction: "ltr"
            }, {
                start: 119180,
                end: 119209,
                direction: "ltr"
            }, {
                start: 119214,
                end: 119261,
                direction: "ltr"
            }, {
                start: 119648,
                end: 119665,
                direction: "ltr"
            }, {
                start: 119808,
                end: 119892,
                direction: "ltr"
            }, {
                start: 119894,
                end: 119964,
                direction: "ltr"
            }, {
                start: 119966,
                end: 119967,
                direction: "ltr"
            }, {
                start: 119970,
                end: 119970,
                direction: "ltr"
            }, {
                start: 119973,
                end: 119974,
                direction: "ltr"
            }, {
                start: 119977,
                end: 119980,
                direction: "ltr"
            }]
        }, {
            start: 119982,
            end: 120144,
            values: [{
                start: 119982,
                end: 119993,
                direction: "ltr"
            }, {
                start: 119995,
                end: 119995,
                direction: "ltr"
            }, {
                start: 119997,
                end: 120003,
                direction: "ltr"
            }, {
                start: 120005,
                end: 120069,
                direction: "ltr"
            }, {
                start: 120071,
                end: 120074,
                direction: "ltr"
            }, {
                start: 120077,
                end: 120084,
                direction: "ltr"
            }, {
                start: 120086,
                end: 120092,
                direction: "ltr"
            }, {
                start: 120094,
                end: 120121,
                direction: "ltr"
            }, {
                start: 120123,
                end: 120126,
                direction: "ltr"
            }, {
                start: 120128,
                end: 120132,
                direction: "ltr"
            }, {
                start: 120134,
                end: 120134,
                direction: "ltr"
            }, {
                start: 120138,
                end: 120144,
                direction: "ltr"
            }]
        }, {
            start: 120146,
            end: 120687,
            values: [{
                start: 120146,
                end: 120485,
                direction: "ltr"
            }, {
                start: 120488,
                end: 120512,
                direction: "ltr"
            }, {
                start: 120513,
                end: 120513,
                direction: "ltr"
            }, {
                start: 120514,
                end: 120538,
                direction: "ltr"
            }, {
                start: 120540,
                end: 120570,
                direction: "ltr"
            }, {
                start: 120571,
                end: 120571,
                direction: "ltr"
            }, {
                start: 120572,
                end: 120596,
                direction: "ltr"
            }, {
                start: 120598,
                end: 120628,
                direction: "ltr"
            }, {
                start: 120629,
                end: 120629,
                direction: "ltr"
            }, {
                start: 120630,
                end: 120654,
                direction: "ltr"
            }, {
                start: 120656,
                end: 120686,
                direction: "ltr"
            }, {
                start: 120687,
                end: 120687,
                direction: "ltr"
            }]
        }]
    }, {
        start: 120688,
        end: 1114109,
        values: [{
            start: 120688,
            end: 126499,
            values: [{
                start: 120688,
                end: 120712,
                direction: "ltr"
            }, {
                start: 120714,
                end: 120744,
                direction: "ltr"
            }, {
                start: 120745,
                end: 120745,
                direction: "ltr"
            }, {
                start: 120746,
                end: 120770,
                direction: "ltr"
            }, {
                start: 120772,
                end: 120779,
                direction: "ltr"
            }, {
                start: 124928,
                end: 126463,
                direction: "rtl"
            }, {
                start: 126464,
                end: 126467,
                direction: "rtl"
            }, {
                start: 126468,
                end: 126468,
                direction: "rtl"
            }, {
                start: 126469,
                end: 126495,
                direction: "rtl"
            }, {
                start: 126496,
                end: 126496,
                direction: "rtl"
            }, {
                start: 126497,
                end: 126498,
                direction: "rtl"
            }, {
                start: 126499,
                end: 126499,
                direction: "rtl"
            }]
        }, {
            start: 126500,
            end: 126529,
            values: [{
                start: 126500,
                end: 126500,
                direction: "rtl"
            }, {
                start: 126501,
                end: 126502,
                direction: "rtl"
            }, {
                start: 126503,
                end: 126503,
                direction: "rtl"
            }, {
                start: 126504,
                end: 126504,
                direction: "rtl"
            }, {
                start: 126505,
                end: 126514,
                direction: "rtl"
            }, {
                start: 126515,
                end: 126515,
                direction: "rtl"
            }, {
                start: 126516,
                end: 126519,
                direction: "rtl"
            }, {
                start: 126520,
                end: 126520,
                direction: "rtl"
            }, {
                start: 126521,
                end: 126521,
                direction: "rtl"
            }, {
                start: 126522,
                end: 126522,
                direction: "rtl"
            }, {
                start: 126523,
                end: 126523,
                direction: "rtl"
            }, {
                start: 126524,
                end: 126529,
                direction: "rtl"
            }]
        }, {
            start: 126530,
            end: 126547,
            values: [{
                start: 126530,
                end: 126530,
                direction: "rtl"
            }, {
                start: 126531,
                end: 126534,
                direction: "rtl"
            }, {
                start: 126535,
                end: 126535,
                direction: "rtl"
            }, {
                start: 126536,
                end: 126536,
                direction: "rtl"
            }, {
                start: 126537,
                end: 126537,
                direction: "rtl"
            }, {
                start: 126538,
                end: 126538,
                direction: "rtl"
            }, {
                start: 126539,
                end: 126539,
                direction: "rtl"
            }, {
                start: 126540,
                end: 126540,
                direction: "rtl"
            }, {
                start: 126541,
                end: 126543,
                direction: "rtl"
            }, {
                start: 126544,
                end: 126544,
                direction: "rtl"
            }, {
                start: 126545,
                end: 126546,
                direction: "rtl"
            }, {
                start: 126547,
                end: 126547,
                direction: "rtl"
            }]
        }, {
            start: 126548,
            end: 126560,
            values: [{
                start: 126548,
                end: 126548,
                direction: "rtl"
            }, {
                start: 126549,
                end: 126550,
                direction: "rtl"
            }, {
                start: 126551,
                end: 126551,
                direction: "rtl"
            }, {
                start: 126552,
                end: 126552,
                direction: "rtl"
            }, {
                start: 126553,
                end: 126553,
                direction: "rtl"
            }, {
                start: 126554,
                end: 126554,
                direction: "rtl"
            }, {
                start: 126555,
                end: 126555,
                direction: "rtl"
            }, {
                start: 126556,
                end: 126556,
                direction: "rtl"
            }, {
                start: 126557,
                end: 126557,
                direction: "rtl"
            }, {
                start: 126558,
                end: 126558,
                direction: "rtl"
            }, {
                start: 126559,
                end: 126559,
                direction: "rtl"
            }, {
                start: 126560,
                end: 126560,
                direction: "rtl"
            }]
        }, {
            start: 126561,
            end: 126589,
            values: [{
                start: 126561,
                end: 126562,
                direction: "rtl"
            }, {
                start: 126563,
                end: 126563,
                direction: "rtl"
            }, {
                start: 126564,
                end: 126564,
                direction: "rtl"
            }, {
                start: 126565,
                end: 126566,
                direction: "rtl"
            }, {
                start: 126567,
                end: 126570,
                direction: "rtl"
            }, {
                start: 126571,
                end: 126571,
                direction: "rtl"
            }, {
                start: 126572,
                end: 126578,
                direction: "rtl"
            }, {
                start: 126579,
                end: 126579,
                direction: "rtl"
            }, {
                start: 126580,
                end: 126583,
                direction: "rtl"
            }, {
                start: 126584,
                end: 126584,
                direction: "rtl"
            }, {
                start: 126585,
                end: 126588,
                direction: "rtl"
            }, {
                start: 126589,
                end: 126589,
                direction: "rtl"
            }]
        }, {
            start: 126590,
            end: 126703,
            values: [{
                start: 126590,
                end: 126590,
                direction: "rtl"
            }, {
                start: 126591,
                end: 126591,
                direction: "rtl"
            }, {
                start: 126592,
                end: 126601,
                direction: "rtl"
            }, {
                start: 126602,
                end: 126602,
                direction: "rtl"
            }, {
                start: 126603,
                end: 126619,
                direction: "rtl"
            }, {
                start: 126620,
                end: 126624,
                direction: "rtl"
            }, {
                start: 126625,
                end: 126627,
                direction: "rtl"
            }, {
                start: 126628,
                end: 126628,
                direction: "rtl"
            }, {
                start: 126629,
                end: 126633,
                direction: "rtl"
            }, {
                start: 126634,
                end: 126634,
                direction: "rtl"
            }, {
                start: 126635,
                end: 126651,
                direction: "rtl"
            }, {
                start: 126652,
                end: 126703,
                direction: "rtl"
            }]
        }, {
            start: 126706,
            end: 178205,
            values: [{
                start: 126706,
                end: 126719,
                direction: "rtl"
            }, {
                start: 126720,
                end: 126975,
                direction: "rtl"
            }, {
                start: 127248,
                end: 127278,
                direction: "ltr"
            }, {
                start: 127280,
                end: 127337,
                direction: "ltr"
            }, {
                start: 127344,
                end: 127386,
                direction: "ltr"
            }, {
                start: 127462,
                end: 127490,
                direction: "ltr"
            }, {
                start: 127504,
                end: 127546,
                direction: "ltr"
            }, {
                start: 127552,
                end: 127560,
                direction: "ltr"
            }, {
                start: 127568,
                end: 127569,
                direction: "ltr"
            }, {
                start: 131072,
                end: 173782,
                direction: "ltr"
            }, {
                start: 173824,
                end: 177972,
                direction: "ltr"
            }, {
                start: 177984,
                end: 178205,
                direction: "ltr"
            }]
        }, {
            start: 194560,
            end: 1114109,
            values: [{
                start: 194560,
                end: 195101,
                direction: "ltr"
            }, {
                start: 983040,
                end: 1048573,
                direction: "ltr"
            }, {
                start: 1048576,
                end: 1114109,
                direction: "ltr"
            }]
        }]
    }]
});
Jx.TreeNode = function () { };
Jx.TreeNode.Error = {
    invalidChild: "Invalid child",
    unexpectedParent: "Unexpected parent"
};
Jx.TreeNode.prototype = {
    _parent: null,
    _children: null,
    getParent: function () {
        return this._parent
    },
    _setParent: function (n) {
        this._parent = n
    },
    isRoot: function () {
        return this._parent === null
    },
    getChild: function (n) {
        if (this._children !== null)
            return this._children[n]
    },
    getChildrenCount: function () {
        return this._children === null ? 0 : this._children.length
    },
    hasChildren: function () {
        return this.getChildrenCount() !== 0
    },
    insertChild: function (n, t) {
        if (n === null || n === undefined || n === this || !n.getParent)
            throw Jx.TreeNode.Error.invalidChild;
        if (n.getParent() !== null)
            throw Jx.TreeNode.Error.unexpectedParent;
        this._children === null && (this._children = []);
        this._children.splice(t, 0, n);
        n._setParent(this)
    },
    appendChild: function (n) {
        this.insertChild(n, this._children ? this._children.length : 0)
    },
    append: function () {
        for (var n = 0, t = arguments.length; n < t; n++)
            this.appendChild(arguments[n])
    },
    removeChildAt: function (n) {
        var t, i = this._children;
        return i !== null && (t = i.splice(n, 1)[0],
            t._setParent(null)),
            t
    },
    removeChild: function (n) {
        if (this._children !== null) {
            var t = this._children,
                i = t.indexOf(n);
            i !== -1 && (t[i]._setParent(null),
                t.splice(i, 1))
        }
    },
    removeChildren: function () {
        var t = this._children,
            n, i;
        if (t !== null) {
            for (n = 0,
                i = t.length; n < i; n++)
                t[n]._setParent(null);
            this._children = null
        }
    },
    forEachChild: function (n, t) {
        this._children !== null && this._children.forEach(n, t)
    },
    indexOfChild: function (n) {
        return this._children === null ? -1 : this._children.indexOf(n)
    }
};
Jx.Events = {
    initEvents: function () {
        return this._jxev = this._jxev || {},
            this
    },
    addListener: function (n, t, i) {
        var r = this._jxev = this._jxev || {};
        return r[n] = r[n] || {
            recursionCount: 0,
            isSweepNeeded: false,
            listeners: []
        },
            r[n].listeners.push({
                fn: t,
                obj: i
            }),
            this
    },
    removeListener: function (n, t, i) {
        var r, e, u, f;
        if (this._jxev && (f = this._jxev[n],
            f))
            for (r = f.listeners,
                u = r.length; u--;)
                if (e = r[u],
                    Boolean(e) && e.fn === t && e.obj === i)
                    return f.recursionCount !== 0 ? (r[u] = null,
                        f.isSweepNeeded = true) : r.splice(u, 1),
                        this;
        return this
    },
    hasListener: function (n) {
        var i, r, u, t, f;
        if (i = this._jxev,
            i && (r = i[n],
                r))
            for (u = r.listeners,
                t = 0,
                f = u.length; t < f; ++t)
                if (u[t])
                    return true;
        return false
    },
    disposeEvents: function () {
        this._jxev && (this._jxev = null)
    },
    raiseEvent: function (n, t, i) {
        var s = "Jx.Events.raiseEvent:" + n,
            f, e, r, h, u, o;
        if (Jx.mark(s + ",StartTA,Jx,Events"),
            i = i || {},
            i.listeners = 0,
            o = this._jxev,
            o && (u = o[n],
                u)) {
            for (f = u.listeners,
                ++u.recursionCount,
                r = 0,
                h = f.length; r < h; ++r)
                e = f[r],
                    e && (e.fn.call(e.obj, t),
                        i.listeners++);
            if (--u.recursionCount == 0 && u.isSweepNeeded) {
                for (r = f.length; r--;)
                    f[r] || f.splice(r, 1);
                u.isSweepNeeded = false
            }
        }
        return Jx.mark(s + ",StopTA,Jx,Events"),
            this
    }
};
Jx.initEvents = function (n) {
    return Jx.Events.initEvents.call(n)
};
Jx.addListener = function (n, t, i, r) {
    return Jx.Events.addListener.call(n, t, i, r)
};
Jx.removeListener = function (n, t, i, r) {
    return Jx.Events.removeListener.call(n, t, i, r)
};
Jx.hasListener = function (n, t) {
    return Jx.Events.hasListener.call(n, t)
};
Jx.raiseEvent = function (n, t, i) {
    return Jx.Events.raiseEvent.call(n, t, i)
};
Jx.disposeEvents = function (n) {
    return Jx.Events.disposeEvents.call(n)
};
Jx.EventManager = {
    Stages: {
        routing: 1,
        direct: 2,
        bubbling: 3,
        broadcast: 4
    },
    addListener: function (n, t, i, r) {
        n || (n = this);
        var u = n._jxEvents || (n._jxEvents = {}),
            f = u[t] || (u[t] = []);
        f.push({
            fn: i,
            context: r
        })
    },
    removeListener: function (n, t, i, r) {
        var e, u, f, o;
        if (n || (n = this),
            e = n._jxEvents,
            e && (u = e[t],
                u))
            for (f = 0; f < u.length; f++)
                if (o = u[f],
                    o.fn === i && o.context === r) {
                    u.splice(f, 1);
                    return
                }
    },
    fire: function (n, t, i, r) {
        var f, u, e, s, h, o;
        if (f = null,
            u = {
                source: n,
                type: t,
                data: i,
                routes: r && "routes" in r ? r.routes : true,
                bubbles: r && "bubbles" in r ? r.bubbles : true,
                stage: null,
                handled: false,
                cancel: false
            },
            n || (n = this),
            (u.routes || u.bubbles) && (f = this._buildEventChain(n, t)),
            u.routes)
            for (u.stage = this.Stages.routing,
                e = f.length - 1; e >= 0; e--)
                if (this._fire(u, f[e]),
                    u.cancel)
                    return;
        if ((s = n._jxEvents, !s || (h = s[t], !h || (u.stage = this.Stages.direct,
            this._fire(u, h), !u.cancel))) && u.bubbles)
            for (u.stage = this.Stages.bubbling,
                o = 0; o < f.length; o++)
                if (this._fire(u, f[o]),
                    u.cancel)
                    return
    },
    fireDirect: function (n, t, i) {
        this.fire(n, t, i, {
            bubbles: false,
            routes: false
        })
    },
    broadcast: function (n, t, i) {
        if (i || (i = Jx.root),
            i) {
            var r = {
                source: i,
                type: n,
                data: t,
                routes: false,
                bubbles: false,
                stage: Jx.EventManager.Stages.broadcast,
                cancel: false
            };
            Jx.EventManager._broadcast(r, i)
        }
    },
    _buildEventChain: function (n, t) {
        var f = [],
            i, r, u;
        if (n.getParent)
            for (i = n.getParent(); i; i = i.getParent())
                r = i._jxEvents,
                    r && (u = r[t],
                        u && f.push(u));
        return f
    },
    _fire: function (n, t) {
        for (var r, i = 0; i < t.length && !n.cancel; i++)
            r = t[i],
                r.fn.call(r.context, n)
    },
    _broadcast: function (n, t) {
        var u = t._jxEvents,
            r, f, i;
        if (u && (r = u[n.type],
            r && this._fire(n, r)), !n.cancel && t.getChild)
            for (f = t.getChildrenCount(),
                i = 0; i < f; i++)
                this._broadcast(n, t.getChild(i))
    }
};
Jx.EventTarget = {};
Jx.EventTarget.on = function (n, t, i) {
    Jx.EventManager.addListener(this, n, t, i || this)
};
Jx.EventTarget.detach = function (n, t, i) {
    Jx.EventManager.removeListener(this, n, t, i || this)
};
Jx.EventTarget.fire = function (n, t, i) {
    Jx.EventManager.fire(this, n, t, i)
};
Jx.EventTarget.fireDirect = function (n, t) {
    Jx.EventManager.fireDirect(this, n, t)
};
Jx.Hash2 = function () {
    this._data = {}
};
Jx.Hash2.prototype = {
    _data: null,
    set: function (n, t, i) {
        var r = this._data;
        r[n] = r[n] || {};
        r[n][t] = i
    },
    setAll: function (n, t) {
        var i;
        for (i in t)
            t.hasOwnProperty(i) && this.set(n, i, t[i])
    },
    get: function (n, t) {
        var i = this._data;
        return i[n] && t in i[n] ? i[n][t] : undefined
    },
    has: function (n, t) {
        var i = this._data;
        return i[n] ? t === undefined ? true : t in i[n] : false
    },
    remove: function (n, t) {
        var i = this._data;
        i[n] && t in i[n] && delete i[n][t]
    },
    removeAll: function (n) {
        delete this._data[n]
    },
    reset: function () {
        this._data = {}
    },
    forEachKey1: function (n, t) {
        Object.keys(this._data).forEach(n, t)
    }
};
Jx.isAttrObject = function (n) {
    return Boolean(Jx.isObject(n) && n.attr)
};
Jx.ATTR_VALUE = "value";
Jx.ATTR_SET = "set";
Jx.ATTR_GET = "get";
Jx.ATTR_VALID = "valid";
Jx.ATTR_CHANGED = "changed";
Jx.ATTR_BIND_SRC = "bindSrc";
Jx.ATTR_BIND_DEST = "bindDest";
Jx.ATTR_EVENT_CHANGED = "Changed";
Jx.ATTR_INVALID_VALUE = {};
Jx.Attr = function () { };
Jx.Attr.prototype = {
    _attr: null,
    initAttr: function () {
        this._attr = new Jx.Hash2
    },
    isAttrInit: function () {
        return this._attr !== null
    },
    shutdownAttr: function () {
        this._attr = null
    },
    resetAttr: function () {
        this._attr && this._attr.reset()
    },
    attr: function (n, t) {
        this._attr.setAll(n, t || {
            value: undefined
        });
        this._fixupAttr(n)
    },
    isAttr: function (n) {
        return this._attr.has(n)
    },
    removeAttr: function (n) {
        this._attr.removeAll(n)
    },
    getAttr: function (n) {
        var t = this._attr.get(n, Jx.ATTR_GET);
        return t ? t.call(this, n) : this._attr.get(n, Jx.ATTR_VALUE)
    },
    setAttr: function (n, t) {
        return this._setAttr(n, t, true)
    },
    setAttrs: function (n) {
        for (var t in n)
            n.hasOwnProperty(t) && this.attr(t, {
                value: n[t]
            })
    },
    _setAttr: function (n, t, i) {
        var r, e, o, u, c, f, s, h;
        if (r = this.getAttr(n),
            i && r === t)
            return true;
        if ((e = this._attr.get(n, Jx.ATTR_VALID),
            Boolean(e) && !e.call(this, t, n)) || (o = this._attr.get(n, Jx.ATTR_SET),
                o && (t = o.call(this, t, n),
                    t === Jx.ATTR_INVALID_VALUE)))
            return false;
        if (this._attr.set(n, Jx.ATTR_VALUE, t),
            u = this._attr.get(n, Jx.ATTR_BIND_DEST),
            u)
            for (c = u.length,
                f = 0; f < c; f++)
                s = u[f],
                    s.obj.setAttr(s.attr, t);
        return h = this._attr.get(n, Jx.ATTR_CHANGED),
            h && h.call(this, n, t, r),
            Jx.EventManager.fireDirect(this, n + Jx.ATTR_EVENT_CHANGED, {
                name: n,
                oldValue: r,
                newValue: t
            }),
            true
    },
    _fixupAttr: function (n) {
        this._setAttr(n, this.getAttr(n), false)
    },
    _bindAdd: function (n, t, i, r) {
        var o = this,
            u = o._attr.get(n, t),
            f, s, e;
        if (u) {
            for (f = 0,
                s = u.length; f < s; f++)
                if (e = u[f],
                    e.obj === i && e.attr === r)
                    return
        } else
            u = [],
                o._attr.set(n, t, u);
        u.push({
            obj: i,
            attr: r
        })
    },
    _bindRemove: function (n, t, i, r) {
        var s = this,
            f = s._attr.get(n, t),
            u, o, e;
        if (f)
            for (u = 0,
                o = f.length; u < o; u++)
                if (e = f[u],
                    e.obj === i && e.attr === r) {
                    f.splice(u, 1);
                    return
                }
    },
    bindAttr: function (n, t, i) {
        var r = this;
        r !== t && (r.isAttr(n) || r.attr(n),
            t.isAttr(i) || t.attr(i),
            r._bindAdd(n, Jx.ATTR_BIND_DEST, t, i),
            t._bindAdd(i, Jx.ATTR_BIND_SRC, r, n),
            t.setAttr(i, r.getAttr(n)))
    },
    bindAttr2Way: function (n, t, i) {
        this.bindAttr(n, t, i);
        t.bindAttr(i, this, n)
    },
    unbindAttr: function (n, t, i) {
        this.isAttr(n) && t.isAttr(i) && (this._bindRemove(n, Jx.ATTR_BIND_DEST, t, i),
            t._bindRemove(i, Jx.ATTR_BIND_SRC, this, n))
    },
    unbindAttr2Way: function (n, t, i) {
        this.isAttr(n) && t.isAttr(i) && (this._bindRemove(n, Jx.ATTR_BIND_DEST, t, i),
            t._bindRemove(i, Jx.ATTR_BIND_SRC, this, n),
            this._bindRemove(n, Jx.ATTR_BIND_SRC, t, i),
            t._bindRemove(i, Jx.ATTR_BIND_DEST, this, n))
    },
    getAttrValues: function () {
        var n = {};
        return this._attr.forEachKey1(function (t) {
            n[t] = this.getAttr(t)
        }, this),
            n
    }
};
Jx.delayDefine(Jx, ["Activation", "activation"], function () {
    function i(n) {
        Jx.mark("Jx.Activation." + n + ",Info,Jx")
    }

    function n(n) {
        Jx.mark("Jx.Activation." + n + ",StartTA,Jx")
    }

    function t(n) {
        Jx.mark("Jx.Activation." + n + ",StopTA,Jx")
    }
    Jx.Activation = function () {
        this.lastKind = Jx.Activation.neverActivated;
        this._activated = this._activated.bind(this);
        this._suspending = this._suspending.bind(this);
        this._resuming = this._resuming.bind(this);
        this._navigated = this._navigated.bind(this);
        var n = Windows.UI.WebUI.WebUIApplication.addEventListener;
        n("activated", this._activated);
        n("suspending", this._suspending);
        n("resuming", this._resuming);
        n("navigated", this._navigated)
    };
    Jx.Activation.neverActivated = -1;
    Jx.Activation.prototype = {
        accountPictureProvider: "accountPictureProvider",
        activated: "activated",
        appointmentsProvider: "appointmentsProvider",
        autoPlayDevice: "autoPlayDevice",
        autoPlayFile: "autoPlayFile",
        cachedFileUpdater: "cachedFileUpdater",
        contact: "contact",
        contactPicker: "contactPicker",
        fileOpenPicker: "fileOpenPicker",
        fileSavePicker: "fileSavePicker",
        navigated: "navigated",
        protocol: "protocol",
        resuming: "resuming",
        search: "search",
        share: "share",
        suspending: "suspending",
        tile: "tile",
        dispose: function () {
            var n = Windows.UI.WebUI.WebUIApplication.removeEventListener;
            n("activated", this._activated);
            n("suspending", this._suspending);
            n("resuming", this._resuming);
            n("navigated", this._navigated)
        },
        _activated: function (r) {
            var f, u;
            r.prelaunchActivated && i("_activated:prelaunched");
            f = "_activated:kind=" + String(r.kind);
            n(f);
            this.lastKind = r.kind;
            this.raiseEvent(this.activated, r);
            u = Windows.ApplicationModel.Activation.ActivationKind;
            switch (r.kind) {
                case u.appointmentsProvider:
                    this.raiseEvent(this.appointmentsProvider, r);
                    break;
                case u.cachedFileUpdater:
                    this.raiseEvent(this.cachedFileUpdater, r);
                    break;
                case u.contact:
                    this.raiseEvent(this.contact, r);
                    break;
                case u.contactPicker:
                    this.raiseEvent(this.contactPicker, r);
                    break;
                case u.device:
                    this.raiseEvent(this.autoPlayDevice, r);
                    break;
                case u.file:
                    this.raiseEvent(this.autoPlayFile, r);
                    break;
                case u.fileOpenPicker:
                    this.raiseEvent(this.fileOpenPicker, r);
                    break;
                case u.fileSavePicker:
                    this.raiseEvent(this.fileSavePicker, r);
                    break;
                case u.launch:
                    this.raiseEvent(this.tile, r);
                    break;
                case u.protocol:
                    this.raiseEvent(this.protocol, r);
                    break;
                case u.search:
                    this.raiseEvent(this.search, r);
                    break;
                case u.shareTarget:
                    this.raiseEvent(this.share, r);
                    break;
                default:
                    i("_onActivated:contractId not supported")
            }
            return t(f),
                false
        },
        _suspending: function (i) {
            n("_suspending");
            this.raiseEvent(this.suspending, i);
            t("_suspending")
        },
        _resuming: function (i) {
            n("_resuming");
            this.raiseEvent(this.resuming, i);
            t("_resuming")
        },
        _navigated: function (i) {
            n("_navigated");
            this.raiseEvent(this.navigated, i);
            t("_navigated")
        }
    };
    Jx.augment(Jx.Activation, Jx.Events);
    Jx.activation = null
});
Jx.delayDefine(Jx, ["AppData", "appData"], function () {
    function n(n) {
        Jx.mark("Jx.AppData." + n + ",StartTA,Jx")
    }

    function t(n) {
        Jx.mark("Jx.AppData." + n + ",StopTA,Jx")
    }

    function i(i) {
        i._ad || (n("current"),
            i._ad = Windows.Storage.ApplicationData.current,
            t("current"))
    }
    Jx.AppData = function () {
        this._rs = null;
        this._ls = null;
        this._ad = null
    };
    Jx.AppData.prototype = {
        dispose: function () {
            this._ad = this._ls = this._rs = null
        },
        localSettings: function () {
            return i(this),
                this._ls || (n("localSettings"),
                    this._ls = new Jx.AppDataContainer(this._ad.localSettings),
                    t("localSettings")),
                this._ls
        },
        roamingSettings: function () {
            return i(this),
                this._rs || (n("roamingSettings"),
                    this._rs = new Jx.AppDataContainer(this._ad.roamingSettings),
                    t("roamingSettings")),
                this._rs
        }
    };
    Jx.AppDataContainer = function (n) {
        this._adc = n;
        this._values = n.values
    };
    Jx.AppDataContainer.prototype = {
        _settingSize: 4095,
        dispose: function () {
            this._adc = null;
            this._values = null
        },
        name: function () {
            return this._adc.name
        },
        isLocal: function () {
            return this._adc.locality === Windows.Storage.ApplicationDataLocality.local
        },
        isRoaming: function () {
            return this._adc.locality === Windows.Storage.ApplicationDataLocality.roaming
        },
        _getContainer: function (n) {
            return this._adc.containers[n]
        },
        getContainer: function (n) {
            var t = this._getContainer(n);
            return t ? new Jx.AppDataContainer(t) : null
        },
        createContainer: function (n) {
            return Jx.log.info("Jx.AppDataContainer.createContainer"),
                new Jx.AppDataContainer(this._adc.createContainer(n, Windows.Storage.ApplicationDataCreateDisposition.always))
        },
        container: function (n) {
            return this.getContainer(n) || this.createContainer(n)
        },
        deleteContainer: function (n) {
            Jx.log.info("Jx.AppDataContainer.deleteContainer");
            this._adc.deleteContainer(n)
        },
        get: function (n) {
            return this._adc.lookup(n)
        },
        set: function (n, t) {
            return Jx.log.info("Jx.AppDataContainer.set"),
                this._adc.set(n, t)
        },
        remove: function (n) {
            return Jx.log.info("Jx.AppDataContainer.remove"),
                this._adc.remove(n)
        },
        setObject: function (n, t) {
            function r(n, t) {
                var u = true,
                    f, i, e;
                for (f in n)
                    if (i = n[f], !Jx.isNullOrUndefined(i) && (Jx.isObject(i) ? (e = t.createContainer(f),
                        u = r(i, e)) : u = Jx.isValidNumber(i) || Jx.isString(i) || Jx.isBoolean(i) ? t.set(f, i) : false, !u))
                        break;
                return u
            }
            var u, i;
            return (u = JSON.stringify(t),
                Jx.log.info("Jx.AppDataContainer.setObject"),
                this.deleteContainer(n),
                i = this.createContainer(n), !r(t, i)) ? (this.deleteContainer(i.name()),
                    false) : true
        },
        getObject: function (n) {
            function r(n, t) {
                var i, r;
                if (t.size > 0)
                    for (i = t.first(); i.hasCurrent; i.moveNext())
                        r = i.current,
                            n[r.key] = r.value
            }

            function u(n, t) {
                var i, r, u;
                if (t.size > 0)
                    for (i = t.first(); i.hasCurrent; i.moveNext())
                        r = i.current,
                            u = n[r.key] = {},
                            f(u, r.value)
            }

            function f(n, t) {
                r(n, t.values);
                u(n, t.containers)
            }

            function e(n, t) {
                r(n, t._values);
                u(n, t._adc.containers)
            }
            var t, i;
            return (t = this.getContainer(n), !t) ? null : (i = {},
                e(i, t),
                i)
        },
        getValues: function () {
            return this._adc.values
        },
        _getSegmentContainerName: function (n) {
            return n + "_segment"
        },
        _setLongString: function (n, t, i) {
            var f, r, e, o, u, s;
            if (Jx.log.info("Jx.AppDataContainer._setLongString"),
                this.remove(n),
                f = this._getSegmentContainerName(n),
                this.deleteContainer(f),
                r = true,
                i || (i = this._settingSize),
                e = t.length,
                e > i) {
                for (o = this.createContainer(f),
                    u = 0,
                    u; e > 0 && r; e -= i,
                    u++)
                    s = t.substr(u * i, i),
                        r = o._values.set(String(u), s);
                r && (r = o._values.set("-1", u));
                r || this.deleteContainer(f)
            } else
                r = this._values.set(n, t);
            return r
        },
        _getLongString: function (n) {
            var t, u, i, f, r;
            if (t = this._values.get(n), !t) {
                if (u = this._getSegmentContainerName(n),
                    i = this.getContainer(u), !i)
                    return "";
                for (f = i.get("-1"),
                    t = "",
                    r = 0; r < f; r++)
                    t += i.get(String(r))
            }
            return t
        },
        setObjectInSegments: function (n, t) {
            return Jx.log.info("Jx.AppDataContainer.setObjectInSegments"),
                this._setLongString(n, JSON.stringify(t))
        },
        getObjectInSegments: function (n) {
            var t = this._getLongString(n);
            if (Jx.isNonEmptyString(t))
                try {
                    return JSON.parse(t)
                } catch (i) {
                    return Jx.log.exception("Jx.AppDataContainer.getObjectInSegments: JSON failed to parse data", i),
                        Jx.log.pii("Failing data: " + t),
                        null
                }
            else
                return null
        }
    };
    Jx.appData = null
});
Jx.delayDefine(Jx, "SettingsFlyout", function () {
    function r(n) {
        return '<div class="win-header"><button type="button" class="win-backbutton"><\/button><div class="win-label">' + n + '<\/div><div class="icon"><\/div><\/div><div class="win-content" role="menuitem"><\/div>'
    }

    function u(n) {
        return '<div class="win-settings-section about"><h3>' + n.name + "<\/h3><p>" + n.publisher + "<br>" + n.version + "<\/p><p>" + n.servicesAgreement + "<\/p><p>" + n.licenseAgreement + "<\/p><p>" + n.privacyStatement + "<\/p><p>" + n.copyright + "<\/p><\/div>"
    }

    function i() {
        t || (Jx.loadCss("/Jx/SettingsFlyout.css"),
            t = true)
    }
    var t = false,
        n = Jx.SettingsFlyout = function (n) {
            i();
            this._oldActiveElement = null;
            this._host = document.createElement("div");
            this._flyout = new WinJS.UI.SettingsFlyout(this._host);
            this._host.classList.add("jx-settingsflyout");
            this._host.innerHTML = r(n);
            this._content = this._host.querySelector(".win-content");
            this._back = this._host.querySelector(".win-backbutton");
            this._back.addEventListener("click", this._onBack.bind(this), false);
            this._flyout.addEventListener("afterhide", this._onAfterHide.bind(this), false)
        };
    n.showAbout = function (t) {
        i();
        var r = Jx.res,
            s = r.getString("/Jx/About"),
            e = r.getString("/Jx/Publisher"),
            f = Windows.ApplicationModel.Package.current.id.version,
            h = "<a href='http://go.microsoft.com/fwlink/?LinkID=246338'>" + r.getString("/Jx/AboutServicesAgreement") + "<\/a>",
            c = "<a href='http://go.microsoft.com/fwlink/?LinkID=252923'>" + r.getString("/Jx/AboutLicenseAgreement") + "<\/a>",
            l = "<a href='http://go.microsoft.com/fwlink/?LinkID=286959'>" + r.getString("/Jx/AboutPrivacyStatement") + "<\/a>",
            a = u({
                name: t,
                publisher: r.loadCompoundString("/Jx/AboutPublisher", e),
                version: r.loadCompoundString("/Jx/AboutVersion", f.major + "." + f.minor + "." + f.build + "." + f.revision),
                servicesAgreement: r.loadCompoundString("/Jx/AboutServicesAgreementText", h),
                licenseAgreement: r.loadCompoundString("/Jx/AboutLicenseAgreementText", c),
                privacyStatement: l,
                copyright: r.loadCompoundString("/Jx/AboutCopyright", r.getString("/Jx/PublishDate"), e)
            }),
            o = new n(s);
        o.getContentElement().innerHTML = a;
        o.show()
    };
    n.prototype.getContentElement = function () {
        return this._content
    };
    n.prototype.show = function () {
        this._host.parentElement || (this._oldActiveElement = document.activeElement,
            document.body.appendChild(this._host),
            this._flyout.show(),
            this._back.isDisabled || this._back.setActive())
    };
    n.prototype._onBack = function () {
        this._flyout.hide();
        Windows.UI.ApplicationSettings.SettingsPane.show()
    };
    n.prototype._onAfterHide = function () {
        document.body.removeChild(this._host);
        Jx.isHTMLElement(this._oldActiveElement) && Jx.isHTMLElement(this._oldActiveElement.parentElement) && Jx.safeSetActive(this._oldActiveElement)
    }
}),
    function () {
        Jx.Storage = function () {
            Jx.mark("Jx.Storage(),Info,Jx,Storage");
            this.initAttr()
        };
        Jx.augment(Jx.Storage, Jx.Attr);
        var n = Jx.Storage.prototype;
        n._isInit = function () {
            return this.isAttrInit()
        };
        n.shutdown = function () {
            this.shutdownAttr();
            Jx.mark("Jx.Storage.shutdown,Info,Jx,Storage")
        };
        n.reset = function () {
            Jx.mark("Jx.Storage.reset,Info,Jx,Storage");
            this.resetAttr()
        };
        n.setItems = function (n) {
            Jx.mark("Jx.Storage.setItems,StartTA,Jx,Storage");
            for (var t in n)
                n.hasOwnProperty(t) && this.attr(t, {
                    value: n[t]
                });
            Jx.mark("Jx.Storage.setItems,StopTA,Jx,Storage")
        };
        n._getData = function () {
            return unescape(Jx.appData.localSettings().container("Jx").get("Storage") || "")
        };
        n.load = function () {
            Jx.mark("Jx.Storage.load,StartTA,Jx,Storage");
            var n;
            try {
                n = JSON.parse(this._getData())
            } catch (t) {
                n = {}
            }
            Object.keys(n).forEach(function (t) {
                this.attr(t, {
                    value: n[t]
                })
            }, this);
            Jx.mark("Jx.Storage.load,StopTA,Jx,Storage")
        };
        n.save = function () {
            Jx.mark("Jx.Storage.save,StartTA,Jx,Storage");
            var n = this.getAttrValues(),
                t = escape(JSON.stringify(n));
            Jx.appData.localSettings().container("Jx").set("Storage", t);
            Jx.mark("Jx.Storage.save,StopTA,Jx,Storage")
        };
        n.remove = function () {
            Jx.mark("Jx.Storage.remove,StartTA,Jx,Storage");
            Jx.appData.localSettings().container("Jx").remove("Storage");
            Jx.mark("Jx.Storage.remove,StopTA,Jx,Storage")
        };
        Jx.storage = null
    }();
Jx._platformNamespace = null;
Jx.forceSync = function (n, t) {
    Jx.sync(n, true, t)
};
Jx.startupSync = function (n, t) {
    Jx.sync(n, false, t)
};
Jx.sync = function (n, t, i) {
    var r, u, f, o, e;
    for (Jx.mark("Jx.forceSync,StartTA,Jx"),
        Jx.log.info("Jx.forceSync.start"),
        r = Jx._platformNamespace || Microsoft.WindowsLive.Platform,
        u = n.accountManager.getConnectedAccountsByScenario(i, r.ConnectedFilter.normal, r.AccountSort.name),
        f = 0,
        o = u.count; f < o; f++)
        e = u.item(f),
            (Boolean(t) || Number(e.syncType) !== r.SyncType.manual) && Jx.forceSyncAccount(e, i);
    u.dispose();
    Jx.mark("Jx.forceSync,StopTA,Jx")
};
Jx.forceSyncAccount = function (n, t) {
    var e, r, u, f, i;
    Jx.mark("Jx.forceSyncAccount,StartTA,Jx");
    e = Jx._platformNamespace || Microsoft.WindowsLive.Platform;
    Jx.mark("Jx.forceSyncAccount - accountId:" + n.objectId + " scenario:" + t + ",Info,Jx");
    r = e.ResourceType;
    u = e.ApplicationScenario;
    switch (t) {
        case u.mail:
            f = r.mail;
            break;
        case u.calendar:
            f = r.calendar;
            break;
        case u.people:
            f = r.contacts
    }
    if (i = n.getResourceByType(f),
        Boolean(i) && i.canEdit) {
        i.isSyncNeeded = true;
        try {
            i.commit();
            n.commit()
        } catch (o) {
            Jx.log.warning("Unable to force sync account.");
            Jx.log.warning("Name: " + o.name);
            Jx.log.warning("Message: " + o.message)
        }
    }
    Jx.mark("Jx.forceSyncAccount,StopTA,Jx")
};
Jx.delayDefine(Jx, "UrlHash", function () {
    Jx.UrlHash = function () {
        Jx.log.info("Jx.UrlHash.start");
        this._onhashchange = this._onhashchange.bind(this);
        window.addEventListener("hashchange", this._onhashchange, false);
        Jx.log.info("Jx.UrlHash.end")
    };
    Jx.UrlHash.prototype = {
        hashChange: "hashChange",
        dispose: function () {
            Jx.log.info("Jx.UrlHash.dispose");
            window.removeEventListener("hashchange", this._onhashchange, false);
            this.disposeEvents()
        },
        getHash: function () {
            Jx.log.info("Jx.UrlHash.getHash");
            var n = window.location.hash;
            return n[0] === "#" && (n = n.substr(1)),
                n
        },
        clear: function () {
            window.location.hash = ""
        },
        _onhashchange: function (n) {
            var i = n.target,
                t = i.location.hash;
            t[0] === "#" && (t = t.substr(1));
            Jx.log.info("Jx.UrlHash fire hashchange start " + t);
            this.raiseEvent(this.hashChange, t);
            Jx.log.info("Jx.UrlHash fire hashchange end")
        }
    };
    Jx.augment(Jx.UrlHash, Jx.Events)
});
Jx.delayDefine(Jx, "Nav", function () {
    Jx.Nav = function () {
        Jx.log.info("Jx.Nav.start");
        this.backStack = [];
        this.forwardStack = [];
        Jx.log.info("Jx.Nav.end")
    };
    Jx.Nav.prototype = {
        _location: null,
        backStack: null,
        forwardStack: null,
        beforeNavigate: "beforeNavigate",
        navigate: "navigate",
        maxStack: 20,
        dispose: function () {
            this._location = this.backStack = this.forwardStack = null;
            this.disposeEvents()
        },
        getLocation: function () {
            return this._location
        },
        canGoForward: function () {
            return this.forwardStack.length > 0
        },
        canGoBack: function () {
            return this.backStack.length > 0
        },
        forward: function (n) {
            return this._go(n || 1, this.forwardStack, this.backStack)
        },
        back: function (n) {
            return this._go(n || 1, this.backStack, this.forwardStack)
        },
        go: function (n) {
            var t, i;
            Jx.log.info("Jx.Nav.go.start");
            t = {
                location: n,
                cancel: false
            };
            this._raiseEvent(this.beforeNavigate, t);
            t.cancel || (this._location && (i = this.backStack,
                i.push(this._location),
                i.length > this.maxStack && i.shift()),
                this.forwardStack = [],
                this._location = t.location,
                this._raiseEvent(this.navigate, {
                    location: this._location
                }));
            Jx.log.info("Jx.Nav.go.end")
        },
        _raiseEvent: function (n, t) {
            var i = JSON.stringify(t);
            Jx.log.info("Jx.Nav._raiseEvent.start");
            this.raiseEvent(n, t);
            Jx.log.info("Jx.Nav._raiseEvent.end")
        },
        _go: function (n, t, i) {
            if (Jx.log.info("Jx.Nav.go.start distance=" + String(n)),
                n = Math.min(n, t.length),
                n > 0) {
                var r = {
                    distance: n,
                    location: t[t.length - n],
                    cancel: false
                };
                if (this._raiseEvent(this.beforeNavigate, r), !r.cancel) {
                    for (i.push(this._location); --n;)
                        i.push(t.pop());
                    return this._location = r.location,
                        t.pop(),
                        this._raiseEvent(this.navigate, {
                            location: this._location
                        }),
                        true
                }
            }
            return false
        }
    };
    Jx.augment(Jx.Nav, Jx.Events)
});
Jx.delayDefine(Jx, "HashToNav", function () {
    Jx.HashToNav = function (n, t) {
        this._urlHash = n;
        n.addListener(n.hashChange, this._onHashChange, this);
        this._nav = t
    };
    Jx.HashToNav.prototype = {
        _urlHash: null,
        _nav: null,
        _hashReset: false,
        dispose: function () {
            this._urlHash.removeListener(this._urlHash.hashChange, this._onHashChange, this);
            this._urlHash = null;
            this._nav = null
        },
        _onHashChange: function (n) {
            Jx.log.info("Jx.HashToNav._onhashchange.start " + n + " _hashReset:" + String(this._hashReset));
            this._hashReset ? (Jx.log.info("Jx.HashToNav._onhashchange ignore hash reset"),
                this._hashReset = false) : (this._nav.go(Jx.parseHash(n)),
                    this._hashReset = true,
                    this._urlHash.clear());
            Jx.log.info("Jx.HashToNav._onhashchange.end")
        }
    }
}),
    function () {
        Jx.Component = function () { };
        Jx.augment(Jx.Component, Jx.Base);
        Jx.augment(Jx.Component, Jx.Attr);
        Jx.augment(Jx.Component, Jx.TreeNode);
        Jx.augment(Jx.Component, Jx.EventTarget);
        var n = Jx.Component.prototype;
        n.initComponent = function () {
            this._id = "jxc" + Jx.uid();
            this.initBase();
            this.initAttr();
            this._hasUI = false
        };
        n.shutdownComponent = function () {
            this.forEachChild(function (n) {
                n.shutdownComponent()
            });
            this.shutdownBase()
        };
        n.hasUI = function () {
            return this._hasUI
        };
        n.initUI = function (n) {
            var t = Jx.getUI(this);
            Jx.addStyle(t.css);
            n.innerHTML = t.html;
            this.activateUI()
        };
        n.shutdownUI = function () {
            if (this._hasUI) {
                this.deactivateUI();
                var n = document.getElementById(this._id);
                n && (n.outerText = "");
                this._clearHasUI()
            }
        };
        n.activateUI = function () {
            this.onActivateUI();
            this._hasUI && this.forEachChild(function (n) {
                n.hasUI() && n.activateUI()
            })
        };
        n.onActivateUI = Jx.fnEmpty;
        n.deactivateUI = function () {
            this.forEachChild(function (n) {
                n.deactivateUI()
            });
            this.onDeactivateUI()
        };
        n.onDeactivateUI = Jx.fnEmpty;
        n.queryService = function (n) {
            var t, i;
            return t = this.onQueryService(n),
                t || (i = this.getParent(),
                    i && (t = i.queryService(n))),
                t
        };
        n.onQueryService = function () {
            return null
        };
        n._clearHasUI = function () {
            this._hasUI && (this._hasUI = false,
                this.forEachChild(function (n) {
                    n._clearHasUI()
                }))
        };
        Jx.mix(Jx.Component, n);
        Jx.getUI = function (n) {
            var t = {
                css: "",
                html: ""
            };
            return Boolean(n) && Boolean(n.getUI) && (n.getUI(t),
                n._hasUI = true),
                t
        };
        Jx.root = null
    }();
Jx.delayDefine(Jx, ["Res", "res"], function () {
    Jx.Res = function () {
        this._formatFns = {};
        this._initResourceLoader()
    };
    Jx.Res.prototype = {
        _resourceLoader: null,
        _initResourceLoader: function () {
            if (Jx.isWWA) {
                var n = Windows.ApplicationModel.Resources.ResourceLoader;
                this._resourceLoader = Jx.isWorker ? n.getForViewIndependentUseWithName(null) : n.getForCurrentViewWithName(null)
            }
        },
        _replaceRemainingEscapes: function (n) {
            var t = n.substring(1);
            return t === "n" || t === "r" || t === "t" ? " " : t
        },
        replaceOtherEscapes: function (n) {
            return n.replace(/%./g, this._replaceRemainingEscapes)
        },
        getFormatFunction: function (n, t) {
            function f(n, t) {
                var f = n.lastIndexOf("%") + 1,
                    i = "",
                    o = f % 2 == 1,
                    e, r;
                if (o) {
                    for (e = Math.floor(f / 2),
                        r = 0; r < e; r++)
                        i += "%%";
                    i += "' + arguments[" + (t - u) + "] + '"
                } else
                    i = n;
                return i
            }
            var r = this.getString(n),
                u = t ? 0 : 1,
                i = r.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/%+([0-9]{1,2})/g, f);
            return i = this.replaceOtherEscapes(i),
                new Function("return '" + i + "'")
        },
        loadCompoundString: function (n) {
            var t = this._formatFns[n];
            return t || (t = this._formatFns[n] = this.getFormatFunction(n, true)),
                t.apply(null, arguments)
        },
        _parseSimple: function (n) {
            for (var u = [], f = n.split(";"), t, r, o, s, i = 0, e = f.length; i < e; i++)
                t = f[i],
                    t.trim() !== "" && (r = t.indexOf(":"),
                        o = t.substring(0, r),
                        s = t.substring(r + 1),
                        u.push({
                            destination: o.trim(),
                            source: s.trim()
                        }));
            return u
        },
        _getError: function (n) {
            var t = {
                InvalidMarkup: "Invalid markup",
                FailToFindItem: "Fail to find item:{0}",
                UndefinedProperty: "Undefined property name:{0}",
                InvalidValueForProperty: "Invalid value:[{0}] for given property:[{1}]",
                TooDeepLoop: "Nested loop more than {0} is not supported"
            }[n],
                i, r;
            if (t !== undefined)
                for (i = 1,
                    r = arguments.length; i < r; i++)
                    t = t.replace("{" + String(i - 1) + "}", arguments[i]);
            else
                t = "unknown error";
            return t
        },
        _setMember: function (n, t, i) {
            for (var u = n.split("."), f = t, e = u[0], r = 1, o = u.length; r < o; r++)
                f = f[u[r - 1]],
                    e = u[r];
            e in HTMLElement.prototype ? f[e] = i : f.setAttribute(e, i)
        },
        _parse: function (n) {
            return this._parseSimple(n)
        },
        getString: function (n) {
            return this._resourceLoader.getString(n)
        },
        addResourcePath: function () { },
        addIncludePath: function () { },
        _process: function (n) {
            for (var u, r, t, o, f, i = 0, e = n.length; i < e; i++)
                for (u = n[i],
                    r = this._parse(u.getAttribute("data-win-res")),
                    t = 0,
                    o = r.length; t < o; t++)
                    f = this.getString(r[t].source),
                        f !== undefined && this._setMember(r[t].destination, u, f)
        },
        processAll: function (n) {
            Jx.mark("Jx.Res.processAll,StartTA,Jx,Res");
            n = n || document.body;
            n.getAttribute("data-win-res") && this._process([n]);
            var t = n.querySelectorAll("[data-win-res]");
            this._process(t);
            Jx.mark("Jx.Res.processAll,StopTA,Jx,Res")
        }
    };
    Jx.isWWA && (Jx.res = new Jx.Res)
});
Jx.delayDefine(Jx, ["Application", "app"], function () {
    Jx.Application = function (n, t) {
        Jx.mark("Jx.Application(),StartTA,Jx,Application");
        this.initLog();
        Jx.app = Jx.app || this;
        Jx.appId = Jx.isNumber(n) ? n : -1;
        Jx.ensurePromiseErrorHandling();
        Jx.init({
            appId: n,
            launchSkipDeferredTasks: t
        });
        Jx.mark("Jx.Application(),StopTA,Jx,Application")
    };
    Jx.Application.prototype = {
        _env: "",
        _rootElem: null,
        shutdown: function () {
            Jx.mark("Jx.Application.shutdown,StartTA,Jx,Application");
            Jx.root && (Jx.root.shutdownComponent(),
                Jx.root = null);
            Jx._rootElem = null;
            Jx.shutdown();
            this.shutdownLog();
            Jx.mark("Jx.Application.shutdown,StopTA,Jx,Application")
        },
        initLog: function () {
            if (Jx.mark("Jx.Application.initLog,StartTA,Jx,Application"), !Jx.log) {
                var n = new Jx.Log;
                n.enabled = true;
                n.level = Jx.LOG_VERBOSE;
                Jx.log = n
            }
            Jx.mark("Jx.Application.initLog,StopTA,Jx,Application")
        },
        initUI: function (n) {
            Jx.mark("Jx.Application.initUI,StartTA,Jx,Application");
            Jx.root && (Jx.root.initUI(n),
                this._rootElem = n);
            Jx.mark("Jx.Application.initUI,StopTA,Jx,Application")
        },
        setRoot: function (n, t) {
            Jx.mark("Jx.Application.setRoot,StartTA,Jx,Application");
            Jx.root && Jx.root.shutdownUI();
            Jx.root = n;
            t && this.initUI(t);
            Jx.mark("Jx.Application.setRoot,StopTA,Jx,Application")
        },
        shutdownUI: function () {
            Jx.mark("Jx.Application.shutdownUI,StartTA,Jx,Application");
            Jx.root && Jx.root.shutdownUI();
            Jx._rootElem = null;
            Jx.mark("Jx.Application.shutdownUI,StopTA,Jx,Application")
        },
        shutdownLog: function () {
            Jx.mark("Jx.Application.shutdownLog,StartTA,Jx,Application");
            Jx.flushSession();
            Jx.mark("Jx.Application.shutdownLog,StopTA,Jx,Application")
        },
        getEnvironment: function () {
            return (Jx.mark("Jx.Application.getEnvironment,Info,Jx,Application"),
                Jx.isWWA) ? (this._env || (this._env = Jx.appData.localSettings().get("Environment"),
                    this._env || (this._env = "PROD")),
                    this._env) : "INT"
        }
    };
    Jx.app = null
});
Jx.init = function (n) {
    Jx.mark("Jx.init,StartTA,Jx");
    Jx.mark("Jx.init:activation,StartTA,Jx");
    "activation" in n ? n.activation && (Jx.activation = n.activation) : Jx.activation = new Jx.Activation;
    Jx.mark("Jx.init:activation,StopTA,Jx");
    Jx.mark("Jx.init:appData,StartTA,Jx");
    "appData" in n ? n.appData && (Jx.appData = n.appData) : Jx.appData = new Jx.AppData;
    Jx.mark("Jx.init:appData,StopTA,Jx");
    Jx.mark("Jx.init:bici,StartTA,Jx");
    "bici" in n ? n.bici && (Jx.bici = n.bici) : Jx.bici = new Jx.Bici;
    Jx.mark("Jx.init:bici,StopTA,Jx");
    Jx.mark("Jx.init:bici.startExperience,StartTA,Jx");
    Jx.bici && Jx.bici.startExperience();
    Jx.mark("Jx.init:bici.startExperience,StopTA,Jx");
    Jx.mark("Jx.init:launch,StartTA,Jx");
    "launch" in n || "appId" in n && Jx.isNumber(n.appId) && (Jx.launch = new Jx.Launch(n.appId),
        Jx.launch.getApplicationStatus(n.launchSkipDeferredTasks),
        Jx.activation.addListener(Jx.activation.resuming, function () {
            Jx.launch.getApplicationStatus(n.launchSkipDeferredTasks)
        }));
    Jx.mark("Jx.init:launch,StopTA,Jx");
    Jx.mark("Jx.init,StopTA,Jx")
};
Jx.shutdown = function () {
    Jx.mark("Jx.shutdown,StartTA,Jx");
    Jx.dispose(Jx.launch);
    Jx.launch = null;
    Jx.bici && (Jx.bici.endExperience(),
        Jx.bici.dispose(),
        Jx.bici = null);
    Jx.loc = null;
    Jx.dispose(Jx.appData);
    Jx.dispose(Jx.activation);
    Jx.activation = null;
    Jx.appData = null;
    Jx.mark("Jx.shutdown,StopTA,Jx")
};
Jx.delayDefine(Jx, ["Timer", "AnimationFrame"], function () {
    "use strict";

    function t(n) {
        Jx.mark("AsyncBase:" + n)
    }

    function f(n) {
        Jx.mark("AsyncBase." + n + ",StartTA,Jx,AsyncBase")
    }

    function e(n) {
        Jx.mark("AsyncBase." + n + ",StopTA,Jx,AsyncBase")
    }

    function s(n) {
        Jx.mark("AsyncBase:" + n + ",StartTM,Jx,AsyncBase")
    }

    function o(n) {
        Jx.mark("AsyncBase:" + n + ",StopTM,Jx,AsyncBase")
    }
    var n = function (n, t, i) {
        f("ctor");
        this._function = n;
        this._context = t;
        this._args = i;
        this._asyncId = this._enqueue(this._runAsync.bind(this));
        s("waiting-id: " + this._asyncId);
        e("ctor")
    },
        i, r, u;
    n.prototype = {
        dispose: function () {
            this._cancel();
            this._function = this._context = this._args = null
        },
        runNow: function () {
            if (this._asyncId === 0) {
                t("runNow: already ran");
                return
            }
            f("runNow");
            this._cancel();
            this._execute();
            e("runNow")
        },
        _runAsync: function () {
            t("_runAsync");
            o("waiting-id: " + this._asyncId);
            this._asyncId = 0;
            this._execute()
        },
        _execute: function () {
            f("_execute");
            var n = this._function,
                t = this._context,
                i = this._args;
            this._function = this._context = this._args = null;
            n.apply(t, i);
            e("_execute")
        },
        _cancel: function () {
            var n = this._asyncId;
            n !== 0 && (t("_cancel"),
                o("waiting-id: " + n),
                this._asyncId = 0,
                this._dequeue(n))
        }
    };
    i = Jx.Timer = function (i, r, u, f) {
        this._duration = i;
        n.call(this, r, u, f);
        t("Timer: id=" + this._asyncId + " duration=" + i)
    };
    i.prototype = {
        _enqueue: function (n) {
            return setTimeout(n, this._duration)
        },
        _dequeue: function (n) {
            clearTimeout(n)
        }
    };
    Jx.augment(i, n);
    r = Jx.AnimationFrame = function (i, r, u) {
        n.call(this, i, r, u);
        t("AnimationFrame: " + this._asyncId)
    };
    r.prototype = {
        _enqueue: function (n) {
            return requestAnimationFrame(n)
        },
        _dequeue: function (n) {
            cancelAnimationFrame(n)
        }
    };
    Jx.augment(r, n);
    u = Jx.Immediate = function (i, r, u) {
        n.call(this, i, r, u);
        t("Immediate: " + this._asyncId)
    };
    u.prototype = {
        _enqueue: function (n) {
            return setImmediate(n)
        },
        _dequeue: function (n) {
            clearImmediate(n)
        }
    };
    Jx.augment(u, n)
});
Jx.delayDefine(Jx, "TransactionContext", function () {
    Jx.TransactionContext = function (n, t, i, r, u) {
        try {
            Boolean(i) && Boolean(r) && Boolean(u) ? this._txContext = new Microsoft.WindowsLive.Instrumentation.TransactionContext(n, t, i, r, u) : Boolean(i) && Boolean(r) ? this._txContext = new Microsoft.WindowsLive.Instrumentation.TransactionContext(n, t, i, r) : Boolean(n) && Boolean(t) && (this._txContext = new Microsoft.WindowsLive.Instrumentation.TransactionContext(n, t))
        } catch (f) {
            Jx.log.error("Jx.TransactionContext: Failed to create TransactionContext object, error message = " + f.message + ", error code = " + f.number)
        }
    };
    Jx.TransactionContext.prototype = {
        _txContext: null,
        dispose: function () {
            this._txContext = null
        },
        _tryCall: function (n, t) {
            try {
                return t ? this._txContext[n] : this._txContext[n]()
            } catch (i) {
                return Jx.log.error("Jx.TransactionContext: Failed to invoke method " + n + " , error message = " + i.message + ", error code = " + i.number),
                    null
            }
        },
        getNextTransactionContext: function (n) {
            if (this._txContext)
                try {
                    var t = new Jx.TransactionContext;
                    return t._txContext = this._txContext.getNextTransactionContext(n),
                        t
                } catch (i) {
                    Jx.log.error("Jx.TransactionContext: Failed to invoke method getNextTransactionContext, error message = " + i.message + ", error code = " + i.number)
                }
            return null
        },
        toBase64String: function () {
            return this._tryCall("toBase64String", false)
        },
        getScenarioId: function () {
            return this._tryCall("scenarioId", true)
        },
        getTransactionId: function () {
            return this._tryCall("transactionId", true)
        }
    }
});
Jx.delayDefine(Jx, ["Launch", "AppId"], function () {
    Jx.Launch = function (n) {
        Jx.mark("Jx.Launch.ctor,StartTA,Jx,Launch");
        this._logger = new Jx.Log;
        this._logger.level = Jx.LOG_VERBOSE;
        this._appId = n;
        this._appStatus = Jx.Launch.AppStatus.unknown;
        Jx.mark("Jx.Launch.ctor,StopTA,Jx,Launch")
    };
    Jx.launch = null,
        function () {
            if (Jx.isWWA && window.Microsoft && Microsoft.WindowsLive && Microsoft.WindowsLive.Config) {
                var n = Microsoft.WindowsLive.Config.Shared.ApplicationId;
                Jx.AppId = {
                    min: 0,
                    chat: n.chat,
                    call: n.call,
                    mail: n.mail,
                    calendar: n.calendar,
                    people: n.people,
                    photo: n.photo,
                    skydrive: n.skydrive,
                    livecomm: n.livecomm,
                    max: n.max
                }
            } else
                Jx.AppId = {
                    min: 0,
                    chat: 0,
                    call: 1,
                    mail: 2,
                    calendar: 3,
                    people: 4,
                    photo: 5,
                    skydrive: 6,
                    livecomm: 10,
                    max: 11
                }
        }();
    Jx.Launch.AppStatus = {
        unknown: 0,
        ok: 1,
        optionalUpdate: 2,
        mandatoryUpdate: 3
    };
    Jx.Launch.prototype._launchStatus = {
        notBlocked: 0,
        willBlock: 1,
        blocked: 2,
        unblocked: 3
    };
    Jx.Launch.prototype._appId = null;
    Jx.Launch.prototype._localSettings = null;
    Jx.Launch.prototype._suiteUpdate = null;
    Jx.Launch.prototype._ownPlatform = null;
    Jx.Launch.prototype._listener = null;
    Jx.Launch.prototype._logger = null;
    Jx.Launch.prototype._log = function (n) {
        Jx.isWWA
    };
    Jx.Launch.prototype.dispose = function () {
        Boolean(this._listener) && Boolean(this._suiteUpdate) && this._suiteUpdate.removeEventListener("changed", this._listener);
        Jx.dispose(this._suiteUpdate);
        this._suiteUpdate = null;
        Jx.dispose(this._ownPlatform);
        this._ownPlatform = null;
        this._localSettings = null;
        this._logger = null
    };
    Jx.Launch.prototype._initSettings = function () {
        if (!this._localSettings) {
            this._localSettings = Jx.appData.localSettings().createContainer("Launch");
            var n = this._getPackageVersion(),
                t = this._localSettings.get("PackageVersion");
            n !== t && (Jx.appData.localSettings().deleteContainer("Launch"),
                this._localSettings = Jx.appData.localSettings().createContainer("Launch"),
                this._localSettings.set("PackageVersion", n))
        }
    };
    Jx.Launch.prototype.startDeferredTasks = function (n) {
        var t, i, r;
        if (!Jx.isWWA)
            return Jx.Launch.AppStatus.ok;
        if (this._log("Deferred_Launch_Tasks_begin"), !n)
            try {
                this._ownPlatform || (this._ownPlatform = new Microsoft.WindowsLive.Platform.Client("launch"),
                    t = Jx.activation,
                    t.addListener(t.suspending, this._onSuspending, this),
                    t.addListener(t.resuming, this._onResuming, this));
                n = this._ownPlatform
            } catch (u) {
                return this._logger.info("Launch: Platform failed to initialize, bailing with status = ok"),
                    Jx.Launch.AppStatus.ok
            }
        return (n instanceof Microsoft.WindowsLive.Platform.Client) ? (this._initSettings(),
            this._log("Dynamic_Configs_Init_begin"),
            this._suiteUpdate || (i = this,
                r = Microsoft.WindowsLive.Config.Shared.SuiteUpdate.loadAsync(n),
                r.then(function (n) {
                    i.updateApplicationStatus(n)
                }, function (n) {
                    i._logger.error("Launch = Failed to load SuiteUpdate config: " + n)
                })),
            this._log("Deferred_Launch_Tasks_end"),
            Jx.Launch.AppStatus.ok) : (this._logger.info("Launch: Platform object is not valid, bailing with status = ok"),
                Jx.Launch.AppStatus.ok)
    };
    Jx.Launch.prototype.updateApplicationStatus = function (n) {
        var i, f, t;
        this._log("Dynamic_Configs_Callback_begin");
        i = this;
        i._suiteUpdate = n;
        this._listener || (this._listener = function (n) {
            var t = n.target;
            i.updateApplicationStatus(t)
        }
            .bind(this),
            this._suiteUpdate.addEventListener("changed", this._listener));
        var r = n.app.lookup(this._appId),
            e = r.minVersion,
            o = r.currentVersion,
            u = r.moreInfoUrl;
        this._isSideLoaded() && (u = Jx.appData.localSettings().get("LiveDogUri"));
        this._localSettings.set("AppMinVersion" + String(this._appId), String(e));
        this._localSettings.set("AppCurrentVersion" + String(this._appId), String(o));
        this._localSettings.set("AppMoreInfoUrl" + String(this._appId), String(u));
        this._logger.info("Launch = minVersion retrieved is " + String(e));
        this._logger.info("Launch = currentVersion retrieved is " + String(o));
        this._logger.info("Launch = moreInfoUrl retrieved is " + String(u));
        f = this._getPkgVersionStatus();
        t = this._launchStatus.notBlocked;
        f === Jx.Launch.AppStatus.mandatoryUpdate && (t = this._launchStatus.willBlock);
        (this.getCurrentAppStatus() === Jx.Launch.AppStatus.mandatoryUpdate || Jx.root instanceof Jx.UpgradePage) && (t = this._launchStatus.blocked,
            f !== Jx.Launch.AppStatus.mandatoryUpdate && (Jx.bici && (t = this._launchStatus.unblocked,
                Jx.bici.startExperience(),
                Jx.bici.set(Microsoft.WindowsLive.Instrumentation.Ids.Package.launchstatuschange, t),
                Jx.bici.endExperience()),
                this._logger.info("No longer in mandatoryUpdate state."),
                window.msSetImmediate(function () {
                    throw new Error("No longer in mandatoryUpdate state.")
                })));
        Jx.bici && Jx.bici.set(Microsoft.WindowsLive.Instrumentation.Ids.Package.launchstatuschange, t);
        this._log("Dynamic_Configs_Callback_end")
    };
    Jx.Launch.prototype.getApplicationStatus = function (n, t) {
        var r, i, u;
        if (Jx.mark("Jx.Launch.getApplicationStatus,StartTA,Jx,Launch"), !Jx.isWWA)
            return Jx.Launch.AppStatus.ok;
        if (this._log("Retrieve_App_Status_begin"),
            this._initSettings(),
            r = this._localSettings,
            n || this.startDeferredTasks(t),
            i = this._getPkgVersionStatus(),
            i === Jx.Launch.AppStatus.mandatoryUpdate && this._appStatus !== i) {
            Jx.mark("Jx.Launch.getApplicationStatus:onLine,StartTA,Jx,Launch");
            try {
                if (!navigator.onLine)
                    return this._appStatus = Jx.Launch.AppStatus.ok,
                        this._appStatus
            } catch (f) {
                this._logger.error("Launch - error getting NetworkInformation: " + f)
            }
            Jx.mark("Jx.Launch.getApplicationStatus:onLine,StopTA,Jx,Launch");
            Jx.app && (u = r.get("AppMoreInfoUrl" + String(this._appId)),
                this._closeExistingListeners(),
                this.startDeferredTasks(null),
                Jx.bici && (Jx.bici.set(Microsoft.WindowsLive.Instrumentation.Ids.Package.launchstatuschange, this._launchStatus.blocked),
                    Jx.bici.increment(Microsoft.WindowsLive.Instrumentation.Ids.Package.mandatoryUpdateShownCount, 1),
                    this._logger.info("Launch - Calling BICI endExperience."),
                    Jx.bici.endExperience()),
                Jx.app.setRoot(new Jx.UpgradePage(u), document.body))
        }
        return this._log("Retrieve_App_Status_end"),
            Jx.mark("Jx.Launch.getApplicationStatus,StopTA,Jx,Launch"),
            this._appStatus = i,
            i
    };
    Jx.Launch.prototype._closeExistingListeners = function () {
        this._ownPlatform || Boolean(this._listener) && Boolean(this._suiteUpdate) && (this._suiteUpdate.removeEventListener("changed", this._listener),
            this._listener = null,
            Jx.dispose(this._suiteUpdate),
            this._suiteUpdate = null)
    };
    Jx.Launch.prototype._getPkgVersionStatus = function () {
        var ret = Jx.Launch.AppStatus.ok;

        this._initSettings();
        var package = this._getPackageVersion();
        var min = this._localSettings.get("AppMinVersion" + this._appId) || package;
        var current = this._localSettings.get("AppCurrentVersion" + this._appId) || package;

        if (this._isVersionGreater(min, package))
            ret = Jx.Launch.AppStatus.mandatoryUpdate;
        else if (this._isVersionGreater(min, current))
            ret = Jx.Launch.AppStatus.optionalUpdate;

        return ret;
    };
    
    Jx.Launch.prototype._onSuspending = function () {
        if (this._ownPlatform) {
            this._logger.info("Launch - suspending handler");
            try {
                this._ownPlatform.suspend()
            } catch (n) {
                this._logger.error("Launch - error suspending: " + n)
            }
        }
    };
    Jx.Launch.prototype._onResuming = function () {
        this._ownPlatform && (this._logger.info("Launch - resuming handler"),
            this._ownPlatform.resume())
    };
    Jx.Launch.prototype._isSideLoaded = function () {
        var t = Jx.appData.localSettings(),
            n = t.get("SideLoaded");
        return this._logger.info("Launch - Sideload = " + n),
            n
    };
    Jx.Launch.prototype.getCurrentAppStatus = function () {
        return this._appStatus
    };
    Jx.Launch.prototype._isValidAppId = function (n) {
        return Jx.isNumber(n) && n >= Jx.AppId.min && n < Jx.AppId.max ? true : false
    };
    Jx.Launch.prototype._getPackageVersion = function () {
        var n = Windows.ApplicationModel.Package.current.id.version;
        return n.major + "." + n.minor + "." + n.build + "." + n.revision
    };
    Jx.Launch.prototype._isVersionGreater = function (n, t) {
        for (var f = n.split("."), e = t.split("."), i = 0, r, u; i < f.length && i < e.length;) {
            if (r = parseInt(f[i], 10),
                u = parseInt(e[i], 10),
                r > u)
                return true;
            if (u > r)
                return false;
            i++
        }
        return false
    }
});
Jx.delayDefine(Jx, "UpgradePage", function () {
    Jx.UpgradePage = function (n) {
        this._url = n;
        this.initComponent();
        this._id = "upgradepage"
    };
    Jx.augment(Jx.UpgradePage, Jx.Component);
    Jx.UpgradePage.prototype.getUI = function (n) {
        n.html = "<div id='upgradeFlyout'><div id='centerBox'><h1>" + Jx.res.getString("/launch/launchMandatoryUpdateTitle") + "<\/h1><span>" + Jx.res.loadCompoundString("/launch/launchMandatoryUpdateText", "<a href='" + this._url + "'>", "<\/a>") + "<\/span><\/div><\/div>";
        document.body.id = "upgradePage";
        Jx.loadCss("/modernlaunch/Launch/resources/css/Launch.css")
    }
});
Jx.delayDefine(Jx, ["Key", "key", "KeyCode"], function () {
    var n = {
        21: 18,
        25: 17,
        92: 91,
        96: 48,
        97: 49,
        98: 50,
        99: 51,
        100: 52,
        101: 53,
        102: 54,
        103: 55,
        104: 56,
        105: 57,
        106: 56,
        107: 187,
        109: 189,
        110: 190,
        111: 191
    };
    Jx.Key = function () { };
    Jx.Key.prototype = {
        getLabel: function (n) {
            var u = n.toLowerCase().replace(/\s/g, "").split("+"),
                t, f, i, e, o, r, s;
            for (t = [],
                f = u.length,
                i = 0; i < f; i++)
                e = u[i],
                    o = Jx.res.getString("/keylabel/residKeyLabel_" + e),
                    t.push(o);
            return t.length === 1 ? r = t[0] : (s = ["/keylabel/residShortcutLabelFormat_" + t.length.toString()].concat(t),
                r = Jx.res.loadCompoundString.apply(Jx.res, s)),
                r
        },
        mapKeyCode: function (t) {
            return n[t] || t
        }
    };
    Jx.KeyCode = {
        backspace: 8,
        tab: 9,
        enter: 13,
        shift: 16,
        ctrl: 17,
        alt: 18,
        pause: 19,
        "break": 19,
        capslock: 20,
        escape: 27,
        space: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36,
        leftarrow: 37,
        uparrow: 38,
        rightarrow: 39,
        downarrow: 40,
        insert: 45,
        "delete": 46,
        0: 48,
        1: 49,
        2: 50,
        3: 51,
        4: 52,
        5: 53,
        6: 54,
        7: 55,
        8: 56,
        9: 57,
        ")": 48,
        "!": 49,
        "@": 50,
        "#": 51,
        $: 52,
        "%": 53,
        "^": 54,
        "&": 55,
        "*": 56,
        "(": 57,
        a: 65,
        b: 66,
        c: 67,
        d: 68,
        e: 69,
        f: 70,
        g: 71,
        h: 72,
        i: 73,
        j: 74,
        k: 75,
        l: 76,
        m: 77,
        n: 78,
        o: 79,
        p: 80,
        q: 81,
        r: 82,
        s: 83,
        t: 84,
        u: 85,
        v: 86,
        w: 87,
        x: 88,
        y: 89,
        z: 90,
        windows: 91,
        select: 93,
        f1: 112,
        f2: 113,
        f3: 114,
        f4: 115,
        f5: 116,
        f6: 117,
        f7: 118,
        f8: 119,
        f9: 120,
        f10: 121,
        f11: 122,
        f12: 123,
        numlock: 144,
        scrolllock: 145,
        browserback: 166,
        ";": 186,
        semicolon: 186,
        ":": 186,
        "=": 187,
        plus: 187,
        ",": 188,
        "<": 188,
        "-": 189,
        _: 189,
        period: 190,
        ">": 190,
        forwardslash: 191,
        "?": 191,
        "`": 192,
        "~": 192,
        "[": 219,
        "{": 219,
        backslash: 220,
        "|": 220,
        "]": 221,
        "}": 221,
        "'": 222,
        '"': 222
    };
    Jx.key = new Jx.Key
});
Jx.delayDefine(Jx, ["scheduler", "Scheduler", "ScheduledQueue"], function () {
    "use strict";

    function h(n, t, i) {
        this._scheduler = n;
        this._parentJobSet = t;
        this._childJobSets = [];
        this._cancel = {
            isCanceled: false
        };
        this._order = i || 0;
        this._localVisibility = true;
        this._isVisible = true;
        this._pendingJobs = 0;
        this._timers = [];
        t ? (this._depth = t._depth + 1,
            t._childJobSets.push(this)) : this._depth = 0
    }

    function y() {
        this._cancel.isCanceled || (this._cancel = c,
            --this._jobSet._pendingJobs)
    }

    function p() {
        var n = true,
            t, i;
        return this._cancel.isCanceled || (t = "_runJob:counter=" + this._counter + " job=" + this._description,
            u(t),
            i = this._function.apply(this._context, this._arguments),
            r(t),
            n = i !== a || this._cancel.isCanceled),
            n && this.dispose(),
            n
    }

    function v() {
        while (!this.runIteration())
            ;
    }

    function w(n, t) {
        var i = n._jobSet,
            r = t._jobSet,
            u = i._isVisible,
            f = r._isVisible;
        if (u !== f)
            return u ? 1 : -1;
        while (i._parentJobSet !== r._parentJobSet)
            i._depth === r._depth ? (i = i._parentJobSet,
                r = r._parentJobSet) : i._depth > r._depth ? i = i._parentJobSet : r = r._parentJobSet;
        return r._order - i._order || t._counter - n._counter
    }

    function t(n) {
        Jx.mark("Jx.Scheduler." + n)
    }

    function u(n) {
        Jx.mark("Jx.Scheduler." + n + ",StartTA,Jx,Scheduler")
    }

    function r(n) {
        Jx.mark("Jx.Scheduler." + n + ",StopTA,Jx,Scheduler")
    }

    function o(n) {
        Jx.mark("Jx.Scheduler:" + n + ",StartTM,Jx,Scheduler")
    }

    function e(n) {
        Jx.mark("Jx.Scheduler:" + n + ",StopTM,Jx,Scheduler")
    }
    var f = Jx.Scheduler = function () {
        var i, r, u;
        for (this._basePriorities = Array(n.count),
            i = 0,
            r = n.count; i < r; ++i)
            this._basePriorities[i] = {
                definitions: [],
                minValue: 0,
                maxValue: -1
            };
        this._topPriority = 0;
        this._buckets = [];
        this._currentValidityToken = this._visibilityValidityToken = 0;
        this._hasVisibleJobs = false;
        this._prioritizingInvisible = 0;
        this._winjsScheduleFunction = null;
        this._schedulePriorityRevert = self.setTimeout.bind(self, this._stopPrioritizingInvisible.bind(this), 200);
        this._clearTimeout = self.clearTimeout.bind(self);
        this._getTime = Date.now.bind(Date);
        this._winjsJob = null;
        this._inWinJSCallback = false;
        this._timeSlice = null;
        this._isPaused = false;
        this._shouldYield = false;
        this._jobCounter = 0;
        u = this._rootJobSet = new h(this, null, 0);
        t("created")
    },
        n = f.BasePriority = {
            aboveHigh: 0,
            high: 1,
            aboveNormal: 2,
            normal: 3,
            belowNormal: 4,
            idle: 5,
            count: 6
        },
        c = {
            isCanceled: true
        },
        s = 12,
        i = {},
        l = n.belowNormal,
        a = {};
    f.repeat = function (n) {
        return n ? a : null
    };
    f._initWinJS = function () {
        u("_initWinJS");
        f._initWinJS = Jx.fnEmpty;
        var e = WinJS.Utilities.Scheduler,
            t = e.Priority;
        s = e._TIME_SLICE / 3;
        i[n.aboveHigh] = t.high + 1;
        i[n.high] = t.high;
        i[n.aboveNormal] = t.aboveNormal;
        i[n.normal] = t.normal;
        i[n.belowNormal] = t.belowNormal;
        i[n.idle] = t.idle;
        r("_initWinJS")
    };
    f.prototype = {
        definePriorities: function (t) {
            var l, e, y, a, p, o, i, f, s, v, h, w, c, b;
            for (u("definePriorities"),
                l = Array(n.count),
                e = 0,
                y = n.count; e < y; ++e)
                l[e] = 0;
            a = {};
            p = function (n) {
                ++n._value
            };
            for (o in t) {
                if (i = t[o],
                    f = this._basePriorities[i.base],
                    s = f.minValue + l[i.base]++,
                    s > f.maxValue)
                    for (++f.maxValue,
                        v = [],
                        v.validityToken = this._currentValidityToken,
                        this._buckets.splice(s, 0, v),
                        h = i.base + 1,
                        w = n.count; h < w; ++h)
                        c = this._basePriorities[h],
                            ++c.minValue,
                            ++c.maxValue,
                            c.definitions.forEach(p);
                b = a[o] = {
                    _value: s,
                    _description: i.description || o,
                    _base: i.base
                };
                f.definitions.push(b)
            }
            return this._computeTopPriority(),
                r("definePriorities"),
                a
        },
        addTimerJob: function (n, t, i, f, e, o, s) {
            n = n || this._rootJobSet;
            var h = {
                _context: o,
                _function: e,
                _arguments: s,
                _jobSet: n,
                _cancel: n._cancel,
                _pri: t,
                _description: i || t._description,
                _counter: ++this._jobCounter,
                dispose: function () {
                    this._cancel.isCanceled || (this._cancel = c);
                    Jx.dispose(this._timer);
                    Jx.dispose(this._internalJob)
                },
                runIteration: function () {
                    var t = true,
                        n;
                    return this._cancel.isCanceled || (n = "_runTimerJob:counter=" + this._counter + " job=" + this._description,
                        u(n),
                        this._timer.runNow(),
                        t = this._internalJob.runIteration(),
                        r(n)),
                        t
                },
                run: v,
                _internalJob: null,
                _timer: null
            };
            return h._timer = new Jx.Timer(f, function (r) {
                n.completeTimer(r._timer);
                r._cancel.isCanceled || (r._internalJob = this.addJob(n, t, i, e, o, s),
                    r.runIteration = function () {
                        return this._internalJob.runIteration()
                    }
                )
            }, this, [h]),
                n.addTimer(h._timer),
                h
        },
        addJob: function (n, i, r, u, e, s) {
            var h, c;
            return f._initWinJS(),
                n = n || this._rootJobSet,
                h = {
                    _context: e,
                    _function: u,
                    _arguments: s,
                    _jobSet: n,
                    _cancel: n._cancel,
                    _pri: i,
                    _description: r || i._description,
                    _counter: ++this._jobCounter,
                    dispose: y,
                    runIteration: p,
                    run: v
                },
                ++n._pendingJobs,
                c = this._buckets[i._value],
                c.push(h),
                c.validityToken = -1, !this._hasVisibleJobs && n.visible && (this._hasVisibleJobs = true,
                    this._validatePendingPriority()),
                this._topPriority > i._value && (t("addJob:_topPriority=" + this._topPriority),
                    this._topPriority = i._value,
                    this._validatePendingPriority()),
                this._winjsJob || this._inWinJSCallback || this._isPaused || (o("pending"),
                    this._schedule()),
                t("addJob:counter=" + h._counter + " job=" + h._description),
                h
        },
        createJobSet: function (n, t) {
            return new h(this, n || this._rootJobSet, t)
        },
        setTimeSlice: function (n) {
            this._timeSlice = n;
            t("setTimeSlice - set to " + this._timeSlice)
        },
        "yield": function () {
            this._shouldYield = true;
            t("yield")
        },
        pause: function () {
            this._isPaused || (this._isPaused = true,
                o("paused"))
        },
        resume: function () {
            this._isPaused && (e("paused"),
                this._isPaused = false, !this._hasJobs() || this._winjsJob || this._inWinJSCallback || this._schedule())
        },
        runSynchronous: function (n, t) {
            if (u("runSynchronous"),
                this._hasJobs()) {
                var i = this._inWinJSCallback;
                this._inWinJSCallback = true;
                this._runJobs(n ? n._value : -1, t || 0);
                this._inWinJSCallback = i
            }
            this._postSynchronousCleanup();
            r("runSynchronous")
        },
        prioritizeInvisible: function () {
            this._prioritizingInvisible ? this._clearTimeout(this._prioritizingInvisible) : (o("prioritizeInvisible"),
                this._computeTopPriority());
            this._prioritizingInvisible = this._schedulePriorityRevert()
        },
        dispose: function () {
            Jx.dispose(this._rootJobSet)
        },
        _schedule: function () {
            var n, i;
            this._winjsJob || this._isPaused || (n = this._getTopWinJSPriority(),
                Jx.isValidNumber(n) && (t("winjsPriority=" + n),
                    i = this._winjsScheduleFunction,
                    i || (i = this._winjsScheduleFunction = WinJS.Utilities.Scheduler.schedule),
                    o("waitingForWinJSCallback"),
                    this._winjsJob = i(this._scheduledCallback, n, this, "Jx.scheduler callback")))
        },
        _computeTopPriority: function () {
            for (var r = this._buckets, n = 0, i = r.length; n < i; ++n)
                if (r[n].length > 0) {
                    t("_computeTopPriority: " + n);
                    this._topPriority = n;
                    return
                }
            t("_computeTopPriority-len: " + i);
            this._topPriority = i
        },
        _getTopWinJSPriority: function () {
            var t, r, n, u;
            for (this._computeTopPriority(),
                t = this._basePriorities,
                r = this._topPriority,
                n = 0,
                u = t.length; n < u; n++)
                if (r <= t[n].maxValue)
                    return this._hasVisibleJobs || this._prioritizingInvisible ? i[n] : i[Math.max(n, l)];
            return null
        },
        _invalidate: function () {
            this._currentValidityToken++
        },
        _validateBucket: function (n) {
            var r, t, i, u;
            for (r = n.length,
                t = r - 1,
                i = 0; i <= t; ++i)
                u = n[i],
                    u._cancel.isCanceled && (n[i] = n[t],
                        n[t] = u,
                        i--,
                        t--);
            t + 1 < r && n.splice(t + 1, r - t - 1);
            this._validateVisibility();
            n.sort(w);
            n.validityToken = this._currentValidityToken
        },
        _validateVisibility: function () {
            this._visibilityValidityToken !== this._currentValidityToken && (this._computeVisibility(this._rootJobSet, true),
                this._visibilityValidityToken = this._currentValidityToken)
        },
        _computeVisibility: function (n, t) {
            var e = n._isVisible,
                u = n._isVisible = t && n._localVisibility,
                r, i, f;
            for (!u || e || n._pendingJobs === 0 || this._hasVisibleJobs || (this._hasVisibleJobs = true,
                this._prioritizingInvisible || this._computeTopPriority()),
                r = n._childJobSets,
                i = 0,
                f = r.length; i < f; ++i)
                this._computeVisibility(r[i], u)
        },
        _scheduledCallback: function () {
            if (e("waitingForWinJSCallback"),
                this._winjsJob = null,
                this._inWinJSCallback = true, !this._isPaused) {
                var n = true;
                try {
                    n = this._runJobs(-1, this._timeSlice || s)
                } finally {
                    n ? this._schedule() : e("pending")
                }
            }
            this._inWinJSCallback = false
        },
        _runJobs: function (n, i) {
            var c, e, a, s;
            if (!this._hasJobs())
                return false;
            u("_runJobs");
            t("_runJobs:synchronousPriority=" + n + " timeSlice=" + i);
            this._shouldYield = false;
            var v = this._getTime(),
                h = this._buckets,
                f = this._topPriority,
                o = h[f];
            do
                if (c = this._currentValidityToken,
                    o.validityToken !== c && this._validateBucket(o),
                    e = o.pop(),
                    e && !e._jobSet._isVisible && this._hasVisibleJobs && !this._prioritizingInvisible && (o.push(e),
                        e = null),
                    e) {
                    if (!e._cancel.isCanceled && (a = e.runIteration(),
                        a || (o.push(e),
                            o.validityToken = Math.min(o.validityToken, c),
                            this._topPriority = Math.min(this._topPriority, f),
                            t("_runJobs:!finished _topPriority=" + this._topPriority),
                            this._hasVisibleJobs |= e._jobSet.visible),
                        s = this._topPriority,
                        s !== f)) {
                        if (!this._hasJobs())
                            return r("_runJobs"),
                                false;
                        f = s;
                        o = h[s]
                    }
                } else {
                    if (this._topPriority = ++f,
                        f >= this._basePriorities[l].minValue && this._hasVisibleJobs && (this._hasVisibleJobs = false,
                            this._prioritizingInvisible || (this._computeTopPriority(),
                                f = this._topPriority)),
                        f === this._buckets.length)
                        return r("_runJobs"),
                            false;
                    o = h[f]
                }
            while ((f <= n || this._getTime() - v < i) && !this._shouldYield && !this._isPaused);
            return r("_runJobs"),
                true
        },
        _runJobSetSynchronously: function (n) {
            var t, e = this._buckets,
                r, o, u, i, s, f;
            do
                for (t = false,
                    r = 0,
                    o = e.length; r < o && !t; r++)
                    for (u = e[r],
                        i = 0,
                        s = u.length; i < s && !t; i++)
                        if (f = u[i],
                            f._jobSet === n) {
                            for (u.splice(i, 1); !f.runIteration();)
                                ;
                            t = true
                        }
            while (t);
            this._postSynchronousCleanup()
        },
        _validatePendingPriority: function () {
            if (this._winjsJob) {
                var n = this._getTopWinJSPriority();
                n !== this._winjsJob.priority && (this._cancelPendingJob(),
                    n !== null && this._schedule())
            }
        },
        _cancelPendingJob: function () {
            e("waitingForWinJSCallback");
            this._winjsJob.cancel();
            this._winjsJob = null
        },
        _postSynchronousCleanup: function () {
            this._winjsJob && (this._hasJobs() ? this._validatePendingPriority() : (this._cancelPendingJob(),
                e("pending")))
        },
        _stopPrioritizingInvisible: function () {
            e("prioritizeInvisible");
            this._prioritizingInvisible = 0
        },
        _hasJobs: function () {
            return this._topPriority !== this._buckets.length
        }
    };
    h.prototype = {
        cancelJobs: function () {
            if (this._pendingJobs && (this._pendingJobs = 0,
                this._cancel.isCanceled || (this._cancel.isCanceled = true,
                    this._cancel = {
                        isCanceled: false
                    })),
                this._childJobSets.length && this._childJobSets.forEach(function (n) {
                    n.cancelJobs()
                }),
                this._timers.length) {
                var n = this._timers.slice(0);
                n.forEach(this.completeTimer, this)
            }
        },
        dispose: function () {
            var i = this._parentJobSet,
                n, t;
            i && (n = i._childJobSets,
                t = n.indexOf(this),
                t !== -1 && n.splice(t, 1));
            this._disposeInternal()
        },
        runSynchronous: function () {
            u("JobSet.runSynchronous");
            this._scheduler._runJobSetSynchronously(this);
            r("JobSet.runSynchronous")
        },
        addTimer: function (n) {
            this._timers.push(n)
        },
        completeTimer: function (n) {
            var t = this._timers,
                i = t.indexOf(n);
            t.splice(i, 1);
            Jx.dispose(n)
        },
        set order(n) {
            this._order !== n && (this._order = n,
                (this._pendingJobs || this._childJobSets.length) && this._scheduler._invalidate())
        },
        set visible(n) {
            this._localVisibility !== n && (this._localVisibility = n,
                this._parentJobSet._isVisible && (this._isVisible = n,
                    (this._pendingJobs || this._childJobSets.length) && this._scheduler._invalidate()))
        },
        get visible() {
            return this._scheduler._validateVisibility(),
                this._isVisible
        },
        _disposeInternal: function () {
            if (this._scheduler = null,
                this._parentJobSet = null,
                this._cancel.isCanceled = true,
                this._childJobSets.forEach(function (n) {
                    n._disposeInternal()
                }),
                this._timers.length) {
                var n = this._timers.slice(0);
                n.forEach(this.completeTimer, this)
            }
        }
    };
    Jx.ScheduledQueue = function (n, t, i, r, u) {
        i = i || "ScheduledQueue for " + t._description;
        this._jobSet = Jx.scheduler.createJobSet(n);
        for (var f = 0; f < r.length; f++)
            Jx.scheduler.addJob(this._jobSet, t, i + " - stage: " + f, r[f], u)
    };
    Jx.ScheduledQueue.prototype = {
        runSynchronous: function () {
            this._jobSet.runSynchronous();
            this.dispose()
        },
        dispose: function () {
            Jx.dispose(this._jobSet)
        },
        get jobSet() {
            return this._jobSet
        }
    };
    Jx.scheduler = new Jx.Scheduler
});
Jx.delayDefine(Jx, ["GlomManager", "initGlomManager"], function () {
    Jx.glomManager = null;
    Jx.initGlomManager = function () {
        Jx.glomManager = MSApp.getViewOpener() ? new Jx.ChildGlomManager : new Jx.ParentGlomManager;
        Jx.initGlomManager = function () { }
    };
    Jx.GlomManager = {
        ParentGlomId: "parentGlom",
        Events: {
            glomClosed: "glomClosed",
            glomCreated: "glomCreated",
            glomShowing: "glomShowing",
            resetGlom: "resetGlom",
            glomConsolidated: "glomConsolidated",
            startingContext: "startingContext"
        },
        InternalEvents: {
            createOrShowGlom: "createOrShowGlom",
            glomConsolidated: "glomConsolidated",
            glomUnloaded: "glomUnloaded",
            glomIdChanged: "glomIdChanged"
        },
        ShowType: {
            shareScreen: "shareScreen",
            showAndCloseThis: "showAndCloseThis",
            switchTo: "switchTo",
            doNotShow: "doNotShow"
        }
    }
});
Jx.delayDefine(Jx, "ParentGlomManager", function () {
    function r(n) {
        Jx.mark("Jx.ParentGlomManager." + n + ",StartTA,Jx,ParentGlomManager")
    }

    function u(n) {
        Jx.mark("Jx.ParentGlomManager." + n + ",StopTA,Jx,ParentGlomManager")
    }

    function n(n) {
        Jx.mark("Jx.ParentGlomManager." + n + ",Info,Jx,ParentGlomManager")
    }
    var f = Jx.GlomManager,
        i = Jx.GlomManager.Events,
        e = Jx.GlomManager.InternalEvents,
        o = Jx.ParentGlomManager = function () {
            this._childGloms = {};
            this._resettingGloms = {};
            this._readyGloms = [];
            this._view = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
            this._postMessageListener = this._postMessageListener.bind(this);
            window.addEventListener("message", this._postMessageListener);
            this._cacheSettings = null;
            this._checkForEmptyCache = this._checkForEmptyCache.bind(this);
            this._cacheCheckJob = null;
            this._cacheJobPriority = Jx.scheduler.definePriorities({
                parentGlomManagerCheckCache: {
                    base: Jx.Scheduler.BasePriority.idle
                }
            });
            this._msgHandlers = {};
            this._msgHandlers[e.createOrShowGlom] = this._handleCreateOrShowGlom.bind(this);
            this._msgHandlers[e.glomUnloaded] = this._handleGlomUnloaded.bind(this);
            this._msgHandlers[i.resetGlom] = this._handleResetGlom.bind(this);
            this._msgHandlers[e.glomConsolidated] = this._handleGlomConsolidated.bind(this);
            this._msgHandlers[e.glomIdChanged] = this._handleGlomIdChanged.bind(this)
        },
        t;
    Jx.mix(o.prototype, Jx.Events);
    t = o.prototype;
    t.dispose = function () {
        var n, t;
        this._cacheCheckJob && this._cacheCheckJob.dispose();
        for (n in this._childGloms)
            t = this._childGloms[n],
                this._glomClosed(t),
                t.dispose(),
                delete this._childGloms[n];
        for (n in this._resettingGloms)
            this._resettingGloms[n].dispose(),
                delete this._resettingGloms[n];
        for (n in this._readyGloms)
            this._readyGloms[n].dispose();
        this._readyGloms = [];
        window.removeEventListener("message", this._postMessageListener)
    };
    t.getGlomId = function () {
        return f.ParentGlomId
    };
    t.isGlomOpen = function (n) {
        return !Jx.isNullOrUndefined(this._childGloms[n])
    };
    t.enableGlomCache = function (n, t) {
        this._cacheSettings = {
            URL: n,
            maxSize: t
        };
        this._cacheCheckJob || (this._cacheCheckJob = Jx.scheduler.addJob(null, this._cacheJobPriority.parentGlomManagerCheckCache, "Jx.ParentGlomManager._checkForEmptyCache", this._checkForEmptyCache))
    };
    t.createGlom = function (t, e, o) {
        var s, h;
        return r("createGlom"),
            n("createGlom(" + t + " - " + (o ? o : "usingCache") + ")"),
            s = null,
            this._readyGloms.length === 0 || o && o != this._cacheSettings.URL ? (o || (o = this._cacheSettings.URL),
                r("createGlom::CreateNewView"),
                h = MSApp.createNewView(o),
                u("createGlom::CreateNewView"),
                s = this._childGloms[t] = new Jx.Glom(h, t, this.getGlomId, this._view.id, e),
                n("New glom created " + t + " View ID:" + s.getViewId())) : (s = Jx.Glom.duplicateAndDispose(this._readyGloms.pop(), t, e),
                    this._childGloms[t] = s,
                    n("Glom popped off stack " + t + " View ID:" + s.getViewId()),
                    this._readyGloms.length === 0 && (this._cacheCheckJob || (this._cacheCheckJob = Jx.scheduler.addJob(null, this._cacheJobPriority.parentGlomManagerCheckCache, "Jx.ParentGlomManager._checkForEmptyCache", this._checkForEmptyCache)))),
            s.postMessage(i.startingContext, e),
            this.raiseEvent(i.glomCreated, {
                glom: s
            }),
            u("createGlom"),
            s
    };
    t._assertUnknownShowEnum = function () { };
    t.showGlom = function (t, e, o) {
        var c, s, v;
        n("showGlom(" + t + ", " + e + ", " + (o ? o.getGlomId() : "ParentGlom") + ")");
        c = true;
        s = null;
        t === f.ParentGlomId ? (s = this._view.id,
            c = false) : s = this._childGloms[t].getViewId();
        var a = o ? o.getViewId() : this._view.id,
            h = Windows.UI.ViewManagement,
            l = f.ShowType;
        switch (e) {
            case l.shareScreen:
                r("calling tryShowAsStandaloneAsync");
                v = h.ViewSizePreference.default;
                h.ApplicationViewSwitcher.tryShowAsStandaloneAsync(s, v, a, v).done(function (i) {
                    n("glomId: " + t + ", " + (i ? "View Shown: " : "View NOT Shown: ") + "targetViewId:" + s)
                }, function (i) {
                    !Jx.isNullOrUndefined(i) && Jx.isFunction(i.toString) && n(i.toString());
                    n("tryShowAsStandaloneAsync(shareScreen) Error.  glomId: " + t + ", targetViewId:" + s)
                });
                u("calling tryShowAsStandaloneAsync");
                break;
            case l.showAndCloseThis:
                r("calling switchAsync (consolidateViews)");
                h.ApplicationViewSwitcher.switchAsync(s, a, h.ApplicationViewSwitchingOptions.consolidateViews).done(function (t) {
                    n(" showAndCloseThis: " + t)
                }, function (i) {
                    !Jx.isNullOrUndefined(i) && Jx.isFunction(i.toString) && n(i.toString());
                    n("switchAsync Error. glomId: " + t + ", targetViewId:" + s)
                });
                u("calling switchAsync (consolidateViews)");
                break;
            case l.switchTo:
                r("calling switchAsync (default)");
                h.ApplicationViewSwitcher.switchAsync(s, a, h.ApplicationViewSwitchingOptions.default).done(function (t) {
                    n(" switchTo: " + t)
                }, function (i) {
                    !Jx.isNullOrUndefined(i) && Jx.isFunction(i.toString) && n(i.toString());
                    n("switchAsync(switchTo) Error.  glomId: " + t + ", targetViewId:" + s)
                });
                u("calling switchAsync (default)");
                break;
            case l.doNotShow:
                n("Not showing glom");
                c = false;
                break;
            default:
                this._assertUnknownShowEnum(e)
        }
        c && this.raiseEvent(i.glomShowing, {
            glom: this._childGloms[t]
        })
    };
    t.createOrShowGlom = function (n, t, i, r, u) {
        this.isGlomOpen(n) || n === f.ParentGlomId || this.createGlom(n, t, r);
        this.showGlom(n, i, u)
    };
    t.getIsChild = function () {
        return false
    };
    t.getIsParent = function () {
        return true
    };
    t.connectToGlom = function (n) {
        return this._childGloms[n]
    };
    t._checkForEmptyCache = function () {
        if (this._cacheCheckJob = null,
            this._cacheSettings && this._cacheSettings.maxSize > 0 && this._readyGloms.length === 0) {
            r("_checkForEmptyCache::CreateNewView");
            var n = MSApp.createNewView(this._cacheSettings.URL);
            u("_checkForEmptyCache::CreateNewView");
            this._readyGloms.push(new Jx.Glom(n, "cachedGlom", this.getGlomId, this._view.id))
        }
    };
    t._glomClosed = function (n) {
        n.raiseEvent(Jx.Glom.Events.closed);
        this.raiseEvent(i.glomClosed, {
            glom: n
        })
    };
    t._handleCreateOrShowGlom = function (t) {
        var u, r, i;
        u = t.data;
        r = u.fromGlomId;
        this.isGlomOpen(r) && (n("Received CreateOrShowGlom from " + r),
            i = u.message,
            this.createOrShowGlom(i.glomId, i.startingContext, i.showEnum, i.childGlomHRef, this._childGloms[r]))
    };
    t._handleGlomUnloaded = function (t) {
        var f, i, u, r, e;
        if (f = t.data,
            i = f.fromGlomId,
            n("Received GlomUnloaded from " + i),
            u = this._childGloms[i],
            u)
            this._glomClosed(u),
                u.dispose(),
                delete this._childGloms[i];
        else if (this._resettingGloms[i])
            delete this._resettingGloms[i];
        else {
            for (r = 0,
                e = this._readyGloms.length; r < this._readyGloms; ++r)
                if (this._readyGloms[r].getGlomId() === i) {
                    this._readyGloms.splice(r, 1);
                    break
                }
            r === e && n("Received unload event from unknown glom")
        }
    };
    t._handleResetGlom = function (t) {
        var r, i, u;
        r = t.data;
        i = r.fromGlomId;
        n("Received ResetGlom from " + i);
        u = this._resettingGloms[i];
        this._readyGloms.push(u);
        delete this._resettingGloms[i]
    };
    t._handleGlomConsolidated = function (t) {
        var f, r, u;
        f = t.data;
        r = f.fromGlomId;
        n("Received GlomConsolidated from " + r);
        u = this._childGloms[r];
        this._glomClosed(u);
        this._cacheSettings && this._cacheSettings.maxSize > this._readyGloms.length ? (u.postMessage(i.resetGlom),
            n("Moving " + r + " to resetting glom array "),
            this._resettingGloms[r] = this._childGloms[r],
            delete this._childGloms[r]) : u.dispose()
    };
    t._handleGlomIdChanged = function (t) {
        var r, u, f, e, o, s;
        r = t.data;
        u = r.message;
        f = r.fromGlomId;
        n("Received glomIdChanged from " + f + " newId:" + r.newGlomId);
        e = this._childGloms[f];
        this._glomClosed(e);
        delete this._childGloms[f];
        o = this._childGloms[u.newGlomId];
        o && (this._glomClosed(o),
            o.dispose());
        s = Jx.Glom.duplicateAndDispose(e, u.newGlomId, e.getStartingContext());
        this._childGloms[u.newGlomId] = s;
        this.raiseEvent(i.glomCreated, {
            glom: s
        })
    };
    t._validViewId = function (t, i) {
        var r = false;
        return this._childGloms[t] ? r = this._childGloms[t].getViewId() === i : this._resettingGloms[t] && (r = this._resettingGloms[t].getViewId() === i),
            r || n("Received message from viewId:" + i + " and glomId:" + t + " but no matching glom found."),
            r
    };
    t._postMessageListener = function (t) {
        var i, r, f, u, e;
        i = t.data;
        i.purpose === "Jx.GlomManager" && this._validViewId(i.fromGlomId, i.fromViewId) && (t.preventDefault(),
            t.stopPropagation(),
            r = i.messageType,
            f = this._msgHandlers[r],
            f ? f(t) : (u = i.fromGlomId,
                n("Received CustomMsg " + r + " from " + u),
                this.isGlomOpen(u) ? (e = this._childGloms[u],
                    e.raiseEvent(r, i)) : n("JxGlomManager Dropping message type:" + r + " from closed Glom:" + u)))
    }
});
Jx.delayDefine(Jx, "ChildGlomManager", function () {
    "use strict";

    function f(n) {
        Jx.mark("Jx.ChildGlomManager." + n + ",StartTA,Jx,ChildGlomManager")
    }

    function e(n) {
        Jx.mark("Jx.ChildGlomManager." + n + ",StopTA,Jx,ChildGlomManager")
    }

    function t(n) {
        Jx.mark("Jx.ChildGlomManager." + n + ",Info,Jx,ChildGlomManager")
    }
    var r = Jx.GlomManager,
        i = r.Events,
        u = r.InternalEvents,
        o = Jx.ChildGlomManager = function () {
            f("calling getViewOpener");
            this._opener = MSApp.getViewOpener();
            e("calling getViewOpener");
            this._glomId = null;
            this._postMessageListener = this._postMessageListener.bind(this);
            window.addEventListener("message", this._postMessageListener, false);
            f("calling getForCurrentView");
            this._view = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
            e("calling getForCurrentView");
            this._parentGlom = new Jx.Glom(this._opener, r.ParentGlomId, this.getGlomId.bind(this), this._view.id);
            window.addEventListener("beforeunload", this._onBeforeUnload.bind(this), false);
            this._view.addEventListener("consolidated", this._onConsolidated.bind(this), false);
            this._isConsolidating = false;
            this._paused = false;
            this._pendingMessages = []
        },
        n;
    Jx.mix(Jx.ChildGlomManager.prototype, Jx.Events);
    n = o.prototype;
    n.dispose = function () {
        t("disposed");
        window.close()
    };
    n.getGlomId = function () {
        return this._glomId
    };
    n.getParentGlom = function () {
        return this._parentGlom
    };
    n.changeGlomId = function (n) {
        if (this._isConsolidating || !this._glomId) {
            t("changeGlomId skipped, glom is closing or is closed");
            return
        }
        this._parentGlom.postMessage(u.glomIdChanged, {
            oldGlomId: this._glomId,
            newGlomId: n
        });
        t("Changing GlomID from: " + this._glomId + " to:" + n);
        this._glomId = n;
        Jx.setMarkPrefix(this._glomId + ":")
    };
    n.createOrShowGlom = function (n, t, i, r) {
        var f = {
            glomId: n,
            startingContext: t,
            showEnum: i,
            childGlomHRef: r
        };
        this._parentGlom.postMessage(u.createOrShowGlom, f)
    };
    n.getIsChild = function () {
        return true
    };
    n.getIsParent = function () {
        return false
    };
    n.changeGlomTitle = function (n) {
        if (this._isConsolidating || !this._glomId) {
            t("changeGlomTitle skipped, glom is closing or is closed");
            return
        }
        this._view.title = n
    };
    n.consolidateComplete = function () {
        t("Consolidate complete");
        this._parentGlom.postMessage(u.glomConsolidated)
    };
    n._handleResetGlom = function () {
        t("Received ResetGlom");
        this.hasListener(i.resetGlom) ? (t("Glom reset called.  Calling Reset handlers"),
            this.raiseEvent(i.resetGlom),
            this._parentGlom.postMessage(i.resetGlom),
            this._glomId = null,
            this._isConsolidating = false) : (t("Glom reset called without a handler.  Closing window."),
                window.close())
    };
    n._handleStartingContext = function (n) {
        t("Received StartingContext");
        this._glomId = n.targetGlomId;
        Jx.setMarkPrefix(this._glomId + ":");
        this.hasListener(i.startingContext) ? (t("Glom starting context called.  Calling context handlers"),
            this.raiseEvent(i.startingContext, n)) : t("Child window may not have initialized completely before Dom loaded.  May be orphaned")
    };
    n._postMessageListener = function (n) {
        var t = n.data;
        t.purpose === "Jx.GlomManager" && (n.preventDefault(),
            n.stopPropagation(),
            this._handleMessage(t))
    };
    n._handleMessage = function (n) {
        var r = n.messageType;
        if (this._paused)
            t("_handleMessage: Message held for later: " + r),
                this._pendingMessages.push(n);
        else
            switch (r) {
                case i.resetGlom:
                    this._handleResetGlom();
                    break;
                case i.startingContext:
                    this._handleStartingContext(n);
                    break;
                default:
                    t("_handleMessage: Received Custom Msg " + r);
                    this._parentGlom.raiseEvent(r, n)
            }
    };
    n.pauseMessages = function () {
        t("pauseMessages");
        this._paused = true
    };
    n.resumeMessages = function () {
        for (f("resumeMessages"),
            this._paused = false; this._pendingMessages.length > 0 && !this._paused;)
            this._handleMessage(this._pendingMessages.shift());
        e("resumeMessages")
    };
    n._onBeforeUnload = function () {
        t("glom is unloading");
        this._parentGlom.postMessage(u.glomUnloaded)
    };
    n._onConsolidated = function () {
        t("glom is consolidated");
        this._isConsolidating ? t("glom is already consolidating.  Skipping event.") : (this._isConsolidating = true,
            this.raiseEvent(i.glomConsolidated))
    }
});
Jx.delayDefine(Jx, "Glom", function () {
    function t(n) {
        Jx.mark("Jx.Glom." + n + ",Info,Jx,Glom")
    }
    var i = Jx.Glom = function (n, t, i, r, u) {
        this._postQueue = n;
        this._targetViewId = this._postQueue.viewId;
        this._targetGlomId = t;
        this._getGlomIdFunction = i;
        this._fromViewId = r;
        this._startingContext = u || {}
    },
        n;
    Jx.mix(Jx.Glom.prototype, Jx.Events);
    Jx.Glom.Events = {
        closed: "closed"
    };
    n = i.prototype;
    n.dispose = function () {
        if (this._targetGlomId === Jx.GlomManager.ParentGlomId)
            Jx.glomManager.dispose();
        else if (this._postQueue) {
            try {
                this._postQueue.close()
            } catch (n) { }
            this._postQueue = null
        }
    };
    n.postMessage = function (n, i) {
        var r = {
            fromGlomId: this._getGlomIdFunction(),
            targetGlomId: this._targetGlomId,
            message: i || {},
            messageType: n,
            purpose: "Jx.GlomManager",
            fromViewId: this._fromViewId
        };
        Jx.isNonEmptyString(r.fromGlomId) ? (t("Sending Messsage " + n + " from " + r.fromGlomId + " to " + this._targetGlomId),
            this._postQueue && this._postQueue.postMessage(r, "*")) : t("Skipping Messsage " + n + " from " + this.getGlomId() + " to " + this._targetGlomId + " because no fromGlomId")
    };
    n.getGlomId = function () {
        return this._targetGlomId
    };
    n.getViewId = function () {
        return this._targetViewId
    };
    n.getStartingContext = function () {
        return this._startingContext
    };
    i.duplicateAndDispose = function (n, t, i) {
        var r = new Jx.Glom(n._postQueue, t, n._getGlomIdFunction, n._fromViewId, i);
        return n._postQueue = null,
            n.dispose(),
            r
    }
});
Jx.ApplicationView = {
    State: {
        wide: 0,
        full: 1,
        large: 2,
        more: 3,
        portrait: 4,
        split: 5,
        less: 6,
        minimum: 7,
        snap: 8
    },
    getStateFromWidth: function (n) {
        var r, i, t, u;
        for (r = 1.395,
            i = [1920, 1366, 1025, 844, 768, 672, 502, 321],
            window.devicePixelRatio > r && (i = [1920, 1366, 1031, 1030, 768, 672, 502, 321]),
            t = 0,
            u = i.length; t < u; t++)
            if (i[t] <= n)
                return t;
        return Jx.ApplicationView.State.snap
    },
    getState: function () {
        var n = window.innerWidth;
        return Jx.ApplicationView.getStateFromWidth(n)
    }
};
Jx.delayDefine(Jx, "DynamicFont", function () {
    function r(n) {
        Jx.mark("Jx.DynamicFont." + n + ",StartTA,Jx,DynamicFont")
    }

    function u(n) {
        Jx.mark("Jx.DynamicFont." + n + ",StopTA,Jx,DynamicFont")
    }
    var n;
    r("Load");
    n = Jx.DynamicFont = {};
    n._primaryFontFamily = [];
    n._authoringFontFamily = [];
    n._headStyleEl = null;
    n._shared = {
        und: {
            primaryFontFamily: ["Segoe UI"],
            primaryFontFamilyFallback: ["Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
            authoringFontFamily: ["Calibri"],
            authoringFontFamilyFallback: ["Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "sans-serif"]
        },
        "und-arab": {
            primaryFontFamily: ["Segoe UI"],
            primaryFontFamilyFallback: ["Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
            authoringFontFamily: ["Arial"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "und-guru": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Raavi"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        }
    };
    var f = n._shared.und,
        i = n._shared["und-arab"],
        t = f,
        e = n._shared["und-guru"];
    n._EMOJI_FONT = "Color Emoji";
    n._MAX_FONT_COUNT = 8;
    n._languageSettings = {
        am: {
            primaryFontFamily: ["Ebrima"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Khmer UI"],
            authoringFontFamily: ["Ebrima"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "am-et": {
            alias: "am"
        },
        ar: i,
        "ar-sa": i,
        as: {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Shonar Bangla"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "as-in": {
            alias: "as"
        },
        be: t,
        "be-by": t,
        bg: t,
        "bg-bg": t,
        bn: {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Shonar Bangla"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "bn-bd": {
            alias: "bn"
        },
        "bn-in": {
            alias: "bn"
        },
        "chr-cher": {
            primaryFontFamily: ["Gadugi"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Gadugi"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic"]
        },
        "chr-cher-us": {
            alias: "chr-cher"
        },
        fa: i,
        "fa-ir": i,
        gu: {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Shruti"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "gu-in": {
            alias: "gu"
        },
        he: {
            primaryFontFamily: f.primaryFontFamily,
            primaryFontFamilyFallback: f.primaryFontFamilyFallback,
            authoringFontFamily: ["Arial"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "he-il": {
            alias: "he"
        },
        hi: {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Utsaah"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "hi-in": {
            alias: "hi"
        },
        ja: {
            primaryFontFamily: ["Meiryo UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
            authoringFontFamily: ["Meiryo"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "sans-serif"]
        },
        "ja-jp": {
            alias: "ja"
        },
        kk: t,
        "kk-kz": t,
        km: {
            primaryFontFamily: ["Khmer UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["DaunPenh"],
            nonUiAuthoringFontFamily: ["Leelawadee UI"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "km-kh": {
            alias: "km"
        },
        kn: {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Tunga"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "kn-in": {
            alias: "kn"
        },
        kok: {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Utsaah"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "kok-in": {
            alias: "kok"
        },
        ko: {
            primaryFontFamily: ["Malgun Gothic"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Ebrima", "Khmer UI"],
            authoringFontFamily: ["Malgun Gothic"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "ko-kr": {
            alias: "ko"
        },
        "ku-arab": i,
        "ku-arab-iq": i,
        ky: t,
        "ky-kg": t,
        ml: {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Kartika"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "ml-in": {
            alias: "ml"
        },
        mn: t,
        "mn-mn": t,
        mr: {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Utsaah"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "mr-in": {
            alias: "mr"
        },
        ne: {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Utsaah"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "ne-np": {
            alias: "ne"
        },
        or: {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Kalinga"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "or-in": {
            alias: "or"
        },
        "pa-arab": i,
        "pa-arab-pk": i,
        "pa-in": e,
        prs: i,
        "prs-af": i,
        "qps-plocm": {
            primaryFontFamily: ["Segoe UI"],
            primaryFontFamilyFallback: ["Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
            authoringFontFamily: ["Tahoma"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        ru: t,
        "ru-ru": t,
        "sd-arab": i,
        "sd-arab-pk": i,
        si: {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Iskoola Pota"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "si-lk": {
            alias: "si"
        },
        "sr-cyrl": t,
        "sr-cyrl-ba": t,
        "sr-cyrl-rs": t,
        ta: {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Vijaya"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "ta-in": {
            alias: "ta"
        },
        te: {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Vani"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "te-in": {
            alias: "te"
        },
        "tg-cyrl": t,
        "tg-cyrl-tj": t,
        th: {
            primaryFontFamily: ["Leelawadee"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Browallia New"],
            nonUiAuthoringFontFamily: ["Leelawadee UI"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "th-th": {
            alias: "th"
        },
        ti: {
            primaryFontFamily: ["Ebrima"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Khmer UI"],
            authoringFontFamily: ["Ebrima"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "ti-et": {
            alias: "ti"
        },
        tt: t,
        "tt-ru": t,
        ug: {
            primaryFontFamily: f.primaryFontFamily,
            primaryFontFamilyFallback: f.primaryFontFamilyFallback,
            authoringFontFamily: ["Tahoma"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"]
        },
        "ug-arab": {
            alias: "ug"
        },
        "ug-arab-cn": {
            alias: "ug"
        },
        "ug-cn": {
            alias: "ug"
        },
        uk: t,
        "uk-ua": t,
        ur: i,
        "ur-pk": i,
        vi: f,
        "vi-vn": f,
        "zh-cn": {
            alias: "zh-hans"
        },
        "zh-hans": {
            primaryFontFamily: ["Microsoft YaHei UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
            authoringFontFamily: ["Microsoft YaHei UI"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft JhengHei UI", "Malgun Gothic", "sans-serif"]
        },
        "zh-hans-cn": {
            alias: "zh-hans"
        },
        "zh-hant": {
            primaryFontFamily: ["Microsoft JhengHei UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
            authoringFontFamily: ["Microsoft JhengHei UI"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Malgun Gothic", "sans-serif"]
        },
        "zh-hant-hk": {
            alias: "zh-hant"
        },
        "zh-hant-tw": {
            alias: "zh-hant"
        },
        "zh-hk": {
            alias: "zh-hant"
        },
        "zh-tw": {
            alias: "zh-hant"
        }
    };
    n._getApplicationLanguages = function () {
        r("_getApplicationLanguages");
        var n = Windows.Globalization.ApplicationLanguages.languages;
        return u("_getApplicationLanguages"),
            n
    };
    n._calculateFonts = function () {
        var h, p, w, b;
        r("_calculateFonts");
        var f = n._primaryFontFamily,
            e = n._authoringFontFamily,
            a = n._EMOJI_FONT,
            i = n._MAX_FONT_COUNT,
            o, t, v, y, s, c = {},
            l = {};
        if (f.length === 0) {
            for (f.push(a),
                e.push(a),
                o = n._getApplicationLanguages(),
                s = o[0],
                t = n._lookupLanguageSetting(s),
                n._uniqueConcatInPlace(f, t.primaryFontFamily, c, i),
                n._uniqueConcatInPlace(e, t.authoringFontFamily, l, i),
                v = t.primaryFontFamilyFallback,
                y = t.authoringFontFamilyFallback,
                h = 1,
                p = o.length; h < p && (f.length < i || e.length < i); ++h)
                s = o[h],
                    t = n._lookupLanguageSetting(s),
                    w = t.primaryFontFamily,
                    b = t.nonUiAuthoringFontFamily || t.authoringFontFamily,
                    n._uniqueConcatInPlace(f, w, c, i),
                    n._uniqueConcatInPlace(e, b, l, i);
            n._uniqueConcatInPlace(f, v, c, i);
            n._uniqueConcatInPlace(e, y, l, i)
        }
        u("_calculateFonts")
    };
    n._uniquePush = function (n, t, i) {
        var r = false;
        return i.hasOwnProperty(t) || (n.push(t),
            i[t] = true,
            r = true),
            r
    };
    n._uniqueConcatInPlace = function (t, i, r) {
        var f = i.length,
            e = f,
            o = n._MAX_FONT_COUNT,
            s = t.length,
            u;
        for (f + s > o && (e = o - s),
            u = 0; u < f && e > 0; ++u)
            n._uniquePush(t, i[u], r) && --e
    };
    n._lookupLanguageSetting = function (t) {
        return t = t.toLowerCase(),
            t = t.replace("_", "-"),
            n._lookupLanguageSettingInternal(t)
    };
    n._lookupLanguageSettingInternal = function (t) {
        for (var i, r = t, u, e; !i;)
            i = n._languageSettings[r],
                i ? (e = i.alias,
                    e && (i = n._lookupLanguageSettingInternal(e),
                        n._languageSettings[t] = i)) : (u = r.lastIndexOf("-"),
                            u > 0 ? r = r.substring(0, u) : (i = f,
                                n._languageSettings[t] = i));
        return i
    };
    n.resetPrimaryAndAuthoringFonts = function () {
        n._primaryFontFamily = [];
        n._authoringFontFamily = []
    };
    n.addPrimaryAndAuthoringClasses = function () {
        r("addPrimaryAndAuthoringClasses");
        var f = n.getPrimaryFontFamilyQuoted('"'),
            e = n.getAuthoringFontFamilyQuoted('"'),
            i = ".primaryFontFamilyClass {font-family: " + f + ";} .authoringFontFamilyClass {font-family: " + e + ";}",
            t = n._headStyleEl;
        t ? t.textContent = i : t = n._headStyleEl = Jx.addStyleToDocument(i, document);
        u("addPrimaryAndAuthoringClasses")
    };
    n._getListQuoted = function (n, t) {
        t || (t = '"');
        return t + n.join(t + ", " + t) + t
    };
    n.getPrimaryFontFamily = function () {
        r("getPrimaryFontFamily");
        n._calculateFonts();
        var t = n._primaryFontFamily;
        return u("getPrimaryFontFamily"),
            t
    };
    n.getPrimaryFontFamilyQuoted = function (t) {
        r("getPrimaryFontFamilyQuoted");
        n._calculateFonts();
        var i = n._getListQuoted(n._primaryFontFamily, t);
        return u("getPrimaryFontFamilyQuoted"),
            i
    };
    n.getAuthoringFontFamily = function () {
        r("getAuthoringFontFamily");
        n._calculateFonts();
        var t = n._authoringFontFamily;
        return u("getAuthoringFontFamily"),
            t
    };
    n.getAuthoringFontFamilyQuoted = function (t) {
        r("getAuthoringFontFamilyQuoted");
        n._calculateFonts();
        var i = n._getListQuoted(n._authoringFontFamily, t);
        return u("getAuthoringFontFamilyQuoted"),
            i
    };
    n._insertFontFamilyNode = function (n, t, i) {
        i = i || document;
        var r = t + " { font-family: " + n + ";}";
        return Jx.addStyleToDocument(r, i)
    };
    n.insertPrimaryFontFamilyRule = function (t, i) {
        r("insertPrimaryFontFamilyRule");
        var f = n.getPrimaryFontFamilyQuoted(),
            e = n._insertFontFamilyNode(f, t, i);
        return u("insertPrimaryFontFamilyRule"),
            e
    };
    n.insertAuthoringFontFamilyRule = function (t, i) {
        r("insertAuthoringFontFamilyRule");
        var f = n.getAuthoringFontFamilyQuoted(),
            e = n._insertFontFamilyNode(f, t, i);
        return u("insertAuthoringFontFamilyRule"),
            e
    };
    u("Load")
})