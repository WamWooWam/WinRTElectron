
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,Microsoft,WinJS*/

Jx.delayDefine(Mail, "CompMessageList", function () {
    "use strict";

    Mail.CompMessageList = function (host, selection, commandBar, animator, settings) {
        Debug.assert(Jx.isObject(host));
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isInstanceOf(commandBar, Mail.CompCommandBar));
        Debug.assert(Jx.isObject(animator));
        Debug.assert(Jx.isObject(settings));

        _markStart("Ctor");
        _markStart("Ctor_InitComp");
        this.initComponent();
        _markStop("Ctor_InitComp");

        this._name = "Mail.CompMessageList";

        this._host = host;
        this._selection = selection;
        this._animator = animator;
        this._settings = settings;

        this._syncMonitor = null;

        this._listView = null;
        this._collection = null;
        this._dataAdaptor = null;
        this._itemRenderer = null;
        this._selectionHandler = null;
        this._nameHeader = null;
        this._progressRing = null;
        this._filter = null;
        this._notificationHandler = null;
        this._dataProvider = null;
        this._searchHandler = null;
        this._messageChangedPromise = null;
        this._updateDatasourcePromise = null;
        this._emptyTextControl = null;

        var viewIntro = this._viewIntro = new Mail.ViewIntroductionHeader(settings);
        this.appendChild(viewIntro);

        this._commandBar = commandBar;

        this._visible = true;
        this._jobSet = Jx.scheduler.createJobSet();

        // disposers
        this._disposer = new Mail.Disposer();
        this._collectionDisposer = null;
        this._searchDisposer = null;

        this._canvasCommandBar = null;
        this._registerCanvasCommandBarJob = null;

        this._rootElement = null;
        _markStop("Ctor");
    };
    Jx.augment(Mail.CompMessageList, Jx.Component);
    Mail.CompMessageList.defaultElementId = "mailMessageListCollection";
    
    var prototype = Mail.CompMessageList.prototype;

    prototype.deactivateUI = function () {
        Jx.Component.prototype.deactivateUI.call(this);

        Jx.dispose(this._jobSet);
        this._jobSet = null;

        Jx.dispose(this._disposer);
        this._disposer = null;

        this._filter = null;
        this._progressRing = null;
       
        // Cleanup the ListView
        Mail.ListViewHelper.enableAnimation(this._listView);
        this._animator.unregisterMessageList();

        // MessageListItemFactory unhooks event from the listView, need to null it before disposing the actual listView
        Mail.MessageListItemFactory.listView = null;
        this._disposeCollection();
        this._listView.dispose();
        this._listView = null;

        this._disposeView();

        // Dispose search
        Jx.dispose(this._searchDisposer);
        this._searchDisposer = null;

        Jx.dispose(this._searchHandler);
        this._searchHandler = null;

        Jx.dispose(this._canvasCommandBar);
        this._canvasCommandBar = null;
    };

    prototype.shutdownComponent = function () {
        Jx.Component.prototype.shutdownComponent.call(this);
    };

    prototype.getUI = function (ui) {
        var res = Jx.res;
        var escapeHtml = Jx.escapeHtml;
        ui.html =
        "<div id='mailFrameMessageListBackground' class='mailFrameMessageListBackground'>" +
            "<div id='mailFrameMessageList' class='supportMultiSelect'>" +
                "<div id='messageList' class='selectionModeInactive'>" +
                    "<div id='mailMessageListHeaderArea'>" +
                        "<div id='mailMessageListAccountName' class='typeSizeNormal' role='heading'></div>" +
                        "<div id='mailMessageListFolderName' role='heading'></div>" +
                        "<div id='mailMessageListCanvasButtons'>" +
                            "<button class='mailCanvasButton mailMessageListRespondButton hidden mirrorInRTL useCustomFont' aria-label='" + escapeHtml(res.getString("mailCommandRespondAriaLabel")) + "' type='button'><div aria-hidden='true' class='moveLeftByTwoPixels'>&#xE172;</div></button>" +
                            "<button class='mailCanvasButton mailMessageListComposeButton hidden' aria-label='" + escapeHtml(res.getString("mailCommandComposeAriaLabel")) + "' type='button'><div aria-hidden='true'>&#xE109;</div></button>" +
                            "<button class='mailCanvasButton mailMessageListDeleteButton hidden' aria-label='" + escapeHtml(res.getString("mailCommandDeleteAriaLabel")) + "' type='button'><div aria-hidden='true'>&#xE107;</div></button>" +
                        "</div>" +
                        Jx.getUI(this._viewIntro).html +
                    "</div>" +
                    "<div id='mailMessageListFilterHeader' class='mailMessageListSecondRow'>" +
                        "<div id='mailMessageListFilterContainer'>" +
                            "<input class='mailMessageListAllCheckbox' role='checkbox' type='checkbox' aria-label='" + escapeHtml(res.getString("mailSelectAllCheckboxAriaLabel")) + "'/>" +
                            "<div id='mailMessageListFilter' class='comboboxHost' aria-expanded='false' aria-haspopup='true' role='button' tabindex='0'>" +
                                "<div class='comboboxText' aria-hidden='true'></div>" +
                                "<div class='comboboxArrow' aria-hidden='true'>&#x2002;&#xE015;</div>" +
                            "</div>" +
                        "</div>" +
                        "<button id='mailMessageListStartSearch' aria-label='" + escapeHtml(res.getString("mailMessageListStartSearch")) + "' role='button'>&#xE094;</button>" +
                    "</div>" +
                    "<div id='mailMessageListSearchHeader' class='mailMessageListSecondRow'>" +
                        "<div id='mailMessageListSearchScope' class='comboboxHost' aria-expanded='false' aria-haspopup='true' role='button' tabindex='0'>" +
                            "<div class='comboboxText' aria-hidden='true'></div>" +
                            "<div class='comboboxArrow' aria-hidden='true'>&#x2002;&#xE015;</div>" +
                        "</div>" +
                        "<div id='mailMessageListSearchBoxContainer'>" +
                            "<div id='mailMessageListSearchBox'></div>" +
                            "<button id='mailMessageListDismissSearch' aria-label='" + Jx.escapeHtml(Jx.res.getString("mailMessageListCancelSearch")) + "' role='button'>&#xE0A4;</button>" +
                        "</div>" +
                    "</div>" +
                    "<div id='messageListContents'>" +
                        "<div id='mailMessageListEmptyMessageWrapper'>" +
                            "<div id='mailMessageListEmptyMessage' class='hidden typeSizeNormal'></div>" +
                        "</div>" +
                        "<div id='mailMessageListCollection' class='win-selectionstylefilled' aria-describedby='mailMessageListCollectionDesc' aria-label='" + escapeHtml(res.getString("mailMessageListCollectionAriaLabel")) + "'></div>" +
                        "<div id='mailMessageListCollectionDesc' class='hidden'  aria-label='" + escapeHtml(res.getString("mailMessageListListViewAriaDescription")) + "'></div>" +
                    "</div>" +
                    "<progress id='mailMessageListProgress' class='win-progress hidden' max='100'></progress>" +
                    "<div id='mailMessageListSearchStatus' class='hidden'></div>" +
                "</div>" +
            "</div>" +
        "</div>";
    };

    prototype._createListView = function () {
        /// <summary>This function creates the ListView</summary>
        _markStart("createListView");
        Mail.log("MessageList_listViewStartup", Mail.LogEvent.start);

        _markStart("createListView_listViewItemRenderer");
        var listViewItemRenderer = new WinJS.UI.simpleItemRenderer(this._renderItem.bind(this));
        _markStop("createListView_listViewItemRenderer");

        _markStart("createListView_layout");
        var layout = new WinJS.UI.ListLayout();
        _markStop("createListView_layout");

        _markStart("createListView_dataSource");

        // Simple forwarding subclass of WinJS.UI.VirtualizedDataSource (which can't be directly instantiated)
        Mail.CompMessageListVirtualizedDataSource = WinJS.Class.derive(WinJS.UI.VirtualizedDataSource, function (dataAdapter, options) {
            this._baseDataSourceConstructor(dataAdapter, options);
        });

        // Default cache size when compareByIdentity is false, to be fine tuned later
        var dataSource = new Mail.CompMessageListVirtualizedDataSource(this, { cacheSize: 200 });
        _markStop("createListView_dataSource");

        _markStart("createListView_ctor");
        var listViewElement = document.getElementById(Mail.CompMessageList.defaultElementId);
        var listView = this._listView = new WinJS.UI.ListView(listViewElement, {
            itemTemplate: listViewItemRenderer,
            layout: layout,
            itemDataSource: dataSource,
            selectionMode: "multi",
            swipeBehavior: "select",  // This is to make sure that we can only deselect an element by sliding instead of touching
            tapBehavior: "directSelect",
            itemsDraggable: true
        });
        _markStop("createListView_ctor");

        Mail.MessageListItemFactory.listView = listView;
        Mail.ListViewHelper.disableAnimation(this._listView);

        var listViewCanvas = listViewElement.querySelector(".win-viewport");
        Debug.assert(Jx.isHTMLElement(listViewCanvas));

        this._disposer.addMany(
            new Mail.EventHook(listView, "loadingstatechanged", this._onLoadingStateChanged, this),
            new Mail.EventHook(listViewCanvas, "click", this._onClick, this),
            new Mail.EventHook(listViewCanvas, "keydown", this._onKeyDown, this)
        );

        this._animator.registerMessageList(this._listView);
        _markStop("createListView");
    };

    prototype._onFirstLaunch = function () {
        Debug.assert(Jx.isObject(this._listView));
        var listViewLoadingState = this._listView.loadingState;
        Mail.writeProfilerMark("listview state: " + listViewLoadingState);

        if (listViewLoadingState === "viewPortLoaded") {
            var splashScreen = Mail.Globals.splashScreen;
            splashScreen.dismiss();
        }

        if (this._isViewReady()) {
            Mail.log("MessageList_listViewStartup", Mail.LogEvent.stop);
            this._onFirstLaunch = Jx.fnEmpty;
        }
    };

    prototype.focus = function () {
        _markStart("focus");
        this._refreshListView();
        if (!Mail.setActiveElement(Mail.CompMessageList.defaultElementId)) {
            // Try elsewhere if we can't focus on the ListView
            Mail.setActiveElement(Mail.CompApp.rootElementId);
        }
        _markStop("focus");
    };

    prototype._onLoadingStateChanged = function () {
        var isViewReady = this._isViewReady() && this._isSyncComplete();
        if (isViewReady) {
            Jx.mark("MessageList_listViewReady");
        }

        this._setLocked();
        this._onFirstLaunch();
    };

    prototype.activateUI = function () {
        _markStart("activateUI");

        var rootElement = this._rootElement = document.getElementById("mailFrameMessageListBackground");

        this._animator.setMessageListElements(
            rootElement,
            rootElement.querySelector("#mailFrameMessageList"),
            rootElement.querySelector("#mailMessageListCollection")
        );

        // We need this so that the user can execute search from the start screen while the app is running
        Jx.Component.prototype.activateUI.call(this);
       
        this._createCanvasCommandBar();

        // Create the filter
        this._filter = new Mail.MessageListFilter(document.getElementById("mailMessageListFilter"), this._selection, this._settings);
        Mail.Utilities.ComposeHelper.currentSelectedFilter = this._filter;

        _markStart("activateUI_CreateSubComponents");
        this._createListView();

        this._progressRing = new Mail.MessageListProgressRing(document.getElementById("mailMessageListProgress"));

        this._viewIntro.setContainer(document.getElementById("mailMessageListHeaderArea"));

        this._updateView(this._selection.message, this._selection.messageIndex);

        _markStop("activateUI_CreateSubComponents");

        this._disposer.addMany(
            Jx.scheduler.addJob(this._jobSet, Mail.Priority.messageListInitSearch, "CompMessageList._getSearchHandler", function () {
                this._searchHandler = this._getSearchHandler();
            }, this),
            new Mail.EventHook(Mail.guiState, "layoutChanged", this._onLayoutChanged, this),
            new Mail.EventHook(this._selection, "navChanged", this._onNavigation, this),
            this._filter,
            new Mail.EventHook(this._filter, "changed", this._onFilterChanged, this),
            new Mail.EventHook(this._settings, Mail.AppSettings.Events.threadingOptionChanged, this._threadingOptionChanged, this),
            Mail.EventHook.createGlobalHook("composeVisibilityChanged", this._onComposeVisibilityChanged, this),
            this._progressRing
        );

        _markStop("activateUI");
    };

    prototype._onComposeVisibilityChanged = function () {
        if (!Mail.Utilities.ComposeHelper.isComposeShowing) {
            this.focus();
        }
    };

    prototype._createCanvasCommandBar = function () {
        if (!this._canvasCommandBar && Mail.guiState.isOnePane && !Jx.isObject(this._registerCanvasCommandBarJob)) {
            this._registerCanvasCommandBarJob = Jx.scheduler.addJob(this._jobSet,
                Mail.Priority.registerCommandBar,
                "CompMessageList: register command bar",
                function () {
                    Debug.assert(Jx.isObject(this._registerCanvasCommandBarJob));
                    this._registerCanvasCommandBarJob = null;
                    this._canvasCommandBar = new Mail.CompCanvasCommandBar(document.getElementById("messageList"), {
                        respond: ".mailMessageListRespondButton",
                        compose: ".mailMessageListComposeButton",
                        deleteMessage: ".mailMessageListDeleteButton"
                    });

                    Mail.Globals.commandManager.registerCommandHost(this._canvasCommandBar);
                },
                this
            );
        }
    };

    prototype._onLayoutChanged = function () {
        var guiState = Mail.guiState;
        if ((guiState.isThreePane && !Mail.Utilities.ComposeHelper.isComposeShowing) || guiState.isMessageListActive) {
            this.focus();
        }

        this._createCanvasCommandBar();
    };

    prototype._onFilterChanged = function () {
        this._animateRefresh();
    };

    //
    // Search Stubs to avoid loading search just for the sake of checking whether it is enabled
    //
    prototype._isSearching = function () {
        return Jx.isObject(this._searchHandler) && (this._searchHandler.isSearching || this._searchHandler.isSearchHeaderVisible);
    };

    prototype._dismissSearch = function ( /*@optional*/context) {
        if (Jx.isObject(this._searchHandler)) {
            this._searchHandler.dismissSearch(context);
        }
    };

    prototype._getSearchHandler = function () {
        Debug.assert(this._searchHandler === null);
        Debug.assert(this._searchDisposer === null);

        var searchHandler = this._searchHandler = new Mail.SearchHandler(this._selection, this._animator);
        this._searchDisposer = new Mail.Disposer(
            new Mail.EventHook(searchHandler, "executeSearch", this._onExecuteSearch, this),
            new Mail.EventHook(searchHandler, "localSearchComplete", this._onLocalSearchCompleted, this),
            new Mail.EventHook(searchHandler, "searchComplete", this._onSearchCompleted, this),
            new Mail.EventHook(searchHandler, "exitSearch", this._onExitSearch, this)
        );

        // Override itself once it is created
        this._getSearchHandler = function () {
            Debug.assert(Jx.isObject(this._searchHandler));
            return this._searchHandler;
        };
        return this._searchHandler;
    };

    //
    // Search Event Handlers
    //

    prototype._onExecuteSearch = function () {
        ///<summary>Coordinates the behavior of other components when search is executed</summary>
        this._showMessageList(false);
        this._adjustProgressRingVisibility();
        document.getElementById("mailMessageListEmptyMessage").classList.add("hidden");
    };

    prototype._onExitSearch = function (context) {
        /// <param name="context">Extra information regarding why search is dismissed</param>
        Debug.assert(Jx.isObject(context));
        Debug.assert(Jx.isNonEmptyString(context.reason));

        var selectedMessage = this._selection.message,
            isLocalMessage = selectedMessage && selectedMessage.isLocalMessage,
            platform = Mail.Globals.platform;

        // Do not kick off an animated refresh if search is dismissed due to viewChanged,
        // as we are already in the process of showing the folder collection
        if (context.reason === "viewChanged") {
            this._searchHandler.hideSearchHeader();
        } else if (!isLocalMessage || this._selection.view.containsMessage(selectedMessage) || (context.reason === "messageChanged")) {
            // If the message belongs to the current view or the message is a server result, stay in the current view.
            // Resetting the filter to all when exiting search, as the search is not restricted to the filtered message
            var desiredMessage = null,
                keepCurrentFocus = false;
            if (context.reason === "messageChanged") {
                Debug.assert(Jx.isInstanceOf(context.data, Mail.UIDataModel.MailMessage));
                desiredMessage = context.data;

                // If we switched to a draft, let Compose keep its focus
                keepCurrentFocus = desiredMessage.isDraft;
            } else if (isLocalMessage) {
                desiredMessage = selectedMessage;
            }
            this._filter.setToAll();
            this._animateRefresh(true /* includeSearchHeader*/, keepCurrentFocus, desiredMessage);
        } else {
            // the message belongs to a different view, we need to a navigation
            this._searchHandler.hideSearchHeader();
            Debug.assert(Jx.isObject(selectedMessage));
            postSearchNavigation(platform, this._selection, selectedMessage);
        }
    };

    function postSearchNavigation(platform, selection, desiredMessage) {
        Debug.assert(Jx.isObject(platform));
        Debug.assert(Jx.isInstanceOf(selection, Mail.Selection));
        Debug.assert(Jx.isInstanceOf(desiredMessage, Mail.UIDataModel.MailMessage));
        Debug.assert(desiredMessage.isLocalMessage, "Why are we doing navigation for a non local message");

        var account = selection.account,
            newsletterView = account.newsletterView,
            socialView = account.socialView,
            destView = null;
        if (desiredMessage.hasNewsletterCategory && newsletterView) {
            destView = newsletterView;
        } else if (desiredMessage.hasSocialUpdateCategory && socialView) {
            destView = socialView;
        } else {
            destView = desiredMessage.primaryView;
        }
        selection.updateNav(selection.account, destView, desiredMessage);
    }

    prototype._setLocked = function () {
        // We should only unlock the collection when the listView is ready and when sync has succeeded
        var SyncStatus = Mail.ViewSyncMonitor.SyncStatus,
            unlock = this._isViewReady() && this._syncMonitor && (this._syncMonitor.getSyncStatus() === SyncStatus.completed);
        if (this._collection) {
            if (unlock) {
                this._collection.unlock();
            } else {
                this._collection.lock();
            }
        }
    };

    prototype._onLocalSearchCompleted = function (searchResults) {
        /// <param name="searchResults" type="Mail.SearchCollection"></param>
        /// <summary>Callback when the platform has finished the initial query against the indexer and knows the number
        /// of results. The actual items still need to be fetched by the SearchCollection to populate the list.</summary>
        Debug.assert(Jx.isInstanceOf(searchResults, Mail.SearchCollection));
        var scopeSwitcher = this._searchHandler.scopeSwitcher;
        this._updateDataProvider(new Mail.SearchDataProvider(
            searchResults, scopeSwitcher, this._listView,
            document.getElementById("mailMessageListSearchStatus")
        ));
        this._disposeCollection();

        // Update the emptyText Control
        var host = document.getElementById("mailMessageListEmptyMessage");
        this._emptyTextControl = new Mail.SearchEmptyTextControl(host, this._selection, scopeSwitcher);
        this._updateCollection(this._dataProvider.collection);
    };

    prototype._onSearchCompleted = function () {
        // We won't know whether the server search collection is truly empty until the server search is completed
        // We need to update the empty test again
        this._refreshNoMessageState();
    };

    prototype._onNavigation = function (ev) {
        if (ev.accountChanged || ev.viewChanged || this._isSearching()) {
            this._onViewChanged(ev.desiredMessage);
        } else if (ev.desiredMessage) {
            this._onMessageSelected(ev.desiredMessage);
        } else {
            this._onViewReselected();
        }
    };

    prototype._onViewChanged = function (desiredMessage) {
        /// <summary>Resets the message list in response to the selected view changing</summary>
        if (this._isSearching()) {
            this._dismissSearch({ reason: "viewChanged" });
        }

        this._filter.setToAll();
        this._updateView(desiredMessage);
        // Do not set focus on the message list if we are explicitly switching to a draft
        if (!(desiredMessage && desiredMessage.isDraft)) {
            this.focus();
        }
    };

    prototype._onViewReselected = function () {
        /// <summary>
        /// Resets the filter to all (if a non-All filter is applied)
        /// or scrolls the message list to the top and selects the first message in the list
        /// or dismisses a search
        /// </summary>
        _markStart("_viewReselected");
        if (this._filter.currentFilter !== Microsoft.WindowsLive.Platform.FilterCriteria.all) {
            this._filter.setToAll();
            this._animateRefresh();
        } else if (this._selectionHandler.isSelectionMode) {
            this._selectionHandler.exitSelectionMode();
        } else {
            this._resetSelection();
        }
        _markStop("_viewReselected");
    };

    function waitForMessageAdded(collection, message) {
        Debug.assert(Jx.isObject(collection));
        Debug.assert(Jx.isObject(message));

        var messageId = message.objectId;
        if (collection.findIndexByMessageId(messageId) !== -1) {
            // The message is already added to the collection, early return
            return WinJS.Promise.as();
        }

        return Mail.Promises.waitForEvent(collection, "itemAdded", function (evt) {
            var evtObjectId = evt.objectId;
            // A message can either be inserted as itself or as the only child of its parent
            return evtObjectId === messageId || evtObjectId === message.parentConversationId;
        }).then(function () {
            // When a message is inserted to the listView, the DOM is not updated until end changes.
            // This extra wait for endchanges ensures the new message is added to the DOM
            return Mail.Promises.waitForEvent(collection, "endChanges");
        });
    }

    function waitForMessage(collection, message, supportsThreading) {
        Debug.assert(Jx.isObject(collection));
        Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
        Debug.assert(Jx.isBoolean(supportsThreading));
        
        if (!supportsThreading) {
            return waitForMessageAdded(collection, message);
        } else {
            // Conversation threading aggregation notifications are fired asynchronously.
            // The promises below wait for the following platform data structures to be up-to-date:
            // 1. The message.parentCovnersationId is valid
            // 2. parentConversation.getMessages contains the child.
            // 3. view.getConversation contains the parentConversation
            var waitForConvAggregation = null;
            if (!message.parentConversationId) {
                waitForConvAggregation = Mail.Promises.waitForEvent(message, "changed", function () {
                    return Jx.isNonEmptyString(message.parentConversationId);
                });
            }
            return WinJS.Promise.as(waitForConvAggregation).then(function () {
                return waitForMessageAdded(collection, message);
            });
        }
    }

    prototype._onMessageSelected = function (message) {
        Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
        _markStart("_messageChanged");

        if (this._isSearching()) {
            this._dismissSearch({
                reason: "messageChanged",
                data: message
            });
            return;
        }

        if (message.isDraft) {
            this._selectionHandler.exitSelectionMode();
        }

        if (this._messageChangedPromise) {
            this._messageChangedPromise.cancel();
        }

        this._messageChangedPromise = waitForMessage(this._collection, message, this._supportsThreading());
        this._messageChangedPromise.then(function (messageToSelect) {
            this._messageChangedPromise = null;
            this._resetSelection(messageToSelect);
        }.bind(this, message));

        _markStop("_messageChanged");
    };

    prototype._updateView = function (/*@optional*/ desiredMessage, /*@optional*/ desiredMessageIndex) {
        Debug.assert(Jx.isNullOrUndefined(desiredMessage) || Jx.isInstanceOf(desiredMessage, Mail.UIDataModel.MailMessage));
        Debug.assert(Jx.isNullOrUndefined(desiredMessageIndex) || Jx.isNumber(desiredMessageIndex));

        _markStart("_updateView");
        var selection = this._selection;
        var view = selection.view;
        this._disposeView();

        this._syncMonitor = Mail.ViewSyncMonitor.create(view);
        this._syncMonitor.addListener("syncStatusChanged", this._onFolderSyncStatusChange, this);
        this._nameHeader = new Mail.FolderNameHeader(this._selection);
        this._viewIntro.setView(view);
        this._showViewCollection(desiredMessage, desiredMessageIndex);
        _markStop("_updateView");
    };

    prototype._animateRefresh = function (/*optional*/ includeSearchHeader, /*optional*/ keepCurrentFocus,
        /*optional*/ desiredMessage) {
        Debug.assert(includeSearchHeader === undefined || Jx.isBoolean(includeSearchHeader));
        Debug.assert((keepCurrentFocus === undefined) || Jx.isBoolean(keepCurrentFocus));

        var contents = document.getElementById("messageListContents"),
            elements = [contents];

        if (includeSearchHeader) {
            elements.push(document.getElementById("mailMessageListSearchHeader"));
        }

        this._animator.shortFadeOut(elements).then(function (messageToSelect) {
            var promise = Mail.ListViewHelper.waitForListView(this._listView);
            this._showViewCollection(messageToSelect);
            return promise;
        }.bind(this, desiredMessage)).then(function () {
            if (includeSearchHeader) {
                this._getSearchHandler().hideSearchHeader();
            }
            return this._animator.shortFadeIn([contents]);
        }.bind(this)).done(function () { // Finish
            if (!keepCurrentFocus) {
                this.focus();
            }
            this._adjustProgressRingVisibility();
        }.bind(this));
    };

    prototype._threadingOptionChanged = function () {
        // Ignore global settings change if threading isn't supported or sync isn't complete
        if (!this._isSearching() && this._isSyncComplete()) {
            // We shouldn't set focus on the MessageList afterwards because it will dismiss the Settings Pane
            this._animateRefresh(false /* includeSearchHeader */, true /* keepCurrentFocus */);
        }
    };

    prototype._supportsThreading = function () {
        return !this._isSearching() && Mail.ViewCapabilities.supportsThreading(this._selection.view, this._settings);
    };

    prototype._adjustProgressRingVisibility = function () {
        Debug.assert(Jx.isObject(this._progressRing));
        this._progressRing.adjustVisibilityForSyncStatus(!this._isSearching() && !this._isSyncComplete());
    };

    prototype._showViewCollection = function (/*@optional*/ desiredMessage, /*@optional*/ desiredMessageIndex) {
        /// <summary>Switch to the normal view, ensuring any search UI is hidden</summary>
        _markStart("_showViewCollection");
        Debug.assert(Jx.isNullOrUndefined(desiredMessage) || Jx.isInstanceOf(desiredMessage, Mail.UIDataModel.MailMessage));
        Debug.assert(Jx.isNullOrUndefined(desiredMessageIndex) || Jx.isNumber(desiredMessageIndex));
        this._disposeCollection();

        var threaded = this._supportsThreading(),
            view = this._selection.view,
            filter = this._filter,
            syncMonitor = this._syncMonitor,
            listView = this._listView,
            accessibilityHelper = null,
            options = {
                threaded: threaded,
                syncMonitor: syncMonitor,
                isViewReady: this._isViewReady()
            };

        if (threaded) {
            options.initialExpansion = 0;
            if (desiredMessage) {
                options.initialExpansionId = desiredMessage.objectId;
                options.initialExpansion = desiredMessageIndex;
            }
        }

        var dataProvider = new Mail.ViewDataProvider(view, options, filter);
        this._updateDataProvider(dataProvider);
        this._selection.registerQuery(dataProvider.query, filter.currentFilter);

        if (threaded) {
            accessibilityHelper = new Mail.AccessibilityHelper(listView, dataProvider.collection);
        }

        // Update the emptyText Control
        var host = document.getElementById("mailMessageListEmptyMessage");
        this._emptyTextControl = Mail.EmptyTextControl.create(host, syncMonitor, view);

        this._updateCollection(dataProvider.collection, desiredMessage);

        this._collectionDisposer.add(new Mail.UnseenMonitor(view, listView, document));
        if (accessibilityHelper) {
            this._collectionDisposer.add(accessibilityHelper);
        }

        _markStop("_showViewCollection");
    };

    prototype._updateListViewResources = function (collection, /*@optional*/ desiredMessage) {
        /// <summary>Replaces the datasource, renderer, selection handler that corresponds to the new collection</summary>
        Debug.assert(Jx.isInstanceOf(collection, Mail.TrailingItemCollection));
        Debug.assert(Jx.isNullOrUndefined(desiredMessage) || Jx.isInstanceOf(desiredMessage, Mail.UIDataModel.MailMessage));
        this._dataAdaptor = new Mail.MessageListDataSource(collection);

        Debug.assert(Jx.isObject(this._syncMonitor));
        this._adjustProgressRingVisibility();

        Debug.assert(Jx.isNullOrUndefined(this._updateDatasourcePromise));
        this._updateDatasourcePromise = this._updateDatasource();

        this._updateSelectionHandler(collection);

        if (desiredMessage) {
            this._updateScrollPosition(desiredMessage);
        }

        this._refreshNoMessageState();
        return this._updateDatasourcePromise;
    };

    prototype._updateScrollPosition = function (message) {
        /// <summary>
        /// if we have a desired message, tell the listView to start realizing items at the preferred index.
        /// See scenario at WindowsBlueBug:68443
        /// </summary>
        Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
        var scrollToIndex = this._collection.findIndexByMessageId(message.objectId);
        if (scrollToIndex >= 0) {
            this._listView.indexOfFirstVisible = scrollToIndex;
            this._listView.currentItem = { index: scrollToIndex };
        }
    };

    prototype._isListViewVisible = function () {
        var defaultElement = document.getElementById(Mail.CompMessageList.defaultElementId),
            isVisible = Mail.guiState.isMessageListVisible && !defaultElement.classList.contains("invisible") && !this._rootElement.classList.contains("invisible");
        _mark("_isListViewVisible:= " + isVisible);
        return isVisible;
    };

    prototype._refreshListView = function () {
        // If we switch datasource while the ListView is not visible, we need to call recalculateItemPosition when showing it.
        // Two example scenarios are BLUE:344828 and BLUE:394807
        _mark("_refreshListView recalculateRequired:= " + this._recalculateRequired);
        if (this._recalculateRequired && this._isListViewVisible()) {
            _markStart("_refreshListView");
            this._listView.recalculateItemPosition();
            this._recalculateRequired = false;
            _markStop("_refreshListView");
        }
    };

    prototype._updateCollection = function (collection, /*@optional*/ desiredMessage) {
        /// <summary>Replaces the current collection with a new one either from a view switch or search query</summary>
        _markStart("_updateCollection");
        Debug.assert(Jx.isInstanceOf(collection, Mail.TrailingItemCollection));
        Debug.assert(Jx.isNullOrUndefined(desiredMessage) || Jx.isInstanceOf(desiredMessage, Mail.UIDataModel.MailMessage));

        Debug.assert(this._collection === null);
        this._collection = collection;
        this._collectionDisposer = new Mail.Disposer(collection,
            new Mail.EventHook(collection, "endChanges", this._refreshNoMessageState, this),
            new Mail.EventHook(collection, "reset", this._onCollectionReset, this));

        this._updateListViewResources(collection, desiredMessage).then(function (messageToSelect) {
            this._resetSelection(messageToSelect);
        }.bind(this, desiredMessage));

        if ((collection.count === 0) || (!this._isSyncComplete())) {
            Jx.EventManager.fireDirect(null, "mail-messageList-loadedEmptyFolder");
        }
        _markStop("_updateCollection");
    };

    prototype._updateDataProvider = function (dataProvider) {
        /// <param name="dataProvider" type="Mail.MessageListDataProvider"></param>
        Debug.assert(Jx.isInstanceOf(dataProvider, Mail.MessageListDataProvider));
        Jx.dispose(this._dataProvider);
        this._dataProvider = dataProvider;
    };

    prototype._updateSelectionHandler = function (collection) {
        Debug.assert(Jx.isObject(collection));
        // We should create the selection manager after the notification handler, which is created in the function - this._updatedatasource.
        // This ensures the collection event callbacks on the selection manager will fire after those of the notification handler
        Debug.assert(Jx.isObject(this._notificationHandler));
        Debug.assert(this._selectionHandler === null);
        this._selectionHandler = new Mail.SelectionHandler(collection, this._listView, this._selection, this._commandBar);
        this._itemRenderer = new Mail.MailHeaderRenderer(this._notificationHandler, this._selectionHandler, this._supportsThreading(), this._selection);
    };


    prototype._resetSelection = function (/*optional*/desiredMessage, /*optional*/desiredMessageIndex, /*optional*/scrollOption) {
        Debug.assert(Jx.isNullOrUndefined(desiredMessage) || Jx.isInstanceOf(desiredMessage, Mail.UIDataModel.MailMessage));
        Debug.assert(Jx.isNullOrUndefined(desiredMessageIndex) || Jx.isValidNumber(desiredMessageIndex));
        Debug.assert(Jx.isNullOrUndefined(scrollOption) || Jx.isNonEmptyString(scrollOption));
        var idToSelect = desiredMessage ? desiredMessage.objectId : null;
        this._selectionHandler.controller.setInitialSelection(idToSelect, desiredMessageIndex, scrollOption);
    };

    prototype._updateDatasource = function () {
        _markStart("_updateDatasource");
        this._listView.itemDataSource = new Mail.CompMessageListVirtualizedDataSource(this, { cacheSize: 200 });
        this._recalculateRequired = true;

        Mail.ListViewHelper.setSelectionMode(this._listView, this._dataProvider.selectionMode);
        // We will get called back from the constructor CompMessageListVirtualizedDataSource to initialize the notificationHandler, let's make sure it is true
        Debug.assert(Jx.isObject(this._notificationHandler));
        _markStop("_updateDatasource");
        return Mail.ListViewHelper.waitForListView(this._listView, "viewPortLoaded");
    };

    prototype._disposeView = function () {
        /// <summary>Cleanup all the view related members</summary>
        _markStart("_disposeView");
        Jx.dispose(this._nameHeader);
        this._nameHeader = null;

        if (this._syncMonitor) {
            this._syncMonitor.removeListener("syncStatusChanged", this._onFolderSyncStatusChange, this);
            Jx.dispose(this._syncMonitor);
            this._syncMonitor = null;
        }

        _markStop("_disposeView");
    };

    prototype._disposeListViewResources = function () {
        if (this._messageChangedPromise) {
            // The messageChangedPromise calls into selectionManager, it needs to be cancelled before
            // the selectionManager is disposed
            this._messageChangedPromise.cancel();
            this._messageChangedPromise = null;
        }

        if (this._updateDatasourcePromise) {
            this._updateDatasourcePromise.cancel();
            this._updateDatasourcePromise = null;
        }

        Jx.dispose(this._selectionHandler);
        this._selectionHandler = null;
        Jx.dispose(this._itemRenderer);
        this._itemRenderer = null;
        Jx.dispose(this._dataAdaptor);
        this._dataAdaptor = null;
        Jx.dispose(this._notificationHandler);
        this._notificationHandler = null;
    };

    prototype._disposeCollection = function () {
        /// <summary>Cleanup all the collection-related objects</summary>
        _markStart("_disposeCollection");
        this._selection.clearQuery();
        this._disposeListViewResources();

        Jx.dispose(this._emptyTextControl);
        this._emptyTextControl = null;

        Jx.dispose(this._collectionDisposer);
        this._collectionDisposer = null;
        this._collection = null;
        _markStop("_disposeCollection");
    };

    prototype._onClick = function (/*@type(Event)*/e) {
        Jx.EventManager.fireDirect(null, "mail-messageList-clicked", e);
    };

    prototype._onKeyDown = function (/*@type(Event)*/e) {
        Jx.EventManager.fireDirect(null, "mail-messageList-keydown", e);
    };

    prototype._onCollectionReset = function () {
        /// <summary>
        /// Today, if the collection changes while the mail app is suspended, the collection will fire a reset event upon resume.
        /// We will rebuild the current collection instead of calling invalidateAll since invalidateAll does not maintain the
        /// selection correctly.
        /// We should maintain the selection (so that the new message won't be marked as read) but scroll to the top of the message list
        ///  after a reset so that the user will be aware if any new messages are received while the mail app is suspending.
        /// </summary>
        _markStart("_onCollectionReset");
        // Dispose on listView related resources
        this._disposeListViewResources();
        this._updateListViewResources(this._collection).then(function () {
            var selection = this._selection;
            this._resetSelection(selection.message, selection.messageIndex, Mail.SelectionModel.ScrollOptions.scrollToTop);
            _markStop("_onCollectionReset");
        }.bind(this));
    };

    prototype._refreshNoMessageState = function () {
        _markStart("_refreshNoMessageState");
        var isCollectionNonEmpty = (Jx.isObject(this._collection)) && !this._collection.mailItems.isEmpty,
            syncComplete = this._isSyncComplete(),
            isSearching =  this._isSearching(),
            showMessageList = isCollectionNonEmpty && (syncComplete || isSearching),
            showEmptyText = !showMessageList && (syncComplete || isSearching);

        _mark("_refreshNoMessageState - isCollectionNonEmpty: " +
            isCollectionNonEmpty +
             " showMessageList: " + showMessageList +
             " showEmptyText: " + showEmptyText);

        this._showMessageList(showMessageList);
        this._emptyTextControl.setVisibility(showEmptyText, !syncComplete);
        _markStop("_refreshNoMessageState");
    };

    prototype._onFolderSyncStatusChange = function () {
        this._setLocked();
        this._adjustProgressRingVisibility();
        this._refreshNoMessageState();
    };

    prototype.appReset = function () {
        _markStart("appReset");
        this._dismissSearch();
        this._resetSelection();
        _markStop("appReset");
    };

    Object.defineProperty(prototype, "collection", { get: function () { return this._collection; } });

    // The compareByIdentity flag tells the listView not to serialize our objects for comparison.
    // Since WinRT objects are not serializable, without this flag, we can only pass the serializable object id to the listView.
    // This is bad because it results in unnecessary object lookups in the platform
    Object.defineProperty(prototype, "compareByIdentity", { get: function () { return true; } });

    // Callback from the listview that gives us the notification handler.  This is called in the base constructor of the VirtualizedDatasource,
    // when is called during startup and collection switching
    prototype.setNotificationHandler = function (notificationHandler) {
        /// <param name="notificationHandler" type="WinJS.UI.ListDataNotificationHandler"/>
        if (Jx.isNullOrUndefined(this._collection)) {
            // If this._collection is null, we are in startup, return early
            return;
        }
        Debug.assert(Jx.isNullOrUndefined(this._itemRenderer));         // Make sure the renderer is disposed before we overwrite it
        Debug.assert(Jx.isNullOrUndefined(this._notificationHandler));  // Make sure the notificationHandler is disposed before we overwrite it
        this._notificationHandler = new Mail.MessageListNotificationHandler(this._collection, this._listView, notificationHandler);
    };

    // Forward methods to the actual data adapter
    prototype.getCount = function () {
        return this._dataAdaptor ? this._dataAdaptor.getCount() : WinJS.Promise.wrap(0);
    };

    prototype.itemsFromIndex = function (index, countBefore, countAfter) {
        Debug.assert(Jx.isObject(this._dataAdaptor));
        return this._dataAdaptor.itemsFromIndex(index, countBefore, countAfter);
    };

    // Forward methods to the actual item renderer
    prototype._renderItem = function (/*@dynamic*/item) {
        Debug.assert(Jx.isObject(this._itemRenderer));
        return this._itemRenderer.renderItem(item);
    };

    prototype._isSyncComplete = function () {
        return this._syncMonitor && this._syncMonitor.isSyncCompleted;
    };

    prototype._isViewReady = function () {
        /// <returns type="Boolean">returns true if the loading state of the listView is complete</returns>
        return Mail.ListViewHelper.isListViewReady(this._listView);
    };

    prototype._showMessageList = function (visible) {
        Debug.assert(Jx.isBoolean(visible));
        var listViewElement = document.getElementById(Mail.CompMessageList.defaultElementId),
            isVisible = !listViewElement.classList.contains("invisible");
        if (isVisible !== visible) {
            Mail.writeProfilerMark("Mail.CompMessageList._showMessageList - isVisible: " + visible);
            var activeElement = document.activeElement;
            if (!visible && activeElement && Mail.isElementOrDescendant(activeElement, listViewElement)) {
                // The ListView has an internal flag _hasKeyboardFocus, when set to true,
                // will restore focus to itself after any list edits.
                // To avoid stealing focus from the other components, take focus away from the listView before hiding it
                Mail.setActiveElement(Mail.CompApp.rootElementId);
            }

            // We hide the listView by setting visibility:hidden instead of display:none
            // This is because when the listView is hidden via display:none, we need to call listView.recalcuateItemPosition before showing it again.
            // RecalcuateItemPosition will remeasure the items, which takes around 300ms on a surface.
            // Using visibility:hidden will avoid us paying this cost every time when the listView is shown (e.g. one-pane navigation)
            Jx.setClass(listViewElement, "invisible", !visible);

            if (!visible) {
                this._selectionHandler.controller.clearDisplayedItem();
            } else {
                this._refreshListView();
                // if we are showing the message list, need to set a selection
                this._selectionHandler.controller.setInitialSelection();
            }
        }
    };

    prototype.setEnabled = function (enabled) {
        Jx.setClass(this._rootElement, "invisible", !enabled);
    };

    prototype.resolveDrag = function (dragInfo) {
        // Resolve the UIMailItems from the message list selection
        Debug.assert(Jx.isObject(dragInfo));
        var collection = this._collection,
            selection = this._selectionHandler.getModel().selection(),
            indices = dragInfo.getIndices(),
            selectedNodes = null;

        Debug.assert(Jx.isArray(indices));
        if (indices.length === 1 && !selection.isIndexSelected(indices[0])) {
            // If the item dragged is not part of the the current selection, resolve the drag as the item dragged
            // Since the user can only drag one non-selected item at a time, we use the length check as an optimization
            selectedNodes = [collection.item(indices[0])];
        } else {
            // In selection mode, what is logically selected is different from what is visually selected in the listView.
            // We need to retrieve the selected items from the selection model
            selectedNodes = selection.logicalItems;
        }

        return selectedNodes.reduce(function (messages, node) {
            // Ignore non message items (placeholder text)
            var data = node.data;
            if (Jx.isInstanceOf(data, Mail.UIDataModel.MailItem)) {
                messages.push(data);
            }
            return messages;
        }, []);
    };

    function _mark(s) { Jx.mark("CompMessageList." + s); }
    function _markStart(s) { Jx.mark("CompMessageList." + s + ",StartTA,CompMessageList"); }
    function _markStop(s) { Jx.mark("CompMessageList." + s + ",StopTA,CompMessageList"); }
});
