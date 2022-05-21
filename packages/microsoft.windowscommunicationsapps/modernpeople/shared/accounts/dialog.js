
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../JSUtil/Include.js"/>
/// <reference path="Dialog.js"/>
/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People, ["AlertDialog", "Dialog", "DialogEvents", "DialogButton", "FormDialog"], function () {

    var P = window.People;

    var DialogEvents = P.DialogEvents = {
        opened: "People.DialogEvents.opened",
        closed: "People.DialogEvents.closed"
    };
    Object.freeze(DialogEvents);

    var Dialog = P.Dialog = function (title, content, options) {
        ///<summary>Basic dialog control that is overlayed across the entirety of the screen. Supports a title,
        ///buttons, and arbitrary inner content.</summary>
        ///<param name="title" type="String">Title string</param>
        ///<param name="content" type="Jx.Component">The UI to show as an overlay</param>
        ///<param name="options" type="Object" optional="true"> Configurable options. Defaults as shown.
        ///     headerColor: "", // CSS color value for colorizing the header
        ///     headerIcon: "", // Image URL to be displayed in the header
        ///     titleColor: "", // CSS color value for dialog's title text
        ///     useAppTheme: false, // If true, uses pre-defined app color and icon to style the header.
        ///     fullscreen: false, // If true, shows a fullscreen dialog, like a barricade page.
        /// } </param>
        this.buttons = [];

        this._title = title;
        this._content = content;
        this._options = options || { headColor: "", headerIcon: "", titleColor: "", useAppTheme: false, fullscreen: false, form: false };
        this._overlay = new P.Overlay(this);
        this._escapeHandler = null;
        this._role = "dialog";

        $include("$(cssResources)/" + Jx.getAppNameFromId(Jx.appId) + "Dialog.css");
    };
    Jx.inherit(Dialog, Jx.Events);
    Debug.Events.define(Dialog.prototype, "opened", "closed");
    Jx.augment(Dialog, Jx.Component);

    Dialog.prototype.show = function (escapable, forceShow) {
        ///<summary>Open the dialog</summary>
        ///<param name="escapable" type="Boolean" optional="true">Does escape close the dialog</param>
        ///<param name="forceShow" type="Boolean" optional="true">If true will force any current dialogs to dismiss so this one can be displayed.</param>
        this.append.apply(this, this.buttons);
        this.appendChild(this._content);
        this.initComponent();

        if (this._overlay.show(forceShow)) {
            if (escapable) {
                this._escapeHandler = function (ev) {
                    if (ev.key === "Esc") {
                        this.close();
                    }
                };
                this._overlay.addListener("keyup", this._escapeHandler, this);
            }
            Jx.EventManager.broadcast(DialogEvents.opened);
            this.raiseEvent("opened");
            return true;
        }

        return false;
    };

    Dialog.prototype.close = function () {
        ///<summary>Close the dialog</summary>
        if (!this._closed) {
            this._closed = true;

            if (this._escapeHandler) {
                this._overlay.removeListener("keyup", this._escapeHandler, this);
                this._escapeHandler = null;
            }
            this._overlay.close();
            Jx.EventManager.broadcast(DialogEvents.closed);
            this.raiseEvent("closed");
        }
    };

    Dialog.prototype.isShowing = function () {
        return this._overlay.isShowing();
    };

    Dialog.prototype.canShow = function () {
        return this._overlay.canShow();
    };

    Dialog.prototype.closeActive = function () {
        return this._overlay.closeActive();
    };

    Dialog.prototype.reserveNextShowing = function () {
        return this._overlay.reserveNextShowing();
    };

    Dialog.prototype.cancelReservation = function () {
        return this._overlay.cancelReservation();
    };

    Dialog.prototype.updateTitle = function (titleText) {
        Debug.assert(this.hasUI());
        this._title = titleText;

        var dlgElement = document.getElementById("dlg-box");
        Debug.assert(Jx.isHTMLElement(dlgElement));
        if (Jx.isHTMLElement(dlgElement)) {
            dlgElement.setAttribute("aria-label", titleText);
        }

        var dlgTitleElement = dlgElement.querySelector("#dlg-title");
        Debug.assert(Jx.isHTMLElement(dlgTitleElement));
        if (Jx.isHTMLElement(dlgTitleElement)) {
            dlgTitleElement.innerText = titleText;
        }
    };

    Dialog.prototype.getUI = function (ui) {
        ///<summary>The outer flexbox for hosting the dialog content</summary>
        ///<param name="ui" type="Object">Contains html and css strings</param>
        ui.html =
        "<div id='dlg-box' class='" + (this._options.fullscreen ? "fullscreen" : "") + "' role='" + this._role + "' aria-describedby='dlgDescription' aria-label='" + Jx.escapeHtml(this._title) + "'>" +
            "<div class='dlg-band'></div>" +
            (this._options.form ? "<form id='dlg-form' class='dlg-content' novalidate>" : "<div id='dlg-contentPanel' class='dlg-content'>") +
                "<div id='dlg-header' class='row1'>" +
                    "<div id='dlg-title' class='singleLineText' role='heading'>" + Jx.escapeHtml(this._title) + "</div>" +
                    "<div id='dlg-headerIcon'></div>" +
                "</div>" +
                "<div id='dlg-body' class='row2'>" +
                    "<div class='dlg-inner-content'>" +
                        Jx.getUI(this._content).html +
                    "</div>" +
                "</div>" +
                "<div id='dlg-footer' class='row3'>" +
                    "<div class='dlg-inner-content'>" +
                        this.buttons.reduce(function (html, button) {
                            return html + Jx.getUI(button).html;
                        }, "") +
                    "</div>" +
                "</div>" +
            (this._options.form ? "</form>" : "</div>") +
            "<div class='dlg-band'></div>" +
        "</div>";
    };

    Dialog.prototype.activateUI = function () {
        var header = document.getElementById("dlg-header");
        var icon = document.getElementById("dlg-headerIcon");
        var options = this._options;

        Debug.assert(document.querySelector(".dlg-inner-content #dlgDescription"), "No description element was provided by the dialog content element");

        if (options.useAppTheme) {
            Jx.addClass(header, "appThemedHeader");
        } else {
            if (Jx.isNonEmptyString(options.headerColor)) {
                // Turn on the customized header
                Jx.addClass(header, "customizedHeader");
                header.style.backgroundColor = options.headerColor;
            }

            if (Jx.isNonEmptyString(options.titleColor)) {
                header.style.color = options.titleColor;
            }

            if (Jx.isNonEmptyString(options.headerIcon)) {
                icon.style.backgroundImage = "url(" + options.headerIcon + ")";
                Jx.addClass(header, "customizedHeader");
            } else {
                Jx.addClass(icon, "hidden");
            }
        }

        Jx.Component.prototype.activateUI.call(this);
    };

    Dialog.prototype.shutdownUI = function () {
        this._content.shutdownUI();
        Jx.Component.prototype.shutdownUI.call(this);
    };

    //
    // AlertDialog
    //
    var AlertDialog = P.AlertDialog = function (title, content, options) {
        ///<summary>Basic alert dialog control. Derived directly from Dialog.</summary>
        P.Dialog.call(this, title, content, options);
        this._role = "alertdialog";
    };
    Jx.inherit(AlertDialog, Dialog);


    //
    // FormDialog
    //
    var FormDialog = P.FormDialog = function (title, content, options) {
        ///<summary>Basic form dialog control. Derived directly from Dialog.</summary>
        options.form = true;
        this._submitHandler = null;

        P.Dialog.call(this, title, content, options);
    };
    Jx.inherit(FormDialog, Dialog);
    Debug.Events.define(FormDialog.prototype, "submit");

    FormDialog.prototype.activateUI = function () {
        var form = document.getElementById("dlg-form");
        Debug.assert(Jx.isHTMLElement(form));

        if (form) {
            form.addEventListener("submit", function (ev) {
                this.raiseEvent("submit");
                ev.preventDefault(); // prevent the 'submit' from refreshing the page (i.e. reload the app)
            }.bind (this), false);
        }
        
        Dialog.prototype.activateUI.call(this);
    };

    //
    // DialogButton
    //
    var DialogButton = P.DialogButton = function (id, label, type) {
        ///<summary>Basic button abstraction for use in the Dialog control. Supports a label and click callback</summary>
        ///<param name="id" type="String">Unique id of the button element in the DOM</param>
        ///<param name="label" type="String">The button label</param>
        ///<param name="type" type="String" optional="true">Either 'button' or 'submit'</param>
        this._idButton = id;
        this._label = label;
        this._type = type || "button";
        this._autofocus = false;
        this.initComponent();
    };
    Jx.inherit(DialogButton, Jx.Events);
    Debug.Events.define(DialogButton.prototype, "click");
    Debug.Events.define(DialogButton.prototype, "keyup");
    Debug.Events.define(DialogButton.prototype, "keydown");
    Jx.augment(DialogButton, Jx.Component);

    DialogButton.prototype.getUI = function (ui) {
        ///<summary>Creates the button UI</summary>
        ///<param name="ui" type="Object">Contains html and css strings</param>
        ui.html = "<input class='dlg-button singleLineText' id='" + this._idButton + "' value='" + Jx.escapeHtml(this._label) + "'/>";
    };

    DialogButton.prototype.activateUI = function () {
        ///<summary>Localizes the button label once the UI is loaded</summary>
        var button = this._button = document.getElementById(this._idButton);
        button.type = this._type;
        button.addEventListener("click", function (ev) {
            this.raiseEvent("click");
            if (button.type === "submit") {
                ev.preventDefault();
            }
        }.bind(this), false);
        button.addEventListener("keydown", this.raiseEvent.bind(this, "keydown"), false);
        button.addEventListener("keyup", this.raiseEvent.bind(this, "keyup"), false);

        if (this._autofocus) {
            Debug.assert(!button.disabled, "autofocus is set on a button defaulted to disabled.");
            Jx.safeSetActive(button);
        }

        Jx.Component.prototype.activateUI.call(this);
    };

    DialogButton.prototype.hide = function (hide) {
        Debug.assert(Jx.isHTMLElement(this._button));
        Jx.setClass(this._button, "hidden", hide);
    };

    DialogButton.prototype.focus = function () {
        Debug.assert(Jx.isHTMLElement(this._button));
        Jx.safeSetActive(this._button);
    };

    Object.defineProperty(DialogButton.prototype, "disabled", {
        get: function () { return this._button.disabled; },
        set: function (value) { this._button.disabled = value; }
    });

    Object.defineProperty(DialogButton.prototype, "autofocus", {
        get: function () { return this._autofocus; },
        set: function (value) { this._autofocus = value; }
    });

    Object.defineProperty(DialogButton.prototype, "type", {
        get: function () { return this._type; },
        set: function (value) { this._type = value; this._button.type = value; }
    });

    Object.defineProperty(DialogButton.prototype, "value", {
        get: function () { return this._label; },
        set: function (value) { this._label = value; this._button.value = value; }
    });

    P.CloseButton = function (id, label, dialog) {
        ///<summary>Close button for use in the Dialog control</summary>
        ///<param name="id" type="String">Unique id of the button element in the DOM</param>
        ///<param name="label" type="String">The button label</param>
        ///<param name="dialog" type="String">The owning dialog</param>
        DialogButton.call(this, id, label);
        this.addListener("click", dialog.close, dialog);
        this.addListener("keydown", function (ev) {
            if (ev.key === "Spacebar" || ev.key === "Enter") {
                // Prevent IE from converting this to a click event.
                ev.preventDefault();
            }
        });
        this.addListener("keyup", function (ev) {
            if (ev.key === "Spacebar" || ev.key === "Enter") {
                ev.stopPropagation();
                dialog.close();
            }
        }, dialog);
    };
    Jx.inherit(P.CloseButton, DialogButton);

});
