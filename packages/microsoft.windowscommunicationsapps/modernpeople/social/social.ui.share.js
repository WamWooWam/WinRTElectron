
//! Copyright (c) Microsoft Corporation. All rights reserved.

Jx.delayDefine(People.RecentActivity.UI.Share, ["ShareLayout", "ShareControl"], function () {

People.loadSocialModel();
People.loadSocialUICore();

$include("$(cssResources)/Social.css");



//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\..\..\Core\Events\EventArgs.js" />

People.RecentActivity.UI.Share.CanvasLinkInsertedEventArgs = function(sender, linkUrl) {
    /// <summary>
    ///     The event arguments for the <see cref="T:People.RecentActivity.UI.Share.CanvasLinkInsertedEventHandler" /> delegate.
    /// </summary>
    /// <param name="sender" type="Object">The sender.</param>
    /// <param name="linkUrl" type="String">The URL for the inserted link.</param>
    /// <field name="_linkUrl$1" type="String">The URL for the inserted link.</field>
    People.RecentActivity.EventArgs.call(this, sender);
    this._linkUrl$1 = linkUrl;
};

Jx.inherit(People.RecentActivity.UI.Share.CanvasLinkInsertedEventArgs, People.RecentActivity.EventArgs);


People.RecentActivity.UI.Share.CanvasLinkInsertedEventArgs.prototype._linkUrl$1 = null;

Object.defineProperty(People.RecentActivity.UI.Share.CanvasLinkInsertedEventArgs.prototype, "linkUrl", {
    get: function() {
        /// <summary>
        ///     Gets the URL for the inserted link.
        /// </summary>
        /// <value type="String"></value>
        return this._linkUrl$1;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\..\..\Core\Events\EventArgs.js" />

People.RecentActivity.UI.Share.CanvasFocusChangedEventArgs = function(sender, focusGained) {
    /// <summary>
    ///     Provides event arguments for the <see cref="T:People.RecentActivity.UI.Share.CanvasFocusChangedEventHandler" /> class.
    /// </summary>
    /// <param name="sender" type="Object">The sender object.</param>
    /// <param name="focusGained" type="Boolean">Whether focus is being gained or lost.</param>
    /// <field name="_focusGained$1" type="Boolean">True if focus has been gained by the canvas.</field>
    People.RecentActivity.EventArgs.call(this, sender);
    this._focusGained$1 = focusGained;
};

Jx.inherit(People.RecentActivity.UI.Share.CanvasFocusChangedEventArgs, People.RecentActivity.EventArgs);


People.RecentActivity.UI.Share.CanvasFocusChangedEventArgs.prototype._focusGained$1 = false;

Object.defineProperty(People.RecentActivity.UI.Share.CanvasFocusChangedEventArgs.prototype, "focusGained", {
    get: function() {
        /// <summary>
        ///     Gets the state of focus being gained or lost.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._focusGained$1;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />

People.RecentActivity.UI.Share.CharacterCountControl = function() {
    /// <summary>
    ///     Implements the character count control.
    /// </summary>
    /// <field name="_maxCharacterCount$1" type="Number" integer="true">The maximum number of characters.</field>
    /// <field name="_currentCharacterCount$1" type="Number" integer="true">The current character count.</field>
    /// <field name="_limitExceeded$1" type="Boolean">Whether the character count limit has been exceeded.</field>
    /// <field name="_valueControl$1" type="People.RecentActivity.UI.Core.Control">The control that holds the current character count.</field>
    /// <field name="_errorControl$1" type="People.RecentActivity.UI.Core.Control">The control that holds the error text.</field>
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareCharacterCount));
};

Jx.inherit(People.RecentActivity.UI.Share.CharacterCountControl, People.RecentActivity.UI.Core.Control);


People.RecentActivity.UI.Share.CharacterCountControl.prototype._maxCharacterCount$1 = 0;
People.RecentActivity.UI.Share.CharacterCountControl.prototype._currentCharacterCount$1 = 0;
People.RecentActivity.UI.Share.CharacterCountControl.prototype._limitExceeded$1 = false;
People.RecentActivity.UI.Share.CharacterCountControl.prototype._valueControl$1 = null;
People.RecentActivity.UI.Share.CharacterCountControl.prototype._errorControl$1 = null;

Object.defineProperty(People.RecentActivity.UI.Share.CharacterCountControl.prototype, "maxCharacterCount", {
    get: function() {
        /// <summary>
        ///     Gets or sets the maximum number of characters.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._maxCharacterCount$1;
    },
    set: function(value) {
        if (this._maxCharacterCount$1 !== value) {
            this._maxCharacterCount$1 = value;
            this._updateControl$1();
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Share.CharacterCountControl.prototype, "currentCharacterCount", {
    get: function() {
        /// <summary>
        ///     Gets or sets the current character count.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._currentCharacterCount$1;
    },
    set: function(value) {
        if (this._currentCharacterCount$1 !== value) {
            this._currentCharacterCount$1 = value;
            this._updateControl$1();
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Share.CharacterCountControl.prototype, "limitExceeded", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the character limit has been exceeded.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._limitExceeded$1;
    },
    set: function(value) {
        if (this._limitExceeded$1 !== value) {
            this._limitExceeded$1 = value;
            this.onPropertyChanged('LimitExceeded');
        }

    }
});

People.RecentActivity.UI.Share.CharacterCountControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    if (this._valueControl$1 != null) {
        this._valueControl$1.dispose();
        this._valueControl$1 = null;
    }

    if (this._errorControl$1 != null) {
        this._errorControl$1.dispose();
        this._errorControl$1 = null;
    }

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Share.CharacterCountControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
    this.label = Jx.res.getString('/strings/raShareCharacterCountLabel');
    this._valueControl$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-charactercount-value');
    this._valueControl$1.render();
    this._errorControl$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-charactercount-error');
    this._errorControl$1.render();
    this._errorControl$1.removeFromParent();
    this._updateControl$1();
};

People.RecentActivity.UI.Share.CharacterCountControl.prototype._updateControl$1 = function() {
    /// <summary>
    ///     Update the state of the control.
    /// </summary>
    if (!this.isRendered) {
        // Don't update if we haven't been rendered yet.
        return;
    }

    if (this._maxCharacterCount$1 < 1) {
        this._errorControl$1.text = '';
        this._errorControl$1.removeFromParent();
        this.limitExceeded = false;
        this.isVisible = false;
    }
    else {
        this.isVisible = true;
        this._valueControl$1.text = Jx.res.loadCompoundString('/strings/raShareCharacterCountValue', this._currentCharacterCount$1, this._maxCharacterCount$1);
        var errorMessage = '';
        if (this._currentCharacterCount$1 > this._maxCharacterCount$1) {
            this.limitExceeded = true;
            this.addClass('ra-shareCharacterCountLimitExceeded');
            errorMessage = Jx.res.getString('/strings/raShareCharacterCountExceeded');
        }
        else {
            this.limitExceeded = false;
            this.removeClass('ra-shareCharacterCountLimitExceeded');
            errorMessage = '';
        }

        if (errorMessage !== this._errorControl$1.text) {
            this._errorControl$1.removeFromParent();
            this._errorControl$1.text = errorMessage;
            if (Jx.isNonEmptyString(errorMessage)) {
                this.appendControl(this._errorControl$1);
            }        
        }    
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Platform\Configuration.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />

People.RecentActivity.UI.Share.LinkPreviewControl = function() {
    /// <summary>
    ///     Implements a link preview.
    /// </summary>
    /// <field name="_mode$1" type="People.RecentActivity.UI.Share.LinkPreviewControlMode">The current control mode.</field>
    /// <field name="_shareInfo$1" type="People.RecentActivity.Core.create_shareOperationInfo">The share info.</field>
    /// <field name="_linkData$1" type="Share.LinkData">The link data.</field>
    /// <field name="_authPromise$1" type="WinJS.Promise">The auth promise.</field>
    /// <field name="_linkPreviewSoxeCompleteHandler$1" type="Function">The handler for SOXE completion in the link preview.</field>
    /// <field name="_basicControl$1" type="People.RecentActivity.UI.Core.Control">The basic control.</field>
    /// <field name="_richControl$1" type="People.RecentActivity.UI.Core.Control">The rich control.</field>
    /// <field name="_linkPreviewControl$1" type="Share.Preview">The rich link preview control.</field>
    /// <field name="_previewAuthTokenRetrieved$1" type="Boolean">Whether the auth token has been retrieved.</field>
    /// <field name="_previewAuthToken$1" type="String">The auth token used for the preview control.</field>
    /// <field name="_richPreviewInitialized$1" type="Boolean">Whether the rich preview control has been initialized.</field>
    /// <field name="_loading$1" type="Boolean">Whether the preview control is currently loading data.</field>
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.sharePreview));
    $include('$(socialRoot)/Social.LinkPreview.js');
};

Jx.inherit(People.RecentActivity.UI.Share.LinkPreviewControl, People.RecentActivity.UI.Core.Control);


People.RecentActivity.UI.Share.LinkPreviewControl.prototype._mode$1 = 0;
People.RecentActivity.UI.Share.LinkPreviewControl.prototype._shareInfo$1 = null;
People.RecentActivity.UI.Share.LinkPreviewControl.prototype._linkData$1 = null;
People.RecentActivity.UI.Share.LinkPreviewControl.prototype._authPromise$1 = null;
People.RecentActivity.UI.Share.LinkPreviewControl.prototype._linkPreviewSoxeCompleteHandler$1 = null;
People.RecentActivity.UI.Share.LinkPreviewControl.prototype._basicControl$1 = null;
People.RecentActivity.UI.Share.LinkPreviewControl.prototype._richControl$1 = null;
People.RecentActivity.UI.Share.LinkPreviewControl.prototype._linkPreviewControl$1 = null;
People.RecentActivity.UI.Share.LinkPreviewControl.prototype._previewAuthTokenRetrieved$1 = false;
People.RecentActivity.UI.Share.LinkPreviewControl.prototype._previewAuthToken$1 = null;
People.RecentActivity.UI.Share.LinkPreviewControl.prototype._richPreviewInitialized$1 = false;
People.RecentActivity.UI.Share.LinkPreviewControl.prototype._loading$1 = false;

Object.defineProperty(People.RecentActivity.UI.Share.LinkPreviewControl.prototype, "mode", {
    get: function() {
        /// <summary>
        ///     Gets or sets the current mode.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Share.LinkPreviewControlMode"></value>
        return this._mode$1;
    },
    set: function(value) {
        if (this._mode$1 !== value) {
            this._mode$1 = value;
            this._onModeChanged$1();
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Share.LinkPreviewControl.prototype, "shareInfo", {
    get: function() {
        /// <summary>
        ///     Gets or sets the current share info.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_shareOperationInfo"></value>
        return this._shareInfo$1;
    },
    set: function(value) {
        if (this._shareInfo$1 !== value) {
            this._shareInfo$1 = value;
            this._onShareInfoChanged$1();
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Share.LinkPreviewControl.prototype, "linkData", {
    get: function() {
        /// <summary>
        ///     Gets the link data.
        /// </summary>
        /// <value type="Share.LinkData"></value>
        if (this._linkPreviewControl$1 != null) {
            this._linkData$1 = this._linkPreviewControl$1.getData();
        }

        return this._linkData$1;
    }
});

Object.defineProperty(People.RecentActivity.UI.Share.LinkPreviewControl.prototype, "loading", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the control is currently loading data.
        /// </summary>
        /// <value type="Boolean"></value>
        // If we aren't showing the rich mode, we don't care about loading.
        if (this._mode$1 === 2) {
            return this._loading$1;
        }

        return false;
    },
    set: function(value) {
        if (this._loading$1 !== value) {
            this._loading$1 = value;
            this.onPropertyChanged('Loading');
        }

    }
});

People.RecentActivity.UI.Share.LinkPreviewControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    this._disposeLinkPreview$1();
    if (this._authPromise$1 != null) {
        this._authPromise$1.cancel();
        this._authPromise$1 = null;
    }

    if (this._basicControl$1 != null) {
        this._basicControl$1.dispose();
        this._basicControl$1 = null;
    }

    if (this._richControl$1 != null) {
        this._richControl$1.dispose();
        this._richControl$1 = null;
    }

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Share.LinkPreviewControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
    // Render the basic control
    this._basicControl$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-link-preview-basic');
    this._basicControl$1.render();
    // Render the rich control
    this._richControl$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-link-preview-rich');
    this._richControl$1.render();
    this._renderInternal$1();
};

People.RecentActivity.UI.Share.LinkPreviewControl.prototype._disposeLinkPreview$1 = function() {
    /// <summary>
    ///     Dispose the link preview and remove it from the DOM.
    /// </summary>
    if (this._linkPreviewControl$1 != null) {
        this._linkPreviewControl$1.shutdownUI();
        this._linkPreviewControl$1.shutdownComponent();
        if (this._linkPreviewSoxeCompleteHandler$1 != null) {
            this._linkPreviewControl$1.removeListener('soxeComplete', this._linkPreviewSoxeCompleteHandler$1);
            this._linkPreviewSoxeCompleteHandler$1 = null;
        }

        this._linkPreviewControl$1 = null;
    }

    this._richPreviewInitialized$1 = false;
    this._richControl$1.element.innerHTML = '';
};

People.RecentActivity.UI.Share.LinkPreviewControl.prototype._renderInternal$1 = function() {
    /// <summary>
    ///     Render the internal control components.
    /// </summary>
    this._showOrHideViews$1();
    this._disposeLinkPreview$1();
    if (this._shareInfo$1 != null) {
        this._basicControl$1.text = this._linkData$1.url;
        this._linkPreviewControl$1 = new Share.Preview(this._linkData$1, People.RecentActivity.Platform.Configuration.instance.soxeEndpointUrl);
        this._linkPreviewControl$1.initUI(this._richControl$1.element);
        Jx.res.processAll(this._richControl$1.element);
        this._linkPreviewSoxeCompleteHandler$1 = this._onLinkPreviewControlSoxeComplete$1.bind(this);
        this._linkPreviewControl$1.addListener('soxeComplete', this._linkPreviewSoxeCompleteHandler$1);
        this._showOrHideViews$1();
        this._retrieveAuthTokenAsync$1();
    }
};

People.RecentActivity.UI.Share.LinkPreviewControl.prototype._showOrHideViews$1 = function() {
    /// <summary>
    ///     Shows or hides the possible views.
    /// </summary>
    if (!this.isRendered) {
        // Don't update if we haven't been rendered yet.
        return;
    }

    this._basicControl$1.isVisible = false;
    if (this._linkPreviewControl$1 != null) {
        this._linkPreviewControl$1.hide();
    }

    this._richControl$1.isVisible = false;
    if (this._shareInfo$1 != null) {
        if (this._mode$1 === 2) {
            this._richControl$1.isVisible = true;
            if (this._linkPreviewControl$1 != null) {
                this._linkPreviewControl$1.show();
                this._tryLoadRichPreview$1();
            }

        }
        else if (this._mode$1 === 1) {
            this._basicControl$1.isVisible = true;
        }    
    }
};

People.RecentActivity.UI.Share.LinkPreviewControl.prototype._retrieveAuthTokenAsync$1 = function() {
    /// <summary>
    ///     Start the process to retrieve the auth token for the SOXE control.
    /// </summary>
    var authenticator = new Windows.Security.Authentication.OnlineId.OnlineIdAuthenticator();
    var target = new Windows.Security.Authentication.OnlineId.OnlineIdServiceTicketRequest(People.RecentActivity.Platform.Configuration.instance.soxeTarget, People.RecentActivity.Platform.Configuration.instance.soxePolicy);
    this._authPromise$1 = authenticator.authenticateUserAsync([ target ], Windows.Security.Authentication.OnlineId.CredentialPromptType.doNotPrompt);
    this._authPromise$1.done(this._onAuthTokenRetrieved$1.bind(this), this._onAuthTokenRetrieved$1.bind(this));
};

People.RecentActivity.UI.Share.LinkPreviewControl.prototype._onModeChanged$1 = function() {
    /// <summary>
    ///     Handles mode changes for the control.
    /// </summary>
    this._showOrHideViews$1();
};

People.RecentActivity.UI.Share.LinkPreviewControl.prototype._tryLoadRichPreview$1 = function() {
    /// <summary>
    ///     Attempts to load the rich preview if it is currently visible.
    /// </summary>
    if (!this._richPreviewInitialized$1 && this._previewAuthTokenRetrieved$1 && this._richControl$1.isVisible && this._linkPreviewControl$1 != null) {
        // Make sure we only do this once.
        this._richPreviewInitialized$1 = true;
        // Start loading the control.
        this.loading = true;
        this._linkPreviewControl$1.setAuth(this._previewAuthToken$1);
    }
};

People.RecentActivity.UI.Share.LinkPreviewControl.prototype._onShareInfoChanged$1 = function() {
    /// <summary>
    ///     Handles changes to the shareInfo object.
    /// </summary>
    if (this._shareInfo$1 != null) {
        Debug.assert(this._shareInfo$1.dataFormat === Windows.ApplicationModel.DataTransfer.StandardDataFormats.uri, 'shareInfo.DataFormat is invalid.');
        Debug.assert(this._shareInfo$1.data != null, 'shareInfo.Data is null.');
        this._linkData$1 = new Share.LinkData();
        this._linkData$1.tryInitialize(this._shareInfo$1.data, this._shareInfo$1.dataView);
    }
    else {
        this._linkData$1 = null;
    }

    if (this.isRendered && !this.isDisposed) {
        this._renderInternal$1();
    }
};

People.RecentActivity.UI.Share.LinkPreviewControl.prototype._onAuthTokenRetrieved$1 = function(value) {
    /// <summary>
    ///     Handles the success and error cases for the auth token retrieval.
    /// </summary>
    /// <param name="value" type="Object">The result of the operation.</param>
    /// <returns type="WinJS.Promise"></returns>
    if (this.isDisposed) {
        return null;
    }

    var identity = value;
    var rpsToken = null;
    if (identity != null && identity.tickets != null) {
        var soxeTarget = People.RecentActivity.Platform.Configuration.instance.soxeTarget.toUpperCase();
        var soxePolicy = People.RecentActivity.Platform.Configuration.instance.soxePolicy.toUpperCase();
        for (var n = 0; n < identity.tickets.length; n++) {
            var ticket = identity.tickets[n];
            var target = ticket.request;
            // check to see if this is the target+policy that we requested.
            if ((target.service.toUpperCase() === soxeTarget) && (target.policy.toUpperCase() === soxePolicy)) {
                rpsToken = ticket.value;
                break;
            }        
        }    
    }

    if (Jx.isNonEmptyString(rpsToken)) {
        if (rpsToken.substr(0, 2) === 't=') {
            // chop off the start key-value-pair indicator. note that we don't use replace() because that could 
            // invalidate the ticket in cases where the ticket ends in something like "foobart==" (tickets are 
            // just B64 encoded) if the start parameter isn't there.
            rpsToken = rpsToken.substr(2);
        }

    }
    else {
        Jx.log.write(2, 'LinkPreviewControl.OnAuthTokenRetrieved: No valid RPS tokens found.');
    }

    this._previewAuthTokenRetrieved$1 = true;
    this._previewAuthToken$1 = rpsToken;
    this._tryLoadRichPreview$1();
    return null;
};

People.RecentActivity.UI.Share.LinkPreviewControl.prototype._onLinkPreviewControlSoxeComplete$1 = function() {
    /// <summary>
    ///     Handles the Preview control's "soxeComplete" event.
    /// </summary>
    this.loading = false;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Model\Network.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />

People.RecentActivity.UI.Share.NetworkSelectorItemControl = function(network) {
    /// <summary>
    ///     Implements a network selector item.
    /// </summary>
    /// <param name="network" type="People.RecentActivity.Network">The network to display.</param>
    /// <field name="_network$1" type="People.RecentActivity.Network">The collection of networks.</field>
    /// <field name="_icon$1" type="People.RecentActivity.UI.Core.Control">The network icon.</field>
    /// <field name="_name$1" type="People.RecentActivity.UI.Core.Control">The network name.</field>
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareNetworkSelectItem));
    Debug.assert(network != null, 'network must not be null.');
    this._network$1 = network;
};

Jx.inherit(People.RecentActivity.UI.Share.NetworkSelectorItemControl, People.RecentActivity.UI.Core.Control);


People.RecentActivity.UI.Share.NetworkSelectorItemControl.prototype._network$1 = null;
People.RecentActivity.UI.Share.NetworkSelectorItemControl.prototype._icon$1 = null;
People.RecentActivity.UI.Share.NetworkSelectorItemControl.prototype._name$1 = null;

Object.defineProperty(People.RecentActivity.UI.Share.NetworkSelectorItemControl.prototype, "network", {
    get: function() {
        /// <summary>
        ///     Gets the network attached to the control.
        /// </summary>
        /// <value type="People.RecentActivity.Network"></value>
        return this._network$1;
    }
});

People.RecentActivity.UI.Share.NetworkSelectorItemControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    if (this._icon$1 != null) {
        this._icon$1.dispose();
        this._icon$1 = null;
    }

    if (this._name$1 != null) {
        this._name$1.dispose();
        this._name$1 = null;
    }

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Share.NetworkSelectorItemControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
    this._icon$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-networkselect-item-icon-image');
    var image = this._icon$1.element;
    image.src = this._network$1.icon;
    this._name$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-networkselect-item-name');
    this._name$1.id = this._name$1.uniqueId;
    this._name$1.text = this._network$1.name;
    this.labelledBy = this._name$1.id;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />

People.RecentActivity.UI.Share.SendButtonControl = function() {
    /// <summary>
    ///     Implements a send button.
    /// </summary>
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareSendButton));
};

Jx.inherit(People.RecentActivity.UI.Share.SendButtonControl, People.RecentActivity.UI.Core.Control);

Debug.Events.define(People.RecentActivity.UI.Share.SendButtonControl.prototype, "clicked");
People.RecentActivity.UI.Share.SendButtonControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
    People.Animation.addTapAnimation(this.element);
    this.title = Jx.res.getString('/strings/raShareSendButtonTitle');
    this.attach('click', this._onButtonClicked$1.bind(this));
};

People.RecentActivity.UI.Share.SendButtonControl.prototype._onClicked$1 = function() {
    /// <summary>
    ///     Raises the clicked event.
    /// </summary>
    this.raiseEvent("clicked");
};

People.RecentActivity.UI.Share.SendButtonControl.prototype._onButtonClicked$1 = function(e) {
    /// <summary>
    ///     Handles the button click.
    /// </summary>
    /// <param name="e" type="Event">The event arguments.</param>
    this._onClicked$1();
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Imports\ModernCanvasOptions.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\Events\CanvasFocusChangedEventArgs.js" />
/// <reference path="..\Events\CanvasLinkInsertedEventArgs.js" />

People.RecentActivity.UI.Share.CanvasControl = function() {
    /// <summary>
    ///     Implements a modern canvas.
    /// </summary>
    /// <field name="_characterCountEventName$1" type="String" static="true">The name of the canvas event for character count changes.</field>
    /// <field name="_domNodeInsertedEventName$1" type="String" static="true">The name of the canvas event for DOM node insertion.</field>
    /// <field name="_onFocusEventName$1" type="String" static="true">The name of the canvas event for focus being set.</field>
    /// <field name="_onBlurEventName$1" type="String" static="true">The name of the canvas event for focus being lost.</field>
    /// <field name="_characterCount$1" type="Number" integer="true">The current character count.</field>
    /// <field name="_cueText$1" type="String">The cue text for the canvas. <c>null</c> signifies to use the default.</field>
    /// <field name="_canvas$1" type="ModernCanvas">The underlying ModernCanvas.</field>
    /// <field name="_characterCountHandler$1" type="System.Action`1">The handler for character count changes.</field>
    /// <field name="_domNodeInsertedHandler$1" type="Function">The handler for DOM node insertions.</field>
    /// <field name="_onFocusHandler$1" type="Function">The handler for gaining focus.</field>
    /// <field name="_onBlurHandler$1" type="Function">The handler for loss of focus.</field>
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareCanvas));
    $include('$(socialRoot)/Social.Canvas.js');
};

Jx.inherit(People.RecentActivity.UI.Share.CanvasControl, People.RecentActivity.UI.Core.Control);

Debug.Events.define(People.RecentActivity.UI.Share.CanvasControl.prototype, "linkinserted", "focuschanged");

People.RecentActivity.UI.Share.CanvasControl._characterCountEventName$1 = 'charactercountchanged';
People.RecentActivity.UI.Share.CanvasControl._domNodeInsertedEventName$1 = 'DOMNodeInserted';
People.RecentActivity.UI.Share.CanvasControl._onFocusEventName$1 = 'focus';
People.RecentActivity.UI.Share.CanvasControl._onBlurEventName$1 = 'blur';
People.RecentActivity.UI.Share.CanvasControl.prototype._characterCount$1 = 0;
People.RecentActivity.UI.Share.CanvasControl.prototype._cueText$1 = null;
People.RecentActivity.UI.Share.CanvasControl.prototype._canvas$1 = null;
People.RecentActivity.UI.Share.CanvasControl.prototype._characterCountHandler$1 = null;
People.RecentActivity.UI.Share.CanvasControl.prototype._domNodeInsertedHandler$1 = null;
People.RecentActivity.UI.Share.CanvasControl.prototype._onFocusHandler$1 = null;
People.RecentActivity.UI.Share.CanvasControl.prototype._onBlurHandler$1 = null;

Object.defineProperty(People.RecentActivity.UI.Share.CanvasControl.prototype, "characterCount", {
    get: function() {
        /// <summary>
        ///     Gets the current character count.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._characterCount$1;
    },
    set: function(value) {
        if (this._characterCount$1 !== value) {
            this._characterCount$1 = value;
            this.onPropertyChanged('CharacterCount');
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Share.CanvasControl.prototype, "textContent", {
    get: function() {
        /// <summary>
        ///     Gets the current text from the control.
        /// </summary>
        /// <value type="String"></value>
        var text = ModernCanvas.ContentFormat.text;
        return (this._canvas$1 != null) ? this._canvas$1.getContent([text])[text] : '';
    },
    set: function(value) {
        this._canvas$1.addContent(value, ModernCanvas.ContentFormat.text, ModernCanvas.ContentLocation.all, true, null);
    }
});

Object.defineProperty(People.RecentActivity.UI.Share.CanvasControl.prototype, "cueText", {
    get: function() {
        /// <summary>
        ///     Gets or sets the cue text for the canvas. <c>null</c> signifies to use the default.
        /// </summary>
        /// <value type="String"></value>
        return this._cueText$1;
    },
    set: function(value) {
        if (this._cueText$1 !== value) {
            this._cueText$1 = value;
            this._updateCueText$1();
        }

    }
});

People.RecentActivity.UI.Share.CanvasControl.prototype.clear = function() {
    /// <summary>
    ///     Clear the content of the canvas.
    /// </summary>
    if (this._canvas$1 != null) {
        this._canvas$1.clearContent();
        this._canvas$1.clearUndoRedo();
    }
};

People.RecentActivity.UI.Share.CanvasControl.prototype.focus = function() {
    /// <summary>
    ///     Places focus in the canvas.
    /// </summary>
    if (this._canvas$1 != null) {
        this._canvas$1.focus();
    }
};

People.RecentActivity.UI.Share.CanvasControl.prototype.setSelection = function (toStart) {
    /// <summary>
    ///     Moves the canvas selection based on the parameter.
    /// </summary>
    /// <param name="toStart" type="Boolean">Whether to place at the start, false places at the end.</param>
    var range = this._canvas$1.getDocument().createRange();
    range.selectNodeContents(this._canvas$1.getCanvasElement());
    range.collapse(toStart);
    this._canvas$1.replaceSelection(range);
};

People.RecentActivity.UI.Share.CanvasControl.prototype.scrollSelectionIntoView = function () {
    /// <summary>
    ///     Scrolls the current selection into view.
    /// </summary>
    this._canvas$1.scrollSelectionIntoView();
};

People.RecentActivity.UI.Share.CanvasControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    if (this._canvas$1 != null) {
        if (this._domNodeInsertedHandler$1 != null) {
            this._canvas$1.removeEventListener('DOMNodeInserted', this._domNodeInsertedHandler$1, false);
            this._domNodeInsertedHandler$1 = null;
        }

        if (this._onFocusHandler$1 != null) {
            this._canvas$1.removeEventListener('focus', this._onFocusHandler$1, false);
            this._onFocusHandler$1 = null;
        }

        if (this._onBlurHandler$1 != null) {
            this._canvas$1.removeEventListener('blur', this._onBlurHandler$1, false);
            this._onBlurHandler$1 = null;
        }

        if (this._characterCountHandler$1 != null) {
            this._canvas$1.removeListener('charactercountchanged', this._characterCountHandler$1, this);
            this._characterCountHandler$1 = null;
        }

        this._canvas$1.dispose();
        this._canvas$1 = null;
    }

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Share.CanvasControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    var that = this;
    
    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
    this.label = Jx.res.getString('/strings/raShareCanvasLabel');
    var options = People.RecentActivity.Imports.create_modernCanvasOptions();
    options.className = 'people';
    return ModernCanvas.createCanvasAsync(this.element, options).then(function(canvas) {
        if (that.isDisposed) {
            return null;
        }

        that._canvas$1 = canvas;
        that._updateCueText$1();
        // Hook up the character count event.
        that._characterCountHandler$1 = that._onCharacterCountChanged$1.bind(that);
        that._canvas$1.addListener('charactercountchanged', that._characterCountHandler$1, that);
        that._domNodeInsertedHandler$1 = that._onDomNodeInserted$1.bind(that);
        that._canvas$1.addEventListener('DOMNodeInserted', that._domNodeInsertedHandler$1, false);
        that._onFocusHandler$1 = that._onFocus$1.bind(that);
        that._canvas$1.addEventListener('focus', that._onFocusHandler$1, false);
        that._onBlurHandler$1 = that._onBlur$1.bind(that);
        that._canvas$1.addEventListener('blur', that._onBlurHandler$1, false);
        return null;
    });
};

People.RecentActivity.UI.Share.CanvasControl.prototype._updateCueText$1 = function() {
    /// <summary>
    ///     Update the cue text.
    /// </summary>
    if (this._canvas$1 != null) {
        if (this._cueText$1 != null) {
            this._canvas$1.setCueText(this._cueText$1);
        }
        else {
            this._canvas$1.setCueText(Jx.res.getString('/strings/raShareCanvasCueText'));
        }    
    }
};

People.RecentActivity.UI.Share.CanvasControl.prototype._onCharacterCountChanged$1 = function(e) {
    /// <summary>
    ///     Handles the ModernCanvas control's "charactercountchanged" event.
    /// </summary>
    /// <param name="e" type="ModernCanvas.CharacterCountChangedEventArgs">The event arguments.</param>
    Debug.assert(e != null, 'CharacterCountChanged event arguments must not be null.');
    Debug.assert(!Jx.isNullOrUndefined(e.characterCount) && (e.characterCount >= 0), 'CharacterCountChanged events must contain a valid character count.');
    this.characterCount = e.characterCount;
};

People.RecentActivity.UI.Share.CanvasControl.prototype._onDomNodeInserted$1 = function(e) {
    /// <summary>
    ///     Handles the ModernCanvas control's "DOMNodeInserted" event.
    /// </summary>
    /// <param name="e" type="Event">The event arguments.</param>
    // as per the DOM Level 1 specification, "The HTML DOM returns the tagName of an HTML element in 
    // the canonical uppercase form, regardless of the case in the source HTML document"
    if (e.target.tagName === 'A') {
        this._onLinkInserted$1(e.target.innerText);
    }
};

People.RecentActivity.UI.Share.CanvasControl.prototype._onFocus$1 = function(e) {
    /// <summary>
    ///     Handles the ModernCanvas control's "onfocus" event.
    /// </summary>
    /// <param name="e" type="Event">The event arguments.</param>
    this._onFocusChanged$1(true);
};

People.RecentActivity.UI.Share.CanvasControl.prototype._onBlur$1 = function(e) {
    /// <summary>
    ///     Handles the ModernCanvas control's "onblur" event.
    /// </summary>
    /// <param name="e" type="Event">The event arguments.</param>
    this._onFocusChanged$1(false);
};

People.RecentActivity.UI.Share.CanvasControl.prototype._onLinkInserted$1 = function(linkUrl) {
    /// <summary>
    ///     Raises the <see cref="E:People.RecentActivity.UI.Share.CanvasControl.LinkInserted" /> event.
    /// </summary>
    /// <param name="linkUrl" type="String">The link URL.</param>
    this.raiseEvent("linkinserted", new People.RecentActivity.UI.Share.CanvasLinkInsertedEventArgs(this, linkUrl));
};

People.RecentActivity.UI.Share.CanvasControl.prototype._onFocusChanged$1 = function(focusGained) {
    /// <summary>
    ///     Raises the <see cref="E:People.RecentActivity.UI.Share.CanvasControl.FocusChanged" /> event.
    /// </summary>
    /// <param name="focusGained" type="Boolean">True if focus is being gained, false if lost.</param>
    this.raiseEvent("focuschanged", new People.RecentActivity.UI.Share.CanvasFocusChangedEventArgs(this, focusGained));
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Model\Network.js" />
/// <reference path="..\..\..\Model\NetworkCollection.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\AriaHelper.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="NetworkSelectorItemControl.js" />

People.RecentActivity.UI.Share.NetworkSelectorControl = function(networks, defaultNetworkId) {
    /// <summary>
    ///     Implements a network selector.
    /// </summary>
    /// <param name="networks" type="People.RecentActivity.NetworkCollection">The collection of networks to display.</param>
    /// <param name="defaultNetworkId" type="String">The default network to select.</param>
    /// <field name="_networks$1" type="People.RecentActivity.NetworkCollection">The collection of networks.</field>
    /// <field name="_selectedNetwork$1" type="People.RecentActivity.Network">The currently selected network.</field>
    /// <field name="_currentIndex$1" type="Number" integer="true">The currently selected item index.</field>
    /// <field name="_expanded$1" type="Boolean">Whether the control is currently expanded.</field>
    /// <field name="_dismissedWithKeyboard$1" type="Boolean">Whether the control was dismissed via the keyboard.</field>
    /// <field name="_currentItemContainer$1" type="People.RecentActivity.UI.Core.Control">The container for the currently selected item.</field>
    /// <field name="_currentItem$1" type="People.RecentActivity.UI.Share.NetworkSelectorItemControl">The currently selected item control.</field>
    /// <field name="_focusItem$1" type="People.RecentActivity.UI.Share.NetworkSelectorItemControl">The currently focused item control.</field>
    /// <field name="_mouseDownItem$1" type="People.RecentActivity.UI.Share.NetworkSelectorItemControl">The item that most recently received the "mousedown" event.</field>
    /// <field name="_dropdownControl$1" type="People.RecentActivity.UI.Core.Control">The dropdown control.</field>
    /// <field name="_flyoutControl$1" type="People.RecentActivity.UI.Core.Control">The flyout control.</field>
    /// <field name="_flyout$1" type="WinJS.UI.Flyout">The WinJS Flyout object.</field>
    /// <field name="_itemList$1" type="Array">The list of items in the flyout.</field>
    /// <field name="_itemMap$1" type="Object">The map of network ID to list item in the flyout.</field>
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareNetworkSelect));
    Debug.assert(networks != null, 'networks must not be null.');
    this._networks$1 = networks;
    this._selectedNetwork$1 = this._networks$1.findById(defaultNetworkId);
    if (this._selectedNetwork$1 == null) {
        this._selectedNetwork$1 = this._networks$1.item(0);
    }

};

Jx.inherit(People.RecentActivity.UI.Share.NetworkSelectorControl, People.RecentActivity.UI.Core.Control);


People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._networks$1 = null;
People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._selectedNetwork$1 = null;
People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._currentIndex$1 = 0;
People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._expanded$1 = false;
People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._dismissedWithKeyboard$1 = false;
People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._currentItemContainer$1 = null;
People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._currentItem$1 = null;
People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._focusItem$1 = null;
People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._mouseDownItem$1 = null;
People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._dropdownControl$1 = null;
People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._flyoutControl$1 = null;
People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._flyout$1 = null;
People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._itemList$1 = null;
People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._itemMap$1 = null;

Object.defineProperty(People.RecentActivity.UI.Share.NetworkSelectorControl.prototype, "selectedNetwork", {
    get: function() {
        /// <summary>
        ///     Gets the currently selected network.
        /// </summary>
        /// <value type="People.RecentActivity.Network"></value>
        return this._selectedNetwork$1;
    },
    set: function(value) {
        if (this._selectedNetwork$1 !== value) {
            this._selectedNetwork$1 = value;
            this.onPropertyChanged('SelectedNetwork');
        }

    }
});

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    this._selectedNetwork$1 = null;
    this._mouseDownItem$1 = null;
    this._focusItem$1 = null;
    if (this._itemList$1 != null) {
        for (var n = 0; n < this._itemList$1.length; n++) {
            var item = this._itemList$1[n];
            item.dispose();
        }

        this._itemList$1.length = 0;
        this._itemList$1 = null;
    }

    if (this._itemMap$1 != null) {
        People.Social.clearKeys(this._itemMap$1);
        this._itemMap$1 = null;
    }

    if (this._currentItem$1 != null) {
        this._currentItem$1.dispose();
        this._currentItem$1 = null;
    }

    if (this._flyoutControl$1 != null) {
        document.body.removeChild(this._flyoutControl$1.element);
        this._flyoutControl$1.dispose();
        this._flyoutControl$1 = null;
        this._flyout$1 = null;
    }

    if (this._dropdownControl$1 != null) {
        this._dropdownControl$1.dispose();
        this._dropdownControl$1 = null;
    }

    if (this._currentItemContainer$1 != null) {
        this._currentItemContainer$1.dispose();
        this._currentItemContainer$1 = null;
    }

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
    var element = this.element;
    this._currentItem$1 = new People.RecentActivity.UI.Share.NetworkSelectorItemControl(this._selectedNetwork$1);
    this._currentItemContainer$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'share-networkselect-currentitem');
    this._currentItemContainer$1.appendControl(this._currentItem$1);
    this._currentItem$1.render();
    this._dropdownControl$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'share-networkselect-dropdown');
    this._flyoutControl$1 = new People.RecentActivity.UI.Core.Control(People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareNetworkSelectFlyout));
    this._flyoutControl$1.id = this._flyoutControl$1.uniqueId;
    this._flyoutControl$1.render();
    document.body.appendChild(this._flyoutControl$1.element);
    // update the title
    this.title = Jx.res.getString('/strings/raShareNetworkSelectTitle');
    this._itemList$1 = [];
    this._itemMap$1 = {};
    for (var i = 0, len = this._networks$1.count; i < len; i++) {
        var network = this._networks$1.item(i);
        if (!network.isAggregatedNetwork) {
            var item = new People.RecentActivity.UI.Share.NetworkSelectorItemControl(network);
            this._flyoutControl$1.appendControl(item);
            item.render();
            this._attachEvents$1(item);
            this._itemList$1.push(item);
            this._itemMap$1[network.id] = item;
            if (network === this._selectedNetwork$1) {
                this._currentIndex$1 = this._itemList$1.length - 1;
            }        
        }    
    }

    this._flyout$1 = new WinJS.UI.Flyout(this._flyoutControl$1.element);
    this._flyout$1.anchor = element;
    this._flyout$1.placement = 'bottom';
    this._flyout$1.alignment = 'left';
    this._flyoutControl$1.attach('beforeshow', this._onFlyoutBeforeShow$1.bind(this));
    this._flyoutControl$1.attach('aftershow', this._onFlyoutAfterShow$1.bind(this));
    this._flyoutControl$1.attach('afterhide', this._onFlyoutAfterHide$1.bind(this));
    this._flyoutControl$1.attach('keydown', this._onFlyoutKeyDown$1.bind(this));
    if (this._itemList$1.length < 2) {
        this._dropdownControl$1.isVisible = false;
    }
    else {
        // we own the flyout control, which means we also have a popup control.
        // also set aria-expanded to indicate that we *could* expand at some point.
        People.RecentActivity.UI.Core.AriaHelper.setExpanded(element, false);
        People.RecentActivity.UI.Core.AriaHelper.setOwns(element, this._flyoutControl$1.id);
        People.RecentActivity.UI.Core.AriaHelper.setHasPopup(element, true);
        this.addClass('ra-shareNetworkSelectExpandable');
        this.addClass('ra-shareNetworkSelectCollapsed');
        this.attach('click', this._onSelectorClicked$1.bind(this));
        this.attach('keydown', this._onSelectorKeyDown$1.bind(this));
        this.attach('MSPointerDown', this._onSelectorPointerDown$1.bind(this));
        this.attach('MSPointerUp', this._onSelectorPointerUp$1.bind(this));
        this.attach('MSPointerOut', this._onSelectorPointerOut$1.bind(this));
        this.attach('MSPointerOver', this._onSelectorPointerOver$1.bind(this));
    }
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._attachEvents$1 = function(control) {
    /// <summary>
    ///     Attach the required events to the item control.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Share.NetworkSelectorItemControl">The control to attach the events to.</param>
    var that = this;
    
    Debug.assert(control != null, 'control');
    control.attach('click', function(ev) {
        that._onItemClicked$1(ev, control);
    });
    control.attach('keydown', function(ev) {
        that._onItemKeyDown$1(ev, control);
    });
    control.attach('MSPointerDown', function(ev) {
        that._onItemPointerDown$1(ev, control);
    });
    control.attach('MSPointerUp', function(ev) {
        that._onItemPointerUp$1(ev, control);
    });
    control.attach('MSPointerOut', function(ev) {
        that._onItemPointerOut$1(ev, control);
    });
    control.attach('MSPointerOver', function(ev) {
        that._onItemPointerOver$1(ev, control);
    });
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype.selectNetwork$1 = function(network) {
    /// <summary>
    ///     Selects the network chosen by the user.
    /// </summary>
    /// <param name="network" type="People.RecentActivity.Network">The network to select.</param>
    this._currentItemContainer$1.removeControl(this._currentItem$1);
    this._currentItem$1.dispose();
    this.selectedNetwork = network;
    this._currentItem$1 = new People.RecentActivity.UI.Share.NetworkSelectorItemControl(network);
    this._currentItemContainer$1.appendControl(this._currentItem$1);
    this._currentItem$1.isHiddenFromScreenReader = true;
    this._currentItem$1.role = '';
    // clear out the role, inside the button it has none.
    this._currentItem$1.render();
    this._flyout$1.hide();
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._adjustCurrentIndex$1 = function(delta) {
    /// <summary>
    ///     Adjust the current index, keeping it within the boundaries.
    /// </summary>
    /// <param name="delta" type="Number" integer="true">The amount to adjust the index by.</param>
    Debug.assert(!!delta, 'delta');
    this._currentIndex$1 += delta;
    this._currentIndex$1 = Math.min(Math.max(0, this._currentIndex$1), this._itemList$1.length - 1);
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._updateSelectorInPlace$1 = function(delta) {
    /// <summary>
    ///     Update the selector in place.
    /// </summary>
    /// <param name="delta" type="Number" integer="true">The amount to update by.</param>
    Debug.assert(!!delta, 'delta');
    this._adjustCurrentIndex$1(delta);
    this.selectNetwork$1(this._itemList$1[this._currentIndex$1].network);
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onSelectorClicked$1 = function(ev) {
    /// <summary>
    ///     Handles click events for the control.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    Debug.assert(ev != null, 'ev');
    this._flyout$1.show();
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onSelectorKeyDown$1 = function(ev) {
    /// <summary>
    ///     Handles the key down events for the control.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    Debug.assert(ev != null, 'ev');
    switch (ev.keyCode) {
        case WinJS.Utilities.Key.enter:
        case WinJS.Utilities.Key.space:
            this._flyout$1.show();
            break;
        case WinJS.Utilities.Key.downArrow:
            if (ev.altKey) {
                this._flyout$1.show();
            }
            else if (!this._expanded$1) {
                this._updateSelectorInPlace$1(1);
            }

            break;
        case WinJS.Utilities.Key.upArrow:
            if (!this._expanded$1) {
                this._updateSelectorInPlace$1(-1);
            }

            break;
        default:
            // nothing to see here, please move along.
            return;
    }

    ev.cancelBubble = true;
    ev.preventDefault();
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onSelectorPointerDown$1 = function(ev) {
    /// <summary>
    ///     Handles the pointer down event for a selector.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    var pev = (ev);
    if (pev.buttons === 1) {
        this.addClass('ra-shareNetworkSelectActive');
    }
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onSelectorPointerUp$1 = function(ev) {
    /// <summary>
    ///     Handles the pointer up event for a selector.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    this.removeClass('ra-shareNetworkSelectActive');
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onSelectorPointerOut$1 = function(ev) {
    /// <summary>
    ///     Handles the pointer out event for a selector.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    this.removeClass('ra-shareNetworkSelectActive');
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onSelectorPointerOver$1 = function(ev) {
    /// <summary>
    ///     Handles the pointer over event for a selector.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    var pev = (ev);
    if (pev.buttons === 1) {
        this.addClass('ra-shareNetworkSelectActive');
    }
    else {
        this.removeClass('ra-shareNetworkSelectActive');
    }
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onItemClicked$1 = function(ev, control) {
    /// <summary>
    ///     Handles click event for a flyout item.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    /// <param name="control" type="People.RecentActivity.UI.Share.NetworkSelectorItemControl">The item control.</param>
    Debug.assert(ev != null, 'ev');
    Debug.assert(control != null, 'control');
    this._flyoutControl$1.removeClass('ra-shareNetworkSelectFlyoutHover');
    this.selectNetwork$1(control.network);
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onItemKeyDown$1 = function(ev, control) {
    /// <summary>
    ///     Handles the key down event for a flyout item.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    /// <param name="control" type="People.RecentActivity.UI.Share.NetworkSelectorItemControl">The item control.</param>
    Debug.assert(ev != null, 'ev');
    Debug.assert(control != null, 'control');
    switch (ev.keyCode) {
        case WinJS.Utilities.Key.enter:
        case WinJS.Utilities.Key.space:
            this.selectNetwork$1(control.network);
            this._dismissedWithKeyboard$1 = true;
            break;
        case WinJS.Utilities.Key.escape:
            this._flyout$1.hide();
            this._dismissedWithKeyboard$1 = true;
            break;
    }
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onItemPointerDown$1 = function(ev, control) {
    /// <summary>
    ///     Handles the pointer down event for a flyout item.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    /// <param name="control" type="People.RecentActivity.UI.Share.NetworkSelectorItemControl">The item control.</param>
    Debug.assert(ev != null, 'ev');
    Debug.assert(control != null, 'control');
    var pev = (ev);
    if (pev.buttons === 1) {
        this._flyoutControl$1.removeClass('ra-shareNetworkSelectFlyoutHover');
        this._mouseDownItem$1 = control;
        this._mouseDownItem$1.addClass('ra-shareNetworkSelectItemActive');
        this._mouseDownItem$1.focus();
    }
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onItemPointerUp$1 = function(ev, control) {
    /// <summary>
    ///     Handles the pointer up event for a flyout item.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    /// <param name="control" type="People.RecentActivity.UI.Share.NetworkSelectorItemControl">The item control.</param>
    Debug.assert(ev != null, 'ev');
    Debug.assert(control != null, 'control');
    if (this._mouseDownItem$1 != null) {
        this._mouseDownItem$1.removeClass('ra-shareNetworkSelectItemActive');
        this._mouseDownItem$1 = null;
    }

    if (this._focusItem$1 != null) {
        this._focusItem$1.focus();
    }

    this._flyoutControl$1.addClass('ra-shareNetworkSelectFlyoutHover');
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onItemPointerOut$1 = function(ev, control) {
    /// <summary>
    ///     Handles the pointer out event for a flyout item.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    /// <param name="control" type="People.RecentActivity.UI.Share.NetworkSelectorItemControl">The item control.</param>
    Debug.assert(ev != null, 'ev');
    Debug.assert(control != null, 'control');
    if (this._mouseDownItem$1 != null) {
        this._mouseDownItem$1.removeClass('ra-shareNetworkSelectItemActive');
    }

    if (this._focusItem$1 != null) {
        this._focusItem$1.focus();
    }
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onItemPointerOver$1 = function(ev, control) {
    /// <summary>
    ///     Handles the pointer over event for a flyout item.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    /// <param name="control" type="People.RecentActivity.UI.Share.NetworkSelectorItemControl">The item control.</param>
    Debug.assert(ev != null, 'ev');
    Debug.assert(control != null, 'control');
    var pev = (ev);
    if (pev.buttons !== 1) {
        this._flyoutControl$1.addClass('ra-shareNetworkSelectFlyoutHover');
    }
    else if (this._mouseDownItem$1 === control) {
        this._mouseDownItem$1.addClass('ra-shareNetworkSelectItemActive');
        this._mouseDownItem$1.focus();
    }
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onFlyoutBeforeShow$1 = function(ev) {
    /// <summary>
    ///     Updates the state of the flyout before showing it.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    Debug.assert(ev != null, 'ev');
    this._expanded$1 = true;
    // indicates we now have an expanded menu.
    People.RecentActivity.UI.Core.AriaHelper.setExpanded(this.element, true);
    this.removeClass('ra-shareNetworkSelectCollapsed');
    this._flyoutControl$1.addClass('ra-shareNetworkSelectFlyoutHover');
    this._focusItem$1 = this._itemMap$1[this._selectedNetwork$1.id];
    this._focusItem$1.addClass('ra-shareNetworkSelectItemFocus');
    this._currentIndex$1 = this._itemList$1.indexOf(this._focusItem$1);
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onFlyoutAfterShow$1 = function(ev) {
    /// <summary>
    ///     Updates the state of the flyout after showing it.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    Debug.assert(ev != null, 'ev');
    if (this._focusItem$1 != null) {
        this._focusItem$1.focus();
    }
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onFlyoutAfterHide$1 = function(ev) {
    /// <summary>
    ///     Updates the state of the flyout after hiding it.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    Debug.assert(ev != null, 'ev');
    if (this._mouseDownItem$1 != null) {
        this._mouseDownItem$1.removeClass('ra-shareNetworkSelectItemActive');
        this._mouseDownItem$1 = null;
    }

    if (this._focusItem$1 != null) {
        this._focusItem$1.removeClass('ra-shareNetworkSelectItemFocus');
        this._focusItem$1 = null;
    }

    this.addClass('ra-shareNetworkSelectCollapsed');
    if (this._dismissedWithKeyboard$1) {
        // For some reason just setting focus on "this" doesn't cause the outline to appear.
        // To work around this focus on the body first, then on "this."
        document.body.focus();
        this.focus();
        this._dismissedWithKeyboard$1 = false;
    }

    this._expanded$1 = false;
    // indicate we no longer have a menu
    People.RecentActivity.UI.Core.AriaHelper.setExpanded(this.element, false);
};

People.RecentActivity.UI.Share.NetworkSelectorControl.prototype._onFlyoutKeyDown$1 = function(ev) {
    /// <summary>
    ///     Handles the key down event for the flyout control.
    /// </summary>
    /// <param name="ev" type="Event">The event arguments.</param>
    Debug.assert(ev != null, 'ev');
    var currentIndex = this._currentIndex$1;
    switch (ev.keyCode) {
        case WinJS.Utilities.Key.downArrow:
            this._adjustCurrentIndex$1(1);
            break;
        case WinJS.Utilities.Key.upArrow:
            this._adjustCurrentIndex$1(-1);
            break;
    }

    if (currentIndex !== this._currentIndex$1) {
        // clear the current focus.
        if (this._focusItem$1 != null) {
            this._focusItem$1.removeClass('ra-shareNetworkSelectItemFocus');
        }

        // focus on the given item.
        this._focusItem$1 = this._itemList$1[this._currentIndex$1];
        this._focusItem$1.addClass('ra-shareNetworkSelectItemFocus');
        this._focusItem$1.focus();
    }

    ev.cancelBubble = true;
    ev.preventDefault();
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />

People.RecentActivity.UI.Share.ProgressControl = function(progressText) {
    /// <summary>
    ///     Implements a send progress control.
    /// </summary>
    /// <param name="progressText" type="String">The text to display in the control.</param>
    /// <field name="_progressText$1" type="String">The progress control text.</field>
    /// <field name="_label$1" type="People.RecentActivity.UI.Core.Control">The control label.</field>
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareProgress));
    this._progressText$1 = progressText;
};

Jx.inherit(People.RecentActivity.UI.Share.ProgressControl, People.RecentActivity.UI.Core.Control);


People.RecentActivity.UI.Share.ProgressControl.prototype._progressText$1 = null;
People.RecentActivity.UI.Share.ProgressControl.prototype._label$1 = null;

People.RecentActivity.UI.Share.ProgressControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    if (this._label$1 != null) {
        this._label$1.dispose();
        this._label$1 = null;
    }

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Share.ProgressControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
    this._label$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-progress-label');
    this._label$1.text = this._progressText$1;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\BICI\BiciBoolean.js" />
/// <reference path="..\..\..\Core\BICI\BiciHelper.js" />
/// <reference path="..\..\..\Core\BICI\BiciShareEntryPoint.js" />
/// <reference path="..\..\..\Core\BICI\BiciShareType.js" />
/// <reference path="..\..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\..\Core\FeedEntryInfo.js" />
/// <reference path="..\..\..\Core\FeedEntryInfoType.js" />
/// <reference path="..\..\..\Core\FeedEntryLinkDataInfo.js" />
/// <reference path="..\..\..\Core\FeedEntryStatusDataInfo.js" />
/// <reference path="..\..\..\Core\FeedEntryVideoDataInfo.js" />
/// <reference path="..\..\..\Core\FeedEntryVideoDataInfoType.js" />
/// <reference path="..\..\..\Core\FeedObjectInfo.js" />
/// <reference path="..\..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\..\Core\NetworkId.js" />
/// <reference path="..\..\..\Core\ResultCode.js" />
/// <reference path="..\..\..\Core\ShareOperationInfo.js" />
/// <reference path="..\..\..\Model\Events\ActionCompletedEventArgs.js" />
/// <reference path="..\..\..\Model\Feed.js" />
/// <reference path="..\..\..\Model\Identity.js" />
/// <reference path="..\..\..\Model\Network.js" />
/// <reference path="..\..\..\Platform\Platform.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\LinkHelper.js" />
/// <reference path="..\..\Core\Helpers\LocalizationHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\Events\CanvasFocusChangedEventArgs.js" />
/// <reference path="..\Events\CanvasLinkInsertedEventArgs.js" />
/// <reference path="..\ShareBici.js" />
/// <reference path="CanvasControl.js" />
/// <reference path="CharacterCountControl.js" />
/// <reference path="LinkPreviewControl.js" />
/// <reference path="NetworkSelectorControl.js" />
/// <reference path="ProgressControl.js" />
/// <reference path="SendButtonControl.js" />

People.RecentActivity.UI.Share.ShareControl = function(identity, displayFeed) {
    /// <summary>
    ///     Implements the share control.
    /// </summary>
    /// <param name="identity" type="People.RecentActivity.Identity">The identity associated with the current view.</param>
    /// <param name="displayFeed" type="People.RecentActivity.Feed">The associated feed being displayed near the share control.</param>
    /// <field name="settingKey" type="String" static="true">The setting key.</field>
    /// <field name="_identity$1" type="People.RecentActivity.Identity">The current identity.</field>
    /// <field name="_currentNetwork$1" type="People.RecentActivity.Network">The currently selected network.</field>
    /// <field name="_biciData$1" type="People.RecentActivity.UI.Share.ShareBici">The BICI data for the session.</field>
    /// <field name="_displayFeed$1" type="People.RecentActivity.Feed">The feed being displayed near the control.</field>
    /// <field name="_bodyAnimation$1" type="WinJS.Promise">The animation for hiding/showing the body.</field>
    /// <field name="_sendButtonFadeCurrent$1" type="WinJS.Promise">The current animation promise for the send button.</field>
    /// <field name="_sendButtonVisible$1" type="Boolean">Whether the send button should end up visible.</field>
    /// <field name="_sendButtonDisabled$1" type="Boolean">Whether the send button should end up disabled.</field>
    /// <field name="_sending$1" type="Boolean">Whether a send is currently in progress.</field>
    /// <field name="_hasRichLink$1" type="Boolean">Whether the control currently has a rich link preview.</field>
    /// <field name="_currentLink$1" type="People.RecentActivity.Core.create_shareOperationInfo">The current link.</field>
    /// <field name="_lastNetworkError$1" type="HTMLElement">The last error message received from the network.</field>
    /// <field name="_overlay$1" type="People.RecentActivity.UI.Core.Control">The control overlay.</field>
    /// <field name="_body" type="People.RecentActivity.UI.Core.Control">The control body.</field>
    /// <field name="_networkSelect$1" type="People.RecentActivity.UI.Share.NetworkSelectorControl">The network selector control.</field>
    /// <field name="_errorMessage$1" type="People.RecentActivity.UI.Core.Control">The error message control.</field>
    /// <field name="_canvasContainer$1" type="People.RecentActivity.UI.Core.Control">The container for the canvas element.</field>
    /// <field name="_canvas$1" type="People.RecentActivity.UI.Share.CanvasControl">The canvas control.</field>
    /// <field name="_linkPreview$1" type="People.RecentActivity.UI.Share.LinkPreviewControl">The link preview control.</field>
    /// <field name="_linkPreviewClear$1" type="People.RecentActivity.UI.Core.Control">The link preview clear button control.</field>
    /// <field name="_characterCount$1" type="People.RecentActivity.UI.Share.CharacterCountControl">The character count control.</field>
    /// <field name="_sendButton$1" type="People.RecentActivity.UI.Share.SendButtonControl">The send button control.</field>
    /// <field name="_sendProgress$1" type="People.RecentActivity.UI.Share.ProgressControl">The send progress control.</field>
    /// <field name="_reconnectLink$1" type="People.RecentActivity.UI.Core.Control">The reconnect link.</field>
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareControl));
    Debug.assert(identity != null, 'identity');
    this._identity$1 = identity;
    this._displayFeed$1 = displayFeed;
    this._sendButtonFadeCurrent$1 = WinJS.Promise.wrap(null);
};

Jx.inherit(People.RecentActivity.UI.Share.ShareControl, People.RecentActivity.UI.Core.Control);

Debug.Events.define(People.RecentActivity.UI.Share.ShareControl.prototype, "completed");

People.RecentActivity.UI.Share.ShareControl.settingKey = 'shareLastUsedNetwork';
People.RecentActivity.UI.Share.ShareControl.prototype._identity$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._currentNetwork$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._biciData$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._displayFeed$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._bodyAnimation$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._sendButtonFadeCurrent$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._sendButtonVisible$1 = false;
People.RecentActivity.UI.Share.ShareControl.prototype._sendButtonDisabled$1 = false;
People.RecentActivity.UI.Share.ShareControl.prototype._sending$1 = false;
People.RecentActivity.UI.Share.ShareControl.prototype._hasRichLink$1 = false;
People.RecentActivity.UI.Share.ShareControl.prototype._currentLink$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._lastNetworkError$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._overlay$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._body = null;
People.RecentActivity.UI.Share.ShareControl.prototype._networkSelect$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._errorMessage$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._canvasContainer$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._canvas$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._linkPreview$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._linkPreviewClear$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._characterCount$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._sendButton$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._sendProgress$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._reconnectLink$1 = null;
People.RecentActivity.UI.Share.ShareControl.prototype._refreshTimeout = -1;

Object.defineProperty(People.RecentActivity.UI.Share.ShareControl.prototype, "hasRichLink", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the control is currently displaying a rich link preview.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._hasRichLink$1;
    },
    set: function(value) {
        if (this._hasRichLink$1 !== value) {
            this._hasRichLink$1 = value;
            this.onPropertyChanged('HasRichLink');
        }

    }
});

People.RecentActivity.UI.Share.ShareControl.prototype.refreshSize = function() {
    /// <summary>
    ///     Refreshes the internal size of the control.
    /// </summary>
    this._updateCanvasHeight$1();
};

People.RecentActivity.UI.Share.ShareControl.prototype.focus = function() {
    /// <summary>
    ///     Focus on the control (place focus in the input canvas).
    /// </summary>
    this._canvas$1.focus();
};

People.RecentActivity.UI.Share.ShareControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    // This is our last chance to log any BICI data.
    this._logBiciData$1();

    if (this._refreshTimeout !== -1) {
        window.clearTimeout(this._refreshTimeout);
        this._refreshTimeout = -1;
    }

    if (this._bodyAnimation$1 != null) {
        this._bodyAnimation$1.cancel();
        this._bodyAnimation$1 = null;
    }

    if (this._sendButtonFadeCurrent$1 != null) {
        this._sendButtonFadeCurrent$1.cancel();
        this._sendButtonFadeCurrent$1 = null;
    }

    if (this._currentNetwork$1 != null) {
        this._currentNetwork$1.feed.removeListenerSafe("addentrycompleted", this._onFeedAddEntryCompleted$1, this);
        this._currentNetwork$1 = null;
    }

    if (this._displayFeed$1 != null) {
        this._displayFeed$1.removeListenerSafe("refreshcompleted", this._onDisplayFeedRefreshCompleted$1, this);
        this._displayFeed$1 = null;
    }

    if (this._networkSelect$1 != null) {
        this._networkSelect$1.removeListenerSafe("propertychanged", this._onNetworkSelectPropertyChanged$1, this);
        this._networkSelect$1.dispose();
        this._networkSelect$1 = null;
    }

    if (this._reconnectLink$1 != null) {
        this._reconnectLink$1.dispose();
        this._reconnectLink$1 = null;
    }

    if (this._errorMessage$1 != null) {
        this._errorMessage$1.dispose();
        this._errorMessage$1 = null;
    }

    if (this._canvas$1 != null) {
        this._canvas$1.removeListenerSafe("propertychanged", this._onCanvasPropertyChanged$1, this);
        this._canvas$1.removeListenerSafe("linkinserted", this._onCanvasLinkInserted$1, this);
        this._canvas$1.removeListenerSafe("focuschanged", this._onCanvasFocusChanged$1, this);
        this._canvas$1.dispose();
        this._canvas$1 = null;
    }

    if (this._linkPreview$1 != null) {
        this._linkPreview$1.dispose();
        this._linkPreview$1 = null;
    }

    if (this._linkPreviewClear$1 != null) {
        this._linkPreviewClear$1.dispose();
        this._linkPreviewClear$1 = null;
    }

    if (this._characterCount$1 != null) {
        this._characterCount$1.removeListenerSafe("propertychanged", this._onCharacterCountPropertyChanged$1, this);
        this._characterCount$1.dispose();
        this._characterCount$1 = null;
    }

    if (this._sendButton$1 != null) {
        this._sendButton$1.removeListenerSafe("clicked", this._onSendButtonClicked$1, this);
        this._sendButton$1.dispose();
        this._sendButton$1 = null;
    }

    if (this._canvasContainer$1 != null) {
        this._canvasContainer$1.dispose();
        this._canvasContainer$1 = null;
    }

    if (this._body != null) {
        this._body.dispose();
        this._body = null;
    }

    if (this._sendProgress$1 != null) {
        this._sendProgress$1.dispose();
        this._sendProgress$1 = null;
    }

    if (this._overlay$1 != null) {
        this._overlay$1.dispose();
        this._overlay$1 = null;
    }

    this._identity$1 = null;

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Share.ShareControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);

    this._overlay$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-control-overlay');
    this._overlay$1.render();
    this._overlay$1.isVisible = false;

    this._sendProgress$1 = new People.RecentActivity.UI.Share.ProgressControl(Jx.res.getString('/strings/raShareSendProgressLabel'));
    this._sendProgress$1.render();

    this._body = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-control-body');
    this._body.render();

    var lastUsedNetworkId = Jx.appData.localSettings().get(People.RecentActivity.UI.Share.ShareControl.settingKey);

    this._networkSelect$1 = new People.RecentActivity.UI.Share.NetworkSelectorControl(this._identity$1.networks, lastUsedNetworkId);
    this.insertControlBefore(this._networkSelect$1, this._body);
    this._networkSelect$1.render();

    this._errorMessage$1 = new People.RecentActivity.UI.Core.Control(People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareErrorMessage));
    this.insertControlBefore(this._errorMessage$1, this._body);
    this._errorMessage$1.render();
    this._errorMessage$1.isVisible = false;

    this._canvasContainer$1 = new People.RecentActivity.UI.Core.Control(People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareControlCanvasContainer));
    this._body.appendControl(this._canvasContainer$1);
    this._canvasContainer$1.render();

    this._canvas$1 = new People.RecentActivity.UI.Share.CanvasControl();
    this._canvasContainer$1.appendControl(this._canvas$1);
    var canvasRenderPromise = this._canvas$1.render();

    this._linkPreview$1 = new People.RecentActivity.UI.Share.LinkPreviewControl();
    this._canvasContainer$1.appendControl(this._linkPreview$1);
    this._linkPreview$1.render();

    this._linkPreviewClear$1 = new People.RecentActivity.UI.Core.Control(People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareControlLinkPreviewClear));
    this._body.appendControl(this._linkPreviewClear$1);
    this._linkPreviewClear$1.text = Jx.res.getString('/strings/raShareLinkPreviewClearLabel');
    this._linkPreviewClear$1.render();
    this._linkPreviewClear$1.isVisible = false;

    this._characterCount$1 = new People.RecentActivity.UI.Share.CharacterCountControl();
    this._body.appendControl(this._characterCount$1);
    this._characterCount$1.render();

    this._sendButton$1 = new People.RecentActivity.UI.Share.SendButtonControl();
    this.appendControl(this._sendButton$1);
    this._sendButton$1.render();

    // Initialize the BICI data and reset so we don't upload just the defaults.
    this._biciData$1 = this._createBiciData$1();

    // Attach event handlers.
    this._networkSelect$1.addListener("propertychanged", this._onNetworkSelectPropertyChanged$1, this);
    this._characterCount$1.addListener("propertychanged", this._onCharacterCountPropertyChanged$1, this);
    this._sendButton$1.addListener("clicked", this._onSendButtonClicked$1, this);

    this._canvas$1.addListener("propertychanged", this._onCanvasPropertyChanged$1, this);
    this._canvas$1.addListener("linkinserted", this._onCanvasLinkInserted$1, this);
    this._canvas$1.addListener("focuschanged", this._onCanvasFocusChanged$1, this);

    this._canvasContainer$1.attach('focus', this._onCanvasContainerFocus.bind(this));
    this._linkPreviewClear$1.attach('click', this._onLinkPreviewClearClicked$1.bind(this));
    this._linkPreviewClear$1.attach('keydown', this._onLinkPreviewClearKeyDown$1.bind(this));

    // Set initial state.
    this._switchNetwork$1(this._networkSelect$1.selectedNetwork);
    this._updateSendButton$1();

    return canvasRenderPromise;
};

People.RecentActivity.UI.Share.ShareControl.prototype.selectNetwork$1 = function (network) {
    this._networkSelect$1.selectNetwork$1(network);
}

People.RecentActivity.UI.Share.ShareControl.prototype._switchNetwork$1 = function(network) {
    /// <summary>
    ///     Switch to the selected network.
    /// </summary>
    /// <param name="network" type="People.RecentActivity.Network">The selected network.</param>    
    Debug.assert(network != null, 'network');

    if (network === this._currentNetwork$1) {
        return;
    }

    if (this._currentNetwork$1 == null) {
        this._bodyAnimation$1 = WinJS.Promise.wrap(null);
    }
    else {
        this._bodyAnimation$1 = this._exitBody$1();
    }

    this._updateShareText$1(network);
    this._currentNetwork$1 = network;
    this._lastNetworkError$1 = null;
    this._updateError$1();

    var that = this;
    this._bodyAnimation$1.then(function() {
        if (that.isDisposed) {
            return null;
        }

        that._updateBody$1();
        that._bodyAnimation$1 = that._enterBody$1();
        return that._bodyAnimation$1;
    });
};

People.RecentActivity.UI.Share.ShareControl.prototype._updateShareText$1 = function(network) {
    /// <summary>
    ///     Update the text content being shared should we need to adjust any user handles present.
    /// </summary>
    /// <param name="network" type="People.RecentActivity.Network">The selected network being switched to.</param>
    if (this._currentNetwork$1 != null && !this._identity$1.isMe) {
        var contents = this._canvas$1.textContent;
        var handle = this._getTwitterNickname$1();

        // What if we're switching between Twitters? Need to strip off old and then slap on new.
        if (this._currentNetwork$1.id === People.RecentActivity.Core.NetworkId.twitter &&
            network.id !== People.RecentActivity.Core.NetworkId.twitter) {
            // Strip off matching Nickname
            if (contents.substring(0, handle.length) === handle) {
                this._canvas$1.textContent = contents.substring(handle.length, contents.length);
            }        
        }

        if (this._currentNetwork$1.id !== People.RecentActivity.Core.NetworkId.twitter &&
            network.id === People.RecentActivity.Core.NetworkId.twitter) {
            // Add in the matching Nickname if not already there
            if (contents.substring(0, handle.length) !== handle) {
                this._canvas$1.textContent = handle + contents;
            }        
        }    
    }
};

People.RecentActivity.UI.Share.ShareControl.prototype._exitBody$1 = function() {
    /// <summary>
    ///     Exit the body content.
    /// </summary>
    /// <returns type="WinJS.Promise"></returns>
    var elementsToExit = [];

    elementsToExit.push(this._canvasContainer$1.element);

    if (this._linkPreviewClear$1.isVisible) {
        elementsToExit.push(this._linkPreviewClear$1.element);
    }

    if (this._characterCount$1.isVisible) {
        elementsToExit.push(this._characterCount$1.element);
    }

    return People.Animation.fadeOut(elementsToExit);
};

People.RecentActivity.UI.Share.ShareControl.prototype._enterBody$1 = function() {
    /// <summary>
    ///     Enter the body content.
    /// </summary>
    /// <returns type="WinJS.Promise"></returns>
    var elementsToEnter = [];

    elementsToEnter.push(this._canvasContainer$1.element);

    if (this._linkPreviewClear$1.isVisible) {
        elementsToEnter.push(this._linkPreviewClear$1.element);
    }

    if (this._characterCount$1.isVisible) {
        elementsToEnter.push(this._characterCount$1.element);
    }

    return People.Animation.fadeIn(elementsToEnter);
};

People.RecentActivity.UI.Share.ShareControl.prototype._updateBody$1 = function() {
    /// <summary>
    ///     Update the state of the body content.
    /// </summary>
    var showLinkPreview;
    this._linkPreview$1.shareInfo = this._currentLink$1;

    switch (this._currentNetwork$1.id) {
        case People.RecentActivity.Core.NetworkId.twitter:
            if (this._identity$1.isMe) {
                this._canvas$1.cueText = Jx.res.getString('/strings/raShareCanvasCueTextTwitter');
            }
            else {
                var nickname = this._getTwitterNickname$1();
                this._canvas$1.cueText = nickname;
            }

            this._characterCount$1.maxCharacterCount = 140;
            this.addClass('ra-shareControlShowBottomRow');
            showLinkPreview = false;
            break;

        case People.RecentActivity.Core.NetworkId.facebook:
            if (this._identity$1.isMe) {
                this._canvas$1.cueText = Jx.res.getString('/strings/raShareCanvasCueTextFacebook');
            }
            else {
                this._canvas$1.cueText = Jx.res.loadCompoundString('/strings/raShareCanvasWriteToWallCueTextFacebook', this._identity$1.name);
            }

            this._characterCount$1.maxCharacterCount = -1;
            showLinkPreview = true;
            break;

        default:
            this._canvas$1.cueText = null;
            this._characterCount$1.maxCharacterCount = -1;
            showLinkPreview = true;
            break;
    }

    if (showLinkPreview && this._currentLink$1 != null) {
        Jx.addClass(this._canvas$1.element, "hasLinkPreview");

        this._linkPreview$1.isVisible = true;
        this._linkPreview$1.mode = 2;
        this._linkPreviewClear$1.isVisible = true;

        this.addClass('ra-shareControlShowBottomRow');
    } else {
        Jx.removeClass(this._canvas$1.element, "hasLinkPreview");

        this._linkPreview$1.mode = 0;
        this._linkPreview$1.isVisible = false;
        this._linkPreviewClear$1.isVisible = false;

        if (!this._characterCount$1.isVisible) {
            this.removeClass('ra-shareControlShowBottomRow');
        }    
    }

    this._updateHasRichLink$1();
    this._updateCanvasHeight$1();
    this._updateCharacterCount$1();
    this._updateSendButton$1();
};

People.RecentActivity.UI.Share.ShareControl.prototype._updateHasRichLink$1 = function() {
    /// <summary>
    ///     Update the <see cref="P:People.RecentActivity.UI.Share.ShareControl.HasRichLink" /> property based upon the current state.
    /// </summary>
    this.hasRichLink = !!this._linkPreview$1.mode;
};

People.RecentActivity.UI.Share.ShareControl.prototype._updateCanvasHeight$1 = function() {
    /// <summary>
    ///     Update the height of the canvas control.
    /// </summary>
    if (this._linkPreview$1 && this._linkPreview$1.isVisible) {
        this.addClass('ra-shareControlShowLinkPreview');
    } else {
        this.removeClass('ra-shareControlShowLinkPreview');
    }
};

People.RecentActivity.UI.Share.ShareControl.prototype._getFeedObjectInfo$1 = function() {
    /// <summary>
    ///     Assembles the FeedObjectInfo object.
    /// </summary>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    var entryData = null;
    var entryType = People.RecentActivity.Core.FeedEntryInfoType.none;
    var canvasText = this._canvas$1.textContent;

    if (!!this._linkPreview$1.mode && this._currentLink$1 != null) {
        var linkData = this._linkPreview$1.linkData;

        var url = linkData.url;
        if (People.RecentActivity.UI.Core.LinkHelper.isVideoLink(url)) {
            entryData = People.RecentActivity.Core.create_feedEntryVideoDataInfo(canvasText, null, null, null, null, People.RecentActivity.Core.FeedEntryVideoDataInfoType.embed, url, url);
            entryType = People.RecentActivity.Core.FeedEntryInfoType.video;
        }
        else {
            entryData = People.RecentActivity.Core.create_feedEntryLinkDataInfo(canvasText, url, linkData.title, null, linkData.description, linkData.thumbnailUrl);
            entryType = People.RecentActivity.Core.FeedEntryInfoType.link;
        }
    }
    else {
        entryData = People.RecentActivity.Core.create_feedEntryStatusDataInfo(this._canvas$1.textContent);
        entryType = People.RecentActivity.Core.FeedEntryInfoType.text;
    }

    var entryInfo = People.RecentActivity.Core.create_feedEntryInfo(entryType, null, entryData, null, null, null, false);
    return People.RecentActivity.Core.create_feedObjectInfo(null, this._currentNetwork$1.id, People.RecentActivity.Core.FeedObjectInfoType.entry, entryInfo, null, 0, null, null, null, null);
};

People.RecentActivity.UI.Share.ShareControl.prototype._updateSendButton$1 = function() {
    /// <summary>
    ///     Update the send button state.
    /// </summary>
    if (this._sending$1 || (!this._linkPreview$1.mode && this._characterCount$1.currentCharacterCount < 1)) {
        this._sendButtonVisible$1 = false;
        this._sendButtonDisabled$1 = true;
    }
    else if (this._characterCount$1.limitExceeded) {
        this._sendButtonVisible$1 = true;
        this._sendButtonDisabled$1 = true;
    }
    else {
        this._sendButtonVisible$1 = true;
        this._sendButtonDisabled$1 = false;
    }

    this._processSendButtonAnimations$1();
};

People.RecentActivity.UI.Share.ShareControl.prototype._updateCharacterCount$1 = function(text) {
    /// <summary>
    ///     Update the character count.
    /// </summary>
    /// <param name="text" type="String">The current canvas text.</param>
    if (text == null) {
        text = this._canvas$1.textContent;
    }

    this._characterCount$1.currentCharacterCount = People.RecentActivity.UI.Core.LinkHelper.calculateContentLength(text, this._currentNetwork$1.id);
};

People.RecentActivity.UI.Share.ShareControl.prototype._processSendButtonAnimations$1 = function() {
    /// <summary>
    ///     Process the current send button animations.
    /// </summary>
    this._sendButtonFadeCurrent$1 = this._sendButtonFadeCurrent$1.then(this._ensureSendButtonState$1.bind(this));
};

People.RecentActivity.UI.Share.ShareControl.prototype._ensureSendButtonState$1 = function(data) {
    /// <summary>
    ///     Ensures that the send button is in the correct state, otherwise it animates to the correct state.
    /// </summary>
    /// <param name="data" type="Object">The Promise data objects (unused).</param>
    /// <returns type="WinJS.Promise"></returns>    
    if (this.isDisposed) {
        return null;
    }

    this._sendButton$1.isDisabled = this._sendButtonDisabled$1;

    if (!this._sendButtonVisible$1 && this._sendButton$1.isVisible) {
        var that = this;
        return People.Animation.fadeOut(this._sendButton$1.element).then(function () {
            if (that.isDisposed) {
                return null;
            }

            that._sendButton$1.isVisible = false;
            return null;
        });
    }
    else if (this._sendButtonVisible$1 && !this._sendButton$1.isVisible) {
        this._sendButton$1.isVisible = true;

        return People.Animation.fadeIn(this._sendButton$1.element);
    }

    return null;
};

People.RecentActivity.UI.Share.ShareControl.prototype._isSupportedScheme$1 = function(url) {
    /// <summary>
    ///     Verify that the URL is using a supported scheme.
    /// </summary>
    /// <param name="url" type="Windows.Foundation.Uri">The URL to check.</param>
    /// <returns type="Boolean"></returns>
    var scheme = url.schemeName.toUpperCase();

    return (scheme === 'HTTP') || (scheme === 'HTTPS');
};

People.RecentActivity.UI.Share.ShareControl.prototype._updateError$1 = function() {
    /// <summary>
    ///     Update the current state of the error control.
    /// </summary>    
    var errorElement = this._errorMessage$1.element;

    if (!this._errorMessage$1.isVisible && (this._lastNetworkError$1 != null)) {
        errorElement.innerHTML = '';

        this._errorMessage$1.appendChild(this._lastNetworkError$1);
        this._errorMessage$1.isVisible = true;
        this._updateCanvasHeight$1();

        People.Animation.fadeIn(errorElement);
    }
    else if (this._errorMessage$1.isVisible && (this._lastNetworkError$1 == null)) {
        var that = this;
        People.Animation.fadeOut(errorElement).done(function() {
            if (that.isDisposed) {
                return null;
            }

            that._errorMessage$1.isVisible = false;
            errorElement.innerHTML = '';

            that._updateCanvasHeight$1();
            return null;
        });
    }
    else if (this._lastNetworkError$1 != null) {
        errorElement.innerHTML = '';
        this._errorMessage$1.appendChild(this._lastNetworkError$1);
    }
};

People.RecentActivity.UI.Share.ShareControl.prototype._onShareSuccess$1 = function() {
    /// <summary>
    ///     Updates the UI when the share is successful.
    /// </summary>
    this._biciData$1.sendSucceeded = People.RecentActivity.Core.BiciBoolean.biciTrue;
    this._logBiciData$1();

    this._lastNetworkError$1 = null;
    this._currentLink$1 = null;
    this._canvas$1.clear();

    this._onShareCompleted$1(People.RecentActivity.Core.ResultCode.success);
};

People.RecentActivity.UI.Share.ShareControl.prototype._onShareCompleted$1 = function(result) {
    /// <summary>
    ///     Updates the UI when the share is complete (success or failure).
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultCode"></param>
    var that = this;
    
    People.Animation.fadeOut(this._overlay$1.element).done(function() {
        if (that.isDisposed) {
            return null;
        }

        that._sendProgress$1.removeFromParent();
        that._overlay$1.isVisible = false;

        that._networkSelect$1.isDisabled = false;
        that._canvas$1.isDisabled = false;
        that._linkPreview$1.isDisabled = false;
        that._linkPreviewClear$1.isDisabled = false;

        that._sending$1 = false;
        that._updateBody$1();
        that._updateError$1();

        that.raiseEvent("completed", result);
        return null;
    });
};

People.RecentActivity.UI.Share.ShareControl.prototype._clearLinkPreview$1 = function() {
    /// <summary>
    ///     Clear the link preview.
    /// </summary>
    this._currentLink$1 = null;
    this._biciData$1.shareType = People.RecentActivity.Core.BiciShareType.text;

    this._updateBody$1();
};

People.RecentActivity.UI.Share.ShareControl.prototype._createBiciData$1 = function() {
    /// <summary>
    ///     Creates a new <see cref="T:People.RecentActivity.UI.Share.ShareBici" /> object and initializes it.
    /// </summary>
    /// <returns type="People.RecentActivity.UI.Share.ShareBici"></returns>
    var biciData = new People.RecentActivity.UI.Share.ShareBici();
    biciData.hasNetworks = People.RecentActivity.Core.BiciBoolean.biciTrue;
    biciData.shareEntryPoint = People.RecentActivity.Core.BiciShareEntryPoint.inApp;
    biciData.shareType = People.RecentActivity.Core.BiciShareType.text;

    if (this._networkSelect$1 != null) {
        biciData.socialNetworkId = this._networkSelect$1.selectedNetwork.id;
    }

    biciData.resetHasData();
    return biciData;
};

People.RecentActivity.UI.Share.ShareControl.prototype._logBiciData$1 = function() {
    /// <summary>
    ///     Log the BICI data and clear it.
    /// </summary>
    if (this._biciData$1 != null) {
        var biciData = this._biciData$1;

        // Only log the data if the user interacted with the control.
        if (biciData.hasData) {
            People.RecentActivity.Core.BiciHelper.createShareDatapoint(biciData.hasNetworks, biciData.messageLength, biciData.changedNetworks, biciData.clickedSend, biciData.sendSucceeded, biciData.shareType, biciData.shareEntryPoint, biciData.socialNetworkId, biciData.shareSourcePeopleApp);

            this._biciData$1 = this._createBiciData$1();
        }    
    }
};

People.RecentActivity.UI.Share.ShareControl.prototype._createReconnectLink$1 = function() {
    /// <summary>
    ///     Create a reconnect link to be used in the error messages where it is necessary.
    /// </summary>
    /// <returns type="HTMLElement"></returns>
    if (this._reconnectLink$1 == null) {
        this._reconnectLink$1 = new People.RecentActivity.UI.Core.Control(document.createElement('a'));
        this._reconnectLink$1.text = Jx.res.getString('/strings/raShareLinkReconnectNetwork');
        this._reconnectLink$1.attach('click', this._onReconnectLinkClicked$1.bind(this));
    }

    return this._reconnectLink$1.element;
};

People.RecentActivity.UI.Share.ShareControl.prototype._getTwitterNickname$1 = function () {
    /// <summary>
    ///     Returns the nickname for the Twitter user.
    /// </summary>
    /// <returns type="String"></returns>
    var nickname = People.RecentActivity.Platform.Platform.getNicknameBySourceId(this._identity$1.getDataContext(), People.RecentActivity.Core.NetworkId.twitter);
    if (Jx.isNonEmptyString(nickname)) {
        var handleText = People.Social.format('@{0} ', nickname);
        return handleText;
    }
    else {
        return '';
    }
};

People.RecentActivity.UI.Share.ShareControl.prototype._refreshDisplayFeed = function () {
    /// <summary>
    ///     Refreshes the provided display feed if one is initialized.
    /// </summary>
    // Some networks have an internal delay that's requires us to delay the feed refresh (and this won't always work).
    if (this._currentNetwork$1.shareRefreshDelay > 0) {
        // Ensure there's only one timeout at a time (there should only be one anyway).
        if (this._refreshTimeout === -1) {
            var that = this;
            this._refreshTimeout = window.setTimeout(
                function () {
                    that._refreshTimeout = -1;
                    that._displayFeed$1.addListener("refreshcompleted", that._onDisplayFeedRefreshCompleted$1, that);
                    that._displayFeed$1.refresh();
                },
                this._currentNetwork$1.shareRefreshDelay);
        }
    }
    else {
        // We didn't post to Twitter, just refresh now.
        this._displayFeed$1.addListener("refreshcompleted", this._onDisplayFeedRefreshCompleted$1, this);
        this._displayFeed$1.refresh();
    }
};

People.RecentActivity.UI.Share.ShareControl.prototype._onNetworkSelectPropertyChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    switch (e.propertyName) {
        case 'SelectedNetwork':
            var selectedNetwork = e.sender.selectedNetwork;
            this._biciData$1.socialNetworkId = selectedNetwork.id;
            this._biciData$1.changedNetworks = People.RecentActivity.Core.BiciBoolean.biciTrue;
            this._switchNetwork$1(selectedNetwork);
            break;
    }
};

People.RecentActivity.UI.Share.ShareControl.prototype._onCanvasPropertyChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    switch (e.propertyName) {
        case 'CharacterCount':
            var canvas = e.sender;
            this._biciData$1.messageLength = canvas.characterCount;
            this._updateCharacterCount$1(canvas.textContent);
            this._updateSendButton$1();
            break;
    }
};

People.RecentActivity.UI.Share.ShareControl.prototype._onCanvasLinkInserted$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.UI.Share.CanvasLinkInsertedEventArgs"></param>
    if (this._currentLink$1 == null) {
        try {
            var urlUpper = e.linkUrl.toUpperCase();
            var url = (urlUpper.substr(0, 4) === 'WWW.') ? 'http://' + e.linkUrl : e.linkUrl;

            var uri = new Windows.Foundation.Uri(url);
            if (this._isSupportedScheme$1(uri)) {
                this._biciData$1.shareType = People.RecentActivity.Core.BiciShareType.link;
                this._currentLink$1 = People.RecentActivity.Core.create_shareOperationInfo(Windows.ApplicationModel.DataTransfer.StandardDataFormats.uri, uri, null);
                this._updateBody$1();
            }
        }
        catch (ex) {
            // We can't do anything if the URL we get won't parse, ignore it.
            Jx.log.write(3, "Failed to parse shared URL '" + e.linkUrl + "': " + ex.toString());
        }    
    }
};

People.RecentActivity.UI.Share.ShareControl.prototype._onCanvasFocusChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.UI.Share.CanvasFocusChangedEventArgs"></param>
    // If the contents are blank and sharing is set to a Twitter account, prefill the
    // content with the Twitter handle.
    if (this._currentNetwork$1.id === People.RecentActivity.Core.NetworkId.twitter && !this._identity$1.isMe) {
        var contents = this._canvas$1.textContent;
        var handle = this._getTwitterNickname$1();

        var focusGained = e.focusGained;
        if (focusGained) {
            if (!Jx.isNonEmptyString(contents)) {
                this._canvas$1.textContent = handle;
                this._canvas$1.setSelection(false);
            }
        }
        else {
            if (contents === handle.trim()) {
                this._canvas$1.textContent = '';
            }        
        }    
    }
};

People.RecentActivity.UI.Share.ShareControl.prototype._onCharacterCountPropertyChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    switch (e.propertyName) {
        case 'LimitExceeded':
            this._updateSendButton$1();
            break;
    }
};

People.RecentActivity.UI.Share.ShareControl.prototype._onSendButtonClicked$1 = function() {
    People.RecentActivity.Core.EtwHelper.writeShareResultEvent(People.RecentActivity.Core.EtwEventName.uiShareTargetShareStart, this._currentNetwork$1.id, People.RecentActivity.Core.ResultCode.none.toString());

    this._networkSelect$1.isDisabled = true;
    this._canvas$1.isDisabled = true;
    this._linkPreview$1.isDisabled = true;
    this._linkPreviewClear$1.isDisabled = true;

    this._biciData$1.clickedSend = People.RecentActivity.Core.BiciBoolean.biciTrue;

    this._sending$1 = true;
    this._updateSendButton$1();

    this._lastNetworkError$1 = null;
    this._updateError$1();

    this._overlay$1.isVisible = true;
    this._overlay$1.appendControl(this._sendProgress$1);
    this._sendProgress$1.setActive();

    var that = this;
    People.Animation.fadeIn(this._overlay$1.element).done(function () {
        if (that.isDisposed) {
            return null;
        }

        var feed = that._currentNetwork$1.feed;
        feed.addListener("addentrycompleted", that._onFeedAddEntryCompleted$1, that);
        feed.add(that._getFeedObjectInfo$1());
        return null;
    });
};

People.RecentActivity.UI.Share.ShareControl.prototype._onFeedAddEntryCompleted$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
    var feed = e.sender;
    feed.removeListenerSafe("addentrycompleted", this._onFeedAddEntryCompleted$1, this);

    if (e.result.code === People.RecentActivity.Core.ResultCode.success) {
        Jx.appData.localSettings().set(People.RecentActivity.UI.Share.ShareControl.settingKey, feed.network.id);

        if (this._displayFeed$1 != null && this._displayFeed$1.initialized) {
            this._refreshDisplayFeed();
        }
        else {
            this._onShareSuccess$1();
        }
    }
    else {
        switch (e.result.code) {
            case People.RecentActivity.Core.ResultCode.invalidUserCredential:
                this._lastNetworkError$1 = People.RecentActivity.UI.Core.LocalizationHelper.loadCompoundElement('/strings/raShareErrorPermissionProblem', [ document.createTextNode(this._currentNetwork$1.name), this._createReconnectLink$1() ]);
                break;

            case People.RecentActivity.Core.ResultCode.userOffline:
                this._lastNetworkError$1 = document.createTextNode(Jx.res.getString('/strings/raShareErrorNoInternetConnectivity'));
                break;

            case People.RecentActivity.Core.ResultCode.invalidPermissions:
                this._lastNetworkError$1 = document.createTextNode(Jx.res.loadCompoundString('/strings/raShareWriteToWallError', this._identity$1.name));
                break;

            default:
                this._lastNetworkError$1 = document.createTextNode(Jx.res.loadCompoundString('/strings/raShareErrorThirdPartyNetwork', this._currentNetwork$1.name));
                break;
        }

        this._onShareCompleted$1(e.result.code);
    }

    People.RecentActivity.Core.EtwHelper.writeShareResultEvent(People.RecentActivity.Core.EtwEventName.uiShareTargetShareStop, feed.network.id, e.result.code.toString());
};

People.RecentActivity.UI.Share.ShareControl.prototype._onDisplayFeedRefreshCompleted$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
    e.sender.removeListenerSafe("refreshcompleted", this._onDisplayFeedRefreshCompleted$1, this);
    this._onShareSuccess$1();
};

People.RecentActivity.UI.Share.ShareControl.prototype._onLinkPreviewClearClicked$1 = function(e) {
    /// <param name="e" type="MouseEvent"></param>
    e.preventDefault();
    this._clearLinkPreview$1();
};

People.RecentActivity.UI.Share.ShareControl.prototype._onLinkPreviewClearKeyDown$1 = function(e) {
    /// <param name="e" type="KeyboardEvent"></param>
    switch (e.keyCode) {
        case WinJS.Utilities.Key.space:
        case WinJS.Utilities.Key.enter:
            e.preventDefault();
            this._clearLinkPreview$1();
            break;
    }
};

People.RecentActivity.UI.Share.ShareControl.prototype._onReconnectLinkClicked$1 = function(e) {
    /// <summary>
    ///     Handles the "click" event of the reconnect link.
    /// </summary>
    /// <param name="e" type="MouseEvent">The event arguments.</param>
    if (this._currentNetwork$1 != null) {
        // get the associated account.
        var manager = Jx.root.getPlatform().accountManager;

        var account = manager.getAccountBySourceId(this._currentNetwork$1.id, '');
        if (account != null) {
            // set up a new reconnect control and launch into the reconnect flow.
            var launcher = new People.Accounts.FlowLauncher(Jx.root.getPlatform(), Microsoft.WindowsLive.Platform.ApplicationScenario.people, 'social', Jx.root.getJobSet());
            launcher.launchManageFlow(account, true);
        }    
    }
};

People.RecentActivity.UI.Share.ShareControl.prototype._onCanvasContainerFocus = function (e) {
    /// <summary>
    ///     Handles the "focus" event of the canvas container.
    /// </summary>
    /// <param name="e" type="FocusEvent">The event arguments.</param>
    if (!this._linkPreview$1.isVisible) {
        e.preventDefault();
        this._canvas$1.setSelection(false);
    }
}

;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Model\Configuration.js" />
/// <reference path="..\..\..\Providers\FeedProviderFactory.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\UriHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\..\Core\Page.js" />

People.RecentActivity.UI.Share.ConnectPage = function() {
    /// <summary>
    ///     The page shown when the user has no share-enabled networks.
    /// </summary>
    /// <field name="_header$2" type="People.RecentActivity.UI.Core.Control">The header.</field>
    /// <field name="_error$2" type="People.RecentActivity.UI.Core.Control">The error.</field>
    /// <field name="_networks$2" type="People.RecentActivity.UI.Core.Control">The network list.</field>
    /// <field name="_networkControls$2" type="Array">The network controls.</field>
    People.RecentActivity.UI.Core.Page.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareConnectPage));
    this._networkControls$2 = [];
};

Jx.inherit(People.RecentActivity.UI.Share.ConnectPage, People.RecentActivity.UI.Core.Page);


People.RecentActivity.UI.Share.ConnectPage.prototype._header$2 = null;
People.RecentActivity.UI.Share.ConnectPage.prototype._error$2 = null;
People.RecentActivity.UI.Share.ConnectPage.prototype._networks$2 = null;
People.RecentActivity.UI.Share.ConnectPage.prototype._networkControls$2 = null;

People.RecentActivity.UI.Share.ConnectPage.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    if (this._header$2 != null) {
        this._header$2.dispose();
        this._header$2 = null;
    }

    if (this._error$2 != null) {
        this._error$2.dispose();
        this._error$2 = null;
    }

    if (this._networkControls$2 != null) {
        for (var n = 0; n < this._networkControls$2.length; n++) {
            var control = this._networkControls$2[n];
            control.dispose();
        }

        this._networkControls$2.length = 0;
        this._networkControls$2 = null;
    }

    if (this._networks$2 != null) {
        this._networks$2.dispose();
        this._networks$2 = null;
    }

    People.RecentActivity.UI.Core.Page.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Share.ConnectPage.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    People.RecentActivity.UI.Core.Page.prototype.onRendered.call(this);
    this._header$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-connectpage-header');
    this._header$2.text = Jx.res.getString('/strings/raShareConnectPageHeader');
    this._error$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-connectpage-error');
    this._error$2.text = Jx.res.getString('/strings/raShareConnectPageError');
    this._networks$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-connectpage-networklist');
    var networks = People.RecentActivity.Providers.FeedProviderFactory.instance.getUserConnectableNetworks();
    if (networks.length > 0) {
        for (var n = 0; n < networks.length; n++) {
            var network = networks[n];
            // Create and locate all controls.
            var networkControl = new People.RecentActivity.UI.Core.Control(People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareConnectPageNetwork));
            var imageControl = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(networkControl.element, 'share-connectpage-network-iconimage');
            var textControl = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(networkControl.element, 'share-connectpage-network-text');
            // Add all controls to the list for later disposal.
            this._networkControls$2.push(imageControl);
            this._networkControls$2.push(textControl);
            this._networkControls$2.push(networkControl);
            // Add the control to the page.
            this._networks$2.appendControl(networkControl);
            People.Animation.addTapAnimation(networkControl.element);
            this._attachNetworkHandlers$2(networkControl, network.objectId);
            var imageElement = imageControl.element;
            imageElement.src = network.icon;
            textControl.text = Jx.res.loadCompoundString('/strings/raShareConnectNetworkLabel', network.name);
        }

        this._header$2.isVisible = true;
        this._networks$2.isVisible = true;
        this._error$2.isVisible = false;
    }
    else {
        this._header$2.isVisible = false;
        this._networks$2.isVisible = false;
        this._error$2.isVisible = true;
    }
};

People.RecentActivity.UI.Share.ConnectPage.prototype._attachNetworkHandlers$2 = function(control, objectId) {
    /// <summary>
    ///     Attaches a click handler to the control.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Core.Control">The control.</param>
    /// <param name="objectId" type="String">The network's object ID.</param>
    var that = this;
    
    control.attach('click', function(e) {
        that._onNetworkClicked$2(e, objectId);
    });
    control.attach('keydown', function(e) {
        that._onNetworkKeyDown$2(e, objectId);
    });
};

People.RecentActivity.UI.Share.ConnectPage.prototype._launchReconnectFlow$2 = function(objectId) {
    /// <summary>
    ///     Launches the reconnect flow.
    /// </summary>
    /// <param name="objectId" type="String">The network object ID.</param>
    People.RecentActivity.UI.Core.UriHelper.launchUri(People.RecentActivity.Configuration.getNetworkReconnectUrl(objectId, false));
};

People.RecentActivity.UI.Share.ConnectPage.prototype._onNetworkClicked$2 = function(e, objectId) {
    /// <summary>
    ///     Handles clicks for the network controls.
    /// </summary>
    /// <param name="e" type="Event">The event arguments.</param>
    /// <param name="objectId" type="String">The network's object ID.</param>
    this._launchReconnectFlow$2(objectId);
};

People.RecentActivity.UI.Share.ConnectPage.prototype._onNetworkKeyDown$2 = function(e, objectId) {
    /// <summary>
    ///     Handles keydown for the network controls.
    /// </summary>
    /// <param name="e" type="Event">The event arguments.</param>
    /// <param name="objectId" type="String">The network's object ID.</param>
    switch (e.keyCode) {
        case WinJS.Utilities.Key.enter:
        case WinJS.Utilities.Key.space:
            this._launchReconnectFlow$2(objectId);
            e.preventDefault();
            e.cancelBubble = true;
            break;
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\..\Core\Page.js" />

People.RecentActivity.UI.Share.ErrorPage = function() {
    /// <summary>
    ///     The page shown when there is an error that prevents sharing.
    /// </summary>
    /// <field name="_label$2" type="People.RecentActivity.UI.Core.Control">The text label.</field>
    People.RecentActivity.UI.Core.Page.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareErrorPage));
};

Jx.inherit(People.RecentActivity.UI.Share.ErrorPage, People.RecentActivity.UI.Core.Page);


People.RecentActivity.UI.Share.ErrorPage.prototype._label$2 = null;

People.RecentActivity.UI.Share.ErrorPage.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    if (this._label$2 != null) {
        this._label$2.dispose();
        this._label$2 = null;
    }

    People.RecentActivity.UI.Core.Page.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Share.ErrorPage.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    People.RecentActivity.UI.Core.Page.prototype.onRendered.call(this);
    this.text = Jx.res.getString('/strings/raShareLoadingErrorLabel');
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\..\Core\Page.js" />

People.RecentActivity.UI.Share.LoadingPage = function(dataPackageProperties) {
    /// <summary>
    ///     The page shown when the share information is still loading.
    /// </summary>
    /// <param name="dataPackageProperties" type="Windows.ApplicationModel.DataTransfer.DataPackagePropertySetView">The properties from the data package.</param>
    /// <field name="_dataPackageProperties$2" type="Windows.ApplicationModel.DataTransfer.DataPackagePropertySetView">The properties from the data package.</field>
    /// <field name="_label$2" type="People.RecentActivity.UI.Core.Control">The text label.</field>
    People.RecentActivity.UI.Core.Page.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareLoadingPage));
    this._dataPackageProperties$2 = dataPackageProperties;
};

