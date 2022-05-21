
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="compose.ref.js" />

// TODO - Fix references
/// <disable>JS3092,JS2076</disable>

Jx.delayGroup("MailCompose", function () {

    Jx.Binder = /*@constructor*/function (impl) {
        /// <param name="impl" type="Jx.BinderImpl"></param>
        Debug.assert(Boolean(impl));
        Debug.assert(Jx.isFunction(impl.attach));
        this._impl = impl;
    };
    
    var defaultInstance = null;
    Jx.Binder.instance = function () {
        var Binders = Jx.Binder.Binders;

        // Uses a singleton pattern just for convenience of not having to worry about creating all these new objects each time this is called.
        if (!Boolean(defaultInstance)) {
            defaultInstance = new Jx.Binder(
                Binders.AddRemoveListenerBinder.instance(
                Binders.L2EventBinder.instance(
                new Binders.JxAttrBinder())));
        }

        // Return default Jx.Binder impl
        return defaultInstance;
    };

    var proto = Jx.Binder.prototype;

    proto.attach = function (target, bindingDefs) {
        /// <summary>Applies the given binding definitions on to the given target.</summary>
        /// <param name="target">Object for which the bindings should be applied</param>
        /// <param name="bindingDefs" type="Array"></param>
        return this.addAttachments([], target, bindingDefs);
    };

    proto.addAttachments = function (bindings, target, bindingDefs) {
        /// <summary>Applies the given binding definitions on to the given target. Adds the set of bindings to the given bindings object.</summary>
        /// <param name="target">Object for which the bindings should be applied</param>
        /// <param name="bindingDefs" type="Array"></param>
        Debug.assert(Jx.isArray(bindings));
        Debug.assert(Boolean(target));
        Debug.assert(Jx.isArray(bindingDefs));

        var that = this;
        bindingDefs.forEach(function (def) {
            Debug.assert(Jx.isObject(def));
            bindings.push(that._impl.attach(target, def));
        });
        return bindings;
    };

    proto.detach = function (unbinders) {
        /// <param name="unbinders" type="Array"></param>
        Debug.assert(Jx.isArray(unbinders));

        unbinders.forEach(function (unbinder) {
            /// <param name="unbinder" type="Jx.UnbinderImpl"></param>
            Debug.assert(Boolean(unbinder));
            Debug.assert(Jx.isFunction(unbinder.detach));

            unbinder.detach();
        });
    };

});

Jx.delayGroup("MailCompose", function () {

    // Namespace for the binder implementations
    var Binders = Jx.Binder.Binders = {};

    Binders.Base = /*@constructor*/function (/*@optional*/next) {
        /// <param name="next" type="Jx.BinderImpl"></param>
        this._next = next;
    };
    Binders.Base.prototype.bindFallback = function (target, def) {
        /// <summary>Tries the next binder in the list. Fails out if there is no next binder.</summary>
        var next = this._next;
        Debug.call(function () {
            if (!Boolean(next)) {
                // Save this binding so we can inspect it in the debug console
                window.unhandledBinding = def;
                Debug.assert(false, "Cannot handle binding definition. Saved binding definition to window.unhandledBinding.");
            }
        });

        // Try the next binder
        return next.attach(target, def);
    };

});

Jx.delayGroup("MailCompose", function () {

    var Binders = Jx.Binder.Binders;

    // Base impl for event binders. Uses the strategy pattern to implement various types of event binding/unbinding.
    Binders.EventBinder = /*@constructor*/function (next, bindImpl, unbindImpl, canHandleImpl) {
        /// <summary>Implementation for a binder that knows how to hook and unhook with events. Implementation functions are given for specific types of events.</summary>
        /// <param name="bindImpl" type="Function"></param>
        /// <param name="unbindImpl" type="Function"></param>
        /// <param name="canHandleImpl" type="Function"></param>
        Debug.assert(Jx.isFunction(bindImpl));
        Debug.assert(Jx.isFunction(unbindImpl));
        Debug.assert(Jx.isFunction(canHandleImpl));

        Binders.Base.call(this, next);

        this._bindImpl = bindImpl;
        this._unbindImpl = unbindImpl;
        this._canHandleImpl = canHandleImpl;
    };
    Jx.augment(Binders.EventBinder, Binders.Base);

    Binders.EventBinder.instance = function (next, bindImpl, unbindImpl, canHandleImpl) {
        return new Binders.EventBinder(next, bindImpl, unbindImpl, canHandleImpl);
    };

    var ebProto = Binders.EventBinder.prototype;

    ebProto.attach = function (target, /*@dynamic*/def) {
        Debug.assert(Boolean(target));
        Debug.assert(Jx.isObject(def));

        var unbinder = null,
            from = null,
            canHandle = false;

        // Can we handle this bind definition?
        if (this._canHandleDef(def)) {
            // Figure out where this event should come from (default is target)
            Debug.assert(!("from" in def) || !Jx.isNullOrUndefined(def.from), "If from is defined, it should not be null or undefined");
            from = def.from || target;

            // Can our implementation handle this bind definition?
            canHandle = this._canHandleImpl(def, from);
        }

        if (!canHandle) {
            // We cannot handle this definition, try the next binder
            unbinder = this.bindFallback(target, def);
        } else {
            // Perform the binding operation and return the corresponding unbinder.
            // _bindImpl returns the thenFn to use for unbinding (in case it was bound to the given context)
            var thenFn = this._bindImpl(from, def.on, def.then, target);
            var unbindImpl = this._unbindImpl;
            unbinder = {
                detach: function () {
                    unbindImpl(from, def.on, thenFn, target);
                }
            };
        }

        return unbinder;
    };
    
    ebProto._canHandleDef = function (/*@dynamic*/def) {
        Debug.assert(Jx.isObject(def));

        // We assume this is an event hook/unhook definition if there is an on string and a then function provided
        return Jx.isNonEmptyString(def.on) && Jx.isFunction(def.then);
    };

    // Strategy - Implementation for event that uses "on" and "detach"
    var OnDetachBinder = Binders.OnDetachBinder = {};

    OnDetachBinder.instance = function (/*@optional*/next) {
        // We assume these events are from Jx, and do not need us to bind the listener function.
        return Binders.EventBinder.instance(next, OnDetachBinder.attach, OnDetachBinder.detach, OnDetachBinder.canHandleDef);
    };

    OnDetachBinder.canHandleDef = function (/*@dynamic*/def, /*@dynamic*/from) {
        Debug.assert(Jx.isObject(def));
        Debug.assert(Boolean(from));

        return Jx.isFunction(from.on) && Jx.isFunction(from.detach);
    };

    OnDetachBinder.attach = function (/*@dynamic*/from, on, then, context) {
        from.on(on, then, context);
        return then;
    };

    OnDetachBinder.detach = function (/*@dynamic*/from, on, then) {
        from.detach(on, then);
    };

    // Strategy - Implementation for event that uses "addListener" and "removeListener"
    var AddRemoveListenerBinder = Binders.AddRemoveListenerBinder = {};

    AddRemoveListenerBinder.instance = function (/*@optional*/next) {
        // We assume these events are from Jx, and do not need us to bind the listener function.
        return Binders.EventBinder.instance(next,
            AddRemoveListenerBinder.attach, AddRemoveListenerBinder.detach, AddRemoveListenerBinder.canHandleDef);
    };

    AddRemoveListenerBinder.canHandleDef = function (/*@dynamic*/def, /*@dynamic*/from) {
        Debug.assert(Jx.isObject(def));
        Debug.assert(Boolean(from));

        return Jx.isFunction(from.addListener) && Jx.isFunction(from.removeListener);
    };

    AddRemoveListenerBinder.attach = function (/*@dynamic*/from, on, then, context) {
        from.addListener(on, then, context);
        return then;
    };

    AddRemoveListenerBinder.detach = function (/*@dynamic*/from, on, then, context) {
        from.removeListener(on, then, context);
    };

    // Strategy - Implementation for event that uses "addEventListener" and "removeEventListener"
    var L2EventBinder = Binders.L2EventBinder = {};

    L2EventBinder.instance = function (/*@optional*/next) {
        // We assume these events will need function binding for the listener
        return Binders.EventBinder.instance(next, L2EventBinder.attach, L2EventBinder.detach, L2EventBinder.canHandleDef);
    };

    L2EventBinder.canHandleDef = function (/*@dynamic*/def, /*@dynamic*/from) {
        Debug.assert(Jx.isObject(def));
        Debug.assert(Boolean(from));

        return Jx.isFunction(from.addEventListener) && Jx.isFunction(from.removeEventListener);
    };

    L2EventBinder.attach = function (/*@dynamic*/from, on, /*@dynamic*/then, context) {
        var boundThen = then.bind(context);
        from.addEventListener(on, boundThen, false);

        return boundThen;
    };

    L2EventBinder.detach = function (/*@dynamic*/from, on, then) {
        from.removeEventListener(on, then, false);
    };

});

