

(function () {
    "use strict";

    var conversationCommandsSet = WinJS.Class.derive(Skype.UI.AppBar.CommandsSet, function () {
        Skype.UI.AppBar.CommandsSet.prototype.constructor.call(this);
    }, {
        _focusedConversation: null,

        registerCommandsAndViews: function () {
            this.commands = [
                {
                    id: 'notifications',
                    label: 'appbar_notifications'.translate(),
                    icon: '\uE31C',
                    section: 'selection',
                    onclick: this._handleNotificationsClick.bind(this, 'notifications'),
                    hidden: true,
                    extraAttributes: {
                        "aria-haspopup": true
                    }
                },
                {
                    id: 'notifications_off',
                    label: 'appbar_notifications'.translate(),
                    icon: '\uE31D',
                    section: 'selection',
                    onclick: this._handleNotificationsClick.bind(this, 'notifications_off'),
                    hidden: true,
                    extraAttributes: {
                        "aria-haspopup": true
                    }
                },
                {
                    id: 'favorite',
                    label: 'appbar_favorite'.translate(),
                    icon: 'favorite',
                    section: 'global',
                    onclick: this._handleFavoriteClick.bind(this),
                    hidden: true
                },
                {
                    id: 'profile',
                    label: 'appbar_viewprofile'.translate(),
                    icon: '\uE209',
                    section: 'global',
                    onclick: this._handleProfileClick.bind(this),
                    hidden: true
                },
                {
                    id: 'change_picture',
                    label: 'appbar_change_g_picture'.translate(),
                    icon: '\uE422',
                    section: 'global',
                    onclick: this._handleChangePictureClick.bind(this),
                    hidden: true
                },
                {
                    id: 'rename_group',
                    label: 'appbar_rename_group'.translate(),
                    icon: '\uE40d',
                    section: 'global',
                    onclick: this._handleRenameGroupClick.bind(this),
                    hidden: true
                },
                {
                    id: 'leave_group',
                    label: 'appbar_leave_group'.translate(),
                    icon: '\uE60d',
                    section: 'global',
                    onclick: this._handleLeaveGroupClick.bind(this),
                    hidden: true
                },
                {
                    id: 'block_contact',
                    label: 'appbar_block_contact'.translate(),
                    icon: '\uE205',
                    section: 'global',
                    onclick: this._handleBlockContactClick.bind(this, 'block_contact'),
                    hidden: true,
                    extraAttributes: {
                        "aria-haspopup": true
                    }
                },
                {
                    id: 'unblock_contact',
                    label: 'appbar_unblock_contact'.translate(),
                    icon: '\uE202',
                    section: 'global',
                    onclick: this._handleUnBlockContactClick.bind(this, 'unblock_contact'),
                    hidden: true
                },
                {
                    id: 'remove_contact',
                    label: 'appbar_remove_contact'.translate(),
                    icon: '\uE206',
                    section: 'global',
                    onclick: this._handleRemoveContactClick.bind(this, 'remove_contact'),
                    hidden: true,
                    extraAttributes: {
                        "aria-haspopup": true
                    }
                },
                {
                    id: 'remove_contact_group',
                    label: 'appbar_remove_contact'.translate(),
                    icon: '\uE20C',
                    section: 'global',
                    onclick: this._handleRemoveContactClick.bind(this, 'remove_contact_group'),
                    hidden: true
                }
            ];

            this._views.conversation = true;
        },

        _updateContext: function (context) {
            this._focusedConversation = context && context.conversation || null;
        },

        _showCommands: function () {
            if (this._focusedConversation) {                                
                if (!(this._focusedConversation.contact && this._focusedConversation.contact.type === LibWrap.Contact.type_UNDISCLOSED_PSTN)) {                    
                    this._bar.showHideCommands(['favorite']);
                    var favoriteCmd = this._bar.getCommandById('favorite');
                    favoriteCmd.selected = this._focusedConversation.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_PINNED_ORDER) > 0;                    
                }
                
                if (this._focusedConversation.contact && this._focusedConversation.contact.isBuddy) {
                    this._bar.showHideCommands(['profile']);
                }
                
                if (Actions.isActionApplicable("removeFromContacts", this._focusedConversation.identity)) {
                    this._bar.showHideCommands([this._focusedConversation.isDialog ? 'remove_contact' : 'remove_contact_group']);
                } else {
                    this._bar.showHideCommands([], ['remove_contact', 'remove_contact_group']);
                }

                
                var _notificationsEnabled = (this._focusedConversation.libConversation.getStrProperty(LibWrap.PROPKEY.conversation_ALERT_STRING)) ? false : true;
                if (_notificationsEnabled) {
                    this._bar.showHideCommands(['notifications'], ['notifications_off']);
                } else {
                    this._bar.showHideCommands(['notifications_off'], ['notifications']);
                }

                if (this._focusedConversation.isDialog) {
                    if (this._focusedConversation.contact.isPstnContact || this._focusedConversation.contact.isEchoService || this._focusedConversation.contact.isEmergencyContact) {
                        this._bar.showHideCommands(null, ['profile']);
                    } else {
                        if (this._focusedConversation.isBlocked) {
                            this._bar.showHideCommands(['unblock_contact'], ['block_contact']);
                        } else {
                            this._bar.showHideCommands(['block_contact'], ['unblock_contact']);
                        }
                    }
                } else {
                    if (this._focusedConversation.libConversation.myself) {
                        var caps = this._focusedConversation.capabilities;
                        if (caps && caps.get(LibWrap.Conversation.capability_CAN_CHANGE_PICTURE)) {
                            this._bar.showHideCommands(['change_picture']);
                        }

                        this._bar.showHideCommands(['rename_group', 'leave_group'], ['block_contact', 'profile']);
                    } else {
                        
                        this._bar.showHideCommands([], ['change_picture', 'rename_group', 'leave_group', 'block_contact', 'profile']);
                    }
                }
            }
        },

        _handleRenameGroupClick: function (evt) {
            if (!this._focusedConversation) {
                return;
            }
            Skype.UI.Dialogs.showTextInputDialogAsync(evt.currentTarget,
                'appbar_rename_group_confirm'.translate(),
                'appbar_rename_group_confirm_yes'.translate(),
                "aria_group_name".translate(),
                this._focusedConversation.getTopicStrippedXML() ? this._focusedConversation.getTopicStrippedXML() : Skype.UI.Util.decodeHTMLEntities(this._focusedConversation.name), 256, true)
                .then(function (value) {
                    if (value.result) {
                        this._focusedConversation.topic = value.inputText;
                        this._bar.hide();
                    }
                }.bind(this));
        },

        _handleLeaveGroupClick: function (e) {
            if (!this._focusedConversation) {
                return;
            }
            var identity = this._focusedConversation.identity;
            Skype.UI.Dialogs.showConfirmDialogAsync(e.currentTarget,
                'appbar_leave_group_confirm'.translate(),
                'appbar_leave_group_confirm_yes'.translate()).then(function (result) {
                    if (result) {
                        Actions.invoke("leaveGroupConversation", identity);
                        this._bar.hide();
                    }
                }.bind(this));
        },

        _handleRemoveContactClick: function (anchor, e) {
            if (!this._focusedConversation) {
                return;
            }
            var question;
            var focusedIdentity = this._focusedConversation.identity;
            if (this._focusedConversation.isDialog) {
                question = (this._focusedConversation.contact.isPstnContact ? "appbar_confirm_remove_number" : "appbar_confirm_remove_contact").translate();
            } else {
                question = "appbar_confirm_remove_group".translate();
            }
            Skype.UI.Dialogs.showConfirmDialogAsync(e.currentTarget, question,
                'appbar_confirm_remove'.translate()).then(function (result) {
                    if (result) {
                        Actions.invoke("removeFromContacts", focusedIdentity);
                        this._bar.hide();
                        Skype.UI.navigateBack();
                    }
                }.bind(this));
        },

        _handleBlockContactClick: function (anchor, e) {
            if (!this._focusedConversation) {
                return;
            }
            Skype.UI.Dialogs.showBlockContactDialog(e.currentTarget).then(function (value) {
                if (value.result) {
                    Actions.invoke("blockContact", this._focusedConversation.identity, { "spam": value.spam, "remove": value.remove });
                    this._bar.hide();
                }
            }.bind(this));
        },

        _handleUnBlockContactClick: function (anchor, e) {
            var focusedIdentity = this._focusedConversation.identity;
            Actions.invoke("unBlockContact", focusedIdentity);
            this._bar.hide();
        },

        _handleEmergencyFavoriteClick: function (saved) {
            if (!saved) { 
                var identity = Skype.Lib.savePSTNContact(this._focusedConversation.contact.identity, "", "mobile", this._focusedConversation.name);
                if (identity) {
                    this._bar.hide();
                    Actions.invoke("focusConversation", identity);
                }
            }
            Skype.Model.FavoriteConversationsRepository.instance.toggleFavoriteConversation(this._focusedConversation);
            return true;
        },

        _handlePSTNFavoriteClick: function (anchor, saved) {
            var canHide = true;
            var conv = this._focusedConversation;
            if (!saved) {
                var phones = conv.contact.phones;
                if (!phones[Skype.Model.PhoneSlot.identity] && phones[Skype.Model.PhoneSlot.none]) {
                    canHide = false;
                    var noneSlot = conv.contact.phones[Skype.Model.PhoneSlot.none];
                    Skype.UI.Dialogs.showSavePstnContactDialog(anchor, noneSlot.number).then(function (value) {
                        if (value.result) {
                            var identity = Skype.Lib.savePSTNContact(noneSlot.number, "", value.phoneType, value.contactName);
                            if (identity) {
                                this._bar.hide();
                                Actions.invoke("focusConversation", identity);
                            }
                            Skype.Model.FavoriteConversationsRepository.instance.toggleFavoriteConversation(conv);
                        }
                    }.bind(this));
                }
            } else {
                Skype.Model.FavoriteConversationsRepository.instance.toggleFavoriteConversation(conv);
            }
            return canHide;
        },

        _handleConvFavoriteClick: function (anchor, saved) {
            var canHide = true;
            var conv = this._focusedConversation;
            if (!saved) {
                if (!this._focusedConversation.topic) {
                    canHide = false;
                    Skype.UI.Dialogs.showTextInputDialogAsync(anchor,
                        'appbar_name_group'.translate(),
                        'appbar_name_group_save'.translate(),
                        "aria_group_name".translate(),
                        this._focusedConversation.name = Skype.UI.Util.decodeHTMLEntities(conv.name), 99999, false)
                        .then(function (value) {
                            if (value.result) {
                                conv.topic = value.inputText;
                                conv.bookmark = true;
                                Skype.Model.FavoriteConversationsRepository.instance.toggleFavoriteConversation(conv);
                                this._bar.hide();
                            }
                        }.bind(this));
                }else{
                    conv.bookmark = true;
                    Skype.Model.FavoriteConversationsRepository.instance.toggleFavoriteConversation(conv);
                }
            } else {
                Skype.Model.FavoriteConversationsRepository.instance.toggleFavoriteConversation(conv);
            }
            return canHide;
        },

        _handleFavoriteClick: function (e) {
            if (!this._focusedConversation) {
                return;
            }
            var canHide;
            var saved = this._focusedConversation.bookmark;
            if (this._focusedConversation.contact && this._focusedConversation.contact.isEmergencyContact) {
                
                canHide = this._handleEmergencyFavoriteClick(saved);
            } else if (this._focusedConversation.contact && this._focusedConversation.contact.isPstnContact) {
                
                canHide = this._handlePSTNFavoriteClick(e.currentTarget, saved);
            } else { 
                canHide = this._handleConvFavoriteClick(e.currentTarget, saved);
            }
            if (canHide) {
                this._bar.hide();
            }
        },

        _handleProfileClick: function () {
            
            if (this._focusedConversation.isDialog && !this._focusedConversation.contact.isPstnContact && !this._focusedConversation.contact.isEchoService) {

                
                var cleanIdentity = this._focusedConversation.identity;

                if (this._focusedConversation.identity.indexOf(":") > 0) {
                    if (this._focusedConversation.identity.indexOf("live:") < 0) {
                        
                        cleanIdentity = this._focusedConversation.identity.split(":");
                        cleanIdentity = cleanIdentity[1];
                    } else {
                        
                        cleanIdentity = encodeURIComponent(cleanIdentity);
                    }
                }

                if (this._focusedConversation.contact.isMessengerContact) {
                    window.location.href = "profile-messenger:" + cleanIdentity;
                } else if (this._focusedConversation.contact.isLyncContact) {
                    window.location.href = "profile-lync-com:" + cleanIdentity;
                } else {
                    window.location.href = "profile-skype-com:" + cleanIdentity;
                }
            }
        },

        _handleChangePictureClick: function (e) {
            Skype.UI.SelectAvatarImage(function (imageBinary) {
                log("setting new avatar for conversation: " + this._focusedConversation.libConversation.getIdentity());
                this._focusedConversation.libConversation.setPicture(imageBinary);
            }.bind(this));
        },

        _handleNotificationsClick: function (anchor, e) {
            if (!this._focusedConversation) {
                return;
            }

            Skype.UI.Dialogs.showChatNotificationsDialog(e.currentTarget, this._focusedConversation).then(function (value) {
                this._bar.hide();
            }.bind(this));
        },
    });

    WinJS.Namespace.define("Skype.UI.AppBar", {
        ConversationCommandsSet: conversationCommandsSet
    });

    Skype.UI.AppBar.registerCommandSet(new Skype.UI.AppBar.ConversationCommandsSet());
})();
