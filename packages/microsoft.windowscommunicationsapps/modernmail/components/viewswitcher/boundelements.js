
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,People*/

Jx.delayDefine(Mail, "BoundElements", function () {
    "use strict";

    var MailView = Mail.UIDataModel.MailView;

    var Elements = Mail.BoundElements = {};

    function ScheduledBinding(view, properties) {
        Debug.assert(Jx.isInstanceOf(view, MailView));
        Debug.assert(Jx.isArray(properties) && properties.every(function (prop) { return Jx.isNonEmptyString(prop); }));

        this.initComponent();

        this._view = view;
        this._properties = properties;
        this._originals = properties.map(function (property) { return view[property]; });
        this._element = null;
        this._hook = null;
        this._job = null;
        this._active = false;
    }
    Jx.augment(ScheduledBinding, Jx.Component);
    ScheduledBinding.prototype.activateUI = function () {
        this._active = true;
        this._job = Jx.scheduler.addJob(null, Mail.Priority.updateView, null, this._subscribe, this);
    };
    ScheduledBinding.prototype.deactivateUI = function () {
        Jx.dispose(this._hook);
        Jx.dispose(this._job);
        this._element = null;
        this._active = false;
    };
    ScheduledBinding.prototype.getElement = function () {
        var element = this._element;
        if (!element) {
            element = this._element = document.getElementById(this._id);
        }
        return element;
    };
    ScheduledBinding.prototype._subscribe = function () {
        this._job = null;
        this._hook = new Mail.EventHook(this._view, "changed", this._onChange, this);

        // Update our display if a property changed between getUI and hooking events
        if (this._properties.some(function (prop, index) { return this._originals[index] !== this._view[prop]; }, this)) {
            this._updateDisplay();
        }
    };
    ScheduledBinding.prototype._onChange = function (ev) {
        if (!this._job) {
            if (Mail.Validators.havePropertiesChanged(ev, this._properties)) {
                this._job = Jx.scheduler.addJob(null, Mail.Priority.updateView, null, function () {
                    this._job = null;
                    this._updateDisplay();
                }, this);
            }
        }
    };
    ScheduledBinding.prototype._updateDisplay = function () {
        if (this._active) {
            this.getParent().updateLabel();
        }
    };

    var ViewName = Elements.ViewName = function (view) {
        ScheduledBinding.call(this, view, [ "name" ]);
    };
    Jx.inherit(ViewName, ScheduledBinding);
    ViewName.prototype.getUI = function (ui) {
        ui.html = "<div id='" + this._id + "' class='name'>" +
                      Jx.escapeHtml(this._view.name) +
                  "</div>";
    };
    ViewName.prototype._updateDisplay = function () {
        ScheduledBinding.prototype._updateDisplay.call(this);
        this.getElement().innerText = this._view.name;
    };

    var ViewCount = Elements.ViewCount = function (view) {
        ScheduledBinding.call(this, view, [ "notificationCount" ]);
        this._text = "";
        this._overflow = "";
        this._hidden = false;
    };
    Jx.inherit(ViewCount, ScheduledBinding);
    ViewCount.prototype.getUI = function (ui) {
        this._updateState();
        ui.html = "<div" +
                      " id='" + this._id + "'" +
                      " class='count " + (this._hidden ? "hidden" : "") + "'" +
                  ">" +
                      "<span>" + Jx.escapeHtml(this._text) + "</span>" +
                      "<span class='plus'>" + Jx.escapeHtml(this._overflow) + "</span>" +
                  "</div>";
    };
    ViewCount.prototype._updateDisplay = function () {
        ScheduledBinding.prototype._updateDisplay.call(this);

        var oldText = this._text,
            oldOverflow = this._overflow,
            oldHidden = this._hidden,
            element = this.getElement();

        this._updateState();

        var newHidden = this._hidden;
        if (oldHidden !== newHidden) {
            Jx.setClass(element, "hidden", newHidden);
        }

        var newText = this._text;
        if (oldText !== newText) {
            element.firstChild.innerText = newText;
        }

        var newOverflow = this._overflow;
        if (oldOverflow !== newOverflow) {
            element.lastChild.innerText = newOverflow;
        }
    };
    var maxValue = 999;
    ViewCount.prototype._updateState = function () {
        var count = this._view.notificationCount;
        if (count > 0) {
            this._hidden = false;
            this._overflow = (count > maxValue) ? "\u207a" : "";
            this._text = Math.min(count, maxValue).toString();
        } else {
            this._hidden = true;
            this._overflow = this._text = "";
        }
    };

    var ViewPinner = Elements.ViewPinner = function (view, pinLabelStringId, unpinLabelStringId) {
        // Render the filled/empty star depending on the pinned state of a view and
        // toggles the pinned state on clicks.
        Debug.assert(Jx.isNonEmptyString(pinLabelStringId));
        Debug.assert(Jx.isNonEmptyString(unpinLabelStringId));

        ScheduledBinding.call(this, view, [ "isPinnedToNavPane", "name" ]);
        this._lastRenderedState = false;
        this._pinLabelStringId = pinLabelStringId;
        this._unpinLabelStringId = unpinLabelStringId;
    };
    Jx.inherit(ViewPinner, ScheduledBinding);

    function getPinnedIcon(pinned) {
        return pinned ? "\ue1cf" : "\ue1ce";
    }

    ViewPinner.prototype.getUI = function (ui) {
        var view = this._view;
        if (view.canChangePinState) {
            var pinned = this._lastRenderedState = view.isPinnedToNavPane;
            ui.html = "<div" +
                            " id='" + this._id + "'" +
                            " class='star" + (pinned ? " pinned" : "") + "'" +
                            " tabIndex='-1'" +
                            " aria-label='" + Jx.escapeHtml(this._getLabel()) + "'" +
                            " aria-checked='" + pinned.toString() + "'" +
                            " title='" + Jx.escapeHtml(this._getTitle()) + "'" +
                            " role='checkbox'" +
                      ">" +
                          Jx.escapeHtml(getPinnedIcon(pinned)) +
                      "</div>";
        }
    };
    ViewPinner.prototype._updateDisplay = function () {
        var element = this.getElement();
        if (element) {
            var pinned = this._lastRenderedState = this._view.isPinnedToNavPane;
            element.innerText = getPinnedIcon(pinned);
            Mail.setAttribute(element, "aria-label", this._getLabel());
            Mail.setAttribute(element, "title", this._getTitle());
            Jx.setClass(element, "pinned", pinned);
            Mail.setAttribute(element, "aria-checked", pinned.toString());
        }
        ScheduledBinding.prototype._updateDisplay.call(this);
    };

    ViewPinner.prototype._getLabel = function () {
        var view  = this._view,
            stringId = view.isPinnedToNavPane ? this._unpinLabelStringId : this._pinLabelStringId;
        return Jx.res.loadCompoundString(stringId, view.name);
    };
    ViewPinner.prototype._getTitle = function () {
        return getString(this._view.isPinnedToNavPane ? "mailUnpinViewTitle" : "mailPinViewTitle");
    };
    ViewPinner.prototype.onClick = function (ev) {
        // When receiving a click event our host needs to call this method so
        // we can toggle the pin state if our element was the target of the click.
        var element = this.getElement();
        if (ev.target === element) {
            this._pin(!this._view.isPinnedToNavPane);
            ev.stopPropagation();
            ev.preventDefault();
            return true;
        }
        return false;
    };
    ViewPinner.prototype.onAttributeChange = function (mutation) {
        // When receiving a mutation event on aria-checked, our host needs to call this method so
        // we can toggle the pin state if our element was manipulated via accessibility.
        var element = this.getElement();
        if (mutation.target === element) {
            var desiredState = (element.getAttribute("aria-checked") === "true");
            if (desiredState !== this._lastRenderedState) {
                this._pin(desiredState);
            }
        }
    };
    ViewPinner.prototype._pin = function (pin) {
        Debug.assert(Jx.isBoolean(pin));
        _markStart("ViewPinner._pin:pin=" + pin);

        var view = this._view;
        view.pinToNavPane(pin);
        this._updateDisplay();

        if (pin) {
            // If we are pinning this folder, ensure it is as up to date as possible.
            var sourceObject = view.sourceObject;
            if (sourceObject && sourceObject.objectType === "Folder") {
                sourceObject.startSyncFolderContents(false /* fForceSynchronization */);
            }
        }

        _markStop("ViewPinner._pin:pin=" + pin);
    };

    var ViewTile = Elements.ViewTile = function (view) {
        // Displays a usertile for people views
        ScheduledBinding.call(this, view, [ "sourceObject" ]);
        this._identityControl = new People.IdentityControl(view.sourceObject, null, { interactive: false });
    };
    Jx.inherit(ViewTile, ScheduledBinding);
    ViewTile.prototype.getUI = function (ui) {
        ui.html = this._identityControl.getUI(People.IdentityElements.Tile, { className: "tile", size: 40, statusIndicator: null });
    };
    ViewTile.prototype.activateUI = function () {
        ScheduledBinding.prototype.activateUI.call(this);
        this._identityControl.activateUI();
    };
    ViewTile.prototype._updateDisplay = function () {
        this._identityControl.updateDataSource(this._view.sourceObject);
    };
    ViewTile.prototype.deactivateUI = function () {
        ScheduledBinding.prototype.deactivateUI.call(this);
        this._identityControl.shutdownUI();
    };

    // Cache static resource strings that are used across BoundElements since
    // we can create many instances of these classes
    var stringCache = {};
    function getString (id) {
        var str = stringCache[id];
        if (!str) {
            str = stringCache[id] = Jx.res.getString(id);
        }
        return str;
    }

    function _markStart(str) {
        Jx.mark("Mail.ViewFlyout." + str + ",StartTA,Mail");
    }
    function _markStop(str) {
        Jx.mark("Mail.ViewFlyout." + str + ",StopTA,Mail");
    }

});
