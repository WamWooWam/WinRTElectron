
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Include.js"/>
/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>
Jx.delayDefine(People, "VirtualizableButton", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People,
        A = P.Animation;

    var VirtualizableButton = P.VirtualizableButton = /*@constructor*/function (clickCallback) {
        /// <summary>The VirtualizableButton control provides a button that can be put into a VirtualizedGrid</summary>
        /// <param name="clickCallback" type="P.Callback">The callback to be called when the button is clicked.
        /// The button's current dataContext will be passed as a parameter to the callback.</param>
        this._title = "";
        this._text = "";
        this._dataContext = null;
        this._clickCallback = clickCallback;
        this._internalClickHandler = this._onClick.bind(this);
        this._internalKeydownHandler = this._onKeydown.bind(this);
        var element = document.createElement("div");
        element.innerHTML = this.getUI();
        this._element = element.firstChild;
        this._element.id = this.id = "vb" + Jx.uid();
        this.activateUI();
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    VirtualizableButton.prototype.getUI = function () {
        /// <summary>Returns the HTML for this control</summary>
        /// <returns type="String"/>
        var ariaLabel = Jx.escapeHtml(this._title);
        return "<div class='virtualButton' role='button' aria-label='" + ariaLabel + "'>" +
                    Jx.escapeHtml(this._text) +
               "</div>";
    };

    VirtualizableButton.prototype.activateUI = function () {
        /// <summary>Called after the element has been added to the DOM</summary>
        Debug.assert(Jx.isHTMLElement(this._element));
        this._element.addEventListener("click", this._internalClickHandler, false);
        this._element.addEventListener("keydown", this._internalKeydownHandler, false);
        A.addTapAnimation(this._element);
    };

    VirtualizableButton.prototype._onClick = function () {
        /// <summary>Event handler for clicks on the button</summary>
        this._clickCallback.invoke([this._dataContext]);
    };

    VirtualizableButton.prototype._onKeydown = function (ev) {
        /// <summary>Keydown event handler</summary>
        /// <param name="fn" type="Function">Click handler for this element</param>
        /// <param name="ev" type="Event"/> 
        if (ev.key === "Spacebar" || ev.key === "Enter") {
            this._onClick();
        }
    };

    VirtualizableButton.prototype.getHandler = function () {
        return this;
    };

    VirtualizableButton.prototype.getElement = function () {
        return this._element;
    };

    VirtualizableButton.prototype.setDataContext = function (dataObject) {
        this._dataContext = dataObject;
        this._title = dataObject.title;
        this._text = dataObject.text;
        this._element.innerText = Jx.escapeHtml(this._text);
        this._element.setAttribute("aria-label", Jx.escapeHtml(this._title));
    };

    VirtualizableButton.prototype.nullify = function () {
        this.setDataContext({ title: "", text: "" });
        this._dataContext = null;
    };

    VirtualizableButton.prototype.dispose = function () {
        this._element.removeEventListener("click", this._internalClickHandler);
        this._element.removeEventListener("keydown", this._internalKeydownHandler);
    };
});
