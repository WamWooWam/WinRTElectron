
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayDefine(People, "AddFavoritesButton", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People

    var AddFavoritesButton = P.AddFavoritesButton = /*@constructor*/function (clickCallback) {
        /// <summary>The AddFavoritesButton extends VirtualizableButton to allow having a border as part of the content</summary>
        /// <param name="clickCallback" type="P.Callback">The callback to be called when the button is clicked.
        /// The button's current dataContext will be passed as a parameter to the callback.</param>
        P.VirtualizableButton.call(this, clickCallback);
    };
    Jx.inherit(P.AddFavoritesButton, P.VirtualizableButton);
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    AddFavoritesButton.prototype.getUI = function () {
        /// <summary>Returns the HTML for this control</summary>
        /// <returns type="String"/>
        var ariaLabel = Jx.escapeHtml(this._title);
        var tooltip = Jx.res.getString("/strings/addFavoritesButtonTooltip");
        return "<div class='virtualButton' role='button' aria-label='" + ariaLabel + "' title='" + tooltip + "'>" +
                    "<div class='innerHighlight'></div>" +
                    "<div class='plusSign'>" +
                        Jx.escapeHtml(this._text) +
                    "</div>" +
               "</div>";
    };

    AddFavoritesButton.prototype.setDataContext = function (dataObject) {
        this._dataContext = dataObject;
        this._title = dataObject.title;
        this._text = dataObject.text;
        this._element.querySelector(".plusSign").innerText = Jx.escapeHtml(this._text);
        this._element.setAttribute("aria-label", Jx.escapeHtml(this._title));
    };
});
