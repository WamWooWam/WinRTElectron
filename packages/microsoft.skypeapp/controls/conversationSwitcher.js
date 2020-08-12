

(function () {
    "use strict";

    var withPanel = 'WITHPANEL',
        hiddenClass = 'HIDDEN',
        conversationSwitcherElement = null,
        conversationSwitcherInitialized = false;

    var conversationSwitcher = WinJS.Class.derive(Skype.UI.LazyInitializedControl, function (element, options) {
        this.element = element;
        this.element.winControl = this;
        this._updateButtonPosition = this._updateButtonPosition.bind(this);
    }, {
        recentsVM: null,

        lazyInitAsync: function () {
            log('ConversationSwitcher control lazyInitAsync()');
            return WinJS.UI.Fragments.render("/controls/conversationSwitcher.html", this.element).then(this.ready.bind(this));
        },

        ready: function () {
            log('ConversationSwitcher control ready()');

            WinJS.UI.processAll(this.element);

            this.button = this.element.querySelector('div.button');
            this.buttonCenter = this.button.querySelector('button.buttonCenter');
            this.regEventListener(this.buttonCenter, 'click', this.buttonTapHandler.bind(this));

            this._initRecentsVM();
            WinJS.Binding.processAll(this.element, this.vm);

            Skype.UI.Util.addMouseDownCss(this.buttonCenter);

            this.regBind(Skype.Application.state.view, "orientation", this._updateButtonPosition);
            this.regBind(Skype.Application.state.focusedConversation, "immersiveMode", this._updateButtonBorder.bind(this));
            this.regBind(Skype.Application.state.focusedConversation, "state", this._updateButtonPosition);
            this.regBind(Skype.Application.state.focusedConversation, "isChatOpenInLive", this._updateButtonPosition);

            WinJS.Utilities.query('.animRegion', this.element).setStyle('opacity', '1');
            Skype.UI.ConversationSwitcher.mutateSwitcherIndex();
        },

        _initRecentsVM: function () {
            this.vm = new Skype.ViewModel.ConversationSwitcherButtonVM();
            this.vm.run();
        },

        _updateButtonPosition: function () {
            var buttonMovedDueToChat = !Skype.Application.state.view.isVertical && 
                Skype.Application.state.focusedConversation.identity && Skype.Application.state.focusedConversation.isChatOpenInLive;

            Skype.UI.Util.setClass(this.button, withPanel, buttonMovedDueToChat);
        },

        _updateButtonBorder: function () {
            Skype.UI.Util.setClass(this.button, hiddenClass, Skype.Application.state.focusedConversation.immersiveMode);
        },

        buttonTapHandler: function (evt) {
            var currentPage = Skype.Application.state.page.name || "";
            Skype.Statistics.sendStats(Skype.Statistics.event.openUnreadedMessages, currentPage);
            Skype.UI.Util.animateInvoke(evt.currentTarget, function () {
                Skype.UI.navigate("allHistory", { switchToUnread: this.vm.hasUnread });
            }.bind(this));
        }
    }, {
        init: function () {
            log('ConversationSwitcher init');
            if (!conversationSwitcherInitialized) {
                conversationSwitcherInitialized = true;
                conversationSwitcherElement = conversationSwitcherElement || document.querySelector("div.conversationSwitcher");
                Skype.UI.LazyInitializedControl.initAsync(conversationSwitcherElement);
            }
        },

        dispose: function () {
            log('ConversationSwitcher dispose');
            var control = document.querySelector("div.conversationSwitcher").winControl;
            control && control.dispose();
            conversationSwitcherInitialized = false;
        },

        mutateSwitcherIndex: function () {
            var switcher = document.querySelector(".page .conversationSwitcher .button .buttonCenter"),
                originalIndex = (switcher) ? switcher.getAttribute("originalIndex") : null;
            if (switcher) {
                if (["conversation", "dialer", "contacts", "participantList"].contains(Skype.Application.state.page.name)) {
                    var switcherTabIndex = 5; 
                    if (["contacts", "participantList"].contains(Skype.Application.state.page.name)) {
                        switcherTabIndex = 2;
                    }
                    if (originalIndex || !WinJS.Utilities.hasClass(switcher, "UNREAD")) {
                        switcher.setAttribute("originalIndex", switcherTabIndex);
                    } else {
                        switcher.tabIndex = switcherTabIndex;
                    }
                }
            }
        }
    });

    WinJS.Namespace.define("Skype.UI", {
        ConversationSwitcher: WinJS.Class.mix(conversationSwitcher, Skype.Class.disposableMixin)
    });

    window.traceClassMethods && window.traceClassMethods(conversationSwitcher, "ConversationSwitcher", ["ready", "_initRecentsVM"]);
})();