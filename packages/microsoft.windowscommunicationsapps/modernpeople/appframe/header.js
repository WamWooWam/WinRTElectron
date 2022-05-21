
// Copyright (C) Microsoft Corporation.  All rights reserved.

/// <disable>JS3092.DeclarePropertiesBeforeUse</disable> Jx references
/// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
/// <reference path="../Shared/JsUtil/namespace.js"/>
/// <reference path="AnimationData.ref.js"/>
/// <reference path="Main.js"/>
/// <reference path="Title.js" />
/// <reference path="../Shared/Navigation/UriGenerator.js" />

Jx.delayDefine(People, "CpHeader", function () {
    
    var P = window.People;
    var N = P.Nav;

    // There are two screen dimensions that map to @media queries in the CSS.    
    // _partialMaxScreenWindowSize is the screen width before we consider the app full screen
    // _partialMinScreenWindowSize is the screen width which maps directly to Windows 8 Snapped 320-500
    var _partialMaxScreenWindowSize = 955;
    var _partialMinScreenWindowSize = 501;

    P.CpHeader = /* @constructor*/function (jobSet) {
        this._name = "People.CpHeader";
        this.initComponent();

        this._title = new P.CpTitle(jobSet);
        this._frameCommands = new P.FrameCommands(jobSet);
        this.append(this._title, this._frameCommands);

        // An array that caches the outgoing elements for animation 
        this._leftoverElements = [];
    };

    Jx.augment(P.CpHeader, Jx.Component);

    // Used as header element tabIndex to ensure they are the last items in the page to be tabbed to.
    // 1000 is an arbitary number to reserve a range of tab indices for use in the page.
    P.CpHeader.tabIndexLast = 1000;

    var tt = P.CpHeader.TitleTypes = {
        res: 0,
        personName: 1,
        resWithName: 2
    };

    P.CpHeader.Scenes = {
        // Address book 
        ab: {
            id: "ab",
            type: tt.res,
            resId: "/strings/addressBookHeader",
            headerTitleCssClass: "ab-headertitle"
        },
        // All Contacts Page
        allcontacts: {
            id: "allcontacts",
            type: tt.res,
            resId: "/strings/allContactsPageHeader",
            backButtonCssClass: "app-backbutton"
        },
        // What's new page
        whatsnew: {
            id: "whatsnew",
            type: tt.res,
            resId: "/strings/whatsNewHeader",
            backButtonCssClass: "app-backbutton"
        },
        // Pages for viewing the person's landing/profile/ra/photos
        ct: {
            id: "ct",
            type: tt.personName,
            backButtonCssClass: "app-backbutton"
        },
        // Page for create contact
        create: {
            id: "create",
            type: tt.res,
            resId: "/strings/createContactHeader",
            backButtonCssClass: "app-backbutton"
        },
        // Page for edit profile
        edit: {
            id: "edit",
            type: tt.res,
            resId: "/strings/editContactHeader",
            backButtonCssClass: "app-backbutton"
        },
        // Page for edit photo
        editphoto: {
            id: "editphoto",
            type: tt.res,
            resId: "/strings/editPhotoHeader",
            backButtonCssClass: "app-backbutton"
        },
        // Page for link person
        link: {
            id: "link",
            type: tt.resWithName,
            resId: "/strings/linkHeader",
            backButtonCssClass: "app-backbutton"
        },
        // Pages with no app frame header
        none: {
            id: "none"
        },
        // Page for notification
        notification: {
            id: "notification",
            type: tt.res,
            resId: "/strings/notificationHeader",
            backButtonCssClass: "app-backbutton"
        },
        // Page for search
        search: {
            id: "search",
            type: tt.res,
            resId: "/strings/searchHeader",
            backButtonCssClass: "app-backbutton"
        },
        // Page for GAL search resutls
        galsearchresults: {
            id: "galsearchresults",
            type: tt.res,
            resId: "/strings/searchResultsHeader",
            backButtonCssClass: "app-backbutton"
        },
    };

    P.CpHeader.prototype.getFrameCommands = function () {
        /// <summary>Returns the frame commands.</summary>
        /// <returns type="P.FrameCommands"/>
        return this._frameCommands;
    };

    P.CpHeader.prototype.deactivateUI = function () {
        /// <summary>Called on application shutdown UI.</summary>
        Jx.Component.prototype.deactivateUI.call(this);
    };

    P.CpHeader.prototype.getUI = function (ui) {
        /// <summary>Gets the UI string for the component.</summary>
        /// <param name="ui" type="JxUI">Returns the object which contains html and css properties.</param>
        ui.html = '<div id="header_container" class="header-container">' +
                    '<div class="grid-header-back hiddenInEdit">' +
                        '<button class="win-backbutton hidden" id="idPeopleBack" type="button" aria-label="' + Jx.escapeHtml(Jx.res.getString("/strings/backButtonAriaLabel")) + '"/>' +
                    '</div>' +
                    Jx.getUI(this._title).html +
                    '<div class="grid-header-search-container hiddenInEdit hiddenInCommandScene">' +
                      '<div class="grid-header-search" id="searchControlId" data-win-control="WinJS.UI.SearchBox" aria-expanded="false" aria-label="' +
                          Jx.escapeHtml(Jx.res.getString("/strings/searchBoxAriaLabel")) + '"' +
                          'data-win-options="{ placeholderText : &quot;' + Jx.escapeHtml(Jx.res.getString("/strings/SearchBoxPlaceholder")) + '&quot;, searchHistoryDisabled : true, chooseSuggestionOnEnter: true }">' +
                      '</div>' +
                    '</div>' +
                    Jx.getUI(this._frameCommands).html +
                  '</div>';
    };

    P.CpHeader.prototype._backEnabled = false;
    P.CpHeader.prototype._backBtn = /* static_cast(HTMLElement)*/null;
    P.CpHeader.prototype._searchControl = /* static_cast(HTMLElement)*/null;

    P.CpHeader.prototype.updateBackBtn = function (selectedPage) {
        /// <summary>Enable/disable the back button to be clickable and keyboard accessible.</summary>
        var backBtn = this._backBtn;
        var searchControl = this._searchControl;
        if (backBtn) {
            // back button was initially set to hidden to avoid flicking 
            WinJS.Utilities.removeClass(backBtn, "hidden");

            // remove the previously used custom back button class if one exists
            if (this._backBtnClass) {
                WinJS.Utilities.removeClass(backBtn, this._backBtnClass);
            }

            var enable = this._backEnabled = Jx.root.canGoBack();
            backBtn.disabled = !enable;
            var hidden = enable ? "false" : "true";
            backBtn.setAttribute("aria-hidden", hidden);
            backBtn.setAttribute("aria-disabled", hidden);
            // Make tabIndex to tabIndexLast so the back button along with the tabs will be the last items to be tabbed to.
            backBtn.tabIndex = P.CpHeader.tabIndexLast;

            // clear out the styles of the search box because we don't know if the back button is present or not.
            WinJS.Utilities.removeClass(searchControl, "dynamic-win-searchbox-with-back-button");
            if (searchControl.getAttribute("aria-expanded") === "true") {
                WinJS.Utilities.removeClass(searchControl.querySelector(".win-searchbox-flyout"), "dynamic-win-searchbox-flyout-with-back-button");
            }

            if (selectedPage) {
                this._backBtnClass = P.CpTitle.PageToScene[selectedPage].backButtonCssClass;
                if (this._backBtnClass) {
                    WinJS.Utilities.addClass(backBtn, this._backBtnClass);
                }
            }

            // we can blindly just remove this class because it's only on the allcontacts/search pages do we want 
            // to apply it. removing here will ensure no other pages regress.
            WinJS.Utilities.removeClass(this._title.getElement(), "dynamic-search-grid-header-title");
            WinJS.Utilities.removeClass(this._title.getElement().querySelector(".header-secondaryTitle"), "dynamic-search-header-secondaryTitle");
            WinJS.Utilities.removeClass(this._title.getElement().querySelector(".header-title .header-title-text"), "dynamic-header-title-header-title-text");
        }

        var headerTitle = this._headerTitle;
        if (headerTitle) {
            // remove the previously used custom header title class if one exists
            if (this._headerTitleClass) {
                WinJS.Utilities.removeClass(headerTitle, this._headerTitleClass);
            }

            if (selectedPage) {
                this._headerTitleClass = P.CpTitle.PageToScene[selectedPage].headerTitleCssClass;
                if (this._headerTitleClass) {
                    WinJS.Utilities.addClass(headerTitle, this._headerTitleClass);
                }
            }
        }
    };

    P.CpHeader.prototype._onBack = function () {
        /// <summary>Back button handler</summary>
        if (this._backEnabled) {
            Jx.root.back();
        }
    };

    P.CpHeader.prototype._onKeyup = function (fn, evt) {
        /// <summary>Key up event handler</summary>
        /// <param name="fn" type="Function">Click handler for this element</param>
        /// <param name="evt" type="Event"/>
        if (evt.type === "keyup") {
            if (evt.key === "Spacebar" || evt.key === "Enter") {
                fn.call(this);
            }
        }
    };

    P.CpHeader.prototype.activateUI = function () {
        /// <summary>Called after the UI is initialized. getUI has been called at this point.</summary>
        Jx.log.info("CpHeader.activateUI");
        Jx.Component.prototype.activateUI.call(this);
        this._container = document.getElementById("header_container");
        var backBtn = this._backBtn = document.getElementById("idPeopleBack");
        this._headerTitle = document.getElementById("idPeopleTitle");
        this._searchControl = document.getElementById("searchControlId");
        backBtn.addEventListener("click", this._onBack.bind(this), false);
    };

    P.CpHeader.prototype._parentContainer = /*static_cast(HTMLElement)*/null;
    P.CpHeader.prototype.setParentContainer = function (parentContainer) {
        /// <param name="parentContainer" type="HTMLElement"/>
        Debug.assert(Jx.isHTMLElement(parentContainer));
        this._parentContainer = parentContainer;
    };

    var s = P.CpHeader.Scenes;
    P.CpHeader.prototype._scene = "";

    P.CpHeader.prototype._cleanupAnimations = Jx.fnEmpty;

    P.CpHeader.prototype.setupUpdate = function (page) {
        /// <summary>Update header UI style.</summary>
        /// <param name="page" type="String">Identifier for the page</param>
        var parentContainer = this._parentContainer;
        // Only snappable page's header will switch to snap layout.
        Jx.setClass(parentContainer, "snappable", !N.Pages[page].blockSnap);
        Jx.setClass(parentContainer, "hidden", P.CpTitle.PageToScene[page] === s.none);
    };

    P.CpHeader.prototype.update = function (selectedPage, person, control, fields) {
        /// <summary>Update UI for the header area.</summary>
        /// <param name="selectedPage" type="String">Name of the page.</param>
        /// <param name="person" type="Microsoft.WindowsLive.Platform.Person">The person that is displayed in the page.</param>
        /// <param name="control" type="AppControl">The current content filtering control.</param>
        /// <param name="fields" type="Object">The customized fields for the page.</param>
        /// <returns type="AnimationData" />
        NoShip.People.etw("appFrameUpdateHeader_start");
        Jx.log.info("P.CpHeader.update: selectedPage=" + selectedPage);
        var scene = P.CpTitle.PageToScene[selectedPage];
        Debug.assert(scene);

        var containerElement = this._container;
        Debug.assert(containerElement);
        var outgoingDiv = /*type(HTMLElement)*/null;
        this._cleanupAnimations();

        // Prepare for animation. Clone the header that is going away.
        if (!P.Animation.disabled && scene !== this._scene && this._scene !== "") {
            NoShip.People.etw("appFrameAnimationSetup_start", { target: "header" });

            // Remove the leftover from previous animation if it hasn't completed. This could happen if
            // user navigates fast enough that the animation from previous page is still executing.
            // Or if the animation's callback isn't called on error (crossFade for example)
            P.Animation.removeOutgoingElements(this._leftoverElements);
            this._leftoverElements = [];

            outgoingDiv = containerElement.cloneNode(true);
            outgoingDiv.id = "idOutgoingHeader";
            containerElement.parentNode.appendChild(outgoingDiv);
            this._leftoverElements.push(outgoingDiv);
            NoShip.People.etw("appFrameAnimationSetup_end", { target: "header" });
        }

        var backButtonPreviouslyEnabled = this._backEnabled;
        this.updateBackBtn(selectedPage);
        this._title.update(selectedPage, person, control, fields);
        this._frameCommands.update();

        var entering = [];
        if (scene !== s.none) {
            if (!backButtonPreviouslyEnabled && this._backEnabled) {
                entering.push(this._backBtn);
            }

            if (this._backEnabled) {
                // if we have a back button the styling of the search box width is different because it has 
                // to accommodate  the button width and just can't be 100%. We want to make sure that we are 
                // expanded when this happens. If we are not the set focus as part of CpMain will take care of this.
                if (this._searchControl.getAttribute("aria-expanded") === "true") {
                    WinJS.Utilities.addClass(this._searchControl, "dynamic-win-searchbox-with-back-button");
                    WinJS.Utilities.addClass(this._searchControl.querySelector(".win-searchbox-flyout"), "dynamic-win-searchbox-flyout-with-back-button");
                }
            }

            if (scene !== this._scene) {
                entering.push(this._title.getElement());
            }

            // Update the header style for editable pages
            containerElement.className = "header-container";
            if (N.Pages[selectedPage].isEdit) {
                containerElement.className += " edit-create-scene";
                entering.push(this._frameCommands.getElement());
            } else if (scene === s.search) {
                containerElement.className += " search-scene";
            } else if (scene === s.ct) {
                containerElement.className += " ct-scene";
            } else if (scene === s.allcontacts) {
                // we are on the all contacts/search page. we can blindly add these styles because only the results message
                // uses the secondary title. the sytles are only applied when the @media query for small screen size is active
                WinJS.Utilities.addClass(this._title.getElement(), "dynamic-search-grid-header-title");
                WinJS.Utilities.addClass(this._title.getElement().querySelector(".header-secondaryTitle"), "dynamic-search-header-secondaryTitle");
                WinJS.Utilities.addClass(this._title.getElement().querySelector(".header-title .header-title-text"), "dynamic-header-title-header-title-text");
            }

            if (this._frameCommands.hasCommands()) {
                containerElement.className += " has-commands-scene"
            }
        }
        this._scene = scene;
        var that = this;
        var animData = {
            entering: entering,
            exiting: outgoingDiv ? [outgoingDiv] : [],
            onEnterComplete: function () {
                that._cleanupAnimations();
            },
            onExitComplete: function () {
                if (outgoingDiv) {
                    Jx.addClass(outgoingDiv, "under");
                }
            }
        };
        entering.forEach(function (/*@type(HTMLElement)*/e) { e.style.opacity = "0"; });
        this._cleanupAnimations = function () {
            NoShip.People.etw("appFrameAnimationCleanup_start", { target: "header" });
            if (outgoingDiv) {
                P.Animation.removeOutgoingElement(outgoingDiv);
                P.Sequence.remove(this._leftoverElements, outgoingDiv);
            }
            // Neutralize potential callbacks.
            animData.onExitComplete = animData.onEnterComplete = this._cleanupAnimations = Jx.fnEmpty;
            NoShip.People.etw("appFrameAnimationCleanup_end", { target: "header" });
        };
        NoShip.People.etw("appFrameUpdateHeader_end");
        return animData;
    };

    P.CpHeader.prototype.updateSecondaryTitle = function (title) {
        /// <summary>Set the secondary title string</summary>
        /// <param name="secondaryTitle" type="String">The secondary title</param>
        if (Jx.isNonEmptyString(title)) {
            Debug.assert(this._scene === s.allcontacts || this._scene === s.ct || this._scene === s.galsearchresults);
            this._title.setSecondaryTitleText(title);
        }
    };

    P.CpHeader.prototype.clearSecondaryTitle = function () {
        /// <summary>Clears the secondary title string</summary>
        this._title.setSecondaryTitleText("");
    };
});
