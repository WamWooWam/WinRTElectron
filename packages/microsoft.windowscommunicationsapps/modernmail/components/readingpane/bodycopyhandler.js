
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail, Debug, Jx, ModernCanvas, Windows, Jx */
/*jshint browser:true*/

Jx.delayDefine(Mail, "BodyCopyHandler", function () {
    "use strict";

    var BodyCopyHandler = Mail.BodyCopyHandler = function (message, element) {
        /// <param name="message" type="Mail.UIDataModel.MailMessage"></param>
        /// <param name="element" type="HTMLElement" />
        this._message = message;
        this._element = element;

        this._disposer = new Mail.Disposer(
            new Mail.EventHook(element, "contextmenu", this._onContextMenu, this, true),
            new Mail.EventHook(element, "copy", this._onCopy, this, true)
        );
    };
    
    // Get method to allow unit tests to override clipboard
    BodyCopyHandler._getClipboard = function () {
        return Windows.ApplicationModel.DataTransfer.Clipboard;
    };

    BodyCopyHandler.prototype = {
        dispose: function () {
            this._disposer.dispose();
            this._message = null;
        },
        _onContextMenu: function (e) {
            /// <param name="e" type="Event" />
            Debug.assert(Jx.isInstanceOf(this._message, Mail.UIDataModel.MailMessage));
            if (this._message.irmCanExtractContent) {
                Mail.BodyLinkFlyout.onContextMenu(e);
            }
        },
        _onCopy: function (e) {
            /// <param name="e" type="Event" />

            Mail.writeProfilerMark("BodyCopyHandler._onCopy", Mail.LogEvent.start);

            var clipboardContent = ModernCanvas.Component.prototype.createDataPackageFromSelection(this._element.ownerDocument);

            // clipboardContent can be null if there was no selection
            if (clipboardContent) {
                try {
                    // Set the new clipboard content
                    var clipboard = BodyCopyHandler._getClipboard();
                    clipboard.setContent(clipboardContent);
                } catch (ex) {
                    // Exceptions from clipboard operations can happen if user Alt-tabs away from the app while it is still working on them.
                    Jx.log.info("Copy failed " + ex.toString());
                }
            }

            // Prevent default behavior running normal copy.
            e.preventDefault();

            Mail.writeProfilerMark("BodyCopyHandler._onCopy", Mail.LogEvent.stop);
        }
    };
});