Jx.inherit(People.RecentActivity.UI.Share.LoadingPage, People.RecentActivity.UI.Core.Page);


People.RecentActivity.UI.Share.LoadingPage.prototype._dataPackageProperties$2 = null;
People.RecentActivity.UI.Share.LoadingPage.prototype._label$2 = null;

People.RecentActivity.UI.Share.LoadingPage.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    if (this._label$2 != null) {
        this._label$2.dispose();
        this._label$2 = null;
    }

    People.RecentActivity.UI.Core.Page.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Share.LoadingPage.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    People.RecentActivity.UI.Core.Page.prototype.onRendered.call(this);
    this._label$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-content-loading-label');
    this._label$2.text = Jx.res.loadCompoundString('/strings/raShareWaitingForAppProgressLabel', this._dataPackageProperties$2.applicationName);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\BICI\BiciBoolean.js" />
/// <reference path="..\..\..\Core\BICI\BiciShareEntryPoint.js" />
/// <reference path="..\..\..\Core\BICI\BiciShareType.js" />
/// <reference path="..\..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\..\Core\FeedEntryInfo.js" />
/// <reference path="..\..\..\Core\FeedEntryInfoType.js" />
/// <reference path="..\..\..\Core\FeedEntryLinkDataInfo.js" />
/// <reference path="..\..\..\Core\FeedEntryStatusDataInfo.js" />
/// <reference path="..\..\..\Core\FeedEntryVideoDataInfo.js" />
/// <reference path="..\..\..\Core\FeedEntryVideoDataInfoType.js" />
/// <reference path="..\..\..\Core\FeedObjectInfo.js" />
/// <reference path="..\..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\..\Core\NetworkId.js" />
/// <reference path="..\..\..\Core\ResultCode.js" />
/// <reference path="..\..\..\Model\Configuration.js" />
/// <reference path="..\..\..\Model\Events\ActionCompletedEventArgs.js" />
/// <reference path="..\..\..\Model\Identity.js" />
/// <reference path="..\..\..\Model\Network.js" />
/// <reference path="..\..\..\Platform\AuthInfo.js" />
/// <reference path="..\..\..\Platform\Configuration.js" />
/// <reference path="..\..\..\Platform\PsaStatus.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\EventManager.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\LinkHelper.js" />
/// <reference path="..\..\Core\Helpers\LocalizationHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\..\Core\InputManager.js" />
/// <reference path="..\..\Core\Page.js" />
/// <reference path="..\Controls\CanvasControl.js" />
/// <reference path="..\Controls\CharacterCountControl.js" />
/// <reference path="..\Controls\LinkPreviewControl.js" />
/// <reference path="..\Controls\NetworkSelectorControl.js" />
/// <reference path="..\Controls\ProgressControl.js" />
/// <reference path="..\Controls\SendButtonControl.js" />
/// <reference path="..\Controls\ShareControl.js" />
/// <reference path="..\ShareBici.js" />

