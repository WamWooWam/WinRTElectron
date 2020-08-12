

(function () {
    "use strict";

    var MAX_LENGTH = 7971;

    var textarea = Skype.UI.ObservableControl.define(function () {
    }, {
        _placeholder: '',
        hasPlaceholder: true,
        _isVisible: true, 
        _editedMessageId: null,

        init: function () {
            this._updateMinMaxHeight();
            this.element._valueLengthTemp = 0;
            this.element.maxLength = MAX_LENGTH;

            this._contentChangeHandler = this._contentChangeHandler.bind(this);
            this._updateSizing = this._updateSizing.bind(this);

            this.regEventListener(this.element, "input", this._contentChangeHandler);
            this.regEventListener(this.element, "focus", this._focusHandler.bind(this));
            this.regEventListener(this.element, "blur", this._blurHandler.bind(this));
            this.regEventListener(document, "keydown", this._editboxKeydownHandler.bind(this));
            this.regEventListener(document, "keypress", this._editboxKeypressHandler.bind(this));
            this.regEventListener(window, "resize", this._resizeAndKeybHidingHandler.bind(this));
            this.regBind(Skype.Application.state, "isShowingKeyboard", this._onKeyboardVisibilityChanged.bind(this));
            this.registerCaptureEvent(Skype.UI.Conversation.Events.ConversationShow, this._onConversationShow.bind(this));
            this.registerCaptureEvent(Skype.UI.Conversation.Events.ConversationHide, this._onConversationHide.bind(this));

            this.options.smileyElement && this.regEventListener(this.options.smileyElement, "click", function (e) {
                this._focusOnEmoticonPickerDismiss = document.activeElement == this.element;
                Skype.UI.EmoticonPicker.show(this._addEmoticon.bind(this));
            }.bind(this));

            if (!!this.options.text && this.options.text !== '') {
                this.text = this.options.text; 
            }

            this.element.removeAttribute('disabled'); 
        },

        _onConversationShow: function () {
            this._isVisible = true;
            this._resizeAndKeybHidingHandler(); 
        },

        _onConversationHide: function () {
            this._isVisible = false;
        },

        _onDispose: function () {
            this.element.innerHTML = "";
            this.element = this.element.winControl = this.options = null;
        },

        _resizeAndKeybHidingHandler: function () {
            if (!this._isVisible) {
                return;
            }
            
            this.regImmediate(function () {
                
                this._updateMinMaxHeight.call(this);
                this._updateSizing();
            }.bind(this));
        },

        _updateMinMaxHeight: function () {
            this.minHeight = typeof this.options.minHeight !== 'undefined' ? this.options.minHeight : parseInt(this.element.currentStyle.minHeight, 10);
            this.maxHeight = typeof this.options.maxHeight !== 'undefined' ? this.options.maxHeight : parseInt(this.element.currentStyle.maxHeight, 10) || this.minHeight;
        },

        _onKeyboardVisibilityChanged: function () {
            if (!this._isVisible) {
                return;
            }
            this._updateMinMaxHeight();
            if (!Skype.Application.state.isShowingKeyboard) {
                this._resizeAndKeybHidingHandler();
            }
        },

        _addEmoticon: function (emoticon) {
            if (!this.element) {
                return;
            }

            if (this.hasPlaceholder) {
                this.text = "";
            }

            if (emoticon) {
                var text = " " + emoticon + " ";

                this.element.focus();

                var currentText = this.element.textContent;
                var endIndex = this.element.selectionEnd;
                this.text = currentText.slice(0, endIndex) + text + currentText.slice(endIndex);

                var newCursorIndex = endIndex + text.length;

                
                requestAnimationFrame(function () {
                    if (this && this.element) {
                        this.element.focus();
                        this.element.setSelectionRange(newCursorIndex, newCursorIndex);
                    }
                }.bind(this));
            } else {
                if (this._focusOnEmoticonPickerDismiss) {
                    this.element.focus();
                }
            }
        },

        _focusHandler: function (e) {
            if (this.hasPlaceholder) {
                this.text = "";
                this.element.setSelectionRange(0, 1);
            }
            this.dispatchEvent(textarea.Events.ChatInputFocusChanged, { focused: true });
        },

        _blurHandler: function (e) {
            var text = this.element.textContent;
            if (text === "" || text === this.placeholder) { 
                this.text = this.placeholder ? this.placeholder : "";
            }
            this.dispatchEvent(textarea.Events.ChatInputFocusChanged, { focused: false });
        },

        
        
        

        _handleKeyPress: function (e) {
            if (e.charCode == 27 && this.element.textContent !== "") {
                e.preventDefault();
                this.text = "";
            }

            var sendXML = e.charCode == 10 && e.shiftKey && e.ctrlKey;
            if (e.charCode == 13 && !e.shiftKey || (Skype.Debug && sendXML)) {
                e.preventDefault();
                this._sendMessage(sendXML);
            }
            if (e.keyCode === WinJS.Utilities.Key.escape) {
                
                this.element.style.height = this.minHeight + "px";
                this._clearEditedMessage();
                this.dispatchEvent(Skype.UI.Conversation.Chat.Events.EditMessageRequested, { edit: false } );
            }
            this.inputText = this.element.textContent;
        },

        _editboxKeypressHandler: function (e) {
            if (document.activeElement === this.element) {
                this._handleKeyPress(e);
            }
        },

        _editboxKeydownHandler: function (e) {
            if (e.keyCode === WinJS.Utilities.Key.upArrow && this.element.textContent === "") {
                this.dispatchEvent(Skype.UI.Conversation.Chat.Events.EditMessageRequested, { edit: true });
            }
        },

        _clearEditedMessage: function() {
            this.text = "";
            this._editedMessageId = null;
        },

        _sendMessage: function (sendXML) {
            this.regImmediate(function () {
                if (this.inputText.trim().length !== 0) {
                    if (this._editedMessageId) {
                        this.dispatchEvent(textarea.Events.TextEdited, { text: this.inputText, msgId: this._editedMessageId, sendXML: sendXML });
                        this._clearEditedMessage();
                        return;
                    }
                    this.dispatchEvent(textarea.Events.TextPosted, { text: this.inputText, sendXML: sendXML });
                }
            }.bind(this));
        },

        _contentChangeHandler: function (evt) {
            var el = this.element,
                curValueLength = el.value.length;

            if (curValueLength !== el._valueLengthTemp) {
                this._updateSizing();
                el._valueLengthTemp = curValueLength;
            }
            this.dispatchEvent(textarea.Events.ChatInputContentChange);
        },

        _updateSizing: function () {
            var el = this.element,
                scrollHeight = el.scrollHeight,
                hPadding = parseInt(el.currentStyle.paddingTop) + parseInt(el.currentStyle.paddingBottom),
                lineHeight = parseInt(el.currentStyle.lineHeight),
                nLines = (isNaN(hPadding) || isNaN(lineHeight) || !lineHeight) ? 0 : (el.scrollHeight - hPadding) / lineHeight,
                hasEmptyLine = nLines % 1 !== 0,
                height;

            if (hasEmptyLine) {
                scrollHeight = lineHeight * Math.floor(nLines) + hPadding;
            }

            height = Math.max(this.minHeight, Math.min(scrollHeight, this.maxHeight));

            el.style.overflow = (scrollHeight > height ? "auto" : "hidden");
            el.style.height = height + "px";
            if (el.scrollHeight <= height) {
                el.scrollTop = 0;
            }
        },

        
        placeholder: {
            get: function () {
                return this._placeholder;
            },

            set: function (placeholder) {
                if (this._placeholder !== placeholder) {
                    this.element.setAttribute('placeholder', placeholder);
                    this._placeholder = placeholder;
                    if (this.hasPlaceholder) {
                        this.text = placeholder;
                    }
                }
            }
        },

        text: {
            get: function () {
                return this.element.textContent;
            },

            set: function (text) {
                if (!text) {
                    text = "";  
                }
                var el = this.element;
                if (el.value !== text) {
                    this.hasPlaceholder = text === this.placeholder;
                    Skype.UI.Util.setClass(el, "PLACEHOLDER", this.hasPlaceholder);
                    el.spellcheck = !this.hasPlaceholder; 
                    el.style.height = "";
                    el.value = text;
                    this._contentChangeHandler();
                }
            }
        },

        setLengthConstraint: function (length) {
            if (length === undefined) {
                length = MAX_LENGTH;
            }
            this.element.maxLength = length;
        },

        editMessage: function (editedMessageId, messageText) {
            this.text = messageText;
            this._editedMessageId = editedMessageId;
            this.focus();
            this.regImmediate(this.element.setSelectionRange.bind(this.element, MAX_LENGTH, MAX_LENGTH));
        },

        focus: function () {
            this.element.focus();
        },

        blur: function () {
            this.element.blur();
        },
        setAriaReadOnly: function (value) {
            this.element.setAttribute("aria-readonly", value);
        },
    }, {
    }, {
        Events: {
            ChatInputContentChange: "chatInputContentChange",
            TextPosted: "TextPosted",
            TextEdited: "TextEdited",
            ChatInputFocusChanged: "ChatInputFocusChanged"
        }
    });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        Textarea: WinJS.Class.mix(textarea, Skype.Model.hierarchicalMixin)
    });

}());
