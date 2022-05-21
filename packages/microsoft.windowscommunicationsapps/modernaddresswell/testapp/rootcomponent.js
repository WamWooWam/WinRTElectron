
window.RootComponent = function () {
    /// <summary>
    /// Constructor for a root component that is the parent of multiple AddressWell components.
    /// </summary>

    // Please see AddressWell.Controller constructor for more information regarding these parameters.


    // NOTE: Upon constructing the Root Component, by default contacts platform is set to null so that we are not relying on data from it initially.

    // To Line
    this._toLine = new AddressWell.Controller("to" /* idPrefix */,
                                                null /* recipients */,
                                                null /* contactsPlatform */,
                                                true /* showSuggestions */,
                                                "<b>Hint text with HTML that should be escaped</b>" /* hintText */,
                                                false /* hidePeoplePicker */);
    // WinLive 426438 - The value is being hardcode to true in M2, but our test app will show tile view
    this._toLine._hideTileView = false;
    this._toLine.setContextualAccount({});

    // CC Line
    this._ccLine = new AddressWell.Controller("cc" /* idPrefix */,
                                                null /* recipients */,
                                                null /* contactsPlatform */,
                                                true/* showSuggestions */,
                                                "Plain hint text" /* hintText */,
                                                false /* hidePeoplePicker */);
    // WinLive 426438 - The value is being hardcode to true in M2, but our test app will show tile view
    this._ccLine._hideTileView = false;
    this._ccLine.setContextualAccount({});

    // BCC Line 
    this._bccLine = new AddressWell.Controller("bcc" /* idPrefix */,
                                                null /* recipients */,
                                                null /* contactsPlatform */,
                                                true /* showSuggestions */,
                                                "This should never show up" /* hintText */,
                                                false /* hidePeoplePicker */);
    // WinLive 426438 - The value is being hardcode to true in M2, but our test app will show tile view
    this._bccLine._hideTileView = false;
    this._bccLine.setContextualAccount({});

    this._disabledLine = new AddressWell.Controller("disabled" /* idPrefix */,
                                                    null /* recipients */,
                                                    null /* contactsPlatform */,
                                                    false /* showSuggestions */,
                                                    "" /* hintText */,
                                                    true /* hidePeoplePicker */);

    this._disabledLine.setDisabled(true);
    this._disabledLine.setContextualAccount({});

    this.initComponent();
    this._id = "root";
    // Build the component tree.
    this.append(this._toLine, this._ccLine, this._bccLine, this._disabledLine);
};

Jx.augment(RootComponent, Jx.Component);

// Local variables
RootComponent.prototype._platform = /* @static_cast(Microsoft.WindowsLive.Platform) */null; // Contacts platform's object
RootComponent.prototype._toLine = /* @static_cast(AddressWell.Controller) */null;
RootComponent.prototype._ccLine = /* @static_cast(AddressWell.Controller) */null;
RootComponent.prototype._bccLine = /* @static_cast(AddressWell.Controller) */null;

RootComponent.prototype._mockDataStaticButtonId = "mockDataStatic";
RootComponent.prototype._mockDataStaticButtonElement = null;
RootComponent.prototype._mockDataStaticButtonClick = /* @static_cast(Function) */null;
RootComponent.prototype._realDataButtonId = "realData";
RootComponent.prototype._realDataButtonElement = null;
RootComponent.prototype._readDataButtonClick = /* @static_cast(Function) */null;

