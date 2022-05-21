
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true*/
/*global Mail,Jx,Debug,WinJS*/

Jx.delayDefine(Mail, "ComboBox", function () {
    "use strict";

    Mail.ComboBox = function (host, menuItems, initialValue, /* optional */ ariaLabels, /* optional */ textFormat) {
        Debug.assert(Jx.isHTMLElement(host));
        Debug.assert(Jx.isArray(menuItems));
        Debug.assert(Jx.isValidNumber(initialValue));
        Debug.assert(Jx.isNullOrUndefined(ariaLabels) || Jx.isFunction(ariaLabels.getDropdownAriaLabel) || Jx.isFunction(ariaLabels.getHostAriaLabel));
        Debug.assert(textFormat === undefined || Jx.isNonEmptyString(textFormat));

        this._menuItems = menuItems;
        Debug.only(menuItems.forEach(function (menuItem, index) { Debug.assert(menuItem.value === index); }));

        this._ariaLabels = ariaLabels;
        this._textFormat = textFormat;

        this._host = host;
        this._text = this._host.querySelector(".comboboxText");
        Debug.assert(Jx.isHTMLElement(this._text));

        // click is used instead of MSPointerUp or else touch narrator won't recognize the item is clickable
        this._disposer = new Mail.Disposer(
            new Mail.EventHook(host, "click", this._invoke, this),
            new Mail.EventHook(host, "keypress", this._onKeyPress, this),
            new Mail.Disposable(Jx.observeAttribute(host, "aria-expanded", function () {
                if (this._host.getAttribute("aria-expanded") === "true") {
                    this._invoke();
                }
            }, this), "disconnect")
        );

        this._dropDown = null;
        this._dropdownElement = null;

        // Hide the arrow if there is only one menu item
        var arrowElement = this._host.querySelector(".comboboxArrow");
        Debug.assert(Jx.isHTMLElement(arrowElement));
        var addRemoveClass = (this._menuItems.length > 1) ? arrowElement.classList.remove : arrowElement.classList.add;
        addRemoveClass.call(arrowElement.classList, "hidden");

        this._currentValue = null;
        this.updateValue(initialValue, false /* fireEvent */);
        Debug.assert(this._currentValue === initialValue);
    };

    Jx.augment(Mail.ComboBox, Jx.Events);

    var MCProto = Mail.ComboBox.prototype;
    Debug.Events.define(MCProto, "changed");

    MCProto.dispose = function () {
        this._menuItems = null;
        this._ariaLabels = null;
        this._textFormat = null;
        this._host = null;
        this._text = null;

        this._disposer.dispose();
        this._disposer = null;

        this._dropDown = null;
        if (this._dropdownElement) {
            Mail.safeRemoveNode(this._dropdownElement, true /* deep */);
            this._dropdownElement = null;
        }

        this._currentValue = null;
    };

    MCProto.show = function () {
        this._host.classList.remove("hidden");
    };

    MCProto.hide = function () {
        this._host.classList.add("hidden");

        if (this._dropDown) { // Hide the dropdown
            this._dropDown.hide();
        }
    };

    MCProto.hasFocus = function () {
        var activeElement = document.activeElement,
            dropdownElement = this._dropdownElement;
        return (activeElement === this._host) || (dropdownElement && Mail.isElementOrDescendant(activeElement, dropdownElement));
    };

    MCProto._getItemTextForDropdown = function (menuItem) {
        var textId = menuItem.textId;
        return textId ? Jx.res.getString(textId) : menuItem.text;
    };

    MCProto._getItemTextForComboLabel = function (menuItem) {
        Debug.assert(menuItem.label || menuItem.text || menuItem.textId);
        return menuItem.label || menuItem.text || Jx.res.getString(menuItem.textId);
    };

    MCProto._makeMenuCommand = function (menuItem) {
        return {
            label: this._getItemTextForDropdown(menuItem),
            onclick: this.updateNewValue.bind(this, menuItem.value, true /* fireEvent */),
            id: menuItem.id
        };
    };

    MCProto._makeMenuCommands = function () {
        return this._menuItems.map(function (menuItem) {
            return this._makeMenuCommand(menuItem);
        }, this);
    };

    MCProto._ensureDropdown = function () {
        Mail.writeProfilerMark("ComboBox._ensureDropdown", Mail.LogEvent.start);

        if (!this._dropdownElement) {
            this._dropdownElement = document.createElement("div");
            this._dropdownElement.className = "dropdownContainer";
            document.getElementById(Mail.CompApp.rootElementId).appendChild(this._dropdownElement);
        }
        Debug.assert(Jx.isHTMLElement(this._dropdownElement));

        if (!this._dropDown) {
            var dropDown = this._dropDown = new WinJS.UI.Menu(this._dropdownElement, {
                commands: this._makeMenuCommands(),
                sticky: true
            }),
            host = this._host;

            this._disposer.addMany(
                dropDown,
                new Mail.EventHook(dropDown, "aftershow", Mail.setAttribute.bind(null, host, "aria-expanded", "true"), this),
                new Mail.EventHook(dropDown, "afterhide", Mail.setAttribute.bind(null, host, "aria-expanded", "false"), this)
            );

            var ariaLabels = this._ariaLabels;
            if (ariaLabels && ariaLabels.getDropdownAriaLabel) {
                Mail.setAttribute(this._dropdownElement, "aria-label", ariaLabels.getDropdownAriaLabel());
            }
        }
        Debug.assert(Jx.isInstanceOf(this._dropDown, WinJS.UI.Menu));

        Mail.writeProfilerMark("ComboBox._ensureDropdown", Mail.LogEvent.stop);
    };

    MCProto._invoke = function () {
        if (this._menuItems.length > 1) { // Only show dropdown if we have more than one menu item
            this._ensureDropdown();
            this._dropDown.show(this._host, "bottom", Jx.isRtl() ? "right" : "left");
        }
    };

    MCProto.updateItem = function (index, newItem) {
        Debug.assert(Jx.isValidNumber(index));
        Debug.assert(Jx.isObject(newItem));
        Debug.assert(newItem.value === index);
        Debug.assert(Jx.isObject(this._menuItems[index]));

        this._menuItems[index] = newItem;
        this._updateUI();

        var dropDown = this._dropDown;
        if (dropDown) {
            dropDown.hide();
            dropDown.commands = this._makeMenuCommands();
        }
    };

    MCProto.updateValue = function (newValue, fireEvent) {
        Debug.assert(Jx.isValidNumber(newValue));
        Debug.assert(Jx.isBoolean(fireEvent));

        Mail.writeProfilerMark("ComboBox.updateValue", Mail.LogEvent.start);

        this._currentValue = newValue;
        this._updateUI();

        if (fireEvent) {
            this.raiseEvent("changed");
        }

        Mail.writeProfilerMark("ComboBox.updateValue", Mail.LogEvent.stop);
    };

    MCProto.updateNewValue = function (newValue, fireEvent) {
        Mail.writeProfilerMark("ComboBox.updateNewValue", Mail.LogEvent.start);

        if (this._currentValue !== newValue) {
            this.updateValue(newValue, fireEvent);
        }

        Mail.writeProfilerMark("ComboBox.updateNewValue", Mail.LogEvent.stop);
    };

    MCProto._updateUI = function () {
        var menuItem = this._menuItems[this._currentValue],
            selectItemText = this._getItemTextForComboLabel(menuItem),
            displayText = null;

        if (this._textFormat) {
            displayText = Jx.res.loadCompoundString(this._textFormat, selectItemText);
        } else {
            displayText = selectItemText;
        }

        this._text.innerText = displayText;
        this._host.title = Jx.isString(menuItem.tooltipId) ? Jx.res.getString(menuItem.tooltipId) : "";

        var ariaLabels = this._ariaLabels;
        if (ariaLabels && ariaLabels.getHostAriaLabel) {
            Mail.setAttribute(this._host, "aria-label", ariaLabels.getHostAriaLabel(this._currentValue));
        } else {
            Mail.setAttribute(this._host, "aria-label", displayText);
        }
    };

    MCProto._onKeyPress = function (ev) {
        var keyCode = ev.keyCode,
            KeyCode = Jx.KeyCode;
        if ((keyCode === KeyCode.enter) || (keyCode === KeyCode.space)) {
            this._invoke();
        }
    };

    Object.defineProperty(MCProto, "value", { get: function () {
        Debug.assert(Jx.isValidNumber(this._currentValue));
        return this._currentValue;
    }, enumerable: true });

});
