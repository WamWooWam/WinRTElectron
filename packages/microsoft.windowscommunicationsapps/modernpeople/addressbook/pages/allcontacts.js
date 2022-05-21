
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../Controls/Stitcher/Stitcher.js"/>
/// <reference path="../Sections/FavoriteContactsSection.js"/>
/// <reference path="../Sections/AllContactsSection.js"/>

Jx.delayDefine(People, "AllContactsPage", function () {
    
    var P = window.People;

    P.AllContactsPage = /* @constructor*/function (host, options) {
        ///<summary>Creates the address book page.</summary>
        ///<param name="host" type="P.CpMain">The object that hosts the address book.</param>
        ///<param name="options" type="Object" optional="true">Unused</param>
        this._alphabetIndex = 0;
        this._semanticZoomActivated = true;
        this._queryText = "";
        this._queryLanguage = "";
        this._host = host;

        P.ViewportPage.call(this, host, options);
    };
    Jx.inherit(P.AllContactsPage, P.ViewportPage);

    P.AllContactsPage.prototype._createViewportChild = function (data, fields) {
        if (data && fields) {
            this._setQuery(data, fields);
        } else if (fields && Jx.isValidNumber(fields.alphabetIndex)) {
            this._alphabetIndex = fields.alphabetIndex;
        }
        return new P.Stitcher();
    };

    P.AllContactsPage.prototype.prepareSaveBackState = function () {
        if (this._allContactsSection) {
            this._allContactsSection.onPrepareSaveBackState();
        }
    };

    P.AllContactsPage.prototype._updateQuery = function (query, language) {
        var reload = false;
        if (this._queryText !== query) {
            this._queryText = query;
            reload = true;
        }

        if (this._queryLanguage !== language) {
            this._queryLanguage = language;
            if (this._queryText !== "") {
                // If the query language changes but the query string is blank, then we do not
                // need to force a reload
                reload = true;
            }
        }

        if (reload) {
            this._host.reloadAllContactsPage();
        }
    };

    P.AllContactsPage.prototype._setQuery = function (query, language) {
        this._queryText = query;
        this._queryLanguage = language;
    }

    P.AllContactsPage.prototype._initViewportChild = function (stitcher, orientation) {
        ///<summary>Our viewport is a stitcher containing the sections</summary>
        ///<param name="stitcher" type="P.Stitcher" />
        ///<param name="orientation">Scroll orientation, e.g. vertical or horizontal</param>
        var platformCache = this._host.getPlatformCache(),
            platform = platformCache.getPlatform();
        if (orientation === P.Orientation.horizontal) {
            var upsellSettings = new P.Accounts.UpsellSettings(Jx.appData.roamingSettings().container("People"));
            if (upsellSettings.shouldShow()) {
                stitcher.addChild(new P.UpsellSection(platform, upsellSettings));
            }
        }

        if (Jx.isNonEmptyString(this._queryText)) {
            this._semanticZoomActivated = false; // Disable semantic zoom when showing search results. There are no headers in the search results section
                                                 // so the summary view would be empty.
            stitcher.addChild(new P.SearchResultsSection(platformCache._platform, this._queryText, this._queryLanguage, this._host.getHeader(), false));
        }
        else {
            // The AllContactsSection may have been loaded by swapping out a SearchResultsSection instead of
            // via a page navigation. Because of this, the Title may not have been reset so do a forced reset at this time.
            this._semanticZoomActivated = true; // Ensure semantic zoom is re-enabled for the all contacts results
            this._host.getHeader().clearSecondaryTitle();
            this._allContactsSection = new P.AllContactsSection(platformCache, this._host.getRootElem(), this._host.getCommandBar(), this._alphabetIndex);
            stitcher.addChild(this._allContactsSection);
        }
    };
});
