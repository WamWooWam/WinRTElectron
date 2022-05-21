
//
// Copyright (C) Microsoft. All rights reserved.
//

Jx.delayDefine(People, "Flyout", function () {
    
    var P = window.People;

    P.Flyout = function (flyoutItems) {
        /// <summary>Flyout that allows highlighting the currently selected item when opened.</summary>
        /// <param name="flyoutItems" type="Array">An array of FlyoutItemDescriptor to show in flyout.</param>
        Debug.assert(Jx.isArray(flyoutItems) && flyoutItems.length > 0, "Flyout needs to have an array of at least one item.");

        // build flyout element
        var flyoutElement = this._flyoutElement = document.createElement("div");
        flyoutElement.className = "flyoutMenu";
        this._flyout = new WinJS.UI.Flyout(flyoutElement);

        // add flyout items and hook up listeners
        this._itemListeners = [];
        var itemsContainer = this._itemsContainer = document.createElement("div");
        flyoutItems.forEach(function (/*@type(FlyoutItemDescriptor)*/item, index) {
            this._addFlyoutItem(item, index);
        }, this);
        this._keyboardNavigation = new Jx.KeyboardNavigation(itemsContainer, "vertical", null, null, 1);

        flyoutElement.appendChild(itemsContainer);
    };

    P.Flyout.prototype._addFlyoutItem = function (item, index) {
        /// <param name="item" type="FlyoutItemDescriptor" />
        /// <param name="index" type="Number" />
        var itemDiv = document.createElement("div");
        itemDiv.id = "flyoutMenu-item-" + item.id;
        itemDiv.innerHTML = item.name || item.html;
        itemDiv.tabIndex = -1;
        itemDiv.className = "flyoutMenu-item" + (item.selected ? " selected-item" : "");

        var clicked = /*@bind(P.Flyout)*/function () {
            this._flyout.hide();
            item.onItemSelected();
        }.bind(this);
        this._itemListeners.push(new Jx.Clicker(itemDiv, clicked));

        this._itemsContainer.appendChild(itemDiv);
    };

    P.Flyout.prototype.getFlyoutElement = function () {
        /// <returns type="HTMLElement"/>
        return this._flyoutElement;
    };

    P.Flyout.prototype.show = function (anchor, placement, alignment, callback) {
        /// <param name="anchor" type="HTMLElement" />
        /// <param name="placement" type="String" />
        /// <param name="alignment" type="String" />
        /// <param name="callback" type="Function" />
        var aftershow = /*@bind(P.Flyout)*/function () {
            var selectedItem = this._itemsContainer.querySelector(".selected-item");
            if (!Jx.isNullOrUndefined(selectedItem)) {
                selectedItem.focus();
            }
        }.bind(this);
        this._flyout.addEventListener("aftershow", aftershow);

        this._flyout.addEventListener("afterhide", function () { callback(); });

        document.body.appendChild(this._flyoutElement);
        this._flyout.show(anchor, placement, alignment);
    };

    P.Flyout.prototype.dispose = function () {
        this._itemListeners.forEach(function (listener) {
            Jx.dispose(listener);
        });
        Jx.dispose(this._keyboardNavigation);
        document.body.removeChild(this._flyoutElement);
    };
});