People.RecentActivity.UI.Share.SharePage = function(identity, shareOperation, biciData) {
    /// <summary>
    ///     The main sharing UI page.
    /// </summary>
    /// <param name="identity" type="People.RecentActivity.Identity">The user's identity.</param>
    /// <param name="shareOperation" type="Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation">The current share operation.</param>
    /// <param name="biciData" type="People.RecentActivity.UI.Share.ShareBici">The BICI data bundle for the current session.</param>
    /// <field name="_identity$2" type="People.RecentActivity.Identity">The user's identity.</field>
    /// <field name="_shareOperation$2" type="Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation">The current share.</field>
    /// <field name="_biciData$2" type="People.RecentActivity.UI.Share.ShareBici">The BICI data for this session.</field>
    /// <field name="_currentNetwork$2" type="People.RecentActivity.Network">The current network.</field>
    /// <field name="_lastNetworkError$2" type="HTMLElement">The last network error.</field>
    /// <field name="_overlay$2" type="People.RecentActivity.UI.Core.Control">The page overlay.</field>
    /// <field name="_container$2" type="People.RecentActivity.UI.Core.Control">The container for the share controls.</field>
    /// <field name="_header$2" type="People.RecentActivity.UI.Core.Control">The page header.</field>
    /// <field name="_bodyContainer$2" type="People.RecentActivity.UI.Core.Control">The page body container.</field>
    /// <field name="_body$2" type="People.RecentActivity.UI.Core.Control">The page body.</field>
    /// <field name="_networkSelect$2" type="People.RecentActivity.UI.Share.NetworkSelectorControl">The network selector.</field>
    /// <field name="_sendButton$2" type="People.RecentActivity.UI.Share.SendButtonControl">The send button.</field>
    /// <field name="_sendProgress$2" type="People.RecentActivity.UI.Share.ProgressControl">The send progress.</field>
    /// <field name="_errorMessage$2" type="People.RecentActivity.UI.Core.Control">The error message.</field>
    /// <field name="_canvas$2" type="People.RecentActivity.UI.Share.CanvasControl">The modern canvas.</field>
    /// <field name="_linkPreview$2" type="People.RecentActivity.UI.Share.LinkPreviewControl">The link preview.</field>
    /// <field name="_characterCount$2" type="People.RecentActivity.UI.Share.CharacterCountControl">The character count.</field>
    /// <field name="_currentMode$2" type="People.RecentActivity.UI.Share.SharePageMode">The current mode.</field>
    /// <field name="_shareInfo$2" type="People.RecentActivity.Core.create_shareOperationInfo">The current share data.</field>
    /// <field name="_shareButtonClicked$2" type="Boolean">Whether the share has been initiated.</field>
    /// <field name="_inputPane$2" type="People.RecentActivity.UI.Core.InputManager">The manager for the soft keyboard.</field>
    People.RecentActivity.UI.Core.Page.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.sharePage));
    Debug.assert(identity != null, 'identity must not be null.');
    Debug.assert(shareOperation != null, 'shareOperation must not be null.');
    this._identity$2 = identity;
    this._shareOperation$2 = shareOperation;
    this._biciData$2 = biciData;
    // We are always sharing a link from the share charm, we'll change this when we share other things.
    this._biciData$2.shareType = People.RecentActivity.Core.BiciShareType.link;
};

