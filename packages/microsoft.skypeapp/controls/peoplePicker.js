

(function () {
    "use strict";

    var instance = null;

    var peoplePicker = Skype.UI.Control.define(function (element, options) {
        element.focus();
        element.addEventListener("keypress", this.cancel);
        element.addEventListener("keydown", this.cancel);
    }, {
        element: null,
        title: null,
        ariaWindowLabel:"",
        _callbackFn: null,
        tag: null,
        isClosed: true,

        contactList: null,
        selectedContactsSource: null,
        selectedContactsElement: null,
        selectedContactsList: null,
        _tabConstrainer: null,

        cancel: function (evt) {
            evt.cancelBubble = true;
            evt.preventDefault();
            evt.stopPropagation();
            return false;
        },

        pickMultipleContactsAsync: function (title, ariaWindowLabel, tag) {
            return new WinJS.Promise(
                function promInit(c, e, p) {                    
                    this.element.className = "peoplePicker";
                    Skype.UI.AppBar && Skype.UI.AppBar.instance.disable();

                    document.body.appendChild(this.element);

                    WinJS.Utilities.addClass(document.body, "PICKERACTIVE");

                    this._callbackFn = c;
                    this.tag = tag;
                    this.title = title;
                    this.ariaWindowLabel = ariaWindowLabel;

                    this.init();
                }.bind(this)
            );
        },

        
        init: function () {
            log('PeoplePicker init()');
            WinJS.UI.Fragments.renderCopy("/controls/peoplePicker.html", this.element).then(this.onReady.bind(this));
        },

        onReady: function () {
            this.selectedContactsSource = new WinJS.Binding.List();

            this.regEventListener(this.element.querySelector(".contactList"), "seZoReady", function () { 
                this._enableTabConstrainer();
            }.bind(this));

            WinJS.UI.processAll(this.element, true);
            WinJS.Resources.processAll(this.element);
            WinJS.Binding.processAll(this.element, this);

            Skype.UI.CallNotifications && Skype.UI.CallNotifications.setLayerOnTopOfConversation(true);
            Skype.Application.state.isPeoplePickerOpened = true;

            this.contactList = this.element.querySelector("div.contactList").winControl;
            this.contactList.initialSelection = this.options.preselectedItems || {};
            this.contactList.itemsDataSource = this.options.dataSource;

            this.element.querySelector("div.contactList").setAttribute("aria-label", this.ariaWindowLabel);

            this.selectedContactsElement = this.element.querySelector("div.selectedContacts.list");
            this.selectedContactsList = new WinJS.UI.ListView(this.selectedContactsElement);

            this.innerListKeyDownHandlerInit = this.innerListKeyDownHandlerInit.bind(this); 

            
            this.updateLayout(); 

            this.regEventListener(this.selectedContactsList, "iteminvoked", this.selectedItemClicked.bind(this));

            this.regEventListener(this.contactList.element, "selectionchanging", this._onSelectionChanging.bind(this));
            this.regEventListener(this.contactList.element, "selectionchanged", this.selectionChanged.bind(this));

            Skype.UI.Util.preventTextLinks(this.element);

            this.regEventListener(this.element.querySelector("button.add"), "click", this.addClicked.bind(this));

            
            this.regEventListener(Skype.Application.state, "navigated", this.hide.bind(this));
            this.hide();

            this.regEventListener(this.element.querySelector("button.cancel"), "click", this.cancelClicked.bind(this));

            this.isClosed = false;
            this.contactList.initPromise.then(function () {
                this.innerListKeyDownHandlerInit();
                this.element.removeEventListener("keydown", this.cancel);
                this.element.removeEventListener("keypress", this.cancel);
            }.bind(this));
            roboSky.write("PeoplePicker,ready");
        },
        
        _enableTabConstrainer: function() {
            var elmTabConstrainer = this.element.querySelector(".picker-accessWrap");
            this._tabConstrainer = new Skype.UI.TabConstrainer(elmTabConstrainer, { startsWithControl: true, firstFocusQuery: "div.contactList" });
            this._tabConstrainer.enable();
        },

        _onDispose: function () {
            log('PeoplePicker _onDispose()'); 
        },

        innerListKeyDownHandlerInit: function () { 
            if (this.contactList.contactList) {
                var that = this.contactList.contactList._mode;
                var onKeyDown = that.onKeyDown;
                that.onKeyDown = function (eventObject) {
                    if (!(eventObject.keyCode == WinJS.Utilities.Key.enter && WinJS.Utilities.hasClass(eventObject.srcElement, "itemWrapper") && WinJS.Utilities.hasClass(eventObject.srcElement.parentElement, "win-selected"))) {
                        onKeyDown.call(that, eventObject);
                    }
                };
            }

            var contactListInnerList = this.contactList.element.querySelector('div.contacts.list.win-listview');
            if (contactListInnerList) {
                this.regEventListener(contactListInnerList, "keydown", this.innerListKeyDownHandler.bind(this));
            }
            this.regEventListener(this.element, "keydown", this.keyDownHandler.bind(this));
        },

        innerListKeyDownHandler: function (evt) {
            if (evt.keyCode === WinJS.Utilities.Key.enter) {
                evt.preventDefault();
                evt.cancelBubble = true;
                evt.stopPropagation();
                evt.stopImmediatePropagation();
                if (this.selectedContactsSource.length > 0) {
                    this.regImmediate(this.addClicked.bind(this));
                }
                return false;
            } else {
                this.keyDownHandler(evt);
            }
            return true;
        },

        keyDownHandler: function (evt) {
            if (evt.keyCode === WinJS.Utilities.Key.escape) {
                this.cancelClicked();
            }
        },

        addClicked: function () {
            this._callbackFn(this.selectedContactsSource);
            this.hide();
        },

        cancelClicked: function (e) {
            this._callbackFn();
            this.hide();
        },

        hide: function (tag) {
            log('PeoplePicker hide()');

            if (this.isClosed) {
                return;
            }

            if (tag && tag !== this.tag) {
                return;
            }
            if (!this.element) {
                return;
            }
            this.isClosed = true;

            
            this._tabConstrainer && this._tabConstrainer.disable();
            
            WinJS.Utilities.removeClass(document.body, "PICKERACTIVE");

            this.contactList.itemsDataSource = null;
            this.selectedContactsList.itemsDataSource = null;

            Skype.UI.AppBar && Skype.UI.AppBar.instance.enable();
            Skype.UI.CallNotifications && Skype.UI.CallNotifications.setLayerOnTopOfConversation(false);

            Skype.UI.Util.removeFromDOM(this.element);
            this.element = null;

            Skype.Application.state.isPeoplePickerOpened = false;
        },

        selectedItemClicked: function (e) {

            var selection = this.contactList.contactList.selection;
            var selectedItem = this.selectedContactsSource.getItem(e.detail.itemIndex);

            if (selectedItem && selectedItem.data && selection.count() > 0) {
                selection.getItems().then(function (items) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].data.conversation && (items[i].data.conversation.id == selectedItem.data.id)) {
                            this.regImmediate(function (ix) {
                                selection.remove(items[ix]);
                            }.bind(this, i));
                        }
                    }
                }.bind(this));
            }

            e.preventDefault();
            e.stopPropagation();
            return false;
        },


        backLinkClick: function (e) {
            Skype.UI.navigateBack();
        },

        updateLayout: function () {
            var selected = {
                layout: new WinJS.UI.GridLayout(),
                selectionMode: "single",
                swipeBehavior: "none",
                itemTemplate: document.querySelector(".selectedContactTemplate"),
                itemDataSource: this.selectedContactsSource.dataSource
            };
            selected.layout.groupInfo = { enableCellSpanning: true, cellWidth: 210, cellHeight: 118 };

            WinJS.UI.setOptions(this.selectedContactsList, selected);
        },

        
        _onSelectionChanging: function (e) {
            var selection = e.detail.newSelection;
            selection.getItems().then(function (items) {
                var letters = items.filter(function (item) { return item.data.isLetter; });
                selection.remove(letters);
            });
        },

        selectionChanged: function (a, b) {
            if (this.contactList.contactList) {
                var selection = this.contactList.contactList.selection;
                if (selection.count() === 0 && this.selectedContactsSource.length) {
                    this.selectedContactsSource.forEach(function (conversationClone) {
                        conversationClone.dispose();
                    });
                    this.selectedContactsSource.splice(0, this.selectedContactsSource.length);
                }

                selection.getItems().then(function (items) {
                    var i,
                        j,
                        conversationClone,
                        conversation,
                        libConv;
                    
                    for (i = 0; i < this.selectedContactsSource.length; i++) {
                        for (j = 0; j < items.length; j++) {
                            if (items[j].data == this.selectedContactsSource.getAt(i)) {
                                break;
                            }
                        }
                        if (j === items.length) {
                            this.selectedContactsSource.getAt(i).dispose();
                            this.selectedContactsSource.splice(i--, 1);
                        }
                    }
                    
                    for (i = 0; i < items.length; i++) {
                        if (!items[i].data.isLetter && this.selectedContactsSource.indexOf(items[i].data) === -1) {
                            
                            
                            
                            
                            
                            
                            conversation = items[i].data.conversation;
                            libConv = lib.getConversation(conversation.id);
                            conversationClone = Skype.Model.ConversationFactory.createConversation(libConv);
                            this.selectedContactsSource.push(conversationClone);
                        }
                    }
                    roboSky.write("Selection,changed");
                }.bind(this));
            }
        }

    }, {
        pickMultipleContactsAsync: function pickMultipleContactsAsync(dataSource, preselectedItems, title, ariaWindowLabel, tag) {
            
            
            

            instance = new Skype.UI.PeoplePicker(document.createElement("div"), {
                preselectedItems: preselectedItems,
                dataSource: dataSource
            });
            return instance.pickMultipleContactsAsync(title, ariaWindowLabel, tag);
        },
        hide: function hide(tag) {
            instance && instance.hide(tag);
        }
    });

    WinJS.Namespace.define("Skype.UI", {
        PeoplePicker: peoplePicker
    });

})();