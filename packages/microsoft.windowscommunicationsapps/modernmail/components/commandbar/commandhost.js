
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail.Commands, "Host", function () {

    Mail.Commands.Host = /* @constructor*/function () {
        this._viewState = Jx.ApplicationView.getState();
        this._sortedRegisteredCommandsIds = [].concat(this.registeredCommandIds).sort();
        this._showingCommandIds = [];
        this._cmdHosthooks = null;
        this._currentComposeState = null;
        this._currentCanvasState = null;
    };

    Object.defineProperty(Mail.Commands.Host.prototype, "registeredCommandIds", { get: function () { Debug.assert(false, "must override"); }, enumerable: true });

    Mail.Commands.Host.prototype.activateCommands = function (commands) {
        /// <summary>This function is called by the commandManager when the commandHost is registered
        /// The command Host is given the list of commandItems that it registered for so that it can
        /// register, event listeners, fixed up tooltips, etc
        ///</summary>
        /// <param name="commandOptions" type="Array"></param>

        Debug.assert(false, "must override");
    };

    Mail.Commands.Host.prototype.activateUI = function () {
        var cmdManager = /* @static_cast(Mail.Commands.Manager) */Mail.Globals.commandManager;
        this._cmdHosthooks = new Mail.Disposer(
            new Mail.EventHook(Mail.guiState, "viewStateChanged", this._viewStateChanged, this),
            new Mail.EventHook(cmdManager, Mail.Commands.Events.onAddContext, this._onAddContextHost, this),
            new Mail.EventHook(cmdManager, Mail.Commands.Events.onRemoveContext, this._onRemoveContextHost, this));
        // Since compose starts async at startup at the same time this does it could have completed before we did
        var selection = cmdManager.getContext("composeSelection");
        if (selection) {
            this._onAddContextHost("composeSelection");
        }
    };

    Mail.Commands.Host.prototype.deactivateUI = function () {
        Jx.dispose(this._cmdHosthooks);
    };

    Mail.Commands.Host.prototype.updateEnabledLists = function (showingList, hiddenList) {
        showingList = showingList.sort();
        hiddenList = hiddenList.sort();
        this._showingCommandIds = this._minus(this._union(this._showingCommandIds, showingList), hiddenList);
    };

    Mail.Commands.Host.prototype.consumeCommands = function () {
        var consumeCommands = this._minus(this._sortedRegisteredCommandsIds, this.composeCommands());
        this.consumeCommands = function () { return consumeCommands; };
        return consumeCommands;
    };

    Mail.Commands.Host.prototype.composeCommands = function () {
        Debug.assert(false, "must override");
    };

    Mail.Commands.Host.prototype.viewStateCommands = function (viewState) {
        Debug.assert(false, "must override");
    };

    Mail.Commands.Host.prototype.commandsToShow = function () {
        var composeCommands = this._composeInFocus() ? this.composeCommands() : this.consumeCommands(),
            viewStateCommands = this.viewStateCommands(this._viewState);

        Debug.call( function() {
            // viewStateCommands must be in alphabetical order
            var sortedCopy = viewStateCommands.concat([]).sort();
            // Assert if the sorted array does not match the non-sorted array
            Debug.assert(!viewStateCommands.some(function(element, index) {
                return element !== sortedCopy[index];
            }));
        });
        return this._intersection(this._showingCommandIds, composeCommands, viewStateCommands);
    };

    Mail.Commands.Host.prototype.commandsToHide = function () {
        return this._minus(this._sortedRegisteredCommandsIds, this.commandsToShow());
    };

    Mail.Commands.Host.prototype.showCommands = function () {
        /// <summary>Implements the CommandHost interface.  This function is called by the CommandManager when a context is enabled</summary>

        Debug.assert(false, "must override");
    };

    Mail.Commands.Host.prototype.toggleCommand = function (commandId, isSelected) {
        /// <summary>Implements the CommandHost interface.  This function is called by the CommandManager when a context is toggled</summary>
        /// <param name="commandIds" type="String"/>
        /// <param name="isSelected" type="Boolean"/>

        Debug.assert(false, "must override");
    };

    Mail.Commands.Host.prototype.applyReducedClass = function () {
        // this method is empty is this base class; only the CommandBar is overriding.
    };

    Mail.Commands.Host.prototype._composeInFocus = function () {
        var selection = Mail.Globals.commandManager.getContext("composeSelection");
        return selection && selection.composeInFocus;
    },

    Mail.Commands.Host.prototype._canvasInFocus = function () {
        var selection = Mail.Globals.commandManager.getContext("composeSelection");
        return selection && selection.canvasInFocus;
    },

    Mail.Commands.Host.prototype._onAddContextHost = function (key) {
        /// <param name="key" type="String">a unique string to identify the context</param>

        if (key === "composeSelection") {
            var selection = Mail.Globals.commandManager.getContext(key);
            selection.addListener("focuschange", this._onComposeSelectionChange, this);
        }
    };

    Mail.Commands.Host.prototype._onRemoveContextHost = function (key) {
        /// <param name="key" type="String">a unique string to identify the context</param>

        if (key === "composeSelection") {
            var selection = Mail.Globals.commandManager.getContext(key);
            selection.removeListener("focuschange", this._onComposeSelectionChange, this);
        }
    };

    Mail.Commands.Host.prototype._onComposeSelectionChange = function () {
        var currentComposeState = this._composeInFocus(),
            currentCanvasState = this._canvasInFocus();
        if (currentComposeState !== this._currentComposeState || currentCanvasState !== this._currentCanvasState) {
            this._currentComposeState = currentComposeState;
            this._currentCanvasState = currentCanvasState;
            this.showCommands();
            this.applyReducedClass(currentCanvasState, this._viewState, true /* composeStateChange */);
        }
    };

    Mail.Commands.Host.prototype._viewStateChanged = function (newState) {
        this._viewState = newState;
        if (Jx.isNullOrUndefined(this._currentComposeState)) {
            this._currentComposeState = this._composeInFocus();
        }
        if (Jx.isNullOrUndefined(this._currentCanvasState)) {
            this._currentCanvasState = this._canvasInFocus();
        }
        this.showCommands();
        this.applyReducedClass(this._currentCanvasState, newState, false /* composeStateChange */);
    };

    Mail.Commands.Host.prototype._intersection = function () {
        var first = Array.prototype.shift.call(arguments),
            second;
        while (second = Array.prototype.shift.call(arguments)) {
            var firstIndex = 0,
                secondIndex = 0,
                result = [];
            while (firstIndex < first.length && secondIndex < second.length) {
                if (first[firstIndex] < second[secondIndex]) {
                    firstIndex++;
                } else if (first[firstIndex] > second[secondIndex]) {
                    secondIndex++;
                } else {
                    result.push(first[firstIndex]);
                    firstIndex++;
                    secondIndex++;
                }
            }
            first = result;
        }
        return first;
    };

    Mail.Commands.Host.prototype._union = function (first, second) {
        var firstIndex = 0,
            secondIndex = 0,
            result = [];
        while (firstIndex < first.length || secondIndex < second.length) {
            if (secondIndex === second.length || first[firstIndex] < second[secondIndex]) {
                result.push(first[firstIndex]);
                firstIndex++;
            } else if (firstIndex === first.length || first[firstIndex] > second[secondIndex]) {
                result.push(second[secondIndex]);
                secondIndex++;
            } else {
                result.push(first[firstIndex]);
                firstIndex++;
                secondIndex++;
            }
        }
        return result;
    };

    Mail.Commands.Host.prototype._minus = function (first, second) {
        var firstIndex = 0,
            secondIndex = 0,
            result = [];
        while (firstIndex < first.length) {
            if (secondIndex === second.length || first[firstIndex] < second[secondIndex]) {
                result.push(first[firstIndex]);
                firstIndex++;
            } else if (first[firstIndex] > second[secondIndex]) {
                secondIndex++;
            } else {
                firstIndex++;
                secondIndex++;
            }
        }
        return result;
    };

});