Jx.delayGroup("MailCompose", function () {

    var Binders = Jx.Binder.Binders;

    Binders.JxAttrBinder = /*@constructor*/function (/*@optional*/next) {
        /// <summary>Knows how to bind with Jx.Attr</summary>
        Binders.Base.call(this, next);
    };
    Jx.augment(Binders.JxAttrBinder, Binders.Base);

    var binderProto = Binders.JxAttrBinder.prototype;

    binderProto.attach = function (target, /*@dynamic*/def) {
        Debug.assert(Boolean(target));
        Debug.assert(Jx.isObject(def));

        var unbinder = null;

        if (!this._canHandleDef(def)) {
            unbinder = this.bindFallback(target, def);
        } else {
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            var bindToDef = def.to || { attr: def.bindAttrFrom.attr }, // if "to" is not provided, use the fromAttr as default
                bindTo = /*@static_cast(Jx.Attr)*/(bindToDef.to || target),
                bindFrom = /*@static_cast(Jx.Attr)*/def.bindAttrFrom.from,
                fromAttr = def.bindAttrFrom.attr,
                toAttr = bindToDef.attr;
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            Debug.assert(Jx.isFunction(bindTo.bindAttr));
            Debug.assert(Jx.isFunction(bindTo.unbindAttr));
            Debug.assert(Jx.isFunction(bindFrom.bindAttr));
            Debug.assert(Jx.isFunction(bindFrom.unbindAttr));
            Debug.assert(Jx.isString(fromAttr));
            Debug.assert(Jx.isString(toAttr));

            // Bind and return the corresponding unbinder
            bindFrom.bindAttr(fromAttr, bindTo, toAttr);
            unbinder = {
                detach: function () {
                    bindFrom.unbindAttr(fromAttr, bindTo, toAttr);
                }
            };
        }

        return unbinder;
    };

    binderProto._canHandleDef = function (/*@dynamic*/def) {
        Debug.assert(Jx.isObject(def));
        return Jx.isObject(def.bindAttrFrom);
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    $include("/modernmail/compose/mailcompose/appbar.css");
    $include("/modernmail/compose/mailcompose/inline.css");
    $include("/modernmail/compose/mailcompose/composeanimations.css");

    // Defines some global objects on the Compose object so we can easily mock them out

    window.Compose = window.Compose || {};

    Compose.doc = document;
    Compose.platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/null;
    Compose.WinJsUI = /*@static_cast(Compose.__WinJSUI)*/WinJS.UI;
    Object.defineProperty(Compose, "InputPane", {
        get: function () { return Windows.UI.ViewManagement.InputPane; },
        configurable: true,
        enumerable: true
    });

    Compose.ComposeAction = {
        createNew: 1,
        reply: 2,
        replyAll: 3,
        forward: 4,
        openDraft: 5
    };

    Compose.LogEvent = {
        start: "_begin",
        stop: "_end",
        toProfilerMarkString: {
            "_begin": ",StartTA,Compose",
            "_end": ",StopTA,Compose"
        },
        toProfilerMarkAsyncString: {
            "_begin": ",StartTM,Compose",
            "_end": ",StopTM,Compose"
        }
    };

    Compose.log = function (eventName, eventType) {
        /// <summary>Log function for the Compose ETW events.</summary>
        /// <param name="eventName" type="String">ETW event name</param>
        /// <param name="eventType" type="Compose.LogEvent" optional="true">enum for start/stop/info/etc.</param>
        Compose.mark(eventName, eventType);
    };

    Compose.mark = function (eventName, eventType) {
        /// <summary>Log function for the Compose profiler marks.</summary>
        /// <param name="eventName" type="String">ETW event name</param>
        /// <param name="eventType" type="Compose.LogEvent" optional="true">enum for start/stop/info/etc.</param>
        Jx.mark("Compose." + eventName + (Compose.LogEvent.toProfilerMarkString[eventType] || ""));
    };

    Compose.markAsync = function (eventName, eventType) {
        /// <summary>Log function for the async Compose profiler marks.</summary>
        /// <param name="eventName" type="String">ETW event name</param>
        /// <param name="eventType" type="Compose.LogEvent" optional="true">enum for start/stop/info/etc.</param>
        Jx.mark("Compose." + eventName + (Compose.LogEvent.toProfilerMarkAsyncString[eventType] || ""));
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Compose,Debug,Microsoft*/

Jx.delayGroup("MailCompose", function () {

    Compose.ComposeUtil = /*@constructor*/function () {
        this._actionMailVerbMap = /*@static_cast(Object)*/null;
        this._calendarToComposeMap = null;
    };

    Compose.CalendarActionType = {
        forward: "forward",
        reply: "reply",
        replyAll: "replyAll",
        accept: "accept",
        tentative: "tentative",
        decline: "decline",
        cancel: "cancel"
    };

    var k_invalidObjectId = "0";

    Compose.ComposeUtil.prototype = {

        isMailMessageCommitted: function (mailMessage) {
            /// <summary>Checks if the mail message has been committed to the database at least once.</summary>
            /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The mail message to check.</param>
            return mailMessage.objectId !== k_invalidObjectId;
        },

        isValidCalendarAction: function (action) {
            /// <param name="action" type="Compose.CalendarActionType">value to verify</param>

            var map = this._getCalendarActionToComposeActionMap();

            return Jx.isNumber(map[action]);
        },

        convertToMailVerb: function (action) {
            /// <param name="action" type="Number">See Compose.ComposeAction</param>
            Debug.assert(Debug.Compose.util.isValidAction(action));

            var verb = this._getActionMailVerbMap()[action];
            Debug.assert(Jx.isNumber(verb));
            Debug.assert(verb !== Microsoft.WindowsLive.Platform.MailMessageLastVerb.unknown);

            return verb;
        },

        convertToComposeAction: function (calendarAction) {
            /// <param name="calendarAction" type="Compose.CalendarActionType">calendar action</param>

            var composeAction = this._getCalendarActionToComposeActionMap()[calendarAction];

            Debug.assert(Jx.isNumber(composeAction), "calendarAction did not translate: " + calendarAction);

            return composeAction;
        },
        
        convertCalendarResponseToCalendarActionType: function (response) {
            /// <param name="response" type="Microsoft.WindowsLive.Platform.Calendar.ResponseType" />
            /// <return type="Compose.CalendarActionType" />
            var responseType = Microsoft.WindowsLive.Platform.Calendar.ResponseType,
                calendarAction = Compose.CalendarActionType;
            var actionType;
            switch (response) {
                case responseType.accepted: 
                    actionType = calendarAction.accept;
                    break;
                case responseType.tentative: 
                    actionType = calendarAction.tentative;
                    break;
                case responseType.declined: 
                    actionType = calendarAction.decline;
                    break;
                default:
                    Debug.assert(false, "Unexpected Calendar response type: " + response);
                    break;
            }
            return actionType;
        },

        convertCalendarActionTypeToCalenderResponseType: function (action) {
            /// <param name="action" type="Compose.CalendarActionType" />
            /// <return type="Microsoft.WindowsLive.Platform.Calendar.ResponseType" />
            var responseType = Microsoft.WindowsLive.Platform.Calendar.ResponseType,
                calendarAction = Compose.CalendarActionType;
            var type;
            switch (action) {
                case calendarAction.accept: 
                    type = responseType.accepted;
                    break;
                case calendarAction.tentative: 
                    type = responseType.tentative;
                    break;
                case calendarAction.decline: 
                    type = responseType.declined;
                    break;
                default:
                    Debug.assert(false, "Unexpected Calendar action type: " + action);
                    break;
            }
            return type;
        },

        defineClassName: function (componentCtor, className) {
            /// <summary>Define the getClassName() function on the given compose component ctor</summary>
            /// <param name="componentCtor" type="Function"></param>
            /// <param name="className" type="String"></param>
            Debug.assert(Jx.isFunction(componentCtor));
            Debug.assert(Jx.isNonEmptyString(className));

            componentCtor.getClassName =
                /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                componentCtor.prototype.getClassName = function () {
                /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
                return className;
            };
        },

        getHeaderController: function (componentCache) {
            var headerController = componentCache.getComponent("Compose.HeaderController");
            Debug.assert(Jx.isObject(headerController) && headerController.isActivated());
            return headerController;
        },

        // Private

        _getActionMailVerbMap: function () {
            var map = this._actionMailVerbMap = {},
                mailVerbs = Microsoft.WindowsLive.Platform.MailMessageLastVerb,
                composeAction = Compose.ComposeAction;
            map[composeAction.createNew] = mailVerbs.unknown;
            map[composeAction.reply] = mailVerbs.replyToSender;
            map[composeAction.replyAll] = mailVerbs.replyToAll;
            map[composeAction.forward] = mailVerbs.forward;
            map[composeAction.openDraft] = mailVerbs.unknown;

            this._getActionMailVerbMap = function () { return this._actionMailVerbMap; };
            return this._getActionMailVerbMap();
        },

        _getCalendarActionToComposeActionMap: function () {
            var map = this._calendarToComposeMap = {},
                calendarAction = Compose.CalendarActionType,
                composeAction = Compose.ComposeAction;

            map[calendarAction.forward] = composeAction.forward;
            map[calendarAction.reply] = composeAction.reply;
            map[calendarAction.replyAll] = composeAction.replyAll;
            map[calendarAction.accept] = composeAction.reply;
            map[calendarAction.tentative] = composeAction.reply;
            map[calendarAction.decline] = composeAction.reply;
            map[calendarAction.cancel] = composeAction.replyAll;

            this._getCalendarActionToComposeActionMap = function () { return this._calendarToComposeMap; };
            return this._getCalendarActionToComposeActionMap();
        }

    };

    Compose.util = new Compose.ComposeUtil();


    /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
    Debug.Compose = Debug.Compose || {};
    /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
    Debug.Compose.util = {

        isValidAction: function (action) {
            return Object.keys(Compose.ComposeAction).some(function (testAction) {
                return Compose.ComposeAction[testAction] === action;
            });
        }

    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Compose,Debug,Mail*/

Jx.delayGroup("MailCompose", function () {

    Compose.Component = /*@constructor*/function () {
        /// <summary>
        /// Base component for all compose components.
        /// Holds references to component utilities like componentCache, componentCreator, etc.
        /// Filters activateUI, deactivateUI, and updateModel calls to it's implemented component
        /// to ensure we don't call any of them unnecessarily when rebuilding compose expereiences.
        /// </summary>

        Jx.Component.call(this);

        this._isAddedToDOM = false;
        this._isActivated = false;

        this._componentCache = /*@static_cast(Compose.ComponentCache)*/null;
        this._componentCreator = /*@static_cast(Compose.ComponentCreator)*/null;
        this._validationViewController = /*@static_cast(Compose.ValidationViewController)*/null;
        this._mailMessageModel = /*@static_cast(Compose.MailMessageModel)*/null;
        this._componentBinder = /*@static_cast(Compose.ComponentBinder)*/null;
        this._element = /*@static_cast(HTMLElement)*/null;

        // Keep track of the last message model we used in updateUI. By keeping track of this, we can
        // avoid unnecessary updateUI calls to components that are already active with the desired UI.
        this._displayedMessageModel = /*@static_cast(Compose.MailMessageModel)*/null;
        
        
        // Store whether or not we have updated the message model on this particular updateModel pass.
        // Mail.ComposeInstrumentation uses this to ensure it is the last component to get an updateModel() call.
        this._messageModelUpdated = false;
        this._uiUpdated = false;
        
    };

    Jx.augment(Compose.Component, Jx.Component);

    var proto = Compose.Component.prototype;

    // Likely no need to override

    proto.getUI = function (ui) {
        if (!this.isAddedToDOM()) {
            this.composeGetUI(ui);
        }
    };

    proto.activateUI = function () {
        if (!this._isActivated && Jx.isFunction(this.composeActivateUI)) {
            this.composeActivateUI();
        }
        this._isActivated = true;
        this._isAddedToDOM = true;

        // Don't use Jx.Component.activateUI because it will filter out anything we haven't called getUI on
        this._applyOnEachChild("activateUI");
    };

    proto.isActivated = function () {
        return this._isActivated;
    };

    proto.deactivateUI = function () {
        Debug.assert(this._isActivated);

        // Don't use Jx.Component.activateUI because it will filter out anything we haven't called getUI on
        this._applyOnEachChild("deactivateUI");

        this.composeDeactivateUI();
        this._componentCache.removeComponent(this);

        this._isActivated = false;
        this._displayedMessageModel = null;

        this._componentCache = /*@static_cast(Compose.ComponentCache)*/null;
        this._componentCreator = /*@static_cast(Compose.ComponentCreator)*/null;
        this._validationViewController = /*@static_cast(Compose.ValidationViewController)*/null;
        this._mailMessageModel = /*@static_cast(Compose.MailMessageModel)*/null;
        this._componentBinder = /*@static_cast(Compose.ComponentBinder)*/null;
    };

    proto.updateUI = function () {
        if (this._displayedMessageModel !== this._mailMessageModel) {
            // Ensure the mailMessage is created before updating the UI.
            // That way, we ensure we could load the message before telling the UI how to display it.
            this._mailMessageModel.getPlatformMessage();

            this._displayedMessageModel = this._mailMessageModel;
            this.composeUpdateUI();

            Debug.only(this._uiUpdated = true);
        }

        this._applyOnEachChild("updateUI");
    };

    proto.updateChildComponent = function (child) {
        /// <summary>Helper function to update a child component with all the properties on this component</summary>
        /// <param name="child" type="Compose.Component"></param>
        Debug.assert(Jx.isObject(child));

        child.setComponentCache(this._componentCache);
        child.setComponentCreator(this._componentCreator);
        child.setMailMessageModel(this._mailMessageModel);
        child.setValidationViewController(this._validationViewController);
        child.setComponentBinder(this._componentBinder);
        child.setRootElement(this._element);
    };

    proto.setComponentCache = function (componentCache) {
        /// <summary>Saves a reference to the given cache and adds ourself and all children to the cache</summary>
        /// <param name="componentCache" type="Compose.ComponentCache"></param>
        Debug.assert(Jx.isObject(componentCache));

        if (this._componentCache !== componentCache) {
            Debug.assert(Jx.isNullOrUndefined(this._componentCache));

            // First, add ourselves to the cache
            componentCache.addComponent(this);

            this._componentCache = componentCache;
        }
        this._applyOnEachChild("setComponentCache", [componentCache]);
    };
    proto.getComponentCache = function () {
        return this._componentCache;
    };

    proto.setComponentBinder = function (componentBinder) {
        /// <param name="componentBinder" type="Compose.ComponentBinder"></param>
        Debug.assert(this._componentBinder === null || this._componentBinder === componentBinder);
        if (this._componentBinder !== componentBinder) {
            this._componentBinder = componentBinder;
        }
        this._applyOnEachChild("setComponentBinder", [componentBinder]);
    };
    proto.getComponentBinder = function () {
        return this._componentBinder;
    };

    proto.removeFromComponentCache = function () {
        Debug.assert(Jx.isObject(this._componentCache));
        this._componentCache.removeComponent(this);
        this._componentCache = null;
    };

    proto.setComponentCreator = function (componentCreator) {
        /// <param name="componentCache" type="Compose.ComponentCreator"></param>
        Debug.assert(Jx.isObject(componentCreator));

        if (this._componentCreator !== componentCreator) {
            this._componentCreator = componentCreator;
            this._applyOnEachChild("setComponentCreator", [componentCreator]);
        }
    };
    proto.getComponentCreator = function () {
        return this._componentCreator;
    };

    proto.setMailMessageModel = function (messageModel) {
        /// <param name="messageModel" type="Compose.MailMessageModel"></param>
        Debug.assert(Jx.isObject(messageModel));
        
        if (this._mailMessageModel !== messageModel) {
            this._mailMessageModel = messageModel;
            this._applyOnEachChild("setMailMessageModel", [messageModel]);
        }
    };
    proto.getMailMessageModel = function () {
        return this._mailMessageModel;
    };

    proto.setValidationViewController = function (validationViewController) {
        /// <param name="validationViewController" type="Compose.ValidationViewController"></param>
        Debug.assert(Jx.isObject(validationViewController));
        
        if (this._validationViewController !== validationViewController) {
            this._validationViewController = validationViewController;
            this._applyOnEachChild("setValidationViewController", [validationViewController]);
        }
    };
    proto.getValidationViewController = function () {
        return this._validationViewController;
    };

    proto.setRootElement = function (element) {
        /// <summary>Set the root element of this compose experience</summary>
        /// <param name="element" type="HTMLElement"></param>
        Debug.assert(Jx.isObject(element));
        this._element = element;
    };
    proto.getComposeRootElement = function () {
        /// <summary>Returns the root element of this compose experience</summary>
        return this._element;
    };

    proto.isAddedToDOM = function () {
        Debug.call(/*@bind(Compose.Component)*/function () {
            this.forEachChild(/*@bind(Compose.Component)*/function (child) {
                /// <param name="child" type="Compose.Component"></param>
                if (Jx.isFunction(child.isAddedToDOM)) {
                    Debug.assert(child.isAddedToDOM() === this._isAddedToDOM);
                }
            }.bind(this));
        }.bind(this));

        return this._isAddedToDOM;
    };

    proto.validate = function (type) {
        /// <param name="type" type="String">save|send</param>
        /// <returns>
        /// Returns an array of invalid component class names.
        /// </returns>
        Debug.assert(["save", "send"].indexOf(type) !== -1);

        // Validate ourselves
        var isValid = this.composeValidate(type),
            invalidClassNames = [];
        if (!isValid) {
            invalidClassNames.push(this.getClassName());
        }

        // Now validate all children
        this.forEachChild(function (child) {
            /// <param name="child" type="Compose.Component"></param>
            if (Jx.isFunction(child.validate)) {
                invalidClassNames = invalidClassNames.concat(child.validate(type));
            }
        });

        return invalidClassNames;
    };

    
    proto.resetIsMessageModelUpdated = function () {
        /// <summary>
        /// Used to store whether or not we have updated the message model on this particular updateModel pass.
        /// Mail.ComposeInstrumentation uses this to ensure it is the last component to get an updateModel() call.
        /// </summary>
        this._messageModelUpdated = false;
        this._applyOnEachChild("resetIsMessageModelUpdated");
    };

    proto.getIsMessageModelUpdated = function () {
        return this._messageModelUpdated;
    };

    proto.resetIsUIUpdated = function () {
        this._uiUpdated = false;
        this._applyOnEachChild("resetIsUIUpdated");
    };

    proto.getIsUIUpdated = function () {
        return this._uiUpdated;
    };
    

    // The following functions will likely need to be overriden

    proto.composeGetUI = function () {
        /// <summary>Components should implement this instead of getUI</summary>
    };

    proto.composeActivateUI = function () {
        /// <summary>Components should implement this instead of activateUI</summary>
    };

    proto.composeDeactivateUI = function () {
        /// <summary>Components should implement this instead of deactivateUI</summary>
    };

    proto.composeUpdateUI = function () {
        /// <summary>Components should implement this instead of updateUI</summary>
    };

    proto.composeValidate = function (type) {
        /// <summary>Components should implement this instead of validate.</summary>
        /// <param name="type" type="String">save|send</param>
        /// <returns>Returns true if this component is currently valid</returns>
        Debug.assert(["save", "send"].indexOf(type) !== -1);
        return true;
    };

    proto.setIsAddedToDOM = function (isAdded) {
        /// <summary>Tells the child component whether it has or has not been added to the DOM. If false, the child component should dispose all of its state</summary>
        /// <param name="isAdded" type="Boolean"></param>
        Debug.assert(Jx.isBoolean(isAdded));
        this._isAddedToDOM = isAdded;
        this._applyOnEachChild("setIsAddedToDOM", [isAdded]);
    };

    proto.updateModel = function (action) {
        /// <param name="action" type="String">send|save</param>
        Debug.assert(Mail.composeUtil.isValidAction(action));

        Debug.only(this._messageModelUpdated = true);

        this.forEachChild(function (child) {
            /// <param name="child" type="Compose.Component"></param>
            if (Jx.isFunction(child.updateModel)) {
                child.updateModel(action);
            }
        });
    };

    proto.isDirty = function () {
        /// <returns>Returns true when this component has changed the message content since the last call to updateUI.</returns>
        return false;
    };

    // Must be overriden (also, components should put this on the ctor namespace, not the prototype)

    proto.getClassName = function () {
        /// <summary>Returns unique class name for this component</summary>
        Debug.assert(false, "Need to implement getClassName");
        return "";
    };

    // Private

    proto._applyOnEachChild = function (fnName, params) {
        /// <param name="fnName" type="String"></param>
        /// <param name="params" type="Array" optional="true"></param>
        params = params || [];
        this.forEachChild(function (child) {
            /// <param name="child" type="Compose.Component"></param>
            if (Jx.isFunction(child[fnName])) {
                child[fnName].apply(child, params);
            }
        });
    };

});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.ComponentCache = /*@constructor*/function () {
        this._components = {};
    };
    Jx.inherit(Compose.ComponentCache, Jx.Events);

    var proto = Compose.ComponentCache.prototype;

    Debug.Events.define(proto, "added", "removed");

    proto.hasComponent = function (componentClassName) {
        /// <param name="componentClassName" type="String"></param>
        Debug.assert(Jx.isNonEmptyString(componentClassName));
        return !Jx.isNullOrUndefined(this._components[componentClassName]);
    };

    proto.getComponent = function (componentClassName) {
        /// <param name="componentClassName" type="String"></param>
        Debug.assert(Jx.isNonEmptyString(componentClassName));
        return /*@static_cast(Compose.Component)*/this._components[componentClassName];
    };

    proto.forEachComponent = function (callback) {
        /// <summary>Iterates all components except Compose.ComposeImpl</summary>
        /// <param name="callback" type="Function">fn(component)</param>
        Debug.assert(Jx.isFunction(callback));
        var components = this._components;
        Object.keys(components).filter(function (className) {
            return className !== "Compose.ComposeImpl" && !Jx.isNullOrUndefined(components[className]);
        }).forEach(function (className) {
            callback(components[className]);
        });
    };
    
    proto.addComponent = function (component) {
        /// <param name="component" type="Compose.Component"></param>
        Debug.assert(Jx.isObject(component));
        if (Jx.isNullOrUndefined(this._components[component.getClassName()])) {
            this._components[component.getClassName()] = component;
            this.raiseEvent("added", { component: component });
        }
    };

    proto.removeComponent = function (component) {
        /// <param name="component" type="Compose.Component"></param>
        Debug.assert(Jx.isObject(component));
        Debug.assert(!Jx.isNullOrUndefined(this._components[component.getClassName()]));

        this._components[component.getClassName()] = null;
        this.raiseEvent("removed", { component: component });
    };

});
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="compose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.ComponentCreator = /*@constructor*/function () {
        this._instances = {};
    };

    var proto = Compose.ComponentCreator.prototype;

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    proto.getInstance = function (Ctor, disallowCreate) {
        /// <enable>JS2076.IdentifierIsMiscased</enable>
        /// <summary>Returns an instance for the given ctor. If one exists, returns that. Else, returns a new one.</summary>
        /// <param name="Ctor" type="Compose.ComponentCtor">Namespace for the component</param>
        /// <param name="disallowCreate" type="Boolean" optional="true">If true, will return null if an instance does not already exist for this ctor.</param>
        Debug.assert(Jx.isFunction(Ctor));
        Debug.assert(Jx.isFunction(Ctor.getClassName),
            "Component ctors need to define getClassName() method. See Compose.ComponentCtor.");
        Debug.assert(Jx.isNonEmptyString(Ctor.getClassName()));

        var instance = this._instances[Ctor.getClassName()];
        if (!disallowCreate && Jx.isNullOrUndefined(instance)) {
            instance = this._instances[Ctor.getClassName()] = new Ctor();
            Debug.assert(!Jx.isNullOrUndefined(instance));
        }

        return instance;
    };

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    proto.seedInstance = function (Ctor, instance) {
        /// <enable>JS2076.IdentifierIsMiscased</enable>
        /// <summary>Seeds an instance for the given ctor. Allows mutliple creators to use the same instance of given components.</summary>
        /// <param name="Ctor" type="Compose.ComponentCtor">Namespace for the component</param>
        /// <param name="instance" type="Compose.Component">Instance of that component</param>
        Debug.assert(Jx.isFunction(Ctor));
        Debug.assert(Jx.isFunction(Ctor.getClassName),
            "Component ctors need to define getClassName() method. See Compose.ComponentCtor.");
        Debug.assert(Jx.isObject(instance));
        this._instances[Ctor.getClassName()] = instance;
    };

});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true */
/*global Mail,Jx,Debug,Microsoft,Compose,ModernCanvas,FromControl */

Jx.delayGroup("MailCompose", function () {

    // Maps body properties to MailBodyType property
    var bodyProperties = {
        htmlBody: "html",
        textBody: "plainText"
    };
    var _isBodyProperty = function (prop) {
        /// <param name="prop" type="String"></param>
        return bodyProperties.hasOwnProperty(prop);
    };

    // Properties that require special handling
    var specialProperties = {
        fromEmail: "fromEmail",
        moveToOutbox: "moveToOutbox"
    };

    var _isNormalProperty = function (prop) {
        /// <param name="prop" type="String" />
        return !(bodyProperties.hasOwnProperty(prop) || specialProperties.hasOwnProperty(prop));
    };

    var _getMailBody = function (message, bodyType) {
        /// <summary>Returns a body of specified type from the message</summary>
        /// <param name="message" type="Microsoft.WindowsLive.Platform.IMailMessage">Source message</param>
        /// <param name="bodyType" type="Microsoft.WindowsLive.Platform.MailBodyType">Type of the body</param>
        Debug.assert(message);
        Debug.assert(bodyType === Microsoft.WindowsLive.Platform.MailBodyType.html || bodyType === Microsoft.WindowsLive.Platform.MailBodyType.plainText);

        var body;
        // Check if we already have the requested body type
        if (message.hasBody(bodyType)) {
            body = message.getBody(bodyType);
        } else {
            body = message.createBody();
            // Set the message body as the given type
            body.type = bodyType;
        }
        return body;
    };

    Compose.MailMessageModel = /*@constructor*/function (spec) {
        /// <summary>
        /// Model that keeps a js cache and commits to a backing platform MailMessage.
        /// Provides change events without actually having to commit the message to the db.
        /// Uses backbone.js style get/set API.
        /// Also provides some other helper functions/state for building a new compose experience (initAction, bodyContents, etc.).
        /// </summary>
        /// <param name="spec" type="Compose.MessageModelSpec"></param>
        Debug.assert(Jx.isObject(spec));

        this._cachedValues = {};
        this._mailMessage = /*@static_cast(Microsoft.WindowsLive.Platform.IMailMessage)*/null;
        this._isDeleted = false;

        // This represents a newly created message if the passed-in message creator creates new messages'
        ///<disable>JS3092.DeclarePropertiesBeforeUse</disable>
        this._isNew = Jx.isObject(spec.messageCreator) ? spec.messageCreator.generatesNewPlatformMessage() : true;
        ///<enable>JS3092.DeclarePropertiesBeforeUse</enable>

        var messageCreator = this._mailMessageCreator = Compose.FallbackMessageCreator.instance(spec.messageCreator);
        messageCreator.setMailMessageModel(this);

        this._bodyContents = /*@static_cast(Array)*/null;
        this.setSignatureLocation(spec.signatureLocation || ModernCanvas.SignatureLocation.none);
        this.setInitAction(spec.initAction);
    };
    Jx.inherit(Compose.MailMessageModel, Jx.Events);

    Compose.MailMessageModel.instance = function (spec, /*@dynamic*/defaultValues) {
        /// <summary>Model that keeps a js cache and commits to a backing platform MailMessage</summary>
        /// <param name="spec" type="Compose.MessageModelSpec"></param>
        /// <param name="defaultValues" type="Object" optional="true"></param>
        var model = new Compose.MailMessageModel(spec);

        if (Jx.isObject(defaultValues)) {
            model.set(defaultValues);
        }

        return model;
    };

    Compose.MailMessageModel.stubInstance = function () {
        /// <summary>
        /// Creates a message model that will behave like a real message model, but will not commit any changes to the platform.
        /// Useful for pre-loading a compose in the background as a perf optimization.
        /// </summary>
        var model = new Compose.MailMessageModel({
                initAction: Compose.ComposeAction.createNew,
                signatureLocation: ModernCanvas.SignatureLocation.start
            }),
            documentFragment = document.createDocumentFragment();

        // Stub out body contents to return an element
        model.getBodyContents = function () {
            return [{ content: documentFragment, format: ModernCanvas.ContentFormat.documentFragment, location: ModernCanvas.ContentLocation.end }];
        };

        // Stub out the commit operation
        model.commit = /*@bind(Compose.MailMessageModel)*/function () {
            this.raiseEvent("aftercommit");
        };

        return model;
    };

    var proto = Compose.MailMessageModel.prototype;

    Debug.MailMessageModel = {
        properties: [
            "to", "cc", "bcc", "toRecipients", "ccRecipients", "bccRecipients", "fromRecipient", "htmlBody", "textBody", "photoMailAlbumName", "subject", "sourceVerb", "objectId",
            "photoMailFlags", "outboxQueue", "hasOrdinaryAttachments", "accountId", "fromEmail", "sourceMessageStoreId", "sanitizedVersion",
            "irmCanEdit", "irmCanExtractContent", "irmIsContentOwner", "irmCanRemoveRightsManagement", "irmTemplateId", "parentConversationId",
            "irmHasTemplate", "irmCanModifyRecipients", "importance", "irmTemplateName", "irmTemplateDescription", "moveToOutbox"
        ],
        verifiers: {
            to: Jx.isString,
            cc: Jx.isString,
            bcc: Jx.isString,
            toRecipients: Jx.isObject,
            ccRecipients: Jx.isObject,
            bccRecipients: Jx.isObject,
            fromRecipient: Jx.isObject,
            htmlBody: Jx.isString,
            textBody: Jx.isString,
            sourceMessageStoreId: Jx.isNumber,
            sanitizedVersion: Jx.isNumber,
            subject: Jx.isString,
            sourceVerb: Jx.isNumber,
            objectId: Jx.isNumber,
            parentConversationId: Jx.isNumber,
            photoMailFlags: Jx.isNumber,
            outboxQueue: Jx.isNumber,
            hasOrdinaryAttachments: Jx.isBoolean,
            accountId: Jx.isNonEmptyString,
            irmHasTemplate: Jx.isBoolean,
            irmCanModifyRecipients: Jx.isBoolean,
            fromEmail: Jx.isString,
            irmCanEdit: Jx.isBoolean,
            irmCanExtractContent: Jx.isBoolean,
            irmIsContentOwner: Jx.isBoolean,
            irmCanRemoveRightsManagement: Jx.isBoolean,
            irmTemplateId: Jx.isString,
            importance: Jx.isNumber,
            irmTemplateName: Jx.isString,
            irmTemplateDescription: Jx.isString,
            moveToOutbox: Jx.isBoolean
        },
        isValidProperty: function (prop) {
            return Debug.MailMessageModel.properties.indexOf(prop) !== -1;
        },
        isValidValue: function (prop, value) {
            return !Debug.MailMessageModel.verifiers.hasOwnProperty(prop) || Debug.MailMessageModel.verifiers[prop](value);
        },
        assertIsValidProperty: function (prop) {
            Debug.assert(Debug.MailMessageModel.isValidProperty(prop), "Invalid MailMessage property:" + prop);
        },
        assertIsValidPropertyAndValue: function (prop, value) {
            Debug.MailMessageModel.assertIsValidProperty(prop);
            Debug.assert(Debug.MailMessageModel.isValidValue(prop, value), "Invalid MailMessage property value. property:" + prop + " value:'" + value + "'");
        }
    };
    Debug.Events.define(proto, "changed", "aftercommit");

    proto.set = function (properties) {
        /// <summary>Updates the local cache with all the new property values</summary>
        /// <param name="properties" type="Object"></param>
        Debug.assert(Jx.isObject(properties));

        if (!this._isDeleted) {

            var changed = false;
            Object.keys(properties).forEach(/*@bind(Compose.MailMessageModel)*/function (prop) {
                Debug.MailMessageModel.assertIsValidPropertyAndValue(prop, properties[prop]);

                if (this._cachedValues[prop] !== properties[prop]) {
                    this._cachedValues[prop] = properties[prop];
                    changed = true;
                }

                // If any body property is set, erase the bodyContents cache property in favor of this new value
                if (!Jx.isNullOrUndefined(this._bodyContents) && _isBodyProperty(prop)) {
                    // Use this new body property in favor of our initial "bodyContents" property
                    this._bodyContents = null;
                }
            }.bind(this));

            if (changed) {
                this.raiseEvent("changed");
            }
        }
    };

    proto.get = function (prop) {
        /// <param name="prop" type="String"></param>
        Debug.MailMessageModel.assertIsValidProperty(prop);

        if (!Jx.isUndefined(this._cachedValues[prop])) {
            return this._cachedValues[prop];
        } else if (_isNormalProperty(prop)) {
            return this.getPlatformMessage()[prop];
        } else if (_isBodyProperty(prop)) {
            return this._getMailBodyObject(prop).body;
        } else if (prop === specialProperties.fromEmail) {
            return this._getFromEmail();
        } else if (prop === specialProperties.moveToOutbox) {
            return false;
        } else {
            Debug.assert(false);
            return null;
        }
    };

    // Custom

    proto.getBodyContents = function () {
        /// <summary>Returns a set of body contents descriptions that should be used to fill a blank canvas</summary>
        /// <returns>[Compose.BodyContent, Compose.BodyContent, ...]</returns>
        if (this._isDeleted) {
            return [];
        }

        if (!Jx.isNullOrUndefined(this._bodyContents)) {
            return this._bodyContents;
        } else {
            var platformMessage = this.getPlatformMessage(),
                account = Mail.Account.load(platformMessage.accountId, Compose.platform),
                bodyDocument = Mail.getScrubbedDocument(Compose.platform, new Mail.UIDataModel.MailMessage(platformMessage, account)),
                documentFragment = ModernCanvas.Mail.convertDocumentToDocumentFragment(bodyDocument);
            return [{ content: documentFragment, format: ModernCanvas.ContentFormat.documentFragment, location: ModernCanvas.ContentLocation.end }];
        }
    };

    proto.setBodyContents = function (bodyContents) {
        /// <param name="bodyContents" type="Array"></param>
        Debug.assert(Jx.isArray(bodyContents));

        if (!this._isDeleted) {
            // Validate contents
            Debug.only(bodyContents.forEach(function (content) {
                /// <param name="content" type="Compose.BodyContent"></param>
                Debug.assert(Jx.isObject(content));
                Debug.assert(
                    ((Jx.isObject(content.content) || Jx.isString(content.content)) && Jx.isNonEmptyString(content.format) && Jx.isNonEmptyString(content.location)) ||
                    (Jx.isNonEmptyString(content.signatureLocation)));
            }));

            this._bodyContents = bodyContents;
        }
    };

    proto.addBodyContents = function (bodyContents) {
        /// <param name="bodyContents" type="Array"></param>
        Debug.assert(Jx.isArray(bodyContents));
        this.setBodyContents(this.getBodyContents().concat(bodyContents));
    };

    proto.prependBodyContents = function (bodyContents) {
        /// <param name="bodyContents" type="Array"></param>
        Debug.assert(Jx.isArray(bodyContents));
        this.setBodyContents(bodyContents.concat(this.getBodyContents()));
    };

    proto.getSignatureLocation = function () {
        /// <summary>Returns a signature location that should be used to activate a blank canvas</summary>
        /// <returns>ModernCanvas.SignatureLocation</returns>
        return this._signatureLocation;
    };

    proto.setSignatureLocation = function (signatureLocation) {
        /// <param name="signatureLocation" type="String"></param>
        Debug.assert(ModernCanvas.SignatureLocation.hasOwnProperty(signatureLocation));
        this._signatureLocation = signatureLocation;
    };

    proto.getInitAction = function () {
        /// <summary>Returns the action representing how the UI should utilitize this message model</summary>
        return this._initAction;
    };

    proto.setInitAction = function (action) {
        /// <param name="action" type="Number">Compose.ComposeAction</param>
        Debug.assert(Debug.Compose.util.isValidAction(action));
        this._initAction = action;
    };

    // Platform operations

    proto._sync = function (propertiesToSkip) {
        /// <summary>Syncs local changes to the backing platform mail message</summary>
        /// <param name="propertiesToSkip" type="Array">Array of properties that should not be sync'd to the platform</param>
        if (!this._isDeleted && !this.isSent()) {
            Compose.mark("sync", Compose.LogEvent.start);

            var cachedValues = this._cachedValues;
            this._cachedValues = {};

            propertiesToSkip = propertiesToSkip || [];

            // Sync normal properties
            var mailMessage = this.getPlatformMessage();
            Object.keys(cachedValues).filter(function (prop) {
                return _isNormalProperty(prop) && propertiesToSkip.indexOf(prop) === -1;
            }).forEach(function (prop) {
                mailMessage[prop] = cachedValues[prop];
            });

            // Sync body properties
            Object.keys(bodyProperties).filter(function (prop) {
                return cachedValues.hasOwnProperty(prop);
            }).forEach(/*@bind(Compose.MailMessageModel)*/function (prop) {
                this._getMailBodyObject(prop).body = cachedValues[prop];
            }.bind(this));

            // Sync the from field
            if (cachedValues.hasOwnProperty(specialProperties.fromEmail)) {
                this._syncFromEmail(mailMessage, cachedValues[specialProperties.fromEmail]);
            }

            if (cachedValues.hasOwnProperty(specialProperties.moveToOutbox) && cachedValues[specialProperties.moveToOutbox]) {
                this.getPlatformMessage().moveToOutbox();
            }

            Compose.mark("sync", Compose.LogEvent.stop);
        }
    };

    proto.commit = function (propertiesToSkip) {
        /// <summary>Syncs local changes to the backing platform mail message and commits the platform message.</summary>
        /// <param name="propertiesToSkip" type="Array">Array of properties that should not be commited to the platform</param>
        if (!this._isDeleted && !this.isSent()) {
            this._sync(propertiesToSkip);

            Compose.log("commit", Compose.LogEvent.start);
            // Note: commit will fail if this message was deleted.
            // Unfortunately, we can't always tell when the message has been deleted because it can be done through the platform.
            // Instead, we'll just try to commit, and then assume the message is deleted if the commit fails.
            try {
                this.getPlatformMessage().commit();
            } catch (e) {
                // Silently fail since this happens often. See comment above.
            }
            Compose.log("commit", Compose.LogEvent.stop);

            this.raiseEvent("aftercommit");
        }
    };

    proto.deletePlatformMessage = function () {
        if (!this._isDeleted) {
            ///<disable>JS3092.DeclarePropertiesBeforeUse</disable>
            if (Compose.util.isMailMessageCommitted(this._mailMessage)) {
                try {
                    this._mailMessage.deleteObject();
                } catch (e) {
                    Jx.log.exception("this._mailMessage.deleteObject failed", e);
                }
            }
            ///<enable>JS3092.DeclarePropertiesBeforeUse</enable>
            this._mailMessage = null;
            this._cachedValues = null;
            this._isDeleted = true;
        }
    };

    proto.getPlatformMessage = function () {
        this.getPlatformMessage = function () {
            return this._mailMessage;
        };

        this._mailMessage = /*@static_cast(Microsoft.WindowsLive.Platform.IMailMessage)*/this._mailMessageCreator.createMessage();
        Debug.assert(Jx.isObject(this._mailMessage));

        Compose.log("prepareMessage", Compose.LogEvent.start);
        this._mailMessageCreator.onMessageCreated();
        Compose.log("prepareMessage", Compose.LogEvent.stop);

        return this.getPlatformMessage();
    };

    proto.isCommitted = function () {
        /// <returns type="Boolean">Returns true when the platform message has been created and saved at least once</returns>
        return Jx.isObject(this._mailMessage) && Compose.util.isMailMessageCommitted(this._mailMessage);
    };

    proto.isNew = function () {
        /// <summary>Returns true when this model is based on a newly-created message, rather than one loaded from the database</summary>
        /// <returns type="Boolean"></returns>
        return this._isNew;
    };

    proto.isSent = function () {
        /// <summary>Returns true after this model is no longer a draft. This happens when the message is moved to the outbox.</summary>
        /// <returns type="Boolean"></returns>

        var FolderType = Microsoft.WindowsLive.Platform.MailFolderType;

        // We should not be in any folder other than either the drafts or the outbox. If we are, we have deeper problems that need investigation.
        Debug.assert(!Jx.isObject(this._mailMessage) || this._mailMessage.isInSpecialFolderType(FolderType.drafts) || this._mailMessage.isInSpecialFolderType(FolderType.outbox));
        return Jx.isObject(this._mailMessage) && !this._mailMessage.isInSpecialFolderType(FolderType.drafts);
    };

    // Private

    proto._getMailBodyObject = function (bodyProperty) {
        /// <param name="bodyProperty" type="String"></param>
        Debug.assert(_isBodyProperty(bodyProperty));

        return _getMailBody(this.getPlatformMessage(),
            Microsoft.WindowsLive.Platform.MailBodyType[bodyProperties[bodyProperty]]);
    };

    proto._getFromEmail = function () {
        var platformMessage = this.getPlatformMessage(),
            fromRecipient = platformMessage.fromRecipient;

        if (fromRecipient) {
            return fromRecipient.emailAddress;
        } else {
            // If the from field isn't set on the message, return the primary email address for this account
            var platform = Compose.platform,
                account = platform.accountManager.loadAccount(platformMessage.accountId);
            if (account) {
                return account.emailAddress;
            } else {
                return null;
            }
        }
    };

    proto._syncFromEmail = function (mailMessage, fromEmail) {
        /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage" />
        /// <param name="fromEmail" type="String" />
        Debug.assert(Jx.isObject(mailMessage));
        Debug.assert(Jx.isString(fromEmail));
        var platform = Compose.platform,
            account = platform.accountManager.loadAccount(mailMessage.accountId),
            from = fromEmail;

        if (account) {
            from = FromControl.buildFromString(fromEmail, account);
        }
        mailMessage.from = from;
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Compose, Debug, Mail, WinJS*/

Jx.delayGroup("MailCompose", function () {

    var ComposeImpl = Compose.ComposeImpl = function () {
        /// <summary>
        /// Client-facing compose API. Parent component for all compose components and handles, send, save, and discard actions.
        /// </summary>
        Compose.Component.call(this);

        this._actionHandlers = null;
        this._isDirty = false;
    };
    Jx.augment(ComposeImpl, Jx.Events);
    Jx.augment(ComposeImpl, Compose.Component);

    var composeImplClassName = "Compose.ComposeImpl";
    Compose.util.defineClassName(ComposeImpl, composeImplClassName);

    // Helpers

    ComposeImpl.getComposeImpl = function (componentCache) {
        /// <param name="componentCache" type="Compose.ComponentCache"></param>
        return componentCache.getComponent(composeImplClassName);
    };

    ComposeImpl.getComposeWindow = function (componentCache) {
        /// <param name="componentCache" type="Compose.ComponentCache"></param>
        /// <returns type="HTMLElement"></returns>
        var composeImpl = ComposeImpl.getComposeImpl(componentCache),
            composeWindow = composeImpl ? composeImpl.getComposeRootElement().querySelector(".composeWindow") : null;
        return composeWindow;
    };

    ComposeImpl.quietSave = function (componentCache) {
        /// <summary>Saves the current message without running action handlers associated with the "save" action</summary>
        /// <param name="componentCache" type="Compose.ComponentCache"></param>
        Debug.assert(Jx.isObject(componentCache));
        ComposeImpl.getComposeImpl(componentCache).save(true /*suppressActionHandler*/);
    };

    var proto = Compose.ComposeImpl.prototype;

    Debug.Events.define(proto, "beforesave", "aftersave", "beforesend", "aftersend", "beforediscard", "afterdiscard");

    proto.activateUI = function () {
        Compose.log("activateUI", Compose.LogEvent.start);

        Compose.log("activateUI_jx", Compose.LogEvent.start);
        Compose.Component.prototype.activateUI.call(this);
        Compose.log("activateUI_jx", Compose.LogEvent.stop);

        var element = this.getComposeRootElement().querySelector(".composeWindow");
        Debug.assert(Jx.isObject(element));

        Compose.log("winJsProcessAll", Compose.LogEvent.start);
        Compose.WinJsUI.processAll(element);
        Compose.log("winJsProcessAll", Compose.LogEvent.stop);

        Compose.log("jxProcessAll", Compose.LogEvent.start);
        Jx.res.processAll(element);
        Compose.log("jxProcessAll", Compose.LogEvent.stop);

        Compose.log("activateUI", Compose.LogEvent.stop);
    };

    proto.addComponent = function (component) {
        /// <param name="component" type="Compose.Component"></param>
        Debug.assert(Jx.isObject(component));

        this.append(component);
        this.updateChildComponent(component);
    };

    proto.setActionHandlers = function (actionHandlers) {
        /// <param name="actionHandler" type="Compose.ActionHandlersSpec"></param>
        this._actionHandlers = actionHandlers;
    };

    proto.send = function () {
        /// <returns>Returns a promise that completes when send is complete. If validation fails, returns a promise with { success: false }.</returns>
        Compose.log("sendMail", Compose.LogEvent.start);

        var success = { success: false },
            type = "send";
        if (this._validate(type)) {
            success = this._actionHandlers[type].runAnimation(this.getComponentCache()).then(function () {
                return { success: this._runAction(type, this.updateModel.bind(this, type)) };
            }.bind(this));
        }
        Compose.log("sendMail", Compose.LogEvent.stop);

        return WinJS.Promise.as(success);
    };

    proto.save = function (suppressActionHandler, hideCurrent) {
        /// <param name="suppressActionHandler" type="Boolean" optional="true"></param>
        /// <param name="hideCurrent" type="Boolean" optional="true"></param>
        Compose.log("saveDraft", Compose.LogEvent.start);
        var type = "save";
        if (this._validate(type, suppressActionHandler)) {
            this._runAction(type, this.updateModel.bind(this, hideCurrent ? "hideCurrent" : type), suppressActionHandler);
        }

        if (Mail.Utilities.ComposeHelper.isComposeShowing) {
            var messageModel = this.getMailMessageModel(),
                message = messageModel.getPlatformMessage();
            Mail.Utilities.ComposeHelper.updateWindowTitleWithMessage(message);
        }
        Compose.log("saveDraft", Compose.LogEvent.stop);
    };

    proto.discard = function () {
        Compose.log("discardMail", Compose.LogEvent.start);

        var type = "discard",
            selection = Mail.Utilities.ComposeHelper._selection,
            messages = selection.messages;
        this._actionHandlers[type].runAnimation(this.getComponentCache()).done(function () {
            this._runAction(type, function () {
                selection.deleteItems(messages);
            });
        }.bind(this));

        Compose.log("discardMail", Compose.LogEvent.stop);
    };

    proto.updateUI = function () {
        Compose.log("completeLaunch", Compose.LogEvent.start);
        Compose.Component.prototype.updateUI.call(this);
        Compose.log("completeLaunch", Compose.LogEvent.stop);

        Debug.only(this.resetIsUIUpdated());
    };

    proto.updateModel = function (action) {
        /// <param name="action" type="String">send|save</param>
        /// <returns type="Boolean"></returns>

        // We only save if there have been changes to this message since compose was opened
        var messageModel = this.getMailMessageModel(),
            success = false;
        if (messageModel && (action === "send" || this.isDirty()) ) {
            Compose.Component.prototype.updateModel.call(this, action);
            Debug.only(this.resetIsMessageModelUpdated());

            var platform = Compose.platform,
                account = platform.accountManager.loadAccount(messageModel.get("accountId"));

            // During the first sync when we load a stub compose in the background, it is possible for the accountId to be null
            // In that case, it's safe to ignore the rest of this function because the message model is a mock object anyway
            if (!Jx.isNullOrUndefined(account)) {
                if (action === "send") {
                    messageModel.set({ moveToOutbox: true });
                }

                // Don't commit the accountId on "save" action
                messageModel.commit(action === "save" ? ["accountId"] : []);
                success = true;
            }
        }
        return success;
    };

    proto.isDirty = function () {
        /// <returns>Returns true when any sub component is dirty.</returns>
        if (this._isDirty) {
            return true;
        }

        var dirty = false;
        this.forEachChild(function (child) {
            /// <param name="child" type="Compose.Component"></param>
            dirty = dirty || child.isDirty();
        });
        return dirty;
    };

    proto.setDirtyState = function (dirty) {
        /// <param name="dirty" type="Boolean"></param>
        /// Sets the compose experience as a whole as either dirty or not.
        /// Note that setting this function with the value false does not guarantee that isDirty() will return false; isDirty() will still return true if one of this compose's components is dirty.
        this._isDirty = dirty;
    };

    // Private helpers

    proto._validate = function (type, suppressActionHandler) {
        /// <param name="type" type="String">send|save</param>
        /// <param name="suppressActionHandler" type="Boolean" optional="true"></param>
        /// <returns>Boolean, true if all compose components are valid</returns>
        Debug.assert(["send", "save"].indexOf(type) !== -1);

        var isValid = false,
            invalidComponents = Compose.Component.prototype.validate.call(this, type);
        Debug.assert(Jx.isArray(invalidComponents));

        if (!suppressActionHandler) {
            // Alert the components to display errors OR to remove any current error displays.
            this.getValidationViewController().display(invalidComponents);
        }

        if (invalidComponents.length === 0) {
            isValid = true;
        }
        return isValid;
    };

    proto._runAction = function (type, runAction, suppressActionHandler) {
        /// <summary>Calls the given runAction method surrounded by calls to the action handler</summary>
        /// <param name="type" type="String">send|save|discard</param>
        /// <param name="runAction" type="Function">Runs the actual action</param>
        /// <param name="suppressActionHandler" type="Boolean" optional="true"></param>
        var callHandler = function (method) {
            // Call the action handler for this operation if it exists, otherwise no-op
            if (!suppressActionHandler && Jx.isObject(this._actionHandlers) &&
                Jx.isObject(this._actionHandlers[type]) && Jx.isFunction(this._actionHandlers[type][method])) {
                // Call the function
                this._actionHandlers[type][method](this.getMailMessageModel(), this.getComponentCache());
            }
        }.bind(this);

        callHandler("beforeAction");
        this.raiseEvent("before" + type);
        var success = runAction();
        this.raiseEvent("after" + type);
        callHandler("afterAction");
        return success;
    };

});

//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="compose.ref.js" />
/// <reference path="binder.js" />

Jx.delayGroup("MailCompose", function () {

    Object.defineProperty(Compose, "binder", {
        get: function () {
            Object.defineProperty(Compose, "binder", { value: Jx.Binder.instance(), configurable: true });
            return Compose.binder;
        },
        configurable: true,
        enumerable: true
    });

    Compose.ComponentBinder = /*@constructor*/function (componentCache) {
        /// <summary>
        /// Adds functionality to Jx.Binder to add/remove listeners to Compose Components as they
        /// are added and removed from the compose component cache.
        /// </summary>
        /// <param name="componentCache" type="Compose.ComponentCache"></param>
        Debug.assert(Jx.isObject(componentCache));
        this._impl = Compose.ComponentBinderImpl.instance(componentCache);
    };

    var proto = Compose.ComponentBinder.prototype;

    // Provides a "class name" for ValidationViewController and MessageModel so components can listen to events on them,
    // just as they could a normal component.
    Compose.ComponentBinder.validationViewControllerClassName = "{{ValidationViewController}}";
    Compose.ComponentBinder.messageModelClassName = "{{MessageModel}}";

    proto.setValidationViewController = function (validationViewController) {
        /// <param name="validationViewController" type="Compose.ValidationViewController"></param>
        Debug.assert(Jx.isObject(validationViewController));
        this._impl.setValidationViewController(validationViewController);
    };

    proto.setMailMessageModel = function (messageModel) {
        /// <param name="messageModel" type="Compose.MailMessageModel"></param>
        Debug.assert(Jx.isObject(messageModel));
        this._impl.setMailMessageModel(messageModel);
    };

    proto.attach = function (target, bindingDefs) {
        /// <summary>Applies the given binding definitions on to the given target.</summary>
        /// <param name="target">Object for which the bindings should be applied</param>
        /// <param name="bindingDefs" type="Array"></param>
        Debug.assert(Jx.isObject(target));
        Debug.assert(Jx.isArray(bindingDefs));

        var bindings = {
            jxBindings: Compose.binder.attach(target, bindingDefs.filter(function (/*@dynamic*/def) {
                return Jx.isUndefined(def.fromComponent);
            })),
            componentBindings: []
        };

        // Bucket the component binding definitions by component name
        var componentDefinitions = {},
            impl = this._impl;
        bindingDefs.filter(function (/*@dynamic*/def) {
            return Jx.isNonEmptyString(def.fromComponent);
        }).forEach(function (/*@dynamic*/def) {
            var definitions = /*@static_cast(Array)*/(componentDefinitions[def.fromComponent] = componentDefinitions[def.fromComponent] || []);
            definitions.push(def);
        });

        // Now bind, and build detachments for all component bindings
        Object.keys(componentDefinitions).forEach(function (componentClassName) {
            var def = componentDefinitions[componentClassName];
            impl.attachToComponent(target, componentClassName, def);
            bindings.componentBindings.push({
                componentUnbind: function () {
                    impl.detachFromComponent(target, componentClassName, def);
                }
            });
        });

        return bindings;
    };

    proto.addAttach = function (bindings, target, bindingDefs) {
        var newBindings = this.attach(target, bindingDefs);
        bindings.jxBindings.concat(newBindings.jxBindings);
        bindings.componentBindings.concat(newBindings.componentBindings);

        return newBindings;
    };

    proto.detach = function (bindings) {
        /// <param name="bindings" type="Compose.ComponentBinderBinding"></param>
        Debug.assert(Jx.isObject(bindings));

        Compose.binder.detach(bindings.jxBindings);
        bindings.componentBindings.forEach(function (binding) {
            /// <param name="binding" type="Compose.ComponentBinderUnbinder"></param>
            binding.componentUnbind();
        });
    };

});

Jx.delayGroup("MailCompose", function () {

    Compose.ComponentBinderImpl = /*@constructor*/function (componentCache) {
        /// <summary>Handles adding/removing bindings as components are added and removed to the component cache</summary>
        /// <param name="componentCache" type="Compose.ComponentCache"></param>
        Debug.assert(Jx.isObject(componentCache));

        this._componentCache = componentCache;
        this._myBindings = null;

        // Additional event sources supported by the component binder
        var sources = this._eventSources = {};
        sources[k_validationViewControllerClassName] = /*@static_cast(Compose.ValidationViewController)*/null;
        sources[k_messageModelControllerClassName] = /*@static_cast(Compose.MailMessageModel)*/null;

        this._sourcesToTargetsMap = {};

        this._attachToComponentCache();
    };

    Compose.ComponentBinderImpl.instance = function (componentCache) {
        /// <param name="componentCache" type="Compose.ComponentCache"></param>
        return new Compose.ComponentBinderImpl(componentCache);
    };

    var proto = Compose.ComponentBinderImpl.prototype;

    var k_validationViewControllerClassName = Compose.ComponentBinder.validationViewControllerClassName,
        k_messageModelControllerClassName = Compose.ComponentBinder.messageModelClassName;

    proto.setValidationViewController = function (validationViewController) {
        /// <param name="validationViewController" type="Compose.ValidationViewController"></param>
        Debug.assert(Jx.isObject(validationViewController));
        this._setEventSource(validationViewController, k_validationViewControllerClassName);
    };

    proto.setMailMessageModel = function (messageModel) {
        /// <param name="messageModel" type="Compose.MailMessageModel"></param>
        Debug.assert(Jx.isObject(messageModel));
        this._setEventSource(messageModel, k_messageModelControllerClassName);
    };

    proto.attachToComponent = function (target, componentClassName, binderDefinitions) {
        /// <param name="target" type="Compose.Component">Component which will handle events</param>
        /// <param name="componentClassName" type="String">Component class name for which to listen for events when available</param>
        /// <param name="binderDefinitions" type="Array">[{ on:(string), then:(function) }, ...]</param>
        Debug.assert(Jx.isObject(target));
        Debug.assert(Jx.isNonEmptyString(componentClassName));
        Debug.assert(Jx.isArray(binderDefinitions));

        var targetClassName = target.getClassName(),
            def = { target: target, binderDefinitions: binderDefinitions, bindings: null };
        Debug.assert(targetClassName !== componentClassName);

        // Quick access for source->target
        var targets = this._sourcesToTargetsMap[componentClassName] = this._sourcesToTargetsMap[componentClassName] || {},
            sourceToTarget = /*@static_cast(Array)*/(targets[targetClassName] = targets[targetClassName] || []);
        sourceToTarget.push(def);

        this._ensureBindings(componentClassName);
    };

    proto.detachFromComponent = function (target, componentClassName, binderDefinitions) {
        /// <param name="target" type="Compose.Component">Component which will handle events</param>
        /// <param name="componentClassName" type="String">Component class name for which to listen for events when available</param>
        /// <param name="binderDefinitions" type="Array">[{ on:(string), then:(function) }, ...]</param>
        Debug.assert(Jx.isObject(target));
        Debug.assert(Jx.isNonEmptyString(componentClassName));
        Debug.assert(Jx.isArray(binderDefinitions));

        var targetClassName = target.getClassName(),
            definitions = /*@static_cast(Array)*/this._sourcesToTargetsMap[componentClassName][targetClassName];
        Debug.assert(targetClassName !== componentClassName);
        Debug.assert(Jx.isArray(definitions));

        var index = -1;
        for (var i = 0; i < definitions.length; i++) {
            var def = /*@static_cast(Compose.ComponentBinderDef)*/definitions[i];
            if (binderDefinitions === def.binderDefinitions) {
                if (!Jx.isNullOrUndefined(def.bindings)) {
                    _detach(def);
                }
                index = i;
                break;
            }
        }
        Debug.assert(index !== -1);

        definitions.splice(index, 1);
    };

    // Private

    proto._setEventSource = function (/*@dynamic*/source, type) {
        /// <param name="source"></param>
        /// <param name="type" type="String"></param>
        Debug.assert(Jx.isObject(source));
        Debug.assert(this._eventSources.hasOwnProperty(type));

        if (source !== this._eventSources[type]) {
            var originalSource = this._eventSources[type];
            if (Jx.isObject(originalSource)) {
                // Unhook all bindings to the old source
                this._eventSources[type] = null;
                this._ensureBindings(type);
            }

            // Hook up all bindings to the new source
            this._eventSources[type] = source;
            this._ensureBindings(type);
        }
    };

    proto._getComponent = function (componentClassName) {
        /// <param name="componentClassName" type="String"></param>
        Debug.assert(Jx.isNonEmptyString(componentClassName));

        if (this._eventSources.hasOwnProperty(componentClassName)) {
            return this._eventSources[componentClassName];
        } else {
            return this._componentCache.getComponent(componentClassName);
        }
    };

    proto._attachToComponentCache = function () {
        this._myBindings = Compose.binder.attach(this, [
            { on: "added", from: this._componentCache, then: this._onComponentCacheChange },
            { on: "removed", from: this._componentCache, then: this._onComponentCacheChange }
        ]);
    };

    proto._onComponentCacheChange = function (/*@dynamic*/ev) {
        Debug.assert(Jx.isObject(ev));

        var component = /*@static_cast(Compose.Component)*/ev.component;
        Debug.assert(Jx.isObject(component));

        this._ensureBindings(component.getClassName());
    };

    proto._ensureBindings = function (componentClassName) {
        /// <param name="componentClassName" type="String"></param>
        Debug.assert(Jx.isNonEmptyString(componentClassName));

        var targets = this._sourcesToTargetsMap[componentClassName];
        if (Jx.isObject(targets)) {
            var component = this._getComponent(componentClassName);

            // Attach/Detach for all components waiting for this component
            Object.keys(targets).forEach(function (targetClassName) {
                targets[targetClassName].filter(function (def) {
                    /// <param name="def" type="Compose.ComponentBinderDef"></param>
                    return Boolean(def.bindings) === !Boolean(component);
                }).forEach(function (def) {
                    /// <param name="def" type="Compose.ComponentBinderDef"></param>
                    if (Boolean(component)) {
                        _attach(def, component);
                    } else {
                        _detach(def);
                    }
                });
            });
        }
    };

    var _attach = function (def, fromComponent) {
        /// <param name="def" type="Compose.ComponentBinderDef"></param>
        /// <param name="fromComponent" type="Compose.Component"></param>
        Debug.assert(Jx.isObject(def));
        Debug.assert(def.bindings === null);
        Debug.assert(Jx.isObject(fromComponent));

        var binderDefinitions = def.binderDefinitions;
        def.bindings = Compose.binder.attach(def.target, binderDefinitions.map(function (/*@dynamic*/binderDef) {
            return { on: binderDef.on, from: fromComponent, then: binderDef.then };
        }));
    };

    var _detach = function (def) {
        /// <param name="def" type="Compose.ComponentBinderDef"></param>
        Debug.assert(Jx.isObject(def));
        Debug.assert(!Jx.isNullOrUndefined(def.bindings));

        Compose.binder.detach(def.bindings);
        def.bindings = null;
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.MailMessageCreator = /*@constructor*/function () {
        /// <summary>
        /// Base class for message creators.
        /// </summary>
        this._callback = /*@static_cast(Function)*/null;
    };

    Compose.MailMessageCreator.prototype = {

        createMessage: function () {
            Debug.assert(false, "NOT IMPL");
            return /*@static_cast(Microsoft.WindowsLive.Platform.MailMessage)*/null;
        },

        onMessageCreated: function () {
            /// <summary>Caller should call this function after calling createMessage()</summary>
            var callback = this._callback;
            if (Jx.isFunction(callback)) {
                callback();
            }
        },

        setCallback: function (callback) {
            /// <summary>
            /// Callers can pass a callback with which they can use to set action-specific properties before
            /// the UI is populated with this created message.
            /// </summary>
            /// <param name="callback" type="Function">Callback parameters are specific to implementation</param>
            Debug.assert(Jx.isFunction(callback));
            this._callback = callback;
        },

        getCallback: function () {
            return this._callback;
        },

        generatesNewPlatformMessage: function () {
            /// <summary>
            /// Returns true when the createMessage function will create a new entry in the database.
            /// This function is used to determine whether or not a message is new and therefore subject to
            /// deletion when the user navigates away without making changes.
            /// The default is to return true, but subclasses should override this if they instead load an
            /// existing message from the database.
            /// </summary>
            /// <returns type="Boolean"></returns>
            return true;
        }

    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.ref.js" />
/// <reference path="messagecreator.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.MessageReturner = /*@constructor*/function (message) {
        /// <summary>
        /// "Message creator" that just returns a message.
        /// </summary>
        /// <param name="message" type="Microsoft.WindowsLive.Platform.IMailMessage">Can be null</param>
        this._message = message;
    };

    Compose.MessageReturner.instance = function (message) {
        /// <param name="message" type="Microsoft.WindowsLive.Platform.IMailMessage">Can be null</param>
        return new Compose.MessageReturner(message);
    };

    Jx.augment(Compose.MessageReturner, Compose.MailMessageCreator);

    var proto = Compose.MessageReturner.prototype;

    proto.createMessage = function () {
        return this._message;
    };

    proto.generatesNewPlatformMessage = function () {
        /// <summary>This does not actually crate a new platform message, it just uses an existing one.</summary>
        return false;
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.MessageLoader = /*@constructor*/function (messageId) {
        /// <summary>
        /// Loads message with given messageId.
        /// </summary>
        /// <param name="messageId" type="String"></param>
        Debug.assert(Jx.isNonEmptyString(messageId));

        Compose.MailMessageCreator.call(this);

        this._messageId = messageId;
    };

    Compose.MessageLoader.instance = function (messageId) {
        return new Compose.MessageLoader(messageId);
    };

    Jx.augment(Compose.MessageLoader, Compose.MailMessageCreator);

    var proto = Compose.MessageLoader.prototype;

    proto.createMessage = function () {
        var message = null;
        try {
            message = Compose.platform.mailManager.loadMessage(this._messageId);
        } catch (er) {
            Jx.log.error(er);
            Debug.assert(false, er);
        }
        return message;
    };

    proto.generatesNewPlatformMessage = function () {
        /// <summary>This does not actually create a new platform message, it simply loads one from the database.</summary>
        return false;
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.ref.js" />
/// <reference path="..\..\UIDataModel\UIDataModel.dep.js" />

Jx.delayGroup("MailCompose", function () {

    // Note:
    // This class does not implement the full Compose.MessageCreator API because this is only used by the MailMessageModel,
    // which does not use all of the methods on MessageCreator.

    Compose.FallbackMessageCreator = /*@constructor*/function (firstTry) {
        /// <summary>
        /// Takes an optional "firstTry" message creator, and falls back to a default "new" message if it fails.
        /// Updates the message model initAction to "new" if the fallback is used.
        /// </summary>
        /// <param name="firstTry" type="Compose.MailMessageCreator" optional="true">If this message creation fails, fall back to the default.</param>

        Compose.MailMessageCreator.call(this);

        this._firstTry = firstTry;
        this._didFallback = false;

        this._messageModel = /*@static_cast(Mail.MailMessageModel)*/null;
    };

    Compose.FallbackMessageCreator.instance = function (firstTry) {
        /// <param name="firstTry" type="Compose.MailMessageCreator" optional="true">If this message creation fails, fall back to the default.</param>
        return new Compose.FallbackMessageCreator(firstTry);
    };

    var proto = Compose.FallbackMessageCreator.prototype;

    proto.setMailMessageModel = function (messageModel) {
        /// <param name="messageModel" type="Mail.MailMessageModel"></param>
        Debug.assert(Jx.isObject(messageModel));
        this._messageModel = messageModel;
    };

    proto.createMessage = function () {
        var platform = Compose.platform;
        Debug.assert(Jx.isObject(platform));

        var message = Jx.isObject(this._firstTry) ? this._firstTry.createMessage() : null;
        if (message === null) {

            var MailViewType = Microsoft.WindowsLive.Platform.MailViewType,
                FilterCriteria = Microsoft.WindowsLive.Platform.FilterCriteria,
                filter = Mail.Utilities.ComposeHelper.currentSelectedFilter,
                selectedFilter = null;
            if (filter !== null){
                selectedFilter = filter.currentFilter;
            }

            var selection = Mail.Utilities.ComposeHelper._selection,
                view = selection.view;

            Debug.assert(!Jx.isNullOrUndefined(view));
            var type = view.type,
                flagged = (selectedFilter === FilterCriteria.flagged || type === MailViewType.flagged),
                read = (selectedFilter !== FilterCriteria.unread);

            message = platform.mailManager.createDraftMessage(view.platformMailView);
            message.flagged = flagged;
            message.read = read;
            this._messageModel.setInitAction(Compose.ComposeAction.createNew);
            this._messageModel.setBodyContents([{ content: "", format: ModernCanvas.ContentFormat.text, location: ModernCanvas.ContentLocation.end }]);
            this._didFallback = true;
        }

        return message;
    };

    proto.onMessageCreated = function () {
        // Only run onMessageCreated if our firstTry creator actually succeeded.
        // Otherwise suppress it, as all the actions are changed from here on out.
        if (!this._didFallback) {
            this._firstTry.onMessageCreated();
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug,Microsoft,Compose*/

Jx.delayGroup("MailCompose", function () {

    Compose.MessageCloner = /*@constructor*/function (messageCreator) {
        /// <summary>
        /// Clones the message retrieved from the given messageCreator.
        /// </summary>
        /// <param name="messageCreator" type="Compose.MailMessageCreator"></param>
        Debug.assert(Jx.isObject(messageCreator));

        Compose.MailMessageCreator.call(this);

        this._messageCreator = messageCreator;
        this._messageModel = /*@static_cast(Compose.MailMessageModel)*/null;

        this._originalMessage = /*@static_cast(Microsoft.WindowsLive.Platform.IMailMessage)*/null;
        this._cloneMessage = /*@static_cast(Microsoft.WindowsLive.Platform.IMailMessage)*/null;
    };

    Compose.MessageCloner.instance = function (messageCreator) {
        /// <param name="messageCreator" type="Compose.MailMessageCreator"></param>
        return new Compose.MessageCloner(messageCreator);
    };

    Jx.augment(Compose.MessageCloner, Compose.MailMessageCreator);

    var proto = Compose.MessageCloner.prototype;

    proto.setMailMessageModel = function (messageModel) {
        /// <param name="messageModel" type="Compose.MailMessageModel"></param>
        Debug.assert(Jx.isObject(messageModel));
        this._messageModel = messageModel;
    };

    proto.createMessage = function () {
        Debug.assert(Jx.isObject(this._messageModel), "Must call setMailMessageModel before calling createMessage");

        var cloneMessage = null,
            originalMessage = this._originalMessage = this._messageCreator.createMessage(),
            messageModel = this._messageModel;

        if (originalMessage) {
            // If forwarding a message, keep the attachments (unless it is a junk mail)
            var action = messageModel.getInitAction(),
                isForward = action === Compose.ComposeAction.forward,
                isJunk = _isJunk(originalMessage),
                mailLastVerb = Compose.util.convertToMailVerb(action),
                selection = Mail.Utilities.ComposeHelper._selection;

            Compose.log("cloneMessage", Compose.LogEvent.start);
            cloneMessage = this._cloneMessage = originalMessage.cloneMessage(isForward && !isJunk, mailLastVerb, selection.view.platformMailView);
            Compose.log("cloneMessage", Compose.LogEvent.stop);
        }

        return cloneMessage;
    };

    proto.onMessageCreated = function () {
        /// <summary>Caller should call this function after calling createMessage()</summary>
        Debug.assert(Jx.isObject(this._originalMessage));
        Debug.assert(Jx.isObject(this._cloneMessage));
        Debug.assert(Jx.isObject(this._messageModel));

        var callback = this.getCallback();
        if (Jx.isFunction(callback)) {
            callback(this._originalMessage, this._cloneMessage, this._messageModel);
        }
    };

    function _isJunk(originalMessage) {
        /// <param name="originalMessage" type="Microsoft.WindowsLive.Platform.IMailMessage"></param>
        Debug.assert(Jx.isObject(originalMessage));

        var isJunk = false;
        try {
            isJunk = originalMessage.isInSpecialFolderType(Microsoft.WindowsLive.Platform.MailFolderType.junkMail);
        } catch (err) {
            Jx.log.exception("Exception getting message's folder type, assuming not junk", err);
        }

        return isJunk;
    }

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true */
/*global Mail,Jx,Debug,Microsoft,Compose,ModernCanvas */

Jx.delayGroup("MailCompose", function () {
    // List of attributes to copy from the readingpane body to compose that might not be
    // saved in the message
    var bodyAttributeWhiteList = ["dir"];

    Compose.MailMessageFactoryUtil = /*@constructor*/function () {
        /// <summary>Utility class for building message contents</summary>
    };

    Compose.MailMessageFactoryUtil.prototype = {

        rePrefix: "Re: ",
        fwPrefix: "Fw: ",

        addReplyHeaderContents: function (originalMessage, messageModel) {
            /// <summary>Adds reply header to the message model contents</summary>
            /// <param name="originalMessage" type="Microsoft.WindowsLive.Platform.IMailMessage"></param>
            /// <param name="messageModel" type="Compose.MailMessageModel"></param>
            Debug.assert(Jx.isObject(originalMessage));
            Debug.assert(Jx.isObject(messageModel));

            // Only add the header if we are dealing with a message that can be edited AND copied from,
            //  otherwise we'll add the header later into the uneditable region of the canvas
            if (messageModel.get("irmCanEdit") && messageModel.get("irmCanExtractContent")) {
                messageModel.prependBodyContents([{
                    content: factoryUtil.prepareReplyInfoFromOriginalMessage(originalMessage),
                    format: ModernCanvas.ContentFormat.htmlString,
                    location: ModernCanvas.ContentLocation.end
                }]);
            }
        },

        getFromEmailAddressToUse: function (account, toCollection, ccCollection) {
            /// <summary>Tries to find any of the given send as addresses in either the toCollection or ccCollection.
            /// The first occurrence is returned if any are found. If not, this function returns the preferred send as address for this account </summary>
            /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" optional="false">The account to send the message with.</param>
            /// <param name="toCollection" type="Windows.Foundation.Collections.IVector" optional="false">The collection of To: recipients.</param>
            /// <param name="ccCollection" type="Windows.Foundation.Collections.IVector" optional="false">The collection of Cc: recipients.</param>
            Debug.assert(Jx.isObject(account));
            Debug.assert(Jx.isObject(toCollection));
            Debug.assert(Jx.isObject(ccCollection));

            var sendAsAddresses = account.sendAsAddresses,
                sendAsAddressesLowerCased = {},
                email;

            for (var i = 0, iMax = sendAsAddresses.size; i < iMax; i++) {
                sendAsAddressesLowerCased[sendAsAddresses[i].toLowerCase()] = true;
            }

            for (i = 0, iMax = toCollection.size; i < iMax; i++) {
                email = toCollection[i].emailAddress.toLowerCase();
                if (sendAsAddressesLowerCased[email]) {
                    return email;
                }
            }

            for (i = 0, iMax = ccCollection.size; i < iMax; i++) {
                email = ccCollection[i].emailAddress.toLowerCase();
                if (sendAsAddressesLowerCased[email]) {
                    return email;
                }
            }

            return account.preferredSendAsAddress;
        },

        normalizeSubject: function (subject) {
            /// <summary>Returns a subject without any FW:, FWD:, and RE: prefixes</summary>
            /// <param name="subject" type="String"></param>
            Debug.assert(Jx.isString(subject));
            return subject.replace(/^((FW|FWD|RE):\s*)+/i, "");
        },

        getReplyHeaderRecipientsHtml: function (recipientCollection) {
            /// <summary>Given a recipients string from mail, semicolon-separated, translates it into the HTML string we'll display in the reply header</summary>
            /// <param name="recipientCollection" type="Array">An array of recipients</param>
            /// <returns type="String" />
            var html = "";
            recipientCollection.forEach(function (recipient) {
                var name = Jx.escapeHtml(recipient.calculatedUIName),
                    email = Jx.escapeHtml(recipient.emailAddress),
                    anchor = "<a tabindex='-1' title='mailto:" + email + "' href='mailto:" + email + "'>" + name + "</a>";
                
                // Add trailing comma before we add next entry
                if (html !== "") {
                    html += ", ";
                }
                html += anchor;
            });
            return html;
        },

        prepareReplyInfoFromOriginalMessage: function (oldMessage) {
            /// <summary>
            /// Prepares and returns the message body to be inserted into canvas.
            /// This will wrap the old message body in a div and then prefix it with reply information.
            /// </summary>
            /// <param name="oldMessage" type="Microsoft.WindowsLive.Platform.IMailMessage"></param>

            Debug.assert(Jx.isObject(oldMessage));

            Compose.log("prepareReplyInfo", Compose.LogEvent.start);
            var dateSent = oldMessage.sent;
            if (!dateSent) {
                // Sent isn't available for this message, use the received instead
                dateSent = oldMessage.received;
            }

            // Define some params based on original message (more later)
            var replySpec = /*@static_cast(Compose.ComposeReplySpec)*/{
                recipientsCc: null,
                recipientsTo: this.getReplyHeaderRecipientsHtml(oldMessage.toRecipients),
                recurring: null,
                sender: this.getReplyHeaderRecipientsHtml(Jx.isNullOrUndefined(oldMessage.fromRecipient) ? [] : [oldMessage.fromRecipient]),
                sentDate: Jx.escapeHtml(Mail.Utilities.getVerboseDateString(dateSent) + " " + Mail.Utilities.getShortTimeString(dateSent)),
                when: null,
                where: null
            };

            // If there was a CC, include that
            if (oldMessage.cc) {
                replySpec.recipientsCc = this.getReplyHeaderRecipientsHtml(oldMessage.ccRecipients);
            }

            // If there was a calendar invite, include that
            var calendarEvent = oldMessage.calendarEvent;
            if ((oldMessage.calendarMessageType !== Microsoft.WindowsLive.Platform.CalendarMessageType.none) && Boolean(calendarEvent)) {
                var platform = Compose.platform,
                    account = platform.accountManager.loadAccount(oldMessage.accountId);
                Debug.assert(account);
                replySpec.when = Jx.escapeHtml(Mail.Utilities.getCalendarEventTimeRange(account, calendarEvent));
                replySpec.where = Jx.escapeHtml(calendarEvent.location);
                replySpec.recurring = calendarEvent.recurring;
            }

            var replyInfo = factoryUtil.prepareReplyInfo(replySpec);
            Debug.assert(Jx.isNonEmptyString(replyInfo));

            Compose.log("prepareReplyInfo", Compose.LogEvent.stop);

            return replyInfo;
        },

        prepareReplyInfo: function (spec) {
            /// <summary>
            /// Prepares and returns the message body to be inserted into canvas.
            /// Use this version when putting together a reply header with a source other than a mail message.
            /// </summary>
            /// <param name="spec" type="Compose.ComposeReplySpec"></param>

            // Add common info to the spec that is not sourced from the message.
            // TODO: The font size should really be pulled from the localized css file. This could be done by pulling their values off an element with a known font size
            var DF = Jx.DynamicFont;
            spec.primaryFontFamily = ModernCanvas.removeFakeFontNames(DF.getPrimaryFontFamilyQuoted("'"));
            spec.authoringFontFamily = ModernCanvas.removeFakeFontNames(DF.getAuthoringFontFamilyQuoted("'"));
            spec.fontSizeNormal = "font-size:12pt;letter-spacing:0.02em;line-height:15pt";

            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            return /*@static_cast(String)*/Compose.Templates.replyHeader(spec);
        },

        getRecipientString: function (recipient) {
            /// <summary>
            /// Given a recipient, returns the string representing that recipient, followed by ';'
            /// </summary>
            /// <param name="recipient" type="Microsoft.WindowsLive.Platform.IRecipient">Recipient to convert to string</param>
            /// <returns type="String">String representing given recipient</returns>

            var recipientString = "";

            var recipientName = recipient.calculatedUIName;
            var recipientEmail = recipient.emailAddress;

            // If there is a name and it is not the same as the email address
            if (Boolean(recipientName) && recipientName !== recipientEmail) {
                // Add it in quotes
                recipientString = '"' + recipientName + '" ';
            }
            // Then add the email address and a ; delimeter
            recipientString += "<" + recipientEmail + ">;";

            return recipientString;
        },

        getRecipientsStringWithoutReceiver: function (recipientCollection, receiverCollection, additionalReceivers) {
            /// <summary>Generates a complete recipient string from a collection of recipients, while removing the receiver from the list.</summary>
            /// <param name="recipientCollection" type="Array" optional="false">The collection of recipients.</param>
            /// <param name="receiverCollection" type="Array" optional="false">The array of email addresses of the recipient that should be removed from the list.</param>
            /// <param name="additionalReceivers" type="Array" optional="true">An additional array of recipients whose emails should also be removed from the list.</param>
            /// <returns type="String">The complete recipient string.</returns>
            var recipientString = "",
                recipientEmail,
                recipientEmailLowerCased,
                n,
                len,
                receiverCollectionLowerCased = {},
                recipientsAdded = {};
            for (n = receiverCollection.length; n--;) {
                receiverCollectionLowerCased[receiverCollection[n].toLowerCase()] = true;
            }
            if (additionalReceivers) {
                for (n = additionalReceivers.length; n--;) {
                    if (!Jx.isObject(additionalReceivers[n])) { continue; }
                    receiverCollectionLowerCased[additionalReceivers[n].emailAddress.toLowerCase()] = true;
                }
            }
            for (n = 0, len = recipientCollection.length; n < len; n++) {
                if (!Jx.isObject(recipientCollection[n])) { continue; }
                recipientEmail = recipientCollection[n].emailAddress || "";
                recipientEmailLowerCased = recipientEmail.toLowerCase();
                // If it is not one of the existing accounts and hasn't already been added
                if (!(receiverCollectionLowerCased[recipientEmailLowerCased] || recipientsAdded[recipientEmailLowerCased])) {
                    recipientsAdded[recipientEmailLowerCased] = true;
                    recipientString += factoryUtil.getRecipientString(recipientCollection[n]);
                }
            }
            return recipientString;
        },

        getSourceMessage: function (message) {
            /// <summary>
            /// Attempts to retrieve the source (i.e. parent) message for the given message.
            /// </summary>
            /// <param name="message" type="Microsoft.WindowsLive.Platform.IMailMessage"></param>
            /// <returns type="Microsoft.WindowsLive.Platform.IMailMessage">The source message for the given message.</returns>
            var sourceMessageStoreId = message.sourceMessageStoreId;
            if (sourceMessageStoreId !== "0") {
                try {
                    return Compose.platform.mailManager.loadMessage(message.sourceMessageStoreId);
                } catch (e) {
                    Jx.log.exception("Failed to load message " + sourceMessageStoreId, e);
                }
            }

            return null;
        },

        setInitialBody: function (messageModel) {
            var canEdit = messageModel.get("irmCanEdit"),
                canExtractContent = messageModel.get("irmCanExtractContent");

            if (canEdit && canExtractContent) {
                var platformMessage = messageModel.getPlatformMessage(),
                    account = Mail.Account.load(platformMessage.accountId, Compose.platform),
                    bodySourceMessage = this.getSourceMessage(platformMessage);
                if (Jx.isNullOrUndefined(bodySourceMessage)) {
                    bodySourceMessage = platformMessage;
                }
                Debug.assert(!Jx.isNullOrUndefined(bodySourceMessage), "We need a source message to create the body");

                var bodySourceDocument = Mail.getScrubbedDocument(Compose.platform, new Mail.UIDataModel.MailMessage(bodySourceMessage, account)),
                    documentFragment = ModernCanvas.Mail.convertDocumentToDocumentFragment(bodySourceDocument, bodyAttributeWhiteList);

                if (bodySourceMessage !== platformMessage) {
                    // If we stole the scrubbed HTML from the source message then the embedded attachments still reference the source message.
                    factoryUtil.updateEmbeddedAttachments(documentFragment, bodySourceMessage, platformMessage);
                }

                messageModel.setBodyContents([{ content: documentFragment, format: ModernCanvas.ContentFormat.documentFragment, location: ModernCanvas.ContentLocation.end }]);
            } else {
                // A message with edit or copy restrictions will not have any body
                messageModel.setBodyContents([{ content: "", format: ModernCanvas.ContentFormat.text, location: ModernCanvas.ContentLocation.end }]);
            }
        },

        updateEmbeddedAttachments: function (documentFragment, sourceMessage, message) {
            /// <summary>
            /// Re-writes embedded attachment src attributes in the documentFragment to reference attachments in the message 
            /// instead of attachments in the sourceMessage.
            /// </summary>
            /// <param name="documentFragment" type="DocumentFragment">The HTML nodes to re-write. The HTML should have been generated from the sourceMessage.</param>
            /// <param name="sourceMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The message the HTML nodes were created from.</param>
            /// <param name="message" type="Microsoft.WindowsLive.Platform.IMailMessage">A message that was created by cloning the sourceMessage.</param>
            Debug.assert(documentFragment.nodeType === Node.DOCUMENT_FRAGMENT_NODE, "Expected documentFragment to be a DocumentFragment node");
            Debug.assert(message.sourceMessageStoreId === sourceMessage.objectId, "Expected message to reference the sourceMessage");

            var sourceAttachments = sourceMessage.getEmbeddedAttachmentCollection();
            if (sourceAttachments.count === 0) {
                // Break out early if there are no embedded attachments to update.
                return;
            }

            var attachments = message.getEmbeddedAttachmentCollection(),
                // In the scrubbed HTML, all embedded images point to ms-appdata:// uris corresponding to the attachment's bodyUri property.
                imgs = documentFragment.querySelectorAll("img[src^='ms-appdata:///']"),
                findSourceAttachment = function (src) {
                    for (var i = 0, len = sourceAttachments.count; i < len; i++) {
                        var sourceAttachment = sourceAttachments.item(i);
                        if (sourceAttachment.bodyUri === src) {
                            return sourceAttachment;
                        }
                    }
                },
                findAttachment = function (contentId) {
                    for (var i = 0, len = attachments.count; i < len; i++) {
                        var attachment = attachments.item(i);
                        if (attachment.contentId === contentId) {
                            return attachment;
                        }
                    }
                };
            Debug.assert(sourceAttachments.count >= attachments.count, "Expected embedded attachment count to be less than or equal to source attachment count");

            for (var i = 0, len = imgs.length; i < len; i++) {
                var img = imgs[i],
                    sourceAttachment = findSourceAttachment(img.src);
                Debug.assert(sourceAttachment, "Expected to find embedded attachment for src=" + img.src);
                if (sourceAttachment) {
                    var attachment = findAttachment(sourceAttachment.contentId);
                    Debug.assert(attachment, "Expected to find embedded attachment for contentId=" + sourceAttachment.contentId);
                    Debug.assert(attachment && Jx.isNonEmptyString(attachment.bodyUri), "Expected non-empty bodyUri");
                    if (attachment && Jx.isNonEmptyString(attachment.bodyUri)) {
                        img.src = attachment.bodyUri;
                    }
                }
            }
        }
    };

    var factoryUtil = Compose.mailMessageFactoryUtil = new Compose.MailMessageFactoryUtil();

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Compose,Debug,Jx,ModernCanvas */

Jx.delayGroup("MailCompose", function () {

    Compose.MailMessageModelForwardFactory = /*@constructor*/function () {
        /// <summary>Builds a message model for a typical "forward" operation</summary>
    };

    Compose.MailMessageModelForwardFactory.prototype = {

        instance: function (originalMessageCreator) {
            /// <param name="originalMessageCreator" type="Compose.MailMessageCreator"></param>
            Debug.assert(Jx.isObject(originalMessageCreator));

            var factoryUtil = /*@static_cast(Compose.MailMessageFactoryUtil)*/Compose.mailMessageFactoryUtil,
                messageCreator = Compose.MessageCloner.instance(originalMessageCreator),
                messageModel = Compose.MailMessageModel.instance(/*@static_cast(Compose.MessageModelSpec)*/{
                    initAction: Compose.ComposeAction.forward,
                    messageCreator: messageCreator
                });
            messageCreator.setMailMessageModel(messageModel);

            // Now provide a callback to adjust mail message properties after the new message is created
            messageCreator.setCallback(function (originalMessage) {
                /// <param name="originalMessage" type="Microsoft.WindowsLive.Platform.IMailMessage"></param>
                Debug.assert(Jx.isObject(originalMessage));

                var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Compose.platform,
                    account = platform.accountManager.loadAccount(originalMessage.accountId),
                    calendarUtil = Compose.CalendarUtil;
                Debug.assert(account);
                // Set the initial body
                factoryUtil.setInitialBody(messageModel);

                // Add canvas content for the reply header
                factoryUtil.addReplyHeaderContents(originalMessage, messageModel);

                // Adjust forward properties
                messageModel.set({
                    subject: factoryUtil.fwPrefix + factoryUtil.normalizeSubject(originalMessage.subject),
                    to: "",
                    cc: "",
                    bcc: "",
                    fromEmail: factoryUtil.getFromEmailAddressToUse(account, originalMessage.toRecipients, originalMessage.ccRecipients)
                });

                if (calendarUtil.messageRequiresForwardContent(messageModel.getPlatformMessage())) {
                    // Some calendar invite forwards require additional content
                    messageModel.addBodyContents([
                        // Insert the signature
                        { signatureLocation: ModernCanvas.SignatureLocation.start },
                        // Forward invite message
                        calendarUtil.getDownlevelForwardBodyContent(/*@static_cast(Microsoft.WindowsLive.Platform.Calendar.Event)*/originalMessage.calendarEvent, originalMessage.from)
                    ]);
                } else {
                    messageModel.setSignatureLocation(ModernCanvas.SignatureLocation.start);
                }
            });

            return messageModel;
        }

    };

    Compose.mailMessageModelForwardFactory = new Compose.MailMessageModelForwardFactory();

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.MailMessageModelReplyAllFactory = /*@constructor*/function () {
        /// <summary>Builds a message model for a typical "reply all" operation</summary>
    };

    Compose.MailMessageModelReplyAllFactory.prototype = {

        instance: function (originalMessageCreator) {
            /// <param name="originalMessageCreator" type="Compose.MailMessageCreator"></param>
            Debug.assert(Jx.isObject(originalMessageCreator));

            var factoryUtil = /*@static_cast(Compose.MailMessageFactoryUtil)*/Compose.mailMessageFactoryUtil,
                messageCreator = Compose.MessageCloner.instance(originalMessageCreator),
                messageModel = Compose.MailMessageModel.instance(/*@static_cast(Compose.MessageModelSpec)*/{
                    initAction: Compose.ComposeAction.replyAll,
                    messageCreator: messageCreator
                });
            messageCreator.setMailMessageModel(messageModel);

            // Now provide a callback to adjust mail message properties after the new message is created
            messageCreator.setCallback(function (originalMessage) {
                /// <param name="originalMessage" type="Microsoft.WindowsLive.Platform.IMailMessage"></param>
                Debug.assert(Jx.isObject(originalMessage));

                // Set the initial body
                factoryUtil.setInitialBody(messageModel);

                // Add canvas content for the reply header
                factoryUtil.addReplyHeaderContents(originalMessage, messageModel);

                // Remove current user from the To/Cc list
                var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Compose.platform,
                    originalMessageAccount = platform.accountManager.loadAccount(originalMessage.accountId),
                    m,
                    len,
                    senderIsReplying = false;
                
                Debug.assert(Jx.isObject(originalMessageAccount));
                    
                var currentEmails = /*@static_cast(Array)*/originalMessageAccount.allEmailAddresses,
                    replyToRecipientsArray = /*@static_cast(Array)*/originalMessage.replyToRecipients,
                    fromRecipient = originalMessage.fromRecipient,
                    replyToRecipientsCollection = replyToRecipientsArray.length > 0 ? replyToRecipientsArray : [fromRecipient],
                    toRecipientsCollection = /*@static_cast(Array)*/originalMessage.toRecipients,
                    ccRecipientsCollection = /*@static_cast(Array)*/originalMessage.ccRecipients;
                
                // Check each of the current email aliases to see if they are the sender
                for (m = 0, len = currentEmails.length; m < len; m++){
                    if (Jx.isObject(fromRecipient) && currentEmails[m] === fromRecipient.emailAddress){
                        senderIsReplying = true;
                        break;
                    }
                }
                
                if (senderIsReplying){
                    // Don't remove the sender from the to/cc fields
                    currentEmails = [];
                    
                    // If the sender is replying, add all of the replyToRecipients but the from address
                    for (m = 0, len = replyToRecipientsCollection.length; m < len; m++){
                        if (replyToRecipientsCollection[m] !== fromRecipient){
                            toRecipientsCollection.push(replyToRecipientsCollection[m]);
                        }
                    }
                } else {
                    // Otherwise it's safe to add all of the replyToRecipients
                    for (m = 0, len = replyToRecipientsCollection.length; m < len; m++){
                        if (replyToRecipientsCollection[m] === fromRecipient){
                            // Make sure the from recipient is added to the beginning of the line
                            toRecipientsCollection.unshift(replyToRecipientsCollection[m]);
                        } else {
                            toRecipientsCollection.push(replyToRecipientsCollection[m]);
                        }
                    }
                }

                // Adjust reply properties
                messageModel.setSignatureLocation(ModernCanvas.SignatureLocation.start);
                messageModel.set({
                    subject: factoryUtil.rePrefix + factoryUtil.normalizeSubject(originalMessage.subject),
                    to: factoryUtil.getRecipientsStringWithoutReceiver(toRecipientsCollection, currentEmails) || originalMessage.replyTo || originalMessage.from,
                    cc: factoryUtil.getRecipientsStringWithoutReceiver(ccRecipientsCollection, currentEmails, toRecipientsCollection),
                    bcc: "",
                    fromEmail: factoryUtil.getFromEmailAddressToUse(originalMessageAccount, originalMessage.toRecipients, originalMessage.ccRecipients),
                    importance: Microsoft.WindowsLive.Platform.MailMessageImportance.normal
                });
            });

            return messageModel;
        }
    };

    Compose.mailMessageModelReplyAllFactory = new Compose.MailMessageModelReplyAllFactory();

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.MailMessageModelReplyFactory = /*@constructor*/function () {
        /// <summary>Builds a message model for a typical "reply" operation</summary>
    };

    Compose.MailMessageModelReplyFactory.prototype = {

        instance: function (originalMessageCreator) {
            /// <param name="originalMessageCreator" type="Compose.MailMessageCreator"></param>
            Debug.assert(Jx.isObject(originalMessageCreator));

            var factoryUtil = /*@static_cast(Compose.MailMessageFactoryUtil)*/Compose.mailMessageFactoryUtil,
                messageCreator = Compose.MessageCloner.instance(originalMessageCreator),
                messageModel = Compose.MailMessageModel.instance(/*@static_cast(Compose.MessageModelSpec)*/{
                    initAction: Compose.ComposeAction.reply,
                    messageCreator: messageCreator
                });
            messageCreator.setMailMessageModel(messageModel);

            // Now provide a callback to adjust mail message properties after the new message is created
            messageCreator.setCallback(function (originalMessage) {
                /// <param name="originalMessage" type="Microsoft.WindowsLive.Platform.IMailMessage"></param>
                Debug.assert(Jx.isObject(originalMessage));

                var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Compose.platform,
                    account = platform.accountManager.loadAccount(originalMessage.accountId);

                // Set the initial body
                factoryUtil.setInitialBody(messageModel);

                // Add canvas content for the reply header
                factoryUtil.addReplyHeaderContents(originalMessage, messageModel);

                // Adjust reply properties
                messageModel.setSignatureLocation(ModernCanvas.SignatureLocation.start);
                messageModel.set({
                    subject: factoryUtil.rePrefix + factoryUtil.normalizeSubject(originalMessage.subject),
                    to: originalMessage.replyTo || originalMessage.from,
                    cc: "",
                    bcc: "",
                    fromEmail: factoryUtil.getFromEmailAddressToUse(account, originalMessage.toRecipients, originalMessage.ccRecipients),
                    importance: Microsoft.WindowsLive.Platform.MailMessageImportance.normal
                });
            });

            return messageModel;
        }

    };

    Compose.mailMessageModelReplyFactory = new Compose.MailMessageModelReplyFactory();

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Compose,Jx,Debug*/

Jx.delayGroup("MailCompose", function () {

    Compose.ComposeBuilder = /*@constructor*/function () {
        /// <summary>
        /// Handles building and tearing down of a given compose experience.
        /// Uses the componenent creator reuse components when available.
        /// </summary>

        this._componentCreator = /*@static_cast(Compose.ComponentCreator)*/null;
        this._componentCache = /*@static_cast(Compose.ComponentCache)*/null;
        this._componentBinder = /*@static_cast(Compose.ComponentBinder)*/null;
        this._rootElement = /*@static_cast(HTMLElement)*/null;

        // The last compose built by this builder.
        // We need this to efficiently deconstruct and construct the new compose tree (i.e. we don't want to deactivate/reactivate the same component).
        this._compose = /*@static_cast(Compose.ComposeImpl)*/null;

        
        this._lastBuildSpec = /*@static_cast(Compose.ComposeBuilderSpec)*/null;
        
    };

    Compose.ComposeBuilder.instance = function () {
        return new Compose.ComposeBuilder();
    };

    var proto = Compose.ComposeBuilder.prototype;

    proto.setRootElement = function (rootElement) {
        /// <summary>Set the root element with which to build our compose experience</summary>
        /// <param name="rootElement" type="HTMLElement"></param>
        Debug.assert(Jx.isObject(rootElement));
        this._rootElement = rootElement;
    };

    proto.getComposeRootElement = function () {
        return this._rootElement;
    };

    proto.build = function (spec) {
        /// <param name="spec" type="Compose.ComposeBuilderSpec"></param>
        Debug.assert(Jx.isObject(spec));
        Debug.assert(Jx.isObject(this._rootElement), "Must first call setRootElement()");

        var componentCreator = this._getComponentCreator(),
            componentCache = this._getComponentCache(),
            componentBinder = this._getComponentBinder(),
            compose = /*@static_cast(Compose.ComposeImpl)*/componentCreator.getInstance(/*@static_cast(Compose.ComponentCtor)*/Compose.ComposeImpl);

        // Update component binder
        componentBinder.setValidationViewController(spec.validationViewController);
        componentBinder.setMailMessageModel(spec.mailMessageModel);

        // Initialize new compose
        compose.setComponentCreator(componentCreator);
        compose.setComponentCache(componentCache);
        compose.setComponentBinder(componentBinder);
        compose.setValidationViewController(spec.validationViewController);
        compose.setActionHandlers(spec.actionHandlers);
        compose.setRootElement(this._rootElement);
        if (!Jx.isNullOrUndefined(spec.mailMessageModel)) {
            compose.setMailMessageModel(spec.mailMessageModel);
        }

        var _ensureRemoveFromTree = function (component) {
            /// <param name="component" type="Compose.Component"></param>
            if (Jx.isObject(component.getParent())) {
                component.getParent().removeChild(component);
            }
        };

        // Remove all components we want to use in the new compose experience from the existing tree.
        // Note that compose experiences that want to reuse nested components will have to break them up
        // in the parent component. These cases will have to be specially handled.
        // If there are any orphaned components, we should catch them in the asserts in activateCurrent()
        // which ensure we accounted for all old and new components.
        spec.components.forEach(function (ctor) {
            /// <param name="ctor" type="Compose.ComponentCtor"></param>
            _ensureRemoveFromTree(componentCreator.getInstance(ctor));
        });

        // Whatever is left in the old tree, deactivate it and remove it
        if (Jx.isObject(this._compose)) {
            this._compose.forEachChild(function (child) {
                /// <param name="child" type="Jx.Component"></param>
                child.deactivateUI();
            });
            this._compose.removeChildren();
        }

        // Now readd the new components to the tree
        Compose.log("Ctor", Compose.LogEvent.start);
        spec.components.forEach(function (ctor) {
            /// <param name="ctor" type="Compose.ComponentCtor"></param>
            compose.addComponent(componentCreator.getInstance(ctor));
        });
        Compose.log("Ctor", Compose.LogEvent.stop);

        this._compose = compose;
        Debug.only(this._lastBuildSpec = spec);

        return compose;
    };

    proto.activateCurrent = function () {
        Compose.log("compose activate", Compose.LogEvent.start);

        var compose = this._compose,
            selection = this._componentCache.getComponent("Compose.Selection");

        // Only activate compose if needed
        if (!compose.isActivated()) {
            compose.activateUI();
        } else if (!selection.isActivated()) {
            selection.composeActivateUI();
        }

        compose.updateUI();
        Compose.log("compose activate", Compose.LogEvent.stop);

        // After deactivating/activating, make sure all known components are in the correct state.
        // If they are not, it's likely we orhpaned a component during the tree reconstruction.
        Debug.call(/*@bind(Compose.ComposeBuilder)*/function () {
            var componentCache = this._componentCache,
                spec = this._lastBuildSpec;
            componentCache.forEachComponent(function (component) {
                /// <param name="component" type="Compose.Component"></param>
                Debug.assert(component.isActivated(), "Expected component to be active: " + component.getClassName());
            });
            spec.components.forEach(function (ctor) {
                /// <param name="ctor" type="Compose.ComponentCtor"></param>
                var componentName = ctor.getClassName(),
                    inCache = componentCache.hasComponent(componentName);
                Debug.assert(inCache, "Expected component to be active: " + componentName);
                Debug.assert(!inCache || componentCache.getComponent(componentName).isActivated(), "Expected component to be active: " + componentName);
            });
        }.bind(this));
    };

    proto.getCurrent = function () {
        return this._compose;
    };

    proto.closeCurrent = function () {
        // We don't deactivate all of Compose for perf reasons. Instead we just deactivate what we have to and
        // swap in a stub message model to handle any leftover async events gracefully

        // Deactivate selection so it can update the appbar appropriately
        var selection = this._componentCache.getComponent("Compose.Selection");
        if (selection.isActivated()) {
            selection.composeDeactivateUI();
        }

        // Clear the addressWells the drop down can stay visible
        var toCcBcc = this._componentCache.getComponent("Compose.ToCcBcc");
        if (toCcBcc.isActivated()) {
            toCcBcc.clear();
        }

        var body = this._componentCache.getComponent("Compose.BodyComponent");
        if (body.isActivated()) {
            body.clear();
        }

        // Mark Compose as no longer showing
        Mail.Utilities.ComposeHelper.setComposeShowing(false);

        // Swap in the stub message
        this._compose.setMailMessageModel(Compose.MailMessageModel.stubInstance());
    };

    // Private

    proto._getComponentCreator = function () {
        this._getComponentCreator = function () { return this._componentCreator; };

        this._componentCreator = new Compose.ComponentCreator();
        return this._getComponentCreator();
    };

    proto._getComponentCache = function () {
        this._getComponentCache = function () { return this._componentCache; };

        this._componentCache = new Compose.ComponentCache();
        return this._getComponentCache();
    };

    proto._getComponentBinder = function () {
        this._getComponentBinder = function () { return this._componentBinder; };

        this._componentBinder = new Compose.ComponentBinder(this._getComponentCache());
        return this._getComponentBinder();
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.CalendarCancelMessageModelFactory = /*@constructor*/function () {
        /// <summary>Builds a message model for calendar cancel scenarios</summary>
    };

    Compose.CalendarCancelMessageModelFactory.prototype = {

        instance: function (originalEvent) {
            /// <param name="originalEvent" type="Microsoft.WindowsLive.Platform.Calendar.Event">Original calendar event on which the new mail will be based</param>

            Debug.assert(Jx.isObject(originalEvent), "originalEvent is required");

            var action = Compose.CalendarActionType.cancel;

            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            var composeAction = Compose.util.convertToComposeAction(action);
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            var account = originalEvent.calendar.account,
                factoryUtil = /*@static_cast(Compose.MailMessageFactoryUtil)*/Compose.mailMessageFactoryUtil,
                calendarUtil = Compose.CalendarUtil,
                isOrganizer = originalEvent.isOrganizer;

            if (!isOrganizer) {
                Jx.log.info("Not processing cancel request since user is not the organizer.");
                // Returning null here will create a regular draft instead.
                return null;
            }

            var messageCreator = Compose.MessageFromEventCreator.instance(originalEvent, account, action),
                messageModel = Compose.MailMessageModel.instance(/*@static_cast(Compose.MessageModelSpec)*/{
                    initAction: composeAction,
                    messageCreator: messageCreator
                });

            // Adjust mail message properties after the new message is created
            messageCreator.setCallback(function (newMessage) {
                /// <param name="newMessage" type="Microsoft.WindowsLive.Platform.IMailMessage"></param>
                Debug.assert(Jx.isObject(newMessage), "newMessage is required");

                // We need to build up the TO / CC lines so that they match what is in the meeting,
                // since Exchange will send the email based on the meeting rather than by what is on the TO / CC lines.
                // We want the UI to reflect what will actually be sent.
                // The IRM / component manager will also make sure that the To/CC/BCC lines are disabled so the user can't change this.
                // Windows Blue Bugs 122043

                var toString = "";
                var ccString = "";
                var attendees = originalEvent.getAttendees();
                var createRecipient = Compose.CalendarUtil.createRecipient;
                var headerRecipients = [];
                var optionalAttendeeType = Microsoft.WindowsLive.Platform.Calendar.AttendeeType.optional;

                var attendeeLength = attendees.count;
                for (var i = 0; i < attendeeLength; i++) {
                    var attendee = /*@static_cast(Microsoft.WindowsLive.Platform.Calendar.IAttendee)*/attendees.item(i);
                    var recipient = createRecipient(attendee.name, attendee.email);
                    headerRecipients.push(recipient);
                    if (attendee.attendeeType === optionalAttendeeType) {
                        // optional attendees go on the CC line
                        ccString += factoryUtil.getRecipientString(recipient);
                    } else {
                        // required attendees and resources go on the to line
                        toString += factoryUtil.getRecipientString(recipient);
                    }
                }

                messageModel.addBodyContents([
                    // Reply header
                    {   content: calendarUtil.getReplyHeaderHtmlFromEvent(originalEvent, account, headerRecipients),
                        format: ModernCanvas.ContentFormat.htmlString,
                        location: ModernCanvas.ContentLocation.start
                    },

                    // Signature
                    { signatureLocation: ModernCanvas.SignatureLocation.start }
                ]);

                messageModel.set({
                    subject: originalEvent.subject,
                    to: toString,
                    cc: ccString,
                    bcc: "",
                    importance: Microsoft.WindowsLive.Platform.MailMessageImportance.normal
                });
            }.bind(this));

            return messageModel;
        }
    };

    Compose.calendarCancelMessageModelFactory = new Compose.CalendarCancelMessageModelFactory();

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.CalendarForwardMessageModelFactory = /*@constructor*/function () {
        /// <summary>Builds a message model for calendar forward scenarios</summary>
    };

    Compose.CalendarForwardMessageModelFactory.prototype = {

        instance: function (originalEvent) {
            /// <param name="originalEvent" type="Microsoft.WindowsLive.Platform.Calendar.Event">Original calendar event on which the new mail will be based</param>

            Debug.assert(Jx.isObject(originalEvent), "originalEvent is required");

            var action = Compose.CalendarActionType.forward;

            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            var composeAction = Compose.util.convertToComposeAction(action);
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

            var factoryUtil = /*@static_cast(Compose.MailMessageFactoryUtil)*/Compose.mailMessageFactoryUtil,
                account = originalEvent.calendar.account,
                messageCreator = Compose.MessageFromEventCreator.instance(originalEvent, account, action),
                messageModel = Compose.MailMessageModel.instance(/*@static_cast(Compose.MessageModelSpec)*/{
                    initAction: composeAction,
                    messageCreator: messageCreator
                });

            // Adjust mail message properties after the new message is created
            messageCreator.setCallback(function (newMessage) {
                /// <param name="newMessage" type="Microsoft.WindowsLive.Platform.IMailMessage"></param>
                Debug.assert(Jx.isObject(newMessage), "newMessage is required");

                var calendarUtil = Compose.CalendarUtil;

                // Array of attendees
                var toRecipients = calendarUtil.getRecipientsArray(originalEvent);

                // See if the mail needs the extra "you're forwarding a meeting" content
                var forwardMessageContent = null;
                if (calendarUtil.messageRequiresForwardContent(newMessage)) {
                    forwardMessageContent = calendarUtil.getDownlevelForwardBodyContent(originalEvent);
                }

                var bodyContentList = [
                    // Signature
                    { signatureLocation: ModernCanvas.SignatureLocation.start },

                    // Reply header
                    {
                        content: calendarUtil.getReplyHeaderHtmlFromEvent(originalEvent, account, toRecipients),
                        format: ModernCanvas.ContentFormat.htmlString,
                        location: ModernCanvas.ContentLocation.end
                    },

                    // Original event content
                    calendarUtil.getBodyContentFromEvent(originalEvent)
                ];

                if (forwardMessageContent) {
                    bodyContentList.push(forwardMessageContent);
                }

                messageModel.addBodyContents(bodyContentList);

                messageModel.set({
                    subject: factoryUtil.fwPrefix + factoryUtil.normalizeSubject(originalEvent.subject),
                    to: "",
                    cc: "",
                    bcc: "",
                    importance: Microsoft.WindowsLive.Platform.MailMessageImportance.normal
                });
            }.bind(this));

            return messageModel;
        }
    };

    Compose.calendarForwardMessageModelFactory = new Compose.CalendarForwardMessageModelFactory();

});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.CalendarReplyMessageModelFactory = /*@constructor*/function () {
        /// <summary>Builds a message model for calendar reply/replyAll scenarios</summary>
    };

    Compose.CalendarReplyMessageModelFactory.prototype = {

        instance: function (originalEvent, action) {
            /// <param name="originalEvent" type="Microsoft.WindowsLive.Platform.Calendar.Event">Original calendar event on which the new mail will be based</param>
            /// <param name="action" type="Compose.CalendarActionType">Is this reply, or reply all?</param>

            Debug.assert(action === Compose.CalendarActionType.reply || action === Compose.CalendarActionType.replyAll, "Invalid reply action");
            Debug.assert(Jx.isObject(originalEvent), "originalEvent is required");

            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            var composeAction = Compose.util.convertToComposeAction(action);
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

            // If this is allowed to be "cancelled", we'd skip the _isValid check in calendarCancelMMF, and that could cause bad behavior.
            Debug.assert(action === Compose.CalendarActionType.reply || action === Compose.CalendarActionType.replyAll, "Invalid action");

            var factoryUtil = /*@static_cast(Compose.MailMessageFactoryUtil)*/Compose.mailMessageFactoryUtil,
                calendarUtil = Compose.CalendarUtil,
                account = originalEvent.calendar.account,
                messageCreator = Compose.MessageFromEventCreator.instance(originalEvent, account, action),
                messageModel = Compose.MailMessageModel.instance(/*@static_cast(Compose.MessageModelSpec)*/{
                    initAction: composeAction,
                    messageCreator: messageCreator
                });

            // Adjust mail message properties after the new message is created
            messageCreator.setCallback(function (newMessage) {
                /// <param name="newMessage" type="Microsoft.WindowsLive.Platform.IMailMessage"></param>
                Debug.assert(Jx.isObject(newMessage), "newMessage is required");

                // Array of attendees
                var toRecipients = calendarUtil.getRecipientsArray(originalEvent);

                messageModel.addBodyContents([
                    // Signature
                    { signatureLocation: ModernCanvas.SignatureLocation.start },

                    // Reply header
                    {
                        content: calendarUtil.getReplyHeaderHtmlFromEvent(originalEvent, account, toRecipients),
                        format: ModernCanvas.ContentFormat.htmlString,
                        location: ModernCanvas.ContentLocation.end
                    },

                    // Original event content
                    calendarUtil.getBodyContentFromEvent(originalEvent)
                ]);

                var toString;
                if (action === Compose.CalendarActionType.replyAll) {
                    // Use the array of attendees, plus the current account's emails.
                    // Account's emails will be removed from reply-all
                    var currentAccountEmails = /*@static_cast(Array)*/account.allEmailAddresses;
                    toString = factoryUtil.getRecipientsStringWithoutReceiver(toRecipients, currentAccountEmails);
                } else if (action === Compose.CalendarActionType.reply) {
                    toString = factoryUtil.getRecipientString(calendarUtil.createRecipient(originalEvent.organizerName, originalEvent.organizerEmail));
                }

                messageModel.set({
                    subject: factoryUtil.rePrefix + factoryUtil.normalizeSubject(originalEvent.subject),
                    to: toString,
                    cc: "",
                    bcc: "",
                    importance: Microsoft.WindowsLive.Platform.MailMessageImportance.normal
                });
            }.bind(this));

            return messageModel;
        }
    };

    Compose.calendarReplyMessageModelFactory = new Compose.CalendarReplyMessageModelFactory();

});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.CalendarEditResponseMessageModelFactory = /*@constructor*/function () {
        /// <summary>Builds a message model for calendar edit response before send scenarios</summary>
    };

    Compose.CalendarEditResponseMessageModelFactory.prototype = {

        instance: function (originalMessage, event, action) {
            /// <param name="originalMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">original invitation mail message</param>
            /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.Event">Calendar event</param>
            /// <param name="action" type="Compose.CalendarActionType">Is this accept, tentative or decline?</param>

            Debug.assert(action === Compose.CalendarActionType.accept || action === Compose.CalendarActionType.tentative || action === Compose.CalendarActionType.decline, "Invalid reply action");
            Debug.assert(Jx.isObject(event), "event is required");

            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            var composeAction = Compose.util.convertToComposeAction(action);
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            Debug.assert(composeAction === Compose.ComposeAction.reply);

            // Get account from message accountId if message is provided. Otherwise the event must be the original event from Calendar so it has account on it.
            Debug.assert(originalMessage || event.calendar);
            var account  = originalMessage ? Mail.Globals.platform.accountManager.loadAccount(originalMessage.accountId) : event.calendar.account;
            Debug.assert(account);

            var messageCreator = Compose.MessageForEditResponseCreator.instance(originalMessage, event, account, action),
                messageModel = Compose.MailMessageModel.instance(/*@static_cast(Compose.MessageModelSpec)*/{
                    initAction: composeAction,
                    messageCreator: messageCreator
                });

            // Adjust mail message properties after the new message is created
            messageCreator.setCallback(function (newMessage) {
                /// <param name="newMessage" type="Microsoft.WindowsLive.Platform.IMailMessage"></param>
                Debug.assert(Jx.isObject(newMessage), "newMessage is required");
                Debug.assert(Jx.isNonEmptyString(newMessage.to), "newMessage should have To field set");

                messageModel.addBodyContents([
                    // Signature
                    { signatureLocation: ModernCanvas.SignatureLocation.start },
                ]);

                messageModel.set({
                    subject: newMessage.subject,
                    to: newMessage.to,
                    cc: "",
                    bcc: "",
                    importance: newMessage.importance
                });
            }.bind(this));

            return messageModel;
        }
    };

    Compose.calendarEditResponseMessageModelFactory  = new Compose.CalendarEditResponseMessageModelFactory ();

});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.ref.js" />
/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.CalendarUtil = {};

    Compose.CalendarUtil.getBodyContentFromEvent = function (originalEvent) {
        /// <summary>
        /// Given an event, returns body content information suitable to be passed to setBodyContent representing the original event 'notes'
        /// </summary>
        /// <param name="originalEvent" type="Microsoft.WindowsLive.Platform.Calendar.Event">Event from which we should get body content</param>
        /// <returns type="Compose.BodyContent">BodyContent representing original event 'notes'</returns>

        var DataType = Microsoft.WindowsLive.Platform.Calendar.DataType;
        var eventDataType = originalEvent.dataType;
        var mailBody;
        var mailBodyFormat;

        if (eventDataType === DataType.plainText) {
            mailBody = originalEvent.data;
            mailBodyFormat = ModernCanvas.ContentFormat.text;
        } else if (eventDataType === DataType.html) {
            mailBody = originalEvent.data;
            mailBodyFormat = ModernCanvas.ContentFormat.htmlString;
        } else {
            // Our other format enum values are mime and RTF, neither of which we support, so we'll use the subject instead.
            mailBody = originalEvent.subject;
            mailBodyFormat = ModernCanvas.ContentFormat.text;
        }

        return {
            content: mailBody,
            format: mailBodyFormat,
            location: ModernCanvas.ContentLocation.end
        };
    };

    Compose.CalendarUtil.getReplyHeaderHtmlFromEvent = function (originalEvent, account, attendeesList) {
        /// <summary>Given an event, returns body content information suitable to be passed to setBodyContent representing the reply header</summary>
        /// <param name="originalEvent" type="Microsoft.WindowsLive.Platform.Calendar.Event">Event where we should get the reply header info</param>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount">account associated with the event</param>
        /// <param name="attendeesList" type="Array">Array of "recipients"</param>
        /// <returns type="String">Html for reply header</returns>

        var organizerEmail = originalEvent.organizerEmail;

        // Create array of attendees without the organizer
        var attendeesNoOrganizer = [];
        var attendeesLength = attendeesList.length;
        for (var i = 0; i < attendeesLength; i++) {
            var attendee = /*@static_cast(Microsoft.WindowsLive.Platform.IRecipient)*/attendeesList[i];

            // Don't include the organizer in the recipients list
            if (attendee.emailAddress !== organizerEmail) {
                attendeesNoOrganizer.push(attendee);
            }
        }

        var senderName = Jx.isNonEmptyString(originalEvent.organizerName) ? originalEvent.organizerName : organizerEmail,
            sender = { calculatedUIName: senderName, emailAddress: organizerEmail },
            factoryUtil = /*@static_cast(Compose.MailMessageFactoryUtil)*/Compose.mailMessageFactoryUtil;

        // Remaining info for reply header is simpler
        var replySpec = {
            recipientsCc: null,
            recipientsTo: factoryUtil.getReplyHeaderRecipientsHtml(attendeesNoOrganizer),
            recurring: originalEvent.recurring,
            sender: factoryUtil.getReplyHeaderRecipientsHtml([sender]),
            sentDate: null,
            subject: Jx.escapeHtml(originalEvent.subject),
            when: Jx.escapeHtml(Mail.Utilities.getCalendarEventTimeRange(account, originalEvent)),
            where: Jx.escapeHtml(originalEvent.location)
        };

        return factoryUtil.prepareReplyInfo(replySpec);
    };

    Compose.CalendarUtil.createRecipient = function (recipientName, email) {
        /// <summary>
        /// Creates a "recipient" with the given name and email address
        /// </summary>
        /// <param name="recipientName" type="String">Name of recipient</param>
        /// <param name="email" type="String">Email of recipient</param>
        /// <returns type="Microsoft.WindowsLive.Platform.IRecipient">'Recipient' object</returns>

        // We don't need to create a real platform recipient since the utility function is just going to turn it into a string anyway.
        var calculatedName = recipientName;
        if (!Jx.isNonEmptyString(calculatedName)) {
            calculatedName = email;
        }

        return /*@static_cast(Microsoft.WindowsLive.Platform.IRecipient)*/{
            calculatedUIName: calculatedName,
            emailAddress: email
        };
    };

    Compose.CalendarUtil.getRecipientsArray = function (originalEvent) {
        /// <summary>
        /// Given an event, returns an array of "recipients" (JS-created, not suitable for passing to the platform) that are attending the event.
        /// </summary>
        /// <param name="originalEvent" type="Microsoft.WindowsLive.Platform.Calendar.Event"></param>
        /// <returns type="Array">Array of "recipients"</returns>

        var toRecipients = [];
        var attendees = originalEvent.getAttendees();
        var createRecipient = Compose.CalendarUtil.createRecipient;

        // Add the organizer first
        if (Jx.isNonEmptyString(originalEvent.organizerEmail)) {
            toRecipients.push(createRecipient(originalEvent.organizerName, originalEvent.organizerEmail));
        }

        var attendeeLength = attendees.count;
        for (var i = 0; i < attendeeLength; i++) {
            var attendee = /*@static_cast(Microsoft.WindowsLive.Platform.Calendar.IAttendee)*/attendees.item(i);
            toRecipients.push(createRecipient(attendee.name, attendee.email));
        }

        return toRecipients;
    };

    Compose.CalendarUtil.getDownlevelForwardBodyContent = function (originalEvent, alternativeFromEmail) {
        /// <summary>Returns BodyContent for "downlevel" forward meeting message</summary>
        /// <param name="originalEvent" type="Microsoft.WindowsLive.Platform.Calendar.Event">Original calendar event</param>
        /// <param name="alternativeFromEmail" type="String" optional="true">Alternative email address to use for organizer/from if not retrievable from the event (optional)</param>
        /// <returns type="Compose.BodyContent" />

        // Insert the appropriate string to denote this is a Forwarded Invite - intended for messages that don't forward correctly.

        // Some events are known not to contain an organizer email - in that case we'll use the from field. (see WinLive 653092)
        var organizerEmail = originalEvent.organizerEmail;
        if (!Jx.isNonEmptyString(organizerEmail) && Jx.isNonEmptyString(alternativeFromEmail)) {
            organizerEmail = alternativeFromEmail;
        }
        Debug.assert(Jx.isNonEmptyString(organizerEmail), "Unable to find calendar organizer email");
        var calendarContent = "<div><br></div><div><br></div><div>" +
            Jx.res.loadCompoundString("composeForwardInviteMessage", '<a href="mailto:' + Jx.escapeHtml(organizerEmail) + '">' +
            Jx.escapeHtml(originalEvent.organizerName || organizerEmail) + '</a>') + "</div>";

        return { content: calendarContent, format: ModernCanvas.ContentFormat.htmlString, location: ModernCanvas.ContentLocation.start };
    };

    Compose.CalendarUtil.messageRequiresForwardContent = function (newMessage) {
        /// <summary>Determines whether the message needs additional calendar forward body content</summary>
        /// <param name="newMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">Newly created draft message to check</param>
        /// <param name="isCalendarForward" type="Boolean">Indicates whether this is a forward of a calendar item or a mail item</param>
        /// <returns type="Boolean" />

        if (newMessage.calendarMessageType !== Microsoft.WindowsLive.Platform.CalendarMessageType.request) {
            // Message is only necessary for invites
            return false;
        }

        // If we couldn't find a calendar, we'll default to showing the message
        var requiresForwardContent = true;

        // Get any calendar from the account - they should all have the same capabilities
        var calendar = null;
        var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Compose.platform;
        var account = platform.accountManager.loadAccount(newMessage.accountId);
        Debug.assert(account, "Unable to retrieve account");

        var calendars = platform.calendarManager.getAllCalendarsForAccount(account);
        calendars.lock();
        if (calendars.count > 0) {
            calendar = /*@static_cast(Microsoft.WindowsLive.Platform.Calendar.Calendar)*/calendars.item(0);
        }
        calendars.unlock();
        calendars.dispose();

        if (calendar) {
            var ServerCapability = Microsoft.WindowsLive.Platform.Calendar.ServerCapability;
            requiresForwardContent = ((calendar.capabilities & ServerCapability.canForward) !== ServerCapability.canForward) || ((calendar.capabilities & ServerCapability.canReplaceMime) !== ServerCapability.canReplaceMime);
        }

        return requiresForwardContent;
    };

    Compose.CalendarUtil.PreEditResponseActionsEx = function (event, originalEvent, message, response, account) {
        /// <summary>Perform meeting response actions before edit response: send meeting response and update event status for accept and tentative response</summary>
        /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.Event">Event used for send meeting response. Can be either original event or event on the invite message</param>
        /// <param name="originalEvent" type="Microsoft.WindowsLive.Platform.Calendar.Event">Original Calendar event</param>
        /// <param name="message" type="Microsoft.WindowsLive.Platform.IMailMessage">The original invitation message</param>
        /// <param name="response" type="Microsoft.WindowsLive.Platform.Calendar.ResponseType">Response type</param>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount">account associated with the event</param>

        // For accept and tentative, send meeting response and update event status before launch compose note for editing.
        var Cal = Microsoft.WindowsLive.Platform.Calendar,
            ResponseType = Microsoft.WindowsLive.Platform.Calendar.ResponseType;
        if (response !== ResponseType.declined) {
            Debug.assert(account);
            Debug.assert(event);
            var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Compose.platform;

            // send the MeetingResponse first
            platform.invitesManager.sendMeetingResponse(event, message, response, account);

            // Update busy status on the event
            if (originalEvent) {
                var BusyStatus = Cal.BusyStatus;
                originalEvent.responseType = response;
                if (response === ResponseType.accepted) {
                    originalEvent.busyStatus = originalEvent.allDayEvent ? BusyStatus.free : BusyStatus.busy;
                } else {
                    originalEvent.busyStatus = BusyStatus.tentative;
                }

                originalEvent.commit();
            }
        }
    };

    Compose.CalendarUtil.PreEditResponseActionsforCalendar = function (originalEvent, calendarAction) {
        /// <summary>Perform meeting response actions before edit response. Called when edit response is initiated from Calendar</summary>
        /// <param name="originalEvent" type="Microsoft.WindowsLive.Platform.Calendar.Event">Original Calendar event</param>
        /// <param name="action" type="Compose.CalendarActionType">Action to take on the event</param>
        Debug.assert(originalEvent && originalEvent.calendar);
        var account = originalEvent.calendar.account;
        var response = Compose.util.convertCalendarActionTypeToCalenderResponseType(calendarAction);
        Compose.CalendarUtil.PreEditResponseActionsEx(originalEvent, originalEvent, null, response, account);
    };

    Compose.CalendarUtil.MoveMessageToDeleted = function (platformMessage) {
        // Move the item to Deleted view. When the message is moved, if the source view is Deleted/Junk/Draft/Outbox, platform will permanently
        // delete the message instead of moving it to Deleted. To prevent message from being permanently deleted, we pick Inbox view, which is
        // one of the views that doesn't result in permanent delete on move, to be the source view.
        //
        // This method is used by Calendar response actions where the invite message needs to be moved to Deleted on either responding
        // or sending response email. User could be in Drafts folder if it's an "edit response before decline" action where we delete
        // the orignial email on send, or in any other folder(even in Deleted) if it's other types of responses depending on where the
        // original invite message exists. The intention here is to prevent unintentional permanent deletion of message.
        Debug.assert(platformMessage);
        var selection = Mail.Utilities.ComposeHelper._selection,
            account = selection.account;
        Debug.assert(account && account.inboxView && account.deletedView);
        selection.moveItemsFrom(account.inboxView, account.deletedView, [platformMessage]);
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.dep.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.MessageFromEventCreator = /*@constructor*/function (originalEvent, account, action) {
        /// <summary>
        /// Creates a new message based on the given event
        /// </summary>
        /// <param name="originalEvent" type="Microsoft.WindowsLive.Platform.Calendar.Event">original event</param>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount">account associated with the event</param>
        /// <param name="action" type="Compose.CalendarActionType">Action to take on the event</param>

        Debug.assert(Jx.isObject(originalEvent), "Original event is required in order to create a new message");

        Compose.MailMessageCreator.call(this);

        this._originalEvent = originalEvent;
        this._newMessage = /*@static_cast(Microsoft.WindowsLive.Platform.IMailMessage)*/null;
        this._account = account;
        this._action = action;

        Debug.assert(Compose.util.isValidCalendarAction(action), "Unsupported calendar action");
    };

    Compose.MessageFromEventCreator.instance = function (originalEvent, account, action) {
        /// <param name="originalEvent" type="Microsoft.WindowsLive.Platform.Calendar.Event">original event</param>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount">account</param>
        /// <param name="action" type="Compose.CalendarActionType">Action to take on the event</param>
        return new Compose.MessageFromEventCreator(originalEvent, account, action);
    };

    Jx.augment(Compose.MessageFromEventCreator, Compose.MailMessageCreator);

    var proto = Compose.MessageFromEventCreator.prototype;

    proto.createMessage = function () {

        var newMessage = /*@static_cast(Microsoft.WindowsLive.Platform.IMailMessage)*/null;
        var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Compose.platform;

        switch (this._action) {
            case Compose.CalendarActionType.forward: 
                newMessage = platform.invitesManager.createSmartForwardMail(this._originalEvent, this._account);
                break;
            case Compose.CalendarActionType.reply:
            case Compose.CalendarActionType.replyAll:
                newMessage = platform.mailManager.createMessage(this._account);
                break;
            case Compose.CalendarActionType.cancel:
                newMessage = this._createCancelMail();
                break;
            default:
                Debug.assert(false, "Unsupported calendar action");
                break;
        }

        this._newMessage = newMessage;

        return newMessage;
    };

    proto._createCancelMail = function () {
        /// <summary>Creates a cancellation email based on this._originalEvent</summary>

        // mailFromEvent creates the mail based on the current state of the event, which we will need to change.
        // We don't save the event now, and the other compose code also doesn't save the event, so the changes won't make it back to the platform.
        // For this flow the event isn't actually saved until the mail is sent.

        var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Compose.platform;
        var factoryUtil = /*@static_cast(Compose.MailMessageFactoryUtil)*/Compose.mailMessageFactoryUtil;
        var MeetingStatus = Microsoft.WindowsLive.Platform.Calendar.MeetingStatus;

        Debug.assert(this._originalEvent.isOrganizer, "Invalid organizer status for cancel - attendee should not be able to cancel a meeting.");

        this._originalEvent.meetingStatus = MeetingStatus.isAMeeting | MeetingStatus.isCanceled;
        
        // Need to update the meeting subject to include Cancelled: prefix
        var cancelPrefix = Jx.res.getString("EventCancelledPrefix");
        this._originalEvent.subject = cancelPrefix + factoryUtil.normalizeSubject(this._originalEvent.subject);

        var newMessage = platform.invitesManager.mailFromEvent(this._originalEvent, this._account);

        Debug.assert(newMessage.calendarMessageType === Microsoft.WindowsLive.Platform.CalendarMessageType.cancelled, "Unexpected non-cancellation mail from mailFromEvent");

        return newMessage;
    };

    proto.onMessageCreated = function () {
        /// <summary>Caller should call this function after calling createMessage()</summary>
        Debug.assert(Jx.isObject(this._newMessage));

        var callback = this.getCallback();
        if (Jx.isFunction(callback)) {
            callback(this._newMessage);
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="compose.dep.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.MessageForEditResponseCreator = /*@constructor*/function (inviteMessage, event, account, action) {
        /// <summary>
        /// Creates a new message for edit response before send based on the given event and invite message
        /// </summary>
        /// <param name="inviteMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">original invitation mail message</param>
        /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.Event">Calendar event. This can be the event from Mail message or original Calendar event</param>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount">account associated with the event</param>
        /// <param name="action" type="Compose.CalendarActionType">Action to take on the event</param>

        Debug.assert(Jx.isObject(event), "Original event is required in order to create a new message");

        Compose.MessageFromEventCreator.call(this, event, account, action);

        this._inviteMessage = inviteMessage;
    };

    Compose.MessageForEditResponseCreator.instance = function (inviteMessage, event, account, action) {
        /// <param name="inviteMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">original invitation mail message</param>
        /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.Event">Calendar event. This can be the event from Mail message or original Calendar event</param>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount">account</param>
        /// <param name="action" type="Compose.CalendarActionType">Action to take on the event</param>
        return new Compose.MessageForEditResponseCreator(inviteMessage, event, account, action);
    };

    Jx.augment(Compose.MessageForEditResponseCreator, Compose.MessageFromEventCreator);


    var proto = Compose.MessageForEditResponseCreator.prototype;

    proto.createMessage = function () {

        var newMessage = /*@static_cast(Microsoft.WindowsLive.Platform.IMailMessage)*/null;
        var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Compose.platform;
        var responseType = Compose.util.convertCalendarActionTypeToCalenderResponseType(this._action);

        switch (this._action) {
            case Compose.CalendarActionType.accept:
            case Compose.CalendarActionType.tentative:
            case Compose.CalendarActionType.decline:
                newMessage = platform.invitesManager.createResponseMail(this._originalEvent, this._inviteMessage, responseType, this._account);
                break;            
            default:
                Debug.assert(false, "Unsupported calendar action");
                break;
        }

        this._newMessage = newMessage;

        return newMessage;
    };

});
