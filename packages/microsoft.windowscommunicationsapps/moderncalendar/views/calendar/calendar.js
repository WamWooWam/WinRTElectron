
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Windows,Microsoft,WinJS,Debug,Jx,SasManager,Chat,Calendar,People,Calendar*/

// TODO: move this code to frame.js
Jx.delayDefine(Calendar.Views, "Frame", function () {

    function _info(evt) { Jx.mark("Calendar.Frame." + evt + ",Info,Calendar"); }
    function _start(evt) { Jx.mark("Calendar.Frame." + evt + ",StartTA,Calendar"); }
    function _stop(evt) { Jx.mark("Calendar.Frame." + evt + ",StopTA,Calendar"); }

    var _idle = People.Priority.launch;

    var FlyoutAction = {
        unknown: 0,
        chooseNothing: 1,
        chooseCustom: 2,
        chooseDefault: 3
    };

    var Frame = Calendar.Views.Frame = function () {
        _start("ctor");

        // jx initialization
        this.initComponent();
        this._id = "calFrame";

        this._firstRun = true;
        this._jobset = null;

        this._commandState = {
            companion: false,
            editing: false
        };

        // bind event listeners
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onBeforeShowAppbar = this._onBeforeShowAppbar.bind(this);
        this._onKeyboardShow = this._onKeyboardShow.bind(this);
        this._onKeyboardHide = this._onKeyboardHide.bind(this);

        this._appBar = null;
        this._appBarElt = null;

        this._navBar = null;
        this._peekBar = null;
        this._initializedSas = false;

        //Debug.only(Object.seal(this)); // TODO: currently not working for Jx components

        _stop("ctor");
    };

    Jx.augment(Frame, Jx.Component);

    // Static
    Frame.REHYDRATION_TIMEOUT = 60 * 60 * 1000; // one hour

    // Enum for the calendar views in BICI
    Frame.BiciViews = {
        month: 0,
        week: 1,
        workweek: 2,
        day: 3,
        snap: 4,
        agenda: 5,
    };

    // Instance

    var proto = Frame.prototype;

    proto.dispose = function () {
        // TODO: dispose all members
    };

    Frame.prototype.isEditing = function () {
        return this._views.isEditing();
    };

    Frame.prototype.getShareData = function (request) {
        // call into view manager to populate the share content
        this._views.getShareData(request);
    };

    // Component

    Frame.prototype.initUI = function (host, jobset) {
        _start("initUI");

        // cache params
        this._jobset = jobset;

        // create children components
        this._views = new Calendar.Views.Manager();
        this.append(this._views);

        Debug.assert(this._navBar === null);
        this._navBar = new Calendar.NavBar();
        this.append(this._navBar);

        Debug.assert(this._peekBar === null);
        this._peekBar = new Jx.PeekBar("bottom");
        this.append(this._peekBar);
        document.body.insertAdjacentHTML("beforeend", '<div id="peekBar"></div>');
        this._peekBar.initUI(document.getElementById("peekBar"));

        this._initState();
        this._initEvents();

        // continue the init call through to the default jx implementation
        Jx.Component.prototype.initUI.call(this, host);

        _stop("initUI");
    };

    Frame.prototype.getUI = function (ui) {
        _start("getUI");

        // Navbar sets up its own html
        ui.html = Jx.getUI(this._views).html;

        _stop("getUI");
    };

    Frame.prototype.activateUI = function () {
        _start("activateUI");

        // If a click event gets to the window then treat it as a light dismiss.
        window.addEventListener("click", this._lightDismiss, false);
        // Opening the charms bar causes a blur event on the window.  Treat it as a light dismiss.
        window.addEventListener("blur", this._forceDismiss, false);
        window.addEventListener("keydown", this._onKeyDown, false);
        window.addEventListener("MSHoldVisual", this._preventDefault, false);

        this._inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView(); 
        this._inputPane.addEventListener("showing", this._onKeyboardShow); 
        this._inputPane.addEventListener("hiding", this._onKeyboardHide);

        this._views.activateUI(this._jobset);

        _stop("activateUI");
    };

    Frame.prototype.shutdownUI = function () {
        // remove activation events
        Jx.activation.removeListener("suspending", this._onSuspending, this);

        if (this._messageBar) {
            this._authMessageBarPresenter.shutdown();
            this._syncMessageBarPresenter.shutdown();
            this._errorMessageBarPresenter.shutdown();
            this._proxyAuthenticator.shutdown();
        }

        // save our state out
        this._onSuspending();

        window.removeEventListener("click", this._lightDismiss, false);
        window.removeEventListener("blur", this._forceDismiss, false);
        window.removeEventListener("keydown", this._onKeyDown, false);
        window.removeEventListener("MSHoldVisual", this._preventDefault, false);

        if (this._peekBar) {
            Jx.dispose(this._peekBar);
            this._peekBar = null;
        }

        if (this._appBarElt) {
            this._appBar.removeEventListener("beforeshow", this._onBeforeShowAppbar, false);
            this._appBar = null;

            this._appBarElt.removeEventListener("keydown", this._onAppBarKeyDown, false);
            this._appBarElt.outerHTML = "";
            this._appBarElt = null;
        }

        if (this._navBar) {
            this._navBar.destroyUI();
        }

        Jx.Component.prototype.shutdownUI.call(this);
    };

    Frame.prototype._ensureAppBar = function () {
        // We need to check for null to avoid a race condition where _onGetAppBar gets here first,
        // then the scheduler (which already has a reference to this function) gets here and inits again.
        if (this._appBar === null) {
            this._initAppBar();
            this._ensureAppBar = Jx.fnEmpty;
        }
    };

    Frame.prototype._ensureSasButton = function () {
        if (!this._initializedSas) {
            _start("SaSInit");
            SasManager.init(document.title, "sasCommand");
            _stop("SaSInit");
            this._initializedSas = true;
        }
    };

    Frame.prototype._initAppBar = function () {
        _start("_initAppBar");

        this._appBarElt = document.getElementById("appBar");

        if (this._appBarElt) {
            this._appBarElt.removeEventListener("keydown", this._onAppBarKeyDown, false);
            document.body.removeChild(this._appBarElt);
            this._appBarElt = null;
        }

        document.body.insertAdjacentHTML("beforeend", '<div id="appBar" class="win-ui-dark"></div>');

        this._appBarElt = document.getElementById("appBar");
        Debug.assert(Jx.isHTMLElement(this._appBarElt));

        var options = { commands: this._createViewCommands() };

        _start("_initAppBar:WinJS");
        this._appBar = new WinJS.UI.AppBar(this._appBarElt, options);
        _stop("_initAppBar:WinJS");

        // schedule sas initialization
        this._initializedSas = false;
        var deferredWork = this.queryService("deferredWork");
        deferredWork.queue("SaSButton", 50, _idle, this._ensureSasButton, this);

        this._appBar.addEventListener("beforeshow", this._onBeforeShowAppbar, false);

        // eat arrow keys to prevent navigation on app bar
        // from affecting rest of application
        this._appBarElt.addEventListener("keydown", this._onAppBarKeyDown, false);

        _stop("_initAppBar");
    };

    Frame.prototype._initState = function () {
        _start("_initState");

        // load storage data
        var data = {};
        this.fire("getSettings", data);
        this._settings = data.settings;

        // load our last used view
        var view = this._settings.get("view");

        if (typeof view === "number") {
            this._views.setCurrentView(view);
        }

        // load the same data we'd load when resuming
        this._onResuming();

        _stop("_initState");
    };

    Frame.prototype._initEvents = function () {
        _start("_initEvents");

        // set up activation events
        Jx.activation.addListener("suspending", this._onSuspending, this);

        // hook jx events
        if (Jx.root) {
            Jx.root.on("resuming", this._onResuming, this);
        }
        this.on("goToView", this._onGoToView);
        this.on("viewUpdated", this._onViewUpdated);
        this.on("viewReady", this._onViewReady);
        this.on("createEvent", this._views._onCreateEvent.bind(this._views));
        this.on("editEvent", this._views._onEditEvent.bind(this._views));
        this.on("getAppBar", this._onGetAppBar);
        this.on("getPeekBar", this._onGetPeekBar);
        this.on("today", this._onToday);
        this.on("reload", this._onSuspending);
        this.on("peekBarShow", this._onPeekBarShow);

        _stop("_initEvents");
    };

    Frame.prototype._initMessageBar = function () {
        _start("_initMessageBar");

        var isLiveDemo = Jx.appData.localSettings().get("LiveDemoMode") || false;
        if (!isLiveDemo) {
            this._messageBar = new Chat.MessageBar(1001); // z-index below appbar/navbar same as peek bar
            this._authMessageBarPresenter = new Chat.AuthMessageBarPresenter();
            this._syncMessageBarPresenter = new Chat.SyncMessageBarPresenter();
            this._errorMessageBarPresenter = new Calendar.Controls.ErrorMessageMessageBarPresenter();
            this._proxyAuthenticator = new Chat.ProxyAuthenticator();

            _start("_initMessageBar:getPlatform");
            var data = {};
            this.fire("getPlatform", data);
            _stop("_initMessageBar:getPlatform");

            _start("_initMessageBar:initAuthBar");
            this._authMessageBarPresenter.init(this._messageBar, data.platform, "messageBar");
            _stop("_initMessageBar:initAuthBar");

            _start("_initMessageBar:initSyncBar");
            this._syncMessageBarPresenter.init(this._messageBar, data.platform, Calendar.scenario, "messageBar");
            _stop("_initMessageBar:initSyncBar");

            _start("_initMessageBar::initErrorMessageBar");
            this._errorMessageBarPresenter.init(this._messageBar, data.platform, this, "messageBar");
            _stop("_initMessageBar::initErrorMessageBar");

            _start("_initMessageBar:initProxyAuthenticator");
            this._proxyAuthenticator.init(data.platform, Calendar.scenario);
            _stop("_initMessageBar:initProxyAuthenticator");
        }

        _stop("_initMessageBar");
    };

    // AppBar

    Frame.prototype._sync = function () {
        var data = {};
        this.fire("getPlatform", data);
        Jx.forceSync(data.platform, Calendar.scenario);
    };

    Frame.prototype._setView = function (view) {
        _start("_setView");

        if (this._views.getCurrentView() !== view) {
            this._bici(view, false);
        }

        this._views.setCurrentView(view);

        _stop("_setView");
    };

    Frame.prototype._setToday = function () {
        this._views.setFocusedDay(Calendar.getToday());
    };

    Frame.prototype._showDatePicker = function () {
        this._views.showDatePicker();
    };

    Frame.prototype._changeBackground = function (useDefault) {
        this._views.changeBackground(useDefault);
    };

    Frame.prototype._purgeCalendars = function () {
        var data = {};
        this.fire("getPlatform", data);
        data.platform.calendarManager.purgeAllCalendars();
    };

    Frame.prototype._onAppBarKeyDown = function (ev) {
        if (ev.keyCode === Jx.KeyCode.rightarrow ||
            ev.keyCode === Jx.KeyCode.leftarrow) {
            ev.stopPropagation();
            ev.preventDefault();
        }
    };

    // State-Related Events

    Frame.prototype._onSuspending = function () {
        _start("_onSuspending");

        // save our focused day
        var focused = this._views.getFocusedDay();
        this._settings.set("day", focused.getTime());

        // we also store the current time, because we only want to rehydrate the
        // focused day if we viewed it less than an hour ago.
        var now = Date.now();
        this._settings.set("time", now);

        _stop("_onSuspending");
    };

    Frame.prototype._onResuming = function () {
        _start("_onResuming");

        var focused = Date.now(),
            lastRun = this._settings.get("time") || 0,
            diff = focused - lastRun;

        // only rehydrate the focused day if we viewed it less than an hour ago
        if (diff <= Frame.REHYDRATION_TIMEOUT) {
            focused = this._settings.get("day") || focused;
        }

        // clear our out saved focused date.  if the app is killed, we should
        // default to showing today.
        this._settings.remove("day");
        this._settings.remove("time");

        // set our view to the right day
        var date = new Date(focused);
        this._views.setFocusedDay(date);

        this._bici(this._views.getCurrentView(), true);

        _stop("_onResuming");
    };

    Frame.prototype._ensureIdsCalendar = function () {
        if (!this._idsCalendar) {
            this._idsCalendar = Microsoft.WindowsLive.Instrumentation.Ids.Calendar;
        }

        this._ensureIdsCalendar = Jx.fnEmpty;
    };

    Frame.prototype._bici = function (view, launch) {
        Debug.assert(Jx.isValidNumber(view), 'Jx.isValidNumber(view)');
        Debug.assert(Jx.isBoolean(launch), 'Jx.isBoolean(launch)');

        // Delay load IDS for faster start time.
        setTimeout(function () {
            // save  WLI data point for which view calendar launched in
            this._ensureIdsCalendar();

            // Capture local references to each enum
            var managerViews = Calendar.Views.Manager.Views;
            var biciViews = Frame.BiciViews;

            // There is no "Unknown" value for the datapoint, so we'll default to month
            var biciView = biciViews.month;
            var biciId = launch ? this._idsCalendar.calendarViewLaunch : this._idsCalendar.calendarViewClick;

            // We need to map the view manager views to the bici views
            switch (view) {
                case managerViews.month:
                    biciView = biciViews.month;
                    break;

                case managerViews.week:
                    biciView = biciViews.week;
                    break;

                case managerViews.workweek:
                    biciView = biciViews.workweek;
                    break;

                case managerViews.day:
                    biciView = biciViews.day;
                    break;

                case managerViews.agenda:
                    biciView = biciViews.agenda;
                    break;

                default:
                    Debug.assert(false, 'Invalid view value: ' + view);
                    break;
            }

            Jx.bici.addToStream(biciId, biciView);

            Debug.only(_info("_bici:calendarView=" + view + ",launch=" + launch));

        }.bind(this), 3000);
    };

    Frame.prototype._recordBackgroundAction = function (action) {
        Debug.assert(Jx.isValidNumber(action) && action >= 0 && action <= 3, 'Jx.isValidNumber(action) && action >= 0 && action <= 3');

        this._ensureIdsCalendar();
        Jx.bici.addToStream(this._idsCalendar.calendarBackgroundFlyout, action);
    };

    // Jx Events

    Frame.prototype._onGoToView = function (ev) {
        if (!ev.handled) {
            // Force close any on screen controls before we switch views.  If we let the deactivate methods handling closing for us, they may not save current user input. e.g. Quick Event Creation
            this._forceDismiss(ev);

            ev.handled = true;

            if (this._appbar) {
                this._appBar.hide();
            }

            Debug.assert(ev.data.view in Calendar.Views.Manager.Views);
            var view = Calendar.Views.Manager.Views[ev.data.view];

            if (this._views.getCurrentView() === view) {
                // go to today if the same view is selected
                this._onTodayClicked();
            } else {
                this._views.setCurrentView(view);
                this._bici(view, false);
            }
        }
    };

    Frame.prototype._onViewUpdated = function (ev) {
        if (!ev.handled) {
            _start("_onViewUpdated");

            var data = ev.data;

            if (this._navBar) {
                if (data.editing) {
                    this._navBar.destroyUI();
                    this._peekBar.hide();
                } else {
                    var deferredWork = this.queryService("deferredWork");
                    deferredWork.queue("NavBar", 50, _idle, function () {
                        // editing and companion may have changed between now and when this was scheduled,
                        // so check the current values in the command state
                        if (!this._commandState.editing) {
                            this._navBar.buildUI(this._commandState.companion);
                        }
                    }, this);

                    if (this._appBar) {
                        this._appBar.hide();
                        this._appBar.commands = this._createViewCommands();

                        // reinitalize the SaS Button
                        this._initializedSas = false;
                        deferredWork.queue("SaSButton", 50, _idle, this._ensureSasButton, this);
                    }
                    
                    // Only enable the tab version of peekbar for agenda view.
                    this._peekBar.allowTabVersion(this._views.allowPeekBarTabVersion());

                    this._peekBar.show();
                }
            }

            // save the user's current view
            this._settings.set("view", this._views.getCurrentView());
            this._commandState = data;

            ev.handled = true;
            _stop("_onViewUpdated");
        }
    };

    proto._onViewReady = function (ev) {
        if (this._firstRun && ev.stage === Jx.EventManager.Stages.bubbling) {
            this._firstRun = false;
            var deferredWork = this.queryService("deferredWork");
            deferredWork.queue("AppBar", 50, _idle, this._ensureAppBar, this);
            deferredWork.queue("MsgBar", 50, _idle, this._initMessageBar, this);
        }
    };

    Frame.prototype._onPeekBarShow = function (ev) {
        Debug.assert(ev && ev.data, "Invalid peekBar event data");

        // the bars are deferred at startup
        if (this._navBar && this._appBar) {
            this._navBar.show();
            this._appBar.show();
            ev.cancel = true;
            this._ensureIdsCalendar();
            var touch = new Windows.Devices.Input.TouchCapabilities().touchPresent ? 1 : 0;
            var type = ev.data.pointerType === "touch" ? 1 : 2; // peekBarTouch = 1, peekBarMouse = 2
            Jx.bici.addToStream(this._idsCalendar.calendarNavAndAppBarInvoke, touch, type);
        }
    };

    Frame.prototype._onGetAppBar = function (ev) {
        if (!ev.handled) {
            this._ensureAppBar();

            ev.data.appBar = this._appBar;
            ev.data.peekBar = this._peekBar;
            ev.handled = true;
        }
    };

    Frame.prototype._onGetPeekBar = function (ev) {
        if (!ev.handled) {
            ev.data.peekBar = this._peekBar;
            ev.handled = true;
        }
    };

    Frame.prototype._onToday = function (ev) {
        if (!ev.handled) {
            this._setToday();
            ev.handled = true;
        }
    };

    // DOM events
    Frame.prototype._preventDefault = function (ev) {
        ev.preventDefault();
    };

    Frame.prototype._onKeyDown = function (ev) {
        this._handleViewCommandKey(ev);
    };

    Frame.prototype._forceDismiss = function () {
        Jx.EventManager.broadcast("lightDismiss", true);
    };

    Frame.prototype._lightDismiss = function () {
        Jx.EventManager.broadcast("lightDismiss", false);
    };

    Frame.ensureCommandInfo = function () {
        if (!Frame.SYNC_LABEL) {
            var res = Jx.res;
            Frame.SYNC_LABEL = res.getString("SyncCommand");
            Frame.SYNC_TOOLTIP = res.loadCompoundString("SyncTooltip", Jx.key.getLabel("F5"));
            Frame.BACKGROUND_LABEL = res.getString("AgendaBackgroundButton");
            Frame.BACKGROUND_TOOLTIP = res.loadCompoundString("AgendaBackgroundTooltip", Jx.key.getLabel("Ctrl+B"));
            Frame.NEW_LABEL = res.getString("NewCommand");
            Frame.NEW_TOOLTIP = res.loadCompoundString("NewTooltip", Jx.key.getLabel("Ctrl+N"));
            Frame.BACKGROUND_DEFAULT_LABEL = res.getString("AgendaBackgroundDefault");
            Frame.BACKGROUND_BROWSE_LABEL = res.getString("AgendaBackgroundBrowse");
        }
    };

    Frame.prototype._onBeforeShowAppbar = function () {
        if (!this._initializedSas) {
            var sasCommand = this._appBarElt.querySelector("#sasCommand");

            if (sasCommand) {
                this._ensureSasButton();
            }
        }
    };

    Frame.prototype._hideCommands = function () {
        if (this._navBar) {
            this._navBar.hide();
        }

        if (this._appBar) {
            this._appBar.hide();
        }
    };

    Frame.prototype._createCommandHandler = function (handler) {
        Debug.assert(handler);

        return (function (ev) {
            // Prevent click events from leaving app bar buttons.
            ev.stopPropagation();
            // Prevent focus change caused by touch scrolling app bar
            ev.preventDefault();

            this._hideCommands();
            handler();
        }).bind(this);
    };

    Frame.prototype._ensureCommandHandlers = function () {
        this._onTodayClicked = this._setToday.bind(this);
        this._onSyncClicked = this._sync.bind(this);
        this._onBackgroundClicked = this._showBackgroundMenu.bind(this);

        this._onNewClicked = function () {
            // Force close any visible controls like QEC.
            Jx.EventManager.broadcast("lightDismiss", true);

            return this._views._onCreateEvent({ handled: false });
        }.bind(this);

        this._ensureCommandHandlers = Jx.fnEmpty;
    };

    Frame.prototype._ensureBackgroundPopup = function () {
        this._ensureCommandHandlers();
        this._initBackgroundPopup();
        this._ensureBackgroundPopup = Jx.fnEmpty;
    };

    Frame.prototype._initBackgroundPopup = function () {
        var Popups = Windows.UI.Popups;
        var popup = this._backgroundPopup = new Popups.PopupMenu();

        // Initialize a gating flag that prevents the background popup from being triggered twice
        this._backgroundPopupShown = false;

        var commands = popup.commands;
        commands.append(new Popups.UICommand(Frame.BACKGROUND_DEFAULT_LABEL, this._changeBackground.bind(this, true), FlyoutAction.chooseDefault));
        commands.append(new Popups.UICommand(Frame.BACKGROUND_BROWSE_LABEL, this._changeBackground.bind(this, false), FlyoutAction.chooseCustom));
    };

    Frame.prototype._createViewCommands = function () {
        Frame.ensureCommandInfo();
        this._ensureCommandHandlers();

        return [
            {
                icon: "\uE117",
                id: "syncCommand",
                label: Frame.SYNC_LABEL,
                tooltip: Frame.SYNC_TOOLTIP,
                section: "selection",
                type: "button",
                onclick: this._createCommandHandler(this._onSyncClicked)
            },
            {
                icon: "\uE18C",
                id: "backgroundCommand",
                label: Frame.BACKGROUND_LABEL,
                tooltip: Frame.BACKGROUND_TOOLTIP,
                section: "selection",
                type: "button",
                onclick: this._onBackgroundClicked,
                hidden: true
            },
            {
                id: "sasCommand"
            },
            {
                icon: "\uE109",
                id: "newEventCommand",
                label: Frame.NEW_LABEL,
                tooltip: Frame.NEW_TOOLTIP,
                section: "global",
                type: "button",
                onclick: this._createCommandHandler(this._onNewClicked)
            }
        ];
    };

    Frame.prototype._handleViewCommandKey = function (ev) {
        // Ignore events coming from the setting flyout.
        var node = ev.target;
        while (Jx.isHTMLElement(node)) {
            if (node.classList.contains("win-settingsflyout")) {
                return;
            }
            node = node.parentNode;
        }

        var handled = false,
            state = this._commandState;

        if (!state.editing) {
            this._ensureCommandHandlers();
            var ManagerViews = Calendar.Views.Manager.Views;
            var keyCode = Jx.key.mapKeyCode(ev.keyCode);

            if (ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
                if (keyCode === Jx.KeyCode.t) {
                    this._onTodayClicked();
                    handled = true;
                } else if (keyCode === Jx.KeyCode.n) {
                    this._onNewClicked();
                    handled = true;
                } else if (keyCode === Jx.KeyCode.g) {
                    _start("_handleViewCommandKey:DatePicker");
                    this._showDatePicker();
                    handled = true;
                    _stop("_handleViewCommandKey:DatePicker");
                } else if (keyCode === Jx.KeyCode.b) {
                    this._changeBackground(false);
                    handled = true;
                } else if (keyCode === Jx.KeyCode.f5) {
                    this._purgeCalendars();
                    this._onSyncClicked();
                    handled = true;
                } else if (keyCode === Jx.KeyCode["1"] || keyCode === Jx.KeyCode.a) {
                    this._setView(ManagerViews.agenda);
                    handled = true;
                } else if (keyCode === Jx.KeyCode["2"] || keyCode === Jx.KeyCode.d) {
                    this._setView(ManagerViews.day);
                    handled = true;
                } else if (!state.companion) {
                    if (keyCode === Jx.KeyCode["3"] || keyCode === Jx.KeyCode.o) {
                        this._setView(ManagerViews.workweek);
                        handled = true;
                    } else if (keyCode === Jx.KeyCode["4"] || keyCode === Jx.KeyCode.w) {
                        this._setView(ManagerViews.week);
                        handled = true;
                    } else if (keyCode === Jx.KeyCode["5"] || keyCode === Jx.KeyCode.m) {
                        this._setView(ManagerViews.month);
                        handled = true;
                    }
                }
            } else if(!ev.ctrlKey && !ev.shiftKey && !ev.altKey){
                if (keyCode === Jx.KeyCode.home) {
                    this._onTodayClicked();
                    handled = true;
                } else if (keyCode === Jx.KeyCode.f5) {
                    this._onSyncClicked();
                    handled = true;
                }
            }
        }

        if (handled) {
            ev.stopPropagation();
            ev.preventDefault();
        }
    };

    Frame.prototype._showBackgroundMenu = function (ev) {
        if (this._backgroundPopupShown) {
            _info('_showBackgroundMenu - Background menu is already shown');
            return;
        }

        this._ensureBackgroundPopup();

        var that = this;

        var boundingRect = ev.target.getBoundingClientRect();
        var rect = {
            x: boundingRect.left,
            y: boundingRect.top,
            height: boundingRect.height,
            width: boundingRect.width,
        };

        // Show the background menu
        this._backgroundPopupShown = true;
        this._backgroundPopup.showForSelectionAsync(rect).done(function (command) {
            // The background menu is closed, clean up
            that._backgroundPopupShown = false;

            var action = FlyoutAction.chooseNothing;

            if (command) {
                action = command.id;
            }

            that._recordBackgroundAction(action);
            that._hideCommands();
        });
    };

    Frame.prototype._onKeyboardShow = function() {
        document.body.classList.add("keyboardShown");

        if (!this._commandState.editing) {
            this._peekBar.hide();
        }
    };

    Frame.prototype._onKeyboardHide = function() {
        document.body.classList.remove("keyboardShown");
        
        if (!this._commandState.editing) {
            this._peekBar.show();
        }
    };
});
