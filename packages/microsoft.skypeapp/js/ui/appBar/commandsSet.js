

(function () {
    "use strict";

    var commandsSet = WinJS.Class.define(function () {
        this._views = {
            hub: false,
            contacts: false,
            dialer: false,
            conversation: false,
            allHistory: false,
            participantList: false,
            addPeople: false,
            _id: null
        };
        this.registerCommandsAndViews && this.registerCommandsAndViews();
        this.commandsIds = this.commands.map(function (cmd) {
            return cmd.id;
        });
        this.commands.forEach(function (cmd) {
            cmd.commandSet = this;
        },  this);
    }, {
        commands: null,
        commandsIds: null,
        _bar: null,
        _focusedView: null,
        _views: null,
        location: Skype.UI.AppBar.Location.bottom,
        
        ready: function (bar, id) {
            this._bar = bar;
            this._id = id;
        },

        setSticky: function (value) {
            this._bar.setSticky(value, this._id);
        },

        updateFocusedView: function (focusedView) {
            this._focusedView = focusedView;
            if (this._bar) {
                if (this.isVisibleOnCurrentView()) {
                    this._showCommands();
                }
            } 
        },
        
        updateContext: function (context) {
            this._updateContext && this._updateContext(context);
            if (this._bar) {
                if (this.isVisibleOnCurrentView()) {
                    this._showCommands();
                }
            }
        },
        
        showing: function () {
            if (this._bar && this.isVisibleOnCurrentView()) {
                this._showCommands();
            }
        },

        hided: function () {
            this._bar && this._bar.showHideCommands(null, this.commands);
        },
        
        isVisibleOnCurrentView: function () {
            return this._focusedView && this._views[this._focusedView.name];
        }
        
    });

    WinJS.Namespace.define("Skype.UI.AppBar", {
        CommandsSet: WinJS.Class.mix(commandsSet, Skype.Class.disposableMixin)
    });
})();