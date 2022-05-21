
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true*/
/*global Mail,Jx,Debug,Microsoft,WinJS*/

Jx.delayDefine(Mail, "MoveFlyout", function () {
    Mail.MoveFlyout = {};

    var P = Microsoft.WindowsLive.Platform;

    // Maps the last folder move target per-account
    var lastMoveTarget= {};

    function MoveCommand(node, flyout, selection) {
        Debug.assert(Jx.isObject(node));
        Debug.assert(Jx.isInstanceOf(node.view, Mail.UIDataModel.View));
        Debug.assert(Jx.isObject(flyout));
        Debug.assert(Jx.isObject(selection));

        this.initComponent();
        this._node = node;
        this._flyout = flyout;
        this._selection = selection;
        this._hooks = null;
    }
    Jx.augment(MoveCommand, Jx.Component);

    MoveCommand.prototype.getUI = function (ui) {
        // The menu is transient we intentionally don't handle folder name changes
        var node = this._node, view = node.view;
        ui.html = "<button" +
                    " id='" + this._id + "'" +
                    " class='win-command moveTarget depth" + node.depth + "'" +
                    (Mail.ViewCapabilities.canMoveTo(view) ? "" : " disabled") +
                    " tabIndex='-1'" +
                  ">" +
                      Jx.escapeHtml(view.name) +
                  "</button>";
    };

    MoveCommand.prototype.activateUI = function () {
        Jx.Component.prototype.activateUI.call(this);
        var el = document.getElementById(this._id);
        this._hooks = new Mail.Disposer(
            new Mail.EventHook(el, "click", this._onClick, this),
            // Focus tracks the mouse in the flyout - this is the same as the WinJS menu.
            new Mail.EventHook(el, "mouseover", el.focus, el),
            new Mail.EventHook(el, "mouseout", this._flyout.element.focus, this._flyout.element)
        );
    };

    MoveCommand.prototype.deactivateUI = function () {
        Jx.dispose(this._hooks);
        Jx.Component.prototype.deactivateUI.call(this);
    };

    MoveCommand.prototype._onClick = function () {
        var selection = this._selection,
            view = this._node.view;

        // Remember this move target as the default the next time the menu is invoked
        lastMoveTarget[selection.account.objectId] = view.objectId;

        // Move the messages into the new view
        Mail.moveWithConfirmation(selection, view);

        this._flyout.hide();
    };

    function MoveAllChooserCommand(moveAllDialogContent, node, flyout, selection) {
        Debug.assert(Jx.isObject(moveAllDialogContent));
        Debug.assert(Jx.isObject(node));
        Debug.assert(Jx.isObject(flyout));
        Debug.assert(Jx.isObject(selection));

        this._moveAllDialogContent = moveAllDialogContent;
        MoveCommand.call(this, node, flyout, selection);
    }
    Jx.inherit(MoveAllChooserCommand, MoveCommand);

    MoveAllChooserCommand.prototype._onClick = function () {
        var selection = this._selection, view = this._node.view;
        // Remember this move target as the default the next time the menu is invoked
        lastMoveTarget[selection.account.objectId] = view.objectId;

        this._moveAllDialogContent.chosenView = view;
        this._flyout.hide();
    };

    var MoveOptions = function (selection) {
        Debug.assert(Jx.isObject(selection));

        this._selection = selection;
        this._hook = null;
        this.initComponent();
    };
    Jx.augment(MoveOptions, Jx.Component);

    MoveOptions.prototype.getUI = function (ui) {
        ui.html =
            "<hr class='win-command'>" +
            "<div id='moveAllContainer'>" +
                "<button id='moveAllLink'>" + Jx.escapeHtml(Jx.res.getString("mailMoveAllLink")) + "</button>" +
            "</div>";
    };

    MoveOptions.prototype.activateUI = function () {
        this._hook = new Mail.EventHook(document.getElementById("moveAllContainer"), "click", this._onMoveAllClick, this);
    };

    MoveOptions.prototype.deactivateUI = function () {
        Jx.dispose(this._hook);
    };

    MoveOptions.prototype._onMoveAllClick = function (evt) {
        evt.preventDefault();
        Mail.showMoveAllDialog(this._selection);
    };

    function showMoveAll (selection) {
        var view = selection.view;

        // The move all command is available if the view supports move all
        // and the selected messages support sweep.
        return Mail.ViewCapabilities.supportsMoveAll(view) &&
            Mail.Commands.Contexts.selectedMessagesSupportSweep(selection) &&
            !Mail.SearchHandler.isSearchingAllViews;
    }

    function Splitter() { this.initComponent(); }
    Jx.augment(Splitter, Jx.Component);
    Splitter.prototype.getUI = function (ui) {
        // Match the WinJS command separator to get their CSS for "free"
        ui.html = "<hr class='win-command'>";
    };

    function showMoveFlyout (host, anchor, selection, listItemFactory, flyoutOptions) {
        Debug.assert(Jx.isHTMLElement(host));
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isFunction(listItemFactory));

        // Generate folder heirarchy
        var ViewFilters = Mail.ViewFilters;
        var account = selection.account,
            views = account.queryViews(P.MailViewScenario.move, "moveFlyout"),
            folders = ViewFilters.filterByType(views, ViewFilters.folders),
            categories = ViewFilters.filterByType(views, ViewFilters.categories),
            allFolders = Mail.TreeFlattener.create(folders),
            pinnedFolders = ViewFilters.filterPinned(folders);

        // Show the category section if it's not empty
        var concatenation = [];
        if (categories.count > 0) {
            concatenation.push(Mail.ViewHierarchy.wrapFlat(categories));
            concatenation.push(new Mail.ArrayCollection([{ objectType: "Splitter", objectId: "categorySplitter" }]));
        }

        // Show the pinned section if it's not empty
        if (pinnedFolders.count > 0) {
            concatenation.push(Mail.ViewHierarchy.wrapFlat(pinnedFolders));
            concatenation.push(new Mail.ArrayCollection([{ objectType: "Splitter", objectId: "pinnedSplitter" }]));
        }

        // Always show the all folders section
        concatenation.push(allFolders);
        var collection = new Mail.ConcatenatedCollection(concatenation);

        // Create the folder tree UI in a WinJS.Flyout. Ideally this would use a WinJS.Menu but
        // it requires all commands to be in the same scrollable region. We want the move all command
        // to at the bottom of the menu, outside of the scrollable region.
        var flyout = new WinJS.UI.Flyout(host),
            list = new Jx.List({factory: function (node) {
                return node.objectType === "Splitter" ?  new Splitter() : listItemFactory(node, flyout, selection);
            }}),
            listHost = host.querySelector("#moveFolderList"),
            optionsHost = host.querySelector("#moveOptions");

        list.setSource(collection);
        listHost.innerHTML = Jx.getUI(list).html;
        list.activateUI();
        if (flyoutOptions) {
            optionsHost.innerHTML = Jx.getUI(flyoutOptions).html;
            flyoutOptions.activateUI();
        }

        var lastFlyoutMaxHeight = "";
        function setListHeight() {
            var flyoutMaxHeight = host.style.maxHeight;

            // We only need to recompute the list's max height if the flyout's max height
            // has changed since we last looked
            if (flyoutMaxHeight === lastFlyoutMaxHeight) {
                return;
            }
            lastFlyoutMaxHeight = flyoutMaxHeight;

            // If WinJS set a max height style on the flyout, we need to set a corresponding
            // max height on our list. It should be the height of the flyout minus the height
            // of the options at the bottom.
            if (flyoutMaxHeight) {
                var maxHeight = parseInt(flyoutMaxHeight, 10),
                    rect = optionsHost.getBoundingClientRect();
                listHost.style.maxHeight = (maxHeight - rect.height) + "px";
            } else {
                listHost.style.maxHeight = "";
            }
        }

        // Ensure the flyout is cleaned up when it's hidden
        var disposer = new Mail.Disposer(
            views, pinnedFolders, categories, collection, flyout,
            new Jx.KeyboardNavigation(listHost, "vertical", null, "[disabled]"),
            new Mail.EventHook(flyout, "afterhide", function () {
                list.deactivateUI();
                if (flyoutOptions) {
                    flyoutOptions.deactivateUI();
                }
                list.releaseSource();
                disposer.dispose();
                host.removeNode(true);
            }),
            new Mail.Disposable(Jx.observeAttribute(host, "style", setListHeight), "disconnect")
        );

        // Setup and show the flyout
        var promise = Mail.Promises.waitForEvent(flyout, "aftershow");
        flyout.show(anchor, "top", "center");
        return promise.then(function () {
            // Restore focus to the last used move target
            var moveTarget = lastMoveTarget[selection.account.objectId],
                index = collection.findIndexById(moveTarget);
            Debug.assert(collection.count > 0, "Missing Folders");
            if (index === -1) {
                index = 0;
            }
            // Focus the item and scroll into view if it's below the fold
            var item = list.getElement(index);
            if (item) {
                item.focus();
            }
        });
    }

    function getFlyoutHost(container) {
        Debug.assert(Jx.isHTMLElement(container));
        // Prevent duplicate flyouts from being opened at once. This can occur when
        // using the keyboard shortcut while one is already open.
        if (!document.getElementById("moveFlyout")) {
            container.insertAdjacentHTML("beforeend",
                "<div id='moveFlyout' class='win-menu'>" +
                    "<div id='moveFolderList'></div>" +
                    "<div id='moveOptions'></div>" +
                "</div>");
            return container.lastElementChild;
        }
        return null;
    }

    Mail.MoveFlyout.showMoveFlyout = function (container, selection, anchorId) {
        var host = getFlyoutHost(container);
        function itemFactory(node, flyout, selection) {
            return new MoveCommand(node, flyout, selection);
        }
        if (host) {
            var moveOptions = showMoveAll(selection) ? new MoveOptions(selection) : null;
            return showMoveFlyout(host, anchorId, selection, itemFactory, moveOptions);
        }
    };

    Mail.MoveFlyout.showMoveAllChooserFlyout = function (container, dialogContent, selection) {
        Debug.assert(Jx.isObject(dialogContent));

        var host = getFlyoutHost(container);
        function itemFactory(node, flyout, selection) {
            return new MoveAllChooserCommand(dialogContent, node, flyout, selection);
        }
        if (host) {
            return showMoveFlyout(host, "moveAllChooseFolderLink", selection, itemFactory);
        }
    };

});
