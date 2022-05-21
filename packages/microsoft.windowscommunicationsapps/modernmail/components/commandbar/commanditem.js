
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug */
/*jshint browser:true*/

Jx.delayDefine(Mail.Commands, ["Item", "ToggleItem", "MenuItem", "ToggleMenuItem"], function () {

    Mail.Commands.Item = function (options) {
        /// <summary>Constructor for a command</summary>
        /// <param name="options" type="Mail.Commands.ItemOptions" />
        Debug.call(Mail.Commands.Item._validateOptions, null, options);

        this._options = options;

        this._cachedLabel = null;
        this._cachedTooltip = null;

        this.isEnabled = options.isEnabled || function () { return true; };
    };

    
    Mail.Commands.Item._validateOptions = function (options) {
        /// <param name="options" type="Mail.Commands.ItemOptions" />
        var validContextIds = ["guiState", "folderOperations", "selection", "readStatus", "flagStatus", "sasStatus", "resourceState", "accountState", "showAppBar", "pinnedFolder", "folderChange", "isSearching", "irm", "selectionMode", "composeSelection"];
        var validCommandType = ["button", "toggle", "shortcut", "flyout", "separator"];
        Debug.assert(Jx.isObject(options));
        Debug.assert(Jx.isNonEmptyString(options.id));
        Debug.assert(Jx.isNonEmptyString(options.type));
        Debug.assert(validCommandType.indexOf(options.type) !== -1, "Invalid command type <" + options.type + ">.  It must be one of " + validCommandType.join(","));
        Debug.assert((options.type === "separator") || (options.type === "shortcut") || (options.type === "toggle") || Jx.isNonEmptyString(options.icon));
        Debug.assert((!Jx.isBoolean(options.useCustomFont)) || (Jx.isBoolean(options.useCustomFont) && options.useCustomFont), "useCustomFont must be true or not defined");
        Debug.assert(Jx.isFunction(options.handler) || (Jx.isFunction(options.handler.off) && Jx.isFunction(options.handler.on)));
        Debug.assert((options.type === "separator") || (options.type === "shortcut") || Jx.isBoolean(options.dismissAfterInvoke) || Jx.isObject(options.dismissAfterInvoke));
        Debug.assert(!Jx.isBoolean(options.noAnimationOnDismiss) || options.dismissAfterInvoke, "Can't have noAnimationOnDismiss without dismissAfterInvoke=true");
        if (Jx.isArray(options.enableContext)) {
            Debug.assert(Jx.isFunction(options.isEnabled), "Contextual commands must implement isEnabled");
            options.enableContext.forEach( function (contextId) {
                Debug.assert(validContextIds.indexOf(contextId) !== -1, "Invalid context Id <" + contextId + ">.  It must be one of " + validContextIds.join(","));
            });
        }
    };

    Mail.Commands.Item._validateToggleOptions = function (options) {
        /// <param name="options" type="Mail.Commands.ItemOptions" />
        Debug.assert(Jx.isObject(options.toggleContext), "toggle commands must have a toggle context");
        Debug.assert(Jx.isFunction(options.isToggledOn), "toggle commands must implement isToggledOn");
        Debug.assert(Jx.isBoolean(options.toggleBackground));
        Debug.assert(Jx.isNonEmptyString(options.icon) || (Jx.isNonEmptyString(options.icon.off) && Jx.isNonEmptyString(options.icon.on)));
        Debug.assert(Jx.isNonEmptyString(options.labelLocId) || (Jx.isNonEmptyString(options.labelLocId.off) && Jx.isNonEmptyString(options.labelLocId.on)));
    };
    

    Mail.Commands.Item.prototype.getOption = function () {
        /// <summary>Returns an object literal to be used as the option parameter for the AppBarCommand constructor</summary>
        Debug.assert(Jx.isNullOrUndefined(document.getElementById(this.id)), this.id + " already defined");
        var label = this.label,
            option = {
                id: this.id,
                type: this.type,
                icon: this.icon,
                useCustomFont: this.useCustomFont,
                tooltip: this.tooltip
        };           

        if (Jx.isString(label)) {
            option.label = label;
        }
        return option;
    };

    Mail.Commands.Item.prototype.invalidateContextualFields = function () {
        this._cachedLabel = null;
        this._cachedTooltip = null;
    };

    Object.defineProperty(Mail.Commands.Item.prototype, "tooltip", { get: function () {
        if (!Jx.isNonEmptyString(this._cachedTooltip)) {
            if (this._shortcutLabelId) {
                var shortcutLabel = this._shortcutLabel;
                this._cachedTooltip = Jx.res.loadCompoundString(this._shortcutLabelId, shortcutLabel ? Jx.key.getLabel(shortcutLabel) : "");
            }
        }
        return this._cachedTooltip;
        }, enumerable: true
    });

    Object.defineProperty(Mail.Commands.Item.prototype, "_shortcutLabel", { get: function () { return this._options.shortcutLabel; }, enumerable: true });
    Object.defineProperty(Mail.Commands.Item.prototype, "_shortcutLabelId", { get: function () { return this._options.shortcutLabelId; }, enumerable: true });
    Object.defineProperty(Mail.Commands.Item.prototype, "_labelLocId", { get: function () { return this._options.labelLocId; }, enumerable: true });

    Object.defineProperty(Mail.Commands.Item.prototype, "id", { get: function () { return this._options.id; }, enumerable: true });

    Object.defineProperty(Mail.Commands.Item.prototype, "shortcuts", { get: function () {
        /// <returns type="Array"></returns>
        return this._options.shortcuts;
    }, enumerable: true });

    Object.defineProperty(Mail.Commands.Item.prototype, "label", { get: function () {
        Debug.assert(this._options.type !== "shortcut");
        if (this._options.type === "separator") {
            return null;
        }
        if (Jx.isNullOrUndefined(this._cachedLabel)) {
            this._cachedLabel = Jx.res.getString(this._labelLocId);
        }
        Debug.assert(Jx.isNonEmptyString(this._cachedLabel));
        return this._cachedLabel;
    }, enumerable: true });

    Object.defineProperty(Mail.Commands.Item.prototype, "showAsSelected", { get: function () { return false; }, enumerable: true });

    Object.defineProperty(Mail.Commands.Item.prototype, "icon", { get: function () { Debug.assert(this._options.type !== "shortcut"); return this._options.icon; }, enumerable: true });
    Object.defineProperty(Mail.Commands.Item.prototype, "useCustomFont", { get: function () { Debug.assert(this._options.type !== "shortcut"); return this._options.useCustomFont || false; }, enumerable: true });
    Object.defineProperty(Mail.Commands.Item.prototype, "type", { get: function () { return this._options.type;}, enumerable: true });
    Object.defineProperty(Mail.Commands.Item.prototype, "onInvoke", { get: function () {
        return function (selection, uiEntryPoint, event) {
            // The command infrastructure processes context updates asyncrhonously.  It is possible that a button is still onscreen
            // while it is disabled, we should only invoke the handler when the command is enabled
            if (this.isEnabled(selection)) {
                this._options.handler.call(null, selection, uiEntryPoint, event);
            }
        }.bind(this);
    }, enumerable: true});
    Object.defineProperty(Mail.Commands.Item.prototype, "enableContexts", { get: function () { return this._options.enableContext;}, enumerable: true });
    Object.defineProperty(Mail.Commands.Item.prototype, "dismissAfterInvoke", { get: function () { return this._options.dismissAfterInvoke; }, enumerable: true });
    Object.defineProperty(Mail.Commands.Item.prototype, "noAnimationOnDismiss", { get: function () { return this._options.noAnimationOnDismiss; }, enumerable: true });

    Mail.Commands.ToggleItem = /* @constructor*/ function (options) {
        /// <param name="options" type="Mail.Commands.ItemOptions" />
        Debug.assert(Jx.isObject(options));
        Debug.assert(options.type === "toggle");

        
        Mail.Commands.Item._validateToggleOptions(options);
        /// JSCop is unaware that this._options is set in the base constructor
        if (Mail.Commands.ToggleItem !== Mail.Commands.ToggleItem) {
            this._options = options;
        }
        
        this._cachedToggleState = null;
        Mail.Commands.Item.call(this, options);
    };
    Jx.inherit(Mail.Commands.ToggleItem, Mail.Commands.Item);

    Mail.Commands.ToggleItem.prototype.invalidateContextualFields = function () {
        Mail.Commands.Item.prototype.invalidateContextualFields.call(this);
        this._cachedToggleState = null;
    };

    Object.defineProperty(Mail.Commands.ToggleItem.prototype, "_toggleState", { get: function () {
        Debug.assert(this.type === "toggle");
        if (!Jx.isBoolean(this._cachedToggleState)) {
            this._cachedToggleState = this._options.isToggledOn();
        }
        return this._cachedToggleState;
    }, enumerable: true });

    Object.defineProperty(Mail.Commands.ToggleItem.prototype, "showAsSelected", { get: function () {
        Debug.assert(this.type === "toggle");
        return this._options.toggleBackground ? this._toggleState : false;
    }, enumerable: true });

    Mail.Commands.ToggleItem.prototype._getProperty = function (propertyContainer) {
        var option = this._options[propertyContainer];
        if (!Jx.isNullOrUndefined(option)) {
            if (Jx.isString(option) || Jx.isBoolean(option) || Jx.isNumber(option) || Jx.isFunction(option)) {
                // if the option is a primitive type, just return it
                return option;
            } else if (Jx.isObject(option)) {
                return this._toggleState ? option.on : option.off;
            }
        }
        return null;
    };

    Object.defineProperty(Mail.Commands.ToggleItem.prototype, "toggleContexts", { get: function () { return this._options.toggleContext;}, enumerable: true });
    Object.defineProperty(Mail.Commands.ToggleItem.prototype, "icon", { get: function () { return this._getProperty("icon"); }, enumerable: true });
    Object.defineProperty(Mail.Commands.ToggleItem.prototype, "_shortcutLabel", { get: function () { return this._getProperty("shortcutLabel"); }, enumerable: true });
    Object.defineProperty(Mail.Commands.ToggleItem.prototype, "_shortcutLabelId", { get: function () { return this._getProperty("shortcutLabelId"); }, enumerable: true });
    Object.defineProperty(Mail.Commands.ToggleItem.prototype, "_labelLocId", { get: function () { return this._getProperty("labelLocId"); }, enumerable: true });
    Object.defineProperty(Mail.Commands.ToggleItem.prototype, "dismissAfterInvoke", { get: function () { return this._getProperty("dismissAfterInvoke"); }, enumerable: true });
    Object.defineProperty(Mail.Commands.ToggleItem.prototype, "noAnimationOnDismiss", { get: function () { return this._getProperty("noAnimationOnDismiss"); }, enumerable: true });
    Object.defineProperty(Mail.Commands.ToggleItem.prototype, "onInvoke", {
        get: function () {
            return /*@bind(Mail.Commands.Item)*/ function (selection, uiEntryPoint, ev) {
                // The command infrastructure processes context updates asynchronously.  It is possible that a button is still onscreen
                // while it is disabled, we should only invoke the handler when the command is enabled
                if (this.isEnabled(selection)) {
                    this._getProperty("handler").call(null, selection, uiEntryPoint, ev);
                }
                if (ev && ev.target && ev.target.winControl) {
                    ev.target.winControl.selected = this.showAsSelected;
                }
            }.bind(this);
        }, enumerable: true
    });


    Mail.Commands.MenuItem = /* @constructor*/function (cmdItem, options) {
        /// <summary>Constructor for a menu command</summary>
        /// <param name="cmdItem" type="Mail.Commands.Item">Command to base this menu item from.</param>
        /// <param name="options" type="Mail.Commands.ItemOptions" />
        Debug.assert(Jx.isObject(cmdItem));
        Debug.assert(Jx.isObject(options));

        var fullOptions = {};
        Object.keys(cmdItem._options).forEach(function (key) { fullOptions[key] = cmdItem._options[key]; });
        Object.keys(options).forEach(function (key) { fullOptions[key] = options[key]; });
        fullOptions.shortcuts = [];

        Mail.Commands.Item.call(this, fullOptions);
    };
    Jx.inherit(Mail.Commands.MenuItem, Mail.Commands.Item);

    Mail.Commands.ToggleMenuItem = /* @constructor*/function (cmdItem, options) {
        /// <summary>Constructor for a toggle menu command</summary>
        /// <param name="cmdItem" type="Mail.Commands.Item">Command to base this menu item from.</param>
        /// <param name="options" type="Mail.Commands.ItemOptions" />
        Debug.assert(Jx.isObject(cmdItem));
        Debug.assert(Jx.isObject(options));

        var fullOptions = {};
        Object.keys(cmdItem._options).forEach(function (key) { fullOptions[key] = cmdItem._options[key]; });
        Object.keys(options).forEach(function (key) { fullOptions[key] = options[key]; });
        fullOptions.shortcuts = [];

        Mail.Commands.ToggleItem.call(this, fullOptions);
    };
    Jx.inherit(Mail.Commands.ToggleMenuItem, Mail.Commands.ToggleItem);
});
