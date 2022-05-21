
//
// Copyright (C) Microsoft. All rights reserved.
//

/*jshint browser:true*/
/*global EmojiPicker,Compose,Jx,Debug,WinJS*/

Jx.delayDefine(window, "EmojiPicker", function () {

Jx.loadCss("/moderncanvas/emojipickerbase.css");

// Setup app data object
window.EmojiPicker = {};
EmojiPicker.appData = EmojiPicker.appData || new Jx.AppData();
EmojiPicker.ls = EmojiPicker.ls || EmojiPicker.appData.localSettings().container("EmojiPicker");
/// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

// Define classes
EmojiPicker.CategoryElement = /*@constructor*/function () { };
EmojiPicker.CategoryElement.prototype = {
    controlElement: /*@static_cast(HTMLElement)*/null,
    displayElement: /*@static_cast(HTMLElement)*/null
};

// Define enums
EmojiPicker.Keys = {
    tab: 9,
    enter: 13,
    esc: 27,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40
};
EmojiPicker.Categories = {
    People: ['1f60a', '2639', '263a', '1f601', '1f602', '1f603', '1f604', '1f605', '1f606', '1f607', '1f608', '1f609', '1f60b', '1f60c', '1f60d', '1f60e', '1f60f', '1f610', '1f612', '1f613', '1f614', '1f616', '1f618', '1f61a', '1f61c', '1f61d', '1f61e', '1f620', '1f621', '1f622', '1f623', '1f624', '1f625', '1f628', '1f629', '1f62a', '1f62b', '1f62d', '1f630', '1f631', '1f632', '1f633', '1f635', '1f636', '1f637', '1f440', '1f442', '1f443', '1f444', '1f445', '1f446', '1f447', '1f448', '1f449', '1f44a', '1f44b', '1f44c', '1f44d', '1f44e', '1f44f', '1f450', '1f645', '1f646', '1f647', '1f648', '1f649', '1f64a', '1f64b', '1f64c', '1f64d', '1f64e', '1f64f', '261d', '270a', '270b', '270c', '1f493', '1f494', '1f495', '1f496', '1f497', '1f498', '1f499', '1f49a', '1f49b', '1f49c', '1f49d', '1f49e', '1f49f', '1f464', '1f466', '1f467', '1f468', '1f469', '1f46a', '1f46b', '1f46e', '1f46f', '1f470', '1f471', '1f472', '1f473', '1f474', '1f475', '1f476', '1f477', '1f481', '1f482', '1f483'],
    Activities: ['1f388', '1f380', '1f381', '1f382', '1f383', '1f384', '1f385', '1f386', '1f387', '1f389', '1f38a', '1f38c', '1f38b', '1f38d', '1f38e', '1f38f', '1f390', '1f391', '1f392', '1f393', '1f48b', '1f48c', '1f48d', '1f48e', '1f48f', '1f490', '1f491', '1f492', '1f484', '1f485', '1f486', '1f487', '1f488', '1f489', '1f48a', '1f478', '1f479', '1f47a', '1f47b', '1f47c', '1f47d', '1f47e', '1f47f', '1f480', '1f3bd', '1f3be', '1f3bf', '1f3c0', '1f3c1', '1f3c2', '1f3c3', '1f3c4', '1f3c6', '1f3c8', '1f3ca', '26bd', '26be', '1f0cf', '1f3a0', '1f3a1', '1f3a2', '1f3a3', '1f3a4', '1f3a5', '1f3a6', '1f3a7', '1f3a8', '1f3a9', '1f3aa', '1f3ab', '1f3ac', '1f3ad', '1f3ae', '1f3af', '1f3b0', '1f3b1', '1f3b2', '1f3b3', '1f3b4', '1f3b5', '1f3b6', '1f3b7', '1f3b8', '1f3b9', '1f3ba', '1f3bb', '1f3bc', '1f4f7', '1f4f9', '1f4fa', '1f4fb', '1f4fc', '2660', '2663', '2665', '2666'],
    FoodAndThings: ['1f355', '1f354', '1f356', '1f357', '1f358', '1f359', '1f35a', '1f35b', '1f35c', '1f35d', '1f35e', '1f35f', '1f360', '1f361', '1f362', '1f363', '1f364', '1f365', '1f366', '1f367', '1f368', '1f369', '1f36a', '1f36b', '1f36c', '1f36d', '1f36e', '1f36f', '1f370', '1f371', '1f372', '1f373', '1f52a', '1f374', '1f375', '1f376', '1f377', '1f378', '1f379', '1f37a', '1f37b', '2615', '1f345', '1f346', '1f347', '1f348', '1f349', '1f34a', '1f34c', '1f34d', '1f34e', '1f34f', '1f351', '1f352', '1f353', '1f4dd', '1f4de', '1f4df', '1f4e0', '1f4e1', '1f4e2', '1f4e3', '1f4e4', '1f4e5', '1f4e6', '1f4e7', '1f4e8', '1f4e9', '1f4ea', '1f4eb', '1f4ee', '1f4f0', '1f4f1', '1f4f2', '1f4f3', '1f4f4', '1f4f6', '1f525', '1f526', '1f527', '1f528', '1f529', '1f52b', '1f52e', '1f52f', '1f530', '1f531', '1f451', '1f452', '1f453', '1f454', '1f455', '1f456', '1f457', '1f458', '1f459', '1f45a', '1f45b', '1f45c', '1f45d', '1f45e', '1f45f', '1f460', '1f461', '1f462', '1f463', '1f4ba', '1f4bb', '1f4bc', '1f4bd', '1f4be', '1f4bf', '1f4c0', '1f4c1', '1f4c2', '1f4c3', '1f4c4', '1f4c5', '1f4c6', '1f4c7', '1f4c8', '1f4c9', '1f4ca', '1f4cb', '1f4cc', '1f4cd', '1f4ce', '1f4cf', '1f4d0', '1f4d1', '1f4d2', '1f4d3', '1f4d4', '1f4d5', '1f4d6', '1f4d7', '1f4d8', '1f4d9', '1f4da', '1f4db', '1f4dc', '260e', '2702', '2709', '270f', '2712', '1f550', '1f551', '1f552', '1f553', '1f554', '1f555', '1f556', '1f557', '1f558', '1f559', '1f55a', '1f55b'],
    Travel: ['2708', '1f680', '1f683', '1f684', '1f685', '1f687', '1f689', '1f68c', '1f68f', '1f691', '1f692', '1f693', '1f695', '1f697', '1f699', '1f69a', '1f6a2', '1f6a4', '1f6a5', '1f6a7', '1f6a8', '26d4', '2b55', '1f6a9', '1f6aa', '1f6ab', '1f6ac', '1f6ad', '1f6b2', '1f6b6', '1f6b9', '1f6ba', '1f6bb', '1f6bc', '1f6bd', '1f6be', '1f6c0', '267f', '26a0', '26a1', '1f3e0', '1f3e1', '1f3e2', '1f3e3', '1f3e5', '1f3e6', '1f3e7', '1f3e8', '1f3e9', '1f3ea', '1f3eb', '1f3ec', '1f3ed', '1f3ee', '1f3ef', '1f3f0', '2668', '2693', '26ea', '26f2', '26f3', '26f5', '26fa', '26fd'],
    AnimalsAndWeather: ['26c5', '1f300', '1f301', '1f302', '1f303', '1f304', '1f305', '1f306', '1f307', '1f308', '1f309', '1f30a', '1f30b', '1f30c', '1f311', '1f313', '1f314', '1f315', '1f319', '1f31b', '1f31f', '1f320', '2600', '2601', '2614', '26c4', '2728', '2733', '2734', '2744', '2747', '2b50', '1f40c', '1f40d', '1f40e', '1f411', '1f412', '1f414', '1f417', '1f418', '1f419', '1f41a', '1f41b', '1f41c', '1f41d', '1f41e', '1f41f', '1f420', '1f421', '1f422', '1f423', '1f424', '1f425', '1f426', '1f427', '1f428', '1f429', '1f42b', '1f42c', '1f42d', '1f42e', '1f42f', '1f430', '1f431', '1f432', '1f433', '1f434', '1f435', '1f436', '1f437', '1f438', '1f439', '1f43a', '1f43b', '1f43c', '1f43d', '1f43e', '1f638', '1f639', '1f63a', '1f63b', '1f63c', '1f63d', '1f63e', '1f63f', '1f640', '1f330', '1f331', '1f334', '1f335', '1f337', '1f338', '1f339', '1f33a', '1f33b', '1f33c', '1f33d', '1f33e', '1f33f', '1f340', '1f341', '1f342', '1f343', '1f344', '267b'],
    Symbols: ['2049', '00a9', '00ae', '1f30f', '1f5fb', '1f5fc', '1f5fd', '1f5fe', '1f5ff', '203c', '2122', '2611', '2705', '2714', '2716', '274c', '274e', '2753', '2754', '2755', '2757', '2764', '2795', '2796', '2797', '27b0', '27bf', '2934', '2935', '2b1b', '2b1c', '3030', '303d', '1f4a0', '1f4a1', '1f4a2', '1f4a3', '1f4a4', '1f4a5', '1f4a6', '1f4a7', '1f4a8', '1f4a9', '1f4aa', '1f4ab', '1f4ac', '1f4ae', '1f4af', '1f4b0', '1f4b1', '1f4b2', '1f4b3', '1f4b4', '1f4b5', '1f4b8', '1f4b9', '1f519', '1f51a', '1f51b', '1f51c', '1f51d', '2194', '2195', '2196', '2197', '2198', '2199', '21a9', '21aa', '27a1', '2b05', '2b06', '2b07', '1f532', '1f533', '1f534', '1f535', '1f536', '1f537', '1f538', '1f539', '25aa', '25ab', '25b6', '25c0', '25fb', '25fc', '25fd', '25fe', '1f51f', '2139', '1f250', '1f251', '1f51e', '24c2', '26aa', '26ab', '3297', '3299', '1f004', '1f170', '1f171', '1f17e', '1f17f', '1f18e', '1f191', '1f192', '1f193', '1f194', '1f195', '1f196', '1f197', '1f198', '1f199', '1f19a', '1f201', '1f202', '1f21a', '1f22f', '1f232', '1f233', '1f234', '1f235', '1f236', '1f237', '1f238', '1f239', '1f23a', '1f503', '1f50a', '1f50b', '1f50c', '1f50d', '1f50e', '1f50f', '1f510', '1f511', '1f512', '1f513', '1f514', '1f516', '1f517', '1f518', '1f520', '1f521', '1f522', '1f523', '1f524', '1f53a', '1f53b', '1f53c', '1f53d', '231a', '231b', '23e9', '23ea', '23eb', '23ec', '23f0', '23f3', '2648', '2649', '264a', '264b', '264c', '264d', '264e', '264f', '2650', '2651', '2652', '2653', '26ce']
};

EmojiPicker.LogEvent = {
    start: "_begin",
    stop: "_end",
    toProfilerMarkString: {
        "_begin": ",StartTA,EmojiPicker",
        "_end": ",StopTA,EmojiPicker"
    }
};

EmojiPicker.mark = function (eventName, eventType) {
    /// <summary>Log function for the Modern Canvas profiler marks.</summary>
    /// <param name="eventName" type="String">ETW event name</param>
    /// <param name="eventType" type="EmojiPicker.LogEvent" optional="true">enum for start/stop/info/etc.</param>
    Jx.mark("EmojiPicker." + eventName + (EmojiPicker.LogEvent.toProfilerMarkString[eventType] || ""));
};
EmojiPicker.markStart = function (eventName) {
    /// <summary>Start log function for the Modern Canvas profiler marks.</summary>
    /// <param name="eventName" type="String">ETW event name</param>
    EmojiPicker.mark(eventName, EmojiPicker.LogEvent.start);
};
EmojiPicker.markStop =  function (eventName) {
    /// <summary>Stop log function for the Modern Canvas profiler marks.</summary>
    /// <param name="eventName" type="String">ETW event name</param>
    EmojiPicker.mark(eventName, EmojiPicker.LogEvent.stop);
};

function tmplEmojiButtons(codes) {
    var result = '';
    for (var i = 0; i < codes.length; i++) {
        result += '<button data-name="' + codes[i] + '" data-win-res="title:/emoji/emojiDescription_' + codes[i] + '" type="button">&#x' + codes[i] + ';</button>';
    }
    return result;
}

function tmplEmojiPicker() {
    return '' +
    '<div id="emojiCategoriesLabel" data-win-res="innerText:/emoji/emojiCategories"></div>' +
    '<div id="emojiPickerCategoryBar" class="emojiCategoryBar">' +
        '<button id="emojiPickerCategoryButtonRecentlyUsed" data-category="RecentlyUsed" data-win-res="title:/emoji/emojiCategory_RecentlyUsed;aria-label:/emoji/emojiCategory_RecentlyUsed" type="button">&#x2764;</button>' +
        '<button id="emojiPickerCategoryButtonPeople" data-category="People" data-win-res="title:/emoji/emojiCategory_People;aria-label:/emoji/emojiCategory_People" type="button">&#x1f60a;</button>' +
        '<button id="emojiPickerCategoryButtonActivities" data-category="Activities" data-win-res="title:/emoji/emojiCategory_Activities;aria-label:/emoji/emojiCategory_Activities;" type="button">&#x1f388;</button>' +
        '<button id="emojiPickerCategoryButtonFoodAndThings" data-category="FoodAndThings" data-win-res="title:/emoji/emojiCategory_FoodAndThings;aria-label:/emoji/emojiCategory_FoodAndThings" type="button">&#x1f355;</button>' +
        '<button id="emojiPickerCategoryButtonTravel" data-category="Travel" data-win-res="title:/emoji/emojiCategory_Travel;aria-label:/emoji/emojiCategory_Travel" type="button">&#x2708;</button>' +
        '<button id="emojiPickerCategoryButtonAnimalsAndWeather" data-category="AnimalsAndWeather" data-win-res="title:/emoji/emojiCategory_AnimalsAndWeather;aria-label:/emoji/emojiCategory_AnimalsAndWeather" type="button">&#x26c5;</button>' +
        '<button id="emojiPickerCategoryButtonSymbols" data-category="Symbols" data-win-res="title:/emoji/emojiCategory_Symbols;aria-label:/emoji/emojiCategory_Symbols" type="button">&#x2049;</button>' +
    '</div>' +

    '<div id="emojiPickerCategories" class="emojiCategoryGrids">' +
        '<div id="emojiPickerCategoryRecentlyUsed" data-category="RecentlyUsed" aria-selected="false" aria-hidden="true">' +
            '<div class="categoryTitle" data-win-res="innerText:/emoji/emojiCategory_RecentlyUsed"></div>' +
            '<div class="emojiScroll"></div>' + // Starts empty
        '</div>' +
        '<div id="emojiPickerCategoryPeople" data-category="People" aria-selected="false" aria-hidden="true">' +
            '<div class="categoryTitle" data-win-res="innerText:/emoji/emojiCategory_People"></div>' +
            '<div class="emojiScroll">' +
                tmplEmojiButtons(EmojiPicker.Categories.People) +
            '</div>' +
        '</div>' + 
        '<div id="emojiPickerCategoryActivities" data-category="Activities" aria-selected="false" aria-hidden="true">' +
            '<div class="categoryTitle" data-win-res="innerText:/emoji/emojiCategory_Activities"></div>' +
            '<div class="emojiScroll">' +
                tmplEmojiButtons(EmojiPicker.Categories.Activities) +
            '</div>' +
        '</div>' + 
        '<div id="emojiPickerCategoryFoodAndThings" data-category="FoodAndThings" aria-selected="false" aria-hidden="true">' +
            '<div class="categoryTitle" data-win-res="innerText:/emoji/emojiCategory_FoodAndThings"></div>' +
            '<div class="emojiScroll">' +
                tmplEmojiButtons(EmojiPicker.Categories.FoodAndThings) +
            '</div>' +
        '</div>' +
        '<div id="emojiPickerCategoryTravel" data-category="Travel" aria-selected="false" aria-hidden="true">' +
            '<div class="categoryTitle" data-win-res="innerText:/emoji/emojiCategory_Travel"></div>' +
            '<div class="emojiScroll">' +
                tmplEmojiButtons(EmojiPicker.Categories.Travel) +
            '</div>' +
        '</div>' +
        '<div id="emojiPickerCategoryAnimalsAndWeather" data-category="AnimalsAndWeather" aria-selected="false" aria-hidden="true">' +
            '<div class="categoryTitle" data-win-res="innerText:/emoji/emojiCategory_AnimalsAndWeather"></div>' +
            '<div class="emojiScroll">' +
                tmplEmojiButtons(EmojiPicker.Categories.AnimalsAndWeather) +
            '</div>' +
        '</div>' +
        '<div id="emojiPickerCategorySymbols" data-category="Symbols" aria-selected="false" aria-hidden="true">' +
            '<div class="categoryTitle" data-win-res="innerText:/emoji/emojiCategory_Symbols"></div>' +
            '<div class="emojiScroll">' +
                tmplEmojiButtons(EmojiPicker.Categories.Symbols) +
            '</div>' +
        '</div>' +
    '</div>';
}

EmojiPicker.EmojiPicker = /*@constructor*/function (insertionCallback, returnFocusTarget, positioningElement) {
    /// <param name="insertionCallback" type="Function">The function to call to insert an image.  It will be passed a single parameter: the image name.</param>
    /// <param name="returnFocusTarget" type="HTMLElement">The HTMLElement or control object to which focus should be returned when the picker is hidden.</param>
    /// <param name="positioningElement" type="HTMLElement">A DOM element with height, offsetleft, and offsettop the same as the desired values for the picker.</param>
    EmojiPicker.markStart("ctor");
    // Save arguments
    this._insertionCallback = insertionCallback;
    this._returnFocusTarget = returnFocusTarget;
    this._anchorElement = positioningElement;

    // Initialize instance variables
    this._categoryElements = {};

    // Bind instance functions
    this._onClick = this._onClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._select = this._select.bind(this);
    this.focus = this.focus.bind(this);
    this._inputPanelHiding = this._inputPanelHiding.bind(this);
    this._waitingForHide = false;

    this._inputPaneHandle = /*@static_cast(Windows.UI.ViewManagement.InputPane)*/Compose.InputPane.getForCurrentView();
    Debug.assert(Jx.isObject(this._inputPaneHandle));
    this._inputPaneHandle.addEventListener("hiding", this._inputPanelHiding, false);

    /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
    
    EmojiPicker.markStop("ctor");
};

EmojiPicker.EmojiPicker.prototype = {
    _addRecentlyUsed: function (recentlyUsedId) {
        /// <summary>Adds the emoji to the RecentlyUsed list.</summary>
        /// <param name="recentlyUsedId" type="String">The unique identifier of the recently used emoji.</param>
        EmojiPicker.markStart("addRecentlyUsed");

        // First strip the recentlyUsedId from the array
        var recentlyUsedList = /*@static_cast(Array)*/JSON.parse(EmojiPicker.ls.get("EmojiPicker_MRU") || "[]"),
            index = recentlyUsedList.indexOf(recentlyUsedId);
        if (index !== -1) {
            recentlyUsedList.splice(index, 1);
        }

        // Then push the new item onto the end of the array
        recentlyUsedList.push(recentlyUsedId);

        // Drop any above the max length (should only be 1, but for completeness we will continue)
        while (recentlyUsedList.length > this._recentlyUsedMaxLength) {
            recentlyUsedList.shift();
        }

        // Save the list off
        EmojiPicker.ls.set("EmojiPicker_MRU", JSON.stringify(recentlyUsedList));

        EmojiPicker.markStop("addRecentlyUsed");
    },
    _categoryElements: {},
    _createDisplay: function () {
        /// <summary>Instanciates the Emoji Picker display.</summary>
        EmojiPicker.markStart("createDisplay");
        // If the display element hasn't been created yet
        if (this._displayElement === null) {
            // Build the actual picker element
            var displayElement = document.createElement("div");
            displayElement.id = "emojiPicker";
            displayElement.className = "emojiPicker win-menu";
            displayElement.innerHTML = tmplEmojiPicker();
            Jx.res.processAll(displayElement);
            displayElement.addEventListener("click", this._onClick, false);
            displayElement.addEventListener("keydown", this._onKeyDown, false);
            this._displayElement = displayElement;
            document.body.appendChild(displayElement);

            // Pull handles to category dividers
            var categoryDivsHolder = /*@static_cast(HTMLElement)*/displayElement.getElementsByClassName("emojiCategoryGrids")[0];
            var categoryDivs = categoryDivsHolder.children,
            m;
            for (m = categoryDivs.length; /*@static_cast(Boolean)*/m--; ) {
                this._categoryElements[categoryDivs[m].getAttribute("data-category")] = {
                    displayElement: categoryDivs[m]
                };
            }
            var categoryButtonsHolder = /*@static_cast(HTMLElement)*/displayElement.getElementsByClassName("emojiCategoryBar")[0];
            var categoryButtons = categoryButtonsHolder.children,
            categoryButton;
            var len = categoryButtons.length;
            for (m = len; /*@static_cast(Boolean)*/m--; ) {
                categoryButton = /*@static_cast(HTMLElement)*/categoryButtons[m];
                // Set the column values to go 1, 3, 5, etc so as to leave an empty column in between each
                categoryButton.style["-ms-grid-column"] = ((m + 1) * 2) - 1;
                this._categoryElements[categoryButton.getAttribute("data-category")].controlElement = categoryButton;
            }

            // Turn this into a flyout
            this._flyout = new WinJS.UI.Flyout(displayElement, { anchor: this._anchorElement, placement: "top", alignment: "center" });

            // Attach the return focus to the flyout hiding
            var that = this;
            this._flyout.addEventListener("afterhide", function () {
                that._returnFocusTarget.focus();
            }, false);

            // Attach listener to set focus after flyout shows
            this._flyout.addEventListener("aftershow", this.focus, false);
        }
        EmojiPicker.markStop("createDisplay");
    },
    _displayElement: null,
    _flyout: null,
    _isButton: function (buttonElement) {
        /// <summary>Determines if the given element is an emoji button.</summary>
        /// <param name="buttonElement" type="HTMLElement" optional="true">The html element in question.</param>
        return Boolean(buttonElement) && buttonElement.nodeName === "BUTTON";
    },
    _lastSetCategory: "",
    _onClick: function (e) {
        /// <summary>Handles the click event anywhere on the Emoji Picker.</summary>
        /// <param name="e" type="Event">The click event that occured on the Emoji Picker.</param>
        EmojiPicker.markStart("select");
        this._select(e.target);
        EmojiPicker.markStop("select");
    },
    _onKeyDown: function (e) {
        /// <summary>Handles the key event for navigation on the Emoji Picker.</summary>
        /// <param name="e" type="KeyboardEvent">The onkeydown event that occured on the Emoji Picker.</param>
        /// <returns type="Boolean">True if the key should continue, false if it should be stopped.</returns>
        var _keyCode = e.keyCode,
            keys = EmojiPicker.Keys;

        // Handle ESC
        if (_keyCode === keys.esc) {
            this.hide();
            return false;
        }

        // If in RTL mode, flip the left and right keys
        var isRtl = false;
        if (Jx.isRtl()) {
            isRtl = true;
            if (_keyCode === keys.left) {
                _keyCode = keys.right;
            } else if (_keyCode === keys.right) {
                _keyCode = keys.left;
            }
        }

        // Determine where the key event occured
        var buttonElement = /*@static_cast(HTMLElement)*/e.target,
            nextButton = buttonElement;
        // buttonData will only get data for a insertion button, not a category selector
        var buttonData = buttonElement.getAttribute("data-name");
        // If navigating in the control section
        if (!buttonData) {
            // Handle tab, enter, and space.  All of which bump focus down to the grid.
            if (_keyCode === keys.tab || _keyCode === keys.space || _keyCode === keys.enter) {
                buttonElement = /*@static_cast(HTMLElement)*/this._categoryElements[this._currentCategory].displayElement.querySelector('.emojiScroll').children[0];
                if (buttonElement) {
                    while (Boolean(buttonElement) && !this._isButton(buttonElement)) {
                        buttonElement = buttonElement.nextElementSibling;
                    }
                    if (buttonElement) {
                        this._targetLeft = buttonElement.offsetLeft;
                        this._targetTop = buttonElement.offsetTop;
                        buttonElement.focus();
                    }
                }
                // Handle arrow keys
            } else if (_keyCode === keys.left || _keyCode === keys.right) {
                if (_keyCode === keys.right) {
                    nextButton = buttonElement.nextElementSibling;
                    if (!nextButton) {
                        nextButton = /*@static_cast(HTMLElement)*/buttonElement.parentNode.children[0];
                    }
                } else {
                    nextButton = buttonElement.previousElementSibling;
                    if (!nextButton) {
                        var children = buttonElement.parentNode.children;
                        nextButton = children[children.length - 1];
                    }
                }
                buttonElement = nextButton;
                // Send focus and selection to the button
                buttonElement.focus();
                this._setCategory(buttonElement.getAttribute("data-category"));
            }
            // If navigating in the grid
        } else {
            if (_keyCode === keys.tab) {
                // Handle tab
                this._categoryElements[this._currentCategory].controlElement.focus();
            } else if (_keyCode === keys.space || _keyCode === keys.enter) {
                // Handle selection
                this._select(e.target, true);
            } else if (_keyCode === keys.left || _keyCode === keys.right || _keyCode === keys.up || _keyCode === keys.down) {
                // Handle arrow navigation
                var targetTop = this._targetTop,
                    targetLeft = this._targetLeft;
                if (_keyCode === keys.left) {
                    // Grab previous image
                    do {
                        nextButton = nextButton.previousElementSibling;
                    } while (Boolean(nextButton) && !this._isButton(nextButton));
                    if (nextButton) {
                        buttonElement = nextButton;
                    }
                    // Update target
                    targetLeft = buttonElement.offsetLeft;
                } else if (_keyCode === keys.up) {
                    // Bump target value to new location
                    targetTop = buttonElement.offsetTop - buttonElement.offsetHeight;
                    // Iterate for primary direction
                    do {
                        nextButton = nextButton.previousElementSibling;
                    } while (Boolean(nextButton) && nextButton.offsetTop > targetTop);
                    while (Boolean(nextButton) && !this._isButton(nextButton)) {
                        nextButton = nextButton.previousElementSibling;
                    }
                    if (nextButton) {
                        buttonElement = nextButton;
                        // Update target
                        targetTop = buttonElement.offsetTop;
                        // Iterate for secondary direction
                        while (Boolean(nextButton) && nextButton.offsetTop === targetTop && (isRtl ? nextButton.offsetLeft <= targetLeft : nextButton.offsetLeft >= targetLeft)) {
                            buttonElement = nextButton;
                            do {
                                nextButton = nextButton.previousElementSibling;
                            } while (Boolean(nextButton) && !this._isButton(nextButton));
                        }
                    }
                } else if (_keyCode === keys.right) {
                    // Grab next image
                    do {
                        nextButton = nextButton.nextElementSibling;
                    } while (Boolean(nextButton) && !this._isButton(nextButton));
                    if (nextButton) {
                        buttonElement = nextButton;
                    }
                    // Update target
                    targetLeft = buttonElement.offsetLeft;
                } else {
                    // Bump target value to new location
                    targetTop = buttonElement.offsetTop + buttonElement.offsetHeight;
                    // Iterate for primary direction
                    do {
                        nextButton = nextButton.nextElementSibling;
                    } while (Boolean(nextButton) && nextButton.offsetTop < targetTop);
                    while (Boolean(nextButton) && !this._isButton(nextButton)) {
                        nextButton = nextButton.nextElementSibling;
                    }
                    if (nextButton) {
                        buttonElement = nextButton;
                        // Update target
                        targetTop = buttonElement.offsetTop;
                        // Iterate for secondary direction
                        while (Boolean(nextButton) && nextButton.offsetTop === targetTop && (isRtl ? nextButton.offsetLeft >= targetLeft : nextButton.offsetLeft <= targetLeft)) {
                            buttonElement = nextButton;
                            do {
                                nextButton = nextButton.nextElementSibling;
                            } while (Boolean(nextButton) && !this._isButton(nextButton));
                        }
                    }
                }
                // Update target values
                this._targetLeft = targetLeft;
                this._targetTop = targetTop;
                // Send focus to the button
                buttonElement.focus();
            }
        }
        e.preventDefault();
        return true;
    },
    _recentlyUsedMaxLength: 99,
    _returnFocusTarget: null,
    _select: function (buttonElement, knownForInsertion) {
        /// <summary>Handles the selection of a button on the picker.  DOES NOT handle focus changes for accesssibility.</summary>
        /// <param name="buttonElement" type="HTMLElement">The button attempting to be selected.</param>
        /// <param name="knownForInsertion" type="Boolean" optional="true">A flag to indicate that the current button being selected is already known to be for insertion.</param>

        // Attempt to correct the button element if needed
        if (!this._isButton(buttonElement)) {
            buttonElement = buttonElement.parentNode;
        }
        // If we found a button element (if not then the click was not actionalbe).
        if (this._isButton(buttonElement)) {
            var className = buttonElement.parentNode.className || "";
            if (knownForInsertion || className.indexOf("emojiCategoryBar") === -1) {
                // If the button is an emoji insertion, insert the image
                var idString = buttonElement.getAttribute("data-name");
                if (idString) {
                    this._insertionCallback(idString);
                    this._addRecentlyUsed(idString);
                }
            } else {
                this._setCategory(buttonElement.getAttribute("data-category"));
            }
        }
    },
    _setCategory: function (categoryName) {
        /// <summary>Sets the category of the Emoji picker.</summary>
        /// <param name="categoryName" type="String" optional="true">The name of the category to select.</param>
        EmojiPicker.markStart("setCategory");

        // If no category was specified use the current category
        categoryName = categoryName || this._currentCategory;

        // If this is a change from the last selected category or is a refresh of the Recently Used category
        if (categoryName !== this._lastSetCategory || categoryName === "RecentlyUsed") {
            var categoryElements = this._categoryElements;
            Debug.assert(categoryElements[categoryName], "Cannot set category to an unknown name.");

            // Remove old selection / category
            var oldCategory = /*@static_cast(EmojiPicker.CategoryElement)*/categoryElements[this._lastSetCategory];
            if (oldCategory) {
                oldCategory.controlElement.setAttribute("aria-selected", "false");
                oldCategory.displayElement.setAttribute("aria-hidden", "true");
            }

            // Set new category
            var newCategory = /*@static_cast(EmojiPicker.CategoryElement)*/categoryElements[categoryName],
                newCategoryDisplay = newCategory.displayElement;
            // If selecting Recently Used, update it
            if (categoryName === "RecentlyUsed") {
                // Pull the recently used list and set the title
                var recentlyUsedList = /*@static_cast(Array)*/JSON.parse(EmojiPicker.ls.get("EmojiPicker_MRU") || "[]"),
                    htmlString = tmplEmojiButtons(recentlyUsedList.reverse());
                // Update the actual innerHTML
                newCategoryDisplay.querySelector('.emojiScroll').innerHTML = htmlString;
                Jx.res.processAll(newCategoryDisplay);
            }
            newCategory.controlElement.setAttribute("aria-selected", "true");
            newCategoryDisplay.setAttribute("aria-hidden", "false");

            // Update last selected category
            this._lastSetCategory = categoryName;
        }

        // Save the newly selected category
        this._currentCategory = categoryName;

        EmojiPicker.markStop("setCategory");
    },
    _targetLeft: 0,
    _targetTop: 0,
    addEventListener: function (type, listener, useCapture) {
        /// <summary>Adds an event listener to the Emoji Picker.</summary>
        /// <param name="type" type="String">The type of event to listen for.</param>
        /// <param name="listener" type="Function">The function to execute when the event is fired.</param>
        /// <param name="useCapture" type="Boolean">True if the event should be captured, false if it should be bubbled.</param>
        // Make sure we have a display element
        this._createDisplay();
        this._flyout.addEventListener(type, listener, useCapture);
    },
    dispose: function () {
        /// <summary>Cleans up the Emoji Picker.</summary>
        // Detach listeners
        this._displayElement.removeEventListener("click", this._onClick, false);
        this._displayElement.removeEventListener("keydown", this._onKeyDown, false);

        // Attempt to remove from DOM (wrapped in a try/catch as it may have been moved around by WinJS or the Host app)
        try {
            document.body.removeChild(this._displayElement);
        } catch (er) { }

        // Cleanup DOM handles
        this._categoryElements = null;
        this._displayElement = null;
        this._returnFocusTarget = null;
    },
    focus: function () {
        /// <summary>Sends focus to the current category in the Emoji Picker.</summary>
        this._categoryElements[this._lastSetCategory].controlElement.focus();
    },
    hide: function () {
        /// <summary>Hides the Emoji Picker from view.</summary>
        this._flyout.hide();
    },
    removeEventListener: function (type, listener, useCapture) {
        /// <summary>Removes an event listener from the Emoji Picker.</summary>
        /// <param name="type" type="String">The type of event to remove the listener from.</param>
        /// <param name="listener" type="Function">The function to remove from the execution list.</param>
        /// <param name="useCapture" type="Boolean">True if the listener was set to capture the event, false if it was set to bubble it.</param>
        // Make sure we have a display element
        this._createDisplay();
        this._flyout.removeEventListener(type, listener, useCapture);
    },
    setInsertionCallback: function (insertionCallback) {
        /// <summary>Sets the insertion callback for the picker.</summary>
        /// <param name="insertionCallback" type="Function">The function to call to insert an image.  It will be passed a single parameter: the image name.</param>
        this._insertionCallback = insertionCallback;
    },
    setReturnTarget: function (returnFocusTarget) {
        /// <summary>Sets the return focus target for the picker.</summary>
        /// <param name="returnFocusTarget" type="HTMLElement">The HTMLElement or control object to which focus should be returned when the picker is hidden.</param>
        this._returnFocusTarget = returnFocusTarget;
    },
    show: function () {
        /// <summary>Displays the Emoji Picker.</summary>
        EmojiPicker.markStart("show");
        this._waitingForHide = false;

        // Make sure we have a display element
        this._createDisplay();

        // Make sure the category is set
        this._setCategory();

        // If the input pane is showing focus the picker and then let everything animate out before we animate in the picker
        Debug.assert(Jx.isObject(this._inputPaneHandle));
        if (this._inputPaneHandle.occludedRect.height > 0) {
            this._waitingForHide = true;
            this.focus();
        } else {
            this._flyout.show();
        }
        EmojiPicker.markStop("show");
    },
    _inputPanelHiding: function () {
        if (this._waitingForHide) {
            setImmediate(this._flyout.show.bind(this._flyout));
        }
        this._waitingForHide = false;
    }
};

Object.defineProperty(EmojiPicker.EmojiPicker.prototype, "_currentCategory", {
    enumerable: true,
    get: function () {
        return EmojiPicker.ls.get("EmojiPicker_category") || "People";
    },
    set: function (value) {
        EmojiPicker.ls.set("EmojiPicker_category", value);
    }
});

Object.defineProperty(EmojiPicker.EmojiPicker.prototype, "offsetHeight", {
    enumerable: true,
    get: function () {
        return this._flyout.element.offsetHeight;
    },
});

});