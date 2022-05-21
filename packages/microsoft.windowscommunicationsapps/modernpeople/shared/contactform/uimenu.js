
// Copyright (C) Microsoft Corporation.  All rights reserved.

///<reference path="../../../Shared/WinJS/WinJS.ref.js" />
///<reference path="../../Shared/JSUtil/Namespace.js"/>
///<reference path="../../../Shared/Jx/Core/Jx.js"/>

Jx.delayDefine(People, ["UiFlyoutMenu", "UiFlyoutMenuItem"], function () {

    var P = window.People;

    P.UgTest = true;

    var cEscKey = 27;
    var cUpArrowKey = 38;
    var cDownArrowKey = 40;
    var cEnterKey = 13;
    var cSpaceKey = 32;

    // ---------------------------------------------------------------------------------------------------------------

    // UiFlyoutMenu
    P.UiFlyoutMenu = UiFlyoutMenu;
    /* @constructor */function UiFlyoutMenu(container) {
        /// <summary>
        /// A Simple UiFlyoutMenu.
        /// </summary>
        /// <param name="HTMLElement" type="Object">This is the container item for the UiFlyoutMenu.</param>

        var _this = this;

        // Initialize items
        _this._items = [];

        _this.$obj = document.createElement('span');
        _this.$obj.innerHTML = '<a href="#" role="menu" aria-haspopup="true"></a>';

        _this._$a = _this.$obj.querySelector('a');
        _this._$menu = /*@static_cast(HTMLElement)*/null;
        _this._$a.appendChild(/*@static_cast(Node)*/container);
        _this._$mspan = _this._$a.querySelector('span.c_mlu');

        _this._$flyout = /*@static_cast(WinJS.UI.Flyout)*/null;
        // Attach the click handler if we dont already have one

        function _showMenu(/* @type(Event) */ev) {
            _beforeDisplay(_this);
            _this.show();

            ev.stopPropagation();
            return false;
        };
        _this._$a.onclick = _showMenu;
        /// <disable>JS3054.NotAllCodePathsReturnValue</disable>
        _this._$a.onkeydown = function (/* @type(Event) */ev) {
            var key = event.keyCode;
            if (key === cSpaceKey) {
                return _showMenu(ev);
            }
        };
        /// <restore>JS3054.NotAllCodePathsReturnValue</restore>
    };

    function _createMenu(/* @type(UiFlyoutMenu) */_this) {
        ///<summary>
        /// This will create the flyout and containing div in a lazy manner. The reason for creating this
        /// lazily is because we don't need to expend effort creating objects that we don't need.
        /// An advantage to this is that the callers don't need to add any menuitems until it's needed,
        /// if we create an empty flyout menu (no children) this breaks the aria checks for no reason
        /// as the menu is not displayed with no children anyway.
        ///</summary>
        if (!_this._$menu) {
            var popup = document.createElement('div');
            popup.setAttribute('class', 'win-menu win-flyout uiflyoutmenu');
            popup.setAttribute('role', 'menu');
            popup.setAttribute('style', 'visibility: hidden; opacity: 0');
            popup.setAttribute('aria-hidden', 'true');
            popup.setAttribute('focusable', 'false');
            popup.setAttribute('data-win-control', 'WinJS.UI.Flyout');

            _this._$menu = popup;
            _this._$menu.onkeydown = function (event) {
                var key = event.keyCode;
                if (key === cUpArrowKey) {
                    _this.setItemFocus(null, -1);
                } else if (key === cDownArrowKey) {
                    _this.setItemFocus(null, 0);
                } else if (key === cEscKey) {
                    // Required as some pages override the ESC key and we don't get the option 
                    // to cancel the menu
                    _this.hide();
                    _this.setFocus();
                } else if (key === cEnterKey) {
                    if (_this._$menu !== document.activeElement) {
                        return;
                    }
                } else {
                    return;
                }
                event.stopPropagation();
                return false;
            };

            if (!_this._$flyout) {
                _this._$flyout = new WinJS.UI.Flyout(_this._$menu, { alignment: P.bidi.direction === "rtl" ? "right" : "left" });
                _this._$flyout.addEventListener("afterhide", function () {
                    Jx.removeClass(_this._$a, "menuOpen");
                    document.body.removeChild(_this._$menu);
                }, false);
            }
        }
    };

    function _beforeDisplay(/* @type(UiFlyoutMenu) */_this) {
        if (_this._$beforeDisplay) {
            _this._$beforeDisplay(_this);
        }
        Jx.addClass(_this._$a, "menuOpen");
    };

    
    UiFlyoutMenu.__class = true;
    

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var UiFlyoutMenuPrototype = UiFlyoutMenu.prototype;
    /* @type(Array) */UiFlyoutMenuPrototype._items = null;
    /* @type(HTMLElement) */UiFlyoutMenuPrototype.$obj = null;
    /* @dynamic*/UiFlyoutMenuPrototype._$flyout = null;
    /* @type(Function)*/UiFlyoutMenuPrototype._$beforeDisplay = null;

    UiFlyoutMenuPrototype.addBeforeShowHandler = function (func) {
        /// <summary>
        /// This adds a handler to hook the menu before it is displayed.
        /// </summary>
        /// <param name="func" type="Function">This is the handler to be called.</param>

        this._$beforeDisplay = func;

        return this;
    };


    UiFlyoutMenuPrototype.setAriaMenuTitle = function (title) {
        /// <param name="title" type="String">The Aria label to apply as the title</param>
        if (this._$a) {
            this._$a.setAttribute('aria-label', title);
        }
    };

    UiFlyoutMenuPrototype.setAriaMenuTitleByIds = function (labelIds) {
        /// <param name="title" type="String">The Aria label to apply as the title</param>
        if (this._$a) {
            this._$a.setAttribute('aria-labelledby', labelIds);
        }
    };

    UiFlyoutMenuPrototype.count = function () {
        if (this._items) {
            return this._items.length;
        }
        return 0;
    };

    UiFlyoutMenuPrototype.setHtml = function (html) {
        /// <summary>
        /// This sets the html on the menu node
        /// </summary>
        /// <param name="html" type="String">The html to set on this item</param>
        /// <returns type="People.UiFlyoutMenu">Returns this instance to allow for chaining.</returns>

        var _this = this;

        if (_this._$mspan) {
            _this._$mspan.innerHTML = html;
        }

        return _this;
    };

    UiFlyoutMenuPrototype.add = function (menuItem) {
        /// <summary>
        /// Adds an item to the menu
        /// </summary>
        /// <param name="menuItem" type="People.UiFlyoutMenuItem">The item to add to the Menu</param>
        /// <returns type="People.UiFlyoutMenu">Returns this instance to allow for chaining.</returns>

        var _this = this;

        // We are adding items, therefore we need the menu
        _createMenu(_this);

        // Find the win-final
        var finalDiv = _this._$menu.querySelector(".win-final");
        if (finalDiv) {
            _this._$menu.insertBefore(menuItem.$obj, finalDiv);
        } else {
            _this._$menu.appendChild(menuItem.$obj);
        }

        menuItem.$parentMenu = _this;
        _this._items.push(menuItem);

        if (_this._items.length === 1) {
            _this._$menu.setAttribute('aria-activedescendant', menuItem.getActiveId());
        }
        return _this;
    };

    function _remove(_this, index, dispose) {
        /// <summary>
        /// Removes an item from the collection.
        /// </summary>
        /// <param name="_this" type="People.UiFlyoutMenu">The instance.</param>
        /// <param name="index" type="Number">The the index of the item to remove.</param>
        /// <param name="dispose" type="Boolean" optional="true">If this is set the item removed will also be disposed.</param>
        /// <returns type="Object">This returns the MenuItem or Menu that was removed.</returns>

        var navItems = _this._items.splice(index, 1);

        if (_this._$menu) {
            // Remove it
            _this._$menu.removeChild(navItems[0]);
        }

        if (dispose) {
            navItems[0].dispose();
        }

        if (_this._$flyout) {
            _this._$flyout.hide();
        }

        return navItems[0];
    };

    UiFlyoutMenuPrototype.remove = function (index, dispose) {
        /// <summary>
        /// Removes an item to the menu.
        /// </summary>
        /// <param name="index" type="Number">The the index of the item to remove.</param>
        /// <param name="dispose" type="Boolean" optional="true">If this is set the item removed will also be disposed.</param>
        /// <returns type="Object">This returns the MenuItem that was removed.</returns>

        var _this = this;

        var menuItem = _remove(_this, index, dispose);
        if (menuItem) {
            menuItem.$parentMenu = null;
        }

        return menuItem;
    };

    function _clear(_this) {
        /// <summary>
        /// Removes all items, and disposes them.
        /// </summary>
        /// <param name="_this" type="People.UiFlyoutMenu">The instance.</param>

        var items = _this._items;

        // Dispose child items
        for (var x = 0; x < items.length; x++) {
            items[x].dispose();
        }

        _this._items = [];

        // Clear the html in the ul
        if (_this._$menu) {
            _this._$menu.innerHTML = '';
        }

        if (_this._$flyout) {
            _this._$flyout.hide();
        }
        return _this;
    };

    UiFlyoutMenuPrototype.clear = function () {
        /// <summary>
        /// Removes all items, and disposes them.
        /// </summary>

        var _this = this;

        _clear(_this);

        return _this;
    };

    UiFlyoutMenu.defaultOptions = {
        html: '',
        container: null,
        menuParams: null
    };

    UiFlyoutMenuPrototype.show = function () {
        if (this._items.length > 0) {
            Debug.assert(this._$menu, "Menu should have been created during add");

            _createMenu(this);

            document.body.appendChild(this._$menu);
            this._$flyout.show(this._$a, 'auto');
        }
    };

    UiFlyoutMenuPrototype.hide = function () {
        if (this._$flyout) {
            this._$flyout.hide();
        }
    };

    UiFlyoutMenuPrototype.setFocus = function () {
        this._$a.focus();
    };

    UiFlyoutMenuPrototype.setItemFocus = function (menuItem, delta) {
        var pos = 0;
        var count = this._items.length;
        if (count > 0) {
            for (var lp = 0; lp < count; lp++) {
                if (this._items[lp] === menuItem) {
                    pos = lp;
                    break;
                }
            }
            if (delta) {
                pos += delta;
                while (pos < 0) {
                    pos += count;
                }
            }
            this._items[pos % count].setFocus();
        }
    };

    
    UiFlyoutMenu.DefaultOptions = function () {
        /// <summary>
        /// DO NOT CREATE AN INSTANCE. This class is for cofeemaker signatures
        /// </summary>
    };
    UiFlyoutMenu.DefaultOptions.prototype = UiFlyoutMenu.defaultOptions;
    UiFlyoutMenu.DefaultOptions.__class = true;
    

    function extend(dest, src) {
        ///<param name="dest" type="Object" />
        ///<param name="src" type="Object" />
        ///<returns type="Object" />
        /// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
        var /* @type(Object) */result = dest || {};

        // Enumerate all properties in src
        for (var i in src) {

            // Don't copy properties inherited from prototype. Object.prototype might be augmented.
            if (!result.hasOwnProperty(i) && src.hasOwnProperty(i)) {
                result[i] = src[i];
            }
        }

        return result;
    }

    UiFlyoutMenu.create = function (options) {
        /// <summary>
        /// This creates a Menu with options.
        /// </summary>
        /// <param name="options" type="People.UiFlyoutMenu.DefaultOptions" optional="true">This is the set of options used to create the Menu.</param>
        /// <returns type="People.UiFlyoutMenu"></returns>

        /// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
        var realOptions = /*@static_cast(People.UiFlyoutMenu.DefaultOptions)*/extend(options, UiFlyoutMenu.defaultOptions);
        if (!realOptions.container) {
            realOptions.container = document.createElement('span');
            realOptions.container.innerHTML = '<span class="c_mlu"></span><span class="c_chev"> &#xE015;</span>';
        }
        var menu = new UiFlyoutMenu(realOptions.container);

        if (realOptions.html) {
            menu.setHtml(realOptions.html);
        }

        return menu;
    };

    // ---------------------------------------------------------------------------------------------------------------

    P.UiFlyoutMenuItem = UiFlyoutMenuItem;
    /* @bind(People.UiFlyoutMenuItem) */function UiFlyoutMenuItem(container) {
        /// <summary>
        /// This creates a MenuItem, which is used to render A\Span tags in a menu.
        /// </summary>
        /// <param name="container" type="HtmlElement" optional="true">The container item for the MenuItem.</param>

        var _this = this;

        _this.$obj = container;

        _nullItems(_this, false);
    };

    
    UiFlyoutMenuItem.__class = true;
    

    var UiFlyoutMenuItemPrototype = UiFlyoutMenuItem.prototype;
    // This defines all of the private member variables on the object, for intellisense and coffemaker, 
    // these values are overriden in the objects constructor
    /* @type(HTMLELement) */UiFlyoutMenuItemPrototype.$obj = null;
    /* @type(HTMLELement) */UiFlyoutMenuItemPrototype._$button = null;
    /* @type(HTMLELement) */UiFlyoutMenuItemPrototype._$sep = null;
    /* @type(Function) */UiFlyoutMenuItemPrototype._aclickHandler = null;
    /* @type(People.UiFlyoutMenu) */UiFlyoutMenuItemPrototype.$parentMenu = null;

    UiFlyoutMenuItemPrototype.setHtml = function (html) {
        /// <summary>
        /// This sets the html of the MenuItem.
        /// </summary>
        /// <param name="html" type="String">This is the html that will be set.</param>
        /// <returns type="People.UiFlyoutMenuItem">Returns this instance so that calls can be chained.</returns>

        var _this = this;

        _createButton(_this);

        _this._$button.innerHTML = html;

        return _this;
    };

    UiFlyoutMenuItemPrototype.setAriaLabel = function (label) {
        var _this = this;

        if (_this._$button) {
            _this._$button.setAttribute('aria-label', label);
        }
    };

    var _internalId = 0;
    function _generateId() {
        _internalId++;
        return 'uimenuitem_' + String(_internalId);

    }

    function _createButton(_this) {
        /// <summary>
        /// This is a helper method that makes sure we have an anchor tag.
        /// </summary>
        /// <param name="_this" type="People.UiFlyoutMenuItem">The MenuItem instance.</param>

        if (!_this._$button) {
            _this._$button = document.createElement('button');
            _this._$button.setAttribute('class', 'win-command');
            _this._$button.setAttribute('role', 'menuitem');
            _this.$obj.appendChild(/* @static_cast(Node) */_this._$button);
            Jx.addClass(_this.$obj, "uiflyoutmenuitem");

            _this._$button.id = _generateId();
        }
    };

    UiFlyoutMenuItemPrototype.removeClick = function () {
        /// <summary>
        /// This removes the current anchor tag click handler.
        /// </summary>
        /// <returns type="People.MenuItem">Returns this instance so that calls can be chained.</returns>

        var _this = this;

        if (_this._aclickHandler) {
            _this._aclickHandler = null;
        }

        return _this;
    };

    UiFlyoutMenuItemPrototype.addClick = function (func) {
        /// <summary>
        /// This adds the anchor tag click handler. Clears href by default, but if keep Href is set to true then the href is kept.
        /// </summary>
        /// <param name="func" type="Function">This is the click handler that will be attached to the anchor tag.</param>
        /// <param name="keepHref" type="Boolean" optional="true">If this is set to true then the current href will be kept.</param>
        /// <returns type="People.MenuItem">Returns this instance so that calls can be chained.</returns>

        var _this = this;

        _createButton(_this);

        _this.removeClick();


        // Create wrapper so if an error happens we dont clobber the history
        _this._aclickHandler = function () {
            var output;
            try {
                output = func();
            }
            catch (e) {
                return false;
            }
            return output;
        };

        _this._$button.onclick = function (event) {
            if (_this._aclickHandler) {
                _this._aclickHandler();
            }
            if (_this.$parentMenu) {
                _this.$parentMenu.hide();
            }
            event.stopPropagation();
            return false;
        };

        _this._$button.onkeydown = function (event) {
            var key = event.keyCode;

            if (key === cUpArrowKey) {
                _this.$parentMenu.setItemFocus(_this, -1);
            } else if (key === cDownArrowKey) {
                _this.$parentMenu.setItemFocus(_this, 1);
            } else if (key === cEscKey) {
                // Required as some pages override the ESC key and we don't get the option 
                // to cancel the menu
                _this.$parentMenu.hide();
                _this.$parentMenu.setFocus();
            } else {
                return;
            }
            event.stopPropagation();
            return false;
        };

        return _this;
    };

    UiFlyoutMenuItemPrototype.getActiveId = function () {
        ///<summary>
        /// Returns the id of the active child element (button) for the menu item
        ///</summary>
        var _this = this;
        if (_this._$button) {
            return _this._$button.id;
        }
        return '';
    };

    UiFlyoutMenuItemPrototype.setFocus = function () {
        ///<summary>
        /// Sets this item as having focus
        ///</summary>
        var _this = this;
        if (_this._$button) {
            _this._$button.focus();
        }
    };

    UiFlyoutMenuItemPrototype.addSeparator = function () {
        /// <summary>
        /// This adds a separator at the end of this MenuItem.
        /// </summary>
        /// <returns type="People.UiFlyoutMenuItem">Returns this instance so that calls can be chained.</returns>

        var _this = this;

        if (!_this._$sep) {
            _this._$sep = document.createElement('hr');
            _this.$obj.appendChild(/* @static_cast(Node) */_this._$sep);
        }
        _this._$sep.style.display = 'block';

        return _this;
    };

    UiFlyoutMenuItemPrototype.removeSeparator = function () {
        /// <summary>
        /// This removes a separator at the end of this MenuItem.
        /// </summary>
        /// <returns type="People.UiFlyoutMenuItem">Returns this instance so that calls can be chained.</returns>

        var _this = this;

        if (_this._$sep) {
            _this._$sep.style.display = 'none';
        }

        return _this;
    };

    function _nullItems(/* @type(People.UiFlyoutMenuItem) */_this, nullObject) {
        /// <summary>
        /// This nulls out all of the items stored on this object
        /// </summary>
        /// <param name="_this" type="People.UiFlyoutMenuItem">This is the MenuItem instance to null out.</param>

        if (nullObject) {
            _this.$obj = null;
        }
        _this._$button = null;
        _this._$span = null;
        _this._$sep = null;
        _this.$parentMenu = null;
    }

    UiFlyoutMenuItemPrototype.dispose = function () {
        /// <summary>
        /// This removes all event handlers and clears out all of its state.
        /// </summary>

        var _this = this;

        _this.removeClick();

        _nullItems(_this, true);
    };

    UiFlyoutMenuItem.defaultOptions = {
        html: '',
        separator: false,
        click: null,
        container: null
    };

    
    UiFlyoutMenuItem.DefaultOptions = function () {
        /// <summary>
        /// DO NOT CREATE AN INSTANCE. This class is for cofeemaker signatures
        /// </summary>
    };
    UiFlyoutMenuItem.DefaultOptions.prototype = UiFlyoutMenuItem.defaultOptions;
    UiFlyoutMenuItem.DefaultOptions.__class = true;
    

    UiFlyoutMenuItem.create = function (options) {
        /// <summary>
        /// This creates a MenuItem with options.
        /// </summary>
        /// <param name="options" type="People.UiFlyoutMenuItem.DefaultOptions" optional="true">This is the set of options used to create the MenuItem.</param>
        /// <returns type="People.UiFlyoutMenuItem"></returns>

        /// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
        var realOptions = /*@static_cast(People.UiFlyoutMenuItem.DefaultOptions)*/extend(options, UiFlyoutMenuItem.defaultOptions);
        if (!realOptions.container) {
            realOptions.container = document.createElement('div');
        }
        var menuItem = new UiFlyoutMenuItem(realOptions.container);

        if (realOptions.html) {
            menuItem.setHtml(realOptions.html);
        }

        if (realOptions.separator) {
            menuItem.addSeparator();
        }

        if (realOptions.click) {
            // we need to keep the url if we have one
            menuItem.addClick(realOptions.click);
        }

        return menuItem;
    };


});
