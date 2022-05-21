
//
// Copyright (C) Microsoft. All rights reserved.
//

(function () {
    var Mocks = window.Mocks = window.Mocks || {};
    var Microsoft = Mocks.Microsoft = Mocks.Microsoft || {};
    var WindowsLive = Microsoft.WindowsLive = Mocks.Microsoft.WindowsLive || {};
    var Platform = WindowsLive.Platform = WindowsLive.Platform || {};
    Platform.Data = Platform.Data || {};
})();

//
// Copyright (C) Microsoft. All rights reserved.
//

(function () {

    var M = Mocks.Microsoft.WindowsLive.Platform;

    M.MockEvents = {
        ///<summary>A mixin type that provides basic eventing to mock objects.
        ///Provides public accessors for adding/remove listeners and firing events.</summary>
    };

    M.MockEvents.addEventListener = function (type, listener) {
        ///<summary>Mock-only method to add a listener for the specified event.</summary>
        ///<param name="type" type="String"/>
        ///<param name="listener" type="Function"/>
        Jx.addListener(this, type, listener);
    };
    M.MockEvents.removeEventListener = function (type, listener) {
        ///<summary>Mock-only method to remove a listener</summary>
        ///<param name="type" type="String"/>
        ///<param name="listener" type="Function"/>
        ///<param name="context" type="Object" optional="true"/>
        Jx.removeListener(this, type, listener);
    };
    M.MockEvents.mock$fire = function (type, /*@dynamic*/arg) {
        ///<summary>Fires the specified event</summary>
        ///<param name="type" type="String"/>
        ///<param name="arg" type="Object" optional="true"/>
        Jx.raiseEvent(this, type, Jx.mix(arg ? Object.create(arg) : { }, {
            detail: [arg],
            target: this,
            type: type
        }));
    };


    M.MockProperties = {
        ///<summary>A mixin type that provides basic property support to mock objects.  Provides a public
        ///accessor for setting property values.</summary>
    };
    M.MockProperties.mock$setProperties = function (properties, values, suppressNotifications) {
        ///<summary>Sets an array of properties to the values in a parallel array</summary>
        ///<param name="properties" type="Array"/>
        ///<param name="values" type="Array"/>
        ///<param name="suppressNotifications" type="Boolean" optional="true"/>

        var updatedProperties = suppressNotifications ? null : [];
        for (var i = 0, len = properties.length; i < len; ++i) {
            var property = properties[i];
            var value = values[i];
            var privateName = "_" + property;

            Debug.assert(property in this, "Property not found: " + property);
            Debug.assert(privateName in this, "Member not found: " + privateName);

            var privateValue = this[privateName];
            Debug.assert(typeof privateValue === typeof value, "Bad value for property: " + property + " value=" + value);

            if (privateValue instanceof M.MockStruct) {
                var childProperties = privateValue.mock$setValue(value);

                if (updatedProperties) {
                    for (var j = 0, len2 = childProperties.length; j < len2; ++j) {
                        updatedProperties.push(property + "." + childProperties[j]);
                    }
                }
            } else {
                if (privateValue !== value) {
                    this[privateName] = value;

                    if (updatedProperties) {
                        updatedProperties.push(property);
                    }
                }
            }
        }

        if (this._notifyPropertyChange && updatedProperties) {
            this._notifyPropertyChange(updatedProperties);
        }
    };
    M.MockProperties.mock$setProperty = function (property, /*@dynamic*/value, suppressNotifications) {
        ///<summary>Sets a single property to the specified value</summary>
        ///<param name="property" type="String"/>
        ///<param name="value"/>
        ///<param name="suppressNotifications" type="Boolean" optional="true"/>
        this.mock$setProperties([property], [value], suppressNotifications);
    };

    M.MockStruct = function () {
        ///<summary>A base type that provides handling for sub-structures</summary>
    };
    M.MockStruct.prototype.mock$setValue = function (value) {
        ///<summary>Copies fields from value onto this object, and returns the name of properties
        /// that changed</summary>
        ///<param name="value" type="Object"/>
        ///<returns type="Array"/>
        var properties = [];
        for (var field in value) {
            Debug.assert(field in this);
            if (value[field] !== null && this[field] !== null) {
                Debug.assert(typeof this[field] === typeof value[field]);
            }
            if (this[field] !== value[field]) {
                this[field] = value[field];
                properties.push(field);
            }
        }
        return properties;
    };
    M.MockStruct.prototype.mock$clone = function () {
        ///<summary>Creates a copy of this structure</summary>
        ///<returns type="M.MockStruct"/>
        var clone = new this.constructor(this._structName);
        for (var field in this) {
            if (field[0] !== "_" && !(this[field] instanceof Function)) {
                clone[field] = this[field];
            }
        }
        return clone;
    };
    M.MockStruct.prototype.mock$isEqual = function (other) {
        ///<summary>Compares two structures by value</summary>
        ///<param name="other" type="M.MockStruct"/>
        ///<returns type="Boolean"/>
        for (var field in this) {
            if (field[0] !== "_" && !(this[field] instanceof Function)) {
                if (this[field] !== other[field]) {
                    return false;
                }
            }
        }
        return true;
    };

})();

//
// Copyright (C) Microsoft. All rights reserved.
//

(function () {

    var Plat = Microsoft.WindowsLive.Platform;
    var M = Mocks.Microsoft.WindowsLive.Platform;

    function addMembers(ctor, definition) {
        var properties = definition.properties;
        if (properties) {
            for (var propertyName in properties) {
                var details = properties[propertyName];
                if (!Jx.isObject(details) || (details instanceof Date)) {
                    details = { value: details };
                }
                defineProperty(ctor, propertyName, details);
            }
        }

        var functions = definition.functions;
        if (functions) {
            for (var functionName in functions) {
                defineFunction(ctor, functionName, functions[functionName]);
            }
        }

        var init = definition.init;
        if (init) {
            ctor._initializers.push(init);
        }
    }

    function defineFunction(ctor, name, fn) {
        ctor.prototype[name] = function () {
            this._trackMethod(name, arguments);
            if (fn) {
                return fn.apply(this, arguments);
            }
        };
    }

    function defineProperty(ctor, name, details) {
        var privateName = "_" + name;
        var descriptor = { enumerable: true };
        var init;

        if (details.struct) {

            descriptor.get = function () { return this[privateName].mock$clone(); };
            if (details.writable) {
                descriptor.set = function (value) {
                    var changes = this[privateName].mock$setValue(value);
                    Array.prototype.push.apply(this._changes, changes);
                };
            }
            init = function () { this[privateName] = new M[details.struct](); };

        } else {

            descriptor.get = function () { return this[privateName]; };
            if (details.writable) {
                descriptor.set = function (value) {
                    this[privateName] = value;
                    this._changes.push(name);
                };
            }

            if (details.collection) {
                init = function (provider) { this[privateName] = new M.Collection(details.collection, provider); };
            } else if (details.type) {
                init = function (provider) { this[privateName] = new M[details.type](provider); };
            } else {
                ctor.prototype[privateName] = details.value;
            }
        }

        Object.defineProperty(ctor.prototype, name, descriptor);
        if (init) {
            ctor._initializers.push(init);
        }
    }

    M.Object = function (type, provider) {
        /// <param name="provider" type="D.Provider" />
        this._objectType = type;
        this._provider = provider;
        this._propertyEventMap = {};
        this._changes = [];
    };
    Jx.augment(M.Object, M.MockProperties);
    Jx.augment(M.Object, M.MockEvents);
    Debug.Events.define(M.Object.prototype, "changed", "deleted", "mock$commit");
    addMembers(M.Object, {
        properties: {
            objectId: "",
            objectType: "",
            canEdit: true,
            canDelete: true,
            isObjectValid: true
        },
        functions: {
            commit: function () {
                this.mock$fire("mock$commit");
                this._notifyPropertyChange(this._changes);
                this._changes = [];
            },
            deleteObject: null,
            getKeepAlive: function () {
                return { objectId: this._objectId, dispose: Jx.fnEmpty };
            }
        }
    });
    M.Object.prototype._notifyPropertyChange = function (properties) {
        if (this._propertyEventMap) {
            properties = properties.map(function (prop) {
                return this._propertyEventMap[prop] || prop;
            }, this);
        }
        this.mock$fire("changed", properties);
    };
    M.Object.prototype._createObject = function (type) {
        return this._provider.createObject(type);
    };
    M.Object.prototype._trackMethod = function (method, methodArguments) {
        ///<param name="method" type="String"/>
        ///<param name="methodArguments" type="Array"/>
        this._provider.handleMethod(this._objectType, method, this, methodArguments);
    };
    M.Object.prototype._mapPropertyEvent = function (propertyName, eventProperty) {
        this._propertyEventMap[propertyName] = eventProperty;
    };
    M.Object.prototype._provider = null;

    M.Object.define = function (type, definition) {
        var ctor = M[type] = function (provider) {
            M.Object.call(this, type, provider);
            ctor._initializers.forEach(function (fn) {
                fn.call(this, provider);
            }, this);
        };
        Jx.inherit(ctor, M.Object);
        ctor._initializers = [];
        ctor.prototype.mockedType = Plat[type];

        addMembers(ctor, definition);
    };
    M.Object.addMembers = addMembers;

})();


//
// Copyright (C) Microsoft. All rights reserved.
//

(function () {

    var Plat = Microsoft.WindowsLive.Platform;
    var M = Mocks.Microsoft.WindowsLive.Platform;

    M.CollectionChangedEventArgs = function (type, index, previousIndex, objectId) {
        ///<param name="type" type="Stubs.Microsoft.WindowsLive.Platform.CollectionChangeType"/>
        ///<param name="index" type="Number"/>
        ///<param name="previousIndex" type="Number"/>
        ///<param name="objectId" type="String"/>
        this.eType = type;
        this.index = index;
        this.previousIndex = previousIndex;
        this.objectId = objectId;
    };

    M.Collection = function (itemType, provider) {
        ///<param name="itemType" type="String"/>
        ///<param name="provider" type="M.Data.Provider"/>
        this._itemType = itemType;
        this._items = [];
        this._virtualized = [];
        this._provider = provider;
        this._suspended = false;
        this._reset = false;
    };
    Jx.augment(M.Collection, M.MockEvents);
    M.Collection.prototype.mockedType = Plat.Collection;
    Debug.Events.define(M.Collection.prototype, "collectionchanged");

    Object.defineProperty(M.Collection.prototype, "count", { get: function () { return this._items.length; } });
    Object.defineProperty(M.Collection.prototype, "totalCount", { get: function () { return this._virtualized ? this._virtualized.length : this.count; }});

    M.Collection.prototype.item = function (index) {
        ///<param name="index" type="Number"/>
        ///<returns type="M.Object"/>
        Debug.assert(index >= 0 && index < this._items.length);
        return this._items[index];
    };
    M.Collection.prototype.fetchMoreItems = function (pageSize) {
        Debug.assert(Jx.isFunction(this._fetcher));
        this._fetcher(this._virtualized, pageSize);
    };

    M.Collection.prototype.lock = function () { };
    M.Collection.prototype.unlock = function () { };

    M.Collection.prototype.mock$getItemType = function () {
        return this._itemType;
    };
    M.Collection.prototype.mock$addItem = function (item, index) {
        ///<summary>Mock-only method, inserts an item into the collection at the specified index</summary>
        ///<param name="item" type="M.Object"/>
        ///<param name="index" type="Number"/>
        Debug.assert(index <= this._items.length);

        this._items.splice(index, 0, item);
        this._fireChange(Plat.CollectionChangeType.itemAdded, index, -1, item.objectId);
    };
    M.Collection.prototype.mock$removeItem = function (index) {
        ///<summary>Mock-only method, removes an item from the collection</summary>
        ///<param name="item" type="M.Object"/>
        Debug.assert(index < this._items.length);

        var item = this._items.splice(index, 1)[0];
        this._fireChange(Plat.CollectionChangeType.itemRemoved, index, -1, item.objectId);
        return item;
    };
    M.Collection.prototype.mock$removeItemById = function (id) {
        /// <summary>remove an item with a particular id from the collection </summary>
        for (var i = 0, len = this._items.length; i < len; ++i) {
            if (this._items[i].objectId === id) {
                return this.mock$removeItem(i);
            }
        }
    };

    M.Collection.prototype.mock$moveItem = function (indexFrom, indexTo) {
        ///<summary>Mock-only method, moves an item in the collection to the specified index</summary>
        ///<param name="item" type="M.Object"/>
        ///<param name="indexFrom" type="Number"/>
        ///<param name="indexTo" type="Number"/>
        Debug.assert(indexFrom < this._items.length);
        Debug.assert(indexTo < this._items.length);

        var item = this._items.splice(indexFrom, 1)[0];
        this._items.splice(indexTo, 0, item);
        this._fireChange(Plat.CollectionChangeType.itemChanged, indexTo, indexFrom, item.objectId);
    };
    M.Collection.prototype.mock$batchBegin = function () {
        this._fireChange(Plat.CollectionChangeType.batchBegin, -1, -1, null);
    };
    M.Collection.prototype.mock$batchEnd = function () {
        this._fireChange(Plat.CollectionChangeType.batchEnd, -1, -1, null);
    };
    M.Collection.prototype.mock$suspendNotifications = function () {
        this._suspended = true;
    };
    M.Collection.prototype.mock$resumeNotifications = function () {
        this._suspended = false;
        if (this._reset) {
            this._reset = false;
            this._fireChange(Plat.CollectionChangeType.reset, -1, -1, null);
        }
    };
    M.Collection.prototype.mock$initVirtualized = function (items) {
        Debug.assert(this._items.length === 0);
        this._virtualized = items.slice();
    };
    M.Collection.prototype.mock$searchComplete = function (fetcher) {
        ///<summary>Mock-only method to signal search complete and initialize the total count</summary>
        ///<param name="totalCount" type="Number">Total number of virtualized items in this collection</param>
        ///<param name="fetcher" type="Function">Delegate that realizes items in response to fetchMoreItems calls</param>
        Debug.assert(this._fetcher === undefined);
        Debug.assert(!this._suspended);
        this._fetcher = fetcher;
        this._fireChange(Plat.CollectionChangeType.localSearchComplete, -1, -1, null);
    };
    M.Collection.prototype._fireChange = function (changeType, index, previousIndex, objectId) {
        if (this._suspended) {
            this._reset = true;
        } else {
            this.mock$fire("collectionchanged", new M.CollectionChangedEventArgs(changeType, index, previousIndex, objectId));
        }
    };
    M.Collection.prototype.dispose = function () { };

})();