Jx.inherit(People.RecentActivity.UI.Share.SharePage, People.RecentActivity.UI.Core.Page);

People.RecentActivity.UI.Share.SharePage.prototype._identity$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._shareOperation$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._biciData$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._currentNetwork$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._lastNetworkError$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._overlay$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._container$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._header$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._bodyContainer$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._body$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._networkSelect$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._sendButton$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._sendProgress$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._errorMessage$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._canvas$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._linkPreview$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._characterCount$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._currentMode$2 = 0;
People.RecentActivity.UI.Share.SharePage.prototype._shareInfo$2 = null;
People.RecentActivity.UI.Share.SharePage.prototype._shareButtonClicked$2 = false;
People.RecentActivity.UI.Share.SharePage.prototype._inputPane$2 = null;

Object.defineProperty(People.RecentActivity.UI.Share.SharePage.prototype, "shareInfo", {
    get: function() {
        /// <summary>
        ///     Gets or sets the share info.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_shareOperationInfo"></value>
        return this._shareInfo$2;
    },
    set: function(value) {
        Debug.assert(value != null, 'value must not be null.');
        this._shareInfo$2 = value;
    }
});

People.RecentActivity.UI.Share.SharePage.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    People.RecentActivity.UI.Core.EventManager.events.removeListenerSafe("windowonline", this._onOnlineOfflineChanged$2, this);
    People.RecentActivity.UI.Core.EventManager.events.removeListenerSafe("windowoffline", this._onOnlineOfflineChanged$2, this);
    if (this._inputPane$2 != null) {
        this._inputPane$2.removeListenerSafe("showing", this._onInputPaneShowing$2, this);
        this._inputPane$2.removeListenerSafe("hiding", this._onInputPaneHiding$2, this);
        this._inputPane$2.dispose();
        this._inputPane$2 = null;
    }

    if (this._networkSelect$2 != null) {
        this._networkSelect$2.removeListenerSafe("propertychanged", this._onNetworkSelectPropertyChanged$2, this);
        this._networkSelect$2.dispose();
        this._networkSelect$2 = null;
    }

    if (this._sendButton$2 != null) {
        this._sendButton$2.removeListenerSafe("clicked", this._onSendButtonClicked$2, this);
        this._sendButton$2.dispose();
        this._sendButton$2 = null;
    }

    if (this._errorMessage$2 != null) {
        this._errorMessage$2.dispose();
        this._errorMessage$2 = null;
    }

    if (this._header$2 != null) {
        this._header$2.dispose();
        this._header$2 = null;
    }

    if (this._canvas$2 != null) {
        this._canvas$2.removeListenerSafe("propertychanged", this._onCanvasPropertyChanged$2, this);
        this._canvas$2.dispose();
        this._canvas$2 = null;
    }

    if (this._linkPreview$2 != null) {
        this._linkPreview$2.removeListenerSafe("propertychanged", this._onLinkPreviewPropertyChanged$2, this);
        this._linkPreview$2.dispose();
        this._linkPreview$2 = null;
    }

    if (this._characterCount$2 != null) {
        this._characterCount$2.removeListenerSafe("propertychanged", this._onCharacterCountPropertyChanged$2, this);
        this._characterCount$2.dispose();
        this._characterCount$2 = null;
    }

    if (this._body$2 != null) {
        this._body$2.dispose();
        this._body$2 = null;
    }

    if (this._bodyContainer$2 != null) {
        this._bodyContainer$2.dispose();
        this._body$2 = null;
    }

    if (this._container$2 != null) {
        this._container$2.dispose();
        this._container$2 = null;
    }

    if (this._sendProgress$2 != null) {
        this._sendProgress$2.dispose();
        this._sendProgress$2 = null;
    }

    if (this._overlay$2 != null) {
        this._overlay$2.dispose();
        this._overlay$2 = null;
    }

    if (this._currentNetwork$2 != null) {
        this._currentNetwork$2.feed.removeListenerSafe("addentrycompleted", this._onFeedAddEntryCompleted$2, this);
        this._currentNetwork$2 = null;
    }

    People.RecentActivity.UI.Core.Page.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Share.SharePage.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    People.RecentActivity.UI.Core.Page.prototype.onRendered.call(this);

    // Since we haven't rendered fully yet, we haven't set the visibility of elements.
    this._currentMode$2 = 0;

    // Initialize the overlay
    this._overlay$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-content-overlay');
    this._overlay$2.render();
    this._overlay$2.isVisible = false;

    this._sendProgress$2 = new People.RecentActivity.UI.Share.ProgressControl(Jx.res.getString('/strings/raShareSendProgressLabel'));
    this._sendProgress$2.render();

    // Create the container
    this._container$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-content-container');

    // Create the header.
    this._header$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this._container$2.element, 'share-content-header');
    var networks = this._identity$2.networks;

    // Get the default network ID from the quick link.
    var defaultNetwork = this._shareOperation$2.quickLinkId;

    // We were launched via quick link, note that and make sure the network is recognized.
    if (Jx.isNonEmptyString(defaultNetwork)) {
        this._biciData$2.shareEntryPoint = People.RecentActivity.Core.BiciShareEntryPoint.quickLink;

        // We should remove the quicklink if the network no longer exists.
        if (networks.findById(defaultNetwork) == null) {
            try {
                this._shareOperation$2.removeThisQuickLink();
            }
            catch (ex) {
                // Occasionally during test automation this call generates an exception (but that shouldn't be possible), eat it an continue.
                Jx.log.exception("Failed to remove QuickLink for '" + defaultNetwork + "'", ex);
            }

            defaultNetwork = null;
        }
    }
    else {
        // We were launched normally via the share charm.
        this._biciData$2.shareEntryPoint = People.RecentActivity.Core.BiciShareEntryPoint.shareCharm;

        // There was no quick link, check local settings for the last used network.
        defaultNetwork = Jx.appData.localSettings().get(People.RecentActivity.UI.Share.ShareControl.settingKey);
    }

    this._networkSelect$2 = new People.RecentActivity.UI.Share.NetworkSelectorControl(this._identity$2.networks, defaultNetwork);
    this._header$2.appendControl(this._networkSelect$2);
    this._networkSelect$2.render();

    this._sendButton$2 = new People.RecentActivity.UI.Share.SendButtonControl();
    this._header$2.appendControl(this._sendButton$2);
    this._sendButton$2.addListener("clicked", this._onSendButtonClicked$2, this);
    this._sendButton$2.render();

    this._errorMessage$2 = new People.RecentActivity.UI.Core.Control(People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareErrorMessage));
    this._header$2.appendControl(this._errorMessage$2);
    this._errorMessage$2.render();
    this._errorMessage$2.isVisible = false;

    // Create the body.
    this._bodyContainer$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this._container$2.element, 'share-content-body-container');
    this._body$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this._bodyContainer$2.element, 'share-content-body');

    this._canvas$2 = new People.RecentActivity.UI.Share.CanvasControl();
    this._canvas$2.addListener("propertychanged", this._onCanvasPropertyChanged$2, this);
    this._body$2.appendControl(this._canvas$2);
    this._canvas$2.render();

    this._linkPreview$2 = new People.RecentActivity.UI.Share.LinkPreviewControl();
    this._linkPreview$2.shareInfo = this._shareInfo$2;
    this._linkPreview$2.addListener("propertychanged", this._onLinkPreviewPropertyChanged$2, this);
    this._body$2.appendControl(this._linkPreview$2);
    this._linkPreview$2.render();

    this._characterCount$2 = new People.RecentActivity.UI.Share.CharacterCountControl();
    this._body$2.appendControl(this._characterCount$2);
    this._characterCount$2.addListener("propertychanged", this._onCharacterCountPropertyChanged$2, this);
    this._characterCount$2.render();

    // Listen for network changes.
    People.RecentActivity.UI.Core.EventManager.events.addListener("windowonline", this._onOnlineOfflineChanged$2, this);
    People.RecentActivity.UI.Core.EventManager.events.addListener("windowoffline", this._onOnlineOfflineChanged$2, this);

    this._inputPane$2 = new People.RecentActivity.UI.Core.InputManager();
    this._inputPane$2.addListener("showing", this._onInputPaneShowing$2, this);
    this._inputPane$2.addListener("hiding", this._onInputPaneHiding$2, this);

    // We need to make sure the rest of the elements are rendered first.
    this._networkSelect$2.addListener("propertychanged", this._onNetworkSelectPropertyChanged$2, this);
    this._switchNetwork$2(this._networkSelect$2.selectedNetwork);
};

