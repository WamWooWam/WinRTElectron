
//
// Copyright (C) Microsoft Corporation. All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,WinJS*/

Jx.delayDefine(Mail, "ListViewHelper", function () {
    "use strict";

    var ListViewHelper = Mail.ListViewHelper = {

        isListViewReady: function (listView) {
            /// <param name="listView" type="WinJS.UI.ListView" />
            /// <returns type="Boolean">returns true if the loading state of the listView is complete</returns>
            Debug.assert(Jx.isObject(listView));
            return Jx.isObject(listView) && (listView.loadingState === "complete");
        },

        isItemsLoaded: function (listView) {
            /// <param name="listView" type="WinJS.UI.ListView" />
            /// <returns type="Boolean">returns true if the loading state of the listView is in itemsLoaded or complete</returns>
            Debug.assert(Jx.isObject(listView));
            var loadingState = listView.loadingState;
            return (loadingState === "complete") || (loadingState === "itemsLoaded");
        },

        disableAnimation: function (listView) {
            /// <param name="listView" type="WinJS.UI.ListView" />
            Debug.assert(Jx.isInstanceOf(listView, WinJS.UI.ListView));
            listView.addEventListener("contentanimating", ListViewHelper._onListViewContentAnimation, false);
        },

        enableAnimation: function (listView) {
            /// <param name="listView" type="WinJS.UI.ListView" />
            Debug.assert(Jx.isInstanceOf(listView, WinJS.UI.ListView));
            listView.removeEventListener("contentanimating", ListViewHelper._onListViewContentAnimation, false);
        },

        _onListViewContentAnimation: function (e) {
            ///<param name="e" type="Event"/>
            Debug.assert(Jx.isObject(e));
            Debug.assert(Jx.isBoolean(e.cancelable) && e.cancelable);
            Debug.assert(Jx.isFunction(e.preventDefault));

            // Working around Windows 8 Bugs 1002486 - Event.detail is sometimes null in the contentAnimatingEvent
            var animationType = Jx.isObject(e.detail) ? e.detail.type : "unknown";
            Mail.writeProfilerMark("ListViewContentAnimation - incoming " + animationType + " animation - cancelled");
            e.preventDefault();
        },

        _onKeyboardNavigating: function (e) {
            ///<param name="e" type="Event"/>
            var newFocus = e.detail.newFocus,
                listView = /*@static_cast(WinJS.UI.ListView)*/ e.srcElement.winControl;
            Debug.assert(Jx.isInstanceOf(listView, WinJS.UI.ListView));
            Debug.assert(Jx.isValidNumber(newFocus));
            listView.selection.set(newFocus);
        },

        waitForListView: function (listView, loadingState, timeout) {
            /// <param name="listView" type="WinJS.UI.ListView" />
            /// <param name="loadingState" type="String" optional="true" />
            /// <param name="timeout" type="Number" optional="true" />
            Debug.assert(Jx.isObject(listView));
            loadingState = loadingState || "viewPortLoaded";
            Debug.assert(Jx.isNonEmptyString(loadingState));
            return Mail.Promises.waitForEventWithTimeout(listView, "loadingstatechanged", function () {
                return listView.loadingState === loadingState;
            }, timeout);
        },

        setSelectionMode : function (listView, selectionMode) {
            /// <param name="listView" type="WinJS.UI.ListView"></param>
            Debug.assert(Jx.isInstanceOf(listView, WinJS.UI.ListView));
            Debug.assert(["single", "multi"].indexOf(selectionMode) !== -1);
            listView.selectionMode = selectionMode;
            listView.swipeBehavior = (selectionMode === "multi") ? "select" : "none";

            if (selectionMode === "single") {
                // We would like the arrow keys to change selection in single select mode.
                // need to hook keyboardnavigating to change selection
                listView.addEventListener("keyboardnavigating", ListViewHelper._onKeyboardNavigating, false);
            } else if (selectionMode === "multi") {
                // It is safe to unhook DOM listeners even without hooking it before.
                listView.removeEventListener("keyboardnavigating", ListViewHelper._onKeyboardNavigating, false);
            }
        }
    };

});
