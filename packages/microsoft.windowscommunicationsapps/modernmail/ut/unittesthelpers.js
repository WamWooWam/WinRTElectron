
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx, Mail, Debug, Microsoft, Jm, WinJS, Windows */

(function(){
window.getMailPlatform = function () {
    return Mail.makeUnitTestPlatform();
};

/// Define global objects
Jx.root = {};
Mail.CompApp = {};
window.SasManager = { commandShown: Jx.fnEmpty };

Mail.Debug = Mail.Debug || {};

Mail.UnitTest = Mail.UnitTest || {};
var U = Mail.UnitTest;

U.initGlobals = function () {
    U.setupStubs();
    var globals = Mail.Globals = {
        platform: window.getMailPlatform(),
        splashScreen: {
            addListener: Jx.fnEmpty,
            removeListener: Jx.fnEmpty
        },
        animator: {
            addListener: Jx.fnEmpty,
            removeListener: Jx.fnEmpty,
            registerMessageList: Jx.fnEmpty,
            animateEnterPage: Jx.fnEmpty,
            animateExitPage: Jx.fnEmpty,
            animateSwitchAccount: Jx.fnEmpty,
            animateSwitchFolder: Jx.fnEmpty,
            animateNavigateBack: Jx.fnEmpty,
            animateNavigateForward: Jx.fnEmpty,
            attachGuiStateListeners: Jx.fnEmpty
        },
        appSettings: {
            dispose: Jx.fnEmpty,
            addListener: Jx.fnEmpty,
            removeListener: Jx.fnEmpty,
            isThreadingEnabled: false,
            autoMarkAsRead: true
        }
    };

    var platform = globals.platform,
        defaultAccount = new Mail.Account(platform.accountManager.defaultAccount, platform),
        container = Jx.appData.localSettings().container("MailUT");
    Mail.Globals.appState = new Mail.AppState(globals.platform, {}, defaultAccount, container);
};



U.stubGUIState = function () {
    Debug.assert(Jx.isNullOrUndefined(U._origGUIState), "We should not stub the GUIState twice without restoring it");
    U._origGUIState = Mail.guiState;
    var mockGUIState = Jm.mock(Mail.GUIState.prototype);
    Jm.when(mockGUIState).isThreePane.thenReturn(true);
    mockGUIState.mockedType = Mail.GUIState;
    Mail.guiState = mockGUIState;
};

U.restoreGUIState = function () {
    Mail.guiState = U._origGUIState;
    U._origGUIState = null;
};

U.disposeGlobals = function () {
    Mail.Globals = {};
    U.restoreJx();
};

U._origUtilities = Mail.Utilities;

U.stubUtilities = function () {
    Mail.Utilities.ComposeHelper = Mail.Utilities.ComposeHelper || {
        ensureComposeFiles: function () { },
        ensureComposeHTML: function () { },
        ensureComposeObject: function () { }
    };

};

U.restoreUtilities = function () {
    Mail.Utilities = U._origUtilities;
};

U.escapeQuote = function(input){

    var output = input;
    if (Jx.isNonEmptyString(output)) {
        output = output.replace("'", "&#39;");
        output = output.replace('"',"&quot;");
    }
    return output;
};

U.setupAttachmentStubs = function () {
    var AttachmentWell = window.AttachmentWell = {};
    AttachmentWell.Read = {};
    AttachmentWell.Read.Component = function () { this.initComponent(); };
    Jx.inherit(AttachmentWell.Read.Component, Jx.Component);
    AttachmentWell.Read.Component.prototype.setRootElement = function () { };

    AttachmentWell.Compose = {
        Frame: function () { },
        AttachmentType: {
            skyDriveAttachments: 0,
            basicAttachments: 1
        }
    };
    Jx.augment(AttachmentWell.Compose.Frame, Jx.Component);
    Object.defineProperties(AttachmentWell.Compose.Frame.prototype, {
        currentAttachmentType: { get: function () { } }
    });
    AttachmentWell.Compose.Frame.prototype.validate = function () { };
    AttachmentWell.Compose.Frame.prototype.finalizeForSend = function () { };
    AttachmentWell.Compose.Frame.prototype.discard = function () { };
};

U.setupModernCanvasStubs = function () {
    var ModernCanvas = window.ModernCanvas = {};

    ModernCanvas.ContentFormat = {
        htmlString: "htmlString",
        text: "text",
        documentFragment: "documentFragment"
    };

    ModernCanvas.ContentLocation = {
        all: "all",
        end: "end",
        selection: "selection",
        start: "start"
    };

    ModernCanvas.OpenLinkOptions = {
        click: "click",
        ctrlClick: "ctrlClick",
        dontOpen: "dontOpen"
    };

    ModernCanvas.SignatureLocation = {
        end: "end",
        none: "none",
        start: "start"
    };

    ModernCanvas.ModernCanvas = function () {
        Debug.Events.define(this, "command");
    };
    Object.defineProperties(ModernCanvas.ModernCanvas.prototype, {
        "components": {
            get: function () {
                return {
                    commandManager: {
                        setCommand: function () { }
                    }
                };
            }
        }            
    });
    Jx.augment(ModernCanvas.ModernCanvas, Jx.Events);
    ModernCanvas.ModernCanvas.prototype.setCueText = function () { };
    ModernCanvas.ModernCanvas.prototype.showCueText = function () { };
    ModernCanvas.ModernCanvas.prototype.addEventListener = function () { };
    ModernCanvas.ModernCanvas.prototype.removeEventListener = function () { };
    ModernCanvas.ModernCanvas.prototype.reset = function () { };
    ModernCanvas.ModernCanvas.prototype.addContent = function () { };
    ModernCanvas.ModernCanvas.prototype.insertSignatureIfNecessary = function () { };
    ModernCanvas.ModernCanvas.prototype.setMailMessage = function () { };
    ModernCanvas.ModernCanvas.prototype.activate = function () { };
    ModernCanvas.ModernCanvas.prototype.setMailAccount = function () { };
    ModernCanvas.ModernCanvas.prototype.dispose = function () { };
    ModernCanvas.ModernCanvas.prototype.focus = function () { };
    ModernCanvas.ModernCanvas.prototype.isContentReady = function () { };
    ModernCanvas.ModernCanvas.prototype.getContent = function () { };
    ModernCanvas.ModernCanvas.prototype.getCanvasElement = function () { };
    ModernCanvas.ModernCanvas.prototype.getDocument = function () { return document; };
    ModernCanvas.ModernCanvas.prototype.getWindow = function () { return window; };
    ModernCanvas.ModernCanvas.prototype.getSelectionRange = function () { };
    ModernCanvas.ModernCanvas.prototype.scrollSelectionIntoRange = function () { };
    ModernCanvas.ModernCanvas.prototype.getParentElementForSelection = function () { return false; };
    ModernCanvas.ModernCanvas.prototype.getIframeElement = function () { };
    ModernCanvas.ModernCanvas.prototype.getSelectionStyles = function () { return { bold: false, underline: false, italic: false }; };

    var canvas = new ModernCanvas.ModernCanvas();
    ModernCanvas.createCanvasAsync = function () { return WinJS.Promise.wrap(canvas); };
    ModernCanvas.removeFakeFontNames = function (string) { return string; };

    ModernCanvas.CommandManager = function () { };
    ModernCanvas.CommandManager.prototype.setCommand = function () { };

    ModernCanvas.Command = function () { };

    ModernCanvas.Component = function () { };
    ModernCanvas.Component.prototype.createDataPackageFromSelection = function () { return { properties: {} }; };

    ModernCanvas.HyperlinkTooltip = function () { };
    ModernCanvas.HyperlinkTooltip.prototype.activateUI = function () { };
    ModernCanvas.HyperlinkTooltip.prototype.deactivateUI = function () { };
    ModernCanvas.Plugins = {};    
    ModernCanvas.Plugins.IrmQuotedBody = function () { };
    ModernCanvas.Plugins.DirtyTracker = function () { };
    ModernCanvas.Plugins.Indent = function () { };
    ModernCanvas.Plugins.DefaultFont = function () { };
    ModernCanvas.Plugins.ImageResize = function () { };
    ModernCanvas.AutoReplaceManager = function () { };
    ModernCanvas.AutoReplaceManagerTables = { };
    ModernCanvas.AutoReplaceManagerTables.instance = function () { return {}; };
};

U.setupCalendarStubs = function () {
    if (!Microsoft.WindowsLive.Platform.Calendar) {
        Microsoft.WindowsLive.Platform.Calendar = {
            BusyStatus: {
                free:             0,
                tentative:        1,
                busy:             2,
                outOfOffice:      3,
                workingElsewhere: 4
            },

            DataType: {
                plainText: 1,
                html: 2,
                rtf: 3,
                mime: 4
            },

            EventType: {
                single:            0,
                series:            1,
                instanceOfSeries:  2,
                exceptionToSeries: 3
            },

            ResponseType: {
                none:         0,
                organizer:    1,
                tentative:    2,
                accepted:     3,
                declined:     4,
                notResponded: 5
            },

            MeetingStatus: {
                notAMeeting: 0x00,
                isAMeeting: 0x01,
                isReceived: 0x02,
                isCanceled: 0x04,
                isForwarded: 0x08
            },

            ServerCapability: {
                none: 0x00000,
                canForward: 0x10000,
                canReplaceMime: 0x20000
            }
        };
    }
};

U.setupStubs = function () {

    U.setupFormatStubs();

    if (!window.People) {
        window.People = {};
    }

    if (!window.People.Priority) {
        window.People.Priority = { userTileRender: 1 };
    }

    if (!window.People.IdentityElements) {
        window.People.IdentityElements = { Name: 1 };
    }

    if (!window.People.Accounts) {
        window.People.Accounts = {};
    }

    if (!window.People.DialogEvents) {
        window.People.DialogEvents = {
            opened: "People.DialogEvents.opened",
            closed: "People.DialogEvents.closed"
        };
    }

    if (!U.ensureNamespace("Microsoft.WindowsLive.Instrumentation.Ids.Mail")) {
        Microsoft.WindowsLive.Instrumentation.Ids.Mail = {
            modernMailConversationThreadingEnabled: 1,
            composeCommandCloseSave: 2,
            composeCommandSend: 3,
            composeCommandDiscard: 4
        };
    }

    if (!window.FromControl) {
        var FromControl = window.FromControl = {
            FromControl: function () {
            }
        };
        Jx.augment(FromControl.FromControl, Jx.Component);
        FromControl.FromControl.prototype.select = function () { };
        FromControl.FromControl.prototype.refresh = function () { };
        FromControl.FromControl.prototype.getSelection = function () { };
        FromControl.FromControl.prototype.setDisabled = function () { };
    }
};

U.ensureNamespace = function (namespace) {
    /// <param name="namespace" type="String"></param>
    /// return true if the namespace already exist before

    var parts = namespace.split(".");
    var isAugmented = false;

    function augmentNamespace(validNamespace, extension) {
        /// <param name="validNamespace" type="Object"></param>
        /// <param name="extension" type="Array"></param>
        // base case - empty array
        if (extension.length === 0) {
            return validNamespace;
        }
        // augment the first part if not exists
        var firstPart = extension.shift();
        if (!validNamespace[firstPart]) {
            validNamespace[firstPart] = {};
            isAugmented = true;
        }
        var newValidNamespace = validNamespace[firstPart];
        // now we got a bigger valid namespace and an extension, it is time for recursion
        return augmentNamespace(newValidNamespace, extension);
    }

    if (parts.length !== 0) {
        Debug.assert(parts[0] !== window, "Do not qualify the namespace with windows when using ensureNamespace.");
    }
    augmentNamespace(window, parts);
    return !isAugmented;
};

U.setupPrintStubs = function () {
    if (!window.Windows) {
        window.Windows = {};
    }

    if (!window.Windows.Graphics) {
        window.Windows.Graphics = {};
    }

    if (!window.Windows.Graphics.Printing) {
        window.Windows.Graphics.Printing = {};
    }

    if (!window.Windows.Graphics.Printing.StandardPrintTaskOptions) {
        window.Windows.Graphics.Printing.StandardPrintTaskOptions = Windows.Graphics.Printing.StandardPrintTaskOptions = {
            mediaSize: "PageMediaSize",
            duplex: "DocumentDuplex",
            inputBin: "DocumentInputBin",
            printQuality: "PageOutputQuality",
            staple: "DocumentStaple",
            holePunch: "DocumentHolePunch"
        };
    }

    if (!window.MSApp) {
        window.MSApp = {};
    }

    if (!window.MSApp.getHtmlPrintDocumentSource) {
        window.MSApp.getHtmlPrintDocumentSource = function (printDocument) {
            // Simulate behavior of MSApp.getHtmlPrintDocumentSource
            if (printDocument.body.onbeforeprint) {
                printDocument.body.onbeforeprint();
            }
            if (printDocument.body.onafterprint) {
                printDocument.body.onafterprint();
            }

            return printDocument;
        };
    }


};

U.setupShareStubs = function (tc) {
    var originalShareHandler = Mail.ShareHandler;
    tc.addCleanup(function() { Mail.ShareHandler = originalShareHandler; });

    Mail.ShareHandler = function () { };
    Mail.ShareHandler.prototype = {
        dispose : Jx.fnEmpty
    };
    window.Windows = window.Windows || {};
    window.Windows.ApplicationModel = window.Windows.ApplicationModel || {};
    window.Windows.ApplicationModel.DataTransfer = window.Windows.ApplicationModel.DataTransfer || {};
    window.Windows.ApplicationModel.DataTransfer.DataTransferManager = window.Windows.ApplicationModel.DataTransfer.DataTransferManager || {};
    window.Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView = function () {
        return {
            addEventListener: function () {
            },
            removeEventListener: function () {
            }
        };
    };
};

U._stubJx = {};

U.stubJx = function (tc, namespace) {
    tc.isTrue(!U._stubJx[namespace]);
    U._stubJx[namespace] = Jx[namespace];

    var stub = {};
    switch (namespace) {
        case "activation":
            stub = {
                addListener: Jx.fnEmpty,
                removeListener: Jx.fnEmpty,
                suspending : "suspending",
                resuming : "resuming",
                protocol: "protocol"
            };
            break;
        case "bici":
            stub = {
                set : Jx.fnEmpty,
                addToStream: Jx.fnEmpty
            };
            break;
        case "appData":
            stub = new window.UtAppData();
            break;
        case "res":
            stub = {
                processAll: function () {
                    return true;
                },
                loadCompoundString: function(resourceId) {
                    var str = this.getString(resourceId);
                    if (str) {
                        // This is a simplified version of the actual loadCompoundString - it doesn't deal with escape sequences.  So long as none of the strings below need it, that's fine.
                        for (var i = arguments.length - 1; i > 0; i--) {
                            var rx = new RegExp("%" + String(i), "g");
                            str = str.replace(rx, arguments[i]);
                        }
                    }
                    return str;
                },
                getString: function (id) {
                    var _supportedStrings = {
                        "composeForwardInviteMessage": "See below for details. For more info, contact %1.",
                        "mailUIMailMessageNoSubject" : "NoSubject",
                        "mailUIMailMessageNoSender" : "NoSender",
                        "mailMessageListListViewAriaDescriptionRead" : "Read",
                        "mailMessageListListViewAriaDescriptionUnread" : "Unread",
                        "mailMessageListItemAriaDescFlagged": "Flagged",
                        "mailMessageListListViewAriaDescriptionReplied": "Replied to",
                        "mailMessageListListViewAriaDescriptionForwarded": "Forwarded",
                        "mailMessageListItemAriaDescCalendarItem": "Calendar item",
                        "mailMessageListItemAriaDescHasAttachment": "Has attachment",
                        "mailMessageListItemAriaDescLowPriority": "Low priority",
                        "mailMessageListItemAriaDescHighPriority": "High priority",
                        "mailUIMailMessageCalendarInvitePrefix": "Invite:",
                        "mailUIMailMessageCalendarInvitationPrefix": "Invitation:",
                        "mailMessageListItemAriaDescIrm": "Has Information Rights Management",
                        "mailMessageListItemAriaDescInboundRecipient": "From %1",
                        "mailMessageListItemAriaDescOutboundRecipient": "To %1",
                        "mailMessageListItemAriaDescInboundTimestamp": "Received %1",
                        "mailMessageListItemAriaDescOutboundTimestamp" : "Sent %1",
                        "mailMessageListMailItemAriaDescriptionTemplate" : "%1, %2, Subject %3, %4, %5, %6, %7, %8, %9, %10",
                        "mailMessageListConversationChildItemAriaDescriptionTemplate" : "%1, Message in a conversation, Subject %2, %3, %4, %5, %6, %7, %8, %9, %10",
                        "mailMessageListConversationHeaderAriaDescriptionTemplate": "%1, Conversation with %2 items, %3, %4, %5, %6, %7, %8, %9, %10, %11",
                        "mailReadingPaneOnBehalf": "%1 on behalf of %2",
                        "AllDaySuffix": "%1 All day",
                        "DateRange": "%1 to %2",
                        "TimeRange": "%1 - %2",
                        "mailFolderNameFlagged": "Flagged",
                        "mailInviteStatusInformational": "Event details updated. No response needed.",
                        "mailInviteStatusOutdated": "This invitation is outdated.",
                        "mailInviteStatusDelegator": "This invitation was also sent to your delegate.",
                        "mailInviteStatusDelegate": "This is a delegated invitation.",
                        "mailInviteStatusNoResponse": "The organizer hasn't requested a response.",
                    };

                    return (id in _supportedStrings) ? _supportedStrings[id] : id;
                },
                addResourcePath: function () { }
            };
            break;
        default:
            Debug.assert(false, "Stubbing for Jx." + namespace + " is not implemented");
    }

    Jx[namespace] = stub;
    tc.addCleanup(function (tc) {
        U.restoreJx(tc, namespace);
    });
};

U.restoreJx = function (tc, name) {
    /// <param name="tc" type="Tx.TestContext" optional="true" />
    /// <param name="name" type="String" optional="true" />
    if (name) {
        tc.isTrue(name in U._stubJx);
        Jx[name] = U._stubJx[name];
        delete U._stubJx[name];
    } else {
        for (var namespace in U._stubJx) {
            Jx[namespace] = U._stubJx[namespace];
            delete U._stubJx[namespace];
        }
    }
};

U.addElements = function (tc, elements, parent) {
    parent = parent || document.body;
    for (var ii = 0, maxII = elements.length; ii < maxII; ii++) {
        // each entry is either the id/selector of the element or a struct as follows:
        //  {id:"elementId/selector", type: "elementType"}
        var elementInfo = elements[ii],
            identifierOrSelector = (Jx.isNonEmptyString(elementInfo)) ? elementInfo : elementInfo.id,
            isSelector = identifierOrSelector.charAt(0) === ".",
            type = (Jx.isNonEmptyString(elementInfo)) ? "div" : elementInfo.type;

        // Make sure that this div is not already in the DOM (it's an indication that a previous test
        // did not clean up properly)
        if (isSelector) {
            tc.areEqual(document.querySelectorAll(identifierOrSelector).length, 0, "Some previous test did not clean up elements");
        } else {
            tc.isTrue(Jx.isNullOrUndefined(document.getElementById(identifierOrSelector)), "Some previous test did not clean up elements");
        }

        var el = document.createElement(type);
        el.setAttribute((isSelector ? "class" : "id"), (isSelector ? identifierOrSelector.substring(1) : identifierOrSelector));
        parent.appendChild(el);
    }
};

U.removeElements = function (elements) {
    for (var ii = 0, maxII = elements.length; ii < maxII; ii++) {
        var elementInfo = elements[ii],
            identifierOrSelector = (Jx.isNonEmptyString(elementInfo)) ? elementInfo : elementInfo.id,
            isSelector = identifierOrSelector.charAt(0) === ".",
            toBeRemoved = isSelector ? document.querySelectorAll(identifierOrSelector) : [document.getElementById(identifierOrSelector)];
        for (var jj = 0; jj < toBeRemoved.length; jj++) {
            var elem = toBeRemoved[jj];
            if (elem) {
                elem.removeNode(true /*deep*/);
            }
        }
    }
};

U.ensureSynchronous = function (func, context, args) {
    var immediate = window.setImmediate,
        clearImmediate = window.clearImmediate,
        timeout = window.setTimeout,
        clearTimeout = window.clearTimeout,
        requestAnimationFrame = window.requestAnimationFrame,
        cancelAnimationFrame = window.cancelAnimationFrame,
        callbacks = [];

    window.requestAnimationFrame = window.setImmediate = window.msSetImmediate = window.setTimeout = function (callback) {
        callbacks.push(callback);
        return -callbacks.length;
    };

    window.cancelAnimationFrame = window.clearImmediate = window.msClearImmediate = window.clearTimeout = function (id) {
        if (id < 0) {
            callbacks[-id-1] = null;
        } else {
            clearTimeout(id);
        }
    };

    var result;
    try {
        result = func.apply(context, args);
        Jx.scheduler.testFlush();
        Debug.assert(Jx.scheduler.testGetJobCount() === 0);
        for (var i = 0; i < callbacks.length; i++) {
            if (callbacks[i]) {
                callbacks[i]();
            }
        }
        // Drain again in case the callbacks queued more scheduled jobs
        Jx.scheduler.testFlush();
        Debug.assert(Jx.scheduler.testGetJobCount() === 0);
    } finally {
        window.setImmediate = window.msSetImmediate = immediate;
        window.clearImmediate = window.msClearImmediate = clearImmediate;
        window.setTimeout = timeout;
        window.clearTimeout = clearTimeout;
        window.cancelAnimationFrame = cancelAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;
    }
    return result;

};

U.setupFormatStubs = function () {
    if (!window.Windows) {
        window.Windows = {};
    }
    if (!window.Windows.Globalization) {
        window.Windows.Globalization = {};
    }

    if (!window.Windows.Globalization.DateTimeFormatting) {
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            days   = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        var Formatter = /*@constructor*/ function (yearFormat, monthFormat, dayFormat, dayOfWeekFormat) {
            if (yearFormat === "shorttime") {
                this.format = Formatter.shortTime.format;
            } else if (yearFormat === "year month day") {
                this.format = function (jsDate) {
                    /// <param name="jsDate" type="Date"></param>
                    return months[jsDate.getMonth()] + " " + String(jsDate.getDate()) + ", " + String(jsDate.getFullYear());
                };
            } else if (dayOfWeekFormat === Windows.Globalization.DateTimeFormatting.DayOfWeekFormat.abbreviated) {
                this.format = function (jsDate) {
                    /// <param name="jsDate" type="Date"></param>
                    var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    return weekDays[jsDate.getDay()];
                };
            } else {
                this.format = function (jsDate) {
                    /// <param name="jsDate" type="Date"></param>
                    return String(jsDate.getMonth() + 1) + "/" + String(jsDate.getDate()) + "/" + String(jsDate.getFullYear()).substring(2);
                };
            }
        };

        Formatter.longDate = {
            format: function(date) {
                return days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
            }
        };

        Formatter.shortTime = {
            format: function (jsDate) {
                /// <param name="jsDate" type="Date"></param>
                var hour24 = jsDate.getHours();
                var hour = ((hour24 % 12) === 0) ? 12 : hour24 % 12;
                var minute = jsDate.getMinutes();
                var minuteString = (minute > 9) ? String(minute) : "0" + String(minute);
                return String(hour) + ":" + minuteString + " " + ((hour24 >= 12) ? "PM" : "AM");
            }
        };

        Windows.Globalization.DateTimeFormatting = {
            DateTimeFormatter: Formatter,
            YearFormat: {
                abbreviated: 1,
                none: 0
            },
            MonthFormat: {
                "default": 1,
                none: 0
            },
            DayFormat: {
                "default": 1,
                none: 0
            },
            DayOfWeekFormat: {
                abbreviated: 1,
                none: 0
            }
        };

    }
};

})();