People.RecentActivity.UI.Share.SharePage.prototype.onEnter = function() {
    /// <summary>
    ///     Occurs when the control is entering the UI.
    /// </summary>
    /// <returns type="WinJS.Promise"></returns>
    return People.Animation.enterPage([ this._header$2.element, this._bodyContainer$2.element ]);
};

People.RecentActivity.UI.Share.SharePage.prototype.onExit = function() {
    /// <summary>
    ///     Occurs when the control is leaving the UI.
    /// </summary>
    /// <returns type="WinJS.Promise"></returns>
    return People.Animation.exitPage([ this._header$2.element, this._bodyContainer$2.element ]);
};

People.RecentActivity.UI.Share.SharePage.prototype._getPageMode$2 = function(network) {
    /// <summary>
    ///     Translates a network object into a page mode.
    /// </summary>
    /// <param name="network" type="People.RecentActivity.Network">The network.</param>
    /// <returns type="People.RecentActivity.UI.Share.SharePageMode"></returns>
    Debug.assert(network != null, 'network must not be null.');
    switch (network.id) {
        case People.RecentActivity.Core.NetworkId.twitter:
            return 2;
        default:
            return 1;
    }
};

People.RecentActivity.UI.Share.SharePage.prototype._sendShare$2 = function() {
    /// <summary>
    ///     Send the share data to the selected network.
    /// </summary>    
    People.RecentActivity.Core.EtwHelper.writeShareResultEvent(People.RecentActivity.Core.EtwEventName.uiShareTargetShareStart, this._currentNetwork$2.id, People.RecentActivity.Core.ResultCode.none.toString());

    this._biciData$2.clickedSend = People.RecentActivity.Core.BiciBoolean.biciTrue;

    // Update the UI
    this._container$2.isDisabled = true;

    var that = this;
    People.Animation.fadeOut(this._sendButton$2.element).then(function () {
        if (that.isDisposed) {
            return null;
        }

        that._sendButton$2.isVisible = false;

        that._overlay$2.isVisible = true;
        that._overlay$2.appendControl(that._sendProgress$2);
        that._sendProgress$2.setActive();

        return People.Animation.fadeIn(that._overlay$2.element);
    }).done(function() {
        if (!that.isDisposed) {
            that._shareButtonClicked$2 = true;
            that._trySendShare$2();
        }

        return null;
    });
};

