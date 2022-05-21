
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <reference path="../../Shared/JSUtil/Include.js"/>
/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../Shared/Navigation/UriGenerator.js"/>
/// <reference path="../../AppFrame/Main.js"/>
/// <reference path="../../AppFrame/AppCommand.ref.js"/>
/// <reference path="../../AppFrame/AppBar.js"/>

Jx.delayDefine(People, "MeCommands", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People,
        N = P.Nav;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.MeCommands = {

        addCommands: function (host) {
            ///<summary>Adds commands to the command bar</summary>
            ///<param name="host" type="P.CpMain">Host providing getCommandBar </param>
            var commandBar = host.getCommandBar();
            var platform = host.getPlatform();
            var commands = this.getCommands(platform);
            commands.forEach(function (command) {
                commandBar.addCommand(command);
            });
            commandBar.refresh();
        },
        
        getCommands: function (platform) {
            ///<summary>Gets commands for Me</summary>
            ///<param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
            ///<return type="Array">An array of command objects </return>

            // If the defaultAccount is not connected, don't show the MeContact Profile edit button
            if (platform.accountManager.defaultAccount.lastAuthResult === Microsoft.WindowsLive.Platform.Result.defaultAccountDoesNotExist) {
                return [];
            }

            // Bsrc and Bpub tags are for server-side telemetry
            var profileUrl = "https://profile.live.com/details?Bsrc=Modern&Bpub=WinPeople";
            
            if (Jx.app.getEnvironment() === "INT") {
                profileUrl = "https://profile.live-int.com/details";
            }
            

            var cmdEdit = new P.Command("cmdid_mePrf_edit",
                "/strings/profileCommandButtonEdit", null,
                "\uE104", true, true, null, null, profileUrl);
            return [cmdEdit];
        },
    };
});
