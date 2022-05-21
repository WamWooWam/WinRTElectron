
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Include.js"/>
/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/Navigation/UriGenerator.js"/>
/// <reference path="../../../../Shared/Jx/Core/Settings.js"/>
/// <reference path="../../../Shared/Bici/Bici.js"/>
/// <reference path="DisambiguatedCommandButton.ref.js"/>
/// <reference path="Windows.UI.Popups.js"/>
/// <dictionary>disambiguator</dictionary>
/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>

Jx.delayDefine(People, "DisambiguatedCommandButton", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People,
        A = P.Animation,
        InstruID = Microsoft.WindowsLive.Instrumentation.Ids;

    var DisambiguatedCommandButton = P.DisambiguatedCommandButton = /*@constructor*/function (id, title, icon, settingsContainer, settingsKey, jobSet) {
        /// <summary>The DisambiguatedCommandButton control provides a button with a disambiguator</summary>
        /// <param name="id" type="String">The HTML element id for this button</param>
        /// <param name="title" type="String">The large, static text on the button</param>
        /// <param name="icon" type="String">The icon: a single character in Segoe UI Symbol</param>
        /// <param name="settingsContainer" type="Jx.AppDataContainer" optional="true">A container to store the MRU value</param>
        /// <param name="settingsKey" type="String" optional="true">The key to use in that container</param>
        /// <param name="jobSet" type="P.JobSet" optional="true"></param>
        Debug.assert(Jx.isNonEmptyString(id));
        Debug.assert(Jx.isString(title));
        Debug.assert(Jx.isNonEmptyString(icon) && icon.length === 1);
        Debug.assert(Jx.isNullOrUndefined(settingsContainer) || Jx.isObject(settingsContainer));
        Debug.assert(Jx.isNullOrUndefined(settingsKey) || Jx.isNonEmptyString(settingsKey));

        this._id = id;
        this._title = title;
        this._icon = icon;
        this._settingsContainer = settingsContainer;
        this._settingsKey = settingsKey;
        this._jobSet = jobSet;

        this._value = /*@static_cast(DisambiguatedCommandValue)*/null;
        this._alternatives = /*@static_cast(Array)*/null;
        this._element = /*@static_cast(HTMLElement)*/null;
        this._disambiguatorElement = /*@static_cast(HTMLElement)*/null;
        this._valueElement = /*@static_cast(HTMLElement)*/null;
        this._titleElement = /*@static_cast(HTMLElement)*/null;
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    function findValue(data, values) {
        /// <summary>Finds a value in the array of values with the given data and returns it</summary>
        /// <param name="data" type="String"/>
        /// <param name="values" type="Array"/>
        /// <returns type="DisambiguatedCommandValue"/>
        return P.Sequence.find(values, function (/*@type(DisambiguatedCommandValue)*/value) { return value.data === data; });
    };

    DisambiguatedCommandButton.prototype.updateValues = function (bestValue, alternatives) {
        /// <summary>Updates the set of values available in the disambiguator.  May update the default value with the
        /// provided "best" value, but is reluctant to do that in favor of data the user has already seen.</summary>
        /// <param name="bestValue" type="DisambiguatedCommandValue">The best value from among those available.</param>
        /// <param name="alternatives" type="Array"/>
        Debug.assert(Jx.isNullOrUndefined(bestValue) || Jx.isObject(bestValue));
        Debug.assert(Jx.isArray(alternatives));

        this._alternatives = alternatives = alternatives.filter(function (/*@type(DisambiguatedCommandValue)*/value) {
            return Jx.isObject(value) && Jx.isNonEmptyString(value.display) && Jx.isNonEmptyString(value.data);
        });
        var bestData = bestValue ? bestValue.data : null;
        this._value = (this._value ? findValue(this._value.data, alternatives) : null) || // Keep the current value
                      this.getMRUValue(alternatives) || // Use the MRU value
                      findValue(bestData, alternatives) ||  // Use the best value
                      alternatives[0]; // Use any value available

        if (this._element) { // If the UI has already been created, update it
            if (this._value) {
                this._updateUI();
            }
            this._hideShow();
        }
    };

    DisambiguatedCommandButton.prototype.getMRUValue = function (alternatives) {
        /// <summary>Returns the MRU command value for this control</summary>
        /// <returns type="DisambiguatedCommandValue"/>
        Debug.assert(Jx.isArray(alternatives));
        var mru = null;
        if (/*@static_cast(Boolean)*/this._settingsKey && /*@static_cast(Boolean)*/this._settingsContainer) {
           mru = findValue(this._settingsContainer.get(this._settingsKey), alternatives);
        }
        return mru;
    };

    DisambiguatedCommandButton.prototype.getUI = function () {
        /// <summary>Returns the HTML for this control</summary>
        /// <returns type="String"/>
        var commandTitle = Jx.escapeHtml(this._getTitle()),
            commandValue = Jx.escapeHtml(this._getDisplayValue()),
            ariaLabel = commandTitle + " " + commandValue;

        return "<div id='" + this._id + "' class='contactCommand' tabIndex='-1' role='link' aria-label='" + ariaLabel + "'>" +
                   "<div class='contactCommand-content'>" +
                       "<div><div class='contactCommand-icon'>" + this._icon + "</div></div>" +
                       "<div class='contactCommand-body'>" +
                           "<div class='contactCommand-title'>" + commandTitle + "</div>" +
                           "<div class='contactCommand-value'>" + commandValue + "</div>" +
                       "</div>" +
                   "</div>" +
                   "<div class='contactCommand-disambiguator' style='display:none' role='button' aria-haspopup='true' aria-label='" + Jx.escapeHtml(Jx.res.getString("/landingPage/disambiguatedCommandButton")) + "'>\uE015</div>" +
               "</div>";
    };

    DisambiguatedCommandButton.prototype.activateUI = function (parentElement) {
        /// <summary>Called after the element has been added to the DOM</summary>
        /// <param name="parentElement" type="HTMLElement"/>
        var element = this._element = parentElement.querySelector("#" + this._id);
        Debug.assert(Jx.isHTMLElement(element));
        element.addEventListener("click", this._onClick.bind(this), false);
        element.addEventListener("keydown", this._onKeydown.bind(this), false);
        A.addPressStyling(element);
        A.addPressStyling(element.querySelector(".contactCommand-content"));

        var disambiguatorElement = this._disambiguatorElement = element.querySelector(".contactCommand-disambiguator");
        Debug.assert(Jx.isHTMLElement(disambiguatorElement));
        disambiguatorElement.addEventListener("click", this._onDisambiguate.bind(this), false);
        A.addPressStyling(disambiguatorElement);

        this._valueElement = element.querySelector(".contactCommand-value");
        Debug.assert(Jx.isHTMLElement(this._valueElement));

        this._titleElement = element.querySelector(".contactCommand-title");
        Debug.assert(Jx.isHTMLElement(this._titleElement));

        this._hideShow();

        if (this._jobSet) {
            this._jobSet.addUIJob(this, this._updateTooltip, null, P.Priority.accessibility);
        }
    };

    DisambiguatedCommandButton.prototype._getTitle = function () {
        /// <summary>Returns the title to be displayed in the control</summary>
        /// <returns type="String"/>
        var value = this._value;
        return (Boolean(value) && Jx.isNonEmptyString(value.title)) ? value.title : this._title;
    };

    DisambiguatedCommandButton.prototype._updateUI = function () {
        /// <summary>Updates the title in the control</summary>
        var value = this._value,
            displayValue = this._getDisplayValue();

        this._valueElement.innerText = displayValue;

        if (!this._title) {
            Debug.assert(Jx.isNonEmptyString(value.title), "This command doesn't have a title, so the values must");
            this._titleElement.innerText = value.title;
            
            if (this._jobSet) {
                this._jobSet.addUIJob(this, this._updateTooltip, null, P.Priority.accessibility);
            }
        }

        this._element.setAttribute("aria-label", this._getTitle() + " " + displayValue);
    };

    DisambiguatedCommandButton.prototype._updateTooltip = function () {
        /// <summary>Checks if the button needs a tooltip. If yes, set it.</summary>
        Debug.assert(Jx.isHTMLElement(this._titleElement));
        Debug.assert(Jx.isHTMLElement(this._element));
        var titleNode = this._titleElement;
        if (titleNode.scrollWidth > titleNode.clientWidth) {
            this._element.title = titleNode.innerText;
        } else {
            this._element.title = "";            
        }
    };

    DisambiguatedCommandButton.prototype._getDisplayValue = function () {
        /// <summary>Returns the display value for the second line on the button</summary>
        /// <returns type="String"/>
        if (this._value) {
            var short = this._value.shortDisplay;
            var normal = this._value.display;

            return (short || normal);
        } else {
            return "";
        }
    };

    DisambiguatedCommandButton.prototype._hideShow = function () {
        /// <summary>Shows or hides this button or the disambiguator based on the availability of values</summary>
        if (!this._value) {
            this._element.style.display = "none";
        } else {
            this._element.style.display = "";

            if (this._alternatives.length <= 1) {
                this._disambiguatorElement.style.display = "none";
            } else {
                this._disambiguatorElement.style.display = "";
            }
        }
    };

    DisambiguatedCommandButton.prototype._onClick = function () {
        /// <summary>Event handler for clicks on the button</summary>
        var value = this._value,
            data = value.data;
        if (/*@static_cast(Boolean)*/this._settingsKey && /*@static_cast(Boolean)*/this._settingsContainer) {
            this._settingsContainer.set(this._settingsKey, data);
        }
        var url = value.getUrl ? value.getUrl(data) : data;
        People.Nav.navigate(url);

        if (Jx.isDefined(value.bici)) {
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            Jx.bici.addToStream(InstruID.People.socialReactionUpdated, "", P.Bici.landingPage, 0, value.bici);
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
        }
    };

    DisambiguatedCommandButton.prototype._onDisambiguate = function (/*@dynamic*/ev) {
        /// <summary>Event handler for clicks on the disambiguator</summary>
        var menu = new Windows.UI.Popups.PopupMenu();

        this._alternatives.forEach(/*@bind(DisambiguatedCommandButton)*/function (/*@type(DisambiguatedCommandValue)*/value) {
            var menuItem = new Windows.UI.Popups.UICommand(
                value.display,
                this._onDisambiguationSelected.bind(this, value)
            );
            try {
                menu.commands.append(menuItem);
            } catch (ex) {
                // Adding the 7th item to a popup throws.  Ignore it and show the truncated menu.
            }
            NoShip.People.etw("landingPageOption", { uri: value.getUrl ? value.getUrl(value.data) : value.data });
        }, this);

        Jx.addClass(this._element, "contactCommand-menuOpen");

        var clientBounds = this._disambiguatorElement.getBoundingClientRect();

        try {
            menu.showForSelectionAsync({
                x: clientBounds.left,
                y: clientBounds.top,
                width: clientBounds.width,
                height: clientBounds.height
            }, Windows.UI.Popups.Placement.below).done(this._onMenuClosed.bind(this), Jx.fnEmpty);
        } catch (ex) { // The WinRT popup menu isn't the most reliable API ...
            Jx.log.exception("Failed to show menu", ex);
        }

        ev.stopPropagation();
    };

    DisambiguatedCommandButton.prototype._onMenuClosed = function () {
        Jx.removeClass(this._element, "contactCommand-menuOpen");
    };

    DisambiguatedCommandButton.prototype._onDisambiguationSelected = function (value) {
        /// <summary>Called when an item is picked from the disambiguation menu</summary>
        /// <param name="value" type="DisambiguatedCommandValue"/>
        this._value = value;
        this._updateUI();
        this._onClick();
    };

    DisambiguatedCommandButton.prototype._onKeydown = function (ev) {
        /// <summary>Keydown event handler</summary>
        /// <param name="fn" type="Function">Click handler for this element</param>
        /// <param name="ev" type="Event"/> 
        if (ev.key === "Spacebar" || ev.key === "Enter") {
            if (this._disambiguatorElement.style.display !== "none") {
                this._disambiguatorElement.click();
            } else {
                this._onClick();
            }
        }
    };

});