People.RecentActivity.UI.Share.SharePage.prototype._trySendShare$2 = function() {
    /// <summary>
    ///     Attempts to send the share.  This will only send if all conditions are met.
    /// </summary>
    if (!this._shareButtonClicked$2 || this._linkPreview$2.loading) {
        return;
    }

    // Reset this to prevent further attempts.
    this._shareButtonClicked$2 = false;
    this._currentNetwork$2.feed.addListener("addentrycompleted", this._onFeedAddEntryCompleted$2, this);
    this._currentNetwork$2.feed.add(this._getFeedObjectInfo$2());
};

People.RecentActivity.UI.Share.SharePage.prototype._getFeedObjectInfo$2 = function() {
    /// <summary>
    ///     Assembles the FeedObjectInfo object.
    /// </summary>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    var entryData = null;
    var entryType = People.RecentActivity.Core.FeedEntryInfoType.none;
    var textContent = this._getTextContent$2();
    if (this._currentNetwork$2.id === People.RecentActivity.Core.NetworkId.twitter) {
        entryData = People.RecentActivity.Core.create_feedEntryStatusDataInfo(textContent);
        entryType = People.RecentActivity.Core.FeedEntryInfoType.text;
    }
    else {
        Debug.assert(this._linkPreview$2 != null, 'this.linkPreview != null');
        Debug.assert(this._linkPreview$2.linkData != null, 'this.linkPreview.LinkData != null');
        Debug.assert(Jx.isNonEmptyString(this._linkPreview$2.linkData.url), 'this.linkePreview.LinkData.Url must not be null or empty');
        var linkData = this._linkPreview$2.linkData;
        var url = linkData.url;
        if (People.RecentActivity.UI.Core.LinkHelper.isVideoLink(url)) {
            entryData = People.RecentActivity.Core.create_feedEntryVideoDataInfo(textContent, null, null, null, null, People.RecentActivity.Core.FeedEntryVideoDataInfoType.embed, url, url);
            entryType = People.RecentActivity.Core.FeedEntryInfoType.video;
        }
        else {
            entryData = People.RecentActivity.Core.create_feedEntryLinkDataInfo(textContent, url, linkData.title, null, linkData.description, linkData.thumbnailUrl);
            entryType = People.RecentActivity.Core.FeedEntryInfoType.link;
        }    
    }

    var entryInfo = People.RecentActivity.Core.create_feedEntryInfo(entryType, null, entryData, null, null, null, false);
    return People.RecentActivity.Core.create_feedObjectInfo(null, this._currentNetwork$2.id, People.RecentActivity.Core.FeedObjectInfoType.entry, entryInfo, null, 0, null, null, null, null);
};

