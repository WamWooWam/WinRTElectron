
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,Jx,Debug,document,Windows,MenuArrowKeyHandler*/
/*jshint browser:true*/
Jx.delayDefine(window, "FontSelector", function () {
    "use strict";
    window.FontSelector = {};

    var fontSelector = window.FontSelector;

    fontSelector.BaseFontControl = function /* Constructor */(config) {
        // InitComponent provided by Jx.Component is called
        this.initComponent();

        // See _getElement for the use of this._host
        this._host = null;

        // All variables given before the _parseConfig happens may be changed by the config.
        // All variables after the _parseConfig may not be modified by the config.
        // If a control specific variable needs to be added, put it before/after the call
        // to this constructor in the constructor of the control.
       
        this._parseConfig(config);

        // Internal value array to check for duplicates when adding more
        // This is given after the parseConfig in order to prevent
        // any config option overriding it
        this._values = [];

        // Define all of the events that will be raised to jx by this
        Debug.Events.define(this, "change");
    };

    Jx.augment(fontSelector.BaseFontControl, Jx.Component);
    Jx.augment(fontSelector.BaseFontControl, Jx.Events);

    var baseControlProto = fontSelector.BaseFontControl.prototype;

    baseControlProto.addSelection = function (selection) {
        /// <summary> Add an object to the available selections. See each implementation of _addElement for what is expected </summary>
        this._addElement(selection);
    };

    baseControlProto.focus = function () {
        this._getElement().focus();
    };

    baseControlProto._addElement = function () {
        Debug.assert(false, "Add Element needs to be overridden");
    };

    baseControlProto._createElement = function () {
        Debug.assert(false, "Create Element needs to be overridden");
    };

    baseControlProto._parseConfig = function (config) {
        /// <summary> 
        /// Parses the config parameter passed in. 
        /// Each element will be checked for a special _config_[key] function
        /// before setting the private variable. Note that variables
        /// must be declared before they are parsed, to prevent
        /// random information being tacked on to these controls.
        /// The _config_[key] allows special handling for the value
        /// rather than just taking it directly from the config passed in.
        /// </summary>
        if (config) {
            for (var key in config) {
                var selfKey = "_" + key,
                    methodKey = "_config_" + key;
                if ((methodKey in this) && Jx.isFunction(this[methodKey])) {
                    // If there is a _config_ method associated with the key, then call it with the value as the parameter
                    this[methodKey](config[key]);
                } else if (this.hasOwnProperty(selfKey)) {
                    // If the value already exists then we can set the value directly
                    this[selfKey] = config[key];
                }
            }
        }
    };

    baseControlProto._select = function (selectItem) {
        var element = this._getElement();
        Debug.assert(element.nodeName === "SELECT");
        element.value = selectItem;
    };

    baseControlProto._validValue = function (value) {
        /// <summary> Checks if the value exists in the internal array </summary>
        /// <returns> True if it's a valid value for selection </returns>
        return this._values.indexOf(value) !== -1;
    };

    baseControlProto._getElement = function () {
        /// <summary> Returns the DOM element for this control using the id and class </summary>
        Debug.assert(Jx.isNonEmptyString(this._id));
        var ele;
        
        // The host is needed for the settings flyout. The flyout itself is a Jx wrapped flyout, and cannot have
        // anything added to onbeforeshow or onafterhide. That means that the UI has to be initiated before it is 
        // added to the DOM. The host allows a query to be made for the control without it being in the DOM.
        if (this._host) {
            // If a host was given, then use the querySelector
            // to get the element within that host. It's important to note
            // that it is assumed only one of this control is present inside the host
            ele = this._host.querySelector(this._selector);
        } else {
            // If no host was given, get the element by the id in case 
            // multiple instances of the control are present
            ele = document.getElementById(this._id);
        }
        Debug.assert(Jx.isObject(ele), "Element with id " + this._id + " could not be found");
        return ele;
    };

    baseControlProto._onChange = function (evt) {
        /// <summary> Should be triggered when the <select> is changed. Raises an event through this.raiseEvent and sets the private _value to the value of <select> </summary>
        var element = this._getElement();
        // Update the internal tracking for value
        this._value = element.value;
        evt.value = this._value;
        // Notify the listeners that the element has changed
        this.raiseEvent("change", evt);
    };

    baseControlProto.activateUI = function () {
        Jx.Component.prototype.activateUI.call(this);

        var element = this._getElement();

        // Only <select> objects should be using the default activateUI (i.e the FontNameControl and FontSizeControl)
        Debug.assert(element.nodeName === "SELECT", "Element is not a select object");

        element.addEventListener("change", this._onChange, false);

        // If a value was set before the UI was made, make sure to select it on activation
        if (this._value) {
            this._select(this._value);
        }
    };

    baseControlProto.deactivateUI = function () {
        Jx.Component.prototype.deactivateUI.call(this);

        var element = this._getElement();
        element.removeEventListener("change", this._onChange, false);
    };

    fontSelector.NameControl = function /* Constructor */(config) {
        /* Whether or not to create a new, temporary option if the option is not valid */
        this._newOnFail = false;
        /* Config the size for the select */
        this._size = null;
        fontSelector.BaseFontControl.call(this, config);
        // The selector to get this control if a host is specified
        this._selector = ".fontNameControl";
        this._onChange = this._onChange.bind(this);

        this._tmpOptions = [];
    };

    Jx.inherit(fontSelector.NameControl, fontSelector.BaseFontControl);

    var nameProto = fontSelector.NameControl.prototype;

    nameProto._addElement = function (selection, checkUI) {
        /// <summary>
        /// Will add a new font to the selection, if it's not already present
        /// </summary>
        /// <parameter name="selection" type="String">Name of the font family to add </parameter>
        /// <parameter name="checkUI" type="Boolean">Whether to call this.hasUI() </parameter>

        Debug.assert(Jx.isNonEmptyString(selection));

        // default checkUI to true
        checkUI = !Jx.isBoolean(checkUI) || checkUI;

        // Keep duplicate items out of the list by making sure the selection is not a valid value
        if (!this._validValue(selection)) {
            this._values.push(selection);

            // We can't add to the UI if it's not there.
            // However, the value will be added at the end 
            // of the generated UI 
            if (checkUI && this.hasUI()) {
                var option = document.createElement("option"),
                    element = this._getElement();

                Debug.assert(element.nodeName === "SELECT");

                option.value = selection;
                option.innerText = selection;
                option.style.fontFamily = selection;
                element.appendChild(option);
            }
        }
        
    };

    nameProto.clear = function () {
        /// <summary> Clears all the temporary values that have been added to the control </summary>
        var element = this._getElement(),
            tempValues = element.querySelectorAll("[data-temporary=true]");
        for (var i = tempValues.length; i--;) {
            element.removeChild(tempValues[i]);
        }

        this._tmpOptions = [];
    };

    nameProto.getUI = function (ui) {
        var fonts = this._getFontNameList(),
            duplicateList = {},
            font,
            options = "",
            innerText;

        // Reset the values to be rebuilt with unique values, since we are filtering anyways.
        // Make sure to do this after this._getFontNameList(), since getFontNameList uses
        // this._values
        this._values = [];

        for (var i = 0; i < fonts.length; i++) {
            font = fonts[i];

            if (!duplicateList[font]) {
                // replace double quotes with single quotes for the value and style, to keep the html valid
                // use escapeHtml on the innerText
                
                // InnerText should only be used for now. toStaticHTML will escape brackets inside the attributes.
                // Brackets inside attributes should be allowed, but since it's not we have to work arround it. 
                innerText = Jx.escapeHtml(font);
                
                options += '<option value="' + innerText + '" style="font-family: ' + innerText + ';">' + innerText + '</option>';
                duplicateList[font] = true;

                // add to our value list
                this._values.push(font);
            }
        }

        var size = "";
        if (Boolean(this._size)) {
            size = " size='" + this._size + "' ";
        }

        ui.html = '<select id="' + this._id + '" class="fontNameControl" aria-label="' + Jx.res.getString("fontSelectorNameLabel") + '" aria-role="combobox" ' + size + '>' + options + '</select>';
    };

    nameProto._validValue = function (value) {
        /// <summary> Overrides the default valid value in order to check tmpValues</summary>
        return this._tmpOptions.indexOf(value) !== -1 || this._values.indexOf(value) !== -1;
    };

    nameProto._getFontNameList = function () {
        /// <summary>Generates a raw list of font families.  NOTE: May include duplicates.</summary>
        /// <returns type="Array">An array of ordered font families, potentially containing repeats.</returns>

        Jx.mark("getFontFamilies, StartTA, FontSelector");
        var languages = /*@static_cast(Array)*/Windows.System.UserProfile.GlobalizationPreferences.languages,
            latinScriptFound = false,
            language,
            script,
            fonts,
            fontFamilies = [];
        // Run through all the current user languages

        var _regexPloc = /((ploc)|(locr))-/i;

        for (var m = 0, len = languages.length; m < len; m++) {
            language = languages[m].replace(_regexPloc, "");
            // If we haven't found a latin script yet
            if (!latinScriptFound) {
                // Determine if this is a lating script, and if so mark that one was found
                script = Windows.Globalization.Language(language).script.toLowerCase();
                if (script === "latn" || script === "latin") {
                    latinScriptFound = true;
                }
            }

            // Get the recommended fonts for this langauge
            fonts = new Windows.Globalization.Fonts.LanguageFontGroup(language);
            // Append the 3 authoring style ones
            // Note: We are not gauranteed that all of these fonts have been defined, so we need to check each before adding.
            if (fonts.traditionalDocumentFont) {
                fontFamilies.push(fonts.traditionalDocumentFont.fontFamily);
            }
            if (fonts.modernDocumentFont) {
                fontFamilies.push(fonts.modernDocumentFont.fontFamily);
            }
            if (fonts.fixedWidthTextFont) {
                fontFamilies.push(fonts.fixedWidthTextFont.fontFamily);
            }
            if (fonts.documentAlternate1Font) {
                fontFamilies.push(fonts.documentAlternate1Font.fontFamily);
            }
            if (fonts.documentAlternate2Font) {
                fontFamilies.push(fonts.documentAlternate2Font.fontFamily);
            }
        }

        // If a latin script was found, append the web safe fonts
        if (latinScriptFound) {
            fontFamilies = fontFamilies.concat(["Arial", "Times New Roman", "Tahoma", "Verdana", "Georgia"]);
        }
        Debug.assert(fontFamilies.length > 0, "No fonts were found for the user's languages");
        Jx.mark("getFontFamilies, StopTA, FontSelector");

        // Append our pre-existing values to the list. It's known that the list may contain duplicates,
        // which are filtered in the getUI method
        fontFamilies = fontFamilies.concat(this._values);
        fontFamilies.sort();
        this._values = fontFamilies;

        // replace the prototype function so we don't generate the list again.
        // It's not likely that the list will change while mail is running
        nameProto._getFontNameList = function () {
            return fontFamilies;
        };

        return this._values;
    };

    nameProto._config_fonts = function (fonts) {
        /// <summary>
        /// This method will alow the fonts to be provided instead of loaded from the system.
        /// It uses the addElement method to add the fonts to the internal list of values
        /// and also to check validity. It doesn't check if the font exists on the system,
        /// but will get rid of duplicates.
        /// </summary>
        Debug.assert(Jx.isArray(fonts));
        this._getFontNameList = function () {
            for (var i = 0; i < fonts.length; i++) {
                // Use our own addElement, and tell it not to check for the UI
                this._addElement(fonts[i], false);
            }
            // The values will be loaded with the fonts, so return that
            return this._values;
        };
    };

    Object.defineProperty(nameProto, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            // Check that the value exists in our internal list of values
            if (!this._validValue(value)) {
                if (!this._newOnFail || Jx.isNullOrUndefined(value)) {
                    // clear out the value if we don't know what it is
                    value = null;
                } else {
                    // Create a new option and stick it in our temporary tracked list
                    var option = document.createElement("option"),
                        element = this._getElement();

                    Debug.assert(element.nodeName === "SELECT");

                    option.value = value;
                    option.innerText = value;
                    option.setAttribute("data-temporary", "true");
                    option.style.fontFamily = value;
                    element.appendChild(option);

                    this._tmpOptions.push(value);
                }
            }
            
            this._value = value;

            // If the UI is available, select the value
            if (this.hasUI()) {
                this._select(value);
            }
        },
        enumerable: true
    });

    fontSelector.SizeControl = function /* Constructor */(config) {
        // Size for the select tag
        this._size = null;
        fontSelector.BaseFontControl.call(this, config);
        this._selector = ".fontSizeControl";
        this._onChange = this._onChange.bind(this);
    };

    Jx.inherit(fontSelector.SizeControl, fontSelector.BaseFontControl);
    
    var sizeProto = fontSelector.SizeControl.prototype;

    sizeProto.getUI = function (ui) {
        var sizes = this._getFontSizes(),
            option = "",
            size;

        // List fonts from largest to smallest
        for (var i = sizes.length; i--;) {
            size = sizes[i];
            option += '<option value="' + size + 'pt">' + size + '</option>';
        }
        var sizeAttr = "";
        if (Boolean(this._size)) {
            sizeAttr = " size='" + this._size + "' ";
        }
        ui.html = '<select class="fontSizeControl" id="' + this._id + '" aria-label="' + Jx.res.getString("fontSelectorSizeLabel") + '" aria-role="combobox" ' + sizeAttr + '>' + option + '</select>';
        
        return ui;
    };

    sizeProto._addElement = function (size, checkUI) {
        /// <summary>
        /// Add the size to the internal list, and if applicable,
        /// to the UI. It is not added if it's a duplicate
        /// </summary>
        /// <parameter name="size" type="Number">The font size to add</parameter>
        /// <parameter name="checkUI" type="Boolean">Whether to call this.hasUI() when attempting to add. If false, it's assumed the UI hasn't been made yet </parameter>
        Debug.assert(Jx.isNumber(size), "add element for the size control expects a size to be a number");

        // Set the default for checkUI to true
        checkUI = !Jx.isBoolean(checkUI) || checkUI;

        // Check the value is not present by checking if it's a valid value for selection
        if (!this._validValue(size)) {
            this._values.push(size);

            if (checkUI && this.hasUI()) {
                var element = this._getElement(),
                    option = document.createElement("option");

                Debug.assert(element.nodeName === "SELECT");
                option.value = size + "pt";
                option.innerText = size;
                element.appendChild(option);
            }
        }
    };

    sizeProto._getFontSizes = function () {
        var values = [36, 24, 18, 14, 13, 12, 11, 10, 8];
        for (var i = values.length; i--;) {
            // Use our own addElement, and tell it not to check for the UI
            this._addElement(values[i], false);
        }
        return this._values;
    };

    sizeProto._config_sizes = function (values) {
        /// <summary> 
        /// Allows a set of values to be passed in to use instead of the defaults.
        /// These values must be an array of numbers. 
        /// <summary>
        Debug.assert(Jx.isArray(values), "Size values must be an array");
        this._getFontSizes = function () {
            for (var i = 0; i < values.length; i++) {
                // Use our own addElement, and tell it not to check for the UI
                this._addElement(values[i],false);
            }

            // The valid values are added to the internal array, so return that
            return this._values;
        };
    };

    // Override the parent value property in order to add logic that makes 
    // sure we can accept a number or a #pt as a value for set,
    // and always return a #pt on get
    Object.defineProperty(sizeProto, "value", {
        get: function () {
            // Only add a pt if the internal value is a number
            return (Jx.isNumber(this._value)) ? this._value + "pt" : this._value;
        },
        set: function (value) {
            var size = null;

            // Put the size as a number, whether it was passed in as a #pt, #px, or a number
            // ignore undefined, null, and values that aren't a number or #pt
            if (Jx.isNullOrUndefined(value) || Jx.isNumber(value)) {
                size = value;
            } else if(/^[0-9]+(\.[0-9]+)?pt$/.test(value)){
                // For typesafety convert this to a number. Also makes sure that the
                // values in the array will match against this size
                size = Number(value.replace("pt", ""));
            } else if (/^[0-9]+(\.[0-9]+)?px$/.test(value)) {
                // Ratio of px to pt is 3/4 in 96dpi
                size = Math.round(Number(value.replace("px", "")) * 0.75);
            } else {
                return;
            }

            // Check that the value exists in our internal list of values if not clear the value
            if (!this._validValue(size)) {
                size = null;
            }
            this._value = size;

            // If the UI is available, select the value
            if (this.hasUI()) {
                // Add the pt to the end of the size because it will be checked as the value of the select
                // as well as handed directly as the value from the event. 
                this._select(Jx.isNullOrUndefined(size) ? null : (size+"pt"));
            }
        },
        enumerable: true
    });

    fontSelector.ColorControl = function /* Constructor */(config) {
        // Default the arrow key handler to be created. This is useful to turn off for UTs
        this._menuArrowKeyHandler = true;
        // Optional config to pass into the menu arrow key handler
        this._itemsTabbable = true;
        // Default label for narrator to read
        this._label = Jx.res.getString("fontSelectorColorLabel");

        fontSelector.BaseFontControl.call(this, config);
        this._selector = ".fontColorControl";
        this._onClick = this._onClick.bind(this);
        this._selectedButton = null;
        this._onMutation = this._onMutation.bind(this);
        this._observer = null;
        Debug.assert(Jx.isFunction(this._getColors), "Colors must be provided in the config, there are no default colors for this control");
    };

    Jx.inherit(fontSelector.ColorControl, fontSelector.BaseFontControl);
    
    var colorProto = fontSelector.ColorControl.prototype;
    
    colorProto.activateUI = function () {
        var element = this._getElement();

        // Must happen before the activateUI of Component in order to activateUI of the control
        if (this._menuArrowKeyHandler) {
            // The MenuArrowKeyHandler is a Jx.Component, so append it as a child so it
            // activates and deactivates correctly
            var config = { querySelector: "[role='menuitemradio']",
                           itemsTabbable: this._itemsTabbable };
            var makh = new MenuArrowKeyHandler(element, config);
            this.appendChild(makh);
        }


        Jx.Component.prototype.activateUI.call(this);

        // Register for onclick so that when a button is selected
        // we can handle it properly
        element.addEventListener("click", this._onClick, false);

        if (this._value) {
            this._select(this._value);
        }

        this._observer = new MutationObserver(this._onMutation);

        this._observer.observe(element, {
            attributes: true,
            subtree: true,
            attributeFilter: ["aria-checked"]
        });
    };

    colorProto.deactivateUI = function () {
        Jx.Component.prototype.deactivateUI.call(this);

        var element = this._getElement();
        Debug.assert(element.nodeName === "DIV");
        element.removeEventListener("click", this._onClick, false);
        this._observer.disconnect();
        this._observer = null;
    };

    colorProto._onClick = function (evt) {
        var target = evt.target;

        // no point in running through all of the select code if a button wasn't selected
        if (target.nodeName === "BUTTON") {
            if (Jx.isObject(this._selectedButton) && target !== this._selectedButton ) {
                this._selectedButton.setAttribute("aria-checked", "false");
            }
            target.setAttribute("aria-checked", "true");
        }
    };

    colorProto._onMutation = function (records) {
        /// <summary>
        /// Sets this value as the selected buttons
        /// color, and keeps track of what button is selected.
        /// If a selectedButton is repeated, we just ignore
        /// the attempted select.
        /// <summary>

        // If there was only one record this means the radio was toggled and we want to treat that as a no-op but keep the selection.
        if (records.length === 1) {
            records[0].target.setAttribute("aria-checked", "true");
            if (!this._selectedButton) {
                this._selectedButton = records[0].target;
                this._value = this._selectedButton.value;
                this.raiseEvent("change", { value: this._value });
            }
            this._observer.takeRecords();
            return;
        }

        for (var i = records.length; i--;) {
            var record = records[i];

            if (record.target.getAttribute("aria-checked") === "true") {
                this._selectedButton = record.target;
                this._value = this._selectedButton.value;
                this.raiseEvent("change", { value: this._value });
            }
        }
    };

    colorProto.getUI = function (ui) {
        /// <summary>
        /// This sets up a div with buttons inside the div. If the gridLayout was specified, it 
        /// inlines the css in order to achieve the grid layout. 
        /// </summary>
        var colors = this._getColors(),
            rows = -1,
            columns = -1,
            color,
            btns = "",
            style = "",
            gridLayoutString;

        if (this._gridLayout && this._rows && this._columns) {
            // If the gridlayout is specified, then the this._rows should be valid css for -ms-grid-rows
            // Same is true for this._columns and -ms-grid-columns
            style = "-ms-grid-rows: " + this._rows + "; -ms-grid-columns: " + this._columns + "; display: -ms-grid;";
            // Trim the strings in order to avoid extra rows/columns
            rows = this._rows.trim().split(" ").length;
            columns = this._columns.trim().split(" ").length;
        }

        var row = 1,
            col = 1,
            colorName = "",
            colorValue = "";

        for (var i = 1; i <= colors.length; i++) {
            color = colors[i - 1];
            gridLayoutString = "";
            if (this._gridLayout && (rows > 0) && (columns > 0)) {
                gridLayoutString += '-ms-grid-row: ' + row + '; -ms-grid-column: ' + col++ + ';';
                if (col > columns) {
                    row++;
                    col = 1;
                }
            }
            
            var whiteButton = '';

            colorName = color.name;
            colorValue = color.value.toUpperCase();

            if (colorValue === '#FFFFFF') {
                whiteButton = '<div class="whiteButton"></div>';
            }

            // The id is needed for the MenuArrowKeyHandler, since it uses id to map objects
            btns += '<button role="menuitemradio" id="' + this._id + i + '" ' +
                'style="background-color: ' + colorValue + ';' + gridLayoutString + '" title="' + colorName + '" ' +
                'aria-label="' + colorName + '" unselectable="on" class="fontColorButton' + i + ' fontColorButton" value="' + colorValue + '">' + whiteButton + '</button>';

            // Add the color to the stored values, but not the aria
            this._values.push(colorValue);
        }

        ui.html = '<div unselectable="on" class="fontColorControl" role="menu" id="' + this._id +
            '" style="' + style + '" tabindex="0" aria-label="' + this._label + '">' + btns + '</div>';
    };
    
    colorProto._addElement = function () {
        /// <summary>
        /// The reason we can't add to the color picker is the layout issues. Plus, it's probably not necessary to expand it.
        /// A wise man once taught me the meaning of YAGNI (You Ain't Gonna Need It), and it applies here
        /// </summary>
        Debug.assert(false, "Can't add to the color picker");
    };

    colorProto._select = function (color) {
        /// <summary>
        /// Goes through all of the buttons and checks their background color
        /// to match with the color passed in, and sets it as the selected button.
        /// The color passed in is assumed to be valid, since all calls to _select
        /// utilizes the _value and therefor should have been checked by _isValidValue
        /// <summary>
        var element = this._getElement();
        Debug.assert(element.nodeName === "DIV");

        var btns = element.childNodes;
        
        // didn't use isValidValue here just because we have to find the button
        // for it anyways. Most likely the color is valid and isValidValue
        // will cause it to loop through that array and then the childNodes here 
        // as well. It's easier and faster to just go ahead and assume it's in 
        // the colors (barring a lot of invalid checks))
        this._selectedButton = null;
        for (var i = 0; i < btns.length; i++) {
            var btn = btns[i];
            if (btn.value === color) {
                this._selectedButton = btn;
                this._value = this._selectedButton.value;
            }
            btn.setAttribute("aria-checked", btn.value === color ? "true" : "false");
        }
        this._observer.takeRecords();

        // There should always be a button selected, since the call for this checks
        // our internal values first.
        Debug.assert(Jx.isNullOrUndefined(color) || element.querySelector("[aria-checked='true']"), "No Button was selected.");
    };

    // Define the value of the object so we can accept hex and rgb values in the set method
    Object.defineProperty(colorProto, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            /// Intercepts a value being checked in order to parse RGB values and turn them into hex strings that we store in our values array
            if (/rgb\(.*\)/i.test(value)) {
                // Remove the rgb, (), and spaces and split the numbers up
                var values = value.replace(/[\srgb\(\)]/gi, "").split(",");
                Debug.assert(values.length === 3);
                var r = this._mapToHex(values[0]);
                var g = this._mapToHex(values[1]);
                var b = this._mapToHex(values[2]);
                value = ("#" + r + g + b).toUpperCase();
                Debug.assert(/#[0-9abcdef]{6}/i.test(value));
            }

            // Check that the value exists in our internal list of values if not clear the value
            if (!this._validValue(value)) {
                value = null;
            }

            this._value = value;

            // If the UI is available, select the value
            if (this.hasUI()) {
                this._select(value);
            }
        },
        enumerable: true
    });

    colorProto._mapToHex = function (str) {
        ///<summary> Used to map a string base 10 number to hex</summary>
        var n = Number(str).toString(16).toUpperCase();

        if (n.length === 1) {
            n = "0" + n;
        }

        return n;
    };
    
    colorProto._config_colors = function (colors) {
        /// <summary> 
        /// Replaces the default colors with the ones provided. 
        /// This array can have just a list of valid
        Debug.assert(Jx.isArray(colors), "colors must be an array");
        this._getColors = function () {
            // Example colors array
            // colors: [{ value: "#2A2A2A", name: "black" },
            // { value: "#4BA524", name: "green" },
            // { value: "#006FC9", name: "blue" },
            // { value: "#7232AD", name: "purple" },
            // { value: "#BD1398", name: "pink" },
            // { value: "#757B80", name: "grey" },
            // { value: "#D03A3A", name: "red" },
            // { value: "#D05C12", name: "orange" },
            // { value: "#E2C501", name: "yellow" }],
            
            
            var color;
            // In debug builds we want to check the validity of the data. However, it's faster to assume it's okay in FRE builds
            for (var i = 0; i < colors.length; i++) {
                color = colors[i];
                Debug.assert(Jx.isNonEmptyString(color.value), "Colors passed in must each have a value, such as value: '#FFFFFF'");
                Debug.assert(/#[0-9abcdef]{3,6}/i.test(color.value), "Colors must be a hex value");
                Debug.assert(Jx.isNonEmptyString(color.name), "Aria must be a non-empty string");
            }
            

            return colors;
        };
    };

    colorProto._config_gridLayout = function (gridLayout) {
        /// <summary> 
        /// Configures the grid layout. The gridLayout should have
        /// rows and columns such that rows is valid css to be put in -ms-grid-rows
        /// and columns is valid css to be put in -ms-grid-columns
        /// </summary>
        this._gridLayout = Jx.isObject(gridLayout);
        if (this._gridLayout) {
            Debug.assert(Jx.isNonEmptyString(gridLayout.rows), "box layout must provide a rows string");
            Debug.assert(Jx.isNonEmptyString(gridLayout.columns), "box layout must provide a columns string");
            this._rows = gridLayout.rows;
            this._columns = gridLayout.columns;
        }
    };
});
