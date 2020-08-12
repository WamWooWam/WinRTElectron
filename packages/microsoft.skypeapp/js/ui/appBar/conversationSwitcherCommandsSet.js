

(function () {
    "use strict";

    var conversationSwitcherCommandsSet = MvvmJS.Class.derive(Skype.UI.AppBar.CommandsSet, function () {
        Skype.UI.AppBar.CommandsSet.prototype.constructor.call(this);
    }, {
        _searchAppBarControl: null,
        _searchingContact: false,
        _viewModel: null,
        _recents: null,
        location: Skype.UI.AppBar.Location.top,

        registerCommandsAndViews: function () {
            this.commands = [{
                id: 'conversationSwitcher',
                hidden: false
            }];

            this._views.hub = true;
            this._views.allHistory = true;
            this._views.contacts = true;
            this._views.addPeople = true;
            this._views.dialer = true;
            this._views.conversation = true;
            this._views.participantList = true;
            this._views.search = true;
        },

        ready: function (bar, id) {
            conversationSwitcherCommandsSet.base.ready.call(this, bar, id);

            this._recents = bar.querySelector('div.recents').winControl;
            Skype.UI.Util.addMouseDownCss(bar.querySelector(".appBarLogo"));
            Skype.UI.Util.addMouseDownCss(bar.querySelector(".appBarRecentsLink"));
            Skype.UI.Util.preventTextLinks(bar.querySelector('div.recents').winControl.element);
        },

        _showCommands: function () {
        },

        showing: function () {
            if (this.isVisibleOnCurrentView()) {
                this._initRecents();
            }
        },

        handleSoftDispose: function () {
            
            if (!this.isDisposed && this._viewModel) {
                this._viewModel.softDispose();
                this._recents.forceLayout(); 
            }
        },

        _initRecents: function () {
            this._viewModel = this._viewModel || new Skype.ViewModel.ConversationSwitcherCommandsSetVM(this._recents, { hide: this._bar.hide.bind(this._bar) });
            if (!this._viewModel.conversations) {
                
                this._viewModel.run();
                WinJS.Binding.processAll(this._recents.element.parentNode, this._viewModel);
            }
        },

        updateFocusedView: function (focusedView) {
            Skype.UI.AppBar.CommandsSet.prototype.updateFocusedView.call(this, focusedView);
            if (this._bar) {
                if (this.isVisibleOnCurrentView()) {
                    this.commands[0].hidden = false;
                    this._bar.showHideCommands();
                } else {
                    this.commands[0].hidden = true;
                    this._bar.showHideCommands();
                }
            }
        }
    });

    WinJS.Namespace.define("Skype.UI.AppBar", {
        ConversationSwitcherCommandsSet: conversationSwitcherCommandsSet
    });

    Skype.UI.AppBar.registerCommandSet(new Skype.UI.AppBar.ConversationSwitcherCommandsSet());
})();