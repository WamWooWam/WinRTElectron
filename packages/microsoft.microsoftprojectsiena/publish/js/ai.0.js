var appInsights,
    AppInsights;
(function(n) {
    (function(t) {"use strict";
        var f = function() {
                function t(n) {
                    var t = n.lastIndexOf("/");
                    this.name = n.substr(t + 1);
                    this.path = n.substring(0, t)
                }
                return t.prototype.toString = function() {
                        var t = "",
                            i;
                        return n.Internal.assertValue(this.path) && (t = this.path), i = {
                                eN: this.name, eP: t, eV: ""
                            }, JSON.stringify(i)
                    }, t
            }(),
            i,
            r,
            u;
        t.SimpleEvent = f;
        i = function() {
            function n(n, t) {
                this.name = n;
                this.value = t
            }
            return n.prototype.toString = function() {
                    var n = {
                            pN: this.name, pV: this.value
                        };
                    return JSON.stringify(n)
                }, n
        }();
        t.SimpleProperty = i;
        r = function() {
            function n(n, t) {
                this.id = n;
                this.structure = t
            }
            return n.prototype.toString = function() {
                    var n = {
                            vN: this.id, vP: this.structure
                        };
                    return JSON.stringify(n)
                }, n
        }();
        t.ViewHierarchy = r;
        u = function() {
            function n(n, t, i) {
                this.message = n;
                this.url = t;
                this.lineNumber = i
            }
            return n.prototype.toString = function() {
                    return JSON.stringify({
                            message: this.message, url: this.url, lineNumber: this.lineNumber
                        })
                }, n
        }();
        t.ErrorData = u
    })(n.Internal || (n.Internal = {}));
    var t = n.Internal
})(AppInsights || (AppInsights = {})),
function(n) {
    (function(n) {"use strict";
        var i,
            r,
            u,
            f,
            e,
            o,
            s,
            t;
        (function(n) {
            n[n.Error = 0] = "Error";
            n[n.Warning = 1] = "Warning";
            n[n.Information = 2] = "Information"
        })(n.debugMessageTypes || (n.debugMessageTypes = {}));
        i = n.debugMessageTypes,
        function(n) {
            n[n.Off = 0] = "Off";
            n[n.Error = 1] = "Error";
            n[n.Warning = 2] = "Warning";
            n[n.Information = 3] = "Information";
            n[n.Alert = 4] = "Alert"
        }(n.traceModeTypes || (n.traceModeTypes = {}));
        r = n.traceModeTypes,
        function(n) {
            n[n.Attribute = 1] = "Attribute";
            n[n.Variable = 2] = "Variable"
        }(n.listNodeTypes || (n.listNodeTypes = {}));
        u = n.listNodeTypes,
        function(n) {
            n[n.string = 0] = "string";
            n[n.number = 1] = "number";
            n[n.object = 2] = "object"
        }(n.dataTypes || (n.dataTypes = {}));
        f = n.dataTypes,
        function(n) {
            n[n.page = 0] = "page";
            n[n.link = 1] = "link";
            n[n.event = 2] = "event";
            n[n.timed = 3] = "timed";
            n[n.action = 4] = "action";
            n[n.perf = 5] = "perf";
            n[n.error = 6] = "error";
            n[n.ierror = 7] = "ierror"
        }(n.payLoadTypes || (n.payLoadTypes = {}));
        e = n.payLoadTypes,
        function(n) {
            n[n.ProfileId = 0] = "ProfileId";
            n[n.UserIdentity = 1] = "UserIdentity";
            n[n.Referrer = 2] = "Referrer";
            n[n.Language = 3] = "Language";
            n[n.TimeZone = 4] = "TimeZone";
            n[n.Screen = 5] = "Screen";
            n[n.TargetPage = 6] = "TargetPage";
            n[n.Events = 7] = "Events";
            n[n.CustomUserId = 8] = "CustomUserId";
            n[n.AccountId = 9] = "AccountId";
            n[n.CustomDimensions = 10] = "CustomDimensions";
            n[n.CustomMetrics = 11] = "CustomMetrics";
            n[n.CookieCreationDate = 12] = "CookieCreationDate";
            n[n.PagePerformance = 13] = "PagePerformance";
            n[n.Error = 14] = "Error";
            n[n.IError = 15] = "IError";
            n[n.IsDeveloperData = 16] = "IsDeveloperData";
            n[n.ScriptAction = 17] = "ScriptAction";
            n[n.ScriptVersion = 18] = "ScriptVersion";
            n[n.SourceType = 19] = "SourceType"
        }(n.payloadParameterNames || (n.payloadParameterNames = {}));
        o = n.payloadParameterNames,
        function(n) {
            n[n.string = 0] = "string";
            n[n.number = 1] = "number";
            n[n.object = 2] = "object";
            n[n.boolean = 3] = "boolean";
            n[n.collection = 4] = "collection"
        }(n.payloadParameterTypes || (n.payloadParameterTypes = {}));
        s = n.payloadParameterTypes,
        function(n) {
            n[n.AccountId = 0] = "AccountId";
            n[n.CookieCreationDate = 1] = "CookieCreationDate";
            n[n.CustomDimensions = 2] = "CustomDimensions";
            n[n.CustomMetrics = 3] = "CustomMetrics";
            n[n.CustomUserId = 4] = "CustomUserId";
            n[n.Error = 5] = "Error";
            n[n.Events = 6] = "Events";
            n[n.IError = 7] = "IError";
            n[n.Language = 8] = "Language";
            n[n.PagePerformance = 9] = "PagePerformance";
            n[n.ProfileId = 10] = "ProfileId";
            n[n.Referrer = 11] = "Referrer";
            n[n.Screen = 12] = "Screen";
            n[n.ScriptAction = 13] = "ScriptAction";
            n[n.ScriptVersion = 14] = "ScriptVersion";
            n[n.SourceType = 15] = "SourceType";
            n[n.TargetPage = 16] = "TargetPage";
            n[n.TimeZone = 17] = "TimeZone";
            n[n.UserIdentity = 18] = "UserIdentity";
            n[n.IsDeveloperData = 19] = "IsDeveloperData";
            n[n.Random = 20] = "Random"
        }(n.payloadJSONAliases || (n.payloadJSONAliases = {}));
        t = n.payloadJSONAliases;
        t[0] = "aid";
        t[1] = "ica";
        t[2] = "prp";
        t[3] = "met";
        t[4] = "cuid";
        t[5] = "error";
        t[6] = "evt";
        t[7] = "interror";
        t[8] = "lng";
        t[9] = "perf";
        t[10] = "pid";
        t[11] = "rf";
        t[12] = "scr";
        t[13] = "jsa";
        t[14] = "jsv";
        t[15] = "st";
        t[16] = "tp";
        t[17] = "tz";
        t[18] = "uid";
        t[19] = "idd";
        t[20] = "rnd"
    })(n.Internal || (n.Internal = {}));
    var t = n.Internal
}(AppInsights || (AppInsights = {})),
function(n) {
    (function(n) {"use strict";
        var i = "dc.services.visualstudio.com",
            r = "f5.services.visualstudio.com",
            u = "_da.gif",
            f = "stats",
            e = 18,
            o = "js",
            s = 2e3,
            t = function() {
                function n() {
                    this.pagePath = null;
                    this.cookieName = "aiInfo";
                    this.debugEnabled = !1;
                    this.traceMode = 0;
                    this.maxVisitorCookieLifeMS = 63072e6;
                    this.maxSessionLiftMS = 18e5
                }
                return n.prototype.getImageHost = function() {
                        return i
                    }, n.prototype.getImageFile = function() {
                        return u
                    }, n.prototype.getDeveloperImageHost = function() {
                            return r
                        }, n.prototype.getPostHandler = function() {
                            return f
                        }, n.prototype.getVersion = function() {
                            return e
                        }, n.prototype.getSourceType = function() {
                            return o
                        }, n.prototype.getMaxUrlLength = function() {
                            return s
                        }, n
            }();
        n.Settings = t;
        n.settings = new t
    })(n.Internal || (n.Internal = {}));
    var t = n.Internal
}(AppInsights || (AppInsights = {})),
function(n) {
    (function(t) {"use strict";
        function i(n) {
            return !r.isNullOrUndefined(n)
        }
        function f(t, r) {
            return i(t) && typeof t === n.Internal.dataTypes[r]
        }
        function s(n) {
            return f(n, 1) || (n = parseFloat(n)), !isNaN(n) && isFinite(n)
        }
        function h(n) {
            if (i(n)) {
                var t = n.profiles ? n.profiles[n.activeProfile] : null,
                    r = n.profiles ? n.profiles.defaults : null;
                return i(t) && (!i(t.componentId) && i(r) && (t.componentId = r.componentId), !i(t.sendToRawStream) && i(r) && (t.sendToRawStream = r.sendToRawStream)), t
            }
            return null
        }
        function e(n) {
            var t,
                i,
                r;
            if (n === null)
                t = null;
            else if (typeof n == "object" && n.length !== undefined)
                for (t = [], i = 0; i < n.length; ++i)
                    t[t.length] = e(n[i]);
            else if (typeof n == "object") {
                t = {};
                for (r in n)
                    t[r] = e(n[r])
            }
            else
                t = n;
            return t
        }
        function l(n, t) {
            if (!r.isNullOrUndefined(n))
                for (var i = 0; i < n.length; i++)
                    if (t(n[i]))
                        return i;
            return -1
        }
        function a(n) {
            return n === 6 || n === 2 || n === 3
        }
        function y(n) {
            try {
                n()
            }
            catch(t) {}
        }
        function p(t, i) {
            if (f(i, 1) && n.Internal.settings.debugEnabled)
                switch (i) {
                    case 0:
                        console.error(t);
                        break;
                    case 1:
                        console.warn(t);
                        break;
                    case 2:
                        console.info(t)
                }
        }
        function b(n) {
            return n = n / 1e3, parseFloat(((n - 315532800) / 86400).toFixed(0))
        }
        function k(n) {
            return typeof n == "undefined" && (n = null), n = n || new Date, -Math.round(n.getTimezoneOffset() / 60)
        }
        var c,
            r,
            u,
            v,
            o,
            w;
        t.assertValue = i;
        t.assertType = f;
        t.isNumeric = s;
        t.getActiveProfile = h;
        t.cloneObject = e,
        function(n) {
            function i(n, t, i, u) {
                var o = "",
                    f,
                    e;
                return !r.isNullOrUndefined(n) && n.length > 0 && (f = n.indexOf(t), f !== -1 && (u || (f = f + t.length), e = n.indexOf(i, f), e === -1 && (e = n.length), o = n.substring(f, e))), o
            }
            function u(n, i, r) {
                if (t.assertType(n, 0) && n.length > 0 && t.assertType(r, 1) && t.assertType(i, 1)) {
                    var u = n.substring(0, i);
                    return r > -1 && (u += n.substring(r)), u
                }
                return ""
            }
            n.substring = i;
            n.remove = u
        }(t.Strings || (t.Strings = {}));
        c = t.Strings,
        function(n) {
            function t(n) {
                return typeof n == "undefined" || n === null
            }
            function i() {
                var n = null;
                try {
                    n = window.localStorage
                }
                catch(t) {}
                return n
            }
            function r() {
                var n = null;
                try {
                    n = window.sessionStorage
                }
                catch(t) {}
                return n
            }
            n.isNullOrUndefined = t;
            n.getWindowLocalStorage = i;
            n.getWindowSessionStorage = r
        }(t.Extensions || (t.Extensions = {}));
        r = t.Extensions;
        t.arrayIndexOf = l,
        function(n) {
            function i() {
                var n = new Date,
                    t = n.getTime(),
                    i = n.getTimezoneOffset() * 6e4;
                return t + i
            }
            function r() {
                return (new Date).getTime()
            }
            function u(n, i) {
                if (!t.assertType(n, 1) || !t.assertType(i, 1) || n === 0 || i === 0)
                    return 0;
                var r = i - n;
                return Math.max(r, 0)
            }
            n.utcNow = i;
            n.now = r;
            n.getDuration = u
        }(t.DateTime || (t.DateTime = {}));
        u = t.DateTime;
        t.isArrayBeacon = a,
        function(n) {
            function t() {
                return !r.isNullOrUndefined(window.performance) && !r.isNullOrUndefined(window.performance.timing) && !r.isNullOrUndefined(window.performance.timing.responseStart)
            }
            n.supportsPerformanceTimingApi = t
        }(t.Browser || (t.Browser = {}));
        v = t.Browser;
        o = function() {
            function n() {
                this.netCon = u.getDuration(window.performance.timing.navigationStart, window.performance.timing.connectEnd);
                this.sendReq = u.getDuration(window.performance.timing.requestStart, window.performance.timing.responseStart);
                this.recResp = u.getDuration(window.performance.timing.responseStart, window.performance.timing.responseEnd);
                this.clientProc = u.getDuration(window.performance.timing.domLoading, window.performance.timing.loadEventEnd);
                this.ptotal = u.getDuration(window.performance.timing.domainLookupStart, window.performance.timing.loadEventEnd)
            }
            return n
        }();
        t.PageMetrics = o;
        t.tryCatchSwallowWrapper = y;
        t.debugMessage = p,
        function(n) {
            function t() {
                var i = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
                    n = [],
                    r,
                    t;
                for (n[8] = n[13] = n[18] = n[23] = "-", n[14] = "4", t = 0; t < 36; t++)
                    n[t] || (r = Math.floor(Math.random() * i.length), n[t] = i[r]);
                return n.join("")
            }
            n.create = t
        }(t.UniqueId || (t.UniqueId = {}));
        w = t.UniqueId;
        t.getDaysSince1980 = b;
        t.calculateTimezone = k
    })(n.Internal || (n.Internal = {}));
    var t = n.Internal
}(AppInsights || (AppInsights = {})),
function(n) {
    (function(t) {"use strict";
        var i = function() {
                function t() {
                    this.taxonomy = [];
                    this.payload = {};
                    this.addToTaxonomy(0, 10, 1);
                    this.addToTaxonomy(16, 19, 1);
                    this.addToTaxonomy(1, 18, 1);
                    this.addToTaxonomy(6, 16, 1);
                    this.addToTaxonomy(2, 11, 1);
                    this.addToTaxonomy(3, 8, 1);
                    this.addToTaxonomy(4, 17, 1);
                    this.addToTaxonomy(5, 12, 1);
                    this.addToTaxonomy(12, 1, 2)
                }
                return t.prototype.addToPayload = function(t, i) {
                        this.payload[n.Internal.payloadParameterNames[t]] = i
                    }, t.prototype.getFromPayload = function(t) {
                        return this.payload[n.Internal.payloadParameterNames[t]]
                    }, t.prototype.addToTaxonomy = function(t, i, r) {
                            return n.Internal.arrayIndexOf(this.taxonomy, function(n) {
                                    return n.key === t
                                }) >= 0 ? !1 : (this.taxonomy.push({
                                    key: t, data: i, type: r
                                }), !0)
                        }, t.prototype.addToPayloadCollection = function(t, i) {
                            var r = this.getFromPayload(t);
                            n.Internal.assertValue(r) || (r = [], r.isPayloadCollection = !0, this.addToPayload(t, r));
                            r.push(i)
                        }, t.prototype.processTaxonomy = function(t) {
                            var i,
                                r,
                                s,
                                f,
                                e,
                                o;
                            if (!n.Internal.assertType(t, 0))
                                return "";
                            var u = {},
                                h = "&rnd=" + n.Internal.DateTime.now();
                            for (i = 0; i < this.taxonomy.length; i++)
                                if (r = this.taxonomy[i], r.type === 1)
                                    s = this.addAttribute(r),
                                    t += s;
                                else {
                                    f = this.addVariable(r);
                                    e = n.Internal.payloadJSONAliases[r.data];
                                    try {
                                        u[e] = JSON.parse(f)
                                    }
                                    catch(c) {
                                        u[e] = f
                                    }
                                    delete this.payload[n.Internal.payloadParameterNames[r.key]];
                                    this.taxonomy.splice(i, 1);
                                    i--
                                }
                            return o = encodeURIComponent(JSON.stringify(u)), o.length > 0 ? t += "data=" + o : t = t.substr(0, t.length - 1), t + h
                        }, t.prototype.addUserIdToTaxonomy = function(t) {
                            n.Internal.Extensions.isNullOrUndefined(this.getFromPayload(8)) && this.addToTaxonomy(8, 4, 2);
                            this.addToPayload(8, t)
                        }, t.prototype.addAccountIdToTaxonomy = function(t) {
                            n.Internal.Extensions.isNullOrUndefined(this.getFromPayload(9)) && this.addToTaxonomy(9, 0, 2);
                            this.addToPayload(9, t)
                        }, t.prototype.setMetric = function(t, i) {
                            if (!n.Internal.assertValue(t) || !n.Internal.assertValue(i)) {
                                n.Internal.debugMessage("Dimension details must be defined", 0);
                                return
                            }
                            if (!n.Internal.isNumeric(i)) {
                                n.Internal.debugMessage("Metric value must be numeric", 0);
                                return
                            }
                            this.addToPayloadCollection(11, new n.Internal.SimpleProperty(t, Number(i)));
                            this.addToTaxonomy(11, 3, 2)
                        }, t.prototype.setDimension = function(t, i) {
                            if (!n.Internal.assertValue(t) || !n.Internal.assertValue(i)) {
                                n.Internal.debugMessage("Dimension details must be defined", 0);
                                return
                            }
                            this.addToPayloadCollection(10, new n.Internal.SimpleProperty(t, i));
                            this.addToTaxonomy(10, 2, 2)
                        }, t.prototype.addAttribute = function(t) {
                            return this.internalValidateNode(t) ? n.Internal.payloadJSONAliases[t.data] + "=" + encodeURIComponent(this.getFromPayload(t.key)) + "&" : ""
                        }, t.prototype.addVariable = function(n) {
                            if (this.internalValidateNode(n)) {
                                var t = this.getFromPayload(n.key);
                                return typeof t.isPayloadCollection != "undefined" ? this.toArraysOfJsonString(t, n) : t.toString()
                            }
                            return ""
                        }, t.prototype.internalValidateNode = function(t) {
                            var i = this.getFromPayload(t.key),
                                f = typeof i,
                                r,
                                u;
                            switch (f) {
                                case"undefined":
                                    r = !1;
                                    break;
                                case"object":
                                    r = i instanceof Array ? n.Internal.assertValue(i) && i.length > 0 && t.type === 2 : n.Internal.assertValue(i) && t.type === 2;
                                    break;
                                case"string":
                                    u = this.getFromPayload(t.key);
                                    r = u !== null && u.length > 0;
                                    break;
                                default:
                                    r = n.Internal.assertValue(i)
                            }
                            return r
                        }, t.prototype.toArraysOfJsonString = function(t, i) {
                            for (var f, r = "", u = 0; u < t.length; u++)
                                u > 0 && (r += ","),
                                f = t[u],
                                typeof f.toString == "undefined" && (f = t[u] = JSON.stringify(f)),
                                r += f.toString();
                            return (t.length > 1 || n.Internal.isArrayBeacon(i.data)) && (r = "[" + r + "]"), r
                        }, t
            }();
        t.AnalyticsDataImpl = i;
        t.analyticsData = new i
    })(n.Internal || (n.Internal = {}));
    var t = n.Internal
}(AppInsights || (AppInsights = {}));
appInsights = appInsights || {},
function(n) {
    (function(n) {"use strict";
        var t = function() {
                function n(n, t, i) {
                    this.visitor = n;
                    this.visit = t;
                    this.createdDate = i
                }
                return n
            }();
        n.User = t;
        n.valueDelimiter = "|";
        n.applicationsDelimiter = "||"
    })(n.Internal || (n.Internal = {}));
    var t = n.Internal
}(AppInsights || (AppInsights = {})),
function(n) {
    (function(t) {"use strict";
        function s(t) {
            var f = null,
                r = t.split(n.Internal.valueDelimiter),
                e,
                u;
            return n.Internal.Extensions.isNullOrUndefined(r) || r.length !== 5 || (e = parseInt(r[3], 10), u = parseInt(r[4], 10), isNaN(u) || (f = new i(r[0], r[1], r[2], e, u))), f
        }
        var e = 4e3,
            o = 10,
            i = function() {
                function t(n, t, i, r, u) {
                    this.instrumentKey = n;
                    this.visitorId = t;
                    this.visitId = i;
                    this.creationtime = r;
                    this.lastUpdateTime = u
                }
                return t.prototype.serialize = function() {
                        return this.instrumentKey + n.Internal.valueDelimiter + this.visitorId + n.Internal.valueDelimiter + this.visitId + n.Internal.valueDelimiter + this.creationtime + n.Internal.valueDelimiter + this.lastUpdateTime
                    }, t
            }(),
            r,
            u,
            f;
        t.StorageApplication = i;
        r = function() {
            function t(t, i) {
                this.settings = i || n.Internal.settings;
                this.cookieStorage = t || document
            }
            return t.prototype.enabled = function(t) {
                    var u = this,
                        i = !1,
                        r;
                    return n.Internal.Extensions.isNullOrUndefined(this.cookieStorage.cookie) || (r = function() {
                            return u.cookieStorage.cookie.indexOf(t) !== -1
                        }, r() ? i = !0 : (this.cookieStorage.cookie = t, i = r())), i
                }, t.prototype.setValue = function(n, t) {
                    var i = !1,
                        r,
                        u;
                    try {
                        r = new Date((new Date).getTime() + this.settings.maxVisitorCookieLifeMS);
                        this.cookieStorage.cookie = n + "=" + encodeURIComponent(t) + ";expires=" + r.toUTCString() + ";path=/";
                        u = this.getValue(n);
                        i = u === t
                    }
                    catch(f) {}
                    return i
                }, t.prototype.getValue = function(t) {
                        return decodeURIComponent(n.Internal.Strings.substring(this.cookieStorage.cookie, t + "=", ";", !1))
                    }, t
        }();
        t.Cookies = r;
        u = function() {
            function t(t, i) {
                this.cookies = t;
                this.settings = n.Internal.Extensions.isNullOrUndefined(i) ? n.Internal.settings : i
            }
            return t.prototype.enabled = function() {
                    return this.cookies.enabled(this.settings.cookieName)
                }, t.prototype.updateApplication = function(n) {
                    var t = this.cookies.getValue(this.settings.cookieName);
                    return t.length > e && (t = this.getShrinkCookie(t)), t = this.getRemoveApplicationCookie(n, t), t = this.getAddApplicationCookie(n, t), this.cookies.setValue(this.settings.cookieName, t)
                }, t.prototype.getApplication = function(t) {
                        var r = null,
                            u = this.cookies.getValue(this.settings.cookieName),
                            i;
                        return u !== "" && (i = n.Internal.Strings.substring(u, t, n.Internal.applicationsDelimiter, !0), i !== "" && (r = s(i))), r
                    }, t.prototype.getRemoveApplicationCookie = function(t, i) {
                        var f = i,
                            r,
                            u;
                        return i !== "" && (r = i.indexOf(t.instrumentKey), r !== -1 && (u = i.indexOf(n.Internal.applicationsDelimiter, r), u >= 0 && (u += n.Internal.applicationsDelimiter.length - 1), f = n.Internal.Strings.remove(i, r, u))), f
                    }, t.prototype.getAddApplicationCookie = function(t, i) {
                        var r = t.serialize();
                        return i !== "" && (r += n.Internal.applicationsDelimiter), r + i
                    }, t.prototype.getShrinkCookie = function(t) {
                        for (var r = "", i = t.length - 1, u = 0; u < o; u++)
                            if (i = t.lastIndexOf(n.Internal.applicationsDelimiter, i) - 1, i < 0)
                                break;
                        return i > 0 && (r = t.substring(0, i)), r
                    }, t
        }();
        t.StorageApplicationManager = u;
        f = function() {
            function t(t, i, f) {
                this.settings = t || n.Internal.settings;
                this.cookies = i || new r(document, this.settings);
                this.appInsights = f || appInsights;
                this.visitor = null;
                this.visit = null;
                this.createdOn = null;
                this.applicationManager = new u(this.cookies, this.settings)
            }
            return t.prototype.getUser = function(t) {
                    var i = null;
                    return this.initialize(t) && (i = new n.Internal.User(this.visitor, this.visit, this.createdOn)), i
                }, t.prototype.initialize = function(t) {
                    var f = !1,
                        u;
                    if (this.applicationManager.enabled()) {
                        var r = this.applicationManager.getApplication(this.appInsights.applicationInsightsId),
                            e = n.Internal.DateTime.utcNow(),
                            o = e - t;
                        n.Internal.Extensions.isNullOrUndefined(r) ? r = new i(this.appInsights.applicationInsightsId, n.Internal.UniqueId.create(), n.Internal.UniqueId.create(), n.Internal.DateTime.now(), o) : r.lastUpdateTime = e;
                        this.applicationManager.updateApplication(r) ? (this.visitor = r.visitorId, this.visit = r.visitId, this.createdOn = n.Internal.getDaysSince1980(r.creationtime).toString()) : (u = this.applicationManager.getApplication(this.appInsights.applicationInsightsId), n.Internal.Extensions.isNullOrUndefined(u) && (u.visitorId === r.visitorId && (this.visitor = r.visitorId), u.visitId === r.visitId && (this.visit = r.visitId), u.creationtime === r.creationtime && (this.createdOn = r.creationtime.toString())));
                        f = !0
                    }
                    return f
                }, t
        }();
        t.CookieStorage = f
    })(n.Internal || (n.Internal = {}));
    var t = n.Internal
}(AppInsights || (AppInsights = {})),
function(n) {
    (function(t) {"use strict";
        var i = function() {
                function t(t, i, r) {
                    this.settings = n.Internal.Extensions.isNullOrUndefined(i) ? n.Internal.settings : i;
                    this.cookieStorage = t;
                    this.appInsights = r || appInsights
                }
                return t.prototype.getUser = function(t) {
                        function e(n) {
                            i === null && (i = s.getUser(n))
                        }
                        var i = null,
                            s = this.cookieStorage,
                            f = this.getStorageInfo(n.Internal.Extensions.getWindowLocalStorage(), "uid", this.settings.maxVisitorCookieLifeMS, t, function() {
                                return n.Internal.UniqueId.create()
                            }),
                            r,
                            u,
                            o;
                        return f === null && (e(t), n.Internal.Extensions.isNullOrUndefined(i) || (f = i.Visitor)), r = this.getStorageInfo(n.Internal.Extensions.getWindowLocalStorage(), "ica", this.settings.maxVisitorCookieLifeMS, t, function() {
                                return "" + n.Internal.getDaysSince1980(n.Internal.DateTime.now())
                            }), r === null && (e(t), n.Internal.Extensions.isNullOrUndefined(i) || (r = i.CreatedDate)), u = this.getStorageInfo(n.Internal.Extensions.getWindowSessionStorage(), "sid", this.settings.maxSessionLiftMS, t, function() {
                                    return n.Internal.UniqueId.create()
                                }), u === null && (e(t), n.Internal.Extensions.isNullOrUndefined(i) || (u = i.Visit)), o = null, (f !== null || u !== null || r !== null) && (o = new n.Internal.User(f, u, r)), o
                    }, t.prototype.getStorageInfo = function(t, i, r, u, f) {
                        var c = this.appInsights.applicationInsightsId + i,
                            l = null,
                            a,
                            o,
                            e,
                            s,
                            v,
                            h,
                            y;
                        if (!n.Internal.Extensions.isNullOrUndefined(t)) {
                            a = n.Internal.DateTime.utcNow();
                            o = null;
                            try {
                                o = t.getItem(c)
                            }
                            catch(p) {}
                            if (e = null, n.Internal.assertType(o, 0) && (s = o.split(n.Internal.valueDelimiter), s.length === 2 && (v = parseInt(s[0], 10), isNaN(v) || (h = n.Internal.DateTime.getDuration(v, a), h = h - u, h < r && (e = s[1])))), n.Internal.Extensions.isNullOrUndefined(e))
                                try {
                                    e = f();
                                    y = a - u + n.Internal.valueDelimiter + e;
                                    t.setItem(c, y);
                                    t.getItem(c) === y && (l = e)
                                }
                                catch(w) {}
                            else
                                l = e
                        }
                        return l
                    }, t
            }();
        t.DomStorage = i
    })(n.Internal || (n.Internal = {}));
    var t = n.Internal
}(AppInsights || (AppInsights = {})),
function(n) {
    (function(t) {"use strict";
        var i = function() {
                function t(t) {
                    this.cookieStorage = null;
                    this.domStorage = null;
                    this.settings = n.Internal.Extensions.isNullOrUndefined(t) ? n.Internal.settings : t
                }
                return t.prototype.getUserIdentity = function() {
                        return this.getBrowserStorage().getUser(0)
                    }, t.prototype.getCookieStorage = function() {
                        return this.cookieStorage === null && (this.cookieStorage = new n.Internal.CookieStorage(this.settings)), this.cookieStorage
                    }, t.prototype.getBrowserStorage = function() {
                            if (this.domStorage === null) {
                                var t = n.Internal.Extensions.getWindowSessionStorage(),
                                    i = n.Internal.Extensions.getWindowLocalStorage();
                                this.domStorage = n.Internal.Extensions.isNullOrUndefined(t) || n.Internal.Extensions.isNullOrUndefined(i) ? this.getCookieStorage() : new n.Internal.DomStorage(this.getCookieStorage(), this.settings)
                            }
                            return this.domStorage
                        }, t
            }();
        t.UserIdentityProviderImpl = i;
        t.userIdentityProvider = new i
    })(n.Internal || (n.Internal = {}));
    var t = n.Internal
}(AppInsights || (AppInsights = {})),
function(n) {
    (function(t) {"use strict";
        var i = function() {
                function t(t, i, r, u, f, e) {
                    this.data = t || n.Internal.analyticsData;
                    this.settings = i || n.Internal.settings;
                    this.userIdentityProvider = r || n.Internal.userIdentityProvider;
                    this.appInsights = u || appInsights;
                    this.location = f || location;
                    this.configuration = e || appInsights.configuration
                }
                return t.prototype.createPayload = function(t) {
                        var o = this.getSendToRawStreamFromConfig(),
                            e,
                            i,
                            r;
                        if (!n.Internal.assertType(this.appInsights.applicationInsightsId, 0) || this.appInsights.applicationInsightsId.length === 0)
                            return n.Internal.debugMessage("Application ID must be defined", 0), null;
                        e = n.Internal.payloadJSONAliases[13] + "=" + n.Internal.payLoadTypes[t];
                        i = n.Internal.payloadJSONAliases[14] + "=" + this.settings.getVersion();
                        i += "&" + n.Internal.payloadJSONAliases[15] + "=" + this.settings.getSourceType();
                        i += "&" + e + "&";
                        this.data.addToPayload(0, this.appInsights.applicationInsightsId);
                        this.data.addToPayload(16, o);
                        r = this.userIdentityProvider.getUserIdentity();
                        n.Internal.assertValue(r) && (this.data.addToPayload(1, r.visitor), this.data.addToPayload(12, r.createdDate));
                        this.data.addToPayload(5, screen.width + "x" + screen.height + "x" + screen.colorDepth);
                        this.data.addToPayload(3, !document.all || navigator.userAgent.match("Opera") ? navigator.language : navigator.userLanguage);
                        n.Internal.assertType(this.settings.pagePath, 0) ? this.data.addToPayload(6, this.settings.pagePath) : this.data.addToPayload(6, this.location.href);
                        n.Internal.assertType(this.appInsights.appUserId, 0) && this.data.addUserIdToTaxonomy(this.appInsights.appUserId);
                        n.Internal.assertType(this.appInsights.accountId, 0) && this.data.addAccountIdToTaxonomy(this.appInsights.accountId);
                        var u = null,
                            f = document.referrer.match(/^(?:f|ht)tp(?:s)?\:\/\/([^/|:]+)/im);
                        return f !== null && f.length >= 2 && (u = f[1]), u !== null && u !== window.location.hostname && this.data.addToPayload(2, document.referrer), this.data.addToPayload(4, n.Internal.calculateTimezone()), this.data.processTaxonomy(i)
                    }, t.prototype.sendData = function(n) {
                        var r = this.location.protocol,
                            f,
                            i;
                        r.indexOf("http") !== 0 && (r = "http:");
                        var e = this.getSendToRawStreamFromConfig(),
                            u = r + "//" + (e ? this.settings.getDeveloperImageHost() : this.settings.getImageHost()) + "/",
                            t = new XMLHttpRequest;
                        "withCredentials" in t ? (t.onload = function() {
                            return
                        }, t.onerror = function() {
                            return
                        }, n.length >= this.settings.getMaxUrlLength() ? (t.open("POST", u + this.settings.getPostHandler(), !0), t.setRequestHeader("Content-type", "application/x-www-form-urlencoded")) : (t.open("GET", u + this.settings.getImageFile() + "?" + n, !0), n = null), t.send(n)) : (f = u + this.settings.getImageFile() + "?" + n, i = document.createElement("script"), i.async = !0, i.src = f, document.getElementsByTagName("head")[0].appendChild(i))
                    }, t.prototype.createAndSendData = function(t) {
                            var i = this.createPayload(t);
                            return n.Internal.assertValue(i) ? (this.sendData(i), !0) : !1
                        }, t.prototype.getSendToRawStreamFromConfig = function() {
                            var t = null !== this.configuration ? n.Internal.getActiveProfile(this.configuration) : null;
                            return null !== t && t.sendToRawStream
                        }, t
            }();
        t.DataSender = i;
        t.dataSender = new i
    })(n.Internal || (n.Internal = {}));
    var t = n.Internal
}(AppInsights || (AppInsights = {})),
function(n) {
    (function(t) {"use strict";
        var i = function() {
                function t(t, i, r) {
                    this.settings = t || n.Internal.settings;
                    this.analyticsData = i || n.Internal.analyticsData;
                    this.dataSender = r || n.Internal.dataSender
                }
                return t.prototype.tryCatchTraceWrapper = function(n, t, i) {
                        try {
                            return t()
                        }
                        catch(r) {
                            return this.traceException(n, r, i), null
                        }
                    }, t.prototype.traceEvent = function(t) {
                        if (this.settings.traceMode !== 0) {
                            t = t.toString();
                            try {
                                n.Internal.Extensions.isNullOrUndefined(console) || (n.Internal.Extensions.isNullOrUndefined(console.debug) ? n.Internal.Extensions.isNullOrUndefined(console.log) || console.log("Application Insights Trace " + (new Date).toString() + ": " + t) : console.debug("Application Insights Trace (%s) : %s.", (new Date).toString(), t))
                            }
                            catch(i) {}
                            this.settings.traceMode === 4 && alert("Application Insights Trace:\n" + t + ".")
                        }
                    }, t.prototype.traceException = function(t, i, r) {
                            var u = this;
                            n.Internal.tryCatchSwallowWrapper(function() {
                                var f = {},
                                    e;
                                f.Id = t;
                                n.Internal.Extensions.isNullOrUndefined(i) || (!n.Internal.Extensions.isNullOrUndefined(i.stack) && i.stack.length > 0 && (f.Stack = i.stack), f.Type = i.name, f.Message = i.message);
                                n.Internal.Extensions.isNullOrUndefined(r) || (f.Params = r);
                                e = JSON.stringify(f);
                                u.trackInternalError(e);
                                u.traceEvent(e)
                            })
                        }, t.prototype.trackInternalError = function(n) {
                            this.analyticsData.addToPayload(15, n);
                            this.analyticsData.addToTaxonomy(15, 7, 2);
                            this.dataSender.createAndSendData(7)
                        }, t
            }();
        t.DiagnosticsImpl = i;
        t.diagnostics = new i
    })(n.Internal || (n.Internal = {}));
    var t = n.Internal
}(AppInsights || (AppInsights = {})),
function(n) {
    (function(t) {"use strict";
        var i = function() {
                function t(t) {
                    this.diagnostics = t || n.Internal.diagnostics
                }
                return t.prototype.AttachEvent = function(t, i, r) {
                        var u = !1;
                        return n.Internal.Extensions.isNullOrUndefined(t) || (n.Internal.Extensions.isNullOrUndefined(t.attachEvent) ? n.Internal.Extensions.isNullOrUndefined(t.addEventListener) || this.diagnostics.tryCatchTraceWrapper("addEventListener", function() {
                                t.addEventListener(i, r, !1);
                                u = !0
                            }, [t, i]) : this.diagnostics.tryCatchTraceWrapper("attachEvent", function() {
                                t.attachEvent("on" + i, r);
                                u = !0
                            }, [t, i])), u
                    }, t.prototype.DetachEvent = function(t, i, r) {
                        n.Internal.Extensions.isNullOrUndefined(t) || (n.Internal.Extensions.isNullOrUndefined(t.detachEvent) ? n.Internal.Extensions.isNullOrUndefined(t.removeEventListener) || this.diagnostics.tryCatchTraceWrapper("removeEventListener", function() {
                            t.removeEventListener(i, r, !1)
                        }, [t.toString(), i]) : this.diagnostics.tryCatchTraceWrapper("detachEvent", function() {
                            t.detachEvent("on" + i, r)
                        }, [t.toString(), i]))
                    }, t
            }();
        t.Commands = i;
        t.commands = new i
    })(n.Internal || (n.Internal = {}));
    var t = n.Internal
}(AppInsights || (AppInsights = {})),
function(n) {
    (function(t) {"use strict";
        var i = function() {
                function t(t, i, r, u) {
                    this.pagePerformanceTrackingEnabled = !0;
                    this.analyticsData = t || n.Internal.analyticsData;
                    this.settings = i || n.Internal.settings;
                    this.dataSender = r || n.Internal.dataSender;
                    this.commands = u || n.Internal.commands
                }
                return t.prototype.logEvent = function(t, i, r) {
                        var u = this;
                        return n.Internal.diagnostics.tryCatchTraceWrapper("logEvent", function() {
                                return n.Internal.assertValue(t) ? (u.analyticsData.addToPayloadCollection(7, new n.Internal.SimpleEvent(t)), u.analyticsData.addToTaxonomy(7, 6, 2), u.addCustomPropertiesAndMetrics(i, r), u.dataSender.createAndSendData(2)) : (n.Internal.debugMessage("eventPath must be defined", 0), !1)
                            }, [t, i, r])
                    }, t.prototype.logPageView = function(t, i, r) {
                        var u = this;
                        return n.Internal.diagnostics.tryCatchTraceWrapper("logPageView", function() {
                                var f = u.settings.pagePath;
                                n.Internal.assertType(t, 0) && (u.settings.pagePath = t);
                                u.addCustomPropertiesAndMetrics(i, r);
                                try {
                                    return u.dataSender.createAndSendData(0)
                                }
                                finally {
                                    n.Internal.assertType(f, 0) && (u.settings.pagePath = f)
                                }
                            }, [t, i, r])
                    }, t.prototype.trackPagePerformance = function() {
                            var t = new n.Internal.PageMetrics;
                            return this.analyticsData.addToPayload(13, JSON.stringify(t)), this.analyticsData.addToTaxonomy(13, 9, 2), this.dataSender.createAndSendData(5)
                        }, t.prototype.trackError = function(t, i, r) {
                            var u = new n.Internal.ErrorData(t, i, r);
                            return this.analyticsData.addToPayload(14, u.toString()), this.analyticsData.addToTaxonomy(14, 5, 2), this.dataSender.createAndSendData(6)
                        }, t.prototype.trackPagePerformanceImpl = function() {
                            var t = this;
                            return n.Internal.diagnostics.tryCatchTraceWrapper("trackPagePerformance", function() {
                                    if (!n.Internal.Browser.supportsPerformanceTimingApi())
                                        return !1;
                                    var i = function() {
                                            t.pagePerformanceTrackingEnabled && (window.performance.timing.loadEventEnd !== 0 ? t.trackPagePerformance() : setTimeout(i, 500))
                                        };
                                    return setTimeout(i, 500), !0
                                })
                        }, t.prototype.enablePagePerformanceTracking = function() {
                            this.pagePerformanceTrackingEnabled = !0;
                            this.trackPagePerformanceImpl()
                        }, t.prototype.disablePagePerformanceTracking = function() {
                            this.pagePerformanceTrackingEnabled = !1
                        }, t.prototype.addCustomPropertiesAndMetrics = function(t, i) {
                            var r,
                                u;
                            if (n.Internal.assertType(t, 2))
                                for (r in t)
                                    n.Internal.Extensions.isNullOrUndefined(t[r]) || this.analyticsData.setDimension(r, t[r].toString());
                            if (n.Internal.assertType(i, 2))
                                for (u in i)
                                    n.Internal.Extensions.isNullOrUndefined(i[u]) || this.analyticsData.setMetric(u, i[u])
                        }, t
            }();
        t.AIClient = i;
        t.aiClient = new i
    })(n.Internal || (n.Internal = {}));
    var t = n.Internal
}(AppInsights || (AppInsights = {})),
function(n) {
    (function(t) {"use strict";
        function r(n) {
            while (n.length > 0) {
                var t = n.shift();
                t()
            }
        }
        var i = n.Internal.getActiveProfile(appInsights.configuration) || null;
        appInsights.applicationInsightsId = appInsights.applicationInsightsId || (i ? i.componentId : "");
        appInsights.accountId = appInsights.accountId || null;
        appInsights.appUserId = appInsights.appUserId || null;
        appInsights.logEvent = function(t, i, r) {
            return n.Internal.aiClient.logEvent(t, i, r)
        };
        appInsights.logPageView = function(t, i, r) {
            return n.Internal.aiClient.logPageView(t, i, r)
        };
        t.callFunctions = r;
        try {
            n.Internal.aiClient.enablePagePerformanceTracking();
            appInsights.queue instanceof Array && r(appInsights.queue)
        }
        catch(u) {}
    })(n.Internal || (n.Internal = {}));
    var t = n.Internal
}(AppInsights || (AppInsights = {}));