People.RecentActivity.UI.Share.SharePage.prototype._getTextContent$2 = function() {
    /// <summary>
    ///     Gets the text content of the share based upon the current network.
    /// </summary>
    /// <returns type="String"></returns>
    Debug.assert(this._currentNetwork$2 != null, 'this.currentNetwork != null');
    Debug.assert(this._shareInfo$2 != null, 'this.shareInfo != null');
    Debug.assert(this._canvas$2 != null, 'this.canvas != null');
    var canvasText = this._canvas$2.textContent;
    if (this._currentNetwork$2.id === People.RecentActivity.Core.NetworkId.twitter && this._shareInfo$2.dataFormat === Windows.ApplicationModel.DataTransfer.StandardDataFormats.uri) {
        // Specifically for Twitter link shares we need to append the URL.
        Debug.assert(this._linkPreview$2 != null, 'this.linkPreview != null');
        Debug.assert(this._linkPreview$2.linkData != null, 'this.linkPreview.LinkData != null');
        Debug.assert(Jx.isNonEmptyString(this._linkPreview$2.linkData.url), 'this.linkePreview.LinkData.Url must not be null or empty');
        var url = this._linkPreview$2.linkData.url;
        return (!Jx.isNonEmptyString(canvasText)) ? url : canvasText + ' ' + url;
    }
    else {
        return canvasText;
    }
};

People.RecentActivity.UI.Share.SharePage.prototype._switchNetwork$2 = function(network) {
    /// <summary>
    ///     Switch to the new network.
    /// </summary>
    /// <param name="network" type="People.RecentActivity.Network">The network to switch to.</param>
    /// <returns type="WinJS.Promise"></returns>
    var that = this;
    
    Debug.assert(network != null, 'network must not be null.');
    if (this._currentNetwork$2 === network) {
        // The network didn't actually change.
        return WinJS.Promise.wrap(null);
    }

    if (this._currentNetwork$2 != null) {
        this._currentNetwork$2.feed.removeListenerSafe("addentrycompleted", this._onFeedAddEntryCompleted$2, this);
    }

    this._currentNetwork$2 = network;
    this._biciData$2.socialNetworkId = network.id;
    this._lastNetworkError$2 = null;
    this._updateError$2();
    var oldMode = this._currentMode$2;
    var newMode = this._getPageMode$2(network);
    if (newMode === oldMode) {
        // We are already in the correct mode.
        return WinJS.Promise.wrap(null);
    }

    this._currentMode$2 = newMode;
    if (!!oldMode) {
        return People.Animation.exitContent(this._body$2.element).then(function() {
            if (that.isDisposed) {
                return null;
            }

            return that._updateBody$2(false);
        });
    }
    else {
        return this._updateBody$2(true);
    }
};

People.RecentActivity.UI.Share.SharePage.prototype._updateError$2 = function() {
    /// <summary>
    ///     Update the current state of the error control.
    /// </summary>
    var that = this;
    
    var info = People.RecentActivity.Platform.AuthInfo.getInstance(this._currentNetwork$2.id);
    var errorMessage = null;
    if (this._lastNetworkError$2 != null) {
        errorMessage = this._lastNetworkError$2;
    }
    else if (info.publishScenarioState !== People.RecentActivity.Platform.PsaStatus.connected) {
        errorMessage = People.RecentActivity.UI.Core.LocalizationHelper.loadCompoundElement('/strings/raShareWarningPossiblePermissionProblem', [ document.createTextNode(this._currentNetwork$2.name), this._createReconnectLink$2() ]);
    }
    else if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        errorMessage = document.createTextNode(Jx.res.getString('/strings/raShareWarningNoInternetConnectivity'));
    }

    var errorElement = this._errorMessage$2.element;
    var bodyContainerElement = this._bodyContainer$2.element;
    if (!this._errorMessage$2.isVisible && errorMessage != null) {
        var expandAnimation = People.Animation.createExpandAnimation(errorElement, bodyContainerElement);
        errorElement.innerHTML = '';
        this._errorMessage$2.appendChild(errorMessage);
        this._errorMessage$2.isVisible = true;
        expandAnimation.execute();
    }
    else if (this._errorMessage$2.isVisible && errorMessage == null) {
        var collapseAnimation = People.Animation.createCollapseAnimation(errorElement, bodyContainerElement);
        var errorElementStyle = errorElement.style;
        this._container$2.addClass('ra-shareHeaderCollapse');
        errorElementStyle.position = 'absolute';
        errorElementStyle.opacity = '0';
        collapseAnimation.execute().then(function() {
            if (!that.isDisposed) {
                errorElementStyle.position = '';
                errorElementStyle.opacity = '';
                that._errorMessage$2.isVisible = false;
                errorElement.innerHTML = '';
                that._container$2.removeClass('ra-shareHeaderCollapse');
            }

            return null;
        });
    }
    else {
        errorElement.innerHTML = '';
        if (errorMessage != null) {
            this._errorMessage$2.appendChild(errorMessage);
        }    
    }
};

People.RecentActivity.UI.Share.SharePage.prototype._updateBody$2 = function(initialRender) {
    /// <summary>
    ///     Update the body based on the current mode.
    /// </summary>
    /// <param name="initialRender" type="Boolean">Indicates whether this is the initial rendering.</param>
    /// <returns type="WinJS.Promise"></returns>
    Debug.assert(!!this._currentMode$2, 'this.currentMode must not be SharePageMode.None');
    if (this._currentMode$2 === 2) {
        this.addClass('ra-shareContentBodyTwitter');
        this._linkPreview$2.mode = 1;
        this._characterCount$2.maxCharacterCount = 140;
        this._updateCharacterCount$2();
    }
    else {
        this.removeClass('ra-shareContentBodyTwitter');
        this._linkPreview$2.mode = 2;
        this._characterCount$2.maxCharacterCount = -1;
    }

    if (!initialRender) {
        return People.Animation.enterContent(this._body$2.element);
    }

    return WinJS.Promise.wrap(null);
};

People.RecentActivity.UI.Share.SharePage.prototype._updateCharacterCount$2 = function() {
    /// <summary>
    ///     Update the current character count.
    /// </summary>
    this._characterCount$2.currentCharacterCount = People.RecentActivity.UI.Core.LinkHelper.calculateContentLength(this._getTextContent$2(), this._currentNetwork$2.id);
};

People.RecentActivity.UI.Share.SharePage.prototype._createReconnectLink$2 = function() {
    /// <summary>
    ///     Create a reconnect link to be used in the error messages where it is necessary.
    /// </summary>
    /// <returns type="HTMLElement"></returns>
    var reconnectLink = document.createElement('a');
    reconnectLink.href = People.RecentActivity.Configuration.getNetworkReconnectUrl(this._currentNetwork$2.objectId, true);
    reconnectLink.innerText = Jx.res.getString('/strings/raShareLinkReconnectNetwork');
    return reconnectLink;
};

People.RecentActivity.UI.Share.SharePage.prototype._onCharacterCountPropertyChanged$2 = function(args) {
    /// <param name="args" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    var characterCount = args.sender;
    switch (args.propertyName) {
        case 'LimitExceeded':
            this._sendButton$2.isDisabled = characterCount.limitExceeded;
            break;
    }
};

People.RecentActivity.UI.Share.SharePage.prototype._onFeedAddEntryCompleted$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
    // Detach the event handler.
    var feed = e.sender;
    feed.removeListenerSafe("addentrycompleted", this._onFeedAddEntryCompleted$2, this);

    this._lastNetworkError$2 = null;

    if (e.result.code === People.RecentActivity.Core.ResultCode.success) {
        // Create a quick link.
        var quickLink = new Windows.ApplicationModel.DataTransfer.ShareTarget.QuickLink();
        quickLink.id = feed.network.id;
        quickLink.title = Jx.res.loadCompoundString('/strings/raShareQuickLinkAction', feed.network.name);
        quickLink.thumbnail = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(new Windows.Foundation.Uri(feed.network.icon));
        quickLink.supportedDataFormats.replaceAll(People.RecentActivity.Configuration.shareSupportedDataFormats);

        // Persist the network selection in the settings.
        Jx.appData.localSettings().set(People.RecentActivity.UI.Share.ShareControl.settingKey, feed.network.id);

        this._biciData$2.sendSucceeded = People.RecentActivity.Core.BiciBoolean.biciTrue;
        this._shareOperation$2.reportCompleted(quickLink);
    }
    else {
        switch (e.result.code) {
            case People.RecentActivity.Core.ResultCode.invalidUserCredential:
            case People.RecentActivity.Core.ResultCode.invalidPermissions:
                this._lastNetworkError$2 = People.RecentActivity.UI.Core.LocalizationHelper.loadCompoundElement('/strings/raShareErrorPermissionProblem', [ document.createTextNode(this._currentNetwork$2.name), this._createReconnectLink$2() ]);
                break;

            case People.RecentActivity.Core.ResultCode.userOffline:
                this._lastNetworkError$2 = document.createTextNode(Jx.res.getString('/strings/raShareErrorNoInternetConnectivity'));
                break;

            default:
                this._lastNetworkError$2 = document.createTextNode(Jx.res.loadCompoundString('/strings/raShareErrorThirdPartyNetwork', this._currentNetwork$2.name));
                break;
        }

        // Update the UI
        var that = this;
        People.Animation.fadeOut(this._overlay$2.element).then(function() {
            if (that.isDisposed) {
                return null;
            }

            that._sendProgress$2.removeFromParent();
            that._overlay$2.isVisible = false;

            that._sendButton$2.isVisible = true;

            return People.Animation.fadeIn(that._sendButton$2.element);
        }).done(function() {
            if (!that.isDisposed) {
                that._container$2.isDisabled = false;
                that._updateError$2();
            }

            return null;
        });
    }

    // Signal completion of the share.
    People.RecentActivity.Core.EtwHelper.writeShareResultEvent(People.RecentActivity.Core.EtwEventName.uiShareTargetShareStop, feed.network.id, e.result.code.toString());
};

People.RecentActivity.UI.Share.SharePage.prototype._onLinkPreviewPropertyChanged$2 = function(args) {
    /// <param name="args" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    switch (args.propertyName) {
        case 'Loading':
            this._trySendShare$2();
            break;
    }
};

People.RecentActivity.UI.Share.SharePage.prototype._onCanvasPropertyChanged$2 = function(args) {
    /// <param name="args" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    var canvas = args.sender;
    switch (args.propertyName) {
        case 'CharacterCount':
            this._biciData$2.messageLength = canvas.characterCount;
            this._updateCharacterCount$2();
            break;
    }
};

People.RecentActivity.UI.Share.SharePage.prototype._onNetworkSelectPropertyChanged$2 = function(args) {
    /// <param name="args" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    var selector = args.sender;
    switch (args.propertyName) {
        case 'SelectedNetwork':
            this._biciData$2.changedNetworks = People.RecentActivity.Core.BiciBoolean.biciTrue;
            this._switchNetwork$2(selector.selectedNetwork);
            break;
    }
};

People.RecentActivity.UI.Share.SharePage.prototype._onOnlineOfflineChanged$2 = function(e) {
    /// <param name="e" type="Event"></param>
    this._updateError$2();
};

People.RecentActivity.UI.Share.SharePage.prototype._onSendButtonClicked$2 = function() {
    this._sendShare$2();
};

