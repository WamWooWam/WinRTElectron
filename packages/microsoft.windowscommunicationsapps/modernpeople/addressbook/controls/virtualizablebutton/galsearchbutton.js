
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayDefine(People, "GALSearchButton", function () {
    var P = window.People

    var GALSearchButton = P.GALSearchButton = /*@constructor*/function (clickCallback) {
        /// <summary>The GALSearchButton extends VirtualizableButton to allow having a border as part of the content</summary>
        /// <param name="clickCallback" type="P.Callback">The callback to be called when the button is clicked.
        /// The button's current dataContext will be passed as a parameter to the callback.</param>
        P.VirtualizableButton.call(this, clickCallback);
    };
    Jx.inherit(P.GALSearchButton, P.VirtualizableButton);

    GALSearchButton.prototype.getUI = function () {
        /// <summary>Returns the HTML for this control</summary>
        /// <returns type="String"/>
        var ariaLabel = Jx.escapeHtml(this._title);
        return "<div class='virtualButton' role='button' aria-label='" + ariaLabel + "'>" +
                    "<div class='GALSearchText'>" +
                        Jx.escapeHtml(this._text) +
                    "</div>" +
               "</div>";
    };

    GALSearchButton.prototype.setDataContext = function (dataObject) {
        this._dataContext = dataObject;
        this._title = dataObject.title;
        this._text = Jx.res.loadCompoundString('/strings/galSearchButtonText', dataObject.text);
        this._account = dataObject.account;
        var galText = this._element.querySelector(".GALSearchText");
        // If the user navigates away from the page quickly - then the button
        // may have been removed from the DOM before setDataContext is called.
        // Because of this we need to ensure that galText actually exists before we
        // attempt to set one of its members.
        if (galText) {
            galText.innerText = Jx.escapeHtml(this._text);
        }
        this._element.setAttribute("aria-label", Jx.escapeHtml(this._title));
    };
});