RootComponent.prototype._appColorId = "appColor";
RootComponent.prototype._appColorSelectElement = null;
RootComponent.prototype._appColorSelectChange = /* @static_cast(Function) */null;
RootComponent.prototype._dynamicColorId = "dynamicColorButton";
RootComponent.prototype._dynamicColorButton = null;
RootComponent.prototype._dynamicColorChange = null;
RootComponent.prototype._toCheckErrorButtonId = "toCheck";
RootComponent.prototype._toCheckErrorButtonElement = null;
RootComponent.prototype._toCheckErrorButtonClick = /* @static_cast(Function) */null;
RootComponent.prototype._ccCheckErrorButtonId = "ccCheck";
RootComponent.prototype._ccCheckErrorButtonElement = null;
RootComponent.prototype._ccCheckErrorButtonClick = /* @static_cast(Function) */null;
RootComponent.prototype._bccCheckErrorButtonId = "bccCheck";
RootComponent.prototype._bccCheckErrorButtonElement = null;
RootComponent.prototype._bccCheckErrorButtonClick = /* @static_cast(Function) */null;
RootComponent.prototype._toClearButtonId = "toClear";
RootComponent.prototype._toClearButtonElement = null;
RootComponent.prototype._toClearButtonClick = /* @static_cast(Function) */null;
RootComponent.prototype._ccClearButtonId = "ccClear";
RootComponent.prototype._ccClearButtonElement = null;
RootComponent.prototype._ccClearButtonClick = /* @static_cast(Function) */null;
RootComponent.prototype._bccClearButtonId = "bccClear";
RootComponent.prototype._bccClearButtonElement = null;
RootComponent.prototype._bccClearButtonClick = /* @static_cast(Function) */null;
RootComponent.prototype._disabledLine = null;
RootComponent.prototype._disabledAddRecipientsButtonId = "disabledAdd";
RootComponent.prototype._renderDropDownProgressButtonId = "renderDropDownProgress";
RootComponent.prototype._renderDropDownProgressButtonElement = null;
RootComponent.prototype._renderDropDownProgressButtonClick = /* @static_cast(Function) */null;
RootComponent.prototype._renderDropDownTextButtonId = "renderDropDownText";
RootComponent.prototype._renderDropDownTextButtonElement = null;
RootComponent.prototype._renderDropDownTextButtonClick = /* @static_cast(Function) */null;
RootComponent.prototype._hideTileButtonId = "hideTile";
RootComponent.prototype._hideTileButtonElement = null;
RootComponent.prototype._hideTileButtonClick = /* @static_cast(Function) */null;
RootComponent.prototype._disableWellButtonId = "disableWell";
RootComponent.prototype._disableWellButtonElement = null;
RootComponent.prototype._disableWellButtonClick = /* @static_cast(Function) */null;
RootComponent.prototype._tileNumberId = "tiles";
RootComponent.prototype._tileNumberElement = null;
RootComponent.prototype._tileNumberChange = /* @static_cast(Function) */null;
RootComponent.prototype._isEmptyId = "isEmpty";

