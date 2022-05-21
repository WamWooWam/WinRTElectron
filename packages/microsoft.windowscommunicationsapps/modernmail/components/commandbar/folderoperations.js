
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global  Jx, Mail, Microsoft, WinJS, Windows, Debug */
/*jshint browser:true*/

Jx.delayDefine(Mail.Commands, "FolderOperations", function () {
    "use strict";
    var Plat = Microsoft.WindowsLive.Platform,
        MailFolderType = Plat.MailFolderType;

    var FolderOperations = Mail.Commands.FolderOperations = {};

    FolderOperations._areAnyFolderOperationsEnabled = function () {
        var guiState = Mail.guiState;
        return !(guiState.isOnePane && guiState.isReadingPaneActive) && (!Mail.SearchHandler.isSearching);
    };

    FolderOperations.folderOperationsEnabled = function (selection) {
        var enabled = FolderOperations._areAnyFolderOperationsEnabled();

        if (enabled) {
            var commands = FolderOperations._createCommandList("", selection, true/*stopAtOne*/);
            enabled = commands.length > 0;
        }

        return enabled;
    };

    function commandNewFolder(anchor, selection, postCommands) {
        var currentView = selection.view,
            currentAccount = selection.account,
            currentFolder = currentView.folder,
            ViewCapabilities = Mail.ViewCapabilities;

        Debug.assert(Jx.isInstanceOf(currentView, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isInstanceOf(currentAccount, Mail.Account));

        if (currentFolder && currentAccount.canCreateFolders) {
            postCommands.push({
                id: "MailFolderOperations.NewFolder",
                label: Jx.res.getString("mailCreateFolder"),
                onclick: function () { showFlyout(anchor, new NewFolder(selection.account)); },
            });
            if (ViewCapabilities.canHaveChildren(currentView)) {
                postCommands.push({
                    id: "MailFolderOperations.NewSubFolder",
                    label: Jx.res.getString("mailCreateSubfolder"),
                    onclick: function () { showFlyout(anchor, new NewSubfolder(selection.view)); },
                });
            }
        }
    }

    function commandRenameFolder(anchor, selection, postCommands) {
        var currentView = selection.view,
            currentAccount = selection.account,
            ViewCapabilities = Mail.ViewCapabilities;

        Debug.assert(Jx.isInstanceOf(currentView, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isInstanceOf(currentAccount, Mail.Account));

        if (ViewCapabilities.canRename(currentView) && currentAccount.canUpdateFolders) {
            postCommands.push({
                id: "MailFolderOperations.RenameFolder",
                label: Jx.res.getString("mailFolderOperationsRenameFolder"),
                onclick: function () { showFlyout(anchor, new RenameFolder(selection.view.folder)); },
            });
        }
    }

    function commandDeleteFolder(anchor, selection, postCommands) {
        var currentView = selection.view;
            
        Debug.assert(Jx.isInstanceOf(currentView, Mail.UIDataModel.MailView));

        if (currentView.canDeleteSource()) {
            postCommands.push({
                id: "MailFolderOperations.DeleteFolder",
                label: Jx.res.getString("mailFolderOperationsDeleteFolder"),
                onclick: function () { return FolderOperations.onDeleteView(selection); }
            });
        }
    }

    function commandPinFolder(anchor, selection, postCommands) {
        var currentView = selection.view,
            currentAccount = selection.account,
            ViewCapabilities = Mail.ViewCapabilities;

        Debug.assert(Jx.isInstanceOf(currentView, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isInstanceOf(currentAccount, Mail.Account));

        if (ViewCapabilities.canPinToStart(currentView)) {
            if (Mail.Commands.Contexts.showPin(selection)) {
                postCommands.push({
                    id: "MailFolderOperations.pinFolder",
                    label: Jx.res.getString("mailCommandPinFolder"),
                    onclick: function () { return Mail.Commands.Handlers.onPinFolder(selection, anchor); }
                });
            } else {
                postCommands.push({
                    id: "MailFolderOperations.unpinFolder",
                    label: Jx.res.getString("mailCommandUnpinFolder"),
                    onclick: function () { return Mail.Commands.Handlers.onUnpinFolder(selection, anchor); }
                });
            }
        }        
    }

    function commandEmptyAndMarkAsRead(anchor, selection, commands) {
        var currentView = selection.view,
            currentAccount = selection.account,
            currentFolder = currentView.folder;

        Debug.assert(Jx.isInstanceOf(currentView, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isInstanceOf(currentAccount, Mail.Account));

        if (currentFolder) {
            var unreadMessageCollection = currentView.getMessages(Plat.FilterCriteria.unread),
                messageCollection = currentView.getMessages(Plat.FilterCriteria.all);

            // Special case: If the current folder is the deleted folder, then the empty folder operations command can be used
            // even if there are no messages in the folder.
            var isDeletedItemFolderWithChildren = false;
            if (currentFolder.specialMailFolderType ===  MailFolderType.deletedItems) {
                var children = currentFolder.getChildFolderCollection();
                isDeletedItemFolderWithChildren = children.count > 0;
                children.dispose();
            }
            if ((messageCollection && messageCollection.count > 0) || isDeletedItemFolderWithChildren) {
                commands.push({
                    id: "MailFolderOperations.EmptyFolder",
                    label: Jx.res.getString("mailFolderOperationsEmptyFolder"),
                    onclick: function () { return FolderOperations._onEmptyFolder(selection); },
                });
            }
            if (unreadMessageCollection && unreadMessageCollection.count > 0) {
                commands.push({
                    id: "MailFolderOperations.MarkAsRead",
                    label: Jx.res.getString("mailFolderOperationsMarkAsRead"),
                    onclick: function () { return FolderOperations._onMarkViewAsRead(selection); },
                });
            }
            Jx.dispose(unreadMessageCollection);
            Jx.dispose(messageCollection);
        }
    }

    var postCommandFactories = [
        commandNewFolder,
        commandRenameFolder,
        commandDeleteFolder,
        commandPinFolder
    ];
    var commandFactories = [
        commandEmptyAndMarkAsRead
    ];

    FolderOperations._createCommandList = function (anchor, selection, stopAtOne) {
        _markStart("_createCommandList");
        var commands = [],
            postCommands = [],
            factoryIndex,
            maxFactoryIndex;
        
        if (stopAtOne) {
            _markInfo("StopAtOne");
        } else {
            _markInfo("FullList");
        }

        for(factoryIndex = 0, maxFactoryIndex = postCommandFactories.length; (!stopAtOne || postCommands.length === 0) && factoryIndex < maxFactoryIndex; ++factoryIndex) {
            postCommandFactories[factoryIndex](anchor, selection, postCommands);
        }
        if (postCommands.length === 0 || !stopAtOne) {
            for(factoryIndex = 0, maxFactoryIndex = commandFactories.length; (!stopAtOne || commands.length === 0) && factoryIndex < maxFactoryIndex; ++factoryIndex) {
                commandFactories[factoryIndex](anchor, selection, commands);
            }
        }
        if (commands.length > 0 && postCommands.length > 0) {
            commands.push({
                id: "MailFolderOperations.Separator",
                label: "",
                type: "separator"
            });
        }

        commands = commands.concat(postCommands);
        _markStop("_createCommandList");
        return commands;
    };

    FolderOperations.onFolderOptionsButton = function (anchor, selection) {
        // Make sure the app bar is shown.  If it is already shown this will complete right away
        Mail.Globals.commandManager.showAppBar().then(function () { FolderOperations._openFolderOperationsMenu(anchor, selection); });
    };

    FolderOperations._openFolderOperationsMenu = function (anchor, selection) {
        // Check if flyout already exists:
        _markStart("onFolderOptionsButton");
        var flyoutElement = document.getElementById("mailFolderOperationsFlyout");
        if (Jx.isHTMLElement(flyoutElement)) {
            // This shouldn't happen except on strange race conditions on really slow machines.
            // Or if the flyout is bugged.  Removing from dom and letting the user press the button again.
            var appRoot = document.getElementById(Mail.CompApp.rootElementId);
            Debug.assert(Jx.isHTMLElement(appRoot));
            appRoot.removeChild(flyoutElement);
        } else {
            var flyout = FolderOperations.createFolderOperationsFlyout(anchor, selection);
            flyout.show(anchor, "top", "center");
        }
        _markStop("onFolderOptionsButton");
    };

    FolderOperations.createFolderOperationsFlyout = function (anchor, selection) {
        _markStart("createFolderOperationsFlyout");
        Debug.assert(Jx.isNonEmptyString(anchor));
        Debug.assert(Jx.isObject(selection));

        var domFlyout = document.createElement("div");
        domFlyout.id = "mailFolderOperationsFlyout";
        Mail.setAttribute(domFlyout, "aria-label", Jx.res.getString("mailCommandFolderOperationsLabel"));

        var appRoot = document.getElementById(Mail.CompApp.rootElementId);
        Debug.assert(Jx.isHTMLElement(appRoot), "Cannot locate the HTML Element<idCompApp> to append the flyout too");
        appRoot.appendChild(domFlyout);

        var flyout = new WinJS.UI.Menu(domFlyout, { commands:FolderOperations._createCommandList(anchor, selection), sticky: true });
        flyout.addEventListener("afterhide", function () {
            // clicking the appbar button faster than the hide animation finishes can cause
            // afterhide to trigger twice.  Should only remove the domFlyout once.
            Mail.safeRemoveNode(domFlyout, true /* deep */);
        }, true);

        _markStop("createFolderOperationsFlyout");
        return flyout;
    };

    FolderOperations._onEmptyFolder = function (selection) {
        var popups = Windows.UI.Popups;
        var messageDialog = new popups.MessageDialog(
            Jx.res.getString("mailFolderOperationsEmptyFolderConfirmationBody"),
            Jx.res.getString("mailFolderOperationsEmptyFolderConfirmationTitle")
        );
        messageDialog.commands.append(new popups.UICommand(
            Jx.res.getString("mailFolderOperationsEmptyFolderConfirm"),
            function () { FolderOperations._emptyView(selection); }
        ));
        messageDialog.commands.append(new popups.UICommand(
            Jx.res.getString("mailFolderOperationsEmptyFolderCancel"),
            Jx.fnEmpty
        ));
        messageDialog.defaultCommandIndex = 1;
        messageDialog.cancelCommandIndex = 1;
        Mail.showPopupAsync(messageDialog);
    };

    FolderOperations._emptyView = function (selection) {
        _markStart("_emptyView");
        selection.emptyView();

        var view = selection.view;
        if (view.type === Plat.MailViewType.deletedItems) {
            Debug.assert(Jx.isObject(view.folder));

            // Purge all the sub folders of deleted items as part of empty
            var children = view.folder.getChildFolderCollection();
            for (var i = children.count; i--;) {
                children.item(i).deleteObject();
            }
        }
        _markStop("_emptyView");
    };

    FolderOperations._onMarkViewAsRead = function (selection) {
        _markStart("_onMarkViewAsRead");
        selection.markViewRead();
        _markStop("_onMarkViewAsRead");
    };

    FolderOperations.onDeleteView = function (selection) {
        // Check to make sure the current view can be moved/deleted.
        var view = selection.view;
        if (view.canDeleteSource()) {
            if (Mail.Commands.Contexts.showUnpin(selection)) {
                // Collect tileID before deleting folder.
                var tileId = selection.view.startScreenTileId;
                view.deleteSource();

                // Make sure app bar is on screen and offer to unpin
                Mail.Globals.commandManager.showAppBar().then(function () {
                    Mail.Commands.Handlers.unpinFolder(tileId);
                });
            } else {
                view.deleteSource();
            }
        }
    };

    function showFlyout(anchor, content) {
        if (!document.querySelector('.folderOperation')) {
            var options = { anchor: anchor, singleShow: true };
            return new Mail.Flyout(document.getElementById(Mail.CompApp.rootElementId), content, options).show();
        }
    }

    var FolderOperation = function () {
        Mail.FlyoutContent.call(this);
        this._title = "";
        this._error = "";
        this._root = null;
        this._input = null;
        this._disposer = null;
    };
    Jx.inherit(FolderOperation, Mail.FlyoutContent);

    FolderOperation.prototype.getUI = function (ui) {
        var placeholder = Jx.escapeHtml(Jx.res.getString("mailFolderOperationsPlaceholderFolderName"));
        ui.html = "<div id='" + this._id + "' class='folderOperation'>" +
                    "<div class='title'>" + Jx.escapeHtml(this._title) + "</div>" +
                    "<input class='name' type='text' MaxLength='128' placeholder='" + placeholder + "'>" +
                    (this._error ? "<div class='error'>" + Jx.escapeHtml(this._error) + "</div>" : "") +
                    "<button class='commit'>" + Jx.escapeHtml(Jx.res.getString("mailOkButton")) + "</button>" +
                  "</div>";
    };

    FolderOperation.prototype.onActivateUI = function () {
        var root = this._root = document.getElementById(this._id);
        this._input = root.querySelector(".name");
        this._disposer = new Mail.Disposer(
            new Mail.EventHook(root.querySelector(".commit"), "click", this._operate, this),
            new Mail.EventHook(root, "keypress", this._onKeyPress, this)
        );
    };

    FolderOperation.prototype.onDeactivateUI = function () {
        Jx.dispose(this._disposer);
    };

    FolderOperation.prototype._onKeyPress = function (ev) {
        if (ev.key === "Enter") {
            ev.preventDefault();
            this._operate();
        }
    };

    FolderOperation.prototype._operate = function () {
        var name = this._input.value;
        if (name) {
            try {
                return this._commit(name);
            } catch (e) {
                Jx.log.exception("Folder operation failed", e);
            }
        }

        // Re-show our flyout in the error state - invalid name or commit failed
        this._error = this._error || Jx.res.getString("mailFolderOperationsCreateFolderError");
        this._flyout.replace(this);
    };

    var RenameFolder = function (folder) {
        Debug.assert(Jx.isInstanceOf(folder, Mail.UIDataModel.MailFolder));
        FolderOperation.call(this);

        this._folder = folder;
        this._title = Jx.res.getString("mailFolderOperationsRenameFolder");
    };
    Jx.inherit(RenameFolder, FolderOperation);

    RenameFolder.prototype._commit = function (name) {
        var folder = this._folder.platformMailFolder;
        if (folder && folder.canRename) {
            folder.folderName = name;
            folder.commit();
        }
        this._flyout.hide();
    };

    RenameFolder.prototype.onActivateUI = function () {
        FolderOperation.prototype.onActivateUI.call(this);
        this._input.value = this._folder.folderName;
    };

    var NewFolder = function (account) {
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));
        FolderOperation.call(this);

        this._account = account;
        this._title = Jx.res.getString("mailCreateFolder");
    };
    Jx.inherit(NewFolder, FolderOperation);

    NewFolder.prototype._commit = function (name) {
        var folder = this._account.createFolder(name);
        this._flyout.replace(new CreatedFolder(Jx.res.loadCompoundString("mailCreateFolderText", folder.folderName)));
    };

    var NewSubfolder = function (parentView) {
        Debug.assert(Jx.isInstanceOf(parentView, Mail.UIDataModel.MailView));
        NewFolder.call(this, parentView.account);

        var parent = this._parent = parentView.folder;
        this._title = Jx.res.loadCompoundString("mailCreateSubfolderTitle", parent.folderName);
    };
    Jx.inherit(NewSubfolder, NewFolder);

    NewSubfolder.prototype._commit = function (name) {
        var parent = this._parent,
            folder = this._account.createFolder(name, parent),
            text = Jx.res.loadCompoundString("mailCreateSubfolderText", folder.folderName, parent.folderName);
        this._flyout.replace(new CreatedFolder(text));
    };

    // Flyout that's shown once a new folder is successfully created
    var CreatedFolder = function (text) {
        Mail.FlyoutContent.call(this);
        this._text = text;
        this._hook = null;
    };
    Jx.inherit(CreatedFolder, Mail.FlyoutContent);

    CreatedFolder.prototype.getUI = function (ui) {
        ui.html = "<div id='" + this._id + "' class='folderOperation'>" +
                      "<div class='blurb'>" + Jx.escapeHtml(this._text) + "</div>" +
                      "<button class='commit'>" + Jx.escapeHtml(Jx.res.getString("mailOkButton")) + "</button>" +
                  "</div>";
    };

    CreatedFolder.prototype.activateUI = function () {
        this._hook = new Mail.EventHook(document.getElementById(this._id), "click", this._flyout.hide, this._flyout);
    };

    CreatedFolder.prototype.deactivateUI = function () {
        Jx.dispose(this._hook);
    };

    function _markStart(str) {
        Jx.mark("Mail.Commands.FolderOperations." + str + ",StartTA,Mail");
    }
    function _markStop(str) {
        Jx.mark("Mail.Commands.FolderOperations." + str + ",StopTA,Mail");
    }
    function _markInfo(str) {
        Jx.mark("Mail.Commands.FolderOperations:" + str);
    }

});
