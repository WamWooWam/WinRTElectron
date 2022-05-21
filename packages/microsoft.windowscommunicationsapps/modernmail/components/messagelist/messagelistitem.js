
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,WinJS,People,Microsoft*/

Jx.delayDefine(Mail, "MessageListItem", function () {
    "use strict";

    var P = Microsoft.WindowsLive.Platform;

    var conversationHeader = "convHeader",
        conversationChild = "convChild",
        unthreadedMessage = "unthreadedMsg";

    var MLItem = Mail.MessageListItem = function (itemNode, selectionHandler, selection, isThreadingMode) {
        Debug.assert(Jx.isInstanceOf(itemNode, Mail.MessageListTreeNode));
        Debug.assert(Jx.isInstanceOf(itemNode.data, Mail.UIDataModel.MailItem));
        Debug.assert(Jx.isInstanceOf(selectionHandler, Mail.SelectionHandler));
        Debug.assert(Jx.isInstanceOf(selection, Mail.Selection));
        Debug.assert(Jx.isBoolean(isThreadingMode));
        this._node = itemNode;
        this._item = itemNode.data;
        this._selection = selection;
        this._isThreadingMode = isThreadingMode;
        this._element = null;
        this._checkBox = null;
        this._identityControls = [];
        this._onItemCommandControl = null;
        this._renderIncomplete = false;
        this._toBeRemoved = false;
        this._updateAriaJob = null;
        this._renderFullJob = null;
        this._listViewPromise = null;
        this._selectionHandler = selectionHandler;

        if (Jx.isInstanceOf(this._item, Mail.UIDataModel.MailConversation)) {
            Debug.assert(this._isThreadingMode);
            this._type = conversationHeader;
        } else {
            Debug.assert(Jx.isInstanceOf(this._item, Mail.UIDataModel.MailMessage));
            this._type = this._isThreadingMode ? conversationChild : unthreadedMessage;
        }

        initStrings();

        // Listen for changes on the message to update the UI as needed
        this._disposer = new Mail.Disposer();
        Debug.only(Object.seal(this));
    };

    Object.defineProperty(MLItem.prototype, "objectId", {
        get: function () {
            Debug.assert(Jx.isObject(this._item));
            return this._item.objectId;
        },
        enumerable: true
    });

    MLItem.prototype._alwaysRenderFrom = function () {
        Debug.assert(Jx.isObject(this._item));

        // Never render the "from" on outbound folders (it would always be yourself)
        // but if an inbound folder is selected, then we only want to render the "from" on non-drafts
        var folder = this._selection.view.folder;
        return (folder && folder.isOutboundFolder) ? false : !this._item.isDraft;
    };

    MLItem.prototype._onDisposed = function () {
        var id = this.objectId;
        Mail.writeProfilerMark("MessageListItem_onDispose_" + id, Mail.LogEvent.start);
        Mail.MessageListItemFactory.resetItemById(id);
        Mail.writeProfilerMark("MessageListItem_onDispose_" + id, Mail.LogEvent.stop);
    };

    MLItem.prototype.getElement = function () {
        Mail.log("MessageListItem_getElement", Mail.LogEvent.start);
        if (!this._element) {
            this._element = document.createElement("div");
            this._element.className = "mailMessageListEntryContainer " + this._type;

            this._renderElement();
            this._disposer.add(new Mail.EventHook(this._item, "changed", this._itemChanged, this));
            this._listenForExpandCollapse();
        }

        this._disposer.add(new Mail.EventHook(this._node, "disposed", this._onDisposed, this));
        Mail.log("MessageListItem_getElement", Mail.LogEvent.stop);
        return this._element;
    };

    MLItem.prototype._renderElement = function () {
        Mail.writeProfilerMark("MessageListItem_renderElement", Mail.LogEvent.start);
        this._cleanupICs();
        Jx.dispose(this._onItemCommandControl);
        this._onItemCommandControl = null;

        var item = this._item, element = this._element,
            glyphs = this._getGlyphs(), draft = this._getDraftPrefix(),
            from = "", preview = "", label = "",
            checkbox = this._getCheckBoxDiv(),
            secondRowClass = "mailMessageListHeaderSecondRow";

        if (this._alwaysRenderFrom()) {
            from = this._getFieldDiv("From", "fastFromRecipientsString", "typeSize16pt");
        } else {
            from = this._getFieldDiv("From", "fastHeaderRecipientsString", "typeSize16pt");
        }
        if (this._type === conversationChild) {
            // Conversation children show the message preview text in the second line
            preview = this._getDiv("mailMessageListPreview typeSizeNormal", draft + "<span>" + this._item.previewHTML + "</span>");
        } else {
            // Everything else shows the subject
            preview = this._getDiv("mailMessageListSubject typeSizeNormal", draft + "<span>" + this._item.subjectHTML + "</span>");
        }

        var labelText = (this._type === conversationChild) ? Mail.ViewCustomizations.getLabel(item, this._selection.view) : null;
        if (labelText) {
            // Items not in this folder (e.g threading) show the source folder instead of the date
            label = this._getDiv("mailMessageListFolder typeSizeSmall", Jx.escapeHtml(labelText));
        } else {
            // Normally show the date in the bottom right corner
            label = this._getFieldDiv("Date", "bestDateShortString", "typeSizeSmall");
        }
        if (item.totalCount <= 1) {
            // Mark the element so the thread connector is hidden for single item conversations
            secondRowClass += " singleItemConversation";
        }

        // Make sure the read state is updated
        Jx.setClass(element, "unread", !item.read);

        // Make sure the expanded state is correct
        Jx.setClass(element, "mailMessageListConversationExpanded", this._node.expanded);

        Mail.writeProfilerMark("MessageListItem_setInnerHtml", Mail.LogEvent.start);
        element.innerHTML =
            from + "<div class='mailMessageListGlyphContainer typeSizeSmall'>" + glyphs + "</div>" +
                "<div class='mailMessageListItemCommandContainer typeSizeSmall'>" +
                "<div class='mailMessageListCommand commandMarkAsReadUnread hidden' aria-hidden='true'></div>" +
                "<div class='mailMessageListCommand commandDelete hidden' aria-hidden='true' title='" + strings.mailCommandDeleteOnItemTooltip + "'></div>" +
                "<div class='mailMessageListCommand commandFlag hidden' aria-hidden='true'></div>" +
                "</div>" +
            "<div class='" + secondRowClass + "'>" + label + preview + "</div>" + checkbox;
        Mail.writeProfilerMark("MessageListItem_setInnerHtml", Mail.LogEvent.stop);

        this._renderIncomplete = true;
        Mail.writeProfilerMark("MessageListItem_renderElement", Mail.LogEvent.stop);
    };

    var strings = {};
    var initStrings = function () {
        ["mailCommandDeleteOnItemTooltip", "mailMessageListDraftPrefix"].forEach(function (resId) {
            strings[resId] = Jx.escapeHtml(Jx.res.getString(resId));
        });
        initStrings = Jx.fnEmpty;
    };

    MLItem.prototype._getGlyphs = function () {
        /// <summary>Builds the full html for the glyphs that should be shown</summary>
        Mail.writeProfilerMark("MessageListItem_getGlyphs", Mail.LogEvent.start);
        var item = this._item,
            importance = item.importance,
            lastVerb = item.lastVerb;

        var glyphs = this._getGlyphDiv("graphic glyphIrm", item.irmHasTemplate);
        glyphs += this._getGlyphDiv("graphic glyphAttachment", item.hasOrdinaryAttachments);
        glyphs += this._getGlyphDiv("graphic glyphInvite", item.calendarInvite);
        glyphs += this._getGlyphDiv("graphic glyphLowPriority", importance === P.MailMessageImportance.low);
        glyphs += this._getGlyphDiv("graphic glyphHiPriority", importance === P.MailMessageImportance.high);
        glyphs += this._getGlyphDiv("graphic glyphReplied mirrorInRTL", lastVerb === P.MailMessageLastVerb.replyToSender ||
                                                                        lastVerb === P.MailMessageLastVerb.replyToAll);
        glyphs += this._getGlyphDiv("graphic glyphForwarded mirrorInRTL", lastVerb === P.MailMessageLastVerb.forward);
        glyphs += this._getGlyphDiv("graphic glyphFlag", item.flagged);

        if (this._type === conversationHeader) {
            // Display the count for conversation headers if needed
            var count = item.totalCount, countClass = "glyphCount";
            if (glyphs) {
                // Need to show the divider between the graphic glyphs and the count
                countClass += " glyphDivider";
            }
            glyphs += this._getGlyphDiv(countClass, count > 1, count > 99 ? "99+" : count);
        }

        Mail.writeProfilerMark("MessageListItem_getGlyphs", Mail.LogEvent.stop);
        return glyphs;
    };

    MLItem.prototype._getDraftPrefix = function () {
        return this._item.hasDraft ? this._getDiv("mailMessageListDraftPrefix typeSizeNormal", strings.mailMessageListDraftPrefix) : "";
    };

    MLItem.prototype._getFieldDiv = function (field, itemProp, font, /*@optional*/prefix) {
        /// <summary>Create HTML for a single field of a message</summary>
        Mail.writeProfilerMark("MessageListItem_getFieldDiv:" + field, Mail.LogEvent.start);
        var div = this._getDiv("mailMessageList" + field + " " + font, (prefix || "") + Jx.escapeHtml(this._item[itemProp]));
        Mail.writeProfilerMark("MessageListItem_getFieldDiv:" + field, Mail.LogEvent.stop);
        return div;
    };

    MLItem.prototype._getGlyphDiv = function (cls, show, /*@optional*/content) {
        /// <summary>Create HTML for a single glyph element</summary>
        return show ? this._getDiv("mailMessageListGlyph " + cls, content) : "";
    };

    MLItem.prototype._getDiv = function (cls, /*@optional*/content) {
        /// <summary>Helper for generating a div with class and content</summary>
        return "<div aria-hidden='true' class='" + cls + "'>" + (content ? content : "") + "</div>";
    };

    MLItem.prototype._getCheckBoxDiv = function () {
        /// <summary>Helper function that generates a div to host the on-item checkbox</summary>
        return "<div class='mailMessageListCheckBox' aria-hidden='true' role='checkbox' tabindex='-1'>" +
            "<div class='mailMessageListCheckBoxButton' aria-hidden='true' tabindex='-1'>" +
            "<span class='mailMessageListCheckBoxGlyph' aria-hidden='true' tabindex='-1'>\uE081</span>" +
            "</div>" +
            "</div>";
    };

    MLItem.prototype._cleanupICs = function () {
        Debug.assert(Jx.isArray(this._identityControls));
        this._identityControls.forEach(function (/*@type(People.IdentityControl)*/identityControl) { identityControl.shutdownUI(); });
        this._identityControls = [];
    };

    MLItem.prototype.markForCleanup = function () {
        Mail.writeProfilerMark("MessageListItem.markForCleanup", Mail.LogEvent.start);
        this._toBeRemoved = true;

        this._cancelPendingJobs();

        if (this._element) {
            this._element.classList.add("toBeRemoved");
        }
        Mail.writeProfilerMark("MessageListItem.markForCleanup", Mail.LogEvent.stop);
    };

    MLItem.prototype._cancelPendingJobs = function () {
        Jx.dispose(this._updateAriaJob);
        this._updateAriaJob = null;
        Jx.dispose(this._renderFullJob);
        this._renderFullJob = null;
    };

    MLItem.prototype.dispose = function () {
        Mail.writeProfilerMark("MessageListItem.dispose", Mail.LogEvent.start);

        Debug.assert(this._toBeRemoved);

        if (this._listViewPromise) {
            this._listViewPromise.cancel();
            this._listViewPromise = null;
        }

        this._cancelPendingJobs();

        this._cleanupICs();
        this._element = null;

        Jx.dispose(this._disposer);
        this._onItemCommandControl = null;
        this._item = null;
        this._node = null;
        this._selectionHandler = null;
        Mail.writeProfilerMark("MessageListItem.dispose", Mail.LogEvent.stop);
    };

    MLItem.prototype._renderRecipients = function () {
        Mail.writeProfilerMark("MessageListItem._renderRecipients", Mail.LogEvent.start);
        Debug.assert(Jx.isHTMLElement(this._element));

        var item = this._item,
            fromUI = this._element.querySelector(".mailMessageListFrom");
        Debug.assert(Jx.isHTMLElement(fromUI));
        var peopleList = this._alwaysRenderFrom() ? item.fromRecipientArray : item.headerRecipients;

        if (peopleList.length > 0) {
            this._cleanupICs();
            this._identityControls = peopleList.map(function (person) {
                return new People.IdentityControl(person, null, { interactive: false });
            });

            var identityControls = this._identityControls.map(function (/*@type(People.IdentityControl)*/identityControl) {
                return identityControl.getUI(People.IdentityElements.Name);
            }).join("; ");

            
            identityControls = Debug.MessageListItem.showObjectId ? (identityControls  + " (" + this._item.objectId + ")") : identityControls;
            
            fromUI.innerHTML = identityControls;
            this._identityControls.forEach(/*@bind(MLItem)*/function (/*@type(People.IdentityControl)*/identityControl) {
                identityControl.activateUI(this._element);
            }.bind(this));
        } else {
            fromUI.innerText = item.headerNoRecipientsString;
        }
        Mail.writeProfilerMark("MessageListItem._renderRecipients", Mail.LogEvent.stop);
    };

    MLItem.prototype._listenForExpandCollapse = function () {
        if (this._type === conversationHeader) {
            this._disposer.add(new Mail.EventHook(this._node, "toggleExpansion", this._onToggleExpansion, this));
        }
    };

    MLItem.prototype.finishUpdates = function () {
        if (this._toBeRemoved || !this._renderIncomplete || this._item.pendingRemoval) {
            return false;
        }
        Mail.log("MessageListItem_finishUpdates", Mail.LogEvent.start);
        Debug.assert(!this._toBeRemoved);
        Debug.assert(Jx.isHTMLElement(this._element));
        this._onItemCommandControl = this._disposer.add(new Mail.OnItemCommandControl(this._item, this._selection, this._element));
        this._renderRecipients();
        this._addAriaDescription();
        this._addOnItemCheckBoxHandler();
        this._renderIncomplete = false;
        Mail.log("MessageListItem_finishUpdates", Mail.LogEvent.stop);
        return true;
    };

    MLItem.prototype._addAriaDescription = function () {
        Mail.writeProfilerMark("MessageList_renderer_aria", Mail.LogEvent.start);
        Debug.assert(Jx.isInstanceOf(this._item, Mail.UIDataModel.MailItem));
        var description = Mail.MessageListItemAria.getDescription(this._item, this._type === conversationChild, this._selection.view);
        Mail.setAttribute(this._element, "aria-label", description);
        Jx.dispose(this._updateAriaJob);
        this._updateAriaJob = null;
        Mail.writeProfilerMark("MessageList_renderer_aria", Mail.LogEvent.stop);
    };

    MLItem.prototype._addOnItemCheckBoxHandler = function () {
        Mail.writeProfilerMark("MessageList_renderer_addOnItemCheckBoxHandler", Mail.LogEvent.start);
        this._checkBox = this._element.querySelector(".mailMessageListCheckBox");
        Debug.assert(Jx.isHTMLElement(this._checkBox));
        this._disposer.addMany(
            new Mail.EventHook(this._checkBox, "click", this._onCheckBoxClicked, this),
            new Mail.EventHook(this._checkBox, "contextmenu", this._onCheckBoxClicked, this),
            new Mail.EventHook(this._checkBox, "MSPointerDown", this._onCheckBoxPointerDown, this),
            new Mail.EventHook(this._element, "keydown", this._onCheckBoxKeyDown, this)
        );
        Mail.writeProfilerMark("MessageList_renderer_addOnItemCheckBoxHandler", Mail.LogEvent.stop);
    };

    MLItem.prototype._onCheckBoxKeyDown = function (evt) {
        if (this._toBeRemoved || this._selectionHandler.isSelectionMode) {
            // In selection mode, we will use the default select behavior for the space key
            return;
        }

        if (evt.keyCode === Jx.KeyCode.space) {
            // Override the default space behavior in the listView so that pressing the space key will not only 
            // select the item but also enter selection mode  
            this._selectionHandler.controller.onCheckBoxClicked(this._element, false /*shiftKey*/);
            evt.stopPropagation();
            evt.preventDefault();
        }
    };

    MLItem.prototype._onCheckBoxPointerDown = function (evt) {
        Debug.assert(Jx.isObject(evt));
        evt.stopPropagation();
    };

    MLItem.prototype._onCheckBoxClicked = function (evt) {
        if (this._toBeRemoved) {
            return;
        }
        this._selectionHandler.controller.onCheckBoxClicked(this._element, evt.shiftKey);
    };

    MLItem.prototype._onToggleExpansion = function (/*evt*/) {
        if (this._toBeRemoved) {
            return;
        }
        Debug.assert(this._type === conversationHeader);
        this._renderExpandCollapse();
    };

    function waitForComplete(listView) {
        Debug.assert(Jx.isInstanceOf(listView, WinJS.UI.ListView));
        if (listView.loadingState !== "complete") {
            return Mail.Promises.waitForEvent(listView, "loadingstatechanged", function () {
                return listView.loadingState === "complete";
            });
        }
        return WinJS.Promise.wrap();
    }

    MLItem.prototype._renderExpandCollapse = function () {
        Mail.writeProfilerMark("MessageListItem._expandConversation", Mail.LogEvent.start);
        Debug.assert(this._type === conversationHeader);
        Debug.assert(this._isThreadingMode);
        if (this._listViewPromise) {
            this._listViewPromise.cancel();
            this._listViewPromise = null;
        }

        Debug.assert(this._node.type === "conversation");
        if (!this._node.expanded) {
            this._element.classList.remove("mailMessageListConversationPendingExpansion");
            this._listViewPromise = waitForComplete(Mail.MessageListItemFactory.listView).then(
                function () {
                    Mail.writeProfilerMark("MessageListItem_conversationCollapsed");
                    this._listViewPromise = null;
                    this._element.classList.remove("mailMessageListConversationExpanded");
                }.bind(this)
            );
        } else {
            this._element.classList.add("mailMessageListConversationPendingExpansion");
            this._element.classList.add("mailMessageListConversationExpanded");
            this._listViewPromise = waitForComplete(Mail.MessageListItemFactory.listView).then(
                function () {
                    Mail.writeProfilerMark("MessageListItem_conversationExpanded");
                    this._listViewPromise = null;
                    this._element.classList.remove("mailMessageListConversationPendingExpansion");
                }.bind(this)
            );
        }
        Mail.writeProfilerMark("MessageListItem._expandConversation", Mail.LogEvent.stop);
    };

    // Property changes that cause us to re-render the message
    var msgProps = [ // non-glyph message properties
        "subject", "to", "toRecipients", "from", "fromRecipient", "receivedDate", "latestReceivedTime", "preview", "displayViewIds", "hasDraft", "hasNewsletterCategory", "hasSocialUpdateCategory"
    ],
        glyphProps = [ // glyph properties
        "flagged", "importance", "lastVerb", "hasOrdinaryAttachments", "irmHasTemplate", "calendarMessageType", "hasCalendarInvite", "totalCount"
    ];

    MLItem.prototype._itemChanged = function (evt) {
        ///<summary>Notify the list view that the message changed so it can be re-rendered</summary>
        if (this._toBeRemoved) {
            Debug.Mail.writeProfilerMark("MessageListItem._itemChanged - toBeRemoved, ignoring change");
            return;
        }
        if (this._renderFullJob !== null) {
            Debug.Mail.writeProfilerMark("MessageListItem._itemChanged - job already scheduled, ignoring change");
            // Bail early since we're already scheduled to rebuild the item from scratch
            return;
        }

        Debug.Mail.writeProfilerMark("MessageListItem._itemChanged", Mail.LogEvent.start);

        if (Mail.Validators.havePropertiesChanged(evt, msgProps)) {
            this._cancelPendingJobs();
            // Queue a full re-render of the entire element
            this._renderFullJob = Jx.scheduler.addJob(null,
                Mail.Priority.finishMessageListItem,
                "MessageListItem._renderFull",
                this._renderFull,
                this
            );
            // Bail early since we'll rebuild the item from scratch
            return;
        }

        var refreshAria = false;

        if (Mail.Validators.havePropertiesChanged(evt, glyphProps)) {
            // Need to re-render the glyph container
            this._element.querySelector(".mailMessageListGlyphContainer").innerHTML = this._getGlyphs();
            refreshAria = true;

            // Also need to update the thread connector if total count was one of the changes
            if (Mail.Validators.hasPropertyChanged(evt, "totalCount")) {
                var secondRow = this._element.querySelector(".mailMessageListHeaderSecondRow");
                Jx.setClass(secondRow, "singleItemConversation", this._item.totalCount <= 1);
            }
        }

        if (Mail.Validators.hasPropertyChanged(evt, "read")) {
            // Special for case for read state changing since we don't want to re-render the entire element
            Jx.setClass(this._element, "unread", !this._item.read);
            refreshAria = true;
        }

        if (this._onItemCommandControl) {
            this._onItemCommandControl.onItemChanged(evt);
        }

        // Make sure the aria description has been updated to reflect the changes to the message
        if (refreshAria && (this._updateAriaJob === null)) {
            this._updateAriaJob = Jx.scheduler.addJob(null,
                Mail.Priority.finishMessageListItem,
                "MessageListItem._addAriaDescription",
                this._addAriaDescription,
                this
            );
        }

        Debug.Mail.writeProfilerMark("MessageListItem._itemChanged", Mail.LogEvent.stop);
    };

    MLItem.prototype._renderFull = function () {
        if (!this._toBeRemoved) {
            this._renderElement();
            this.finishUpdates();
        }
        Debug.assert(Jx.isObject(this._renderFullJob), "MessageListITem._renderFull should only be called async");
        Jx.dispose(this._renderFullJob);
        this._renderFullJob = null;
    };

    
    Debug.MessageListItem = {};

    Object.defineProperty(Debug.MessageListItem, "showObjectId", {
        get: function () {
            var result = null;
            try {
                result  = JSON.parse(Mail.Globals.appSettings.getLocalSettings().container("messageListItem").get("showObjectId"));
            } catch (e) { }
            return Jx.isNullOrUndefined(result) ? false : result;
        },

        set : function (show) {
            /// <param name="logLevel" type="Number"></param>
            Debug.assert(Jx.isBoolean(show));
            Mail.Globals.appSettings.getLocalSettings().container("messageListItem").set("showObjectId", show);
        }
    });

    
});