RootComponent.prototype.getUI = function (ui) {
    /// <summary>
    /// Constructs the UI object with HTML for this component.
    /// </summary>
    /// <param name="ui" type="JxUI">The UI object to set properties on.</param>

    ui.html = '<h1>Address Well Test App</h1>' +
                '<fieldset>' +
                    '<legend>Contacts Platform Configurations</legend>' +
                    '<div id="dataInfo">Static data - No contacts platform integration</div>' +
                    '<div>' +
                        '<div><input type="button" id="' + this._mockDataStaticButtonId + '" value="Static Data" /> - No contacts platform integration</div>' +
                        '<div><input type="button" id="' + this._realDataButtonId + '" value="Real Data" /> - Requires setting up the real contacts platform on the system.  Please follow instructions on "Run Address Well and Sharing Test Apps" in Cookbook. </div>' +
                    '</div>' +
                '</fieldset><br />' +
                '<fieldset>' +
                    '<legend>Address Well Control Configurations</legend>' +
                    '<div><label>App color selection: </label>' +
                        '<select id="' + this._appColorId + '" aria-label="App color selection">' +
                            '<option>Calendar</option>' +
                            '<option selected>Mail</option>' +
                            '<option>People</option>' +
                        '</select>' +
                    '</div>' +
                    '<div>' +
                        '<button type="button" id="' + this._dynamicColorId + '">Set dynamic color</button> ' +
                        '<label>Color: </label>' +
                        '<input type="text" id="dynamicColorBox" value="#AF0CF0" aria-label="Dynamic color value" />' +
                        '<span style="color:red;display:none" id="dynamicColorError">Unrecognized color, please use hex format: #AF0CF0</span>' +
                    '</div>' +
                    '<div>Render dropdown progress: <input type="button" id="' + this._renderDropDownProgressButtonId + '" value="Show Progress" /></div>' +
                    '<div>Render dropdown text: <input type="button" id="' + this._renderDropDownTextButtonId + '" value="Show Text" /></div>' +
                    '<div>Hide or Unhide the tile view: <input type="button" id="' + this._hideTileButtonId + '" value="Hide" /></div>' +
                    '<div>Disable or Enable well: <input type="button" id="' + this._disableWellButtonId + '" value="Disable" /></div>' +
                    '<div>Number of data that got return from relevant data query, which dictates the maximum number of tiles that can potentially get replaced upon each tile view refresh: <input type="text" id="' + this._tileNumberId + '" value="-1" aria-label="Maximum Tile Number"/></div>' +
                '</fieldset>' +
                '<div id="container">' +
                    '<div id="' + this._isEmptyId + '"></div>' +
                    '<label class="label" id="label1">First Address Well - Full width of container</label>' +
                    '<div><input type="button" id="' + this._toCheckErrorButtonId + '" value="Check Errors" /><input type="button" id="' + this._toClearButtonId + '" value="Clear" /></div>' +
                    '<div id="toError" class="warning"></div>' +
                    '<div>' + Jx.getUI(this._toLine).html + '</div>' +
                    '<p>Fake content below the address well - Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nec urna neque, ut tempus purus. Ut sit amet lorem velit, id lacinia neque. Curabitur adipiscing, orci sit amet bibendum luctus, libero mauris malesuada est, eget congue odio dolor in diam. Mauris ac sapien nunc. Ut augue arcu, iaculis nec dignissim ut, mollis et orci. Aliquam faucibus elit volutpat sem imperdiet blandit. Vestibulum congue lacinia sollicitudin. Aliquam erat volutpat. Fusce libero dolor, gravida ac ornare nec, posuere sit amet orci. Aliquam a fringilla ligula. Maecenas interdum urna vel felis dapibus ac mollis tortor bibendum. Sed non faucibus urna. Pellentesque aliquet sollicitudin diam quis fermentum. Praesent in lorem sit amet urna dignissim vulputate ac sed felis. Mauris fringilla rhoncus dolor. Cras non elementum ligula. Praesent id euismod turpis. Mauris tempus nunc at nunc lobortis non consectetur massa commodo. Donec quis tellus nulla, nec gravida tortor. </p>' +
                '</div>' +
                '<label class="label" id="label2">Second Address Well - Narrow width</label>' +
                '<div><input type="button" id="' + this._ccCheckErrorButtonId + '" value="Check Errors" /><input type="button" id="' + this._ccClearButtonId + '" value="Clear" /></div>' +
                '<div id="ccError" class="warning"></div>' +
                '<div class="narrow">' + Jx.getUI(this._ccLine).html + '</div>' +
                '<label class="label" id="label3">Third Address Well - Full width of page</label>' +
                '<div><input type="button" id="' + this._bccCheckErrorButtonId + '" value="Check Errors" /><input type="button" id="' + this._bccClearButtonId + '" value="Clear" /></div>' +
                '<div id="bccError" class="warning"></div>' +
                '<div>' + Jx.getUI(this._bccLine).html + '</div>' +
                '<label class="label" id="label4">Fourth Address Well - disabled</label>' +
                '<div><input type="button" id="' + this._disabledAddRecipientsButtonId + '" value="Add Recipient" /></div>' +
                '<div>' + Jx.getUI(this._disabledLine).html + '</div>' +
                '<div id="footer"></div>';
};

