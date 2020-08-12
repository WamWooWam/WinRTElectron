

(function () {
    "use strict";

    var favoriteRemoveCommandSet = WinJS.Class.derive(Skype.UI.AppBar.CommandsSet, function () {
        Skype.UI.AppBar.CommandsSet.prototype.constructor.call(this);
    }, {
        _selectedFavorites: null,

        registerCommandsAndViews: function () {
            this.commands = [
                {
                    id: 'removeFav',
                    label: 'appbar_remove_favorite'.translate(),
                    icon: '\uE414',
                    section: 'selection',
                    onclick: this._handleRemoveFavClick.bind(this),
                    hidden: true
                }
            ];
            
            this._views.hub = true;
        },
        
        _updateContext: function (context) {
            this._selectedFavorites = context && context.selectedFavorites || null;
            this._showCommands(); 
            var someFavsSelected = !!(this._bar && this._selectedFavorites && this._selectedFavorites.length);

            this.setSticky(someFavsSelected);
            if (someFavsSelected) {
                this._bar.show();
            }
        },

        _showCommands: function () {
            if (this._selectedFavorites && this._selectedFavorites.length) {
                this.setSticky(true);

                
                var command = this._bar.getCommandById("removeFav");

                command._label = Skype.Globalization.formatNumericID("appbar_remove_favorite", this._selectedFavorites.length).translate(this._selectedFavorites.length);
                if (command._labelSpan) {
                    command._labelSpan.innerText = command._label;
                }

                this._bar.showHideCommands(['removeFav']);
                roboSky.write("AppBar,RemoveFavorites,shown");
            } else {
                this._bar.showHideCommands(null, ['removeFav']);
                this.setSticky(false);
            }
        },

        _handleRemoveFavClick: function (e) {
            if (this._selectedFavorites) {
                for (var i = 0; i < this._selectedFavorites.length; i++) {
                    var conversation = this._selectedFavorites[i];
                    conversation.libConversation.unPin();
                }
                this._bar.hide();
            }
            roboSky.write("Hub,Favorites,removed");
        }
    });

    WinJS.Namespace.define("Skype.UI.AppBar", {
        FavoriteRemoveCommandSet: favoriteRemoveCommandSet
    });

    Skype.UI.AppBar.registerCommandSet(new Skype.UI.AppBar.FavoriteRemoveCommandSet());
})();