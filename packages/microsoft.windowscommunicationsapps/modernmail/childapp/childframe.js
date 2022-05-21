
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Jx, Mail, People, Debug */
/*jshint browser:true*/
Jx.delayDefine(Mail, "CompFrame", function () {
    "use strict";

    var CompFrame = Mail.CompFrame = function (platform, appState) {
        Mail.log("Frame_Ctor", Mail.LogEvent.start);

        this._name = "Mail.CompFrame";
        this.initComponent();

        var selection = new Mail.Selection(platform, appState),
            guiState = Mail.guiState = new Mail.GUIState(),
            glomManager = new Mail.GlomManager(selection, guiState, platform),
            commandManager = Mail.Globals.commandManager = new Mail.Commands.Manager(glomManager, selection);

        Mail.log("Frame_Ctor_Children", Mail.LogEvent.start);

        var readingPaneSection = this._readingPaneSection = new Mail.ReadingPaneSection(selection, null /* no animator*/),
            commandBar = this._commandBar = new Mail.CompCommandBar(commandManager);
        this.append(readingPaneSection, commandBar);

        Mail.Utilities.ComposeHelper.registerSelection(selection);

        this._disposer = new Mail.Disposer(
            guiState,
            glomManager,
            commandManager,
            Mail.UIDataModel.FolderCache
        );

        Mail.log("Frame_Ctor_Children", Mail.LogEvent.stop);
        Mail.log("Frame_Ctor", Mail.LogEvent.stop);
    };

    CompFrame.frameElementId = "mailFrame";

    Jx.augment(CompFrame, Jx.Component);
    var prototype = CompFrame.prototype;

    Mail.CompMessageList = {
        defaultElementId: "fakeMessageList"
    };

    prototype.getUI = function (ui) {
        /// <param name="ui" type="JxUI"></param>
        Mail.log("Frame_getUI", Mail.LogEvent.start);

        var readingPaneSectionUI = Jx.getUI(this._readingPaneSection),
            commandBarUI = Jx.getUI(this._commandBar);

        ui.html =
            "<div id='mailFrame'>" +
                '<div id="' + Mail.CompMessageList.defaultElementId + '" class="hidden"></div>' +
                readingPaneSectionUI.html +
                '<div id="fakePeekBar"></div>' +
            "</div>" +
            "<div id='mailFrameCommandBar'>" + commandBarUI.html + "</div>";

        Debug.assert(readingPaneSectionUI.css + commandBarUI.css === "");

        Mail.log("Frame_getUI", Mail.LogEvent.stop);
    };

    prototype.onActivateUI = function () {
        Mail.guiState.updateViewState();
        this._disposer.add(Mail.EventHook.createEventManagerHook(this, People.DialogEvents.closed, this._onDialogClosed, this));
    };

    prototype.onDeactivateUI = function () {
        Jx.dispose(this._disposer);
    };

    prototype._onDialogClosed = function () {
        Jx.safeSetActive(document.getElementById(CompFrame.frameElementId));
    };

    prototype.postStartupWork = function () {
        this._commandBar.register();
        this.postStartupWork = Jx.fnEmpty;  // only needs to happen once
    };

});
