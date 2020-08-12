

(function () {
    "use strict";

    var ONE_COLUMN_WIDTH = 320;

    Skype.UI.Page.define("/pages/allHistory.html", "div.fragment.allHistory", {
        useOneInstance: true,
        _snapHeaderMenu: null,

        onReady: function (options) {

            this._onReadyLazyPart = this._onReadyLazyPart.bind(this);
            this.onShow = this.onShow.bind(this);  
            this.onTitleClick = this.onTitleClick.bind(this);


            this.regEventListener(this.element.querySelector("button.backbutton"), "click", Skype.UI.navigateBack);

            this._readyLazyPartPromise = WinJS.Promise.timeout()
                .then(this._onReadyLazyPart(options));
        },

        onShow: function (options) {
            
            
            this._updateItemPosition();
        },

        _onReadyLazyPart: function (options) {
            var element = this.element,
                vm = this.vm = new Skype.ViewModel.AllHistoryVM(),
                Util = Skype.UI.Util;
            
            vm.run();
            this.allHistory = element.querySelector("div.fragment.allHistory div.recents").winControl;
            this.titleFilterAllEl = element.querySelector("button.title.link.filterAll");
            this.titleFilterUnreadEl = element.querySelector("button.title.link.filterUnread");
            this.regBind(Skype.Application.state.view, "orientation", this._updateAriaHasPopup.bind(this));
            this.regBind(vm, "hasUnread", this._updateItemPosition.bind(this));

            if (options) {
                options.switchToUnread && vm.switchToUnread();
                options.switchToDefault && vm.switchToDefault();
            }

            this.regBind(vm, "activeView", this.onActiveViewChanged.bind(this));

            WinJS.Binding.processAll(element, vm);
            
            this.regEventListener(this.titleFilterAllEl, "click", this.onTitleClick);
            this.regEventListener(this.titleFilterUnreadEl, "click", this.onTitleClick);
            this.regEventListener(this.allHistory, "loadingstatechanged", this.onLoadingStateChanged.bind(this));
            this.regEventListener(this.allHistory, "iteminvoked", this.onItemClicked);
            
            
            
            Skype.UI.Util.disableElementAnimation(element, this);
            this.regEventListener(element, "mousewheel", this.onMouseWheel.bind(this));
            this.regBind(Skype.Application.state.view, "size", this._onSizeChanged.bind(this));
            
            Util.preventTextLinks(element);
            
            Util.addMouseDownCss("div.linksContainer>div", element);
            Util.addMouseDownCss("button.title", element);
        },

        _onSizeChanged: function (size) {
            this._resize(size);
        },

        _resize: function (size) {
            var numberOfColumns = size.width / ONE_COLUMN_WIDTH,
                allHistory = this.allHistory,
                layout = allHistory.layout,
                UI = WinJS.UI,
                ListLayout = UI.ListLayout,
                GridLayout = UI.GridLayout,
                orientation = Skype.Application.state.view.orientation;
            
            if (numberOfColumns < 2) { 
                
                if (!(layout instanceof ListLayout)) {
                    allHistory.layout = new ListLayout();
                }
            } else {
                
                if (!(layout instanceof GridLayout)) {
                    allHistory.layout = new GridLayout({
                        orientation: orientation
                    });
                } else {
                    layout.orientation = orientation;
                }
            }
        },

        
        onMouseWheel: function (evt) {
            var allHistory = this.allHistory,
                direction = allHistory.layout.orientation == "horizontal" ? "scrollLeft" : "scrollTop";
            
            allHistory._viewport[direction] -= evt.wheelDelta;
        },

        onTitleClick: function (evt) {
            if (!Skype.Application.state.view.isVertical) {
                switch (evt.currentTarget) {
                    case this.titleFilterAllEl:
                        this.vm.switchToDefault();
                        break;
                    case this.titleFilterUnreadEl:
                        this.vm.switchToUnread();
                        break;
                }
            } else { 
                var commands = [{ 
                    id: "all",
                    type: "toggle",
                    selected: this.vm.activeView === Skype.ViewModel.AllHistoryVM.Views.default,
                    label: "allhistory_filtertitle_all".translate(),
                    onclick: this.vm.switchToDefault
                }, {
                    id: "unread",
                    type: "toggle",
                    selected: this.vm.activeView === Skype.ViewModel.AllHistoryVM.Views.unread,
                    label: "allhistory_filtertitle_unread_menu".translate(this.vm.unreadConversations.length),
                    onclick: this.vm.switchToUnread
                }];

                this._snapHeaderMenu = this._snapHeaderMenu || Skype.UI.Menu.create();

                if (this._snapHeaderMenu.hidden) {
                    this._snapHeaderMenu.commands = commands;
                    this._snapHeaderMenu.show(evt.currentTarget, "bottom", Skype.Globalization.isRightToLeft() ? "right" : "left");
                }
                roboSky.write("AllHistory,snapHeaderMenu,show");
            }
        },

        onActiveViewChanged: function () {
            log("allHistory onActiveViewChanged()");
            this.allHistory.tapBehavior = "none";
            if (Skype.Application.state.view.isVertical) {
                if (this.vm.activeView === Skype.ViewModel.AllHistoryVM.Views.default) {
                    if (document.activeElement == this.titleFilterUnreadEl) {
                        this.regImmediate(function() {
                            this.titleFilterAllEl.focus();
                        }.bind(this));
                    }
                }
                if (this.vm.activeView === Skype.ViewModel.AllHistoryVM.Views.unread) {
                    if (document.activeElement == this.titleFilterAllEl) {
                        this.regImmediate(function () {
                            this.titleFilterUnreadEl.focus();
                        }.bind(this));                        
                    }
                }
            }
            this._updateItemPosition();
        },

        onLoadingStateChanged: function (evt) {
            var listview = evt.target.winControl,
                state = listview && listview.loadingState,
                isLoading = state === "itemsLoading";
            log("allHistory onLoadingStateChanged(): " + state);
            if (isLoading) {
                listview.tapBehavior = "none";
            } else {
                listview.tapBehavior = "invokeOnly";
            }
        },

        onItemClicked: function (evt) {
            evt.detail.itemPromise.then(function (item) {
                if (item && item.data) {
                    Actions.invoke("focusConversation", item.data.identity);
                }
            });
        },

        _updateAriaHasPopup: function () {
            var isVertical = Skype.Application.state.view.isVertical ? "true" : "false";
            this.titleFilterAllEl.setAttribute("aria-haspopup", isVertical);
            this.titleFilterUnreadEl.setAttribute("aria-haspopup", isVertical);
        },

        _updateItemPosition: function () {
                this.allHistory.recalculateItemPosition();
        }

    });
}());
