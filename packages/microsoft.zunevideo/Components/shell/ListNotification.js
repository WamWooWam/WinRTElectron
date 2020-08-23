/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(UI) {
            var ListNotification = (function() {
                    function ListNotification(){}
                    ListNotification.createNotification = function(category, messageText, detailsText, actionIds, actionOptionsArray, hidden, automationId, isDissmissable) {
                        var notification = new UI.Notification;
                        notification.category = category;
                        notification.icon = category.icon;
                        notification.title = messageText;
                        notification.subTitle = detailsText;
                        notification.actions = actionIds;
                        notification.actionParamsArray = actionOptionsArray;
                        notification.visible = !hidden;
                        notification.automationId = automationId;
                        if (isDissmissable) {
                            notification.dismissAction = UI.Actions.ActionIdentifiers.notificationClear;
                            notification.dismissActionParams = {category: category}
                        }
                        else
                            notification.dismissIcon = String.empty;
                        return notification
                    };
                    return ListNotification
                })();
            UI.ListNotification = ListNotification;
            var NotificationCategory = (function() {
                    function NotificationCategory(priority, name, icon, firstTimeOnly, completed, visible) {
                        this.priority = priority;
                        this.name = name;
                        this.icon = icon;
                        this.firstTimeOnly = firstTimeOnly;
                        this.completed = completed;
                        this.visible = visible
                    }
                    return NotificationCategory
                })();
            UI.NotificationCategory = NotificationCategory;
            (function(NotificationCategoryNames) {
                NotificationCategoryNames[NotificationCategoryNames["userEngagementContent"] = 0] = "userEngagementContent";
                NotificationCategoryNames[NotificationCategoryNames["networkStatus"] = 1] = "networkStatus";
                NotificationCategoryNames[NotificationCategoryNames["localContent"] = 2] = "localContent";
                NotificationCategoryNames[NotificationCategoryNames["partialContent"] = 3] = "partialContent";
                NotificationCategoryNames[NotificationCategoryNames["cloudContent"] = 4] = "cloudContent";
                NotificationCategoryNames[NotificationCategoryNames["cloudContentV2"] = 5] = "cloudContentV2";
                NotificationCategoryNames[NotificationCategoryNames["explicitPrivileges"] = 6] = "explicitPrivileges";
                NotificationCategoryNames[NotificationCategoryNames["playbackPrivileges"] = 7] = "playbackPrivileges"
            })(UI.NotificationCategoryNames || (UI.NotificationCategoryNames = {}));
            var NotificationCategoryNames = UI.NotificationCategoryNames;
            var NotificationCategoryEnum = (function() {
                    function NotificationCategoryEnum(){}
                    NotificationCategoryEnum.isCollectionCategory = function(category) {
                        return category && (category.name === UI.NotificationCategoryNames[4] || category.name === UI.NotificationCategoryNames[5] || category.name === UI.NotificationCategoryNames[2] || category.name === UI.NotificationCategoryNames[1] || category.name === UI.NotificationCategoryNames[3] || category.name === UI.NotificationCategoryNames[0])
                    };
                    NotificationCategoryEnum.isCloudStorageCategory = function(category) {
                        return false
                    };
                    NotificationCategoryEnum.userEngagementContent = new NotificationCategory(0, NotificationCategoryNames[0], UI.Icon.notification, false);
                    NotificationCategoryEnum.networkStatus = new NotificationCategory(1, NotificationCategoryNames[1], UI.Icon.inlineStreaming, true);
                    NotificationCategoryEnum.localContent = new NotificationCategory(2, NotificationCategoryNames[2], UI.Icon.inlineNotification, true);
                    NotificationCategoryEnum.partialContent = new NotificationCategory(3, NotificationCategoryNames[3], UI.Icon.notification, false);
                    NotificationCategoryEnum.cloudContent = new NotificationCategory(4, NotificationCategoryNames[4], UI.Icon.devices, true);
                    NotificationCategoryEnum.explicitPrivileges = new NotificationCategory(6, NotificationCategoryNames[6], UI.Icon.notification, true);
                    NotificationCategoryEnum.playbackPrivileges = new NotificationCategory(6, NotificationCategoryNames[7], UI.Icon.notification, false);
                    NotificationCategoryEnum.cloudContentV2 = new NotificationCategory(5, NotificationCategoryNames[5], UI.Icon.oneDrive, true);
                    return NotificationCategoryEnum
                })();
            UI.NotificationCategoryEnum = NotificationCategoryEnum;
            var ListNotificationService = (function(_super) {
                    __extends(ListNotificationService, _super);
                    function ListNotificationService() {
                        _super.call(this);
                        this._notificationVersionExpected = 1;
                        ListNotificationService._instanceCount++;
                        MS.Entertainment.UI.assert(ListNotificationService._instanceCount === 1, "Use MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.listNotification);");
                        this._loadStoredNotifications()
                    }
                    Object.defineProperty(ListNotificationService.prototype, "notifications", {
                        get: function() {
                            var availableNotifications = this._notifications.filter(function(item) {
                                    return !item.acknowledged && item.visible
                                });
                            if (ListNotificationService._notificationFilter)
                                availableNotifications = availableNotifications.filter(ListNotificationService._notificationFilter);
                            return availableNotifications
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ListNotificationService.prototype, "localAppSettings", {
                        get: function() {
                            var storedData = null;
                            if (Entertainment.Utilities.isApp1)
                                try {
                                    storedData = Windows.Storage.ApplicationData.current.localSettings.values[ListNotificationService._localStorageKey]
                                }
                                catch(e) {
                                    MS.Entertainment.fail("Failed to read from local app settings for the list notification service with the following error: " + e.toString())
                                }
                            return storedData
                        }, set: function(value) {
                                if (Entertainment.Utilities.isApp1)
                                    try {
                                        Windows.Storage.ApplicationData.current.localSettings.values[ListNotificationService._localStorageKey] = value
                                    }
                                    catch(e) {
                                        MS.Entertainment.fail("Failed to write to local app settings for the list notification service with the following error: " + e.toString())
                                    }
                            }, enumerable: true, configurable: true
                    });
                    ListNotificationService.applyCustonNotificationFilter = function(value) {
                        ListNotificationService._notificationFilter = value;
                        return {cancel: function() {
                                    ListNotificationService._notificationFilter = null
                                }}
                    };
                    ListNotificationService.prototype.createAndSend = function(category, messageText, detailsText, actionIds, actionParamsArray, completeCategory, hidden, automationId) {
                        var notification = ListNotification.createNotification(category, messageText, detailsText, actionIds, actionParamsArray, hidden, automationId, true);
                        this.send(notification);
                        if (completeCategory)
                            notification.category.completed = true;
                        return notification
                    };
                    ListNotificationService.prototype.send = function(notification) {
                        MS.Entertainment.UI.assert(notification, "Null notification sent to the list notification service.");
                        var index = this.indexOfNotificationByCategory(notification.category);
                        if (index >= 0) {
                            if (this._notifications[index].category.completed)
                                return;
                            if (notification.category.firstTimeOnly && this._notifications[index].acknowledged)
                                return;
                            Entertainment.Utilities.Telemetry.logNotification(notification);
                            this._notifications[index] = notification;
                            this._notifications[index].acknowledged = false;
                            this.storeNotifications();
                            this.dispatchEvent(ListNotificationService.sendNotificationReceived, notification)
                        }
                        else {
                            Entertainment.Utilities.Telemetry.logNotification(notification, true);
                            this._notifications.push(notification);
                            this.storeNotifications();
                            this.dispatchEvent(ListNotificationService.sendNotificationReceived, notification)
                        }
                    };
                    ListNotificationService.prototype.clear = function(category, removeFromList) {
                        MS.Entertainment.UI.assert(category, "Cannot clear list notifications without category.");
                        var index = this.indexOfNotificationByCategory(category);
                        if (index >= 0) {
                            if (removeFromList)
                                this._notifications.splice(index, 1);
                            else
                                this._notifications[index].acknowledged = true;
                            this.storeNotifications();
                            this.dispatchEvent(ListNotificationService.clearNotificationReceived, category)
                        }
                    };
                    ListNotificationService.prototype.reset = function() {
                        this._notifications = [];
                        this.localAppSettings = []
                    };
                    ListNotificationService.prototype.getNotificationByCategory = function(category) {
                        var matches = this._notifications.filter(function(item) {
                                return item.category.name === category.name
                            });
                        return matches && matches.length > 0 ? matches[0] : null
                    };
                    ListNotificationService.prototype.indexOfNotificationByCategory = function(category) {
                        var notification = this.getNotificationByCategory(category);
                        return notification ? this._notifications.indexOf(notification) : -1
                    };
                    ListNotificationService.prototype.storeNotifications = function() {
                        this._notifications.sort(function(notification1, notification2) {
                            var notification1Pri = notification1 && notification1.category && notification1.category.priority ? notification1.category.priority : -1;
                            var notification2Pri = notification2 && notification2.category && notification2.category.priority ? notification2.category.priority : -1;
                            if (notification1Pri === notification2Pri)
                                return 0;
                            else if (notification1Pri > notification2Pri)
                                return 1;
                            else
                                return -1
                        });
                        var notificationsToSave = this._notifications.filter(function(item) {
                                return item.category.firstTimeOnly === true
                            });
                        try {
                            this.localAppSettings = JSON.stringify(notificationsToSave)
                        }
                        catch(error) {
                            MS.Entertainment.fail("Failed to stringify notifications to local storage with the following error: " + (error && error.message))
                        }
                    };
                    ListNotificationService.prototype._upgrade = function() {
                        var _this = this;
                        if (this._notifications) {
                            var notificationstoClear = this._notifications.filter(function(notification) {
                                    return (!(notification.category.firstTimeOnly && notification.acknowledged) || !notification.category.completed)
                                });
                            notificationstoClear.forEach(function(notification) {
                                _this.clear(notification.category, true)
                            })
                        }
                    };
                    ListNotificationService.prototype._loadStoredNotifications = function() {
                        var _this = this;
                        var storedNotifications = this.localAppSettings;
                        if (storedNotifications)
                            try {
                                this._notifications = JSON.parse(storedNotifications)
                            }
                            catch(e) {
                                MS.Entertainment.fail("Failed to load notifications from local storage with the following error: " + e.toString())
                            }
                        if (!this._notifications || !Array.isArray(this._notifications))
                            this._notifications = [];
                        this._notifications = this._notifications.map(function(notification) {
                            return new UI.Notification(notification)
                        });
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        var currentNotificationVersion = configurationManager.shell.notificationVersion || 0;
                        if (currentNotificationVersion < this._notificationVersionExpected) {
                            this._upgrade();
                            WinJS.Promise.timeout(30000).done(function() {
                                try {
                                    configurationManager.shell.notificationVersion = _this._notificationVersionExpected
                                }
                                catch(error) {
                                    UI.fail("ListNotification::_loadStoredNotifications. A failure occurred when trying to write the upgraded notification version back to the config store. Error message: " + (error && error.message), String.empty, UI.Debug.errorLevel.low)
                                }
                            }, function(timeOutFailure) {
                                UI.fail("ListNotification::_loadStoredNotifications. A failure occurred in the wait timeout for setting the notification version. Error message: " + (timeOutFailure && timeOutFailure.message), String.empty, UI.Debug.errorLevel.low)
                            })
                        }
                    };
                    ListNotificationService.factory = function() {
                        return new ListNotificationService
                    };
                    ListNotificationService._instanceCount = 0;
                    ListNotificationService._localStorageKey = "MusicNotifications";
                    ListNotificationService._notificationFilter = null;
                    ListNotificationService.sendNotificationReceived = "sendNotificationReceived";
                    ListNotificationService.clearNotificationReceived = "clearNotificationReceived";
                    return ListNotificationService
                })(UI.Framework.ObservableBase);
            UI.ListNotificationService = ListNotificationService;
            var ObservableListNotificationAdapter = (function(_super) {
                    __extends(ObservableListNotificationAdapter, _super);
                    function ObservableListNotificationAdapter(filterAllGlobalNotifications, filterCallback) {
                        _super.call(this);
                        this._applyGlobalNotifications = !filterAllGlobalNotifications;
                        this._filterCallback = filterCallback;
                        this._initializeNotificationList()
                    }
                    ObservableListNotificationAdapter.prototype.dispose = function() {
                        this._isDisposed = true;
                        this._releaseGlobalNotifications();
                        this._filterCallback = null
                    };
                    Object.defineProperty(ObservableListNotificationAdapter.prototype, "dataSource", {
                        get: function() {
                            return this._dataSource
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ObservableListNotificationAdapter.prototype, "filterCallback", {
                        get: function() {
                            return this._filterCallback
                        }, set: function(value) {
                                if (!this._isDisposed)
                                    this._filterCallback = value
                            }, enumerable: true, configurable: true
                    });
                    ObservableListNotificationAdapter.prototype.isEqual = function(adapter) {
                        var isEqual = this === adapter;
                        if (!isEqual && adapter)
                            isEqual = (!this.dataSource || this.dataSource.length === 0) && (!adapter.dataSource || adapter.dataSource.length === 0);
                        if (!isEqual && adapter && adapter.dataSource && this.dataSource && adapter.dataSource.length === this.dataSource.length) {
                            var thisItems = {};
                            var itemKey = null;
                            var item = null;
                            for (var i = 0; i < this.dataSource.length; i++) {
                                item = this.dataSource.item(i);
                                try {
                                    itemKey = JSON.stringify(item, this._stringifyReplacer.bind(this))
                                }
                                catch(error) {
                                    UI.fail("Failed to stringify this data. error: " + (error && error.message));
                                    thisItems = null;
                                    break
                                }
                                thisItems[itemKey] = thisItems[itemKey] ? thisItems[itemKey] + 1 : 1
                            }
                            if (thisItems) {
                                isEqual = true;
                                for (var j = 0; j < adapter.dataSource.length; j++) {
                                    item = adapter.dataSource.item(j);
                                    try {
                                        itemKey = JSON.stringify(item, this._stringifyReplacer.bind(this))
                                    }
                                    catch(error) {
                                        UI.fail("Failed to stringify adapter data. error: " + (error && error.message));
                                        isEqual = false;
                                        break
                                    }
                                    if (thisItems[itemKey] > 0)
                                        thisItems[itemKey] = thisItems[itemKey] - 1;
                                    else
                                        isEqual = false
                                }
                            }
                        }
                        return isEqual
                    };
                    ObservableListNotificationAdapter.prototype.append = function(items) {
                        if (this.dataSource)
                            this.dataSource.spliceArray(this.dataSource.length, 0, items)
                    };
                    ObservableListNotificationAdapter.prototype._filterNotifications = function(notification) {
                        var result = false;
                        if (this.filterCallback)
                            result = this.filterCallback(notification);
                        return result
                    };
                    ObservableListNotificationAdapter.prototype._stringifyReplacer = function(key, value) {
                        if (key === "actionParams")
                            return String.empty;
                        else
                            return value
                    };
                    ObservableListNotificationAdapter.prototype._releaseGlobalNotifications = function() {
                        if (this._notificationServiceHandlers) {
                            this._notificationServiceHandlers.cancel();
                            this._notificationServiceHandlers = null
                        }
                    };
                    ObservableListNotificationAdapter.prototype._initializeNotificationList = function() {
                        var globalNotifications = null;
                        var result = null;
                        var listNotificationService;
                        this._releaseGlobalNotifications();
                        if (this._applyGlobalNotifications && Entertainment.ServiceLocator.isServiceRegistered(Entertainment.Services.listNotification))
                            listNotificationService = Entertainment.ServiceLocator.getService(Entertainment.Services.listNotification);
                        if (listNotificationService) {
                            globalNotifications = new Entertainment.ObservableArray(listNotificationService.notifications.filter(this._filterNotifications.bind(this)));
                            this._notificationServiceHandlers = Entertainment.Utilities.addEventHandlers(listNotificationService, {
                                clearNotificationReceived: this._onClearNotification.bind(this), sendNotificationReceived: this._onSendNotification.bind(this)
                            })
                        }
                        this._setDataSource(globalNotifications)
                    };
                    ObservableListNotificationAdapter.prototype._setDataSource = function(value) {
                        this.updateAndNotify("dataSource", value || new Entertainment.ObservableArray)
                    };
                    ObservableListNotificationAdapter.prototype._onSendNotification = function(args) {
                        if (args && args.detail && this.dataSource && this._filterNotifications(args.detail))
                            this.dataSource.push(args.detail)
                    };
                    ObservableListNotificationAdapter.prototype._onClearNotification = function(args) {
                        var removeIndex = -1;
                        if (args && args.detail && this.dataSource)
                            this.dataSource.some(function(notification, index, items) {
                                if (notification && notification.category && args.detail && notification.category.name === args.detail.name) {
                                    removeIndex = index;
                                    return true
                                }
                                else
                                    return false
                            });
                        if (removeIndex >= 0)
                            this.dataSource.splice(removeIndex, 1)
                    };
                    return ObservableListNotificationAdapter
                })(UI.Framework.ObservableBase);
            UI.ObservableListNotificationAdapter = ObservableListNotificationAdapter
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.listNotification, MS.Entertainment.UI.ListNotificationService.factory)