RootComponent.prototype.activateUI = function () {
    /// <summary>
    /// Logic after UI has been initialized.
    /// </summary>

    Jx.Component.prototype.activateUI.call(this);

    var me = this;

    // Attach click handlers to buttons

    this._mockDataStaticButtonElement = document.getElementById(this._mockDataStaticButtonId);
    this._mockDataStaticButtonClick = this._buttonClickHandler.bind(this);
    this._mockDataStaticButtonElement.addEventListener("click", this._mockDataStaticButtonClick, false);

    this._realDataButtonElement = document.getElementById(this._realDataButtonId);
    this._realDataButtonClick = this._buttonClickHandler.bind(this);
    this._realDataButtonElement.addEventListener("click", this._realDataButtonClick, false);

    this._toCheckErrorButtonElement = document.getElementById(this._toCheckErrorButtonId);
    this._toCheckErrorButtonClick = function () {
        me._checkErrorGivenAddressWell(me._toLine, document.getElementById("toError"));
    };
    this._toCheckErrorButtonElement.addEventListener("click", this._toCheckErrorButtonClick, false);

    this._ccCheckErrorButtonElement = document.getElementById(this._ccCheckErrorButtonId);
    this._ccCheckErrorButtonClick = function () {
        me._checkErrorGivenAddressWell(me._ccLine, document.getElementById("ccError"));
    };
    this._ccCheckErrorButtonElement.addEventListener("click", this._ccCheckErrorButtonClick, false);

    this._bccCheckErrorButtonElement = document.getElementById(this._bccCheckErrorButtonId);
    this._bccCheckErrorButtonClick = function () {
        me._checkErrorGivenAddressWell(me._bccLine, document.getElementById("bccError"));
    };
    this._bccCheckErrorButtonElement.addEventListener("click", this._bccCheckErrorButtonClick, false);

    var disabledAddRecipientsButtonElement = document.getElementById(this._disabledAddRecipientsButtonId);
    var disabledButtonClickHandler = this._addRecipientsToDisabledButton.bind(this);
    disabledAddRecipientsButtonElement.addEventListener("click", disabledButtonClickHandler, false);

    this._toClearButtonElement = document.getElementById(this._toClearButtonId);
    this._toClearButtonClick = this._toLine.clear.bind(this._toLine);
    this._toClearButtonElement.addEventListener("click", this._toClearButtonClick, false);
    this._ccClearButtonElement = document.getElementById(this._ccClearButtonId);
    this._ccClearButtonClick = this._ccLine.clear.bind(this._ccLine);
    this._ccClearButtonElement.addEventListener("click", this._ccClearButtonClick, false);
    this._bccClearButtonElement = document.getElementById(this._bccClearButtonId);
    this._bccClearButtonClick = this._bccLine.clear.bind(this._bccLine);
    this._bccClearButtonElement.addEventListener("click", this._bccClearButtonClick, false);

    this._renderDropDownProgressButtonElement = document.getElementById(this._renderDropDownProgressButtonId);
    this._renderDropDownProgressButtonClick = this._renderDropDownProgressHandler.bind(this);
    this._renderDropDownProgressButtonElement.addEventListener("click", this._renderDropDownProgressButtonClick, false);

    this._renderDropDownTextButtonElement = document.getElementById(this._renderDropDownTextButtonId);
    this._renderDropDownTextButtonClick = this._renderDropDownTextHandler.bind(this);
    this._renderDropDownTextButtonElement.addEventListener("click", this._renderDropDownTextButtonClick, false);

    this._hideTileButtonElement = document.getElementById(this._hideTileButtonId);
    this._hideTileButtonClick = this._hideTileHandler.bind(this);
    this._hideTileButtonElement.addEventListener("click", this._hideTileButtonClick, false);

    this._disableWellButtonElement = document.getElementById(this._disableWellButtonId);
    this._disableWellButtonClick = this._disableWellHandler.bind(this);
    this._disableWellButtonElement.addEventListener("click", this._disableWellButtonClick, false);

    this._tileNumberElement = document.getElementById(this._tileNumberId);
    this._tileNumberChange = this._tileNumberHandler.bind(this);
    this._tileNumberElement.addEventListener("input", this._tileNumberChange, false);

    this._appColorSelectElement = document.getElementById(this._appColorId);
    this._appColorSelectChange = this._appColorSelectHandler.bind(this);
    this._appColorSelectElement.addEventListener("change", this._appColorSelectChange, false);

    this._dynamicColorButton = document.getElementById(this._dynamicColorId);
    this._dynamicColorChange = this._dynamicColorHandler.bind(this);
    this._dynamicColorButton.addEventListener("click", this._dynamicColorChange, false);

    this._toLine.setLabelledBy("label1");
    this._ccLine.setLabelledBy("label2");
    this._bccLine.setLabelledBy("label3");

    // Listens on the first addresswell input's "hasRecipientsChanged" event, and binds to its handler
    this._toLine._input.addListener(AddressWell.Events.hasRecipientsChanged, this._hasRecipientsChanged, this /* pass current context to the function */);

    // Use mock data initially
    this._setPlatformOnComponents(null);
    SetupMockData();

    // Set up mock auto-resolve events.
    this._toLine._input.removeListener(AddressWell.Events.autoResolve, AddressWell.Controller.prototype._autoResolveRecipient, this._toLine);
    this._toLine._input.addListener(AddressWell.Events.autoResolve, AddressWell.Controller.prototype._mockAutoResolveRecipient, this._toLine);

    // Add recipients to the bcc line address well
    this._bccLine.addRecipientsByString('"Dummy Name" <myEmail@hotmail.com>; "Another Name" <anotherEmail@hotmail.com>;');
    this._toLine.focusInput();
};

