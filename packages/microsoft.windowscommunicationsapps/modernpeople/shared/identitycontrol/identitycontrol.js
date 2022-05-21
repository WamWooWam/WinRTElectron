
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//


/// <reference path="Windows.UI.PopUps.js" />
/// <reference path="../JSUtil/Include.js"/>
/// <reference path="../JSUtil/PeopleLog.js"/>
/// <reference path="../JSUtil/PeopleAnimation.js"/>
/// <reference path="../../AddressBook/Controls/Scheduler/Priority.js"/>
/// <reference path="../../AddressBook/Controls/Scheduler/JobSet.js"/>
/// <reference path="../../AddressBook/Controls/Scheduler/Scheduler.js"/>
/// <reference path="IdentityControl.ref.js"/>
/// <reference path="IdentityControlActions.js"/>
/// <reference path="../Platform/PlatformObjectBinder.js"/>

/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>
/// <disable>JS2076.IdentifierIsMiscased</disable>

/// <dictionary>jobset,accessor</dictionary>

Jx.delayDefine(People, "IdentityControl", function () {
    
    "use strict";
    var P = window.People;

    var IdentityControl = P.IdentityControl = /*@constructor*/function (/*@dynamic*/dataObject, jobSet, options) {
        ///<summary>Creates a new Identity control.</summary>
        ///<param name="dataObject" optional="true">An IPerson, IRecipient, IContact or object literal.  Can be set or
        ///changed later with a call to updateDataSource.</param>
        ///<param name="jobSet" type="P.JobSet" optional="true"/>
        ///<param name="options" type="Object" optional="true">
        ///options: { // configuration options, defaults are as shown and can be omitted.
        ///     interactive: true, // controls whether the IC responds to click/hover/etc
        ///     getTooltip: function (dataObject, defaultText) {
        ///         /// <summary>Can be used to override the default tooltip</summary>
        ///         /// <param name="dataObject"/>
        ///         /// <param name="defaultText" type="String">Default IC tooltip text</param>
        ///         /// <returns type="String">The tooltip value</returns>
        ///         return defaultText;
        ///     },
        ///     onClick: function (dataObject) {
        ///         /// <summary>Can be used to override the click action</summary>
        ///         /// <param name="dataObject"/>
        ///         /// <returns type="Boolean">If true is returned, the IC will perform its default action,
        ///         /// navigating to the profile.</returns>
        ///         return true;
        ///     },
        ///     selectionManager: null, // Providing an implementation of selectionManager allows an IC to
        ///                             // render selection UX.  It does not change the click behavior.
        ///     createJobSet: true, // If this is set to false, the IC will just use the provided jobset directly.
        ///                         // It will assume that the parent correctly cancels jobs before changing the 
        ///                         // data source or shutting down the UI.  If true, the IC will create its own
        ///                         // jobset, using the provided value as a parent, and will manage its own
        ///                         // cancellation.
        ///}
        ///</param>
        Debug.assert(Jx.isNullOrUndefined(jobSet) || Jx.isObject(jobSet));
        Debug.assert(Jx.isNullOrUndefined(options) || Jx.isObject(options));

        NoShip.People.etw("abIdentityControl_start");

        loadCSS();

        this._ownJobSet = false;
        this._jobSet = jobSet;
        this._elementHost = new ElementHost(this);
        if (options) {
            this._options = options;
        }
        this._elements = [];
        this._bindings = [];
        this._binder = this._lastBinder = /*@static_cast(P.PlatformObjectBinder)*/null;
        this._lastBinderType = "";
        this._dataObject = null;
        if (dataObject) { 
            this._setDataObject(dataObject);
        }
        this._selectionManager = getOption(options, "selectionManager");
        this._needsTooltip = false;

        Debug.only(Object.seal(this));
    };
    var loadCSS = function () {
        $include("$(cssResources)/IdentityControl.css");
        loadCSS = Jx.fnEmpty;
    };
    IdentityControl.prototype.getUI = function (elementType, elementOptions) {
        ///<summary>Produces HTML for an IC element.  This function can be called multiple times to get
        ///HTML for different elements, all attached to the same IC.</summary>
        ///<param name="elementType" type="Function">Constructor function for an IC or custom
        ///element.</param>
        ///<param name="elementOptions" type="Object" optional="true">Options to pass to the element's getUI
        ///implementation.</param>
        ///<returns type="String">An HTML string that represents the given element.</returns>
        Debug.assert(Jx.isFunction(elementType));
        Debug.assert(Jx.isNullOrUndefined(elementOptions) || Jx.isObject(elementOptions));
        var controlOptions = this._options;
        if (getOption(controlOptions, "interactive", true)) {
            // Add tabIndex and role for interactive ICs
            elementOptions = elementOptions ? Object.create(elementOptions) : {};
            elementOptions.attributes = getOption(elementOptions, "attributes", "") + 
                                 " tabIndex='" + getOption(elementOptions, "tabIndex", getOption(controlOptions, "tabIndex", "0")) + "'" +
                                 " role='" + getOption(controlOptions, "role", "button") + "'";
        }
        return this._getUI(elementType, elementOptions, false /* not nested */);
    };
    IdentityControl.prototype._getUI = function (elementType, options, nested) {
        ///<param name="elementType" type="Function"/>
        ///<param name="options" type="Object" optional="true"/>
        ///<param name="nested" type="Boolean" optional="true">False if this is a top level element</param>
        Debug.assert(Jx.isFunction(elementType));
        Debug.assert(Jx.isNullOrUndefined(options) || Jx.isObject(options));

        ///<disable>JS2063.ConstructorNamesArePascalCased</disable> Unless they are held in a variable
        var element = /*@static_cast(IdentityControlElement)*/new elementType();
        ///<enable>JS2063.ConstructorNamesArePascalCased</enable>

        var locator = "ic-locator-" + String(Jx.uid());

        var html = element.getUI(this._elementHost, locator, options);

        this._elements.push({
            element: element,
            selector: "." + locator,
            nested: Boolean(nested)
        });
        return html;
    };

    IdentityControl.prototype.activateUI = function (ancestorNode) {
        ///<summary>Activates interactivity and data updates for any HTML returned from getUI.  Must be
        ///called after the HTML returned by getUI is instantiated.</summary>
        ///<param name="ancestorNode" type="HTMLElement" optional="true">A node whose descendent tree
        ///contains nodes created from the HTML returned by getUI.  Required if the instantiated nodes are
        ///not part of window.document</param>        
        Debug.assert(Jx.isNullOrUndefined(ancestorNode) || Jx.isHTMLElement(ancestorNode));
        ancestorNode = ancestorNode || document.body;

        if (getOption(this._options, "createJobSet", true)) {
            this._ownJobSet = true;
            var parentJobSet = this._jobSet || getParentJobSet();
            this._jobSet = parentJobSet.createChild();
        }

        var interactive = getOption(this._options, "interactive", true);

        var elements = this._elements;
        var host = this._elementHost;
        for (var i = 0, len = elements.length; i < len; ++i) {
            var item = /*@static_cast(IdentityControlElementData)*/elements[i];
            var node = ancestorNode.querySelector(item.selector);
            if (node === null && ancestorNode.msMatchesSelector(item.selector)) {
                node = ancestorNode;
            } else {
                Debug.call(function () {
                    Debug.assert(ancestorNode.querySelectorAll(item.selector).length === 1, "Error locating IC element");
                });
            }
            item.node = node;

            if (interactive && !item.nested) {
                this.attachBehaviors(node);
            }

            item.element.activateUI(host, node);
        }

        if (interactive) {
            this._needsTooltip = true;
            this._addTooltip();
        }

        this._bind(this._updateLabel, this, P.Priority.accessibility);
    };

    IdentityControl.prototype.updateDataSource = function (/*@dynamic*/dataObject) {
        ///<summary>Changes the person this IC is rendering.  This is not required, it just allows 
        ///recycling of this control.</summary>
        ///<param name="dataObject" optional="true">An IPerson, IContact, IRecipient or object literal</param>

        this._closeTooltip();
        // Cancel any outstanding jobs that related to the previous data object.  If the caller provided their own 
        // jobset, they are expected to have cancelled it before calling updateDataSource.
        if (this._ownJobSet) {
            this._jobSet.cancelJobs();
        }

        if (this._dataObject !== null) {
            this._clearDataObject();
        }

        if (dataObject !== null) { 
            this._setDataObject(dataObject);

            // Invoke all of our bindings with the new data (each at its own priority)
            this._bindings.forEach(this._startBinding, this);

            // Create the tooltip (delayed because it is a bit slow, retried here because the jobset may have just been cancelled)
            this._addTooltip();
       }
    };

    IdentityControl.prototype.clone = function (clonedNode, /*@dynamic*/dataObject, jobSet) {
        ///<summary>An identity control supports cloning for faster creation of repeated elements.  After calling
        ///cloneNode on this identity control's HTML element or some parent thereof, the new element can be passed to 
        ///this method to create and activate a new IC with all of the same elements and options on the freshly cloned
        ///HTML nodes.</summary>
        ///<param name="clonedNode" type="HTMLElement">An HTML element cloned from this IC's UI</param>
        ///<param name="dataObject" optional="true">A data object to populate the new IC</param>
        ///<param name="jobSet" type="P.JobSet" optional="true"/>
        ///<returns type="IdentityControl">The new IC</returns>

        // Create the cloned control
        var clonedControl = new IdentityControl(dataObject, jobSet, this._options);
        var clonedHost = clonedControl._elementHost;

        // Clone all of its elements
        clonedControl._elements = this._elements.map(function (/*@type(IdentityControlElementData)*/item) {
            var templateElement = item.element;
            var clonedElement = templateElement.clone(clonedHost);
            return {
                element: clonedElement,
                selector: item.selector,
                nested: item.nested
            };
        });

        // Activate it on the provided HTML node
        clonedControl.activateUI(clonedNode);

        return clonedControl;
    };

    IdentityControl.prototype.shutdownUI = function () {
        ///<summary>Must be called when the IC is no longer used, to kill circular references between this 
        ///control and the platform.</summary>
        this._closeTooltip();
        if (this._ownJobSet) {
            this._jobSet.dispose();
            this._jobSet = null;
            this._ownJobSet = false;
        }

        if (this._binder) {
            this._binder.dispose();
            this._binder = null;
        }
        this._dataObject = null;

        var interactive = getOption(this._options, "interactive", true);
        var elements = this._elements;
        var host = this._elementHost;
        for (var i = 0, len = elements.length; i < len; ++i) {
            elements[i].element.shutdownUI(host);
        }
    };

    var events = [ "click" , "MSPointerDown", "keydown", "beforeopen" ];
    IdentityControl.prototype.attachBehaviors = function (node) {
        ///<summary>Attachs interactive behaviors (click/contextmenu/tooltip/etc) to a top-level node
        ///of an IC</summary>
        ///<param name="node" type="HTMLElement"/>
        Debug.assert(Jx.isHTMLElement(node));
        var listener = this._onDomEvent.bind(this, node);
        events.forEach(function (evt) { 
            node.addEventListener(evt, listener, false);
        });
        if (getOption(this._options, "onRightClick")) {
            node.addEventListener("contextmenu", listener, false);
            node.addEventListener("MSHoldVisual", function (ev) { ev.preventDefault(); }, false); // We only want to handle right clicks with onContextMenu, so suppress the context menu hint.
        }
    };

    IdentityControl.prototype._addTooltip = function () {
        ///<summary>Schedules the tooltip to be added later, to mitigate its expense</summary>
        if (this._needsTooltip) {
            this._jobSet.addUIJob(this, /*@bind(IdentityControl)*/function () {
                if (this._needsTooltip) {
                    this._needsTooltip = false;

                    var elements = this._elements;
                    for (var i = 0, len = elements.length; i < len; ++i) {
                        var element = /*@static_cast(IdentityControlElementData)*/elements[i];
                        if (!element.nested) {
                            var node = element.node;
                            var tooltip = element.tooltip = new WinJS.UI.Tooltip(node);
                        }
                    }
                }
            }, null, P.Priority.tooltip);
        }
    };

    IdentityControl.prototype._closeTooltip = function () {
        ///<summary>Closes any opened tooltip in response to this control being destroyed or recycled</summary>
        var elements = this._elements;
        for (var i = 0, len = elements.length; i < len;  ++i) {
            var tooltip = /*@static_cast(WinJS.UI.Tooltip)*/elements[i].tooltip;
            if (tooltip) {
                tooltip.close();
            }
        }
    };

    IdentityControl.prototype._onDomEvent = function (node, event) {
        ///<summary>All events on the IC use a single listener to avoid the cost at creation of repetitive binds</summary>
        ///<param name="node" type="HTMLElement">The node to which this event was bound in attachBehaviors</param>
        ///<param name="event" type="Event"/>
        Debug.assert(Jx.isHTMLElement(node));
        Debug.assert(Jx.isObject(event));
        switch (event.type) {
            case "click": this._onClick(node, event); break;
            case "pointerdown":
            case "MSPointerDown":
                this._onPointerDown(node, event);
                break;
            case "keydown": this._onKeyDown(node, event); break;
            case "beforeopen": this._onTooltip(node); break;
            case "contextmenu": this._onContextMenu(node, event); break;
        }
    };

    IdentityControl.prototype._onPointerDown = function (node, event) {
        ///<summary>Pointer down handler, starts the press animation</summary>
        ///<param name="node" type="HTMLElement"/>
        ///<param name="event" type="Event"/>
        Debug.assert(Jx.isHTMLElement(node));
        Debug.assert(Jx.isObject(event));

        var dataObject = this._dataObject;
        if (dataObject !== null && getOption(this._options, "pressEffect", true)) {
            var supportsRightClick = getOption(this._options, "onRightClick");
            P.Animation.startTapAnimation(node, event, supportsRightClick); 
        }
    };
    IdentityControl.prototype._onClick = function (node, event) {
        ///<summary>Click handler</summary>
        ///<param name="node" type="HTMLElement"/>
        ///<param name="event" type="Event"/>
        Debug.assert(Jx.isHTMLElement(node));
        Debug.assert(Jx.isObject(event));
        event.stopPropagation();

        var dataObject = this._dataObject;
        if (dataObject !== null) {
            var override = getOption(this._options, "onClick");
            if (!override || override(dataObject, node, event)) {
                P.IdentityControlActions.primaryAction(dataObject, node);
            }
        }
    };

    IdentityControl.prototype._onContextMenu = function (node, event) {
        ///<summary>Context menu handler, to detect right clicks</summary>
        ///<param name="node" type="HTMLElement"/>
        ///<param name="event" type="Event"/>
        if (event.which === 3) { // Mouse event
            var dataObject = this._dataObject;
            if (dataObject !== null) {
                var onRightClick = getOption(this._options, "onRightClick");
                Debug.assert(onRightClick, "We should not have subscribed this event without a handler");

                event.stopPropagation();
                event.preventDefault();
                onRightClick(dataObject, node);
            }
        }
    };

    IdentityControl.prototype._onKeyDown = function (node, event) {
        ///<summary>Keydown handler</summary>
        ///<param name="node" type="HTMLElement"/>
        ///<param name="event" type="Event"/>
        Debug.assert(Jx.isHTMLElement(node));
        Debug.assert(Jx.isObject(event));
        if (event.key === "Spacebar" || (event.key === "Enter" && !this._selectionManager)) {
            event.stopPropagation();
            event.preventDefault();
            this._onClick(node, event);
        }
    };

    IdentityControl.prototype._onTooltip = function (node) {
        ///<summary>Tooltip event handler</summary>
        ///<param name="node" type="HTMLElement"/>
        var tooltip = "";
        var dataObject = this._dataObject;
        if (dataObject) {
            tooltip = this._getTextLabel(dataObject, "getTooltip");
        }

        // Set the tooltip into the PAC tooltip control requires converting it to HTML.
        var tooltipControl = node.winControl;
        var html = "";
        if (Jx.isNonEmptyString(tooltip)) {
            html = tooltip.split("\n").map(function (line) {
                return "<div class='ic-tooltip'>" + Jx.escapeHtml(line) + "</div>"; }
            ).join("");
        }
        tooltipControl.innerHTML = html;

        // Windows 8 Bug #450298:  if the view is scrolled while the tooltip is showing, the tooltip control does not 
        // update its position or dismiss.
        for (var parentElement = node.parentElement; parentElement; parentElement = parentElement.parentElement) {
            if (getComputedStyle(parentElement).overflow === "scroll") {
                break;
            }
        }
        if (parentElement) {
            node.addEventListener("opened", function tooltipOpened() {
                node.removeEventListener("opened", tooltipOpened, false);

                var parentScrolled = function () { tooltipControl.close(); };
                parentElement.addEventListener("scroll", parentScrolled, false);

                node.addEventListener("closed", function tooltipClosed() {
                    node.removeEventListener("closed", tooltipClosed, false);
                    parentElement.removeEventListener("scroll", parentScrolled, false);
                }, false);
            }, false);
        }
    };

    IdentityControl.prototype._getTextLabel = function (dataObject, overrideName) {
        /// <summary>Gets the label text (tooltip or aria-label) for this control</summary>
        /// <param name="dataObject">The person/recipient/contact/literal, or a bound accessor to the same</param>
        /// <param name="overrideName" type="String">The override in the options that will adjust this text</param>

        var host = this._elementHost;
        // The default tooltip/label contains the name.
        // But we'll add a line for any element that supports it (StatusIndicator).
        var text = [P.IdentityElements.Name.getName(dataObject)].concat(
            this._elements.map(function (/*@type(IdentityControlElementData)*/item) {
                if (item.element.getTooltip) {
                    return item.element.getTooltip(host, dataObject, item.nested);
                } else {
                    return null;
                }
            }).filter(Jx.isNonEmptyString)
        ).join("\n");

        // The override can modify/replace the label string any way it likes.
        var override = getOption(this._options, overrideName);
        if (override) {
            text = override(dataObject, text);
        }

        return text;
    };

    IdentityControl.prototype._updateLabel = function (dataObject) {
        /// <summary>Updates the aria-label for this control</summary>
        /// <param name="dataObject">A bound accessor</param>
        var text = this._getTextLabel(dataObject, "getLabel");

        var elements = this._elements;
        for (var i = 0, len = elements.length; i < len; ++i) {
            var element = elements[i];
            if (!element.nested) { 
                element.node.setAttribute("aria-label", text);
            }
        }
    };

    IdentityControl.prototype._clearDataObject = function () {
        ///<summary>Clears the current data object</summary>
        Debug.assert(Jx.isObject(this._dataObject));

        var binder = this._binder;
        if (binder !== null) {
           this._binder = null;
           this._lastBinder = binder;
           this._lastBinderType = this._dataObject.objectType;
           binder.dispose();
        }

        this._dataObject = null;
    };

    IdentityControl.prototype._setDataObject = function (/*@dynamic*/dataObject) {
        ///<summary>Stores the given data object</summary>
        ///<param name="dataObject">An IPerson, IRecipient, IContact or object literal</param>
        Debug.assert(Jx.isObject(dataObject));
        Debug.assert(Jx.isNullOrUndefined(this._dataObject));

        if (dataObject.getPlatformObject) {
            // unwrap any accessor passed in, this code handles its own notifications and lifetime
            dataObject = dataObject.getPlatformObject();
        }

        this._dataObject = dataObject;

        // Get a binder if we need one
        var objectType = dataObject.objectType;
        if (objectType !== "literal") { 
             if (this._lastBinderType === objectType) { // See if we can reuse the last binder
                 var binder = this._binder = this._lastBinder;
                 binder.setObject(dataObject);
             } else {
                 // If not, create a new binder
                 this._binder = new P.PlatformObjectBinder(dataObject);
             }
        }

        // The last binder has now either been reused or replaced.  Discard it.
        this._lastBinder = null;
        this._lastBinderType = "";
    };

    IdentityControl.prototype._bind = function (callback, /*@dynamic*/context, priority) {
        ///<summary>When another object wants access to our dataObject, it will "bind" to it.  That means it will receive an accessor to the data, and calls to its callback whenever that data changes.  The accessor will track internally which
        ///changes the caller is interested in by monitoring what they access.</summary>
        var binding = { callback: callback, context: context, priority: priority, binder: null, accessor: null };
        binding.onUpdate = this._updateBinding.bind(this, binding, P.Priority.propertyUpdate);
        this._bindings.push(binding);
        if (this._dataObject) { // If we already have data, serve it up now
            this._startBinding(binding);
        }
    };

    IdentityControl.prototype._startBinding = function (binding) {
        ///<summary>Given a binding (a request from another object for access to our dataObject), run it.  This means preparing an accessor that will watch what data the binding is accessing, hooking it up for notifications on that accessor,
        /// and giving it its first call at the priority it has specified.</summary>
        ///<param name="binding" type="IdentityControlBinding"/>
        var binder = this._binder;
        if (binder) {
            if (binding.binder !== binder) {
                binding.binder = binder;
                binding.accessor = binder.createAccessor(binding.onUpdate);
            }
        } else {
            binding.accessor = this._dataObject;
        }
        this._updateBinding(binding, binding.priority);
    };

    IdentityControl.prototype._updateBinding = function (binding, priority) {
        ///<summary>Calls the callback associated with the specified binding at the desired priority</summary>
        ///<param name="binding" type="IdentityControlBinding"/>
        ///<param name="priority"/> type="P.Priority"
        if (priority === P.Priority.synchronous) {
            binding.callback.call(binding.context, binding.accessor);
        } else {
            this._jobSet.addUIJob(binding.context, binding.callback, [ binding.accessor ], priority);
        }
    };

    var addClassNameToOptions = IdentityControl.addClassNameToOptions = function (className, /*@dynamic*/options) {
        ///<summary>A static helper function: given an option struct and a className, returns a new option struct
        ///that combines the two</summary>
        ///<param name="className" type="String"/>
        ///<param name="options" optional="true"/>
        ///<returns type="Object"/>
        Debug.assert(Jx.isNonEmptyString(className));
        Debug.assert(Jx.isNullOrUndefined(options) || Jx.isObject(options));
        if (options) {
            if (options.className) {
                options.className += " " + className;
            } else {
                options.className = className;
            }
        } else {
            options = { className: className };
        }
        return options;
    };
    var getOption = IdentityControl.getOption = function (options, optionName, /*@dynamic*/defaultValue) {
        ///<summary>A static helper function: given an options struct, returns the specified option.  If not present, 
        ///returns the provided default</summary>
        ///<param name="options" type="Object"/>
        ///<param name="optionName" type="String"/>
        ///<param name="defaultValue" optional="true"/>
        Debug.assert(Jx.isNullOrUndefined(options) || Jx.isObject(options));
        Debug.assert(Jx.isNonEmptyString(optionName));
        var value = defaultValue;
        if (options) {
            value = options[optionName];
            if (value === undefined) {
                value = defaultValue;
            }
        }
        return value;
    };

    /*@constructor*/ function ElementHost(identityControl) {
        ///<summary>The ElementHost acts as a private interface on IdentityControl.  It is provided to
        ///IdentityElements.</summary>
        ///<param name="identityControl" type="IdentityControl"/>
        this._identityControl = identityControl;
    }
    ElementHost.prototype.bind = function (callback, context, priority) {
        this._identityControl._bind(callback, context, priority);
    };
    ElementHost.prototype.getUI = function (elementType, options) {
        ///<summary>Creates a child element and returns its HTML</summary>
        ///<param name="elementType" type="Function"/>
        ///<param name="options" optional="true" type="Object"/>
        ///<returns type="String"/>
        return this._identityControl._getUI(elementType, options, true /*nested*/);
    };
    ElementHost.prototype.getSelectionManager = function () {
        ///<summary>Gets the selection manager object provided in the options.</summary>
        return this._identityControl._selectionManager;
    };
    ElementHost.prototype.getDataObject = function () {
        ///<summary>Gets the current data object.</summary>
        return this._identityControl._dataObject;
    };

    var getParentJobSet = function () {
        // If the client doesn't provide a jobset, we'll use a global scheduler for all of their ICs,
        // but that activity won't be coordinated with / prioritized against any other scheduled work
        // on the page.
        var scheduler = new P.Scheduler();
        var jobSet = scheduler.getJobSet();
        getParentJobSet = function () { return jobSet; };
        return jobSet;
    };

    Debug.only(IdentityControl = Debug.leaks.createInstrumentedConstructor(IdentityControl, "People.IdentityControl"));

});
