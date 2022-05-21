
//
// Copyright (C) Microsoft. All rights reserved.
//

/*global Jx,Calendar,Debug,Microsoft*/

Jx.delayDefine(Calendar.Controls, "ErrorMessageMessageBarPresenter", function () {

    var ErrorMessageMessageBarPresenter = Calendar.Controls.ErrorMessageMessageBarPresenter = function() {
    };

    var proto = ErrorMessageMessageBarPresenter.prototype;

    proto._mb = null;
    proto._className = null;
    proto._cm = null;
    proto._collection = null;
    proto._frame = null;

    proto.init = function(messageBar, platform, frame, className) {
        /// <summary>
        /// ErrorMessageMessageBarPresenter init
        /// </summary>
        /// <param name="messageBar" type="Chat.MessageBar">
        /// MessageBar where this presenter will add/remove messages
        /// </param>
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.IClient">
        /// IClient for the application
        /// </param>
        /// <param name="calendar" type="Calendar.Views.Frame">
        /// Main Calendar Frame
        /// </param>
        /// <param name="className" type="string">
        /// Css class name to be passed to the messagebar
        /// </param>
        Debug.assert(Jx.isObject(messageBar));
        Debug.assert(Jx.isObject(platform));
        Debug.assert(Jx.isNonEmptyString(className));

        this._mb = messageBar;
        this._cm = platform.calendarManager;
        this._className = className;
        this._frame = frame;

        this._collection = this._cm.getCalendarErrors();

        this._collectionChanged = this._collectionChanged.bind(this);

        var count = this._collection.count;

        for (var i = 0; i < count; i ++) {
            var object = this._collection.item(i);

            if (object) {
                this._handleError(object.objectId);
            }
        }

        this._collection.addEventListener("collectionchanged", this._collectionChanged);
        this._collection.unlock();
    };

    proto.shutdown = function() {
        if (this._collection) {
            this._collection.removeEventListener("collectionchanged", this._collectionChanged);
            this._collection.dispose();
            this._collection = null;
        }
    };

    proto._collectionChanged = function (ev) {
        if (ev.eType == Microsoft.WindowsLive.Platform.CollectionChangeType.itemAdded &&
            ev.objectId) {
            this._handleError(ev.objectId);
        }
    };

    proto._handleError = function(objectId) {
        var message = this._cm.getCalendarError(objectId);

        if (message) {
            
            var options = {
                messageHTML: message.message,
                button2: {
                    text: Jx.res.getString("/messagebar/messageBarCloseText"),
                    tooltip: Jx.res.getString("/messagebar/messageBarCloseTooltip"),
                    callback: this._closeClicked.bind(this)
                },
                cssClass: this._className
            };

            var handle = message.eventHandle;
            if (handle) {

                var event = null;
                try {
                    event = this._cm.getEventFromHandle(handle);
                } catch (e) {
                    // getEventFromHandle only throws if the handle is an invalid format
                    Debug.only(Jx.log.exception("ErrorMessageMessageBarPresenter._handleError: Invalid Handle (" + handle + ")", e));
                    event = null;
                }

                if (event) {
                    options.button1 = {
                        text: Jx.res.getString("/messagebar/messageBarOpenEvent"),
                        tooltip: Jx.res.getString("/messagebar/messageBarOpenEvent"),
                        callback: this._openEventClicked.bind(this)
                    };
                }
            }

            this._mb.addErrorMessage(objectId, message.priority, options);
        }
    };

    proto._closeClicked = function (target, id) {
        // Remove the message with the given id
        this._mb.removeMessage(id);

        // Retrieve the error message
        var message = this._cm.getCalendarError(id);

        // Delete the error message
        if (message) {
            message.deleteObject();
        }
    };

    proto._openEventClicked = function (target, id) {

        // Retrieve the error message
        var message = this._cm.getCalendarError(id),
            showError = true;

        if (message) {
            var handle = message.eventHandle;

            if (handle) {

                var event = null;
                
                try {
                    event = this._cm.getEventFromHandle(handle);
                } catch (e) {
                    // getEventFromHandle only throws if the handle is an invalid format
                    Debug.only(Jx.log.exception("ErrorMessageMessageBarPresenter._openEventClicked: Invalid Handle (" + handle + ")", e));
                    event = null;
                }

                if (event) {
                        
                    // Remove the message with the given id
                    this._mb.removeMessage(id);

                    // Delete the error message
                    message.deleteObject();

                    // Navigate to event details
                    this._frame.fire("editEvent", {event: event, dirty: true});

                    showError = false;
                }
            }    
        }

        if (showError) {
            
            // Show the flyout indicating we can't open the event in question
            Calendar.Helpers.showCantOpenEvent(this._mb.getButton1());
        }
    };
});