RootComponent.prototype.deactivateUI = function () {
    /// <summary>
    /// Logic to detach component from UI interaction.
    /// </summary>
    this._toLine._input.removeListener(AddressWell.Events.autoResolve, AddressWell.Controller.prototype._mockAutoResolveRecipient, this._toLine);
    this._toLine._input.addListener(AddressWell.Events.autoResolve, AddressWell.Controller.prototype._autoResolveRecipient, this._toLine);

    Jx.Component.prototype.deactivateUI.call(this);

    if (Jx.isObject(this._platform)) {
        this._platform.dispose();
        this._platform = null;
    }

    // Remove click handler from buttons
    this._mockDataStaticButtonElement.removeEventListener("click", this._mockDataStaticButtonClick, false);
    this._realDataButtonElement.removeEventListener("click", this._realDataButtonClick, false);
    this._toCheckErrorButtonElement.removeEventListener("click", this._toCheckErrorButtonClick, false);
    this._ccCheckErrorButtonElement.removeEventListener("click", this._ccCheckErrorButtonClick, false);
    this._bccCheckErrorButtonElement.removeEventListener("click", this._bccCheckErrorButtonClick, false);
    this._toClearButtonElement.removeEventListener("click", this._toClearButtonClick, false);
    this._ccClearButtonElement.removeEventListener("click", this._ccClearButtonClick, false);
    this._bccClearButtonElement.removeEventListener("click", this._bccClearButtonClick, false);
    this._renderDropDownProgressButtonElement.removeEventListener("click", this._renderDropDownProgressButtonClick, false);
    this._renderDropDownTextButtonElement.removeEventListener("click", this._renderDropDownTextButtonClick, false);
    this._hideTileButtonElement.removeEventListener("click", this._hideTileButtonClick, false);
    this._tileNumberElement.removeEventListener("input", this._tileNumberChange, false);
    this._appColorSelectElement.removeEventListener("change", this._appColorSelectChange, false);
    this._dynamicColorButton.removeEventListener("click", this._dynamicColorButton, false);
};

RootComponent.prototype._buttonClickHandler = function (ev) {
    /// <summary>
    /// Handles the click event to switch between mock and real data on the page.
    /// </summary>
    /// <param name="ev" type="Event">The DOM event.</param>

    // Based on the button being clicked, the function will:
    //  1) set up the platform with the corresponding data type
    //  2) change the header text to indicate the numbers of mock contacts being populated
    var header = document.getElementById("dataInfo");
    var source = ev.target.id;
    if (source === this._realDataButtonId) {
        header.innerText = "Real Data";
        this._platform = new Microsoft.WindowsLive.Platform.Client("shareAnything");
        this._setPlatformOnComponents(this._platform);
        TearDownMockData();

    } else {
        // Passing in null here such that platform is set to null for the child components
        // So that child components will populate static data
        header.innerText = "Static data - No contacts platform integration";
        this._setPlatformOnComponents(null);
        SetupMockData();
    }
};

