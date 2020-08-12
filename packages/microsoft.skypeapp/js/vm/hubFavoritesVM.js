

(function () {
    "use strict";

    var hubFavoritesVM = MvvmJS.Class.define(function (contactListLimit) {
        this.contactListLimit = contactListLimit;
        this.regBind(Skype.Model.ConversationsRepository.instance, "length", this._updateUIFlags.bind(this));
        this.regBind(this.favorites, "length", this._updateUIFlags.bind(this));
    }, {
        contactListLimit: null,
        _updateUIFlags: function() {
            this.allPeopleInFavorites = Skype.Model.ConversationsRepository.instance.length === this.favorites.length && this.favorites.length > 0;
            this.hideFavorites = Skype.Model.ConversationsRepository.instance.length <= this.contactListLimit && !this.favorites.length;
            this.canAddToFavorites = Skype.Model.ConversationsRepository.instance.hasItems && !this.allPeopleInFavorites;
        },
    }, {
        favorites: {
            get: function() {
                return Skype.Model.FavoriteConversationsRepository.instance.conversations;
            }
        },
        canAddToFavorites: false,
        allPeopleInFavorites: false,
        hideFavorites: false
});

    WinJS.Namespace.define("Skype.ViewModel", {
        HubFavoritesVM: WinJS.Class.mix(hubFavoritesVM, Skype.Class.disposableMixin)
    });
    
}());