People.RecentActivity.UI.Share.SharePage.prototype._onInputPaneShowing$2 = function(e) {
    /// <param name="e" type="Windows.UI.ViewManagement.InputPaneEvent"></param>
    e.ensuredFocusedElementInView = true;
    this._bodyContainer$2.element.style.marginBottom = e.occludedRect.height + 'px';
    this._canvas$2.scrollSelectionIntoView();
};

People.RecentActivity.UI.Share.SharePage.prototype._onInputPaneHiding$2 = function(e) {
    /// <param name="e" type="Windows.UI.ViewManagement.InputPaneEvent"></param>
    e.ensuredFocusedElementInView = true;
    this._bodyContainer$2.element.style.marginBottom = null;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\..\Core\Page.js" />

People.RecentActivity.UI.Share.SyncingPage = function() {
    /// <summary>
    ///     The page shown when the user's information is still syncing.
    /// </summary>
    /// <field name="_label$2" type="People.RecentActivity.UI.Core.Control">The text label.</field>
    People.RecentActivity.UI.Core.Page.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareSyncingPage));
};

Jx.inherit(People.RecentActivity.UI.Share.SyncingPage, People.RecentActivity.UI.Core.Page);


People.RecentActivity.UI.Share.SyncingPage.prototype._label$2 = null;

People.RecentActivity.UI.Share.SyncingPage.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    if (this._label$2 != null) {
        this._label$2.dispose();
        this._label$2 = null;
    }

    People.RecentActivity.UI.Core.Page.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Share.SyncingPage.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    People.RecentActivity.UI.Core.Page.prototype.onRendered.call(this);
    this._label$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'share-content-syncing-label');
    this._label$2.text = Jx.res.getString('/strings/raShareSyncingLabel');
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciBoolean.js" />
/// <reference path="..\..\Core\BICI\BiciShareEntryPoint.js" />
/// <reference path="..\..\Core\BICI\BiciShareType.js" />

People.RecentActivity.UI.Share.ShareBici = function() {
    /// <summary>
    ///     Class for managing BICI data for share.
    /// </summary>
    /// <field name="_hasData" type="Boolean">This indicates whether any properties have been set.</field>
    /// <field name="_hasNetworks" type="People.RecentActivity.Core.BiciBoolean"></field>
    /// <field name="_messageLength" type="Number" integer="true"></field>
    /// <field name="_changedNetworks" type="People.RecentActivity.Core.BiciBoolean"></field>
    /// <field name="_clickedSend" type="People.RecentActivity.Core.BiciBoolean"></field>
    /// <field name="_sendSucceeded" type="People.RecentActivity.Core.BiciBoolean"></field>
    /// <field name="_shareType" type="People.RecentActivity.Core.BiciShareType"></field>
    /// <field name="_shareEntryPoint" type="People.RecentActivity.Core.BiciShareEntryPoint"></field>
    /// <field name="_socialNetworkId" type="String"></field>
    /// <field name="_shareSourcePeopleApp" type="String"></field>
};


People.RecentActivity.UI.Share.ShareBici.prototype._hasData = false;
People.RecentActivity.UI.Share.ShareBici.prototype._hasNetworks = 0;
People.RecentActivity.UI.Share.ShareBici.prototype._messageLength = 0;
People.RecentActivity.UI.Share.ShareBici.prototype._changedNetworks = 0;
People.RecentActivity.UI.Share.ShareBici.prototype._clickedSend = 0;
People.RecentActivity.UI.Share.ShareBici.prototype._sendSucceeded = 0;
People.RecentActivity.UI.Share.ShareBici.prototype._shareType = 0;
People.RecentActivity.UI.Share.ShareBici.prototype._shareEntryPoint = 0;
People.RecentActivity.UI.Share.ShareBici.prototype._socialNetworkId = null;
People.RecentActivity.UI.Share.ShareBici.prototype._shareSourcePeopleApp = null;

Object.defineProperty(People.RecentActivity.UI.Share.ShareBici.prototype, "hasData", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the properties have been changed.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._hasData;
    }
});

Object.defineProperty(People.RecentActivity.UI.Share.ShareBici.prototype, "hasNetworks", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the user has networks connected.
        /// </summary>
        /// <value type="People.RecentActivity.Core.BiciBoolean"></value>
        return this._hasNetworks;
    },
    set: function(value) {
        this._hasData = true;
        this._hasNetworks = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Share.ShareBici.prototype, "messageLength", {
    get: function() {
        /// <summary>
        ///     Gets or sets the length of the user-provided message.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._messageLength;
    },
    set: function(value) {
        this._hasData = true;
        this._messageLength = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Share.ShareBici.prototype, "changedNetworks", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the user has changed networks.
        /// </summary>
        /// <value type="People.RecentActivity.Core.BiciBoolean"></value>
        return this._changedNetworks;
    },
    set: function(value) {
        this._hasData = true;
        this._changedNetworks = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Share.ShareBici.prototype, "clickedSend", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the user has clicked the send button.
        /// </summary>
        /// <value type="People.RecentActivity.Core.BiciBoolean"></value>
        return this._clickedSend;
    },
    set: function(value) {
        this._hasData = true;
        this._clickedSend = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Share.ShareBici.prototype, "sendSucceeded", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the user successfully sent the share.
        /// </summary>
        /// <value type="People.RecentActivity.Core.BiciBoolean"></value>
        return this._sendSucceeded;
    },
    set: function(value) {
        this._hasData = true;
        this._sendSucceeded = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Share.ShareBici.prototype, "shareType", {
    get: function() {
        /// <summary>
        ///     Gets or sets the type of share.
        /// </summary>
        /// <value type="People.RecentActivity.Core.BiciShareType"></value>
        return this._shareType;
    },
    set: function(value) {
        this._hasData = true;
        this._shareType = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Share.ShareBici.prototype, "shareEntryPoint", {
    get: function() {
        /// <summary>
        ///     Gets or sets the entry point for the current share.
        /// </summary>
        /// <value type="People.RecentActivity.Core.BiciShareEntryPoint"></value>
        return this._shareEntryPoint;
    },
    set: function(value) {
        this._hasData = true;
        this._shareEntryPoint = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Share.ShareBici.prototype, "socialNetworkId", {
    get: function() {
        /// <summary>
        ///     Gets or sets the final network that the user selected to share with.
        /// </summary>
        /// <value type="String"></value>
        return this._socialNetworkId;
    },
    set: function(value) {
        this._hasData = true;
        this._socialNetworkId = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Share.ShareBici.prototype, "shareSourcePeopleApp", {
    get: function() {
        /// <summary>
        ///     Gets or sets the name of the source app that is sharing with the People app.
        /// </summary>
        /// <value type="String"></value>
        return this._shareSourcePeopleApp;
    },
    set: function(value) {
        this._hasData = true;
        this._shareSourcePeopleApp = value;
    }
});

People.RecentActivity.UI.Share.ShareBici.prototype.resetHasData = function() {
    /// <summary>
    ///     This method resets the <see cref="P:People.RecentActivity.UI.Share.ShareBici.HasData" /> value to <c>false</c>.
    ///     This is useful for initialization to ensure that we are really detecting user actions.
    /// </summary>
    this._hasData = false;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciBoolean.js" />
/// <reference path="..\..\Core\BICI\BiciHelper.js" />
/// <reference path="..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Model\Events\ShareOperationActionCompletedEventArgs.js" />
/// <reference path="..\..\Model\Identity.js" />
/// <reference path="..\..\Model\ShareOperationParser.js" />
/// <reference path="..\..\Platform\SocialCapabilities.js" />
/// <reference path="..\Core\Controls\Control.js" />
/// <reference path="..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\Core\Html.js" />
/// <reference path="..\Core\Page.js" />
/// <reference path="Pages\ConnectPage.js" />
/// <reference path="Pages\ErrorPage.js" />
/// <reference path="Pages\LoadingPage.js" />
/// <reference path="Pages\SharePage.js" />
/// <reference path="Pages\SyncingPage.js" />
/// <reference path="ShareBici.js" />

People.RecentActivity.UI.Share.ShareLayout = function(element, shareOperation) {
    /// <summary>
    ///     Provides the main entry point for the share UI.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element to take over.</param>
    /// <param name="shareOperation" type="Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation">The current share operation context.</param>
    /// <field name="_shareOperation$1" type="Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation">The current share operation context.</field>
    /// <field name="_biciData$1" type="People.RecentActivity.UI.Share.ShareBici">The BICI data for the session.</field>
    /// <field name="_shareOperationParser$1" type="People.RecentActivity.ShareOperationParser">The share operation parser.</field>
    /// <field name="_identity$1" type="People.RecentActivity.Identity">The identity.</field>
    /// <field name="_capabilities$1" type="People.RecentActivity.Platform.SocialCapabilities">The capabilities of the current user.</field>
    /// <field name="_syncPage$1" type="People.RecentActivity.UI.Share.SyncingPage">The "no shares" content.</field>
    /// <field name="_connectPage$1" type="People.RecentActivity.UI.Share.ConnectPage">The "we're offline" content.</field>
    /// <field name="_loadingPage$1" type="People.RecentActivity.UI.Share.LoadingPage">The page shown when there is a delay getting data.</field>
    /// <field name="_errorPage$1" type="People.RecentActivity.UI.Share.ErrorPage">The page shown when there was an error getting data.</field>
    /// <field name="_sharePage$1" type="People.RecentActivity.UI.Share.SharePage">The share page.</field>
    /// <field name="_currentPage$1" type="People.RecentActivity.UI.Core.Page">The currently displayed page.</field>
    People.RecentActivity.UI.Core.Control.call(this, element);
    Debug.assert(shareOperation != null, 'shareOperation must not be null.');
    Debug.assert(shareOperation.data != null, 'shareOperation.Data must not be null.');
    Debug.assert(shareOperation.data.properties != null, 'shareOperation.Data.Properties must not be null.');
    this._identity$1 = People.RecentActivity.Identity.createMeIdentity();
    this._shareOperation$1 = shareOperation;
    this._biciData$1 = new People.RecentActivity.UI.Share.ShareBici();
    this._biciData$1.shareSourcePeopleApp = shareOperation.data.properties.applicationName;
    this._shareOperationParser$1 = new People.RecentActivity.ShareOperationParser(this._shareOperation$1.data, [ Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink ]);
    this._shareOperationParser$1.addListener("completed", this._onShareOperationParserCompleted$1, this);
    this._shareOperationParser$1.process(null);
    People.RecentActivity.Core.EtwHelper.writeSimpleEvent(People.RecentActivity.Core.EtwEventName.uiShareTargetPlatformSyncStart);
    this._capabilities$1 = this._identity$1.capabilities;
    // If we are already initialized, write the stop event.
    if (this._capabilities$1.initialized) {
        People.RecentActivity.Core.EtwHelper.writeSimpleEvent(People.RecentActivity.Core.EtwEventName.uiShareTargetPlatformSyncStop);
    }

    this._capabilities$1.addListener("propertychanged", this._onCapabilitiesPropertyChanged$1, this);
};

Jx.inherit(People.RecentActivity.UI.Share.ShareLayout, People.RecentActivity.UI.Core.Control);


People.RecentActivity.UI.Share.ShareLayout.prototype._shareOperation$1 = null;
People.RecentActivity.UI.Share.ShareLayout.prototype._biciData$1 = null;
People.RecentActivity.UI.Share.ShareLayout.prototype._shareOperationParser$1 = null;
People.RecentActivity.UI.Share.ShareLayout.prototype._identity$1 = null;
People.RecentActivity.UI.Share.ShareLayout.prototype._capabilities$1 = null;
People.RecentActivity.UI.Share.ShareLayout.prototype._syncPage$1 = null;
People.RecentActivity.UI.Share.ShareLayout.prototype._connectPage$1 = null;
People.RecentActivity.UI.Share.ShareLayout.prototype._loadingPage$1 = null;
People.RecentActivity.UI.Share.ShareLayout.prototype._errorPage$1 = null;
People.RecentActivity.UI.Share.ShareLayout.prototype._sharePage$1 = null;
People.RecentActivity.UI.Share.ShareLayout.prototype._currentPage$1 = null;

People.RecentActivity.UI.Share.ShareLayout.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    Jx.log.write(4, 'People.RecentActivity.UI.Share.ShareLayout.OnDisposed');
    // This is our last chance to log the BICI data.
    this._logBiciData$1();
    if (this._capabilities$1 != null) {
        this._capabilities$1.removeListenerSafe("propertychanged", this._onCapabilitiesPropertyChanged$1, this);
        this._capabilities$1 = null;
    }

    if (this._identity$1 != null) {
        this._identity$1.dispose();
        this._identity$1 = null;
    }

    if (this._shareOperationParser$1 != null) {
        this._shareOperationParser$1.removeListenerSafe("completed", this._onShareOperationParserCompleted$1, this);
        this._shareOperationParser$1 = null;
    }

    this._currentPage$1 = null;
    if (this._sharePage$1 != null) {
        this._sharePage$1.dispose();
        this._sharePage$1 = null;
    }

    if (this._connectPage$1 != null) {
        this._connectPage$1.dispose();
        this._connectPage$1 = null;
    }

    if (this._syncPage$1 != null) {
        this._syncPage$1.dispose();
        this._syncPage$1 = null;
    }

    if (this._loadingPage$1 != null) {
        this._loadingPage$1.dispose();
        this._loadingPage$1 = null;
    }

    if (this._errorPage$1 != null) {
        this._errorPage$1.dispose();
        this._errorPage$1 = null;
    }

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Share.ShareLayout.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
    Jx.log.write(4, 'People.RecentActivity.UI.Share.ShareLayout.OnRendered');
    // Create the container
    var element = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.shareLayout);
    this.element.appendChild(element);
    // Initialize the children, but don't render them.
    this._sharePage$1 = new People.RecentActivity.UI.Share.SharePage(this._identity$1, this._shareOperation$1, this._biciData$1);
    element.appendChild(this._sharePage$1.element);
    this._connectPage$1 = new People.RecentActivity.UI.Share.ConnectPage();
    element.appendChild(this._connectPage$1.element);
    this._syncPage$1 = new People.RecentActivity.UI.Share.SyncingPage();
    element.appendChild(this._syncPage$1.element);
    this._loadingPage$1 = new People.RecentActivity.UI.Share.LoadingPage(this._shareOperation$1.data.properties);
    element.appendChild(this._loadingPage$1.element);
    this._errorPage$1 = new People.RecentActivity.UI.Share.ErrorPage();
    element.appendChild(this._errorPage$1.element);
    // Hide all of the content pages until they are needed.
    this._sharePage$1.isVisible = false;
    this._connectPage$1.isVisible = false;
    this._syncPage$1.isVisible = false;
    this._loadingPage$1.isVisible = false;
    this._errorPage$1.isVisible = false;
    this._setContentPage$1();
};

People.RecentActivity.UI.Share.ShareLayout.prototype._setContentPage$1 = function() {
    /// <summary>
    ///     Determine which content to show in the layout.
    /// </summary>
    if (this.isRendered) {
        if (!this._identity$1.capabilities.initialized) {
            this._switchPage$1(this._syncPage$1);
        }
        else if (!this._identity$1.capabilities.canShare) {
            this._biciData$1.hasNetworks = People.RecentActivity.Core.BiciBoolean.biciFalse;
            if (Jx.isNonEmptyString(this._shareOperation$1.quickLinkId)) {
                // The user has a leftover quicklink, remove it.
                this._shareOperation$1.removeThisQuickLink();
            }

            this._switchPage$1(this._connectPage$1);
        }
        else if (this._shareOperationParser$1.result === People.RecentActivity.Core.ResultCode.none) {
            this._switchPage$1(this._loadingPage$1);
        }
        else if (this._shareOperationParser$1.result !== People.RecentActivity.Core.ResultCode.success) {
            this._switchPage$1(this._errorPage$1);
        }
        else {
            this._biciData$1.hasNetworks = People.RecentActivity.Core.BiciBoolean.biciTrue;
            this._sharePage$1.shareInfo = this._shareOperationParser$1.shareInfo;
            this._switchPage$1(this._sharePage$1);
        }    
    }
};

People.RecentActivity.UI.Share.ShareLayout.prototype._switchPage$1 = function(next) {
    /// <summary>
    ///     Animate the switch to the correct page.
    /// </summary>
    /// <param name="next" type="People.RecentActivity.UI.Core.Page">The page to switch to.</param>
    var that = this;
    
    Debug.assert(next != null, 'next must not be null.');
    if (next === this._currentPage$1) {
        // We are already displaying the current page, just return.
        return;
    }

    // Make the element visible, render it, then hide it again.
    if (!next.isRendered) {
        next.isVisible = true;
        next.render();
        next.isVisible = false;
    }

    var exitAnimation = WinJS.Promise.wrap(null);
    if (this._currentPage$1 != null) {
        exitAnimation = this._currentPage$1.exit();
    }

    exitAnimation.done(function() {
        if (that.isDisposed) {
            return null;
        }

        that._currentPage$1 = next;
        return that._currentPage$1.enter();
    });
};

People.RecentActivity.UI.Share.ShareLayout.prototype._onCapabilitiesPropertyChanged$1 = function(args) {
    /// <param name="args" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    var capabilities = args.sender;
    switch (args.propertyName) {
        case 'Initialized':
            if (capabilities.initialized) {
                People.RecentActivity.Core.EtwHelper.writeSimpleEvent(People.RecentActivity.Core.EtwEventName.uiShareTargetPlatformSyncStop);
            }

            this._setContentPage$1();
            break;
        case 'CanShare':
            this._setContentPage$1();
            break;
    }

    Jx.log.write(4, People.Social.format('ShareLayout.OnCapabilitiesPropertyChanged(PropertyName: {0}, Initialized: {1}, CanShare: {2})', args.propertyName, capabilities.initialized, capabilities.canShare));
};

People.RecentActivity.UI.Share.ShareLayout.prototype._onShareOperationParserCompleted$1 = function(args) {
    /// <param name="args" type="People.RecentActivity.ShareOperationActionCompletedEventArgs"></param>
    this._setContentPage$1();
};

People.RecentActivity.UI.Share.ShareLayout.prototype._logBiciData$1 = function() {
    /// <summary>
    ///     Log the current BICI data.
    /// </summary>
    if (this._biciData$1 != null) {
        var biciData = this._biciData$1;
        People.RecentActivity.Core.BiciHelper.createShareDatapoint(biciData.hasNetworks, biciData.messageLength, biciData.changedNetworks, biciData.clickedSend, biciData.sendSucceeded, biciData.shareType, biciData.shareEntryPoint, biciData.socialNetworkId, biciData.shareSourcePeopleApp);
    }
};
});