RootComponent.prototype._addRecipientsToDisabledButton = function () {
    /// <summary>
    /// Adds recipients to a disabled AddressWell using addRecipientsByString.  Helps verify expected partner scenario.
    /// </summary>

    // Get one new recipient from the mock data
    var newRecipient = this._disabledLine._queryMockSesameStreetCharacters(1, null)[0];

    var recipientString = newRecipient.emails[0];

    this._disabledLine.addRecipientsByString(recipientString);
};

RootComponent.prototype._checkErrorGivenAddressWell = function (addressWell, errorElement) {
    /// <summary>
    /// Checks for erron on a given address well component, and display the error in the given element if there is an error to show.
    /// </summary>
    /// <param name="addressWell" type="AddressWell.Controller">The given address well component.</param>
    /// <param name="errorElement" type="HTMLElement">The given DOM element to display the error string.</param>

    // Checks to see if there is an error to display
    var addressWellError = addressWell.getError();
    if (Jx.isNonEmptyString(addressWellError)) {
        errorElement.innerText = addressWellError;
    } else {
        errorElement.innerText = "";
    }
};

RootComponent.prototype._renderDropDownProgressHandler = function () {
    /// <summary>
    /// Configs all the address well control to either show or hide the progress in the dropdown.
    /// </summary>

    if (this._renderDropDownProgressButtonElement.value === "Show Progress") {
        this._toLine._dropDown.renderProgress();
        this._ccLine._dropDown.renderProgress();
        this._bccLine._dropDown.renderProgress();
        this._renderDropDownProgressButtonElement.value = "Hide Progress";
    } else {
        this._toLine._dropDown._renderNoTiles();
        this._ccLine._dropDown._renderNoTiles();
        this._bccLine._dropDown._renderNoTiles();
        this._renderDropDownProgressButtonElement.value = "Show Progress";
    }
};

RootComponent.prototype._renderDropDownTextHandler = function () {
    /// <summary>
    /// Configs all the address well control to either show or hide the progress in the dropdown.
    /// </summary>

    if (this._renderDropDownTextButtonElement.value === "Show Text") {
        this._toLine._dropDown.renderText(AddressWell.convertSearchErrorToString(AddressWell.ListViewSearchErrorType.serverError, "My Account"));
        this._ccLine._dropDown.renderText(AddressWell.convertSearchErrorToString(AddressWell.ListViewSearchErrorType.noResults, "My Account"));
        this._bccLine._dropDown.renderText(AddressWell.convertSearchErrorToString(AddressWell.ListViewSearchErrorType.connectionError, "My Account"));
        this._renderDropDownTextButtonElement.value = "Hide Text";
    } else {
        this._toLine._dropDown._renderNoTiles();
        this._ccLine._dropDown._renderNoTiles();
        this._bccLine._dropDown._renderNoTiles();
        this._renderDropDownTextButtonElement.value = "Show Text";
    }
};

RootComponent.prototype._hideTileHandler = function () {
    /// <summary>
    /// Configs all the address well control to either hide or unhide the tile view.
    /// </summary>

    if (this._hideTileButtonElement.value === "Hide") {
        this._toLine._hideTileView = true;
        this._ccLine._hideTileView = true;
        this._bccLine._hideTileView = true;
        this._hideTileButtonElement.value = "Unhide";
    } else {
        this._toLine._hideTileView = false;
        this._ccLine._hideTileView = false;
        this._bccLine._hideTileView = false;
        this._hideTileButtonElement.value = "Hide";
    }
};

