
//! Copyright (c) Microsoft Corporation. All rights reserved.

Jx.delayDefine(People, "loadSocialCore", function () {

People.loadSocialCore = Jx.fnEmpty;

People.Social.loadUtilities();

/// <disable>JS2076.IdentifierIsMiscased</disable>
var InstruIds = Microsoft.WindowsLive.Instrumentation.Ids;
/// <enable>JS2076.IdentifierIsMiscased</enable>

;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_annotationInfo = function(type, data) {
    var o = { };
    o.type = type;
    o.data = data;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the type of an annotation.
/// </summary>
People.RecentActivity.Core.AnnotationInfoType = {
    /// <field name="unknown" type="Number" integer="true" static="true">An unknown annotation.</field>
    unknown: 0,
    /// <field name="wallPost" type="Number" integer="true" static="true">A wall post.</field>
    wallPost: 1,
    /// <field name="retweetedBy" type="Number" integer="true" static="true">Retweeted by a given person.</field>
    retweetedBy: 2,
    /// <field name="inReplyTo" type="Number" integer="true" static="true">In reply to a given person.</field>
    inReplyTo: 3
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_annotationRetweetInfo = function(publisher, text) {
    var o = { };
    Debug.assert(publisher != null, 'publisher != null');
    Debug.assert(Jx.isNonEmptyString(text), '!string.IsNullOrEmpty(text)');
    o.publisher = publisher;
    o.text = text;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Provides a boolean type for BICI.
/// </summary>
People.RecentActivity.Core.BiciBoolean = {
    /// <field name="biciFalse" type="Number" integer="true" static="true">False outcome.</field>
    biciFalse: 0,
    /// <field name="biciTrue" type="Number" integer="true" static="true">True outcome.</field>
    biciTrue: 1
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Provides the click-through action types for BICI reporting.
/// </summary>
People.RecentActivity.Core.BiciClickthroughAction = {
    /// <field name="viewProfile" type="Number" integer="true" static="true">The view profile action.</field>
    viewProfile: 1,
    /// <field name="feedEntryNetworkIcon" type="Number" integer="true" static="true">The network icon on a feed entry.</field>
    feedEntryNetworkIcon: 2,
    /// <field name="selfPageReactionCount" type="Number" integer="true" static="true">The reaction count button on the self-page.</field>
    selfPageReactionCount: 3,
    /// <field name="selfPageViewOnNetwork" type="Number" integer="true" static="true">The "view on network" button on the self-page.</field>
    selfPageViewOnNetwork: 4,
    /// <field name="unsupportedNotification" type="Number" integer="true" static="true">An unsupported notification.</field>
    unsupportedNotification: 5,
    /// <field name="selfPageGetFeedObjectFailed" type="Number" integer="true" static="true">The GetFeedObject() call failed on the self-page.</field>
    selfPageGetFeedObjectFailed: 6
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="BiciBoolean.js" />
/// <reference path="BiciClickthroughAction.js" />
/// <reference path="BiciLiveCommApiNames.js" />
/// <reference path="BiciPageNames.js" />
/// <reference path="BiciReactionTypes.js" />
/// <reference path="BiciReactionUpdate.js" />
/// <reference path="BiciShareEntryPoint.js" />
/// <reference path="BiciShareType.js" />
/// <reference path="BiciThirdPartyApiCallNames.js" />
/// <reference path="BiciThirdPartyScenarioType.js" />
/// <reference path="BiciThirdPartySourceId.js" />

People.RecentActivity.Core.BiciHelper = function() {
    /// <summary>
    ///     Provides helper methods for BICI.
    /// </summary>
    /// <field name="_sandboxHost" type="String" static="true">The value to use for the "SandboxHost" attribute.</field>
    /// <field name="_disabled" type="Boolean" static="true">Whether Bici instrumentation is disabled.</field>
    /// <field name="_sourceIdMap" type="Object" static="true">Provides a map from string source id to bici source id enum.</field>
    /// <field name="_currentPage" type="People.RecentActivity.Core.BiciPageNames" static="true">The current page.</field>
};

People.RecentActivity.Core.BiciHelper._sandboxHost = 'WinPeople';
People.RecentActivity.Core.BiciHelper._disabled = false;
People.RecentActivity.Core.BiciHelper._sourceIdMap = null;
People.RecentActivity.Core.BiciHelper._currentPage = 0;

Object.defineProperty(People.RecentActivity.Core.BiciHelper, "_isEnabled", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether BICI is enabled.
        /// </summary>
        /// <value type="Boolean"></value>
        return !People.RecentActivity.Core.BiciHelper._disabled && (Jx.bici != null);
    }
});

People.RecentActivity.Core.BiciHelper.setCurrentPageName = function(page) {
    /// <summary>
    ///     Sets the current page name.
    /// </summary>
    /// <param name="page" type="People.RecentActivity.Core.BiciPageNames">The page.</param>
    People.RecentActivity.Core.BiciHelper._currentPage = page;
};

People.RecentActivity.Core.BiciHelper.createClickThroughDatapoint = function(networkId, action) {
    /// <summary>
    ///     Creates a datapoint value for a click-through action.
    /// </summary>
    /// <param name="networkId" type="String">The network ID.</param>
    /// <param name="action" type="People.RecentActivity.Core.BiciClickthroughAction">The action.</param>
    Jx.log.write(4, 'BiciHelper.CreateClickThroughDatapoint(' + networkId + ',' + action + ')');
    if (People.RecentActivity.Core.BiciHelper._isEnabled) {
        Jx.bici.addToStream(InstruIds.People.peopleClickthrough, networkId, People.RecentActivity.Core.BiciHelper._currentPage, action);
    }
};

People.RecentActivity.Core.BiciHelper.createPageViewDatapoint = function(networkId) {
    /// <summary>
    ///     Creates a datapoint value for a page view.
    /// </summary>
    /// <param name="networkId" type="String">The network ID.</param>
    Jx.log.write(4, 'BiciHelper.CreatePageViewDataPoint(' + networkId + ')');
    if (People.RecentActivity.Core.BiciHelper._isEnabled) {
        Jx.bici.addToStream(InstruIds.People.socialPageViewed, networkId, People.RecentActivity.Core.BiciHelper._currentPage);
    }
};

People.RecentActivity.Core.BiciHelper.createReactionUpdateDatapoint = function(networkId, update, type) {
    /// <summary>
    ///     Creates a datapoint value for a reaction update.
    /// </summary>
    /// <param name="networkId" type="String">The network ID.</param>
    /// <param name="update" type="People.RecentActivity.Core.BiciReactionUpdate">The update.</param>
    /// <param name="type" type="People.RecentActivity.Core.BiciReactionTypes">The type.</param>
    Jx.log.write(4, 'BiciHelper.CreateReactionUpdateDatapoint(' + networkId + ',' + update + ',' + type + ')');
    if (People.RecentActivity.Core.BiciHelper._isEnabled) {
        Jx.bici.addToStream(InstruIds.People.socialReactionUpdated, networkId, People.RecentActivity.Core.BiciHelper._currentPage, update, type);
    }
};

People.RecentActivity.Core.BiciHelper.createShareDatapoint = function(hasNetworks, messageLength, changedNetworks, clickedSend, sendSucceeded, shareType, shareEntryPoint, socialNetworkId, shareSourcePeopleApp) {
    /// <summary>
    ///     Creates a datapoint for user shares via the people app.
    /// </summary>
    /// <param name="hasNetworks" type="People.RecentActivity.Core.BiciBoolean">Whether the user has networks with which to share.</param>
    /// <param name="messageLength" type="Number" integer="true">The length of the user-provided message.</param>
    /// <param name="changedNetworks" type="People.RecentActivity.Core.BiciBoolean">Whether the user changed the default network.</param>
    /// <param name="clickedSend" type="People.RecentActivity.Core.BiciBoolean">Whether the user clicked send.</param>
    /// <param name="sendSucceeded" type="People.RecentActivity.Core.BiciBoolean">Whether the send succeeded.</param>
    /// <param name="shareType" type="People.RecentActivity.Core.BiciShareType">The type of share the user performed.</param>
    /// <param name="shareEntryPoint" type="People.RecentActivity.Core.BiciShareEntryPoint">The share entry point.</param>
    /// <param name="socialNetworkId" type="String">The ID of the network that the user had selected.</param>
    /// <param name="shareSourcePeopleApp" type="String">The source of the current share (app name).</param>
    Jx.log.write(4, 'BiciHelper.CreateShareDatapoint(' + hasNetworks + ',' + messageLength + ',' + changedNetworks + ',' + clickedSend + ',' + sendSucceeded + ',' + shareType + ',' + shareEntryPoint + ',' + socialNetworkId + ',' + shareSourcePeopleApp + ')');
    if (People.RecentActivity.Core.BiciHelper._isEnabled) {
        Jx.bici.addToStream(InstruIds.People.socialShare, hasNetworks, messageLength, changedNetworks, clickedSend, sendSucceeded, shareType, shareEntryPoint, socialNetworkId, shareSourcePeopleApp);
    }
};

People.RecentActivity.Core.BiciHelper.createHttpCallCompleteDatapoint = function(networkId, api, hResult, duration) {
    /// <summary>
    ///     Creates a datapoint value for HttpCallComplete.
    /// </summary>
    /// <param name="networkId" type="String">The network id.</param>
    /// <param name="api" type="People.RecentActivity.Core.BiciLiveCommApiNames">The API.</param>
    /// <param name="hResult" type="Number" integer="true">The hresult.</param>
    /// <param name="duration" type="Number" integer="true">The request duration.</param>
    Jx.log.write(4, 'BiciHelper.CreateHttpCallCompleteDatapoint(' + networkId + ',' + api + ',' + hResult + ',' + duration + ')');
    if (People.RecentActivity.Core.BiciHelper._isEnabled) {
        Jx.bici.addToStream(InstruIds.General.httpCallComplete, networkId, api, hResult, duration);
    }
};

People.RecentActivity.Core.BiciHelper.createThirdPartyAPICallDatapoint = function(networkId, api, httpResultCode, scenarioType) {
    /// <summary>
    ///     Creates the third party API call datapoint.
    /// </summary>
    /// <param name="networkId" type="String">The network id.</param>
    /// <param name="api" type="People.RecentActivity.Core.BiciThirdPartyApiCallNames">The API.</param>
    /// <param name="httpResultCode" type="Number" integer="true">The HTTP result code.</param>
    /// <param name="scenarioType" type="People.RecentActivity.Core.BiciThirdPartyScenarioType">The scenario type.</param>
    Jx.log.write(4, 'BiciHelper.CreateThirdPartyAPICallDatapoint(' + networkId + ',' + api + ',' + httpResultCode + ',' + scenarioType + ')');
    if (People.RecentActivity.Core.BiciHelper._isEnabled) {
        Jx.bici.addToStream(InstruIds.General.thirdPartyAPICall3, api, httpResultCode, Jx.bici.getApplicationId(), People.RecentActivity.Core.BiciHelper._getBiciSourceId(networkId), 'WinPeople', People.RecentActivity.Core.BiciHelper._getBiciAppId(networkId), scenarioType);
    }
};

People.RecentActivity.Core.BiciHelper.recordDependentApiQos = function(scenarioId, apiId, propertyId, durationInMilliseconds, requestSizeInBytes, errorCode, errorType, transactionId) {
    /// <summary>
    ///     Reports QOS for a dependent API.
    /// </summary>
    /// <param name="scenarioId" type="Microsoft.WindowsLive.Instrumentation.ScenarioId">The scenario ID for the report.</param>
    /// <param name="apiId" type="Microsoft.WindowsLive.Instrumentation.ApiId">The API ID for the report.</param>
    /// <param name="propertyId" type="Microsoft.WindowsLive.Instrumentation.PropertyId">The reporting property ID.</param>
    /// <param name="durationInMilliseconds" type="Number" integer="true">The request duration in milliseconds.</param>
    /// <param name="requestSizeInBytes" type="Number" integer="true">The request size in bytes.</param>
    /// <param name="errorCode" type="Number" integer="true">The error code value.</param>
    /// <param name="errorType" type="Microsoft.WindowsLive.Instrumentation.ErrorType">The type of error encountered.</param>
    /// <param name="transactionId" type="Microsoft.WindowsLive.Instrumentation.TransactionId">The ID of the transaction.</param>
    Jx.log.write(4, 'BiciHelper.RecordDependentApiQos(' + scenarioId + ',' + apiId + ',' + propertyId + ',' + durationInMilliseconds + ',' + requestSizeInBytes + ',' + errorCode + ',' + errorType + ')');
    if (People.RecentActivity.Core.BiciHelper._isEnabled) {
        Jx.bici.recordDependentApiQos(scenarioId, apiId, propertyId, durationInMilliseconds, requestSizeInBytes, errorCode, errorType, transactionId);
    }
};

People.RecentActivity.Core.BiciHelper.recordScenarioQos = function(scenarioId, durationInMilliseconds, requestSizeInBytes, errorCode, errorType, transactionId) {
    /// <summary>
    ///     Reports QOS for a scenario.
    /// </summary>
    /// <param name="scenarioId" type="Microsoft.WindowsLive.Instrumentation.ScenarioId">The scenario ID for the report.</param>
    /// <param name="durationInMilliseconds" type="Number" integer="true">The request duration in milliseconds.</param>
    /// <param name="requestSizeInBytes" type="Number" integer="true">The request size in bytes.</param>
    /// <param name="errorCode" type="Number" integer="true">The error code value.</param>
    /// <param name="errorType" type="Microsoft.WindowsLive.Instrumentation.ErrorType">The type of error encountered.</param>
    /// <param name="transactionId" type="Microsoft.WindowsLive.Instrumentation.TransactionId">The ID of the transaction.</param>
    Jx.log.write(4, 'BiciHelper.RecordScenarioQos(' + scenarioId + ',' + durationInMilliseconds + ',' + requestSizeInBytes + ',' + errorCode + ',' + errorType + ')');
    if (People.RecentActivity.Core.BiciHelper._isEnabled) {
        Jx.bici.recordScenarioQos(scenarioId, durationInMilliseconds, requestSizeInBytes, errorCode, errorType, transactionId);
    }
};

People.RecentActivity.Core.BiciHelper.disableUploads = function() {
    /// <summary>
    ///     Disables BICI uploads. Useful for testing.
    /// </summary>
    People.RecentActivity.Core.BiciHelper._disabled = true;
    try {
        Windows.Storage.ApplicationData.current.localSettings.values.insert('Microsoft.WindowsLive.Bici.UploadDisabled', true);
    }
    catch (e) {
        // could not disable uploads, which is expected in IE (there is no WinRT).
        Jx.log.write(3, 'Failed to disable BICI/SQM uploads. This is expected in IE. (Error=' + e.toString() + ')');
    }
};

People.RecentActivity.Core.BiciHelper.enableUploads = function() {
    /// <summary>
    ///     Enables BICI uploads. Useful for testing.
    /// </summary>
    People.RecentActivity.Core.BiciHelper._disabled = false;
    try {
        Windows.Storage.ApplicationData.current.localSettings.values.remove('Microsoft.WindowsLive.Bici.UploadDisabled');
    }
    catch (e) {
        // could not disable uploads, which is expected in IE (there is no WinRT).
        Jx.log.write(3, 'Failed to enable BICI/SQM uploads. This is expected in IE. (Error=' + e.toString() + ')');
    }
};

People.RecentActivity.Core.BiciHelper._getBiciSourceId = function(sourceId) {
    /// <param name="sourceId" type="String"></param>
    /// <returns type="People.RecentActivity.Core.BiciThirdPartySourceId"></returns>
    Debug.assert(Jx.isNonEmptyString(sourceId), 'sourceId');
    if (People.RecentActivity.Core.BiciHelper._sourceIdMap == null) {
        People.RecentActivity.Core.BiciHelper._sourceIdMap = {};
        People.RecentActivity.Core.BiciHelper._sourceIdMap['FB'] = 2;
        People.RecentActivity.Core.BiciHelper._sourceIdMap['TWITR'] = 3;
    }

    if (!Jx.isUndefined(People.RecentActivity.Core.BiciHelper._sourceIdMap[sourceId])) {
        return People.RecentActivity.Core.BiciHelper._sourceIdMap[sourceId];
    }

    return 0;
};

People.RecentActivity.Core.BiciHelper._getBiciAppId = function(sourceId) {
    /// <param name="sourceId" type="String"></param>
    /// <returns type="Number" integer="true"></returns>
    if (sourceId === 'FB') {
        return 1140906031;
    }

    Debug.assert(false, People.Social.format("We should only try to get the BICI app ID for '{0},' we tried to get it for '{1}'", 'FB', sourceId));
    return 0;
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     The Bici Live Comm API names.
/// </summary>
/// <field name="none" type="Number" integer="true" static="true">Not applicable.</field>
/// <field name="fqlGetActivity" type="Number" integer="true" static="true">The FQL request to get a single activity.</field>
/// <field name="fqlGetActivities" type="Number" integer="true" static="true">The FQL request to get recent activities.</field>
/// <field name="fqlGetActivities2" type="Number" integer="true" static="true">The second request to get recent activities. (Get photo or album info if applicable to display the feed.)</field>
/// <field name="fqlGetContactsActivities" type="Number" integer="true" static="true">The FQL request to get What's New activities.</field>
/// <field name="fqlGetContactsActivities2" type="Number" integer="true" static="true">The second request to get What's New activities. (Get photo or album info if applicable to display the feed.)</field>
/// <field name="fqlGetNotifications" type="Number" integer="true" static="true">The FQL request to get notifications.</field>
/// <field name="fqlGetNotifications2" type="Number" integer="true" static="true">The second request to get notifications.</field>
/// <field name="fqlGetLikes" type="Number" integer="true" static="true">The FQL request to get likes.</field>
/// <field name="fqlGetComments" type="Number" integer="true" static="true">The FQL request to get comments.</field>
/// <field name="graphPostComment" type="Number" integer="true" static="true">The Graph request to post a comment.</field>
/// <field name="graphDeleteLike" type="Number" integer="true" static="true">The Graph request to delete a like.</field>
/// <field name="graphPostLike" type="Number" integer="true" static="true">The Graph request to post a like.</field>
/// <field name="fqlGetPhoto" type="Number" integer="true" static="true">The FQL request to get a single photo.</field>
/// <field name="fqlGetPhotos" type="Number" integer="true" static="true">The FQL request to get photos in an album.</field>
/// <field name="fqlGetAlbum" type="Number" integer="true" static="true">The FQL request to get a single album.</field>
/// <field name="fqlGetAlbums" type="Number" integer="true" static="true">The FQL request to get albums.</field>
/// <field name="legacyApiMarkNotificationRead" type="Number" integer="true" static="true">The Facebook REST request to mark a notification as read.</field>
/// <field name="supGetActivity" type="Number" integer="true" static="true">The SUP request to get a single activity.</field>
/// <field name="supGetWhatsNewActivities" type="Number" integer="true" static="true">The SUP request to get What's New activities.</field>
/// <field name="supGetRecentActivities" type="Number" integer="true" static="true">The SUP request to get recent activities.</field>
/// <field name="supGetRetweets" type="Number" integer="true" static="true">The SUP request to get retweets.</field>
/// <field name="supGetAtReplies" type="Number" integer="true" static="true">The SUP request to get at replies.</field>
/// <field name="supGetFavorite" type="Number" integer="true" static="true">The SUP request to get favorite.</field>
/// <field name="supPostRetweet" type="Number" integer="true" static="true">The SUP request to post a retweet.</field>
/// <field name="supDeleteRetweet" type="Number" integer="true" static="true">The SUP request to delete a retweet.</field>
/// <field name="supPostAtReply" type="Number" integer="true" static="true">The SUP request to post a reply.</field>
/// <field name="supPostFavorite" type="Number" integer="true" static="true">The SUP request to add a favorite.</field>
/// <field name="supDeleteFavorite" type="Number" integer="true" static="true">The SUP request to delete a favorite.</field>
/// <field name="graphPostActivity" type="Number" integer="true" static="true">The Graph request to post a feed entry.</field>
/// <field name="shareAnythingPostActivity" type="Number" integer="true" static="true">The Share Anything request to post a feed entry.</field>
/// <field name="supGetNotifications" type="Number" integer="true" static="true">The SUP request to get notifications.</field>
/// <field name="fqlGetUnreadNotificationCount" type="Number" integer="true" static="true">The Fql request to get number of unread notifications.</field>
/// <field name="fqlGetMoreActivities" type="Number" integer="true" static="true">The FQL request to get more recent activities.</field>
/// <field name="fqlGetMoreActivities2" type="Number" integer="true" static="true">The second request to get more recent activities. (Get photo or album info if applicable to display the feed.)</field>
/// <field name="fqlGetMoreContactsActivities" type="Number" integer="true" static="true">The FQL request to get more What's New activities.</field>
/// <field name="fqlGetMoreContactsActivities2" type="Number" integer="true" static="true">The second request to get more What's New activities. (Get photo or album info if applicable to display the feed.)</field>
/// <field name="supGetMoreWhatsNewActivities" type="Number" integer="true" static="true">The SUP request to get more What's New activities.</field>
/// <field name="supGetMoreRecentActivities" type="Number" integer="true" static="true">The SUP request to get more recent activities.</field>
People.RecentActivity.Core.BiciLiveCommApiNames = {
    none: 0, 
    fqlGetActivity: 2, 
    fqlGetActivities: 3, 
    fqlGetActivities2: 4, 
    fqlGetContactsActivities: 5, 
    fqlGetContactsActivities2: 6, 
    fqlGetNotifications: 7, 
    fqlGetNotifications2: 8, 
    fqlGetLikes: 9, 
    fqlGetComments: 10, 
    graphPostComment: 11, 
    graphDeleteLike: 12, 
    graphPostLike: 13, 
    fqlGetPhoto: 14, 
    fqlGetPhotos: 15, 
    fqlGetAlbum: 16, 
    fqlGetAlbums: 17, 
    legacyApiMarkNotificationRead: 18, 
    supGetActivity: 19, 
    supGetWhatsNewActivities: 20, 
    supGetRecentActivities: 21, 
    supGetRetweets: 22, 
    supGetAtReplies: 23, 
    supGetFavorite: 24, 
    supPostRetweet: 25, 
    supDeleteRetweet: 26, 
    supPostAtReply: 27, 
    supPostFavorite: 28, 
    supDeleteFavorite: 29, 
    graphPostActivity: 41, 
    shareAnythingPostActivity: 42, 
    supGetNotifications: 43, 
    fqlGetUnreadNotificationCount: 45, 
    fqlGetMoreActivities: 46, 
    fqlGetMoreActivities2: 47, 
    fqlGetMoreContactsActivities: 48, 
    fqlGetMoreContactsActivities2: 49, 
    supGetMoreWhatsNewActivities: 50, 
    supGetMoreRecentActivities: 51
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the page names for BICI reporting.
/// </summary>
People.RecentActivity.Core.BiciPageNames = {
    /// <field name="none" type="Number" integer="true" static="true">No page name.</field>
    none: 0,
    /// <field name="recentActivity" type="Number" integer="true" static="true">The recent activity feed of a person.</field>
    recentActivity: 1,
    /// <field name="whatsNew" type="Number" integer="true" static="true">The What's New feed.</field>
    whatsNew: 2,
    /// <field name="photosTab" type="Number" integer="true" static="true">The photos tab.</field>
    photosTab: 3,
    /// <field name="notifications" type="Number" integer="true" static="true">The notifications page.</field>
    notifications: 4,
    /// <field name="selfPageText" type="Number" integer="true" static="true">The text self-page.</field>
    selfPageText: 5,
    /// <field name="selfPageLink" type="Number" integer="true" static="true">The link self-page.</field>
    selfPageLink: 6,
    /// <field name="selfPagePhotoAlbum" type="Number" integer="true" static="true">The photo album self-page.</field>
    selfPagePhotoAlbum: 7,
    /// <field name="selfPagePhoto" type="Number" integer="true" static="true">The photo self-page.</field>
    selfPagePhoto: 8,
    /// <field name="selfPageVideo" type="Number" integer="true" static="true">The video self-page.</field>
    selfPageVideo: 9
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Provides the reaction types for BICI reporting.
/// </summary>
People.RecentActivity.Core.BiciReactionTypes = {
    /// <field name="comment" type="Number" integer="true" static="true">A comment.</field>
    comment: 0,
    /// <field name="like" type="Number" integer="true" static="true">A like.</field>
    like: 1,
    /// <field name="favorite" type="Number" integer="true" static="true">A favorite.</field>
    favorite: 2,
    /// <field name="retweet" type="Number" integer="true" static="true">A retweet.</field>
    retweet: 3
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Provides the reaction updates for BICI reporting.
/// </summary>
/// <field name="add" type="Number" integer="true" static="true">Adding a reaction.</field>
/// <field name="remove" type="Number" integer="true" static="true">Removing a reaction.</field>
People.RecentActivity.Core.BiciReactionUpdate = {
    add: 0, 
    remove: 1
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Provides the share entry points for BICI reporting.
/// </summary>
People.RecentActivity.Core.BiciShareEntryPoint = {
    /// <field name="inApp" type="Number" integer="true" static="true">The share was initiated via the main app.</field>
    inApp: 0,
    /// <field name="shareCharm" type="Number" integer="true" static="true">The share was initiated via the share charm.</field>
    shareCharm: 1,
    /// <field name="quickLink" type="Number" integer="true" static="true">The share was initiated via a quick link in the share charm.</field>
    quickLink: 2
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Provides the share types for BICI reporting.
/// </summary>
People.RecentActivity.Core.BiciShareType = {
    /// <field name="link" type="Number" integer="true" static="true">A link.</field>
    link: 0,
    /// <field name="text" type="Number" integer="true" static="true">Text message.</field>
    text: 1
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     The Bici third party API names.
/// </summary>
/// <field name="unknown" type="Number" integer="true" static="true">Unknown API call name.</field>
/// <field name="fqlGetActivities" type="Number" integer="true" static="true">The FQL request to get recent activities.</field>
/// <field name="fqlGetActivities2" type="Number" integer="true" static="true">The second request to get recent activities.(Get extra photo or album info if applicable to display the feed.)</field>
/// <field name="fqlGetActivity" type="Number" integer="true" static="true">The request to get a single activity.</field>
/// <field name="fqlGetAlbum" type="Number" integer="true" static="true">The request to get a single album.</field>
/// <field name="fqlGetAlbums" type="Number" integer="true" static="true">The request to get albums.</field>
/// <field name="fqlGetComments" type="Number" integer="true" static="true">The request to get comments.</field>
/// <field name="fqlGetContactsActivities" type="Number" integer="true" static="true">The FQL request to get What's New activities.</field>
/// <field name="fqlGetContactsActivities2" type="Number" integer="true" static="true">The second request to get What's New activities. (Get photo or album info if applicable to display the feed.)</field>
/// <field name="fqlGetLikes" type="Number" integer="true" static="true">The FQL request to get likes.</field>
/// <field name="fqlGetNotifications" type="Number" integer="true" static="true">The FQL request to get notifications.</field>
/// <field name="fqlGetNotifications2" type="Number" integer="true" static="true">The second request to get notifications.</field>
/// <field name="fqlGetPhoto" type="Number" integer="true" static="true">The FQL request to get a single photo.</field>
/// <field name="fqlGetPhotos" type="Number" integer="true" static="true">The FQL request to get photos in an album.</field>
/// <field name="graphDeleteLike" type="Number" integer="true" static="true">The Graph request to delete a like.</field>
/// <field name="graphPostActivity" type="Number" integer="true" static="true">The Graph request to post an activity.</field>
/// <field name="graphPostComment" type="Number" integer="true" static="true">The Graph request to post a comment.</field>
/// <field name="graphPostLike" type="Number" integer="true" static="true">The Graph request to post a like.</field>
/// <field name="legacyApiMarkNotificationRead" type="Number" integer="true" static="true">The Facebook REST request to mark a notification as read.</field>
/// <field name="fqlGetUnreadNotificationCount" type="Number" integer="true" static="true">The Fql request to get number of unread notifications.</field>
/// <field name="fqlGetMoreActivities" type="Number" integer="true" static="true">The FQL request to get more recent activities.</field>
/// <field name="fqlGetMoreActivities2" type="Number" integer="true" static="true">The second request to get recent activities.(Get extra photo or album info if applicable to display the feed.)</field>
/// <field name="fqlGetMoreContactsActivities" type="Number" integer="true" static="true">The FQL request to get What's New activities.</field>
/// <field name="fqlGetMoreContactsActivities2" type="Number" integer="true" static="true">The second request to get What's New activities. (Get photo or album info if applicable to display the feed.)</field>
People.RecentActivity.Core.BiciThirdPartyApiCallNames = {
    unknown: 0, 
    fqlGetActivities: 3, 
    fqlGetActivities2: 4, 
    fqlGetActivity: 5, 
    fqlGetAlbum: 6, 
    fqlGetAlbums: 7, 
    fqlGetComments: 8, 
    fqlGetContactsActivities: 9, 
    fqlGetContactsActivities2: 10, 
    fqlGetLikes: 11, 
    fqlGetNotifications: 12, 
    fqlGetNotifications2: 13, 
    fqlGetPhoto: 14, 
    fqlGetPhotos: 15, 
    graphDeleteLike: 22, 
    graphPostActivity: 25, 
    graphPostComment: 26, 
    graphPostLike: 27, 
    legacyApiMarkNotificationRead: 28, 
    fqlGetUnreadNotificationCount: 31, 
    fqlGetMoreActivities: 32, 
    fqlGetMoreActivities2: 33, 
    fqlGetMoreContactsActivities: 34, 
    fqlGetMoreContactsActivities2: 35
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     The BICI third party scenario types.
/// </summary>
/// <field name="unknown" type="Number" integer="true" static="true">Unknown scenario type.</field>
/// <field name="feeds" type="Number" integer="true" static="true">Feeds scenario type.</field>
/// <field name="photos" type="Number" integer="true" static="true">Photos scenario type.</field>
/// <field name="readNotifications" type="Number" integer="true" static="true">Read notifications scenario type.</field>
/// <field name="writeNotifications" type="Number" integer="true" static="true">Write notifications scenario type.</field>
/// <field name="readActivityReactions" type="Number" integer="true" static="true">Read activity reactions scenario type.</field>
/// <field name="writeActivityReactions" type="Number" integer="true" static="true">Write activity reactions scenario type.</field>
/// <field name="publishStatus" type="Number" integer="true" static="true">Publish status scenario type.</field>
/// <field name="readFile" type="Number" integer="true" static="true">Read file scenario type.</field>
/// <field name="writeFile" type="Number" integer="true" static="true">Write file scenario type.</field>
/// <field name="contactSync" type="Number" integer="true" static="true">Contact sync scenario type.</field>
/// <field name="inviteFollow" type="Number" integer="true" static="true">Invite/follow scenario type.</field>
People.RecentActivity.Core.BiciThirdPartyScenarioType = {
    unknown: 0, 
    feeds: 1, 
    photos: 2, 
    readNotifications: 3, 
    writeNotifications: 4, 
    readActivityReactions: 5, 
    writeActivityReactions: 6, 
    publishStatus: 7, 
    readFile: 8, 
    writeFile: 9, 
    contactSync: 10, 
    inviteFollow: 11
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents third party source id used for Bici.
/// </summary>
/// <field name="unknown" type="Number" integer="true" static="true">Unknown source id.</field>
/// <field name="other" type="Number" integer="true" static="true">Other source id.</field>
/// <field name="facebook" type="Number" integer="true" static="true">Facebook.</field>
/// <field name="twitter" type="Number" integer="true" static="true">Twitter.</field>
/// <field name="linkedIn" type="Number" integer="true" static="true">Linked In.</field>
/// <field name="mySpace" type="Number" integer="true" static="true">MySpace.</field>
/// <field name="sinaWeibo" type="Number" integer="true" static="true">Sina Weibo</field>
/// <field name="flickr" type="Number" integer="true" static="true">Flickr.</field>
People.RecentActivity.Core.BiciThirdPartySourceId = {
    unknown: 0, 
    other: 1, 
    facebook: 2, 
    twitter: 3, 
    linkedIn: 4, 
    mySpace: 5, 
    sinaWeibo: 6, 
    flickr: 7
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_commentDetailsInfo = function(count, countEnabled, permissions) {
    var o = { };
    Debug.assert(count >= 0, 'count');
    o.count = count;
    o.countEnabled = countEnabled;
    o.maximumLength = -1;
    o.permissions = permissions;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_commentInfo = function(id, publisher, timestamp, text, entities) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(text), 'text');
    o.id = id;
    o.publisher = publisher;
    o.timestamp = timestamp;
    o.text = text;
    o.entities = entities;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_configurationInfo = function(maxEntryCount, batchEntryCount, maxReactionCount, maxTagCount, aggregatedNetworkId, whatsNewPersonId) {
    var o = { };
    Debug.assert(maxEntryCount >= 0, 'maxEntryCount');
    Debug.assert(batchEntryCount >= 0, 'batchEntryCount');
    Debug.assert(maxReactionCount >= 0, 'maxReactionCount');
    Debug.assert(maxTagCount >= 0, 'maxTagCount');
    Debug.assert(Jx.isNonEmptyString(aggregatedNetworkId), 'aggregatedNetworkId');
    Debug.assert(Jx.isNonEmptyString(whatsNewPersonId), 'whatsNewPersonId');
    o.aggregatedNetworkId = aggregatedNetworkId;
    o.maximumEntryCount = maxEntryCount;
    o.batchEntryCount = batchEntryCount;
    o.maximumReactionCount = maxReactionCount;
    o.maximumTagCount = maxTagCount;
    o.whatsNewPersonId = whatsNewPersonId;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_contactInfo = function(id, sourceId, networkHandle, name, picture, isFriend) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(id), 'id');
    Debug.assert(Jx.isNonEmptyString(sourceId), 'sourceId');
    o.id = id;
    o.sourceId = sourceId;
    o.name = name;
    o.networkHandle = networkHandle;
    o.picture = picture;
    o.isFriend = isFriend;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_entityInfo = function(type, data, offset, length) {
    var o = { };
    Debug.assert(data != null, 'data');
    o.type = type;
    o.data = data;
    o.offset = offset;
    o.length = length;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Provides types for entities.
/// </summary>
People.RecentActivity.Core.EntityInfoType = {
    /// <field name="none" type="Number" integer="true" static="true">No type.</field>
    none: 0,
    /// <field name="contact" type="Number" integer="true" static="true">A contact entity (e.g. "@mention")</field>
    contact: 1,
    /// <field name="link" type="Number" integer="true" static="true">A hyperlink.</field>
    link: 2,
    /// <field name="hashTag" type="Number" integer="true" static="true">A hashtag.</field>
    hashTag: 3
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />



People.RecentActivity.Core.create_etwEvent = function(timeStart, data) {
    var o = { };
    o.timeStart = timeStart;
    o.data = data;
    return o;
};


;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.EtwEventName = function() {
    /// <summary>
    ///     Contains all ETW event names.
    /// </summary>
    /// <field name="providerGetFeedStart" type="String" static="true">Indicates when feed provider starts getting a feed.</field>
    /// <field name="providerGetFeedEnd" type="String" static="true">Indicates when feed provider finishes getting a feed.</field>
    /// <field name="providerGetAlbumsStart" type="String" static="true">Indicates when feed provider starts getting albums.</field>
    /// <field name="providerGetAlbumsEnd" type="String" static="true">Indicates when feed provider finishes getting albums.</field>
    /// <field name="providerGetCachedAlbumsStart" type="String" static="true">Indicates when feed provider starts getting cached albums.</field>
    /// <field name="providerGetCachedAlbumsEnd" type="String" static="true">Indicates when feed provider finishes getting cached albums.</field>
    /// <field name="providerGetMoreFeedEntriesStart" type="String" static="true">Indicates when feed provider starts getting more feed entries.</field>
    /// <field name="providerGetMoreFeedEntriesEnd" type="String" static="true">Indicates when feed provider finishes getting more feed entries.</field>
    /// <field name="providerGetFeedObjectStart" type="String" static="true">Indicates when feed provider starts getting a feed object.</field>
    /// <field name="providerGetFeedObjectEnd" type="String" static="true">Indicates when feed provider finishes getting a feed object.</field>
    /// <field name="providerGetCachedFeedStart" type="String" static="true">Indicates when feed provider starts getting a cached feed.</field>
    /// <field name="providerGetCachedFeedEnd" type="String" static="true">Indicates when feed provider finishes getting a cached feed.</field>
    /// <field name="providerGetCachedFeedObjectStart" type="String" static="true">Indicates when feed provider starts getting a cached feed.</field>
    /// <field name="providerGetCachedFeedObjectEnd" type="String" static="true">Indicates when feed provider finishes getting a cached feed.</field>
    /// <field name="providerRefreshFeedStart" type="String" static="true">Indicates when feed provider starts refreshing a feed.</field>
    /// <field name="providerRefreshFeedEnd" type="String" static="true">Indicates when feed provider finishes refreshing a feed.</field>
    /// <field name="providerRefreshAlbumsStart" type="String" static="true">Indicates when feed provider starts refreshing albums.</field>
    /// <field name="providerRefreshAlbumsEnd" type="String" static="true">Indicates when feed provider finishes refreshing albums.</field>
    /// <field name="providerRefreshAlbumStart" type="String" static="true">Indicates when feed provider starts refreshing an album.</field>
    /// <field name="providerRefreshAlbumEnd" type="String" static="true">Indicates when feed provider finishes refreshing an album.</field>
    /// <field name="providerRefreshPhotoStart" type="String" static="true">Indicates when feed provider starts refreshing a photo.</field>
    /// <field name="providerRefreshPhotoEnd" type="String" static="true">Indicates when feed provider finishes refreshing a photo.</field>
    /// <field name="providerRefreshCommentsStart" type="String" static="true">Indicates when feed provider starts getting or refreshing comments.</field>
    /// <field name="providerRefreshCommentsEnd" type="String" static="true">Indicates when feed provider finishes getting or refreshing comments.</field>
    /// <field name="providerRefreshReactionsStart" type="String" static="true">Indicates when feed provider starts getting or refreshing reactions.</field>
    /// <field name="providerRefreshReactionsEnd" type="String" static="true">Indicates when feed provider finishes getting or refreshing reactions.</field>
    /// <field name="providerAddCommentStart" type="String" static="true">Indicates when feed provider starts adding a comment.</field>
    /// <field name="providerAddCommentEnd" type="String" static="true">Indicates when feed provider finishes adding a comment.</field>
    /// <field name="providerAddReactionStart" type="String" static="true">Indicates when feed provider starts adding a reaction.</field>
    /// <field name="providerAddReactionEnd" type="String" static="true">Indicates when feed provider finishes adding a reaction.</field>
    /// <field name="providerRemoveReactionStart" type="String" static="true">Indicates when feed provider starts removing a reaction.</field>
    /// <field name="providerRemoveReactionEnd" type="String" static="true">Indicates when feed provider finishes removing a reaction.</field>
    /// <field name="providerRefreshNotificationsStart" type="String" static="true">Indicates when the UI starts refreshing the notifications.</field>
    /// <field name="providerRefreshNotificationsEnd" type="String" static="true">Indicates when the UI finishes refreshing the notifications.</field>
    /// <field name="providerGetCachedNotificationsStart" type="String" static="true">Indicates when the UI starts getting cached notifications.</field>
    /// <field name="providerGetCachedNotificationsEnd" type="String" static="true">Indicates when the UI finishes getting cached notifications.</field>
    /// <field name="providerMarkNotificationsReadStart" type="String" static="true">Indicates when the UI starts refreshing the notifications.</field>
    /// <field name="providerMarkNotificationsReadEnd" type="String" static="true">Indicates when the UI finishes refreshing the notifications.</field>
    /// <field name="providerGetUnreadNotificationsCountStart" type="String" static="true">Indicates when the UI starts refreshing the notifications.</field>
    /// <field name="providerGetUnreadNotificationsCountEnd" type="String" static="true">Indicates when the UI finishes refreshing the notifications.</field>
    /// <field name="providerAddFeedObjectStart" type="String" static="true">Indicates when feed provider starts adding a comment.</field>
    /// <field name="providerAddFeedObjectEnd" type="String" static="true">Indicates when feed provider finishes adding a comment.</field>
    /// <field name="uiGetFeedStart" type="String" static="true">Indicates when UI starts getting a feed.</field>
    /// <field name="uiGetFeedEnd" type="String" static="true">Indicates when UI finishes getting a feed.</field>
    /// <field name="uiGetCachedFeedStart" type="String" static="true">Indicates when UI starts getting a cached feed.</field>
    /// <field name="uiGetCachedFeedEnd" type="String" static="true">Indicates when UI finishes getting a cached feed.</field>
    /// <field name="uiRefreshFeedStart" type="String" static="true">Indicates when UI starts refreshing a feed.</field>
    /// <field name="uiRefreshFeedEnd" type="String" static="true">Indicates when UI finishes refreshing a feed.</field>
    /// <field name="uiRefreshCommentsStart" type="String" static="true">Indicates when UI starts getting or refreshing comments.</field>
    /// <field name="uiRefreshCommentsEnd" type="String" static="true">Indicates when UI finishes getting or refreshing comments.</field>
    /// <field name="uiRefreshReactionsStart" type="String" static="true">Indicates when UI starts getting or refreshing reactions.</field>
    /// <field name="uiRefreshReactionsEnd" type="String" static="true">Indicates when UI finishes getting or refreshing reactions.</field>
    /// <field name="uiAddCommentStart" type="String" static="true">Indicates when UI starts adding a comment.</field>
    /// <field name="uiAddCommentEnd" type="String" static="true">Indicates when UI finishes adding a comment.</field>
    /// <field name="uiAddReactionStart" type="String" static="true">Indicates when UI starts adding a reaction.</field>
    /// <field name="uiAddReactionEnd" type="String" static="true">Indicates when UI finishes adding a reaction.</field>
    /// <field name="uiRemoveReactionStart" type="String" static="true">Indicates when UI starts removing a reaction.</field>
    /// <field name="uiRemoveReactionEnd" type="String" static="true">Indicates when UI finishes removing a reaction.</field>
    /// <field name="uiSelfPageStart" type="String" static="true">Indicates when the UI started rendering the self-page.</field>
    /// <field name="uiSelfPageEnd" type="String" static="true">Indicates when the UI finished rendering the self-page.</field>
    /// <field name="uiGetNotificationsStart" type="String" static="true">Indicates when the UI starts refreshing the notifications.</field>
    /// <field name="uiGetNotificationsEnd" type="String" static="true">Indicates when the UI finishes refreshing the notifications.</field>
    /// <field name="uiRefreshNotificationsStart" type="String" static="true">Indicates when the UI starts refreshing the notifications.</field>
    /// <field name="uiRefreshNotificationsEnd" type="String" static="true">Indicates when the UI finishes refreshing the notifications.</field>
    /// <field name="uiGetCachedNotificationsStart" type="String" static="true">Indicates when the UI starts getting cached notifications.</field>
    /// <field name="uiGetCachedNotificationsEnd" type="String" static="true">Indicates when the UI finishes getting cached notifications.</field>
    /// <field name="uiMarkNotificationsReadStart" type="String" static="true">Indicates when the UI starts marking notifications read.</field>
    /// <field name="uiMarkNotificationsReadEnd" type="String" static="true">Indicates when the UI finishes marking notifications read.</field>
    /// <field name="uiGetUnreadNotificationsCountStart" type="String" static="true">Indicates when the UI starts marking notifications read.</field>
    /// <field name="uiGetUnreadNotificationsCountEnd" type="String" static="true">Indicates when the UI finishes marking notifications read.</field>
    /// <field name="uiRenderEntryStart" type="String" static="true">Indicates when the UI starts rendering a single item.</field>
    /// <field name="uiRenderEntryEnd" type="String" static="true">Indicates when the UI ends rendering a single item.</field>
    /// <field name="uiRenderNotificationControlStart" type="String" static="true">Indicates when the UI starts rendering a single notification.</field>
    /// <field name="uiRenderNotificationControlStop" type="String" static="true">Indicates when the UI ends rendering a single notification.</field>
    /// <field name="uiGetPhotoAlbumsStart" type="String" static="true">Indicates when the UI starts retrieving photos.</field>
    /// <field name="uiGetPhotoAlbumsStop" type="String" static="true">Indicates when the UI stops retrieving photos.</field>
    /// <field name="uiGetCachedPhotoAlbumsStart" type="String" static="true">Indicates when the UI starts retrieving cached photos.</field>
    /// <field name="uiGetCachedPhotoAlbumsStop" type="String" static="true">Indicates when the UI stops retrieving cached albums.</field>
    /// <field name="uiRefreshPhotoAlbumsStart" type="String" static="true">Indicates when the UI starts refreshing photo albums.</field>
    /// <field name="uiRefreshPhotoAlbumsStop" type="String" static="true">Indicates when the UI stops refreshing photo albums.</field>
    /// <field name="uiRenderPhotoAlbumStart" type="String" static="true">Indicates when the UI starts rendering a single photo album.</field>
    /// <field name="uiRenderPhotoAlbumStop" type="String" static="true">Indicates when the UI stops rendering a single photo album.</field>
    /// <field name="uiListViewRenderInitialBatchStart" type="String" static="true">Indicates when the ListView starts rendering the initial batch of items.</field>
    /// <field name="uiListViewRenderInitialBatchStop" type="String" static="true">Indicates when the ListView stops rendering the initial batch of items.</field>
    /// <field name="uiListViewAnimateInStart" type="String" static="true">Indicates the ListView has started animating in the entries.</field>
    /// <field name="uiListViewAnimateInStop" type="String" static="true">Indicates the ListView has completd animating in the entries.</field>
    /// <field name="uiShareTargetPlatformSyncStart" type="String" static="true">Indicates when the UI starts the platform sync.</field>
    /// <field name="uiShareTargetPlatformSyncStop" type="String" static="true">Indicates when the UI finishes the platform sync.</field>
    /// <field name="uiShareTargetShareStart" type="String" static="true">Indicates when the UI starts sharing.</field>
    /// <field name="uiShareTargetShareStop" type="String" static="true">Indicates when the UI finishes sharing.</field>
    /// <field name="unofficialUILoadLinkTileStart" type="String" static="true">Indicates when the UI starts loading the link tile.</field>
    /// <field name="unofficialUILoadLinkTileStop" type="String" static="true">Indicates when the UI stops loading the link tile.</field>
    /// <field name="unofficialUILoadVideoTileStart" type="String" static="true">Indicates when the UI starts loading the link tile.</field>
    /// <field name="unofficialUILoadVideoTileStop" type="String" static="true">Indicates when the UI stops loading the link tile.</field>
    /// <field name="unofficialUILoadPhotoStart" type="String" static="true">Indicates when the UI starts loading a feed photo.</field>
    /// <field name="unofficialUILoadPhotoStop" type="String" static="true">Indicates when the UI stops loading a feed photo.</field>
    /// <field name="unofficialUILoadPhotoViewerStart" type="String" static="true">Indicates when the UI starts loading the photo viewer.</field>
    /// <field name="unofficialUILoadPhotoViewerStop" type="String" static="true">Indicates when the UI stops loading the photo viewer.</field>
    /// <field name="unofficialUIRepositionItemsStart" type="String" static="true">Indicates when the UI starts repositioning items.</field>
    /// <field name="unofficialUIRepositionItemsStop" type="String" static="true">Indicates when the UI stops repositioning items.</field>
    /// <field name="unofficialUIUpdateSnapListStart" type="String" static="true">Indicates when the UI starts updating the snap list.</field>
    /// <field name="unofficialUIUpdateSnapListStop" type="String" static="true">Indicates when the UI stops updating the snap list.</field>
    /// <field name="unofficialUIUpdateAriaStart" type="String" static="true">Indicates when the UI starts updating the ARIA attributes.</field>
    /// <field name="unofficialUIUpdateAriaStop" type="String" static="true">Indicates when the UI stops updating the ARIA attributes.</field>
    /// <field name="unofficialUIForceLayoutStart" type="String" static="true">Indicates when the UI starts forcing the layout to update.</field>
    /// <field name="unofficialUIForceLayoutStop" type="String" static="true">Indicates when the UI stops forcing the layout to update.</field>
    /// <field name="unofficialUISelfPageGetStart" type="String" static="true">Indicates when the UI called GetFeedObject</field>
    /// <field name="unofficialUISelfPageGetEnd" type="String" static="true">Indicates when the UI received the GetFeedObject event.</field>
    /// <field name="unofficialUISelfPageRenderSidebarStart" type="String" static="true">Indicates when the UI starts rendering the sidebar.</field>
    /// <field name="unofficialUISelfPageRenderSidebarEnd" type="String" static="true">Indicates when the UI stops rendering the sidebar.</field>
    /// <field name="unofficialUISelfPageRenderContentStart" type="String" static="true">Indicates when the UI starts rendering the sidebar.</field>
    /// <field name="unofficialUISelfPageRenderContentEnd" type="String" static="true">Indicates when the UI stops rendering the sidebar.</field>
    /// <field name="unofficialProviderDeserializeStart" type="String" static="true">Indicates when the provider starts deserializing data.</field>
    /// <field name="unofficialProviderDeserializeStop" type="String" static="true">Indiciates when the provider stops deserializing data.</field>
};


People.RecentActivity.Core.EtwEventName.providerGetFeedStart = 'raProvider_GetFeed_start';
People.RecentActivity.Core.EtwEventName.providerGetFeedEnd = 'raProvider_GetFeed_end';
People.RecentActivity.Core.EtwEventName.providerGetAlbumsStart = 'raProvider_GetAlbums_start';
People.RecentActivity.Core.EtwEventName.providerGetAlbumsEnd = 'raProvider_GetAlbums_end';
People.RecentActivity.Core.EtwEventName.providerGetCachedAlbumsStart = 'raProvider_GetCachedAlbums_start';
People.RecentActivity.Core.EtwEventName.providerGetCachedAlbumsEnd = 'raProvider_GetCachedAlbums_end';
People.RecentActivity.Core.EtwEventName.providerGetMoreFeedEntriesStart = 'raProvider_GetMoreFeedEntries_start';
People.RecentActivity.Core.EtwEventName.providerGetMoreFeedEntriesEnd = 'raProvider_GetMoreFeedEntries_end';
People.RecentActivity.Core.EtwEventName.providerGetFeedObjectStart = 'raProvider_GetFeedObject_start';
People.RecentActivity.Core.EtwEventName.providerGetFeedObjectEnd = 'raProvider_GetFeedObject_end';
People.RecentActivity.Core.EtwEventName.providerGetCachedFeedStart = 'raProvider_GetCachedFeed_start';
People.RecentActivity.Core.EtwEventName.providerGetCachedFeedEnd = 'raProvider_GetCachedFeed_end';
People.RecentActivity.Core.EtwEventName.providerGetCachedFeedObjectStart = 'raProvider_GetCachedFeedObject_start';
People.RecentActivity.Core.EtwEventName.providerGetCachedFeedObjectEnd = 'raProvider_GetCachedFeedObject_end';
People.RecentActivity.Core.EtwEventName.providerRefreshFeedStart = 'raProvider_RefreshFeed_start';
People.RecentActivity.Core.EtwEventName.providerRefreshFeedEnd = 'raProvider_RefreshFeed_end';
People.RecentActivity.Core.EtwEventName.providerRefreshAlbumsStart = 'raProvider_RefreshAlbums_start';
People.RecentActivity.Core.EtwEventName.providerRefreshAlbumsEnd = 'raProvider_RefreshAlbums_end';
People.RecentActivity.Core.EtwEventName.providerRefreshAlbumStart = 'raProvider_RefreshAlbum_start';
People.RecentActivity.Core.EtwEventName.providerRefreshAlbumEnd = 'raProvider_RefreshAlbum_end';
People.RecentActivity.Core.EtwEventName.providerRefreshPhotoStart = 'raProvider_RefreshPhoto_start';
People.RecentActivity.Core.EtwEventName.providerRefreshPhotoEnd = 'raProvider_RefreshPhoto_end';
People.RecentActivity.Core.EtwEventName.providerRefreshCommentsStart = 'raProvider_RefreshComments_start';
People.RecentActivity.Core.EtwEventName.providerRefreshCommentsEnd = 'raProvider_RefreshComments_end';
People.RecentActivity.Core.EtwEventName.providerRefreshReactionsStart = 'raProvider_RefreshReactions_start';
People.RecentActivity.Core.EtwEventName.providerRefreshReactionsEnd = 'raProvider_RefreshReactions_end';
People.RecentActivity.Core.EtwEventName.providerAddCommentStart = 'raProvider_AddComment_start';
People.RecentActivity.Core.EtwEventName.providerAddCommentEnd = 'raProvider_AddComment_end';
People.RecentActivity.Core.EtwEventName.providerAddReactionStart = 'raProvider_AddReaction_start';
People.RecentActivity.Core.EtwEventName.providerAddReactionEnd = 'raProvider_AddReaction_end';
People.RecentActivity.Core.EtwEventName.providerRemoveReactionStart = 'raProvider_RemoveReaction_start';
People.RecentActivity.Core.EtwEventName.providerRemoveReactionEnd = 'raProvider_RemoveReaction_end';
People.RecentActivity.Core.EtwEventName.providerRefreshNotificationsStart = 'raProvider_RefreshNotifications_start';
People.RecentActivity.Core.EtwEventName.providerRefreshNotificationsEnd = 'raProvider_RefreshNotifications_end';
People.RecentActivity.Core.EtwEventName.providerGetCachedNotificationsStart = 'raProvider_GetCachedNotifications_start';
People.RecentActivity.Core.EtwEventName.providerGetCachedNotificationsEnd = 'raProvider_GetCachedNotifications_end';
People.RecentActivity.Core.EtwEventName.providerMarkNotificationsReadStart = 'raProvider_MarkNotificationsRead_start';
People.RecentActivity.Core.EtwEventName.providerMarkNotificationsReadEnd = 'raProvider_MarkNotificationsRead_end';
People.RecentActivity.Core.EtwEventName.providerGetUnreadNotificationsCountStart = 'raProvider_GetUnreadNotificationsCount_start';
People.RecentActivity.Core.EtwEventName.providerGetUnreadNotificationsCountEnd = 'raProvider_GetUnreadNotificationsCount_end';
People.RecentActivity.Core.EtwEventName.providerAddFeedObjectStart = 'raProvider_AddFeedObject_start';
People.RecentActivity.Core.EtwEventName.providerAddFeedObjectEnd = 'raProvider_AddFeedObject_end';
People.RecentActivity.Core.EtwEventName.uiGetFeedStart = 'raUI_GetFeed_start';
People.RecentActivity.Core.EtwEventName.uiGetFeedEnd = 'raUI_GetFeed_end';
People.RecentActivity.Core.EtwEventName.uiGetCachedFeedStart = 'raUI_GetCachedFeed_start';
People.RecentActivity.Core.EtwEventName.uiGetCachedFeedEnd = 'raUI_GetCachedFeed_end';
People.RecentActivity.Core.EtwEventName.uiRefreshFeedStart = 'raUI_RefreshFeed_start';
People.RecentActivity.Core.EtwEventName.uiRefreshFeedEnd = 'raUI_RefreshFeed_end';
People.RecentActivity.Core.EtwEventName.uiRefreshCommentsStart = 'raUI_RefreshComments_start';
People.RecentActivity.Core.EtwEventName.uiRefreshCommentsEnd = 'raUI_RefreshComments_end';
People.RecentActivity.Core.EtwEventName.uiRefreshReactionsStart = 'raUI_RefreshReactions_start';
People.RecentActivity.Core.EtwEventName.uiRefreshReactionsEnd = 'raUI_RefreshReactions_end';
People.RecentActivity.Core.EtwEventName.uiAddCommentStart = 'raUI_AddComment_start';
People.RecentActivity.Core.EtwEventName.uiAddCommentEnd = 'raUI_AddComment_end';
People.RecentActivity.Core.EtwEventName.uiAddReactionStart = 'raUI_AddReaction_start';
People.RecentActivity.Core.EtwEventName.uiAddReactionEnd = 'raUI_AddReaction_end';
People.RecentActivity.Core.EtwEventName.uiRemoveReactionStart = 'raUI_RemoveReaction_start';
People.RecentActivity.Core.EtwEventName.uiRemoveReactionEnd = 'raUI_RemoveReaction_end';
People.RecentActivity.Core.EtwEventName.uiSelfPageStart = 'raUI_RenderSelfPage_start';
People.RecentActivity.Core.EtwEventName.uiSelfPageEnd = 'raUI_RenderSelfPage_end';
People.RecentActivity.Core.EtwEventName.uiGetNotificationsStart = 'raUI_GetNotifications_start';
People.RecentActivity.Core.EtwEventName.uiGetNotificationsEnd = 'raUI_GetNotifications_end';
People.RecentActivity.Core.EtwEventName.uiRefreshNotificationsStart = 'raUI_RefreshNotifications_start';
People.RecentActivity.Core.EtwEventName.uiRefreshNotificationsEnd = 'raUI_RefreshNotifications_end';
People.RecentActivity.Core.EtwEventName.uiGetCachedNotificationsStart = 'raUI_GetCachedNotifications_start';
People.RecentActivity.Core.EtwEventName.uiGetCachedNotificationsEnd = 'raUI_GetCachedNotifications_end';
People.RecentActivity.Core.EtwEventName.uiMarkNotificationsReadStart = 'raUI_MarkNotificationsRead_start';
People.RecentActivity.Core.EtwEventName.uiMarkNotificationsReadEnd = 'raUI_MarkNotificationsRead_end';
People.RecentActivity.Core.EtwEventName.uiGetUnreadNotificationsCountStart = 'raUI_GetUnreadNotificationsCount_start';
People.RecentActivity.Core.EtwEventName.uiGetUnreadNotificationsCountEnd = 'raUI_GetUnreadNotificationsCount_end';
People.RecentActivity.Core.EtwEventName.uiRenderEntryStart = 'raUI_RenderEntry_start';
People.RecentActivity.Core.EtwEventName.uiRenderEntryEnd = 'raUI_RenderEntry_end';
People.RecentActivity.Core.EtwEventName.uiRenderNotificationControlStart = 'raUI_RenderNotificationControl_start';
People.RecentActivity.Core.EtwEventName.uiRenderNotificationControlStop = 'raUI_RenderNotificationControl_end';
People.RecentActivity.Core.EtwEventName.uiGetPhotoAlbumsStart = 'raUI_GetPhotoAlbums_start';
People.RecentActivity.Core.EtwEventName.uiGetPhotoAlbumsStop = 'raUI_GetPhotoAlbums_end';
People.RecentActivity.Core.EtwEventName.uiGetCachedPhotoAlbumsStart = 'raUI_GetCachedPhotoAlbums_start';
People.RecentActivity.Core.EtwEventName.uiGetCachedPhotoAlbumsStop = 'raUI_GetCachedPhotoAlbums_end';
People.RecentActivity.Core.EtwEventName.uiRefreshPhotoAlbumsStart = 'raUI_RefreshPhotoAlbums_start';
People.RecentActivity.Core.EtwEventName.uiRefreshPhotoAlbumsStop = 'raUI_RefreshPhotoAlbums_end';
People.RecentActivity.Core.EtwEventName.uiRenderPhotoAlbumStart = 'raUI_RenderPhotoAlbum_start';
People.RecentActivity.Core.EtwEventName.uiRenderPhotoAlbumStop = 'raUI_RenderPhotoAlbum_end';
People.RecentActivity.Core.EtwEventName.uiListViewRenderInitialBatchStart = 'raUI_ListViewRenderInitialBatch_start';
People.RecentActivity.Core.EtwEventName.uiListViewRenderInitialBatchStop = 'raUI_ListViewRenderInitialBatch_end';
People.RecentActivity.Core.EtwEventName.uiListViewAnimateInStart = 'raUI_ListViewAnimateIn_start';
People.RecentActivity.Core.EtwEventName.uiListViewAnimateInStop = 'raUI_ListViewAnimateIn_end';
People.RecentActivity.Core.EtwEventName.uiShareTargetPlatformSyncStart = 'raUI_ShareTargetPlatformSync_start';
People.RecentActivity.Core.EtwEventName.uiShareTargetPlatformSyncStop = 'raUI_ShareTargetPlatformSync_end';
People.RecentActivity.Core.EtwEventName.uiShareTargetShareStart = 'raUI_ShareTargetShare_start';
People.RecentActivity.Core.EtwEventName.uiShareTargetShareStop = 'raUI_ShareTargetShare_end';
People.RecentActivity.Core.EtwEventName.unofficialUILoadLinkTileStart = 'raUI_RenderEntry_LoadLinkTile_start';
People.RecentActivity.Core.EtwEventName.unofficialUILoadLinkTileStop = 'raUI_RenderEntry_LoadLinkTile_end';
People.RecentActivity.Core.EtwEventName.unofficialUILoadVideoTileStart = 'raUI_RenderEntry_LoadVideoTile_start';
People.RecentActivity.Core.EtwEventName.unofficialUILoadVideoTileStop = 'raUI_RenderEntry_LoadVideoTile_end';
People.RecentActivity.Core.EtwEventName.unofficialUILoadPhotoStart = 'raUI_RenderEntry_LoadPhoto_start';
People.RecentActivity.Core.EtwEventName.unofficialUILoadPhotoStop = 'raUI_RenderEntry_LoadPhoto_end';
People.RecentActivity.Core.EtwEventName.unofficialUILoadPhotoViewerStart = 'raUI_LoadPhotoViewer_start';
People.RecentActivity.Core.EtwEventName.unofficialUILoadPhotoViewerStop = 'raUI_LoadPhotoViewer_end';
People.RecentActivity.Core.EtwEventName.unofficialUIRepositionItemsStart = 'raUI_RepositionItems_start';
People.RecentActivity.Core.EtwEventName.unofficialUIRepositionItemsStop = 'raUI_RepositionItems_end';
People.RecentActivity.Core.EtwEventName.unofficialUIUpdateSnapListStart = 'raUI_UpdateSnapList_start';
People.RecentActivity.Core.EtwEventName.unofficialUIUpdateSnapListStop = 'raUI_UpdateSnapList_end';
People.RecentActivity.Core.EtwEventName.unofficialUIUpdateAriaStart = 'raUI_UpdateAria_start';
People.RecentActivity.Core.EtwEventName.unofficialUIUpdateAriaStop = 'raUI_UpdateAria_end';
People.RecentActivity.Core.EtwEventName.unofficialUIForceLayoutStart = 'raUI_ForceLayout_start';
People.RecentActivity.Core.EtwEventName.unofficialUIForceLayoutStop = 'raUI_ForceLayout_end';
People.RecentActivity.Core.EtwEventName.unofficialUISelfPageGetStart = 'raUI_SelfPageGetObject_start';
People.RecentActivity.Core.EtwEventName.unofficialUISelfPageGetEnd = 'raUI_SelfPageGetObject_end';
People.RecentActivity.Core.EtwEventName.unofficialUISelfPageRenderSidebarStart = 'raUI_SelfPageRenderSidebar_start';
People.RecentActivity.Core.EtwEventName.unofficialUISelfPageRenderSidebarEnd = 'raUI_SelfPageRenderSidebar_end';
People.RecentActivity.Core.EtwEventName.unofficialUISelfPageRenderContentStart = 'raUI_SelfPageRenderContent_start';
People.RecentActivity.Core.EtwEventName.unofficialUISelfPageRenderContentEnd = 'raUI_SelfPageRenderContent_end';
People.RecentActivity.Core.EtwEventName.unofficialProviderDeserializeStart = 'raProvider_Deserialize_start';
People.RecentActivity.Core.EtwEventName.unofficialProviderDeserializeStop = 'raProvider_Deserialize_end';
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.EtwEventParameterName = function() {
    /// <summary>
    ///     Contains names of all ETW event parameters.
    /// </summary>
    /// <field name="feedObjectId" type="String" static="true">Feed entry Id.</field>
    /// <field name="commentId" type="String" static="true">Comment Id.</field>
    /// <field name="reactionId" type="String" static="true">Reaction type.</field>
    /// <field name="sourceId" type="String" static="true">Source ID.</field>
    /// <field name="notificationId" type="String" static="true">Notification ID.</field>
    /// <field name="result" type="String" static="true">Result field.</field>
};

People.RecentActivity.Core.EtwEventParameterName.feedObjectId = 'feedObjectId';
People.RecentActivity.Core.EtwEventParameterName.commentId = 'commentId';
People.RecentActivity.Core.EtwEventParameterName.reactionId = 'reactionId';
People.RecentActivity.Core.EtwEventParameterName.sourceId = 'sourceId';
People.RecentActivity.Core.EtwEventParameterName.notificationId = 'notificationId';
People.RecentActivity.Core.EtwEventParameterName.result = 'result';
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />



People.RecentActivity.Core.EtwFilter = function(events) {
    /// <summary>
    ///     Represents a list of ETW events.
    /// </summary>
    /// <param name="events" type="Array" elementType="etwEvent">The events.</param>
    /// <field name="_events" type="Array" elementType="etwEvent">The events.</field>
    /// <field name="_subtract" type="Array">The subtracted lists.</field>
    this._events = events;
    this._subtract = [];
};


People.RecentActivity.Core.EtwFilter.prototype._events = null;
People.RecentActivity.Core.EtwFilter.prototype._subtract = null;

Object.defineProperty(People.RecentActivity.Core.EtwFilter.prototype, "events", {
    get: function() {
        /// <summary>
        ///     Gets the events.
        /// </summary>
        /// <value type="Array" elementType="etwEvent"></value>
        return this._events;
    }
});

People.RecentActivity.Core.EtwFilter.prototype.filter = function(path, match) {
    /// <summary>
    ///     Filters the list.
    /// </summary>
    /// <param name="path" type="String">The path to filter by.</param>
    /// <param name="match" type="Object">The object to match against.</param>
    /// <returns type="People.RecentActivity.Core.EtwFilter"></returns>
    var pieces = path.split('/');
    var matches = [];
    for (var i = 0; i < this._events.length; i++) {
        var ev = this._events[i];
        var obj = ev.data;
        // look up the path in the objects.
        for (var j = 0; (j < pieces.length) && (obj != null); j++) {
            obj = obj[pieces[j]];
        }

        if ((obj != null) && (obj === match)) {
            matches.push(ev);
        }    
    }

    return new People.RecentActivity.Core.EtwFilter(matches);
};

People.RecentActivity.Core.EtwFilter.prototype.list = function() {
    /// <summary>
    ///     Gets the list of ETW perf points (in milliseconds).
    /// </summary>
    /// <returns type="Array" elementType="Number" elementInteger="true"></returns>
    var points = new Array(this._events.length);
    for (var i = 0; i < points.length; i++) {
        // simply subtract end from start, done.
        var ev = this._events[i];
        if (ev.timeEnd != null) {
            points[i] = ev.timeEnd.getTime() - ev.timeStart.getTime();
            for (var j = 0; j < this._subtract.length; j++) {
                // subtract the time it took for the sub-point to do its thing.
                var sub = this._subtract[j].events[i];
                points[i] -= sub.timeEnd.getTime() - ev.timeStart.getTime();
            }

        }
        else {
            points[i] = 0;
        }    
    }

    return points;
};

People.RecentActivity.Core.EtwFilter.prototype.average = function() {
    /// <summary>
    ///     Gets the average amount of time it took to execute this event.
    /// </summary>
    /// <returns type="Number" integer="true"></returns>
    if (!this._events.length) {
        // can't divide by zero.
        return 0;
    }

    return this.sum() / this._events.length;
};

People.RecentActivity.Core.EtwFilter.prototype.minMax = function() {
    /// <summary>
    ///     Gets the minimum and maximum perf points.
    /// </summary>
    /// <returns type="Object"></returns>
    var min = 2147483647;
    var max = -1;
    var list = this.list();
    for (var i = 0; i < list.length; i++) {
        min = Math.min(min, list[i]);
        max = Math.max(max, list[i]);
    }

    var obj = {};
    obj['min'] = min;
    obj['max'] = max;
    return obj;
};

People.RecentActivity.Core.EtwFilter.prototype.sum = function() {
    /// <summary>
    ///     Sums up all the perf points.
    /// </summary>
    /// <returns type="Number" integer="true"></returns>
    var list = this.list();
    var sum = 0;
    for (var i = 0; i < list.length; i++) {
        sum += list[i];
    }

    return sum;
};

People.RecentActivity.Core.EtwFilter.prototype.subtract = function(filter) {
    /// <summary>
    ///     Subtracts a filter from the current filter. The given filter must have an
    ///     equal number of logged points, and each point must fall within each point
    ///     in the original list.
    /// </summary>
    /// <param name="filter" type="People.RecentActivity.Core.EtwFilter">The filter.</param>
    /// <returns type="People.RecentActivity.Core.EtwFilter"></returns>
    if (this._events.length !== filter.events.length) {
        // oops, the list doesn't match.
        throw new Error('Number of logged points does not match given list');
    }

    for (var i = 0; i < filter._events.length; i++) {
        // do some sanity checks.
        var source = filter.events[i];
        var target = this._events[i];
        if ((source.timeStart.getTime() < target.timeStart.getTime()) || ((source.timeEnd != null) && (source.timeEnd.getTime() > target.timeEnd.getTime()))) {
            throw new Error('The logged points do not match.');
        }    
    }

    this._subtract.push(filter);
    return this;
};


;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="EtwEvent.js" />
/// <reference path="EtwEventParameterName.js" />
/// <reference path="EtwFilter.js" />

People.RecentActivity.Core.EtwHelper = function() {
    /// <summary>
    ///     Provides ETW related helper method.
    /// </summary>
    /// <field name="_events" type="Object" static="true">The dictionary containing the logged events.</field>
};


People.RecentActivity.Core.EtwHelper._events = {};


People.RecentActivity.Core.EtwHelper.writeUnofficialEvent = function(eventName, data) {
    /// <summary>
    ///     Writes an unofficial logging point. These will not show up in official ETW reports,
    ///     and should only be used for debug or perf investigation purposes.
    /// </summary>
    /// <param name="eventName" type="String">The event name.</param>
    /// <param name="data" type="Array" elementType="Object">Any data that needs to be logged.</param>

    Jx.log.write(4, eventName + ' ' + JSON.stringify(data));
    People.RecentActivity.Core.EtwHelper._writePerfEvent(eventName, data || new Array(0));

};

People.RecentActivity.Core.EtwHelper.writeFeedEvent = function(eventName, networkId, contactId) {
    /// <summary>
    ///     Writes a feed related event.
    /// </summary>
    /// <param name="eventName" type="String">The event name.</param>
    /// <param name="networkId" type="String">The network id.</param>
    /// <param name="contactId" type="String">The contact id.</param>
    
    Debug.assert(Jx.isNonEmptyString(eventName), 'eventName');
    Debug.assert(Jx.isNonEmptyString(networkId), 'networkId');
    var parameter = {};
    parameter[People.RecentActivity.Core.EtwEventParameterName.sourceId] = networkId;
    NoShip.People.etw(eventName, parameter);
    

    
    People.RecentActivity.Core.EtwHelper._writePerfEvent(eventName, [networkId, contactId]);
    
};

People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent = function(eventName, obj) {
    /// <summary>
    ///     Write a feed object related event.
    /// </summary>
    /// <param name="eventName" type="String">The event name.</param>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The object.</param>
    
    Debug.assert(Jx.isNonEmptyString(eventName), 'eventName');
    var objId = (obj != null) ? obj.id : null;
    var parameter = {};
    parameter[People.RecentActivity.Core.EtwEventParameterName.feedObjectId] = objId;
    NoShip.People.etw(eventName, parameter);
    

    
    People.RecentActivity.Core.EtwHelper._writePerfEvent(eventName, [obj]);
    
};

People.RecentActivity.Core.EtwHelper.writeCommentEvent = function(eventName, obj, comment) {
    /// <summary>
    ///     Writes a comment related event.
    /// </summary>
    /// <param name="eventName" type="String">The event name.</param>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The object.</param>
    /// <param name="comment" type="People.RecentActivity.Core.create_commentInfo">The comment.</param>
    
    Debug.assert(Jx.isNonEmptyString(eventName), 'eventName');
    Debug.assert(obj != null, 'obj');
    var parameter = {};
    parameter[People.RecentActivity.Core.EtwEventParameterName.feedObjectId] = obj.id;
    parameter[People.RecentActivity.Core.EtwEventParameterName.commentId] = (comment == null) ? '' : comment.id;
    NoShip.People.etw(eventName, parameter);
    
    
    
    People.RecentActivity.Core.EtwHelper._writePerfEvent(eventName, [obj, comment]);
    
};

People.RecentActivity.Core.EtwHelper.writeReactionEvent = function(eventName, obj, reaction) {
    /// <summary>
    ///     Writes a reaction related event.
    /// </summary>
    /// <param name="eventName" type="String">Name of the event.</param>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The entry.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction.</param>
    
    Debug.assert(Jx.isNonEmptyString(eventName), 'eventName');
    Debug.assert(obj != null, 'obj');
    var parameter = {};
    parameter[People.RecentActivity.Core.EtwEventParameterName.feedObjectId] = obj.id;
    parameter[People.RecentActivity.Core.EtwEventParameterName.reactionId] = (reaction == null) ? '' : reaction.type.id;
    NoShip.People.etw(eventName, parameter);
    

    
    People.RecentActivity.Core.EtwHelper._writePerfEvent(eventName, [obj, reaction]);
    
};

People.RecentActivity.Core.EtwHelper.writeNotificationEvent = function(eventName, obj) {
    /// <summary>
    ///     Write a feed object related event.
    /// </summary>
    /// <param name="eventName" type="String">The event name.</param>
    /// <param name="obj" type="People.RecentActivity.Core.create_notificationInfo">The object.</param>
    
    Debug.assert(Jx.isNonEmptyString(eventName), 'eventName');
    Debug.assert(obj != null, 'obj');
    var parameter = {};
    parameter[People.RecentActivity.Core.EtwEventParameterName.sourceId] = obj.sourceId;
    parameter[People.RecentActivity.Core.EtwEventParameterName.notificationId] = obj.id;
    NoShip.People.etw(eventName, parameter);
    

    
    People.RecentActivity.Core.EtwHelper._writePerfEvent(eventName, [obj]);
    
};

People.RecentActivity.Core.EtwHelper.writeSelfPageEvent = function(eventName, objectId) {
    /// <summary>
    ///     Writes a self-page related event.
    /// </summary>
    /// <param name="eventName" type="String">The event name.</param>
    /// <param name="objectId" type="String">The feed object id.</param>
    
    Debug.assert(Jx.isNonEmptyString(eventName), 'eventName');
    Debug.assert(Jx.isNonEmptyString(objectId), 'objectId');
    var parameters = {};
    parameters[People.RecentActivity.Core.EtwEventParameterName.feedObjectId] = objectId;
    NoShip.People.etw(eventName, parameters);
    

    
    People.RecentActivity.Core.EtwHelper._writePerfEvent(eventName, [objectId]);
    
};

People.RecentActivity.Core.EtwHelper.writeSimpleEvent = function(eventName) {
    /// <summary>
    ///     Writes a simple event that has no parameters.
    /// </summary>
    /// <param name="eventName" type="String">The event name.</param>
    
    NoShip.People.etw(eventName);
    

    
    People.RecentActivity.Core.EtwHelper._writePerfEvent(eventName, new Array(0));
    
};

People.RecentActivity.Core.EtwHelper.writeShareEvent = function(eventName, sourceId) {
    /// <summary>
    ///     Writes a share-related event.
    /// </summary>
    /// <param name="eventName" type="String">The event name.</param>
    /// <param name="sourceId" type="String">The network source ID.</param>
    
    Debug.assert(Jx.isNonEmptyString(eventName), 'eventName');
    Debug.assert(Jx.isNonEmptyString(sourceId), 'sourceId');
    var parameters = {};
    parameters[People.RecentActivity.Core.EtwEventParameterName.sourceId] = sourceId;
    NoShip.People.etw(eventName, parameters);
    

    
    People.RecentActivity.Core.EtwHelper._writePerfEvent(eventName, [sourceId]);
    
};

People.RecentActivity.Core.EtwHelper.writeShareResultEvent = function(eventName, sourceId, result) {
    /// <summary>
    ///     Writes a share-related event.
    /// </summary>
    /// <param name="eventName" type="String">The event name.</param>
    /// <param name="sourceId" type="String">The network source ID.</param>
    /// <param name="result" type="String">The result of the operation.</param>
    
    Debug.assert(Jx.isNonEmptyString(eventName), 'eventName');
    Debug.assert(Jx.isNonEmptyString(sourceId), 'sourceId');
    Debug.assert(Jx.isNonEmptyString(result), 'result');
    var parameters = {};
    parameters[People.RecentActivity.Core.EtwEventParameterName.sourceId] = sourceId;
    parameters[People.RecentActivity.Core.EtwEventParameterName.result] = result;
    NoShip.People.etw(eventName, parameters);
    

    
    People.RecentActivity.Core.EtwHelper._writePerfEvent(eventName, [sourceId, result]);
    
};



People.RecentActivity.Core.EtwHelper.get = function(eventName) {
    /// <summary>
    ///     Gets the ETW events by name.
    /// </summary>
    /// <param name="eventName" type="String">The event name.</param>
    /// <returns type="People.RecentActivity.Core.EtwFilter"></returns>
    if (!Jx.isUndefined(People.RecentActivity.Core.EtwHelper._events[eventName])) {
        // create a new from the existing events.
        return new People.RecentActivity.Core.EtwFilter(People.RecentActivity.Core.EtwHelper._events[eventName]);
    }

    return new People.RecentActivity.Core.EtwFilter(new Array(0));
};

People.RecentActivity.Core.EtwHelper.clear = function() {
    /// <summary>
    ///     Clears the current events.
    /// </summary>
    People.Social.clearKeys(People.RecentActivity.Core.EtwHelper._events);
};

People.RecentActivity.Core.EtwHelper._writePerfEvent = function(eventName, data) {
    /// <param name="eventName" type="String"></param>
    /// <param name="data" type="Array" elementType="Object"></param>
    Debug.assert(Jx.isNonEmptyString(eventName), 'eventName');
    Debug.assert(data != null, 'data');
    var index = eventName.lastIndexOf('_');
    if (index !== -1) {
        // figure out whether this was the start or stop event, and then remove any _start, _end, etc. from the end.
        var isStart = eventName.substr(index + 1) === 'start';
        eventName = eventName.substr(0, index);
        if (!!Jx.isUndefined(People.RecentActivity.Core.EtwHelper._events[eventName])) {
            // generate a new list.
            People.RecentActivity.Core.EtwHelper._events[eventName] = [];
        }

        var events = People.RecentActivity.Core.EtwHelper._events[eventName];
        if (isStart) {
            // just add the new event to the list.
            events.push(People.RecentActivity.Core.create_etwEvent(new Date(), data));
        }
        else {
            // figure out which event in the list this end belongs to. 
            for (var i = events.length - 1; i >= 0; i--) {
                var etwEvent = events[i];
                if (People.RecentActivity.Core.EtwHelper._isMatch(etwEvent.data, data)) {
                    etwEvent.timeEnd = new Date();
                    return;
                }            
            }

            Jx.log.write(3, 'Failed to find associated _start event with event: ' + eventName);
        }    
    }
};

People.RecentActivity.Core.EtwHelper._isMatch = function(original, match) {
    /// <param name="original" type="Array" elementType="Object"></param>
    /// <param name="match" type="Array" elementType="Object"></param>
    /// <returns type="Boolean"></returns>
    if (original.length !== match.length) {
        // if the lengths of the arrays don't even match, we have bigger problems.
        Jx.log.write(3, 'Tried to log ETW event, but _start and _end parameters do not match.');
        return false;
    }

    for (var i = 0; i < original.length; i++) {
        if (original[i] !== match[i]) {
            // the original and matcher don't.. match.
            return false;
        }    
    }

    return true;
};


;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.EventArgs = function(sender) {
    /// <summary>
    ///     Provides a base class for event argument classes.
    /// </summary>
    /// <param name="sender" type="Object"></param>
    /// <field name="_sender" type="Object">The sender.</field>
    this._sender = sender;
};

People.RecentActivity.EventArgs.prototype._sender = null;

Object.defineProperty(People.RecentActivity.EventArgs.prototype, "sender", {
    get: function() {
        /// <summary>
        ///     Gets the sender.
        /// </summary>
        /// <value type="Object"></value>
        return this._sender;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="EventArgs.js" />

People.RecentActivity.NotifyPropertyChangedEventArgs = function(sender, propertyName) {
    /// <summary>
    ///     Provides event arguments for the <see cref="T:People.RecentActivity.NotifyPropertyChangedEventHandler" /> delegate.
    /// </summary>
    /// <param name="sender" type="Object">The sender.</param>
    /// <param name="propertyName" type="String">The property name.</param>
    /// <field name="_propertyName$1" type="String">The name of the property.</field>
    People.RecentActivity.EventArgs.call(this, sender);
    Debug.assert(Jx.isNonEmptyString(propertyName), 'propertyName');
    this._propertyName$1 = propertyName;
};

Jx.inherit(People.RecentActivity.NotifyPropertyChangedEventArgs, People.RecentActivity.EventArgs);


People.RecentActivity.NotifyPropertyChangedEventArgs.prototype._propertyName$1 = null;

Object.defineProperty(People.RecentActivity.NotifyPropertyChangedEventArgs.prototype, "propertyName", {
    get: function() {
        /// <summary>
        ///     Gets the name of the property.
        /// </summary>
        /// <value type="String"></value>
        return this._propertyName$1;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_facebookTokenInfo = function(uid, token) {
    var o = { };
    o.uid = uid;
    o.token = token;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_feedEntryInfo = function(type, publisher, data, via, entities, annotations, isShared) {
    var o = { };
    o.type = type;
    o.publisher = publisher;
    o.data = data;
    o.via = via;
    o.entities = entities;
    o.annotations = annotations;
    o.isShared = isShared;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the type of a feed entry.
/// </summary>
People.RecentActivity.Core.FeedEntryInfoType = {
    /// <field name="none" type="Number" integer="true" static="true">No type.</field>
    none: 0,
    /// <field name="text" type="Number" integer="true" static="true">A text entry.</field>
    text: 1,
    /// <field name="link" type="Number" integer="true" static="true">A link entry.</field>
    link: 2,
    /// <field name="video" type="Number" integer="true" static="true">A video entry.</field>
    video: 3,
    /// <field name="photo" type="Number" integer="true" static="true">A photo entry.</field>
    photo: 4,
    /// <field name="photoAlbum" type="Number" integer="true" static="true">An album entry.</field>
    photoAlbum: 5
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_feedEntryLinkDataInfo = function(text, url, title, caption, description, tile) {
    var o = { };
    o.text = text;
    o.url = url;
    o.title = title;
    o.caption = caption;
    o.description = description;
    o.tile = tile;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_feedEntryPhotoAlbumDataInfo = function(text, album, photos, isTagged) {
    var o = { };
    Debug.assert(album != null, 'album');
    Debug.assert(album.type === 3, 'album.Type');
    Debug.assert(photos != null, 'photos');
    Debug.assert(photos.length > 0, 'photos.length');
    o.text = text;
    o.album = album;
    o.displayPhotos = photos;
    o.isTagged = isTagged;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_feedEntryPhotoDataInfo = function(text, photo, album, isTagged) {
    var o = { };
    Debug.assert(photo != null, 'photo');
    Debug.assert(photo.type === 2, 'photo.Type');
    Debug.assert(album == null || (album.type === 3), 'album');
    o.text = text;
    o.photo = photo;
    o.album = album;
    o.isTagged = isTagged;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_feedEntryStatusDataInfo = function(text) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(text), 'text');
    o.text = text;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_feedEntryVideoDataInfo = function(text, title, caption, description, tile, sourceType, sourceUrl, displayUrl) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(sourceUrl), 'sourceUrl');
    Debug.assert(Jx.isNonEmptyString(displayUrl), 'displayUrl');
    o.text = text;
    o.title = title;
    o.caption = caption;
    o.description = description;
    o.tile = tile;
    o.sourceType = sourceType;
    o.sourceUrl = sourceUrl;
    o.displayUrl = displayUrl;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents types of video.
/// </summary>
People.RecentActivity.Core.FeedEntryVideoDataInfoType = {
    /// <field name="none" type="Number" integer="true" static="true">No type.</field>
    none: 0,
    /// <field name="embed" type="Number" integer="true" static="true">An embeddable video.</field>
    embed: 1,
    /// <field name="raw" type="Number" integer="true" static="true">A raw (HTML5) video.</field>
    raw: 2
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_feedObjectInfo = function(id, sourceId, type, data, url, timestamp, commentDetails, comments, reactionDetails, reactions) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(sourceId), 'sourceId');
    o.id = id;
    o.sourceId = sourceId;
    o.type = type;
    o.data = data;
    o.url = url;
    o.timestamp = timestamp;
    o.comments = comments;
    o.commentDetails = commentDetails;
    o.reactions = reactions;
    o.reactionDetails = reactionDetails;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the type of a feed object.
/// </summary>
People.RecentActivity.Core.FeedObjectInfoType = {
    /// <field name="none" type="Number" integer="true" static="true">No type.</field>
    none: 0,
    /// <field name="entry" type="Number" integer="true" static="true">A feed entry.</field>
    entry: 1,
    /// <field name="photo" type="Number" integer="true" static="true">A photo.</field>
    photo: 2,
    /// <field name="photoAlbum" type="Number" integer="true" static="true">A photo album.</field>
    photoAlbum: 3
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_flyoutItemDescriptor = function(id, name, selected, onItemSelected) {
    var o = { };
    o.id = id;
    o.name = name;
    o.selected = selected;
    o.onItemSelected = onItemSelected;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.DateTimeHelper = function() {
    /// <summary>
    ///     Provides helpers for <see cref="T:System.Date" />.
    /// </summary>
};

People.RecentActivity.Core.DateTimeHelper.parseTimeStamp = function(timestamp) {
    /// <summary>
    ///     Parses timestamps.
    /// </summary>
    /// <param name="timestamp" type="String">The timestamp.</param>
    /// <returns type="Date"></returns>
    Debug.assert(Jx.isNonEmptyString(timestamp), 'timestamp');
    var parsedTime = new Date(timestamp);
    if (!isNaN(parsedTime.getTime())) {
        return parsedTime;
    }

    return new Date();
};

People.RecentActivity.Core.DateTimeHelper.isToday = function(date) {
    /// <summary>
    ///     Gets a value indicating whether the date is the current day.
    /// </summary>
    /// <param name="date" type="Date">The date.</param>
    /// <returns type="Boolean"></returns>
    var now = new Date();
    return (now.getFullYear() === date.getFullYear()) && (now.getMonth() === date.getMonth()) && (now.getDate() === date.getDate());
};

People.RecentActivity.Core.DateTimeHelper.isYesterday = function(date) {
    /// <summary>
    ///     Gets a value indicating whether the date is the previous day.
    /// </summary>
    /// <param name="date" type="Date">The date.</param>
    /// <returns type="Boolean"></returns>
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (yesterday.getFullYear() === date.getFullYear()) && (yesterday.getMonth() === date.getMonth()) && (yesterday.getDate() === date.getDate());
};

People.RecentActivity.Core.DateTimeHelper.subtract = function(a, b) {
    /// <summary>
    ///     Subtracts two <see cref="T:System.Date" />s.
    /// </summary>
    /// <param name="a" type="Date">The former.</param>
    /// <param name="b" type="Date">The latter.</param>
    /// <returns type="Number" integer="true"></returns>
    return a.getTime() - b.getTime();
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_linkEntityInfo = function(displayUrl, url) {
    var o = { };
    o.displayUrl = displayUrl;
    o.url = url;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.NetworkId = function() {
    /// <summary>
    ///     Contains network id constants.
    /// </summary>
    /// <field name="facebook" type="String" static="true">The network ID for Facebook.</field>
    /// <field name="twitter" type="String" static="true">The network ID for Twitter.</field>
    /// <field name="all" type="String" static="true">The network Id for aggregated networks.</field>
};

People.RecentActivity.Core.NetworkId.facebook = 'FB';
People.RecentActivity.Core.NetworkId.twitter = 'TWITR';
People.RecentActivity.Core.NetworkId.all = '__ALL__';
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_networkInfo = function(id, objectId, icon, name, isAggregated, isCommentsEnabled, isNotificationsEnabled, reactions, user, shareRefreshDelay) {
    var o = { };
    Debug.assert(id != null, 'id');
    Debug.assert(reactions != null, 'reactions');
    o.id = id;
    o.objectId = objectId;
    o.icon = icon;
    o.name = name;
    o.isAggregatedNetwork = isAggregated;
    o.isCommentingEnabled = isCommentsEnabled;
    o.isNotificationsEnabled = isNotificationsEnabled;
    o.reactions = reactions;
    o.user = user;
    o.shareRefreshDelay = shareRefreshDelay;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_networkReactionInfo = function(id, type, stringId, iconFeed, iconSelfPage, iconClass, isCountShown, isToggle) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(id), 'id');
    Debug.assert(Jx.isNonEmptyString(stringId), 'stringId');
    Debug.assert(Jx.isNonEmptyString(iconFeed), 'iconFeed');
    Debug.assert(Jx.isNonEmptyString(iconSelfPage), 'iconSelfPage');
    Debug.assert(Jx.isNonEmptyString(iconClass), 'iconClass');
    o.id = id;
    o.isCountShown = isCountShown;
    o.isToggle = isToggle;
    o.stringId = stringId;
    o.type = type;
    o.iconClass = iconClass;
    o.iconFeed = iconFeed;
    o.iconSelfPage = iconSelfPage;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     The network reaction type.
/// </summary>
People.RecentActivity.Core.NetworkReactionInfoType = {
    /// <field name="none" type="Number" integer="true" static="true">No reaction.</field>
    none: 0,
    /// <field name="like" type="Number" integer="true" static="true">A Facebook like.</field>
    like: 1,
    /// <field name="retweet" type="Number" integer="true" static="true">A retweet.</field>
    retweet: 2,
    /// <field name="favorite" type="Number" integer="true" static="true">A favorite.</field>
    favorite: 3
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_notificationInfo = function(id, publisher, timestamp, message, objectId, objectType, link, via, sourceId, isReply, isShare, isUnread) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(id), 'id');
    Debug.assert(publisher != null, 'publisher');
    Debug.assert(message != null, 'message');
    Debug.assert(sourceId != null, 'sourceId');
    o.id = id;
    o.isReply = isReply;
    o.isShare = isShare;
    o.isUnread = isUnread;
    o.link = link;
    o.message = message;
    o.objectId = objectId;
    o.objectType = objectType;
    o.publisher = publisher;
    o.sourceId = sourceId;
    o.timestamp = timestamp;
    o.via = via;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the type of a feed object.
/// </summary>
People.RecentActivity.Core.NotificationInfoType = {
    /// <field name="none" type="Number" integer="true" static="true">No type.</field>
    none: 0,
    /// <field name="entry" type="Number" integer="true" static="true">A feed entry.</field>
    entry: 1,
    /// <field name="photo" type="Number" integer="true" static="true">A photo.</field>
    photo: 2,
    /// <field name="photoAlbum" type="Number" integer="true" static="true">A photo album.</field>
    photoAlbum: 3,
    /// <field name="video" type="Number" integer="true" static="true">A video.</field>
    video: 4,
    /// <field name="person" type="Number" integer="true" static="true">A person.</field>
    person: 5
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     A list of operations.
/// </summary>
People.RecentActivity.Core.Permissions = {
    /// <field name="none" type="Number" integer="true" static="true">No operations.</field>
    none: 0,
    /// <field name="add" type="Number" integer="true" static="true">The permissions for the Add operation.</field>
    add: 1,
    /// <field name="remove" type="Number" integer="true" static="true">The permissions for the Remove operation.</field>
    remove: 2,
    /// <field name="full" type="Number" integer="true" static="true">The full permissions.</field>
    full: 3
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_photoAlbumInfo = function(id, owner, name, description, entities, totalCount, cover, photos) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(id), 'id');
    Debug.assert(totalCount >= 0, 'totalCount');
    o.id = id;
    o.owner = owner;
    o.name = name;
    o.description = description;
    o.entities = entities;
    o.totalCount = totalCount;
    o.cover = cover;
    o.photos = photos;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_photoInfo = function(id, albumId, owner, caption, originalSource, originalSourceHeight, originalSourceWidth, source, sourceHeight, sourceWidth, thumbnailSource, thumbnailSourceHeight, thumbnailSourceWidth) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(id), 'id');
    o.id = id;
    o.albumId = albumId;
    o.owner = owner;
    o.caption = caption;
    o.index = -1;
    o.entities = new Array(0);
    o.originalSource = originalSource;
    o.originalSourceHeight = originalSourceHeight;
    o.originalSourceWidth = originalSourceWidth;
    o.source = source;
    o.sourceHeight = sourceHeight;
    o.sourceWidth = sourceWidth;
    o.tags = new Array(0);
    o.thumbnailSource = thumbnailSource;
    o.thumbnailSourceHeight = thumbnailSourceHeight;
    o.thumbnailSourceWidth = thumbnailSourceWidth;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_photoTagInfo = function(taggedContact, x, y, timestamp) {
    var o = { };
    Debug.assert(taggedContact != null, 'taggedContact');
    o.contact = taggedContact;
    o.x = x;
    o.y = y;
    o.timestamp = timestamp;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_reactionDetailsInfo = function(id, count, permissions) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(id), 'id');
    Debug.assert(count >= 0, 'count');
    o.id = id;
    o.count = count;
    o.permissions = permissions;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_reactionInfo = function(type, publisher) {
    var o = { };
    Debug.assert(type != null, 'type');
    o.type = type;
    o.publisher = publisher;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the result of an operation.
/// </summary>
People.RecentActivity.Core.ResultCode = {
    /// <field name="none" type="Number" integer="true" static="true">The operation has not yet completed.</field>
    none: 0,
    /// <field name="success" type="Number" integer="true" static="true">Operation completed successfully.</field>
    success: 1,
    /// <field name="failure" type="Number" integer="true" static="true">A generic failure (unknown, or non-specific failure.)</field>
    failure: 2,
    /// <field name="partialFailure" type="Number" integer="true" static="true">Indicates some of requests failed as part of aggregation.</field>
    partialFailure: 3,
    /// <field name="invalidPermissions" type="Number" integer="true" static="true">The target user has not authorized this action.</field>
    invalidPermissions: 4,
    /// <field name="invalidUserCredential" type="Number" integer="true" static="true">Invalid user credentials.</field>
    invalidUserCredential: 5,
    /// <field name="partialFailureWithInvalidUserCredential" type="Number" integer="true" static="true">A partial failure in aggregation with one of failure being InvalidUserCredential.</field>
    partialFailureWithInvalidUserCredential: 6,
    /// <field name="userOffline" type="Number" integer="true" static="true">The user has no internet access or is in offline mode.</field>
    userOffline: 7
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="ResultCode.js" />

People.RecentActivity.Core.ResultInfo = function(resultCode) {
    /// <summary>
    ///     Represents a result object containing request result information.
    /// </summary>
    /// <param name="resultCode" type="People.RecentActivity.Core.ResultCode">The result code.</param>
    /// <field name="_code" type="People.RecentActivity.Core.ResultCode">The result code.</field>
    /// <field name="_errorMap" type="Object">Maps failed network to its result code.</field>
    this._code = resultCode;
    this._errorMap = {};
};


People.RecentActivity.Core.ResultInfo.prototype._code = 0;
People.RecentActivity.Core.ResultInfo.prototype._errorMap = null;

Object.defineProperty(People.RecentActivity.Core.ResultInfo.prototype, "code", {
    get: function() {
        /// <summary>
        ///     Gets or sets the result code.
        /// </summary>
        /// <value type="People.RecentActivity.Core.ResultCode"></value>
        return this._code;
    },
    set: function(value) {
        this._code = value;
    }
});

Object.defineProperty(People.RecentActivity.Core.ResultInfo.prototype, "errorMap", {
    get: function() {
        /// <summary>
        ///     Gets or sets the error map.
        /// </summary>
        /// <value type="Object"></value>
        return this._errorMap;
    },
    set: function(value) {
        this._errorMap = value;
    }
});

Object.defineProperty(People.RecentActivity.Core.ResultInfo.prototype, "isSuccessOrPartialFailure", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the result is success or partial failure.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._code === 1 || this._code === 3 || this._code === 6;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_shareOperationInfo = function(dataFormat, data, dataView) {
    var o = { };
    Debug.assert(dataFormat != null, 'dataFormat');
    Debug.assert(data != null, 'data');
    o.dataFormat = dataFormat;
    o.data = data;
    o.dataView = dataView;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Core.create_temporaryContactInfo = function(id, sourceId, networkHandle, name, userTile, largeUserTile, profileUrl) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(id), 'id');
    Debug.assert(Jx.isNonEmptyString(sourceId), 'sourceId');
    Debug.assert(Jx.isNonEmptyString(name), 'name');
    o.objectId = id;
    o.objectSourceId = sourceId;
    o.objectType = 'literal';
    o.name = name;
    o.nickname = networkHandle;
    o.userTile = userTile;
    o.largeUserTile = largeUserTile;
    o.profileUrl = profileUrl;
    return o;
};
});