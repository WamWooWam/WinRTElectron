//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        (function(AmsQueryResultCode) {
            AmsQueryResultCode[AmsQueryResultCode.Success = 0] = "Success";
            AmsQueryResultCode[AmsQueryResultCode.Unauthorized = 1] = "Unauthorized";
            AmsQueryResultCode[AmsQueryResultCode.UnknownError = 2] = "UnknownError"
        })(Services.AmsQueryResultCode || (Services.AmsQueryResultCode = {}));
        var AmsQueryResultCode = Services.AmsQueryResultCode
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ApplicationHttpMessage = function() {
                function ApplicationHttpMessage(httpMessage) {
                    this._messageBody = httpMessage
                }
                return ApplicationHttpMessage.prototype.getMessageText = function() {
                        var part = new Services.MimeMessage;
                        return part.addHeader("Content-Type", "application/http"), part.addHeader("Content-Transfer-Encoding", "binary"), part.setBody(this._messageBody.getRequest()), part.getMessageText()
                    }, ApplicationHttpMessage
            }();
        Services.ApplicationHttpMessage = ApplicationHttpMessage
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ApplicationHttpMessageParser = function() {
                function ApplicationHttpMessageParser(message) {
                    this._parseSuccessful = !1;
                    this._parseMessage(message)
                }
                return ApplicationHttpMessageParser.prototype._parseMessage = function(message) {
                        var _this = this,
                            contentType = message.getMessageHeader("Content-Type"),
                            messageBody = message.getMessageBody();
                        if (contentType === "application/http" && messageBody !== null) {
                            var matchSet = messageBody.match("HTTP/\\d\\.\\d (\\d+) (.+?)\r\n");
                            if (matchSet === null)
                                return null;
                            var status = parseInt(matchSet[1]);
                            if (!isFinite(status))
                                return null;
                            var newline = "\r\n",
                                separator = "\r\n\r\n",
                                changeResponseHeadersAndBodyBegin = messageBody.indexOf(newline) + newline.length;
                            if (changeResponseHeadersAndBodyBegin < newline.length)
                                return null;
                            var lengthOfStartLine = messageBody.indexOf(newline);
                            var headersAndHttpBody = messageBody.substr(lengthOfStartLine + newline.length),
                                messageReader = new Services.StringMessageReader(headersAndHttpBody),
                                headerNames = messageReader.getMessageHeaderNames(),
                                responseBody = messageReader.getMessageBody();
                            if (headerNames === null)
                                return null;
                            this._headers = {};
                            headerNames.forEach(function(headerName) {
                                _this._headers[headerName] = messageReader.getMessageHeader(headerName)
                            });
                            this._responseText = responseBody;
                            this._status = status;
                            this._parseSuccessful = !0
                        }
                    }, ApplicationHttpMessageParser.prototype.getStatus = function() {
                        return this._parseSuccessful ? this._status : null
                    }, ApplicationHttpMessageParser.prototype.getResponseText = function() {
                            return this._parseSuccessful ? this._responseText : null
                        }, ApplicationHttpMessageParser.prototype.getHeaders = function() {
                            return this._parseSuccessful ? AppMagic.Utility.jsonClone(this._headers) : null
                        }, ApplicationHttpMessageParser
            }();
        Services.ApplicationHttpMessageParser = ApplicationHttpMessageParser
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AsyncResult = function() {
                function AsyncResult(){}
                return AsyncResult
            }();
        Services.AsyncResult = AsyncResult
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AuthenticationBrokerManager = function() {
                function AuthenticationBrokerManager(broker) {
                    this._broker = broker;
                    this._promiseQueue = new Core.Promise.PromiseQueue
                }
                return AuthenticationBrokerManager.prototype.requestAccessToken = function(unEncodedAuthUri, unEncodedCallbackUri, unEncodedQueryParameters) {
                        var _this = this;
                        return this._promiseQueue.pushJob(function() {
                                return _this._requestAccessToken(unEncodedAuthUri, unEncodedCallbackUri, unEncodedQueryParameters)
                            })
                    }, AuthenticationBrokerManager.prototype._requestAccessToken = function(unEncodedAuthUri, unEncodedCallbackUri, unEncodedQueryParameters) {
                        var authUri = unEncodedAuthUri,
                            unEncodedQueryParametersKeys = Object.keys(unEncodedQueryParameters);
                        if (unEncodedQueryParametersKeys.length > 0) {
                            var qps = unEncodedQueryParametersKeys.filter(function(qpKey) {
                                    return unEncodedQueryParameters[qpKey] !== null
                                }).map(function(qpKey) {
                                    return qpKey + "=" + encodeURIComponent(unEncodedQueryParameters[qpKey])
                                }).join("&");
                            authUri += authUri.indexOf("?") > -1 ? "&" + qps : "?" + qps
                        }
                        if (!AppMagic.Utility.validateUri(authUri))
                            return WinJS.Promise.wrap({
                                    success: !1, message: AppMagic.Strings.AuthenticationBrokerManagerErrorCannotFormAuthUrl, domains: []
                                });
                        if (!AppMagic.Utility.validateUri(unEncodedCallbackUri))
                            return WinJS.Promise.wrap({
                                    success: !1, message: AppMagic.Strings.AuthenticationBrokerManagerErrorCannotFormCallbackUrl, domains: []
                                });
                        return this._broker.authenticateAsync(authUri, unEncodedCallbackUri).then(function(authenticationResult) {
                                var result;
                                return authenticationResult.authenticationStatus === 1 ? result = typeof authenticationResult.responseData != "string" ? {
                                        success: !1, message: AppMagic.Strings.AuthenticationBrokerManagerErrorNoResponseDataReturnedFromServer
                                    } : {
                                        success: !0, result: authenticationResult.responseData
                                    } : authenticationResult.authenticationStatus === 2 ? result = {
                                        success: !1, message: AppMagic.Strings.AuthenticationBrokerManagerErrorUserCanceled
                                    } : authenticationResult.authenticationStatus === 4 ? result = {
                                        success: !1, message: AppMagic.Strings.AuthenticationBrokerManagerErrorHttp
                                    } : authenticationResult.authenticationStatus === 3 && (result = {
                                        success: !1, message: AppMagic.Strings.AuthenticationBrokerManagerErrorHttp
                                    }), result.domains = authenticationResult.navigatedUris, result
                            })
                    }, AuthenticationBrokerManager
            }();
        Services.AuthenticationBrokerManager = AuthenticationBrokerManager
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AuthenticationExecutionContext = function() {
                function AuthenticationExecutionContext(authStore, onBeforeAsyncStep, onAfterAsyncStep) {
                    this._authStore = authStore;
                    this.onBeforeAsyncStep = onBeforeAsyncStep;
                    this.onAfterAsyncStep = onAfterAsyncStep
                }
                return Object.defineProperty(AuthenticationExecutionContext.prototype, "serviceFunction", {
                        get: function() {
                            return Contracts.check(!1, "AuthenticationExecutionContext doesn't support access to the service function."), null
                        }, enumerable: !0, configurable: !0
                    }), AuthenticationExecutionContext.prototype.tryGetParameterValue = function(name) {
                        return Contracts.check(!1, "Authentication execution doesn't support function parameters in its value expressions."), {value: !1}
                    }, AuthenticationExecutionContext.prototype.tryGetVariableValue = function(name) {
                            return Contracts.check(!1, "Authentication execution doesn't support function variables in its value expressions."), {value: !1}
                        }, AuthenticationExecutionContext.prototype.tryGetAuthenticationVariableValue = function(name) {
                            var varValue = this._authStore.tryGetVariableValue(name);
                            return varValue === null ? {value: !1} : {
                                    value: !0, outValue: varValue
                                }
                        }, AuthenticationExecutionContext
            }();
        Services.AuthenticationExecutionContext = AuthenticationExecutionContext
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        (function(AuthenticationStatus) {
            AuthenticationStatus[AuthenticationStatus.inProgress = 0] = "inProgress";
            AuthenticationStatus[AuthenticationStatus.success = 1] = "success";
            AuthenticationStatus[AuthenticationStatus.cancel = 2] = "cancel";
            AuthenticationStatus[AuthenticationStatus.invalidUrl = 3] = "invalidUrl";
            AuthenticationStatus[AuthenticationStatus.httpError = 4] = "httpError"
        })(Services.AuthenticationStatus || (Services.AuthenticationStatus = {}));
        var AuthenticationStatus = Services.AuthenticationStatus
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var Lock = function() {
                function Lock() {
                    this._uniqueId = 0;
                    this._acquirerId = null;
                    this._acquisitionQueue = []
                }
                return Lock.prototype.acquireAsync = function(acquirerId) {
                        if (this._acquirerId !== null) {
                            var request = this._generateAcquisitionRequest(acquirerId);
                            return this._acquisitionQueue.push(request), request.promise
                        }
                        return this._acquirerId = acquirerId, WinJS.Promise.wrap({
                                success: !0, result: this._acquirerId
                            })
                    }, Lock.prototype.releaseAsync = function(releaserId) {
                        if (releaserId !== this._acquirerId)
                            return this._acquisitionQueue = this._acquisitionQueue.filter(function(request) {
                                    return request.acquirerId !== releaserId
                                }), WinJS.Promise.wrap({success: !0});
                        if (this._acquisitionQueue.length === 0)
                            this._acquirerId = null;
                        else {
                            var nextRequest = this._acquisitionQueue.shift();
                            this._acquirerId = nextRequest.acquirerId;
                            nextRequest.complete({
                                success: !0, result: this._acquirerId
                            })
                        }
                        return WinJS.Promise.wrap({success: !0})
                    }, Lock.prototype.clearAcquisitionQueue = function(msg) {
                            var acquisitionQueue = this._acquisitionQueue;
                            this._acquisitionQueue = [];
                            acquisitionQueue.forEach(function(request) {
                                request.complete({
                                    success: !1, message: msg, result: request.acquirerId
                                })
                            })
                        }, Lock.prototype.getUniqueRequestId = function() {
                            return this._uniqueId++
                        }, Lock.prototype._generateAcquisitionRequest = function(acquirerId) {
                            var complete,
                                promise = new WinJS.Promise(function(c) {
                                    complete = c
                                });
                            return {
                                    promise: promise, complete: complete, acquirerId: acquirerId
                                }
                        }, Lock
            }();
        Services.Lock = Lock
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            b.hasOwnProperty(p) && (d[p] = b[p]);
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    },
    AppMagic;
(function(AppMagic) {
    var Utility;
    (function(Utility) {
        var ParentNamespaceCache = function() {
                function ParentNamespaceCache(){}
                return ParentNamespaceCache.prototype._getPrefixedNamespaceKey = function(keyName) {
                        return ParentNamespaceCache.PrefixNamespace + keyName
                    }, ParentNamespaceCache.prototype._getPrefixedValueKey = function(keyName) {
                        return ParentNamespaceCache.PrefixValue + keyName
                    }, ParentNamespaceCache.prototype.notifyWrite = function() {
                            throw new Error("virtual method");
                        }, ParentNamespaceCache.PrefixDelimiter = "~", ParentNamespaceCache.PrefixNamespace = "n" + ParentNamespaceCache.PrefixDelimiter, ParentNamespaceCache.PrefixValue = "v" + ParentNamespaceCache.PrefixDelimiter, ParentNamespaceCache
            }();
        Utility.ParentNamespaceCache = ParentNamespaceCache;
        var RootNamespaceCache = function(_super) {
                __extends(RootNamespaceCache, _super);
                function RootNamespaceCache(initialData, settings, cacheKey) {
                    _super.call(this);
                    this._data = JSON.parse(JSON.stringify(initialData));
                    this._settings = settings;
                    this._cacheKey = cacheKey;
                    this._wrappedSelf = new ChildNamespaceCache(this._data, this)
                }
                return RootNamespaceCache.prototype.createNamespaceCache = function(ns) {
                        return this._wrappedSelf.createNamespaceCache(ns)
                    }, RootNamespaceCache.prototype.getNamespaceCache = function(ns) {
                        return this._wrappedSelf.getNamespaceCache(ns)
                    }, RootNamespaceCache.prototype.notifyWrite = function() {
                            this._settings.setValue(this._cacheKey, this._data)
                        }, RootNamespaceCache.prototype.clear = function() {
                            this._wrappedSelf.clear();
                            this.notifyWrite()
                        }, RootNamespaceCache.SettingsKey = "AUTH_CACHE_KEY", RootNamespaceCache
            }(ParentNamespaceCache);
        Utility.RootNamespaceCache = RootNamespaceCache;
        var ChildNamespaceCache = function(_super) {
                __extends(ChildNamespaceCache, _super);
                function ChildNamespaceCache(data, parentCache) {
                    _super.call(this);
                    this._data = data;
                    this._caches = {};
                    this._parentCache = parentCache
                }
                return ChildNamespaceCache.prototype.getNamespaceCache = function(ns) {
                        var nsKey = this._getPrefixedNamespaceKey(ns);
                        return typeof this._data[nsKey] == "undefined" ? null : (typeof this._caches[ns] == "undefined" && (this._caches[ns] = new ChildNamespaceCache(this._data[nsKey], this)), this._caches[ns])
                    }, ChildNamespaceCache.prototype.createNamespaceCache = function(ns) {
                        var nsKey = this._getPrefixedNamespaceKey(ns);
                        this._data[nsKey] = {};
                        this._parentCache.notifyWrite();
                        var cache = new ChildNamespaceCache(this._data[nsKey], this);
                        return this._caches[ns] = cache, cache
                    }, ChildNamespaceCache.prototype.getValue = function(key) {
                            var prefixedKey = this._getPrefixedValueKey(key),
                                value = this._data[prefixedKey];
                            return typeof value == "undefined" ? value : JSON.parse(JSON.stringify(value))
                        }, ChildNamespaceCache.prototype.setValues = function(keyValuePairs) {
                            var _this = this;
                            Object.keys(keyValuePairs).forEach(function(key) {
                                var prefixedKey = _this._getPrefixedValueKey(key);
                                _this._data[prefixedKey] = keyValuePairs[key]
                            });
                            this._parentCache.notifyWrite()
                        }, ChildNamespaceCache.prototype.clear = function() {
                            var _this = this,
                                prefixedValueKeys = Object.keys(this._data).filter(function(dataKey) {
                                    return dataKey.indexOf(ParentNamespaceCache.PrefixValue) === 0
                                });
                            prefixedValueKeys.forEach(function(prefixedValueKey) {
                                return delete _this._data[prefixedValueKey]
                            });
                            var cacheKeys = Object.keys(this._caches);
                            cacheKeys.forEach(function(cacheKey) {
                                return _this._caches[cacheKey].clear()
                            })
                        }, ChildNamespaceCache.prototype.clearValues = function(keys) {
                            var _this = this;
                            keys.forEach(function(key) {
                                var prefixedKey = _this._getPrefixedValueKey(key);
                                delete _this._data[prefixedKey]
                            });
                            this._parentCache.notifyWrite()
                        }, ChildNamespaceCache.prototype.notifyWrite = function() {
                            this._parentCache.notifyWrite()
                        }, ChildNamespaceCache
            }(ParentNamespaceCache)
    })(Utility = AppMagic.Utility || (AppMagic.Utility = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AuthenticationStore = function() {
                function AuthenticationStore(cache) {
                    this._cache = cache;
                    this._lock = new Services.Lock
                }
                return Object.defineProperty(AuthenticationStore.prototype, "domains", {
                        get: function() {
                            return this._tryGetCachedValue(Services.Constants.Common.CacheKey.domains)
                        }, set: function(value) {
                                this._setCachedValue(Services.Constants.Common.CacheKey.domains, value)
                            }, enumerable: !0, configurable: !0
                    }), AuthenticationStore.prototype.getUniqueLockRequestId = function() {
                        return this._lock.getUniqueRequestId()
                    }, AuthenticationStore.prototype.acquireLockAsync = function(acquirerId) {
                            return this._lock.acquireAsync(acquirerId)
                        }, AuthenticationStore.prototype.releaseLockAsync = function(releaserId) {
                            return this._lock.releaseAsync(releaserId)
                        }, AuthenticationStore.prototype.clearAcquisitionQueue = function(msg) {
                            this._lock.clearAcquisitionQueue(msg)
                        }, AuthenticationStore.prototype.getAllVariableValues = function() {
                            var variablesBag = this._tryGetCachedValue(Services.Constants.Common.CacheKey.variablesBag);
                            return variablesBag === null ? {} : variablesBag
                        }, AuthenticationStore.prototype.tryGetVariableValue = function(name) {
                            var variablesBag = this._tryGetCachedValue(Services.Constants.Common.CacheKey.variablesBag);
                            return variablesBag !== null && typeof variablesBag[name] != "undefined" ? variablesBag[name] : null
                        }, AuthenticationStore.prototype.setVariableValue = function(name, value) {
                            var variablesBag = this._tryGetCachedValue(Services.Constants.Common.CacheKey.variablesBag);
                            variablesBag === null && (variablesBag = {});
                            variablesBag[name] = value;
                            this._setCachedValue(Services.Constants.Common.CacheKey.variablesBag, variablesBag)
                        }, AuthenticationStore.prototype._setCachedValue = function(cacheKey, cacheValue) {
                            var values = {};
                            values[cacheKey] = cacheValue;
                            this._cache.setValues(values)
                        }, AuthenticationStore.prototype._tryGetCachedValue = function(key) {
                            var value = this._cache.getValue(key);
                            return typeof value == "undefined" ? null : value
                        }, AuthenticationStore.prototype.clear = function(cookieManager) {
                            this.domains && this.domains.forEach(function(domain) {
                                return cookieManager.deleteCookies(domain)
                            });
                            this._cache.clear()
                        }, AuthenticationStore
            }();
        Services.AuthenticationStore = AuthenticationStore
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var OAuth2RefreshTokenStore = function(_super) {
                __extends(OAuth2RefreshTokenStore, _super);
                function OAuth2RefreshTokenStore(nsCache, services) {
                    _super.call(this, nsCache);
                    this._services = services
                }
                return Object.defineProperty(OAuth2RefreshTokenStore.prototype, "refreshToken", {
                        get: function() {
                            return this._tryGetCachedValue(Services.Constants.OAuth2.CacheKey.refreshToken)
                        }, set: function(value) {
                                this._setCachedValue(Services.Constants.OAuth2.CacheKey.refreshToken, value)
                            }, enumerable: !0, configurable: !0
                    }), OAuth2RefreshTokenStore.prototype.registerService = function(serviceName) {
                        this._services[serviceName] = !0
                    }, OAuth2RefreshTokenStore.prototype.deregisterService = function(serviceName) {
                            delete this._services[serviceName];
                            Object.keys(this._services).length === 0 && this._cache.clearValues([Services.Constants.OAuth2.CacheKey.refreshToken])
                        }, OAuth2RefreshTokenStore
            }(Services.AuthenticationStore);
        Services.OAuth2RefreshTokenStore = OAuth2RefreshTokenStore
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AuthenticationStoreFactory = function() {
                function AuthenticationStoreFactory(){}
                return AuthenticationStoreFactory.createOAuth2RefreshTokenStore = function(parentNSCache, nsCacheKey, serviceName) {
                        var nsCache = parentNSCache.getNamespaceCache(nsCacheKey);
                        nsCache === null && (nsCache = parentNSCache.createNamespaceCache(nsCacheKey));
                        var refreshTokenStore = new AppMagic.Services.OAuth2RefreshTokenStore(nsCache, {});
                        return typeof serviceName != "undefined" && serviceName !== null && refreshTokenStore.registerService(serviceName), refreshTokenStore
                    }, AuthenticationStoreFactory.createOAuth2Store = function(parentNSCache, nsCacheKey) {
                        var nsCache = parentNSCache.getNamespaceCache(nsCacheKey);
                        return nsCache === null && (nsCache = parentNSCache.createNamespaceCache(nsCacheKey)), new AppMagic.Services.OAuth2Store(nsCache)
                    }, AuthenticationStoreFactory
            }();
        Services.AuthenticationStoreFactory = AuthenticationStoreFactory
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AuthenticationVariableReferenceExpression = function() {
                function AuthenticationVariableReferenceExpression(variableName) {
                    this._variableName = variableName
                }
                return AuthenticationVariableReferenceExpression.prototype.computeResultSchema = function(serviceFunction, maxSchemaDepth) {
                        return Contracts.check(!1, "Not Implemented"), null
                    }, AuthenticationVariableReferenceExpression.prototype.isBehaviorOnly = function(serviceFunction) {
                        return Contracts.check(!1, "Not Implemented"), null
                    }, AuthenticationVariableReferenceExpression.prototype.evaluateAsync = function(executionContext) {
                            var result = executionContext.tryGetAuthenticationVariableValue(this._variableName);
                            return result.value ? WinJS.Promise.wrap(Services.ServiceUtility.createSuccessfulValueExpressionResult(result.outValue)) : WinJS.Promise.wrap(Services.ServiceUtility.createUnsuccessfulValueExpressionResult())
                        }, AuthenticationVariableReferenceExpression
            }();
        Services.AuthenticationVariableReferenceExpression = AuthenticationVariableReferenceExpression
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AuthUtility;
        (function(AuthUtility) {
            var AuthScheme_OAuth = "OAuth",
                OAuthHeaderName_OAuthSignature = "oauth_signature";
            function parseJsonWebToken(token) {
                var encodedTokenSegments = token.split(".");
                if (encodedTokenSegments.length !== 3)
                    throw new Error(AppMagic.AuthoringStrings.BackstageOffice365ErrorTenantId);
                var parsedTokenSegments = encodedTokenSegments.map(parseEncodedJwtSegment);
                return parsedTokenSegments.forEach(function(segment) {
                        return
                    }), {
                        header: parsedTokenSegments[0], payload: parsedTokenSegments[1], signature: parsedTokenSegments[2]
                    }
            }
            AuthUtility.parseJsonWebToken = parseJsonWebToken;
            function parseEncodedJwtSegment(encodedSegment) {
                if (encodedSegment === "")
                    return null;
                var utf8WordArray = CryptoJS.enc.Base64.parse(encodedSegment);
                var tokenSegmentJson = CryptoJS.enc.Utf8.stringify(utf8WordArray);
                var tokenSegment = JSON.parse(tokenSegmentJson);
                return tokenSegment
            }
            AuthUtility.parseEncodedJwtSegment = parseEncodedJwtSegment;
            var EncodedParameter = function() {
                    function EncodedParameter(){}
                    return EncodedParameter
                }();
            AuthUtility.EncodedParameter = EncodedParameter;
            function getNonce(length) {
                for (var nonce = new Array(length), i = 0; i < length; i++) {
                    var r = Math.floor(Math.random() * 62);
                    nonce[i] = r < 10 ? r.toString() : r < 36 ? String.fromCharCode(r - 10 + "a".charCodeAt(0)) : String.fromCharCode(r - 36 + "A".charCodeAt(0))
                }
                return nonce.join("")
            }
            AuthUtility.getNonce = getNonce;
            function getTimestamp() {
                return Math.round((new Date).getTime() / 1e3).toString()
            }
            AuthUtility.getTimestamp = getTimestamp;
            function fixedEncodeURIComponent(str) {
                return encodeURIComponent(str).replace(/!|'|\(|\)|\*/g, function(char) {
                        switch (char) {
                            case"!":
                                return "%21";
                            case"'":
                                return "%27";
                            case"(":
                                return "%28";
                            case")":
                                return "%29";
                            case"*":
                                return "%2A"
                        }
                        return char
                    })
            }
            AuthUtility.fixedEncodeURIComponent = fixedEncodeURIComponent;
            function signHmacSha1ForOAuth1(method, unencodedEndpoint, unencodedClientSecret, unencodedTokenSecret, encodedParameters) {
                var sorted = [];
                encodedParameters.forEach(function(encodedParameter) {
                    sorted.push({
                        key: encodedParameter.key, value: encodedParameter.value
                    })
                });
                sorted.sort(function(lhs, rhs) {
                    return lhs.key === rhs.key ? lhs.value.localeCompare(rhs.value) : lhs.key.localeCompare(rhs.key)
                });
                var parameterString = sorted.map(function(encodedParameter) {
                        return encodedParameter.key + "=" + encodedParameter.value
                    }).join("&"),
                    keyText = fixedEncodeURIComponent(unencodedClientSecret) + "&" + fixedEncodeURIComponent(unencodedTokenSecret),
                    sigBaseString = method + "&" + fixedEncodeURIComponent(unencodedEndpoint) + "&" + fixedEncodeURIComponent(parameterString);
                return AppMagic.Encryption.instance.generateHmacSha1Signature(sigBaseString, keyText)
            }
            function getOAuth1HmacSha1SignatureForParameters(encodedOAuthParameters, encodedParameters, unencodedClientSecret, unencodedOAuthTokenSecret, httpMethod, unencodedEndpoint) {
                var encodedParametersToBeSigned = [];
                Object.keys(encodedOAuthParameters).forEach(function(key) {
                    encodedParametersToBeSigned.push({
                        key: key, value: encodedOAuthParameters[key]
                    })
                });
                encodedParameters.forEach(function(encodedParameter) {
                    encodedParametersToBeSigned.push(encodedParameter)
                });
                var encodedTokenSecret = fixedEncodeURIComponent(unencodedOAuthTokenSecret);
                return signHmacSha1ForOAuth1(httpMethod, unencodedEndpoint, unencodedClientSecret, encodedTokenSecret, encodedParametersToBeSigned)
            }
            AuthUtility.getOAuth1HmacSha1SignatureForParameters = getOAuth1HmacSha1SignatureForParameters;
            function getHmacSha1SignedOAuthAuthorizationHeader(unencodedSignature, unsignedEncodedOAuthHeaders) {
                var encodedOAuthHeadersCopy = {};
                Object.keys(unsignedEncodedOAuthHeaders).forEach(function(key) {
                    encodedOAuthHeadersCopy[key] = unsignedEncodedOAuthHeaders[key]
                });
                encodedOAuthHeadersCopy[OAuthHeaderName_OAuthSignature] = fixedEncodeURIComponent(unencodedSignature);
                return AuthScheme_OAuth + " " + Object.keys(encodedOAuthHeadersCopy).sort(function(lhs, rhs) {
                        return lhs.localeCompare(rhs)
                    }).map(function(key) {
                        return key + '="' + encodedOAuthHeadersCopy[key] + '"'
                    }).join(", ")
            }
            AuthUtility.getHmacSha1SignedOAuthAuthorizationHeader = getHmacSha1SignedOAuthAuthorizationHeader
        })(AuthUtility = Services.AuthUtility || (Services.AuthUtility = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var Constants;
        (function(Constants) {
            var Common;
            (function(Common) {
                var CacheKey;
                (function(CacheKey) {
                    CacheKey.domains = "domains";
                    CacheKey.variablesBag = "variablesBag"
                })(CacheKey = Common.CacheKey || (Common.CacheKey = {}))
            })(Common = Constants.Common || (Constants.Common = {}));
            var HttpRequest;
            (function(HttpRequest) {
                HttpRequest.SupportedHttpVerbs = ["GET", "POST", "PUT", "PATCH", "DELETE"];
                var Methods;
                (function(Methods) {
                    Methods.GET = "GET";
                    Methods.POST = "POST";
                    Methods.PUT = "PUT";
                    Methods.PATCH = "PATCH";
                    Methods.DELETE = "DELETE"
                })(Methods = HttpRequest.Methods || (HttpRequest.Methods = {}))
            })(HttpRequest = Constants.HttpRequest || (Constants.HttpRequest = {}));
            var MediaType;
            (function(MediaType) {
                MediaType.Json = "application/json";
                MediaType.FormUrlEncoded = "application/x-www-form-urlencoded";
                MediaType.Xml = "application/xml";
                MediaType.Image = "image";
                MediaType.Audio = "audio";
                MediaType.MultipartFormData = "multipart/form-data"
            })(MediaType = Constants.MediaType || (Constants.MediaType = {}))
        })(Constants = Services.Constants || (Services.Constants = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AuthenticationProvider = function() {
                function AuthenticationProvider(store) {
                    this._store = store
                }
                return Object.defineProperty(AuthenticationProvider.prototype, "store", {
                        get: function() {
                            return this._store
                        }, enumerable: !0, configurable: !0
                    }), AuthenticationProvider.prototype.authenticateAsync = function(onBeforeAsyncStep, onAfterAsyncStep) {
                        return null
                    }, AuthenticationProvider.prototype.authenticateRequestAsync = function(builder, onBeforeAsyncStep, onAfterAsyncStep) {
                            return null
                        }, AuthenticationProvider.prototype._acquireStoreAsync = function(acquirerId, previousAsyncResult) {
                            return this._store.acquireLockAsync(acquirerId).then(function(acquireResult) {
                                    return acquireResult.success ? previousAsyncResult && !previousAsyncResult.success ? WinJS.Promise.wrap(previousAsyncResult) : WinJS.Promise.wrap({
                                            success: !0, result: acquireResult.result
                                        }) : WinJS.Promise.wrap(acquireResult)
                                })
                        }, AuthenticationProvider.prototype._releaseStoreAsync = function(releaserId, previousAsyncResult) {
                            return previousAsyncResult && !previousAsyncResult.success && this._store.clearAcquisitionQueue(previousAsyncResult.message), this._store.releaseLockAsync(releaserId).then(function() {
                                    return previousAsyncResult && !previousAsyncResult.success ? WinJS.Promise.wrap(previousAsyncResult) : WinJS.Promise.wrap({success: !0})
                                })
                        }, AuthenticationProvider.prototype._onAuthenticateError = function(releaserId, error) {
                            this._store.releaseLockAsync(releaserId);
                            throw error;
                        }, AuthenticationProvider
            }();
        Services.AuthenticationProvider = AuthenticationProvider
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var OAuth2TokenStyle;
        (function(OAuth2TokenStyle) {
            OAuth2TokenStyle.header = "header";
            OAuth2TokenStyle.query = "query"
        })(OAuth2TokenStyle = Services.OAuth2TokenStyle || (Services.OAuth2TokenStyle = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var Constants;
        (function(Constants) {
            var OAuth2;
            (function(OAuth2) {
                var ResponseTypes;
                (function(ResponseTypes) {
                    ResponseTypes.code = "code";
                    ResponseTypes.token = "token"
                })(ResponseTypes = OAuth2.ResponseTypes || (OAuth2.ResponseTypes = {}));
                var HeaderNames;
                (function(HeaderNames) {
                    HeaderNames.accept = "Accept";
                    HeaderNames.contentType = "Content-Type";
                    HeaderNames.clientServiceClientTag = "X-ClientService-ClientTag";
                    HeaderNames.authorization = "Authorization"
                })(HeaderNames = OAuth2.HeaderNames || (OAuth2.HeaderNames = {}));
                var ParameterNames;
                (function(ParameterNames) {
                    ParameterNames.authorizationCode = "code";
                    ParameterNames.accessToken = "access_token";
                    ParameterNames.accessToken = "access_token";
                    ParameterNames.resource = "resource";
                    ParameterNames.clientId = "client_id";
                    ParameterNames.clientSecret = "client_secret";
                    ParameterNames.refreshToken = "refresh_token";
                    ParameterNames.grantType = "grant_type";
                    ParameterNames.responseType = "response_type";
                    ParameterNames.redirectUri = "redirect_uri";
                    ParameterNames.expiresIn = "expires_in";
                    ParameterNames.scope = "scope";
                    ParameterNames.error = "error"
                })(ParameterNames = OAuth2.ParameterNames || (OAuth2.ParameterNames = {}));
                var ErrorResponse;
                (function(ErrorResponse) {
                    ErrorResponse.accessDenied = "access_denied";
                    ErrorResponse.invalid_request = "invalid_request";
                    ErrorResponse.unauthorizedClient = "unauthorized_client";
                    ErrorResponse.unsupportedResponseType = "unsupported_response_type";
                    ErrorResponse.invalidScope = "invalid_scope"
                })(ErrorResponse = OAuth2.ErrorResponse || (OAuth2.ErrorResponse = {}));
                var RequestHeaders;
                (function(RequestHeaders) {
                    RequestHeaders.base = {
                        Accept: "*/*", "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                    }
                })(RequestHeaders = OAuth2.RequestHeaders || (OAuth2.RequestHeaders = {}));
                var GrantTypes;
                (function(GrantTypes) {
                    GrantTypes.refreshToken = "refresh_token";
                    GrantTypes.authorizationCode = "authorization_code";
                    GrantTypes.clientCredentials = "client_credentials"
                })(GrantTypes = OAuth2.GrantTypes || (OAuth2.GrantTypes = {}));
                var CacheKey;
                (function(CacheKey) {
                    CacheKey.code = "code";
                    CacheKey.token = "token";
                    CacheKey.idToken = "idToken";
                    CacheKey.refreshToken = "refreshToken";
                    CacheKey.tokenTimeStamp = "tokenTimeStamp";
                    CacheKey.tokenExpiresIn = "tokenExpiresIn";
                    CacheKey.domains = "domains"
                })(CacheKey = OAuth2.CacheKey || (OAuth2.CacheKey = {}));
                var TokenFormat;
                (function(TokenFormat) {
                    TokenFormat.bearer = {
                        tokenFormat: "Bearer {access_token}", tokenStyle: Services.OAuth2TokenStyle.header, tokenKey: "Authorization", valueExpression: null
                    }
                })(TokenFormat = OAuth2.TokenFormat || (OAuth2.TokenFormat = {}));
                var Methods;
                (function(Methods) {
                    Methods.POST = AppMagic.Services.Constants.HttpRequest.Methods.POST;
                    Methods.GET = AppMagic.Services.Constants.HttpRequest.Methods.GET
                })(Methods = OAuth2.Methods || (OAuth2.Methods = {}))
            })(OAuth2 = Constants.OAuth2 || (Constants.OAuth2 = {}))
        })(Constants = Services.Constants || (Services.Constants = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var OAuth2Constants = Services.Constants.OAuth2,
            OAuth2Store = function(_super) {
                __extends(OAuth2Store, _super);
                function OAuth2Store(cache) {
                    _super.call(this, cache)
                }
                return Object.defineProperty(OAuth2Store.prototype, "token", {
                        get: function() {
                            return this._validate(), this._tryGetCachedValue(OAuth2Constants.CacheKey.token)
                        }, set: function(value) {
                                this._setCachedValue(OAuth2Constants.CacheKey.token, value)
                            }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(OAuth2Store.prototype, "tokenTimeStamp", {
                        get: function() {
                            return this._validate(), this._tryGetCachedValue(OAuth2Constants.CacheKey.tokenTimeStamp)
                        }, set: function(value) {
                                this._setCachedValue(OAuth2Constants.CacheKey.tokenTimeStamp, value)
                            }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(OAuth2Store.prototype, "tokenExpiresIn", {
                            get: function() {
                                return this._validate(), this._tryGetCachedValue(OAuth2Constants.CacheKey.tokenExpiresIn)
                            }, set: function(value) {
                                    this._setCachedValue(OAuth2Constants.CacheKey.tokenExpiresIn, value)
                                }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(OAuth2Store.prototype, "isAuthenticated", {
                            get: function() {
                                return this._validate(), typeof this.token != "undefined" && this.token !== null
                            }, enumerable: !0, configurable: !0
                        }), OAuth2Store.prototype._validate = function() {
                            var token = this._tryGetCachedValue(OAuth2Constants.CacheKey.token),
                                tokenTimeStamp = this._tryGetCachedValue(OAuth2Constants.CacheKey.tokenTimeStamp),
                                tokenExpiresIn = this._tryGetCachedValue(OAuth2Constants.CacheKey.tokenExpiresIn);
                            typeof token != "undefined" && token !== null && typeof tokenExpiresIn != "undefined" && tokenExpiresIn !== null && tokenTimeStamp + tokenExpiresIn < Date.now() && this._cache.clearValues([OAuth2Constants.CacheKey.token, OAuth2Constants.CacheKey.tokenTimeStamp, OAuth2Constants.CacheKey.tokenExpiresIn])
                        }, OAuth2Store
            }(Services.AuthenticationStore);
        Services.OAuth2Store = OAuth2Store
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var OAuth2Provider = function(_super) {
                __extends(OAuth2Provider, _super);
                function OAuth2Provider(grantType, tokenOptions) {
                    _super.call(this, grantType.store);
                    this._grantType = grantType;
                    this._tokenOptions = tokenOptions
                }
                return Object.defineProperty(OAuth2Provider.prototype, "store", {
                        get: function() {
                            return this._store
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(OAuth2Provider.prototype, "grantType", {
                        get: function() {
                            return this._grantType
                        }, enumerable: !0, configurable: !0
                    }), OAuth2Provider.prototype.authenticateAsync = function(onBeforeAsyncStep, onAfterAsyncStep) {
                            var _this = this;
                            var acquirerId = this.store.getUniqueLockRequestId();
                            return this._acquireStoreAsync(acquirerId).then(function(result) {
                                    return _this._authenticateAsync(result, onBeforeAsyncStep, onAfterAsyncStep)
                                }).then(function(result) {
                                    return _this._retryAuthenticationIfNecessary(result, onBeforeAsyncStep, onAfterAsyncStep)
                                }).then(function(result) {
                                    return _this._releaseStoreAsync(acquirerId, result)
                                }, function(error) {
                                    return _this._onAuthenticateError(acquirerId, error)
                                })
                        }, OAuth2Provider.prototype.authenticateRequestAsync = function(builder, onBeforeAsyncStep, onAfterAsyncStep) {
                            var _this = this;
                            var acquirerId = this.store.getUniqueLockRequestId();
                            return this._acquireStoreAsync(acquirerId).then(function(result) {
                                    return _this._authenticateAsync(result, onBeforeAsyncStep, onAfterAsyncStep)
                                }).then(function(result) {
                                    return _this._retryAuthenticationIfNecessary(result, onBeforeAsyncStep, onAfterAsyncStep)
                                }).then(function(result) {
                                    return _this._authenticateRequestAsync(result, builder, onBeforeAsyncStep, onAfterAsyncStep)
                                }).then(function(result) {
                                    return _this._releaseStoreAsync(acquirerId, result)
                                }, function(error) {
                                    return _this._onAuthenticateError(acquirerId, error)
                                })
                        }, OAuth2Provider.prototype._authenticateAsync = function(acquireStoreResult, onBeforeAsyncStep, onAfterAsyncStep) {
                            return acquireStoreResult.success ? this.store.isAuthenticated ? WinJS.Promise.wrap(Services.ServiceUtility.createSuccessfulVoidAsyncResult()) : this._grantType.authenticateAsync(onBeforeAsyncStep, onAfterAsyncStep) : WinJS.Promise.wrap(Services.ServiceUtility.createUnsuccessfulAsyncResultFromOther(acquireStoreResult))
                        }, OAuth2Provider.prototype._authenticateRequestAsync = function(acquireResult, builder, onBeforeAsyncStep, onAfterAsyncStep) {
                            var _this = this;
                            if (!acquireResult.success)
                                return WinJS.Promise.wrap(acquireResult);
                            var token = this.store.token;
                            if (!token)
                                return WinJS.Promise.wrap(Services.ServiceUtility.createUnsuccessfulAsyncResult(AppMagic.Strings.OAuth2ErrorNoValidAccessTokensExist));
                            var getAuthValuePromise;
                            if (this._tokenOptions.valueExpression !== null) {
                                var authenticationVariableValues,
                                    execCtx = new Services.AuthenticationExecutionContext(this.store, onBeforeAsyncStep, onAfterAsyncStep);
                                getAuthValuePromise = this._tokenOptions.valueExpression.evaluateAsync(execCtx)
                            }
                            else
                                getAuthValuePromise = WinJS.Promise.wrap(Services.ServiceUtility.createSuccessfulValueExpressionResult(token));
                            return getAuthValuePromise.then(function(evalResult) {
                                    if (!evalResult.success)
                                        return Services.ServiceUtility.valueExpressionResultToPipelineResult(evalResult);
                                    var tokenValue = _this._tokenOptions.tokenFormat.replace(/\{access_token\}\\?/, evalResult.value);
                                    switch (_this._tokenOptions.tokenStyle) {
                                        case Services.OAuth2TokenStyle.query:
                                            builder.addQueryParameter(_this._tokenOptions.tokenKey, tokenValue);
                                            break;
                                        case Services.OAuth2TokenStyle.header:
                                            builder.addHeader(_this._tokenOptions.tokenKey, tokenValue);
                                            break;
                                        default:
                                            break
                                    }
                                    return Services.ServiceUtility.createSuccessfulVoidAsyncResult()
                                })
                        }, OAuth2Provider.prototype._retryAuthenticationIfNecessary = function(result, onBeforeAsyncStep, onAfterAsyncStep) {
                            return result.success || result.message === AppMagic.Strings.AuthenticationBrokerManagerErrorUserCanceled ? WinJS.Promise.wrap(result) : result.message === AppMagic.Strings.AuthenticationBrokerManagerErrorUserDeniedAccessToResources ? WinJS.Promise.wrap(result) : this._authenticateAsync({success: !0}, onBeforeAsyncStep, onAfterAsyncStep)
                        }, OAuth2Provider
            }(Services.AuthenticationProvider);
        Services.OAuth2Provider = OAuth2Provider
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var OAuth2GrantTypeBase = function() {
                function OAuth2GrantTypeBase(scope, store, brokerManager, controller) {
                    this._scope = scope;
                    this._store = store;
                    this._brokerManager = brokerManager;
                    this._controller = controller
                }
                return Object.defineProperty(OAuth2GrantTypeBase.prototype, "scope", {
                        get: function() {
                            return this._scope
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(OAuth2GrantTypeBase.prototype, "store", {
                        get: function() {
                            return this._store
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(OAuth2GrantTypeBase.prototype, "brokerManager", {
                            get: function() {
                                return this._brokerManager
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(OAuth2GrantTypeBase.prototype, "controller", {
                            get: function() {
                                return this._controller
                            }, enumerable: !0, configurable: !0
                        }), OAuth2GrantTypeBase.prototype.authenticateAsync = function(onBeforeAsyncStep, onAfterAsyncStep) {
                            return null
                        }, OAuth2GrantTypeBase
            }();
        Services.OAuth2GrantTypeBase = OAuth2GrantTypeBase
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var OAuth2AuthorizationCodeGrantType = function(_super) {
                __extends(OAuth2AuthorizationCodeGrantType, _super);
                function OAuth2AuthorizationCodeGrantType(scope, clientId, authorizationEndpointInfo, redirectUri, redirectionParamVariables, accessTokenEndpointInfo, refreshTokenEndpointInfo, tokenVariables, nsCache, refreshTokenStore, brokerManager, controller) {
                    _super.call(this, scope, new Services.OAuth2Store(nsCache), brokerManager, controller);
                    this._clientId = clientId;
                    this._authorizationEndpointInfo = authorizationEndpointInfo;
                    this._redirectUri = redirectUri;
                    this._redirectionParamVariables = redirectionParamVariables;
                    this._accessTokenEndpointInfo = accessTokenEndpointInfo;
                    this._refreshTokenEndpointInfo = refreshTokenEndpointInfo;
                    this._tokenVariables = tokenVariables;
                    this._refreshTokenStore = refreshTokenStore
                }
                return Object.defineProperty(OAuth2AuthorizationCodeGrantType.prototype, "refreshTokenStore", {
                        get: function() {
                            return this._refreshTokenStore
                        }, enumerable: !0, configurable: !0
                    }), OAuth2AuthorizationCodeGrantType.prototype.authenticateAsync = function(onBeforeAsyncStep, onAfterAsyncStep) {
                        var _this = this;
                        if (this._refreshTokenStore.refreshToken)
                            return this._refreshTokenCredentialsAsync(this._refreshTokenStore.refreshToken, onBeforeAsyncStep, onAfterAsyncStep).then(function(refreshResponse) {
                                    return _this._extractAndStoreTokenCredentials(refreshResponse, {})
                                });
                        var redirectionVariableValues = {};
                        return this._requestAuthorizationAsync().then(function(authorizationResponse) {
                                return (_this.store.domains = authorizationResponse.domains, !authorizationResponse.success) ? authorizationResponse : _this._requestTokenCredentialsAsync(authorizationResponse, redirectionVariableValues, onBeforeAsyncStep, onAfterAsyncStep).then(function(tokenResponse) {
                                        return tokenResponse.success ? _this._extractAndStoreTokenCredentials(tokenResponse, redirectionVariableValues) : tokenResponse
                                    })
                            })
                    }, OAuth2AuthorizationCodeGrantType.prototype._refreshTokenCredentialsAsync = function(refreshToken, onBeforeAsyncStep, onAfterAsyncStep) {
                            var _this = this;
                            onBeforeAsyncStep && onBeforeAsyncStep();
                            var builder = this._refreshTokenEndpointInfo.httpRequestBuilder.clone(),
                                applyParamPromises = this._refreshTokenEndpointInfo.requestParams.map(function(param) {
                                    return param.applyAsync(builder, null)
                                });
                            return WinJS.Promise.join(applyParamPromises).then(function() {
                                    return builder.setFormValue(Services.Constants.OAuth2.ParameterNames.grantType, Services.Constants.OAuth2.GrantTypes.refreshToken), builder.setFormValue(Services.Constants.OAuth2.ParameterNames.refreshToken, refreshToken), builder.generateHttpRequestAsync()
                                }).then(function(request) {
                                    var httpReqData = request.getRequestData(),
                                        body = httpReqData.data.map(function(datum) {
                                            return datum.value
                                        });
                                    return _this.controller.sendHttp(httpReqData.url, httpReqData.method, httpReqData.headers, httpReqData.queryParameters, body).then(function(response) {
                                            return onAfterAsyncStep && onAfterAsyncStep(), response
                                        }, function(error) {
                                            onAfterAsyncStep && onAfterAsyncStep();
                                            throw error;
                                        })
                                })
                        }, OAuth2AuthorizationCodeGrantType.prototype._requestAuthorizationAsync = function() {
                            var _this = this,
                                builder = this._authorizationEndpointInfo.httpRequestBuilder.clone(),
                                applyParamPromises = this._authorizationEndpointInfo.requestParams.map(function(param) {
                                    return param.applyAsync(builder, null)
                                });
                            return WinJS.Promise.join(applyParamPromises).then(function() {
                                    return typeof _this.scope != "undefined" && _this.scope !== null && builder.addQueryParameter(Services.Constants.OAuth2.ParameterNames.scope, _this.scope), builder.addQueryParameter(Services.Constants.OAuth2.ParameterNames.clientId, _this._clientId), builder.addQueryParameter(Services.Constants.OAuth2.ParameterNames.redirectUri, _this._redirectUri), builder.addQueryParameter(Services.Constants.OAuth2.ParameterNames.responseType, Services.Constants.OAuth2.ResponseTypes.code), builder.generateHttpRequestAsync()
                                }).then(function(request) {
                                    var httpReqData = request.getRequestData();
                                    return _this.brokerManager.requestAccessToken(httpReqData.url, _this._redirectUri, httpReqData.queryParameters)
                                })
                        }, OAuth2AuthorizationCodeGrantType.prototype._requestTokenCredentialsAsync = function(brokerResponse, redirectionVariableValues, onBeforeAsyncStep, onAfterAsyncStep) {
                            var _this = this;
                            if (!brokerResponse.success)
                                return WinJS.Promise.wrap(brokerResponse);
                            var locationUri = brokerResponse.result,
                                uriComponents = AppMagic.Utility.UriUtility.parseUriComponents(locationUri);
                            if (uriComponents === null)
                                return WinJS.Promise.wrap(Services.ServiceUtility.createUnsuccessfulAsyncResult(AppMagic.Strings.OAuth2ErrorInvalidResponseDataReturnedFromServer));
                            var queryParams = AppMagic.Utility.UriUtility.parseFormUrlEncodedStringToHashTable(uriComponents.query);
                            var code = queryParams[Services.Constants.OAuth2.ParameterNames.authorizationCode];
                            if (!AppMagic.Utility.isString(code) || code === "")
                                return queryParams[Services.Constants.OAuth2.ParameterNames.error] ? this._handleOAuth2ErrorResponses(queryParams[Services.Constants.OAuth2.ParameterNames.error]) : WinJS.Promise.wrap(Services.ServiceUtility.createUnsuccessfulAsyncResult(AppMagic.Strings.OAuth2ErrorInvalidResponseDataReturnedFromServer));
                            var anyVarsMissing = !1;
                            if (Object.keys(this._redirectionParamVariables).forEach(function(varName) {
                                var paramName = _this._redirectionParamVariables[varName];
                                var paramValue = queryParams[paramName];
                                typeof paramName == "string" ? redirectionVariableValues[varName] = paramValue : anyVarsMissing = !0
                            }), anyVarsMissing)
                                return WinJS.Promise.wrap(Services.ServiceUtility.createUnsuccessfulAsyncResult(AppMagic.Strings.OAuth2ErrorInvalidResponseDataReturnedFromServer));
                            onBeforeAsyncStep && onBeforeAsyncStep();
                            var builder = this._accessTokenEndpointInfo.httpRequestBuilder.clone(),
                                applyParamPromises = this._accessTokenEndpointInfo.requestParams.map(function(param) {
                                    return param.applyAsync(builder, null)
                                });
                            return WinJS.Promise.join(applyParamPromises).then(function() {
                                    return builder.setFormValue(Services.Constants.OAuth2.ParameterNames.authorizationCode, code), builder.setFormValue(Services.Constants.OAuth2.ParameterNames.clientId, _this._clientId), builder.setFormValue(Services.Constants.OAuth2.ParameterNames.redirectUri, _this._redirectUri), builder.setFormValue(Services.Constants.OAuth2.ParameterNames.grantType, Services.Constants.OAuth2.GrantTypes.authorizationCode), builder.generateHttpRequestAsync()
                                }).then(function(request) {
                                    var httpReqData = request.getRequestData(),
                                        body = httpReqData.data.map(function(datum) {
                                            return datum.value
                                        });
                                    return _this.controller.sendHttp(httpReqData.url, httpReqData.method, httpReqData.headers, httpReqData.queryParameters, body).then(function(response) {
                                            return onAfterAsyncStep && onAfterAsyncStep(), response
                                        }, function(error) {
                                            return onAfterAsyncStep && onAfterAsyncStep(), WinJS.Promise.wrap({
                                                    success: !1, message: error.message
                                                })
                                        })
                                })
                        }, OAuth2AuthorizationCodeGrantType.prototype._handleOAuth2ErrorResponses = function(errorMsg) {
                            return errorMsg === Services.Constants.OAuth2.ErrorResponse.accessDenied ? WinJS.Promise.wrap(Services.ServiceUtility.createUnsuccessfulAsyncResult(AppMagic.Strings.AuthenticationBrokerManagerErrorUserDeniedAccessToResources)) : WinJS.Promise.wrap(Services.ServiceUtility.createUnsuccessfulAsyncResult(AppMagic.Strings.OAuth2ErrorInvalidResponseDataReturnedFromServer))
                        }, OAuth2AuthorizationCodeGrantType.prototype._extractAndStoreTokenCredentials = function(tokenCredentialsResponse, redirectionVariableValues) {
                            var _this = this;
                            if (!tokenCredentialsResponse.success)
                                return WinJS.Promise.wrap(tokenCredentialsResponse);
                            var responseText = tokenCredentialsResponse.result.responseText,
                                resultJson = JSON.parse(responseText),
                                tokenVariableValues = {},
                                anyVarsMissing = !1;
                            Object.keys(this._tokenVariables).forEach(function(varName) {
                                var jsonPointer = _this._tokenVariables[varName];
                                var varValue = AppMagic.Utility.getJsonValueViaJsonPointer(resultJson, jsonPointer);
                                typeof varValue == "undefined" || varValue === null ? anyVarsMissing = !0 : tokenVariableValues[varName] = varValue
                            });
                            var accessToken = resultJson[Services.Constants.OAuth2.ParameterNames.accessToken];
                            if (typeof accessToken != "string")
                                return WinJS.Promise.wrap(Services.ServiceUtility.createUnsuccessfulAsyncResult(AppMagic.Strings.OAuth2ErrorInvalidResponseDataReturnedFromServer));
                            this.store.token = accessToken;
                            this.store.tokenTimeStamp = Date.now();
                            this.store.tokenExpiresIn = resultJson[Services.Constants.OAuth2.ParameterNames.expiresIn];
                            this.store.tokenExpiresIn *= 1e3;
                            var refreshToken = resultJson[Services.Constants.OAuth2.ParameterNames.refreshToken];
                            return typeof refreshToken != "undefined" && refreshToken !== null && (this._refreshTokenStore.refreshToken || (this._refreshTokenStore.refreshToken = refreshToken)), Object.keys(this._redirectionParamVariables).forEach(function(varName) {
                                    return _this.store.setVariableValue(varName, redirectionVariableValues[varName])
                                }), Object.keys(this._tokenVariables).forEach(function(varName) {
                                        return _this.store.setVariableValue(varName, tokenVariableValues[varName])
                                    }), WinJS.Promise.wrap({
                                        success: !0, message: null
                                    })
                        }, OAuth2AuthorizationCodeGrantType
            }(Services.OAuth2GrantTypeBase);
        Services.OAuth2AuthorizationCodeGrantType = OAuth2AuthorizationCodeGrantType
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AzureAuthenticationProviderFactory = function() {
                function AzureAuthenticationProviderFactory(brokerManager, connectionStatusProvider, controller) {
                    this._brokerManager = brokerManager;
                    this._connectionStatusProvider = connectionStatusProvider;
                    this._controller = controller
                }
                return AzureAuthenticationProviderFactory.prototype.createAuthenticationProvider = function(clientId, resource, redirectUri, authUri, cache, refreshTokenStore) {
                        var authorizationEndpoint = this._createAuthorizationEndpoint(authUri, resource),
                            tokenEndpoint = this._createTokenEndpoint(authUri, resource),
                            tokenVariables = {};
                        tokenVariables[Services.AzureRegistrationBroker.idTokenVariableName] = Services.AzureRegistrationBroker.idTokenVariableJsonPointer;
                        var fixedRedirectUri = redirectUri,
                            corpNetConnectionStatus = this._connectionStatusProvider.getCorpNetConnectionStatus();
                        corpNetConnectionStatus === 0 && (fixedRedirectUri = Services.AzureConstants.Graph.sienaSidRedirectUri);
                        var grantType = new Services.OAuth2AuthorizationCodeGrantType(null, clientId, authorizationEndpoint, fixedRedirectUri, {}, tokenEndpoint, tokenEndpoint, tokenVariables, cache, refreshTokenStore, this._brokerManager, this._controller),
                            tokenOptions = Services.Constants.OAuth2.TokenFormat.bearer;
                        return new Services.OAuth2Provider(grantType, tokenOptions)
                    }, AzureAuthenticationProviderFactory.prototype._createAuthorizationEndpoint = function(authBaseUri, resource) {
                        var builder = new Services.BodilessHttpRequestBuilder;
                        return builder.setBaseUrl(authBaseUri + AzureAuthenticationProviderFactory.authorizationPath), builder.addQueryParameter(Services.Constants.OAuth2.ParameterNames.resource, resource), {
                                    httpRequestBuilder: builder, requestParams: []
                                }
                    }, AzureAuthenticationProviderFactory.prototype._createTokenEndpoint = function(authBaseUri, resource) {
                            var builder = new Services.FormUrlEncodedHttpRequestBuilder;
                            return builder.setBaseUrl(authBaseUri + AzureAuthenticationProviderFactory.tokenPath), builder.setMethod(Services.Constants.OAuth2.Methods.POST), builder.setFormValue(Services.Constants.OAuth2.ParameterNames.resource, resource), {
                                        httpRequestBuilder: builder, requestParams: []
                                    }
                        }, AzureAuthenticationProviderFactory.authorizationPath = "oauth2/authorize", AzureAuthenticationProviderFactory.tokenPath = "oauth2/token", AzureAuthenticationProviderFactory
            }();
        Services.AzureAuthenticationProviderFactory = AzureAuthenticationProviderFactory
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Common;
    (function(Common) {
        var JobCascade = function() {
                function JobCascade(jobHandler) {
                    this._headNode = new JobCascadeNode(jobHandler, jobHandler)
                }
                return JobCascade.prototype.then = function(jobHandler) {
                        return this._headNode.then(jobHandler)
                    }, JobCascade.prototype.executeCascade = function(input) {
                        return this._headNode.executeCascade(input)
                    }, JobCascade.createHead = function() {
                            return new JobCascade(function() {
                                    var result = {
                                            done: !1, continueResult: null, doneResult: null
                                        };
                                    return WinJS.Promise.wrap(result)
                                })
                        }, JobCascade.createContinueResult = function(continueResult) {
                            return {
                                    done: !1, continueResult: continueResult, doneResult: null
                                }
                        }, JobCascade.createDoneResult = function(doneResult) {
                            return {
                                    done: !0, continueResult: null, doneResult: doneResult
                                }
                        }, JobCascade
            }();
        Common.JobCascade = JobCascade;
        var JobCascadeNode = function() {
                function JobCascadeNode(jobHandler, headHandler) {
                    this._used = !1;
                    this._jobHandler = jobHandler;
                    this._headHandler = headHandler
                }
                return JobCascadeNode.prototype.executeCascade = function(input) {
                        return this._executeCascade(input).then(function(result) {
                                return WinJS.Promise.wrap(result.doneResult)
                            })
                    }, JobCascadeNode.prototype.then = function(jobHandler) {
                        var _this = this;
                        Contracts.check(!this._used);
                        this._used = !0;
                        var next = new JobCascadeNode(jobHandler, null);
                        return next._previousNodeJobHandler = function(input) {
                                return _this._executeCascade(input)
                            }, next
                    }, JobCascadeNode.prototype._invokeJobHandler = function(input, jobHandler) {
                            return WinJS.Promise.wrap().then(function() {
                                    return jobHandler(input)
                                })
                        }, JobCascadeNode.prototype._executeCascade = function(input) {
                            var _this = this;
                            return this._headHandler !== null ? this._invokeJobHandler(input, function(input) {
                                    return _this._headHandler(input)
                                }) : this._previousNodeJobHandler(input).then(function(parentResult) {
                                    if (parentResult.done) {
                                        var result = {
                                                done: !0, doneResult: parentResult.doneResult, continueResult: null
                                            };
                                        return WinJS.Promise.wrap(result)
                                    }
                                    else
                                        return _this._invokeJobHandler(parentResult.continueResult, function(input) {
                                                return _this._jobHandler(input)
                                            })
                                })
                        }, JobCascadeNode
            }()
    })(Common = AppMagic.Common || (AppMagic.Common = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var JobCascade = AppMagic.Common.JobCascade,
            ConnectResultCode;
        (function(ConnectResultCode) {
            ConnectResultCode[ConnectResultCode.Success = 0] = "Success";
            ConnectResultCode[ConnectResultCode.UnableToAccessNetwork = 1] = "UnableToAccessNetwork";
            ConnectResultCode[ConnectResultCode.FailedToGetTenantId = 2] = "FailedToGetTenantId";
            ConnectResultCode[ConnectResultCode.FailedToRegisterApplication = 3] = "FailedToRegisterApplication";
            ConnectResultCode[ConnectResultCode.FailedToAuthenticateAgainstSharePointResource = 4] = "FailedToAuthenticateAgainstSharePointResource";
            ConnectResultCode[ConnectResultCode.FailedToEnsureAuthentication = 5] = "FailedToEnsureAuthentication"
        })(ConnectResultCode || (ConnectResultCode = {}));
        var AzureConnectionManager = function() {
                function AzureConnectionManager(brokerManager, cookieManager, connectionStatusProvider, controller, parentNSCache, progressIndicatorViewModel, authoringToolAzureAppId) {
                    this._connectPromise = null;
                    this._brokerManager = brokerManager;
                    this._cookieManager = cookieManager;
                    this._connectionStatusProvider = connectionStatusProvider;
                    this._controller = controller;
                    this._parentNSCache = parentNSCache;
                    this._progressIndicatorViewModel = progressIndicatorViewModel;
                    this._authoringToolAzureAppId = authoringToolAzureAppId;
                    this._registrationRefreshTokenStore = new Services.OAuth2RefreshTokenStore(this._getNamespaceCache(AzureConnectionManager.nsCacheKey), {});
                    var providerFactory = new Services.AzureAuthenticationProviderFactory(brokerManager, connectionStatusProvider, controller);
                    this._providerFactory = providerFactory;
                    this._graphConnectionFactory = new Services.AzureGraphConnectionFactory;
                    this._createRegistrationBroker(providerFactory);
                    this._createTenantProvider(providerFactory);
                    this._createSharePointOnlineBroker(providerFactory);
                    this.clientAppInfo = null;
                    this._isUsingDefaultValues = !0;
                    this._connectCompletable = null
                }
                return Object.defineProperty(AzureConnectionManager.prototype, "azureRegistrationBroker", {
                        get: function() {
                            return this._azureRegistrationBroker
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(AzureConnectionManager.prototype, "azureTenantProvider", {
                        get: function() {
                            return this._azureTenantProvider
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(AzureConnectionManager.prototype, "cloudTableAccountProvider", {
                            get: function() {
                                return this._cloudTableAccountProvider
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(AzureConnectionManager.prototype, "sharePointOnlineBroker", {
                            get: function() {
                                return this._sharePointOnlineBroker
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(AzureConnectionManager.prototype, "isUsingDefaultValues", {
                            get: function() {
                                return this._isUsingDefaultValues
                            }, enumerable: !0, configurable: !0
                        }), AzureConnectionManager.prototype.connectAsync = function(connectToAuthoringApp) {
                            var _this = this;
                            var appInfo,
                                jobCascade = AppMagic.Common.JobCascade.createHead().then(function() {
                                    return _this._ensureInternetConnection()
                                }).then(function() {
                                    return _this.dispatchEvent(AzureConnectionManager.events.connectstart), _this._getTenantId()
                                }).then(function(tenantId) {
                                    return connectToAuthoringApp ? _this._registerAuthoringApplicationAsync(tenantId) : _this._registerPublishedApplicationAsync(tenantId)
                                }).then(function(clientAppInfo) {
                                    return appInfo = clientAppInfo, _this._discoverOfficeServicesAsync(clientAppInfo)
                                }).then(function(discoveredServices) {
                                    return _this._ensurePermissionPropagationToResourcesAsync(appInfo, discoveredServices)
                                }).then(function() {
                                    return _this._isUsingDefaultValues = connectToAuthoringApp, _this._storeDefaultClientAppInfo(appInfo)
                                }),
                                wizard = new AppMagic.Services.AzureConnectWizard;
                            wizard.attach(this);
                            var completable = Core.Promise.createCompletablePromise();
                            return this._connectCompletable = completable, this._connectPromise = jobCascade.executeCascade().then(function(connectResult) {
                                    return _this._completeConnectFlow(connectResult === 0, !1), connectResult !== 0 ? completable.complete({
                                            success: !1, message: AppMagic.Strings.RESTNetworkError, result: null
                                        }) : completable.complete({
                                            success: !0, message: null, result: appInfo
                                        }), WinJS.Promise.wrap()
                                }), completable.promise.then(null, function(error) {
                                        _this._connectPromise.cancel();
                                        _this._completeConnectFlow(!1, !0);
                                        throw error;
                                    })
                        }, AzureConnectionManager.prototype.cancelConnection = function() {
                            this._connectPromise.cancel();
                            var completable = this._connectCompletable;
                            this._completeConnectFlow(!1, !0);
                            completable.complete({
                                success: !1, message: "User canceled O365 connection.", result: null
                            })
                        }, AzureConnectionManager.prototype._completeConnectFlow = function(connectWasSuccessful, authWasCanceled) {
                            connectWasSuccessful || this.disconnect();
                            var eventInfo = {
                                    connectWasSuccessful: connectWasSuccessful, authWasCanceled: authWasCanceled
                                };
                            this.dispatchEvent(AzureConnectionManager.events.connectcomplete, eventInfo);
                            this._connectPromise = null;
                            this._connectCompletable = null
                        }, AzureConnectionManager.prototype._ensureInternetConnection = function() {
                            var internetConnectionStatus = this._connectionStatusProvider.getInternetConnectionStatus();
                            if (internetConnectionStatus !== 0) {
                                var failureResult = JobCascade.createDoneResult(1);
                                return WinJS.Promise.wrap(failureResult)
                            }
                            var successResult = JobCascade.createContinueResult(null);
                            return WinJS.Promise.wrap(successResult)
                        }, AzureConnectionManager.prototype._getTenantId = function() {
                            return this.azureTenantProvider.getAzureTenantIdAsync().then(function(tenantResult) {
                                    if (!tenantResult.success) {
                                        if (tenantResult.message === AppMagic.Strings.AuthenticationBrokerManagerErrorUserCanceled)
                                            throw AppMagic.Utility.createCanceledError();
                                        var failureResult = JobCascade.createDoneResult(2);
                                        return WinJS.Promise.wrap(failureResult)
                                    }
                                    var successResult = JobCascade.createContinueResult(tenantResult.result);
                                    return WinJS.Promise.wrap(successResult)
                                })
                        }, AzureConnectionManager.prototype.disconnect = function() {
                            this.clientAppInfo = null;
                            this._isUsingDefaultValues = !0;
                            this._azureRegistrationBroker.authProvider.store.clear(this._cookieManager);
                            this.azureTenantProvider.authProvider.store.clear(this._cookieManager);
                            this._registrationRefreshTokenStore.clear(this._cookieManager)
                        }, AzureConnectionManager.prototype.disconnectSharePointOnline = function() {
                            this._sharePointOnlineBroker.disconnect(this._cookieManager)
                        }, AzureConnectionManager.prototype.saveSessionAuthData = function(sessionAuthData) {
                            var svcAuthData = sessionAuthData[Services.AzureConstants.ServiceKeys.office365];
                            typeof svcAuthData == "undefined" && (svcAuthData = {
                                hasUserAuthenticatedState: !1, domains: []
                            }, sessionAuthData[Services.AzureConstants.ServiceKeys.office365] = svcAuthData);
                            svcAuthData.hasUserAuthenticatedState = svcAuthData.hasUserAuthenticatedState || this._azureRegistrationBroker.authProvider.store.isAuthenticated || this.azureTenantProvider.authProvider.store.isAuthenticated || this.clientAppInfo !== null;
                            this._azureRegistrationBroker.authProvider.store.domains && (svcAuthData.domains = svcAuthData.domains.concat(this._azureRegistrationBroker.authProvider.store.domains));
                            this.azureTenantProvider.authProvider.store.domains && (svcAuthData.domains = svcAuthData.domains.concat(this.azureTenantProvider.authProvider.store.domains));
                            this.sharePointOnlineBroker.saveSessionAuthData(sessionAuthData)
                        }, AzureConnectionManager.prototype.connectWithTemplateVariableValues = function(templateVariables) {
                            this._isUsingDefaultValues = !1;
                            var clientAppInfo = {};
                            clientAppInfo.clientId = templateVariables[Services.AzureConstants.TemplateVariableNames.Office365.clientId];
                            clientAppInfo.tenantId = templateVariables[Services.AzureConstants.TemplateVariableNames.Office365.tenantId];
                            clientAppInfo.redirectUri = templateVariables[Services.AzureConstants.TemplateVariableNames.Office365.redirectUri];
                            this.clientAppInfo = clientAppInfo
                        }, AzureConnectionManager.prototype._registerAuthoringApplicationAsync = function(tenantId) {
                            return this._azureRegistrationBroker.getOrRegisterAuthoringApplicationAsync(tenantId).then(function(registrationResult) {
                                    if (!registrationResult.success) {
                                        var failureResult = JobCascade.createDoneResult(3);
                                        return WinJS.Promise.wrap(failureResult)
                                    }
                                    var successResult = JobCascade.createContinueResult(registrationResult.result);
                                    return WinJS.Promise.wrap(successResult)
                                })
                        }, AzureConnectionManager.prototype._registerPublishedApplicationAsync = function(tenantId) {
                            return this._azureRegistrationBroker.registerPublishedAppAsync(tenantId).then(function(registrationResult) {
                                    if (!registrationResult.success) {
                                        var failureResult = JobCascade.createDoneResult(3);
                                        return WinJS.Promise.wrap(failureResult)
                                    }
                                    var successResult = JobCascade.createContinueResult(registrationResult.result);
                                    return WinJS.Promise.wrap(successResult)
                                })
                        }, AzureConnectionManager.prototype._storeDefaultClientAppInfo = function(clientAppInfo) {
                            this.clientAppInfo = clientAppInfo;
                            var successResult = JobCascade.createDoneResult(0);
                            return WinJS.Promise.wrap(successResult)
                        }, AzureConnectionManager.prototype._discoverOfficeServicesAsync = function(clientAppInfo) {
                            var _this = this;
                            var builder = new Services.BodilessHttpRequestBuilder;
                            builder.setMethod("GET");
                            builder.setBaseUrl(AzureConnectionManager.OfficeServicesDiscoveryUrl);
                            builder.addHeader("accept", "application/json");
                            var provider = this._providerFactory.createAuthenticationProvider(clientAppInfo.clientId, AzureConnectionManager.ResourceId_SharePoint, clientAppInfo.redirectUri, Services.AzureRegistrationBroker.authBaseUri, this._getNamespaceCache(AzureConnectionManager.DiscoveryNamespaceCacheKey), this._registrationRefreshTokenStore);
                            return provider.authenticateRequestAsync(builder, function(){}, function(){}).then(function(authResult) {
                                    if (!authResult.success) {
                                        var failureResult = JobCascade.createDoneResult(4);
                                        return WinJS.Promise.wrap(failureResult)
                                    }
                                    return builder.generateHttpRequestAsync().then(function(request) {
                                            var httpReqData = request.getRequestData(),
                                                body = httpReqData.data.map(function(datum) {
                                                    return datum.value
                                                });
                                            return _this._controller.sendHttp(httpReqData.url, httpReqData.method, httpReqData.headers, httpReqData.queryParameters, body)
                                        }).then(function(response) {
                                            if (!response.success) {
                                                var failureResult = JobCascade.createDoneResult(4);
                                                return WinJS.Promise.wrap(failureResult)
                                            }
                                            try {
                                                var responseData = JSON.parse(response.result.responseText)
                                            }
                                            catch(e) {
                                                return WinJS.Promise.wrap(JobCascade.createDoneResult(4))
                                            }
                                            var services = responseData.value;
                                            var successResult = JobCascade.createContinueResult(services);
                                            return WinJS.Promise.wrap(successResult)
                                        })
                                })
                        }, AzureConnectionManager.prototype._ensurePermissionPropagationToResourcesAsync = function(clientAppInfo, discoveredServices) {
                            var _this = this;
                            var allProvidersEnsured = !0,
                                promiseQueue = new Core.Promise.PromiseQueue;
                            discoveredServices.forEach(function(discoveredService) {
                                promiseQueue.pushJob(function() {
                                    return allProvidersEnsured ? _this._ensurePermissionPropagationToResourceAsync(clientAppInfo, discoveredService.ServiceResourceId, AzureConnectionManager.TimesToCheckPermissionPropagation).then(function(authIsEnsured) {
                                            return allProvidersEnsured = authIsEnsured, WinJS.Promise.wrap()
                                        }) : WinJS.Promise.wrap()
                                })
                            });
                            var promise = Core.Promise.createCompletablePromise();
                            return promiseQueue.pushJob(function() {
                                    if (allProvidersEnsured) {
                                        var successResult = JobCascade.createContinueResult(null);
                                        promise.complete(successResult)
                                    }
                                    else {
                                        var failureResult = JobCascade.createDoneResult(5);
                                        promise.complete(failureResult)
                                    }
                                    return WinJS.Promise.wrap()
                                }), promise.promise
                        }, AzureConnectionManager.prototype._checkIfPermissionHasPropagated = function(appInfo, serviceResourceId) {
                            var url = AppMagic.Services.AzureTenantProvider.authBaseUri + AppMagic.Services.AzureAuthenticationProviderFactory.authorizationPath + "?resource=" + AppMagic.Utility.fixedEncodeURIComponent(serviceResourceId) + "&client_id=" + appInfo.clientId + "&redirect_uri=" + AppMagic.Utility.fixedEncodeURIComponent(appInfo.redirectUri) + "&response_type=code";
                            return WinJS.xhr({
                                    type: "GET", url: url, headers: {}
                                }).then(function(response) {
                                    return WinJS.Promise.wrap({success: response.responseText.indexOf(AzureConnectionManager.ErrorCode_PermissionNotYetPropagated) < 0})
                                }, function(error) {
                                    return error.status === 0 ? WinJS.Promise.wrap({success: !0}) : WinJS.Promise.wrap({success: !1})
                                })
                        }, AzureConnectionManager.prototype._ensurePermissionPropagationToResourceAsync = function(appInfo, serviceResourceId, timesToTry) {
                            var _this = this;
                            return timesToTry === 0 ? WinJS.Promise.wrap(!1) : this._checkIfPermissionHasPropagated(appInfo, serviceResourceId).then(function(authResult) {
                                    return authResult.success ? WinJS.Promise.wrap(!0) : WinJS.Promise.timeout(AzureConnectionManager.CheckPermissionPropagationIntervalMilliseconds).then(function() {
                                            return _this._ensurePermissionPropagationToResourceAsync(appInfo, serviceResourceId, timesToTry - 1)
                                        })
                                })
                        }, AzureConnectionManager.prototype._createCloudTableAccountProvider = function(providerFactory) {
                            var provider = this._createAuthenticationProvider(providerFactory, Services.CloudTableAccountProvider.nsCacheKey, Services.CloudTableAccountProvider.resourceBaseUri, Services.CloudTableAccountProvider.authBaseUri);
                            this._cloudTableAccountProvider = new Services.CloudTableAccountProvider(this._brokerManager, this._controller, provider)
                        }, AzureConnectionManager.prototype._createRegistrationBroker = function(providerFactory) {
                            var provider = this._createAuthenticationProvider(providerFactory, Services.AzureRegistrationBroker.nsCacheKey, Services.AzureRegistrationBroker.resourceBaseUri, Services.AzureRegistrationBroker.authBaseUri);
                            this._azureRegistrationBroker = new Services.AzureRegistrationBroker(this._controller, provider, this._graphConnectionFactory)
                        }, AzureConnectionManager.prototype._createTenantProvider = function(providerFactory) {
                            var provider = this._createAuthenticationProvider(providerFactory, Services.AzureTenantProvider.nsCacheKey, Services.AzureTenantProvider.resourceBaseUri, Services.AzureTenantProvider.authBaseUri);
                            this._azureTenantProvider = new Services.AzureTenantProvider(provider, this._progressIndicatorViewModel)
                        }, AzureConnectionManager.prototype._createAuthenticationProvider = function(providerFactory, namespaceCacheKey, resourceBaseUri, authBaseUri) {
                            var nsCache = this._getNamespaceCache(namespaceCacheKey);
                            return providerFactory.createAuthenticationProvider(this._authoringToolAzureAppId(), resourceBaseUri, Services.AzureConstants.Graph.sienaRedirectUri, authBaseUri, nsCache, this._registrationRefreshTokenStore)
                        }, AzureConnectionManager.prototype._createSharePointOnlineBroker = function(providerFactory) {
                            var nsCache = this._getNamespaceCache(Services.SharePointOnlineBroker.nsCacheKey);
                            this._sharePointOnlineBroker = new Services.SharePointOnlineBroker(nsCache, this._controller, providerFactory)
                        }, AzureConnectionManager.prototype._getNamespaceCache = function(nsCacheKey) {
                            var nsCache = this._parentNSCache.getNamespaceCache(nsCacheKey);
                            return nsCache === null && (nsCache = this._parentNSCache.createNamespaceCache(nsCacheKey)), nsCache
                        }, AzureConnectionManager.nsCacheKey = "AzureConnectionManagerRefreshStore~{BA695B64-1935-4A59-B208-F8E5797297AE}", AzureConnectionManager.TimesToCheckPermissionPropagation = 15, AzureConnectionManager.CheckPermissionPropagationIntervalMilliseconds = 3e3, AzureConnectionManager.ErrorCode_PermissionNotYetPropagated = "AADSTS70001", AzureConnectionManager.OfficeServicesDiscoveryUrl = "https://api.office.com/discovery/me/services", AzureConnectionManager.ResourceId_SharePoint = "Microsoft.SharePoint", AzureConnectionManager.DiscoveryNamespaceCacheKey = "discovery", AzureConnectionManager.events = {
                            connectstart: "connectstart", connectcomplete: "connectcomplete"
                        }, AzureConnectionManager
            }();
        Services.AzureConnectionManager = AzureConnectionManager;
        WinJS.Class.mix(AzureConnectionManager, WinJS.Utilities.eventMixin)
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AzureConnectWizard = function() {
                function AzureConnectWizard(shellViewModel) {
                    this._azureConnectionManager = null;
                    this._eventTracker = null;
                    this._connectStarted = !1;
                    this._isCancelled = !1;
                    this._shellViewModel = shellViewModel || AppMagic.context.shellViewModel
                }
                return AzureConnectWizard.prototype.attach = function(azureConnectionManager) {
                        this._azureConnectionManager = azureConnectionManager;
                        this._eventTracker = new AppMagic.Utility.EventTracker;
                        this._eventTracker.add(azureConnectionManager, Services.AzureConnectionManager.events.connectstart, this._onConnectStart, this);
                        this._eventTracker.add(azureConnectionManager, Services.AzureConnectionManager.events.connectcomplete, this._onConnectComplete, this)
                    }, AzureConnectWizard.prototype._detachFromManager = function() {
                        this._eventTracker.dispose();
                        this._eventTracker = null;
                        this._azureConnectionManager = null;
                        this._connectStarted = !1
                    }, AzureConnectWizard.prototype._onConnectStart = function() {
                            var _this = this,
                                waitDialogOptions = {
                                    descriptionText: AppMagic.AuthoringStrings.AzureConnectDialogDescription, showCancelButton: !0, cancelHandler: function() {
                                            _this._onCancelConnect()
                                        }
                                };
                            this._connectStarted = !0;
                            this._shellViewModel.wait.startAsync(AppMagic.AuthoringStrings.AzureConnectDialogTitle, waitDialogOptions);
                            this._logAuthenticationTelemetry("Start")
                        }, AzureConnectWizard.prototype._onConnectComplete = function(evt) {
                            this._connectStarted && this._shellViewModel.wait.stop();
                            var completionInfo = evt.detail,
                                authWasCanceled = completionInfo.authWasCanceled;
                            if (authWasCanceled)
                                this._logAuthenticationTelemetry("Cancel");
                            else {
                                var connectWasSuccessful = completionInfo.connectWasSuccessful;
                                if (connectWasSuccessful)
                                    AppMagic.AuthoringTool.PlatformHelpers.showNotification(AppMagic.AuthoringStrings.AzureConnectCompleteDialogTitle, AppMagic.AuthoringStrings.AzureConnectCompleteDialogDescription),
                                    this._logAuthenticationTelemetry("Success");
                                else {
                                    var md = new AppMagic.Popups.MessageDialog(AppMagic.AuthoringStrings.AzureConnectErrorDialogDescription, AppMagic.AuthoringStrings.AzureConnectErrorDialogTitle);
                                    md.showAsync();
                                    this._logAuthenticationTelemetry("Failure")
                                }
                            }
                            this._detachFromManager()
                        }, AzureConnectWizard.prototype._onCancelConnect = function() {
                            this._isCancelled = !0;
                            this._azureConnectionManager.cancelConnection();
                            this._logAuthenticationTelemetry("WaitDialogCancel")
                        }, AzureConnectWizard.prototype._logAuthenticationTelemetry = function(eventPath) {
                            Microsoft.AppMagic.Common.TelemetrySession.telemetry.logServiceAuthentication("Azure", eventPath)
                        }, AzureConnectWizard
            }();
        Services.AzureConnectWizard = AzureConnectWizard
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AzureConstants;
        (function(AzureConstants) {
            var DefaultAppRegistrationProperties;
            (function(DefaultAppRegistrationProperties) {
                DefaultAppRegistrationProperties.appName = "Siena Connector ";
                DefaultAppRegistrationProperties.redirectUri = "https://www.azure.com/siena/connector/"
            })(DefaultAppRegistrationProperties = AzureConstants.DefaultAppRegistrationProperties || (AzureConstants.DefaultAppRegistrationProperties = {}));
            var TemplateVariableNames;
            (function(TemplateVariableNames) {
                var Office365;
                (function(Office365) {
                    Office365.clientId = "O365_ClientId";
                    Office365.redirectUri = "O365_CallbackUrl";
                    Office365.tenantId = "O365_TenantId"
                })(Office365 = TemplateVariableNames.Office365 || (TemplateVariableNames.Office365 = {}))
            })(TemplateVariableNames = AzureConstants.TemplateVariableNames || (AzureConstants.TemplateVariableNames = {}));
            var ConnectorIds;
            (function(ConnectorIds) {
                ConnectorIds.office365 = "e22a66d0-3fe7-4f00-8128-9657319bf140"
            })(ConnectorIds = AzureConstants.ConnectorIds || (AzureConstants.ConnectorIds = {}));
            var ConnectorVersions;
            (function(ConnectorVersions) {
                ConnectorVersions.office365 = "2.8"
            })(ConnectorVersions = AzureConstants.ConnectorVersions || (AzureConstants.ConnectorVersions = {}));
            var AuthenticationProviderIds;
            (function(AuthenticationProviderIds) {
                AuthenticationProviderIds.office365 = "o365auth";
                AuthenticationProviderIds.adGraph = "adgraphauth"
            })(AuthenticationProviderIds = AzureConstants.AuthenticationProviderIds || (AzureConstants.AuthenticationProviderIds = {}));
            var ServiceKeys;
            (function(ServiceKeys) {
                ServiceKeys.office365 = "Office365";
                ServiceKeys.sharePointOnline = "SharePoint Online"
            })(ServiceKeys = AzureConstants.ServiceKeys || (AzureConstants.ServiceKeys = {}));
            var Graph;
            (function(Graph) {
                Graph.sienaRedirectUri = "https://www.microsoft.com/en-us/projectsiena";
                Graph.sienaSidRedirectUri = "ms-app://s-1-15-2-2599833754-97093394-413759048-3418707023-3323368304-1435866999-263615825/";
                Graph.logOutUri = "https://login.windows.net/common/oauth2/logout";
                Graph.apiVersionQueryString = "api-version=1.42-previewInternal";
                Graph.clientAppTag_AuthoringAppGuid = "AuthoringClientAppTag_219ca4fd-f326-464b-8375-8c86b8ec6408";
                Graph.clientAppTag_AuthoringAppVersion = "version:0.0.0";
                Graph.clientAppTag_PublishedAppGuid = "PublishedClientAppTag_4f04c6a9-82ff-485b-8695-48d990c30348";
                Graph.clientAppTag_PublishedAppVersion = "version:0.0.0";
                Graph.amrValuesQueryString = "amr_values=pwd";
                var Routes;
                (function(Routes) {
                    Routes.applications = "/applications";
                    Routes.servicePrincipals = "/servicePrincipals";
                    Routes.permissions = "/permissions"
                })(Routes = Graph.Routes || (Graph.Routes = {}));
                var Permissions;
                (function(Permissions) {
                    var ConsentTypes;
                    (function(ConsentTypes) {
                        ConsentTypes.allPrincipals = "AllPrincipals"
                    })(ConsentTypes = Permissions.ConsentTypes || (Permissions.ConsentTypes = {}))
                })(Permissions = Graph.Permissions || (Graph.Permissions = {}));
                var ParameterNames;
                (function(ParameterNames) {
                    ParameterNames.postLogoutRedirectUri = "post_logout_redirect_uri"
                })(ParameterNames = Graph.ParameterNames || (Graph.ParameterNames = {}))
            })(Graph = AzureConstants.Graph || (AzureConstants.Graph = {}));
            AzureConstants.nsCacheKey = "SienaAzure"
        })(AzureConstants = Services.AzureConstants || (Services.AzureConstants = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AzureGraphConnection = function() {
                function AzureGraphConnection(token, resourceUri) {
                    this._createDataContext(token, resourceUri)
                }
                return AzureGraphConnection.prototype.addApplicationAsync = function(name, redirectUri) {
                        var app = new AadGraph.Application(this.context);
                        return app.availableToOtherTenants = !1, app.displayName = name, app.homepage = redirectUri, app.publicClient = !0, app._replyUrls.push(redirectUri), app._replyUrls.push(Services.AzureConstants.Graph.sienaSidRedirectUri), app._replyUrlsChanged = !0, this._addGraphResourceAccess(app), this._addExchangeResourceAccess(app), this._addSharePointResourceAccessAsync(app), this._addGraphObjectAsync(app, Services.AzureConstants.Graph.Routes.applications).then(null, function(error) {
                                    if (Core.Utility.isCanceledError(error))
                                        throw error;
                                    return WinJS.Promise.wrap(null)
                                })
                    }, AzureGraphConnection.prototype.addServicePrincipalAsync = function(appId, appName, isAuthoringApp) {
                        var sp = new AadGraph.ServicePrincipal(this.context);
                        return sp.accountEnabled = !0, sp.displayName = appName, sp.appId = appId, isAuthoringApp ? (sp._tags.push(Services.AzureConstants.Graph.clientAppTag_AuthoringAppGuid), sp._tags.push(Services.AzureConstants.Graph.clientAppTag_AuthoringAppVersion)) : (sp._tags.push(Services.AzureConstants.Graph.clientAppTag_PublishedAppGuid), sp._tags.push(Services.AzureConstants.Graph.clientAppTag_PublishedAppVersion)), sp._tagsChanged = !0, this._addGraphObjectAsync(sp, Services.AzureConstants.Graph.Routes.servicePrincipals)
                    }, AzureGraphConnection.prototype.getServicePrincipalAsync = function(appId) {
                            var servicePrincipalsUri = this.context.serviceRootUri + Services.AzureConstants.Graph.Routes.servicePrincipals,
                                query = new AadGraph.Extensions.CollectionQuery(this.context, servicePrincipalsUri, function(dataContext, data) {
                                    return data.value
                                });
                            query.filter(Core.Utility.formatString(AzureGraphConnection.appIdFilterFormat, appId));
                            var completablePromise = Core.Promise.createCompletablePromise();
                            return query.fetchAll(AzureGraphConnection.pageSize).then(function(results) {
                                    results.length === 0 && completablePromise.complete(null);
                                    results.length > 1 && completablePromise.complete(null);
                                    var graphSp = results[0];
                                    completablePromise.complete(graphSp)
                                }, function(error) {
                                    completablePromise.complete(null)
                                }), completablePromise.promise
                        }, AzureGraphConnection.prototype._addGraphResourceAccess = function(app) {
                            var graphResourceAccess = this._generateRequiredResourceAccess(AzureGraphConnection.graphResourceAppId, AzureGraphConnection.graphPermissionIds);
                            app.requiredResourceAccess.push(graphResourceAccess)
                        }, AzureGraphConnection.prototype._addExchangeResourceAccess = function(app) {
                            var exchangeResourceAccess = this._generateRequiredResourceAccess(AzureGraphConnection.exchangeResourceAppId, AzureGraphConnection.exchangePermissionIds);
                            app.requiredResourceAccess.push(exchangeResourceAccess)
                        }, AzureGraphConnection.prototype._addSharePointResourceAccessAsync = function(app) {
                            var sharePointResourceAccess = this._generateRequiredResourceAccess(AzureGraphConnection.sharepointResourceAppId, AzureGraphConnection.sharePointPermissionIds);
                            app.requiredResourceAccess.push(sharePointResourceAccess)
                        }, AzureGraphConnection.prototype._generateRequiredResourceAccess = function(resourceAppId, permissionIds) {
                            var requiredResourceAccess = new AadGraph.RequiredResourceAccess;
                            return requiredResourceAccess.resourceAppId = resourceAppId, permissionIds.forEach(function(permissionId) {
                                    var requiredAppPermission = new AadGraph.RequiredAppPermission;
                                    requiredAppPermission.permissionId = permissionId;
                                    requiredAppPermission.directAccessGrant = !1;
                                    requiredAppPermission.impersonationAccessGrants.push("User");
                                    requiredAppPermission._impersonationAccessGrantsChanged = !0;
                                    requiredResourceAccess.requiredAppPermissions.push(requiredAppPermission)
                                }), requiredResourceAccess._requiredAppPermissionsChanged = !0, requiredResourceAccess
                        }, AzureGraphConnection.prototype.getAuthoringServicePrincipal = function() {
                            var requestUri = this.context.serviceRootUri + Services.AzureConstants.Graph.Routes.servicePrincipals + Core.Utility.formatString("?$filter=tags/any(p: p eq '{0}')", Services.AzureConstants.Graph.clientAppTag_AuthoringAppGuid),
                                request = new AadGraph.Extensions.Request(requestUri);
                            request.method = "GET";
                            var completablePromise = Core.Promise.createCompletablePromise();
                            return this.context.request(request).then(function(response) {
                                    Contracts.checkString(response);
                                    var odataResponse = JSON.parse(response);
                                    Contracts.checkArray(odataResponse.value);
                                    var servicePrincipalDescriptions = odataResponse.value;
                                    servicePrincipalDescriptions.length ? completablePromise.complete({
                                        resultCode: 0, servicePrincipalDescription: servicePrincipalDescriptions[0]
                                    }) : completablePromise.complete({
                                        resultCode: 1, servicePrincipalDescription: null
                                    })
                                }, function() {
                                    completablePromise.complete({
                                        resultCode: 2, servicePrincipalDescription: null
                                    })
                                }), completablePromise.promise
                        }, AzureGraphConnection.prototype._addGraphObjectAsync = function(obj, path) {
                            var requestUri = this.context.serviceRootUri + path,
                                request = new AadGraph.Extensions.Request(requestUri);
                            request.data = obj.getRequestBody();
                            request.method = Services.Constants.OAuth2.Methods.POST;
                            var completablePromise = Core.Promise.createCompletablePromise();
                            return this.context.request(request).then(function(responseJson) {
                                    try {
                                        var response = JSON.parse(responseJson)
                                    }
                                    catch(parseError) {
                                        completablePromise.complete(null);
                                        return
                                    }
                                    completablePromise.complete(response);
                                    return
                                }, function(error) {
                                    completablePromise.complete(null);
                                    return
                                }), completablePromise.promise
                        }, AzureGraphConnection.prototype._createDataContext = function(token, resourceUri) {
                            var queryParamString = Services.AzureConstants.Graph.apiVersionQueryString,
                                context = new AadGraph.Extensions.DataContext(resourceUri, queryParamString, function() {
                                    return WinJS.Promise.wrap(token)
                                });
                            context.disableCache = !1;
                            context.disableCacheOverride = !0;
                            this.context = context
                        }, AzureGraphConnection.appIdFilterFormat = "appId eq guid'{0}'", AzureGraphConnection.graphResourceAppId = "00000002-0000-0000-c000-000000000000", AzureGraphConnection.exchangeResourceAppId = "00000002-0000-0ff1-ce00-000000000000", AzureGraphConnection.sharepointResourceAppId = "00000003-0000-0ff1-ce00-000000000000", AzureGraphConnection.graphPermissionIds = ["a42657d6-7f20-40e3-b6f0-cee03008a62a"], AzureGraphConnection.exchangePermissionIds = ["75767999-c7a8-481e-a6b4-19458e0b30a5", "5eb43c10-865a-4259-960a-83946678f8dd", "765f423e-b55d-412e-97e3-13a800c3a537", "32253599-e142-4cf0-810d-4827eedd1cfa", ], AzureGraphConnection.sharePointPermissionIds = ["640ddd16-e5b7-4d71-9690-3f4022699ee7"], AzureGraphConnection.pageSize = 999, AzureGraphConnection.maxRetrievalAttempts = 15, AzureGraphConnection
            }();
        Services.AzureGraphConnection = AzureGraphConnection
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AzureGraphConnectionFactory = function() {
                function AzureGraphConnectionFactory(){}
                return AzureGraphConnectionFactory.prototype.createAzureGraphConnection = function(token, resourceUri) {
                        return new Services.AzureGraphConnection(token, resourceUri)
                    }, AzureGraphConnectionFactory
            }();
        Services.AzureGraphConnectionFactory = AzureGraphConnectionFactory
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AzureRegistrationBroker = function() {
                function AzureRegistrationBroker(controller, provider, graphConnectionFactory) {
                    this._controller = controller;
                    this._authProvider = provider;
                    this._graphConnectionFactory = graphConnectionFactory
                }
                return Object.defineProperty(AzureRegistrationBroker.prototype, "authProvider", {
                        get: function() {
                            return this._authProvider
                        }, enumerable: !0, configurable: !0
                    }), AzureRegistrationBroker.prototype.registerPublishedAppAsync = function(tenantId) {
                        var _this = this;
                        var appInfo = this._createAppInfoStub(tenantId);
                        return this._authProvider.authenticateAsync(function(){}, function(){}).then(function() {
                                var graphConnection = _this._createGraphConnection(_this._authProvider.store.token, AzureRegistrationBroker.resourceBaseUri + tenantId);
                                return _this._registerApplication(graphConnection, appInfo.redirectUri, !1)
                            }).then(function(appServicePrincipal) {
                                if (appServicePrincipal === null) {
                                    var result = {
                                            success: !1, result: null, message: AppMagic.AuthoringStrings.AzureConnectUnableToCreateServicePrincipal
                                        };
                                    return WinJS.Promise.wrap(result)
                                }
                                return _this._validateAppInfoAsync(appInfo, appServicePrincipal)
                            })
                    }, AzureRegistrationBroker.prototype.getOrRegisterAuthoringApplicationAsync = function(tenantId) {
                            var _this = this;
                            var appInfo = this._createAppInfoStub(tenantId);
                            return this._authProvider.authenticateAsync(function(){}, function(){}).then(function() {
                                    var graphConnection = _this._createGraphConnection(_this._authProvider.store.token, AzureRegistrationBroker.resourceBaseUri + tenantId);
                                    return _this._getOrCreateAuthoringServicePrincipal(appInfo, graphConnection)
                                }).then(function(appServicePrincipal) {
                                    if (appServicePrincipal === null) {
                                        var result = {
                                                success: !1, result: null, message: AppMagic.AuthoringStrings.AzureConnectUnableToCreateOrRetrieveAuthoringServicePrincipal
                                            };
                                        return WinJS.Promise.wrap(result)
                                    }
                                    return _this._validateAppInfoAsync(appInfo, appServicePrincipal)
                                })
                        }, AzureRegistrationBroker.prototype._createAppInfoStub = function(tenantId) {
                            var appInfo = {};
                            return appInfo.redirectUri = Services.AzureConstants.DefaultAppRegistrationProperties.redirectUri, appInfo.tenantId = tenantId, appInfo
                        }, AzureRegistrationBroker.prototype._registerApplication = function(graphConnection, redirectUri, isAuthoringApp) {
                            return graphConnection.addApplicationAsync(Services.AzureConstants.DefaultAppRegistrationProperties.appName, redirectUri).then(function(app) {
                                    return app === null ? WinJS.Promise.wrap(null) : graphConnection.addServicePrincipalAsync(app.appId, app.displayName, isAuthoringApp)
                                })
                        }, AzureRegistrationBroker.prototype._createGraphConnection = function(token, resourceUri) {
                            if (!AppMagic.Utility.validateUri(resourceUri))
                                throw{success: !1};
                            return this._graphConnectionFactory.createAzureGraphConnection(token, resourceUri)
                        }, AzureRegistrationBroker.prototype._getOrCreateAuthoringServicePrincipal = function(appInfo, graphConnection) {
                            var _this = this;
                            return graphConnection.getAuthoringServicePrincipal().then(function(getResult) {
                                    return getResult.resultCode === 2 ? WinJS.Promise.wrap(null) : getResult.resultCode === 1 ? _this._registerApplication(graphConnection, appInfo.redirectUri, !0) : WinJS.Promise.wrap(getResult.servicePrincipalDescription)
                                })
                        }, AzureRegistrationBroker.prototype._validateAppInfoAsync = function(appInfo, appServicePrincipal) {
                            return appInfo.clientId = appServicePrincipal.appId, WinJS.Promise.wrap({
                                    success: !0, result: appInfo
                                })
                        }, AzureRegistrationBroker.nsCacheKey = "AzureRegistration~{ACBB7AF4-0C4A-417C-BDDD-3D0D25B5B839}", AzureRegistrationBroker.resourceBaseUri = "https://graph.windows.net/", AzureRegistrationBroker.authBaseUri = "https://login.windows.net/common/", AzureRegistrationBroker.idTokenVariableName = "idToken", AzureRegistrationBroker.idTokenVariableJsonPointer = "/id_token", AzureRegistrationBroker
            }();
        Services.AzureRegistrationBroker = AzureRegistrationBroker
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AzureTable = function() {
                function AzureTable(tableName, accountName, baseUri, keyBase64, accountResource, channelFactory, dateProvider, guidGenerator) {
                    this._tableName = tableName;
                    this._baseUri = baseUri;
                    var channelFactory = channelFactory || new Services.DefaultChannelFactory,
                        dateProvider = dateProvider || new AppMagic.Common.DefaultDateProvider,
                        guidGenerator = guidGenerator || new AppMagic.Common.DefaultGuidGenerator;
                    this._azureChannelCreator = new Services.AzureTableChannelCreator(accountName, baseUri, keyBase64, accountResource, channelFactory, dateProvider, guidGenerator)
                }
                return AzureTable.isPreconditionNotMet = function(odataErrorCode) {
                        return odataErrorCode === AzureTable.ODataErrorCode_ConditionNotMet || odataErrorCode === AzureTable.ODataErrorCode_UpdateConditionNotSatisfied
                    }, AzureTable.prototype.updateEntity = function(partitionKey, rowKey, jsonPayload, headerIfMatch) {
                        var channel = this._azureChannelCreator.createEntityChannel(this._tableName, partitionKey, rowKey, !1),
                            content = JSON.stringify(jsonPayload);
                        return channel.header(AzureTable.HeaderName_ContentLength, content.length.toString()), channel.header(AzureTable.HeaderName_IfMatch, headerIfMatch), channel.send("PUT", content).then(AzureTable._processSuccessfulUpdateEntity, function(error) {
                                    try {
                                        if (error.status === AzureTable.HttpResponseCode_412_PreconditionFailed) {
                                            var odataError = JSON.parse(error.responseText)["odata.error"].code,
                                                conditionNotMet = AzureTable.isPreconditionNotMet(odataError);
                                            if (conditionNotMet)
                                                return WinJS.Promise.wrap({
                                                        resultCode: 1, entityEtag: null
                                                    })
                                        }
                                    }
                                    catch(e) {}
                                    return WinJS.Promise.wrap({
                                            resultCode: 3, entityEtag: null
                                        })
                                })
                    }, AzureTable.prototype.deleteEntity = function(partitionKey, rowKey, headerIfMatch) {
                            var channel = this._azureChannelCreator.createEntityChannel(this._tableName, partitionKey, rowKey, !0);
                            return channel.header(AzureTable.HeaderName_IfMatch, headerIfMatch), channel.send("DELETE", null).then(function(response) {
                                    return WinJS.Promise.wrap()
                                }, function() {
                                    return WinJS.Promise.wrap()
                                })
                        }, AzureTable.prototype.insertOrReplaceEntity = function(partitionKey, rowKey, jsonPayload) {
                            var channel = this._azureChannelCreator.createEntityChannel(this._tableName, partitionKey, rowKey, !1),
                                content = JSON.stringify(jsonPayload);
                            return channel.header(AzureTable.HeaderName_ContentLength, content.length.toString()), channel.send("PUT", content).then(AzureTable._processSuccessfulUpdateEntity, function(error) {
                                    return WinJS.Promise.wrap({
                                            resultCode: 3, entityEtag: null
                                        })
                                })
                        }, AzureTable.prototype.queryEntities = function(filterString) {
                            var channel = this._azureChannelCreator.createTableChannel(this._tableName);
                            return typeof filterString == "string" && channel.param("$filter", filterString), channel.send("GET", null).then(AzureTable._processQueryEntities, function() {
                                    return WinJS.Promise.wrap({
                                            resultCode: 2, entities: null
                                        })
                                })
                        }, AzureTable.prototype.createTable = function() {
                            var channel = this._azureChannelCreator.createTablesChannel(!1),
                                content = JSON.stringify({TableName: this._tableName});
                            return channel.header(AzureTable.HeaderName_ContentLength, content.length.toString()), channel.send("POST", content).then(function(response) {
                                    return WinJS.Promise.wrap(0)
                                }, function(error) {
                                    try {
                                        var tableAlreadyExists = JSON.parse(error.responseText)["odata.error"].code === AzureTable.ODataErrorCode_TableAlreadyExists;
                                        if (tableAlreadyExists)
                                            return WinJS.Promise.wrap(4)
                                    }
                                    catch(e) {}
                                    return WinJS.Promise.wrap(2)
                                })
                        }, AzureTable.prototype.deleteTable = function() {
                            var channel = this._azureChannelCreator.createSelectedTableChannel(this._tableName);
                            return channel.send("DELETE", null).then(function() {
                                    return WinJS.Promise.wrap(0)
                                }, function() {
                                    return WinJS.Promise.wrap(2)
                                })
                        }, AzureTable.prototype.executeBatch = function(batchOperation) {
                            var tableBatchOperator = new Services.TableBatchOperator(this._baseUri, this._tableName, this._azureChannelCreator);
                            return tableBatchOperator.executeBatch(batchOperation)
                        }, AzureTable._processSuccessfulUpdateEntity = function(response) {
                            var etag = response.getResponseHeader(AzureTable.HttpHeaderName_Etag),
                                result;
                            return result = etag === "" || etag === null ? {
                                    resultCode: 2, entityEtag: null
                                } : {
                                    resultCode: 0, entityEtag: etag
                                }, WinJS.Promise.wrap(result)
                        }, AzureTable._processQueryEntities = function(response) {
                            try {
                                var jsonData = JSON.parse(response.responseText);
                                Contracts.checkArray(jsonData.value);
                                var entities = jsonData.value;
                                return Contracts.check(entities.length >= 1), entities.forEach(function(entity) {
                                        Contracts.checkString(entity[AzureTable.EntityPropertyName_PartitionKey]);
                                        Contracts.checkString(entity[AzureTable.EntityPropertyName_RowKey])
                                    }), WinJS.Promise.wrap({
                                            resultCode: 0, entities: entities
                                        })
                            }
                            catch(e) {
                                return WinJS.Promise.wrap({
                                        resultCode: 5, entities: null
                                    })
                            }
                            return WinJS.Promise.wrap({
                                    resultCode: 2, entities: null
                                })
                        }, AzureTable.EntityPropertyName_PartitionKey = "PartitionKey", AzureTable.EntityPropertyName_RowKey = "RowKey", AzureTable.HeaderName_ContentLength = "Content-Length", AzureTable.HeaderName_IfMatch = "If-Match", AzureTable.HeaderBoundary = "\r\n\r\n", AzureTable.HeaderValue_XMsVersion_2013_08_15 = "2013-08-15", AzureTable.HttpHeaderName_Etag = "ETag", AzureTable.HttpResponseCode_412_PreconditionFailed = 412, AzureTable.ODataErrorCode_ConditionNotMet = "ConditionNotMet", AzureTable.ODataErrorCode_TableAlreadyExists = "TableAlreadyExists", AzureTable.ODataErrorCode_UpdateConditionNotSatisfied = "UpdateConditionNotSatisfied", AzureTable
            }();
        Services.AzureTable = AzureTable
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AzureTableBatchBoundaryGenerator = function() {
                function AzureTableBatchBoundaryGenerator(guidGenerator) {
                    this._guidGenerator = guidGenerator
                }
                return AzureTableBatchBoundaryGenerator.prototype.generateBoundary = function() {
                        return "batch_" + this._guidGenerator.generateGuid()
                    }, AzureTableBatchBoundaryGenerator
            }();
        Services.AzureTableBatchBoundaryGenerator = AzureTableBatchBoundaryGenerator
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AzureTableChangesetBoundaryGenerator = function() {
                function AzureTableChangesetBoundaryGenerator(guidGenerator) {
                    this._guidGenerator = guidGenerator
                }
                return AzureTableChangesetBoundaryGenerator.prototype.generateBoundary = function() {
                        return "changeset_" + this._guidGenerator.generateGuid()
                    }, AzureTableChangesetBoundaryGenerator
            }();
        Services.AzureTableChangesetBoundaryGenerator = AzureTableChangesetBoundaryGenerator
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AzureTableChannelCreator = function() {
                function AzureTableChannelCreator(accountName, baseUri, keyBase64, accountResource, channelFactory, dateProvider, guidGenerator) {
                    this._accountName = accountName;
                    this._baseUri = baseUri;
                    this._keyBase64 = keyBase64;
                    this._accountResource = accountResource;
                    this._channelFactory = channelFactory || new Services.DefaultChannelFactory;
                    this._dateProvider = dateProvider || new AppMagic.Common.DefaultDateProvider;
                    this._guidGenerator = guidGenerator || new AppMagic.Common.DefaultGuidGenerator
                }
                return AzureTableChannelCreator.prototype.createEntityChannel = function(tableName, partitionKey, rowKey, omitContentTypeHeader) {
                        var entityResource = this._getEntityResourceRelativeUrl(tableName, partitionKey, rowKey),
                            channel = this._channelFactory.createChannel(this._baseUri + entityResource);
                        return this._applyCommonRequestHeaders(channel, entityResource, omitContentTypeHeader), channel
                    }, AzureTableChannelCreator.prototype.createTableChannel = function(tableName) {
                        var tableResource = this.getTableResourceRelativeUrl(tableName) + "()",
                            channel = this._channelFactory.createChannel(this._baseUri + tableResource);
                        return this._applyCommonRequestHeaders(channel, tableResource, !0), channel
                    }, AzureTableChannelCreator.prototype.createTablesChannel = function(omitContentTypeHeader) {
                            var tablesResource = this._accountResource + "/" + AzureTableChannelCreator.TableName_Tables,
                                channel = this._channelFactory.createChannel(this._baseUri + tablesResource);
                            return this._applyCommonRequestHeaders(channel, tablesResource, omitContentTypeHeader), channel
                        }, AzureTableChannelCreator.prototype.createSelectedTableChannel = function(tableName) {
                            var tableResource = Core.Utility.formatString("{0}/{1}('{2}')", this._accountResource, AzureTableChannelCreator.TableName_Tables, tableName),
                                channel = this._channelFactory.createChannel(this._baseUri + tableResource);
                            return this._applyCommonRequestHeaders(channel, tableResource, !0), channel
                        }, AzureTableChannelCreator.prototype.createBatchChannel = function(tableName) {
                            var batchResource = this._accountResource + "/$batch",
                                channel = this._channelFactory.createChannel(this._baseUri + batchResource);
                            return this._applyDateAndAuthorizationHeaders(channel, batchResource), channel
                        }, AzureTableChannelCreator.prototype.getTableResourceRelativeUrl = function(tableName) {
                            return this._accountResource + "/" + tableName
                        }, AzureTableChannelCreator.prototype._getEntityResourceRelativeUrl = function(tableName, partitionKey, rowKey) {
                            var tableResource = this.getTableResourceRelativeUrl(tableName);
                            return tableResource + Core.Utility.formatString("({0}='{1}',{2}='{3}')", AzureTableChannelCreator.EntityPropertyName_PartitionKey, encodeURIComponent(partitionKey), AzureTableChannelCreator.EntityPropertyName_RowKey, encodeURIComponent(rowKey))
                        }, AzureTableChannelCreator.prototype._applyCommonRequestHeaders = function(channel, resource, omitContentTypeHeader) {
                            this._applyDateAndAuthorizationHeaders(channel, resource);
                            channel.header(AzureTableChannelCreator.HeaderName_XMsVersion, AzureTableChannelCreator.HeaderValue_XMsVersion_2013_08_15);
                            channel.header(AzureTableChannelCreator.HeaderName_Accept, "application/json;odata=fullmetadata");
                            omitContentTypeHeader || channel.header(AzureTableChannelCreator.HeaderName_ContentType, "application/json")
                        }, AzureTableChannelCreator.prototype._getTextToSign = function(date, resource) {
                            return date + "\n" + "/" + this._accountName + resource
                        }, AzureTableChannelCreator.prototype._applyDateAndAuthorizationHeaders = function(channel, resource) {
                            var date = this._dateProvider.toUTCString(),
                                textToSign = this._getTextToSign(date, resource),
                                signature = CryptoJS.HmacSHA256(textToSign, CryptoJS.enc.Base64.parse(this._keyBase64)).toString(CryptoJS.enc.Base64);
                            channel.header(AzureTableChannelCreator.HeaderName_Authorization, "SharedKeyLite " + this._accountName + ":" + signature);
                            channel.header(AzureTableChannelCreator.HeaderName_XMsDate, date)
                        }, AzureTableChannelCreator.TableName_Tables = "Tables", AzureTableChannelCreator.EntityPropertyName_PartitionKey = "PartitionKey", AzureTableChannelCreator.EntityPropertyName_RowKey = "RowKey", AzureTableChannelCreator.HeaderName_Authorization = "Authorization", AzureTableChannelCreator.HeaderName_XMsDate = "x-ms-date", AzureTableChannelCreator.HeaderName_XMsVersion = "x-ms-version", AzureTableChannelCreator.HeaderName_Accept = "Accept", AzureTableChannelCreator.HeaderName_ContentType = "Content-Type", AzureTableChannelCreator.HeaderValue_XMsVersion_2013_08_15 = "2013-08-15", AzureTableChannelCreator
            }();
        Services.AzureTableChannelCreator = AzureTableChannelCreator
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AzureTableClient = function() {
                function AzureTableClient(accountName, baseUri, keyBase64, accountResource, channelFactory, dateProvider, guidGenerator) {
                    this._accountName = accountName;
                    this._baseUri = baseUri;
                    this._keyBase64 = keyBase64;
                    this._accountResource = accountResource;
                    this._channelFactory = channelFactory || new Services.DefaultChannelFactory;
                    this._dateProvider = dateProvider || new AppMagic.Common.DefaultDateProvider;
                    this._guidGenerator = guidGenerator || new AppMagic.Common.DefaultGuidGenerator;
                    this._azureChannelCreator = new Services.AzureTableChannelCreator(this._accountName, this._baseUri, this._keyBase64, this._accountResource, this._channelFactory, this._dateProvider, this._guidGenerator)
                }
                return AzureTableClient.prototype.getTable = function(tableName) {
                        return new Services.AzureTable(tableName, this._accountName, this._baseUri, this._keyBase64, this._accountResource, this._channelFactory, this._dateProvider, this._guidGenerator)
                    }, AzureTableClient.prototype.queryTables = function() {
                        var channel = this._azureChannelCreator.createTablesChannel(!0);
                        return channel.send("GET", null).then(AzureTableClient._processQueryTables, function() {
                                return WinJS.Promise.wrap({resultCode: 2})
                            })
                    }, AzureTableClient._processQueryTables = function(response) {
                            try {
                                for (var jsonData = JSON.parse(response.responseText), list = jsonData.value, tableNames = [], i = 0, len = list.length; i < len; i++) {
                                    var tableName = list[i].TableName;
                                    Contracts.checkNonEmpty(tableName);
                                    tableNames.push(tableName)
                                }
                                return WinJS.Promise.wrap({
                                        resultCode: 0, tableNames: tableNames
                                    })
                            }
                            catch(e) {}
                            return WinJS.Promise.wrap({resultCode: 2})
                        }, AzureTableClient
            }();
        Services.AzureTableClient = AzureTableClient
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AzureTableFailedChangesetParser = function() {
                function AzureTableFailedChangesetParser(){}
                return AzureTableFailedChangesetParser.parseChangesetError = function(responseText) {
                        try {
                            var failedOperation = -1,
                                jsonData = JSON.parse(responseText),
                                odataError = jsonData["odata.error"],
                                odataErrorCode = odataError.code,
                                odataErrorMessageValue = odataError.message.value,
                                match = odataErrorMessageValue.match("^(\\d+):");
                            if (match === null)
                                return null;
                            var failedOperation = parseInt(match[1]);
                            return isFinite(failedOperation) ? {
                                    failedOperation: failedOperation, odataErrorCode: odataErrorCode
                                } : null
                        }
                        catch(e) {}
                        return null
                    }, AzureTableFailedChangesetParser
            }();
        Services.AzureTableFailedChangesetParser = AzureTableFailedChangesetParser
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        (function(AzureTableResultCode) {
            AzureTableResultCode[AzureTableResultCode.Success = 0] = "Success";
            AzureTableResultCode[AzureTableResultCode.ConditionNotMet = 1] = "ConditionNotMet";
            AzureTableResultCode[AzureTableResultCode.UnknownError = 2] = "UnknownError";
            AzureTableResultCode[AzureTableResultCode.FailedToWrite = 3] = "FailedToWrite";
            AzureTableResultCode[AzureTableResultCode.TableAlreadyExists = 4] = "TableAlreadyExists";
            AzureTableResultCode[AzureTableResultCode.UnsupportedFormat = 5] = "UnsupportedFormat"
        })(Services.AzureTableResultCode || (Services.AzureTableResultCode = {}));
        var AzureTableResultCode = Services.AzureTableResultCode
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AzureTenantProvider = function() {
                function AzureTenantProvider(provider, progressIndicatorViewModel) {
                    this._authProvider = provider;
                    this._progressIndicatorViewModel = progressIndicatorViewModel
                }
                return Object.defineProperty(AzureTenantProvider.prototype, "authProvider", {
                        get: function() {
                            return this._authProvider
                        }, enumerable: !0, configurable: !0
                    }), AzureTenantProvider.prototype.getAzureTenantIdAsync = function() {
                        var _this = this,
                            actionId,
                            onBeforeAsyncStep = function() {
                                actionId = _this._progressIndicatorViewModel.addProgressAction()
                            },
                            onAfterAsyncStep = function() {
                                _this._progressIndicatorViewModel.completeProgressAction(actionId)
                            };
                        return this._authProvider.authenticateAsync(onBeforeAsyncStep, onAfterAsyncStep).then(function(authResult) {
                                return _this._parseProviderJsonWebToken(authResult)
                            }).then(function(tokenResult) {
                                return tokenResult
                            }, function(error) {
                                return Services.ServiceUtility.promiseErrorToAsyncResult(error)
                            })
                    }, AzureTenantProvider.prototype._parseProviderJsonWebToken = function(authResult) {
                            if (!authResult.success) {
                                if (authResult.message === "Canceled")
                                    throw AppMagic.Utility.createCanceledError();
                                return authResult
                            }
                            var encodedJsonWebTokenString = this._authProvider.store.tryGetVariableValue(AppMagic.Services.AzureRegistrationBroker.idTokenVariableName);
                            var jsonWebToken = AppMagic.Services.AuthUtility.parseJsonWebToken(encodedJsonWebTokenString);
                            var tenantId = jsonWebToken.payload.tid;
                            return {
                                    success: !0, result: tenantId
                                }
                        }, AzureTenantProvider.nsCacheKey = "AzureTenant~{96CEDDB9-C8E7-4D28-8015-B7F377255002}", AzureTenantProvider.authBaseUri = "https://login.windows.net/common/", AzureTenantProvider.resourceBaseUri = "https://graph.windows.net/", AzureTenantProvider
            }();
        Services.AzureTenantProvider = AzureTenantProvider
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var HttpRequest = function() {
                function HttpRequest(method, url, headers, queryParameters) {
                    this._method = method;
                    this._url = url;
                    this._headers = headers;
                    this._queryParameters = queryParameters
                }
                return HttpRequest.prototype.getRequestData = function() {
                        return null
                    }, HttpRequest.prototype._getRequestDataWithoutBody = function() {
                        var _this = this,
                            headers = {},
                            queryParameters = {};
                        return Object.keys(this._headers).forEach(function(key) {
                                return headers[key] = _this._headers[key]
                            }), Object.keys(this._queryParameters).forEach(function(key) {
                                return queryParameters[key] = _this._queryParameters[key]
                            }), {
                                    method: this._method, url: this._url, headers: headers, queryParameters: queryParameters
                                }
                    }, HttpRequest
            }();
        Services.HttpRequest = HttpRequest
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var BodilessHttpRequest = function(_super) {
                __extends(BodilessHttpRequest, _super);
                function BodilessHttpRequest(method, url, headers, queryParameters) {
                    _super.call(this, method, url, headers, queryParameters)
                }
                return BodilessHttpRequest.prototype.getRequestData = function() {
                        var data = [],
                            requestData = this._getRequestDataWithoutBody();
                        return {
                                method: requestData.method, url: requestData.url, headers: requestData.headers, queryParameters: requestData.queryParameters, data: data
                            }
                    }, BodilessHttpRequest
            }(Services.HttpRequest);
        Services.BodilessHttpRequest = BodilessHttpRequest
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var Dictionary = Collections.Generic.Dictionary,
            BodilessHttpRequestBuilder = function() {
                function BodilessHttpRequestBuilder() {
                    this._method = "";
                    this._baseUrl = "";
                    this._headers = {};
                    this._queryParameters = {};
                    this._paths = []
                }
                return BodilessHttpRequestBuilder.prototype.clone = function() {
                        var clone = new BodilessHttpRequestBuilder;
                        return this._cloneTo(clone), clone
                    }, BodilessHttpRequestBuilder.prototype._cloneTo = function(destination) {
                        var _this = this;
                        destination._method = this._method;
                        destination._baseUrl = this._baseUrl;
                        Object.keys(this._headers).forEach(function(key) {
                            return destination._headers[key] = _this._headers[key]
                        });
                        Object.keys(this._queryParameters).forEach(function(key) {
                            return destination._queryParameters[key] = _this._queryParameters[key]
                        });
                        for (var i = 0, len = this._paths.length; i < len; i++) {
                            var pathItem = this._paths[i],
                                templateValuesClone = new Dictionary;
                            pathItem.templateValuesByParamName.keys.forEach(function(paramName) {
                                templateValuesClone.setValue(paramName, templateValuesClone.getValue(paramName))
                            });
                            destination._paths.push({
                                path: pathItem.path, templateValuesByParamName: templateValuesClone
                            })
                        }
                    }, BodilessHttpRequestBuilder.prototype.setMethod = function(method) {
                            this._method = method
                        }, BodilessHttpRequestBuilder.prototype.setBaseUrl = function(baseUrl) {
                            this._baseUrl = baseUrl
                        }, BodilessHttpRequestBuilder.prototype.addHeader = function(name, value) {
                            this._headers[name] = value
                        }, BodilessHttpRequestBuilder.prototype.addQueryParameter = function(name, value) {
                            this._queryParameters[name] = value
                        }, BodilessHttpRequestBuilder.prototype.addPath = function(path) {
                            var templateValuesByParamName = new Dictionary;
                            return this._paths.push({
                                    path: path, templateValuesByParamName: templateValuesByParamName
                                }), this._paths.length - 1
                        }, BodilessHttpRequestBuilder.prototype.addTemplateToPath = function(pathIndex, paramName, templateValue) {
                            this._paths[pathIndex].templateValuesByParamName.setValue(paramName, templateValue)
                        }, BodilessHttpRequestBuilder.prototype.generateHttpRequestAsync = function() {
                            var requestInfo = this._generateHttpRequest();
                            return WinJS.Promise.wrap(new Services.BodilessHttpRequest(requestInfo.method, requestInfo.url, requestInfo.headers, requestInfo.queryParameters))
                        }, BodilessHttpRequestBuilder.prototype._generateHttpRequest = function() {
                            var _this = this,
                                url = BodilessHttpRequestBuilder.buildUrl(this._baseUrl, this._paths),
                                headers = {};
                            Object.keys(this._headers).forEach(function(key) {
                                return headers[key] = _this._headers[key]
                            });
                            var queryParameters = {};
                            return Object.keys(this._queryParameters).forEach(function(key) {
                                    return queryParameters[key] = _this._queryParameters[key]
                                }), {
                                    method: this._method, url: url, headers: headers, queryParameters: queryParameters
                                }
                        }, BodilessHttpRequestBuilder.buildUrl = function(baseUrl, paths) {
                            for (var replaceRegex = /{([\$\d\w:\-\.]+)}/g, replacedPaths = paths.map(function(pathItem) {
                                    return pathItem.path === null || pathItem.path.length === 0 ? "" : pathItem.templateValuesByParamName.count === 0 ? pathItem.path : pathItem.path.replace(replaceRegex, function(match, paramName) {
                                            var result = pathItem.templateValuesByParamName.tryGetValue(paramName);
                                            if (!result.value)
                                                return match;
                                            var replacement = result.outValue;
                                            return replacement
                                        })
                                }), lastCharWasForwardSlash = baseUrl.length > 0 && baseUrl.charAt(baseUrl.length - 1) === "/", i = 0, len = replacedPaths.length; i < len; i++)
                                replacedPaths[i].length !== 0 && (lastCharWasForwardSlash || (replacedPaths[i] = "/" + replacedPaths[i]), lastCharWasForwardSlash = replacedPaths[i].charAt(replacedPaths[i].length - 1) === "/");
                            return replacedPaths.unshift(baseUrl), replacedPaths.join("")
                        }, BodilessHttpRequestBuilder
            }();
        Services.BodilessHttpRequestBuilder = BodilessHttpRequestBuilder
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var BooleanParamValueStringifier = function() {
                function BooleanParamValueStringifier(){}
                return BooleanParamValueStringifier.prototype.getStringValue = function(value) {
                        return value.toString()
                    }, BooleanParamValueStringifier
            }();
        Services.BooleanParamValueStringifier = BooleanParamValueStringifier
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var CloudTableAccountProvider = function() {
                function CloudTableAccountProvider(brokerManager, controller, provider) {
                    this._brokerManager = brokerManager;
                    this._controller = controller;
                    this._provider = provider
                }
                return CloudTableAccountProvider.prototype.getCloudTableAccountAsync = function() {
                        var _this = this,
                            accountInfo = {};
                        return this._requestSubscriptionAsync(accountInfo).then(function(subscriptionResult) {
                                return _this._requestStorageAccountAsync(subscriptionResult)
                            }).then(function(accountResult) {
                                return _this._requestStorageKeyAsync(accountResult)
                            }).then(function(keyResult) {
                                return _this._getAccountInfo(keyResult)
                            })
                    }, CloudTableAccountProvider.prototype._requestSubscriptionAsync = function(accountInfo) {
                        var _this = this,
                            builder = new AppMagic.Services.BodilessHttpRequestBuilder;
                        return builder.addHeader(CloudTableAccountProvider.apiVersionKey, CloudTableAccountProvider.apiVersion), builder.setBaseUrl(CloudTableAccountProvider.resourceBaseUri + CloudTableAccountProvider.subscriptionsRoute), builder.setMethod(Services.Constants.OAuth2.Methods.GET), this._provider.authenticateRequestAsync(builder, function(){}, function(){}).then(function() {
                                    return builder.generateHttpRequestAsync()
                                }).then(function(request) {
                                    var httpReqData = request.getRequestData(),
                                        body = httpReqData.data.map(function(datum) {
                                            return datum.value
                                        });
                                    return _this._controller.sendHttp(httpReqData.url, httpReqData.method, httpReqData.headers, httpReqData.queryParameters, body)
                                }).then(function(response) {
                                    if (!response.success)
                                        return response;
                                    var matches = response.result.responseText.match(CloudTableAccountProvider.subscriptionIdRegex);
                                    return matches === null ? WinJS.Promise.wrap({success: !1}) : (accountInfo.subscriptionId = matches[1], WinJS.Promise.wrap({
                                            success: !0, result: accountInfo
                                        }))
                                })
                    }, CloudTableAccountProvider.prototype._requestStorageAccountAsync = function(subscriptionResult) {
                            var _this = this;
                            if (!subscriptionResult.success)
                                return WinJS.Promise.wrap(subscriptionResult);
                            var accountInfo = subscriptionResult.result;
                            var builder = new AppMagic.Services.BodilessHttpRequestBuilder;
                            return builder.addHeader(CloudTableAccountProvider.apiVersionKey, CloudTableAccountProvider.apiVersion), builder.setBaseUrl(CloudTableAccountProvider.resourceBaseUri + accountInfo.subscriptionId + CloudTableAccountProvider.storageServicesRoute), builder.setMethod(Services.Constants.OAuth2.Methods.GET), this._provider.authenticateRequestAsync(builder, function(){}, function(){}).then(function() {
                                        return builder.generateHttpRequestAsync()
                                    }).then(function(request) {
                                        var httpReqData = request.getRequestData(),
                                            body = httpReqData.data.map(function(datum) {
                                                return datum.value
                                            });
                                        return _this._controller.sendHttp(httpReqData.url, httpReqData.method, httpReqData.headers, httpReqData.queryParameters, body)
                                    }).then(function(response) {
                                        if (!response.success)
                                            return response;
                                        var matches = response.result.responseText.match(CloudTableAccountProvider.accountNameRegex);
                                        return matches === null ? WinJS.Promise.wrap({success: !1}) : (accountInfo.accountName = matches[1], WinJS.Promise.wrap({
                                                success: !0, result: accountInfo
                                            }))
                                    })
                        }, CloudTableAccountProvider.prototype._requestStorageKeyAsync = function(accountResult) {
                            var _this = this;
                            if (!accountResult.success)
                                return WinJS.Promise.wrap(accountResult);
                            var accountInfo = accountResult.result;
                            var builder = new AppMagic.Services.BodilessHttpRequestBuilder;
                            return builder.addHeader(CloudTableAccountProvider.apiVersionKey, CloudTableAccountProvider.apiVersion), builder.setBaseUrl(CloudTableAccountProvider.resourceBaseUri + accountInfo.subscriptionId + CloudTableAccountProvider.storageServicesRoute + "/" + accountInfo.accountName + CloudTableAccountProvider.storageKeysRoute), builder.setMethod(Services.Constants.OAuth2.Methods.GET), this._provider.authenticateRequestAsync(builder, function(){}, function(){}).then(function() {
                                        return builder.generateHttpRequestAsync()
                                    }).then(function(request) {
                                        var httpReqData = request.getRequestData(),
                                            body = httpReqData.data.map(function(datum) {
                                                return datum.value
                                            });
                                        return _this._controller.sendHttp(httpReqData.url, httpReqData.method, httpReqData.headers, httpReqData.queryParameters, body)
                                    }).then(function(response) {
                                        if (!response.success)
                                            return response;
                                        var matches = response.result.responseText.match(CloudTableAccountProvider.accountKeyRegex);
                                        return matches === null ? WinJS.Promise.wrap({success: !1}) : (accountInfo.keyBase64 = matches[1], WinJS.Promise.wrap({
                                                success: !0, result: accountInfo
                                            }))
                                    })
                        }, CloudTableAccountProvider.prototype._getAccountInfo = function(keyResult) {
                            if (!keyResult.success)
                                return keyResult;
                            var accountInfo = keyResult.result;
                            return {
                                    success: !0, result: accountInfo
                                }
                        }, CloudTableAccountProvider.nsCacheKey = "CloudTables~{02613BB7-FB13-468B-B0E2-0DEFF9120F37}", CloudTableAccountProvider.resourceBaseUri = "https://management.core.windows.net/", CloudTableAccountProvider.tableUriFormatString = "https://{0}.table.core.windows.net", CloudTableAccountProvider.authBaseUri = "https://login.windows.net/common/", CloudTableAccountProvider.apiVersionKey = "x-ms-version", CloudTableAccountProvider.apiVersion = "2014-06-01", CloudTableAccountProvider.subscriptionIdRegex = /<SubscriptionID>(.+?)<\/SubscriptionID>/, CloudTableAccountProvider.accountNameRegex = /<ServiceName>(.+?)<\/ServiceName>/, CloudTableAccountProvider.accountKeyRegex = /<Primary>(.+?)<\/Primary>/, CloudTableAccountProvider.subscriptionsRoute = "subscriptions", CloudTableAccountProvider.storageServicesRoute = "/services/storageservices", CloudTableAccountProvider.storageKeysRoute = "/keys", CloudTableAccountProvider
            }();
        Services.CloudTableAccountProvider = CloudTableAccountProvider
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var CloudTableDataSourceProvider = function() {
                function CloudTableDataSourceProvider(tableName, accountName, baseUri, accountResource, keyBase64, cloudTableWorkerController, dataSourceName, runtime) {
                    this._pendingSchemaWriteCount = 0;
                    this._nextRowHandle = 0;
                    this._tableName = tableName;
                    this._accountName = accountName;
                    this._baseUri = baseUri;
                    this._accountResource = accountResource;
                    this._keyBase64 = keyBase64;
                    this._cloudTableWorkerController = cloudTableWorkerController;
                    this._pendingJobs = new Core.Promise.PromiseQueue;
                    this._pendingWriteCountByRowHandle = new Collections.Generic.Dictionary;
                    this._pendingDeleteSetByRowHandle = new Collections.Generic.Dictionary;
                    this._rowIdByRowHandle = new Collections.Generic.Dictionary;
                    this._rowHandleByRowId = new Collections.Generic.Dictionary;
                    this._dataSourceName = dataSourceName;
                    this._runtime = runtime;
                    this._isInitialized = !1;
                    this._tableId = this._runtime.generateId()
                }
                return CloudTableDataSourceProvider._internalKeys = function() {
                        var internalKeys = {};
                        return internalKeys[AppMagic.Constants.Services.CloudTableRowHandleProperty] = !0, internalKeys[AppMagic.Constants.Services.CloudTableRowKeysProperty] = !0, internalKeys
                    }, Object.defineProperty(CloudTableDataSourceProvider.prototype, "schema", {
                        get: function() {
                            return AppMagic.Utility.jsonClone(this._schema)
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(CloudTableDataSourceProvider.prototype, "schemaString", {
                            get: function() {
                                return this._schemaString
                            }, enumerable: !0, configurable: !0
                        }), CloudTableDataSourceProvider.prototype._setSchema = function(schema) {
                            this._schema = AppMagic.Utility.jsonClone(schema);
                            this._schemaString = AppMagic.Schema.getSchemaString(schema)
                        }, CloudTableDataSourceProvider.prototype._getNextRowHandle = function() {
                            return (this._nextRowHandle++).toString()
                        }, CloudTableDataSourceProvider._removeInternalKeys = function(row) {
                            CloudTableDataSourceProvider._internalKeysList.forEach(function(internalKey) {
                                delete row[internalKey]
                            })
                        }, CloudTableDataSourceProvider.prototype.initializeProvider = function() {
                            var _this = this;
                            return this._cloudTableWorkerController.queryEntities(this._tableName, this._accountName, this._baseUri, this._accountResource, this._keyBase64).then(function(response) {
                                    return response.success ? (_this._isInitialized = !0, _this._rootHeaderSnapshot = response.result.rootHeaderSnapshot, _this._tableHeaderSnapshot = response.result.tableHeaderSnapshot, _this._setSchema(response.result.rootHeaderSnapshot.tableHeaderRowData.schema), _this._data = [], response.result.tableData.forEach(function(x) {
                                                delete x[AppMagic.Constants.Services.CloudTablePrimaryEntityEtagProperty];
                                                _this._pushRowAndAssignRowHandle(x)
                                            }), WinJS.Promise.wrap({success: !0})) : WinJS.Promise.wrap(response)
                                })
                        }, CloudTableDataSourceProvider.prototype.getDataWithRowIds = function() {
                            var _this = this;
                            if (!this._isInitialized)
                                return [];
                            var cloned = AppMagic.Utility.jsonClone(this._data);
                            return cloned.forEach(function(x) {
                                    x[_this._runtime.idProperty] = _this._rowIdByRowHandle.getValue(_this._getRowHandle(x));
                                    CloudTableDataSourceProvider._removeInternalKeys(x)
                                }), AppMagic.Utility.createOrSetPrivate(cloned, this._runtime.idProperty, this._tableId), cloned
                        }, CloudTableDataSourceProvider.prototype.getDataWithRowHandles = function() {
                            return this._isInitialized ? AppMagic.Utility.jsonClone(this._data) : []
                        }, CloudTableDataSourceProvider.prototype.getRowByHandle = function(rowHandle) {
                            if (!this._isInitialized)
                                return undefined;
                            for (var i = 0, len = this._data.length; i < len; i++) {
                                var row = this._data[i],
                                    handle = this._getRowHandle(row);
                                if (rowHandle === handle)
                                    return AppMagic.Utility.jsonClone(row)
                            }
                            return undefined
                        }, CloudTableDataSourceProvider.prototype.getRowHandle = function(row) {
                            var rowHandle = row[AppMagic.Constants.Services.CloudTableRowHandleProperty];
                            return Core.Utility.isDefined(rowHandle) ? rowHandle : null
                        }, CloudTableDataSourceProvider.prototype._getRowHandle = function(row) {
                            return row[AppMagic.Constants.Services.CloudTableRowHandleProperty]
                        }, CloudTableDataSourceProvider.prototype._pushRowAndAssignRowHandle = function(row) {
                            var rowHandle = this._getNextRowHandle();
                            row[AppMagic.Constants.Services.CloudTableRowHandleProperty] = rowHandle;
                            var rowId = this._runtime.generateId();
                            this._setRowHandleId(rowHandle, rowId);
                            this._data.push(row)
                        }, CloudTableDataSourceProvider._getRowKeySet = function(row) {
                            return row[AppMagic.Constants.Services.CloudTableRowKeysProperty]
                        }, CloudTableDataSourceProvider.prototype._incrementPendingWriteCount = function(rowHandle) {
                            var counter = 0,
                                tryGetResult = this._pendingWriteCountByRowHandle.tryGetValue(rowHandle);
                            tryGetResult.value && (counter = tryGetResult.outValue);
                            this._pendingWriteCountByRowHandle.setValue(rowHandle, counter + 1)
                        }, CloudTableDataSourceProvider.prototype._decrementPendingWriteCount = function(rowHandle) {
                            var counter = this._pendingWriteCountByRowHandle.getValue(rowHandle);
                            counter === 1 ? this._pendingWriteCountByRowHandle.deleteValue(rowHandle) : this._pendingWriteCountByRowHandle.setValue(rowHandle, counter - 1)
                        }, CloudTableDataSourceProvider.prototype._getRowByRowHandle = function(rowHandle) {
                            for (var foundRow, i = 0, i = 0, len = this._data.length; i < len; i++)
                                if (this._getRowHandle(this._data[i]) === rowHandle) {
                                    foundRow = this._data[i];
                                    break
                                }
                            return i = i < len ? i : -1, {
                                    row: foundRow, index: i
                                }
                        }, CloudTableDataSourceProvider.prototype.addRow = function(insertedRow) {
                            var _this = this,
                                localCopy = AppMagic.Utility.jsonClone(insertedRow);
                            this._pushRowAndAssignRowHandle(localCopy);
                            var newRowHandle = this._getRowHandle(localCopy);
                            var transmittedCopy = AppMagic.Utility.jsonClone(insertedRow);
                            return this._incrementPendingWriteCount(newRowHandle), this._pendingJobs.pushJob(function() {
                                    return _this._decrementPendingWriteCount(newRowHandle), _this._cloudTableWorkerController.insertRowToTable(_this._tableName, _this._accountName, _this._baseUri, _this._accountResource, _this._keyBase64, transmittedCopy, _this._tableHeaderSnapshot).then(function(response) {
                                            if (response.success) {
                                                localCopy[AppMagic.Constants.Services.CloudTableRowKeysProperty] = response.result.rowKeySetOfInsertedRowPrimaryEntity;
                                                var rowKeyOfInsertedRowPrimaryEntity = response.result.rowKeySetOfInsertedRowPrimaryEntity[0],
                                                    etagOfInsertedRowPrimaryEntity = response.result.etagOfInsertedRowPrimaryEntity;
                                                _this._processLatestData(response.result.latestData, function(rowData) {
                                                    var rowKeyOfPrimaryEntity = CloudTableDataSourceProvider._getRowKeySet(rowData)[0];
                                                    return rowKeyOfPrimaryEntity === rowKeyOfInsertedRowPrimaryEntity && rowData[AppMagic.Constants.Services.CloudTablePrimaryEntityEtagProperty] === etagOfInsertedRowPrimaryEntity
                                                })
                                            }
                                        })
                                }), newRowHandle
                        }, CloudTableDataSourceProvider.prototype.removeRow = function(rowHandle) {
                            var getRowResult = this._getRowByRowHandle(rowHandle);
                            this._removeRowByIndex(getRowResult.index)
                        }, CloudTableDataSourceProvider.prototype.editRow = function(rowHandle, editeeRowData) {
                            var getRowResult = this._getRowByRowHandle(rowHandle);
                            this._editRowByIndex(getRowResult.index, editeeRowData)
                        }, CloudTableDataSourceProvider.prototype._editRowByIndex = function(index, editeeRowData) {
                            var _this = this,
                                editee = this._data[index],
                                rowHandle = this._getRowHandle(editee),
                                internalKeys = CloudTableDataSourceProvider._internalKeysList;
                            Object.keys(editee).forEach(function(key) {
                                internalKeys.indexOf(key) < 0 && delete editee[key]
                            });
                            Object.keys(editeeRowData).forEach(function(key) {
                                internalKeys.indexOf(key) < 0 && (editee[key] = editeeRowData[key])
                            });
                            var transmittedCopy = AppMagic.Utility.jsonClone(editee);
                            CloudTableDataSourceProvider._removeInternalKeys(transmittedCopy);
                            this._setRowHandleId(rowHandle, this._runtime.generateId());
                            this._incrementPendingWriteCount(rowHandle);
                            this._pendingJobs.pushJob(function() {
                                return _this._decrementPendingWriteCount(rowHandle), _this._cloudTableWorkerController.editRowInTable(_this._tableName, _this._accountName, _this._baseUri, _this._accountResource, _this._keyBase64, transmittedCopy, CloudTableDataSourceProvider._getRowKeySet(editee), _this._tableHeaderSnapshot).then(function(editResponse) {
                                        if (editResponse.success) {
                                            editee[AppMagic.Constants.Services.CloudTableRowKeysProperty] = editResponse.result.rowKeySetOfEditeePrimaryEntity;
                                            var rowKeyForEditeePrimaryEntity = editResponse.result.rowKeySetOfEditeePrimaryEntity[0],
                                                etagForEditeePrimaryEntity = editResponse.result.etagForEditeePrimaryEntity;
                                            _this._processLatestData(editResponse.result.latestData, function(rowData) {
                                                var rowKeyOfPrimaryEntity = CloudTableDataSourceProvider._getRowKeySet(rowData)[0];
                                                return rowKeyOfPrimaryEntity === rowKeyForEditeePrimaryEntity && rowData[AppMagic.Constants.Services.CloudTablePrimaryEntityEtagProperty] === etagForEditeePrimaryEntity
                                            })
                                        }
                                    })
                            })
                        }, CloudTableDataSourceProvider.prototype.setSchema = function(schema) {
                            var _this = this;
                            this._setSchema(schema);
                            var transmittedCopy = AppMagic.Utility.jsonClone(schema);
                            this._pendingSchemaWriteCount++;
                            this._pendingJobs.pushJob(function() {
                                return _this._pendingSchemaWriteCount--, _this._cloudTableWorkerController.setTableSchema(_this._tableName, _this._accountName, _this._baseUri, _this._accountResource, _this._keyBase64, transmittedCopy, _this._rootHeaderSnapshot, _this._tableHeaderSnapshot).then(function(setSchemaResponse) {
                                        setSchemaResponse.success && _this._processLatestData(setSchemaResponse.result.latestData, function() {
                                            return !1
                                        })
                                    })
                            });
                            this._runtime.onDataSourceChanged(this._dataSourceName)
                        }, CloudTableDataSourceProvider.prototype._processLatestData = function(latestData, rowIsAlreadyInLocalData) {
                            var _this = this;
                            this._rootHeaderSnapshot = latestData.rootHeaderSnapshot;
                            this._tableHeaderSnapshot = latestData.tableHeaderSnapshot;
                            var changed = this._removeDeadData(this._tableHeaderSnapshot),
                                dataByPrimaryEntityRowKey = this._getDataByPrimaryEntityRowKey();
                            if (latestData.tableData.forEach(function(rowData) {
                                var rowKeyOfPrimaryEntity = CloudTableDataSourceProvider._getRowKeySet(rowData)[0];
                                if (dataByPrimaryEntityRowKey.containsKey(rowKeyOfPrimaryEntity)) {
                                    var localVersionOfTheRow = dataByPrimaryEntityRowKey.getValue(rowKeyOfPrimaryEntity),
                                        rowHandle = _this._getRowHandle(localVersionOfTheRow);
                                    if (!_this._pendingWriteCountByRowHandle.containsKey(rowHandle) && !_this._pendingDeleteSetByRowHandle.containsKey(rowHandle) && !rowIsAlreadyInLocalData(rowData)) {
                                        Object.keys(localVersionOfTheRow).forEach(function(key) {
                                            key !== AppMagic.Constants.Services.CloudTableRowHandleProperty && delete localVersionOfTheRow[key]
                                        });
                                        Object.keys(rowData).forEach(function(key) {
                                            key !== AppMagic.Constants.Services.CloudTablePrimaryEntityEtagProperty && (localVersionOfTheRow[key] = rowData[key])
                                        });
                                        var rowId = _this._runtime.generateId();
                                        _this._setRowHandleId(rowHandle, rowId);
                                        changed = !0
                                    }
                                }
                                else
                                    _this._pushRowAndAssignRowHandle(rowData),
                                    changed = !0
                            }), this._pendingSchemaWriteCount === 0) {
                                var schemaAreSame = AppMagic.Schema.schemasAreEqual(latestData.rootHeaderSnapshot.tableHeaderRowData.schema, this._schema);
                                schemaAreSame || (this._setSchema(latestData.rootHeaderSnapshot.tableHeaderRowData.schema), changed = !0)
                            }
                            if (changed)
                                this._runtime.onDataSourceChanged(this._dataSourceName)
                        }, CloudTableDataSourceProvider.prototype._removeDeadData = function(tableHeaderSnapshot) {
                            var rowsToKeep = new Collections.Generic.Dictionary;
                            tableHeaderSnapshot.tableHeaderRowData.rows.forEach(function(rowKey) {
                                rowsToKeep.setValue(rowKey, !0)
                            });
                            for (var dataWasRemoved = !1, i = this._data.length - 1; i >= 0; i--) {
                                var dataRow = this._data[i],
                                    rowHandle = this._getRowHandle(dataRow);
                                if (!this._pendingWriteCountByRowHandle.containsKey(rowHandle)) {
                                    var rowKeysForDataRow = CloudTableDataSourceProvider._getRowKeySet(dataRow);
                                    var rowKeyOfPrimaryEntity = rowKeysForDataRow[0];
                                    rowsToKeep.containsKey(rowKeyOfPrimaryEntity) || (this._data.splice(i, 1), this._removeRowHandleId(rowHandle), dataWasRemoved = !0)
                                }
                            }
                            return dataWasRemoved
                        }, CloudTableDataSourceProvider.prototype._setRowHandleId = function(rowHandle, rowId) {
                            this._rowIdByRowHandle.setValue(rowHandle, rowId);
                            this._rowHandleByRowId.setValue(rowId.toString(), rowHandle)
                        }, CloudTableDataSourceProvider.prototype._removeRowHandleId = function(rowHandle) {
                            var rowId = this._rowIdByRowHandle.getValue(rowHandle);
                            this._rowIdByRowHandle.deleteValue(rowHandle);
                            this._rowHandleByRowId.deleteValue(rowId.toString())
                        }, CloudTableDataSourceProvider.prototype._getDataByPrimaryEntityRowKey = function() {
                            for (var dataByPrimaryEntityRowKey = new Collections.Generic.Dictionary, i = this._data.length - 1; i >= 0; i--) {
                                var dataRow = this._data[i],
                                    rowKeySet = CloudTableDataSourceProvider._getRowKeySet(dataRow);
                                rowKeySet instanceof Array && dataByPrimaryEntityRowKey.setValue(rowKeySet[0], dataRow)
                            }
                            return dataByPrimaryEntityRowKey
                        }, CloudTableDataSourceProvider.prototype._removeRowByIndex = function(index) {
                            var _this = this;
                            var rowToRemove = this._data[index],
                                rowHandle = this._getRowHandle(rowToRemove);
                            this._data.splice(index, 1);
                            this._removeRowHandleId(rowHandle);
                            this._pendingDeleteSetByRowHandle.setValue(rowHandle, !0);
                            this._pendingJobs.pushJob(function() {
                                return _this._pendingDeleteSetByRowHandle.deleteValue(rowHandle), _this._cloudTableWorkerController.removeRowFromTable(_this._tableName, _this._accountName, _this._baseUri, _this._accountResource, _this._keyBase64, CloudTableDataSourceProvider._getRowKeySet(rowToRemove), _this._tableHeaderSnapshot).then(function(removeResponse) {
                                        removeResponse.success && _this._processLatestData(removeResponse.result, function() {
                                            return !1
                                        })
                                    })
                            })
                        }, CloudTableDataSourceProvider.prototype.clear = function(collection) {
                            for (var i = this._data.length - 1; i >= 0; i--)
                                this._removeRowByIndex(i);
                            this._runtime.onDataSourceChanged(this._dataSourceName);
                            return this._runtime.getNamedObject(this._dataSourceName)
                        }, CloudTableDataSourceProvider.prototype.removeIf = function(predicates) {
                            return this.removeIfAsync(predicates), this._runtime.getNamedObject(this._dataSourceName)
                        }, CloudTableDataSourceProvider.prototype.removeIfAsync = function(predicates) {
                            for (var _this = this, snapshot = AppMagic.Utility.jsonClone(this._data), rowHandles = snapshot.map(function(row) {
                                    var rowHandle = _this._getRowHandle(row);
                                    return CloudTableDataSourceProvider._removeInternalKeys(row), rowHandle
                                }), predicatesWereSatisfiedByRowHandle = {}, promises = [], i = 0, len = snapshot.length; i < len; i++)
                                for (var j = 0, jlen = predicates.length; j < jlen; j++)
                                    (function(rowIndex, predicateIndex) {
                                        var row = snapshot[rowIndex],
                                            rowHandle = rowHandles[rowIndex];
                                        promises.push(WinJS.Promise.wrap().then(function() {
                                            return predicates[predicateIndex](row)
                                        }).then(function(predicateSatisfied) {
                                            predicateSatisfied !== !0 && (predicateSatisfied = !1);
                                            var shouldRemove = predicatesWereSatisfiedByRowHandle[rowHandle];
                                            predicatesWereSatisfiedByRowHandle[rowHandle] = Core.Utility.isDefined(shouldRemove) ? shouldRemove && predicateSatisfied : predicateSatisfied
                                        }, function() {
                                            predicatesWereSatisfiedByRowHandle[rowHandle] = !1
                                        }))
                                    })(i, j);
                            WinJS.Promise.join(promises).then(function() {
                                for (var changed = !1, i = 0; i < _this._data.length; i++) {
                                    var row = _this._data[i],
                                        rowHandle = _this._getRowHandle(row);
                                    predicatesWereSatisfiedByRowHandle[rowHandle] && (AppMagic.Utility.releaseBlobs(row), _this._removeRowByIndex(i), changed = !0, i--)
                                }
                                if (changed)
                                    _this._runtime.onDataSourceChanged(_this._dataSourceName);
                                return WinJS.Promise.wrap(_this._runtime.getNamedObject(_this._dataSourceName))
                            }, function() {
                                return WinJS.Promise.wrap(null)
                            })
                        }, CloudTableDataSourceProvider.prototype.removeAll = function(collection, source, removeAllMatches) {
                            for (var changed = !1, sourceLen = source.length, i = 0; i < this._data.length; i++) {
                                for (var row = this._data[i], j = 0; j < sourceLen; j++) {
                                    var sourceRow = source[j];
                                    if (AppMagic.Utility.deepCompare(row, sourceRow, CloudTableDataSourceProvider._internalKeys()) && (AppMagic.Utility.releaseBlobs(row), this._removeRowByIndex(i), changed = !0, i--), changed && !removeAllMatches)
                                        break
                                }
                                if (changed && !removeAllMatches)
                                    break
                            }
                            if (changed)
                                this._runtime.onDataSourceChanged(this._dataSourceName);
                            return this._runtime.getNamedObject(this._dataSourceName)
                        }, CloudTableDataSourceProvider.prototype.collect = function(collection, items) {
                            for (var changed = !1, i = 0, len = items.length; i < len; i++) {
                                var row,
                                    item = items[i];
                                if (item === null)
                                    continue;
                                else if (item instanceof Array)
                                    for (var j = 0, srclen = item.length; j < srclen; j++)
                                        (row = item[j], row !== null && typeof row == "object") && (row = AppMagic.Utility.clone(row, !0), AppMagic.Utility.addRefBlobs(row), this.addRow(row));
                                else
                                    typeof item == "object" && (row = AppMagic.Utility.clone(item, !0), AppMagic.Utility.addRefBlobs(row), this.addRow(row));
                                changed = !0
                            }
                            if (changed)
                                this._runtime.onDataSourceChanged(this._dataSourceName);
                            return this._runtime.getNamedObject(this._dataSourceName)
                        }, CloudTableDataSourceProvider.prototype.collect_S = function(collection, items, fieldName) {
                            for (var changed = !1, i = 0, len = items.length; i < len; i++) {
                                var item = items[i],
                                    row = {};
                                row[fieldName] = item;
                                AppMagic.Utility.addRefBlobs(row);
                                this.addRow(row);
                                changed = !0
                            }
                            if (changed)
                                this._runtime.onDataSourceChanged(this._dataSourceName);
                            return this._runtime.getNamedObject(this._dataSourceName)
                        }, CloudTableDataSourceProvider.prototype.update = function(oldItem, newItem, updateAllMatches) {
                            for (var changed = !1, i = 0, len = this._data.length; i < len; i++) {
                                var row = this._data[i];
                                if (AppMagic.Utility.deepCompare(row, oldItem, CloudTableDataSourceProvider._internalKeys())) {
                                    var newRow = AppMagic.Utility.clone(newItem, !0);
                                    if (newRow !== null ? (AppMagic.Utility.addRefBlobs(newRow), AppMagic.AuthoringTool.Runtime.assignRowID(newRow)) : newRow = {}, this._editRowByIndex(i, newRow), AppMagic.Utility.releaseBlobs(row), changed = !0, !updateAllMatches)
                                        break
                                }
                            }
                            if (changed)
                                this._runtime.onDataSourceChanged(this._dataSourceName);
                            return this._runtime.getNamedObject(this._dataSourceName)
                        }, CloudTableDataSourceProvider.prototype.updateIf = function(predicatesAndItemFns) {
                            return this.updateIfAsync(predicatesAndItemFns), this._runtime.getNamedObject(this._dataSourceName)
                        }, CloudTableDataSourceProvider.prototype.updateIfAsync = function(predicatesAndItemFns) {
                            for (var _this = this, snapshot = AppMagic.Utility.jsonClone(this._data), rowHandles = snapshot.map(function(row) {
                                    var rowHandle = _this._getRowHandle(row);
                                    return CloudTableDataSourceProvider._removeInternalKeys(row), rowHandle
                                }), promisesPerRow = [], itemFunctionForRow = [], i = 0, len = snapshot.length; i < len; i++)
                                for (var j = 0, jlen = predicatesAndItemFns.length; j < jlen; j++)
                                    (function(rowIndex, predicateIndex) {
                                        var row = snapshot[rowIndex];
                                        Core.Utility.isDefined(promisesPerRow[rowIndex]) || (promisesPerRow[rowIndex] = WinJS.Promise.wrap());
                                        promisesPerRow[rowIndex] = promisesPerRow[rowIndex].then(function() {
                                            return Core.Utility.isDefined(itemFunctionForRow) ? !1 : predicatesAndItemFns[predicateIndex].predicate(row)
                                        }).then(function(predicateEvaluation) {
                                            predicateEvaluation === !0 && (itemFunctionForRow[rowIndex] = predicatesAndItemFns[predicateIndex].itemFunction)
                                        }, function(){})
                                    })(i, j);
                            for (var newRowByRowHandle = {}, changed = !1, i = 0, len = snapshot.length; i < len; i++)
                                (function(rowIndex) {
                                    promisesPerRow[rowIndex] = promisesPerRow[rowIndex].then(function() {
                                        if (Core.Utility.isDefined(itemFunctionForRow[rowIndex]))
                                            return changed = !0, itemFunctionForRow[rowIndex](snapshot[rowIndex])
                                    }).then(function(newRow) {
                                        newRowByRowHandle[rowHandles[rowIndex]] = newRow
                                    }, function(){})
                                })(i);
                            return WinJS.Promise.join(promisesPerRow).then(function() {
                                    for (var i = 0; i < _this._data.length; i++) {
                                        var row = _this._data[i],
                                            rowHandle = _this._getRowHandle(row),
                                            newRowData = newRowByRowHandle[rowHandle];
                                        Core.Utility.isDefined(newRowData) && (_this._editRowByIndex(i, newRowData), changed = !0)
                                    }
                                    if (changed)
                                        _this._runtime.onDataSourceChanged(_this._dataSourceName);
                                    return WinJS.Promise.wrap(_this._runtime.getNamedObject(_this._dataSourceName))
                                })
                        }, CloudTableDataSourceProvider._internalKeysList = Object.keys(CloudTableDataSourceProvider._internalKeys()), CloudTableDataSourceProvider
            }();
        Services.CloudTableDataSourceProvider = CloudTableDataSourceProvider
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var CloudTableDataSourceProviderFactory = function() {
                function CloudTableDataSourceProviderFactory(dispatcher) {
                    this._dispatcher = dispatcher;
                    this._cloudTableWorkerController = new AppMagic.Services.CloudTableWorkerController(this._dispatcher)
                }
                return CloudTableDataSourceProviderFactory.prototype.createDataSourceProvider = function(configuration, dataSourceName, runtime) {
                        return new Services.CloudTableDataSourceProvider(configuration.tableName, configuration.accountName, configuration.baseUri, configuration.accountResource, configuration.keyBase64, this._cloudTableWorkerController, dataSourceName, runtime)
                    }, CloudTableDataSourceProviderFactory
            }();
        Services.CloudTableDataSourceProviderFactory = CloudTableDataSourceProviderFactory
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        (function(CloudTableOperationResultCode) {
            CloudTableOperationResultCode[CloudTableOperationResultCode.Success = 0] = "Success";
            CloudTableOperationResultCode[CloudTableOperationResultCode.FailedToWriteEntities = 1] = "FailedToWriteEntities";
            CloudTableOperationResultCode[CloudTableOperationResultCode.FailedToWriteTableHeaderPrimaryEntity = 2] = "FailedToWriteTableHeaderPrimaryEntity";
            CloudTableOperationResultCode[CloudTableOperationResultCode.FailedToWriteNonPrimaryEntities = 3] = "FailedToWriteNonPrimaryEntities";
            CloudTableOperationResultCode[CloudTableOperationResultCode.FailedToWritePrimaryEntities = 4] = "FailedToWritePrimaryEntities";
            CloudTableOperationResultCode[CloudTableOperationResultCode.FailedToQueryLatestRows = 5] = "FailedToQueryLatestRows";
            CloudTableOperationResultCode[CloudTableOperationResultCode.FailedToQueryRoot = 6] = "FailedToQueryRoot";
            CloudTableOperationResultCode[CloudTableOperationResultCode.FailedToQueryTables = 7] = "FailedToQueryTables"
        })(Services.CloudTableOperationResultCode || (Services.CloudTableOperationResultCode = {}));
        var CloudTableOperationResultCode = Services.CloudTableOperationResultCode
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var CloudTableWorker = function() {
                function CloudTableWorker(){}
                return CloudTableWorker.generateTableHeaderRowKey = function() {
                        return CloudTableWorker.EntityPropertyValue_RowKey_TableHeader + AppMagic.Utility.generateRandomString(10, CloudTableWorker.NonTableHeaderRowKeyAlphabet)
                    }, CloudTableWorker.generateEntityRowKey = function() {
                        return AppMagic.Utility.generateRandomString(10, CloudTableWorker.NonTableHeaderRowKeyAlphabet)
                    }, CloudTableWorker.getQueryEntitiesFilterString = function() {
                            return Core.Utility.formatString(CloudTableWorker.FilterStringFormat_queryEntities, CloudTableWorker.EntityPropertyValue_PartitionKey_Root, CloudTableWorker.EntityPropertyValue_PartitionKey_FirstLevel)
                        }, CloudTableWorker.getQueryLatestRowsSinceTimestampFilterString = function(timestamp) {
                            return Core.Utility.formatString(CloudTableWorker.FilterStringFormat_queryLatestRowsSinceTimestamp, CloudTableWorker.EntityPropertyValue_PartitionKey_Root, timestamp, CloudTableWorker.EntityPropertyValue_RowKey_TableHeader, CloudTableWorker.EntityPropertyValue_RowKey_TableHeaderExclusiveUpperBound)
                        }, CloudTableWorker.getQueryLatestRowInfoSinceTimestampFilterString = function(partitionKey, timestamp) {
                            return Core.Utility.formatString(CloudTableWorker.FilterStringFormat_queryLatestRowInfoSinceTimestamp, partitionKey, timestamp, CloudTableWorker.EntityPropertyValue_RowKey_TableHeader, CloudTableWorker.EntityPropertyValue_RowKey_TableHeaderExclusiveUpperBound)
                        }, CloudTableWorker.getQueryLatestRootInfoFilterString = function() {
                            return Core.Utility.formatString(CloudTableWorker.FilterStringFormat_queryLatestRootInfo, CloudTableWorker.EntityPropertyValue_PartitionKey_Root)
                        }, CloudTableWorker.writeEntities = function(azureTable, entityWriteInfos) {
                            for (var writePromises = [], i = 0, len = entityWriteInfos.length; i < len; i++) {
                                var insertPromise = azureTable.insertOrReplaceEntity(entityWriteInfos[i].partitionKey, entityWriteInfos[i].rowKey, entityWriteInfos[i].jsonPayload);
                                writePromises.push(insertPromise)
                            }
                            return WinJS.Promise.join(writePromises).then(function(responses) {
                                    var allSucceeded = responses.every(function(writeResult) {
                                            return writeResult.resultCode === 0
                                        });
                                    return WinJS.Promise.wrap({
                                            allSucceeded: allSucceeded, writeResults: responses
                                        })
                                })
                        }, CloudTableWorker.deleteEntitiesInPartition = function(azureTable, partitionKey, rowKeys, beginIndex) {
                            for (var i = beginIndex, len = rowKeys.length; i < len; i++)
                                azureTable.deleteEntity(partitionKey, rowKeys[i], "*").then(null, function(){})
                        }, CloudTableWorker.getEntityStubs = function(row) {
                            for (var stringified = JSON.stringify(row), entities = [], parts = stringified.match(CloudTableWorker.Regex_StringifiedDataToParts), partIndex = 0, partNames = CloudTableWorker.EntityPropertyName_PartNames, numParts = parts.length; partIndex < numParts; ) {
                                for (var entity = {}, i = 0; i < CloudTableWorker.PartsPerEntity && partIndex < numParts; i++, partIndex++)
                                    entity[partNames[i]] = parts[partIndex];
                                entity[CloudTableWorker.EntityPropertyName__NumPartsInEntity] = i;
                                entities.push(entity)
                            }
                            return entities
                        }, CloudTableWorker.appendWriteEntityInfo = function(entities, partitionKey, rowKeys, list, beginIndex) {
                            for (var i = beginIndex, len = entities.length; i < len; i++)
                                list.push({
                                    jsonPayload: entities[i], partitionKey: partitionKey, rowKey: rowKeys[i]
                                })
                        }, CloudTableWorker.prototype.createCloudTableWithUniqueName = function(createCloudTableInfo) {
                            var createCloudTable = new Services.CreateCloudTable(createCloudTableInfo.suggestedTableName, createCloudTableInfo.accountName, createCloudTableInfo.baseUri, createCloudTableInfo.keyBase64, createCloudTableInfo.accountResource);
                            return createCloudTable.performOperation()
                        }, CloudTableWorker.prototype.queryEntities = function(queryEntitiesParameters) {
                            var filterString = CloudTableWorker.getQueryEntitiesFilterString(),
                                azureTable = new Services.AzureTable(queryEntitiesParameters.tableName, queryEntitiesParameters.accountName, queryEntitiesParameters.baseUri, queryEntitiesParameters.keyBase64, queryEntitiesParameters.accountResource);
                            return azureTable.queryEntities(filterString).then(function(response) {
                                    return WinJS.Promise.wrap(CloudTableWorker.processQueryEntities(response))
                                })
                        }, CloudTableWorker.getEntitiesForRow = function(rowData, rowKeyOfPrimaryEntity, rowKeyGenerator) {
                            for (var entities = CloudTableWorker.getEntityStubs(rowData), rowKeySet = [rowKeyOfPrimaryEntity], i = 0, len = entities.length - 1; i < len; i++) {
                                var rowKey = rowKeyGenerator();
                                rowKeySet.push(rowKey);
                                entities[i][CloudTableWorker.EntityPropertyName__NextRowKey] = rowKey
                            }
                            return {
                                    entities: entities, rowKeySet: rowKeySet
                                }
                        }, CloudTableWorker.prototype.insertRowToTable = function(insertParameters) {
                            var azureTable = new Services.AzureTable(insertParameters.tableIdentifier.tableName, insertParameters.tableIdentifier.accountName, insertParameters.tableIdentifier.baseUri, insertParameters.tableIdentifier.keyBase64, insertParameters.tableIdentifier.accountResource),
                                insertOperation = new Services.InsertCloudTableRow(azureTable, insertParameters.insertedRowData, insertParameters.tableHeaderSnapshot.timestampOfTableHeaderPrimaryEntity, insertParameters.tableHeaderSnapshot.etagOfTableHeaderPrimaryEntity, insertParameters.tableHeaderSnapshot.rowKeySetOfTableHeader, insertParameters.tableHeaderSnapshot.tableHeaderRowData);
                            return insertOperation.performOperation().then(function(insertResult) {
                                    return insertResult.resultCode !== 0 ? WinJS.Promise.wrap({
                                            success: !1, message: "Insert into cloud table failed.", result: null
                                        }) : CloudTableWorker.queryLatestRowsSinceTimestamp(azureTable, insertParameters.tableHeaderSnapshot.timestampOfTableHeaderPrimaryEntity).then(function(queryLatestRowsSinceTimestampResponse) {
                                            if (!queryLatestRowsSinceTimestampResponse.success)
                                                return WinJS.Promise.wrap(queryLatestRowsSinceTimestampResponse);
                                            var insertRowToTableResult = {
                                                    success: !0, message: null, result: {
                                                            etagOfInsertedRowPrimaryEntity: insertResult.etagForInserteePrimaryEntity, rowKeySetOfInsertedRowPrimaryEntity: insertResult.rowKeySetForInsertee, latestData: queryLatestRowsSinceTimestampResponse.result
                                                        }
                                                };
                                            return WinJS.Promise.wrap(insertRowToTableResult)
                                        })
                                })
                        }, CloudTableWorker.queryLatestRowsSinceTimestamp = function(azureTable, timestampOfTableHeaderPrimaryEntity) {
                            var filterString = CloudTableWorker.getQueryLatestRowsSinceTimestampFilterString(timestampOfTableHeaderPrimaryEntity);
                            return azureTable.queryEntities(filterString).then(function(response) {
                                    return WinJS.Promise.wrap(CloudTableWorker.processQueryEntities(response))
                                })
                        }, CloudTableWorker.queryLatestRowInfoSinceTimestamp = function(azureTable, partitionKey, timestampOfTableHeaderPrimaryEntity) {
                            var filterString = CloudTableWorker.getQueryLatestRowInfoSinceTimestampFilterString(partitionKey, timestampOfTableHeaderPrimaryEntity);
                            return azureTable.queryEntities(filterString).then(function(response) {
                                    if (response.resultCode === 0)
                                        try {
                                            var entities = response.entities,
                                                entitiesByRowKey = {};
                                            entities.forEach(function(entity) {
                                                entitiesByRowKey[entity.RowKey] = entity
                                            });
                                            var buildFirstLevelHeaderResult = CloudTableWorker.buildRow(CloudTableWorker.EntityPropertyValue_RowKey_TableHeader, entitiesByRowKey),
                                                primaryEntityOfTableHeader = entitiesByRowKey[CloudTableWorker.EntityPropertyValue_RowKey_TableHeader],
                                                tableHeaderSnapshot = {
                                                    timestampOfTableHeaderPrimaryEntity: primaryEntityOfTableHeader.Timestamp, etagOfTableHeaderPrimaryEntity: primaryEntityOfTableHeader[CloudTableWorker.EntityODataPropertyName_Etag], rowKeySetOfTableHeader: buildFirstLevelHeaderResult.rowKeys, tableHeaderRowData: buildFirstLevelHeaderResult.row
                                                };
                                            return WinJS.Promise.wrap({
                                                    entitiesByRowKey: entitiesByRowKey, tableHeaderSnapshot: tableHeaderSnapshot
                                                })
                                        }
                                        catch(e) {}
                                    return WinJS.Promise.wrap(null)
                                })
                        }, CloudTableWorker.queryLatestRootInfo = function(azureTable) {
                            var filterString = CloudTableWorker.getQueryLatestRootInfoFilterString();
                            return azureTable.queryEntities(filterString).then(function(response) {
                                    if (response.resultCode === 0)
                                        try {
                                            var entities = response.entities,
                                                entitiesByRowKey = {};
                                            entities.forEach(function(entity) {
                                                entitiesByRowKey[entity.RowKey] = entity
                                            });
                                            var buildRootHeaderResult = CloudTableWorker.buildRow(CloudTableWorker.EntityPropertyValue_RowKey_TableHeader, entitiesByRowKey),
                                                primaryEntityOfTableHeader = entitiesByRowKey[CloudTableWorker.EntityPropertyValue_RowKey_TableHeader],
                                                tableHeaderSnapshot = {
                                                    timestampOfTableHeaderPrimaryEntity: primaryEntityOfTableHeader.Timestamp, etagOfTableHeaderPrimaryEntity: primaryEntityOfTableHeader[CloudTableWorker.EntityODataPropertyName_Etag], rowKeySetOfTableHeader: buildRootHeaderResult.rowKeys, tableHeaderRowData: buildRootHeaderResult.row
                                                };
                                            return WinJS.Promise.wrap({
                                                    entitiesByRowKey: entitiesByRowKey, rootTableHeaderSnapshot: tableHeaderSnapshot
                                                })
                                        }
                                        catch(e) {}
                                    return WinJS.Promise.wrap(null)
                                })
                        }, CloudTableWorker.processQueryEntities = function(response) {
                            switch (response.resultCode) {
                                case 0:
                                    try {
                                        return CloudTableWorker.processSuccessfulQueryEntities(response.entities)
                                    }
                                    catch(e) {}
                                    break;
                                case 5:
                                    return {
                                            success: !1, message: "Cloud table query response format was corrupted or was not json."
                                        };
                                    break;
                                default:
                                    break
                            }
                            return {
                                    success: !1, message: "Cloud table query failed for unknown reason."
                                }
                        }, CloudTableWorker.processSuccessfulQueryEntities = function(entities) {
                            var rootEntitiesByRowKey = {},
                                firstLevelEntitiesByRowKey = {};
                            entities.forEach(function(entity) {
                                entity.PartitionKey === CloudTableWorker.EntityPropertyValue_PartitionKey_Root ? rootEntitiesByRowKey[entity.RowKey] = entity : firstLevelEntitiesByRowKey[entity.RowKey] = entity
                            });
                            var buildRootHeaderResult = CloudTableWorker.buildRow(CloudTableWorker.EntityPropertyValue_RowKey_TableHeader, rootEntitiesByRowKey),
                                rootHeader = buildRootHeaderResult.row,
                                primaryEntityOfRootHeader = rootEntitiesByRowKey[CloudTableWorker.EntityPropertyValue_RowKey_TableHeader],
                                rootHeaderSnapshot = {
                                    etagOfTableHeaderPrimaryEntity: primaryEntityOfRootHeader[CloudTableWorker.EntityODataPropertyName_Etag], rowKeySetOfTableHeader: buildRootHeaderResult.rowKeys, tableHeaderRowData: buildRootHeaderResult.row, timestampOfTableHeaderPrimaryEntity: primaryEntityOfRootHeader.Timestamp
                                },
                                buildFirstLevelHeaderResult = CloudTableWorker.buildRow(CloudTableWorker.EntityPropertyValue_RowKey_TableHeader, firstLevelEntitiesByRowKey),
                                firstLevelTableHeader = buildFirstLevelHeaderResult.row,
                                rowKeyListing = firstLevelTableHeader[CloudTableWorker.TableHeaderKey_Rows];
                            var tableData = [];
                            rowKeyListing.forEach(function(rowKey) {
                                var primaryEntityForRow = firstLevelEntitiesByRowKey[rowKey];
                                if (typeof primaryEntityForRow != "undefined") {
                                    var buildResult = CloudTableWorker.buildRow(rowKey, firstLevelEntitiesByRowKey),
                                        coercedRow = CloudTableWorker.getRowInRuntimeFormat(buildResult.row, buildResult.rowKeys, primaryEntityForRow);
                                    tableData.push(coercedRow)
                                }
                            });
                            var primaryEntityOfTableHeader = firstLevelEntitiesByRowKey[CloudTableWorker.EntityPropertyValue_RowKey_TableHeader],
                                tableHeaderSnapshot = {
                                    timestampOfTableHeaderPrimaryEntity: primaryEntityOfTableHeader.Timestamp, etagOfTableHeaderPrimaryEntity: primaryEntityOfTableHeader[CloudTableWorker.EntityODataPropertyName_Etag], rowKeySetOfTableHeader: buildFirstLevelHeaderResult.rowKeys, tableHeaderRowData: firstLevelTableHeader
                                };
                            return {
                                    success: !0, result: {
                                            tableHeaderSnapshot: tableHeaderSnapshot, rootHeaderSnapshot: rootHeaderSnapshot, tableData: tableData
                                        }
                                }
                        }, CloudTableWorker.getRowInRuntimeFormat = function(row, rowKeys, primaryEntity) {
                            var coercedRow = row;
                            return coercedRow[AppMagic.Constants.Services.CloudTableRowKeysProperty] = rowKeys, coercedRow[AppMagic.Constants.Services.CloudTablePrimaryEntityEtagProperty] = primaryEntity[CloudTableWorker.EntityODataPropertyName_Etag], coercedRow
                        }, CloudTableWorker.buildRow = function(rowKey, entitiesByRowKey) {
                            var partNames = CloudTableWorker.EntityPropertyName_PartNames,
                                parts = [],
                                entity = entitiesByRowKey[rowKey],
                                entityRowKeys = [];
                            entityRowKeys.push(rowKey);
                            do {
                                var numPartsInThisRow = entity[CloudTableWorker.EntityPropertyName__NumPartsInEntity];
                                Contracts.check(numPartsInThisRow <= partNames.length);
                                for (var i = 0; i < numPartsInThisRow; i++)
                                    parts.push(entity[partNames[i]]);
                                var nextRowKey = entity[CloudTableWorker.EntityPropertyName__NextRowKey];
                                if (nextRowKey) {
                                    var nextRowKey = entity[CloudTableWorker.EntityPropertyName__NextRowKey];
                                    Contracts.checkNonEmpty(nextRowKey, "Data corruption in cloud table.");
                                    entityRowKeys.push(nextRowKey);
                                    entity = entitiesByRowKey[nextRowKey];
                                    Contracts.checkObject(entity, "Data corruption in cloud table. Entity not found in entity map.")
                                }
                            } while (nextRowKey);
                            var joined = parts.join(""),
                                row = JSON.parse(joined);
                            return {
                                    row: row, rowKeys: entityRowKeys
                                }
                        }, CloudTableWorker.prototype.removeRowFromTable = function(removeParameters) {
                            var azureTable = new Services.AzureTable(removeParameters.tableIdentifier.tableName, removeParameters.tableIdentifier.accountName, removeParameters.tableIdentifier.baseUri, removeParameters.tableIdentifier.keyBase64, removeParameters.tableIdentifier.accountResource),
                                timestampOfTableHeaderPrimaryEntity = removeParameters.tableHeaderSnapshot.timestampOfTableHeaderPrimaryEntity,
                                removeOperation = new Services.RemoveCloudTableRow(azureTable, removeParameters.rowKeySetOfRowToRemove, timestampOfTableHeaderPrimaryEntity, removeParameters.tableHeaderSnapshot.etagOfTableHeaderPrimaryEntity, removeParameters.tableHeaderSnapshot.rowKeySetOfTableHeader, removeParameters.tableHeaderSnapshot.tableHeaderRowData);
                            return removeOperation.performOperation().then(function(removeResult) {
                                    return removeResult.resultCode !== 0 ? WinJS.Promise.wrap({
                                            success: !1, message: "Remove from cloud table failed.", result: null
                                        }) : CloudTableWorker.queryLatestRowsSinceTimestamp(azureTable, timestampOfTableHeaderPrimaryEntity)
                                })
                        }, CloudTableWorker.prototype.editRowInTable = function(editParameters) {
                            var azureTable = new Services.AzureTable(editParameters.tableIdentifier.tableName, editParameters.tableIdentifier.accountName, editParameters.tableIdentifier.baseUri, editParameters.tableIdentifier.keyBase64, editParameters.tableIdentifier.accountResource),
                                editOperation = new Services.EditCloudTableRow(azureTable, editParameters.editeeRowData, editParameters.rowKeySetOfEditee, editParameters.tableHeaderSnapshot.timestampOfTableHeaderPrimaryEntity, editParameters.tableHeaderSnapshot.etagOfTableHeaderPrimaryEntity, editParameters.tableHeaderSnapshot.rowKeySetOfTableHeader, editParameters.tableHeaderSnapshot.tableHeaderRowData);
                            return editOperation.performOperation().then(function(editResult) {
                                    return editResult.resultCode !== 0 ? WinJS.Promise.wrap({
                                            success: !1, message: "Editing cloud table failed.", result: null
                                        }) : CloudTableWorker.queryLatestRowsSinceTimestamp(azureTable, editParameters.tableHeaderSnapshot.timestampOfTableHeaderPrimaryEntity).then(function(queryResult) {
                                            if (!queryResult.success)
                                                return WinJS.Promise.wrap({
                                                        success: queryResult.success, message: queryResult.message, result: null
                                                    });
                                            var editRowInTableResult = {
                                                    success: !0, message: null, result: {
                                                            etagForEditeePrimaryEntity: editResult.etagForEditeePrimaryEntity, rowKeySetOfEditeePrimaryEntity: editResult.rowKeySetForEditee, latestData: queryResult.result
                                                        }
                                                };
                                            return WinJS.Promise.wrap(editRowInTableResult)
                                        })
                                })
                        }, CloudTableWorker.prototype.setTableSchema = function(setParameters) {
                            var azureTable = new Services.AzureTable(setParameters.tableIdentifier.tableName, setParameters.tableIdentifier.accountName, setParameters.tableIdentifier.baseUri, setParameters.tableIdentifier.keyBase64, setParameters.tableIdentifier.accountResource),
                                scts = new Services.SetCloudTableSchema(azureTable, setParameters.schema, setParameters.rootHeaderSnapshot, setParameters.rootHeaderSnapshot.etagOfTableHeaderPrimaryEntity, setParameters.rootHeaderSnapshot.rowKeySetOfTableHeader);
                            return scts.performOperation().then(function(setResult) {
                                    return setResult.resultCode !== 0 ? WinJS.Promise.wrap({
                                            success: !1, message: "Setting cloud table schema failed.", result: null
                                        }) : CloudTableWorker.queryLatestRowsSinceTimestamp(azureTable, setParameters.tableHeaderSnapshot.timestampOfTableHeaderPrimaryEntity).then(function(queryResult) {
                                            if (!queryResult.success)
                                                return WinJS.Promise.wrap({
                                                        success: queryResult.success, message: queryResult.message, result: null
                                                    });
                                            var setSchemaResult = {
                                                    success: !0, message: null, result: {
                                                            etagForRootPrimaryEntity: setResult.etagForRootPrimaryEntity, rowKeySetForRootTableHeader: setResult.rowKeySetForRootTableHeader, latestData: queryResult.result
                                                        }
                                                };
                                            return WinJS.Promise.wrap(setSchemaResult)
                                        })
                                })
                        }, CloudTableWorker.prototype.listTables = function(listTablesParameters) {
                            var azureTableClient = new Services.AzureTableClient(listTablesParameters.accountName, listTablesParameters.baseUri, listTablesParameters.keyBase64, listTablesParameters.accountResource),
                                lct = new Services.ListCloudTables(azureTableClient);
                            return lct.performOperation().then(function(listTablesResult) {
                                    return listTablesResult.resultCode !== 0 ? WinJS.Promise.wrap({
                                            success: !1, message: "Listing cloud tables failed.", result: null
                                        }) : WinJS.Promise.wrap({
                                            success: !0, message: null, result: {tables: listTablesResult.tables}
                                        })
                                })
                        }, CloudTableWorker.prototype.deleteTable = function(deleteParameters) {
                            var azureTable = new Services.AzureTable(deleteParameters.tableName, deleteParameters.accountName, deleteParameters.baseUri, deleteParameters.keyBase64, deleteParameters.accountResource);
                            return azureTable.deleteTable().then(function(response) {
                                    return response !== 0 ? WinJS.Promise.wrap({
                                            success: !1, message: "Unable to delete table."
                                        }) : WinJS.Promise.wrap({success: !0})
                                })
                        }, CloudTableWorker.EntityPropertyName_PartitionKey = "PartitionKey", CloudTableWorker.EntityPropertyName_RowKey = "RowKey", CloudTableWorker.EntityPropertyName__Version = "_Version", CloudTableWorker.EntityPropertyName__NextRowKey = "_NextRowKey", CloudTableWorker.EntityPropertyName__NumPartsInEntity = "_NumPartsInEntity", CloudTableWorker.EntityPropertyName_PartNames = ["Part0", "Part1", "Part2", "Part3", "Part4", "Part5", "Part6", "Part7"], CloudTableWorker.EntityODataPropertyName_Etag = "odata.etag", CloudTableWorker.EntityPropertyValue__Version_1 = "1.0", CloudTableWorker.NonTableHeaderRowKeyAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", CloudTableWorker.ReservedPrefix = String.fromCharCode(61440), CloudTableWorker.EntityPropertyValue_PartitionKey_Root = CloudTableWorker.ReservedPrefix + "_p0", CloudTableWorker.EntityPropertyValue_PartitionKey_FirstLevel = CloudTableWorker.ReservedPrefix + "_p1", CloudTableWorker.EntityPropertyValue_RowKey_TableHeader = CloudTableWorker.ReservedPrefix + "table_header", CloudTableWorker.EntityPropertyValue_RowKey_Version = CloudTableWorker.ReservedPrefix + "version", CloudTableWorker.EntityPropertyValue_RowKey_TableHeaderExclusiveUpperBound = CloudTableWorker.ReservedPrefix + "table_heades", CloudTableWorker.TableHeaderKey_Rows = "rows", CloudTableWorker.TableHeaderKey_Schema = "schema", CloudTableWorker.TableHeaderKey_DisplayName = "displayName", CloudTableWorker.CharactersPerPart = 32768, CloudTableWorker.Regex_StringifiedDataToParts = new RegExp("(.{1," + CloudTableWorker.CharactersPerPart + "})", "g"), CloudTableWorker.PartsPerEntity = CloudTableWorker.EntityPropertyName_PartNames.length, CloudTableWorker.FilterStringFormat_queryEntities = "PartitionKey eq '{0}' or PartitionKey eq '{1}'", CloudTableWorker.FilterStringFormat_queryLatestRowsSinceTimestamp = "PartitionKey eq '{0}' or Timestamp gt datetime'{1}' or (RowKey ge '{2}' and RowKey lt '{3}')", CloudTableWorker.FilterStringFormat_queryLatestRowInfoSinceTimestamp = "PartitionKey eq '{0}' and (Timestamp ge datetime'{1}' or (RowKey ge '{2}' and RowKey lt '{3}'))", CloudTableWorker.FilterStringFormat_queryLatestRootInfo = "PartitionKey eq '{0}'", CloudTableWorker
            }();
        Services.CloudTableWorker = CloudTableWorker;
        var CloudTableWorkerController = function() {
                function CloudTableWorkerController(dispatcher) {
                    this._workerHandle = dispatcher.createWorker(["AppMagic", "Services", "CloudTableWorker"], [])
                }
                return CloudTableWorkerController.prototype._handleInvokeWorkerResponse = function(response) {
                        return WinJS.Promise.wrap(response.result)
                    }, CloudTableWorkerController.prototype.createCloudTableWithUniqueName = function(suggestedTableName, accountName, baseUri, accountResource, keyBase64) {
                        var _this = this,
                            creationInfo = {
                                suggestedTableName: suggestedTableName, accountName: accountName, baseUri: baseUri, keyBase64: keyBase64, accountResource: accountResource
                            };
                        return this._workerHandle.invokeWorker(CloudTableWorkerController.OpName_createUniqueTable, [creationInfo]).then(function(response) {
                                return _this._handleInvokeWorkerResponse(response)
                            })
                    }, CloudTableWorkerController.prototype.queryEntities = function(tableName, accountName, baseUri, accountResource, keyBase64) {
                            var _this = this,
                                queryParameters = {
                                    tableName: tableName, accountName: accountName, baseUri: baseUri, keyBase64: keyBase64, accountResource: accountResource
                                };
                            return this._workerHandle.invokeWorker(CloudTableWorkerController.OpName_queryEntities, [queryParameters]).then(function(response) {
                                    return _this._handleInvokeWorkerResponse(response)
                                })
                        }, CloudTableWorkerController.prototype.insertRowToTable = function(tableName, accountName, baseUri, accountResource, keyBase64, row, tableHeaderSnapshot) {
                            var _this = this;
                            var parameters = {
                                    tableIdentifier: {
                                        tableName: tableName, accountName: accountName, baseUri: baseUri, keyBase64: keyBase64, accountResource: accountResource
                                    }, tableHeaderSnapshot: tableHeaderSnapshot, insertedRowData: row
                                };
                            return this._workerHandle.invokeWorker(CloudTableWorkerController.OpName_insertRowToTable, [parameters]).then(function(response) {
                                    return _this._handleInvokeWorkerResponse(response)
                                })
                        }, CloudTableWorkerController.prototype.removeRowFromTable = function(tableName, accountName, baseUri, accountResource, keyBase64, rowKeySetOfRowToRemove, tableHeaderSnapshot) {
                            var _this = this;
                            var parameters = {
                                    tableIdentifier: {
                                        tableName: tableName, accountName: accountName, baseUri: baseUri, keyBase64: keyBase64, accountResource: accountResource
                                    }, tableHeaderSnapshot: tableHeaderSnapshot, rowKeySetOfRowToRemove: rowKeySetOfRowToRemove
                                };
                            return this._workerHandle.invokeWorker(CloudTableWorkerController.OpName_removeRowFromTable, [parameters]).then(function(response) {
                                    return _this._handleInvokeWorkerResponse(response)
                                })
                        }, CloudTableWorkerController.prototype.editRowInTable = function(tableName, accountName, baseUri, accountResource, keyBase64, editeeRowData, rowKeySetOfEditee, tableHeaderSnapshot) {
                            var _this = this;
                            var parameters = {
                                    tableIdentifier: {
                                        tableName: tableName, accountName: accountName, baseUri: baseUri, keyBase64: keyBase64, accountResource: accountResource
                                    }, tableHeaderSnapshot: tableHeaderSnapshot, editeeRowData: editeeRowData, rowKeySetOfEditee: rowKeySetOfEditee
                                };
                            return this._workerHandle.invokeWorker(CloudTableWorkerController.OpName_editRowInTable, [parameters]).then(function(response) {
                                    return _this._handleInvokeWorkerResponse(response)
                                })
                        }, CloudTableWorkerController.prototype.setTableSchema = function(tableName, accountName, baseUri, accountResource, keyBase64, schema, rootHeaderSnapshot, tableHeaderSnapshot) {
                            var _this = this;
                            var parameters = {
                                    tableIdentifier: {
                                        tableName: tableName, accountName: accountName, baseUri: baseUri, keyBase64: keyBase64, accountResource: accountResource
                                    }, rootHeaderSnapshot: rootHeaderSnapshot, schema: schema, tableHeaderSnapshot: tableHeaderSnapshot
                                };
                            return this._workerHandle.invokeWorker(CloudTableWorkerController.OpName_setTableSchema, [parameters]).then(function(response) {
                                    return _this._handleInvokeWorkerResponse(response)
                                })
                        }, CloudTableWorkerController.prototype.listTables = function(accountName, baseUri, accountResource, keyBase64) {
                            var _this = this,
                                parameters = {
                                    accountName: accountName, baseUri: baseUri, keyBase64: keyBase64, accountResource: accountResource
                                };
                            return this._workerHandle.invokeWorker(CloudTableWorkerController.OpName_listTables, [parameters]).then(function(response) {
                                    return _this._handleInvokeWorkerResponse(response)
                                })
                        }, CloudTableWorkerController.prototype.deleteTable = function(tableName, accountName, baseUri, accountResource, keyBase64) {
                            var _this = this,
                                parameters = {
                                    tableName: tableName, accountName: accountName, baseUri: baseUri, keyBase64: keyBase64, accountResource: accountResource
                                };
                            return this._workerHandle.invokeWorker(CloudTableWorkerController.OpName_deleteTable, [parameters]).then(function(response) {
                                    return _this._handleInvokeWorkerResponse(response)
                                })
                        }, CloudTableWorkerController.OpName_createUniqueTable = "createCloudTableWithUniqueName", CloudTableWorkerController.OpName_queryEntities = "queryEntities", CloudTableWorkerController.OpName_insertRowToTable = "insertRowToTable", CloudTableWorkerController.OpName_removeRowFromTable = "removeRowFromTable", CloudTableWorkerController.OpName_editRowInTable = "editRowInTable", CloudTableWorkerController.OpName_setTableSchema = "setTableSchema", CloudTableWorkerController.OpName_listTables = "listTables", CloudTableWorkerController.OpName_deleteTable = "deleteTable", CloudTableWorkerController
            }();
        Services.CloudTableWorkerController = CloudTableWorkerController
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        (function(CloudTableWorkerReplaceRowResultCode) {
            CloudTableWorkerReplaceRowResultCode[CloudTableWorkerReplaceRowResultCode.Success = 0] = "Success";
            CloudTableWorkerReplaceRowResultCode[CloudTableWorkerReplaceRowResultCode.UnknownError = 1] = "UnknownError";
            CloudTableWorkerReplaceRowResultCode[CloudTableWorkerReplaceRowResultCode.OneOrMoreWritesFailed = 2] = "OneOrMoreWritesFailed";
            CloudTableWorkerReplaceRowResultCode[CloudTableWorkerReplaceRowResultCode.PreconditionNotMet = 3] = "PreconditionNotMet"
        })(Services.CloudTableWorkerReplaceRowResultCode || (Services.CloudTableWorkerReplaceRowResultCode = {}));
        var CloudTableWorkerReplaceRowResultCode = Services.CloudTableWorkerReplaceRowResultCode
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceUtility;
        (function(ServiceUtility) {
            function createSuccessfulVoidAsyncResult() {
                return {success: !0}
            }
            ServiceUtility.createSuccessfulVoidAsyncResult = createSuccessfulVoidAsyncResult;
            function createSuccessfulAsyncResult(result) {
                return {
                        success: !0, result: result
                    }
            }
            ServiceUtility.createSuccessfulAsyncResult = createSuccessfulAsyncResult;
            function createUnsuccessfulAsyncResult(msg) {
                return {
                        success: !1, message: msg
                    }
            }
            ServiceUtility.createUnsuccessfulAsyncResult = createUnsuccessfulAsyncResult;
            function createUnsuccessfulAsyncResultFromOther(other) {
                return {
                        success: !1, message: other.message
                    }
            }
            ServiceUtility.createUnsuccessfulAsyncResultFromOther = createUnsuccessfulAsyncResultFromOther;
            function createSuccessfulValueExpressionResult(value) {
                return {
                        success: !0, value: value
                    }
            }
            ServiceUtility.createSuccessfulValueExpressionResult = createSuccessfulValueExpressionResult;
            function createUnsuccessfulValueExpressionResult(message) {
                return message ? {
                        success: !1, message: message
                    } : {success: !1}
            }
            ServiceUtility.createUnsuccessfulValueExpressionResult = createUnsuccessfulValueExpressionResult;
            function pipelineResultIdentityFunction(pipelineResult) {
                return pipelineResult
            }
            ServiceUtility.pipelineResultIdentityFunction = pipelineResultIdentityFunction;
            function valueExpressionResultIdentityFunction(exprResult) {
                return exprResult
            }
            ServiceUtility.valueExpressionResultIdentityFunction = valueExpressionResultIdentityFunction;
            function valueExpressionResultToPipelineResult(exprResult) {
                return exprResult.success ? {
                        success: !0, result: exprResult.value
                    } : {
                        success: !1, message: exprResult.message
                    }
            }
            ServiceUtility.valueExpressionResultToPipelineResult = valueExpressionResultToPipelineResult;
            function pipelineResultToValueExpressionResult(pipelineResult) {
                return pipelineResult.success ? {
                        success: !0, value: pipelineResult.result
                    } : {
                        success: !1, message: pipelineResult.message
                    }
            }
            ServiceUtility.pipelineResultToValueExpressionResult = pipelineResultToValueExpressionResult;
            function promiseErrorToAsyncResult(error) {
                switch (typeof error) {
                    case"object":
                        if (Core.Utility.isCanceledError(error))
                            throw error;
                        return typeof error.success == "boolean" ? error : typeof error.message != "undefined" ? {
                                success: !1, message: error.message.toString()
                            } : {success: !1};
                    case"undefined":
                        return {success: !1};
                    case"string":
                    default:
                        return {
                                success: !1, message: error.toString()
                            }
                }
            }
            ServiceUtility.promiseErrorToAsyncResult = promiseErrorToAsyncResult;
            function promiseErrorToValueExpressionResult(error) {
                return pipelineResultToValueExpressionResult(promiseErrorToAsyncResult(error))
            }
            ServiceUtility.promiseErrorToValueExpressionResult = promiseErrorToValueExpressionResult
        })(ServiceUtility = Services.ServiceUtility || (Services.ServiceUtility = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceFunctionBase = function() {
                function ServiceFunctionBase(service, functionDef, name, docId, disableTryIt, isHiddenFromRules, isShownInBackstage, parameters) {
                    this._service = service;
                    this.functionDefinition = functionDef;
                    this._name = name;
                    this._docId = docId;
                    this._disableTryIt = disableTryIt;
                    this._isHiddenFromRules = isHiddenFromRules;
                    this._isShownInBackstage = isShownInBackstage;
                    this._parameters = parameters
                }
                return Object.defineProperty(ServiceFunctionBase.prototype, "service", {
                        get: function() {
                            return this._service
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(ServiceFunctionBase.prototype, "name", {
                        get: function() {
                            return this._name
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(ServiceFunctionBase.prototype, "docId", {
                            get: function() {
                                return this._docId
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ServiceFunctionBase.prototype, "disableTryIt", {
                            get: function() {
                                return this._disableTryIt
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ServiceFunctionBase.prototype, "isHiddenFromRules", {
                            get: function() {
                                return this._isHiddenFromRules
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ServiceFunctionBase.prototype, "isShownInBackstage", {
                            get: function() {
                                return this._isShownInBackstage
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ServiceFunctionBase.prototype, "isBehaviorOnly", {
                            get: function() {
                                return !0
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ServiceFunctionBase.prototype, "parameters", {
                            get: function() {
                                return this._parameters
                            }, enumerable: !0, configurable: !0
                        }), ServiceFunctionBase.prototype.getParameter = function(name) {
                            for (var i = 0; i < this._parameters.length; i++)
                                if (this._parameters[i].name === name)
                                    return this._parameters[i];
                            return null
                        }, ServiceFunctionBase.prototype.getVariable = function(name) {
                            return null
                        }, ServiceFunctionBase.prototype.computeResultSchema = function(maxSchemaDepth) {
                            return null
                        }, ServiceFunctionBase.prototype.runAsync = function(parameterValues, onBeforeAsyncStep, onAfterAsyncStep) {
                            return null
                        }, ServiceFunctionBase
            }();
        Services.ServiceFunctionBase = ServiceFunctionBase
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var CompositeServiceFunction = function(_super) {
                __extends(CompositeServiceFunction, _super);
                function CompositeServiceFunction(service, functionDef, name, docId, disableTryIt, isHiddenFromRules, isShownInBackstage, parameters, variables, returnExpression) {
                    _super.call(this, service, functionDef, name, docId, disableTryIt, isHiddenFromRules, isShownInBackstage, parameters);
                    this._variables = variables;
                    this._returnExpression = returnExpression
                }
                return Object.defineProperty(CompositeServiceFunction.prototype, "isBehaviorOnly", {
                        get: function() {
                            var _this = this;
                            return this._variables.some(function(variable) {
                                    return variable.valueExpression.isBehaviorOnly(_this)
                                }) || this._returnExpression.isBehaviorOnly(this)
                        }, enumerable: !0, configurable: !0
                    }), CompositeServiceFunction.prototype.getVariable = function(name) {
                        for (var i = 0; i < this._variables.length; i++)
                            if (this._variables[i].name === name)
                                return this._variables[i];
                        return null
                    }, CompositeServiceFunction.prototype.computeResultSchema = function(maxSchemaDepth) {
                            var resultSchema = this._returnExpression.computeResultSchema(this, maxSchemaDepth);
                            return resultSchema
                        }, CompositeServiceFunction.prototype.runAsync = function(parameterValues, onBeforeAsyncStep, onAfterAsyncStep) {
                            var _this = this;
                            var variableValues = {},
                                executionContext = new Services.FunctionExecutionContext(this, parameterValues, variableValues, onBeforeAsyncStep, onAfterAsyncStep);
                            return this.executeVariablesAsync(executionContext).then(function(asyncResult) {
                                    return asyncResult.success ? _this._returnExpression.evaluateAsync(executionContext).then(Services.ServiceUtility.valueExpressionResultToPipelineResult) : WinJS.Promise.wrap(Services.ServiceUtility.createUnsuccessfulAsyncResultFromOther(asyncResult))
                                }).then(Services.ServiceUtility.pipelineResultIdentityFunction, Services.ServiceUtility.promiseErrorToAsyncResult)
                        }, CompositeServiceFunction.prototype.executeVariablesAsync = function(executionContext) {
                            var variableExecPromise = WinJS.Promise.wrap(Services.ServiceUtility.createSuccessfulVoidAsyncResult());
                            return this._variables.forEach(function(variable) {
                                    variableExecPromise = variableExecPromise.then(function(prevAsyncResult) {
                                        return prevAsyncResult.success ? variable.valueExpression.evaluateAsync(executionContext).then(function(evaluateResult) {
                                                return evaluateResult.success ? (executionContext.addVariable(variable.name, new AppMagic.Services.PrimitiveDArgument(evaluateResult.value)), Services.ServiceUtility.createSuccessfulVoidAsyncResult()) : Services.ServiceUtility.valueExpressionResultToPipelineResult(evaluateResult)
                                            }) : WinJS.Promise.wrap(prevAsyncResult)
                                    })
                                }), variableExecPromise
                        }, CompositeServiceFunction
            }(Services.ServiceFunctionBase);
        Services.CompositeServiceFunction = CompositeServiceFunction
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var CreateCloudTable = function() {
                function CreateCloudTable(suggestedName, accountName, baseUri, keyBase64, accountResource) {
                    this._suggestedName = suggestedName;
                    this._accountName = accountName;
                    this._baseUri = baseUri;
                    this._keyBase64 = keyBase64;
                    this._accountResource = accountResource
                }
                return CreateCloudTable.prototype.performOperation = function() {
                        return this._performOperation(!1)
                    }, CreateCloudTable.prototype._performOperation = function(appendSuffix) {
                        var _this = this,
                            nameToTry = this._suggestedName;
                        appendSuffix && (nameToTry = nameToTry + AppMagic.Utility.generateRandomString(10));
                        var azureTable = new Services.AzureTable(nameToTry, this._accountName, this._baseUri, this._keyBase64, this._accountResource);
                        return azureTable.createTable().then(function(response) {
                                return response === 0 ? _this._writeInitialTableMetadata(azureTable, nameToTry) : response === 4 ? _this._performOperation(!0) : WinJS.Promise.wrap({
                                        success: !1, result: null, message: "Cloud table creation failed for unknown reason."
                                    })
                            })
                    }, CreateCloudTable.prototype._appendRowToWriteInfo = function(rowData, partitionKey, rowKeyOfPrimaryEntity, rowKeyGenerator, entityWriteInfo) {
                            var entitiesAndRowKeys = Services.CloudTableWorker.getEntitiesForRow(rowData, rowKeyOfPrimaryEntity, rowKeyGenerator),
                                entities = entitiesAndRowKeys.entities,
                                rowKeySet = entitiesAndRowKeys.rowKeySet;
                            Services.CloudTableWorker.appendWriteEntityInfo(entities, partitionKey, rowKeySet, entityWriteInfo, 0)
                        }, CreateCloudTable.prototype._writeInitialTableMetadata = function(azureTable, tableName) {
                            var entityWriteInfo = [],
                                initialRootHeaderData = {
                                    displayName: tableName, schema: AppMagic.Schema.createSchemaForArrayFromPointer([])
                                };
                            this._appendRowToWriteInfo(initialRootHeaderData, Services.CloudTableWorker.EntityPropertyValue_PartitionKey_Root, Services.CloudTableWorker.EntityPropertyValue_RowKey_TableHeader, Services.CloudTableWorker.generateTableHeaderRowKey, entityWriteInfo);
                            var versionRow = {};
                            versionRow[Services.CloudTableWorker.EntityPropertyName__Version] = Services.CloudTableWorker.EntityPropertyValue__Version_1;
                            entityWriteInfo.push({
                                jsonPayload: versionRow, partitionKey: Services.CloudTableWorker.EntityPropertyValue_PartitionKey_Root, rowKey: Services.CloudTableWorker.EntityPropertyValue_RowKey_Version
                            });
                            var firstLevelHeaderData = {rows: []};
                            return this._appendRowToWriteInfo(firstLevelHeaderData, Services.CloudTableWorker.EntityPropertyValue_PartitionKey_FirstLevel, Services.CloudTableWorker.EntityPropertyValue_RowKey_TableHeader, Services.CloudTableWorker.generateTableHeaderRowKey, entityWriteInfo), Services.CloudTableWorker.writeEntities(azureTable, entityWriteInfo).then(function(response) {
                                    return response.allSucceeded ? WinJS.Promise.wrap({
                                            success: !0, result: tableName
                                        }) : WinJS.Promise.wrap({
                                            success: !1, message: "Failed to write initial data for cloud table.", result: null
                                        })
                                })
                        }, CreateCloudTable
            }();
        Services.CreateCloudTable = CreateCloudTable
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DataSources;
    (function(DataSources) {
        var LocalTableProvider = function() {
                function LocalTableProvider(runtime, dataSource) {
                    this._providerData = null;
                    this._runtime = runtime;
                    this._dataSource = dataSource;
                    this._tableId = this._runtime.generateId()
                }
                return LocalTableProvider.prototype.initializeProvider = function() {
                        var savedData = this._dataSource.getData();
                        this._providerData = new DataSources.ProviderData(this._runtime);
                        for (var i = 0, len = savedData.length; i < len; i++)
                            this._providerData.pushRow(savedData[i].row);
                        var storedSchema = this._dataSource.getSchema();
                        return this._setSchema(storedSchema), this._rowIdsAreDirty = !1, WinJS.Promise.wrap({
                                    success: !0, message: null, result: null
                                })
                    }, LocalTableProvider.prototype.getDataWithRowIds = function() {
                        var _this = this;
                        Contracts.check(this._isInitialized());
                        this._assignNewRowIdsIfDirty();
                        var dataWithEmbeddedRowIds = this._providerData.getDataWithRowIds().map(function(rowItem) {
                                var row = rowItem.row;
                                return DataSources.ProviderDataCoercer.coerceRowToSchema(row, _this._schema), row[_this._runtime.idProperty] = rowItem.rowId, row
                            });
                        return AppMagic.Utility.createOrSetPrivate(dataWithEmbeddedRowIds, this._runtime.idProperty, this._tableId), dataWithEmbeddedRowIds
                    }, LocalTableProvider.prototype.getDataWithRowHandles = function() {
                            var _this = this;
                            return Contracts.check(this._isInitialized()), this._providerData.getDataWithHandles().map(function(rowItem) {
                                    var row = rowItem.row;
                                    return DataSources.ProviderDataCoercer.coerceRowToSchema(row, _this._schema), row[LocalTableProvider.RowHandleProperty] = rowItem.handle, row
                                })
                        }, LocalTableProvider.prototype.forEachRowHandle = function(callback) {
                            Contracts.check(this._isInitialized());
                            this._providerData.forEachRowHandle(callback)
                        }, Object.defineProperty(LocalTableProvider.prototype, "schema", {
                            get: function() {
                                return Contracts.check(this._isInitialized()), AppMagic.Utility.jsonClone(this._schema)
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(LocalTableProvider.prototype, "schemaString", {
                            get: function() {
                                return Contracts.check(this._isInitialized()), this._schemaString
                            }, enumerable: !0, configurable: !0
                        }), LocalTableProvider.prototype.addRow = function(insertedRow) {
                            Contracts.check(this._isInitialized());
                            var newRowHandle = this._providerData.pushRow(insertedRow);
                            return this._commitData(), newRowHandle
                        }, LocalTableProvider.prototype.removeRow = function(rowHandle) {
                            Contracts.check(this._isInitialized());
                            this._providerData.removeRow(rowHandle);
                            this._commitData()
                        }, LocalTableProvider.prototype.editRowProperty = function(rowHandle, propertyName, value) {
                            Contracts.check(this._isInitialized());
                            var getResult = this._providerData.getRowByHandle(rowHandle);
                            getResult.row[propertyName] !== value && (this._providerData.editRowProperty(rowHandle, propertyName, value), this._commitData())
                        }, LocalTableProvider.prototype.getRowByHandle = function(rowHandle) {
                            if (!this._isInitialized())
                                return undefined;
                            var getResult = this._providerData.getRowByHandle(rowHandle);
                            if (getResult === null)
                                return undefined;
                            var row = getResult.row;
                            return DataSources.ProviderDataCoercer.coerceRowToSchema(row, this._schema), row[LocalTableProvider.RowHandleProperty] = getResult.handle, row
                        }, LocalTableProvider.prototype.getRowHandle = function(row) {
                            var rowHandle = row[LocalTableProvider.RowHandleProperty];
                            return Core.Utility.isDefined(rowHandle) ? rowHandle : null
                        }, LocalTableProvider.prototype.setSchema = function(schema) {
                            this._setSchema(schema);
                            this._rowIdsAreDirty = !0;
                            this._dataSource.setSchema(schema);
                            this._fireDataSourceChangeEvent()
                        }, LocalTableProvider.prototype._setSchema = function(schema) {
                            this._schema = AppMagic.Utility.jsonClone(schema);
                            this._schemaString = AppMagic.Schema.getSchemaString(schema)
                        }, LocalTableProvider.prototype._assignNewRowIdsIfDirty = function() {
                            this._rowIdsAreDirty && (this._providerData.assignNewRowIds(), this._rowIdsAreDirty = !1)
                        }, LocalTableProvider.prototype._commitData = function() {
                            this._dataSource.setData(this._providerData.getDataWithHandles());
                            this._fireDataSourceChangeEvent()
                        }, LocalTableProvider.prototype._fireDataSourceChangeEvent = function() {
                            this._runtime.onDataSourceChanged(this._dataSource.name)
                        }, LocalTableProvider.prototype._isInitialized = function() {
                            return this._providerData !== null
                        }, LocalTableProvider.RowHandleProperty = "_rowHandle_0506a75d-3fec-4f70-b17c-2af449edf94a", LocalTableProvider
            }();
        DataSources.LocalTableProvider = LocalTableProvider
    })(DataSources = AppMagic.DataSources || (AppMagic.DataSources = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Schema;
    (function(Schema) {
        Schema.KeyName = "name";
        Schema.KeyType = "type";
        Schema.KeyPtr = "ptr";
        Schema.TypeArray = "array";
        Schema.TypeObject = "object";
        Schema.TypeControl = "v";
        Schema.TypeBoolean = "b";
        Schema.TypeCurrency = "$";
        Schema.TypeDateTime = "d";
        Schema.TypeHyperlink = "h";
        Schema.TypePenImage = "p";
        Schema.TypeColor = "c";
        Schema.TypeImage = "i";
        Schema.TypeMedia = "m";
        Schema.TypeNumber = "n";
        Schema.TypeString = "s";
        var PrimitiveTypes = [AppMagic.Schema.TypeBoolean, AppMagic.Schema.TypeNumber, AppMagic.Schema.TypeString, AppMagic.Schema.TypeHyperlink, AppMagic.Schema.TypeImage, AppMagic.Schema.TypeMedia, AppMagic.Schema.TypeCurrency, AppMagic.Schema.TypePenImage, AppMagic.Schema.TypeDateTime, AppMagic.Schema.TypeColor, ],
            ComplexTypes = [AppMagic.Schema.TypeArray, AppMagic.Schema.TypeObject, AppMagic.Schema.TypeControl, ],
            AllTypes = PrimitiveTypes.concat(ComplexTypes);
        function createSchemaForSimple(schemaType, schemaItemName) {
            var schema = {type: schemaType};
            return typeof schemaItemName == "string" && (schema.name = schemaItemName), schema
        }
        Schema.createSchemaForSimple = createSchemaForSimple;
        function _createSchemaFromPointer(complexType, schemaPointer, schemaItemName) {
            var schema = {
                    type: complexType, ptr: schemaPointer
                };
            return typeof schemaItemName == "string" && (schema.name = schemaItemName), schema
        }
        function createSchemaForArrayFromPointer(schemaPointer, schemaItemName) {
            return _createSchemaFromPointer(Schema.TypeArray, schemaPointer, schemaItemName)
        }
        Schema.createSchemaForArrayFromPointer = createSchemaForArrayFromPointer;
        function createSchemaForObjectFromPointer(schemaPointer, schemaItemName) {
            return _createSchemaFromPointer(Schema.TypeObject, schemaPointer, schemaItemName)
        }
        Schema.createSchemaForObjectFromPointer = createSchemaForObjectFromPointer;
        function getSchemaOfProperty(parentSchema, propertyName) {
            for (var arr = parentSchema.ptr, len = arr.length, schema, i = 0; i < len; i++) {
                var propSchema = arr[i],
                    name = propSchema.invariantName ? propSchema.invariantName : propSchema.name;
                if (name === propertyName)
                    return propSchema
            }
            return null
        }
        Schema.getSchemaOfProperty = getSchemaOfProperty;
        function isSchemaOfTypeArray(schema) {
            return schema.type === Schema.TypeArray
        }
        Schema.isSchemaOfTypeArray = isSchemaOfTypeArray;
        function isSchemaOfTypeObject(schema) {
            return schema.type === Schema.TypeObject
        }
        Schema.isSchemaOfTypeObject = isSchemaOfTypeObject;
        function isSchemaOfPrimitiveType(schema) {
            return PrimitiveTypes.indexOf(schema.type) >= 0
        }
        Schema.isSchemaOfPrimitiveType = isSchemaOfPrimitiveType;
        function isSchemaOfType(schema, type) {
            return schema.type === type
        }
        Schema.isSchemaOfType = isSchemaOfType;
        function getSchemaString(schema) {
            if (PrimitiveTypes.indexOf(schema.type) >= 0)
                return schema.type;
            var complexSchema = schema;
            var isTable = isSchemaOfTypeArray(complexSchema);
            return AppMagic.Utility.stringizeSchema(complexSchema.ptr, isTable)
        }
        Schema.getSchemaString = getSchemaString;
        function getChildSchemaAtMemberNameOrIndex(schema, memberNameOrIndex) {
            if (schema.type === Schema.TypeArray) {
                if (memberNameOrIndex.match(/[^\d]/) !== null)
                    return null;
                var arraySchema = schema,
                    recordSchema = AppMagic.Utility.clone(arraySchema, !0);
                return recordSchema.type = Schema.TypeObject, recordSchema
            }
            else if (schema.type === Schema.TypeObject) {
                var recordSchema = schema;
                return getSchemaOfProperty(recordSchema, memberNameOrIndex)
            }
            else
                return null
        }
        Schema.getChildSchemaAtMemberNameOrIndex = getChildSchemaAtMemberNameOrIndex;
        function getSchemaFollowingDataJsonPointer(schema, jsonPointer) {
            var tryPopResult = AppMagic.Utility.tryPopFirstDecodedReferenceToken(jsonPointer);
            if (!tryPopResult.success)
                return schema;
            var childSchema = getChildSchemaAtMemberNameOrIndex(schema, tryPopResult.firstToken);
            return childSchema == null ? null : getSchemaFollowingDataJsonPointer(childSchema, tryPopResult.nextPointer)
        }
        Schema.getSchemaFollowingDataJsonPointer = getSchemaFollowingDataJsonPointer;
        function compareSchemas(l, r) {
            return l[Schema.KeyName].localeCompare(r[Schema.KeyName])
        }
        function schemasAreEqual(schema0, schema1) {
            if (schema0[Schema.KeyType] !== schema1[Schema.KeyType])
                return !1;
            var type = schema0[Schema.KeyType];
            if (type === Schema.TypeArray || type === Schema.TypeObject || type === Schema.TypeControl) {
                var ptr0 = schema0[Schema.KeyPtr].slice(0),
                    ptr1 = schema1[Schema.KeyPtr].slice(0);
                if (ptr0.length !== ptr1.length)
                    return !1;
                ptr0.sort(compareSchemas);
                ptr1.sort(compareSchemas);
                for (var i = 0, len = ptr0.length; i < len; i++) {
                    if (ptr0[i][Schema.KeyName] !== ptr1[i][Schema.KeyName])
                        return !1;
                    var result = schemasAreEqual(ptr0[i], ptr1[i]);
                    if (!result)
                        return !1
                }
            }
            return !0
        }
        Schema.schemasAreEqual = schemasAreEqual;
        function propertyExistPredicate(item, propertyName) {
            return item.invariantName ? item.invariantName === propertyName : item.name === propertyName
        }
        function addSchemaMember(schema, name, type) {
            Contracts.check(schema.ptr.every(function(item) {
                return !propertyExistPredicate(item, name)
            }), "Member already exists.");
            schema.ptr.push({
                name: name, type: type
            })
        }
        Schema.addSchemaMember = addSchemaMember;
        function containsSchemaMember(schema, name) {
            return schema.ptr.some(function(item) {
                    return propertyExistPredicate(item, name)
                })
        }
        Schema.containsSchemaMember = containsSchemaMember;
        function removeSchemaMember(schema, name) {
            for (var i = 0, len = schema.ptr.length; i < len; i++) {
                var member = schema.ptr[i];
                if (propertyExistPredicate(member, name)) {
                    schema.ptr.splice(i, 1);
                    return
                }
            }
            Contracts.check(!1, "Member not found.")
        }
        Schema.removeSchemaMember = removeSchemaMember
    })(Schema = AppMagic.Schema || (AppMagic.Schema = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DataSources;
    (function(DataSources) {
        var Dictionary = Collections.Generic.Dictionary,
            ProviderData = function() {
                function ProviderData(runtime) {
                    this._data = [];
                    this._nextRowHandle = 0;
                    this._rowIdByRowHandle = new Dictionary;
                    this._runtime = runtime
                }
                return ProviderData.prototype.getDataWithRowIds = function() {
                        var _this = this;
                        return this._data.map(function(rowItem) {
                                var row = AppMagic.Utility.jsonClone(rowItem.row);
                                return {
                                        rowId: _this._getRowIdForHandle(rowItem.handle), row: row
                                    }
                            })
                    }, ProviderData.prototype.forEachRowHandle = function(callback) {
                        this._data.map(function(rowItem) {
                            return rowItem.handle
                        }).forEach(function(rowHandle) {
                            callback(rowHandle)
                        })
                    }, ProviderData.prototype.getDataWithHandles = function() {
                            return AppMagic.Utility.jsonClone(this._data)
                        }, ProviderData.prototype.getRowByHandle = function(rowHandle) {
                            var getResult = this._getRowByRowHandle(rowHandle);
                            return getResult.index < 0 ? null : AppMagic.Utility.jsonClone(getResult.rowItem)
                        }, ProviderData.prototype.pushRow = function(row) {
                            Object.keys(row).forEach(function(propertyName) {
                                Contracts.check(!AppMagic.Utility.isOpenAjaxControl(row[propertyName]))
                            });
                            var rowCopy = AppMagic.Utility.jsonClone(row),
                                rowHandle = this._getNextRowHandle();
                            return this._data.push({
                                    handle: rowHandle, row: rowCopy
                                }), this._assignNewRowIdForRowHandle(rowHandle), rowHandle
                        }, ProviderData.prototype.removeRow = function(rowHandle) {
                            var getRowResult = this._getRowByRowHandle(rowHandle);
                            this._data.splice(getRowResult.index, 1);
                            this._rowIdByRowHandle.deleteValue(rowHandle)
                        }, ProviderData.prototype.editRowProperty = function(rowHandle, propertyName, value) {
                            var getRowResult = this._getRowByRowHandle(rowHandle);
                            getRowResult.rowItem.row[propertyName] = value;
                            this._assignNewRowIdForRowHandle(rowHandle)
                        }, ProviderData.prototype.assignNewRowIds = function() {
                            var _this = this;
                            this._data.forEach(function(rowItem) {
                                _this._assignNewRowIdForRowHandle(rowItem.handle)
                            })
                        }, ProviderData.prototype._assignNewRowIdForRowHandle = function(rowHandle) {
                            var rowId = this._runtime.generateId();
                            this._rowIdByRowHandle.setValue(rowHandle, rowId)
                        }, ProviderData.prototype._getNextRowHandle = function() {
                            return (this._nextRowHandle++).toString()
                        }, ProviderData.prototype._getRowIdForHandle = function(rowHandle) {
                            return this._rowIdByRowHandle.getValue(rowHandle)
                        }, ProviderData.prototype._getRowByRowHandle = function(rowHandle) {
                            for (var foundRowItem, i = 0, i = 0, len = this._data.length; i < len; i++)
                                if (this._data[i].handle === rowHandle) {
                                    foundRowItem = this._data[i];
                                    break
                                }
                            return i = Core.Utility.isDefined(foundRowItem) ? i : -1, {
                                    rowItem: foundRowItem, index: i
                                }
                        }, ProviderData
            }();
        DataSources.ProviderData = ProviderData
    })(DataSources = AppMagic.DataSources || (AppMagic.DataSources = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DataSources;
    (function(DataSources) {
        var ProviderDataCoercer = function() {
                function ProviderDataCoercer(){}
                return ProviderDataCoercer.coerceRowToSchema = function(row, schema) {
                        schema.ptr.forEach(function(propertySchema) {
                            var propertyName = propertySchema.name,
                                propertyType = propertySchema.type;
                            Core.Utility.isDefined(row[propertyName]) && (row[propertyName] = ProviderDataCoercer.coerceValueToDType(propertyType, row[propertyName]))
                        })
                    }, ProviderDataCoercer.coerceValueToDType = function(toDType, value) {
                        if (value === null)
                            return null;
                        if (toDType === AppMagic.Schema.TypeHyperlink)
                            return ProviderDataCoercer.coerceValueToDType(AppMagic.Schema.TypeString, value);
                        var srcRawType = typeof value;
                        switch (ProviderDataCoercer._encodeConversionLookUp(srcRawType, toDType)) {
                            case ProviderDataCoercer.CoercionCases.booleanToBoolean:
                                return value;
                            case ProviderDataCoercer.CoercionCases.numberToBoolean:
                                return value !== 0;
                            case ProviderDataCoercer.CoercionCases.stringToBoolean:
                                return value.toLocaleLowerCase() === AppMagic.Strings.True.toLocaleLowerCase();
                            case ProviderDataCoercer.CoercionCases.booleanToNumber:
                                return value ? 1 : 0;
                            case ProviderDataCoercer.CoercionCases.numberToNumber:
                                return value;
                            case ProviderDataCoercer.CoercionCases.stringToNumber:
                                return AppMagic.Functions.value(value);
                            case ProviderDataCoercer.CoercionCases.booleanToString:
                                return value ? AppMagic.Strings.True : AppMagic.Strings.False;
                            case ProviderDataCoercer.CoercionCases.numberToString:
                                return value.toString();
                            case ProviderDataCoercer.CoercionCases.stringToString:
                                return value;
                            default:
                                break
                        }
                        return null
                    }, ProviderDataCoercer._encodeConversionLookUp = function(srcRawType, toDType) {
                            return srcRawType + "->" + toDType
                        }, ProviderDataCoercer.CoercionCases = {
                            booleanToBoolean: ProviderDataCoercer._encodeConversionLookUp("boolean", AppMagic.Schema.TypeBoolean), numberToBoolean: ProviderDataCoercer._encodeConversionLookUp("number", AppMagic.Schema.TypeBoolean), stringToBoolean: ProviderDataCoercer._encodeConversionLookUp("string", AppMagic.Schema.TypeBoolean), booleanToNumber: ProviderDataCoercer._encodeConversionLookUp("boolean", AppMagic.Schema.TypeNumber), numberToNumber: ProviderDataCoercer._encodeConversionLookUp("number", AppMagic.Schema.TypeNumber), stringToNumber: ProviderDataCoercer._encodeConversionLookUp("string", AppMagic.Schema.TypeNumber), booleanToString: ProviderDataCoercer._encodeConversionLookUp("boolean", AppMagic.Schema.TypeString), numberToString: ProviderDataCoercer._encodeConversionLookUp("number", AppMagic.Schema.TypeString), stringToString: ProviderDataCoercer._encodeConversionLookUp("string", AppMagic.Schema.TypeString)
                        }, ProviderDataCoercer
            }();
        DataSources.ProviderDataCoercer = ProviderDataCoercer
    })(DataSources = AppMagic.DataSources || (AppMagic.DataSources = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var DefaultChannelFactory = function() {
                function DefaultChannelFactory(){}
                return DefaultChannelFactory.prototype.createChannel = function(baseUri) {
                        return new Services.Channel(baseUri)
                    }, DefaultChannelFactory
            }();
        Services.DefaultChannelFactory = DefaultChannelFactory
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var XmlHttpRequest;
        (function(XmlHttpRequest) {
            var XmlHttpRequestFactory = function() {
                    function XmlHttpRequestFactory(){}
                    return XmlHttpRequestFactory.prototype.createXmlHttpRequestSender = function() {
                            return this._isWorkerContext() && !this._canMakeCrossDomainRequestsOnWorker() ? new XmlHttpRequest.PostMessageXmlHttpRequestSender : new XmlHttpRequest.XmlHttpRequestSender
                        }, XmlHttpRequestFactory.prototype.createXmlHttpRequestReceiver = function(worker) {
                            return this._canMakeCrossDomainRequestsOnWorker() ? null : new XmlHttpRequest.PostMessageXmlHttpRequestReceiver(worker)
                        }, XmlHttpRequestFactory.prototype._isWorkerContext = function() {
                                return typeof window == "undefined"
                            }, XmlHttpRequestFactory.prototype._canMakeCrossDomainRequestsOnWorker = function() {
                                return WinJS.Utilities.hasWinRT
                            }, XmlHttpRequestFactory
                }();
            XmlHttpRequest.XmlHttpRequestFactory = XmlHttpRequestFactory
        })(XmlHttpRequest = Services.XmlHttpRequest || (Services.XmlHttpRequest = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Xhr = AppMagic.Services.XmlHttpRequest,
    AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var XmlHttpRequestFactory;
        (function(XmlHttpRequestFactory) {
            XmlHttpRequestFactory.instance = new Xhr.XmlHttpRequestFactory
        })(XmlHttpRequestFactory = Services.XmlHttpRequestFactory || (Services.XmlHttpRequestFactory = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AuthenticationBrokerManagerFactory;
        (function(AuthenticationBrokerManagerFactory) {
            AuthenticationBrokerManagerFactory.instance = null
        })(AuthenticationBrokerManagerFactory = Services.AuthenticationBrokerManagerFactory || (Services.AuthenticationBrokerManagerFactory = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var Importer;
        (function(Importer) {
            Importer.instance = null
        })(Importer = Services.Importer || (Services.Importer = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var CookieManager;
        (function(CookieManager) {
            CookieManager.instance = null
        })(CookieManager = Services.CookieManager || (Services.CookieManager = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var EditCloudTableRow = function() {
                function EditCloudTableRow(azureTable, editeeRowData, rowKeySetOfEditee, timestampOfTableHeaderPrimaryEntity, etagOfTableHeaderPrimaryEntity, rowKeySetOfTableHeader, tableHeaderRowData) {
                    this._azureTable = azureTable;
                    this._editeeRowData = editeeRowData;
                    this._rowKeySetOfEditee = rowKeySetOfEditee;
                    this._timestampOfTableHeaderPrimaryEntity = timestampOfTableHeaderPrimaryEntity;
                    this._etagOfTableHeaderPrimaryEntity = etagOfTableHeaderPrimaryEntity;
                    this._rowKeySetOfTableHeader = rowKeySetOfTableHeader;
                    this._tableHeaderRowData = tableHeaderRowData
                }
                return EditCloudTableRow.prototype.performOperation = function() {
                        var _this = this,
                            editeeEntitiesAndRowKeys = Services.CloudTableWorker.getEntitiesForRow(this._editeeRowData, this._rowKeyOfEditeePrimaryEntity(), Services.CloudTableWorker.generateEntityRowKey),
                            tableHeaderEntitiesAndRowKeys = Services.CloudTableWorker.getEntitiesForRow(this._tableHeaderRowData, Services.CloudTableWorker.EntityPropertyValue_RowKey_TableHeader, Services.CloudTableWorker.generateTableHeaderRowKey),
                            entityWriteInfo = [];
                        return Services.CloudTableWorker.appendWriteEntityInfo(editeeEntitiesAndRowKeys.entities, this._partitionKey(), editeeEntitiesAndRowKeys.rowKeySet, entityWriteInfo, 1), Services.CloudTableWorker.appendWriteEntityInfo(tableHeaderEntitiesAndRowKeys.entities, this._partitionKey(), tableHeaderEntitiesAndRowKeys.rowKeySet, entityWriteInfo, 1), Services.CloudTableWorker.writeEntities(this._azureTable, entityWriteInfo).then(function(response) {
                                    return response.allSucceeded ? _this._writeTableHeaderPrimaryEntityAndEditeePrimaryEntity(editeeEntitiesAndRowKeys.entities, editeeEntitiesAndRowKeys.rowKeySet, tableHeaderEntitiesAndRowKeys.entities, tableHeaderEntitiesAndRowKeys.rowKeySet) : (Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), editeeEntitiesAndRowKeys.rowKeySet, 1), Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), tableHeaderEntitiesAndRowKeys.rowKeySet, 1), WinJS.Promise.wrap({
                                                resultCode: 3, etagForEditeePrimaryEntity: null, rowKeySetForEditee: null
                                            }))
                                })
                    }, EditCloudTableRow.prototype._writeTableHeaderPrimaryEntityAndEditeePrimaryEntity = function(editeeEntities, newRowKeySetForEditee, tableHeaderEntities, newRowKeySetForTableHeader) {
                        var _this = this,
                            changePrimaryEntityOfTableHeader = new Services.InsertOrReplaceChange(this._rowKeySetOfTableHeader[0], tableHeaderEntities[0]);
                        changePrimaryEntityOfTableHeader.setEtagPrecondition(this._etagOfTableHeaderPrimaryEntity);
                        var changePrimaryEntityOfRowToEdit = new Services.InsertOrReplaceChange(this._rowKeyOfEditeePrimaryEntity(), editeeEntities[0]),
                            batchOperation = new Services.TableBatchOperation(this._partitionKey());
                        return batchOperation.addTableOperation(changePrimaryEntityOfTableHeader), batchOperation.addTableOperation(changePrimaryEntityOfRowToEdit), this._azureTable.executeBatch(batchOperation).then(function(response) {
                                    return response.resultCode !== 0 || response.failedOperation >= 2 ? WinJS.Promise.wrap({
                                            resultCode: 4, etagForEditeePrimaryEntity: null, rowKeySetForEditee: null
                                        }) : response.failedOperation === -1 ? (Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), _this._rowKeySetOfEditee, 1), Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), _this._rowKeySetOfTableHeader, 1), WinJS.Promise.wrap({
                                                resultCode: 0, etagForEditeePrimaryEntity: response.entityEtags[1], rowKeySetForEditee: newRowKeySetForEditee
                                            })) : (Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), newRowKeySetForEditee, 1), Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), newRowKeySetForTableHeader, 1), _this._handleFailedEdit())
                                })
                    }, EditCloudTableRow.prototype._handleFailedEdit = function() {
                            var _this = this;
                            return Services.CloudTableWorker.queryLatestRowInfoSinceTimestamp(this._azureTable, this._partitionKey(), this._timestampOfTableHeaderPrimaryEntity).then(function(response) {
                                    return response === null ? WinJS.Promise.wrap({
                                            resultCode: 5, etagForEditeePrimaryEntity: null, rowKeySetForEditee: null
                                        }) : _this._reattemptEdit(response)
                                })
                        }, EditCloudTableRow.prototype._reattemptEdit = function(queryResult) {
                            var latestTableHeaderSnapshot = queryResult.tableHeaderSnapshot,
                                tableStillContainsEditee = Core.Utility.isDefined(queryResult.entitiesByRowKey[this._rowKeyOfEditeePrimaryEntity()]),
                                editOperation;
                            if (tableStillContainsEditee)
                                if (Core.Utility.isDefined(queryResult.entitiesByRowKey[this._rowKeyOfEditeePrimaryEntity()])) {
                                    var buildResult = Services.CloudTableWorker.buildRow(this._rowKeyOfEditeePrimaryEntity(), queryResult.entitiesByRowKey);
                                    return editOperation = new EditCloudTableRow(this._azureTable, this._editeeRowData, buildResult.rowKeys, this._timestampOfTableHeaderPrimaryEntity, latestTableHeaderSnapshot.etagOfTableHeaderPrimaryEntity, latestTableHeaderSnapshot.rowKeySetOfTableHeader, latestTableHeaderSnapshot.tableHeaderRowData), editOperation.performOperation()
                                }
                                else
                                    editOperation = new EditCloudTableRow(this._azureTable, this._editeeRowData, this._rowKeySetOfEditee, this._timestampOfTableHeaderPrimaryEntity, latestTableHeaderSnapshot.etagOfTableHeaderPrimaryEntity, latestTableHeaderSnapshot.rowKeySetOfTableHeader, latestTableHeaderSnapshot.tableHeaderRowData);
                            else
                                latestTableHeaderSnapshot.tableHeaderRowData.rows.push(this._rowKeyOfEditeePrimaryEntity()),
                                editOperation = new EditCloudTableRow(this._azureTable, this._editeeRowData, [this._rowKeyOfEditeePrimaryEntity()], this._timestampOfTableHeaderPrimaryEntity, latestTableHeaderSnapshot.etagOfTableHeaderPrimaryEntity, latestTableHeaderSnapshot.rowKeySetOfTableHeader, latestTableHeaderSnapshot.tableHeaderRowData);
                            return editOperation.performOperation()
                        }, EditCloudTableRow.prototype._rowKeyOfEditeePrimaryEntity = function() {
                            return this._rowKeySetOfEditee[0]
                        }, EditCloudTableRow.prototype._partitionKey = function() {
                            return Services.CloudTableWorker.EntityPropertyValue_PartitionKey_FirstLevel
                        }, EditCloudTableRow
            }();
        Services.EditCloudTableRow = EditCloudTableRow
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var RequestParamBase = function() {
                function RequestParamBase(valueExpression) {
                    this._valueExpression = valueExpression
                }
                return RequestParamBase.prototype.applyAsync = function(builder, executionContext) {
                        var _this = this;
                        return this._valueExpression.evaluateAsync(executionContext).then(function(evalResult) {
                                if (evalResult.success)
                                    return _this._applyExpressionValueAsync(evalResult.value, builder, executionContext)
                            })
                    }, RequestParamBase.prototype._applyExpressionValueAsync = function(expressionValue, builder, executionContext) {
                        return
                    }, RequestParamBase
            }();
        Services.RequestParamBase = RequestParamBase
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var NamedHttpRequestParam = function(_super) {
                __extends(NamedHttpRequestParam, _super);
                function NamedHttpRequestParam(paramName, paramValueStringifier, valueExpression) {
                    _super.call(this, valueExpression);
                    this._paramName = paramName;
                    this._paramValueStringifier = paramValueStringifier
                }
                return NamedHttpRequestParam.prototype._applyExpressionValueAsync = function(expressionValue, builder, executionContext) {
                        var stringValue = this._paramValueStringifier.getStringValue(expressionValue);
                        return this._applyStringifiedValue(builder, stringValue), WinJS.Promise.wrap()
                    }, NamedHttpRequestParam.prototype._applyStringifiedValue = function(httpRequestBuilder, value){}, NamedHttpRequestParam
            }(Services.RequestParamBase);
        Services.NamedHttpRequestParam = NamedHttpRequestParam
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var Dictionary = Collections.Generic.Dictionary,
            FormUrlEncodedHttpRequestBuilder = function(_super) {
                __extends(FormUrlEncodedHttpRequestBuilder, _super);
                function FormUrlEncodedHttpRequestBuilder() {
                    _super.call(this);
                    this._formBody = new Dictionary
                }
                return FormUrlEncodedHttpRequestBuilder.prototype.clone = function() {
                        var clone = new FormUrlEncodedHttpRequestBuilder;
                        return _super.prototype._cloneTo.call(this, clone), this._cloneTo(clone), clone
                    }, FormUrlEncodedHttpRequestBuilder.prototype._cloneTo = function(destination) {
                        var _this = this;
                        this._formBody.keys.forEach(function(key) {
                            var value = _this._formBody.getValue(key);
                            destination._formBody.setValue(key, value)
                        })
                    }, FormUrlEncodedHttpRequestBuilder.prototype.generateHttpRequestAsync = function() {
                            var requestInfo = this._generateHttpRequest();
                            return WinJS.Promise.wrap(new Services.FormUrlEncodedHttpRequest(requestInfo.method, requestInfo.url, requestInfo.headers, requestInfo.queryParameters, this._formBody))
                        }, FormUrlEncodedHttpRequestBuilder.prototype.setFormValue = function(key, value) {
                            this._formBody.setValue(key, value)
                        }, FormUrlEncodedHttpRequestBuilder
            }(Services.BodilessHttpRequestBuilder);
        Services.FormUrlEncodedHttpRequestBuilder = FormUrlEncodedHttpRequestBuilder
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var FormUrlEncodedBodyRequestParam = function(_super) {
                __extends(FormUrlEncodedBodyRequestParam, _super);
                function FormUrlEncodedBodyRequestParam(paramName, paramValueStringifier, valueExpression) {
                    _super.call(this, paramName, paramValueStringifier, valueExpression)
                }
                return FormUrlEncodedBodyRequestParam.prototype._applyStringifiedValue = function(httpRequestBuilder, value) {
                        var formUrlEncodedBuilder = httpRequestBuilder;
                        formUrlEncodedBuilder.setFormValue(this._paramName, value)
                    }, FormUrlEncodedBodyRequestParam
            }(Services.NamedHttpRequestParam);
        Services.FormUrlEncodedBodyRequestParam = FormUrlEncodedBodyRequestParam
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var FormUrlEncodedHttpRequest = function(_super) {
                __extends(FormUrlEncodedHttpRequest, _super);
                function FormUrlEncodedHttpRequest(method, url, headers, queryParameters, unencodedFormData) {
                    var _this = this;
                    _super.call(this, method, url, headers, queryParameters);
                    this._encodedFormBody = {};
                    unencodedFormData.keys.forEach(function(unencodedkey) {
                        var unencodedValue = unencodedFormData.getValue(unencodedkey);
                        var encodedKey = AppMagic.Services.AuthUtility.fixedEncodeURIComponent(unencodedkey);
                        _this._encodedFormBody[encodedKey] = AppMagic.Services.AuthUtility.fixedEncodeURIComponent(unencodedValue)
                    })
                }
                return FormUrlEncodedHttpRequest.prototype.getEncodedForm = function() {
                        var _this = this,
                            encodedFormParameterKeyValues = {};
                        return Object.keys(this._encodedFormBody).forEach(function(encodedKey) {
                                var encodedValue = _this._encodedFormBody[encodedKey];
                                encodedFormParameterKeyValues[encodedKey] = encodedValue
                            }), encodedFormParameterKeyValues
                    }, FormUrlEncodedHttpRequest.prototype.getRequestData = function() {
                        var encodedFormParameterKeyValues = this.getEncodedForm(),
                            bodyString = Object.keys(encodedFormParameterKeyValues).map(function(key) {
                                return key + "=" + encodedFormParameterKeyValues[key]
                            }).join("&"),
                            data = [new Services.HttpRequestBodyDatum(bodyString)],
                            requestData = this._getRequestDataWithoutBody();
                        return requestData.headers["content-type"] = "application/x-www-form-urlencoded", {
                                method: requestData.method, url: requestData.url, headers: requestData.headers, queryParameters: requestData.queryParameters, data: data
                            }
                    }, FormUrlEncodedHttpRequest
            }(Services.HttpRequest);
        Services.FormUrlEncodedHttpRequest = FormUrlEncodedHttpRequest
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var FunctionCallExpression = function() {
                function FunctionCallExpression(name, argumentExpressions) {
                    this._name = name;
                    this._argumentExpressions = argumentExpressions
                }
                return FunctionCallExpression.prototype.computeResultSchema = function(serviceFunction, maxSchemaDepth) {
                        var functionToCall = serviceFunction.service.functions[this._name];
                        return functionToCall.computeResultSchema(maxSchemaDepth)
                    }, FunctionCallExpression.prototype.isBehaviorOnly = function(serviceFunction) {
                        var functionToCall = serviceFunction.service.functions[this._name];
                        return functionToCall.isBehaviorOnly || this._argumentExpressions.some(function(arg) {
                                return arg.expression.isBehaviorOnly(serviceFunction)
                            })
                    }, FunctionCallExpression.prototype.evaluateAsync = function(executionContext) {
                            var functionToCall = executionContext.serviceFunction.service.functions[this._name];
                            var parameterValues = {},
                                anyFailed = !1,
                                firstFailedMessage = null,
                                valuePromises = this._argumentExpressions.map(function(arg) {
                                    return arg.expression.evaluateAsync(executionContext).then(function(argResult) {
                                            var value;
                                            argResult.success ? value = argResult.value : (anyFailed = !0, firstFailedMessage === null && typeof argResult.message == "string" && (firstFailedMessage = argResult.message), value = null);
                                            parameterValues[arg.name] = new AppMagic.Services.PrimitiveDArgument(value)
                                        })
                                });
                            return WinJS.Promise.join(valuePromises).then(function() {
                                    return anyFailed ? WinJS.Promise.wrap(Services.ServiceUtility.createUnsuccessfulValueExpressionResult(firstFailedMessage)) : functionToCall.runAsync(parameterValues, executionContext.onBeforeAsyncStep, executionContext.onAfterAsyncStep).then(Services.ServiceUtility.pipelineResultToValueExpressionResult, Services.ServiceUtility.promiseErrorToValueExpressionResult)
                                }, Services.ServiceUtility.promiseErrorToValueExpressionResult)
                        }, FunctionCallExpression
            }();
        Services.FunctionCallExpression = FunctionCallExpression
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var FunctionExecutionContext = function() {
                function FunctionExecutionContext(serviceFunction, parameterValues, variableValues, onBeforeAsyncStep, onAfterAsyncStep) {
                    this.serviceFunction = serviceFunction;
                    this._parameterValues = parameterValues;
                    this._variableValues = variableValues;
                    this.onBeforeAsyncStep = onBeforeAsyncStep;
                    this.onAfterAsyncStep = onAfterAsyncStep
                }
                return FunctionExecutionContext.prototype.tryGetParameterValue = function(name) {
                        var dargValue = this._parameterValues[name];
                        return typeof dargValue == "undefined" ? {value: !1} : {
                                value: !0, outValue: dargValue.value
                            }
                    }, FunctionExecutionContext.prototype.isVariableDefined = function(name) {
                        var dargValue = this._variableValues[name];
                        return typeof dargValue != "undefined"
                    }, FunctionExecutionContext.prototype.addVariable = function(name, dargValue) {
                            Contracts.check(!this.isVariableDefined(name), "The variable is already been defined.");
                            this._variableValues[name] = dargValue
                        }, FunctionExecutionContext.prototype.tryGetVariableValue = function(name) {
                            var dargValue = this._variableValues[name];
                            return typeof dargValue == "undefined" ? {value: !1} : {
                                    value: !0, outValue: dargValue.value
                                }
                        }, FunctionExecutionContext.prototype.tryGetAuthenticationVariableValue = function(name) {
                            return Contracts.check(!1, "Function execution doesn't support authentication variables in its value expressions."), {value: !1}
                        }, FunctionExecutionContext
            }();
        Services.FunctionExecutionContext = FunctionExecutionContext
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var FunctionParameter = function() {
                function FunctionParameter(name, dtype, ttypeRef, isRequired, docId, options, defaultValue, tryItValue) {
                    this._name = name;
                    this._dtype = dtype;
                    this._ttypeRef = ttypeRef;
                    this._isRequired = isRequired;
                    this._docId = docId;
                    this._options = options;
                    this._defaultValue = defaultValue;
                    this._tryItValue = tryItValue
                }
                return Object.defineProperty(FunctionParameter.prototype, "name", {
                        get: function() {
                            return this._name
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(FunctionParameter.prototype, "dtypeOld", {
                        get: function() {
                            return this._dtype
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(FunctionParameter.prototype, "isRequired", {
                            get: function() {
                                return this._isRequired
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(FunctionParameter.prototype, "docId", {
                            get: function() {
                                return this._docId
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(FunctionParameter.prototype, "options", {
                            get: function() {
                                return this._options
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(FunctionParameter.prototype, "defaultValue", {
                            get: function() {
                                return this._defaultValue
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(FunctionParameter.prototype, "tryItValue", {
                            get: function() {
                                return this._tryItValue
                            }, enumerable: !0, configurable: !0
                        }), FunctionParameter.prototype.getSchema = function(maxSchemaDepth) {
                            if (this._dtype !== null)
                                return AppMagic.Schema.createSchemaForSimple(this._dtype);
                            else {
                                var ttype = this._ttypeRef.getType();
                                return ttype.computeDValueSchema(maxSchemaDepth)
                            }
                        }, FunctionParameter
            }();
        Services.FunctionParameter = FunctionParameter
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var FunctionVariable = function() {
                function FunctionVariable(name, valueExpr) {
                    this._name = name;
                    this._valueExpr = valueExpr
                }
                return Object.defineProperty(FunctionVariable.prototype, "name", {
                        get: function() {
                            return this._name
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(FunctionVariable.prototype, "valueExpression", {
                        get: function() {
                            return this._valueExpr
                        }, enumerable: !0, configurable: !0
                    }), FunctionVariable
            }();
        Services.FunctionVariable = FunctionVariable
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AzureMobileServicesGroupIdGenerator = function() {
                function AzureMobileServicesGroupIdGenerator(){}
                return AzureMobileServicesGroupIdGenerator.prototype.generateGroupId = function(dataSourceName, configuration) {
                        return configuration.siteUri
                    }, AzureMobileServicesGroupIdGenerator
            }();
        Services.AzureMobileServicesGroupIdGenerator = AzureMobileServicesGroupIdGenerator;
        var SharePointGroupIdGenerator = function() {
                function SharePointGroupIdGenerator(){}
                return SharePointGroupIdGenerator.prototype.generateGroupId = function(dataSourceName, configuration) {
                        return configuration.siteUri
                    }, SharePointGroupIdGenerator
            }();
        Services.SharePointGroupIdGenerator = SharePointGroupIdGenerator;
        var SharePointOnlineGroupIdGenerator = function() {
                function SharePointOnlineGroupIdGenerator(){}
                return SharePointOnlineGroupIdGenerator.prototype.generateGroupId = function(configuration) {
                        return AppMagic.AuthoringStrings.BackStageSharepointOnlineTitle
                    }, SharePointOnlineGroupIdGenerator
            }();
        Services.SharePointOnlineGroupIdGenerator = SharePointOnlineGroupIdGenerator;
        var RssGroupIdGenerator = function() {
                function RssGroupIdGenerator(){}
                return RssGroupIdGenerator.prototype.generateGroupId = function(dataSourceName, configuration) {
                        return AppMagic.Services.canonicalizeUrl(configuration.url)
                    }, RssGroupIdGenerator
            }();
        Services.RssGroupIdGenerator = RssGroupIdGenerator;
        var RestGroupIdGenerator = function() {
                function RestGroupIdGenerator(){}
                return RestGroupIdGenerator.prototype.generateGroupId = function(dataSourceName, configuration) {
                        return AppMagic.Services.canonicalizeUrl(configuration.endpoint)
                    }, RestGroupIdGenerator
            }();
        Services.RestGroupIdGenerator = RestGroupIdGenerator;
        var ExcelGroupIdGenerator = function() {
                function ExcelGroupIdGenerator(){}
                return ExcelGroupIdGenerator.prototype.generateGroupId = function(dataSourceName, entity) {
                        var entries = Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.entries.filter(function(entry) {
                                return entry.token === entity.futureAccessToken
                            });
                        return entries.length === 1 ? entries[0].metadata : AppMagic.AuthoringStrings.UnknownExcelName
                    }, ExcelGroupIdGenerator
            }();
        Services.ExcelGroupIdGenerator = ExcelGroupIdGenerator;
        var LocalTableGroupIdGenerator = function() {
                function LocalTableGroupIdGenerator(){}
                return LocalTableGroupIdGenerator.prototype.generateGroupId = function(dataSourceName, configuration) {
                        return dataSourceName
                    }, LocalTableGroupIdGenerator
            }();
        Services.LocalTableGroupIdGenerator = LocalTableGroupIdGenerator;
        var ServiceConnectionIdGenerator = function() {
                function ServiceConnectionIdGenerator(){}
                return ServiceConnectionIdGenerator.generateConnectionId = function(dataSourceName, serviceName, configuration, groupIdGenerator) {
                        var groupId = groupIdGenerator.generateGroupId(dataSourceName, configuration);
                        return serviceName.length.toString() + "+" + serviceName + groupId
                    }, ServiceConnectionIdGenerator
            }();
        Services.ServiceConnectionIdGenerator = ServiceConnectionIdGenerator;
        var ExcelConnectionIdGenerator = function() {
                function ExcelConnectionIdGenerator(){}
                return ExcelConnectionIdGenerator.generateExcelConnectionId = function(dataSourceInfo) {
                        var serviceName = AppMagic.Constants.DataConnections.Types.Excel;
                        return ServiceConnectionIdGenerator.generateConnectionId(dataSourceInfo.name, serviceName, dataSourceInfo, new ExcelGroupIdGenerator)
                    }, ExcelConnectionIdGenerator
            }();
        Services.ExcelConnectionIdGenerator = ExcelConnectionIdGenerator
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var HeaderRequestParam = function(_super) {
                __extends(HeaderRequestParam, _super);
                function HeaderRequestParam(paramName, paramValueStringifier, valueExpression) {
                    _super.call(this, paramName, paramValueStringifier, valueExpression)
                }
                return HeaderRequestParam.prototype._applyStringifiedValue = function(httpRequestBuilder, value) {
                        httpRequestBuilder.addHeader(this._paramName, value)
                    }, HeaderRequestParam
            }(Services.NamedHttpRequestParam);
        Services.HeaderRequestParam = HeaderRequestParam
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var HttpRequestBuilderFactory = function() {
                function HttpRequestBuilderFactory(prototype) {
                    this._prototype = prototype
                }
                return HttpRequestBuilderFactory.prototype.createHttpRequestBuilder = function() {
                        return this._prototype.clone()
                    }, HttpRequestBuilderFactory
            }();
        Services.HttpRequestBuilderFactory = HttpRequestBuilderFactory
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        (function(GetAuthoringServicePrincipalResultCode) {
            GetAuthoringServicePrincipalResultCode[GetAuthoringServicePrincipalResultCode.Success = 0] = "Success";
            GetAuthoringServicePrincipalResultCode[GetAuthoringServicePrincipalResultCode.AuthoringServicePrincipalDoesNotExist = 1] = "AuthoringServicePrincipalDoesNotExist";
            GetAuthoringServicePrincipalResultCode[GetAuthoringServicePrincipalResultCode.FailedToAccessServer = 2] = "FailedToAccessServer"
        })(Services.GetAuthoringServicePrincipalResultCode || (Services.GetAuthoringServicePrincipalResultCode = {}));
        var GetAuthoringServicePrincipalResultCode = Services.GetAuthoringServicePrincipalResultCode
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var HttpRequestBodyDatum = function() {
                function HttpRequestBodyDatum(value) {
                    this._value = value
                }
                return Object.defineProperty(HttpRequestBodyDatum.prototype, "value", {
                        get: function() {
                            return this._value
                        }, enumerable: !0, configurable: !0
                    }), HttpRequestBodyDatum
            }();
        Services.HttpRequestBodyDatum = HttpRequestBodyDatum
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ImportedService = function() {
                function ImportedService(serviceNamespace, serviceDef, serviceId, typesMgr, typesByPrefixAndName, nsCache, controller) {
                    this._serviceNamespace = serviceNamespace;
                    this._serviceDef = serviceDef;
                    this._id = serviceId;
                    this._typesMgr = typesMgr;
                    this._typesByPrefixAndName = typesByPrefixAndName;
                    this._authenticationProviders = {};
                    this._functions = {};
                    this._nsCache = nsCache;
                    this._controller = controller;
                    this._promiseCollection = new AppMagic.Common.PromiseCollection
                }
                return ImportedService.createService = function(serviceDef, serviceNamespace, parentNSCache, dispatcher, brokerManager, multipartFormDataHelper, refreshTokenStore) {
                        var nsCache = parentNSCache.getNamespaceCache(serviceNamespace);
                        nsCache === null && (nsCache = parentNSCache.createNamespaceCache(serviceNamespace));
                        var controller = new AppMagic.Services.Meta.RESTWorkerController(dispatcher, multipartFormDataHelper),
                            service = Services.ServiceConfigDeserialization.parseServiceConfigDefinition(serviceDef, serviceNamespace, nsCache, controller),
                            parseContext = {
                                serviceNamespace: serviceNamespace, service: service, serviceNSCache: service.nsCache, serviceRefreshTokenStore: refreshTokenStore, controller: controller, brokerManager: brokerManager
                            };
                        return serviceDef.auths !== null && serviceDef.auths.forEach(function(authProviderDef) {
                                var authProvider = Services.ServiceConfigDeserialization.parseAuthenticationProviderDefinition(authProviderDef, parseContext);
                                service.authenticationProviders[authProviderDef.id] = authProvider
                            }), serviceDef.functions.forEach(function(fnDef) {
                                var svcFn = Services.ServiceConfigDeserialization.parseServiceFunctionDefinition(fnDef, parseContext);
                                service.functions[svcFn.name] = svcFn
                            }), controller.initialize(service), service
                    }, Object.defineProperty(ImportedService.prototype, "serviceNamespace", {
                        get: function() {
                            return this._serviceNamespace
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(ImportedService.prototype, "serviceDefinition", {
                            get: function() {
                                return this._serviceDef
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ImportedService.prototype, "id", {
                            get: function() {
                                return this._id
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ImportedService.prototype, "typesManager", {
                            get: function() {
                                return this._typesMgr
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ImportedService.prototype, "typesByPrefixAndName", {
                            get: function() {
                                return this._typesByPrefixAndName
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ImportedService.prototype, "functions", {
                            get: function() {
                                return this._functions
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ImportedService.prototype, "authenticationProviders", {
                            get: function() {
                                return this._authenticationProviders
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ImportedService.prototype, "hasAuthentication", {
                            get: function() {
                                return Object.keys(this._authenticationProviders).length > 0
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ImportedService.prototype, "controller", {
                            get: function() {
                                return this._controller
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ImportedService.prototype, "nsCache", {
                            get: function() {
                                return this._nsCache
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ImportedService.prototype, "promiseCollection", {
                            get: function() {
                                return this._promiseCollection
                            }, enumerable: !0, configurable: !0
                        }), ImportedService
            }();
        Services.ImportedService = ImportedService
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var InsertCloudTableRow = function() {
                function InsertCloudTableRow(azureTable, inserteeRowData, timestampOfTableHeaderPrimaryEntity, etagOfTableHeaderPrimaryEntity, rowKeySetOfTableHeader, tableHeaderRowData) {
                    this._azureTable = azureTable;
                    this._inserteeRowData = inserteeRowData;
                    this._timestampOfTableHeaderPrimaryEntity = timestampOfTableHeaderPrimaryEntity;
                    this._etagOfTableHeaderPrimaryEntity = etagOfTableHeaderPrimaryEntity;
                    this._rowKeySetOfTableHeader = rowKeySetOfTableHeader;
                    this._tableHeaderRowData = tableHeaderRowData;
                    this._rowKeyOfInserteePrimaryEntity = Services.CloudTableWorker.generateEntityRowKey();
                    this._tableHeaderRowData.rows.push(this._rowKeyOfInserteePrimaryEntity)
                }
                return InsertCloudTableRow.prototype.performOperation = function() {
                        var _this = this,
                            inserteeEntitiesAndRowKeys = Services.CloudTableWorker.getEntitiesForRow(this._inserteeRowData, this._rowKeyOfInserteePrimaryEntity, Services.CloudTableWorker.generateEntityRowKey),
                            tableHeaderEntitiesAndRowKeys = Services.CloudTableWorker.getEntitiesForRow(this._tableHeaderRowData, Services.CloudTableWorker.EntityPropertyValue_RowKey_TableHeader, Services.CloudTableWorker.generateTableHeaderRowKey),
                            entityWriteInfo = [];
                        return Services.CloudTableWorker.appendWriteEntityInfo(inserteeEntitiesAndRowKeys.entities, this._partitionKey(), inserteeEntitiesAndRowKeys.rowKeySet, entityWriteInfo, 0), Services.CloudTableWorker.appendWriteEntityInfo(tableHeaderEntitiesAndRowKeys.entities, this._partitionKey(), tableHeaderEntitiesAndRowKeys.rowKeySet, entityWriteInfo, 1), Services.CloudTableWorker.writeEntities(this._azureTable, entityWriteInfo).then(function(response) {
                                    return response.allSucceeded ? _this._writeTableHeaderPrimaryEntity(response.writeResults[0].entityEtag, inserteeEntitiesAndRowKeys.entities, inserteeEntitiesAndRowKeys.rowKeySet, tableHeaderEntitiesAndRowKeys.entities, tableHeaderEntitiesAndRowKeys.rowKeySet) : (Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), inserteeEntitiesAndRowKeys.rowKeySet, 0), Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), tableHeaderEntitiesAndRowKeys.rowKeySet, 1), WinJS.Promise.wrap({
                                                resultCode: 1, etagForInserteePrimaryEntity: null, rowKeySetForInsertee: null
                                            }))
                                })
                    }, InsertCloudTableRow.prototype._writeTableHeaderPrimaryEntity = function(newEtagForInsertee, inserteeEntities, rowKeySetForInsertee, tableHeaderEntities, newRowKeySetForTableHeader) {
                        var _this = this;
                        return this._azureTable.updateEntity(this._partitionKey(), this._rowKeySetOfTableHeader[0], tableHeaderEntities[0], this._etagOfTableHeaderPrimaryEntity).then(function(response) {
                                return response.resultCode !== 0 ? (Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), rowKeySetForInsertee, 0), Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), newRowKeySetForTableHeader, 1), response.resultCode !== 1) ? WinJS.Promise.wrap({
                                        resultCode: 2, etagForInserteePrimaryEntity: null, rowKeySetForInsertee: null
                                    }) : _this._handlePreconditionFailure() : (Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), _this._rowKeySetOfTableHeader, 1), WinJS.Promise.wrap({
                                        resultCode: 0, etagForInserteePrimaryEntity: newEtagForInsertee, rowKeySetForInsertee: rowKeySetForInsertee
                                    }))
                            })
                    }, InsertCloudTableRow.prototype._handlePreconditionFailure = function() {
                            var _this = this;
                            return Services.CloudTableWorker.queryLatestRowInfoSinceTimestamp(this._azureTable, this._partitionKey(), this._timestampOfTableHeaderPrimaryEntity).then(function(response) {
                                    return response === null ? WinJS.Promise.wrap({
                                            resultCode: 5, etagForInserteePrimaryEntity: null, rowKeySetForInsertee: null
                                        }) : _this._reattemptInsert(response)
                                })
                        }, InsertCloudTableRow.prototype._reattemptInsert = function(response) {
                            var latestSnapshot = response.tableHeaderSnapshot,
                                ictr = new InsertCloudTableRow(this._azureTable, this._inserteeRowData, this._timestampOfTableHeaderPrimaryEntity, latestSnapshot.etagOfTableHeaderPrimaryEntity, latestSnapshot.rowKeySetOfTableHeader, latestSnapshot.tableHeaderRowData);
                            return ictr.performOperation()
                        }, InsertCloudTableRow.prototype._partitionKey = function() {
                            return Services.CloudTableWorker.EntityPropertyValue_PartitionKey_FirstLevel
                        }, InsertCloudTableRow
            }();
        Services.InsertCloudTableRow = InsertCloudTableRow
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var InsertOrReplaceChange = function() {
                function InsertOrReplaceChange(rowKey, entity) {
                    this._rowKey = rowKey;
                    var copy = AppMagic.Utility.jsonClone(entity);
                    delete copy.PartitionKey;
                    copy.RowKey = rowKey;
                    this._entity = JSON.stringify(copy);
                    this._etagPrecondition = null
                }
                return InsertOrReplaceChange.prototype.setEtagPrecondition = function(etag) {
                        this._etagPrecondition = etag
                    }, InsertOrReplaceChange.prototype.getWebRequest = function(partitionKey, tableResource) {
                        var entityResource = Core.Utility.formatString("{0}(PartitionKey='{1}',RowKey='{2}')", tableResource, encodeURIComponent(partitionKey), encodeURIComponent(this._rowKey)),
                            webRequest = new Services.WebHttpRequest("PUT", entityResource);
                        return Object.keys(InsertOrReplaceChange.CommonHeaders).forEach(function(headerName) {
                                webRequest.addHeader(headerName, InsertOrReplaceChange.CommonHeaders[headerName])
                            }), this._etagPrecondition !== null && webRequest.addHeader("If-Match", this._etagPrecondition), webRequest.setBody(this._entity), webRequest
                    }, InsertOrReplaceChange.CommonHeaders = {
                            Accept: "application/json;odata=fullmetadata", "Content-Type": "application/json", DataServiceVersion: "3.0;"
                        }, InsertOrReplaceChange
            }();
        Services.InsertOrReplaceChange = InsertOrReplaceChange
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var JsonBodyRequestParam = function(_super) {
                __extends(JsonBodyRequestParam, _super);
                function JsonBodyRequestParam(jsonpointer, typeRef, valueExpression) {
                    _super.call(this, valueExpression);
                    this._jsonpointer = jsonpointer;
                    this._typeRef = typeRef
                }
                return JsonBodyRequestParam.prototype._applyExpressionValueAsync = function(expressionValue, builder, executionContext) {
                        var ttype = this._typeRef.getType();
                        var jsonValue = ttype.convertFromDValue(expressionValue);
                        var jsonBuilder = builder;
                        return jsonBuilder.setJsonValue(this._jsonpointer, jsonValue), WinJS.Promise.wrap()
                    }, JsonBodyRequestParam
            }(Services.RequestParamBase);
        Services.JsonBodyRequestParam = JsonBodyRequestParam
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var JsonHttpRequest = function(_super) {
                __extends(JsonHttpRequest, _super);
                function JsonHttpRequest(method, url, headers, queryParameters, jsonBody) {
                    _super.call(this, method, url, headers, queryParameters);
                    this._jsonBodyString = typeof jsonBody == "undefined" ? "" : JSON.stringify(jsonBody)
                }
                return JsonHttpRequest.prototype.getRequestData = function() {
                        var data = [new Services.HttpRequestBodyDatum(this._jsonBodyString)],
                            requestData = this._getRequestDataWithoutBody();
                        return requestData.headers["content-type"] = "application/json", {
                                method: requestData.method, url: requestData.url, headers: requestData.headers, queryParameters: requestData.queryParameters, data: data
                            }
                    }, JsonHttpRequest
            }(Services.HttpRequest);
        Services.JsonHttpRequest = JsonHttpRequest
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var JsonHttpRequestBuilder = function(_super) {
                __extends(JsonHttpRequestBuilder, _super);
                function JsonHttpRequestBuilder() {
                    _super.call(this);
                    this._jsonBody = null;
                    this._isBodyUndefined = !0
                }
                return JsonHttpRequestBuilder.prototype.clone = function() {
                        var clone = new JsonHttpRequestBuilder;
                        return _super.prototype._cloneTo.call(this, clone), this._cloneTo(clone), clone
                    }, JsonHttpRequestBuilder.prototype._cloneTo = function(destination) {
                        destination._jsonBody = AppMagic.Utility.jsonClone(this._jsonBody);
                        destination._isBodyUndefined = this._isBodyUndefined
                    }, JsonHttpRequestBuilder.prototype.generateHttpRequestAsync = function() {
                            var requestInfo = this._generateHttpRequest();
                            return this._isBodyUndefined ? WinJS.Promise.wrap(new Services.JsonHttpRequest(requestInfo.method, requestInfo.url, requestInfo.headers, requestInfo.queryParameters)) : WinJS.Promise.wrap(new Services.JsonHttpRequest(requestInfo.method, requestInfo.url, requestInfo.headers, requestInfo.queryParameters, this._jsonBody))
                        }, JsonHttpRequestBuilder.prototype._setBody = function(value) {
                            this._isBodyUndefined = !1;
                            this._jsonBody = value
                        }, JsonHttpRequestBuilder.prototype.setJsonValue = function(jsonPointer, value) {
                            var path = AppMagic.Utility.parseJsonPointer(jsonPointer);
                            if (path.length === 0) {
                                this._setBody(value);
                                return
                            }
                            this._setBody(this._isBodyUndefined ? Object.create(null) : this._jsonBody);
                            for (var context = this._jsonBody, j = 0, jlen = path.length - 1; j < jlen; j++) {
                                var keyOrIndex = path[j];
                                typeof context[keyOrIndex] == "undefined" && (context[keyOrIndex] = Object.create(null));
                                context = context[keyOrIndex]
                            }
                            context[path[path.length - 1]] = value
                        }, JsonHttpRequestBuilder
            }(Services.BodilessHttpRequestBuilder);
        Services.JsonHttpRequestBuilder = JsonHttpRequestBuilder
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var JsonPointerExpression = function() {
                function JsonPointerExpression(valueExpr, pointer) {
                    this._valueExpr = valueExpr;
                    this._pointer = pointer
                }
                return JsonPointerExpression.prototype.computeResultSchema = function(serviceFunction, maxSchemaDepth) {
                        var pointerTokens = AppMagic.Utility.parseJsonPointer(this._pointer);
                        maxSchemaDepth += pointerTokens.length;
                        var schema = this._valueExpr.computeResultSchema(serviceFunction, maxSchemaDepth);
                        return AppMagic.Schema.getSchemaFollowingDataJsonPointer(schema, this._pointer)
                    }, JsonPointerExpression.prototype.isBehaviorOnly = function(serviceFunction) {
                        return this._valueExpr.isBehaviorOnly(serviceFunction)
                    }, JsonPointerExpression.prototype.evaluateAsync = function(executionContext) {
                            var _this = this;
                            return this._valueExpr.evaluateAsync(executionContext).then(function(evalResult) {
                                    if (!evalResult.success)
                                        return evalResult;
                                    var value = AppMagic.Utility.getJsonValueViaJsonPointer(evalResult.value, _this._pointer);
                                    return typeof value == "undefined" || value === null ? Services.ServiceUtility.createUnsuccessfulValueExpressionResult() : Services.ServiceUtility.createSuccessfulValueExpressionResult(value)
                                }).then(Services.ServiceUtility.valueExpressionResultIdentityFunction, Services.ServiceUtility.promiseErrorToValueExpressionResult)
                        }, JsonPointerExpression
            }();
        Services.JsonPointerExpression = JsonPointerExpression
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ListCloudTables = function() {
                function ListCloudTables(azureTableClient) {
                    this._azureTableClient = azureTableClient
                }
                return ListCloudTables.prototype.performOperation = function() {
                        var _this = this;
                        return this._azureTableClient.queryTables().then(function(queryResult) {
                                return queryResult.resultCode !== 0 ? WinJS.Promise.wrap({
                                        resultCode: 7, tables: null
                                    }) : _this._processTableNames(queryResult.tableNames)
                            })
                    }, ListCloudTables.prototype._processTableNames = function(tableNames) {
                        for (var _this = this, promises = [], i = 0, len = tableNames.length; i < len; i++)
                            promises.push(this._getDisplayNameForTable(tableNames[i]));
                        return WinJS.Promise.join(promises).then(function(displayNames) {
                                return WinJS.Promise.wrap(_this._processDisplayNames(displayNames, tableNames))
                            })
                    }, ListCloudTables.prototype._getDisplayNameForTable = function(tableName) {
                            var azureTable = this._azureTableClient.getTable(tableName);
                            return Services.CloudTableWorker.queryLatestRootInfo(azureTable).then(function(queryResult) {
                                    if (queryResult === null)
                                        return WinJS.Promise.wrap(null);
                                    try {
                                        var displayName = queryResult.rootTableHeaderSnapshot.tableHeaderRowData.displayName;
                                        return typeof displayName != "string" ? null : WinJS.Promise.wrap(displayName)
                                    }
                                    catch(e) {}
                                    return WinJS.Promise.wrap(null)
                                })
                        }, ListCloudTables.prototype._processDisplayNames = function(displayNames, tableNames) {
                            for (var tables = [], i = 0, len = displayNames.length; i < len; i++) {
                                var displayName = displayNames[i];
                                displayName !== null && tables.push({
                                    displayName: displayName, tableName: tableNames[i]
                                })
                            }
                            return {
                                    resultCode: 0, tables: tables
                                }
                        }, ListCloudTables
            }();
        Services.ListCloudTables = ListCloudTables
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var LiteralValueExpression = function() {
                function LiteralValueExpression(value, dtype) {
                    this._value = value;
                    this._dtype = dtype
                }
                return LiteralValueExpression.prototype.computeResultSchema = function(serviceFunction) {
                        return AppMagic.Schema.createSchemaForSimple(this._dtype)
                    }, LiteralValueExpression.prototype.isBehaviorOnly = function(serviceFunction) {
                        return !1
                    }, LiteralValueExpression.prototype.evaluateAsync = function(executionContext) {
                            return WinJS.Promise.wrap(Services.ServiceUtility.createSuccessfulValueExpressionResult(this._value))
                        }, LiteralValueExpression
            }();
        Services.LiteralValueExpression = LiteralValueExpression
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var MimeMessage = function() {
                function MimeMessage() {
                    this._headers = {};
                    this._body = ""
                }
                return MimeMessage.prototype.addHeader = function(headerName, headerValue) {
                        Contracts.checkNonEmpty(headerName);
                        this._headers[headerName] = headerValue
                    }, MimeMessage.prototype.setBody = function(bodyText) {
                        this._body = bodyText
                    }, MimeMessage.prototype.getMessageText = function() {
                            var _this = this,
                                data = [];
                            return Object.keys(this._headers).forEach(function(headerName) {
                                    data.push(Core.Utility.formatString("{0}: {1}\r\n", headerName, _this._headers[headerName]))
                                }), data.push("\r\n"), data.push(this._body), data.join("")
                        }, MimeMessage
            }();
        Services.MimeMessage = MimeMessage
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var MultipartFormDataBinaryPart = function() {
                function MultipartFormDataBinaryPart(partName, filename, binaryData) {
                    this._partName = partName;
                    this._filename = filename;
                    this._binaryData = binaryData
                }
                return MultipartFormDataBinaryPart.prototype.clone = function() {
                        return new MultipartFormDataBinaryPart(this._partName, this._filename, this._binaryData)
                    }, MultipartFormDataBinaryPart.prototype.getParts = function(partArray) {
                        partArray.push(new Services.HttpRequestBodyDatum(Core.Utility.formatString('{0}: {1}; {2}="{3}"; {4}="{5}"\r\n\r\n', "Content-Disposition", "form-data", "name", this._partName, "filename", this._filename)));
                        partArray.push(new Services.HttpRequestBodyDatum(this._binaryData));
                        partArray.push(new Services.HttpRequestBodyDatum("\r\n"))
                    }, MultipartFormDataBinaryPart
            }();
        Services.MultipartFormDataBinaryPart = MultipartFormDataBinaryPart
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var MultipartFormDataHttpRequest = function(_super) {
                __extends(MultipartFormDataHttpRequest, _super);
                function MultipartFormDataHttpRequest(method, url, headers, queryParameters, bodyData, formDataBoundary) {
                    _super.call(this, method, url, headers, queryParameters);
                    this._bodyData = bodyData;
                    this._formDataBoundary = formDataBoundary
                }
                return MultipartFormDataHttpRequest.prototype.getRequestData = function() {
                        var data = this._bodyData.map(function(datum) {
                                return datum
                            }),
                            requestData = this._getRequestDataWithoutBody();
                        return requestData.headers["content-type"] = Core.Utility.formatString('multipart/form-data; boundary="{0}"', this._formDataBoundary), {
                                method: requestData.method, url: requestData.url, headers: requestData.headers, queryParameters: requestData.queryParameters, data: data
                            }
                    }, MultipartFormDataHttpRequest
            }(Services.HttpRequest);
        Services.MultipartFormDataHttpRequest = MultipartFormDataHttpRequest
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var MultipartFormDataRandomBoundaryGenerator = function() {
                function MultipartFormDataRandomBoundaryGenerator(){}
                return MultipartFormDataRandomBoundaryGenerator.prototype.generateBoundary = function() {
                        return AppMagic.Utility.randomAlphaNumeric(32)
                    }, MultipartFormDataRandomBoundaryGenerator
            }();
        Services.MultipartFormDataRandomBoundaryGenerator = MultipartFormDataRandomBoundaryGenerator;
        var MultipartFormDataHttpRequestBuilder = function(_super) {
                __extends(MultipartFormDataHttpRequestBuilder, _super);
                function MultipartFormDataHttpRequestBuilder(boundaryGenerator) {
                    _super.call(this);
                    this._boundaryGenerator = boundaryGenerator;
                    this._parts = []
                }
                return MultipartFormDataHttpRequestBuilder.prototype.clone = function() {
                        var clone = new MultipartFormDataHttpRequestBuilder(this._boundaryGenerator);
                        return _super.prototype._cloneTo.call(this, clone), this._cloneTo(clone), clone
                    }, MultipartFormDataHttpRequestBuilder.prototype._cloneTo = function(destination) {
                        destination._parts = this._parts.map(function(part) {
                            return part.clone()
                        })
                    }, MultipartFormDataHttpRequestBuilder.prototype.addPart = function(part) {
                            this._parts.push(part)
                        }, MultipartFormDataHttpRequestBuilder.prototype.generateHttpRequestAsync = function() {
                            var requestInfo = this._generateHttpRequest(),
                                data = [],
                                boundary = this._boundaryGenerator.generateBoundary();
                            return this._parts.length === 0 ? data.push(new Services.HttpRequestBodyDatum("--" + boundary + "\r\n\r\n\r\n")) : this._parts.forEach(function(part) {
                                    data.push(new Services.HttpRequestBodyDatum("--" + boundary + "\r\n"));
                                    part.getParts(data)
                                }), data.push(new Services.HttpRequestBodyDatum("--" + boundary + "--\r\n")), WinJS.Promise.wrap(new Services.MultipartFormDataHttpRequest(requestInfo.method, requestInfo.url, requestInfo.headers, requestInfo.queryParameters, data, boundary))
                        }, MultipartFormDataHttpRequestBuilder
            }(Services.BodilessHttpRequestBuilder);
        Services.MultipartFormDataHttpRequestBuilder = MultipartFormDataHttpRequestBuilder
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var MultipartFormDataBodyBinaryRequestParam = function(_super) {
                __extends(MultipartFormDataBodyBinaryRequestParam, _super);
                function MultipartFormDataBodyBinaryRequestParam(paramName, valueExpression) {
                    _super.call(this, valueExpression);
                    this._paramName = paramName
                }
                return MultipartFormDataBodyBinaryRequestParam.prototype._applyExpressionValueAsync = function(expressionValue, builder, executionContext) {
                        var _this = this;
                        return Services.Meta.RESTWorkerController.getBinaryDataAsync(expressionValue).then(function(blob) {
                                return _this._applyBlob(builder, blob)
                            })
                    }, MultipartFormDataBodyBinaryRequestParam.prototype._applyBlob = function(builder, value) {
                        var filename = "file_" + AppMagic.Utility.generate128BitUUID(),
                            mimeType = value.type;
                        if (mimeType !== "") {
                            var fileExtension = AppMagic.Utility.MimeType.mimeTypeToFileExtension(mimeType);
                            filename += fileExtension
                        }
                        builder.addPart(new Services.MultipartFormDataBinaryPart(this._paramName, filename, value))
                    }, MultipartFormDataBodyBinaryRequestParam
            }(Services.RequestParamBase);
        Services.MultipartFormDataBodyBinaryRequestParam = MultipartFormDataBodyBinaryRequestParam
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var MultipartFormDataTextPart = function() {
                function MultipartFormDataTextPart(partName, text) {
                    this._partName = partName;
                    this._text = text
                }
                return MultipartFormDataTextPart.prototype.clone = function() {
                        return new MultipartFormDataTextPart(this._partName, this._text)
                    }, MultipartFormDataTextPart.prototype.getParts = function(partArray) {
                        partArray.push(new Services.HttpRequestBodyDatum(Core.Utility.formatString('{0}: {1}; {2}="{3}";\r\n\r\n', "Content-Disposition", "form-data", "name", this._partName)));
                        partArray.push(new Services.HttpRequestBodyDatum(this._text + "\r\n"))
                    }, MultipartFormDataTextPart
            }();
        Services.MultipartFormDataTextPart = MultipartFormDataTextPart
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var MultipartFormDataBodyTextRequestParam = function(_super) {
                __extends(MultipartFormDataBodyTextRequestParam, _super);
                function MultipartFormDataBodyTextRequestParam(paramName, paramValueStringifier, valueExpression) {
                    _super.call(this, paramName, paramValueStringifier, valueExpression)
                }
                return MultipartFormDataBodyTextRequestParam.prototype._applyStringifiedValue = function(httpRequestBuilder, value) {
                        var multiPartFormDataBuilder = httpRequestBuilder;
                        multiPartFormDataBuilder.addPart(new Services.MultipartFormDataTextPart(this._paramName, value))
                    }, MultipartFormDataBodyTextRequestParam
            }(Services.NamedHttpRequestParam);
        Services.MultipartFormDataBodyTextRequestParam = MultipartFormDataBodyTextRequestParam
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var MultipartMixedMessage = function() {
                function MultipartMixedMessage(boundaryGenerator) {
                    this._boundaryGenerator = boundaryGenerator;
                    this._bodyParts = []
                }
                return MultipartMixedMessage.prototype.addPart = function(part) {
                        this._bodyParts.push(part)
                    }, MultipartMixedMessage.prototype.applyToChannel = function(channel) {
                        var contentTypeHeaderAndBoundary = this._getContentTypeHeaderAndBoundary(),
                            contentTypeHeader = contentTypeHeaderAndBoundary.contentTypeHeader,
                            boundary = contentTypeHeaderAndBoundary.boundary,
                            body = this._getBodyText(boundary);
                        channel.data(body);
                        channel.header("Content-Type", contentTypeHeader);
                        channel.header("Content-Length", new Blob([body]).size.toString())
                    }, MultipartMixedMessage.prototype.getMessageText = function() {
                            var contentTypeHeaderAndBoundary = this._getContentTypeHeaderAndBoundary(),
                                contentTypeHeader = contentTypeHeaderAndBoundary.contentTypeHeader,
                                boundary = contentTypeHeaderAndBoundary.boundary,
                                part = new Services.MimeMessage;
                            part.addHeader("Content-Type", contentTypeHeader);
                            var bodyText = this._getBodyText(boundary);
                            return part.setBody(bodyText), part.getMessageText()
                        }, MultipartMixedMessage.prototype._getContentTypeHeaderAndBoundary = function() {
                            var boundary = this._boundaryGenerator.generateBoundary(),
                                boundaryHasWhiteSpace = /\s/g.test(boundary),
                                contentTypeHeader;
                            return contentTypeHeader = boundaryHasWhiteSpace ? 'multipart/mixed; boundary="' + boundary + '"' : "multipart/mixed; boundary=" + boundary, {
                                    boundary: boundary, contentTypeHeader: contentTypeHeader
                                }
                        }, MultipartMixedMessage.prototype._getBodyText = function(boundary) {
                            var data = [];
                            data.push("--" + boundary + "\r\n");
                            data.push(this._bodyParts[0].getMessageText());
                            for (var i = 1, len = this._bodyParts.length; i < len; i++) {
                                var part = this._bodyParts[i];
                                data.push("\r\n--" + boundary + "\r\n");
                                data.push(part.getMessageText())
                            }
                            return data.push("\r\n--" + boundary + "--"), data.join("")
                        }, MultipartMixedMessage
            }();
        Services.MultipartMixedMessage = MultipartMixedMessage
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var MultipartMixedMessageParser = function() {
                function MultipartMixedMessageParser(multipartMessage) {
                    this._multipartMessage = multipartMessage
                }
                return MultipartMixedMessageParser.prototype.getParts = function() {
                        var contentTypeHeader = this._multipartMessage.getMessageHeader("Content-Type"),
                            messageBody = this._multipartMessage.getMessageBody();
                        if (contentTypeHeader === null || messageBody === null)
                            return null;
                        var matchResult = contentTypeHeader.match(/^(\s*)multipart\/mixed\s*;(.*;)?\s*boundary=("[\d\w'()+,\-.\/:=? ]*[\d\w'()+,\-.\/:=?]"|[\d\w+\-\/=?]+)\s*(;.*|$)/);
                        if (matchResult === null)
                            return null;
                        var boundary = matchResult[3];
                        boundary.indexOf('"') >= 0 && (boundary = boundary.substr(1, boundary.length - 2));
                        return this._splitIntoParts(messageBody, boundary)
                    }, MultipartMixedMessageParser.prototype._splitIntoParts = function(messageBody, boundary) {
                        var splitResult = messageBody.split("\r\n--" + boundary + "--");
                        if (splitResult.length !== 2)
                            return null;
                        var prologueAndBody = splitResult[0],
                            firstDelimiter = "--" + boundary + "\r\n",
                            firstDelimiterBegin = prologueAndBody.indexOf(firstDelimiter);
                        if (firstDelimiterBegin < 0)
                            return null;
                        var bodyPartText = prologueAndBody.substr(firstDelimiterBegin + firstDelimiter.length);
                        return bodyPartText.split("\r\n--" + boundary + "\r\n")
                    }, MultipartMixedMessageParser
            }();
        Services.MultipartMixedMessageParser = MultipartMixedMessageParser
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var NumberParamValueStringifier = function() {
                function NumberParamValueStringifier(xsdType) {
                    this._xsdType = xsdType
                }
                return NumberParamValueStringifier.prototype.getStringValue = function(value) {
                        return Services.TypeSystem.XsdUtility.coerceNumberToXsdNumericType(value, this._xsdType).toString()
                    }, NumberParamValueStringifier
            }();
        Services.NumberParamValueStringifier = NumberParamValueStringifier
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var O365;
        (function(O365) {
            var ComposeAttendeesArrayExpression = function() {
                    function ComposeAttendeesArrayExpression(emailsValueExpr, typeValueExpr) {
                        this._emailsValueExpr = emailsValueExpr;
                        this._typeValueExpr = typeValueExpr
                    }
                    return ComposeAttendeesArrayExpression.prototype.computeResultSchema = function(serviceFunction) {
                            var addressSchemaFields = [AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeString, "Name"), AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeString, "Address"), ],
                                recipientSchemaFields = [AppMagic.Schema.createSchemaForObjectFromPointer(addressSchemaFields, "EmailAddress"), AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeString, "Type"), ];
                            return AppMagic.Schema.createSchemaForArrayFromPointer(recipientSchemaFields)
                        }, ComposeAttendeesArrayExpression.prototype.isBehaviorOnly = function(serviceFunction) {
                            return this._emailsValueExpr.isBehaviorOnly(serviceFunction) || this._typeValueExpr.isBehaviorOnly(serviceFunction)
                        }, ComposeAttendeesArrayExpression.prototype.evaluateAsync = function(executionContext) {
                                var _this = this;
                                var emailsValue,
                                    typeValue,
                                    anyFailed = !1,
                                    firstFailedMessage = null,
                                    promises = [this._emailsValueExpr.evaluateAsync(executionContext).then(function(evalResult) {
                                            evalResult.success ? emailsValue = evalResult.value : (anyFailed = !0, firstFailedMessage === null && typeof evalResult.message == "string" && (firstFailedMessage = evalResult.message))
                                        }), this._typeValueExpr.evaluateAsync(executionContext).then(function(evalResult) {
                                            evalResult.success ? typeValue = evalResult.value : (anyFailed = !0, firstFailedMessage === null && typeof evalResult.message == "string" && (firstFailedMessage = evalResult.message))
                                        })];
                                return WinJS.Promise.join(promises).then(function() {
                                        if (anyFailed)
                                            return Services.ServiceUtility.createUnsuccessfulValueExpressionResult(firstFailedMessage);
                                        var attendees = _this.composeAttendeesFromEmails(emailsValue, typeValue);
                                        return attendees === null ? Services.ServiceUtility.createUnsuccessfulValueExpressionResult() : Services.ServiceUtility.createSuccessfulValueExpressionResult(attendees)
                                    }).then(Services.ServiceUtility.valueExpressionResultIdentityFunction, Services.ServiceUtility.promiseErrorToValueExpressionResult)
                            }, ComposeAttendeesArrayExpression.prototype.composeAttendeesFromEmails = function(emails, type) {
                                if (typeof emails != "string" || typeof type != "string")
                                    return null;
                                var emailAddresses = O365.O365Utility.parseEmailAddressesString(emails);
                                return emailAddresses === null ? null : emailAddresses.map(function(emailAddress) {
                                        return {
                                                EmailAddress: emailAddress, Type: type
                                            }
                                    })
                            }, ComposeAttendeesArrayExpression
                }();
            O365.ComposeAttendeesArrayExpression = ComposeAttendeesArrayExpression
        })(O365 = Services.O365 || (Services.O365 = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var O365;
        (function(O365) {
            var ComposeRecipientsArrayExpression = function() {
                    function ComposeRecipientsArrayExpression(emailsValueExpr) {
                        this._emailsValueExpr = emailsValueExpr
                    }
                    return ComposeRecipientsArrayExpression.prototype.computeResultSchema = function(serviceFunction) {
                            var addressSchemaFields = [AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeString, "Name"), AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeString, "Address"), ],
                                recipientSchemaFields = [AppMagic.Schema.createSchemaForObjectFromPointer(addressSchemaFields, "EmailAddress"), ];
                            return AppMagic.Schema.createSchemaForArrayFromPointer(recipientSchemaFields)
                        }, ComposeRecipientsArrayExpression.prototype.isBehaviorOnly = function(serviceFunction) {
                            return this._emailsValueExpr.isBehaviorOnly(serviceFunction)
                        }, ComposeRecipientsArrayExpression.prototype.evaluateAsync = function(executionContext) {
                                var _this = this;
                                return this._emailsValueExpr.evaluateAsync(executionContext).then(function(evalResult) {
                                        if (!evalResult.success)
                                            return evalResult;
                                        var recipients = _this.composeRecipientsFromEmails(evalResult.value);
                                        return recipients === null ? Services.ServiceUtility.createUnsuccessfulValueExpressionResult() : Services.ServiceUtility.createSuccessfulValueExpressionResult(recipients)
                                    }).then(Services.ServiceUtility.valueExpressionResultIdentityFunction, Services.ServiceUtility.promiseErrorToValueExpressionResult)
                            }, ComposeRecipientsArrayExpression.prototype.composeRecipientsFromEmails = function(emails) {
                                if (typeof emails != "string")
                                    return null;
                                var emailAddresses = O365.O365Utility.parseEmailAddressesString(emails);
                                return emailAddresses === null ? null : emailAddresses.map(function(emailAddress) {
                                        return {EmailAddress: emailAddress}
                                    })
                            }, ComposeRecipientsArrayExpression
                }();
            O365.ComposeRecipientsArrayExpression = ComposeRecipientsArrayExpression
        })(O365 = Services.O365 || (Services.O365 = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var O365;
        (function(O365) {
            var O365Utility;
            (function(O365Utility) {
                function parseEmailAddressesString(emails) {
                    if (emails === null || typeof emails != "string")
                        return null;
                    var parts = emails.trim().split(";"),
                        emailAddresses = [];
                    return parts.forEach(function(part) {
                            var emailAddress = parseEmailAddress(part);
                            emailAddress !== null && emailAddresses.push(emailAddress)
                        }), emailAddresses
                }
                O365Utility.parseEmailAddressesString = parseEmailAddressesString;
                function parseEmailAddress(nameAndEmailString) {
                    if (nameAndEmailString === null)
                        return null;
                    var inp = nameAndEmailString.trim();
                    if (inp === "")
                        return null;
                    var emailWithTagRegEx = /<(.*?)>/,
                        nameWithStartTagRegEx = /(.*?)</,
                        emailRegEx = /[^\s@]+@[^\s@]+\.[^\s@]+/,
                        spaceRegEx = /\s/g,
                        nameResult = null,
                        addressResult = null,
                        inputMatchesEmailRegEx = emailRegEx.test(inp),
                        emailWithTag = inp.match(emailWithTagRegEx);
                    if (emailWithTag !== null && emailWithTag.length === 2) {
                        var email = emailWithTag[1].trim();
                        emailRegEx.test(email) && !spaceRegEx.test(email) && (addressResult = email);
                        var nameWithTag = inp.match(nameWithStartTagRegEx);
                        nameWithTag !== null && nameWithTag.length === 2 && (nameResult = nameWithTag[1].trim())
                    }
                    else if (inputMatchesEmailRegEx && !spaceRegEx.test(inp))
                        addressResult = inp;
                    else if (inputMatchesEmailRegEx)
                        return null;
                    else
                        nameResult = inp;
                    var emailAddress = {};
                    return nameResult !== null && (emailAddress.Name = nameResult), addressResult !== null && (emailAddress.Address = addressResult), emailAddress
                }
            })(O365Utility = O365.O365Utility || (O365.O365Utility = {}))
        })(O365 = Services.O365 || (Services.O365 = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var O365;
        (function(O365) {
            var ParseEmailAddressesExpression = function() {
                    function ParseEmailAddressesExpression(valueExpr) {
                        this._valueExpr = valueExpr
                    }
                    return ParseEmailAddressesExpression.prototype.computeResultSchema = function(serviceFunction) {
                            var addressSchemaFields = [AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeString, "Name"), AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeString, "Address"), ];
                            return AppMagic.Schema.createSchemaForArrayFromPointer(addressSchemaFields)
                        }, ParseEmailAddressesExpression.prototype.isBehaviorOnly = function(serviceFunction) {
                            return this._valueExpr.isBehaviorOnly(serviceFunction)
                        }, ParseEmailAddressesExpression.prototype.evaluateAsync = function(executionContext) {
                                var _this = this;
                                return this._valueExpr.evaluateAsync(executionContext).then(function(evalResult) {
                                        if (!evalResult.success)
                                            return evalResult;
                                        var emailAddresses = _this.parseEmailsString(evalResult.value);
                                        return emailAddresses === null ? Services.ServiceUtility.createUnsuccessfulValueExpressionResult() : Services.ServiceUtility.createSuccessfulValueExpressionResult(emailAddresses)
                                    }).then(Services.ServiceUtility.valueExpressionResultIdentityFunction, Services.ServiceUtility.promiseErrorToValueExpressionResult)
                            }, ParseEmailAddressesExpression.prototype.parseEmailsString = function(emails) {
                                if (typeof emails != "string")
                                    return null;
                                var emailAddresses = O365.O365Utility.parseEmailAddressesString(emails);
                                return emailAddresses
                            }, ParseEmailAddressesExpression
                }();
            O365.ParseEmailAddressesExpression = ParseEmailAddressesExpression
        })(O365 = Services.O365 || (Services.O365 = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var OAuth1Constants;
        (function(OAuth1Constants) {
            OAuth1Constants.OAuthHeaderName_OAuthNonce = "oauth_nonce";
            OAuth1Constants.OAuthHeaderName_OAuthCallBack = "oauth_callback";
            OAuth1Constants.OAuthHeaderName_OAuthSignatureMethod = "oauth_signature_method";
            OAuth1Constants.OAuthHeaderName_OAuthTimestamp = "oauth_timestamp";
            OAuth1Constants.OAuthHeaderName_OAuthConsumerKey = "oauth_consumer_key";
            OAuth1Constants.OAuthHeaderName_OAuthVersion = "oauth_version";
            OAuth1Constants.OAuthHeaderName_OAuthSignature = "oauth_signature";
            OAuth1Constants.OAuthHeaderName_OAuthToken = "oauth_token";
            OAuth1Constants.OAuthHeaderName_OAuthVerifier = "oauth_verifier";
            OAuth1Constants.OAuthHeaderValue_OAuthVersion = "1.0";
            OAuth1Constants.HeaderName_Authorization = "Authorization";
            OAuth1Constants.QueryParameterName_OAuthToken = "oauth_token";
            OAuth1Constants.FormParameterRegex_OAuthToken = /(&|^)oauth_token=(.*?)(&|$)/;
            OAuth1Constants.FormParameterRegex_OAuthTokenSecret = /(&|^)oauth_token_secret=(.*?)(&|$)/;
            OAuth1Constants.QueryParameterRegex_OAuthToken = /\?([^=]*=[^&]*&)*?(oauth_token=(.*?))(&|$|#)/;
            OAuth1Constants.QueryParameterRegex_OAuthVerifier = /\?([^=]*=[^&]*&)*?(oauth_verifier=(.*?))(&|$|#)/;
            var CacheKey;
            (function(CacheKey) {
                CacheKey.token = "token";
                CacheKey.tokenSecret = "tokenSecret";
                CacheKey.tokenTimeStamp = "tokenTimeStamp"
            })(CacheKey = OAuth1Constants.CacheKey || (OAuth1Constants.CacheKey = {}))
        })(OAuth1Constants = Services.OAuth1Constants || (Services.OAuth1Constants = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var AcquireResult = function() {
                function AcquireResult(){}
                return AcquireResult
            }();
        Services.AcquireResult = AcquireResult;
        var OAuth1Store = function(_super) {
                __extends(OAuth1Store, _super);
                function OAuth1Store(cache) {
                    _super.call(this, cache)
                }
                return Object.defineProperty(OAuth1Store.prototype, "token", {
                        get: function() {
                            return this._tryGetCachedValue(Services.OAuth1Constants.CacheKey.token)
                        }, set: function(value) {
                                this._setCachedValue(Services.OAuth1Constants.CacheKey.token, value)
                            }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(OAuth1Store.prototype, "tokenSecret", {
                        get: function() {
                            return this._tryGetCachedValue(Services.OAuth1Constants.CacheKey.tokenSecret)
                        }, set: function(value) {
                                this._setCachedValue(Services.OAuth1Constants.CacheKey.tokenSecret, value)
                            }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(OAuth1Store.prototype, "tokenTimeStamp", {
                            get: function() {
                                return this._tryGetCachedValue(Services.OAuth1Constants.CacheKey.tokenTimeStamp)
                            }, set: function(value) {
                                    this._setCachedValue(Services.OAuth1Constants.CacheKey.tokenTimeStamp, value)
                                }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(OAuth1Store.prototype, "isAuthenticated", {
                            get: function() {
                                return this.token === null ? !1 : this.tokenTimeStamp ? this.tokenTimeStamp + OAuth1Store.defaultExpirationTimeout > Date.now() : !0
                            }, enumerable: !0, configurable: !0
                        }), OAuth1Store.defaultExpirationTimeout = 36e5, OAuth1Store
            }(Services.AuthenticationStore);
        Services.OAuth1Store = OAuth1Store
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var OAuth1Provider = function(_super) {
                __extends(OAuth1Provider, _super);
                function OAuth1Provider(signatureMethod, temporaryCredentialRequestUrl, temporaryCredentialRequestMethod, resourceOwnerAuthorizationUrl, callbackUrl, tokenRequestUrl, tokenRequestMethod, clientId, clientSecret, nsCache, brokerManager, controller) {
                    _super.call(this, new Services.OAuth1Store(nsCache));
                    this._brokerManager = brokerManager;
                    this._controller = controller;
                    this._signatureMethod = signatureMethod;
                    this._temporaryCredentialRequestUrl = temporaryCredentialRequestUrl;
                    this._temporaryCredentialRequestMethod = temporaryCredentialRequestMethod;
                    this._resourceOwnerAuthorizationUrl = resourceOwnerAuthorizationUrl;
                    this._callbackUrl = callbackUrl;
                    this._tokenRequestUrl = tokenRequestUrl;
                    this._tokenRequestMethod = tokenRequestMethod;
                    this._clientId = clientId;
                    this._clientSecret = clientSecret
                }
                return Object.defineProperty(OAuth1Provider.prototype, "store", {
                        get: function() {
                            return this._store
                        }, enumerable: !0, configurable: !0
                    }), OAuth1Provider.prototype.authenticateAsync = function(onBeforeAsyncStep, onAfterAsyncStep) {
                        var _this = this;
                        var acquirerId = this.store.getUniqueLockRequestId();
                        return this._acquireStoreAsync(acquirerId).then(function(result) {
                                return _this._authenticateAsync(result, onBeforeAsyncStep, onAfterAsyncStep)
                            }).then(function(result) {
                                return _this._retryAuthenticationIfNecessary(result, onBeforeAsyncStep, onAfterAsyncStep)
                            }).then(function(result) {
                                return _this._releaseStoreAsync(acquirerId, result)
                            }, function(error) {
                                return _this._onAuthenticateError(acquirerId, error)
                            })
                    }, OAuth1Provider.prototype.authenticateRequestAsync = function(builder, onBeforeAsyncStep, onAfterAsyncStep) {
                            var _this = this;
                            var acquirerId = this.store.getUniqueLockRequestId();
                            return this._acquireStoreAsync(acquirerId).then(function(result) {
                                    return _this._authenticateAsync(result, onBeforeAsyncStep, onAfterAsyncStep)
                                }).then(function(result) {
                                    return _this._retryAuthenticationIfNecessary(result, onBeforeAsyncStep, onAfterAsyncStep)
                                }).then(function(result) {
                                    return _this._authenticateRequest(result, builder)
                                }).then(function(result) {
                                    return _this._releaseStoreAsync(acquirerId, result)
                                }, function(error) {
                                    return _this._onAuthenticateError(acquirerId, error)
                                })
                        }, OAuth1Provider.prototype._authenticateAsync = function(acquireStoreResult, onBeforeAsyncStep, onAfterAsyncStep) {
                            var _this = this;
                            return acquireStoreResult.success ? this.store.isAuthenticated ? WinJS.Promise.wrap({success: !0}) : this._requestTemporaryCredentialsAsync(onBeforeAsyncStep, onAfterAsyncStep).then(function(temporaryCredentialsResponse) {
                                    return _this._requestAuthorizationAsync(temporaryCredentialsResponse, onBeforeAsyncStep, onAfterAsyncStep)
                                }).then(function(authorizationResponse) {
                                    return _this._requestTokenCredentialsAsync(authorizationResponse, onBeforeAsyncStep, onAfterAsyncStep)
                                }).then(function(tokenResponse) {
                                    return _this._extractAndStoreTokenCredentials(tokenResponse)
                                }) : WinJS.Promise.wrap(acquireStoreResult)
                        }, OAuth1Provider.prototype._retryAuthenticationIfNecessary = function(result, onBeforeAsyncStep, onAfterAsyncStep) {
                            return result.success || result.message === AppMagic.Strings.AuthenticationBrokerManagerErrorUserCanceled ? WinJS.Promise.wrap(result) : this._authenticateAsync({success: !0}, onBeforeAsyncStep, onAfterAsyncStep)
                        }, OAuth1Provider.prototype._requestTemporaryCredentialsAsync = function(onBeforeAsyncStep, onAfterAsyncStep) {
                            var headers = this._generateBaseHeaders();
                            return headers[Services.OAuth1Constants.OAuthHeaderName_OAuthCallBack] = Services.AuthUtility.fixedEncodeURIComponent(this._callbackUrl), headers[Services.OAuth1Constants.HeaderName_Authorization] = this._generateAuthorizationHeader(this._temporaryCredentialRequestMethod, this._temporaryCredentialRequestUrl, this._clientSecret, "", headers), onBeforeAsyncStep && onBeforeAsyncStep(), this._controller.sendHttp(this._temporaryCredentialRequestUrl, this._temporaryCredentialRequestMethod, headers, {}, [""]).then(function(response) {
                                        return onAfterAsyncStep && onAfterAsyncStep(), WinJS.Promise.wrap(response)
                                    }, function(err) {
                                        onAfterAsyncStep && onAfterAsyncStep();
                                        throw err;
                                    })
                        }, OAuth1Provider.prototype._requestAuthorizationAsync = function(temporaryCredentialsResponse, onBeforeAsyncStep, onAfterAsyncStep) {
                            if (!temporaryCredentialsResponse.success)
                                return temporaryCredentialsResponse;
                            var responseText = temporaryCredentialsResponse.result.responseText,
                                oauthTokenMatch = responseText.match(Services.OAuth1Constants.FormParameterRegex_OAuthToken),
                                oauthTokenSecretMatch = responseText.match(Services.OAuth1Constants.FormParameterRegex_OAuthTokenSecret);
                            if (oauthTokenMatch === null || oauthTokenSecretMatch === null)
                                return WinJS.Promise.wrap({
                                        success: !1, message: AppMagic.Strings.OAuth1BadResponseFromTempCredEndpoint
                                    });
                            var oauthToken = oauthTokenMatch[2],
                                oauthTokenSecret = oauthTokenSecretMatch[2],
                                queryParameters = {};
                            return queryParameters[Services.OAuth1Constants.QueryParameterName_OAuthToken] = oauthToken, this._brokerManager.requestAccessToken(this._resourceOwnerAuthorizationUrl, this._callbackUrl, queryParameters).then(function(response) {
                                    return WinJS.Promise.wrap({
                                            success: !0, brokerResponse: response, tokenSecret: oauthTokenSecret
                                        })
                                }, function(e) {
                                    return WinJS.Promise.wrap({
                                            success: !1, message: AppMagic.Strings.OAuth1BadResponseFromTempCredEndpoint
                                        })
                                })
                        }, OAuth1Provider.prototype._requestTokenCredentialsAsync = function(authorizationResponse, onBeforeAsyncStep, onAfterAsyncStep) {
                            if (!authorizationResponse.success)
                                return WinJS.Promise.wrap(authorizationResponse);
                            if (this.store.domains = authorizationResponse.brokerResponse.domains, !authorizationResponse.brokerResponse.success)
                                return authorizationResponse.brokerResponse;
                            var responseData = authorizationResponse.brokerResponse.result,
                                oauthTokenMatch = responseData.match(Services.OAuth1Constants.QueryParameterRegex_OAuthToken),
                                oauthVerifierMatch = responseData.match(Services.OAuth1Constants.QueryParameterRegex_OAuthVerifier);
                            if (oauthTokenMatch === null || oauthVerifierMatch === null)
                                return WinJS.Promise.wrap({
                                        success: !1, message: AppMagic.Strings.OAuth1AuthRedirectionFailed
                                    });
                            var oauthToken = oauthTokenMatch[3],
                                oauthVerifier = oauthVerifierMatch[3],
                                headers = this._generateBaseHeaders();
                            headers[Services.OAuth1Constants.OAuthHeaderName_OAuthToken] = oauthToken;
                            headers[Services.OAuth1Constants.OAuthHeaderName_OAuthVerifier] = oauthVerifier;
                            var encodedTokenSecret = Services.AuthUtility.fixedEncodeURIComponent(authorizationResponse.tokenSecret);
                            return headers[Services.OAuth1Constants.HeaderName_Authorization] = this._generateAuthorizationHeader(this._tokenRequestMethod, this._tokenRequestUrl, this._clientSecret, encodedTokenSecret, headers), onBeforeAsyncStep && onBeforeAsyncStep(), this._controller.sendHttp(this._tokenRequestUrl, this._tokenRequestMethod, headers, {}, [""]).then(function(response) {
                                        return onAfterAsyncStep && onAfterAsyncStep(), response
                                    }, function(error) {
                                        onAfterAsyncStep && onAfterAsyncStep();
                                        throw error;
                                    })
                        }, OAuth1Provider.prototype._extractAndStoreTokenCredentials = function(tokenCredentialsResponse) {
                            if (!tokenCredentialsResponse.success)
                                return tokenCredentialsResponse;
                            var responseText = tokenCredentialsResponse.result.responseText,
                                oauthTokenMatch = responseText.match(Services.OAuth1Constants.FormParameterRegex_OAuthToken),
                                oauthTokenSecretMatch = responseText.match(Services.OAuth1Constants.FormParameterRegex_OAuthTokenSecret);
                            return oauthTokenMatch === null || oauthTokenSecretMatch === null ? {
                                    success: !1, message: AppMagic.Strings.OAuth1BadResponseFromTokenCredEndpoint
                                } : (this.store.token = oauthTokenMatch[2], this.store.tokenSecret = oauthTokenSecretMatch[2], this.store.tokenTimeStamp = Date.now(), {
                                        success: !0, message: null
                                    })
                        }, OAuth1Provider.prototype._authenticateRequest = function(acquireResult, builder) {
                            var _this = this;
                            if (!acquireResult.success)
                                return WinJS.Promise.wrap(acquireResult);
                            var encodedHeaders = this._generateBaseHeaders();
                            return encodedHeaders[Services.OAuth1Constants.OAuthHeaderName_OAuthToken] = Services.AuthUtility.fixedEncodeURIComponent(this.store.token), builder.generateHttpRequestAsync().then(function(request) {
                                    var encodedForm = {};
                                    if (request instanceof Services.FormUrlEncodedHttpRequest) {
                                        var formRequest = request;
                                        encodedForm = formRequest.getEncodedForm()
                                    }
                                    var httpReqData = request.getRequestData(),
                                        authorizationHeader = _this._generateAuthorizationHeader(httpReqData.method, httpReqData.url, _this._clientSecret, _this.store.tokenSecret, encodedHeaders, httpReqData.queryParameters, encodedForm);
                                    builder.addHeader(Services.OAuth1Constants.HeaderName_Authorization, authorizationHeader)
                                })
                        }, OAuth1Provider.prototype._generateBaseHeaders = function() {
                            var headers = {};
                            return headers[Services.OAuth1Constants.OAuthHeaderName_OAuthTimestamp] = Services.AuthUtility.getTimestamp(), headers[Services.OAuth1Constants.OAuthHeaderName_OAuthVersion] = Services.OAuth1Constants.OAuthHeaderValue_OAuthVersion, headers[Services.OAuth1Constants.OAuthHeaderName_OAuthNonce] = Services.AuthUtility.getNonce(OAuth1Provider.nonceLength), headers[Services.OAuth1Constants.OAuthHeaderName_OAuthConsumerKey] = Services.AuthUtility.fixedEncodeURIComponent(this._clientId), headers[Services.OAuth1Constants.OAuthHeaderName_OAuthSignatureMethod] = this._signatureMethod, headers
                        }, OAuth1Provider.prototype._generateAuthorizationHeader = function(method, url, unencodedClientSecret, unencodedTokenSecret, encodedHeaders, unencodedQueryParams, encodedFormParams) {
                            var encodedParametersToBeSigned = [];
                            unencodedQueryParams && Object.keys(unencodedQueryParams).forEach(function(key) {
                                encodedParametersToBeSigned.push({
                                    key: Services.AuthUtility.fixedEncodeURIComponent(key), value: Services.AuthUtility.fixedEncodeURIComponent(unencodedQueryParams[key])
                                })
                            });
                            encodedFormParams && Object.keys(encodedFormParams).forEach(function(key) {
                                encodedParametersToBeSigned.push({
                                    key: key, value: encodedFormParams[key]
                                })
                            });
                            var signature = Services.AuthUtility.getOAuth1HmacSha1SignatureForParameters(encodedHeaders, encodedParametersToBeSigned, unencodedClientSecret, unencodedTokenSecret, method, url);
                            return Services.AuthUtility.getHmacSha1SignedOAuthAuthorizationHeader(signature, encodedHeaders)
                        }, OAuth1Provider.nonceLength = 16, OAuth1Provider
            }(Services.AuthenticationProvider);
        Services.OAuth1Provider = OAuth1Provider
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var OAuth2ClientCredentialsGrantType = function(_super) {
                __extends(OAuth2ClientCredentialsGrantType, _super);
                function OAuth2ClientCredentialsGrantType(scope, clientId, clientSecret, accessTokenEndpointInfo, tokenVariables, nsCache, brokerManager, controller) {
                    _super.call(this, scope, new Services.OAuth2Store(nsCache), brokerManager, controller);
                    this._clientId = clientId;
                    this._clientSecret = clientSecret;
                    this._accessTokenEndpointInfo = accessTokenEndpointInfo;
                    this._tokenVariables = tokenVariables
                }
                return OAuth2ClientCredentialsGrantType.prototype.authenticateAsync = function(onBeforeAsyncStep, onAfterAsyncStep) {
                        var _this = this;
                        return this._requestTokenCredentialsAsync(onBeforeAsyncStep, onAfterAsyncStep).then(function(tokenResponse) {
                                return _this._extractAndStoreTokenCredentials(tokenResponse)
                            })
                    }, OAuth2ClientCredentialsGrantType.prototype._requestTokenCredentialsAsync = function(onBeforeAsyncStep, onAfterAsyncStep) {
                        var _this = this;
                        onBeforeAsyncStep && onBeforeAsyncStep();
                        var builder = this._accessTokenEndpointInfo.httpRequestBuilder.clone(),
                            applyParamPromises = this._accessTokenEndpointInfo.requestParams.map(function(param) {
                                return param.applyAsync(builder, null)
                            });
                        return WinJS.Promise.join(applyParamPromises).then(function() {
                                return builder.setFormValue(Services.Constants.OAuth2.ParameterNames.grantType, Services.Constants.OAuth2.GrantTypes.clientCredentials), builder.setFormValue(Services.Constants.OAuth2.ParameterNames.clientId, _this._clientId), builder.setFormValue(Services.Constants.OAuth2.ParameterNames.clientSecret, _this._clientSecret), typeof _this.scope != "undefined" && _this.scope !== null && builder.setFormValue(Services.Constants.OAuth2.ParameterNames.scope, _this.scope), builder.generateHttpRequestAsync()
                            }).then(function(request) {
                                var httpReqData = request.getRequestData(),
                                    body = httpReqData.data.map(function(datum) {
                                        return datum.value
                                    });
                                return _this.controller.sendHttp(httpReqData.url, httpReqData.method, httpReqData.headers, httpReqData.queryParameters, body).then(function(response) {
                                        return onAfterAsyncStep && onAfterAsyncStep(), response
                                    }, function(error) {
                                        return onAfterAsyncStep && onAfterAsyncStep(), WinJS.Promise.wrap({
                                                success: !1, message: error.message
                                            })
                                    })
                            })
                    }, OAuth2ClientCredentialsGrantType.prototype._extractAndStoreTokenCredentials = function(tokenCredentialsResponse) {
                            var _this = this;
                            if (!tokenCredentialsResponse.success)
                                return Services.ServiceUtility.createUnsuccessfulAsyncResultFromOther(tokenCredentialsResponse);
                            var responseText = tokenCredentialsResponse.result.responseText,
                                resultJson = JSON.parse(responseText),
                                tokenVariableValues = {},
                                anyVarsMissing = !1;
                            if (Object.keys(this._tokenVariables).forEach(function(varName) {
                                var jsonPointer = _this._tokenVariables[varName];
                                var varValue = AppMagic.Utility.getJsonValueViaJsonPointer(resultJson, jsonPointer);
                                typeof varValue == "undefined" || varValue === null ? anyVarsMissing = !0 : tokenVariableValues[varName] = varValue
                            }), anyVarsMissing)
                                return Services.ServiceUtility.createUnsuccessfulAsyncResult(AppMagic.Strings.OAuth2ErrorInvalidResponseDataReturnedFromServer);
                            var accessToken = resultJson[Services.Constants.OAuth2.ParameterNames.accessToken];
                            return typeof accessToken != "string" ? Services.ServiceUtility.createUnsuccessfulAsyncResult(AppMagic.Strings.OAuth2ErrorInvalidResponseDataReturnedFromServer) : (this.store.token = accessToken, this.store.tokenTimeStamp = Date.now(), typeof resultJson[Services.Constants.OAuth2.ParameterNames.expiresIn] != "undefined" && (this.store.tokenExpiresIn = resultJson[Services.Constants.OAuth2.ParameterNames.expiresIn], this.store.tokenExpiresIn *= 1e3), Object.keys(this._tokenVariables).forEach(function(varName) {
                                        return _this.store.setVariableValue(varName, tokenVariableValues[varName])
                                    }), Services.ServiceUtility.createSuccessfulVoidAsyncResult())
                        }, OAuth2ClientCredentialsGrantType
            }(Services.OAuth2GrantTypeBase);
        Services.OAuth2ClientCredentialsGrantType = OAuth2ClientCredentialsGrantType
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var OAuth2ImplicitGrantType = function(_super) {
                __extends(OAuth2ImplicitGrantType, _super);
                function OAuth2ImplicitGrantType(scope, clientId, authorizationEndpointInfo, redirectUri, redirectionParamVariables, nsCache, brokerManager, controller) {
                    _super.call(this, scope, new Services.OAuth2Store(nsCache), brokerManager, controller);
                    this._clientId = clientId;
                    this._authorizationEndpointInfo = authorizationEndpointInfo;
                    this._redirectUri = redirectUri;
                    this._redirectionParamVariables = redirectionParamVariables
                }
                return OAuth2ImplicitGrantType.prototype.authenticateAsync = function(onBeforeAsyncStep, onAfterAsyncStep) {
                        var _this = this;
                        return this._requestTokenCredentialsAsync(onBeforeAsyncStep, onAfterAsyncStep).then(function(tokenResponse) {
                                return _this._extractAndStoreTokenCredentials(tokenResponse)
                            })
                    }, OAuth2ImplicitGrantType.prototype._requestTokenCredentialsAsync = function(onBeforeAsyncStep, onAfterAsyncStep) {
                        var _this = this;
                        var builder = this._authorizationEndpointInfo.httpRequestBuilder.clone(),
                            applyParamPromises = this._authorizationEndpointInfo.requestParams.map(function(param) {
                                return param.applyAsync(builder, null)
                            });
                        return WinJS.Promise.join(applyParamPromises).then(function() {
                                return typeof _this.scope != "undefined" && _this.scope !== null && builder.addQueryParameter(Services.Constants.OAuth2.ParameterNames.scope, _this.scope), builder.addQueryParameter(Services.Constants.OAuth2.ParameterNames.clientId, _this._clientId), builder.addQueryParameter(Services.Constants.OAuth2.ParameterNames.redirectUri, _this._redirectUri), builder.addQueryParameter(Services.Constants.OAuth2.ParameterNames.responseType, Services.Constants.OAuth2.ResponseTypes.token), builder.generateHttpRequestAsync()
                            }).then(function(request) {
                                var httpReqData = request.getRequestData();
                                return _this.brokerManager.requestAccessToken(httpReqData.url, _this._redirectUri, httpReqData.queryParameters)
                            })
                    }, OAuth2ImplicitGrantType.prototype._extractAndStoreTokenCredentials = function(tokenCredentialsResponse) {
                            var _this = this;
                            if (this.store.domains = tokenCredentialsResponse.domains, !tokenCredentialsResponse.success)
                                return tokenCredentialsResponse;
                            var locationUri = tokenCredentialsResponse.result,
                                uriComponents = AppMagic.Utility.UriUtility.parseUriComponents(locationUri);
                            if (uriComponents === null)
                                return Services.ServiceUtility.createUnsuccessfulAsyncResult(AppMagic.Strings.OAuth2ErrorInvalidResponseDataReturnedFromServer);
                            var fragmentParams = AppMagic.Utility.UriUtility.parseFormUrlEncodedStringToHashTable(uriComponents.fragment);
                            var accessToken = fragmentParams[Services.Constants.OAuth2.ParameterNames.accessToken];
                            if (typeof accessToken != "string")
                                return Services.ServiceUtility.createUnsuccessfulAsyncResult(AppMagic.Strings.OAuth2ErrorInvalidResponseDataReturnedFromServer);
                            this.store.token = accessToken;
                            this.store.tokenTimeStamp = Date.now();
                            var expiresInParamValue = fragmentParams[Services.Constants.OAuth2.ParameterNames.expiresIn];
                            if (typeof expiresInParamValue == "string" && expiresInParamValue.match(/\d+/)) {
                                var expiresIn = parseInt(expiresInParamValue);
                                expiresIn *= 1e3;
                                this.store.tokenExpiresIn = expiresIn
                            }
                            var anyVarsMissing = !1;
                            return (Object.keys(this._redirectionParamVariables).forEach(function(varName) {
                                    var paramName = _this._redirectionParamVariables[varName];
                                    var paramValue = fragmentParams[paramName];
                                    typeof paramName == "string" ? _this.store.setVariableValue(varName, paramValue) : anyVarsMissing = !0
                                }), anyVarsMissing) ? Services.ServiceUtility.createUnsuccessfulAsyncResult(AppMagic.Strings.OAuth2ErrorInvalidResponseDataReturnedFromServer) : Services.ServiceUtility.createSuccessfulVoidAsyncResult()
                        }, OAuth2ImplicitGrantType
            }(Services.OAuth2GrantTypeBase);
        Services.OAuth2ImplicitGrantType = OAuth2ImplicitGrantType
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ParameterReferenceExpression = function() {
                function ParameterReferenceExpression(parameterName) {
                    this._parameterName = parameterName
                }
                return ParameterReferenceExpression.prototype.computeResultSchema = function(serviceFunction, maxSchemaDepth) {
                        var parameter = serviceFunction.getParameter(this._parameterName);
                        var resultSchema = parameter.getSchema(maxSchemaDepth);
                        return resultSchema
                    }, ParameterReferenceExpression.prototype.isBehaviorOnly = function(serviceFunction) {
                        return !1
                    }, ParameterReferenceExpression.prototype.evaluateAsync = function(executionContext) {
                            var result = executionContext.tryGetParameterValue(this._parameterName);
                            return result.value ? WinJS.Promise.wrap(Services.ServiceUtility.createSuccessfulValueExpressionResult(result.outValue)) : WinJS.Promise.wrap(Services.ServiceUtility.createUnsuccessfulValueExpressionResult())
                        }, ParameterReferenceExpression
            }();
        Services.ParameterReferenceExpression = ParameterReferenceExpression
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var PrimitiveDArgument = function() {
                function PrimitiveDArgument(value) {
                    this._value = value
                }
                return PrimitiveDArgument.createFromValueAndDType = function(value, dtype) {
                        return new AppMagic.Services.PrimitiveDArgument(value)
                    }, Object.defineProperty(PrimitiveDArgument.prototype, "value", {
                        get: function() {
                            return this._value
                        }, enumerable: !0, configurable: !0
                    }), PrimitiveDArgument
            }();
        Services.PrimitiveDArgument = PrimitiveDArgument
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Common;
    (function(Common) {
        var PublishDataSourceProviderCreator = function() {
                function PublishDataSourceProviderCreator(dataSource, providerFactory, runtime) {
                    this._dataSource = dataSource;
                    this._providerFactory = providerFactory;
                    this._runtime = runtime;
                    this._configuration = JSON.parse(dataSource.configuration)
                }
                return PublishDataSourceProviderCreator.prototype._dataSourceName = function() {
                        return this._dataSource.name
                    }, PublishDataSourceProviderCreator.prototype.createProvider = function() {
                        var _this = this;
                        var provider = this._providerFactory.createDataSourceProvider(this._configuration.internalConfiguration, this._dataSourceName(), this._runtime);
                        return provider.initializeProvider().then(function(initResult) {
                                return initResult.success ? WinJS.Promise.wrap({
                                        success: !0, result: {
                                                provider: provider, configuration: AppMagic.Utility.jsonClone(_this._configuration)
                                            }, message: null
                                    }) : WinJS.Promise.wrap({
                                        success: !1, message: initResult.message
                                    })
                            })
                    }, PublishDataSourceProviderCreator
            }();
        Common.PublishDataSourceProviderCreator = PublishDataSourceProviderCreator
    })(Common = AppMagic.Common || (AppMagic.Common = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Common;
    (function(Common) {
        var PublishedDataSourceInfoReader = function() {
                function PublishedDataSourceInfoReader(publishedDataSource) {
                    this._cachedCopyOfDataSource = AppMagic.Utility.jsonClone(publishedDataSource)
                }
                return Object.defineProperty(PublishedDataSourceInfoReader.prototype, "name", {
                        get: function() {
                            return this._cachedCopyOfDataSource.name
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(PublishedDataSourceInfoReader.prototype, "configuration", {
                        get: function() {
                            return JSON.stringify(this._cachedCopyOfDataSource.configuration)
                        }, enumerable: !0, configurable: !0
                    }), PublishedDataSourceInfoReader
            }();
        Common.PublishedDataSourceInfoReader = PublishedDataSourceInfoReader
    })(Common = AppMagic.Common || (AppMagic.Common = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var QueryRequestParam = function(_super) {
                __extends(QueryRequestParam, _super);
                function QueryRequestParam(paramName, paramValueStringifier, valueExpression) {
                    _super.call(this, paramName, paramValueStringifier, valueExpression)
                }
                return QueryRequestParam.prototype._applyStringifiedValue = function(httpRequestBuilder, value) {
                        httpRequestBuilder.addQueryParameter(this._paramName, value)
                    }, QueryRequestParam
            }(Services.NamedHttpRequestParam);
        Services.QueryRequestParam = QueryRequestParam
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var QuoteStringExpression = function() {
                function QuoteStringExpression(quoteChar, escapeStr, valueExpr) {
                    this._quoteChar = quoteChar;
                    this._escapeStr = escapeStr;
                    this._valueExpr = valueExpr
                }
                return QuoteStringExpression.prototype.computeResultSchema = function(serviceFunction) {
                        return AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeString)
                    }, QuoteStringExpression.prototype.isBehaviorOnly = function(serviceFunction) {
                        return this._valueExpr.isBehaviorOnly(serviceFunction)
                    }, QuoteStringExpression.prototype.evaluateAsync = function(executionContext) {
                            var _this = this;
                            return this._valueExpr.evaluateAsync(executionContext).then(function(evalResult) {
                                    if (!evalResult.success)
                                        return evalResult;
                                    var quoted = _this._quoteValue(evalResult.value);
                                    return Services.ServiceUtility.createSuccessfulValueExpressionResult(quoted)
                                }).then(Services.ServiceUtility.valueExpressionResultIdentityFunction, Services.ServiceUtility.promiseErrorToValueExpressionResult)
                        }, QuoteStringExpression.prototype._quoteValue = function(value) {
                            if (value === null)
                                return null;
                            var valueStr = value.toString(),
                                escapedValue = AppMagic.Utility.StringUtility.escapeCharacters(valueStr, this._quoteChar + this._escapeStr, this._escapeStr);
                            return this._quoteChar + escapedValue + this._quoteChar
                        }, QuoteStringExpression
            }();
        Services.QuoteStringExpression = QuoteStringExpression
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var RemoveCloudTableRow = function() {
                function RemoveCloudTableRow(azureTable, rowKeySetForRemovee, timestampOfTableHeaderPrimaryEntity, etagOfTableHeaderPrimaryEntity, rowKeySetForTableHeader, tableHeaderRowData) {
                    this._azureTable = azureTable;
                    this._rowKeySetForRemovee = rowKeySetForRemovee;
                    this._timestampOfTableHeaderPrimaryEntity = timestampOfTableHeaderPrimaryEntity;
                    this._etagOfTableHeaderPrimaryEntity = etagOfTableHeaderPrimaryEntity;
                    this._rowKeySetForTableHeader = rowKeySetForTableHeader;
                    this._tableHeaderRowData = tableHeaderRowData
                }
                return RemoveCloudTableRow.prototype._rowKeyOfRemoveePrimaryEntity = function() {
                        return this._rowKeySetForRemovee[0]
                    }, RemoveCloudTableRow.prototype.performOperation = function() {
                        for (var _this = this, rowKeyOfRemovedRowPrimaryEntity = this._rowKeyOfRemoveePrimaryEntity(), newTableHeader = AppMagic.Utility.jsonClone(this._tableHeaderRowData), rowListing = newTableHeader.rows, found = !1, i = 0, len = rowListing.length; i < len; i++)
                            if (rowListing[i] === rowKeyOfRemovedRowPrimaryEntity) {
                                rowListing.splice(i, 1);
                                found = !0;
                                break
                            }
                        var tableHeaderEntitiesAndRowKeys = Services.CloudTableWorker.getEntitiesForRow(newTableHeader, Services.CloudTableWorker.EntityPropertyValue_RowKey_TableHeader, Services.CloudTableWorker.generateTableHeaderRowKey),
                            entityWriteInfo = [];
                        return Services.CloudTableWorker.appendWriteEntityInfo(tableHeaderEntitiesAndRowKeys.entities, this._partitionKey(), tableHeaderEntitiesAndRowKeys.rowKeySet, entityWriteInfo, 1), Services.CloudTableWorker.writeEntities(this._azureTable, entityWriteInfo).then(function(response) {
                                return response.allSucceeded ? _this._writeTableHeaderPrimaryEntity(tableHeaderEntitiesAndRowKeys.entities, tableHeaderEntitiesAndRowKeys.rowKeySet) : (Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), tableHeaderEntitiesAndRowKeys.rowKeySet, 1), WinJS.Promise.wrap({resultCode: 1}))
                            })
                    }, RemoveCloudTableRow.prototype._writeTableHeaderPrimaryEntity = function(tableHeaderEntities, newRowKeySetForTableHeader) {
                            var _this = this;
                            return this._azureTable.updateEntity(this._partitionKey(), newRowKeySetForTableHeader[0], tableHeaderEntities[0], this._etagOfTableHeaderPrimaryEntity).then(function(updateResult) {
                                    return updateResult.resultCode !== 0 ? (Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), newRowKeySetForTableHeader, 1), updateResult.resultCode !== 1) ? WinJS.Promise.wrap({resultCode: 2}) : _this._handlePreconditionFailure() : (Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), _this._rowKeySetForTableHeader, 1), Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), _this._rowKeySetForRemovee, 0), WinJS.Promise.wrap({resultCode: 0}))
                                })
                        }, RemoveCloudTableRow.prototype._handlePreconditionFailure = function() {
                            var _this = this;
                            return Services.CloudTableWorker.queryLatestRowInfoSinceTimestamp(this._azureTable, this._partitionKey(), this._timestampOfTableHeaderPrimaryEntity).then(function(response) {
                                    return response === null ? WinJS.Promise.wrap({resultCode: 5}) : _this._reattemptRemove(response)
                                })
                        }, RemoveCloudTableRow.prototype._reattemptRemove = function(queryResult) {
                            if (!Core.Utility.isDefined(queryResult.entitiesByRowKey[this._rowKeyOfRemoveePrimaryEntity()]))
                                return WinJS.Promise.wrap({resultCode: 0});
                            var latestSnapshot = queryResult.tableHeaderSnapshot,
                                buildResult = Services.CloudTableWorker.buildRow(this._rowKeyOfRemoveePrimaryEntity(), queryResult.entitiesByRowKey),
                                rctr = new RemoveCloudTableRow(this._azureTable, buildResult.rowKeys, this._timestampOfTableHeaderPrimaryEntity, latestSnapshot.etagOfTableHeaderPrimaryEntity, latestSnapshot.rowKeySetOfTableHeader, latestSnapshot.tableHeaderRowData);
                            return rctr.performOperation()
                        }, RemoveCloudTableRow.prototype._partitionKey = function() {
                            return Services.CloudTableWorker.EntityPropertyValue_PartitionKey_FirstLevel
                        }, RemoveCloudTableRow
            }();
        Services.RemoveCloudTableRow = RemoveCloudTableRow
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ResourceAwaiterPool = function() {
                function ResourceAwaiterPool(resourceAcquirer) {
                    this._resourceAcquirer = resourceAcquirer;
                    this._resourceAwaiterCounter = 0;
                    this._resourceAwaiters = {}
                }
                return ResourceAwaiterPool.prototype.acquire = function() {
                        var _this = this,
                            resource = this._resourceAcquirer.tryGetResource();
                        if (resource.success)
                            return WinJS.Promise.wrap(resource.result);
                        if (this._resourceAcquirer.isAcquiring()) {
                            var complete,
                                ticket = this._resourceAwaiterCounter++,
                                p = new WinJS.Promise(function(c) {
                                    complete = c
                                }).then(function(response) {
                                    return delete _this._resourceAwaiters[ticket], response
                                }, function(error) {
                                    delete _this._resourceAwaiters[ticket];
                                    throw error;
                                });
                            return this._resourceAwaiters[ticket] = {
                                    complete: complete, promise: p
                                }, p
                        }
                        return this._acquire()
                    }, ResourceAwaiterPool.prototype._acquire = function() {
                        var _this = this;
                        return this._resourceAcquirer.acquireResource().then(function(acquireResult) {
                                return _this._notifyAwaiters(acquireResult), WinJS.Promise.wrap(acquireResult)
                            }, function(error) {
                                _this._notifyAwaiters(_this._resourceAcquirer.getCanceledResult());
                                throw error;
                            })
                    }, ResourceAwaiterPool.prototype._notifyAwaiters = function(acquireResult) {
                            var _this = this;
                            Object.keys(this._resourceAwaiters).forEach(function(ticket) {
                                _this._resourceAwaiters[ticket].complete(acquireResult)
                            })
                        }, ResourceAwaiterPool
            }();
        Services.ResourceAwaiterPool = ResourceAwaiterPool
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var RestServiceFunction = function(_super) {
                __extends(RestServiceFunction, _super);
                function RestServiceFunction(service, functionDef, name, docId, disableTryIt, isHiddenFromRules, isShownInBackstage, isBehaviorOnly, parameters, authProviderId, httpRequestBuilder, requestParams, controller) {
                    _super.call(this, service, functionDef, name, docId, disableTryIt, isHiddenFromRules, isShownInBackstage, parameters);
                    this._isBehaviorOnly = isBehaviorOnly;
                    this.authProviderId = authProviderId;
                    this.requestBuilderFactory = new Services.HttpRequestBuilderFactory(httpRequestBuilder);
                    this.requestParams = requestParams;
                    this._controller = controller
                }
                return Object.defineProperty(RestServiceFunction.prototype, "isBehaviorOnly", {
                        get: function() {
                            return this._isBehaviorOnly
                        }, enumerable: !0, configurable: !0
                    }), RestServiceFunction.prototype.computeResultSchema = function(maxSchemaDepth) {
                        var responseSchema = AppMagic.Services.Meta.RESTWorkerController.computeResponseSchema(this.functionDefinition.response, this.service.typesByPrefixAndName);
                        return responseSchema
                    }, RestServiceFunction.prototype.runAsync = function(parameterValues, onBeforeAsyncStep, onAfterAsyncStep) {
                            var _this = this;
                            var executionContext = new Services.FunctionExecutionContext(this, parameterValues, {}, onBeforeAsyncStep, onAfterAsyncStep),
                                builder = this.requestBuilderFactory.createHttpRequestBuilder(),
                                applyParamPromises = this.requestParams.map(function(param) {
                                    return param.applyAsync(builder, executionContext)
                                }),
                                runPromise = WinJS.Promise.join(applyParamPromises).then(function() {
                                    return WinJS.Promise.wrap(Services.ServiceUtility.createSuccessfulVoidAsyncResult())
                                });
                            if (this.authProviderId) {
                                var authenticationProvider = this.service.authenticationProviders[this.authProviderId];
                                var authenticatePromise = authenticationProvider.authenticateRequestAsync(builder, onBeforeAsyncStep, onAfterAsyncStep).then(Services.ServiceUtility.pipelineResultIdentityFunction, Services.ServiceUtility.promiseErrorToAsyncResult);
                                runPromise = runPromise.then(function() {
                                    return authenticatePromise
                                })
                            }
                            return runPromise.then(function(pipelineResult) {
                                    return pipelineResult.success ? builder.generateHttpRequestAsync().then(function(request) {
                                            return _this._sendHttpRequestAsync(request, onBeforeAsyncStep, onAfterAsyncStep)
                                        }).then(Services.ServiceUtility.pipelineResultIdentityFunction, Services.ServiceUtility.promiseErrorToAsyncResult) : WinJS.Promise.wrap(pipelineResult)
                                })
                        }, RestServiceFunction.prototype._sendHttpRequestAsync = function(request, onBeforeAsyncStep, onAfterAsyncStep) {
                            var _this = this;
                            var httpReqData = request.getRequestData(),
                                body = httpReqData.data.map(function(datum) {
                                    return datum.value
                                });
                            return onBeforeAsyncStep && onBeforeAsyncStep(), this._controller.sendHttpAndParse(httpReqData.url, httpReqData.method, httpReqData.headers, httpReqData.queryParameters, body, this.functionDefinition.response).then(function(response) {
                                    return (onAfterAsyncStep && onAfterAsyncStep(), !response.success) ? response : (_this.functionDefinition.response && (response = AppMagic.Services.Meta.RESTWorkerController.postWorkerProcess(_this.functionDefinition, {
                                            success: !0, result: response
                                        }, _this.service.typesByPrefixAndName)), response)
                                }, function(error) {
                                    return onAfterAsyncStep && onAfterAsyncStep(), WinJS.Promise.wrapError(error)
                                })
                        }, RestServiceFunction
            }(Services.ServiceFunctionBase);
        Services.RestServiceFunction = RestServiceFunction
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization) {
            var RequestDefinitionDeserializer = function() {
                    function RequestDefinitionDeserializer(builder) {
                        this._builder = builder;
                        this._requestParams = []
                    }
                    return RequestDefinitionDeserializer.prototype.parseMethodAndBaseUrl = function(fnDef) {
                            this._builder.setMethod(fnDef.request.method);
                            this._builder.setBaseUrl(fnDef.request.url.base)
                        }, RequestDefinitionDeserializer.prototype.parseHeaderParamDefinitionListing = function(listing) {
                            ServiceConfigDeserialization.parseHeaderParamDefinitionListing(listing, this._requestParams)
                        }, RequestDefinitionDeserializer.prototype.parseQueryParamDefinitionListing = function(listing) {
                                ServiceConfigDeserialization.parseQueryParamDefinitionListing(listing, this._requestParams)
                            }, RequestDefinitionDeserializer.prototype.parsePathItemDefinitions = function(pathItemDefs) {
                                ServiceConfigDeserialization.parsePathItemDefinitions(pathItemDefs, this._builder, this._requestParams)
                            }, RequestDefinitionDeserializer.prototype.parseBody = function(bodyDef){}, RequestDefinitionDeserializer.prototype.getParams = function() {
                                return {
                                        httpRequestBuilder: this._builder, requestParams: this._requestParams
                                    }
                            }, RequestDefinitionDeserializer
                }();
            ServiceConfigDeserialization.RequestDefinitionDeserializer = RequestDefinitionDeserializer
        })(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization) {
            var BodilessRequestDefinitionDeserializer = function(_super) {
                    __extends(BodilessRequestDefinitionDeserializer, _super);
                    function BodilessRequestDefinitionDeserializer() {
                        _super.call(this, new Services.BodilessHttpRequestBuilder)
                    }
                    return BodilessRequestDefinitionDeserializer.prototype.parseBody = function(bodyDef){}, BodilessRequestDefinitionDeserializer
                }(ServiceConfigDeserialization.RequestDefinitionDeserializer);
            ServiceConfigDeserialization.BodilessRequestDefinitionDeserializer = BodilessRequestDefinitionDeserializer
        })(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization) {
            var CompositeFunctionDefinitionDeserializer;
            (function(CompositeFunctionDefinitionDeserializer) {
                function parseFunctionDefinition(fnDef, parseContext) {
                    var parameters = ServiceConfigDeserialization.parseFunctionParameters(fnDef.parameters, parseContext.service.typesManager),
                        variables = parseFunctionVariables(fnDef.variables),
                        disableTryIt = fnDef.disabletryit === !0,
                        isHiddenFromRules = !1,
                        isShownInBackstage = !0,
                        docId = fnDef.docid ? fnDef.docid : null,
                        returnExpression = ServiceConfigDeserialization.parseValueExpressionDefinition(fnDef.returnexpression);
                    return new Services.CompositeServiceFunction(parseContext.service, fnDef, fnDef.name, docId, disableTryIt, isHiddenFromRules, isShownInBackstage, parameters, variables, returnExpression)
                }
                CompositeFunctionDefinitionDeserializer.parseFunctionDefinition = parseFunctionDefinition;
                function parseFunctionVariables(variableDefs) {
                    return variableDefs.map(function(varDef) {
                            var valueExpr = ServiceConfigDeserialization.parseValueExpressionDefinition(varDef.valueexpression);
                            return new Services.FunctionVariable(varDef.name, valueExpr)
                        })
                }
            })(CompositeFunctionDefinitionDeserializer = ServiceConfigDeserialization.CompositeFunctionDefinitionDeserializer || (ServiceConfigDeserialization.CompositeFunctionDefinitionDeserializer = {}))
        })(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization) {
            var FormUrlEncodedRequestDefinitionDeserializer = function(_super) {
                    __extends(FormUrlEncodedRequestDefinitionDeserializer, _super);
                    function FormUrlEncodedRequestDefinitionDeserializer() {
                        _super.call(this, new Services.FormUrlEncodedHttpRequestBuilder)
                    }
                    return FormUrlEncodedRequestDefinitionDeserializer.prototype.parseBody = function(bodyDef) {
                            ServiceConfigDeserialization.parseFormUrlEncodedBodyParamDefinitionListing(bodyDef.params, this._requestParams)
                        }, FormUrlEncodedRequestDefinitionDeserializer
                }(ServiceConfigDeserialization.RequestDefinitionDeserializer);
            ServiceConfigDeserialization.FormUrlEncodedRequestDefinitionDeserializer = FormUrlEncodedRequestDefinitionDeserializer
        })(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization) {
            var IRConstants;
            (function(IRConstants) {
                var DefTypes;
                (function(DefTypes) {
                    DefTypes.RestFunction = "RestFunction";
                    DefTypes.CompositeFunction = "CompositeFunction";
                    DefTypes.Literal = "Literal";
                    DefTypes.ParameterReference = "ParameterReference";
                    DefTypes.VariableReference = "VariableReference";
                    DefTypes.AuthenticationVariableReference = "AuthenticationVariableReference";
                    DefTypes.QuoteString = "QuoteString";
                    DefTypes.StringFormat = "StringFormat";
                    DefTypes.FunctionCall = "FunctionCall";
                    DefTypes.O365ParseEmailAddresses = "O365ParseEmailAddresses";
                    DefTypes.BuiltInFunctionCall = "BuiltInFunctionCall";
                    DefTypes.BuiltInFunctionName_O365ComposeRecipientsArray = "O365ComposeRecipientsArray";
                    DefTypes.BuiltInFunctionName_O365ComposeAttendeesArray = "O365ComposeAttendeesArray";
                    DefTypes.BinaryData = "BinaryData";
                    DefTypes.SampleXmlElement = "SampleXmlElement";
                    DefTypes.XmlSimpleType = "XmlSimpleType";
                    DefTypes.JsonPrimitive = "JsonPrimitive";
                    DefTypes.JsonObject = "JsonObject";
                    DefTypes.JsonArray = "JsonArray";
                    DefTypes.JsonMapObject = "JsonMapObject";
                    DefTypes.JsonBase64Binary = "JsonBase64Binary"
                })(DefTypes = IRConstants.DefTypes || (IRConstants.DefTypes = {}));
                var JsonPrimitives;
                (function(JsonPrimitives) {
                    JsonPrimitives.Boolean = "boolean";
                    JsonPrimitives.Number = "number";
                    JsonPrimitives.String = "string"
                })(JsonPrimitives = IRConstants.JsonPrimitives || (IRConstants.JsonPrimitives = {}))
            })(IRConstants = ServiceConfigDeserialization.IRConstants || (ServiceConfigDeserialization.IRConstants = {}))
        })(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization){})(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization){})(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization){})(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization){})(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var XsdUtility;
            (function(XsdUtility) {
                var XsdTypeNames;
                (function(XsdTypeNames) {
                    XsdTypeNames.Boolean = "boolean";
                    XsdTypeNames.Int = "int";
                    XsdTypeNames.Long = "long";
                    XsdTypeNames.UnsignedInt = "unsignedInt";
                    XsdTypeNames.UnsignedLong = "unsignedLong";
                    XsdTypeNames.Decimal = "decimal";
                    XsdTypeNames.Float = "float";
                    XsdTypeNames.Double = "double";
                    XsdTypeNames.String = "string";
                    XsdTypeNames.Base64Binary = "base64Binary";
                    XsdTypeNames.HexBinary = "hexBinary";
                    XsdTypeNames.AnyURI = "anyURI"
                })(XsdTypeNames = XsdUtility.XsdTypeNames || (XsdUtility.XsdTypeNames = {}));
                function tryParseNumericXsdTypeFromXsdTypeName(xsdType) {
                    var result;
                    switch (xsdType) {
                        case XsdTypeNames.Decimal:
                            result = 0;
                            break;
                        case XsdTypeNames.Float:
                            result = 1;
                            break;
                        case XsdTypeNames.Int:
                            result = 3;
                            break;
                        case XsdTypeNames.Long:
                            result = 4;
                            break;
                        case XsdTypeNames.UnsignedInt:
                            result = 5;
                            break;
                        case XsdTypeNames.UnsignedLong:
                            result = 6;
                            break;
                        default:
                            return {success: !1}
                    }
                    return {
                            success: !0, result: result
                        }
                }
                XsdUtility.tryParseNumericXsdTypeFromXsdTypeName = tryParseNumericXsdTypeFromXsdTypeName;
                function coerceNumberToXsdNumericType(value, xsdType) {
                    switch (xsdType) {
                        case 0:
                        case 1:
                        case 2:
                            return value;
                        case 3:
                        case 4:
                            return value > 0 ? Math.floor(value) : Math.ceil(value);
                        case 5:
                        case 6:
                            return Math.abs(value > 0 ? Math.floor(value) : Math.ceil(value));
                        default:
                            break
                    }
                }
                XsdUtility.coerceNumberToXsdNumericType = coerceNumberToXsdNumericType
            })(XsdUtility = TypeSystem.XsdUtility || (TypeSystem.XsdUtility = {}))
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization) {
            var JsonRequestDefinitionDeserializer = function(_super) {
                    __extends(JsonRequestDefinitionDeserializer, _super);
                    function JsonRequestDefinitionDeserializer(typesMgr) {
                        _super.call(this, new Services.JsonHttpRequestBuilder);
                        this._typesMgr = typesMgr
                    }
                    return JsonRequestDefinitionDeserializer.prototype.parseBody = function(bodyDef) {
                            this.parseJsonBodyParamDefinitionListing(bodyDef.params)
                        }, JsonRequestDefinitionDeserializer.prototype.parseJsonBodyParamDefinitionListing = function(listing) {
                            var _this = this;
                            var constants = AppMagic.Constants.Services.Rest;
                            listing.forEach(function(paramDef) {
                                var jsonpointer = paramDef.jsonpointer;
                                var valueExpression = ServiceConfigDeserialization.parseValueExpressionDefinition(paramDef.valueexpression),
                                    typeRef = ServiceConfigDeserialization.TypesManagerDeserializer.parseTypedDefinitionMetadata(paramDef, _this._typesMgr),
                                    param = new Services.JsonBodyRequestParam(jsonpointer, typeRef, valueExpression);
                                _this._requestParams.push(param)
                            })
                        }, JsonRequestDefinitionDeserializer
                }(ServiceConfigDeserialization.RequestDefinitionDeserializer);
            ServiceConfigDeserialization.JsonRequestDefinitionDeserializer = JsonRequestDefinitionDeserializer
        })(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization) {
            var MultipartFormDataRequestDefinitionDeserializer = function(_super) {
                    __extends(MultipartFormDataRequestDefinitionDeserializer, _super);
                    function MultipartFormDataRequestDefinitionDeserializer() {
                        _super.call(this, new Services.MultipartFormDataHttpRequestBuilder(new Services.MultipartFormDataRandomBoundaryGenerator))
                    }
                    return MultipartFormDataRequestDefinitionDeserializer.prototype.parseBody = function(bodyDef) {
                            ServiceConfigDeserialization.parseMultipartFormDataBodyParamDefinitionListing(bodyDef.params, this._requestParams)
                        }, MultipartFormDataRequestDefinitionDeserializer
                }(ServiceConfigDeserialization.RequestDefinitionDeserializer);
            ServiceConfigDeserialization.MultipartFormDataRequestDefinitionDeserializer = MultipartFormDataRequestDefinitionDeserializer
        })(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization) {
            var OAuth1ProviderDefinitionDeserializer = function() {
                    function OAuth1ProviderDefinitionDeserializer(){}
                    return OAuth1ProviderDefinitionDeserializer.prototype.deserialize = function(def, parseContext) {
                            var provider = new AppMagic.Services.OAuth1Provider(def.signaturemethod, def.temporarycredentialrequesturl, def.temporarycredentialrequestmethod, def.resourceownerauthorizationurl, def.callbackurl, def.tokenrequesturl, def.tokenrequestmethod, def.clientid, def.clientsharedsecret, parseContext.serviceNSCache, parseContext.brokerManager, parseContext.controller);
                            return provider
                        }, OAuth1ProviderDefinitionDeserializer
                }();
            ServiceConfigDeserialization.OAuth1ProviderDefinitionDeserializer = OAuth1ProviderDefinitionDeserializer
        })(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization) {
            var OAuth2;
            (function(OAuth2) {
                var GrantType;
                (function(GrantType) {
                    GrantType.implicit = "Implicit";
                    GrantType.clientCredentials = "ClientCredentials";
                    GrantType.authorizationCode = "AuthorizationCode"
                })(GrantType = OAuth2.GrantType || (OAuth2.GrantType = {}))
            })(OAuth2 || (OAuth2 = {}));
            var OAuth2ProviderDefinitionDeserializer = function() {
                    function OAuth2ProviderDefinitionDeserializer(){}
                    return OAuth2ProviderDefinitionDeserializer.prototype.deserialize = function(def, parseContext) {
                            var grantType = this._deserializeGrantType(def.id, def.granttype, parseContext);
                            var valueExpr = typeof def.resourceauthorizationparam.valueexpression != "undefined" ? ServiceConfigDeserialization.parseValueExpressionDefinition(def.resourceauthorizationparam.valueexpression) : null;
                            var tokenOptions = {
                                    tokenFormat: def.resourceauthorizationparam.format, tokenStyle: def.resourceauthorizationparam.style, tokenKey: def.resourceauthorizationparam.name, valueExpression: valueExpr
                                };
                            return new Services.OAuth2Provider(grantType, tokenOptions)
                        }, OAuth2ProviderDefinitionDeserializer.prototype._getAuthenticationCache = function(providerId, serviceNamespace, nsCache) {
                            var key = providerId + serviceNamespace,
                                cache = nsCache.getNamespaceCache(key);
                            return cache === null && (cache = nsCache.createNamespaceCache(key)), cache
                        }, OAuth2ProviderDefinitionDeserializer.prototype._deserializeGrantType = function(providerId, grantTypeDef, parseContext) {
                                switch (grantTypeDef.deftype) {
                                    case OAuth2.GrantType.implicit:
                                        return this._deserializeGrantType_Implicit(providerId, grantTypeDef, parseContext);
                                    case OAuth2.GrantType.clientCredentials:
                                        return this._deserializeGrantType_ClientCredentials(providerId, grantTypeDef, parseContext);
                                    case OAuth2.GrantType.authorizationCode:
                                        return this._deserializeGrantType_AuthorizationCode(providerId, grantTypeDef, parseContext);
                                    default:
                                        return null
                                }
                            }, OAuth2ProviderDefinitionDeserializer.prototype._deserializeGrantType_Implicit = function(providerId, grantTypeDef, parseContext) {
                                var authorizationRequestInfo = this._deserializeBodilessRequestEndpoint(grantTypeDef.authorizationendpoint.url, grantTypeDef.authorizationendpoint.request);
                                var authorizationResponseVariables = this._deserializeAuthorizationResponseVariables(grantTypeDef.authorizationendpoint.response);
                                var authenticationCache = this._getAuthenticationCache(providerId, parseContext.serviceNamespace, parseContext.serviceNSCache);
                                return new AppMagic.Services.OAuth2ImplicitGrantType(grantTypeDef.scope, grantTypeDef.clientid, authorizationRequestInfo, grantTypeDef.authorizationendpoint.redirecturi, authorizationResponseVariables, authenticationCache, parseContext.brokerManager, parseContext.controller)
                            }, OAuth2ProviderDefinitionDeserializer.prototype._deserializeGrantType_ClientCredentials = function(providerId, grantTypeDef, parseContext) {
                                var accessTokenEndpointInfo = this._deserializeFormUrlEncodedRequestEndpoint(grantTypeDef.tokenendpoint.url, grantTypeDef.tokenendpoint.accesstokenrequest);
                                var tokenResponseVariables = this._deserializeTokenResponseVariables(grantTypeDef.tokenendpoint.response);
                                var authenticationCache = this._getAuthenticationCache(providerId, parseContext.serviceNamespace, parseContext.serviceNSCache);
                                return new AppMagic.Services.OAuth2ClientCredentialsGrantType(grantTypeDef.scope, grantTypeDef.clientid, grantTypeDef.clientsecret, accessTokenEndpointInfo, tokenResponseVariables, authenticationCache, parseContext.brokerManager, parseContext.controller)
                            }, OAuth2ProviderDefinitionDeserializer.prototype._deserializeGrantType_AuthorizationCode = function(providerId, grantTypeDef, parseContext) {
                                var authorizationTokenRequestInfo = this._deserializeBodilessRequestEndpoint(grantTypeDef.authorizationendpoint.url, grantTypeDef.authorizationendpoint.request),
                                    accessTokenRequestInfo = this._deserializeFormUrlEncodedRequestEndpoint(grantTypeDef.tokenendpoint.url, grantTypeDef.tokenendpoint.accesstokenrequest),
                                    refreshTokenRequestInfo = this._deserializeFormUrlEncodedRequestEndpoint(grantTypeDef.tokenendpoint.url, grantTypeDef.tokenendpoint.refreshtokenrequest);
                                var authorizationResponseVariables = this._deserializeAuthorizationResponseVariables(grantTypeDef.authorizationendpoint.response);
                                var tokenResponseVariables = this._deserializeTokenResponseVariables(grantTypeDef.tokenendpoint.response);
                                parseContext.serviceRefreshTokenStore.registerService(parseContext.serviceNamespace);
                                var authenticationCache = this._getAuthenticationCache(providerId, parseContext.serviceNamespace, parseContext.serviceNSCache);
                                return new AppMagic.Services.OAuth2AuthorizationCodeGrantType(grantTypeDef.scope, grantTypeDef.clientid, authorizationTokenRequestInfo, grantTypeDef.authorizationendpoint.redirecturi, authorizationResponseVariables, accessTokenRequestInfo, refreshTokenRequestInfo, tokenResponseVariables, authenticationCache, parseContext.serviceRefreshTokenStore, parseContext.brokerManager, parseContext.controller)
                            }, OAuth2ProviderDefinitionDeserializer.prototype._deserializeTokenResponseVariables = function(responseDef) {
                                var tokenVariables = {};
                                return typeof responseDef != "undefined" && typeof responseDef.variables != "undefined" && responseDef.variables.forEach(function(varDef) {
                                        tokenVariables[varDef.name] = varDef.jsonpointer
                                    }), tokenVariables
                            }, OAuth2ProviderDefinitionDeserializer.prototype._deserializeAuthorizationResponseVariables = function(responseDef) {
                                var responseVariables = {};
                                return typeof responseDef != "undefined" && typeof responseDef.variables != "undefined" && responseDef.variables.forEach(function(varDef) {
                                        responseVariables[varDef.name] = varDef.paramname
                                    }), responseVariables
                            }, OAuth2ProviderDefinitionDeserializer.prototype._deserializeBodilessRequestEndpoint = function(baseUrl, request) {
                                var builder = new Services.BodilessHttpRequestBuilder;
                                return builder.setBaseUrl(baseUrl), builder.setMethod("GET"), this._deserializeRequestEndpoint(builder, request)
                            }, OAuth2ProviderDefinitionDeserializer.prototype._deserializeFormUrlEncodedRequestEndpoint = function(baseUrl, request) {
                                var builder = new Services.FormUrlEncodedHttpRequestBuilder;
                                return builder.setBaseUrl(baseUrl), builder.setMethod("POST"), this._deserializeRequestEndpoint(builder, request)
                            }, OAuth2ProviderDefinitionDeserializer.prototype._deserializeRequestEndpoint = function(builder, request) {
                                var requestParams = [];
                                if (typeof request != "undefined" && request !== null) {
                                    var constants = AppMagic.Constants.Services.Rest;
                                    ServiceConfigDeserialization.parseHeaderParamDefinitionListing(request.headers, requestParams);
                                    ServiceConfigDeserialization.parseQueryParamDefinitionListing(request.querystringparameters, requestParams);
                                    typeof request.formparams != "undefined" && request.formparams !== null && ServiceConfigDeserialization.parseFormUrlEncodedBodyParamDefinitionListing(request.formparams, requestParams)
                                }
                                return {
                                        httpRequestBuilder: builder, requestParams: requestParams
                                    }
                            }, OAuth2ProviderDefinitionDeserializer
                }();
            ServiceConfigDeserialization.OAuth2ProviderDefinitionDeserializer = OAuth2ProviderDefinitionDeserializer
        })(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization) {
            var RestFunctionDefinitionDeserializer;
            (function(RestFunctionDefinitionDeserializer) {
                function parseFunctionDefinition(fnDef, parseContext) {
                    var constants = AppMagic.Constants.Services.Rest,
                        parameters = ServiceConfigDeserialization.parseFunctionParameters(fnDef.parameters, parseContext.service.typesManager),
                        mediaType = constants.BodilessType;
                    fnDef.request.body && (mediaType = fnDef.request.body.mediatype);
                    var requestDefinitionDeserializer;
                    switch (mediaType) {
                        case constants.BodilessType:
                            requestDefinitionDeserializer = new ServiceConfigDeserialization.BodilessRequestDefinitionDeserializer;
                            break;
                        case constants.MediaType.FormUrlEncoded:
                            requestDefinitionDeserializer = new ServiceConfigDeserialization.FormUrlEncodedRequestDefinitionDeserializer;
                            break;
                        case constants.MediaType.Json:
                            requestDefinitionDeserializer = new ServiceConfigDeserialization.JsonRequestDefinitionDeserializer(parseContext.service.typesManager);
                            break;
                        case constants.MediaType.MultipartFormData:
                            requestDefinitionDeserializer = new ServiceConfigDeserialization.MultipartFormDataRequestDefinitionDeserializer;
                            break;
                        default:
                            break
                    }
                    _parseRequestDefinition(fnDef, requestDefinitionDeserializer);
                    var authProviderId = fnDef.request.auth,
                        result = requestDefinitionDeserializer.getParams(),
                        disableTryIt = fnDef.disabletryit === !0,
                        isHiddenFromRules = !1,
                        isShownInBackstage = !0;
                    var isBehaviorOnly = fnDef.request.method !== "GET",
                        docId = fnDef.docid ? fnDef.docid : null;
                    return new Services.RestServiceFunction(parseContext.service, fnDef, fnDef.name, docId, disableTryIt, isHiddenFromRules, isShownInBackstage, isBehaviorOnly, parameters, authProviderId, result.httpRequestBuilder, result.requestParams, parseContext.controller)
                }
                RestFunctionDefinitionDeserializer.parseFunctionDefinition = parseFunctionDefinition;
                function _parseRequestDefinition(fnDef, requestDeserializer) {
                    var constants = AppMagic.Constants.Services.Rest;
                    var requestDef = fnDef.request;
                    requestDeserializer.parseMethodAndBaseUrl(fnDef);
                    var pathItemDefs = fnDef.request.url.paths;
                    requestDeserializer.parsePathItemDefinitions(pathItemDefs);
                    requestDeserializer.parseQueryParamDefinitionListing(requestDef.querystringparameters);
                    requestDeserializer.parseHeaderParamDefinitionListing(requestDef.headers);
                    requestDeserializer.parseBody(requestDef.body)
                }
            })(RestFunctionDefinitionDeserializer = ServiceConfigDeserialization.RestFunctionDefinitionDeserializer || (ServiceConfigDeserialization.RestFunctionDefinitionDeserializer = {}))
        })(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization) {
            var XsdTypeNames = Services.TypeSystem.XsdUtility.XsdTypeNames;
            function parseServiceConfigDefinition(serviceDef, serviceNamespace, nsCache, controller) {
                var typesByPrefixAndName = new Services.TypesByPrefixAndName(serviceDef.typesbyprefix),
                    typesMgr = ServiceConfigDeserialization.TypesManagerDeserializer.parseTypesManager(serviceDef.typesbyprefix);
                return new Services.ImportedService(serviceNamespace, serviceDef, serviceDef.serviceid, typesMgr, typesByPrefixAndName, nsCache, controller)
            }
            ServiceConfigDeserialization.parseServiceConfigDefinition = parseServiceConfigDefinition;
            function parseAuthenticationProviderDefinition(authProviderDef, parseContext) {
                var deserializer;
                switch (authProviderDef.type) {
                    case AppMagic.Constants.Services.AuthTypeNames.OAuth1:
                        deserializer = new ServiceConfigDeserialization.OAuth1ProviderDefinitionDeserializer;
                        break;
                    case AppMagic.Constants.Services.AuthTypeNames.OAuth2:
                        deserializer = new ServiceConfigDeserialization.OAuth2ProviderDefinitionDeserializer;
                        break;
                    default:
                        break
                }
                return deserializer.deserialize(authProviderDef, parseContext)
            }
            ServiceConfigDeserialization.parseAuthenticationProviderDefinition = parseAuthenticationProviderDefinition;
            function parseServiceFunctionDefinition(fnDef, parseContext) {
                switch (fnDef.deftype) {
                    case ServiceConfigDeserialization.IRConstants.DefTypes.RestFunction:
                        return ServiceConfigDeserialization.RestFunctionDefinitionDeserializer.parseFunctionDefinition(fnDef, parseContext);
                    case ServiceConfigDeserialization.IRConstants.DefTypes.CompositeFunction:
                        return ServiceConfigDeserialization.CompositeFunctionDefinitionDeserializer.parseFunctionDefinition(fnDef, parseContext);
                    default:
                        throw new Error;
                }
            }
            ServiceConfigDeserialization.parseServiceFunctionDefinition = parseServiceFunctionDefinition;
            function parseFunctionParameters(parameterDefs, typesMgr) {
                var usedIdentifiers = {};
                return parameterDefs.map(function(parameterDef) {
                        var parameter = parseFunctionParameter(parameterDef, typesMgr);
                        return usedIdentifiers[parameter.name] = !0, parameter
                    })
            }
            ServiceConfigDeserialization.parseFunctionParameters = parseFunctionParameters;
            function parseFunctionParameter(parameterDef, typesMgr) {
                var dtype = null,
                    ttypeRef = null;
                typeof parameterDef.dtype != "undefined" ? dtype = parameterDef.dtype : ttypeRef = ServiceConfigDeserialization.TypesManagerDeserializer.parseTypedDefinitionMetadata(parameterDef, typesMgr);
                var docId = typeof parameterDef.docid == "string" ? parameterDef.docid : null;
                var options = null;
                typeof parameterDef.options != "undefined" && (options = parameterDef.options);
                var defaultValue = typeof parameterDef.default == "undefined" ? null : parameterDef.default,
                    tryItValue = typeof parameterDef.sampledefault == "undefined" ? null : parameterDef.sampledefault;
                return new Services.FunctionParameter(parameterDef.name, dtype, ttypeRef, parameterDef.required, docId, options, defaultValue, tryItValue)
            }
            function parseMultipartFormDataBodyParamDefinitionListing(listing, requestParams) {
                var createTextParamFunction = function(paramName, valueStringifier, valueExpression) {
                        return new Services.MultipartFormDataBodyTextRequestParam(paramName, valueStringifier, valueExpression)
                    },
                    createBinaryParamFunction = function(paramName, valueExpression) {
                        return new Services.MultipartFormDataBodyBinaryRequestParam(paramName, valueExpression)
                    },
                    constants = AppMagic.Constants.Services.Rest,
                    nameKey = constants.ParamKey_Name;
                return parseParamDefinitionListing(listing, nameKey, requestParams, createTextParamFunction, createBinaryParamFunction)
            }
            ServiceConfigDeserialization.parseMultipartFormDataBodyParamDefinitionListing = parseMultipartFormDataBodyParamDefinitionListing;
            function parseFormUrlEncodedBodyParamDefinitionListing(listing, requestParams) {
                var createParamFunction = function(paramName, valueStringifier, valueExpression) {
                        return new Services.FormUrlEncodedBodyRequestParam(paramName, valueStringifier, valueExpression)
                    };
                return parseParamDefinitionListing(listing, AppMagic.Constants.Services.Rest.ParamKey_Name, requestParams, createParamFunction, null)
            }
            ServiceConfigDeserialization.parseFormUrlEncodedBodyParamDefinitionListing = parseFormUrlEncodedBodyParamDefinitionListing;
            function parseParamDefinitionListing(listing, nameKey, requestParams, createTextParamFunction, createBinaryParamFunction) {
                var constants = AppMagic.Constants.Services.Rest;
                listing.forEach(function(paramDef) {
                    var paramName = paramDef[nameKey];
                    var valueExpression = ServiceConfigDeserialization.parseValueExpressionDefinition(paramDef.valueexpression),
                        param;
                    if (paramDef.type === constants.XsdType.Base64Binary)
                        param = createBinaryParamFunction(paramName, valueExpression);
                    else {
                        var valueStringifier = parseParamValueStringifier(paramDef);
                        param = createTextParamFunction(paramName, valueStringifier, valueExpression)
                    }
                    requestParams.push(param)
                })
            }
            function parseHeaderParamDefinitionListing(listing, requestParams) {
                var createParamFunction = function(paramName, valueStringifier, valueExpression) {
                        return new Services.HeaderRequestParam(paramName, valueStringifier, valueExpression)
                    };
                return parseParamDefinitionListing(listing, AppMagic.Constants.Services.Rest.ParamKey_Key, requestParams, createParamFunction, null)
            }
            ServiceConfigDeserialization.parseHeaderParamDefinitionListing = parseHeaderParamDefinitionListing;
            function parseQueryParamDefinitionListing(listing, requestParams) {
                var createParamFunction = function(paramName, valueStringifier, valueExpression) {
                        return new Services.QueryRequestParam(paramName, valueStringifier, valueExpression)
                    };
                return parseParamDefinitionListing(listing, AppMagic.Constants.Services.Rest.ParamKey_Key, requestParams, createParamFunction, null)
            }
            ServiceConfigDeserialization.parseQueryParamDefinitionListing = parseQueryParamDefinitionListing;
            function parsePathItemDefinitions(pathItemDefs, builder, requestParams) {
                var constants = AppMagic.Constants.Services.Rest;
                pathItemDefs.forEach(function(pathItemDef) {
                    var path = pathItemDef.path;
                    if (path !== "") {
                        var pathIndex = builder.addPath(path),
                            createParamFunction = function(paramName, valueStringifier, valueExpression) {
                                return new Services.TemplateRequestParam(pathIndex, paramName, valueStringifier, valueExpression)
                            },
                            templateDefs = pathItemDef.templates;
                        parseParamDefinitionListing(templateDefs, constants.ParamKey_Name, requestParams, createParamFunction, null)
                    }
                })
            }
            ServiceConfigDeserialization.parsePathItemDefinitions = parsePathItemDefinitions;
            function parseParamValueStringifier(paramDef) {
                var tryResult = Services.TypeSystem.XsdUtility.tryParseNumericXsdTypeFromXsdTypeName(paramDef.type);
                if (tryResult.success)
                    return new Services.NumberParamValueStringifier(tryResult.result);
                switch (paramDef.type) {
                    case XsdTypeNames.Boolean:
                        return new Services.BooleanParamValueStringifier;
                    case XsdTypeNames.String:
                        return new Services.StringParamValueStringifier;
                    case XsdTypeNames.AnyURI:
                        return new Services.StringParamValueStringifier;
                    case XsdTypeNames.Base64Binary:
                        break;
                    default:
                        break
                }
            }
            ServiceConfigDeserialization.parseParamValueStringifier = parseParamValueStringifier;
            function implyDTypeFromJsonValue(value) {
                switch (typeof value) {
                    case"boolean":
                        return AppMagic.Schema.TypeBoolean;
                    case"number":
                        return AppMagic.Schema.TypeNumber;
                    case"string":
                        return AppMagic.Schema.TypeString;
                    default:
                        return null
                }
            }
            ServiceConfigDeserialization.implyDTypeFromJsonValue = implyDTypeFromJsonValue
        })(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var TypesManager = function() {
                    function TypesManager() {
                        this._types = new Collections.Generic.TwoKeyDictionary
                    }
                    return TypesManager.prototype.addType = function(prefix, name, type) {
                            return Contracts.check(!this._types.containsKey(prefix, name)), this._types.setValue(prefix, name, type)
                        }, TypesManager.prototype.getType = function(prefix, name) {
                            return this._types.getValue(prefix, name)
                        }, TypesManager
                }();
            TypeSystem.TypesManager = TypesManager
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization) {
            var TypesManagerDeserializer;
            (function(TypesManagerDeserializer) {
                var XsdTypeNames = Services.TypeSystem.XsdUtility.XsdTypeNames;
                function parseTypesManager(typesByPrefix) {
                    var typesMgr = new Services.TypeSystem.TypesManager;
                    return Object.keys(typesByPrefix).forEach(function(prefix) {
                            var namespacedTypesDef = typesByPrefix[prefix];
                            Object.keys(namespacedTypesDef.typesbyname).forEach(function(typeName) {
                                var typeDef = namespacedTypesDef.typesbyname[typeName],
                                    dataType = parseTypeDefinition(typeDef, typesMgr);
                                typesMgr.addType(prefix, typeName, dataType)
                            })
                        }), typesMgr
                }
                TypesManagerDeserializer.parseTypesManager = parseTypesManager;
                function parseTypedDefinitionMetadata(typedDef, typesMgr) {
                    if (typeof typedDef.type != "undefined") {
                        var ttype = parseTypeDefinition(typedDef.type, typesMgr);
                        return new Services.TypeSystem.InlinedTType(ttype)
                    }
                    else
                        return parseTypeRefDefinition(typedDef.typeref, typesMgr)
                }
                TypesManagerDeserializer.parseTypedDefinitionMetadata = parseTypedDefinitionMetadata;
                function parseTypeRefDefinition(typeRef, typesMgr) {
                    return new Services.TypeSystem.LazyTTypeRef(typeRef, typesMgr)
                }
                function parseTypeDefinition(typeDef, typesMgr) {
                    switch (typeDef.deftype) {
                        case ServiceConfigDeserialization.IRConstants.DefTypes.BinaryData:
                            return parseTypeDefinition_BinaryData(typeDef);
                        case ServiceConfigDeserialization.IRConstants.DefTypes.JsonPrimitive:
                            return parseTypeDefinition_JsonPrimitive(typeDef);
                        case ServiceConfigDeserialization.IRConstants.DefTypes.JsonObject:
                            return parseTypeDefinition_JsonObject(typeDef, typesMgr);
                        case ServiceConfigDeserialization.IRConstants.DefTypes.JsonArray:
                            return parseTypeDefinition_JsonArray(typeDef, typesMgr);
                        case ServiceConfigDeserialization.IRConstants.DefTypes.JsonMapObject:
                            return parseTypeDefinition_JsonMapObject(typeDef, typesMgr);
                        case ServiceConfigDeserialization.IRConstants.DefTypes.JsonBase64Binary:
                            return parseTypeDefinition_JsonBase64Binary(typeDef, typesMgr);
                        case ServiceConfigDeserialization.IRConstants.DefTypes.SampleXmlElement:
                            return parseTypeDefinition_SampleXmlElement(typeDef);
                        case ServiceConfigDeserialization.IRConstants.DefTypes.XmlSimpleType:
                            return parseTypeDefinition_XmlSimpleType(typeDef);
                        default:
                            return
                    }
                }
                TypesManagerDeserializer.parseTypeDefinition = parseTypeDefinition;
                function parseTypeDefinition_BinaryData(typeDef) {
                    Contracts.check("Not implemented");
                    return
                }
                function parseTypeDefinition_JsonPrimitive(typeDef) {
                    switch (typeDef.primitive) {
                        case ServiceConfigDeserialization.IRConstants.JsonPrimitives.Boolean:
                            return new Services.TypeSystem.JsonBooleanTType;
                        case ServiceConfigDeserialization.IRConstants.JsonPrimitives.Number:
                            var numericXsdType = 0;
                            if (typeof typeDef.xsdtype != "undefined") {
                                var tryResult = Services.TypeSystem.XsdUtility.tryParseNumericXsdTypeFromXsdTypeName(typeDef.xsdtype);
                                numericXsdType = tryResult.result
                            }
                            return new Services.TypeSystem.JsonNumberTType(numericXsdType);
                        case ServiceConfigDeserialization.IRConstants.JsonPrimitives.String:
                            var dtype = typeDef.dtype;
                            typeof dtype == "undefined" && (dtype = AppMagic.Schema.TypeString);
                            switch (dtype) {
                                case AppMagic.Schema.TypeString:
                                    return new Services.TypeSystem.JsonStringTType;
                                case AppMagic.Schema.TypeHyperlink:
                                case AppMagic.Schema.TypeImage:
                                case AppMagic.Schema.TypeMedia:
                                    return new Services.TypeSystem.JsonUrlStringTType(dtype);
                                default:
                                    return
                            }
                            return;
                        default:
                            return
                    }
                }
                function parseTypeDefinition_JsonObject(typeDef, typesMgr) {
                    var properties = {};
                    return Object.keys(typeDef.properties).forEach(function(propName) {
                            var propDef = typeDef.properties[propName];
                            var ttypeRef = parseTypedDefinitionMetadata(propDef, typesMgr);
                            properties[propName] = new Services.TypeSystem.JsonObjectProperty(ttypeRef, propDef.displayidx)
                        }), new Services.TypeSystem.JsonObjectType(properties)
                }
                function parseTypeDefinition_JsonArray(typeDef, typesMgr) {
                    var ttypeRef = parseTypedDefinitionMetadata(typeDef.items, typesMgr);
                    return new Services.TypeSystem.JsonArrayTType(ttypeRef)
                }
                function parseTypeDefinition_JsonMapObject(typeDef, typesMgr) {
                    var valueTTypeRef = parseTypedDefinitionMetadata(typeDef.values, typesMgr);
                    return new Services.TypeSystem.JsonMapObjectTType(typeDef.keys.fieldname, typeDef.values.fieldname, valueTTypeRef)
                }
                function parseTypeDefinition_JsonBase64Binary(typeDef, typesMgr) {
                    return new Services.TypeSystem.JsonBase64BinaryTType(typeDef.mediatype)
                }
                function parseTypeDefinition_SampleXmlElement(typeDef) {
                    return new Services.TypeSystem.SampleXmlElementTType(typeDef.samplexml)
                }
                function parseTypeDefinition_XmlSimpleType(typeDef) {
                    var tryResult = Services.TypeSystem.XsdUtility.tryParseNumericXsdTypeFromXsdTypeName(typeDef.basexsdtype);
                    if (tryResult.success)
                        return new Services.TypeSystem.XmlNumericTType(tryResult.result);
                    switch (typeDef.basexsdtype) {
                        case XsdTypeNames.Boolean:
                            return new Services.TypeSystem.XmlBooleanTType;
                        case XsdTypeNames.String:
                            return new Services.TypeSystem.XmlStringTType;
                        case XsdTypeNames.AnyURI:
                            return new Services.TypeSystem.XmlAnyUriTType(typeDef.dtype);
                        default:
                            break
                    }
                }
            })(TypesManagerDeserializer = ServiceConfigDeserialization.TypesManagerDeserializer || (ServiceConfigDeserialization.TypesManagerDeserializer = {}))
        })(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var ServiceConfigDeserialization;
        (function(ServiceConfigDeserialization) {
            function parseValueExpressionDefinition(expressionDef) {
                switch (expressionDef.deftype) {
                    case ServiceConfigDeserialization.IRConstants.DefTypes.Literal:
                        return parseValueExpressionDefinition_Literal(expressionDef);
                    case ServiceConfigDeserialization.IRConstants.DefTypes.ParameterReference:
                        return parseValueExpressionDefinition_ParameterReference(expressionDef);
                    case ServiceConfigDeserialization.IRConstants.DefTypes.VariableReference:
                        return parseValueExpressionDefinition_VariableReference(expressionDef);
                    case ServiceConfigDeserialization.IRConstants.DefTypes.AuthenticationVariableReference:
                        return parseValueExpressionDefinition_AuthenticationVariableReference(expressionDef);
                    case ServiceConfigDeserialization.IRConstants.DefTypes.QuoteString:
                        return parseValueExpressionDefinition_QuoteString(expressionDef);
                    case ServiceConfigDeserialization.IRConstants.DefTypes.StringFormat:
                        return parseValueExpressionDefinition_StringFormat(expressionDef);
                    case ServiceConfigDeserialization.IRConstants.DefTypes.FunctionCall:
                        return parseValueExpressionDefinition_FunctionCall(expressionDef);
                    case ServiceConfigDeserialization.IRConstants.DefTypes.BuiltInFunctionCall:
                        return parseValueExpressionDefinition_BuiltInFunctionCall(expressionDef);
                    case ServiceConfigDeserialization.IRConstants.DefTypes.O365ParseEmailAddresses:
                        return parseValueExpressionDefinition_O365ParseEmailAddresses(expressionDef);
                    default:
                        return
                }
            }
            ServiceConfigDeserialization.parseValueExpressionDefinition = parseValueExpressionDefinition;
            function parseValueExpressionDefinition_Literal(expressionDef) {
                var dtype = expressionDef.dtype;
                return typeof dtype == "undefined" && (dtype = ServiceConfigDeserialization.implyDTypeFromJsonValue(expressionDef.value)), new Services.LiteralValueExpression(expressionDef.value, dtype)
            }
            function parseValueExpressionDefinition_ParameterReference(expressionDef) {
                return new Services.ParameterReferenceExpression(expressionDef.name)
            }
            function parseValueExpressionDefinition_VariableReference(expressionDef) {
                var varRefExpr = new Services.VariableReferenceExpression(expressionDef.name);
                return typeof expressionDef.pointer == "string" && expressionDef.pointer !== "" ? new Services.JsonPointerExpression(varRefExpr, expressionDef.pointer) : varRefExpr
            }
            function parseValueExpressionDefinition_AuthenticationVariableReference(expressionDef) {
                var varRefExpr = new Services.AuthenticationVariableReferenceExpression(expressionDef.name);
                return typeof expressionDef.pointer == "string" && expressionDef.pointer !== "" ? new Services.JsonPointerExpression(varRefExpr, expressionDef.pointer) : varRefExpr
            }
            function parseValueExpressionDefinition_QuoteString(expressionDef) {
                var valueExpr = parseValueExpressionDefinition(expressionDef.valueexpression);
                return new Services.QuoteStringExpression(expressionDef.quotechar, expressionDef.escape, valueExpr)
            }
            function parseValueExpressionDefinition_StringFormat(expressionDef) {
                var argExpressions = expressionDef.valueexpressions.map(function(argExprDef) {
                        var argExpr = parseValueExpressionDefinition(argExprDef);
                        return argExpr
                    });
                return new Services.StringFormatExpression(expressionDef.format, argExpressions)
            }
            function parseValueExpressionDefinition_FunctionCall(functionCallDef) {
                var argumentExpressions = functionCallDef.arguments.map(function(argDef) {
                        var argExpr = parseValueExpressionDefinition(argDef.valueexpression);
                        return {
                                name: argDef.name, expression: argExpr
                            }
                    });
                return new Services.FunctionCallExpression(functionCallDef.name, argumentExpressions)
            }
            function parseValueExpressionDefinition_BuiltInFunctionCall(functionCallDef) {
                var argumentExpressions = {};
                functionCallDef.arguments.forEach(function(argDef) {
                    var argExpr = parseValueExpressionDefinition(argDef.valueexpression);
                    argumentExpressions[argDef.name] = argExpr
                });
                switch (functionCallDef.name) {
                    case ServiceConfigDeserialization.IRConstants.DefTypes.BuiltInFunctionName_O365ComposeRecipientsArray:
                        return parseBuiltInFunctionCall_O365ComposeRecipientsArray(functionCallDef, argumentExpressions);
                    case ServiceConfigDeserialization.IRConstants.DefTypes.BuiltInFunctionName_O365ComposeAttendeesArray:
                        return parseBuiltInFunctionCall_O365ComposeAttendeesArray(functionCallDef, argumentExpressions);
                    default:
                        return
                }
            }
            function parseBuiltInFunctionCall_O365ComposeRecipientsArray(functionCallDef, argumentExpressions) {
                var emailsValueExpr = argumentExpressions.emails;
                return new Services.O365.ComposeRecipientsArrayExpression(emailsValueExpr)
            }
            function parseBuiltInFunctionCall_O365ComposeAttendeesArray(functionCallDef, argumentExpressions) {
                var emailsValueExpr = argumentExpressions.emails,
                    typeValueExpr = argumentExpressions.type;
                return new Services.O365.ComposeAttendeesArrayExpression(emailsValueExpr, typeValueExpr)
            }
            function parseValueExpressionDefinition_O365ParseEmailAddresses(expressionDef) {
                var valueExpr = parseValueExpressionDefinition(expressionDef.valueexpression);
                return new Services.O365.ParseEmailAddressesExpression(valueExpr)
            }
        })(ServiceConfigDeserialization = Services.ServiceConfigDeserialization || (Services.ServiceConfigDeserialization = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var SetCloudTableSchema = function() {
                function SetCloudTableSchema(azureTable, schema, rootSnapshot, etagOfTableHeaderPrimaryEntity, rowKeySetOfTableHeader) {
                    this._azureTable = azureTable;
                    this._schema = schema;
                    this._rootSnapshot = rootSnapshot;
                    this._etagOfTableHeaderPrimaryEntity = rootSnapshot.etagOfTableHeaderPrimaryEntity;
                    this._rowKeySetOfTableHeader = rootSnapshot.rowKeySetOfTableHeader
                }
                return SetCloudTableSchema.prototype._rowKeyOfRootTableHeaderPrimaryEntity = function() {
                        return this._rowKeySetOfTableHeader[0]
                    }, SetCloudTableSchema.prototype._partitionKey = function() {
                        return Services.CloudTableWorker.EntityPropertyValue_PartitionKey_Root
                    }, SetCloudTableSchema.prototype.performOperation = function() {
                            var _this = this,
                                newRootHeader = {
                                    schema: this._schema, displayName: this._rootSnapshot.tableHeaderRowData.displayName
                                },
                                rootHeaderEntitiesAndRowKeys = Services.CloudTableWorker.getEntitiesForRow(newRootHeader, this._rowKeyOfRootTableHeaderPrimaryEntity(), Services.CloudTableWorker.generateTableHeaderRowKey),
                                entityWriteInfo = [];
                            return Services.CloudTableWorker.appendWriteEntityInfo(rootHeaderEntitiesAndRowKeys.entities, this._partitionKey(), rootHeaderEntitiesAndRowKeys.rowKeySet, entityWriteInfo, 1), Services.CloudTableWorker.writeEntities(this._azureTable, entityWriteInfo).then(function(response) {
                                    return response.allSucceeded ? _this._writeRootTableHeaderPrimaryEntity(rootHeaderEntitiesAndRowKeys.entities, rootHeaderEntitiesAndRowKeys.rowKeySet) : (Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), rootHeaderEntitiesAndRowKeys.rowKeySet, 1), WinJS.Promise.wrap({
                                            resultCode: 1, etagForRootPrimaryEntity: null, rowKeySetForRootTableHeader: null
                                        }))
                                })
                        }, SetCloudTableSchema.prototype._writeRootTableHeaderPrimaryEntity = function(rootTableHeaderEntities, newRowKeysForRootTable) {
                            var _this = this;
                            return this._azureTable.updateEntity(this._partitionKey(), this._rowKeyOfRootTableHeaderPrimaryEntity(), rootTableHeaderEntities[0], this._etagOfTableHeaderPrimaryEntity).then(function(response) {
                                    return response.resultCode !== 0 ? (Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), newRowKeysForRootTable, 1), response.resultCode !== 1) ? WinJS.Promise.wrap({
                                            resultCode: 2, etagForRootPrimaryEntity: null, rowKeySetForRootTableHeader: null
                                        }) : _this._handlePreconditionFailure() : (Services.CloudTableWorker.deleteEntitiesInPartition(_this._azureTable, _this._partitionKey(), _this._rowKeySetOfTableHeader, 1), WinJS.Promise.wrap({
                                            resultCode: 0, etagForRootPrimaryEntity: response.entityEtag, rowKeySetForRootTableHeader: newRowKeysForRootTable
                                        }))
                                })
                        }, SetCloudTableSchema.prototype._handlePreconditionFailure = function() {
                            var _this = this;
                            return Services.CloudTableWorker.queryLatestRootInfo(this._azureTable).then(function(response) {
                                    return response === null ? WinJS.Promise.wrap({
                                            resultCode: 6, etagForRootPrimaryEntity: null, rowKeySetForRootTableHeader: null
                                        }) : _this._reattemptSetSchema(response)
                                })
                        }, SetCloudTableSchema.prototype._reattemptSetSchema = function(response) {
                            var latestSnapshot = response.rootTableHeaderSnapshot,
                                scts = new SetCloudTableSchema(this._azureTable, this._schema, this._rootSnapshot, latestSnapshot.etagOfTableHeaderPrimaryEntity, latestSnapshot.rowKeySetOfTableHeader);
                            return scts.performOperation()
                        }, SetCloudTableSchema
            }();
        Services.SetCloudTableSchema = SetCloudTableSchema
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var SharePointAzureConnectionAcquirer = function() {
                function SharePointAzureConnectionAcquirer(providerFactory, cache) {
                    this._providerFactory = providerFactory;
                    this._cache = cache;
                    this._isAcquiring = !1;
                    this._success = !1;
                    this._provider = null;
                    this._rootUrl = null
                }
                return Object.defineProperty(SharePointAzureConnectionAcquirer.prototype, "rootUrl", {
                        get: function() {
                            return this._rootUrl
                        }, set: function(value) {
                                this._rootUrl = value
                            }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(SharePointAzureConnectionAcquirer.prototype, "provider", {
                        get: function() {
                            return this._provider
                        }, enumerable: !0, configurable: !0
                    }), SharePointAzureConnectionAcquirer.prototype.isAcquiring = function() {
                            return this._isAcquiring
                        }, SharePointAzureConnectionAcquirer.prototype.tryGetResource = function() {
                            return !AppMagic.AuthoringTool.Runtime.isO365ConnectorReconstructionRequired() && this._provider !== null ? {
                                    success: !0, result: {
                                            success: !0, result: this._provider
                                        }
                                } : {
                                    success: !1, result: null
                                }
                        }, SharePointAzureConnectionAcquirer.prototype._connectToRestService = function() {
                            if (AppMagic.AuthoringTool.Runtime.isO365ConnectorReconstructionRequired()) {
                                var dataConnectionsViewModel = AppMagic.context.documentViewModel.backStage.dataConnectionsViewModel;
                                return dataConnectionsViewModel.connectToRestServiceByConnectorIdAsync(Services.AzureConstants.ConnectorIds.office365, !1)
                            }
                            return WinJS.Promise.wrap({
                                    success: !0, result: null
                                })
                        }, SharePointAzureConnectionAcquirer.prototype.acquireResource = function() {
                            var _this = this;
                            return this._isAcquiring = !0, this._connectToRestService().then(function(result) {
                                    if (_this._isAcquiring = !1, !result.success)
                                        return WinJS.Promise.wrap({success: !1});
                                    var appInfo = AppMagic.AuthoringTool.Runtime.azureConnectionManager.clientAppInfo;
                                    return _this._provider = _this._providerFactory.createAuthenticationProvider(appInfo.clientId, _this._rootUrl, appInfo.redirectUri, SharePointAzureConnectionAcquirer.baseAuthUri, _this._cache, AppMagic.AuthoringTool.Runtime.azureRefreshTokenStore), WinJS.Promise.wrap({
                                            success: !0, result: _this._provider
                                        })
                                }, function(error) {
                                    _this._isAcquiring = !1;
                                    throw error;
                                })
                        }, SharePointAzureConnectionAcquirer.prototype.getCanceledResult = function() {
                            return {
                                    success: !1, result: null
                                }
                        }, SharePointAzureConnectionAcquirer.baseAuthUri = "https://login.windows.net/common/", SharePointAzureConnectionAcquirer
            }();
        Services.SharePointAzureConnectionAcquirer = SharePointAzureConnectionAcquirer
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var OAuth2Constants = Services.Constants.OAuth2,
            JobCascade = AppMagic.Common.JobCascade;
        (function(SharePointOnlineGetListsResultCode) {
            SharePointOnlineGetListsResultCode[SharePointOnlineGetListsResultCode.Success = 0] = "Success";
            SharePointOnlineGetListsResultCode[SharePointOnlineGetListsResultCode.UnknownError = 1] = "UnknownError"
        })(Services.SharePointOnlineGetListsResultCode || (Services.SharePointOnlineGetListsResultCode = {}));
        var SharePointOnlineGetListsResultCode = Services.SharePointOnlineGetListsResultCode;
        (function(GetSharePointOnlineResourceResultCode) {
            GetSharePointOnlineResourceResultCode[GetSharePointOnlineResourceResultCode.Success = 0] = "Success";
            GetSharePointOnlineResourceResultCode[GetSharePointOnlineResourceResultCode.UnknownError = 1] = "UnknownError";
            GetSharePointOnlineResourceResultCode[GetSharePointOnlineResourceResultCode.AuthFailure = 2] = "AuthFailure"
        })(Services.GetSharePointOnlineResourceResultCode || (Services.GetSharePointOnlineResourceResultCode = {}));
        var GetSharePointOnlineResourceResultCode = Services.GetSharePointOnlineResourceResultCode,
            SharePointOnlineBroker = function() {
                function SharePointOnlineBroker(cache, controller, providerFactory) {
                    this._cache = cache;
                    this._controller = controller;
                    this._resourceWebUrl = null;
                    this._resourceUrl = null;
                    this._rootUrl = null;
                    this._azureConnectionAcquirer = new Services.SharePointAzureConnectionAcquirer(providerFactory, this._cache);
                    this._azureAwaiterPool = new Services.ResourceAwaiterPool(this._azureConnectionAcquirer)
                }
                return Object.defineProperty(SharePointOnlineBroker.prototype, "resourceWebUrl", {
                        set: function(value) {
                            this._resourceWebUrl = SharePointOnlineBroker.getCleanResourceWebUrl(value)
                        }, enumerable: !0, configurable: !0
                    }), SharePointOnlineBroker.getCleanResourceWebUrl = function(url) {
                        var cleanWebUrl = SharePointOnlineBroker._stripUrlHash(url);
                        var httpsWebUrl = SharePointOnlineBroker._ensureHttpsUrl(cleanWebUrl);
                        return httpsWebUrl
                    }, SharePointOnlineBroker.prototype._initalizeGetSharePointResourceIntermediateResult = function() {
                            return {
                                    rootUrl: this._parseBaseUrl(this._resourceWebUrl), provider: null, resourceResult: null, resourceWebUrl: this._resourceWebUrl, resourceUrl: null, urlConversionResponse: null
                                }
                        }, SharePointOnlineBroker.prototype.getSharePointResource = function() {
                            var _this = this;
                            var jobCascade = JobCascade.createHead().then(function() {
                                    return _this._ensureAzureConnectionAsync()
                                }).then(function(intermediateResource) {
                                    return _this._lookUpResourceEndpoint(intermediateResource)
                                }).then(function(intermediateResource) {
                                    return _this._parseResourceUrlConversionResponse(intermediateResource)
                                }).then(function(parseResult) {
                                    return _this._createResourceResultAndSetLocalSettings(parseResult)
                                });
                            return jobCascade.executeCascade()
                        }, SharePointOnlineBroker.prototype.disconnect = function(cookieManager) {
                            var provider = this._azureConnectionAcquirer.provider;
                            (this._azureConnectionAcquirer.rootUrl = null, provider !== null) && (provider.store.clear(cookieManager), provider.grantType.refreshTokenStore.deregisterService(SharePointOnlineBroker.nsCacheKey), this._azureConnectionAcquirer.provider = null, this._azureConnectionAcquirer.rootUrl = null, this._rootUrl = null, this._resourceWebUrl = null, this._resourceUrl = null)
                        }, SharePointOnlineBroker.prototype._ensureAzureConnectionAsync = function() {
                            var getSharePointResourceIntermediate = this._initalizeGetSharePointResourceIntermediateResult();
                            return this._azureConnectionAcquirer.rootUrl = getSharePointResourceIntermediate.rootUrl, this._azureAwaiterPool.acquire().then(function(resource) {
                                    if (!resource.success)
                                        throw AppMagic.Utility.createCanceledError();
                                    getSharePointResourceIntermediate.provider = resource.result;
                                    var result = JobCascade.createContinueResult(getSharePointResourceIntermediate);
                                    return WinJS.Promise.wrap(result)
                                })
                        }, SharePointOnlineBroker.prototype._lookUpResourceEndpoint = function(intermediateResource) {
                            var _this = this;
                            var conversionEndpointPath = Core.Utility.formatString(SharePointOnlineBroker.resourceUrlConversionPathFormat, intermediateResource.resourceWebUrl);
                            var builder = new Services.BodilessHttpRequestBuilder;
                            return builder.setBaseUrl(intermediateResource.rootUrl), builder.setMethod(Services.Constants.HttpRequest.Methods.GET), builder.addPath(conversionEndpointPath), builder.addHeader(Services.Constants.OAuth2.HeaderNames.accept, "application/json"), intermediateResource.provider.authenticateRequestAsync(builder, function(){}, function(){}).then(function(authResult) {
                                        if (!authResult.success) {
                                            var result = JobCascade.createDoneResult({
                                                    success: !1, resultCode: 2, resource: null
                                                });
                                            return WinJS.Promise.wrap(result)
                                        }
                                        return builder.generateHttpRequestAsync().then(function(request) {
                                                var httpReqData = request.getRequestData(),
                                                    body = httpReqData.data.map(function(datum) {
                                                        return datum.value
                                                    });
                                                return _this._controller.sendHttp(httpReqData.url, httpReqData.method, httpReqData.headers, httpReqData.queryParameters, body)
                                            }).then(function(response) {
                                                return intermediateResource.urlConversionResponse = response, JobCascade.createContinueResult(intermediateResource)
                                            })
                                    })
                        }, SharePointOnlineBroker.prototype._parseResourceUrlConversionResponse = function(intermediateResource) {
                            var response = intermediateResource.urlConversionResponse;
                            if (!response.success)
                                return this._createResourceError();
                            try {
                                var responseData = JSON.parse(response.result.responseText)
                            }
                            catch(e) {
                                return this._createResourceError()
                            }
                            intermediateResource.resourceUrl = responseData.value;
                            var result = JobCascade.createContinueResult(intermediateResource);
                            return WinJS.Promise.wrap(result)
                        }, SharePointOnlineBroker.prototype._createResourceResultAndSetLocalSettings = function(intermediateResource) {
                            if (intermediateResource.resourceUrl === null)
                                return this._createResourceError();
                            var resourceResult = {
                                    resultCode: 0, resource: {
                                            serviceResourceId: intermediateResource.resourceUrl, token: intermediateResource.provider.store.token
                                        }, success: !0
                                };
                            this._setLocalVarables(intermediateResource);
                            var result = JobCascade.createDoneResult(resourceResult);
                            return WinJS.Promise.wrap(result)
                        }, SharePointOnlineBroker.prototype._setLocalVarables = function(intermediateResult) {
                            this._rootUrl = intermediateResult.rootUrl;
                            this._resourceWebUrl = intermediateResult.resourceWebUrl;
                            this._resourceUrl = intermediateResult.resourceUrl
                        }, SharePointOnlineBroker.prototype._createResourceError = function(resultCode) {
                            resultCode === void 0 && (resultCode = 1);
                            var result = JobCascade.createDoneResult({
                                    success: !1, resultCode: 1, resource: null
                                });
                            return WinJS.Promise.wrap(result)
                        }, SharePointOnlineBroker.prototype.saveSessionAuthData = function(sessionAuthData) {
                            var svcAuthData = sessionAuthData[Services.AzureConstants.ServiceKeys.sharePointOnline];
                            typeof svcAuthData == "undefined" && (svcAuthData = {
                                hasUserAuthenticatedState: !1, domains: []
                            }, sessionAuthData[Services.AzureConstants.ServiceKeys.sharePointOnline] = svcAuthData);
                            var provider = this._azureConnectionAcquirer.provider;
                            provider && (svcAuthData.hasUserAuthenticatedState = svcAuthData.hasUserAuthenticatedState || provider.store.isAuthenticated, provider.store.domains && (svcAuthData.domains = provider.store.domains))
                        }, SharePointOnlineBroker.prototype.isSharePointOnlineMedia = function(url) {
                            return this._rootUrl ? url.toLocaleLowerCase().indexOf(this._rootUrl.toLocaleLowerCase()) === 0 : !1
                        }, SharePointOnlineBroker.prototype.getSharePointMedia = function(mediaUrl) {
                            var _this = this;
                            return this.getSharePointResource().then(function(resource) {
                                    if (resource.resultCode !== 0)
                                        return WinJS.Promise.wrap(null);
                                    var requestUrl = _this._getServerRelativeUrl(mediaUrl),
                                        header = _this._buildGetMediaHelperHeader(resource);
                                    return Services.Meta.RESTWorkerController.getBinaryDataAsyncWithHeader(requestUrl, header)
                                }, function(error) {
                                    return WinJS.Promise.wrap(null)
                                })
                        }, SharePointOnlineBroker.prototype._buildGetMediaHelperHeader = function(resource) {
                            var header = {};
                            return header[OAuth2Constants.HeaderNames.authorization] = OAuth2Constants.TokenFormat.bearer.tokenFormat.replace(/\{access_token\}\\?/, resource.resource.token), header
                        }, SharePointOnlineBroker.prototype._getServerRelativeUrl = function(url) {
                            var relativePath = url.toLocaleLowerCase().replace(this._rootUrl.toLocaleLowerCase(), "");
                            return Core.Utility.formatString("{0}/_api/web/getfilebyserverrelativeurl('{1}')/$value", this._resourceUrl, relativePath)
                        }, SharePointOnlineBroker.prototype._parseBaseUrl = function(url) {
                            var parts = url.split("/");
                            var protocol = parts[0];
                            var host = parts[2];
                            return Core.Utility.formatString("{0}//{1}", protocol, host)
                        }, SharePointOnlineBroker._stripUrlHash = function(url) {
                            var hashPosition = url.indexOf("#");
                            return hashPosition > 0 ? url.substring(0, hashPosition) : url
                        }, SharePointOnlineBroker._ensureHttpsUrl = function(url) {
                            var parts = url.split("/");
                            return parts[0].toLowerCase() !== "https:" && (parts[0] = "https:"), parts.join("/")
                        }, SharePointOnlineBroker.resourceId = "Microsoft.SharePoint", SharePointOnlineBroker.nsCacheKey = "SharepointOnline~{B08FAA73-EB8D-4E0A-9635-A89C6117DC7E}", SharePointOnlineBroker.resourceUrlConversionPathFormat = "_api/sp.web.getweburlfrompageurl(@v)?@v='{0}'", SharePointOnlineBroker
            }();
        Services.SharePointOnlineBroker = SharePointOnlineBroker
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var SharePointOnlineConstants = function() {
                function SharePointOnlineConstants(){}
                return SharePointOnlineConstants.GetListItems_RowLimit = "5000", SharePointOnlineConstants.RowAttributePrefix_Ows = "ows_", SharePointOnlineConstants.RowAttribute_OwsId = "ows_ID", SharePointOnlineConstants.SharePointColumnType_Boolean = "boolean", SharePointOnlineConstants.SharePointColumnType_Choice = "choice", SharePointOnlineConstants.SharePointColumnType_MultiChoice = "multichoice", SharePointOnlineConstants.SharePointColumnType_GridChoice = "gridchoice", SharePointOnlineConstants.SharePointColumnType_Currency = "currency", SharePointOnlineConstants.SharePointColumnType_DateTime = "datetime", SharePointOnlineConstants.SharePointColumnType_LookUp = "lookup", SharePointOnlineConstants.SharePointColumnType_LookUpMulti = "lookupmulti", SharePointOnlineConstants.SharePointColumnType_Note = "note", SharePointOnlineConstants.SharePointColumnType_Number = "number", SharePointOnlineConstants.SharePointColumnType_Integer = "integer", SharePointOnlineConstants.SharePointColumnType_Text = "text", SharePointOnlineConstants.SharePointColumnType_Url = "url", SharePointOnlineConstants.SharePointColumnType_AllDayEvent = "alldayevent", SharePointOnlineConstants.SharePointColumnType_Recurrence = "recurrence", SharePointOnlineConstants.SharePointColumnType_Attachments = "attachments", SharePointOnlineConstants.SharePointColumnType_Calculated = "calculated", SharePointOnlineConstants.SharePointColumnType_Computed = "computed", SharePointOnlineConstants.SharePointColumnType_User = "user", SharePointOnlineConstants.SharePointColumnType_UserMulti = "usermulti", SharePointOnlineConstants.SharePointColumnType_Facilities = "facilities", SharePointOnlineConstants.SharePointColumnType_FreeBusy = "freebusy", SharePointOnlineConstants.SharePointColumnType_Overbook = "overbook", SharePointOnlineConstants.SharePointColumnType_Counter = "counter", SharePointOnlineConstants.SharePointColumnType_File = "file", SharePointOnlineConstants.SharePointColumnType_Guid = "guid", SharePointOnlineConstants.SharePointColumnType_TargetTo = "targetto", SharePointOnlineConstants.SharePointColumnType_LayoutVariationsField = "layoutvariationsfield", SharePointOnlineConstants.SharePointColumnType_Html = "html", SharePointOnlineConstants.SharePointColumnType_CrossProjectLink = "crossprojectlink", SharePointOnlineConstants.SharePointColumnType_OutcomeChoice = "outcomechoice", SharePointOnlineConstants.SharePointOnline_TempApplicationId = "6b03c885-57ae-41b0-a044-0af6a4c3f9db", SharePointOnlineConstants.SharePointOnline_OdataType = "odata.type", SharePointOnlineConstants.RowAttribute_O365 = "ID", SharePointOnlineConstants.UpdatedSPId = "ID", SharePointOnlineConstants.Path_GetLists = "_api/web/lists", SharePointOnlineConstants.Path_GetFields = "_api/Web/lists/getbytitle('{0}')/fields", SharePointOnlineConstants.Path_Items = "_api/web/lists/getbytitle('{0}')/items", SharePointOnlineConstants.Path_UpdateItem = "_api/web/lists/getbytitle('{0}')/items({1})", SharePointOnlineConstants.SharePointSchemaField_Hidden = "Hidden", SharePointOnlineConstants.SharePointSchemaField_ReadOnly = "ReadOnlyField", SharePointOnlineConstants.SharePointSchemaField_EntityPropertyName = "EntityPropertyName", SharePointOnlineConstants.SharePointSchemaField_Type = "TypeAsString", SharePointOnlineConstants.SharePointSchemaField_Title = "Title", SharePointOnlineConstants.UpdateListItems_MaxBatchSize = 1, SharePointOnlineConstants.HeaderName_IfMatch = "If-Match", SharePointOnlineConstants.HeaderName_XHttpMethod = "X-HTTP-Method", SharePointOnlineConstants.HeaderName_ContentType = "Content-Type", SharePointOnlineConstants.HeaderValue_DeleteMethod = "DELETE", SharePointOnlineConstants.HeaderValue_MergeMethod = "MERGE", SharePointOnlineConstants.HeaderValue_MatchAll = "*", SharePointOnlineConstants.HeaderValue_ApplicationJson = "application/json", SharePointOnlineConstants.HeaderValue_ApplicationJsonVerbose = "application/json;odata=verbose", SharePointOnlineConstants.RestMethod_Post = "POST", SharePointOnlineConstants.RestMethod_Get = "GET", SharePointOnlineConstants
            }();
        Services.SharePointOnlineConstants = SharePointOnlineConstants
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var SharePointOnlineServiceWorker = function() {
                function SharePointOnlineServiceWorker(){}
                return SharePointOnlineServiceWorker.prototype.querySharePointOnline = function(dataSourceState) {
                        var resource = dataSourceState.resource;
                        if (resource === null)
                            return WinJS.Promise.wrap({
                                    success: !1, message: AppMagic.AuthoringStrings.SharePointOnlineUnauthorized, type: AppMagic.Services.Results.Type.error
                                });
                        var sharePointOnlineWorker = new Services.SharePointOnlineWorker(dataSourceState.resource.serviceResourceId, dataSourceState.listName, dataSourceState.resource.token);
                        return sharePointOnlineWorker.listItems()
                    }, SharePointOnlineServiceWorker.prototype.getLists = function(siteUri, token) {
                        var _this = this;
                        var getListsRequestBuilder = this._buildGetListsRequest(siteUri),
                            authorizationHeader = "Bearer " + token;
                        return getListsRequestBuilder.addHeader("Authorization", authorizationHeader), getListsRequestBuilder.generateHttpRequestAsync().then(function(request) {
                                var httpReqData = request.getRequestData(),
                                    body = new Blob(httpReqData.data.map(function(datum) {
                                        return datum.value
                                    })),
                                    channel = new AppMagic.Services.Channel(httpReqData.url);
                                channel.method(httpReqData.method);
                                var headers = httpReqData.headers;
                                Object.keys(headers).forEach(function(headerName) {
                                    channel.header(headerName, headers[headerName])
                                });
                                var queryParams = httpReqData.queryParameters;
                                return Object.keys(queryParams).forEach(function(queryName) {
                                        channel.param(queryName, queryParams[queryName])
                                    }), channel.data(body), channel.sendRequest().then(function(response) {
                                            return _this._parseListsResponse(response)
                                        }, function() {
                                            return WinJS.Promise.wrap({
                                                    message: AppMagic.Strings.SharePointSyncError_UnableToReachServer, type: AppMagic.Services.Results.Type.error
                                                })
                                        })
                            })
                    }, SharePointOnlineServiceWorker.prototype._buildGetListsRequest = function(serviceResourceId) {
                            var requestBuilder = new Services.BodilessHttpRequestBuilder;
                            return requestBuilder.setBaseUrl(Services.SharePointOnlineWorker.getCleanBaseUrl(serviceResourceId)), requestBuilder.setMethod("GET"), requestBuilder.addPath(Services.SharePointOnlineConstants.Path_GetLists), requestBuilder.addHeader("accept", "application/json"), requestBuilder
                        }, SharePointOnlineServiceWorker.prototype._parseListsResponse = function(httpResponse) {
                            var listTitles = [];
                            try {
                                for (var listsWithMetadata = JSON.parse(httpResponse.responseText).value, i = 0, len = listsWithMetadata.length; i < len; i++)
                                    Contracts.checkNonEmpty(listsWithMetadata[i].Title),
                                    listsWithMetadata[i].Hidden || listTitles.push(listsWithMetadata[i].Title);
                                return WinJS.Promise.wrap(listTitles)
                            }
                            catch(e) {}
                            return WinJS.Promise.wrap({
                                    message: AppMagic.Strings.SharePointSyncError_UnableToReachServer, type: AppMagic.Services.Results.Type.error
                                })
                        }, SharePointOnlineServiceWorker.FunctionName_querySharePointOnline = "querySharePointOnline", SharePointOnlineServiceWorker.FunctionName_getLists = "getLists", SharePointOnlineServiceWorker
            }();
        Services.SharePointOnlineServiceWorker = SharePointOnlineServiceWorker
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var SharePointTypeToDTypeResult = function() {
                function SharePointTypeToDTypeResult(){}
                return SharePointTypeToDTypeResult
            }();
        Services.SharePointTypeToDTypeResult = SharePointTypeToDTypeResult;
        var SharePointOnlineWorker = function() {
                function SharePointOnlineWorker(resourceId, listName, token, channelFactory) {
                    this._resourceId = resourceId;
                    this._listName = listName;
                    this._token = token;
                    this._channelFactory = channelFactory || new Services.DefaultChannelFactory
                }
                return SharePointOnlineWorker.processGetListItemsResponse = function(items, listSchema, serviceResourceURL, listName) {
                        if (!listSchema.success)
                            return {
                                    success: !1, message: listSchema.message
                                };
                        for (var rows = [], i = 0, len = items.length; i < len; i++) {
                            var row = SharePointOnlineWorker.processListItem(listSchema.result, items[i]);
                            row !== null && rows.push(row)
                        }
                        var schemaPointer = listSchema.result.map(function(schemaItem) {
                                return {
                                        name: schemaItem.displayName, type: schemaItem.dtype
                                    }
                            }),
                            schema = AppMagic.Schema.createSchemaForArrayFromPointer(schemaPointer);
                        return {
                                success: !0, message: "", result: rows, schema: schema, configuration: {
                                        siteUri: serviceResourceURL, listName: listName
                                    }
                            }
                    }, SharePointOnlineWorker.sharePointValueToDValue = function(value, dtype) {
                        if (value === null)
                            return {
                                    success: !0, message: null, result: null
                                };
                        var result;
                        switch (dtype) {
                            case AppMagic.Schema.TypeDateTime:
                                value = value.replace("T", " ");
                                value = value.replace("Z", "");
                                var dateMatch = value.match(/^(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)$/);
                                if (dateMatch === null)
                                    return {
                                            success: !1, message: AppMagic.Strings.SharePointSyncError_ListItemHasInvalidFormat, result: null
                                        };
                                var utcTimeValues = dateMatch.splice(1);
                                utcTimeValues[1] = (parseInt(utcTimeValues[1]) - 1).toString();
                                result = Date.UTC.apply(null, utcTimeValues);
                                break;
                            case AppMagic.Schema.TypeHyperlink:
                                var urls = value.Url.split(",");
                                result = urls.length > 0 ? urls[0].trim() : value.Url;
                                break;
                            case AppMagic.Schema.TypeString:
                                result = value;
                                break;
                            case AppMagic.Schema.TypeBoolean:
                                result = value;
                                break;
                            case AppMagic.Schema.TypeCurrency:
                            case AppMagic.Schema.TypeNumber:
                                result = value;
                                break;
                            default:
                                return {
                                        success: !1, message: AppMagic.Strings.SharePointSyncError_ListItemHasInvalidFormat, result: null
                                    }
                        }
                        return {
                                success: !0, result: result, message: null
                            }
                    }, SharePointOnlineWorker.sharePointTypeToDType = function(sharePointType) {
                            var result;
                            switch (sharePointType.toLowerCase()) {
                                case Services.SharePointOnlineConstants.SharePointColumnType_AllDayEvent:
                                case Services.SharePointOnlineConstants.SharePointColumnType_Recurrence:
                                case Services.SharePointOnlineConstants.SharePointColumnType_Boolean:
                                    result = {
                                        dtype: AppMagic.Schema.TypeBoolean, sharePointType: 9
                                    };
                                    break;
                                case Services.SharePointOnlineConstants.SharePointColumnType_MultiChoice:
                                case Services.SharePointOnlineConstants.SharePointColumnType_GridChoice:
                                case Services.SharePointOnlineConstants.SharePointColumnType_Choice:
                                case Services.SharePointOnlineConstants.SharePointColumnType_OutcomeChoice:
                                    result = {
                                        dtype: AppMagic.Schema.TypeString, sharePointType: 7
                                    };
                                    break;
                                case Services.SharePointOnlineConstants.SharePointColumnType_Currency:
                                    result = {
                                        dtype: AppMagic.Schema.TypeCurrency, sharePointType: 1
                                    };
                                    break;
                                case Services.SharePointOnlineConstants.SharePointColumnType_DateTime:
                                    result = {
                                        dtype: AppMagic.Schema.TypeDateTime, sharePointType: 0
                                    };
                                    break;
                                case Services.SharePointOnlineConstants.SharePointColumnType_LookUp:
                                    result = {
                                        dtype: AppMagic.Schema.TypeString, sharePointType: 8
                                    };
                                    break;
                                case Services.SharePointOnlineConstants.SharePointColumnType_Note:
                                    result = {
                                        dtype: AppMagic.Schema.TypeString, sharePointType: 6
                                    };
                                    break;
                                case Services.SharePointOnlineConstants.SharePointColumnType_Number:
                                    result = {
                                        dtype: AppMagic.Schema.TypeNumber, sharePointType: 3
                                    };
                                    break;
                                case Services.SharePointOnlineConstants.SharePointColumnType_Integer:
                                    result = {
                                        dtype: AppMagic.Schema.TypeNumber, sharePointType: 4
                                    };
                                    break;
                                case Services.SharePointOnlineConstants.SharePointColumnType_Url:
                                    result = {
                                        dtype: AppMagic.Schema.TypeHyperlink, sharePointType: 2
                                    };
                                    break;
                                case Services.SharePointOnlineConstants.SharePointColumnType_Calculated:
                                case Services.SharePointOnlineConstants.SharePointColumnType_Computed:
                                case Services.SharePointOnlineConstants.SharePointColumnType_User:
                                case Services.SharePointOnlineConstants.SharePointColumnType_UserMulti:
                                case Services.SharePointOnlineConstants.SharePointColumnType_Facilities:
                                case Services.SharePointOnlineConstants.SharePointColumnType_FreeBusy:
                                case Services.SharePointOnlineConstants.SharePointColumnType_Overbook:
                                case Services.SharePointOnlineConstants.SharePointColumnType_Counter:
                                case Services.SharePointOnlineConstants.SharePointColumnType_File:
                                case Services.SharePointOnlineConstants.SharePointColumnType_LayoutVariationsField:
                                case Services.SharePointOnlineConstants.SharePointColumnType_Guid:
                                case Services.SharePointOnlineConstants.SharePointColumnType_TargetTo:
                                case Services.SharePointOnlineConstants.SharePointColumnType_Html:
                                case Services.SharePointOnlineConstants.SharePointColumnType_CrossProjectLink:
                                case Services.SharePointOnlineConstants.SharePointColumnType_LookUpMulti:
                                case Services.SharePointOnlineConstants.SharePointColumnType_Text:
                                    result = {
                                        dtype: AppMagic.Schema.TypeString, sharePointType: 5
                                    };
                                    break;
                                default:
                                    return {
                                            success: !1, message: "This type is not supported ignore it."
                                        }
                            }
                            return {
                                    success: !0, result: result
                                }
                        }, SharePointOnlineWorker.dValueToSharePointValue = function(value, sharePointType) {
                            switch (sharePointType) {
                                case 9:
                                    return value;
                                case 0:
                                    var d = new Date;
                                    return d.setTime(value), d.toISOString();
                                case 1:
                                case 3:
                                case 4:
                                    return value;
                                case 7:
                                case 8:
                                case 6:
                                case 5:
                                    return value;
                                case 2:
                                    return {Url: value};
                                default:
                                    return value
                            }
                        }, SharePointOnlineWorker.getFieldsFromListSchema = function(response) {
                            for (var fieldsList = JSON.parse(response.responseText), filteredFields = [], i = 0, len = fieldsList.value.length; i < len; i++) {
                                var field = fieldsList.value[i];
                                try {
                                    var schemaItem = SharePointOnlineWorker.processFieldForSchema(field);
                                    schemaItem !== null && filteredFields.push(schemaItem)
                                }
                                catch(e) {
                                    return WinJS.Promise.wrap({
                                            success: !1, message: AppMagic.Strings.SharePointSyncError_ListItemHasInvalidFormat, result: null
                                        })
                                }
                            }
                            return WinJS.Promise.wrap({
                                    success: !0, message: null, result: filteredFields
                                })
                        }, SharePointOnlineWorker.processFieldForSchema = function(attribute) {
                            var hidden,
                                readOnly,
                                displayName,
                                internalName,
                                dtype,
                                sharePointType,
                                excludeByType = ["Attachments", "Content Type", "ContentTypeId", "ContentTypeIdFieldType", "RelatedItems", "Lookup"],
                                excludeByInternalName = ["ContentType", ];
                            readOnly = attribute[Services.SharePointOnlineConstants.SharePointSchemaField_ReadOnly];
                            hidden = attribute[Services.SharePointOnlineConstants.SharePointSchemaField_Hidden];
                            displayName = attribute[Services.SharePointOnlineConstants.SharePointSchemaField_Title];
                            internalName = attribute[Services.SharePointOnlineConstants.SharePointSchemaField_EntityPropertyName];
                            var typeAttributeValue = attribute[Services.SharePointOnlineConstants.SharePointSchemaField_Type];
                            if (typeof displayName != "string" || typeof internalName != "string" || typeof typeAttributeValue != "string")
                                throw new Error;
                            if (hidden === !0 || readOnly === !0 || excludeByType.indexOf(typeAttributeValue) >= 0 || excludeByInternalName.indexOf(internalName) >= 0)
                                return null;
                            var typeResult = this.sharePointTypeToDType(typeAttributeValue);
                            if (!typeResult.success)
                                return null;
                            var type = typeResult.result;
                            return dtype = type.dtype, sharePointType = type.sharePointType, {
                                        displayName: displayName, internalName: internalName, dtype: dtype, sharePointType: sharePointType
                                    }
                        }, SharePointOnlineWorker.processListItem = function(listSchema, item) {
                            var spId = item[Services.SharePointOnlineConstants.RowAttribute_O365];
                            if (!isFinite(spId))
                                return null;
                            for (var row = Object.create(null), i = 0, len = listSchema.length; i < len; i++) {
                                var listSchemaItem = listSchema[i],
                                    attributeName = listSchemaItem.internalName,
                                    attributeValue = item[attributeName];
                                if (typeof attributeValue != "undefined" && !(attributeValue instanceof Array)) {
                                    var result = SharePointOnlineWorker.sharePointValueToDValue(attributeValue, listSchemaItem.dtype);
                                    result.success && (row[listSchemaItem.displayName] = result.result)
                                }
                            }
                            return row[Services.SharePointOnlineConstants.SharePointOnline_OdataType] = item[Services.SharePointOnlineConstants.SharePointOnline_OdataType], row[SharePointOnlineWorker.SpIdProperty] = spId, row
                        }, SharePointOnlineWorker.prototype.listSchema = function() {
                            var channel = this._getResourceChannel(Services.SharePointOnlineConstants.RestMethod_Get).path(Core.Utility.formatString(Services.SharePointOnlineConstants.Path_GetFields, this._listName));
                            return channel.sendRequest().then(SharePointOnlineWorker.getFieldsFromListSchema, function(error) {
                                    return WinJS.Promise.wrap({
                                            success: !1, message: AppMagic.Strings.SharePointSyncError_UnableToReachServer
                                        })
                                })
                        }, SharePointOnlineWorker.prototype.getItems = function(listSchema) {
                            var _this = this;
                            var sharePointOnlineList = new AppMagic.Services.SharePointOnline.SharePointOnlineList(this._resourceId, this._listName, this._token);
                            return sharePointOnlineList.getItems().then(function(result) {
                                    return result.resultCode !== 0 ? WinJS.Promise.wrap({
                                            success: !1, message: AppMagic.Strings.SharePointSyncError_UnableToReachServer
                                        }) : WinJS.Promise.wrap(SharePointOnlineWorker.processGetListItemsResponse(result.items, listSchema, _this._resourceId, _this._listName))
                                })
                        }, SharePointOnlineWorker.prototype.listItems = function() {
                            var _this = this;
                            return this.listSchema().then(function(schema) {
                                    return _this.getItems(schema)
                                }, function(error) {
                                    return WinJS.Promise.wrap({
                                            success: !1, message: error.message
                                        })
                                })
                        }, SharePointOnlineWorker.prototype.addItem = function(item) {
                            var channel = this._getResourceChannel(Services.SharePointOnlineConstants.RestMethod_Post).header(Services.SharePointOnlineConstants.HeaderName_ContentType, Services.SharePointOnlineConstants.HeaderValue_ApplicationJson).path(Core.Utility.formatString(Services.SharePointOnlineConstants.Path_Items, this._listName)).data(JSON.stringify(item));
                            return SharePointOnlineWorker.sendJsonUpdateRequest(channel)
                        }, SharePointOnlineWorker.prototype.mergeItem = function(item, id) {
                            var channel = this._getResourceChannel(Services.SharePointOnlineConstants.RestMethod_Post).path(Core.Utility.formatString(Services.SharePointOnlineConstants.Path_UpdateItem, this._listName, id)).header(Services.SharePointOnlineConstants.HeaderName_ContentType, Services.SharePointOnlineConstants.HeaderValue_ApplicationJsonVerbose).header(Services.SharePointOnlineConstants.HeaderName_IfMatch, Services.SharePointOnlineConstants.HeaderValue_MatchAll).header(Services.SharePointOnlineConstants.HeaderName_XHttpMethod, Services.SharePointOnlineConstants.HeaderValue_MergeMethod).data(JSON.stringify(item));
                            return SharePointOnlineWorker.sendJsonUpdateRequest(channel)
                        }, SharePointOnlineWorker.prototype.deleteItem = function(id) {
                            var channel = this._getResourceChannel(Services.SharePointOnlineConstants.RestMethod_Post).path(Core.Utility.formatString(Services.SharePointOnlineConstants.Path_UpdateItem, this._listName, id)).header(Services.SharePointOnlineConstants.HeaderName_ContentType, Services.SharePointOnlineConstants.HeaderValue_ApplicationJson).header(Services.SharePointOnlineConstants.HeaderName_IfMatch, Services.SharePointOnlineConstants.HeaderValue_MatchAll).header(Services.SharePointOnlineConstants.HeaderName_XHttpMethod, Services.SharePointOnlineConstants.HeaderValue_DeleteMethod);
                            return SharePointOnlineWorker.sendJsonUpdateRequest(channel)
                        }, SharePointOnlineWorker.getCleanBaseUrl = function(baseUrl) {
                            return baseUrl.replace("-my", "")
                        }, SharePointOnlineWorker.sendJsonUpdateRequest = function(channel) {
                            return channel.sendRequest().then(function(result) {
                                    var jsonResponse;
                                    return result.responseText && (jsonResponse = JSON.parse(result.responseText)), WinJS.Promise.wrap({
                                            success: !0, result: jsonResponse
                                        })
                                }, function(error) {
                                    return WinJS.Promise.wrap({
                                            success: !1, message: AppMagic.Strings.SharePointSyncError_UnableToReachServer
                                        })
                                })
                        }, SharePointOnlineWorker.prototype._getResourceChannel = function(method) {
                            var channel = this._channelFactory.createChannel(this._resourceId);
                            return channel.method(method).header("Authorization:", Core.Utility.formatString("Bearer {0}", this._token)).header("accept", "application/json")
                        }, SharePointOnlineWorker.SpIdProperty = AppMagic.Constants.Services.SpIdProperty, SharePointOnlineWorker.IdProperty = AppMagic.Constants.Services.ID_PROPERTY, SharePointOnlineWorker
            }();
        Services.SharePointOnlineWorker = SharePointOnlineWorker
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var SharePointOnlineWorkerController = function() {
                function SharePointOnlineWorkerController(dispatcher) {
                    this._workerHandle = dispatcher.createWorker(["AppMagic", "Services", "SharePointSyncAgent"], [])
                }
                return SharePointOnlineWorkerController.prototype.synchronize = function(configuration, localData, workspaceData, resource) {
                        var parameters = [{
                                    configuration: configuration, localData: localData, workspaceData: workspaceData, resource: resource
                                }];
                        return this._workerHandle.invokeWorker(SharePointOnlineWorkerController.OpName_SyncAndResolve, parameters).then(function(response) {
                                return response.result
                            }, function(error) {
                                throw error;
                            })
                    }, SharePointOnlineWorkerController.OpName_SyncAndResolve = "syncAndResolve", SharePointOnlineWorkerController
            }();
        Services.SharePointOnlineWorkerController = SharePointOnlineWorkerController
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var SharePointOnline;
        (function(SharePointOnline) {
            (function(GetItemsResultCode) {
                GetItemsResultCode[GetItemsResultCode.Success = 0] = "Success";
                GetItemsResultCode[GetItemsResultCode.UnableToReachServer = 1] = "UnableToReachServer";
                GetItemsResultCode[GetItemsResultCode.UnableToParseResponse = 2] = "UnableToParseResponse"
            })(SharePointOnline.GetItemsResultCode || (SharePointOnline.GetItemsResultCode = {}));
            var GetItemsResultCode = SharePointOnline.GetItemsResultCode,
                SharePointOnlineList = function() {
                    function SharePointOnlineList(resourceId, listName, token, channelFactory) {
                        this._resourceId = resourceId;
                        this._listName = listName;
                        this._token = token;
                        this._channelFactory = channelFactory || new Services.DefaultChannelFactory
                    }
                    return SharePointOnlineList.prototype.getItems = function() {
                            var channel = this._getResourceChannel("GET", this._resourceId).path(Core.Utility.formatString(Services.SharePointOnlineConstants.Path_Items, this._listName));
                            return this._getItems(channel, [])
                        }, SharePointOnlineList.prototype._getItems = function(channelWithUrl, resultArray) {
                            var _this = this;
                            return this._getItemsInBatch(channelWithUrl).then(function(response) {
                                    if (response.resultCode !== 0)
                                        return WinJS.Promise.wrap({
                                                resultCode: response.resultCode, items: null
                                            });
                                    if (response.items.forEach(function(item) {
                                        resultArray.push(item)
                                    }), response.nextLink === null)
                                        return WinJS.Promise.wrap({
                                                resultCode: 0, items: resultArray
                                            });
                                    var nextChannel = _this._getResourceChannel("GET", response.nextLink);
                                    return _this._getItems(nextChannel, resultArray)
                                })
                        }, SharePointOnlineList.prototype._getItemsInBatch = function(requestChannel) {
                                return requestChannel.sendRequest().then(function(xhrResponse) {
                                        try {
                                            var json = JSON.parse(xhrResponse.responseText);
                                            Contracts.checkObject(json);
                                            Contracts.checkArray(json.value);
                                            var nextLink = json["odata.nextLink"];
                                            nextLink = AppMagic.Utility.isString(nextLink) ? nextLink : null;
                                            var result = {
                                                    resultCode: 0, items: json.value, nextLink: nextLink
                                                };
                                            return WinJS.Promise.wrap(result)
                                        }
                                        catch(e) {}
                                        return WinJS.Promise.wrap({
                                                resultCode: 2, items: null, nextLink: null
                                            })
                                    }, function(error) {
                                        var result = {
                                                resultCode: 1, items: null, nextLink: null
                                            };
                                        return WinJS.Promise.wrap(result)
                                    })
                            }, SharePointOnlineList.prototype._getResourceChannel = function(method, resourceUrl) {
                                var channel = this._channelFactory.createChannel(resourceUrl);
                                return channel.method(method).header("Authorization:", Core.Utility.formatString("Bearer {0}", this._token)).header("accept", "application/json")
                            }, SharePointOnlineList
                }();
            SharePointOnline.SharePointOnlineList = SharePointOnlineList
        })(SharePointOnline = Services.SharePointOnline || (Services.SharePointOnline = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var Dictionary = Collections.Generic.Dictionary,
            SharePointTableDifference = function() {
                function SharePointTableDifference(){}
                return SharePointTableDifference
            }();
        Services.SharePointTableDifference = SharePointTableDifference;
        var OnlineMethod = function() {
                function OnlineMethod(){}
                return OnlineMethod
            }();
        Services.OnlineMethod = OnlineMethod;
        var SyncAndResolveOnlineInfo = function() {
                function SyncAndResolveOnlineInfo(){}
                return SyncAndResolveOnlineInfo
            }();
        Services.SyncAndResolveOnlineInfo = SyncAndResolveOnlineInfo;
        var SharePointSyncAgent = function() {
                function SharePointSyncAgent(){}
                return SharePointSyncAgent.prototype.syncAndResolve = function(syncAndResolveInfo) {
                        var siteUri = syncAndResolveInfo.configuration.siteUri,
                            listName = syncAndResolveInfo.configuration.listName,
                            token = syncAndResolveInfo.resource.token;
                        var worker = new Services.SharePointOnlineWorker(siteUri, listName, token);
                        return worker.listSchema().then(function(schema) {
                                return schema.success ? SharePointSyncAgent.updateListItemsAndComputeNewWorkspace(siteUri, listName, syncAndResolveInfo.workspaceData, syncAndResolveInfo.localData, schema.result, Services.SharePointOnlineConstants.UpdateListItems_MaxBatchSize, worker) : WinJS.Promise.wrap({
                                        success: !1, message: schema.message
                                    })
                            }, function(error) {
                                return WinJS.Promise.wrap({
                                        success: !1, message: error.message
                                    })
                            })
                    }, SharePointSyncAgent.updateListItemsAndComputeNewWorkspace = function(siteUri, listName, workspaceData, localData, listSchema, maxBatchSize, worker) {
                        var updateMethods = SharePointSyncAgent.buildUpdateListItemsMethods(workspaceData, localData, listSchema),
                            chainedUpdatesPromise = WinJS.Promise.wrap();
                        if (updateMethods.length > 0) {
                            for (var numberOfBatches = Math.ceil(updateMethods.length / maxBatchSize), updateResponses = new Array(numberOfBatches), i = 0, len = numberOfBatches; i < len; i++)
                                (function(index) {
                                    var methodBatch = updateMethods.splice(0, maxBatchSize);
                                    chainedUpdatesPromise = chainedUpdatesPromise.then(function() {
                                        return SharePointSyncAgent.updateListItems(methodBatch, worker)
                                    }).then(function(updateListItemsResponse) {
                                        return updateResponses[index] = updateListItemsResponse, WinJS.Promise.wrap()
                                    })
                                })(i);
                            var newLocalDataById = new Dictionary,
                                localDataBySpId = new Dictionary;
                            return localData.forEach(function(datum) {
                                    var spId = datum[SharePointSyncAgent.SpIdProperty];
                                    if (typeof spId != "undefined")
                                        localDataBySpId.setValue(spId.toString(), datum);
                                    else {
                                        var id = datum[SharePointSyncAgent.IdProperty].toString();
                                        newLocalDataById.setValue(id, datum)
                                    }
                                }), chainedUpdatesPromise.then(function() {
                                    var updateResults = updateResponses.filter(function(updateResponse) {
                                            return updateResponse.success
                                        }).map(function(updateResponse) {
                                            return updateResponse.result
                                        });
                                    return SharePointSyncAgent.mergeUpdateListItemsResponsesIntoLocalData(localData, updateResults), SharePointSyncAgent.getListItemsAndComputeNewWorkspace(siteUri, listName, listSchema, localData, worker)
                                })
                        }
                        else
                            return SharePointSyncAgent.getListItemsAndComputeNewWorkspace(siteUri, listName, listSchema, localData, worker)
                    }, SharePointSyncAgent.updateListItems = function(updateMethods, worker) {
                            var restMethod = SharePointSyncAgent.buildRestMethodNode(updateMethods[0]);
                            switch (restMethod.Cmd) {
                                case SharePointSyncAgent.UpdateListItemsCmd_New:
                                    return worker.addItem(restMethod.Fields).then(function(resp) {
                                            return resp.success ? (resp.result[SharePointSyncAgent.IdProperty] = restMethod.localId, WinJS.Promise.wrap({
                                                    success: !0, result: resp.result
                                                })) : WinJS.Promise.wrap(resp)
                                        }, function(error) {
                                            return WinJS.Promise.wrap({
                                                    success: !1, result: error.message
                                                })
                                        });
                                case SharePointSyncAgent.UpdateListItemsCmd_Delete:
                                    return worker.deleteItem(String(restMethod.spId)).then(function(resp) {
                                            return resp.success ? (resp.result = {}, resp.result[SharePointSyncAgent.IdProperty] = restMethod.localId, WinJS.Promise.wrap({
                                                        success: !0, result: resp.result
                                                    })) : WinJS.Promise.wrap(resp)
                                        }, function(error) {
                                            return WinJS.Promise.wrap({
                                                    success: !1, result: error.message
                                                })
                                        });
                                case SharePointSyncAgent.UpdateListItemsCmd_Update:
                                    var requestMetaData = {type: restMethod.oDataType};
                                    return restMethod.Fields.__metadata = requestMetaData, worker.mergeItem(restMethod.Fields, restMethod.spId).then(function(resp) {
                                            return resp.success ? (resp.result || (resp.result = {}), resp.result[SharePointSyncAgent.IdProperty] = restMethod.localId, WinJS.Promise.wrap({
                                                        success: !0, result: resp.result
                                                    })) : WinJS.Promise.wrap(resp)
                                        }, function(error) {
                                            return WinJS.Promise.wrap({
                                                    success: !1, result: error.message
                                                })
                                        });
                                default:
                                    return WinJS.Promise.wrap({
                                            success: !1, message: "Not implemeted"
                                        })
                            }
                        }, SharePointSyncAgent.buildUpdateListItemsMethods = function(workspaceData, localData, listSchema) {
                            var workspaceDataBySpId = new Dictionary;
                            workspaceData.forEach(function(row) {
                                workspaceDataBySpId.setValue(row[SharePointSyncAgent.SpIdProperty].toString(), row)
                            });
                            var localDataBySpId = new Dictionary,
                                localDataById = new Dictionary;
                            localData.forEach(function(row) {
                                localDataById.setValue(row[SharePointSyncAgent.IdProperty].toString(), row);
                                var spId = row[SharePointSyncAgent.SpIdProperty];
                                typeof spId != "undefined" && localDataBySpId.setValue(spId.toString(), row)
                            });
                            var tableDiffs = SharePointSyncAgent.computeTableDifferences(workspaceDataBySpId, localDataById, localDataBySpId),
                                schemaByDisplayNames = new Dictionary;
                            listSchema.forEach(function(field) {
                                schemaByDisplayNames.setValue(field.displayName, field)
                            });
                            for (var methods = [], addSetRowIds = tableDiffs.addSet.keys, i = 0, len = addSetRowIds.length; i < len; i++) {
                                for (var id = addSetRowIds[i], addedRow = tableDiffs.addSet.getValue(id), fieldValuesByInternalName = new Dictionary, unreservedKeys = SharePointSyncAgent.getUnreservedKeys(addedRow), j = 0, jlen = unreservedKeys.length; j < jlen; j++) {
                                    var displayName = unreservedKeys[j];
                                    if (schemaByDisplayNames.containsKey(displayName)) {
                                        var schemaItem = schemaByDisplayNames.getValue(displayName),
                                            dValue = addedRow[unreservedKeys[j]];
                                        if (dValue !== null) {
                                            var sharePointValue = Services.SharePointOnlineWorker.dValueToSharePointValue(dValue, schemaItem.sharePointType);
                                            fieldValuesByInternalName.setValue(schemaItem.internalName, sharePointValue)
                                        }
                                    }
                                }
                                var method = SharePointSyncAgent.buildMethodNode(id, SharePointSyncAgent.UpdateListItemsCmd_New, fieldValuesByInternalName);
                                methods.push(method)
                            }
                            for (var deleteSetSpIds = tableDiffs.deleteSet.keys, i = 0, len = deleteSetSpIds.length; i < len; i++) {
                                var spId = deleteSetSpIds[i],
                                    id = workspaceDataBySpId.getValue(spId)[SharePointSyncAgent.IdProperty].toString(),
                                    fieldValuesByInternalName = new Dictionary;
                                fieldValuesByInternalName.setValue(SharePointSyncAgent.IdFieldName, spId);
                                var method = SharePointSyncAgent.buildMethodNode(id, SharePointSyncAgent.UpdateListItemsCmd_Delete, fieldValuesByInternalName);
                                methods.push(method)
                            }
                            for (var editSetSpIds = tableDiffs.editSet.keys, i = 0, len = editSetSpIds.length; i < len; i++) {
                                var spId = editSetSpIds[i],
                                    rowDiff = tableDiffs.editSet.getValue(spId),
                                    editedRow = localDataBySpId.getValue(spId),
                                    id = editedRow[SharePointSyncAgent.IdProperty].toString(),
                                    fieldValuesByInternalName = new Dictionary;
                                rowDiff.addSet.keys.concat(rowDiff.editSet.keys).forEach(function(key) {
                                    var dValue = editedRow[key],
                                        schemaItem = schemaByDisplayNames.getValue(key),
                                        sharePointValue = dValue === null ? "" : Services.SharePointOnlineWorker.dValueToSharePointValue(dValue, schemaItem.sharePointType);
                                    fieldValuesByInternalName.setValue(schemaItem.internalName, sharePointValue)
                                });
                                rowDiff.deleteSet.keys.forEach(function(key) {
                                    var schemaItem = schemaByDisplayNames.getValue(key);
                                    fieldValuesByInternalName.setValue(schemaItem.internalName, "")
                                });
                                fieldValuesByInternalName.setValue(SharePointSyncAgent.IdFieldName, spId);
                                fieldValuesByInternalName.setValue(Services.SharePointOnlineConstants.SharePointOnline_OdataType, editedRow[Services.SharePointOnlineConstants.SharePointOnline_OdataType]);
                                var method = SharePointSyncAgent.buildMethodNode(id, SharePointSyncAgent.UpdateListItemsCmd_Update, fieldValuesByInternalName);
                                methods.push(method)
                            }
                            return methods
                        }, SharePointSyncAgent.computeTableDifferences = function(originalDataBySpId, modifiedDataById, modifiedDataBySpId) {
                            var addSet = new Dictionary;
                            modifiedDataById.keys.forEach(function(key) {
                                var datum = modifiedDataById.getValue(key),
                                    spId = datum[SharePointSyncAgent.SpIdProperty];
                                if (typeof spId == "undefined") {
                                    var id = datum[SharePointSyncAgent.IdProperty];
                                    addSet.setValue(id.toString(), datum)
                                }
                            });
                            for (var editSet = new Dictionary, deleteSet = new Dictionary, oriSpIds = originalDataBySpId.keys, i = 0, len = oriSpIds.length; i < len; i++) {
                                var spId = oriSpIds[i];
                                if (modifiedDataBySpId.containsKey(spId)) {
                                    var modDataRow = modifiedDataBySpId.getValue(spId),
                                        oriDataRow = originalDataBySpId.getValue(spId),
                                        rowDiff = SharePointSyncAgent.computeRowDifferences(oriDataRow, modDataRow);
                                    (rowDiff.addSet.count > 0 || rowDiff.deleteSet.count > 0 || rowDiff.editSet.count > 0) && editSet.setValue(spId, rowDiff)
                                }
                                else
                                    deleteSet.setValue(spId, !0)
                            }
                            return {
                                    addSet: addSet, editSet: editSet, deleteSet: deleteSet
                                }
                        }, SharePointSyncAgent.computeRowDifferences = function(row0, row1) {
                            var unreservedKeys0 = SharePointSyncAgent.getUnreservedKeys(row0),
                                newUnreservedKeys1 = SharePointSyncAgent.getUnreservedKeys(row1),
                                addSet = new Dictionary,
                                editSet = new Dictionary,
                                deleteSet = new Dictionary;
                            newUnreservedKeys1.forEach(function(key) {
                                addSet.setValue(key, !0)
                            });
                            for (var i = 0, len = unreservedKeys0.length; i < len; i++) {
                                var key0 = unreservedKeys0[i],
                                    cell1 = row1[key0];
                                typeof cell1 != "undefined" ? (row0[key0] !== cell1 && editSet.setValue(key0, !0), addSet.deleteValue(key0)) : deleteSet.setValue(key0, !0)
                            }
                            return {
                                    addSet: addSet, editSet: editSet, deleteSet: deleteSet
                                }
                        }, SharePointSyncAgent.getUnreservedKeys = function(obj) {
                            return Object.keys(obj).filter(function(key) {
                                    return SharePointSyncAgent.ReservedKeys.indexOf(key) < 0
                                })
                        }, SharePointSyncAgent.buildMethodNode = function(methodId, cmd, fieldValuesByInternalName) {
                            for (var keys = fieldValuesByInternalName.keys, fields = new Array(keys.length), i = 0, len = keys.length; i < len; i++) {
                                var key = keys[i];
                                fields[i] = {
                                    $name: "Field", $attributes: {Name: key}, $text: fieldValuesByInternalName.getValue(key)
                                }
                            }
                            return {
                                    $name: "Method", $attributes: {
                                            ID: methodId, Cmd: cmd
                                        }, Field: fields
                                }
                        }, SharePointSyncAgent.buildRestMethodNode = function(method) {
                            var result = new OnlineMethod;
                            result.Cmd = method.$attributes.Cmd;
                            result.localId = method.$attributes.ID;
                            result.Fields = {};
                            for (var i = 0, len = method.Field.length; i < len; i++) {
                                if (method.Field[i].$attributes.Name === Services.SharePointOnlineConstants.SharePointOnline_OdataType) {
                                    result.oDataType = method.Field[i].$text;
                                    continue
                                }
                                if (method.Field[i].$attributes.Name === SharePointSyncAgent.IdFieldName) {
                                    result.spId = method.Field[i].$text;
                                    continue
                                }
                                result.Fields[method.Field[i].$attributes.Name] = method.Field[i].$text
                            }
                            return result
                        }, SharePointSyncAgent.getListItemsAndComputeNewWorkspace = function(siteUri, listName, listSchema, localData, worker) {
                            var SchemaAsync = {
                                    success: !0, result: listSchema
                                };
                            return worker.getItems(SchemaAsync).then(function(getListItemsResponse) {
                                    return getListItemsResponse.success ? (SharePointSyncAgent.mergeServerDataIntoLocalData(localData, getListItemsResponse.result), WinJS.Promise.wrap({
                                            success: !0, result: localData
                                        })) : WinJS.Promise.wrap({
                                            success: !1, message: getListItemsResponse.message
                                        })
                                }, function(error) {
                                    return WinJS.Promise.wrap({
                                            success: !1, message: error.messsage
                                        })
                                })
                        }, SharePointSyncAgent.mergeServerDataIntoLocalData = function(localData, serverData) {
                            var serverDataBySpId = new Dictionary;
                            serverData.forEach(function(row) {
                                serverDataBySpId.setValue(row[Services.SharePointSyncWorker.SpIdProperty].toString(), row)
                            });
                            var localDataBySpId = new Dictionary,
                                localDataById = new Dictionary;
                            localData.forEach(function(row) {
                                localDataById.setValue(row[Services.SharePointSyncWorker.IdProperty].toString(), row);
                                var spId = row[Services.SharePointSyncWorker.SpIdProperty];
                                typeof spId != "undefined" && localDataBySpId.setValue(spId.toString(), row)
                            });
                            for (var diffs = SharePointSyncAgent.computeTableDifferences(serverDataBySpId, localDataById, localDataBySpId), i = localData.length - 1; i >= 0; i--) {
                                var localDatum = localData[i],
                                    spId,
                                    spIdNumValue = localDatum[Services.SharePointSyncWorker.SpIdProperty];
                                if (typeof spIdNumValue != "undefined" && (spId = spIdNumValue.toString(), !serverDataBySpId.containsKey(spId))) {
                                    localData.splice(i, 1);
                                    continue
                                }
                                var rowId = localDatum[Services.SharePointSyncWorker.IdProperty].toString();
                                if (!diffs.addSet.containsKey(rowId) && diffs.editSet.containsKey(spId)) {
                                    var edit = diffs.editSet.getValue(spId),
                                        serverDatum = serverDataBySpId.getValue(spId);
                                    edit.addSet.keys.forEach(function(key) {
                                        delete localDatum[key]
                                    });
                                    edit.editSet.keys.forEach(function(key) {
                                        localDatum[key] = serverDatum[key]
                                    });
                                    edit.deleteSet.keys.forEach(function(key) {
                                        localDatum[key] = serverDatum[key]
                                    });
                                    delete localDatum[Services.SharePointSyncWorker.IdProperty]
                                }
                            }
                            diffs.deleteSet.keys.forEach(function(spId) {
                                var serverDatum = serverDataBySpId.getValue(spId);
                                localData.push(AppMagic.Utility.jsonClone(serverDatum))
                            })
                        }, SharePointSyncAgent.mergeUpdateListItemsResponsesIntoLocalData = function(localData, updateListItemsResults) {
                            var newLocalDataById = new Dictionary,
                                localDataBySpId = new Dictionary;
                            localData.forEach(function(datum) {
                                var spId = datum[SharePointSyncAgent.SpIdProperty];
                                if (typeof spId != "undefined")
                                    localDataBySpId.setValue(spId.toString(), datum);
                                else {
                                    var id = datum[SharePointSyncAgent.IdProperty].toString();
                                    newLocalDataById.setValue(id, datum)
                                }
                            });
                            for (var i = 0, len = updateListItemsResults.length; i < len; i++) {
                                var updateListItemsResult = SharePointSyncAgent.convertUpdateResponseToIMerge([updateListItemsResults[i]]),
                                    mergeResult = SharePointSyncAgent.mergeUpdateListItemsResponseIntoLocalData(newLocalDataById, localDataBySpId, updateListItemsResult);
                                if (!mergeResult.success && mergeResult.message === AppMagic.Strings.SharePointSyncError_UpdateListItemsResponseListWasRecreated) {
                                    localData.splice(0, localData.length);
                                    break
                                }
                            }
                        }, SharePointSyncAgent.mergeUpdateListItemsResponseIntoLocalData = function(newLocalDataById, localDataBySpId, updateListItemsResult) {
                            for (var i = 0, len = updateListItemsResult.length; i < len; i++) {
                                var resultObj = updateListItemsResult[i];
                                try {
                                    if (resultObj.success) {
                                        var result = newLocalDataById.tryGetValue(resultObj[SharePointSyncAgent.IdProperty]);
                                        if (!result.value)
                                            continue;
                                        var spId = resultObj.id,
                                            localRow = result.outValue;
                                        if (localDataBySpId.containsKey(spId))
                                            return {
                                                    success: !1, message: AppMagic.Strings.SharePointSyncError_UpdateListItemsResponseListWasRecreated, result: null
                                                };
                                        localRow[Services.SharePointSyncWorker.SpIdProperty] = spId
                                    }
                                }
                                catch(e) {
                                    continue
                                }
                            }
                            return {
                                    success: !0, message: null, result: null
                                }
                        }, SharePointSyncAgent.convertUpdateResponseToIMerge = function(updateListItemsResults) {
                            for (var result = [], i = 0, len = updateListItemsResults.length; i < len; i++) {
                                var listItemResult = {
                                        success: !0, id: updateListItemsResults[i].Id
                                    };
                                listItemResult[SharePointSyncAgent.IdProperty] = updateListItemsResults[i][SharePointSyncAgent.IdProperty];
                                result.push(listItemResult)
                            }
                            return result
                        }, SharePointSyncAgent.SpIdProperty = AppMagic.Constants.Services.SpIdProperty, SharePointSyncAgent.SyncVersionProperty = AppMagic.Constants.Services.VERSION_PROPERTY, SharePointSyncAgent.IdProperty = AppMagic.Constants.Services.ID_PROPERTY, SharePointSyncAgent.IdFieldName = "ID", SharePointSyncAgent.UpdateListItemsCmd_New = "New", SharePointSyncAgent.UpdateListItemsCmd_Update = "Update", SharePointSyncAgent.UpdateListItemsCmd_Delete = "Delete", SharePointSyncAgent.ReservedKeys = [SharePointSyncAgent.SpIdProperty, SharePointSyncAgent.SyncVersionProperty, SharePointSyncAgent.IdProperty], SharePointSyncAgent
            }();
        Services.SharePointSyncAgent = SharePointSyncAgent
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var Dictionary = Collections.Generic.Dictionary,
            SyncAndResolveInfo = function() {
                function SyncAndResolveInfo(){}
                return SyncAndResolveInfo
            }();
        Services.SyncAndResolveInfo = SyncAndResolveInfo;
        var RowDiff = function() {
                function RowDiff(){}
                return RowDiff
            }();
        Services.RowDiff = RowDiff;
        var Field = function() {
                function Field(){}
                return Field
            }();
        Services.Field = Field,
        function(SharePointType) {
            SharePointType[SharePointType.DateTime = 0] = "DateTime";
            SharePointType[SharePointType.Currency = 1] = "Currency";
            SharePointType[SharePointType.Url = 2] = "Url";
            SharePointType[SharePointType.Number = 3] = "Number";
            SharePointType[SharePointType.Integer = 4] = "Integer";
            SharePointType[SharePointType.Text = 5] = "Text";
            SharePointType[SharePointType.Note = 6] = "Note";
            SharePointType[SharePointType.Choice = 7] = "Choice";
            SharePointType[SharePointType.LookUp = 8] = "LookUp";
            SharePointType[SharePointType.Boolean = 9] = "Boolean"
        }(Services.SharePointType || (Services.SharePointType = {}));
        var SharePointType = Services.SharePointType,
            ListSchemaItem = function() {
                function ListSchemaItem(){}
                return ListSchemaItem
            }();
        Services.ListSchemaItem = ListSchemaItem;
        var ProcessListSchemaResult = function() {
                function ProcessListSchemaResult(){}
                return ProcessListSchemaResult
            }();
        Services.ProcessListSchemaResult = ProcessListSchemaResult;
        var Method = function() {
                function Method(){}
                return Method
            }();
        Services.Method = Method;
        var SharePointSyncWorker = function() {
                function SharePointSyncWorker(){}
                return SharePointSyncWorker.getUnreservedKeys = function(obj) {
                        return Object.keys(obj).filter(function(key) {
                                return SharePointSyncWorker.ReservedKeys.indexOf(key) < 0
                            })
                    }, SharePointSyncWorker.sharePointTypeToDType = function(sharePointType) {
                        switch (sharePointType.toLowerCase()) {
                            case SharePointSyncWorker.SharePointColumnType_AllDayEvent:
                            case SharePointSyncWorker.SharePointColumnType_Recurrence:
                            case SharePointSyncWorker.SharePointColumnType_Boolean:
                                return {
                                        dtype: AppMagic.Schema.TypeBoolean, sharePointType: 9
                                    };
                            case SharePointSyncWorker.SharePointColumnType_MultiChoice:
                            case SharePointSyncWorker.SharePointColumnType_GridChoice:
                            case SharePointSyncWorker.SharePointColumnType_Choice:
                                return {
                                        dtype: AppMagic.Schema.TypeString, sharePointType: 7
                                    };
                            case SharePointSyncWorker.SharePointColumnType_Currency:
                                return {
                                        dtype: AppMagic.Schema.TypeCurrency, sharePointType: 1
                                    };
                            case SharePointSyncWorker.SharePointColumnType_DateTime:
                                return {
                                        dtype: AppMagic.Schema.TypeDateTime, sharePointType: 0
                                    };
                            case SharePointSyncWorker.SharePointColumnType_LookUp:
                                return {
                                        dtype: AppMagic.Schema.TypeString, sharePointType: 8
                                    };
                            case SharePointSyncWorker.SharePointColumnType_Note:
                                return {
                                        dtype: AppMagic.Schema.TypeString, sharePointType: 6
                                    };
                            case SharePointSyncWorker.SharePointColumnType_Number:
                                return {
                                        dtype: AppMagic.Schema.TypeNumber, sharePointType: 3
                                    };
                            case SharePointSyncWorker.SharePointColumnType_Integer:
                                return {
                                        dtype: AppMagic.Schema.TypeNumber, sharePointType: 4
                                    };
                            case SharePointSyncWorker.SharePointColumnType_Url:
                                return {
                                        dtype: AppMagic.Schema.TypeHyperlink, sharePointType: 2
                                    };
                            case SharePointSyncWorker.SharePointColumnType_Calculated:
                            case SharePointSyncWorker.SharePointColumnType_Computed:
                            case SharePointSyncWorker.SharePointColumnType_User:
                            case SharePointSyncWorker.SharePointColumnType_UserMulti:
                            case SharePointSyncWorker.SharePointColumnType_Facilities:
                            case SharePointSyncWorker.SharePointColumnType_FreeBusy:
                            case SharePointSyncWorker.SharePointColumnType_Overbook:
                            case SharePointSyncWorker.SharePointColumnType_Counter:
                            case SharePointSyncWorker.SharePointColumnType_File:
                            case SharePointSyncWorker.SharePointColumnType_LayoutVariationsField:
                            case SharePointSyncWorker.SharePointColumnType_Guid:
                            case SharePointSyncWorker.SharePointColumnType_TargetTo:
                            case SharePointSyncWorker.SharePointColumnType_Html:
                            case SharePointSyncWorker.SharePointColumnType_CrossProjectLink:
                            case SharePointSyncWorker.SharePointColumnType_LookUpMulti:
                            case SharePointSyncWorker.SharePointColumnType_Text:
                            case SharePointSyncWorker.SharePointColumnType_PublishingScheduleStartDateFieldType:
                            case SharePointSyncWorker.SharePointColumnType_PublishingScheduleEndDateFieldType:
                            case SharePointSyncWorker.SharePointColumnType_BusinessData:
                                return {
                                        dtype: AppMagic.Schema.TypeString, sharePointType: 5
                                    };
                            default:
                                return {
                                        dtype: AppMagic.Schema.TypeString, sharePointType: 5
                                    }
                        }
                    }, SharePointSyncWorker.dValueToSharePointValue = function(value, sharePointType) {
                            switch (sharePointType) {
                                case 9:
                                    return value ? SharePointSyncWorker.SharePointBooleanValue_True : SharePointSyncWorker.SharePointBooleanValue_False;
                                    break;
                                case 0:
                                    var d = new Date;
                                    d.setTime(value);
                                    var isoString = d.toISOString();
                                    return isoString.substring(0, 10) + " " + isoString.substring(11, 19);
                                case 1:
                                case 3:
                                case 4:
                                    return value.toString();
                                case 7:
                                case 8:
                                case 6:
                                case 5:
                                case 2:
                                    return value;
                                default:
                                    return value
                            }
                        }, SharePointSyncWorker.sharePointValueToDValue = function(value, dtype) {
                            switch (dtype) {
                                case AppMagic.Schema.TypeBoolean:
                                    return value === SharePointSyncWorker.SharePointBooleanValue_True;
                                case AppMagic.Schema.TypeDateTime:
                                    var dateMatch = value.match(/^(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)$/);
                                    if (dateMatch === null)
                                        return null;
                                    var utcTimeValues = dateMatch.splice(1);
                                    return utcTimeValues[1] = (parseInt(utcTimeValues[1]) - 1).toString(), Date.UTC.apply(null, utcTimeValues);
                                case AppMagic.Schema.TypeCurrency:
                                case AppMagic.Schema.TypeNumber:
                                    return parseFloat(value);
                                case AppMagic.Schema.TypeHyperlink:
                                    var urls = value.split(",");
                                    return urls.length > 0 ? urls[0].trim() : value;
                                case AppMagic.Schema.TypeString:
                                    return value;
                                default:
                                    return value
                            }
                        }, SharePointSyncWorker.prototype.syncAndResolve = function(syncAndResolveInfo) {
                            return SharePointSyncWorker.getList(syncAndResolveInfo.configuration.siteUri, syncAndResolveInfo.configuration.listName).then(function(getListSchemaResponse) {
                                    if (!getListSchemaResponse.success)
                                        return WinJS.Promise.wrap(getListSchemaResponse);
                                    var processedListSchemaResponse = SharePointSyncWorker.getFieldsFromListSchema(getListSchemaResponse.result);
                                    return processedListSchemaResponse.success ? SharePointSyncWorker.updateListItemsAndComputeNewWorkspace(syncAndResolveInfo.configuration.siteUri, syncAndResolveInfo.configuration.listName, syncAndResolveInfo.workspaceData, syncAndResolveInfo.localData, processedListSchemaResponse.result, SharePointSyncWorker.UpdateListItems_MaxBatchSize) : WinJS.Promise.wrap(processedListSchemaResponse)
                                }, function(error) {
                                    throw error;
                                })
                        }, SharePointSyncWorker.updateListItemsAndComputeNewWorkspace = function(siteUri, listName, workspaceData, localData, listSchema, maxBatchSize) {
                            var updateMethods = SharePointSyncWorker.buildUpdateListItemsMethods(workspaceData, localData, listSchema);
                            if (updateMethods.length > 0) {
                                for (var numberOfBatches = Math.ceil(updateMethods.length / maxBatchSize), updateResponses = new Array(numberOfBatches), chainedUpdatesPromise = WinJS.Promise.wrap(), i = 0, len = numberOfBatches; i < len; i++)
                                    (function() {
                                        var index = i,
                                            methodBatch = updateMethods.splice(0, maxBatchSize);
                                        chainedUpdatesPromise = chainedUpdatesPromise.then(function() {
                                            return SharePointSyncWorker.updateListItems(siteUri, listName, methodBatch)
                                        }).then(function(updateListItemsResponse) {
                                            return updateResponses[index] = updateListItemsResponse, WinJS.Promise.wrap()
                                        })
                                    })();
                                var newLocalDataById = new Dictionary,
                                    localDataBySpId = new Dictionary;
                                return localData.forEach(function(datum) {
                                        var spId = datum[SharePointSyncWorker.SpIdProperty];
                                        if (typeof spId != "undefined")
                                            localDataBySpId.setValue(spId.toString(), datum);
                                        else {
                                            var id = datum[SharePointSyncWorker.IdProperty].toString();
                                            newLocalDataById.setValue(id, datum)
                                        }
                                    }), chainedUpdatesPromise.then(function() {
                                        var updateResults = updateResponses.filter(function(updateResponse) {
                                                return updateResponse.success
                                            }).map(function(updateResponse) {
                                                return updateResponse.result
                                            });
                                        return SharePointSyncWorker.mergeUpdateListItemsResponsesIntoLocalData(localData, updateResults), SharePointSyncWorker.getListItemsAndComputeNewWorkspace(siteUri, listName, listSchema, localData)
                                    })
                            }
                            else
                                return SharePointSyncWorker.getListItemsAndComputeNewWorkspace(siteUri, listName, listSchema, localData)
                        }, SharePointSyncWorker.getListItemsAndComputeNewWorkspace = function(siteUri, listName, listSchema, localData) {
                            return SharePointSyncWorker.getListItems(siteUri, listName).then(function(getListItemsResponse) {
                                    if (!getListItemsResponse.success)
                                        return WinJS.Promise.wrap(getListItemsResponse);
                                    var processedlistItemsResponse = SharePointSyncWorker.processGetListItemsResponse(listSchema, getListItemsResponse.result);
                                    return processedlistItemsResponse.success ? (SharePointSyncWorker.mergeServerDataIntoLocalData(localData, processedlistItemsResponse.result), WinJS.Promise.wrap({
                                            success: !0, message: null, result: localData
                                        })) : WinJS.Promise.wrap(processedlistItemsResponse)
                                })
                        }, SharePointSyncWorker.processListItem = function(listSchema, listItem) {
                            var attributes = listItem.$attributes;
                            if (typeof attributes == "undefined" || typeof attributes[SharePointSyncWorker.RowAttribute_OwsId] != "string")
                                return null;
                            var spId = parseInt(attributes[SharePointSyncWorker.RowAttribute_OwsId]);
                            if (!isFinite(spId))
                                return null;
                            for (var row = Object.create(null), i = 0, len = listSchema.length; i < len; i++) {
                                var listSchemaItem = listSchema[i],
                                    attributeName = SharePointSyncWorker.RowAttributePrefix_Ows + listSchemaItem.internalName,
                                    attributeValue = attributes[attributeName];
                                typeof attributeValue == "string" && (row[listSchemaItem.displayName] = SharePointSyncWorker.sharePointValueToDValue(attributeValue, listSchemaItem.dtype))
                            }
                            return row[SharePointSyncWorker.SpIdProperty] = spId, row
                        }, SharePointSyncWorker.processGetListItemsResponse = function(listSchema, xmlResponseAsJson) {
                            var rows = [];
                            try {
                                var data = AppMagic.Utility.getJsonValueViaJsonPointer(xmlResponseAsJson, "/soap:Body/GetListItemsResponse/GetListItemsResult/listitems/rs:data"),
                                    itemCount = parseInt(data.$attributes.ItemCount, 10);
                                if (!isFinite(itemCount))
                                    throw new Error;
                                if (itemCount > 0) {
                                    if (typeof data["z:row"] == "undefined")
                                        throw new Error;
                                    for (var listItems = data["z:row"] instanceof Array ? data["z:row"] : [data["z:row"]], i = 0, len = listItems.length; i < len; i++) {
                                        var row = SharePointSyncWorker.processListItem(listSchema, listItems[i]);
                                        row !== null && rows.push(row)
                                    }
                                }
                            }
                            catch(e) {
                                return {
                                        success: !1, message: AppMagic.Strings.SharePointSyncError_ListItemHasInvalidFormat, result: null
                                    }
                            }
                            return {
                                    success: !0, message: null, result: rows
                                }
                        }, SharePointSyncWorker.mergeUpdateListItemsResponsesIntoLocalData = function(localData, updateListItemsResults) {
                            var newLocalDataById = new Dictionary,
                                localDataBySpId = new Dictionary;
                            localData.forEach(function(datum) {
                                var spId = datum[SharePointSyncWorker.SpIdProperty];
                                if (typeof spId != "undefined")
                                    localDataBySpId.setValue(spId.toString(), datum);
                                else {
                                    var id = datum[SharePointSyncWorker.IdProperty].toString();
                                    newLocalDataById.setValue(id, datum)
                                }
                            });
                            for (var i = 0, len = updateListItemsResults.length; i < len; i++) {
                                var updateListItemsResult = updateListItemsResults[i],
                                    mergeResult = SharePointSyncWorker.mergeUpdateListItemsResponseIntoLocalData(newLocalDataById, localDataBySpId, updateListItemsResult);
                                if (!mergeResult.success && mergeResult.message === AppMagic.Strings.SharePointSyncError_UpdateListItemsResponseListWasRecreated) {
                                    localData.splice(0, localData.length);
                                    break
                                }
                            }
                        }, SharePointSyncWorker.mergeUpdateListItemsResponseIntoLocalData = function(newLocalDataById, localDataBySpId, updateListItemsResult) {
                            var resultArray;
                            if (resultArray = AppMagic.Utility.getJsonValueViaJsonPointer(updateListItemsResult, "/soap:Body/UpdateListItemsResponse/UpdateListItemsResult/Results/Result"), typeof resultArray != "object" || resultArray === null)
                                return {
                                        success: !1, message: AppMagic.Strings.SharePointSyncError_UpdateListItemsResponseHasNoResults, result: null
                                    };
                            resultArray = resultArray instanceof Array ? resultArray : [resultArray];
                            for (var i = 0, len = resultArray.length; i < len; i++) {
                                var resultObj = resultArray[i];
                                try {
                                    var resultId = AppMagic.Utility.getJsonValueViaJsonPointer(resultObj, "/$attributes/ID"),
                                        resultIdMatch = resultId.match("^(.+),New$");
                                    if (resultIdMatch !== null) {
                                        var errorCodeStr = AppMagic.Utility.getJsonValueViaJsonPointer(resultObj, "/ErrorCode/$text");
                                        if (errorCodeStr === SharePointSyncWorker.UpdateListItemsResponseCode_Success) {
                                            var result = newLocalDataById.tryGetValue(resultIdMatch[1]);
                                            if (!result.value)
                                                continue;
                                            var spId = AppMagic.Utility.getJsonValueViaJsonPointer(resultObj, "/z:row/$attributes/ows_ID");
                                            var localRow = result.outValue;
                                            if (localDataBySpId.containsKey(spId))
                                                return {
                                                        success: !1, message: AppMagic.Strings.SharePointSyncError_UpdateListItemsResponseListWasRecreated, result: null
                                                    };
                                            var spIdNumValue = parseInt(spId);
                                            if (!isFinite(spIdNumValue))
                                                continue;
                                            localRow[SharePointSyncWorker.SpIdProperty] = spIdNumValue
                                        }
                                    }
                                }
                                catch(e) {
                                    continue
                                }
                            }
                            return {
                                    success: !0, message: null, result: null
                                }
                        }, SharePointSyncWorker.mergeServerDataIntoLocalData = function(localData, serverData) {
                            var serverDataBySpId = new Dictionary;
                            serverData.forEach(function(row) {
                                serverDataBySpId.setValue(row[SharePointSyncWorker.SpIdProperty].toString(), row)
                            });
                            var localDataBySpId = new Dictionary,
                                localDataById = new Dictionary;
                            localData.forEach(function(row) {
                                localDataById.setValue(row[SharePointSyncWorker.IdProperty].toString(), row);
                                var spId = row[SharePointSyncWorker.SpIdProperty];
                                typeof spId != "undefined" && localDataBySpId.setValue(spId.toString(), row)
                            });
                            for (var diffs = SharePointSyncWorker.computeTableDifferences(serverDataBySpId, localDataById, localDataBySpId), i = localData.length - 1; i >= 0; i--) {
                                var localDatum = localData[i],
                                    spId,
                                    spIdNumValue = localDatum[SharePointSyncWorker.SpIdProperty];
                                if (typeof spIdNumValue != "undefined" && (spId = spIdNumValue.toString(), !serverDataBySpId.containsKey(spId))) {
                                    localData.splice(i, 1);
                                    continue
                                }
                                var rowId = localDatum[SharePointSyncWorker.IdProperty].toString();
                                if (!diffs.addSet.containsKey(rowId) && diffs.editSet.containsKey(spId)) {
                                    var edit = diffs.editSet.getValue(spId),
                                        serverDatum = serverDataBySpId.getValue(spId);
                                    edit.addSet.keys.forEach(function(key) {
                                        delete localDatum[key]
                                    });
                                    edit.editSet.keys.forEach(function(key) {
                                        localDatum[key] = serverDatum[key]
                                    });
                                    edit.deleteSet.keys.forEach(function(key) {
                                        localDatum[key] = serverDatum[key]
                                    });
                                    delete localDatum[SharePointSyncWorker.IdProperty]
                                }
                            }
                            diffs.deleteSet.keys.forEach(function(spId) {
                                var serverDatum = serverDataBySpId.getValue(spId);
                                localData.push(AppMagic.Utility.jsonClone(serverDatum))
                            })
                        }, SharePointSyncWorker.buildUpdateListItemsMethods = function(workspaceData, localData, listSchema) {
                            var workspaceDataBySpId = new Dictionary;
                            workspaceData.forEach(function(row) {
                                workspaceDataBySpId.setValue(row[SharePointSyncWorker.SpIdProperty].toString(), row)
                            });
                            var localDataBySpId = new Dictionary,
                                localDataById = new Dictionary;
                            localData.forEach(function(row) {
                                localDataById.setValue(row[SharePointSyncWorker.IdProperty].toString(), row);
                                var spId = row[SharePointSyncWorker.SpIdProperty];
                                typeof spId != "undefined" && localDataBySpId.setValue(spId.toString(), row)
                            });
                            var tableDiffs = SharePointSyncWorker.computeTableDifferences(workspaceDataBySpId, localDataById, localDataBySpId),
                                schemaByDisplayNames = new Dictionary;
                            listSchema.forEach(function(field) {
                                schemaByDisplayNames.setValue(field.displayName, field)
                            });
                            for (var methods = [], addSetRowIds = tableDiffs.addSet.keys, i = 0, len = addSetRowIds.length; i < len; i++) {
                                for (var id = addSetRowIds[i], addedRow = tableDiffs.addSet.getValue(id), fieldValuesByInternalName = new Dictionary, unreservedKeys = SharePointSyncWorker.getUnreservedKeys(addedRow), j = 0, jlen = unreservedKeys.length; j < jlen; j++) {
                                    var displayName = unreservedKeys[j];
                                    if (schemaByDisplayNames.containsKey(displayName)) {
                                        var schemaItem = schemaByDisplayNames.getValue(displayName),
                                            dValue = addedRow[unreservedKeys[j]];
                                        if (dValue !== null) {
                                            var sharePointValue = SharePointSyncWorker.dValueToSharePointValue(dValue, schemaItem.sharePointType);
                                            fieldValuesByInternalName.setValue(schemaItem.internalName, sharePointValue)
                                        }
                                    }
                                }
                                var method = SharePointSyncWorker.buildMethodNode(id, SharePointSyncWorker.UpdateListItemsCmd_New, fieldValuesByInternalName);
                                methods.push(method)
                            }
                            for (var deleteSetSpIds = tableDiffs.deleteSet.keys, i = 0, len = deleteSetSpIds.length; i < len; i++) {
                                var spId = deleteSetSpIds[i],
                                    id = workspaceDataBySpId.getValue(spId)[SharePointSyncWorker.IdProperty].toString(),
                                    fieldValuesByInternalName = new Dictionary;
                                fieldValuesByInternalName.setValue(SharePointSyncWorker.IdFieldName, spId);
                                var method = SharePointSyncWorker.buildMethodNode(id, SharePointSyncWorker.UpdateListItemsCmd_Delete, fieldValuesByInternalName);
                                methods.push(method)
                            }
                            for (var editSetSpIds = tableDiffs.editSet.keys, i = 0, len = editSetSpIds.length; i < len; i++) {
                                var spId = editSetSpIds[i],
                                    rowDiff = tableDiffs.editSet.getValue(spId),
                                    editedRow = localDataBySpId.getValue(spId),
                                    id = editedRow[SharePointSyncWorker.IdProperty].toString(),
                                    fieldValuesByInternalName = new Dictionary;
                                rowDiff.addSet.keys.concat(rowDiff.editSet.keys).forEach(function(key) {
                                    var dValue = editedRow[key],
                                        schemaItem = schemaByDisplayNames.getValue(key),
                                        sharePointValue = dValue === null ? "" : SharePointSyncWorker.dValueToSharePointValue(dValue, schemaItem.sharePointType);
                                    fieldValuesByInternalName.setValue(schemaItem.internalName, sharePointValue)
                                });
                                rowDiff.deleteSet.keys.forEach(function(key) {
                                    var schemaItem = schemaByDisplayNames.getValue(key);
                                    fieldValuesByInternalName.setValue(schemaItem.internalName, "")
                                });
                                fieldValuesByInternalName.setValue(SharePointSyncWorker.IdFieldName, spId);
                                var method = SharePointSyncWorker.buildMethodNode(id, SharePointSyncWorker.UpdateListItemsCmd_Update, fieldValuesByInternalName);
                                methods.push(method)
                            }
                            return methods
                        }, SharePointSyncWorker.getFieldsFromListSchema = function(getListSchemaJson) {
                            var fields = AppMagic.Utility.getJsonValueViaJsonPointer(getListSchemaJson, "/soap:Body/GetListResponse/GetListResult/List/Fields/Field");
                            if (!(fields instanceof Array))
                                return {
                                        success: !1, message: AppMagic.Strings.SharePointSyncError_GetListResponseMissingFields, result: null
                                    };
                            for (var excludeByType = ["Attachments", "Content Type", "ContentTypeId", "ContentTypeIdFieldType", ], excludeByInternalName = ["ContentType", ], filteredFields = [], i = 0, len = fields.length; i < len; i++) {
                                var field = fields[i],
                                    hidden,
                                    readOnly,
                                    displayName,
                                    internalName,
                                    dtype,
                                    sharePointType;
                                try {
                                    var attributes = field.$attributes;
                                    readOnly = attributes.ReadOnly;
                                    typeof readOnly == "string" && (readOnly = readOnly.toLowerCase());
                                    hidden = attributes.Hidden;
                                    typeof hidden == "string" && (hidden = hidden.toLowerCase());
                                    displayName = attributes.DisplayName;
                                    internalName = attributes.Name;
                                    var typeAttributeValue = attributes.Type;
                                    if (typeof displayName != "string" || typeof internalName != "string" || typeof typeAttributeValue != "string")
                                        throw new Error;
                                    if (hidden === "true" || readOnly === "true" || excludeByType.indexOf(typeAttributeValue) >= 0 || excludeByInternalName.indexOf(internalName) >= 0)
                                        continue;
                                    var type = SharePointSyncWorker.sharePointTypeToDType(typeAttributeValue);
                                    dtype = type.dtype;
                                    sharePointType = type.sharePointType
                                }
                                catch(e) {
                                    return {
                                            success: !1, message: AppMagic.Strings.SharePointSyncError_GetListResponseHasMalformedField, result: null
                                        }
                                }
                                filteredFields.push({
                                    displayName: displayName, internalName: internalName, dtype: dtype, sharePointType: sharePointType
                                })
                            }
                            return {
                                    success: !0, message: null, result: filteredFields
                                }
                        }, SharePointSyncWorker.buildMethodNode = function(methodId, cmd, fieldValuesByInternalName) {
                            for (var keys = fieldValuesByInternalName.keys, fields = new Array(keys.length), i = 0, len = keys.length; i < len; i++) {
                                var key = keys[i];
                                fields[i] = {
                                    $name: "Field", $attributes: {Name: key}, $text: fieldValuesByInternalName.getValue(key)
                                }
                            }
                            return {
                                    $name: "Method", $attributes: {
                                            ID: methodId, Cmd: cmd
                                        }, Field: fields
                                }
                        }, SharePointSyncWorker.computeTableDifferences = function(originalDataBySpId, modifiedDataById, modifiedDataBySpId) {
                            var addSet = new Dictionary;
                            modifiedDataById.keys.forEach(function(key) {
                                var datum = modifiedDataById.getValue(key),
                                    spId = datum[SharePointSyncWorker.SpIdProperty];
                                if (typeof spId == "undefined") {
                                    var id = datum[SharePointSyncWorker.IdProperty];
                                    addSet.setValue(id.toString(), datum)
                                }
                            });
                            for (var editSet = new Dictionary, deleteSet = new Dictionary, oriSpIds = originalDataBySpId.keys, i = 0, len = oriSpIds.length; i < len; i++) {
                                var spId = oriSpIds[i];
                                if (modifiedDataBySpId.containsKey(spId)) {
                                    var modDataRow = modifiedDataBySpId.getValue(spId),
                                        oriDataRow = originalDataBySpId.getValue(spId),
                                        rowDiff = SharePointSyncWorker.computeRowDifferences(oriDataRow, modDataRow);
                                    (rowDiff.addSet.count > 0 || rowDiff.deleteSet.count > 0 || rowDiff.editSet.count > 0) && editSet.setValue(spId, rowDiff)
                                }
                                else
                                    deleteSet.setValue(spId, !0)
                            }
                            return {
                                    addSet: addSet, editSet: editSet, deleteSet: deleteSet
                                }
                        }, SharePointSyncWorker.computeRowDifferences = function(row0, row1) {
                            var unreservedKeys0 = SharePointSyncWorker.getUnreservedKeys(row0),
                                newUnreservedKeys1 = SharePointSyncWorker.getUnreservedKeys(row1),
                                addSet = new Dictionary,
                                editSet = new Dictionary,
                                deleteSet = new Dictionary;
                            newUnreservedKeys1.forEach(function(key) {
                                addSet.setValue(key, !0)
                            });
                            for (var i = 0, len = unreservedKeys0.length; i < len; i++) {
                                var key0 = unreservedKeys0[i],
                                    cell1 = row1[key0];
                                typeof cell1 != "undefined" ? (row0[key0] !== cell1 && editSet.setValue(key0, !0), addSet.deleteValue(key0)) : deleteSet.setValue(key0, !0)
                            }
                            return {
                                    addSet: addSet, editSet: editSet, deleteSet: deleteSet
                                }
                        }, SharePointSyncWorker.createListChannel = function(siteUri, action, contentLength) {
                            return new Services.Channel(siteUri).path("_vti_bin").path("Lists.asmx").header("Content-Type", "text/xml; charset=utf-8").header("Content-Length", contentLength.toString()).header("SOAPAction", action)
                        }, SharePointSyncWorker.updateListItems = function(siteUri, listName, updateMethods) {
                            var updatesNode = {
                                    $name: "updates", Batch: {
                                            $name: "Batch", $attributes: {OnError: "Continue"}, Method: updateMethods
                                        }
                                },
                                listNameNode = SharePointSyncWorker.createSharePointListNameNode(listName),
                                functionNode = SharePointSyncWorker.createSharePointFunctionNode(SharePointSyncWorker.SoapFunctionName_UpdateListItems);
                            functionNode.listName = listNameNode;
                            functionNode.updates = updatesNode;
                            var soapPackage = SharePointSyncWorker.createSoapPackage([functionNode]);
                            return SharePointSyncWorker.sendSoapPackage(siteUri, SharePointSyncWorker.SoapActionName_UpdateListItems, soapPackage)
                        }, SharePointSyncWorker.getListItems = function(siteUri, listName) {
                            var listNameNode = SharePointSyncWorker.createSharePointListNameNode(listName),
                                functionNode = SharePointSyncWorker.createSharePointFunctionNode(SharePointSyncWorker.SoapFunctionName_GetListItems);
                            functionNode.listName = listNameNode;
                            functionNode.rowLimit = {
                                $name: "rowLimit", $text: SharePointSyncWorker.GetListItems_RowLimit
                            };
                            var soapPackage = SharePointSyncWorker.createSoapPackage([functionNode]);
                            return SharePointSyncWorker.sendSoapPackage(siteUri, SharePointSyncWorker.SoapActionName_GetListItems, soapPackage)
                        }, SharePointSyncWorker.getList = function(siteUri, listName) {
                            var listNameNode = SharePointSyncWorker.createSharePointListNameNode(listName),
                                functionNode = SharePointSyncWorker.createSharePointFunctionNode(SharePointSyncWorker.SoapFunctionName_GetList);
                            functionNode.listName = listNameNode;
                            var soapPackage = SharePointSyncWorker.createSoapPackage([functionNode]);
                            return SharePointSyncWorker.sendSoapPackage(siteUri, SharePointSyncWorker.SoapActionName_GetList, soapPackage)
                        }, SharePointSyncWorker.sendSoapPackage = function(siteUri, actionName, soapPackage) {
                            var clen = soapPackage.length;
                            return SharePointSyncWorker.createListChannel(siteUri, actionName, clen).send("POST", soapPackage).then(function(response) {
                                    var responseText = response.responseText,
                                        json;
                                    try {
                                        json = AppMagic.Services.xml2json(responseText)
                                    }
                                    catch(e) {
                                        return WinJS.Promise.wrap({
                                                success: !1, message: AppMagic.Strings.SharePointSyncError_ServerResponseHasMalformedXml, result: null
                                            })
                                    }
                                    return WinJS.Promise.wrap({
                                            success: !0, message: null, result: json
                                        })
                                }, function(response) {
                                    return WinJS.Promise.wrap({
                                            success: !1, message: AppMagic.Strings.SharePointSyncError_UnableToReachServer, result: null
                                        })
                                })
                        }, SharePointSyncWorker.createSharePointFunctionNode = function(fnName) {
                            return {
                                    $name: fnName, $ns: {"": SharePointSyncWorker.SharePointSoapNamespace}
                                }
                        }, SharePointSyncWorker.createSharePointListNameNode = function(listName) {
                            return {
                                    $name: "listName", $text: listName
                                }
                        }, SharePointSyncWorker.createSoapPackage = function(xmlBodyContentsAsJson) {
                            for (var body = {$name: "soap:Body"}, i = 0, len = xmlBodyContentsAsJson.length; i < len; i++)
                                body[i] = xmlBodyContentsAsJson[i];
                            var envelope = {
                                    $name: "soap:Envelope", $ns: {
                                            xsi: SharePointSyncWorker.XmlSchemaInstanceNamespace, xsd: SharePointSyncWorker.XmlSchemaNamespace, soap: SharePointSyncWorker.XmlSoapNamespace
                                        }, "soap:Body": body
                                };
                            return AppMagic.Services.json2xml(envelope)
                        }, SharePointSyncWorker.XmlSchemaNamespace = "http://www.w3.org/2001/XMLSchema", SharePointSyncWorker.XmlSchemaInstanceNamespace = "http://www.w3.org/2001/XMLSchema-instance", SharePointSyncWorker.XmlSoapNamespace = "http://schemas.xmlsoap.org/soap/envelope/", SharePointSyncWorker.SharePointSoapNamespace = "http://schemas.microsoft.com/sharepoint/soap/", SharePointSyncWorker.SoapActionName_GetList = "http://schemas.microsoft.com/sharepoint/soap/GetList", SharePointSyncWorker.SoapActionName_GetListItems = "http://schemas.microsoft.com/sharepoint/soap/GetListItems", SharePointSyncWorker.SoapActionName_UpdateListItems = "http://schemas.microsoft.com/sharepoint/soap/UpdateListItems", SharePointSyncWorker.SoapFunctionName_GetList = "GetList", SharePointSyncWorker.SoapFunctionName_GetListItems = "GetListItems", SharePointSyncWorker.SoapFunctionName_UpdateListItems = "UpdateListItems", SharePointSyncWorker.UpdateListItemsCmd_New = "New", SharePointSyncWorker.UpdateListItemsCmd_Update = "Update", SharePointSyncWorker.UpdateListItemsCmd_Delete = "Delete", SharePointSyncWorker.IdFieldName = "ID", SharePointSyncWorker.UpdateListItems_MaxBatchSize = 500, SharePointSyncWorker.UpdateListItemsResponseCode_Success = "0x00000000", SharePointSyncWorker.GetListItems_RowLimit = "5000", SharePointSyncWorker.RowAttributePrefix_Ows = "ows_", SharePointSyncWorker.RowAttribute_OwsId = "ows_ID", SharePointSyncWorker.SpIdProperty = AppMagic.Constants.Services.SpIdProperty, SharePointSyncWorker.SyncVersionProperty = AppMagic.Constants.Services.VERSION_PROPERTY, SharePointSyncWorker.IdProperty = AppMagic.Constants.Services.ID_PROPERTY, SharePointSyncWorker.SharePointColumnType_Boolean = "boolean", SharePointSyncWorker.SharePointColumnType_Choice = "choice", SharePointSyncWorker.SharePointColumnType_MultiChoice = "multichoice", SharePointSyncWorker.SharePointColumnType_GridChoice = "gridchoice", SharePointSyncWorker.SharePointColumnType_Currency = "currency", SharePointSyncWorker.SharePointColumnType_DateTime = "datetime", SharePointSyncWorker.SharePointColumnType_LookUp = "lookup", SharePointSyncWorker.SharePointColumnType_LookUpMulti = "lookupmulti", SharePointSyncWorker.SharePointColumnType_Note = "note", SharePointSyncWorker.SharePointColumnType_Number = "number", SharePointSyncWorker.SharePointColumnType_Integer = "integer", SharePointSyncWorker.SharePointColumnType_Text = "text", SharePointSyncWorker.SharePointColumnType_Url = "url", SharePointSyncWorker.SharePointColumnType_AllDayEvent = "alldayevent", SharePointSyncWorker.SharePointColumnType_Recurrence = "recurrence", SharePointSyncWorker.SharePointColumnType_Attachments = "attachments", SharePointSyncWorker.SharePointColumnType_Calculated = "calculated", SharePointSyncWorker.SharePointColumnType_Computed = "computed", SharePointSyncWorker.SharePointColumnType_User = "user", SharePointSyncWorker.SharePointColumnType_UserMulti = "usermulti", SharePointSyncWorker.SharePointColumnType_Facilities = "facilities", SharePointSyncWorker.SharePointColumnType_FreeBusy = "freebusy", SharePointSyncWorker.SharePointColumnType_Overbook = "overbook", SharePointSyncWorker.SharePointColumnType_Counter = "counter", SharePointSyncWorker.SharePointColumnType_File = "file", SharePointSyncWorker.SharePointColumnType_Guid = "guid", SharePointSyncWorker.SharePointColumnType_TargetTo = "targetto", SharePointSyncWorker.SharePointColumnType_LayoutVariationsField = "layoutvariationsfield", SharePointSyncWorker.SharePointColumnType_Html = "html", SharePointSyncWorker.SharePointColumnType_CrossProjectLink = "crossprojectlink", SharePointSyncWorker.SharePointColumnType_PublishingScheduleStartDateFieldType = "publishingschedulestartdatefieldtype", SharePointSyncWorker.SharePointColumnType_PublishingScheduleEndDateFieldType = "publishingscheduleenddatefieldtype", SharePointSyncWorker.SharePointColumnType_BusinessData = "businessdata", SharePointSyncWorker.SharePointBooleanValue_True = "1", SharePointSyncWorker.SharePointBooleanValue_False = "0", SharePointSyncWorker.ReservedKeys = [SharePointSyncWorker.SpIdProperty, SharePointSyncWorker.SyncVersionProperty, SharePointSyncWorker.IdProperty], SharePointSyncWorker
            }();
        Services.SharePointSyncWorker = SharePointSyncWorker
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var SharePointSyncWorkerController = function() {
                function SharePointSyncWorkerController(dispatcher) {
                    this._workerHandle = dispatcher.createWorker(["AppMagic", "Services", "SharePointSyncWorker"], [])
                }
                return SharePointSyncWorkerController.prototype.synchronize = function(configuration, localData, workspaceData) {
                        var parameters = [{
                                    configuration: configuration, localData: localData, workspaceData: workspaceData
                                }];
                        return this._workerHandle.invokeWorker(SharePointSyncWorkerController.OpName_SyncAndResolve, parameters).then(function(response) {
                                return response.result
                            }, function(error) {
                                throw error;
                            })
                    }, SharePointSyncWorkerController.OpName_SyncAndResolve = "syncAndResolve", SharePointSyncWorkerController
            }();
        Services.SharePointSyncWorkerController = SharePointSyncWorkerController
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var StaticServiceWorker = function() {
                function StaticServiceWorker(serviceCreationInfo) {
                    var _this = this;
                    this._servicesById = new Collections.Generic.Dictionary;
                    serviceCreationInfo.forEach(function(creationInfo) {
                        var ClassCtor = self;
                        creationInfo.classSpecifier.forEach(function(x) {
                            ClassCtor = ClassCtor[x]
                        });
                        _this._servicesById.setValue(creationInfo.id, new ClassCtor)
                    })
                }
                return StaticServiceWorker.prototype.callService = function(callServiceInfo) {
                        var service = this._servicesById.getValue(callServiceInfo.serviceName);
                        return WinJS.Promise.as(service[callServiceInfo.functionName].apply(service, callServiceInfo.payload)).then(function(response) {
                                return response.type === AppMagic.Services.Results.Type.error ? WinJS.Promise.wrap({
                                        success: !1, result: null, message: response.message
                                    }) : WinJS.Promise.wrap({
                                        success: !0, result: response
                                    })
                            }, function(error) {
                                return WinJS.Promise.wrap({
                                        success: !1, result: null, message: ""
                                    })
                            })
                    }, StaticServiceWorker
            }();
        Services.StaticServiceWorker = StaticServiceWorker
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var StaticServiceWorkerController = function() {
                function StaticServiceWorkerController(dispatcher) {
                    this._pendingCalls = [];
                    this._workerHandle = null;
                    this._dispatcher = dispatcher
                }
                return StaticServiceWorkerController.prototype.initialize = function(serviceDefinitions) {
                        var serviceCtorArgs = [],
                            scriptDependencies = [];
                        serviceDefinitions.forEach(function(serviceDefinition) {
                            serviceDefinition.dependencies.forEach(function(x) {
                                scriptDependencies.push(x)
                            });
                            serviceCtorArgs.push({
                                classSpecifier: serviceDefinition.classSpecifier, id: serviceDefinition.id
                            })
                        });
                        this._workerHandle = this._dispatcher.createWorker(["AppMagic", "Services", "StaticServiceWorker"], [serviceCtorArgs], scriptDependencies);
                        this._pendingCalls.forEach(function(call) {
                            call.complete()
                        });
                        this._pendingCalls = null
                    }, StaticServiceWorkerController.prototype._getPendingPromiseIfWorkerNotReady = function() {
                        var _this = this;
                        return this._pendingCalls === null ? WinJS.Promise.wrap() : new WinJS.Promise(function(complete) {
                                _this._pendingCalls.push(complete)
                            })
                    }, StaticServiceWorkerController.prototype.makeServiceCall = function(serviceName, functionName, payload) {
                            var _this = this,
                                parameters = [{
                                        serviceName: serviceName, functionName: functionName, payload: payload
                                    }];
                            return this._getPendingPromiseIfWorkerNotReady().then(function() {
                                    return _this._workerHandle.invokeWorker(StaticServiceWorkerController.OpName_CallService, parameters).then(function(response) {
                                            return response.result
                                        }, function(error) {
                                            throw error;
                                        })
                                })
                        }, StaticServiceWorkerController.OpName_CallService = "callService", StaticServiceWorkerController
            }();
        Services.StaticServiceWorkerController = StaticServiceWorkerController
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var StringFormatExpression = function() {
                function StringFormatExpression(format, argumentExpressions) {
                    this._format = format;
                    this._argumentExpressions = argumentExpressions
                }
                return StringFormatExpression.prototype.computeResultSchema = function(serviceFunction) {
                        return AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeString)
                    }, StringFormatExpression.prototype.isBehaviorOnly = function(serviceFunction) {
                        return this._argumentExpressions.some(function(expr) {
                                return expr.isBehaviorOnly(serviceFunction)
                            })
                    }, StringFormatExpression.prototype.evaluateAsync = function(executionContext) {
                            var _this = this;
                            var argValues = [],
                                anyFailed = !1,
                                firstFailedMessage = null,
                                argValuePromises = this._argumentExpressions.map(function(argExpr, argIdx) {
                                    return argExpr.evaluateAsync(executionContext).then(function(argResult) {
                                            var value;
                                            argResult.success ? value = argResult.value : (anyFailed = !0, firstFailedMessage === null && typeof argResult.message == "string" && (firstFailedMessage = argResult.message), value = null);
                                            argValues[argIdx] = value
                                        })
                                });
                            return WinJS.Promise.join(argValuePromises).then(function() {
                                    if (anyFailed)
                                        return Services.ServiceUtility.createUnsuccessfulValueExpressionResult(firstFailedMessage);
                                    var value = AppMagic.Utility.StringUtility.dotNetStringFormat_format_args(_this._format, argValues);
                                    return Services.ServiceUtility.createSuccessfulValueExpressionResult(value)
                                }).then(Services.ServiceUtility.valueExpressionResultIdentityFunction, Services.ServiceUtility.promiseErrorToValueExpressionResult)
                        }, StringFormatExpression
            }();
        Services.StringFormatExpression = StringFormatExpression
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var StringMessageReader = function() {
                function StringMessageReader(messageText) {
                    this._parseSuccessful = !1;
                    this._headers = new Collections.Generic.Dictionary;
                    this._parseMessageText(messageText)
                }
                return StringMessageReader.prototype._parseMessageText = function(messageText) {
                        var _this = this;
                        var messageBodyBegin;
                        if (messageText.indexOf(StringMessageReader.Newline) === 0)
                            messageBodyBegin = StringMessageReader.Newline.length;
                        else {
                            var lengthOfHeaders = messageText.indexOf(StringMessageReader.Separator);
                            if (lengthOfHeaders < 0)
                                return;
                            var headerText = messageText.substr(0, lengthOfHeaders),
                                headers = headerText.split("\r\n");
                            headers.forEach(function(header) {
                                var headerMatch = header.match("^\\s*([^:\\s]+)\\s*:\\s*(.*)$");
                                headerMatch !== null && _this._headers.setValue(headerMatch[1], headerMatch[2])
                            });
                            messageBodyBegin = lengthOfHeaders + StringMessageReader.Separator.length
                        }
                        this._body = messageText.substr(messageBodyBegin);
                        this._parseSuccessful = !0
                    }, StringMessageReader.prototype.getMessageHeader = function(headerName) {
                        if (!this._parseSuccessful)
                            return null;
                        var getResult = this._headers.tryGetValue(headerName);
                        return getResult.outValue
                    }, StringMessageReader.prototype.getMessageBody = function() {
                            return this._parseSuccessful ? this._body : null
                        }, StringMessageReader.prototype.getMessageHeaderNames = function() {
                            return this._parseSuccessful ? this._headers.keys : null
                        }, StringMessageReader.Newline = "\r\n", StringMessageReader.Separator = "\r\n\r\n", StringMessageReader
            }();
        Services.StringMessageReader = StringMessageReader
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var StringParamValueStringifier = function() {
                function StringParamValueStringifier(){}
                return StringParamValueStringifier.prototype.getStringValue = function(value) {
                        return value
                    }, StringParamValueStringifier
            }();
        Services.StringParamValueStringifier = StringParamValueStringifier
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TableBatchOperation = function() {
                function TableBatchOperation(partitionKey, guidGenerator) {
                    this._partitionKey = partitionKey;
                    this._operations = [];
                    this._guidGenerator = guidGenerator || new AppMagic.Common.DefaultGuidGenerator
                }
                return TableBatchOperation.prototype.addTableOperation = function(operation) {
                        this._operations.push(operation)
                    }, TableBatchOperation.prototype.applyToChannel = function(tableResource, channel) {
                        var _this = this;
                        var batchBoundaryGenerator = new Services.AzureTableBatchBoundaryGenerator(this._guidGenerator),
                            multipartMixedMessage = new Services.MultipartMixedMessage(batchBoundaryGenerator),
                            changesetBoundaryGenerator = new Services.AzureTableChangesetBoundaryGenerator(this._guidGenerator),
                            batch = new Services.MultipartMixedMessage(changesetBoundaryGenerator);
                        this._operations.forEach(function(operation) {
                            var webRequest = operation.getWebRequest(_this._partitionKey, tableResource),
                                applicationHttpMessage = new Services.ApplicationHttpMessage(webRequest);
                            batch.addPart(applicationHttpMessage)
                        });
                        multipartMixedMessage.addPart(batch);
                        multipartMixedMessage.applyToChannel(channel);
                        channel.method("POST");
                        channel.header("x-ms-version", "2014-02-14");
                        channel.header("DataServiceVersion", "3.0;");
                        channel.header("MaxDataServiceVersion", "3.0;NetFx")
                    }, TableBatchOperation
            }();
        Services.TableBatchOperation = TableBatchOperation
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TableBatchOperator = function() {
                function TableBatchOperator(baseUri, tableName, azureChannelCreator) {
                    this._baseUri = baseUri;
                    this._tableName = tableName;
                    this._azureChannelCreator = azureChannelCreator
                }
                return TableBatchOperator.prototype.executeBatch = function(batchOperation) {
                        var channel = this._azureChannelCreator.createBatchChannel(this._tableName),
                            tableResource = this._baseUri + this._azureChannelCreator.getTableResourceRelativeUrl(this._tableName);
                        return batchOperation.applyToChannel(tableResource, channel), channel.sendRequest().then(TableBatchOperator._processExecuteBatchResponse, function(error) {
                                return WinJS.Promise.wrap({
                                        resultCode: 2, failedOperation: -1, failedOperationResultCode: null
                                    })
                            })
                    }, TableBatchOperator._processExecuteBatchResponse = function(response) {
                        var xhrMessageReader = new Services.XmlHttpRequestMessageReader(response);
                        return WinJS.Promise.wrap(TableBatchOperator.processExecuteBatchResponse(xhrMessageReader))
                    }, TableBatchOperator.processExecuteBatchResponse = function(messageReader) {
                            var unsupportedFormatError = TableBatchOperator._createUnsupportedFormatError(),
                                messageParser = new Services.MultipartMixedMessageParser(messageReader),
                                batchResults = messageParser.getParts();
                            if (batchResults === null || batchResults.length !== 1)
                                return unsupportedFormatError;
                            var stringMessageReader = new Services.StringMessageReader(batchResults[0]),
                                stringMessageParser = new Services.MultipartMixedMessageParser(stringMessageReader),
                                changesetResults = stringMessageParser.getParts();
                            if (changesetResults === null)
                                return unsupportedFormatError;
                            var responses = changesetResults.map(TableBatchOperator._getChangesetHttpResponse),
                                someFailedToParse = responses.some(function(x) {
                                    return x === null
                                });
                            if (someFailedToParse)
                                return unsupportedFormatError;
                            if (responses.length === 1 && responses[0].status >= 400)
                                return TableBatchOperator._processFailedChangeset(responses[0]);
                            var processed = responses.map(TableBatchOperator._getEtagFromChangeset),
                                allSucceeded = processed.every(function(x) {
                                    return x !== null
                                });
                            return allSucceeded ? {
                                    resultCode: 0, failedOperation: -1, failedOperationResultCode: null, entityEtags: processed
                                } : unsupportedFormatError
                        }, TableBatchOperator._getChangesetHttpResponse = function(applicationHttpStringMessage) {
                            var httpStringReader = new Services.StringMessageReader(applicationHttpStringMessage),
                                httpStringParser = new Services.ApplicationHttpMessageParser(httpStringReader),
                                headers = httpStringParser.getHeaders(),
                                responseText = httpStringParser.getResponseText(),
                                status = httpStringParser.getStatus();
                            return headers === null || responseText === null || status === null ? null : {
                                    headers: headers, responseText: responseText, status: status
                                }
                        }, TableBatchOperator._processFailedChangeset = function(changesetResponse) {
                            var parseResult = Services.AzureTableFailedChangesetParser.parseChangesetError(changesetResponse.responseText);
                            if (parseResult.failedOperation === -1)
                                return TableBatchOperator._createUnsupportedFormatError();
                            if (changesetResponse.status === Services.AzureTable.HttpResponseCode_412_PreconditionFailed) {
                                var conditionNotMet = Services.AzureTable.isPreconditionNotMet(parseResult.odataErrorCode);
                                if (conditionNotMet)
                                    return {
                                            resultCode: 0, entityEtags: null, failedOperation: parseResult.failedOperation, failedOperationResultCode: 1
                                        }
                            }
                            return {
                                    resultCode: 2, entityEtags: null, failedOperation: -1, failedOperationResultCode: null
                                }
                        }, TableBatchOperator._getEtagFromChangeset = function(changesetResponse) {
                            return 200 <= changesetResponse.status && changesetResponse.status < 300 ? changesetResponse.headers[Services.AzureTable.HttpHeaderName_Etag] || null : null
                        }, TableBatchOperator._createUnsupportedFormatError = function() {
                            return {
                                    resultCode: 5, failedOperation: -1, failedOperationResultCode: null, entityEtags: null
                                }
                        }, TableBatchOperator
            }();
        Services.TableBatchOperator = TableBatchOperator
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TemplateRequestParam = function(_super) {
                __extends(TemplateRequestParam, _super);
                function TemplateRequestParam(pathIndex, paramName, paramValueStringifier, valueExpression) {
                    _super.call(this, paramName, paramValueStringifier, valueExpression);
                    this._pathIndex = pathIndex
                }
                return TemplateRequestParam.prototype._applyStringifiedValue = function(httpRequestBuilder, value) {
                        httpRequestBuilder.addTemplateToPath(this._pathIndex, this._paramName, value)
                    }, TemplateRequestParam
            }(Services.NamedHttpRequestParam);
        Services.TemplateRequestParam = TemplateRequestParam
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypesByPrefixAndName = function() {
                function TypesByPrefixAndName(typesByPrefix) {
                    this._typesByEncodedFullName = TypesByPrefixAndName._computeTypesByEncodedFullName(typesByPrefix)
                }
                return TypesByPrefixAndName.prototype.getTypeDefinition = function(typedDefinition) {
                        var typeDef = typedDefinition.type;
                        if (typeof typeDef == "undefined") {
                            var prefix = typedDefinition.typeref.prefix,
                                typeName = typedDefinition.typeref.name;
                            typeDef = this._typesByEncodedFullName.getValue(prefix, typeName)
                        }
                        return typeDef
                    }, TypesByPrefixAndName.prototype.getType = function(prefix, typeName) {
                        return this._typesByEncodedFullName.getValue(prefix, typeName)
                    }, TypesByPrefixAndName._computeTypesByEncodedFullName = function(typesByPrefix) {
                            var typesByEncodedTypeName = new Collections.Generic.TwoKeyDictionary,
                                prefixes = Object.keys(typesByPrefix);
                            return prefixes.forEach(function(prefix) {
                                    var namespaceDef = typesByPrefix[prefix],
                                        typesByName = namespaceDef.typesbyname,
                                        typeNames = Object.keys(typesByName);
                                    typeNames.forEach(function(typeName) {
                                        var typeDef = typesByName[typeName];
                                        typesByEncodedTypeName.setValue(prefix, typeName, typeDef)
                                    })
                                }), typesByEncodedTypeName
                        }, TypesByPrefixAndName
            }();
        Services.TypesByPrefixAndName = TypesByPrefixAndName
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            (function(ServiceTTypeId) {
                ServiceTTypeId[ServiceTTypeId.JsonBoolean = 0] = "JsonBoolean";
                ServiceTTypeId[ServiceTTypeId.JsonNumber = 1] = "JsonNumber";
                ServiceTTypeId[ServiceTTypeId.JsonString = 2] = "JsonString";
                ServiceTTypeId[ServiceTTypeId.JsonUrlString = 3] = "JsonUrlString";
                ServiceTTypeId[ServiceTTypeId.JsonArray = 4] = "JsonArray";
                ServiceTTypeId[ServiceTTypeId.JsonObject = 5] = "JsonObject";
                ServiceTTypeId[ServiceTTypeId.JsonMapObject = 6] = "JsonMapObject";
                ServiceTTypeId[ServiceTTypeId.JsonBase64Binary = 7] = "JsonBase64Binary";
                ServiceTTypeId[ServiceTTypeId.SampleXmlElement = 8] = "SampleXmlElement";
                ServiceTTypeId[ServiceTTypeId.XmlBoolean = 9] = "XmlBoolean";
                ServiceTTypeId[ServiceTTypeId.XmlNumeric = 10] = "XmlNumeric";
                ServiceTTypeId[ServiceTTypeId.XmlString = 11] = "XmlString";
                ServiceTTypeId[ServiceTTypeId.XmlAnyUri = 12] = "XmlAnyUri"
            })(TypeSystem.ServiceTTypeId || (TypeSystem.ServiceTTypeId = {}));
            var ServiceTTypeId = TypeSystem.ServiceTTypeId;
            TypeSystem.JsonServiceTTypeIds = [0, 1, 2, 3, 5, 4, 6, ];
            TypeSystem.XmlSimpleTypesTTypeIds = [9, 10, 11, 12, ],
            function(NumericXsdType) {
                NumericXsdType[NumericXsdType.Decimal = 0] = "Decimal";
                NumericXsdType[NumericXsdType.Float = 1] = "Float";
                NumericXsdType[NumericXsdType.Double = 2] = "Double";
                NumericXsdType[NumericXsdType.Int = 3] = "Int";
                NumericXsdType[NumericXsdType.Long = 4] = "Long";
                NumericXsdType[NumericXsdType.UnsignedInt = 5] = "UnsignedInt";
                NumericXsdType[NumericXsdType.UnsignedLong = 6] = "UnsignedLong"
            }(TypeSystem.NumericXsdType || (TypeSystem.NumericXsdType = {}));
            var NumericXsdType = TypeSystem.NumericXsdType
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var JsonArrayTType = function() {
                    function JsonArrayTType(itemTTypeRef) {
                        this.TTypeId = 4;
                        this._itemTTypeRef = itemTTypeRef
                    }
                    return Object.defineProperty(JsonArrayTType.prototype, "isRecordDType", {
                            get: function() {
                                return !1
                            }, enumerable: !0, configurable: !0
                        }), JsonArrayTType.prototype.computeDValueSchema = function(maxSchemaDepth) {
                            if (maxSchemaDepth <= 0)
                                return AppMagic.Schema.createSchemaForArrayFromPointer([]);
                            var itemTType = this._itemTTypeRef.getType();
                            var itemSchema = itemTType.computeDValueSchema(itemTType.isRecordDType ? maxSchemaDepth : maxSchemaDepth - 1);
                            if (itemTType.isRecordDType) {
                                var recordSchema = itemSchema;
                                return AppMagic.Schema.createSchemaForArrayFromPointer(recordSchema.ptr)
                            }
                            else
                                return itemSchema.name = JsonArrayTType.ValueColumnName, AppMagic.Schema.createSchemaForArrayFromPointer([itemSchema])
                        }, JsonArrayTType.prototype.convertFromDValue = function(dtable) {
                                var itemTType = this._itemTTypeRef.getType();
                                var itemJsonTType = itemTType;
                                return itemJsonTType.isRecordDType ? this.convertFromDTableOfRecords(dtable, itemJsonTType) : this.convertFromDTableOfValues(dtable, itemJsonTType)
                            }, JsonArrayTType.prototype.convertFromDTableOfValues = function(dtable, valueTType) {
                                return dtable.map(function(dtableRecord) {
                                        return valueTType.convertFromDValue(dtableRecord.Value)
                                    })
                            }, JsonArrayTType.prototype.convertFromDTableOfRecords = function(dtable, recordTType) {
                                var ttype = this._itemTTypeRef.getType();
                                return dtable.map(function(dtableRecord) {
                                        return ttype.convertFromDValue(dtableRecord)
                                    })
                            }, JsonArrayTType.ValueColumnName = "Value", JsonArrayTType
                }();
            TypeSystem.JsonArrayTType = JsonArrayTType
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var JsonBase64BinaryTType = function() {
                    function JsonBase64BinaryTType(mediaType) {
                        this.TTypeId = 7;
                        this._mediaType = mediaType
                    }
                    return Object.defineProperty(JsonBase64BinaryTType.prototype, "isRecordDType", {
                            get: function() {
                                return !1
                            }, enumerable: !0, configurable: !0
                        }), JsonBase64BinaryTType.prototype.computeDValueSchema = function(maxSchemaDepth) {
                            switch (this._mediaType) {
                                case Services.Constants.MediaType.Image:
                                    return AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeImage);
                                default:
                                    return
                            }
                        }, JsonBase64BinaryTType.prototype.convertFromDValue = function(uri) {
                                if (uri === null)
                                    return null;
                                var dataUrlComponents = AppMagic.Utility.UriUtility.parseDataUrlComponents(uri);
                                return dataUrlComponents === null || !dataUrlComponents.isBase64 ? null : dataUrlComponents === null ? null : dataUrlComponents.data
                            }, JsonBase64BinaryTType.prototype.convertToDValue = function(base64Binary) {
                                return AppMagic.Utility.isBase64BinaryString(base64Binary) ? "data:" + this._mediaType + ";base64," + base64Binary : null
                            }, JsonBase64BinaryTType
                }();
            TypeSystem.JsonBase64BinaryTType = JsonBase64BinaryTType
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var JsonBooleanTType = function() {
                    function JsonBooleanTType() {
                        this.TTypeId = 0
                    }
                    return Object.defineProperty(JsonBooleanTType.prototype, "isRecordDType", {
                            get: function() {
                                return !1
                            }, enumerable: !0, configurable: !0
                        }), JsonBooleanTType.prototype.computeDValueSchema = function(maxSchemaDepth) {
                            return AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeBoolean)
                        }, JsonBooleanTType.prototype.convertFromDValue = function(dvalue) {
                                return dvalue
                            }, JsonBooleanTType
                }();
            TypeSystem.JsonBooleanTType = JsonBooleanTType
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var JsonMapObjectTType = function() {
                    function JsonMapObjectTType(keyFieldName, valueFieldName, valueTTypeRef) {
                        this.TTypeId = 6;
                        this._keyFieldName = keyFieldName;
                        this._valueFieldName = valueFieldName;
                        this._valueTTypeRef = valueTTypeRef
                    }
                    return Object.defineProperty(JsonMapObjectTType.prototype, "isRecordDType", {
                            get: function() {
                                return !1
                            }, enumerable: !0, configurable: !0
                        }), JsonMapObjectTType.prototype.computeDValueSchema = function(maxSchemaDepth) {
                            if (maxSchemaDepth <= 0)
                                return AppMagic.Schema.createSchemaForArrayFromPointer([]);
                            var valueTType = this._valueTTypeRef.getType();
                            var valueSchema = valueTType.computeDValueSchema(maxSchemaDepth - 1);
                            valueSchema.name = this._valueFieldName;
                            var ptr = [AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeString, this._keyFieldName), valueSchema];
                            return AppMagic.Schema.createSchemaForArrayFromPointer(ptr)
                        }, JsonMapObjectTType.prototype.convertFromDValue = function(dtable) {
                                var _this = this;
                                var valueTType = this._valueTTypeRef.getType();
                                var tobject = {};
                                return dtable.forEach(function(dtableRecord) {
                                        var key = dtableRecord[_this._keyFieldName];
                                        var dvalue = dtableRecord[_this._valueFieldName],
                                            tvalue = valueTType.convertFromDValue(dvalue);
                                        tobject[key] = tvalue
                                    }), tobject
                            }, JsonMapObjectTType
                }();
            TypeSystem.JsonMapObjectTType = JsonMapObjectTType
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var JsonNumberTType = function() {
                    function JsonNumberTType(xsdType) {
                        this.TTypeId = 1;
                        this._xsdType = xsdType
                    }
                    return Object.defineProperty(JsonNumberTType.prototype, "isRecordDType", {
                            get: function() {
                                return !1
                            }, enumerable: !0, configurable: !0
                        }), JsonNumberTType.prototype.computeDValueSchema = function(maxSchemaDepth) {
                            return AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeNumber)
                        }, JsonNumberTType.prototype.convertFromDValue = function(dvalue) {
                                return this._xsdType !== null ? TypeSystem.XsdUtility.coerceNumberToXsdNumericType(dvalue, this._xsdType) : dvalue
                            }, JsonNumberTType
                }();
            TypeSystem.JsonNumberTType = JsonNumberTType
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var JsonObjectProperty = function() {
                    function JsonObjectProperty(ttypeRef, displayIdx) {
                        this._ttypeRef = ttypeRef;
                        this._displayIdx = displayIdx
                    }
                    return Object.defineProperty(JsonObjectProperty.prototype, "displayIdx", {
                            get: function() {
                                return this._displayIdx
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(JsonObjectProperty.prototype, "ttypeRef", {
                            get: function() {
                                return this._ttypeRef
                            }, enumerable: !0, configurable: !0
                        }), JsonObjectProperty
                }();
            TypeSystem.JsonObjectProperty = JsonObjectProperty;
            var JsonObjectType = function() {
                    function JsonObjectType(properties) {
                        this.TTypeId = 5;
                        this._properties = properties
                    }
                    return Object.defineProperty(JsonObjectType.prototype, "isRecordDType", {
                            get: function() {
                                return !0
                            }, enumerable: !0, configurable: !0
                        }), JsonObjectType.prototype.computeDValueSchema = function(maxSchemaDepth) {
                            var _this = this;
                            if (maxSchemaDepth <= 0)
                                return AppMagic.Schema.createSchemaForObjectFromPointer([]);
                            var propertyNames = Object.keys(this._properties).sort(function(lhsPropertyName, rhsPropertyName) {
                                    var lhs = _this._properties[lhsPropertyName].displayIdx,
                                        rhs = _this._properties[rhsPropertyName].displayIdx;
                                    return lhs - rhs
                                }),
                                propMaxSchemaDepth = maxSchemaDepth - 1,
                                ptr = [];
                            return propertyNames.forEach(function(propName) {
                                    var property = _this._properties[propName],
                                        propTType = property.ttypeRef.getType();
                                    var propSchema = propTType.computeDValueSchema(propMaxSchemaDepth);
                                    propSchema.name = propName;
                                    ptr.push(propSchema)
                                }), AppMagic.Schema.createSchemaForObjectFromPointer(ptr)
                        }, JsonObjectType.prototype.convertFromDValue = function(drecord) {
                                var _this = this;
                                var tobject = {};
                                return Object.keys(this._properties).forEach(function(propName) {
                                        var property = _this._properties[propName],
                                            propTType = property.ttypeRef.getType();
                                        var propDValue = drecord[propName];
                                        if (typeof propDValue != "undefined") {
                                            var propTValue = propTType.convertFromDValue(propDValue);
                                            tobject[propName] = propTValue
                                        }
                                    }), tobject
                            }, JsonObjectType
                }();
            TypeSystem.JsonObjectType = JsonObjectType
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var JsonStringTType = function() {
                    function JsonStringTType() {
                        this.TTypeId = 2
                    }
                    return JsonStringTType.prototype.computeDValueSchema = function(maxSchemaDepth) {
                            return AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeString)
                        }, Object.defineProperty(JsonStringTType.prototype, "isRecordDType", {
                            get: function() {
                                return !1
                            }, enumerable: !0, configurable: !0
                        }), JsonStringTType.prototype.convertFromDValue = function(dvalue) {
                                return dvalue
                            }, JsonStringTType
                }();
            TypeSystem.JsonStringTType = JsonStringTType
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var JsonUrlStringTType = function() {
                    function JsonUrlStringTType(dtype) {
                        this.TTypeId = 3;
                        this._dtype = dtype
                    }
                    return Object.defineProperty(JsonUrlStringTType.prototype, "isRecordDType", {
                            get: function() {
                                return !1
                            }, enumerable: !0, configurable: !0
                        }), JsonUrlStringTType.prototype.computeDValueSchema = function(maxSchemaDepth) {
                            return AppMagic.Schema.createSchemaForSimple(this._dtype)
                        }, JsonUrlStringTType.prototype.convertFromDValue = function(dvalue) {
                                return dvalue
                            }, JsonUrlStringTType
                }();
            TypeSystem.JsonUrlStringTType = JsonUrlStringTType
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var SampleXmlElementTType = function() {
                    function SampleXmlElementTType(sampleXml) {
                        this.TTypeId = 8;
                        this._sampleXml = sampleXml
                    }
                    return Object.defineProperty(SampleXmlElementTType.prototype, "isRecordDType", {
                            get: function() {
                                return !0
                            }, enumerable: !0, configurable: !0
                        }), SampleXmlElementTType.prototype.computeDValueSchema = function(maxSchemaDepth) {
                            var sampleXmlJsonified = AppMagic.Services.xml2json(this._sampleXml),
                                schemaDictionary = AppMagic.Utility.createInferredSchemaFromObject(sampleXmlJsonified);
                            AppMagic.Services.Results.correctSchemaDictionaryAndCreateNameRemapping(schemaDictionary);
                            var propertiesSchema = AppMagic.Utility.flattenSchema(schemaDictionary);
                            return AppMagic.Schema.createSchemaForObjectFromPointer(propertiesSchema)
                        }, SampleXmlElementTType.prototype.convertFromDValue = function(dvalue) {
                                Contracts.check("Not Supported");
                                return
                            }, SampleXmlElementTType
                }();
            TypeSystem.SampleXmlElementTType = SampleXmlElementTType
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var InlinedTType = function() {
                    function InlinedTType(ttype) {
                        this._ttype = ttype
                    }
                    return InlinedTType.prototype.getType = function() {
                            return this._ttype
                        }, InlinedTType
                }();
            TypeSystem.InlinedTType = InlinedTType;
            var LazyTTypeRef = function() {
                    function LazyTTypeRef(typeRef, typesMgr) {
                        this._ttype = null;
                        this._typeRef = typeRef;
                        this._typesMgr = typesMgr
                    }
                    return LazyTTypeRef.prototype.getType = function() {
                            return this._ttype === null && (this._ttype = this._typesMgr.getType(this._typeRef.prefix, this._typeRef.name)), this._ttype
                        }, LazyTTypeRef
                }();
            TypeSystem.LazyTTypeRef = LazyTTypeRef
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var XmlAnyUriTType = function() {
                    function XmlAnyUriTType(dtype) {
                        this.TTypeId = 12;
                        this._dtype = dtype
                    }
                    return Object.defineProperty(XmlAnyUriTType.prototype, "isRecordDType", {
                            get: function() {
                                return !1
                            }, enumerable: !0, configurable: !0
                        }), XmlAnyUriTType.prototype.computeDValueSchema = function(maxSchemaDepth) {
                            return AppMagic.Schema.createSchemaForSimple(this._dtype)
                        }, XmlAnyUriTType.prototype.convertFromDValue = function(dvalue) {
                                Contracts.check("Not Supported");
                                return
                            }, XmlAnyUriTType
                }();
            TypeSystem.XmlAnyUriTType = XmlAnyUriTType
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var XmlBooleanTType = function() {
                    function XmlBooleanTType() {
                        this.TTypeId = 9
                    }
                    return XmlBooleanTType.prototype.computeDValueSchema = function(maxSchemaDepth) {
                            return AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeBoolean)
                        }, Object.defineProperty(XmlBooleanTType.prototype, "isRecordDType", {
                            get: function() {
                                return !1
                            }, enumerable: !0, configurable: !0
                        }), XmlBooleanTType.prototype.convertFromDValue = function(dvalue) {
                                Contracts.check("Not Supported");
                                return
                            }, XmlBooleanTType
                }();
            TypeSystem.XmlBooleanTType = XmlBooleanTType
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var XmlNumericTType = function() {
                    function XmlNumericTType(xsdType) {
                        this.TTypeId = 10;
                        this._xsdType = xsdType
                    }
                    return Object.defineProperty(XmlNumericTType.prototype, "isRecordDType", {
                            get: function() {
                                return !1
                            }, enumerable: !0, configurable: !0
                        }), XmlNumericTType.prototype.computeDValueSchema = function(maxSchemaDepth) {
                            return AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeNumber)
                        }, XmlNumericTType.prototype.convertFromDValue = function(dvalue) {
                                Contracts.check("Not Supported");
                                return
                            }, XmlNumericTType
                }();
            TypeSystem.XmlNumericTType = XmlNumericTType
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var TypeSystem;
        (function(TypeSystem) {
            var XmlStringTType = function() {
                    function XmlStringTType() {
                        this.TTypeId = 11
                    }
                    return XmlStringTType.prototype.computeDValueSchema = function(maxSchemaDepth) {
                            return AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeString)
                        }, Object.defineProperty(XmlStringTType.prototype, "isRecordDType", {
                            get: function() {
                                return !1
                            }, enumerable: !0, configurable: !0
                        }), XmlStringTType.prototype.convertFromDValue = function(dvalue) {
                                Contracts.check("Not Supported");
                                return
                            }, XmlStringTType
                }();
            TypeSystem.XmlStringTType = XmlStringTType
        })(TypeSystem = Services.TypeSystem || (Services.TypeSystem = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Utility;
    (function(Utility) {
        function escapeXmlString(input) {
            return input.replace(/<|>|&|'|"/g, function(char) {
                    switch (char) {
                        case"<":
                            return "&lt;";
                        case">":
                            return "&gt;";
                        case"&":
                            return "&amp;";
                        case"'":
                            return "&#39;";
                        case'"':
                            return "&quot;"
                    }
                    return char
                })
        }
        Utility.escapeXmlString = escapeXmlString;
        function isJsonPointer(jsonPointer) {
            return typeof jsonPointer != "string" ? !1 : jsonPointer === "" ? !0 : jsonPointer[0] === "/" && jsonPointer.match(/~[^01]/) === null
        }
        Utility.isJsonPointer = isJsonPointer;
        function decodeJsonPointerReferenceToken(jsonPointerToken) {
            return jsonPointerToken.replace(/~1/g, "/").replace(/~0/g, "~")
        }
        function parseJsonPointer(jsonPointer) {
            if (!isJsonPointer(jsonPointer))
                throw new Error("Invalid json pointer");
            if (jsonPointer === "")
                return [];
            var result = jsonPointer.split("/");
            return result.splice(0, 1), result.map(decodeJsonPointerReferenceToken)
        }
        Utility.parseJsonPointer = parseJsonPointer;
        function tryPopFirstDecodedReferenceToken(jsonPointer) {
            if (jsonPointer.length == 0)
                return {
                        success: !1, firstToken: null, nextPointer: null
                    };
            var firstToken,
                nextPointer;
            var nextSeparatorIdx = jsonPointer.indexOf("/", 1);
            return nextSeparatorIdx == -1 ? (firstToken = jsonPointer.substr(1), nextPointer = "") : (firstToken = jsonPointer.substr(1, nextSeparatorIdx - 1), nextPointer = jsonPointer.substr(nextSeparatorIdx)), firstToken = decodeJsonPointerReferenceToken(firstToken), {
                        success: !0, firstToken: firstToken, nextPointer: nextPointer
                    }
        }
        Utility.tryPopFirstDecodedReferenceToken = tryPopFirstDecodedReferenceToken;
        function getJsonValueViaJsonPointer(rootJsonValue, jsonPointer) {
            for (var jsonPointerArray = parseJsonPointer(jsonPointer), resultJsonValue = rootJsonValue, i = 0; i < jsonPointerArray.length && typeof resultJsonValue != "undefined"; i++)
                if (resultJsonValue === null) {
                    resultJsonValue = {};
                    resultJsonValue = resultJsonValue.undefined;
                    break
                }
                else
                    resultJsonValue = resultJsonValue[jsonPointerArray[i]];
            return resultJsonValue
        }
        Utility.getJsonValueViaJsonPointer = getJsonValueViaJsonPointer
    })(Utility = AppMagic.Utility || (AppMagic.Utility = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var VariableReferenceExpression = function() {
                function VariableReferenceExpression(variableName) {
                    this._variableName = variableName
                }
                return VariableReferenceExpression.prototype.computeResultSchema = function(serviceFunction, maxSchemaDepth) {
                        var variable = serviceFunction.getVariable(this._variableName);
                        return variable.valueExpression.computeResultSchema(serviceFunction, maxSchemaDepth)
                    }, VariableReferenceExpression.prototype.isBehaviorOnly = function(serviceFunction) {
                        var variable = serviceFunction.getVariable(this._variableName);
                        return variable.valueExpression.isBehaviorOnly(serviceFunction)
                    }, VariableReferenceExpression.prototype.evaluateAsync = function(executionContext) {
                            var result = executionContext.tryGetVariableValue(this._variableName);
                            return result.value ? WinJS.Promise.wrap(Services.ServiceUtility.createSuccessfulValueExpressionResult(result.outValue)) : WinJS.Promise.wrap(Services.ServiceUtility.createUnsuccessfulValueExpressionResult())
                        }, VariableReferenceExpression
            }();
        Services.VariableReferenceExpression = VariableReferenceExpression
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var WebHttpRequest = function() {
                function WebHttpRequest(method, uri) {
                    this._method = method;
                    this._uri = uri;
                    this._headers = {};
                    this._body = ""
                }
                return WebHttpRequest.prototype.addHeader = function(headerName, headerValue) {
                        this._headers[headerName] = headerValue
                    }, WebHttpRequest.prototype.setBody = function(bodyText) {
                        this._body = bodyText
                    }, WebHttpRequest.prototype.getRequest = function() {
                            var _this = this,
                                data = [];
                            return data.push(Core.Utility.formatString("{0} {1} HTTP/1.1\r\n", this._method, this._uri)), Object.keys(this._headers).forEach(function(headerName) {
                                    data.push(Core.Utility.formatString("{0}: {1}\r\n", headerName, _this._headers[headerName]))
                                }), data.push("\r\n"), data.push(this._body), data.join("")
                        }, WebHttpRequest
            }();
        Services.WebHttpRequest = WebHttpRequest
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Workers;
    (function(Workers) {
        var AbstractMessageHandler = function() {
                function AbstractMessageHandler(onComplete, onError) {
                    this._onComplete = onComplete;
                    this._onError = onError
                }
                return AbstractMessageHandler
            }();
        Workers.AbstractMessageHandler = AbstractMessageHandler
    })(Workers = AppMagic.Workers || (AppMagic.Workers = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Workers;
    (function(Workers) {
        var util = AppMagic.Utility,
            Dispatcher = function() {
                function Dispatcher(workerFactory, workerBootStrapperScriptFilePath, winjsScriptFilePath, workerDispatcherScriptFilePath, workerScriptDependencies) {
                    this._workerFactory = workerFactory;
                    this._cid = 0;
                    this._pendingCalls = {};
                    this._worker = null;
                    this._workerIdCounter = 0;
                    this._workerInfoByWorkerId = {};
                    this._workerBootStrapperScriptFilePath = workerBootStrapperScriptFilePath;
                    this._winjsScriptFilePath = winjsScriptFilePath;
                    this._workerDispatcherScriptFilePath = workerDispatcherScriptFilePath;
                    this._workerScriptDependencies = workerScriptDependencies.slice(0)
                }
                return Dispatcher.prototype._onMessage = function(evt) {
                        var message = evt.data;
                        if (typeof message.messageid != "undefined") {
                            var pendingCall = this._pendingCalls[message.messageid];
                            delete this._pendingCalls[message.messageid];
                            pendingCall.handleMessage(message)
                        }
                    }, Dispatcher.prototype.terminate = function() {
                        this._worker !== null && (this._worker.terminate(), this._worker = null)
                    }, Dispatcher.prototype._getNextWorkerId = function() {
                            var result = util.getNextId(this._workerIdCounter, this._workerInfoByWorkerId);
                            return this._workerIdCounter = result.newCounter, result.id
                        }, Dispatcher.prototype._getNextJobId = function() {
                            var result = util.getNextId(this._cid, this._pendingCalls);
                            return this._cid = result.newCounter, result.id
                        }, Dispatcher.prototype.createWorker = function(classSpecifier, ctorArgs, workerScriptDependencies) {
                            var _this = this,
                                workerId = this._getNextWorkerId();
                            classSpecifier = util.jsonClone(classSpecifier);
                            ctorArgs = util.jsonClone(ctorArgs);
                            var workerInfo = {
                                    isCreated: !1, workerScriptDependencies: null, classSpecifier: classSpecifier, ctorArgs: ctorArgs
                                };
                            return typeof workerScriptDependencies != "undefined" && (workerInfo.workerScriptDependencies = workerScriptDependencies.map(function(x) {
                                    return x
                                })), this._workerInfoByWorkerId[workerId] = workerInfo, new Workers.WorkerHandle(workerId, function() {
                                        return _this._destroyWorker.apply(_this, arguments)
                                    }, function() {
                                        return _this._invokeWorker.apply(_this, arguments)
                                    })
                        }, Dispatcher.prototype._createWorker = function(workerId, classSpecifier, ctorArgs, workerScriptDependencies) {
                            var _this = this;
                            var messageId = this._getNextJobId(),
                                detail = {
                                    classspecifier: classSpecifier, ctorargs: ctorArgs, workerid: workerId
                                };
                            workerScriptDependencies !== null && (detail.workerscriptdependencies = workerScriptDependencies);
                            new WinJS.Promise(function(complete, error) {
                                _this._pendingCalls[messageId] = new Workers.SimpleMessageCompletionHandler(complete, error)
                            });
                            this._worker.postMessage({
                                type: "createworker", messageid: messageId, detail: detail
                            });
                            this._workerInfoByWorkerId[workerId].isCreated = !0
                        }, Dispatcher.prototype._destroyWorker = function(workerId) {
                            var _this = this;
                            if (this._worker === null)
                                return WinJS.Promise.wrap();
                            var workerInfo = this._workerInfoByWorkerId[workerId];
                            if (!workerInfo.isCreated)
                                return WinJS.Promise.wrap();
                            var messageId = this._getNextJobId();
                            return this._worker.postMessage({
                                    type: "destroyworker", messageid: messageId, detail: {workerid: workerId}
                                }), new WinJS.Promise(function(complete, error) {
                                    _this._pendingCalls[messageId] = new Workers.SimpleMessageCompletionHandler(complete, error)
                                })
                        }, Dispatcher.prototype._initializeWorkerThread = function() {
                            var _this = this,
                                code = Core.Utility.formatString('importScripts("{0}","{1}");removeInitialContextEventListener();', this._winjsScriptFilePath, this._workerDispatcherScriptFilePath);
                            this._worker.postMessage({detail: {code: code}});
                            var messageId = this._getNextJobId(),
                                promise = new WinJS.Promise(function(complete, error) {
                                    _this._pendingCalls[messageId] = new Workers.SimpleMessageCompletionHandler(complete, error)
                                });
                            return this._worker.postMessage({
                                    type: "importscripts", messageid: messageId, detail: {scripts: this._workerScriptDependencies}
                                }), promise
                        }, Dispatcher.prototype._invokeWorker = function(workerId, functionName, parameters) {
                            var _this = this;
                            var ensureWorkerThreadIsCreatedPromise = WinJS.Promise.wrap();
                            this._worker === null && (this._worker = this._workerFactory.createWorker(this._workerBootStrapperScriptFilePath), AppMagic.Services.XmlHttpRequestFactory.instance.createXmlHttpRequestReceiver(this._worker), this._worker.addEventListener("message", function() {
                                    return _this._onMessage.apply(_this, arguments)
                                }, !1), ensureWorkerThreadIsCreatedPromise = ensureWorkerThreadIsCreatedPromise.then(function() {
                                    return _this._initializeWorkerThread()
                                }));
                            var workerInfo = this._workerInfoByWorkerId[workerId];
                            workerInfo.isCreated || (this._createWorker(workerId, workerInfo.classSpecifier, workerInfo.ctorArgs, workerInfo.workerScriptDependencies), delete workerInfo.classSpecifier, delete workerInfo.ctorArgs, delete workerInfo.workerScriptDependencies);
                            return ensureWorkerThreadIsCreatedPromise.then(function() {
                                    return new WinJS.Promise(function(complete, error) {
                                            var messageId = _this._getNextJobId();
                                            _this._pendingCalls[messageId] = new Workers.InvokeWorkerHandler(complete, error);
                                            _this._worker.postMessage({
                                                type: "invokeworker", messageid: messageId, detail: {
                                                        workerid: workerId, functionname: functionName, parameters: parameters
                                                    }
                                            })
                                        })
                                })
                        }, Dispatcher
            }();
        Workers.Dispatcher = Dispatcher
    })(Workers = AppMagic.Workers || (AppMagic.Workers = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Workers;
    (function(Workers) {
        var DispatcherFactory = function() {
                function DispatcherFactory(workerFactory) {
                    this._workerFactory = workerFactory
                }
                return DispatcherFactory.prototype.createDispatcher = function() {
                        return new Workers.Dispatcher(this._workerFactory, AppMagic.IO.Path.getFullPath("js/AppMagic.Worker.js"), AppMagic.IO.Path.winjsPath, AppMagic.IO.Path.getFullPath("js/common/workerDispatcher.js"), ["js/Core.js", "js/Core.Polyfill.js", "js/common/constants.js", "js/AppMagic.Common.js", "js/AppMagic.Services.js", "js/utility.js", "services/utility.js", "services/results.js", "openSource/unmodified/sax/sax.js", "js/xml.js", "openSource/unmodified/cryptojs/rollups/hmac-sha256.js", "openSource/unmodified/cryptojs/components/enc-base64-min.js", ].map(function(dependency) {
                                return AppMagic.IO.Path.getFullPath(dependency)
                            }))
                    }, DispatcherFactory
            }();
        Workers.DispatcherFactory = DispatcherFactory
    })(Workers = AppMagic.Workers || (AppMagic.Workers = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Workers;
    (function(Workers) {
        var InvokeWorkerHandler = function(_super) {
                __extends(InvokeWorkerHandler, _super);
                function InvokeWorkerHandler(onComplete, onError) {
                    _super.call(this, onComplete, onError)
                }
                return InvokeWorkerHandler.prototype.handleMessage = function(message) {
                        message.type === "invokeworkersuccess" ? this._onComplete({
                            success: !0, result: message.detail.result
                        }) : this._onComplete({success: !1})
                    }, InvokeWorkerHandler
            }(Workers.AbstractMessageHandler);
        Workers.InvokeWorkerHandler = InvokeWorkerHandler
    })(Workers = AppMagic.Workers || (AppMagic.Workers = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Workers;
    (function(Workers) {
        var SimpleMessageCompletionHandler = function(_super) {
                __extends(SimpleMessageCompletionHandler, _super);
                function SimpleMessageCompletionHandler(onComplete, onError) {
                    _super.call(this, onComplete, onError)
                }
                return SimpleMessageCompletionHandler.prototype.handleMessage = function(message) {
                        this._onComplete()
                    }, SimpleMessageCompletionHandler
            }(Workers.AbstractMessageHandler);
        Workers.SimpleMessageCompletionHandler = SimpleMessageCompletionHandler
    })(Workers = AppMagic.Workers || (AppMagic.Workers = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Workers;
    (function(Workers) {
        var WebWorkerFactory = function() {
                function WebWorkerFactory(){}
                return WebWorkerFactory.prototype.createWorker = function(workerScript) {
                        return new Worker(workerScript)
                    }, WebWorkerFactory
            }();
        Workers.WebWorkerFactory = WebWorkerFactory
    })(Workers = AppMagic.Workers || (AppMagic.Workers = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Workers;
    (function(Workers) {
        var WorkerHandle = function() {
                function WorkerHandle(workerId, destroyWorker, invokeWorker) {
                    this._workerId = workerId;
                    this._destroyWorker = destroyWorker;
                    this._invokeWorker = invokeWorker;
                    this._isDestroyed = !1
                }
                return WorkerHandle.prototype.destroyWorker = function() {
                        return this._isDestroyed = !0, this._destroyWorker(this._workerId)
                    }, WorkerHandle.prototype.invokeWorker = function(functionName, parameters) {
                        return this._invokeWorker(this._workerId, functionName, parameters)
                    }, WorkerHandle
            }();
        Workers.WorkerHandle = WorkerHandle
    })(Workers = AppMagic.Workers || (AppMagic.Workers = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var _xhrInstance;
        function xhr(opts) {
            return _xhrInstance || (_xhrInstance = AppMagic.Services.XmlHttpRequestFactory.instance.createXmlHttpRequestSender()), _xhrInstance.xhr(opts)
        }
        Services.xhr = xhr
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var XmlHttpRequestMessageReader = function() {
                function XmlHttpRequestMessageReader(xhr) {
                    this._xhr = xhr
                }
                return XmlHttpRequestMessageReader.prototype.getMessageHeader = function(headerName) {
                        return this._xhr.getResponseHeader(headerName)
                    }, XmlHttpRequestMessageReader.prototype.getMessageBody = function() {
                        return this._xhr.responseText
                    }, XmlHttpRequestMessageReader
            }();
        Services.XmlHttpRequestMessageReader = XmlHttpRequestMessageReader
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var XmlHttpRequest;
        (function(XmlHttpRequest) {
            var PostMessageXmlHttpRequestConstants = function() {
                    function PostMessageXmlHttpRequestConstants(){}
                    return PostMessageXmlHttpRequestConstants.RequestMessage = "xhrrequest", PostMessageXmlHttpRequestConstants.ResultMessage = "xhrresult", PostMessageXmlHttpRequestConstants
                }();
            XmlHttpRequest.PostMessageXmlHttpRequestConstants = PostMessageXmlHttpRequestConstants
        })(XmlHttpRequest = Services.XmlHttpRequest || (Services.XmlHttpRequest = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var XmlHttpRequest;
        (function(XmlHttpRequest) {
            var PostMessageXmlHttpRequestReceiver = function() {
                    function PostMessageXmlHttpRequestReceiver(worker) {
                        this._worker = worker;
                        this._onMessageFn = this._onMessage.bind(this);
                        this._worker.addEventListener("message", this._onMessageFn)
                    }
                    return PostMessageXmlHttpRequestReceiver.prototype.dispose = function() {
                            this._worker.removeEventListener("message", this._onMessageFn)
                        }, PostMessageXmlHttpRequestReceiver.prototype._onMessage = function(evt) {
                            var _this = this;
                            typeof evt.data.type != "undefined" && evt.data.type === XmlHttpRequest.PostMessageXmlHttpRequestConstants.RequestMessage && WinJS.xhr(evt.data.opts).then(function(response) {
                                return _this._onSuccess(response, evt.data.requestid)
                            }, function(error) {
                                return _this._onError(error, evt.data.requestid)
                            })
                        }, PostMessageXmlHttpRequestReceiver.prototype._onSuccess = function(response, requestId) {
                                var serializer = new AppMagic.Services.XmlHttpRequest.XmlHttpRequestSerializer,
                                    serializedResponse = serializer.serialize(response);
                                this._worker.postMessage({
                                    type: AppMagic.Services.XmlHttpRequest.PostMessageXmlHttpRequestConstants.ResultMessage, responseid: requestId, result: serializedResponse
                                }, null)
                            }, PostMessageXmlHttpRequestReceiver.prototype._onError = function(error, requestId) {
                                this._worker.postMessage({
                                    type: AppMagic.Services.XmlHttpRequest.PostMessageXmlHttpRequestConstants.ResultMessage, responseid: requestId, error: this._serializeError(error)
                                }, null)
                            }, PostMessageXmlHttpRequestReceiver.prototype._serializeError = function(error) {
                                var serializer = new AppMagic.Services.XmlHttpRequest.XmlHttpRequestSerializer,
                                    serializedResponse = null;
                                return error instanceof XMLHttpRequest ? serializedResponse = serializer.serialize(error) : error instanceof Error && (serializedResponse = {
                                        status: 0, contentType: "error", responseText: error.message
                                    }), serializedResponse
                            }, PostMessageXmlHttpRequestReceiver
                }();
            XmlHttpRequest.PostMessageXmlHttpRequestReceiver = PostMessageXmlHttpRequestReceiver
        })(XmlHttpRequest = Services.XmlHttpRequest || (Services.XmlHttpRequest = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var XmlHttpRequest;
        (function(XmlHttpRequest) {
            var PostMessageXmlHttpRequestSender = function() {
                    function PostMessageXmlHttpRequestSender() {
                        this._hasSentMessage = !1;
                        this._currentRequestId = 0;
                        this._requestIdToCompletablePromise = {};
                        this._onMessageReceivedFn = this._onMessageReceived.bind(this);
                        self.addEventListener("message", this._onMessageReceivedFn)
                    }
                    return PostMessageXmlHttpRequestSender.prototype.xhr = function(opts) {
                            var completablePromise = Core.Promise.createCompletablePromise();
                            return self.postMessage({
                                    type: XmlHttpRequest.PostMessageXmlHttpRequestConstants.RequestMessage, requestid: this._currentRequestId, opts: opts
                                }, null), this._requestIdToCompletablePromise[this._currentRequestId] = completablePromise, this._currentRequestId++, completablePromise.promise
                        }, PostMessageXmlHttpRequestSender.prototype.dispose = function() {
                            self.removeEventListener("message", this._onMessageReceivedFn)
                        }, PostMessageXmlHttpRequestSender.prototype._onMessageReceived = function(evt) {
                                var data = evt.data;
                                if (data.type === XmlHttpRequest.PostMessageXmlHttpRequestConstants.ResultMessage) {
                                    var completablePromise = this._requestIdToCompletablePromise[data.responseid];
                                    var deserializer = new AppMagic.Services.XmlHttpRequest.XmlHttpRequestSerializer;
                                    data.error ? completablePromise.error(deserializer.deserialize(data.error)) : completablePromise.complete(deserializer.deserialize(data.result));
                                    delete this._requestIdToCompletablePromise[data.responseid]
                                }
                            }, PostMessageXmlHttpRequestSender
                }();
            XmlHttpRequest.PostMessageXmlHttpRequestSender = PostMessageXmlHttpRequestSender
        })(XmlHttpRequest = Services.XmlHttpRequest || (Services.XmlHttpRequest = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var XmlHttpRequest;
        (function(XmlHttpRequest) {
            var XmlHttpRequestSerializer = function() {
                    function XmlHttpRequestSerializer(){}
                    return XmlHttpRequestSerializer.prototype.serialize = function(xmlHttpResponse) {
                            var responseType = xmlHttpResponse.responseType.toLowerCase(),
                                contentType = (xmlHttpResponse.getResponseHeader(XmlHttpRequestSerializer.ContentType) || "").toLowerCase(),
                                serializedResponse = {
                                    status: xmlHttpResponse.status, contentType: contentType, responseType: xmlHttpResponse.responseType
                                };
                            return this._isResponseArrayBufferOrBlob(responseType) ? serializedResponse.response = xmlHttpResponse.response : serializedResponse.responseText = xmlHttpResponse.responseText, serializedResponse
                        }, XmlHttpRequestSerializer.prototype.deserialize = function(xmlHttpResponse) {
                            var deserializedXhr = {};
                            return deserializedXhr.status = xmlHttpResponse.status, deserializedXhr.responseText = xmlHttpResponse.responseText, deserializedXhr.response = xmlHttpResponse.response, deserializedXhr.responseType = xmlHttpResponse.response, deserializedXhr.getResponseHeader = function(headerName) {
                                        return Contracts.check(headerName === XmlHttpRequestSerializer.ContentType, "Only content-type header is supported currently."), xmlHttpResponse.contentType
                                    }, deserializedXhr
                        }, XmlHttpRequestSerializer.prototype._isResponseArrayBufferOrBlob = function(responseType) {
                                return responseType === "blob" || responseType === "arraybuffer"
                            }, XmlHttpRequestSerializer.ContentType = "content-type", XmlHttpRequestSerializer
                }();
            XmlHttpRequest.XmlHttpRequestSerializer = XmlHttpRequestSerializer
        })(XmlHttpRequest = Services.XmlHttpRequest || (Services.XmlHttpRequest = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Services;
    (function(Services) {
        var XmlHttpRequest;
        (function(XmlHttpRequest) {
            var XmlHttpRequestSender = function() {
                    function XmlHttpRequestSender(){}
                    return XmlHttpRequestSender.prototype.xhr = function(opts) {
                            return WinJS.xhr(opts)
                        }, XmlHttpRequestSender
                }();
            XmlHttpRequest.XmlHttpRequestSender = XmlHttpRequestSender
        })(XmlHttpRequest = Services.XmlHttpRequest || (Services.XmlHttpRequest = {}))
    })(Services = AppMagic.Services || (AppMagic.Services = {}))
})(AppMagic || (AppMagic = {}));