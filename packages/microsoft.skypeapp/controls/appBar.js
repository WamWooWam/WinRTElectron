









(function () {
    "use strict";

    var itemWidth = 270 + 15;

    var appBar = Skype.UI.Control.define(function (element, options) {
        this.element = element;
        this._readySignal = this._readySignal || new WinJS._Signal();
        this.initPromise = this._readySignal.promise;
        Skype.UI.AppBar.instance = this;
    }, {
        _addCommandBase: null,
        _bar: null,
        _element: null,
        _commands: {},
        _allCommandsIds: [],
        _commandsMap: {},
        _initialized: false,
        _disabled: false,
        _hidden: true,
        _commandsStickArray: [],
        _readySignal: null,

        _checkSticky: function () {
            var sticky = false;
            this._commandsStickArray.forEach(function (value) {
                sticky = sticky || value;
            }, this);
            this._bar.sticky = sticky;
            this._barTop.sticky = sticky;
        },
        
        _refreshBarability: function () {
            this._bar.disabled = this._isDisabled(Skype.UI.AppBar.Location.bottom);
            this._barTop.disabled = this._isDisabled(Skype.UI.AppBar.Location.top);
        },

        _isDisabled: function (location) {
            if (this._disabled) {
                return true;
            }

            var cmds = this._commands[location];

            if (!cmds || cmds.length === 0) {
                return false;
            }
            var that = this;
            return cmds.every(function (cmd) {
                var cmdItem = that.getCommandById(cmd.id, location);
                var isHidden = cmdItem ? cmdItem.hidden : cmd.hidden;
                return isHidden;
            });
        },

        _execCommand: function (cmdId) {
            Skype.Statistics.sendStats(Skype.Statistics.event.appBar_executeCommand, cmdId);
        },

        _startRecording: function () {
            this._recording = true;
            this._recordedCommands = [];
        },

        _stopRecording: function () {
            this._recording = false;
            this._showHideCommands(this._recordedCommands);
        },

        _showHideCommands: function (commands) {
            var result = {};
            commands.forEach(function (cmds) {
                cmds.toHide && cmds.toHide.forEach(function (id) {
                    result[id] = false;
                });

                cmds.toShow && cmds.toShow.forEach(function (id) {
                    result[id] = true;
                });
            });
            var toShow = [], toHide = [];
            Object.keys(result).forEach(function (id) {
                if (result[id]) {
                    toShow.push(id);
                } else {
                    toHide.push(id);
                }
            });
            this.showHideCommands(toShow, toHide);
        },

        _handleAfterHide: function (location) {
            this._hidden = true;
            Skype.UI.TabConstrainer.suppressed = false;
            Skype.Application.state.isAppBarOpened = false;

            if (this._resetSticky) {
                this._resetSticky = false;
                this.regImmediate(function () {
                    this._bar.sticky = false;
                }.bind(this));
            }


            Skype.UI.AppBar._commandSets.forEach(function (cmdSet) {
                
                cmdSet.hided && cmdSet.location === location && cmdSet.hided();
            });

            roboSky.write("AppBar,hide," + location);
        },

        _handleBeforeShow: function (location) {
            this._hidden = false;
            Skype.UI.TabConstrainer.suppressed = true;

            Skype.Statistics.sendStats(Skype.Statistics.event.appBar_show);
            Skype.Application.state.isAppBarOpened = true;

            Skype.UI.AppBar._commandSets.forEach(function (cmdSet) {
                
                cmdSet.showing && cmdSet.location === location && cmdSet.showing();
            });

            if (location == "top") {
                var viewport = this._barTop._element.querySelector(".appBarConversationSwitcher");
                this.regTimeout(function () {
                    viewport.scrollLeft = "0px";
                }.bind(this), 200);
            }
        },

        _handleAfterShow: function (location) {
            roboSky.write("AppBar,show," + location);
        },

        _lazyInit: function (element) {
            if (this._initialized) {
                return; 
            }
            this._initialized = true;

            log("AppBar.init()");
            this._commands[Skype.UI.AppBar.Location.bottom] = [];
            this._commands[Skype.UI.AppBar.Location.top] = [];

            Skype.UI.AppBar._commandSets.forEach(function (cmdSet) {
                Array.prototype.push.apply(this._commands[cmdSet.location], cmdSet.commands);
                Array.prototype.push.apply(this._allCommandsIds, cmdSet.commandsIds);
            }.bind(this));

            WinJS.UI.Fragments.render("/controls/appBar.html", element).then(this._onReady.bind(this));
        }, 

        _onReady: function (element) {
            WinJS.UI.processAll(element, true);
            WinJS.Resources.processAll(element);

            this._element = element;

            this._initBottomBar();
            this._initTopBar();

            
            this._allCommandsIds.forEach(function (cmdId) {
                var cmd = this.getCommandById(cmdId);
                if (cmd) {
                    this.regEventListener(cmd, "click", this._execCommand.bind(this, cmdId));
                }
            }.bind(this));

            this.regEventListener(this._bar, "beforeshow", this._handleBeforeShow.bind(this, Skype.UI.AppBar.Location.bottom));
            this.regEventListener(this._bar, "aftershow", this._handleAfterShow.bind(this, Skype.UI.AppBar.Location.bottom));
            this.regEventListener(this._bar, "afterhide", this._handleAfterHide.bind(this, Skype.UI.AppBar.Location.bottom));
            this.regEventListener(this._barTop, "beforeshow", this._handleBeforeShow.bind(this, Skype.UI.AppBar.Location.top));
            this.regEventListener(this._barTop, "aftershow", this._handleAfterShow.bind(this, Skype.UI.AppBar.Location.top));
            this.regEventListener(this._barTop, "afterhide", this._handleAfterHide.bind(this, Skype.UI.AppBar.Location.top));

            var id = 0;
            Skype.UI.AppBar._commandSets.forEach(function (cmdSet) {
                cmdSet.ready && cmdSet.ready(this, id++);
            }.bind(this));

            this._readySignal.complete();
        },

        _initBottomBar: function () {
            var commands = this._commands[Skype.UI.AppBar.Location.bottom],
                options = {
                    commands: commands
                };
                
            this._bar = new WinJS.UI.AppBar(this.querySelector("#appBar"), options);
            this._setExtraAttributes(this._bar, commands);
        },
        _initTopBar: function () {
            this._barTop = new WinJS.UI.AppBar(this.querySelector("#appBarTop"), {
                layout: 'custom',
                placement: 'top'
            });
        },
        _setExtraAttributes: function (bar, commands) {
            
            commands.forEach(function (cmd) {
                var p,
                    attributes = cmd.extraAttributes;
                if (attributes) {
                    for (p in attributes) {
                        bar.getCommandById(cmd.id).element.setAttribute(p, attributes[p]);
                    }
                }
            });
        },

        

        init: function () {
            log("AppBar: Init");
            this.regEventListener(Skype.Application.LoginHandlerManager.instance, Skype.Application.LoginHandlerManager.Events.LOGIN_FULL, function () {
                this._lazyInit(this.element);
            }.bind(this));
        },

        focusRecentsList: function () {
            var recentsEl = this.element.querySelector("div.recents.win-listview");
            if (recentsEl) {
                recentsEl.focus();
            }
        },

        handleSoftDispose: function () {
            log("AppBar: handleSoftDispose");

            this.updateFocusedView();
            Skype.UI.AppBar._commandSets.forEach(function (cmdSet) {
                cmdSet.handleSoftDispose && cmdSet.handleSoftDispose();
            }.bind(this));
        },

        updateFocusedView: WinJS.Promise.async(function (focusedView) {
            this._startRecording();
            Skype.UI.AppBar.instance.showOnlyCommands(null);
            if (Skype.UI.AppBar.instance._bar) {
                Skype.UI.AppBar.instance._bar.sticky = false;
            }
            if (Skype.UI.AppBar.instance._barTop) {
                Skype.UI.AppBar.instance._barTop.sticky = false;
            }
            Skype.UI.AppBar._commandSets.forEach(function (cmdSet) {
                cmdSet.updateFocusedView && cmdSet.updateFocusedView(focusedView);
            }, this);
            this._stopRecording();
        }),

        updateContext: WinJS.Promise.async(function (context) {
            this._startRecording();
            Skype.UI.AppBar._commandSets.forEach(function (cmdSet) {
                cmdSet.updateContext && cmdSet.updateContext(context);
            }, this);
            this._stopRecording();
        }),

        setSticky: function (value, id) {
            this._commandsStickArray[id] = value;
            this._checkSticky();
        },

        enable: WinJS.Promise.async(function () {
            this._disabled = false;
            this._refreshBarability();
        }),

        disable: WinJS.Promise.async(function () {
            this._disabled = true;
            this._refreshBarability();
        }),

        show: WinJS.Promise.async(function (location) {
            (!location || location === Skype.UI.AppBar.Location.bottom) && this._bar.show();
            (!location || location === Skype.UI.AppBar.Location.top) && this._barTop.show();
        }),

        hide: WinJS.Promise.async(function () {
            this._bar.hide();
            this._barTop.hide();
        }),

        showHideCommands: function (showCommands, hideCommands) {
            if (!this._bar) {
                return;
            }

            if (this._recording) {
                this._recordedCommands.push({ toShow: showCommands, toHide: hideCommands });
                return;
            }

            var immediate = this._bar.hidden;

            if (hideCommands && hideCommands.length) {
                this._bar._hideCommands(hideCommands, immediate);
            }

            if (showCommands && showCommands.length) {
                this._bar._showCommands(showCommands, true);
            }

            this._refreshBarability();
        },

        showOnlyCommands: function (commands, location) {
            var runViaImmediate = false;
            if (!location || location === Skype.UI.AppBar.Location.top) {

                if (this._bar && this._barTop && !this._barTop.hidden) {
                    if (!this._bar.sticky) {
                        this._bar.sticky = true;
                        this._resetSticky = true;
                        runViaImmediate = true;
                    }
                    this._barTop.hide();
                }

            }
            if (!this._recording && runViaImmediate) {
                this.regImmediate(function () {
                    this._showHideCommands([{ toShow: commands, toHide: this._allCommandsIds }]);
                }.bind(this));
            } else {
                this.showHideCommands(commands, this._allCommandsIds);
            }
        },

        getCommandById: function (id, location) {
            var bar = this._bar;
            if (location === Skype.UI.AppBar.Location.top) {
                bar = this._barTop;
            }
            var cmd = this._commandsMap[id];
            if (!cmd) {
                cmd = this._commandsMap[id] = bar.getCommandById(id);
            }
            return cmd;
        },

        querySelector: function (str) {
            return this._element.querySelector(str);
        },
    }, {
        instance: null,

        _commandSets: [],

        registerCommandSet: function (commandSet) {
            Skype.UI.AppBar._commandSets.push(commandSet);
        },
        Binding: {
            recentsWidth: WinJS.Binding.converter(function (length) {
                return length ? (length * itemWidth - 15) + "px" : 0;
            })
        },
        Location: {
            "top": "top",
            "bottom": "bottom"
        }
    });

    WinJS.Namespace.define("Skype.UI", {
        AppBar: WinJS.Class.mix(appBar, WinJS.Utilities.eventMixin)
    });
    window.traceClassMethods && window.traceClassMethods(appBar, "AppBar", ["lazyInit"]);

})();