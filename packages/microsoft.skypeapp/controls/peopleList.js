

(function () {
    "use strict";

    var etw = new Skype.Diagnostics.ETW.Tracer("Skype.UI.PeopleList");
    var SEMANTICZOOMLIMIT = 40;

    var LETTERHEIGHTINSNAP = 55 + 5,
        LETTERSPERLINEINSNAP = 3;

    var peopleList = Skype.UI.ObservableControl.define(function () {
        this.init();
    }, {
        element: null,

        
        contactList: null,

        
        alphabetList: null,

        
        zoomContainer: null,


        
        recentSelection: null,

        
        initialSelection: null,

        
        initPromise: null,

        _isAlphabetListviewInitialized: false,


        
        selectionMode: {
            get: function () {
                return this._selectionMode || 'none';
            },
            set: function (value) {
                this._selectionMode = value;
            }
        },

        
        tapBehavior: {
            get: function () {
                return this._tapBehavior || 'directSelect';
            },
            set: function (value) {
                this._tapBehavior = value;
            }
        },

        init: function () {
            log('PeopleList init()');

            WinJS.UI.setOptions(this, this.options || {});
            this.initialSelection = this.initialSelection || {};
            this.recentSelection = [];

            this.initPromise = WinJS.UI.Fragments.renderCopy("/controls/peopleList.html", this.element)
                .then(function () {
                    
                    return WinJS.Promise.timeout();
                })
                .then(function () {
                    return this._initAsync();
                }.bind(this));
        },

        _onDispose: function () {
            this.initPromise && this.initPromise.cancel();
        },

        _initAsync: function () {
            log('PeopleList onRenderLazy()  isDisposed: ' + this.isDisposed);
            if (this.isDisposed) {
                return null;
            }

            
            this._updateLayout = this._updateLayout.bind(this);                     


            this.elmZoomContainer = this.element.querySelector("div.zoomContainer");
            this.elmContactList = this.element.querySelector("div.contacts.list");
            this.elmAlphabetList = this.element.querySelector("div.alphabet.list");

            this.regBind(Skype.Application.state.view, "size", this._onResize.bind(this));

            return WinJS.Resources.processAll(this.element)
                .then(function () {
                    Skype.UI.Util.preventTextLinks(this.element);
                }.bind(this))
                .then(function () {
                    return this._initContactListAsync();
                }.bind(this));
        },

        _initializePostponedControls: function () {
            if (!this._isAlphabetListviewInitialized) {
                this._initAlphabetListAsync()
                    .then(this._initZoomContainerAsync.bind(this))
                    .then(function () {
                        Skype.UI.Util.sendEvent("seZoReady", this.element);
                    }.bind(this));
                this._isAlphabetListviewInitialized = true;
            }
        },

        _handleListViewFinished: function (evt) {
            var listView = evt.srcElement.winControl;

            if (listView.loadingState === "complete" && !this.isDisposed) {
                this._initializePostponedControls();
            }
        },

        _initContactListAsync: function () {
            var elmTemplates = this.element.querySelector("#templates");

            var session = etw.startSession("contact list initialization");

            return WinJS.UI.processAll(this.elmContactList)
                .then(function () {
                    this.contactList = this.elmContactList.winControl;

                    this.regEventListener(this.contactList, "selectionchanging", this._onSelectionChanging.bind(this));
                    this.regEventListener(this.contactList, "loadingstatechanged", this._handleListViewFinished.bind(this));

                    session.write("processing templates");

                    return WinJS.UI.processAll(elmTemplates);
                }.bind(this))

                .then(function () {
                    this.regBind(this, "itemsDataSource", this._handleItemsDataSourceChanged.bind(this));

                    return WinJS.Promise.timeout(); 
                }.bind(this))

                .then(function () {
                    this.contactItemTemplate = elmTemplates.querySelector(".contactItemTemplate").winControl;
                    this.contactLetterTemplate = elmTemplates.querySelector(".contactLetterTemplate").winControl;

                    session.write("binding contact list");

                    
                    this.contactList.itemTemplate = this._renderContact.bind(this);
                    this.contactList.selectionMode = this.selectionMode;
                    this.contactList.tapBehavior = this.tapBehavior;
                    this.contactList.groupHeaderTemplate = this.contactLetterTemplate.element;

                    this._relayout();

                    return WinJS.Binding.processAll(this.elmContactList, this);
                }.bind(this))

                .then(function () {
                    session.stop();
                });
        },

        _initAlphabetListAsync: function () {

            var session = etw.startSession("alphabet list process");

            return WinJS.UI.processAll(this.elmAlphabetList)
                .then(function () {
                    this.alphabetList = this.elmAlphabetList.winControl;
                    this.regEventListener(this.alphabetList, "iteminvoked", this._onAlphabetItemClicked.bind(this));


                    WinJS.UI.setOptions(this.alphabetList, {
                        itemTemplate: this._renderLetter.bind(this),
                        selectionMode: "none"
                    });

                    return WinJS.Binding.processAll(this.elmAlphabetList, this);

                }.bind(this))

                .then(function () {
                    session.stop();
                });
        },
        _initZoomContainerAsync: function () {
            var session = etw.startSession("zoom container initialization");

            return WinJS.UI.processAll(this.elmZoomContainer)
                .then(function () {
                    this.zoomContainer = this.elmZoomContainer.winControl;

                    this.regEventListener(this.elmZoomContainer, "iteminvoked", this._handleItemInvoked.bind(this));
                    this.regEventListener(this.zoomContainer, "zoomchanged", this._handleZoomChanged.bind(this));
                    this.regEventListener(this.elmZoomContainer, "groupheaderinvoked", this._handleTitleInvoked.bind(this));

                    
                    
                    
                    Skype.UI.Util.disableElementAnimation(this.zoomContainer, this);

                    this._updateSezoButton();
                }.bind(this))

                .then(function () {
                    session.stop();
                });
        },

        _updateSezoButton: function () {
            if (!this.zoomContainer) {
                return;
            }

            var isSezoDisabled = !this.isSeZoEnabled;
            if (isSezoDisabled) {
                this.zoomContainer._zoom && this.zoomContainer._zoom(false, null, false);
            }
            this.zoomContainer.locked = isSezoDisabled;
            this.zoomContainer.forceLayout();
        },

        _handleZoomChanged: function (evt) {
            this._updateLayout(false);
        },

        _handleItemsDataSourceChanged: function (value) {
            this._clearContactsDataSource();
            this._setupContactsDataSource(value);
        },
        _clearContactsDataSource: function () {
            if (this._dataSource) {
                etw.write("clearing data source");
                if (this.zoomContainer && this.zoomContainer.zoomedOut) {
                    this.zoomContainer.zoomedOut = false;
                }
                this.unregObjectBinds(this._dataSource.contacts);
            }
        },
        _setupContactsDataSource: function (value) {
            var session = etw.startSession("setting new data source");
            if (value) {
                this._dataSource = value;

                this.regBind(this._dataSource.contacts, "length", this._handleContactListChanged.bind(this));

                this._makeInitialSelection();
            }
            session.stop();
        },

        _handleContactListChanged: function (v) {
            this.isSeZoEnabled = v > SEMANTICZOOMLIMIT;
            this._updateGroupLayout();
            this._updateSezoButton();
        },

        _handleTitleInvoked: function (e) {
            this.zoomContainer.zoomedOut = true;
        },

        _handleItemInvoked: function (e) {
            if (this.zoomContainer.zoomedOut || this.tapBehavior === 'toggleSelect') {
                e.cancelBubble = true;
            }
        },

        _relayout: function () {
            this._setContactListLayout();
            this._setAlphabetListLayout();
        },

        _updateGroupLayout: function () {
            this._groupedContacts = this.isSeZoEnabled ? this._dataSource.contacts.groups.dataSource : null;
        },

        _setContactListLayout: function () {
            if (this.contactList) {

                var itemWidth = Skype.Application.state.view.isVertical ? 320 : 380;
                var needToSwitchLayout;
                var size = Skype.Application.state.view.size;
                var numberOfColumns = size.width / itemWidth;
                if (numberOfColumns < 2) {
                    needToSwitchLayout = this.contactList.layout !== this._contactsListLayout;
                    if (needToSwitchLayout) {
                        this.contactList.layout = new WinJS.UI.ListLayout();
                    }
                    return;
                }

                var orientation = Skype.Application.state.view.orientation;
                var groupHeaderPosition = Skype.Application.state.view.isVertical ? WinJS.UI.HeaderPosition.top : WinJS.UI.HeaderPosition.left;

                var oldItem = this.contactList.currentItem;
                this.contactList.currentItem = { "index": 0, "type": "item", "key": null, "hasFocus": false, "showFocus": false };

                needToSwitchLayout = !(this.contactList.layout instanceof WinJS.UI.GridLayout);
                if (needToSwitchLayout) {
                    this.contactList.layout = new WinJS.UI.GridLayout({ orientation: orientation, groupHeaderPosition: groupHeaderPosition });
                } else {
                    if (this.contactList.layout.orientation !== orientation) {
                        this.contactList.layout.orientation = orientation;
                    }
                    if (this.contactList.layout.groupHeaderPosition !== groupHeaderPosition) {
                        this.contactList.layout.groupHeaderPosition = groupHeaderPosition;
                    }
                }
                
                
                this.contactList.ensureVisible(oldItem);
                            
            }
        },
        _setAlphabetListLayout: function () {
            if (this.alphabetList) {
                this.alphabetList.layout.orientation = Skype.Application.state.view.orientation;
            }
        },

        _onResize: function () {
            this._updateLayout(true);
        },

        _updateLayout: function (isWindowResize) {
            var neededHeight,
                isVertical = Skype.Application.state.view.isVertical,
                isZoomedOut = this.zoomContainer ? this.zoomContainer.zoomedOut : false;

            
            this.elmZoomContainer.style.height = '';
            this.element.style.overflow = '';

            
            if (isVertical && isZoomedOut) {
                neededHeight = Math.ceil(Skype.Model.ContactsRepository.instance.all.letters.length / LETTERSPERLINEINSNAP) * LETTERHEIGHTINSNAP + 10; 
                if (neededHeight > this.element.offsetHeight) {
                    this.elmZoomContainer.style.height = neededHeight + 'px';
                    this.element.style.overflow = 'auto'; 
                }
            }

            if (isWindowResize) {
                this._relayout();
            }
        },

        _makeInitialSelection: function () {
            var selection = this.contactList.selection;
            var items = this._dataSource.contacts;

            var selectedItems = [];
            for (var i = 0, length = items.length; i < length; i++) {
                var item = items.getItem(i);
                if (item.data.identity && this.initialSelection[item.data.identity]) {
                    selectedItems.push(item);
                }
            }
            selection.set(selectedItems);
        },

        _onAlphabetItemClicked: function (e) {
            e.detail.itemPromise.then(function (x) {
                if (!x.data.contactsCount) {
                    e.preventDefault();
                }
            });
        },

        _onSelectionChanging: function (e) {
            

            var newSelection = e.detail.newSelection.getIndices();
            if (newSelection.length > 0) {
                var newItems = this._diffNewItems(this.recentSelection, newSelection);
                if (newItems.length > 0) {
                    if (this._dataSource.contacts.getAt(newItems[0]).type === "letter") {
                        e.preventDefault();
                    } else {
                        this.recentSelection = newSelection;
                    }
                }
            }
        },

        _diffNewItems: function (oldIndices, newIndices) {
            return newIndices.filter(function (x) { return oldIndices.indexOf(x) === -1; });
        },

        _renderLetter: function (itemPromise) {
            var etws = etw.startSession("contacts,renderLetter");
            this._t = this._t || this.element.querySelector(".alphabetLetterTemplate");
            var result = this._t.renderItem(itemPromise);
            result.renderComplete.then(function () {
                etws.stop();
            });
            return result;
        },

        _renderContact_: function (itemPromise) {
            if (this.isDisposed) {
                return {
                    element: null
                };
            }

            ///<disable>JS2045.ReviewEmptyBlocks</disable>
            var etws = etw.startSession("contacts,renderContact");
            var that = this;

            var item, data;

            var element = document.createElement("div");
            element.className = "itemWrapper";

            return {
                element: element,

                renderComplete: itemPromise.then(function (i) {
                    if (that.isDisposed) {
                        return;
                    }

                    item = i;
                    data = i.data;

                    
                    etws.write("1nd phase");
                    if (data.isLetter) {
                        element.innerHTML =
                            "<div class='letterWrapper' title='" + data.name + "'>" +
                                "<div class='letter'><div " + (data.isLongKey ? "tiny" : "") + ">" + data.name + "</div></div></div>";
                    } else {
                        element.innerHTML = "<div class=\"contactWrapper\"><div class=\"title name\" >" + data.name + "</div></div>";
                    }
                    return item.ready;
                }).then(function () {
                    if (that.isDisposed) {
                        return;
                    }

                    if (!data.isLetter) {
                        element.innerHTML = "";

                        
                        etws.write("2nd phase");
                        that.contactItemTemplate.render(data, element);
                        etws.stop();
                    }
                })
            };
        },
        


        _renderContact: function (itemPromise) {
            if (this.isDisposed) {
                return {
                    element: null
                };
            }

            var that = this;

            var itemRenderCompletePromise;

            var element = itemPromise.then(function renderItem(item) {
                msWriteProfilerMark("WinJS.Binding.Template:render class='contactItemTemplate',StartTM");
                if (that.isDisposed) {
                    return;
                }

                var data = item.data;
                var template = data.isLetter ? that.contactLetterTemplate : that.contactItemTemplate;

                var renderItemResult = template.renderItem(itemPromise);
                itemRenderCompletePromise = renderItemResult.renderComplete;

                msWriteProfilerMark("WinJS.Binding.Template:render class='contactItemTemplate',StopTM");

                return renderItemResult.element;
            });


            var renderComplete = element.then(function () {
                return itemRenderCompletePromise;
            });

            return {
                element: element,
                renderComplete: renderComplete || element,
            };
        },

    }, {
        
        itemsDataSource: {
            value: null,
            writable: true,
            skipDispose: true
        },

        
        _dataSource: {
            value: null,
            writable: true,
            skipDispose: true
        },

        _groupedContacts: {
            value: null,
            writable: true,
            skipDispose: true
        },

        isSeZoEnabled: true,
    });

    WinJS.Namespace.define("Skype.UI", {
        PeopleList: peopleList
    });
})();



(function contactAriaLabelBinding() {
    "use strict";

    function handlePropertyChange(o, c, evt) {
        var propertyName = evt.detail;
        switch (propertyName) {
            case "mood":
            case "name":
            case "isAvailable":
                o.label = makeLabel(c);
                break;
        }
    };
    function makeLabel(conversation) {
        return conversation.name +
            (conversation.isAvailable ? "," + "contact_status_available".translate() : "") +
            (conversation.isMessengerContact ? "," + "contact_status_passport".translate() : "") +
            prependWithComma(conversation.mood);
    }

    function prependWithComma(str) {
        if (str && str.length > 0) {
            return "," + Skype.Utilities.trimHtmlNewlines(str, "");
        }
        return "";
    }

    var sourcePropertyArray = ["label"];

    function contactAriaLabel(source, sourceProperty, dest, destProperties, value) {
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


    WinJS.Namespace.define("Skype.UI.PeopleList", {
        contactAriaLabel: WinJS.Binding.initializer(contactAriaLabel)
    });

    Skype.UI.PeopleList.contactAriaLabel.delayable = true;
})();