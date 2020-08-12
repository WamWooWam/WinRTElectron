

(function () {
    "use strict";

    var app = WinJS.Application;

    var chatInputVM = MvvmJS.Class.define(
        function chatInputVM_Ctor(conversationWrapper, conversationSessionStateId, conversationSharedState) {
            this._convState = app.sessionState.conversations[conversationSessionStateId]; 
            this._conversationWrapper = conversationWrapper;
            this._conversation = this._conversationWrapper.libConversation;
            this.sharedState = conversationSharedState;
            this._peer = this.sharedState.isDialog ? this._conversationWrapper.contact : null;
            this.contactType = this._conversationWrapper.contact ? this._conversationWrapper.contact.type : null;
            this.sms = new Skype.Model.Sms(this._conversation);
            this._sendNoTyping = this._sendTypingInfo.bind(this, LibWrap.Participant.text_STATUS_READING);
            this.handleLinkClick = this.handleLinkClick.bind(this);
        }, {
            sms: null,
            _convState: null,
            _inputDisabledMessage: "",
            _imDisabled: false,
            _noMoneyModeOn: false,
            _userText: "",

            
            _peer: Skype.Utilities.nondisposableProperty(), 
            _conversation: null,
            _conversationWrapper: null,
            contactType: null,
            sharedState: null,

            
            _textareaControl: null,

            _updateImDisabledStatus: function () {
                var isOfflineLyncContact = this._peer && this._peer.isLyncContact && !(this._peer.isAvailable || this._peer.availability === LibWrap.Contact.availability_DO_NOT_DISTURB); 
                this.imDisabled = isOfflineLyncContact && !this.smsModeOn;
                if (this.imDisabled) {
                    this.inputDisabledMessage = "chatinput_disabled_for_lync".translate(this._conversationWrapper.contact.name);
                };
            },

            _updatePhoneProps: function () {
                this.hasAnySmsPhone = this._peer ? Skype.Lib.getSmsAblePhones(this._peer.phones).length !== 0 : false;
                this.hasOnlyOnePhone = this._peer && this._peer.phones.length <= 1;
            },

            _checkNoMoneyMode: function () {
                this.noMoneyModeOn = !!this._peer && this._peer.isPstnContact && 
                    !lib.account.hasCapability(LibWrap.Contact.capability_CAPABILITY_SKYPEOUT);
                if (this.noMoneyModeOn) {
                    this.inputDisabledMessage = "sms_nocredit_buy_credit_full".translate();
                };
            },

            _updatePlaceholder: function () {
                if (this.smsModeOn) {
                    var directionControl = (Skype.Application.state.isRTL) ? Skype.Globalization.DirectionControl.leftToRightOverride : ""; 
                    var phoneText = (this.contactType === LibWrap.Contact.type_UNDISCLOSED_PSTN) ? "undisclosed_contact_name".translate() : directionControl + this.sms.phone;
                    this._textareaControl.placeholder = "conversation_textbox_placeholder_sms".translate(phoneText);
                } else {
                    this._textareaControl.placeholder = "conversation_textbox_placeholder".translate();
                }
            },

            showPhoneMenu: function (evt) {
                if (this._peer && !(this._peer.isPstnContact && this._peer.phones.length == 1) && 
                    !this.noMoneyModeOn && this._messagingChannelMenu.hidden) {

                    var phones = this._peer && this._peer.phones;
                    this._messagingChannelMenu.display(this._messagingChannelBtn, "top", phones);
                }
            },

            _handleContactPropertyChange: function (e) {
                if (e.detail == "phones") {
                    this._updatePhoneProps();
                    this._updateImDisabledStatus();
                }
                if (e.detail == "isAvailable") {
                    if (this.imDisabled || this._textareaControl.hasPlaceholder || this._userText.trim().length === 0) {
                        this._updateImDisabledStatus();
                    }
                }
            },

            _getFirstNonSkypePhone: function () {
                var result = null;
                if (this._peer) {
                    var phones = this._peer.phones;
                    for (var i = 0; i < phones.length; i++) {
                        if (phones[i].type !== Skype.Model.PhoneType.skype) {
                            result = { phoneType: phones[i].type, number: phones[i].number, index: phones[i].index };
                            break;
                        }
                    }
                }
                return result;
            },

            handleLinkClick: function (e) {
                if (e.srcElement.parentNode.className === "inputDisabled") {
                if (this.noMoneyModeOn) {
                    this._handleBuyCredit();
                } else if (this.imDisabled) {
                    this._handleMessagingChannelChange(this._getFirstNonSkypePhone());
                }
            }
            },

            _handleBuyCredit: function () {
                if (!this._handlingBuyCredit) {
                    this._handlingBuyCredit = true;

                    this.regPromise(Skype.SSOTokenRequestManager.instance.requestTokenAsync())
                        .then(function success(token) {
                            this._handlingBuyCredit = false;
                            var url = Skype.SSOTokenRequestManager.getSSOUrlWithGoLink(token, "store.buy.credit") + "&" + Skype.UI.Util.getTrackingParam("go-store-buy-credit");
                            Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri(url));
                        }.bind(this),
                        function error() {
                            this._handlingBuyCredit = false;
                            Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri("https://www.skype.com/go/store.buy.credit"));
                        }.bind(this));
                }
            },

            _showNoCreditForSMS: function () {
                Skype.UI.Dialogs.showConfirmDialogAsync(this._messagingChannelBtn,
                    "sms_nocredit_note".translate(), "sms_nocredit_buy_credit".translate(), 'noheading').then(function (result) {
                        if (result) {
                            this._handleBuyCredit();
                        }
                    }.bind(this));
            },

            _handleAddNumberClicked: function () {
                if (!lib.account.hasCapability(LibWrap.Contact.capability_CAPABILITY_SKYPEOUT)) {
                    this._showNoCreditForSMS();
                } else {
                    Skype.UI.Dialogs.showAddNumberToContactDialog(this._messagingChannelBtn).then(function (value) {
                        if (value.result) {
                            var identity = Skype.Lib.getIdentityForCountryCode(value.number, value.prefix);
                            var label = Skype.Lib.getPhoneLabelForType(value.phoneType);
                            if (!this._peer.libContact.setPhoneNumber(2, label, identity)) {
                                
                                log("Library couldn't save number !");
                            }
                            this.smsModeOn = true;
                            this.selectedPhone = {
                                number: "+" + value.prefix + value.number,
                                phoneType: parseInt(Skype.Lib.getPhoneLabelForType(value.phoneType)),
                                index: ""
                            };
                        }
                    }.bind(this));
                }
            },

            _updateUserText: function () {
                this._userText = this._textareaControl.hasPlaceholder ? '' : this._textareaControl.text;
                this._userText = this._userText || ''; 
            },

            _updateSmsInfoAndObject: function () { 
                if (this.smsModeOn) {
                    this._updateUserText();
                    this.dispatchEvent(chatInputVM.Events.InputTextChanged, { userText: this._userText });

                    var info = this.sms.updateText(this._userText);
                    if (info) {
                        this._textareaControl.setLengthConstraint(info.maxLength);

                        if (!info.result) { 
                            this._textareaControl.text = this.sms.text;
                        }
                    }
                }
            },

            _handleMessagingChannelChange: function (phone, autoGeneratedClick) {
                if (!phone) { 
                    this._handleAddNumberClicked();
                    return;
                }

                var smsOn = phone.phoneType !== Skype.Model.PhoneType.skype;
                if (!autoGeneratedClick && smsOn && !lib.account.hasCapability(LibWrap.Contact.capability_CAPABILITY_SKYPEOUT)) {
                    this._showNoCreditForSMS();
                    return;
                }
                this.smsModeOn = smsOn;
                this.selectedPhone = phone;

                if (!this.smsModeOn) {
                    this._textareaControl.setLengthConstraint();
                }

                this._updateSmsInfoAndObject(); 
                this._updateImDisabledStatus();
            },

            _sendTypingInfo: function (value) {
                this._conversation.setMyTextStatusTo(value);
                if (value === LibWrap.Participant.text_STATUS_WRITING) {
                    this._noActionTimer && this.unregTimeout(this._noActionTimer);
                    this._noActionTimer = this.regTimeout(this._sendNoTyping, chatInputVM.NO_TYPING_TIMEOUT);
                }
            },

            _textareaElEventHandler: function (isContentChange) {
                var hasUserText,
                    textStatusToSend;
                
                this._updateUserText();
                if (!this.smsModeOn) { 
                    this.dispatchEvent(chatInputVM.Events.InputTextChanged, { userText: this._userText });
                }
                hasUserText = !this._textareaControl.hasPlaceholder && this._userText.trim().length > 0;
                if (hasUserText && isContentChange) {
                    textStatusToSend = LibWrap.Participant.text_STATUS_WRITING;
                    this.setAriaReadOnly(false);
                } else {
                    textStatusToSend = LibWrap.Participant.text_STATUS_READING;
                }

                this._sendTypingInfo(textStatusToSend);
                this._updateSmsInfoAndObject();
            },

            _sendMessage: function (sendXML) {
                var hasText = !this._textareaControl.hasPlaceholder && this._userText.trim().length > 0;
                if (hasText) {
                    if (this.smsModeOn) {
                        this.sms.send();
                        this.sms.updateText("");
                    } else {
                        this._conversation.postText(this._userText, sendXML);
                    }
                    this._textareaControl.text = "";
                }
            },

            _sendMessageHandler: function (e) {
                if (this._peer && this._peer.isPstnContact && !this.smsModeOn) {
                    return;
                }
                this.setAriaReadOnly(true);
                this._updateImDisabledStatus();
                if (this.imDisabled) {
                    this._textareaControl.blur();
                    return;
                }
                this._sendMessage(!!e.detail && e.detail.sendXML);
                this.dispatchEvent(chatInputVM.Events.MessageSent);
                this.regImmediate(function () {
                    this._textareaControl.focus(); 
                }.bind(this));
            },

            _onKeyboardVisibilityChanged: function () {
                this.isShowingKeyboard = Skype.Application.state.isShowingKeyboard;
            },

            _onBlocked: function (isBlocked) {
                if (isBlocked) {
                    this._textareaControl.text = "";
                    this._textareaControl.blur(); 
                }
            },

            _editMessageHandler: function (event) {
                var conversationMessage = lib.getConversationMessage(event.detail.msgId);
                if (conversationMessage) {
                    conversationMessage.edit(event.detail.text, event.detail.sendXML, false, "chatlog_message_edited_legacy_text".translate());
                    conversationMessage.discard();
                } else {
                    log("_editMessageHandler: Message couldn't be edited !");
                }
            },

            _onMembershipChanged: function (isMember) {
                if (!isMember) {
                    this._textareaControl.blur(); 
                }
            },

            _registerEvents: function () {
                this.regEventListener(this._textareaControl, Skype.UI.Conversation.Textarea.Events.ChatInputContentChange, this._textareaElEventHandler.bind(this, true)); 
                this.regEventListener(this._textareaControl, Skype.UI.Conversation.Textarea.Events.ChatInputFocusChanged, this._textareaElEventHandler.bind(this, false));
                this.regEventListener(this._textareaControl, Skype.UI.Conversation.Textarea.Events.TextPosted, this._sendMessageHandler.bind(this));
                this.regEventListener(this._textareaControl, Skype.UI.Conversation.Textarea.Events.TextEdited, this._editMessageHandler.bind(this));

                this.regBind(Skype.Application.state, "isShowingKeyboard", this._onKeyboardVisibilityChanged.bind(this));
            },

            _updateHidden: function () {
                var caps = this._conversationWrapper.capabilities;
                this.isHidden = !(caps && (caps.get(LibWrap.Conversation.capability_CAN_SEND_TEXT) ||
                    caps.get(LibWrap.Conversation.capability_CAN_SEND_SMS)));
            },
            
            _updateP2PMigrated: function (migrated) {
                if (migrated) {
                    var threadId = this._conversation.getThreadIdFromChatName();
                    this.serverBasedChatInfo = "msnp24_link_to_server_chat".translate("skype:" + threadId + "?chat");
                    this.isP2PMigrated = true;
                } else {
                    this.isP2PMigrated = false;
                }
            },
            
            _initDialog: function () {
                this.regEventListener(this._peer, "propertychanged", this._handleContactPropertyChange.bind(this));
                if (this._peer.isPstnContact) {
                    var phones = this._peer.phones;
                    if (phones.length >= 1) {
                        
                        var defaultPhone = { phoneType: phones[0].type, number: phones[0].number, index: 0 };
                        this._handleMessagingChannelChange(defaultPhone, true);
                    }
                }

                this.regBind(this.sharedState, "isBlocked", this._onBlocked.bind(this));
                this._updatePhoneProps();
                this._checkNoMoneyMode();
                this._updateImDisabledStatus();
            },

            _initGroupChat: function () {
                
                this.regBind(this._conversationWrapper, "p2pMigrated", this._updateP2PMigrated.bind(this));
                this.regBind(this.sharedState, "isMember", this._onMembershipChanged.bind(this));
            },

            

            init: function (messagingChannelMenu, textareaControl, messagingChannelBtn) {
                this._textareaControl = textareaControl;
                this._messagingChannelBtn = messagingChannelBtn; 
                this._registerEvents();

                this.selectedPhone = JSON.parse(JSON.stringify(this.selectedPhone)); 
                this._updatePlaceholder();
                this.setContactType(this.contactType);
                this._messagingChannelMenu = messagingChannelMenu;
                this._messagingChannelMenu.init(true, this._handleMessagingChannelChange.bind(this), this);
                this._updateHidden();

                
                this.regEventListener(this._conversationWrapper.capabilities, Skype.Model.ConversationCapabilities.Events.CapabilitiesChanged, this._updateHidden.bind(this));

                
                if (this._peer) {
                    this._initDialog();
                } else {
                    
                    this._initGroupChat();
                }
            },
            
            onShow: function () {
                this._checkNoMoneyMode(); 
            },

            formattedContactType: {
                get: function () {
                    if (!this._formattedContactType) {
                        this.setContactType(this.contactType);
                    }
                    return this._formattedContactType;
                }
            },

            setContactType: function (value) {
                this.contactType = value;
                switch (value) {
                    case LibWrap.Contact.type_PASSPORT:
                        value = "passport";
                        break;
                    case LibWrap.Contact.type_LYNC:
                        value = "lync";
                        break;
                    default:
                        value = "skype";
                        break;
                }

                this._formattedContactType = value;
            },

            setAriaReadOnly: function (value) {
                this._textareaControl.setAriaReadOnly(value);
            }
        }, { 

            
            title: null,
            remaining: 0,
            maxLength: 0,
            price: 0,
            
            hasAnySmsPhone: false,
            hasOnlyOnePhone: false,
            isShowingKeyboard: false,
            isHidden: false,
            isP2PMigrated: false,
            serverBasedChatInfo: "",

            selectedPhone: {
                get: function () {
                    return typeof this._convState.inputModel_selectedPhone !== 'undefined' ? this._convState.inputModel_selectedPhone : null;
                },
                set: function (value) {
                    if (!this.smsModeOn) {
                        value = null;
                    }
                    this._convState.inputModel_selectedPhone = value;
                    this.sms.phone = value ? Skype.Lib.getIdentityForCountryCode(value.number, value.prefix) : null;
                    this.notify("selectedPhone");

                    this._updatePlaceholder();
                }
            },

            noMoneyModeOn: {
                get: function () {
                    return this._noMoneyModeOn;
                },
                set: function (value) {
                    this._noMoneyModeOn = value;
                    this.notify("disabled");
                    this.notify("noMoneyModeOn");
                    this.notify("caption");
                    this.notify("channelButtonAriaLabel");
                    this.notify("channelButtonFlickAriaLabel");
                }
            },

            imDisabled: {
                get: function () {
                    return this._imDisabled;
                },
                set: function (value) {
                    this._imDisabled = value;
                    this.notify("disabled");
                    this.notify("imDisabled");
                    this.notify("caption");
                    this.notify("channelButtonAriaLabel");
                    this.notify("channelButtonFlickAriaLabel");
                }
            },

            disabled: {
                get: function () {
                    return this._imDisabled || this._noMoneyModeOn;
                },
            },

            smsModeOn: {
                get: function () {
                    return typeof this._convState.inputModel_smsModeOn !== 'undefined' ? this._convState.inputModel_smsModeOn : false;
                },
                set: function (value) {
                    this._convState.inputModel_smsModeOn = value;
                    this.notify("smsModeOn");
                    this.notify("caption");
                    this.notify("channelButtonAriaLabel");
                    this.notify("channelButtonFlickAriaLabel");
                }
            },

            inputDisabledMessage: {
                get: function () {
                    return this._inputDisabledMessage;
                },
                set: function (value) {
                    this._inputDisabledMessage = value;
                    this.notify("inputDisabledMessage");
                }
            },

            caption: {
                get: function () {
                    return (this.smsModeOn ? "conversation_sendmode_sms" : "conversation_sendmode_" + this.formattedContactType).translate();
                }
            },

            
            channelButtonAriaLabel: {
                get: function () {
                    return (this.smsModeOn ? "aria_chat_vialist_combobox_sms" : "aria_chat_vialist_combobox_" + this.formattedContactType).translate();
                }
            },

            
            channelButtonFlickAriaLabel: {
                get: function () {
                    return this.channelButtonAriaLabel + " " + "aria_flick_combobox_role_label".translate(); 
                }
            }
        }, {
            NO_TYPING_TIMEOUT: 15e3,
            Events: {
                MessageSent: "MessageSent",
                InputTextChanged: "InputTextChanged"
            },

        });

    WinJS.Namespace.define("Skype.ViewModel", {
        ChatInputVM: chatInputVM
    });

}());