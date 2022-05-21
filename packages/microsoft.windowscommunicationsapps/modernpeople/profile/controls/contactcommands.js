
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../Shared/AppTile/Pinning.js"/>
/// <reference path="../../Shared/AppTile/Pinning.ref.js"/>
/// <reference path="../../Shared/JSUtil/Include.js"/>
/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../Shared/Navigation/UriGenerator.js"/>
/// <reference path="../../Shared/Platform/PlatformObjectBinder.ref.js"/>
/// <reference path="../../AppFrame/Main.js"/>
/// <reference path="../../AppFrame/AppCommand.ref.js"/>
/// <reference path="../../AppFrame/AppBar.js"/>
/// <reference path="../../AppFrame/NavBar.js"/>
/// <reference path="ContactEditFlyout.js"/>
/// <reference path="ContactDeleteFlyout.js"/>
/// <reference path="ContactCommands.ref.js"/>
/// <reference path="../../AppFrame/AppBar.js" />

/*jshint browser:true*/
/*global People,Jx*/

Jx.delayDefine(People, "ContactCommands", function () {

    var P = window.People,
        C = P.Controls,
        N = P.Nav;

    function makeCommand(commandDescriptor) {
        /// <summary>Creates an AppFrame command object from a CommandDescriptor.  If the command needs to be
        /// bound to a specific person object, the CommandDescriptor's isEnabled/isSelected/invoke functions should
        /// close on it.</summary>
        /// <param name="commandDescriptor" type="CommandDescriptor"/>
        /// <returns type="P.Command"/>
        var isEnabled = commandDescriptor.isEnabled ? commandDescriptor.isEnabled() : true;
        var command = new P.Command(
            commandDescriptor.id,
            commandDescriptor.title,
            null,
            commandDescriptor.icon,
            true,
            isEnabled,
            commandDescriptor,
            commandDescriptor.invoke,
            null,
            false,
            null,
            commandDescriptor.beforeShowUpdate
        );
        if (commandDescriptor.isSelected) {
            command.setSelected(commandDescriptor.isSelected());
        }
        if (commandDescriptor.isCustomFlyout) {
            command.setCustomFlyout(true);
        }
        if (commandDescriptor.biciIndex >= 0) {
            command.setBiciIndex(commandDescriptor.biciIndex);
        }
        return command;
    }

    P.ContactCommands = {

        addCommands: function (host, binder) {
            ///<summary>Adds an array of commands to the command bar</summary>
            ///<param name="host" type="P.CpMain">Host providing getCommandBar </param>
            ///<param name="binder" type="P.PlatformObjectBinder"/>
            var commandBar = host.getCommandBar();
            var navBar = host.getNavBar();
            var platform = host.getPlatform();
            var commands = this.getFactories();

            var accessor = binder.createAccessor(function () {
                commands.forEach(function (command) {
                    commandBar.updateCommand(command(accessor, platform, commandBar, navBar));
                });
            });
            commands.forEach(function (commandFactory) {
                commandBar.addCommand(commandFactory(accessor, platform, commandBar, navBar));
            });
            commandBar.refresh();
        },

        makeDeleteCommand: function (person) {
            ///<summary>Factory method for the delete person command</summary>
            ///<param name="person" type="P.PersonAccessor"/>
            ///<returns type="P.Command"/>
            return makeCommand(/*@static_cast(CommandDescriptor)*/{
                id: "cmdid_profile_delete",
                title: "/strings/profileCommandButtonDelete",
                icon: "\uE107",
                isEnabled: function () {
                    // Gal contact should have canDelete set to false. The check for contact.isGal shouldn't be necessary. Remove it once it's fixed in platform.
                    return person.linkedContacts.some(function (/*@type(P.ContactAccessor)*/contact) { return contact.canDelete && (!contact.isGal); }); 
                },
                invoke: function (commandId, element) {
                    ///<returns type="WinJS.UI.Flyout">The flyout object.</returns>
                    /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                    var flyout = new C.ContactDeleteFlyout();
                    flyout.show(person.createAccessor(), element, "top" /*placement*/);
                    return flyout.getFlyout();
                    /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
                }
            });
        },

        makeEditCommand: function (person) {
            ///<summary>Factory method for the edit person command</summary>
            ///<param name="person" type="P.PersonAccessor"/>
            ///<returns type="P.Command"/>
            return makeCommand(/*@static_cast(CommandDescriptor)*/{
                id: "cmdid_profile_edit",
                title: "/strings/profileCommandButtonEdit",
                icon: "\uE104",
                invoke: function (commandId, element) {
                    ///<returns type="WinJS.UI.Flyout">The flyout object.</returns>
                    // Gal contact should have canEdit set to false. The check for contact.isGal shouldn't be necessary. Remove it once it's fixed in platform.
                    var editableContacts = person.linkedContacts.filter(function (/*@type(P.ContactAccessor)*/contact) { return contact.canEdit && (!contact.isGal); });
                    if (editableContacts.length > 1) {
                        // Let the user pick which contact to edit
                        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                        var flyout = new C.ContactEditFlyout();
                        flyout.show(person.createAccessor(), element);
                        return flyout.getFlyout();
                        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
                    } else if (editableContacts.length === 1) {
                        // Only one contact, just jump there directly
                        N.navigate(N.getEditProfileDetailUri(person.objectId, { contactId: editableContacts[0].objectId }));
                    } else {
                        // No editable contacts, create a new one
                        N.navigate(N.getEditProfileDetailUri(person.objectId, { contactId: null }));
                    }
                    return null;
                },
                biciIndex: P.Bici.ReactionType.edit
            });
        },

        makePinCommand: function (person, platform, commandBar, navBar) {
            ///<summary>Factory method for the pin/unpin person command</summary>
            ///<param name="person" type="P.PersonAccessor"/>
            ///<param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
            ///<param name="commandBar" type="P.CpAppBar">The command bar</param>
            ///<param name="navBar" type="P.CpNavBar">The nav bar</param>
            ///<returns type="P.Command"/>

            /// <disable>JS2076.IdentifierIsMiscased</disable>
            var Pinning = P.Pinning;
            /// <enable>JS2076.IdentifierIsMiscased</enable>

            var isPinned = false;
            var pinnedLaunchArguments = "";
            var pinnedTileId = "";
            var personObj = person.getPlatformObject();
            var cmdId = "cmdid_profile_pin" + String(Jx.uid());
            function getIcon(pinned) {
                return pinned ? "\uE196" : "\uE141";
            }
            function getUpdatedPinCommandState () {
                var text = "/strings/profileCommandButton" + (isPinned ? "Unpin" : "Pin");
                return { 
                    commandId: cmdId, 
                    iconSymbol: getIcon(isPinned), 
                    name: text,
                    tooltip: text
                };
            }
            function updateCommand() {
                Pinning.isPersonPinnedAsync(platform, personObj).done(function (/*@type(IsPinnedTile)*/isPersonPinned) {
                    isPinned = isPersonPinned.isPinned;
                    if (isPinned) {
                        pinnedLaunchArguments = isPersonPinned.launchArguments;
                        pinnedTileId = isPersonPinned.tileId;
                    }
                    commandBar.updateCommand(getUpdatedPinCommandState());
                },
                Jx.fnEmpty);
            }
            updateCommand();
            return makeCommand(/*@static_cast(CommandDescriptor)*/{
                id: cmdId,
                title: "/strings/profileCommandButtonPin",
                icon: getIcon(isPinned),
                // Tell the app bar to not hide on invoke by setting the button as a custom flyout button.
                isCustomFlyout: true,
                invoke: function (commandId, element) {
                    /// <summary>The Pin command handler</summary>
                    /// <param name="commandId" type="String"/>
                    /// <param name="element" type="HTMLElement">The command bar button for pin.</param>
                    // Appbar dismisses when Pin/Unpin dialog shows up. Make the app bar sticky while Pin/Unpin dialog shows 
                    // and revert its value after that dialog is dismissed.
                    var winappbar = commandBar.getWinappbar();
                    var stickiness = winappbar.sticky; 
                    winappbar.sticky = true;
                    
                    var navWinappbar = navBar.getWinappbar();
                    var navStickiness = navWinappbar.sticky;
                    navWinappbar.sticky = true;

                    function onFlyoutDismiss() {
                        updateCommand();
                        commandBar.hide();
                        winappbar.sticky = stickiness;
                        navBar.hide();
                        navWinappbar.sticky = navStickiness;
                    }
                    
                    var boundingRect = element.getBoundingClientRect();
                    // The invocation point: x position is the center of the button, y position is in effect 6px higher than the top of the button.
                    var point = { x: boundingRect.left + boundingRect.width / 2 , y: boundingRect.top - 8 };
                    (Pinning.pinPersonAsync(platform, personObj, !isPinned, pinnedTileId, pinnedLaunchArguments, [point])).done(
                        onFlyoutDismiss, 
                        onFlyoutDismiss
                        );
                },
                beforeShowUpdate: function () {
                    // Update command w/ what we currently have as a best effort attempt before showing.
                    commandBar.updateCommand(getUpdatedPinCommandState());

                    // Ensure it's ultimately updated with what we currently have.
                    updateCommand();
                }
            });
        },

        getFactories: function () {
            ///<returns type="Array">A set of factories for the contact commands</returns>
            return ([
                this.makePinCommand,
                this.makeEditCommand,
                this.makeDeleteCommand
            ]);
        }
    };
});
