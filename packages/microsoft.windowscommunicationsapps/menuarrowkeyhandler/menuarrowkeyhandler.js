
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,Debug,Jx,document,MenuArrowKeyHandler */
Jx.delayDefine(window, "MenuArrowKeyHandler", function () {
    window.MenuArrowKeyHandler = /*@constructor*/function (menuElement, config) {
        /// <summary>
        /// Handles the arrow keys (right, left, up, down) for navigating between menu items in a single menu. 
        /// The menu size is assumed to be uniform for up/down handling. Left and Right traverses the order of the querySelectorAll array.
        /// </summary>
        /// <param name="menuElement" type="HTMLElement">The HTMLElement of the parent menu, which must contain menu items.</param>
        /// <param name="config" optional="true">A set of config options that can be passed in</param>

        Debug.assert(Jx.isObject(menuElement));

        // Set up the config defaults, also shows what config values are looked for
        config = config || {};
        config.querySelector = Jx.isString(config.querySelector) ? config.querySelector : "[id][role='menuitem']";
        config.itemsTabbable = "itemsTabbable" in config ? Boolean(config.itemsTabbable) : false;

        // This will cause the first item in the menu to be selected no matter which way the menu was focused
        config.firstOnFocus = "firstOnFocus" in config ? Boolean(config.firstOnFocus) : false;

        // In some scenarios, it might be desirable that certain directions are disabled (Up and Down would be the most likely).
        // Since it's a small check, allow all directions to be disabled if requested
        config.enableUp = "enableUp" in config ? Boolean(config.enableUp) : true;
        config.enableDown = "enableDown" in config ? Boolean(config.enableDown) : true;
        config.enableLeft = "enableLeft" in config ? Boolean(config.enableLeft) : true;
        config.enableRight = "enableRight" in config ? Boolean(config.enableRight) : true;

        this._config = config;

        this._onKeyDown = this._onKeyDown.bind(this);
        this._focusFirst = this._focusFirst.bind(this);
        this._menuElement = menuElement;
        this._menuItemElements = [];
        this._menuItemElementsMap = {};

        var elements = menuElement.querySelectorAll(config.querySelector),
            menuItemElement,
            length = elements.length;
        for (var i = 0; i < length; i++) {
            menuItemElement = /*@static_cast(HTMLElement)*/elements[i];
            this.pushElement(menuItemElement);
        }

        // Manually set our hasUI, since we don't have a UI ourself but we are attached to another
        this._hasUI = true;
    };

    Jx.augment(window.MenuArrowKeyHandler, Jx.Component);

    MenuArrowKeyHandler.prototype.activateUI = function () {
        this._menuElement.addEventListener("keydown", this._onKeyDown, false);

        if (this._config.firstOnFocus) {
            this._menuElement.addEventListener("focus", this._focusFirst, false);
        }
    };

    MenuArrowKeyHandler.prototype.pushElement = function (element) {
        if (!element.id) {
            element.id = Jx.uid();
        }

        // Fill in the map so that we can go from index to menu item element and menu item element to index in constant time.
        var newLength = this._menuItemElements.push(element);
        this._menuItemElementsMap[element.id] = (newLength - 1);
        if (!this._config.itemsTabbable) {
            element.tabIndex = -1;
        }
    };

    MenuArrowKeyHandler.prototype.reset = function () {
        this._menuItemElements = [];
        this._menuItemElementsMap = {};
    };

    MenuArrowKeyHandler.prototype._focusFirst = function () {
        /// <summary> Focus on the first menu item </summary>
        this._setFocus(this._menuItemElements[0]);
    };

    MenuArrowKeyHandler.prototype.dispose = function () {
        /// <summary>Shuts down this object and removes any event listeners.</summary>
        this._menuElement.removeEventListener("keydown", this._onKeyDown, false);

        if (this._config.firstOnFocus) {
            this._menuElement.removeEventListener("focus", this._focusFirst, false);
        }

        this._menuItemElements = null;
        this._menuItemElementsMap = null;
    };

    MenuArrowKeyHandler.prototype._findMenuItemFromRect = function (x, y, width, height) {
        /// <summary>Finds the first menu item that is inside the rectangle.</summary>
        /// <param name="x" type="Number">The x-coordinate of the top left of the rectangle.</param>
        /// <param name="y" type="Number">The y-coordinate of the top left of the rectangle.</param>
        /// <param name="width" type="Number">The width of the rectangle.</param>
        /// <param name="height" type="Number">The height of the rectangle.</param>
        /// <returns type="HTMLElement">The first menu item inside the rectangle, or null.</returns>
        var elementsFromRect = document.msElementsFromRect(x, y, width, height),
            element;
        for (var i = 0, len = elementsFromRect.length; i < len; i++) {
            element = /*@static_cast(HTMLElement)*/elementsFromRect[i];
            if (this._menuItemElementsMap[element.id] !== undefined) {
                return element;
            }
        }

        return null;
    };

    MenuArrowKeyHandler.prototype._setFocus = function (menuItemElement) {
        /// <summary>Sets focus to the given menu item.</summary>
        /// <param name="menuItemElement" type="HTMLElement">The menu item to set focus to.</param>
        try {
            menuItemElement.classList.add("keyboardFocused");
            menuItemElement.focus();

            // When we lose focus, we need to remove the keyboardFocused class so elements can be properly styled
            var removeKeyboardFocusClass = function () {
                menuItemElement.classList.remove("keyboardFocused");
                menuItemElement.removeEventListener("blur", removeKeyboardFocusClass, false);
            };
            menuItemElement.addEventListener("blur", removeKeyboardFocusClass, false);
        } catch (err) {
            Debug.assert(false, "Failed to set focus to menu item. Make sure it is visible!");
        }
    };

    MenuArrowKeyHandler.prototype._onKeyDown = function (evt) {
        /// <summary>Handles the keydown event for arrow keys.</summary>
        /// <param name="evt" type="KeyboardEvent">An object containing details about the keydown event.</param>
        var key = evt.key;
        if ((key === "Right" && this._config.enableRight) ||
            (key === "Left" && this._config.enableLeft) ||
            (key === "Up" && this._config.enableUp) ||
            (key === "Down" && this._config.enableDown)) {
            // If in RTL mode, flip the left and right keys
            if (Jx.isRtl()) {
                if (key === "Left") {
                    key = "Right";
                } else if (key === "Right") {
                    key = "Left";
                }
            }
            var activeElement = document.activeElement,
                menuItemElements = this._menuItemElements;

            if (!activeElement) {
                Debug.assert(false, "Expected a valid activeElement. Make sure to focus on a menu item first!");
                return;
            }

            if (activeElement.id === this._menuElement.id) {
                if (key === "Right" || key === "Up") {
                    this._setFocus(menuItemElements[0]);
                    return;
                } else {
                    this._setFocus(menuItemElements[menuItemElements.length - 1]);
                    return;
                }
            }

            var menuItemIndex = this._menuItemElementsMap[activeElement.id];


            if (menuItemIndex === undefined) {
                // Focus is not on a menu item, so just ignore this key press.
                return;
            }


            if (key === "Right") {
                if (++menuItemIndex < menuItemElements.length) {
                    this._setFocus(menuItemElements[menuItemIndex]);
                    evt.preventDefault();
                } else {
                    // Wrap around
                    this._setFocus(menuItemElements[0]);
                    evt.preventDefault();
                }
            } else if (key === "Left") {
                if (--menuItemIndex >= 0) {
                    this._setFocus(menuItemElements[menuItemIndex]);
                    evt.preventDefault();
                } else {
                    this._setFocus(menuItemElements[menuItemElements.length - 1]);
                }
            } else {
                var clientRect = activeElement.getBoundingClientRect(),
                    x = clientRect.left,
                    y,
                    // Reduce height and width to reduce chances of selecting the wrong item if the elements are close. Height should be 
                    // as large as possible for going up and down, but width can be reduced by a larger amount since 
                    // one of the assumptions is that the menu is correctly aligned if vertical.
                    // Height is reduced by 2 in order to offset us adding 1 to not intersect the current element,
                    // and then another to get the selection off of the border line at the bottom in case elements
                    // have no vertical padding inbetween them
                    width = clientRect.width/2,
                    height = clientRect.height - 2;

                // We add a +1 to make sure the rectangle doesn't intersect with the current element.
                if (key === "Up") {
                    y = clientRect.top - (height + 1);
                } else {
                    y = clientRect.bottom + 1;
                }

                var newMenuItem = this._findMenuItemFromRect(x, y, width, height);
                if (Boolean(newMenuItem) && newMenuItem !== activeElement) {
                    this._setFocus(newMenuItem);
                    evt.preventDefault();
                }
            }
        }
    };
});