//
// Copyright (C) Microsoft. All rights reserved.
//

(function () {

    var Plat = Microsoft.WindowsLive.Platform;
    var M = Mocks.Microsoft.WindowsLive.Platform;

    M.AccountEventArgs = function () { };

    function addResourceMembers(ctor) {
        M.Object.addMembers(ctor, {
            properties: {
                hasEverSynchronized: true,
                isEnabled: { value: true, writable: true },
                isInitialSyncFinished: true,
                isSyncNeeded: false,
                isSynchronizing: false,
                lastPushResult: 0,
                lastSyncResult: 0,
                lastSyncTime: new Date("1 Jan 1601 UTC"),
                resourceState: Plat.ResourceState.none,
                resourceType: 0,
                mock$makeNull: false
            }
        });
    }

    M.Object.define("Resource", {});
    addResourceMembers(M.Resource);

    M.Object.define("AccountMailResource", {
        init: function(provider){
            this._resourceType = Plat.ResourceType.mail;
        },
        properties: {
            allowExternalImages: { value: false, writable: true },
            cancelSendMail: false,
            canCreateFolders: true,
            canDeleteFolders: true,
            canUpdateFolders: true,
            syncAllFolders: { value: false, writable: true },
            isSendingMail: false,
            isSyncingAllMail: false,
            lastSendMailResult: 0,
            syncWindowSize: { value: Plat.SyncWindowSize.twoWeeks, writable: true },
            toastState: { value: Plat.ToastState.favoritesOnly, writable: true }
        }
    });
    addResourceMembers(M.AccountMailResource);
    Object.defineProperty(M.AccountMailResource.prototype, "signatureText", {
        get: function () {
            if (this._signatureType === Plat.SignatureType.defaultLocalized) {
                return "Mocked by Windows Mail";
            }
            return this._signatureText;
        },
        set: function (val) {
            this._signatureText = val;
            this._signatureType = Plat.SignatureType.userSpecified;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(M.AccountMailResource.prototype, "signatureType", {
        get: function () {
            return this._signatureType;
        },
        set: function (val) {
            Debug.assert(Jx.isNumber(val));
            this._signatureType = val;
            if (val === Plat.SignatureType.defaultLocalized) {
                this._signatureText = "";
            }
        },
        enumerable: true,
        configurable: true
    });
    M.AccountMailResource.prototype._signatureText = "";
    M.AccountMailResource.prototype._signatureType = Plat.SignatureType.defaultLocalized;

    var supportedServerTypes = {};
    supportedServerTypes[Plat.AccountType.liveId] = [Plat.ServerType.eas];
    supportedServerTypes[Plat.AccountType.eas] = [Plat.ServerType.eas];
    supportedServerTypes[Plat.AccountType.easAccountFactory] = [Plat.ServerType.eas];
    supportedServerTypes[Plat.AccountType.imap] = [Plat.ServerType.imap, Plat.ServerType.smtp];
    supportedServerTypes[Plat.AccountType.imapAccountFactory] = [Plat.ServerType.imap, Plat.ServerType.smtp];
    supportedServerTypes[Plat.AccountType.withoutPlugins] = [];

    var upsellToConnectedTypesMap = {};
    upsellToConnectedTypesMap[Plat.AccountType.liveId] = Plat.AccountType.liveId;
    upsellToConnectedTypesMap[Plat.AccountType.easAccountFactory] = Plat.AccountType.eas;
    upsellToConnectedTypesMap[Plat.AccountType.imapAccountFactory] = Plat.AccountType.imap;
    upsellToConnectedTypesMap[Plat.AccountType.popAccountFactory] = Plat.AccountType.pop;
    upsellToConnectedTypesMap[Plat.AccountType.withoutPlugins] = Plat.AccountType.withoutPlugins;

    M.Object.define("Account", {
        init: function (provider) {
        },
        properties: {
            accountType: Plat.AccountType.liveId,
            authType: Plat.AccountAuthType.liveId,
            emailAddress: "",
            sourceId: "",
            displayName: { value: "", writable: true },
            userDisplayName: { value: "", writable: true },
            isDefault: false,
            lastAuthResult: 0,
            meContact: { type: "MeContact" },
            syncType: { value: Plat.SyncType.manual, writable: true },
            pollInterval: { value: 0, writable: true },
            resources: { collection: "Resource" },
            iconSmallUrl: "",
            iconMediumUrl: "",
            siteUrl: "",
            thirdPartyUserId: "",
            color: 255,
            settingsSyncTime: 0,
            settingsResult: 0,
            calendarScenarioState: Plat.ScenarioState.none,
            mailScenarioState: Plat.ScenarioState.none,
            peopleScenarioState: Plat.ScenarioState.none,
            serverScenarios: "dashboard_agg",
            peopleViewComplete: true,
            supportsOAuth: false,
            mock$configureType: Plat.ConfigureType.createConnectedAccount,
            mock$easSettings: { type: "EasAccountSettings" },
            mock$imapSettings: { type: "ImapAccountSettings" },
            mock$smtpSettings: { type: "SmtpAccountSettings" },
            mock$otherConnectableAccounts: { collection: "Account" },
            mock$resources: { collection: "Resource" }
        },
        functions: {
            getConfigureType: function (scenario) { return this._mock$configureType; },
            getServerScenarios: function (scenario, reconnect) { return this._serverScenarios; },
            getOtherConnectableAccounts: function (scenario) { return this._mock$otherConnectableAccounts; },
            createConnectedAccount: function (email) {
                var newAccount = this._provider.loadObject("Account", {
                    emailAddress: email,
                    sourceId: this.sourceId,
                    iconSmallUrl: this.iconSmallUrl,
                    iconMediumUrl: this.iconMediumUrl,
                    displayName: this.displayName,
                    calendarScenarioState: this.calendarScenarioState,
                    mailScenarioState: this.mailScenarioState,
                    peopleScenarioState: this.peopleScenarioState,
                    accountType: upsellToConnectedTypesMap[this._accountType],
                    mock$configureType: Plat.ConfigureType.editOnClient,
                    canDelete: true
                });

                newAccount.mock$easSettings = this._mock$easSettings;
                newAccount.mock$imapSettings = this._mock$imapSettings;
                newAccount.mock$smtpSettings = this._mock$smtpSettings;

                newAccount.mock$smtpSettings.mock$setProperty("mock$associatedAccountId", newAccount.objectId);
                newAccount.mock$imapSettings.mock$setProperty("mock$associatedAccountId", newAccount.objectId);

                if (newAccount && newAccount.accountType === Plat.AccountType.imap) {
                    newAccount.mock$imapSettings.mock$setProperty("supportsAdvancedProperties", true);
                }
                return newAccount;
            },
            getServerByType: function (serverType) {
                Debug.assert(Jx.isNumber(serverType));

                if (supportedServerTypes[this._accountType].indexOf(serverType) !== -1) {
                    if (serverType === Plat.ServerType.eas) {
                        return this._mock$easSettings;
                    } else if (serverType === Plat.ServerType.imap) {
                        return this._mock$imapSettings;
                    } else if (serverType === Plat.ServerType.smtp) {
                        return this._mock$smtpSettings;
                    }
                }
                return null;
            },
            getResourceByType: function (type) {
                if (Object.keys(Plat.ResourceType).length > this.mock$resources.count) {
                    var skipResources = [];
                    for (var i = 0; i < this.mock$resources.count; i++) {
                        skipResources.push(this.mock$resources.item(i).resourceType);
                    }
                    // The mock data accounts can specify resource objects for which it
                    // needs to override the default values. We've iterated over all these
                    // and formed the skipResources array. Now, we iterate over all possible
                    // resource types and dynamically add those to the collection which
                    // are not defined in skipResources. Note: this is only run on 
                    // first access to getResourceByType().
                    for (var prop in Plat.ResourceType) {
                        if (skipResources.indexOf(Plat.ResourceType[prop]) !== -1) { continue; }
                        this.mock$resources.mock$addItem(
                            this._provider.loadObject(
                                (Plat.ResourceType[prop] === Plat.ResourceType.mail) ? "AccountMailResource" : "Resource",
                                { resourceType: Plat.ResourceType[prop] }
                            ),
                            this.mock$resources.count
                        );
                    }
                }

                for (var i = 0; i < this.mock$resources.count; i++) {
                    var resource = this.mock$resources.item(i);
                    if (resource.resourceType === type) {
                        if (resource.mock$makeNull) {
                            return null;
                        } else {
                            return resource;
                        }
                    }
                }
                return null;
            },
            setAuthTokens: function (refreshToken, accessToken, tokenExpiry) {
            },
            deleteFromLocalDevice: null
        }
    });
    Debug.Events.define(M.Account.prototype, "addComplete");
    Object.defineProperty(M.Account.prototype, "serviceContactsName", { get: function () { return this._displayName + " contacts"; }, enumerable: true, configurable: true });
    Object.defineProperty(M.Account.prototype, "editableResources", { get: function () { return this.mock$resources; }, enumerable: true, configurable: true });
    Object.defineProperty(M.Account.prototype, "servers", {
        get: function () {
            var servers = this._servers;
            if (!servers) {
                servers = this._servers = new M.Collection("AccountServerConnectionSettings", this._provider);

                supportedServerTypes[this._accountType].forEach(function (serverType) {
                    if (serverType === Plat.ServerType.eas) {
                        servers.mock$addItem(this._mock$easSettings, servers.count);
                    } else if (serverType === Plat.ServerType.imap) {
                        servers.mock$addItem(this._mock$imapSettings, servers.count);
                    } else if (serverType === Plat.ServerType.smtp) {
                        servers.mock$addItem(this._mock$smtpSettings, servers.count);
                    }
                } .bind(this));
            }
            return servers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(M.Account.prototype, "sendAsAddresses", { get: function () { return { size: 0 }; }, enumerable: true, configurable: true });
    Object.defineProperty(M.Account.prototype, "preferredSendAsAddress", { get: function () { return this._emailAddress; }, enumerable: true, configurable: true });

    function addConnectionSettingsMembers(ctor) {
        M.Object.addMembers(ctor, {
            properties: {
                server: { value: "", writable: true },
                port: { value: 0, writable: true },
                userId: { value: "", writable: true },
                domain: { value: "", writable: true },
                hasPasswordCookie: false,
                ignoreServerCertificateExpired: false,
                ignoreServerCertificateMismatchedDomain: false,
                ignoreServerCertificateUnknownCA: false,
                supportsAdvancedProperties: false,
                useSsl: { value: true, writable: true },
                mock$associatedAccountId: "",
                mock$passwordCookie: ""
            },
            functions: {
                setPasswordCookie: function (passwordCookie) {
                    this.mock$setProperties(
                        [ "mock$passwordCookie", "hasPasswordCookie" ],
                        [ passwordCookie, true ]
                    );
                }
            }
        });
    }

    M.Object.define("EasAccountSettings", {
        properties: {
            serverType: Plat.ServerType.eas,
            isWlasSupported: true,
            oofBodyForInternal: { value: "", writable: true },
            oofBodyForKnownExternal: { value: "", writable: true },
            oofBodyForUnknownExternal: { value: "", writable: true },
            oofEnabledForInternal: false,
            oofEnabledForKnownExternal: false,
            oofEnabledForUnknownExternal: false,
            oofEndTime: new Date(0),
            oofLastIgnoredTime: new Date(0), 
            oofStartTime: new Date(0),
            oofState: false,
            policyApplyAttempted: true,
            policyComplianceResults: Plat.PolicyComplianceResults.compliant,
            rightsManagementTemplates: null,
            mock$isOofSupported: false
        },
        functions: {
            getClientSecurityPolicy: null,
            isOofSupported: function () { return this.mock$isOofSupported; }
        }
    });
    addConnectionSettingsMembers(M.EasAccountSettings);

    M.Object.define("ImapAccountSettings", {
        properties: {
            serverType: Plat.ServerType.imap,
            deletedItemsFolderXlist: false,
            draftsFolderXlist: false,
            junkFolderXlist : false,
            sentItemsFolderXlist : false
        }
    });
    addConnectionSettingsMembers(M.ImapAccountSettings);

    M.Object.define("SmtpAccountSettings", {
        properties: {
            serverType: Plat.ServerType.smtp,
            serverRequiresLogin: true
        }
    });
    addConnectionSettingsMembers(M.SmtpAccountSettings);
    Object.defineProperty(M.SmtpAccountSettings.prototype, "usesMailCredentials", {
        get: function () {
            if (Jx.isNonEmptyString(this._mock$associatedAccountId)) {
                var account = this._provider.loadObject("Account", this._mock$associatedAccountId);
                Debug.assert(account);

                var imapSettings = account.getServerByType(Plat.ServerType.imap);
                Debug.assert(imapSettings);

                return (Jx.isNonEmptyString(this.userId) && (this.userId === imapSettings.userId) &&
                        Jx.isNonEmptyString(this._mock$passwordCookie) && (this._mock$passwordCookie === imapSettings.mock$passwordCookie));
            } else {
                return this._usesMailCredentials;
            }

        },
        enumerable: true,
        configurable: true
    });
    M.SmtpAccountSettings.prototype._usesMailCredentials = true;

})();

//
// Copyright (C) Microsoft. All rights reserved.
//

(function () {

    var M = Mocks.Microsoft.WindowsLive.Platform;
    var Plat = Microsoft.WindowsLive.Platform;

    M.Object.define("Folder", {
        init: function (provider) {
            this._isParentFolderLoaded = false;
            this._mapPropertyEvent("folderName", "name");
        },
        properties: {
            accountId: "",
            canHaveChildren: true,
            canMove: true,
            canRename: true,
            folderName: { value: "", writable: true },
            folderType: Plat.FolderType.mail,
            hasProcessedConversations: true,
            hasSynced: true,
            isFolderThreadingCapable: true,
            isPinnedToNavPane: false,
            isLocalMailFolder: false,
            selectionDisabled: false,
            specialCalendarFolderType: 0,
            specialContactFolderType: 0,
            specialMailFolderType: Plat.MailFolderType.userGenerated,
            syncFolderContents: true,
            syncStatus: 0,
            underDeletedItems: false
        },
        functions: {
            getChildFolderCollection: function () {
                return this._provider.query("Folder", "children", [ this.objectId ]);
            },
            startSyncFolderContents: null,
            markViewed: null,
            recordAction: null
        }
    });
    Object.defineProperty(M.Folder.prototype, "parentFolder", { get: function () {
        var hasParentFolder = !Jx.isNullOrUndefined(this._parentFolder);
        if (hasParentFolder && !this._isParentFolderLoaded) {
            Debug.assert(Jx.isNonEmptyString(this._parentFolder.objectId), "The parentFolder must either be null or has a valid objectId");
            this._parentFolder = this._provider.getObjectById(this._parentFolder.objectId);
            this._isParentFolderLoaded = true;
        }
        return this._parentFolder;
    }, enumerable: true });
    M.Folder.prototype._parentFolder = null;

})();

//
// Copyright (C) Microsoft. All rights reserved.
//

(function () {

    var Plat = Microsoft.WindowsLive.Platform;
    var M = Mocks.Microsoft.WindowsLive.Platform;
    var MailBodyType = Plat.MailBodyType;

    M.Object.define("MailMessage", {
        properties: {
            allowExternalImages: {value: false, writable: true},
            accountId: { value: "", writable: true},
            bcc: { value: "", writable: true },
            bodyDownloadStatus: Plat.BodyDownloadStatus.upToDate,
            calendarEvent: null,
            calendarMessageType: 0,
            canFlag: true,
            canMarkRead: true,
            canMove: true,
            canMoveFromOutboxToDrafts: true,
            cc: { value: "", writable: true },
            displayViewIds: { value: [], writable: false },
            eventHandle: "",
            eventUID: "",
            flagged: { value: false, writable: true },
            from: { value: "", writable: true },
            hasAttachments: false,
            hasNewsletterCategory: { value: false, writable: true },
            hasOrdinaryAttachments: false,
            hasSocialUpdateCategory: { value: false, writable: true },
            importance: { value: Plat.MailMessageImportance.normal, writable: true },
            instanceNumber: -1,
            irmAllowProgramaticAccess: true,
            irmCanEdit: true,
            irmCanExtractContent: true,
            irmCanForward: true,
            irmCanModifyRecipients: true,
            irmCanPrint: true,
            irmCanRemoveRightsManagement: true,
            irmCanReply: true,
            irmCanReplyAll: true,
            irmExpiryDate: new Date(0),
            irmHasTemplate: false,
            irmIsContentOwner: true,
            irmTemplateDescription: "",
            irmTemplateId: "",
            irmTemplateName: "",
            isFromPersonPinned: false,
            isLocalMessage: true,
            isPermanentSendFailure: true,
            lastVerb: Plat.MailMessageLastVerb.unknown,
            modified: new Date(0),
            needBody: false,
            normalizedSubject: "",
            outboxQueue: { value: Plat.OutboxQueue.sendMail, writable: true },
            parentConversationId: "",
            photoMailAlbumName: { value: "", writable: true },
            photoMailFlags: { value: 0, writable: true },
            photoMailStatus: { value: 0, writable: true },
            preview: "",
            read: { value: true, writable: true },
            received: new Date(0),
            replyTo: "",
            sender: "",
            sent: new Date(0),
            sourceFolderServerId: { value: "", writable: true },
            sourceHasEmbeddedAttachments: { value: "", writable: true },
            sourceInstanceId: { value: "", writable: true },
            sourceItemServerId: { value: "", writable: true },
            sourceLongId: "",
            sourceMessageStoreId: "",
            sourceReplaceMime: { value: "", writable: true },
            sourceVerb: { value: "", writable: true },
            subject: { value: "", writable: true },
            syncStatus: { value: 0, writable: true },
            to: { value: "", writable: true },
            sanitizedVersion: { value: Plat.SanitizedVersion.current, writable: true },
            mock$body: { collection: "MailBody" },
            mock$attachmentCollection: { collection: "MailAttachment" }
        },
        functions: {
            isBodyAutoGenerated: null,
            isBodyTruncated: function (type) {
                var body = this.getBody(type);
                Debug.assert(body);
                return body ? body.truncated : true;
            },
            hasBody: function (type) {
                return (!!this.getBody(type));
            },
            getBody: function (type) {
                Debug.assert(this.mock$body.count > 0 || this.needBody || this.isInSpecialFolderType(Plat.MailFolderType.drafts));
                if (Jx.isNullOrUndefined(type)) {
                    return this._getBestBody();
                }
                var bodies = this.mock$body._items.filter(function (body) {
                    return body.type === type;
                });
                Debug.assert(bodies.length >= 0 && bodies.length < 2);
                var body = bodies[0];
                if (!body && type === MailBodyType.html) {
                    var sanitizedBody = this.getBody(MailBodyType.sanitized);
                    if (sanitizedBody) {
                        var htmlBody = this.createBody();
                        htmlBody.body = sanitizedBody.body;
                        htmlBody.truncated = sanitizedBody.truncated;
                        htmlBody.type = MailBodyType.html;
                        body = htmlBody;
                    }
                }
                return body;
            },
            _getBestBody: function () {
                var typeArray = [MailBodyType.html, MailBodyType.plainText, MailBodyType.sanitized];
                for (var ii = 0, iiMax = typeArray.length; ii < iiMax; ii++) {
                    var bodyType = typeArray[ii];
                    var body = this.getBody(bodyType);
                    if (body) {
                        return body;
                    }
                }
                return null;
            },
            bestDisplayViewId: function (viewId) {
                var displayViewIds = this.displayViewIds;
                Debug.assert(displayViewIds.length > 0);

                if (displayViewIds.indexOf(viewId) !== -1) {
                    return viewId;
                } else {
                    return displayViewIds[0];
                }
            },
            createBody: function () {
                var newBody = new M.MailBody(this._provider);
                this.mock$body.mock$addItem(newBody, this.mock$body.count);
                return newBody;
            },
            cloneMessage: function () {
                var message = this._provider.createObject("MailMessage");
                for (var prop in this) {
                    try {
                        message[prop] = this[prop];
                    } catch (ex) {}
                }
                var drafts = this._provider.query("MailView", "getMailView", [ Plat.MailViewType.draft, this.accountId]).item(0);
                message._displayViewIds = [drafts.objectId];
                return message;
            },
            isInSpecialFolderType: function (mailFolderType) {
                var provider = this._provider,
                    displayViewIds = this.displayViewIds;
                Debug.assert(displayViewIds.length > 0);

                return displayViewIds.some(function (viewId) {
                    var view = provider.getObjectById(viewId),
                        folder = provider.getObjectById(view._mock$sourceObjectId);

                    if (folder && folder._objectType === "Folder") {
                        return folder.specialMailFolderType === mailFolderType;
                    } else {
                        return false;
                    }
                });
            },
            serializeAsMime: null,
            getJunkBody: function () {
                var MailBodyType = Plat.MailBodyType;
                var junkBody = this.getBody(MailBodyType.plainText);
                if (junkBody) {
                    return junkBody;
                }
                var htmlBody = this.getBody(),
                    plainText = "";
                if (htmlBody) {
                    var element = document.createElement("div");
                    element.innerHTML = window.toStaticHTML(htmlBody.body);
                    plainText = element.innerText;
                }
                junkBody = this.createBody();
                junkBody._type = MailBodyType.plainText;
                junkBody._body = plainText;
                this.commit();
                Debug.assert(this.getJunkBody() === junkBody);
                Debug.assert(this.getBody(MailBodyType.plainText) === junkBody);
                return junkBody;
            },
            getEmbeddedAttachmentCollection: function () {
                return getAttachmentsByType(this, Plat.AttachmentUIType.embedded);
            },
            getOrdinaryAttachmentCollection: function () {
                return getAttachmentsByType(this, Plat.AttachmentUIType.ordinary);
            },
            downloadFullBody: function () {
                this.mock$setProperty("bodyDownloadStatus", Plat.BodyDownloadStatus.inProgress);
            },
            commitSanitizedBody: function () {
                this.commit();
            },
            getHiddenAttachmentCollection: null,
            createAttachment: null,
            removeRightsManagementTemplate: null,
            setRightsManagementTemplate: null
        }
    });
    Object.defineProperty(M.MailMessage.prototype, "fromRecipient", { get: function () { return _generateFakeRecipient(this._provider, this._from); }, enumerable: true, configurable: true });
    Object.defineProperty(M.MailMessage.prototype, "replyToRecipients", { get: function () { return _generateFakeRecipient(this._provider, this._replyTo); }, enumerable: true, configurable: true });
    Object.defineProperty(M.MailMessage.prototype, "senderRecipient", { get: function () { return _generateFakeRecipient(this._provider, this._sender); }, enumerable: true, configurable: true });
    Object.defineProperty(M.MailMessage.prototype, "toRecipients", { get: function () { return _generateFakeRecipients(this._provider, this._to); }, enumerable: true, configurable: true });
    Object.defineProperty(M.MailMessage.prototype, "ccRecipients", { get: function () { return _generateFakeRecipients(this._provider, this._cc); }, enumerable: true, configurable: true });
    Object.defineProperty(M.MailMessage.prototype, "bccRecipients", { get: function () { return _generateFakeRecipients(this._provider, this._bcc); }, enumerable: true, configurable: true });
    Object.defineProperty(M.MailMessage.prototype, "displayViewIdString", { get: function () { return this.displayViewIds.join(); }, enumerable: true, configurable: true });

    function getAttachmentsByType(message, type) {
        var items = message._mock$attachmentCollection._items.filter(function (x) {
            return x.uiType === type;
        });
        var collection = new M.Collection("MailAttachment", message._provider);
        items.forEach(function (item, index) {
            collection.mock$addItem(item, index);
        });
        return collection;
    }

    function _generateFakeRecipient (provider, str) {
        var arr = _generateFakeRecipients(provider, str);
        if (arr.length === 0) {
            return null;
        }
        return arr[0];
    }

    function _generateFakeRecipients (provider, str) {
        if (!Jx.isString(str)) {
            return [];
        }
        return str.split(";")                                  // split on ;
            .map(function (value) { return value.trim(); })    // trim whitespace from both sides
            .filter(Jx.isNonEmptyString)                       // take out empty strings
            .map(function (value) {                            // use the strings as the name and email of Recipients
                var name = value;
                var email = value;

                var match = value.match(/^"(.*)" <(.*)>$/);
                if (match) {
                    name = match[1];
                    email = match[2];
                }

                var collection = provider.query("Person", "byEmail", [ email ]);
                var person = collection.count ? collection.item(0) : null;

                return new M.Recipient(name, email, person, provider);
            });
    }

    M.Object.define("MailBody", {
        properties: {
            type: { value: Plat.MailBodyType.sanitized, writable: true },
            truncated: { value: false, writable: true },
            body: {value: "", writable: true },
            metadata: {value: "{\"hasExternalImages\":false,\"hasExternalBackgrounds\":false,\"hasCSSImages\":false,\"allowedCSSImages\":false,\"htmlBodyHash\":\"hash\"}", writable: true }
        }
    });

    M.Object.define("MailAttachment", {
        properties: {
            fileName: "",
            size: 0,
            uiType: { value: Plat.AttachmentUIType.ordinary, writable: true },
            contentLocation: "",
            contentId: { value: "", writable: true },
            syncStatus: Plat.AttachmentSyncStatus.notStarted,
            composeStatus: Plat.AttachmentSyncStatus.notStarted,
            transcodedFilename: "",
            transcodedSize: 0,
            fileAccessToken: "",
            photoMailFileType: 0,
            contentType: "",
            bodyFile: "",
            bodyUri: ""
        },
        functions: {
            getBody: null,
            downloadBody: null,
            cancelDownload: null
        }
    });

    M.Object.define("MailConversation", {
        properties: {
            canDelete: true,
            canEdit: true,
            flagged: false,
            from: "",
            hasCalendarInvite: false,
            hasCalendarRequest: false,
            hasDraft: false,
            hasOnlyDraftOrSent: false,
            hasOrdinaryAttachments: false,
            importance: Plat.MailMessageImportance.normal,
            instanceNumber: 0,
            irmHasTemplate: false,
            lastVerb: Plat.MailMessageLastVerb.unknown,
            latestReceivedTime: new Date(0),
            read: true,
            subject: "",
            to: "",
            totalCount: 1
        },
        functions: {
            getChildMessages: function () { return this._provider.query("MailMessage", "getChildMessages", [ this.objectId ]); }
        }
    });
    Object.defineProperty(M.MailConversation.prototype, "fromRecipient", { get: function () { return _generateFakeRecipient(this._provider, this._from); }, enumerable: true, configurable: true });
    Object.defineProperty(M.MailConversation.prototype, "toRecipients", { get: function () { return _generateFakeRecipients(this._provider, this._to); }, enumerable: true, configurable: true });

    M.Object.define("MailView", {
        properties: {
            type: Plat.MailViewType.none,
            accountId: "",
            canChangePinState: true,
            isEnabled: true,
            isPinnedToNavPane: false,
            notificationCount: 0,
            lastActiveTimeStamp: { value: new Date(), writable: true },
            startScreenTileId: ""
        },
        functions: {
            getMessages: function (filter) { return this._provider.query("MailMessage", "view", [ this.objectId, filter || 0 /* the WinRT projection will coerce null/undefined to 0 */]); },
            getConversations: function (filter) { return this._provider.query("MailConversation", "view", [this.objectId, filter || 0 /* the WinRT projection will coerce null/undefined to 0 */]); },
            getLaunchArguments: function (messageId) {
                var obj = { accountId: this.accountId, viewType: this.type, viewId: this.objectId };
                if (messageId) {
                    obj.messageId = messageId;
                }
                return JSON.stringify(obj);
            },
            clearUnseenMessages: null,
            setStartScreenTileId: function (tileId) { this.mock$setProperty("startScreenTileId", tileId); },
            pinToNavPane: function (pin) { this.mock$setProperty("isPinnedToNavPane", pin); },
            setEnabled: function (enabled) { this.mock$setProperty("isEnabled", enabled); }
        }
    });
    Object.defineProperty(M.MailView.prototype, "sourceObject", { get: function () { return this._sourceObject || this._provider.getObjectById(this._mock$sourceObjectId) || null; }, enumerable: true, configurable: true });
    Object.defineProperty(M.MailView.prototype, "mock$sourceObjectId", { get: function () { return this._mock$sourceObjectId; }, enumerable: true, configurable: true });
    M.MailView.prototype._sourceObject = null;
    M.MailView.prototype._mock$sourceObjectId = "";

})();


//
// Copyright (C) Microsoft. All rights reserved.
//

(function () {

    var Plat = Microsoft.WindowsLive.Platform;
    var M = Mocks.Microsoft.WindowsLive.Platform;

    function addSharedMembers(ctor, editable) {
        M.Object.addMembers(ctor, {
            properties: {
                firstName: { value: "", writable: editable },
                middleName: { value: "", writable: editable },
                lastName: { value: "", writable: editable },
                nickname: { value: "", writable: editable },
                calculatedUIName: "",
                onlineStatus: Plat.ContactStatus.online,
                userTile: { type: "usertile" },
                isGal: false
            },
            functions: {
                getUserTile: function (size, cachedOnly) { return this._userTile; }
            }
        });
    }

    function addPersonMembers(ctor) {
        M.Object.addMembers(ctor, {
            properties: {
                calculatedYomiDisplayName: "",
                canClearPersonTile: false,
                canEmail: true,
                isFavorite: false,
                isInAddressBook: true,
                linkedContacts: { collection: "Contact" },
                mostRelevantEmail: "",
                mostRelevantPhone: "",
                sortNameLastFirst: "",
                suggestedPeople: { collection: "Person" }
            },
            functions: {
                augmentViaServerAsync: function (isBackground) { return WinJS.Promise.as(); },
                clearPersonTile: null,
                commitAndLink: null,
                createLink: null,
                createRecipient: function (email) { return new M.Recipient(this._calculatedUIName, email, this, this._provider); },
                getWindowsContact: function () {
                    var c = new Windows.ApplicationModel.Contacts.Contact();
                    c.id = this.objectId;
                    c.firstName = this.calculatedUIName.slice(0, 64);

                    function addEmail(windowsContact, address, kind) {
                        if (Jx.isNonEmptyString(address)) {
                            var email = new Windows.ApplicationModel.Contacts.ContactEmail();
                            email.address = address;
                            email.kind = kind;
                            windowsContact.emails.push(email);
                        }
                    }

                    function addPhone(windowsContact, number, kind) {
                        if (Jx.isNonEmptyString(number)) {
                            var phone = new Windows.ApplicationModel.Contacts.ContactPhone();
                            phone.number = number;
                            phone.kind = kind;
                            windowsContact.phones.push(phone);
                        }
                    }

                    function addAddress(windowsContact, location, kind) {
                        if (location != null && (Jx.isNonEmptyString(location.country) || Jx.isNonEmptyString(location.city) || Jx.isNonEmptyString(location.zipCode) ||
                            Jx.isNonEmptyString(location.state) || Jx.isNonEmptyString(location.street))) {
                            var address = new Windows.ApplicationModel.Contacts.ContactAddress();
                            address.country = location.country;
                            address.kind = kind;
                            address.locality = location.city;
                            address.postalCode = location.zipCode;
                            address.region = location.state;
                            address.streetAddress = location.street;
                            windowsContact.addresses.push(address);
                        }
                    }

                    addEmail(c, this.mostRelevantEmail, Windows.ApplicationModel.Contacts.ContactEmailKind.other);
                    addPhone(c, this.mostRelevantPhone, Windows.ApplicationModel.Contacts.ContactPhoneKind.other);

                    var contacts = this.linkedContacts;
                    for (var i = 0, len = contacts.count; i < len; i++) {
                        var linkedContact = contacts.item(i);
                        [
                            ["personalEmailAddress", Windows.ApplicationModel.Contacts.ContactEmailKind.home],
                            ["businessEmailAddress", Windows.ApplicationModel.Contacts.ContactEmailKind.work],
                            ["otherEmailAddress", Windows.ApplicationModel.Contacts.ContactEmailKind.other],
                            ["windowsLiveEmailAddress", Windows.ApplicationModel.Contacts.ContactEmailKind.other],
                            ["yahooEmailAddress", Windows.ApplicationModel.Contacts.ContactEmailKind.other],
                            ["federatedEmailAddress", Windows.ApplicationModel.Contacts.ContactEmailKind.other]
                        ].forEach(function (property) {
                            addEmail(c, linkedContact[property[0]], property[1]);
                        });

                        [
                            ["mobilePhoneNumber", Windows.ApplicationModel.Contacts.ContactPhoneKind.mobile],
                            ["mobile2PhoneNumber", Windows.ApplicationModel.Contacts.ContactPhoneKind.mobile],
                            ["homePhoneNumber", Windows.ApplicationModel.Contacts.ContactPhoneKind.home],
                            ["home2PhoneNumber", Windows.ApplicationModel.Contacts.ContactPhoneKind.home],
                            ["businessPhoneNumber", Windows.ApplicationModel.Contacts.ContactPhoneKind.work],
                            ["business2PhoneNumber", Windows.ApplicationModel.Contacts.ContactPhoneKind.work]
                        ].forEach(function (property) {
                            addPhone(c, linkedContact[property[0]], property[1]);
                        });

                        [
                            ["homeLocation", Windows.ApplicationModel.Contacts.ContactAddressKind.home],
                            ["businessLocation", Windows.ApplicationModel.Contacts.ContactAddressKind.work],
                            ["otherLocation", Windows.ApplicationModel.Contacts.ContactAddressKind.other]
                        ].forEach(function (property) {
                            addAddress(c, linkedContact[property[0]], property[1]);
                        });
                    }
                    return c;
                },
                insertFavorite: null,
                removeFavorite: null,
                setPersonTile: null
            }
        });
        Object.defineProperty(ctor.prototype, "tileId", { get: function () { return JSON.stringify({ objectId: this.objectId }); }, enumerable: true, configurable: true });
        ctor.prototype.mock$loaded = function () {
            // Circular reference workaround
            var contacts = this._linkedContacts;
            for (var i = 0; i < contacts.count; i++) {
                contacts.item(i).mock$setProperties(
                    [ "person", "personId" ],
                    [ this, this.objectId ],
                    true /* suppressNotifications */
                );
            }
        };
    }

    M.Object.define("Person", {
        functions: {
            manageLinks: null
        }
    });
    addSharedMembers(M.Person, false);
    addPersonMembers(M.Person, false);

    M.CID = function () {
    };
    Jx.augment(M.CID, M.MockProperties);
    Object.defineProperty(M.CID.prototype, "value", { get: function () { return this._value; }, enumerable: true, configurable: true });
    M.CID.prototype._value = 0;


    M.Location = function () { };
    Jx.inherit(M.Location, M.MockStruct);
    M.Location.prototype.street = "";
    M.Location.prototype.city = "";
    M.Location.prototype.state = "";
    M.Location.prototype.zipCode = "";
    M.Location.prototype.country = "";


    function MockStream(path) {
        this.mock$getUrl = function () { return path; };
    }
    // Note: As of DP3, we were blocked from overriding the functions on window.MSApp.
    // As a workaround, we can override the entire window.MSApp, copy back the functions on
    // it, then override what we want.
    var MSApp = window.MSApp;
    window.MSApp = Jx.augment((function () { }), MSApp || { });
    var realCreateBlobFromRandomAccessStream = window.MSApp.createBlobFromRandomAccessStream;
    window.MSApp.createBlobFromRandomAccessStream = function (mimeType, stream) {
        if (stream instanceof MockStream) {
            return new MockBlob(stream);
        } else {
            return realCreateBlobFromRandomAccessStream.call(window.MSApp, mimeType, stream);
        }
    };
    function MockBlob(stream) {
        this.mock$getUrl = function () { return stream.mock$getUrl(); };
    }

    // Update URL.createObjectURL to accept mock blobs and return their URLs
    window.URL = window.URL || {};
    window.URL.mock$outstandingURLs = []; // check this to make sure URLs aren't being leaked
    var realCreateObjectURL = window.URL.createObjectURL;
    window.URL.createObjectURL = function (blob, options) {
        var url;
        if (blob instanceof MockBlob) {
            url = blob.mock$getUrl();
        } else {
            url = realCreateObjectURL.call(window.URL, blob);
        }
        window.URL.mock$outstandingURLs.push(url);
        return url;
    };
    // Update URL.revokeObjectURL to do leak tracking
    var realRevokeObjectURL = window.URL.revokeObjectURL;
    window.URL.revokeObjectURL = function (url) {
        var index = window.URL.mock$outstandingURLs.indexOf(url);
        if (index !== -1) {
            window.URL.mock$outstandingURLs.splice(index, 1);
        }
        if (realRevokeObjectURL) {
            // Doesn't fail, safe to call even with mock URLs that weren't generated from realCreateObjectURL
            realRevokeObjectURL.call(window.URL, url);
        }
    };

    M.Object.define("usertile", {
        properties: {
            appdataURI: ""
        }
    });
    Object.defineProperty(M.usertile.prototype, "stream", { get: function () {
        if (this._appdataURI) {
            return new MockStream(this._appdataURI);
        } else {
            return null;
        }
    }, enumerable: true, configurable: true });

    function addContactMembers(ctor) {
        M.Object.addMembers(ctor, {
            properties: {
                yomiFirstName: { value: "", writable: true },
                yomiLastName: { value: "", writable: true },
                suffix: { value: "", writable: true },
                title: { value: "", writable: true },
                account: null,
                cid: { type: "CID" },
                personId: "",
                person: null,
                isBuddy: false,
                imType: Plat.ContactIMType.none,
                isPublicEntity: false,
                trustLevel: { value: Plat.ContactTrustLevel.none, writable: true },
                network: { type: "Network" },
                notes: { value: "", writable: true },
                thirdPartyObjectId: "",
                mobilePhoneNumber: { value: "", writable: true },
                mobile2PhoneNumber: { value: "", writable: true },
                homePhoneNumber: { value: "", writable: true },
                home2PhoneNumber: { value: "", writable: true },
                businessPhoneNumber: { value: "", writable: true },
                business2PhoneNumber: { value: "", writable: true },
                homeFaxNumber: { value: "", writable: true },
                businessFaxNumber: { value: "", writable: true },
                pagerNumber: { value: "", writable: true },
                personalEmailAddress: { value: "", writable: true },
                businessEmailAddress: { value: "", writable: true },
                otherEmailAddress: { value: "", writable: true },
                windowsLiveEmailAddress: "",
                yahooEmailAddress: "",
                federatedEmailAddress: "",
                homeLocation: { struct: "Location", writable: true },
                businessLocation: { struct: "Location", writable: true },
                otherLocation: { struct: "Location", writable: true },
                companyName: { value: "", writable: true },
                jobTitle: { value: "", writable: true },
                officeLocation: { value: "", writable: true },
                yomiCompanyName: { value: "", writable: true },
                birthdate: { value: new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate(), 0, 0, 0, 0), writable: true },
                anniversary: { value: new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate(), 0, 0, 0, 0), writable: true },
                significantOther: { value: "", writable: true },
                webSite: { value: "", writable: true },
                mainMri: "",
                verbs: { collection: "Verb" },
                canIMNow: false,
                canOIM: false
            },
            functions: {
                unlink: null
            }
        });
    }

    M.Object.define("Contact", { });
    addSharedMembers(M.Contact, true);
    addContactMembers(M.Contact);

    M.Object.define("MeContact", {
        properties: {
            userTileCrop: { value: { x: 0, y: 0, width: 0, height: 0 }, writable: true }
        },
        functions: {
            createUserTile: function () { return this._createObject("usertile"); },
            setOnlineStatus: null,
            setEndpointName: null
        }
    });
    addSharedMembers(M.MeContact, true);
    addContactMembers(M.MeContact);
    addPersonMembers(M.MeContact);
    M.Object.addMembers(M.MeContact, {
        init: function () {
            // The Me Contact is both a Person and Contact and the linkedContacts contains a reference
            // back to itself.
            this.linkedContacts.mock$addItem(this, 0);
            // Enable "editing" for testing
            this._canEdit = true;
            this._canMakeFavorite = false;
        }
    });

    M.Object.define("Network", {
        properties: {
            applicationId: "",
            applicationState: Plat.ServicePartnerApplicationState.active,
            authToken: "",
            domainName: "",
            isConnected: false,
            name: "",
            miniPhotoUrl: "",
            PSARank: 0,
            PSAState: Plat.NetworkInfoPSAState.accept,
            publishSecret: "",
            sourceId: "",
            siteUrl: "",
            summary: "",
            thumbnailUrl: "",
            lastContactSyncTimeStamp: new Date(),
            lastUpdateTimeStamp: new Date(),
            lastUserEditTimeStamp: new Date(),
            isEnabledForPresenceAndIM: false,
            presenceAndIMConnectionStatus: Plat.NetworkConnectionStatus.connected,
            presenceAndIMConnectionStatusError: 0,
            doesContactAggregate: false,
            doesDashboardAggregate: false,
            canPublishStatus: false,
            canUploadContent: false,
            canClientSubscribe: false,
            canEnablePresenceAndIM: false
        },
        functions: {
            enablePresenceAndIM: null,
            disablePresenceAndIM: null
        }
    });
    Debug.Events.define(M.Network.prototype, "available");

    M.Object.define("Verb", {
        properties: {
            url: "",
            verbType: 0,
            name: ""
        }
    });

    M.Recipient = function (name, email, person, provider) {
        this._provider = provider;
        if (name) {
            this._calculatedUIName = name;
            this._fastName = name;
        }
        if (email) { this._emailAddress = email; }
        if (person) {
            this._person = person;
        }
    };
    Jx.mix(M.Recipient.prototype, M.MockEvents);
    Jx.mix(M.Recipient.prototype, M.MockProperties);
    M.Recipient.prototype.mockedType = Plat.Recipient;
    Debug.Events.define(M.Recipient.prototype, "changed");
    Object.defineProperty(M.Recipient.prototype, "objectType", { value: "Recipient", enumerable: true, configurable: true });
    Object.defineProperty(M.Recipient.prototype, "fastName", { get: function () { return this._fastName; }, enumerable: true, configurable: true });
    Object.defineProperty(M.Recipient.prototype, "calculatedUIName", { get: function () { return this._calculatedUIName; }, enumerable: true, configurable: true });
    Object.defineProperty(M.Recipient.prototype, "emailAddress", { get: function () { return this._emailAddress; }, enumerable: true, configurable: true });
    Object.defineProperty(M.Recipient.prototype, "person", { get: function () {
        this._person = this._person || this._provider.loadObject("Person", {
            calculatedUIName: this._calculatedUIName,
            mostRelevantEmail: this._emailAddress
        });
        return this._person;
    }, enumerable: true, configurable: true });
    M.Recipient.prototype.dispose = function () { };
    M.Recipient.prototype._notifyPropertyChange = function (updateProperties) {
        if (updateProperties.indexOf("person") !== -1) {
            this.mock$fire("changed");
        }
    };
    M.Recipient.prototype._fastName = "";
    M.Recipient.prototype._calculatedUIName = "";
    M.Recipient.prototype._emailAddress = "";
    M.Recipient.prototype._person = null;

})();

//
// Copyright (C) Microsoft. All rights reserved.
//

(function () {

    var Plat = Microsoft.WindowsLive.Platform;
    var M = Mocks.Microsoft.WindowsLive.Platform;
    var D = M.Data;

    D.Provider = function () { };
    D.Provider.prototype.createObject = function (type) {
        ///<param name="type" type="String"/>
        ///<returns type="M.Object"/>
    };
    D.Provider.prototype.query = function (type, queryName, queryArguments) {
        ///<param name="type" type="String"/>
        ///<param name="queryName" type="String"/>
        ///<param name="queryArguments" type="Array" optional="true"/>
        ///<returns type="M.Collection"/>
    };
    D.Provider.prototype.clone = function (object) {
        ///<param name="object" type="M.Object"/>
        ///<returns type="M.Object"/>
    };
    D.Provider.prototype.getObjectById = function (id) {
        ///<param name="id" type="String"/>
        ///<returns type="M.Object"/>
    };
    D.Provider.prototype.handleMethod = function (type, name, /*@dynamic*/object, args) {
        ///<param name="type" type="String"/>
        ///<param name="name" type="String"/>
        ///<param name="object"/>
        ///<param name="args" type="Array" optional="true"/>
    };

    M.PeopleManager = function (provider) {
        ///<summary>The people manager delegates all of its functionality to a data provider</summary>
        ///<param name="provider" type="D.Provider"/>
        this._provider = provider;
    };
    M.PeopleManager.prototype.createContact = function (account) {
        var contact = this._provider.createObject("Contact");
        contact.mock$setProperty("account", account || this._provider.createObject("Account"));
        return contact;
    };
    M.PeopleManager.prototype.createTemporaryPerson = function (account, data) {
        var person = this._provider.loadObject("Person", {
            isInAddressBook: false,
            calculatedUIName: data.firstName || data.emailAddress || "",
            linkedContacts: [ {
                firstName: data.firstName || "",
                personalEmailAddress: data.emailAddress || "",
                thirdPartyObjectId: data.thirdPartyObjectId || ""
            } ],
            userTile: {
                appdataURI: data.userTileUri || ""
            }
        });
        person.linkedContacts.item(0).mock$setProperty("account", account);
        return person;
    };

    M.PeopleManager.prototype.tryLoadPersonByTileId = function (tileId) { return this.loadPerson(JSON.parse(tileId).objectId); };
    M.PeopleManager.prototype.loadPerson = function (id) { return this._provider.getObjectById(id); };
    M.PeopleManager.prototype.tryLoadPerson = function (id) { return this._provider.getObjectById(id); };
    M.PeopleManager.prototype.getFavoritePeople = function () { return this._provider.query("Person", "favorite"); };
    M.PeopleManager.prototype.getRelevantPeople = function () { return this._provider.query("Person", "relevant"); };
    M.PeopleManager.prototype.getPeopleNameBetween = function (onlineFilter, lowerBound, isLowerBoundInclusive, upperBound, isUpperBoundInclusive) { return this._provider.query("Person", "nameBetween", arguments); };
    M.PeopleManager.prototype.getPeopleByPickerQuery = function (pickerFilter, isFavorite, onlineFilter, lowerBound, isLowerBoundInclusive, upperBound, isUpperBoundInclusive) {
        if (isFavorite && !onlineFilter) {
            return this._provider.query("Person", "favorite");
        } else {
            var args = Array.prototype.slice.call(arguments, 2);
            args.push(isFavorite);
            return this._provider.query("Person", "nameBetween", args);
        }
    };
    M.PeopleManager.prototype.getPeopleNameOrEmailStartWith = function (search) { return this._provider.query("Person", "nameOrEmailStartWith", arguments); };
    M.PeopleManager.prototype.getPeopleNameOrEmailStartWithEx = function (search) { return this._provider.query("Person", "nameOrEmailStartWithEx", arguments); };
    M.PeopleManager.prototype.search = function (type, search, locale, pageSize) { return this._provider.query("Person", "search", arguments); };
    M.PeopleManager.prototype.tryLoadPersonByCid = function () { var results = this._provider.query("Person", "byCid", arguments); if (results.count > 0) { return results.item(0); } return null; };
    M.PeopleManager.prototype.tryLoadPersonBySourceIDAndObjectID = function () { var results = this._provider.query("Person", "bySourceIdAndObjectId", arguments); if (results.count > 0) { return results.item(0); } return null; };
    M.PeopleManager.prototype.tryLoadPersonByMri = function () { var results = this._provider.query("Person", "byMri", arguments); if (results.count > 0) { return results.item(0); } return null; };
    M.PeopleManager.prototype.tryLoadRecipientByEmail = function (email, name) { return new M.Recipient(name, email, null, this._provider); };
    M.PeopleManager.prototype.loadRecipientByEmail = function (email, name) { return new M.Recipient(name, email, null, this._provider); };
    M.PeopleManager.prototype.getSuggestions = function () { return []; };
    M.PeopleManager.prototype.addressWellSearchAsync = function () { return WinJS.Promise.as([]); };
    M.PeopleManager.prototype._provider = null;

    M.AccountManager = function (provider) {
        ///<summary>The accounts manager delegates all of its functionality to a data provider</summary>
        ///<param name="provider" type="D.Provider"/>
        this._provider = provider;
    };
    Object.defineProperty(M.AccountManager.prototype, "defaultAccount", {
        get: function () {
            var accounts = this._provider.query("Account", "default");
            if (accounts.count > 0) {
                return accounts.item(0);
            }
            return new M.Account(this._provider);
        },
        enumerable: true
    });
    M.AccountManager.prototype.canSetSyncTypePush = function () { return false; };
    M.AccountManager.prototype.getConnectableAccountsByScenario = function (scenario, filter) { return this._provider.query("Account", "connectable", [scenario]); };
    M.AccountManager.prototype.getConnectedAccountsByScenario = function (scenario, filter, sort) { return this._provider.query("Account", "connected"); };
    M.AccountManager.prototype.loadAccount = function (id) { return this._provider.getObjectById(id); };
    M.AccountManager.prototype.getAccountBySourceId = function (sourceId, email) {
        var account = this._provider.createObject("Account");
        account.mock$setProperty("sourceId", sourceId);
        account.mock$setProperty("displayName", "DisplayName" + sourceId);
        if (!Jx.isNonEmptyString(email)) {
            account.mock$setProperty("accountType", Plat.AccountType.withoutPlugins);
        }
        return account;
    };

    M.AccountManager.prototype.getConnectableAccountByEmailDomain = function (sourceId, email) {
        Debug.assert(Jx.isNonEmptyString(email));

        var domain;
        try {
            domain = email.split("@")[1].toLowerCase();
        } catch (ex) {
            return null;
        }
        var upsells = this._provider.query("Account", domain);
        if (upsells.count > 0) {
            return upsells.item(0);
        }

        return null;
    };

    M.MailManager = function (provider) {
        ///<summary>The people manager delegates all of its functionality to a data provider</summary>
        ///<param name="provider" type="D.Provider"/>
        this._provider = provider;
    };
    M.MailManager.prototype.mockedType = Plat.MailManager;

    M.MailManager.prototype.getMessageCollectionBySanitizedVersion = function (version) {
        return this._provider.query("MailMessage", "getMessageCollectionBySanitizedVersion", [ version ]);
    };

    M.MailManager.prototype.getPermanentlyFailedMessageCollection = function () {
        return this._provider.query("MailConversation", "getPermanentlyFailedMessageCollection");
    };

    M.MailManager.prototype.createMessage = function () { return this._provider.createObject("MailMessage"); };
    M.MailManager.prototype.createMessageFromMime = function () { return this._provider.createObject("MailMessage"); };
    M.MailManager.prototype.createDraftMessage = function (view) {
        var message = this._provider.createObject("MailMessage");
        var drafts = this._provider.query("MailView", "getMailView", [ Plat.MailViewType.draft, view.accountId]).item(0);
        message.accountId = view.accountId;
        message._displayViewIds = [drafts.objectId];
        return message;
    };
    M.MailManager.prototype.loadMessage = function (id) { return this._provider.getObjectById(id); };
    M.MailManager.prototype.setMailVisible = function () { };
    M.MailManager.prototype.batchMailChanges = function (folder, change, messageIds) {
        if (change === Plat.MailMessageChangeOperation.permanentDelete) {
            var messageCollection = this._provider.query("MailMessage", folder.objectId);
            messageIds.forEach(function (messageId) {
                messageCollection.mock$removeItemById(messageId);
            });
        }
    };
    M.MailManager.prototype.batchMailMove = function (oldFolder, newFolder, messageIds) {
        var messageCollection = this._provider.query("MailMessage", newFolder.objectId);
        messageIds.forEach(function (messageId) {
            messageCollection.mock$removeItemById(messageId);
        });
    };
    M.MailManager.prototype.batchChange = function (keepInView, change, messageIds) {
        if (change === Plat.MailMessageChangeOperation.permanentDelete) {
            this.batchDelete(messageIds);
        }
    };
    M.MailManager.prototype.batchMove = function(sourceId, targetId, messageIds) {
        var messageCollection = this._provider.query("MailMessage", "view", [ sourceId, 0 ]),
            conversationCollection = this._provider.query("MailConversation", "view", [ sourceId, 0 ]);
        messageIds.forEach(function (objectId) {
            messageCollection.mock$removeItemById(objectId);
            conversationCollection.mock$removeItemById(objectId);
        });
        // TODO Put them in the target collection ...
    };
    M.MailManager.prototype.batchDelete = function (messageIds) {
        var messageCollection = this._provider.query("MailMessage", "all"),
            conversationCollection = this._provider.query("MailConversation", "all");
        messageIds.forEach(function (objectId) {
            messageCollection.mock$removeItemById(objectId);
            conversationCollection.mock$removeItemById(objectId);
        });
    }
    M.MailManager.prototype.getMailView = function (type, account) {
        var collection = this._provider.query("MailView", "getMailView", [ type, account.objectId ]);
        return collection.count ? collection.item(0) : null;
    };
    M.MailManager.prototype.getMailViews = function (scenario, accountId) {
        return this._provider.query("MailView", "getMailViews", [ scenario, accountId ]);
    };
    M.MailManager.prototype.ensureMailView = function (type, accountId, objectId) {
        var collection = this._provider.query("MailView", "ensureMailView", [ type, accountId, objectId ]);
        return collection.count ? collection.item(0) : null;
    };
    M.MailManager.prototype.tryLoadMailView = function (id) { return this._provider.getObjectById(id); };
    M.MailManager.prototype.keepObjectInView = function () { };
    M.MailManager.prototype.clearUnseenMessages = function () { };
    M.MailManager.prototype.parseLaunchArguments = function (args) { return JSON.parse(args || "{}"); };
    M.MailManager.prototype.getIncludeSentItemsInConversation = function () { return true; };
    M.MailManager.prototype.setIncludeSentItemsInConversation = function (value) { };
    M.MailManager.prototype._provider = null;

    M.FolderManager = function (provider) {
        ///<summary>The people manager delegates all of its functionality to a data provider</summary>
        ///<param name="provider" type="D.Provider"/>
        this._provider = provider;
    };
    M.FolderManager.prototype.mockedType = Plat.FolderManager;
    M.FolderManager.prototype.getRootFolderCollection = function (account) { return this._provider.query("Folder", "root", [account.objectId]); };
    M.FolderManager.prototype.getRootFolderCollection_ByType = function (account) { return this._provider.query("Folder", "root", [account.objectId]); };
    M.FolderManager.prototype.getRootUserMailFolderCollection = function (account) { return this._provider.query("Folder", "root", [account.objectId]); };
    M.FolderManager.prototype.getAllFoldersCollection = function (folderType, account) { return this._provider.query("Folder", "account", [account.objectId]); };
    M.FolderManager.prototype.getSpecialMailFolder = function (account, specialMailFolderType) { return this._provider.query("Folder", "getSpecialMailFolder", [account.objectId, specialMailFolderType]).item(0); };
    M.FolderManager.prototype.getSpecialContactFolder = function (account) { return this._provider.query("Folder", "account", [account.objectId]).item(0); };
    M.FolderManager.prototype.getSpecialCalendarFolder = function (account) { return this._provider.query("Folder", "account", [account.objectId]).item(0); };
    M.FolderManager.prototype.createFolder = function () { return this._provider.createObject("Folder"); };
    M.FolderManager.prototype.loadFolder = function (id) { return this._provider.getObjectById(id); };
    M.FolderManager.prototype.getImapSpecialFolderId = function (account, folderType) { return ""; };
    M.FolderManager.prototype._provider = null;

    M.Client = function () {
        ///<summary>The mock Client object is simple.  Use mock$setProperty to set the various managers.</summary>
    };
    Jx.augment(M.Client, M.MockProperties);
    Object.defineProperty(M.Client.prototype, "accountManager", { get: function () { return this._accountManager; }, enumerable: true });
    Object.defineProperty(M.Client.prototype, "peopleManager", { get: function () { return this._peopleManager; }, enumerable: true });
    Object.defineProperty(M.Client.prototype, "folderManager", { get: function () { return this._folderManager; }, enumerable: true });
    Object.defineProperty(M.Client.prototype, "mailManager", { get: function () { return this._mailManager; }, enumerable: true });
    Object.defineProperty(M.Client.prototype, "mock$provider", { get: function () { return this._mock$provider; }, enumerable: true });
    Jx.augment(M.Client, M.MockEvents);
    M.Client.prototype.mockedType = Plat.Client;
    Debug.Events.define(M.Client.prototype, "restartneeded");
    M.Client.prototype.createVerb = function () { };
    M.Client.prototype.requestDelayedResources = function () { };
    M.Client.prototype.runResourceVerb = function () { };
    M.Client.prototype.suspend = function () { };
    M.Client.prototype.resume = function () { };
    M.Client.prototype.dispose = function () { };
    M.Client.prototype._accountManager = null;
    M.Client.prototype._peopleManager = null;
    M.Client.prototype._folderManager = null;
    M.Client.prototype._mailManager = null;
    M.Client.prototype._mock$provider = null;
    M.Client.prototype.isMock = true;

})();


//
// Copyright (C) Microsoft. All rights reserved.
//

(function () {

    var M = Mocks.Microsoft.WindowsLive.Platform;
    var D = M.Data;

    D.JsonProvider = function (data, methodHandlers) {

        ///<summary>The JSON provider will create an interlinked set of contacts platform mocks from an
        ///object literal with the same schema</summary>
        ///<param name="data" type="Object">The object literal that will be used to populate the platform</param>
        ///<param name="methodHandlers" type="Object" optional="true">A map of implementations for object methods</param>
        this._queries = {};
        this._objects = {};
        this._nextObjectId = {};
        this._methodHandlers = methodHandlers;

        this._client = new M.Client();
        this._client.mock$setProperty("mock$provider", this, true);
        this._client.mock$setProperty("peopleManager", new M.PeopleManager(this), true);
        this._client.mock$setProperty("accountManager", new M.AccountManager(this), true);
        this._client.mock$setProperty("folderManager", new M.FolderManager(this), true);
        this._client.mock$setProperty("mailManager", new M.MailManager(this), true);

        this.loadData(data);
    };
    Jx.inherit(D.JsonProvider, D.Provider);
    D.JsonProvider.prototype.loadData = function (data) {
        ///<summary>Loads the JSON data.  See SampleData.js for an example.</summary>
        ///<param name="data" type="Object"/>
        for (var itemType in data) {
            var dataForType = data[itemType];
            for (var query in data[itemType]) {
                var collection = this._getCollection(itemType, query, true /*create*/);
                this.loadCollection(collection, dataForType[query]);
            }
        }
    };
    D.JsonProvider.prototype.getClient = function () {
        ///<summary>Returns the root contacts platform object</summary>
        ///<returns type="M.Client"/>
        return this._client;
    };
    D.JsonProvider.prototype.getObjectById = function (id) {
        ///<summary>Fetches an object by objectId</summary>
        ///<param name="id" type="String"/>
        ///<returns type="M.Object"/>
        return this._objects[id];
    };
    D.JsonProvider.prototype.createObject = function (typeName) {
        ///<summary>Creates a new mock object of the specified type</summary>
        ///<param name="typeName" type="String"/>
        ///<returns type="M.Object"/>
        return this.loadObject(typeName, null);
    };
    D.JsonProvider.prototype.query = function (itemType, query, queryArguments) {
        ///<summary>Returns results for the specified query</summary>
        ///<param name="itemType" type="String"/>
        ///<param name="query" type="String"/>
        ///<param name="queryArguments" type="Array" optional="true"/>
        var joinedQuery = query;
        if (queryArguments && queryArguments.length > 0) {
            // for easy lookups, we'll just concatenate together all the query arguments into an ugly string
            joinedQuery = query + "_" + Array.prototype.join.call(queryArguments, "_");
        }

        var result = this._getCollection(itemType, joinedQuery, false /*don't create*/);
        if (!result) {
            // If the query isn't already populated, create a new one
            result = this._getCollection(itemType, joinedQuery, true /*create*/);

            // And if there is a method handler for this query, call it to populate the results
            if (this._methodHandlers) {
                var method = this._methodHandlers[itemType + "." + query];
                if (method) {
                    method(this, result, queryArguments);
                }
            }
        }

        return result;
    };
    D.JsonProvider.prototype._getCollection = function (itemType, query, create) {
        ///<summary>Returns a collection for the specified query, creating it as needed</summary>
        ///<param name="itemType" type="String"/>
        ///<param name="query" type="String"/>
        ///<param name="create" type="Boolean"/>
        ///<returns type="M.Collection"/>
        var queriesForType = this._queries[itemType];
        if (queriesForType === undefined) {
            queriesForType = this._queries[itemType] = {};
        }
        var result = queriesForType[query];
        if (result === undefined && create) {
            result = queriesForType[query] = new M.Collection(itemType, this);
        }
        return result;
    };
    D.JsonProvider.prototype.loadObject = function (typeName, data) {
        ///<summary>Creates a mock object of the specified type and loads it with the provided JSON</summary>
        ///<param name="typeName" type="String"/>
        ///<param name="data" type="Object"/>
        ///<returns type="M.Object"/>

        var /*@type(M.Object)*/object = null;
        if (typeof data === "string") {
            // if the data is a string, it's the ID to an existing item
            object = this._objects[data];
            Debug.assert(object !== undefined);
            Debug.assert(object.objectType === typeName);
        } else {
            // otherwise, the data will be used to initialize a new object
            object = new M[typeName](this);
            if (data !== null) {
                for (var propertyName in data) {
                    if (propertyName[0] !== "_") {
                        var property = object[propertyName];
                        var value = data[propertyName];
                        if (property instanceof M.Collection) {
                            this.loadCollection(property, value);
                        } else if (property instanceof M.Object) {
                            var childObject = property;
                            object.mock$setProperty(
                                propertyName,
                                this.loadObject(childObject.objectType, value),
                                true
                            );
                        } else {
                            Debug.assert(typeof property === typeof value, "Invalid property value: " + propertyName + "=" + value);
                            object.mock$setProperty(propertyName, value, true);
                        }
                    }
                }
            }

            // assign an id if one wasn't specified
            var id = object.objectId;
            if (id === "") {
                id = this._getNextIdForType(typeName);
                object.mock$setProperty("objectId", id, true);
            }

            this._objects[id] = object;

            if (object.mock$loaded) {
                object.mock$loaded();
            }
        }

        return object;
    };
    D.JsonProvider.prototype.loadCollection = function (collection, data) {
        ///<summary>Loads items into a collection from the provided JSON array</summary>
        ///<param name="collection" type="M.Collection"/>
        ///<param name="data" type="Array"/>
        var itemType = collection.mock$getItemType();
        for (var i = 0, len = data.length; i < len; i++) {
            collection.mock$addItem(this.loadObject(itemType, data[i]), collection.count);
        }
    };
    D.JsonProvider.prototype._getNextIdForType = function (typeName) {
        ///<summary>Generates an auto-incrementing Id value the given typeName.</summary>
        ///<param name="typeName" type="String"/>
        ///<returns type="String"/>

        if (this._nextObjectId[typeName] === undefined) {
            this._nextObjectId[typeName] = 0;
        } else {
            this._nextObjectId[typeName]++;
        }

        return typeName + "Id" + this._nextObjectId[typeName].toString();
    };
    D.JsonProvider.prototype.handleMethod = function (type, method, object, args) {
        ///<summary>Handles method calls on objects.  Delegates to a set of "handlers".</summary>
        ///<param name="type" type="String"/>
        ///<param name="method" type="String"/>
        ///<param name="object" type="M.Object"/>
        ///<param name="args" type="Array" optional="true"/>
        if (this._methodHandlers) {
            var methodHandler = this._methodHandlers[type + "." + method];
            if (methodHandler) {
                // Get the "root" object: the uncloned original, so that changes broadcast without a commit
                var rootObject = this._objects[object.objectId];
                Debug.assert(rootObject !== null);
                methodHandler(this, rootObject, args);
            }
        }
    };

    D.JsonProvider.prototype._client = null;
    D.JsonProvider.prototype._queries = null;
    D.JsonProvider.prototype._objects = null;
    D.JsonProvider.prototype._nextObjectId = null;
    D.JsonProvider.prototype._methodHandlers = null;

})();

//
// Copyright (C) Microsoft. All rights reserved.
//

(function () {

    var Plat = Microsoft.WindowsLive.Platform;
    var M = Mocks.Microsoft.WindowsLive.Platform;
    var D = M.Data;

    D.MethodHandlers =  {

        "Person.insertFavorite": function (provider, object) {
            object.mock$setProperty("isFavorite", true);
            var favorites = provider.query("Person", "favorite");
            favorites.mock$addItem(object, favorites.count);
        },

        "Person.removeFavorite": function (provider, object) {
            object.mock$setProperty("isFavorite", false);
            var favorites = provider.query("Person", "favorite");
            for (var i = 0, len = favorites.count; i < len; ++i) {
                if (favorites.item(i).objectId === object.objectId) {
                    favorites.mock$removeItem(i);
                    break;
                }
            }
        },

        "Person.nameOrEmailStartWithEx": function (provider, result, args) {
            var query = args[0];

            serviceQuery("Person", provider, result, function (person) {
                return prefixCompare(person.firstName, query) ||
                       prefixCompare(person.lastName, query) ||
                       prefixCompare(person.calculatedUIName, query) ||
                       prefixCompare(person.mostRelevantEmail, query);
            }, personSort);
        },

        "Person.nameBetween": function (provider, result, args) {
            var filterOnline = args[0];
            var first = args[1];
            var firstInclusive = args[2];
            var last = args[3];
            var lastInclusive = args[4];
            var isFavorite = args[5];

            serviceQuery("Person", provider, result, function (person) {
                if (!isFavorite || person.isFavorite) {
                    if (!filterOnline || person.onlineStatus !== Microsoft.WindowsLive.Platform.ContactStatus.offline) {
                        var firstCompare = person.calculatedUIName.localeCompare(first);
                        if (first === "" || firstCompare === 1 || (firstCompare === 0 && firstInclusive)) {
                            var lastCompare = person.calculatedUIName.localeCompare(last);
                            if (last === "" || lastCompare === -1 || (lastCompare === 0 && lastInclusive)) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }, personSort);
        },

        "Person.search": function (provider, result, args) {
            var query = args[1];

            result.mock$initVirtualized(getMatches(provider, function (person) {
                return prefixCompare(person.firstName, query) ||
                       prefixCompare(person.lastName, query) ||
                       prefixCompare(person.calculatedUIName, query) ||
                       prefixCompare(person.mostRelevantEmail, query);
            }));

            // Asynchronously raise the search complete event when the collection is unlocked
            result.unlock = function () {
                setImmediate(function () {
                    result.mock$searchComplete(function (virtualized, pageSize) {
                        result.mock$batchBegin();
                        virtualized.splice(0, pageSize).forEach(result.mock$addItem, result);
                        result.mock$batchEnd();
                    });
                });
            };
        },

        "Person.bySourceIdAndObjectId": function (provider, result, args) {
            var sourceId = args[0];
            var objectId = args[1];

            serviceQuery("Person", provider, result, contactFilter(function (contact) {
                var account = contact.account;
                return account && account.sourceId === sourceId && contact.thirdPartyObjectId === objectId;
            }), personSort);
        },

        "Person.byMri": function (provider, result, args) {
            var mri = args[0];

            serviceQuery("Person", provider, result, contactFilter(function (contact) { return contact.mainMri === mri; }), personSort);
        },

        "Person.byEmail": function (provider, result, args) {
            var email = args[0].toLowerCase();
            serviceQuery("Person", provider, result, contactFilter(function (contact) {
                return (email === contact.personalEmailAddress.toLowerCase() ||
                        email === contact.businessEmailAddress.toLowerCase() ||
                        email === contact.otherEmailAddress.toLowerCase() ||
                        email === contact.windowsLiveEmailAddress.toLowerCase() ||
                        email === contact.yahooEmailAddress.toLowerCase() ||
                        email === contact.federatedEmailAddress.toLowerCase());
            }));
        },

        "Person.manageLinks": function (provider, object, args) {
            var collection = object.linkedContacts;
            var peopleToLink = args[0];
            var contactsToUnlink = args[1];
            contactsToUnlink.forEach(function (id) {
                var found = false;
                for (var i = 0, len = collection.count; i < len; i++) {
                    if (collection.item(i).objectId === id) {
                        found = true;
                        collection.mock$removeItem(i);
                        break;
                    }
                }
                Debug.assert(found, "Contact not found: " + id);
            });
            peopleToLink.forEach(function (id) {
                var personToLink = provider.getObjectById(id);
                Debug.assert(personToLink, "Person not found: " + id);
                if (personToLink) {
                    var linkedContacts = personToLink.linkedContacts;
                    while (linkedContacts.count > 0) {
                        var contact = linkedContacts.mock$removeItem(0);
                        collection.mock$addItem(contact, collection.count);
                    }
                }
            });
        },

        "Contact.commit": function (provider, contact) {
            if (!contact.person) {
                setImmediate(function () {
                    var person = provider.createObject("Person");
                    person.mock$setProperty("calculatedUIName", "New Person");
                    person.linkedContacts.mock$addItem(contact, 0);
                    contact.mock$setProperty("person", person);
                });
            }
        },

        "Person.commitAndLink": function (provider, person, args) {
            var contact = args[0];
            setImmediate(function () {
                contact.mock$setProperty("person", person);
                person.linkedContacts.mock$addItem(contact, 0);
                person.mock$fire("changed", [ "manualLinkCompleted" ]);
            });
        },

        "Account.deleteObject": function (provider, account) {
            var connected = provider.query("Account", "connected");
            for (var i = 0, len = connected.count; i < len; ++i) {
                if (connected.item(i).objectId === account.objectId) {
                    connected.mock$removeItem(i);
                    break;
                }
            }
        },

        "Account.commit": function (provider, account) {
            var accountType = account.accountType;
            var addingNewAccount = false;
            if (accountType === Plat.AccountType.eas) {
                addingNewAccount = (account.mailScenarioState === Plat.ScenarioState.none &&
                                    account.peopleScenarioState === Plat.ScenarioState.none &&
                                    account.calendarScenarioState === Plat.ScenarioState.none);
            } else if (accountType === Plat.AccountType.imap) {
                addingNewAccount = (account.mailScenarioState === Plat.ScenarioState.none);
            }

            // Simulate adding the new account.
            if (addingNewAccount) {
                var connectedAccounts = provider.query("Account", "connected");
                connectedAccounts.mock$addItem(account, connectedAccounts.count);

                M.supportedServerTypes[accountType].forEach(function (serverType) {
                    var settings = account.getServerByType(serverType);
                    if (!Jx.isNonEmptyString(settings.userId)) {
                        settings.userId = account.emailAddress.substr(0, account.emailAddress.indexOf("@"));
                    }
                });

                var connected = Plat.ScenarioState.connected;
                if (accountType === Plat.AccountType.eas) {
                    account.mock$setProperties(["settingsResult", "settingsSyncTime", "calendarScenarioState", "mailScenarioState", "peopleScenarioState"],
                                            [Plat.Result.success, Date.now() + 100, connected, connected, connected], false /*suppressNotifications*/);
                } else if (accountType === Plat.AccountType.imap) {
                    account.mock$setProperties(["settingsResult", "settingsSyncTime", "mailScenarioState"],
                                            [Plat.Result.success, Date.now() + 100, connected], false /*suppressNotifications*/);
                }
            }
        },

        "Folder.account": function (provider, result, args) {
            var accountId = args[0];
            serviceQuery("Folder", provider, result, function (folder) {
                return folder.accountId === accountId;
            });
        },

        "Folder.getSpecialMailFolder": function (provider, result, args) {
            var accountId = args[0];
            var type = args[1];
            serviceQuery("Folder", provider, result, function (folder) {
                return folder.accountId === accountId && folder.specialMailFolderType === type;
            });
        },

        "Folder.children": function (provider, result, args) {
            var folderId = args[0];
            serviceQuery("Folder", provider, result, function (folder) {
                var parentFolder = folder.parentFolder;
                var parentId = parentFolder ? parentFolder.objectId : null;
                return parentId === folderId;
            });
        },

        "Folder.root": function (provider, result, args) {
            var accountId = args[0];
            serviceQuery("Folder", provider, result, function (folder) {
                return folder.accountId === accountId && !folder.parentFolder;
            });
        },

        "MailMessage.getMessageCollectionBySanitizedVersion": function (provider, result, args) {
            var version = args[0];
            serviceQuery("MailMessage", provider, result, function (message) {
                return (message.sanitizedVersion === version);
            }, messageSort);
        },

        "MailMessage.view": function (provider, result, args) {
            var view = provider.getObjectById(args[0]);
            var filter = args[1];
            serviceQuery("MailMessage", provider, result, function (message) {
                return isInView(provider, message, view) && filterMessage(message, filter);
            }, messageSort);
        },

        "MailMessage.getChildMessages": function (provider, result, args) {
            var conversationId = args[0];
            serviceQuery("MailMessage", provider, result, function (message) {
                return message.parentConversationId === conversationId;
            }, messageSort);
        },

        "MailConversation.view": function (provider, result, args) {
            var view = provider.getObjectById(args[0]);
            var filter = args[1];
            serviceQuery("MailConversation", provider, result, aggregateFilter(
                function (conv) { return conv.getChildMessages(); },
                function (message) { return isInView(provider, message, view) && filterMessage(message, filter); }
            ), conversationSort);
        },

        "MailView.getMailView": function (provider, result, args) {
            var viewType = args[0];
            var accountId = args[1];
            serviceQuery("MailView", provider, result, function (view) {
                return view.type === viewType && view.accountId === accountId;
            });
        },

        "MailView.ensureMailView": function (provider, result, args) {
            var viewType = args[0];
            var accountId = args[1];
            var objectId = args[2];
            serviceQuery("MailView", provider, result, function (view) {
                return view.type === viewType && view.accountId === accountId &&
                    (view.mock$sourceObjectId === objectId || (view.type !== Plat.MailViewType.person && view.type !== Plat.MailViewType.folder));
            });
        },

        "MailView.getMailViews": function (provider, result, args) {
            var scenario = args[0];
            var accountId = args[1];
            serviceQuery("MailView", provider, result, function (view) {
                if (view.accountId === accountId && view.isEnabled) {
                    switch (scenario) {
                        case Plat.MailViewScenario.navPane:
                            return view.isPinnedToNavPane;
                        case Plat.MailViewScenario.allPeople:
                            return view.type === Plat.MailViewType.person;
                        case Plat.MailViewScenario.allFolders:
                            return view.type === Plat.MailViewType.newsletter ||
                                   view.type === Plat.MailViewType.social ||
                                   view.sourceObject && view.sourceObject.objectType === "Folder";
                        case Plat.MailViewScenario.move:
                            return view.type === Plat.MailViewType.newsletter ||
                                   view.type === Plat.MailViewType.social ||
                                   (view.sourceObject &&
                                   view.sourceObject.objectType === "Folder" &&
                                   view.type !== Plat.MailViewType.draft &&
                                   view.type !== Plat.MailViewType.outbox);
                        case Plat.MailViewScenario.systemCategories:
                            return view.type === Plat.MailViewType.newsletter ||
                                   view.type === Plat.MailViewType.social;
                    }
                }
                return false;
            });
        },

        "MailView.pinToNavPane": function (provider, object, args) {
            object.mock$setProperty("isPinnedToNavPane", args[0]);
            updateQueries();
        },

        "MailView.setEnabled": function (provider, object, args) {
            object.mock$setProperty("isEnabled", args[0]);
            updateQueries();
        },

        "MailMessage.commit": function () {
            updateQueries();
        },

        "MailConversation.commit": function () {
            updateQueries();
        },

        "Folder.commit": function () {
            updateQueries();
        },

        "MailView.commit": function () {
            updateQueries();
        }

    };

    function prefixCompare(str, prefix) {
        return str.toLocaleUpperCase().substr(0, prefix.length).localeCompare(prefix.toLocaleUpperCase()) === 0;
    }

    function filterMessage(message, filter) {
        switch (filter) {
            case Plat.FilterCriteria.all:     return true;
            case Plat.FilterCriteria.unread:  return !message.read;
            case Plat.FilterCriteria.flagged: return message.flagged;
            case Plat.FilterCriteria.unseen:  return !message.read;
            default:                          Debug.assert(false, "Unsupported filter"); return false;
        }
        return false;
    }

    function isInView(provider, message, view) {
        var bestViewId = message.bestDisplayViewId(view.objectId);

        if (bestViewId === view.objectId) {
            return true;
        } else {
            if (view.accountId === message.accountId) {
                if (view.type === Plat.MailViewType.flagged) {
                    return message.flagged;
                } else if (view.type === Plat.MailViewType.person) {
                    return view.sourceObject === message.fromRecipient.person;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }

    function getMatches (type, provider, filter, sort) {
        var source = provider.query(type, "all");
        var matches = [];
        for (var i = 0, len = source.count; i < len; ++i) {
            var item = source.item(i);
            if (filter(item)) {
                matches.push(item);
            }
        }
        if (sort) {
            matches.sort(sort);
        }
        return matches;
    }

    var queries = [];
    function serviceQuery (type, provider, result, filter, sort) {
        queries.push({ type: type, provider: provider, result: result, filter: filter, sort: sort });
        getMatches(type, provider, filter, sort).forEach(function (item) { result.mock$addItem(item, result.count); });
    }

    function updateQueries() {
        queries.forEach(function (query) {
            var newCollection = new M.Collection();
            getMatches(query.type, query.provider, query.filter, query.sort).forEach(function (item) { newCollection.mock$addItem(item, newCollection.count); });
            updateCollection(query.result, newCollection);
        });
    }

    function aggregateFilter(getChildren, filter) {
        return function (aggregate) {
            var collection = getChildren(aggregate);
            for (var i = 0, count = collection.count; i < count; i++) {
                if (filter(collection.item(i))) {
                    return true;
                }
            }
            return false;
        };
    }

    function contactFilter(filter) {
        return aggregateFilter(function (person) { return person.linkedContacts; }, filter);
    }

    function personSort(a, b) {
        return a.calculatedUIName.localeCompare(b.calculatedUIName);
    }

    function messageSort(a, b) {
        return b.received - a.received;
    }

    function conversationSort(a, b) {
        return b.latestReceivedTime - a.latestReceivedTime;
    }

    function updateCollection(existingCollection, newCollection) {

        var newLength = newCollection.count;
        for (var i = 0; i < newLength; ) {
            var newItem = newCollection.item(i);
            var existingItem = existingCollection.count > i ? existingCollection.item(i) : null;
            if (existingItem && existingItem.objectId === newItem.objectId) {
                i++;
            } else {
                /* The existing item at the current location is wrong.  If it doesn't belong in the list at all, remove it */
                if (existingItem) {
                    var removeExisting = true;
                    for (var j = i + 1; j < newLength; ++j) {
                        if (newCollection.item(j).objectId === existingItem.objectId) {
                            removeExisting = false;
                        }
                    }
                    if (removeExisting) {
                        existingCollection.mock$removeItem(i);
                        continue;
                    }
                }

                /* Otherwise we'll leave it for later, and put the expected item in before it.
                   If the expected item is already in the list, move it to the new location */
                var moveNew = false;
                for (var k = i + 1, existingLength = existingCollection.count; k < existingLength; ++k) {
                    if (existingCollection.item(k).objectId === newItem.objectId) {
                        moveNew = true;
                        existingCollection.mock$moveItem(k, i);
                        ++i;
                        break;
                    }
                }
                if (moveNew) {
                    continue;
                }

                /* Otherwise, add it */
                existingCollection.mock$addItem(newItem, i);
                ++i;
            }
        }

        /* Prune any extras off the end */
        for (var len = existingCollection.count; len > newLength; --len) {
            existingCollection.mock$removeItem(newLength);
        }
    }

})();