RootComponent.prototype._disableWellHandler = function () {
    /// <summary>
    /// Disables or enables all the wells.
    /// </summary>

    if (this._disableWellButtonElement.value === "Disable") {
        this._toLine.setDisabled(true);
        this._ccLine.setDisabled(true);
        this._bccLine.setDisabled(true);
        this._disableWellButtonElement.value = "Enable";
    } else {
        this._toLine.setDisabled(false);
        this._ccLine.setDisabled(false);
        this._bccLine.setDisabled(false);

        this._disableWellButtonElement.value = "Disable";
    }
};

RootComponent.prototype._tileNumberHandler = function () {
    /// <summary>
    /// Configs all the address well controls to refresh with the number of tiles as input by the user.
    /// Number must be equal to or greater than zero in order to take effect.
    /// </summary>

    var tileNumber = parseInt(this._tileNumberElement.value, 10 /* radix */);
    if (tileNumber >= 0) {
        this._toLine._mockDataTilesToReplace = tileNumber;
        this._ccLine._mockDataTilesToReplace = tileNumber;
        this._bccLine._mockDataTilesToReplace = tileNumber;
    }
};

RootComponent.prototype._setPlatformOnComponents = function (platform) {
    /// <summary>
    /// This is purely for testing since this test app needs to change mock data manually so it's setting the contacts platform object directly onto its AddressWell components.
    /// In a real app, the caller should only construct the platform once, pass it down to the AddressWell.Controller via its constructor, and should never change data since that's managed by the platform.
    /// </summary>
    /// <param name="platform">The platform to set on child Address Well components.</param>

    this._toLine._platform = platform;
    this._toLine._input._platform = platform;
    this._ccLine._platform = platform;
    this._ccLine._input._platform = platform;
    this._bccLine._platform = platform;
    this._bccLine._input._platform = platform;
};

RootComponent.prototype._appColorSelectHandler = function () {
    /// <summary>
    /// Changes the CSS color file based on the app color selection.
    /// </summary>

    var optionValue = this._appColorSelectElement.value;
    var cssFileName = "mailaddresswellcolor.css";
    // Switch CSS color file according to the option selected
    switch (optionValue) {
        case "Calendar":
            cssFileName = "calendaraddresswellcolor.css";
            break;
        case "Chat":
            cssFileName = "chataddresswellcolor.css";
            break;
        case "People":
            cssFileName = "peopleaddresswellcolor.css";
            break;
        case "Photo":
            cssFileName = "photoaddresswellcolor.css";
            break;
        case "SkyDrive":
            cssFileName = "skydriveaddresswellcolor.css";
            break;
        default:
            break;
    }
    cssFileName = "/resources/modernaddresswell/css/" + cssFileName;
    document.getElementById("colorCss").href = cssFileName;
};

RootComponent.prototype._dynamicColorHandler = function () {
    /// <summary>
    /// Updates the AddressWell color to the given color
    /// </summary>

    var hexColor = document.getElementById("dynamicColorBox").value;
    var numericColor = -1;

    // validate the color
    var isValid = hexColor[0] === "#";

    if (isValid) {
        numericColor = parseInt(hexColor.substr(1), 16);
    }

    isValid = isValid && (numericColor >= 0) && (numericColor <= 0xFFFFFF);
    
    var errorElement = document.getElementById("dynamicColorError");
    if (isValid) {
        AddressWell.updateColor(numericColor);
        errorElement.style.display = "none";
    } else {
        errorElement.style.display = "inline";
    }
};

RootComponent.prototype._hasRecipientsChanged = function (hasRecipients) {
    /// <summary>
    /// This function is invoked whenever the first address well changes:
    /// 1. from 0 recipients to 1 or more recipients
    /// 2. from 1 or more recipients to 0 recipients
    /// </summary>
    /// <param name="hasRecipients" type="Boolean">
    /// True if the first address well has 1 or more recipients.  False if the first address well has 0 recipients.
    /// </param>

    var element = document.getElementById(this._isEmptyId);
    // Always check if the UI has been setup before proceeding
    if (element) {
        if (hasRecipients) {
            element.innerText = "First AddressWell changes from 0 recipients to 1 or more recipients";
        } else {
            element.innerText = "First AddressWell changes from 1 or more recipients to 0 recipients";
        }
    }
};