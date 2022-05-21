
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx, Mail, Debug*/
Jx.delayDefine(Mail, "KeyboardDismisser", function () {
    "use strict";

    var KeyboardDismisser = Mail.KeyboardDismisser = function (el, selection) {
        /// <summary>
        /// Listens to the click event of an element in order to juggle focus 
        /// and put down they IHM keyboard.
        /// </summary>
        /// <param name="el" type="HTMLElement">HTML Element to register the click event listener to</param>
        /// <param name="selection" type="Object" optional="True">Selection object to be used</param>
        Debug.assert(Jx.isHTMLElement(el));
        this._clickHook = new Mail.EventHook(el, "click", this._hideKeyboard, this);
        this._job = null;
        this._selection = selection;
    };

    KeyboardDismisser.prototype = {
        dispose: function () {
            Jx.dispose(this._clickHook);
            Jx.dispose(this._job);
            this._clickHook = null;
            this._job = null;
        },
        _hideKeyboard: function (ev) {
            /// <summary>
            /// Fixup for Blue: 477458 and Blue 326827. When selecting a draft in the message list, if that draft is already open, the IHM keyboard
            /// will not be dismissed. To fix this, juggle focus to the CompApp.rootElement and the back to the original active element.
            /// This only applies on touch events.
            /// </summary>
            /// <param name="ev" type="Event"></param>
            Debug.assert(ev);

            if (ev.pointerType === "touch") {
                var override = !this._selection,
                    selectedMessage = override ? null : this._selection.message;

                if (override || (selectedMessage && selectedMessage.isDraft)) {
                    // Stop any previous job
                    Jx.dispose(this._job);

                    this._job = Jx.scheduler.addJob(null, Mail.Priority.hideKeyboard, "Hide IHM keyboard", function () {
                        var activeElement = document.activeElement,
                            compRoot = document.getElementById(Mail.CompApp.rootElementId);

                        if (compRoot && activeElement) {
                            Mail.setActiveHTMLElement(compRoot);

                            this._job = new Jx.Immediate(function () {
                                // Double check that the active element is the one we expect, just in case 
                                // focus changed inbetween the jobs
                                if (document.activeElement === compRoot) {
                                    Mail.setActiveHTMLElement(activeElement);
                                }
                            });
                        }
                    }, this);
                }
            }
        }
    };
});