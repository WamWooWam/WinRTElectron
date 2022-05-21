
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../Controls/Collections/AddressBookCollections.js"/>
/// <reference path="ContactGridSection.js"/>
/// <reference path="ContactGridHeaders.js"/>

Jx.delayDefine(People, "AlphabetsSection", function () {

    var P = window.People;
        A = P.Animation;

    P.AlphabetsSection = /*@constructor*/function (platformCache) {
        ///<summary>The Alphabet section provides a way to quickly jump to the alphabet header in the all contacts page</summary>
        ///<param name="platformCache" type="P.PlatformCache"/>
        P.ContactGridSection.call(this, "alphabetsSection", "/strings/alphabetsSectionTitle", platformCache.getPlatform().peopleManager);
        this._platformCache = platformCache;
    };
    Jx.inherit(P.AlphabetsSection, P.ContactGridSection);
    var base = P.ContactGridSection.prototype;

    P.AlphabetsSection.prototype.getContent = function () {

        var titleText = Jx.res.getString('/strings/alphabetsSectionTitle');
        var chevron = Jx.isRtl() ? "\uE096" : "\uE097";

        return "<div class='alphabetsSectionGrid'>" +
                    "<div class='alphabetsSectionTitleContainer' tabindex='0' role='button'>" +
                        "<a class='alphabetsSectionTitle'>" + titleText + "</a>" +
                        "<a class='alphabetsSectionTitleChevron'>" + chevron + "</a>" +
                    "</div>" +
                    base.getContent.apply(this, arguments) +
                "</div>";
    }

    P.AlphabetsSection.prototype.activateUI = function () {
        this.titleContainer = document.querySelector(".alphabetsSectionTitleContainer");
        this.titleContainer.addEventListener("click", this._onTitleClicked, false);
        this.titleContainer.addEventListener("keyup", this._onTitleKeyUp, false);
        this.addedClickHandler = true;
        A.addTapAnimation(this.titleContainer);
        base.activateUI.apply(this, arguments);
    };

    P.AlphabetsSection.prototype.contentReadyAsync = function () {
        if (this.isInView()) {
            return [this.titleContainer, this._contentElement.querySelector(".gridContainer")];
        }
        return [];
    }

    P.AlphabetsSection.prototype._getCollection = function () {
        ///<returns type="P.Collection">The collection used to populate the alphabet section</returns>
        var that = this;
        return this._platformCache.getCollection(this.name, function (platform) {
            /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
            return P.AddressBookCollections.makeAlphabetsCollection(platform.peopleManager, that.getJobSet());
        });
    };

    P.AlphabetsSection.prototype._getFactories = function () {
        ///<returns type="Object">The map of factories that will be used to populate the alphabet section</returns>
        var alphabetButtonClickedCallback = new P.Callback(this.alphabetButtonClicked, this);
        return {
            alphabetButton: new P.Callback(function () { return new P.VirtualizableButton(alphabetButtonClickedCallback); })
        };
    };

    P.AlphabetsSection.prototype._getCanonicalType = function(){
        return "alphabetButton";
    }

    P.AlphabetsSection.prototype.alphabetButtonClicked = function (dataContext) {
        P.Nav.removePageLastScrollPosition("AllContactsScrollPosition");
        P.Nav.navigate(People.Nav.getAllContactsUri({ alphabetIndex: dataContext.alphabetIndex }));
    };

    P.AlphabetsSection.prototype._onTitleKeyUp = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, "ev != null");
        if (ev.keyCode === WinJS.Utilities.Key.enter ||
            ev.keyCode === WinJS.Utilities.Key.space) {
            People.Nav.navigate(People.Nav.getAllContactsUri(null));
        }
    };

    P.AlphabetsSection.prototype._onTitleClicked = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, "ev != null");
        People.Nav.navigate(People.Nav.getAllContactsUri(null));
    };

    P.AlphabetsSection.prototype.shutdownComponent = function () {
        P.ContactGridSection.prototype.shutdownComponent.call(this);
        if (this.addedClickHandler) {
            this.titleContainer.removeEventListener("click", this._onTitleClicked, false);
            this.addedClickHandler = false;
        }
    };

});
