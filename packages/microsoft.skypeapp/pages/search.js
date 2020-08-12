

(function () {
    "use strict";


    Skype.UI.Page.define("/pages/search.html", "div.fragment.search", {
        useOneInstance: false,
        disposeOnHide: false,
        _directorySearch: null,
        _boxPanel: null,
        _queryText: {
            get: function() {
                return WinJS.Application.sessionState.queryText;
            },
            set: function(text) {
                WinJS.Application.sessionState.queryText = text;
            }
        },
       
        _onWindowSizeChanged: function (e) {
            this._relayout();
        },

        _relayout: function () {
            this._vm.isVertical = Skype.Application.state.view.isVertical;

            if (this._contactsList) {

                var itemWidth = this._vm.isVertical ? 320 : 365;
                var needToSwitchLayout;
                var size = Skype.Application.state.view.size;
                var numberOfColumns = size.width / itemWidth;
                if (numberOfColumns < 2) {
                    needToSwitchLayout = !(this._contactsList.layout instanceof WinJS.UI.ListLayout);
                    if (needToSwitchLayout) {
                        this._contactsList.layout = new WinJS.UI.ListLayout();
                    }
                    return;
                }

                needToSwitchLayout = !(this._contactsList.layout instanceof WinJS.UI.GridLayout);
                if (needToSwitchLayout) {
                    this._contactsList.layout = new WinJS.UI.GridLayout({
                        orientation: Skype.Application.state.view.orientation
                    });
                } else {
                    var needToSwitchOrientation = this._contactsList.layout.orientation !== Skype.Application.state.view.orientation;
                    if (needToSwitchOrientation) {
                        this._contactsList.layout.orientation = Skype.Application.state.view.orientation;
                    }
                }
            }
        },
      
        _subscribeToSearchBoxPanel: function () {
            this._boxPanel.subscribe(this);
        },
        
        _unsubscribeToSearchBoxPanel: function () {
            this._boxPanel.unsubscribe();
        },

        _onItemClicked: function (evt) {
            evt.detail.itemPromise.then(function (target, item) {
                if (item.data.identity) {
                    if (item.data.source == "directory") {
                        Skype.Statistics.sendStats(Skype.Statistics.event.search_openDirectoryContact);
                    } else {
                        Skype.Statistics.sendStats(Skype.Statistics.event.search_openContact);
                    }
                    Actions.invoke("focusConversation", item.data.identity);
                } else {
                    var button = target.querySelector("button");
                    if (item.data.source === "directorySearchButton" && button) {
                        button.click();
                    }
                }
            }.bind(this, evt.target));
        },
        
        onReady: function () {
            this._contactsList = this.element.querySelector('div.fragment.search div.contacts').winControl;

            this._onWindowSizeChanged = this._onWindowSizeChanged.bind(this);
            this.regBind(Skype.Application.state.view, "size", this._onWindowSizeChanged);

            this.regEventListener(this._contactsList, 'iteminvoked', this._onItemClicked);

            Skype.UI.Util.preventTextLinks(this.element);
        },

        onRender: function () {
            this._vm = new Skype.ViewModel.SearchVM();
            this._boxPanel = document.getElementById("searchBoxPanel").winControl;
            WinJS.Binding.processAll(this.element, this._vm);
        },

        onHide: function () {
            this._unsubscribeToSearchBoxPanel();
        },

        _onDispose: function () {
            this._boxPanel = null;
        },

        onShow: function (options) {
            this._directorySearch = !!options.directory;
            this._subscribeToSearchBoxPanel();

            if (options.isNavigatingBack) {
                options.reset = false;
            }

            if (options.reset || !this._queryText) {
                this._vm.resetAsync();
            } else {
                this._boxPanel.setQueryText(this._queryText);
            }

            if (this._directorySearch) {
                
                this._boxPanel.setPlaceholder("search_box_add_contact_placeholder");
            } else {
                
                this._boxPanel.setPlaceholder("search_box_placeholder");
            }

            
            this._contactsList && this._contactsList.forceLayout();
        },

        search: function (searchText) {
            this._queryText = searchText; 
            
            if (this._vm.status === Skype.ViewModel.SearchVM.SearchStatus.searching) {
                this._vm.cancelDirectorySearch();
            }

            if (this._directorySearch) {
                this._vm.searchDirectoryOnly(searchText);
            } else {
                this._vm.searchAsync(searchText);
            }
        }
    });

}());