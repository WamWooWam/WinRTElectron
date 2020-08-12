

(function () {
    "use strict";

    var BIG_PARTICIPANT_DIM = 440;

    Skype.UI.Page.define("/pages/participantList.html", "div.fragment.participantList", {
        _participants: null,
        participants: null,
        participantIdentities: null,
        selectedParticipants: null,
        conversationIdentity: null,
        conversation: null,
        conversationWrapper: null,
        isActive: false,
        listControl: null,
        listElement: null,

        key: {
            get: function () {
                return "participantList " + this.conversationIdentity;
            }
        },

        _handleListViewFinished: function (event) {
            var listView = event.srcElement.winControl;

            if (listView.loadingState === "complete") {
                this._renderFinishedSignals["default"].complete();
            }
        },

        init: function () {
            log("participantList page init()");

            this._renderFinishedSignals = {
                "default": new WinJS._Signal(),
            };
        },

        onReady: function () {
            log("participantList page onReady()");

            this.participantIdentities = [];

            this._handleParticipantListChange = this._handleParticipantListChange.bind(this);
            this._handleListSelectionChanged = this._handleListSelectionChanged.bind(this);


            this.headerText = this.element.querySelector("header h1");
            this.regEventListener(this.element.querySelector("button.backbutton"), 'click', this.backLinkClick.bind(this));

            this.listElement = this.element.querySelector("div.participants > div");
            this.listControl = this.listElement.winControl;
            this.regEventListener(this.listControl, "iteminvoked", this._handleItemClicked.bind(this));

            Skype.UI.Util.disableElementAnimation(this.listControl, this);
            this.regEventListener(this.listControl, "loadingstatechanged", this._handleListViewFinished.bind(this));

            this._onResize = this._onResize.bind(this);
            this.regEventListener(window, "resize", this._onResize);

            this.conversationIdentity = this.options.id;

            if (this.conversationIdentity) {
                this.conversation = lib.getConversationByIdentity(this.conversationIdentity);
                this.conversationWrapper = new Skype.Model.Conversation(this.conversation);
                this.conversationWrapper.alive();
                this._participants = new WinJS.Binding.List();
                this.participants = this._participants.createSorted(this._participantSort);
                WinJS.Binding.processAll(this.element, this);
                
                if (this.conversation && this.conversation.participants) {
                    var participantsCount = this.conversation.participants.size;
                    var headingAriaLabel = Skype.Globalization.formatNumericID("aria_participant_list_heading", participantsCount).translate(this.conversationWrapper.name, participantsCount);
                    this.element.setAttribute("aria-label", headingAriaLabel);
                }
            }
        },

        onShow: function () {
            this.isActive = true;
            
            this.regEventListener(this.conversation, "participantlistchange", this._handleParticipantListChange);
            this._handleParticipantListChange();

            this.regEventListener(this.listControl, "selectionchanged", this._handleListSelectionChanged);
            this.listControl.selection.clear();
        },

        onHide: function () {
            this.isActive = false;
            this.unregEventListener(this.listControl, "selectionchanged", this._handleListSelectionChanged);
            this.unregEventListener(this.conversation, "participantlistchange", this._handleParticipantListChange);
        },

        _onDispose: function () {
            this.conversation.discard();
        },


        _onResize: function (e) {
            this._updateDisplayMode();
        },

        _updateDisplayMode: function () {
            if (this.participantIdentities) {
                if (Skype.Application.state.view.isVertical) {
                    this.listControl.layout.orientation = WinJS.UI.Orientation.vertical;
                } else {
                    this.listControl.layout.orientation = WinJS.UI.Orientation.horizontal;

                    var manyMode = this.participantIdentities.length * BIG_PARTICIPANT_DIM > 2 * document.body.offsetWidth;
                    manyMode ? WinJS.Utilities.addClass(this.listElement, "MANY") : WinJS.Utilities.removeClass(this.listElement, "MANY");
                }
            }
            
            
            this.regImmediate(function () {
                this.listControl.forceLayout();
            }.bind(this));
        },

        _participantSort: function (par1, par2) {
            return par1.conversation.name.localeCompare(par2.conversation.name);
        },

        _handleItemClicked: function (e) {
            e.preventDefault();
            var index = e.detail.itemIndex;
            e.detail.itemPromise.then(function (item) {
                if (index >= 0) {
                    Actions.invoke("focusConversation", item.data.identity);
                }
            });
        },

        _handleParticipantListChange: function (e) {
            var notToBeDeleted = [];
            for (var i = 0; i < this.conversation.participants.size; i++) {
                var rank = this.conversation.participants[i].getIntProperty(LibWrap.PROPKEY.participant_RANK);
                
                var libConversation = lib.getConversationByIdentity(this.conversation.participants[i].participantContact.getIdentity());
                var identity = libConversation.getIdentity();
                if (this.participantIdentities.indexOf(identity) == -1) {
                    var wrappedConversation = new Skype.Model.DialogConversation(libConversation);
                    wrappedConversation.alive();
                    var participantData = {
                        identity: identity,
                        conversation: wrappedConversation,
                    };
                    this._participants.push(participantData);
                    this.participantIdentities.push(identity);
                }
                notToBeDeleted.push(identity);
            }
            for (i = this._participants.length - 1; i >= 0; i--) {
                var item = this._participants.getItem(i);
                if (notToBeDeleted.indexOf(item.data.identity) == -1) {
                    this.participantIdentities.splice(this.participantIdentities.indexOf(item.data.identity), 1);
                    item.data.conversation.dispose();
                    this._participants.splice(i, 1);
                }
            }

            this._updateDisplayMode();
            this._handleListSelectionChanged();
            this.headerText.innerText = Skype.Globalization.formatNumericID("participant_count", this.conversation.participants.size).translate(this.conversation.participants.size);
        },

        backLinkClick: function (e) {
                Skype.UI.navigateBack();
        },

        _handleListSelectionChanged: function (e) {
            var that = this;
            this.listControl.selection.getItems().done(function (selection) {
                that.selectedParticipants = [];
                for (var i = 0; i < selection.length; i++) {
                    selection[i] && that.selectedParticipants.push(selection[i].data.identity);
                }
                Skype.UI.AppBar.instance.updateContext({ selectedParticipants: that.selectedParticipants, conversationIdentity: that.conversationIdentity });
                roboSky.write("Selection,changed");
            });
        }
    });
})();

(function participantAriaLabelBinding() {
    "use strict";
    
    function handlePropertyChange(o, c, evt) {
        var propertyName = evt.detail;
        switch (propertyName) {
            case "name":
            case "isAvailable":
                o.label = makeLabel(c);
                break;
        }
    };

    function makeLabel(conversation) {
        return conversation.name +
            (conversation.isAvailable ? "," + "contact_status_available".translate() : "");
    }
        
    var sourcePropertyArray = ["label"];

    function participantAriaLabel(source, sourceProperty, dest, destProperties, value) {
        var src = source[sourceProperty[0]];
        if (!src) {
            return null;
        }

        
        var o = WinJS.Binding.as({
            label: makeLabel(src)
        });

        var handler = handlePropertyChange.bind(null, o, src);
        src.addEventListener("propertychanged", handler);

        
        var binding = WinJS.Binding.setAttribute(o, sourcePropertyArray, dest.parentNode, destProperties);

        
        var cancel = binding.cancel;
        binding.cancel = function () {
            src.removeEventListener("propertychanged", handler);
            cancel.call(binding);
        };

        return binding;
    }

    WinJS.Namespace.define("Skype.UI.ParticipantList", {
        participantAriaLabel: WinJS.Binding.initializer(participantAriaLabel)
    });
})();