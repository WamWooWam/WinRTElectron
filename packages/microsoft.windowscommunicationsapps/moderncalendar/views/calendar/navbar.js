
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,matchMedia,WinJS,Debug,Jx,$,Calendar*/

Jx.delayDefine(Calendar, "NavBar", function () {

    function _markStart(s) { Jx.mark("Calendar.NavBar." + s + ",StartTA,Calendar"); }
    function _markStop(s) { Jx.mark("Calendar.NavBar." + s + ",StopTA,Calendar"); }

    var Orientation = WinJS.UI.Orientation;
    var _res = Jx.res;

    // view is a custom property, it should be in Calendar.Views.Manager.Views
    var _commands = [
        {
            view: "agenda",
            icon: "\uE199",
            label: _res.getString("AgendaCommand")
        },
        {
            view: "day",
            icon: "\uE161",
            label: _res.getString("DayCommand")
        },
        {
            view: "workweek",
            icon: "\uE186",
            label: _res.getString("WorkWeekCommand")
        },
        {
            view: "week",
            icon: "\uE162",
            label: _res.getString("WeekCommand")
        },
        {
            view: "month",
            icon: "\uE163",
            label: _res.getString("MonthCommand")
        },
    ];

    var _companionCommands = [
        {
            view: "agenda",
            icon: "\uE199",
            label: _res.getString("AgendaCommand")
        },
        {
            view: "day",
            icon: "\uE161",
            label: _res.getString("DayCommand")
        },
    ];

    var NavBar = Calendar.NavBar = function () {
        this.initComponent();
        this._id = "calNavBar";

        this._companion = false;

        this._navBar = null;
        this._navBarElt = null;
        this._navBarContainer = null;

        this._onInvoked = this._onInvoked.bind(this);

        // Create an MQL listener to determine when we are too narrow to show a horizontal view
        var onSnapChanged = this._onSnapChanged = this._onSnapChanged.bind(this);
        var snapListener = this._snapListener = matchMedia("(max-width: 499px)");
        snapListener.addListener(onSnapChanged);

        //Debug.only(Object.seal(this)); // TODO: currently not working for Jx components
    };

    Jx.augment(NavBar, Jx.Component);

    var proto = NavBar.prototype;

    proto.dispose = function () {
        Debug.assert(this._navBar === null);
        Debug.assert(this._navBarElt === null);
        Debug.assert(this._navBarContainer === null);

        if (this._snapListener) {
            this._snapListener.removeListener(this._onSnapChanged);
            this._snapListener = null;
        }

        this._onSnapChanged = null;
    };

    proto.buildUI = function (companion) {
        _markStart("buildUI");

        if (this._companion !== companion) {
            this.destroyUI();
            this._companion = companion;
        }

        if (!this._navBar) {
            Debug.assert(this._navBarElt === null);
            Debug.assert(this._navBarContainer === null);

            document.body.insertAdjacentHTML("beforeend",
                '<div id="navBar" class="win-ui-dark">' +
                    '<div>' +
                        '<div id="calNBC">' +
                        '</div>' +
                    '</div>' +
                '</div>'
                );

            this._navBarElt = $.id("navBar");
            Debug.assert(this._navBarElt);
            this._navBar = new WinJS.UI.NavBar(this._navBarElt);

            Debug.assert($.id("calNBC"));
            var commands = this._companion ? _companionCommands : _commands;
            var navBarContainer = this._navBarContainer = new WinJS.UI.NavBarContainer($.id("calNBC"), {
                data: new WinJS.Binding.List(commands),
                layout: this._snapListener.matches ? Orientation.vertical : Orientation.horizontal,
            });
            navBarContainer.addEventListener("invoked", this._onInvoked);

            // add a specific class to each command button
            $(".win-navbarcommand").each(function (i, e) {
                e.classList.add("cal-navbar-" + _commands[i].view);
            });
        }

        _markStop("buildUI");
    };

    proto.destroyUI = function () {
        _markStart("destroyUI");
        
        if (this._navBar) {
            this._navBarContainer.dispose();
            this._navBarContainer = null;
            
            this._navBar.dispose();
            this._navBar = null;
            
            this._navBarElt.outerHTML = "";
            this._navBarElt = null;
        }
        
        _markStop("destroyUI");
    };

    proto.shutdownUI = function () {
        this.destroyUI();
        Jx.Component.prototype.shutdownUI.call(this);
    };

    proto.hide = function () {
        if (this._navBar) {
            this._navBar.hide();
        }
    };

    proto.show = function () {
        if (this._navBar) {
            this._navBar.show();
        }
    };

    proto._onInvoked = function (ev) {
        this._navBar.hide();
        this.fire("goToView", { view: ev.detail.data.view });
    };

    proto._onSnapChanged = function (mql) {
        if (this._navBar) {
            Debug.assert(Jx.isObject(this._navBarContainer), 'Jx.isObject(this._navBarContainer)');

            this._navBarContainer.layout = mql.matches ? Orientation.vertical : Orientation.horizontal;
        }
    };
});