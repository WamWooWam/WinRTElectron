
// Copyright (C) Microsoft Corporation.  All rights reserved.

/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js" />
/// <reference path="../Shared/JsUtil/namespace.js"/>
/// <reference path="../Shared/JsUtil/Flyout.js"/>
/// <reference path="../Shared/JsUtil/PeopleAnimation.js" />
/// <reference path="../Shared/Navigation/UriGenerator.js"/>
/// <reference path="../Social/Common/Social.Utilities.js"/>
/// <reference path="AppFrame.ref.js"/>

Jx.delayDefine(People, "CpTitle", function () {

    var P = window.People;
    var N = P.Nav;
    var A = P.Animation;

    P.CpTitle = /* @constructor*/function (jobSet) {
        this._name = "People.CpTitle";
        this.initComponent();
        this._jobSet = jobSet;

        this._animation = /*@static_cast(WinJS.Promise)*/null;
        this._onPersonNameChangedListener = this._onPersonNameChanged.bind(this);
        this._flyout = /*@static_cast(P.Flyout)*/null;
        this._flyoutListener = null;
        this._person = /*@static_cast(Microsoft.WindowsLive.Platform.Person)*/null;
        this._element = /*@static_cast(HTMLElement)*/null;
        this._titleAndChevronElement = /*@static_cast(HTMLElement)*/null;
        this._titleElement = /*@static_cast(HTMLElement)*/null;
        this._chevronElement = /*@static_cast(HTMLElement)*/null;
        this._secondaryTitleElement = /*@static_cast(HTMLElement)*/null;
        this._page = "";
    };

    Jx.augment(P.CpTitle, Jx.Component);

    var s = P.CpHeader.Scenes;
    var tt = P.CpHeader.TitleTypes;

    // Maps each page to its header scene.
    var pts = P.CpTitle.PageToScene = {
        allcontacts: s.allcontacts,
        createcontact: s.create,
        editmepicture: s.editphoto,
        editprofile: s.edit,
        galsearchresults: s.galsearchresults,
        linkperson: s.link,
        notification: s.notification,
        search: s.search,
        viewab: s.ab,
        viewme: s.ct,
        viewmephoto: s.ct,
        viewmeprofile: s.ct,
        viewmera: s.ct,
        viewperson: s.ct,
        viewphoto: s.ct,
        viewprofile: s.ct,
        viewra: s.ct,
        viewraitem: s.none,
        whatsnew: s.whatsnew
    };

    P.CpTitle.prototype.getUI = function (ui) {
        /// <summary>Gets the UI string for the component.</summary>
        /// <param name="ui" type="JxUI">Returns the object which contains html and css properties.</param>
        ui.html = '<div class="grid-header-title">' +
                    '<div class="header-title" id="idPeopleTitle">' +
                        '<div class="header-title-text singleLineText" id="idPeopleTitleText"></div>' +
                        '<div class="header-title-chevron hidden" id="idPeopleTitleChevron">\uE099</div>' +
                    '</div>' +
                    '<div class="header-secondaryTitle singleLineText" id="idPeopleSecondaryTitle"></div>' +
                  '</div>';
    };

    P.CpTitle.prototype.deactivateUI = function () {
        /// <summary>Called on application shutdown UI.</summary>
        this._clearAnimationAndEventListeners();
        Jx.Component.prototype.deactivateUI.call(this);
    };

    P.CpTitle.prototype.getElement = function () {
        return this._element;
    };

    P.CpTitle.prototype.activateUI = function () {
        /// <summary>Called after the UI is initialized. getUI has been called at this point.</summary>
        Jx.Component.prototype.activateUI.call(this);
        var element = this._element = document.querySelector(".grid-header-title");
        this._titleAndChevronElement = element.querySelector(".header-title");
        this._titleElement = element.querySelector(".header-title-text");
        this._chevronElement = element.querySelector(".header-title-chevron");
        this._secondaryTitleElement = element.querySelector(".header-secondaryTitle");
    };

    P.CpTitle.prototype._clearAnimationAndEventListeners = function () {
        /// <summary>Unhook all event listeners attached and cancel existing animations.</summary>

        // Unhook the event listener for person change
        if (this._person) {
            this._person.removeEventListener("changed", this._onPersonNameChangedListener);
        }
        this._person = null;

        // Unhook event listeners for chevron filtering
        Jx.dispose(this._flyout);
        Jx.dispose(this._flyoutListener);
        this._flyout = null;
        this._flyoutListener = null;

        // Cancel any existing animations
        if (this._animation) {
            this._animation.cancel();
        }
    };

    P.CpTitle.prototype._hookPersonEventListener = function (person) {
        /// <summary>Hook up the event listener for person change.</summary>
        /// <param name="person" type="Microsoft.WindowsLive.Platform.Person">The person object.</param>

        // To test with mock, use Jx.root._header._title._person.mock$setProperty("calculatedUIName", "xxxxx")
        person.addEventListener("changed", this._onPersonNameChangedListener);
        this._person = person;
    };

    P.CpTitle.prototype._onPersonNameChanged = function (ev) {
        ///<summary>Property change listener on the person object</summary>
        ///<param name="ev" type="Event">A projection of ObjectChangedHandler into the DOM L2 events pattern</param>
        var sender = /*@static_cast(Microsoft.WindowsLive.Platform.Person)*/ev.target;
        var changes = /*@static_cast(Array)*/ev.detail[0];

        Debug.assert(this._person);

        for (var i = 0; i < changes.length; i++) {
            if (changes[i] === "calculatedUIName" || changes[i] === "calculatedYomiDisplayName") {
                if (this._titleElement && this._secondaryTitleElement) {
                    Debug.assert(this._person === sender);
                    this._setTitleTextsForPerson(pts[this._page], sender);
                }
                break;
            }
        }
    };

    P.CpTitle.prototype._needsUpdate = function (newScene, person) {
        /// <summary>Does the title for current page need an update? If the scene is the 
        /// same and the person has not changed, no update is needed</summary>
        /// <param name="newScene" type="AppScene">name of the header scene</param>
        /// <param name="person" type="Microsoft.WindowsLive.Platform.Person">Person</param>
        var page = this._page;
        var thisPerson = this._person;
        return !(Jx.isNonEmptyString(page) && Jx.isObject(thisPerson) &&
            newScene.id === s.ct.id && pts[page].id === s.ct.id &&
            person.objectId === thisPerson.objectId &&
            person.isInAddressBook);
    };

    P.CpTitle.prototype.update = function (page, person, control, fields) {
        /// <summary>Update the title for selected page.</summary>
        /// <param name="page" type="String">Name of the page.</param>
        /// <param name="person" type="Microsoft.WindowsLive.Platform.Person">Person</param>
        /// <param name="control" type="AppControl">The current content control.</param>
        /// <param name="fields" type="Object">The customized fields for the page.</param>
        Debug.assert(page in pts);
        Debug.assert(page !== N.Pages.viewme.id || (Jx.isObject(person) && (person.objectType === "MeContact")));
       
        var scene = pts[page];
        if (this._needsUpdate(scene, person)) {
            this._clearAnimationAndEventListeners();

            this._setTitleText(scene, person, fields);

            // set title style based on if filtering is enabled or not
            var enableFiltering = !Jx.isNullOrUndefined(control) && !Jx.isNullOrUndefined(control.hasFilter) && control.hasFilter();
            var titleAndChevronElement = this._titleAndChevronElement;
            titleAndChevronElement.tabIndex = enableFiltering ? 0 : -1;
            titleAndChevronElement.setAttribute("role", enableFiltering ? "button" : "heading");
            Jx.setClass(titleAndChevronElement, "hasFilter", enableFiltering);
            Jx.setClass(this._chevronElement, "hidden", !enableFiltering);
            if (enableFiltering) {
                this._setTitleFilter(control);
            }

            this._jobSet.addUIJob(this, this._addTooltips, null, P.Priority.tooltip);
        }
        this._page = page;
    };

    P.CpTitle.prototype._addTooltips = function () {
        [this._titleElement, this._secondaryTitleElement].forEach(/* @bind(P.CpTitle) */function (node, index) {
            var tooltip = new WinJS.UI.Tooltip(node);
            var listener = this._onTooltip.bind(this, node);
            node.addEventListener("beforeopen", listener, false);
        }, this);
    };

    P.CpTitle.prototype._onTooltip = function (node) {
        ///<summary>Tooltip event handler</summary>
        ///<param name="node" type="HTMLElement"/>
        var tooltipControl = node.winControl;
        Debug.assert(tooltipControl);
        // Show tooltip if the text is ellipsed.
        if (node.scrollWidth > Math.ceil(node.getBoundingClientRect().width)) {
            // Set the tooltip into the PAC tooltip control requires converting it to HTML.
            tooltipControl.innerHTML = "<div>" + Jx.escapeHtml(node.innerText) + "</div>";
        } else {
            tooltipControl.innerHTML = "";
        }
    };

    P.CpTitle.prototype._setTitleText = function (scene, person, /*@dynamic*/fields) {
        /// <summary>Set the title text for the page</summary>
        /// <param name="scene" type="AppScene">name of the header scene</param>
        /// <param name="person" type="Microsoft.WindowsLive.Platform.Person">Person</param>
        /// <param name="fields">The customized fields for the page.</param>

        this.setSecondaryTitleText("");
        var title = "";
        if (scene.id !== "none") {
            switch (scene.type) {
                case tt.res:
                    title = Jx.res.getString(scene.resId);
                    break;
                case tt.personName:
                case tt.resWithName:
                    title = null;
                    this._setTitleTextsForPerson(scene, person);
                    this._hookPersonEventListener(person);
                    break;
                default:
                    Debug.assert(false);
                    break;
            }
        }

        if (!Jx.isNullOrUndefined(title)) {
            this._titleElement.innerText = title;
        }
    };

    P.CpTitle.prototype._setTitleFilter = function (control) {
        /// <summary>Set title filtering flyout for the page.</summary>
        /// <param name="control" type="AppControl"/>
        var titleAndChevronElement = this._titleAndChevronElement;
        this.setSecondaryTitleText(control.getCurrentFilterName());
        A.addPressStyling(titleAndChevronElement);
        this._flyoutListener = new Jx.Clicker(titleAndChevronElement, this._onFilterFlyout.bind(this, control));
    };

    P.CpTitle.prototype._onFilterFlyout = function (control) {
        /// <param name="control" type="AppControl"/>

        // Dispose previous flyout that hasn't been disposed before replacing it
        var flyout = this._flyout;
        Jx.dispose(flyout);

        flyout = this._flyout = new P.Flyout(control.getFilterItems());
        var flyoutElement = flyout.getFlyoutElement();
        this._setWidth(flyoutElement, this._titleAndChevronElement.getBoundingClientRect().width);
        Jx.addClass(flyoutElement, "whatsNewFilter");

        var callback = this._afterFlyoutClosed.bind(this, control, control.getCurrentFilterName(), this._page);
        flyout.show(this._titleAndChevronElement/*anchor*/, "bottom"/*placement*/, "left"/*alignment*/, callback/*callback*/);
    };

    P.CpTitle.prototype._afterFlyoutClosed = function (control, previousFilter, currentPage) {
        /// <param name="control" type="AppControl"/>
        /// <param name="previousFilter" type="String"/>
        /// <param name="currentPage" type="String"/>
    
        // Only animate the filter text if filter has changed and we haven't navigate away from the page
        var filterName = control.getCurrentFilterName();
        if (previousFilter !== filterName  && this._page === currentPage) {
            var parentContainer = this._element;
            var oldElement = this._secondaryTitleElement;

            // create and add the cloned incoming element
            var newElement = oldElement.cloneNode(true);
            this._setText(newElement, filterName);
            newElement.style.opacity = "0";
            parentContainer.appendChild(newElement);

            ///<disable>JS3092.DeclarePropertiesBeforeUse</disable>
            var exitFilterPromise = P.Animation.exitContent(oldElement);
            var enterFilterPromise = P.Animation.enterContent(newElement);
            ///<enable>JS3092.DeclarePropertiesBeforeUse</enable>
            this._animation = WinJS.Promise.join([exitFilterPromise, enterFilterPromise]);
            this._animation.done(function () {
                parentContainer.removeChild(oldElement);
                this._secondaryTitleElement = newElement;
                newElement.style.opacity = "1";
                this._animation = null;
            }.bind(this));
        }
    };

    P.CpTitle.prototype._setWidth = function (element, width) {
        /// <param name="element" type="HTMLElement"/>
        /// <param name="width" type="Number"/>
        Debug.assert(Jx.isHTMLElement(element));
        element.style.width = String(width) + "px";
    };

    P.CpTitle.prototype._setTitleTextsForPerson = function (scene, person) {
        /// <summary>Get the title text for the person page</summary>
        /// <param name="scene" type="AppScene">Scene of the page header</param>
        /// <param name="person" type="Microsoft.WindowsLive.Platform.Person">Person</param>
        /// <returns type="String"/>
        Debug.assert(person.calculatedUIName);
        var title = "";
        var type = scene.type;

        if (type === tt.personName) {
            title = person.calculatedUIName;
            this.setSecondaryTitleText(person.calculatedYomiDisplayName);
        } else if (type === tt.resWithName) {
            title = Jx.res.loadCompoundString(scene.resId, person.calculatedUIName);
        }
        Debug.assert(Jx.isNonEmptyString(title));
        this._titleElement.innerText = title;
    };

    P.CpTitle.prototype.setSecondaryTitleText = function (title) {
        /// <summary>Set the secondary title string</summary>
        /// <param name="title" type="String">The secondary title</param>
        if (!Jx.isNullOrUndefined(title)) {
            this._setText(this._secondaryTitleElement, title);
        }
    };

    P.CpTitle.prototype._setText = function (element, text) {
        Debug.assert(Jx.isHTMLElement(element) && !Jx.isNullOrUndefined(text));
        element.innerText = text;
        element.setAttribute("aria-label", text);
    };
});
