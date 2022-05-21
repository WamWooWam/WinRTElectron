
//! Copyright (c) Microsoft Corporation. All rights reserved.

Jx.delayDefine(People, "loadSocialUICore", function () {

People.loadSocialUICore = Jx.fnEmpty;

People.loadSocialModel();

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="AnnotationsControl.js" />

/// <summary>
///     Provides a list of placements for the <see cref="T:People.RecentActivity.UI.Core.AnnotationsControl" />.
/// </summary>
People.RecentActivity.UI.Core.AnnotationsControlPlacement = {
    /// <field name="normal" type="Number" integer="true" static="true">Indicates annotations are being rendered in the default context.</field>
    normal: 0,
    /// <field name="oneUp" type="Number" integer="true" static="true">Indicates the annotations are being rendered in a 1-up experience.</field>
    oneUp: 1
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="ContactControl.js" />

/// <summary>
///     Provides a list of rendering types for the <see cref="T:People.RecentActivity.UI.Core.ContactControl" />.
/// </summary>
People.RecentActivity.UI.Core.ContactControlType = {
    /// <field name="tile" type="Number" integer="true" static="true">Renders a picture.</field>
    tile: 0,
    /// <field name="name" type="Number" integer="true" static="true">Renders a name.</field>
    name: 1,
    /// <field name="handleWithNameFallback" type="Number" integer="true" static="true">Renders a handle, falling back on the name if needed.</field>
    handleWithNameFallback: 2
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Provides a list of error message types that cannot be represented by a ResultInfo instance.
/// </summary>
/// <field name="none" type="Number" integer="true" static="true">No type.</field>
/// <field name="empty" type="Number" integer="true" static="true">No content.</field>
People.RecentActivity.UI.Core.ErrorMessageType = {
    none: 0, 
    empty: 1
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Provides a list of error message contexts.
/// </summary>
People.RecentActivity.UI.Core.ErrorMessageContext = {
    /// <field name="none" type="Number" integer="true" static="true">No context.</field>
    none: 0,
    /// <field name="notifications" type="Number" integer="true" static="true">From notifications.</field>
    notifications: 1,
    /// <field name="photos" type="Number" integer="true" static="true">From photos.</field>
    photos: 2,
    /// <field name="whatsNew" type="Number" integer="true" static="true">From What's New.</field>
    whatsNew: 3
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Provides a list of operations.
/// </summary>
People.RecentActivity.UI.Core.ErrorMessageOperation = {
    /// <field name="none" type="Number" integer="true" static="true">No operation.</field>
    none: 0,
    /// <field name="read" type="Number" integer="true" static="true">A read operation.</field>
    read: 1,
    /// <field name="write" type="Number" integer="true" static="true">A write operation.</field>
    write: 2
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     The error message location.
/// </summary>
People.RecentActivity.UI.Core.ErrorMessageLocation = {
    /// <field name="inline" type="Number" integer="true" static="true">An inline error.</field>
    inline: 0,
    /// <field name="messageBar" type="Number" integer="true" static="true">A message bar.</field>
    messageBar: 1
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.create_landingPageNavigationData = function () {
    return {};
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.create_recentActivityNavigationData = function(networkId) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(networkId), '!string.IsNullOrEmpty(networkId)');
    o.networkId = networkId;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.create_selfPageAlbumData = function(isOneUp, photoId) {
    var o = { };
    o.isOneUp = isOneUp;
    o.photoId = photoId;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.create_selfPageNavigationData = function(networkId, objectId, objectType) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(networkId), '!string.IsNullOrEmpty(networkId)');
    Debug.assert(Jx.isNonEmptyString(objectId), '!string.IsNullOrEmpty(objectId)');
    Debug.assert(Jx.isNonEmptyString(objectType), '!string.IsNullOrEmpty(objectType)');
    o.networkId = networkId;
    o.objectId = objectId;
    o.objectType = objectType;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.Html = { 
    feedLayout: '\r\n<div class="ra-feedLayout" id="layout-content">\r\n  <div class="ra-feedLayoutErrors" id="layout-errors"></div>  \r\n  <div class="ra-feedLayoutPsa" id="layout-psa"></div>\r\n  <div class="ra-feedLayoutViewport" id="layout-list">\r\n    <div class="ra-seeMoreStatusPanel" id="layout-seemore">\r\n      <div class="ra-seeMoreErrors" id="seemore-error"></div>\r\n      <progress class="ra-centeredProgressWheel win-large win-ring" id="seemore-progress"></progress>\r\n    </div>\r\n    <div class="ra-listViewViewportPadding" aria-hidden="true"></div>\r\n  </div>\r\n</div>',
    feedPanel:
        '<div class="ra-panel ra-feedPanel">' +
            '<div class="profileLanding-panelTitle ra-panelTitle" tabIndex="-1">' +
                '<div class="panelTitle-link" id="panel-title" tabIndex="0" role="button">' +
                    '<a class="ra-panelTitleName panelTitle-link-text" id="panel-title-name"></a>' +
                    '<a class="panelTitle-link-chevron ra-panelTitleMore" id="panel-title-more"></a>' +
                '</div>' +
            '</div>' +
            '<div class="ra-panelContent ra-feedPanelContent" id="panel-content">' +
                '<div class="ra-feedPanelShareContainer" id="panel-share"></div>' +
                '<div class="ra-feedPanelContentContainer" id="panel-content-container">' +
                    '<div class="ra-progressContainer" id="panel-progress">' +
                        '<progress class="ra-centeredProgressWheel ra-feedPanelProgress ra-landingpageProgress win-large win-ring"></progress>' +
                    '</div>' +
                    '<div class="ra-panelErrors ra-feedPanelErrors" id="panel-errors" tabindex="0"></div>' +
                    '<div class="ra-panelEntries ra-feedPanelEntries" id="panel-entries"></div>' +
                '</div>' +
            '</div>' +
        '</div>',
    feedPanelEntries: '<div class="ra-feedPanelEntriesContainer" role="listbox"></div>',
    feedEntry: '<div class="ra-item"></div>',
    feedEntryHeader: '\r\n<div class="ra-itemPublisher" id="item-header">\r\n  <div class="ra-itemPublisherPicture" id="item-pub-picture"></div>\r\n  <div class="ra-itemPublisherDetails">\r\n    <div class="ra-itemPublisherName" id="item-pub-name"></div>\r\n    <div class="ra-itemTime" id="item-time"></div>\r\n  </div>\r\n</div>',
    feedEntryFooter: '\r\n <div class="ra-itemFooter" id="item-footer">\r\n    <div class="ra-itemAnnotation" id="item-pub-annotation"></div>\r\n    <div class="ra-itemErrors" id="item-errors"></div>\r\n    <div class="ra-itemMetadata">\r\n      <div class="ra-itemNetwork ra-fauxButton" id="item-network-container" tabindex="-1" role="button" aria-hidden="true">\r\n        <img class="ra-itemNetworkIcon" id="item-network-icon" />\r\n      </div>\r\n      <div class="ra-itemReactions" id="item-reactions"></div>\r\n    </div>\r\n</div>',
    feedEntryContent: '<div class="ra-itemContent" id="item-content"></div>',
    feedEntryText: '\r\n<div class="ra-itemTextContent">\r\n  <div class="ra-itemTextContentInner" id="item-text"></div>\r\n</div>',
    feedEntryLink: '\r\n<div class="ra-itemLinkContent">\r\n  <div class="ra-itemLinkText" id="link-text"></div>\r\n  <div class="ra-itemLinkPreview" id="link-preview">\r\n    <img class="ra-itemLinkImage" id="link-image" />\r\n    <div class="ra-itemLinkDetails">\r\n      <div class="ra-itemLinkTitle ra-link" id="link-title" role="link" aria-hidden="true"></div>\r\n      <div class="ra-itemLinkCaption" id="link-caption"></div>\r\n      <div class="ra-itemLinkDescription" id="link-description"></div>\r\n    </div>\r\n  </div>\r\n</div>',
    feedEntryVideo: '\r\n<div class="ra-itemVideoContent">\r\n  <div class="ra-itemVideoText" id="video-text"></div>\r\n  <div class="ra-itemVideoPreview" id="video-preview">\r\n    <img class="ra-itemVideoImage" id="video-image" />\r\n    <img class="ra-itemVideoImageOverlay" src="~/images/ra-videoOverlay.png" />\r\n    <div class="ra-itemVideoDetails">\r\n      <div class="ra-itemVideoTitle ra-link" id="video-title" role="link" aria-hidden="true"></div>\r\n      <div class="ra-itemVideoCaption" id="video-caption"></div>\r\n      <div class="ra-itemVideoDescription" id="video-description"></div>\r\n    </div>\r\n  </div>\r\n</div>',
    feedEntryPhoto: ' \r\n<div class="ra-itemPhotoContent">\r\n  <div class="ra-itemPhotoContainer" id="photo-container">\r\n    <img class="ra-itemPhotoImage" id="photo-image" />\r\n  </div>\r\n  <div class="ra-itemPhotoCaption" id="photo-caption"></div>\r\n</div>',
    feedEntryPhotoSpecialCaptionLink: '<div class="ra-fauxButton ra-itemPhotoCaptionLink" tabindex="-1" role="button"></div>',
    feedEntryPhotoAlbum: ' \r\n<div class="ra-itemPhotoAlbumContent">\r\n  <div class="ra-itemPhotoAlbumContainer" id="photo-grid">\r\n    <div class="ra-itemPhotoAlbumImageBox ra-itemPhotoAlbumHeroBox" id="photo-hero-box" aria-hidden="true">\r\n      <img role="button" class="ra-itemPhotoAlbumImage ra-itemPhotoAlbumHeroImage" id="photo-hero-image" />\r\n    </div>\r\n    <div class="ra-itemPhotoAlbumImageBox ra-itemPhotoAlbumThumbnailBox ra-itemPhotoAlbumThumbnailBox1" id="photo-thumb1-box" aria-hidden="true">\r\n      <img role="button" class="ra-itemPhotoAlbumImage ra-itemPhotoAlbumThumbnailImage ra-itemPhotoAlbumThumbnailImage1" id="photo-thumb1-image" />\r\n    </div>\r\n    <div class="ra-itemPhotoAlbumImageBox ra-itemPhotoAlbumThumbnailBox ra-itemPhotoAlbumThumbnailBox2" id="photo-thumb2-box" aria-hidden="true">\r\n      <img role="button" class="ra-itemPhotoAlbumImage ra-itemPhotoAlbumThumbnailImage ra-itemPhotoAlbumThumbnailImage2" id="photo-thumb2-image" />\r\n    </div>\r\n  </div>\r\n  <div class="ra-itemPhotoAlbumCaption" id="photo-caption"></div>\r\n</div>',
    feedEntryPhotoAlbumName: '<div class="ra-fauxButton ra-itemPhotoAlbumName" tabindex="-1" role="button"></div>',

    feedEntryReactionIcon:
        '<div class="ra-itemReaction" role="button" aria-hidden="true">' +
          '<div class="ra-fauxButton">' +
            '<span class="ra-itemReactionSection ra-itemReactionCountSection">' +
              '<span class="ra-itemReactionSectionGrid">' +
                '<span class="ra-itemReactionCount" id="reaction-count" aria-hidden="true"></span>' +
                '<span class="ra-itemReactionCount" id="reaction-count-next" aria-hidden="true"></span>' +
              '</span>' +
            '</span>' + 
            '<span class="ra-itemReactionIcon" id="reaction-icon" aria-hidden="true"></span>' +
            '<span class="ra-itemReactionSection ra-itemReactionActionSection">' +
              '<span class="ra-itemReactionSectionGrid">' +
                '<span class="ra-itemReactionAction" id="reaction-action" aria-hidden="true"></span>' +
                '<span class="ra-itemReactionAction" id="reaction-action-undo" aria-hidden="true"></span>' +
              '</span>' +
            '</span>' +
          '</div>' +
        '</div>',

    feedEntryAnnotationInReplyToButton: '<div class="ra-fauxButton ra-fauxInheritButton" tabindex="-1" role="button"></div>',
    progress: '<progress class="ra-progress-global"></progress>',
    notificationLayout: '\r\n<div class="sn-feedLayout">\r\n  <div class="sn-feedContentErrors" id="notification-list-content-errors"></div>  \r\n  <div class="sn-feedContentPsa" id="notification-list-content-psa"></div>\r\n  <div class="sn-feedContent" id="notification-list-content"></div>\r\n</div>',
    notificationPanel:
        '<div class="ra-panel ra-notificationPanel">' +
            '<div class="profileLanding-panelTitle ra-panelTitle" tabIndex="-1">' +
                '<div class="panelTitle-link" id="panel-title" tabIndex="0" role="button">' +
                    '<a class="ra-panelTitleName panelTitle-link-text" id="panel-title-name"></a>' +
                    '<a class="panelTitle-link-chevron ra-panelTitleMore" id="panel-title-more"></a>' +
                '</div>' +
            '</div>' +
            '<div class="ra-panelContent ra-notificationPanelContent" id="panel-content">' +
                '<div class="ra-progressContainer" id="panel-progress">' +
                    '<progress class="ra-centeredProgressWheel ra-notificationPanelProgress ra-landingpageProgress win-large win-ring" id="panel-progress"></progress>' +
                '</div>' +
                '<div class="ra-panelErrors ra-notificationPanelErrors" id="panel-errors" tabindex="0"></div>' +
                '<div id="panel-viewport" class="ra-notificationLayoutGrid"></div>' +
            '</div>' +
        '</div>',
    notificationItem: '\r\n<div class="sn-item">\r\n  <div class="sn-itemTile" id="notification-pub-picture">\r\n  </div>\r\n  <div class="sn-itemDetails" id="notification-main">\r\n    <div class="sn-itemText" id="notification-text" aria-hidden="true"></div>\r\n    <div class="sn-itemTimeVia" id="notification-timeVia" aria-hidden="true"></div>\r\n  </div>\r\n</div>',
    photoAlbumLayout: ' \r\n<div class="ra-photoLayout" id="layout-main">\r\n  <div class="ra-photoLayoutErrors" id="layout-errors"></div>\r\n  <div class="ra-photoLayoutPsa" id="layout-psa"></div>\r\n  <div class="ra-photoLayoutGrid" id="layout-content"></div>\r\n</div>',
    photoAlbumPanel:
        '<div class="ra-panel ra-photosPanel">' +
            '<div class="profileLanding-panelTitle ra-panelTitle" tabIndex="-1">' +
                '<div class="panelTitle-link" id="panel-title" tabIndex="0" role="button">' +
                    '<a class="ra-panelTitleName panelTitle-link-text" id="panel-title-name"></a>' +
                    '<a class="panelTitle-link-chevron ra-panelTitleMore" id="panel-title-more"></a>' +
                '</div>' +
            '</div>' +
            '<div class="ra-panelContent ra-photosPanelContent" id="panel-content">' +
                '<div class="ra-progressContainer" id="panel-progress">' +
                    '<progress class="ra-centeredProgressWheel ra-photosPanelProgress ra-landingpageProgress win-large win-ring" id="panel-progress"></progress>' +
                '</div>' +
                '<div class="ra-panelErrors ra-photosPanelErrors" id="panel-errors" tabindex="0"></div>' +
                '<div id="panel-viewport" class="ra-photoLayoutGrid"></div>' +
            '</div>' +
        '</div>',
    photoAlbumItem: '\r\n<div class="ra-photoAlbum">\r\n  <div class="ra-photoAlbumBackground" />\r\n  <img class="ra-photoAlbumCover" id="album-cover-low" />\r\n  <img class="ra-photoAlbumCover" id="album-cover-high" />\r\n  <div class="ra-photoAlbumInfo">\r\n    <div class="ra-photoAlbumName" id="album-name" aria-hidden="true"></div>\r\n    <div class="ra-photoAlbumCount" id="album-count" aria-hidden="true"></div>\r\n  </div>\r\n  <div class="ra-photoAlbumHoverBorder"></div>\r\n</div>',
    selfPage: '\r\n<div class="ra-selfPage" id="ra-selfPage">\r\n  <button type="button" class="ra-selfPageBack" id="selfpage-back" tabindex="1000"></button>\r\n  <div class="ra-selfPageContainer">\r\n    <div class="ra-selfPageContent" id="selfpage-content"></div>\r\n    <div class="ra-selfPageSidebar" id="selfpage-sidebar"></div>\r\n  </div>\r\n</div>',
    selfPageSidebar: '\r\n<div class="ra-selfPageSidebarContent">\r\n  <div class="ra-selfPageSidebarScroll" id="selfpage-sidebar-scroll">\r\n    <div class="ra-selfPageSummaryContainer" id="selfpage-summary-container"></div>\r\n    <div class="ra-selfPageReactionsContainer" id="selfpage-reactions-container"></div>\r\n  </div>\r\n</div>',

    selfPageSummary:
        '<div class="ra-selfPageSummary">' +
          '<div class="ra-selfPageSummaryPicture" id="summary-picture"></div>' +
          '<div class="ra-selfPageSummaryDetails" tabindex="0" role="listitem">' +
            '<div class="ra-selfPageSummaryName" id="summary-name"></div>' +
            '<div class="ra-selfPageSummaryText" id="summary-text"></div>' +
            '<div class="ra-selfPageSummaryAnnotations" id="summary-annotations"></div>' +
            '<div class="ra-selfPageSummaryTimeVia" id="summary-time-via"></div>' +
            '<div class="ra-selfPageSummaryExtra" id="summary-extra"></div>' +
          '</div>' +
        '</div>',

    selfPageSummarySeeMore:
        '<div class="ra-selfPageSummarySeeMore">' +
          '<div class="ra-fauxButton ra-selfPageSummarySeeMoreButton" id="summary-seemore" role="link" tabindex="0" aria-hidden="true"></div>' +
        '</div>',

    selfPageReactions: '\r\n<div class="ra-reactions" role="listbox">\r\n  <div class="ra-reactionTitle" id="item-reaction-title"></div>\r\n  <div class="ra-reactionErrors" id="item-reaction-errors"></div>\r\n  <div class="ra-reactionContent">\r\n    <div class="ra-fauxButton ra-reactionButton" role="option" id="item-reaction-button" tabindex="-1"></div>\r\n    <span class="ra-reactionList" id="item-reaction-list"></span>\r\n    <div class="ra-fauxButton ra-reactionOthersButton" role="option" id="item-reaction-others" aria-haspopup="true" tabindex="-1">\r\n      <span class="ra-reactionOthersButtonLabel"></span>\r\n    </div>\r\n  </div>\r\n</div>',
    selfPageComments: '\r\n<div class="ra-comments">\r\n  <div class="ra-commentTitle" id="item-comment-title"></div>\r\n  <div class="ra-commentList" id="item-comment-list" role="listbox"></div>\r\n</div>',
    selfPageCommentInput: '\r\n<div class="ra-commentInput">\r\n  <div class="ra-commentInputErrors" id="item-comment-errors"></div>\r\n  <textarea class="ra-commentInputArea" id="item-comment-input" role="textbox"></textarea>\r\n  <div class="ra-commentInputDetails" id="item-comment-details">\r\n    <span class="ra-commentCount" id="item-comment-count" role="status" aria-live="polite"></span>\r\n    <button type="button" class="ra-commentSubmit" role="button" id="item-comment-submit"></button>\r\n  </div>\r\n</div>',

    selfPageComment:
        '<div class="ra-comment" id="item-comment-content" role="option">' +
          '<span class="ra-commentName" id="item-comment-name"></span> ' +
          '<span class="ra-commentText" id="item-comment-text"></span> ' +
          '<span class="ra-commentTime" id="item-comment-time"></span>' +
        '</div>',

    selfPagePlainContent:
        '<div class="ra-selfPagePlainItem">' +
          '<div class="ra-selfPagePlainItemName" id="item-contact-name"></div>' +
          '<div class="ra-selfPagePlainItemContact" id="item-contact-picture"></div>' +
          '<div class="ra-selfPagePlainItemContent">' +
            '<div class="ra-selfPagePlainItemScrollRegion" id="item-content" tabindex="0" role="listitem">' +
              '<div class="ra-selfPagePlainItemText" id="item-text"></div>' +
              '<div class="ra-selfPagePlainItemPreview" id="item-preview">' +
                '<div class="ra-selfPagePlainItemImageContainer">' +
                  '<img class="ra-selfPagePlainItemImage" id="item-image" />' +
                '</div>' +
                '<div class="ra-selfPagePlainItemDetails">' +
                  '<div class="ra-selfPagePlainItemTitle ra-link" id="item-title" tabindex="-1" role="link"></div>' +
                  '<div class="ra-selfPagePlainItemCaption" id="item-caption"></div>' +
                  '<div class="ra-selfPagePlainItemDescription" id="item-description"></div>' +
                '</div>' +
              '</div>' +
              '<div class="ra-selfPagePlainItemAnnotations" id="item-annotations"></div>' +
              '<div class="ra-selfPagePlainItemTimeVia" id="item-timevia" aria-hidden="true"></div>' +
            '</div>' +
          '</div>' +
        '</div>',

    selfPagePhotoAlbumContent: ' \r\n<div class="ra-selfPagePhotoAlbumItem">\r\n  <div class="ra-selfPagePhotoAlbumItemHeader">\r\n    <div class="ra-selfPagePhotoAlbumItemTitle" id="item-title"></div>\r\n    <div class="ra-selfPagePhotoAlbumItemCount" id="item-count"></div>\r\n  </div>\r\n  <div class="ra-selfPagePhotoAlbumItemList">\r\n    <div class="ra-selfPagePhotoAlbumItemListContainer" id="item-list"></div>\r\n  </div>\r\n</div>',
    selfPagePhotoAlbumItem: '\r\n<div class="ra-selfPagePhotoAlbumItemPhotoContainer" role="img">\r\n  <img class="ra-selfPagePhotoAlbumItemPreview" id="photoalbum-preview" />\r\n  <img class="ra-selfPagePhotoAlbumItemPhoto" id="photoalbum-item" />\r\n</div>',
    selfPagePhotoContent: '\r\n<div class="ra-selfPagePhotoItem">\r\n</div>',
    selfPagePhotoExtra: '<span class="ra-selfPagePhotoExtra"></span>',
    selfPagePhotoExtraAlbum: '<div class="ra-fauxButton" role="button"></div>',
    selfPagePhotoTags: '\r\n<div class="ra-selfPagePhotoTags" id="photo-tags" role="listbox">\r\n  <div class="ra-selfPagePhotoTagsTitle" id="photo-tags-title">\r\n  </div>\r\n  <div class="ra-selfPagePhotoTagsContent">\r\n    <span class="ra-selfPagePhotoTagsList" id="photo-tags-list"></span>\r\n    <div class="ra-fauxButton ra-selfPagePhotoTagsOthersButton" role="option" aria-haspopup="true" id="photo-tags-others"></div>\r\n  </div>\r\n</div>',
    formattedLink: '<a class="ra-link" role="link" tabindex="0"></a>',
    formattedHashTag: '<a class="ra-link ra-hashTag" role="link" tabindex="0"></a>',
    stackingListViewViewport: '<div class="ra-listViewViewport" role="group"></div>',
    psaUpsell: '\r\n<div class="ra-psa">\r\n  <div class="ra-psaTitle" id="psa-title"></div>\r\n  <div class="ra-psaText" id="psa-text"></div>\r\n</div>',
    credentialUpsell: '<div class="ra-credentialUpsell"></div>',
    credentialUpsellLink: '<span class="ra-credentialLink ra-link"></span>',
    errorControl: '<div class="ra-error"></div>',
    errorPermissionsButton: '<div class="ra-fauxButton ra-fauxInheritButton ra-errorButton" role="button"></div>',
    shareLayout: '<div class="ra-shareLayout"></div>',
    sharePage: '\r\n<div class="ra-shareContent" id="share-content">\r\n  <div class="ra-shareContentOverlay" id="share-content-overlay">\r\n    <div class="ra-shareContentOverlayTranparency"></div>\r\n  </div>\r\n  <div class="ra-shareContentContainer" id="share-content-container">\r\n    <div class="ra-shareContentHeader" id="share-content-header"></div>\r\n    <div class="ra-shareContentBodyContainer" id="share-content-body-container">\r\n      <div class="ra-shareContentBody" id="share-content-body"></div>\r\n    </div>\r\n  </div>\r\n</div>\r\n',
    shareSyncingPage: '\r\n<div class="ra-shareContentSyncing" id="share-content-syncing">\r\n  <div class="ra-shareContentSyncingContainer">\r\n    <progress class="ra-shareContentSyncingProgress win-ring"></progress><span class="ra-shareContentSyncingLabel" id="share-content-syncing-label" role="status" aria-live="polite"></span>\r\n  </div>\r\n</div>\r\n',
    shareLoadingPage: '\r\n<div class="ra-shareContentLoading" id="share-content-loading">\r\n  <div class="ra-shareContentLoadingContainer">\r\n    <progress class="ra-shareContentLoadingProgress win-ring"></progress><span class="ra-shareContentLoadingLabel" id="share-content-loading-label" role="status" aria-live="polite"></span>\r\n  </div>\r\n</div>\r\n',
    shareErrorPage: '<div class="ra-shareContentError" id="share-content-error"></div>',
    shareConnectPage: '\r\n<div class="ra-shareConnectPage" id="share-connectpage">\r\n  <div class="ra-shareConnectPageHeader" id="share-connectpage-header"></div>\r\n  <div class="ra-shareConnectPageError" id="share-connectpage-error"></div>\r\n  <div class="ra-shareConnectNetworkList" id="share-connectpage-networklist" role="group"></div>\r\n</div>',
    shareConnectPageNetwork: '\r\n<div class="ra-shareConnectNetwork" role="link" tabindex="0">\r\n  <div class="ra-shareConnectNetworkIcon"><img id="share-connectpage-network-iconimage" /></div>\r\n  <div class="ra-shareConnectNetworkText" id="share-connectpage-network-text"></div>\r\n</div>',
    shareNetworkSelect: '\r\n<div class="ra-shareNetworkSelect" role="button" tabindex="0">\r\n  <div class="ra-shareNetworkSelectContainer">\r\n    <div class="ra-shareNetworkSelectCurrentItem" id="share-networkselect-currentitem" aria-hidden="true"></div>\r\n    <div class="ra-shareNetworkSelectDropdown" id="share-networkselect-dropdown" aria-hidden="true">&#xE099;</div>\r\n  </div>\r\n</div>',
    shareNetworkSelectFlyout: '<div class="ra-shareNetworkSelectFlyout" role="listbox"></div>',
    shareNetworkSelectItem: '\r\n<div class="ra-shareNetworkSelectItem" role="option">\r\n  <div class="ra-shareNetworkSelectItemIcon" aria-hidden="true">\r\n    <img class="ra-shareNetworkSelectItemIconImage" id="share-networkselect-item-icon-image" />\r\n  </div>\r\n  <div class="ra-shareNetworkSelectItemName" id="share-networkselect-item-name" aria-hidden="true"></div>\r\n</div>',
    shareSendButton: '\r\n<button type="button" class="ra-shareSendButton win-command win-selection" role="button">\r\n  <span class="win-commandicon win-commandring">\r\n    <span class="win-commandimage">&#xE1D7;</span>\r\n  </span>\r\n</button>',
    shareCanvas: '<div class="ra-shareCanvas"></div>',
    sharePreview: '\r\n<div class="ra-shareLinkPreview">\r\n  <div class="ra-shareLinkPreviewBasic" id="share-link-preview-basic"></div>\r\n  <div class="ra-shareLinkPreviewRich" id="share-link-preview-rich"></div>\r\n</div>',
    shareCharacterCount: '\r\n<div class="ra-shareCharacterCount" role="status" aria-live="polite" aria-atomic="true">\r\n  <span class="ra-shareCharacterCountValue" id="share-charactercount-value"></span>\r\n  <span class="ra-shareCharacterCountError" id="share-charactercount-error"></span>\r\n</div>',
    shareProgress: '\r\n<span class="ra-shareProgress" role="status" aria-live="polite">\r\n  <progress class="ra-shareProgressProgress win-ring" aria-hidden="true"></progress><span class="ra-shareProgressLabel" id="share-progress-label"></span>\r\n</span>',
    shareErrorMessage: '<div class="ra-shareErrorMessage" role="alert" aria-live="polite"></div>',

    shareControl:
        '<div class="ra-shareControl">' +
          '<div class="ra-shareControlOverlay" id="share-control-overlay">' +
            '<div class="ra-shareControlOverlayTranparency"></div>' +
          '</div>' +
          '<div class="ra-shareControlBody" id="share-control-body"></div>' +
        '</div>',

    shareControlCanvasContainer: '<div class="ra-shareControlCanvasContainer"></div>',
    shareControlLinkPreviewClear: '<span class="ra-shareControlLinkPreviewClear" tabindex="0" role="button"></span>'
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.create_point = function(left, top) {
    var o = { };
    o.left = left;
    o.top = top;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\EventListener.js" />
/// <reference path="..\Helpers\AriaHelper.js" />

(function () {
    // The attribute used to store a reference to a Control.
    var controlAttribute = '-ms-ra-control';

    People.RecentActivity.UI.Core.Control = function (element) {
        /// <summary>
        ///     Provides a basic control.
        /// </summary>
        /// <param name="element" type="HTMLElement">The element to wrap.</param>
        /// <field name="_element" type="HTMLElement">The element.</field>
        /// <field name="_listener" type="People.RecentActivity.UI.Core.EventListener">The event listener.</field>
        /// <field name="_rendered" type="Boolean">Whether the control has been rendered.</field>
        /// <field name="_disposed" type="Boolean">Whether the control was disposed.</field>
        if (element != null) {
            this.element = element;
        }
    };

    Jx.mix(People.RecentActivity.UI.Core.Control.prototype, Jx.Events);
    Jx.mix(People.RecentActivity.UI.Core.Control.prototype, People.Social.Events);

    Debug.Events.define(People.RecentActivity.UI.Core.Control.prototype, "propertychanged");

    People.RecentActivity.UI.Core.Control.fromElement = function (element) {
        /// <summary>
        ///     Creates a new <see cref="T:People.RecentActivity.UI.Core.Control" /> from an element, or returning an existing
        ///     <see cref="T:People.RecentActivity.UI.Core.Control" /> if the element is already represented by a control.
        /// </summary>
        /// <param name="element" type="HTMLElement">The element.</param>
        /// <returns type="People.RecentActivity.UI.Core.Control"></returns>
        Debug.assert(element != null, 'element != null');

        var control = element[controlAttribute];
        if (control != null) {
            return control;
        }

        return new People.RecentActivity.UI.Core.Control(element);
    };


    People.RecentActivity.UI.Core.Control.prototype._element = null;
    People.RecentActivity.UI.Core.Control.prototype._listener = null;
    People.RecentActivity.UI.Core.Control.prototype._rendered = false;
    People.RecentActivity.UI.Core.Control.prototype._disposed = false;

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "element", {
        get: function () {
            /// <summary>
            ///     Gets or sets the element.
            /// </summary>
            /// <value type="HTMLElement"></value>
            return this._element;
        },
        set: function (value) {
            Debug.assert(this._element == null, 'this.element == null');

            this._element = value;

            // make sure we always refer to this control when looking it up again.
            this._element[controlAttribute] = this;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "isActive", {
        get: function () {
            /// <summary>
            ///     Gets a value indicating whether this control is active.
            /// </summary>
            /// <value type="Boolean"></value>
            return document.activeElement === this._element;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "isInteractive", {
        get: function () {
            /// <summary>
            ///     Gets or sets a value indicating whether the element can be interacted with,
            ///     or visually looks like it can be interacted with.
            /// </summary>
            /// <value type="Boolean"></value>
            return !People.RecentActivity.UI.Core.AriaHelper.getIsDisabled(this._element);
        },
        set: function (value) {
            People.RecentActivity.UI.Core.AriaHelper.setIsDisabled(this._element, !value);
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "isDisabled", {
        get: function () {
            /// <summary>
            ///     Gets or sets a value indicating whether the element has been disabled.
            /// </summary>
            /// <value type="Boolean"></value>
            return this._element.disabled;
        },
        set: function (value) {
            this._element.disabled = value;
            this.isInteractive = !value;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "isDisposed", {
        get: function () {
            /// <summary>
            ///     Gets a value indicating whether the control has been disposed.
            /// </summary>
            /// <value type="Boolean"></value>
            return this._disposed;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "isVisible", {
        get: function () {
            /// <summary>
            ///     Gets or sets a value indicating whether the element is hidden (and no longer taking up space in the UI).
            /// </summary>
            /// <value type="Boolean"></value>
            return this._element.style.display !== 'none';
        },
        set: function (value) {
            this._element.style.display = (value) ? '' : 'none';
            this.isHiddenFromScreenReader = !value;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "isHidden", {
        get: function () {
            /// <summary>
            ///     Gets or sets a value indicating whether the element is hidden (but still taking up space in the UI).
            /// </summary>
            /// <value type="Boolean"></value>
            return this._element.style.visibility === 'hidden';
        },
        set: function (value) {
            this._element.style.visibility = (value) ? 'hidden' : '';
            this.isHiddenFromScreenReader = value;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "isHiddenFromScreenReader", {
        get: function () {
            /// <summary>
            ///     Gets or sets a value indicating whether this can be seen by screen readers.
            /// </summary>
            /// <value type="Boolean"></value>
            return People.RecentActivity.UI.Core.AriaHelper.getHidden(this._element);
        },
        set: function (value) {
            People.RecentActivity.UI.Core.AriaHelper.setHidden(this._element, value);
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "isRendered", {
        get: function () {
            /// <summary>
            ///     Gets a value indicating whether the control has been rendered.
            /// </summary>
            /// <value type="Boolean"></value>
            return this._rendered;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "label", {
        get: function () {
            /// <summary>
            ///     Gets or sets the ARIA "label".
            /// </summary>
            /// <value type="String"></value>
            return People.RecentActivity.UI.Core.AriaHelper.getLabel(this._element);
        },
        set: function (value) {
            People.RecentActivity.UI.Core.AriaHelper.setLabel(this._element, value);
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "labelledBy", {
        get: function () {
            /// <summary>
            ///     Gets or sets the ARIA labelled-by text.
            /// </summary>
            /// <value type="String"></value>
            return People.RecentActivity.UI.Core.AriaHelper.getLabelledBy(this._element);
        },
        set: function (value) {
            People.RecentActivity.UI.Core.AriaHelper.setLabelledBy(this._element, value);
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "role", {
        get: function () {
            /// <summary>
            ///     Gets or sets the role of the element.
            /// </summary>
            /// <value type="String"></value>
            return People.RecentActivity.UI.Core.AriaHelper.getRole(this._element);
        },
        set: function (value) {
            People.RecentActivity.UI.Core.AriaHelper.setRole(this._element, value);
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "text", {
        get: function () {
            /// <summary>
            ///     Gets or sets the inner text of the element.
            /// </summary>
            /// <value type="String"></value>
            return this._element.innerText;
        },
        set: function (value) {
            if (value) {
                var direction = /*@static_cast(Jx.Bidi.Values)*/Jx.Bidi.getTextDirection(value);
                if (direction === Jx.Bidi.Values.rtl) {
                    this._element.style.direction = "rtl";
                } else if (direction === Jx.Bidi.Values.ltr) {
                    this._element.style.direction = "ltr";
                }
            }
            this._element.innerText = value;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "title", {
        get: function () {
            /// <summary>
            ///     Gets or sets the title.
            /// </summary>
            /// <value type="String"></value>
            return this._element.title;
        },
        set: function (value) {
            this._element.title = value;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "id", {
        get: function () {
            /// <summary>
            ///     Gets or sets the ID.
            /// </summary>
            /// <value type="String"></value>
            return this._element.id;
        },
        set: function (value) {
            this._element.id = value;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "className", {
        get: function () {
            /// <summary>
            ///     Gets or sets the class name.
            /// </summary>
            /// <value type="String"></value>
            return this._element.className;
        },
        set: function (value) {
            this._element.className = value;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "tabIndex", {
        get: function () {
            /// <summary>
            ///     Gets or sets the tab index.
            /// </summary>
            /// <value type="Number" integer="true"></value>
            return this._element.tabIndex;
        },
        set: function (value) {
            this._element.tabIndex = value;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Core.Control.prototype, "uniqueId", {
        get: function () {
            /// <summary>
            ///     Gets the unique ID for the element.
            /// </summary>
            /// <value type="String"></value>
            return (this._element).uniqueID;
        }
    });

    People.RecentActivity.UI.Core.Control.prototype.focus = function () {
        /// <summary>
        ///     Focusses on the element.
        /// </summary>
        this._element.focus();
    };

    People.RecentActivity.UI.Core.Control.prototype.setAttribute = function (name, value) {
        /// <summary>
        ///     Sets an attribute.
        /// </summary>
        /// <param name="name" type="String">The name of the attribute.</param>
        /// <param name="value" type="Object">The value.</param>
        this._element.setAttribute(name, value);
    };

    People.RecentActivity.UI.Core.Control.prototype.setActive = function () {
        /// <summary>
        ///     Focusses on the element without actually setting focus.
        /// </summary>
        try {
            this._element.setActive();
        }
        catch (e) {
        }
    };

    People.RecentActivity.UI.Core.Control.prototype.removeFromParent = function () {
        /// <summary>
        ///     Removes the control from the parent element.
        /// </summary>
        var parent = this._element.parentNode;
        if (parent != null) {
            parent.removeChild(this._element);
        }
    };

    People.RecentActivity.UI.Core.Control.prototype.appendControl = function (control) {
        /// <summary>
        ///     Appends a control element.
        /// </summary>
        /// <param name="control" type="People.RecentActivity.UI.Core.Control">The control.</param>
        Debug.assert(control != null, 'control != null');

        this._element.appendChild(control._element);
    };

    People.RecentActivity.UI.Core.Control.prototype.appendChild = function (element) {
        /// <summary>
        ///     Appends a child element.
        /// </summary>
        /// <param name="element" type="HTMLElement">The element.</param>
        Debug.assert(element != null, 'element != null');

        this._element.appendChild(element);
    };

    People.RecentActivity.UI.Core.Control.prototype.removeChild = function (element) {
        /// <summary>
        ///     Removes a child element.
        /// </summary>
        /// <param name="element" type="HTMLElement">The element.</param>
        Debug.assert(element != null, 'element != null');

        this._element.removeChild(element);
    };

    People.RecentActivity.UI.Core.Control.prototype.removeControl = function (control) {
        /// <summary>
        ///     Removes a control.
        /// </summary>
        /// <param name="control" type="People.RecentActivity.UI.Core.Control">The control.</param>
        Debug.assert(control != null, 'control != null');

        this._element.removeChild(control._element);
    };

    People.RecentActivity.UI.Core.Control.prototype.insertChild = function (element, index) {
        /// <summary>
        ///     Inserts a child element.
        /// </summary>
        /// <param name="element" type="HTMLElement">The element to insert.</param>
        /// <param name="index" type="Number" integer="true">The index to insert the element at.</param>
        Debug.assert(element != null, 'element != null');

        if (index < 0) {
            index = 0;
        }

        var children = this._element.children;

        if (index < children.length) {
            this._element.insertBefore(element, children[index]);
        }
        else {
            // just append it to the end.
            this._element.appendChild(element);
        }
    };

    People.RecentActivity.UI.Core.Control.prototype.insertChildBefore = function (element, sibling) {
        /// <summary>
        ///     Inserts a child element.
        /// </summary>
        /// <param name="element" type="HTMLElement">The element.</param>
        /// <param name="sibling" type="HTMLElement">The sibling.</param>
        Debug.assert(element != null, 'element != null');
        Debug.assert(sibling != null, 'sibling != null');

        this._element.insertBefore(element, sibling);
    };

    People.RecentActivity.UI.Core.Control.prototype.insertControl = function (control, index) {
        /// <summary>
        ///     Inserts a control.
        /// </summary>
        /// <param name="control" type="People.RecentActivity.UI.Core.Control">The control to insert.</param>
        /// <param name="index" type="Number" integer="true">The index to insert the control at.</param>
        Debug.assert(control != null, 'control != null');

        this.insertChild(control._element, index);
    };

    People.RecentActivity.UI.Core.Control.prototype.insertControlBefore = function (control, insertBefore) {
        /// <summary>
        ///     Inserts a control in front of another control.
        /// </summary>
        /// <param name="control" type="People.RecentActivity.UI.Core.Control">The control.</param>
        /// <param name="insertBefore" type="People.RecentActivity.UI.Core.Control">The control to insert before.</param>
        Debug.assert(control != null, 'control');
        Debug.assert(insertBefore != null, 'insertBefore');

        var element = insertBefore._element;
        element.parentNode.insertBefore(control._element, element);
    };

    People.RecentActivity.UI.Core.Control.prototype.insertControlBeforeChild = function (control, insertBefore) {
        /// <summary>
        ///     Inserts a control in front of another child.
        /// </summary>
        /// <param name="control" type="People.RecentActivity.UI.Core.Control">The control.</param>
        /// <param name="insertBefore" type="HTMLElement">The control to insert before.</param>
        Debug.assert(control != null, 'control');
        Debug.assert(insertBefore != null, 'insertBefore');

        this._element.insertBefore(control._element, insertBefore);
    };

    People.RecentActivity.UI.Core.Control.prototype.insertControlAfter = function (control, insertAfter) {
        /// <summary>
        ///     Inserts a control after of another control.
        /// </summary>
        /// <param name="control" type="People.RecentActivity.UI.Core.Control">The control.</param>
        /// <param name="insertAfter" type="People.RecentActivity.UI.Core.Control">The control to insert after.</param>
        Debug.assert(control != null, 'control');
        Debug.assert(insertAfter != null, 'insertAfter');

        var element = insertAfter._element;
        var sibling = element.nextSibling;

        if (sibling != null) {
            // insert after the control (thus before the next sibling).
            element.parentNode.insertBefore(control._element, sibling);
        }
        else {
            // just append to the end of the element.
            element.parentNode.appendChild(control._element);
        }
    };

    People.RecentActivity.UI.Core.Control.prototype.attach = function (ev, handler) {
        /// <summary>
        ///     Attaches an event.
        /// </summary>
        /// <param name="ev" type="String">The event name.</param>
        /// <param name="handler" type="Function">The event handler.</param>
        Debug.assert(Jx.isNonEmptyString(ev), '!string.IsNullOrEmpty(ev)');
        Debug.assert(handler != null, 'handler != null');

        if (this._listener == null) {
            this._listener = new People.RecentActivity.UI.Core.EventListener(this._element);
        }

        this._listener.attach(ev, handler);
    };

    People.RecentActivity.UI.Core.Control.prototype.detach = function (ev) {
        /// <summary>
        ///     Detaches an event handler.
        /// </summary>
        /// <param name="ev" type="String">The name of the event.</param>
        Debug.assert(Jx.isNonEmptyString(ev), '!string.IsNullOrEmpty(ev)');

        if (this._listener != null) {
            this._listener.detach(ev);
        }
    };

    People.RecentActivity.UI.Core.Control.prototype.addClass = function (name) {
        /// <summary>
        ///     Adds a CSS class.
        /// </summary>
        /// <param name="name" type="String">The name of the class.</param>
        Debug.assert(Jx.isNonEmptyString(name), '!string.IsNullOrEmpty(name)');

        Jx.addClass(this._element, name);
    };

    People.RecentActivity.UI.Core.Control.prototype.hasClass = function (name) {
        /// <summary>
        ///     Checks whether the element has a given CSS class.
        /// </summary>
        /// <param name="name" type="String">The name.</param>
        /// <returns type="Boolean"></returns>
        Debug.assert(Jx.isNonEmptyString(name), '!string.IsNullOrEmpty(name)');

        return Jx.hasClass(this._element, name);
    };

    People.RecentActivity.UI.Core.Control.prototype.removeClass = function (name) {
        /// <summary>
        ///     Removes a CSS class.
        /// </summary>
        /// <param name="name" type="String">The name of the class.</param>
        Debug.assert(Jx.isNonEmptyString(name), '!string.IsNullOrEmpty(name)');

        Jx.removeClass(this._element, name);
    };

    People.RecentActivity.UI.Core.Control.prototype.dispose = function () {
        /// <summary>
        ///     Disposes the instance.
        /// </summary>
        if (!this._disposed) {
            this._disposed = true;

            this.onDisposed();

            if (this._listener != null) {
                this._listener.dispose();
                this._listener = null;
            }

            if (this._element != null) {
                // clean up the reference back to the control instance.
                this._element[controlAttribute] = null;
                this._element.innerHTML = '';

                // as per the DOM Level 1 specification, "The HTML DOM returns the tagName of an HTML element in 
                // the canonical uppercase form, regardless of the case in the source HTML document"
                if (this._element.tagName === 'IMG') {
                    (this._element).src = '';
                }

                this._element = null;
            }
        }
    };

    People.RecentActivity.UI.Core.Control.prototype.render = function () {
        /// <summary>
        ///     Renders the control. Most controls will call this themselves from the constructor.
        /// </summary>
        if (!this._rendered) {
            this._rendered = true;

            // Most controls that derive from this won't return anything in onRendered, so this is only
            // here for controls that perform some async tasks in their implementation of onRendered.
            // Returning that promise here allows the caller of this function to await the completion of 
            // those async tasks before proceeding when necessary. 
            return this.onRendered();
        }
    };

    People.RecentActivity.UI.Core.Control.prototype.onPropertyChanged = function (propertyName) {
        /// <summary>
        ///     Invokes the <see cref="E:People.RecentActivity.UI.Core.Control.PropertyChanged" /> event.
        /// </summary>
        /// <param name="propertyName" type="String">The name of the property.</param>
        Debug.assert(Jx.isNonEmptyString(propertyName), '!string.IsNullOrEmpty(propertyName)');

        this.raiseEvent("propertychanged", new People.RecentActivity.NotifyPropertyChangedEventArgs(this, propertyName));
    };

    People.RecentActivity.UI.Core.Control.prototype.onDisposed = function () {
        /// <summary>
        ///     Occurs when the control is being disposed.
        /// </summary>
    };

    People.RecentActivity.UI.Core.Control.prototype.onRendered = function () {
        /// <summary>
        ///     Occurs when the control needs to be rendered.
        /// </summary>
    };

    People.RecentActivity.UI.Core.Control.prototype._isClickEatingDivVisible = function () {
        /// <returns type="Boolean"></returns>
        return _isElementVisible('.win-appbarclickeater') || _isElementVisible('.win-flyoutmenuclickeater');
    };

    function _isElementVisible(selector) {
        /// <param name="selector" type="String"></param>
        /// <returns type="Boolean"></returns>
        var element = document.querySelector(selector);
        return !Jx.isNullOrUndefined(element) && element.currentStyle.display !== 'none';
    };
})();

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Imports\IdentityControl\IdentityElementContextOptions.js" />
/// <reference path="..\..\..\Model\AnnotationType.js" />
/// <reference path="..\..\..\Model\Contact.js" />
/// <reference path="..\..\..\Model\FeedEntry.js" />
/// <reference path="..\..\..\Model\FeedEntryType.js" />
/// <reference path="..\Helpers\HtmlHelper.js" />
/// <reference path="..\Helpers\LocalizationHelper.js" />
/// <reference path="..\Helpers\SelfPageNavigationHelper.js" />
/// <reference path="AnnotationsControlPlacement.js" />
/// <reference path="ContactControl.js" />
/// <reference path="Control.js" />

People.RecentActivity.UI.Core.AnnotationsControl = function(entry, element, placement) {
    /// <summary>
    ///     Provides a control for rendering annotations.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.FeedEntry">The entry.</param>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="placement" type="People.RecentActivity.UI.Core.AnnotationsControlPlacement">The placement.</param>
    /// <field name="_entry$1" type="People.RecentActivity.FeedEntry">The feed entry.</field>
    /// <field name="_controls$1" type="Array">The controls.</field>
    /// <field name="_placement$1" type="People.RecentActivity.UI.Core.AnnotationsControlPlacement">The placement.</field>
    /// <field name="_elements$1" type="Array">The list of elements.</field>
    /// <field name="_hiddenEntities" type="Boolean">Whether the entities should be hidden from the screen reader.</field>
    /// <field name="_isWallPost$1" type="Boolean">Whether this is a wall post.</field>
    People.RecentActivity.UI.Core.Control.call(this, element);

    Debug.assert(entry != null, 'entry != null');

    this._controls$1 = [];
    this._elements$1 = [];
    this._entry$1 = entry;
    this._placement$1 = placement;
};

Jx.inherit(People.RecentActivity.UI.Core.AnnotationsControl, People.RecentActivity.UI.Core.Control);

People.RecentActivity.UI.Core.AnnotationsControl.prototype._entry$1 = null;
People.RecentActivity.UI.Core.AnnotationsControl.prototype._controls$1 = null;
People.RecentActivity.UI.Core.AnnotationsControl.prototype._placement$1 = 0;
People.RecentActivity.UI.Core.AnnotationsControl.prototype._elements$1 = null;
People.RecentActivity.UI.Core.AnnotationsControl.prototype._hiddenEntities = false;
People.RecentActivity.UI.Core.AnnotationsControl.prototype._isWallPost$1 = false;

Object.defineProperty(People.RecentActivity.UI.Core.AnnotationsControl.prototype, "hiddenEntities", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the entities should be hidden from the screen reader.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._hiddenEntities;
    },
    set: function(value) {
        this._hiddenEntities = value;
    }
});

People.RecentActivity.UI.Core.AnnotationsControl.prototype.getAriaLabels = function() {
    /// <summary>
    ///     Gets the ARIA label that can be used on a parent to describe the annotations.
    /// </summary>
    /// <returns type="Array" elementType="String"></returns>
    var labels = new Array(this._elements$1.length);
    for (var i = 0, len = labels.length; i < len; i++) {
        // just populate each label with the text of the label.
        labels[i] = this._elements$1[i].innerText;
    }

    return labels;
};

People.RecentActivity.UI.Core.AnnotationsControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    for (var i = 0, len = this._controls$1.length; i < len; i++) {
        this._controls$1[i].dispose();
    }

    this._controls$1.length = 0;
    this._elements$1.length = 0;

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Core.AnnotationsControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    this.isVisible = false;

    // clear out the HTML, as we may have gotten a pre-initialized element.
    // TODO (siebet): Figure out if we can reuse the existing markup -- my initial gut check is "no", 
    // considering the number of ICs, entities and buttons we have.
    this.element.innerHTML = '';

    this._renderCommonAnnotations$1();

    if (!this._isWallPost$1) {
        if (this._entry$1.isShared) {
            // render the "shared an entry" annotation.
            this._renderShared$1();
        }

        switch (this._entry$1.entryType) {
            case People.RecentActivity.FeedEntryType.photo:
            case People.RecentActivity.FeedEntryType.photoAlbum:
                // render the "tagged" annotation.
                this._renderTagged$1();
                break;
        }    
    }

    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
};

People.RecentActivity.UI.Core.AnnotationsControl.prototype._renderCommonAnnotations$1 = function() {
    // render all the annotations that we have.
    var annotations = this._entry$1.annotations;
    for (var i = 0, len = annotations.length; i < len; i++) {
        var annotation = annotations[i];

        // right now all annotations have one thing in common: they all take a formatter string
        // and add a contact control/IC to it... so just do the simple thing here.
        switch (annotation.type) {
            case People.RecentActivity.AnnotationType.inReplyTo:
                // append a simple button annotation.
                this._appendButtonAnnotation$1(
                    annotation.type,
                    '/strings/raAnnotation-inReplyTo',
                    '<div class="ra-fauxButton ra-fauxInheritButton" tabindex="-1" role="button"></div>',
                    Jx.res.getString('/strings/raAnnotation-inReplyTo-button'),
                    annotation.data);
                break;

            case People.RecentActivity.AnnotationType.retweetedBy:
                // append the retweeted by annotation.
                this._appendRegularAnnotation$1('/strings/raAnnotation-retweetedBy', (annotation.data).publisher);
                break;

            case People.RecentActivity.AnnotationType.wallPost:
                // if we're rendering the What's New feed of a specific person we don't show 
                // this specific annotation (because you're already looking at their "wall").
                if ((!!this._placement$1) || this._entry$1.network.identity.isWhatsNew) {
                    this._isWallPost$1 = true;
                    this._appendRegularAnnotation$1('/strings/raAnnotation-wallPost', annotation.data);
                }

                break;
        }    
    }
};

People.RecentActivity.UI.Core.AnnotationsControl.prototype._renderShared$1 = function() {
    switch (this._entry$1.entryType) {
        case People.RecentActivity.FeedEntryType.photo:
            // gather all the required pieces.
            var data = this._entry$1.data;
            this._appendShareTagAnnotation$1(
                '/strings/ra-itemPhotoSharedCaption',
                '<div class="ra-fauxButton ra-itemPhotoCaptionLink" tabindex="-1" role="button"></div>',
                Jx.res.getString('/strings/ra-itemPhotoSpecialCaptionLink'),
                data.photo.owner);
            break;

        case People.RecentActivity.FeedEntryType.photoAlbum:
            // gather all the required pieces.
            var data = this._entry$1.data;
            var album = data.album;
            this._appendShareTagAnnotation$1(
                '/strings/ra-itemPhotoAlbumSharedCaption',
                '<div class="ra-fauxButton ra-itemPhotoAlbumName" tabindex="-1" role="button"></div>',
                album.name,
                album.owner);
            break;
    }
};

People.RecentActivity.UI.Core.AnnotationsControl.prototype._renderTagged$1 = function() {
    switch (this._entry$1.entryType) {
        case People.RecentActivity.FeedEntryType.photo:
            var data = this._entry$1.data;
            if (!data.isTagged) {
                // we weren't even tagged in this photo, boo!
                return;
            }

            // gather all the required pieces of information.
            this._appendShareTagAnnotation$1('/strings/ra-itemPhotoTaggedCaption', '<div class="ra-fauxButton ra-itemPhotoCaptionLink" tabindex="-1" role="button"></div>', Jx.res.getString('/strings/ra-itemPhotoSpecialCaptionLink'), data.photo.owner);
            break;

        case People.RecentActivity.FeedEntryType.photoAlbum:
            var data = this._entry$1.data;
            if (!data.isTagged) {
                // we weren't even tagged in this album!
                return;
            }

            var album = data.album;
            this._appendShareTagAnnotation$1(
                '/strings/ra-itemPhotoAlbumTaggedCaption',
                '<div class="ra-fauxButton ra-itemPhotoAlbumName" tabindex="-1" role="button"></div>',
                album.name,
                album.owner);
            break;
    }
};

People.RecentActivity.UI.Core.AnnotationsControl.prototype._appendShareTagAnnotation$1 = function(formatter, buttonMarkup, buttonText, contact) {
    /// <param name="formatter" type="String"></param>
    /// <param name="buttonMarkup" type="String"></param>
    /// <param name="buttonText" type="String"></param>
    /// <param name="contact" type="People.RecentActivity.Contact"></param>
    // append the button annotation, with a type of "none" to indicate this is some other non-specified annotation.
    this._appendButtonAnnotation$1(People.RecentActivity.AnnotationType.none, formatter, buttonMarkup, buttonText, contact);
};

People.RecentActivity.UI.Core.AnnotationsControl.prototype._appendButtonAnnotation$1 = function(type, formatter, buttonMarkup, buttonText, contact) {
    /// <param name="type" type="People.RecentActivity.AnnotationType"></param>
    /// <param name="formatter" type="String"></param>
    /// <param name="buttonMarkup" type="String"></param>
    /// <param name="buttonText" type="String"></param>
    /// <param name="contact" type="People.RecentActivity.Contact"></param>    
    Debug.assert(Jx.isNonEmptyString(formatter), 'formatter');
    Debug.assert(buttonMarkup != null, 'buttonMarkup');

    // initialize a new contact control for this annotation.
    var identity = new People.RecentActivity.UI.Core.ContactControl(contact.getDataContext(), false);
    var identityElement = identity.getElement(1, People.RecentActivity.Imports.create_identityElementContextOptions(this._entry$1.sourceId));
    var buttonElement = null;

    if (Jx.isNonEmptyString(buttonText)) {
        // append the annotation, stash controls, activate name.
        buttonElement = People.RecentActivity.UI.Core.HtmlHelper.createElement(buttonMarkup);

        var button = new People.RecentActivity.UI.Core.Control(buttonElement);
        button.text = buttonText;
        this._controls$1.push(button);

        var that = this;
        button.attach('click', function (ev) {
            switch (type) {
                case People.RecentActivity.AnnotationType.inReplyTo:
                    // navigate to the parent post.
                    People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigateToObject(that._entry$1, null, false, true);
                    break;

                default:
                    // just navigate to the entry.
                    People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigateToObject(that._entry$1);
                    break;
            }

            ev.cancelBubble = true;
        });

        People.Animation.addTapAnimation(button.element);
    }
    else {
        // generate an empty node for the button.
        buttonElement = document.createTextNode('');
    }

    this._appendAnnotation$1(formatter, [ identityElement, buttonElement ]);

    this._controls$1.push(identity);
    identity.activate(identityElement);
};

People.RecentActivity.UI.Core.AnnotationsControl.prototype._appendRegularAnnotation$1 = function(formatter, contact) {
    /// <param name="formatter" type="String"></param>
    /// <param name="contact" type="People.RecentActivity.Contact"></param>
    Debug.assert(formatter != null, 'formatter');
    Debug.assert(contact != null, 'contact');

    // format the string with the contact control.
    var control = new People.RecentActivity.UI.Core.ContactControl(contact.getDataContext());
    var element = control.getElement(1, People.RecentActivity.Imports.create_identityElementContextOptions(this._entry$1.sourceId));

    // activate the control and then stash it.
    control.activate(element);
    this._controls$1.push(control);

    this._appendAnnotation$1(formatter, [element]);
};

People.RecentActivity.UI.Core.AnnotationsControl.prototype._appendAnnotation$1 = function(formatter, elements) {
    /// <param name="formatter" type="String"></param>
    /// <param name="elements" type="Array" elementType="Object" elementDomElement="true"></param>
    Debug.assert(Jx.isNonEmptyString(formatter), 'formatter');
    Debug.assert(elements != null, 'elements');

    for (var i = 0, len = elements.length; i < len; i++) {
        if (this._hiddenEntities && elements[i].setAttribute) {
            // Hide the entities from the screen reader.
            elements[i].setAttribute('aria-hidden', true);
        }

        // Always set the tab index to ensure the entities can take focus.
        elements[i].tabIndex = -1;
    }

    // format the string with the elements that were provided.
    var element = People.RecentActivity.UI.Core.LocalizationHelper.loadCompoundElement(formatter, elements, 'div');
    this._elements$1.push(element);

    this.appendChild(element);
    this.isVisible = true;
    this.isHiddenFromScreenReader = this._hiddenEntities;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Imports\IdentityControl\IdentityControlOptions.js" />
/// <reference path="ContactControlHandleWithNameFallbackElement.js" />
/// <reference path="ContactControlNameElement.js" />
/// <reference path="ContactControlType.js" />

People.RecentActivity.UI.Core.ContactControl = function(context, isInteractive, labelFormatter) {
    /// <summary>
    ///     Provides a wrapper around the identity control.
    /// </summary>
    /// <param name="context" type="Object">The context.</param>
    /// <param name="isInteractive" type="Boolean">Whether the instance is interactive.</param>
    /// <param name="labelFormatter" type="String">The label formatter.</param>
    /// <field name="_control" type="People.IdentityControl">The underlying control.</field>
    /// <field name="_elements" type="Array">The elements.</field>
    /// <field name="_isInteractive" type="Boolean">Whether the control is interactive.</field>
    /// <field name="_labelFormatter" type="String">The label formatter.</field>
    if (Jx.isNullOrUndefined(isInteractive)) {
        isInteractive = true;
    }

    this._labelFormatter = labelFormatter;
    // initialize a new instance of the control node.
    this._control = new People.IdentityControl(context, null, People.RecentActivity.Imports.create_identityControlOptions(isInteractive, this._onClicked.bind(this), null, this._onGetLabel.bind(this)));
    this._elements = [];
    this._isInteractive = isInteractive;
};


People.RecentActivity.UI.Core.ContactControl.prototype._control = null;
People.RecentActivity.UI.Core.ContactControl.prototype._elements = null;
People.RecentActivity.UI.Core.ContactControl.prototype._isInteractive = false;
People.RecentActivity.UI.Core.ContactControl.prototype._labelFormatter = null;

People.RecentActivity.UI.Core.ContactControl.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    this._control.shutdownUI();
    this._elements.length = 0;
};

People.RecentActivity.UI.Core.ContactControl.prototype.activate = function(element, hidden) {
    /// <summary>
    ///     Activates the element containing the identity control.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="hidden" type="Boolean" optional="true">Whether the control should be hidden from the screen reader.</param>
    Debug.assert(element != null, 'element');
    Debug.assert(Jx.isUndefined(hidden) || Jx.isBoolean(hidden), 'Jx.isUndefined(hidden) || Jx.isBoolean(hidden)');

    this._control.activateUI(element);

    for (var i = 0, len = this._elements.length; i < len; i++) {
        var elem = this._elements[i];

        if (this._isInteractive) {
            var tabIndex = elem['-ra-tabindex'];

            if (Jx.isBoolean(hidden)) {
                People.RecentActivity.UI.Core.AriaHelper.setHidden(elem, hidden);
            }
            else {
                People.RecentActivity.UI.Core.AriaHelper.setHidden(elem, tabIndex === -1);
            }

            elem.setAttribute('role', 'link');
            elem.tabIndex = tabIndex;

            delete elem['-ra-tabindex'];
        }
        else {
            // this element is not interactive, so add a simple class.
            elem.setAttribute('aria-hidden', true);
            Jx.addClass(elem, 'ra-contactNotInteractive');
        }    
    }
};

People.RecentActivity.UI.Core.ContactControl.prototype.getElement = function(type, options, tabIndex) {
    /// <summary>
    ///     Gets a new element from the current contact control.
    /// </summary>
    /// <param name="type" type="People.RecentActivity.UI.Core.ContactControlType">The type.</param>
    /// <param name="options" type="Object">The options.</param>
    /// <param name="tabIndex" type="Number" integer="true">The tab index.</param>
    /// <returns type="HTMLElement"></returns>
    if (Jx.isNullOrUndefined(tabIndex)) {
        tabIndex = 0;
    }

    var callback = this._getCreationCallback(type, options);
    var temp = document.createElement('div');
    temp.innerHTML = this._control.getUI(callback, options);
    var element = temp.firstChild;
    if (this._isInteractive) {
        element['-ra-tabindex'] = tabIndex;
    }

    this._elements.push(element);
    return element;
};

People.RecentActivity.UI.Core.ContactControl.prototype._getCreationCallback = function(type, options) {
    /// <param name="type" type="People.RecentActivity.UI.Core.ContactControlType"></param>
    /// <param name="options" type="Object"></param>
    /// <returns type="Type"></returns>
    switch (type) {
        case 1:
            return People.RecentActivity.UI.Core.ContactControlNameElement;
        case 2:
            return People.RecentActivity.UI.Core.ContactControlHandleWithNameFallbackElement;
        case 0:
            return People.IdentityElements.Tile;
    }

    return null;
};

People.RecentActivity.UI.Core.ContactControl.prototype._onGetLabel = function(dataSource, label) {
    /// <param name="dataSource" type="People.IdentityControlDataSource"></param>
    /// <param name="label" type="String"></param>
    /// <returns type="String"></returns>
    Debug.assert(dataSource != null, 'dataSource != null');
    if (Jx.isNonEmptyString(this._labelFormatter)) {
        // get the formatted label.
        var name = dataSource.calculatedUIName || dataSource.name;
        return Jx.res.loadCompoundString(this._labelFormatter, name);
    }

    return label;
};

People.RecentActivity.UI.Core.ContactControl.prototype._onClicked = function(dataContext, element) {
    /// <param name="dataContext" type="Object"></param>
    /// <param name="element" type="HTMLElement"></param>
    /// <returns type="Boolean"></returns>
    if (this._isInteractive) {
        // get the object type and object ID.
        var objectType = dataContext.objectType;
        var objectId = dataContext.objectId;
        switch (objectType) {
            case 'literal':
                People.Nav.navigate(People.Nav.getViewPersonUri(null, dataContext));
                break;
            default:
                People.Nav.navigate(People.Nav.getViewPersonUri(objectId, null));
                break;
        }

        window.event.cancelBubble = true;
        return false;
    }

    return true;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="ContactControlNameElement.js" />

People.RecentActivity.UI.Core.ContactControlHandleWithNameFallbackElement = function() {
    /// <summary>
    ///     Provides a contact control element for rendering names.
    /// </summary>
    /// <field name="_handle" type="HTMLElement">The handle.</field>
    /// <field name="_options" type="People.RecentActivity.Imports.identityElementContextOptions">The options.</field>
};


People.RecentActivity.UI.Core.ContactControlHandleWithNameFallbackElement.prototype._handle = null;
People.RecentActivity.UI.Core.ContactControlHandleWithNameFallbackElement.prototype._options = null;

People.RecentActivity.UI.Core.ContactControlHandleWithNameFallbackElement.prototype.getUI = function(host, locator, options) {
    /// <summary>
    ///     Gets the UI.
    /// </summary>
    /// <param name="host" type="People.IdentityControlHost">The host.</param>
    /// <param name="locator" type="String">The locator.</param>
    /// <param name="options" type="Object">The options.</param>
    /// <returns type="String"></returns>
    Debug.assert(host != null, 'host != null');
    Debug.assert(Jx.isNonEmptyString(locator), '!string.IsNullOrEmpty(locator)');
    this._options = options;
    // format the outer element.
    return People.IdentityElements.makeElement('span', locator, 'ra-contact', null, '');
};

People.RecentActivity.UI.Core.ContactControlHandleWithNameFallbackElement.prototype.activateUI = function(host, node) {
    /// <summary>
    ///     Activates the UI.
    /// </summary>
    /// <param name="host" type="People.IdentityControlHost">The host.</param>
    /// <param name="node" type="HTMLElement">The node.</param>
    Debug.assert(host != null, 'host != null');
    Debug.assert(node != null, 'node != null');
    this._handle = node;
    // only bind to the nickname if we're in the right context.
    host.bind(this._update.bind(this), this, People.Priority.synchronous);
};

People.RecentActivity.UI.Core.ContactControlHandleWithNameFallbackElement.prototype.shutdownUI = function(host) {
    /// <summary>
    ///     Shuts down the UI.
    /// </summary>
    /// <param name="host" type="People.IdentityControlHost">The host.</param>
    Debug.assert(host != null, 'host != null');
    this._handle = null;
};

People.RecentActivity.UI.Core.ContactControlHandleWithNameFallbackElement.prototype.getTooltip = function(host, dataSource) {
    /// <summary>
    ///     Gets the tooltip.
    /// </summary>
    /// <param name="host" type="People.IdentityControlHost">The host.</param>
    /// <param name="dataSource" type="Object">The data source.</param>
    /// <returns type="String"></returns>
    Debug.assert(host != null, 'host != null');
    Debug.assert(dataSource != null, 'dataSource != null');
    if (this._isHandleAvailable()) {
        return this._handle.innerText;
    }

    return '';
};

People.RecentActivity.UI.Core.ContactControlHandleWithNameFallbackElement.prototype._update = function(dataSource) {
    /// <summary>
    ///     Updates the element content
    /// </summary>
    /// <param name="dataSource" type="People.IdentityControlDataSource">The data source.</param>
    Debug.assert(dataSource != null, 'dataSource != null');
    if (this._isHandleAvailable()) {
        // figure out the type of the dataSource and set the handle appropriately.
        this._setHandle(People.RecentActivity.UI.Core.ContactControlNameElement.getNicknameBySourceId(dataSource, this._options.contextId));
    }
    else {
        this._setName(dataSource.calculatedUIName || dataSource.name);
    }
};

People.RecentActivity.UI.Core.ContactControlHandleWithNameFallbackElement.prototype._isHandleAvailable = function() {
    /// <returns type="Boolean"></returns>
    return (this._options != null) && (People.RecentActivity.UI.Core.ContactControlNameElement.handleIds.indexOf(this._options.contextId) !== -1);
};

People.RecentActivity.UI.Core.ContactControlHandleWithNameFallbackElement.prototype._setName = function(value) {
    /// <param name="value" type="String"></param>
    this._handle.innerText = value || '';
};

People.RecentActivity.UI.Core.ContactControlHandleWithNameFallbackElement.prototype._setHandle = function(str) {
    /// <param name="str" type="String"></param>
    if (!Jx.isNonEmptyString(str)) {
        // fallback to the.. fallback element.
        str = this._options.fallback;
    }
    else {
        str = People.Social.format(People.RecentActivity.UI.Core.ContactControlNameElement.handleFormatters[this._options.contextId], str);
    }

    // figure out how we need to format the handle.
    this._handle.innerText = str;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.ContactControlNameElement = function() {
    /// <summary>
    ///     Provides a contact control element for rendering names.
    /// </summary>
    /// <field name="handleIds" type="Array" elementType="String" static="true">The IDs of networks that should show the handle.</field>
    /// <field name="handleFormatters" type="Object" static="true">The handle formatters.</field>
    /// <field name="_name" type="HTMLElement">The name.</field>
    /// <field name="_handle" type="HTMLElement">The handle.</field>
    /// <field name="_options" type="People.RecentActivity.Imports.identityElementContextOptions">The options.</field>
};


People.RecentActivity.UI.Core.ContactControlNameElement.handleIds = [ 'TWITR' ];
People.RecentActivity.UI.Core.ContactControlNameElement.handleFormatters = null;

People.RecentActivity.UI.Core.ContactControlNameElement.findContactBySourceId = function(contacts, sourceId) {
    /// <summary>
    ///     Finds a contact by source ID.
    /// </summary>
    /// <param name="contacts" type="Array" elementType="Contact">The contacts.</param>
    /// <param name="sourceId" type="String">The source ID.</param>
    /// <returns type="Microsoft.WindowsLive.Platform.Contact"></returns>
    if ((contacts == null) || (!contacts.length)) {
        // no contacts available, short-circuit.
        return null;
    }

    for (var i = 0, len = contacts.length; i < len; i++) {
        if (contacts[i].account.sourceId === sourceId) {
            // we found the appropriate contact.
            return contacts[i];
        }    
    }

    return null;
};

People.RecentActivity.UI.Core.ContactControlNameElement.getNicknameBySourceId = function(dataSource, sourceId) {
    /// <summary>
    ///     Gets a nickname by source ID.
    /// </summary>
    /// <param name="dataSource" type="People.IdentityControlDataSource">The data source.</param>
    /// <param name="sourceId" type="String">The source ID.</param>
    /// <returns type="String"></returns>
    Debug.assert(dataSource != null, 'dataSource != null');
    switch (dataSource.objectType) {
        case 'literal':
            // use the aggregated result, a literal contact has no linked contacts.
            return dataSource.nickname;
        case 'MeContact':
            // unfortunately "Me" doesn't have a nickname associated with it.
            return '';
        default:
            // find the appropriate contact (based on the context ID).
            var contact = People.RecentActivity.UI.Core.ContactControlNameElement.findContactBySourceId(dataSource.linkedContacts, sourceId);
            return (contact != null) ? contact.nickname : '';
    }
};


(function() {
    var formatters = {};
    formatters['TWITR'] = '\u202a@\u202c{0}';
    People.RecentActivity.UI.Core.ContactControlNameElement.handleFormatters = formatters;
})();

People.RecentActivity.UI.Core.ContactControlNameElement.prototype._name = null;
People.RecentActivity.UI.Core.ContactControlNameElement.prototype._handle = null;
People.RecentActivity.UI.Core.ContactControlNameElement.prototype._options = null;

People.RecentActivity.UI.Core.ContactControlNameElement.prototype.getUI = function(host, locator, options) {
    /// <summary>
    ///     Gets the UI.
    /// </summary>
    /// <param name="host" type="People.IdentityControlHost">The host.</param>
    /// <param name="locator" type="String">The locator.</param>
    /// <param name="options" type="Object">The options.</param>
    /// <returns type="String"></returns>
    Debug.assert(host != null, 'host != null');
    Debug.assert(Jx.isNonEmptyString(locator), '!string.IsNullOrEmpty(locator)');
    this._options = options;
    // format the outer element.
    return People.IdentityElements.makeElement('span', locator, 'ra-contact', null, '<span class="ic-name"></span>' + '<span class="ra-handle"></span>');
};

People.RecentActivity.UI.Core.ContactControlNameElement.prototype.activateUI = function(host, node) {
    /// <summary>
    ///     Activates the UI.
    /// </summary>
    /// <param name="host" type="People.IdentityControlHost">The host.</param>
    /// <param name="node" type="HTMLElement">The node.</param>
    Debug.assert(host != null, 'host != null');
    Debug.assert(node != null, 'node != null');
    this._handle = node.lastChild;
    this._name = node.firstChild;
    host.bind(this._update.bind(this), this, People.Priority.synchronous);
};

People.RecentActivity.UI.Core.ContactControlNameElement.prototype.shutdownUI = function(host) {
    /// <summary>
    ///     Shuts down the UI.
    /// </summary>
    /// <param name="host" type="People.IdentityControlHost">The host.</param>
    Debug.assert(host != null, 'host != null');
    this._handle = null;
    this._name = null;
};

People.RecentActivity.UI.Core.ContactControlNameElement.prototype.getTooltip = function(host, dataSource) {
    /// <summary>
    ///     Gets the tooltip.
    /// </summary>
    /// <param name="host" type="People.IdentityControlHost">The host.</param>
    /// <param name="dataSource" type="Object">The data source.</param>
    /// <returns type="String"></returns>
    Debug.assert(host != null, 'host != null');
    Debug.assert(dataSource != null, 'dataSource != null');
    if (this._isHandleAvailable()) {
        return this._handle.innerText;
    }

    return '';
};

People.RecentActivity.UI.Core.ContactControlNameElement.prototype._update = function(dataSource) {
    /// <summary>
    ///     Updates the content
    /// </summary>
    /// <param name="dataSource" type="People.IdentityControlDataSource">The data source.</param>
    Debug.assert(dataSource != null, 'dataSource != null');
    this._setName(dataSource.calculatedUIName || dataSource.name);
    if (this._isHandleAvailable()) {
        // figure out the type of the dataSource and set the handle appropriately.
        this._setHandle(People.RecentActivity.UI.Core.ContactControlNameElement.getNicknameBySourceId(dataSource, this._options.contextId));
    }
    else {
        this._setHandle('');
    }
};

People.RecentActivity.UI.Core.ContactControlNameElement.prototype._isHandleAvailable = function() {
    /// <returns type="Boolean"></returns>
    return (this._options != null) && (People.RecentActivity.UI.Core.ContactControlNameElement.handleIds.indexOf(this._options.contextId) !== -1);
};

People.RecentActivity.UI.Core.ContactControlNameElement.prototype._setName = function(value) {
    /// <param name="value" type="String"></param>
    this._name.innerText = value || '';
};

People.RecentActivity.UI.Core.ContactControlNameElement.prototype._setHandle = function(str) {
    /// <param name="str" type="String"></param>
    if (Jx.isNonEmptyString(str)) {
        // figure out how we need to format the handle.
        this._handle.innerText = People.Social.format(People.RecentActivity.UI.Core.ContactControlNameElement.handleFormatters[this._options.contextId], str);
        this._handle.style.display = '';
    }
    else {
        this._handle.style.display = 'none';
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\Helpers\LocalizationHelper.js" />

People.RecentActivity.UI.Core.ErrorMessageDisplay = function() {
    /// <summary>
    ///     Provides a base class for error message locations.
    /// </summary>
    /// <field name="_disposed" type="Boolean">Whether the instance was disposed.</field>
};


People.RecentActivity.UI.Core.ErrorMessageDisplay.prototype._disposed = false;

People.RecentActivity.UI.Core.ErrorMessageDisplay.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    if (!this._disposed) {
        this._disposed = true;
        this.onDisposed();
    }
};

People.RecentActivity.UI.Core.ErrorMessageDisplay.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    this.clear();
};

People.RecentActivity.UI.Core.ErrorMessageDisplay.prototype.formatAsString = function(formatter, elements) {
    /// <summary>
    ///     Formats the string, and returns the inner text.
    /// </summary>
    /// <param name="formatter" type="String">The formatter.</param>
    /// <param name="elements" type="Array" elementType="Object" elementDomElement="true">The elements.</param>
    /// <returns type="String"></returns>
    Debug.assert(Jx.isNonEmptyString(formatter), 'formatter');
    Debug.assert(elements != null, 'elements');
    var formatted = People.RecentActivity.UI.Core.LocalizationHelper.loadCompoundElement(formatter, elements);
    return formatted.innerText;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Imports\MessageBar\MessageBarButton.js" />
/// <reference path="..\..\..\Imports\MessageBar\MessageBarMessage.js" />
/// <reference path="ErrorMessageControl.js" />
/// <reference path="ErrorMessageDisplay.js" />

People.RecentActivity.UI.Core.ErrorMessageBarDisplay = function(control) {
    /// <summary>
    ///     Provides an error display for the message bar.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Core.ErrorMessageControl">The control.</param>
    /// <field name="_subtleTimeout$1" type="Number" integer="true" static="true">The amount of time a subtle error message should stay up.</field>
    /// <field name="_permissionsTimeout$1" type="Number" integer="true" static="true">The amount of time between showing errors (about 1 hour)</field>
    /// <field name="_lastPermissionErrorShown$1" type="Date" static="true">The time we last showed a message.</field>
    /// <field name="_control$1" type="People.RecentActivity.UI.Core.ErrorMessageControl">The parent control.</field>
    /// <field name="_id$1" type="String">The current ID.</field>
    /// <field name="_timer$1" type="Number" integer="true">The timer.</field>
    this._timer$1 = -1;
    People.RecentActivity.UI.Core.ErrorMessageDisplay.call(this);
    Debug.assert(control != null, 'control');
    this._control$1 = control;
};

Jx.inherit(People.RecentActivity.UI.Core.ErrorMessageBarDisplay, People.RecentActivity.UI.Core.ErrorMessageDisplay);


People.RecentActivity.UI.Core.ErrorMessageBarDisplay._subtleTimeout$1 = 10000;
People.RecentActivity.UI.Core.ErrorMessageBarDisplay._permissionsTimeout$1 = 3600000;
People.RecentActivity.UI.Core.ErrorMessageBarDisplay._lastPermissionErrorShown$1 = new Date(1970, 1, 1);
People.RecentActivity.UI.Core.ErrorMessageBarDisplay.prototype._control$1 = null;
People.RecentActivity.UI.Core.ErrorMessageBarDisplay.prototype._id$1 = null;

People.RecentActivity.UI.Core.ErrorMessageBarDisplay.prototype.clear = function() {
    /// <summary>
    ///     Clears the current message.
    /// </summary>
    if (Jx.isNonEmptyString(this._id$1)) {
        var bar = Jx.root.getMessageBar();
        bar.removeMessage(this._id$1);
        bar.hide();
        this._id$1 = null;
    }

    if (this._timer$1 !== -1) {
        // clear the timer.
        clearTimeout(this._timer$1);
        this._timer$1 = -1;
    }
};

People.RecentActivity.UI.Core.ErrorMessageBarDisplay.prototype.setEmptyMessage = function(formatter, elements) {
    /// <summary>
    ///     Sets the empty message.
    /// </summary>
    /// <param name="formatter" type="String">The formatter string.</param>
    /// <param name="elements" type="Array" elementType="Object" elementDomElement="true">The elements.</param>
    this._setMessage$1(true, formatter, elements, null, null);
};

People.RecentActivity.UI.Core.ErrorMessageBarDisplay.prototype.setConnectivityMessage = function(formatter, elements) {
    /// <summary>
    ///     Sets the connectivity error message.
    /// </summary>
    /// <param name="formatter" type="String">The formatter.</param>
    /// <param name="elements" type="Array" elementType="Object" elementDomElement="true">The elements.</param>
    this._setMessage$1(true, formatter, elements, null, null);
};

People.RecentActivity.UI.Core.ErrorMessageBarDisplay.prototype.setGenericMessage = function(formatter, elements) {
    /// <summary>
    ///     Sets the generic error message.
    /// </summary>
    /// <param name="formatter" type="String">The formatter.</param>
    /// <param name="elements" type="Array" elementType="Object" elementDomElement="true">The elements.</param>
    this._setMessage$1(true, formatter, elements, null, null);
};

People.RecentActivity.UI.Core.ErrorMessageBarDisplay.prototype.setPermissionsMessage = function(formatter, elements, buttonText, buttonCallback) {
    /// <summary>
    ///     Sets the permissioning error message.
    /// </summary>
    /// <param name="formatter" type="String">The formatter.</param>
    /// <param name="elements" type="Array" elementType="Object" elementDomElement="true">The elements.</param>
    /// <param name="buttonText" type="String">The button text.</param>
    /// <param name="buttonCallback" type="Function">The button callback.</param>
    var diff = new Date().getTime() - People.RecentActivity.UI.Core.ErrorMessageBarDisplay._lastPermissionErrorShown$1.getTime();
    if ((diff >= 3600000) || (this._control$1.operation === 2)) {
        // show the message and update the timestamp of when we last displayed this error.
        People.RecentActivity.UI.Core.ErrorMessageBarDisplay._lastPermissionErrorShown$1 = new Date();
        this._setMessage$1(false, formatter, elements, buttonText, buttonCallback);
    }
};

People.RecentActivity.UI.Core.ErrorMessageBarDisplay.prototype._setMessage$1 = function(isSubtle, formatter, elements, buttonText, buttonCallback) {
    /// <param name="isSubtle" type="Boolean"></param>
    /// <param name="formatter" type="String"></param>
    /// <param name="elements" type="Array" elementType="Object" elementDomElement="true"></param>
    /// <param name="buttonText" type="String"></param>
    /// <param name="buttonCallback" type="Function"></param>
    var that = this;
    
    // clear the current message, then add the new one.
    this.clear();
    this._id$1 = Math.random().toString();
    // initialize the new message.
    var bar = Jx.root.getMessageBar();
    bar.unhide();
    var message = People.RecentActivity.Imports.create_messageBarMessage(this.formatAsString(formatter, elements), 'ab-messageBar ' + this._control$1.className);
    if (!isSubtle) {
        if (Jx.isNonEmptyString(buttonText)) {
            // add the secondary "solve world hunger" button.
            message.button1 = People.RecentActivity.Imports.create_messageBarButton(buttonText, buttonText, function() {
                // remove the message, invoke the callback.
                bar.removeMessage(that._id$1);
                buttonCallback();
            });
        }

        // always add the "not now" button.
        var dismissText = Jx.res.getString('/strings/raError-button-notNow');
        message.button2 = People.RecentActivity.Imports.create_messageBarButton(dismissText, dismissText, function() {
            // hide the message bar when the user clicks "not now".
            bar.removeMessage(that._id$1);
        });
        bar.addErrorMessage(this._id$1, 0, message);
    }
    else {
        if (Jx.isNonEmptyString(buttonText)) {
            // add a new text button.
            message.textButton = People.RecentActivity.Imports.create_messageBarButton(buttonText, buttonText, function() {
                // remove the message, invoke the callback.
                bar.removeMessage(that._id$1);
                buttonCallback();
            });
        }

        bar.addStatusMessage(this._id$1, 0, message);
        // subtle error messages should only stay around for a little while.
        this._timer$1 = setTimeout(this._onSubtleTimerElapsed$1.bind(this), 10000);
    }
};

People.RecentActivity.UI.Core.ErrorMessageBarDisplay.prototype._onSubtleTimerElapsed$1 = function() {
    this._timer$1 = -1;
    // remove the current message.
    Jx.root.getMessageBar().removeMessage(this._id$1);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\ResultCode.js" />
/// <reference path="..\..\..\Core\ResultInfo.js" />
/// <reference path="..\..\..\Model\Identity.js" />
/// <reference path="..\..\..\Model\Network.js" />
/// <reference path="..\Helpers\HtmlHelper.js" />
/// <reference path="ContactControl.js" />
/// <reference path="Control.js" />
/// <reference path="ErrorMessageBarDisplay.js" />
/// <reference path="ErrorMessageContext.js" />
/// <reference path="ErrorMessageDisplay.js" />
/// <reference path="ErrorMessageInlineDisplay.js" />
/// <reference path="ErrorMessageLocation.js" />
/// <reference path="ErrorMessageOperation.js" />
/// <reference path="ErrorMessageType.js" />

People.RecentActivity.UI.Core.ErrorMessageControl = function(identity, context, operation, element) {
    /// <summary>
    ///     Provides a control for showing error messages.
    /// </summary>
    /// <param name="identity" type="People.RecentActivity.Identity">The identity.</param>
    /// <param name="context" type="People.RecentActivity.UI.Core.ErrorMessageContext">The context.</param>
    /// <param name="operation" type="People.RecentActivity.UI.Core.ErrorMessageOperation">The operation.</param>
    /// <param name="element" type="HTMLElement">The element to use.</param>
    /// <field name="_identity$1" type="People.RecentActivity.Identity">The current identity.</field>
    /// <field name="_operation$1" type="People.RecentActivity.UI.Core.ErrorMessageOperation">The operation.</field>
    /// <field name="_context$1" type="People.RecentActivity.UI.Core.ErrorMessageContext">The context.</field>
    /// <field name="_location$1" type="People.RecentActivity.UI.Core.ErrorMessageLocation">The location.</field>
    /// <field name="_display$1" type="People.RecentActivity.UI.Core.ErrorMessageDisplay">The display.</field>
    /// <field name="_current$1" type="People.RecentActivity.Core.ResultInfo">The current error.</field>
    /// <field name="_currentCode$1" type="People.RecentActivity.Core.ResultCode">The current code.</field>
    /// <field name="_currentNetwork$1" type="String">The current network.</field>
    /// <field name="_currentType$1" type="People.RecentActivity.UI.Core.ErrorMessageType">The current type.</field>
    /// <field name="_controls$1" type="Array">A list of controls we need to dispose.</field>
    People.RecentActivity.UI.Core.Control.call(this);
    Debug.assert(!!operation, 'operation != None');

    this._context$1 = context;
    this._controls$1 = [];
    this._display$1 = new People.RecentActivity.UI.Core.ErrorMessageInlineDisplay(this);
    this._identity$1 = identity;
    this._location$1 = 0;
    this._operation$1 = operation;

    if (element == null) {
        // we should use the default element instead.
        element = People.RecentActivity.UI.Core.HtmlHelper.createElement('<div class="ra-error"></div>');
    }

    this.element = element;
    this.addClass('ra-error');
};

Jx.inherit(People.RecentActivity.UI.Core.ErrorMessageControl, People.RecentActivity.UI.Core.Control);

People.RecentActivity.UI.Core.ErrorMessageControl.prototype._identity$1 = null;
People.RecentActivity.UI.Core.ErrorMessageControl.prototype._operation$1 = 0;
People.RecentActivity.UI.Core.ErrorMessageControl.prototype._context$1 = 0;
People.RecentActivity.UI.Core.ErrorMessageControl.prototype._location$1 = 0;
People.RecentActivity.UI.Core.ErrorMessageControl.prototype._display$1 = null;
People.RecentActivity.UI.Core.ErrorMessageControl.prototype._current$1 = null;
People.RecentActivity.UI.Core.ErrorMessageControl.prototype._currentCode$1 = 0;
People.RecentActivity.UI.Core.ErrorMessageControl.prototype._currentNetwork$1 = null;
People.RecentActivity.UI.Core.ErrorMessageControl.prototype._currentType$1 = 0;
People.RecentActivity.UI.Core.ErrorMessageControl.prototype._controls$1 = null;

Object.defineProperty(People.RecentActivity.UI.Core.ErrorMessageControl.prototype, "context", {
    get: function() {
        /// <summary>
        ///     Gets or sets the context.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Core.ErrorMessageContext"></value>
        return this._context$1;
    },
    set: function(value) {
        if (value !== this._context$1) {
            this._context$1 = value;

            if ((this._current$1 != null) || (!!this._currentType$1)) {
                this._updateCurrent$1();
            }        
        }
    }
});

Object.defineProperty(People.RecentActivity.UI.Core.ErrorMessageControl.prototype, "location", {
    get: function() {
        /// <summary>
        ///     Gets or sets the current error location override.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Core.ErrorMessageLocation"></value>
        return this._location$1;
    },
    set: function(value) {
        if (value !== this._location$1) {
            this._location$1 = value;

            if (this._display$1 != null) {
                // first clear the current message.
                this._display$1.clear();
            }

            switch (this._location$1) {
                case 0:
                    this._display$1 = new People.RecentActivity.UI.Core.ErrorMessageInlineDisplay(this);
                    break;
                case 1:
                    this._display$1 = new People.RecentActivity.UI.Core.ErrorMessageBarDisplay(this);
                    break;
            }

            if ((this._current$1 != null) || (!!this._currentType$1)) {
                // update the current error.
                this._updateCurrent$1();
            }        
        }
    }
});

Object.defineProperty(People.RecentActivity.UI.Core.ErrorMessageControl.prototype, "operation", {
    get: function() {
        /// <summary>
        ///     Gets the operation.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Core.ErrorMessageOperation"></value>
        return this._operation$1;
    }
});

People.RecentActivity.UI.Core.ErrorMessageControl.prototype.clear = function() {
    /// <summary>
    ///     Clears the current error.
    /// </summary>
    if (this._display$1 != null) {
        // clear the message on the current display.
        this._display$1.clear();

        for (var i = 0, len = this._controls$1.length; i < len; i++) {
            // dispose of each control in our list.
            this._controls$1[i].dispose();
            this._controls$1[i] = null;
        }

        this._controls$1.length = 0;
        this._current$1 = null;
        this._currentType$1 = 0;
    }
};

People.RecentActivity.UI.Core.ErrorMessageControl.prototype.show = function(result) {
    /// <summary>
    ///     Shows the given error.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    Debug.assert(result != null, 'result');

    this.clear();

    this._current$1 = result;
    this._currentType$1 = 0;
    this._updateCurrent$1();
};

People.RecentActivity.UI.Core.ErrorMessageControl.prototype.showType = function(type) {
    /// <summary>
    ///     Shows the given error type. Useful in cases where there is no actual error, but an error-like state.
    /// </summary>
    /// <param name="type" type="People.RecentActivity.UI.Core.ErrorMessageType">The type.</param>
    Debug.assert(!!type, 'type != None');

    this.clear();

    this._current$1 = null;
    this._currentType$1 = type;
    this._updateCurrent$1();
};

People.RecentActivity.UI.Core.ErrorMessageControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    this.clear();

    this._identity$1 = null;
    this._display$1 = null;

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Core.ErrorMessageControl.prototype._updateCurrent$1 = function() {
    if (this._current$1 == null) {
        // check if there is a type that we understand.
        switch (this._currentType$1) {
            case 1:
                this._updateErrorEmpty$1();
                break;
        }
    }
    else {
        // figure out what kind of error we should show. we need to go through the errors and get the one
        // we like the most. for example, permissions will always get preference over generic failures.
        this._getMostSevereError$1();
        switch (this._currentCode$1) {
            case People.RecentActivity.Core.ResultCode.failure:
            case People.RecentActivity.Core.ResultCode.partialFailure:
                this._updateErrorFailure$1();
                break;
            case People.RecentActivity.Core.ResultCode.invalidPermissions:
            case People.RecentActivity.Core.ResultCode.invalidUserCredential:
            case People.RecentActivity.Core.ResultCode.partialFailureWithInvalidUserCredential:
                this._updateErrorPermissions$1();
                break;
            case People.RecentActivity.Core.ResultCode.userOffline:
                this._updateErrorOffline$1();
                break;
        }    
    }
};

People.RecentActivity.UI.Core.ErrorMessageControl.prototype._updateErrorEmpty$1 = function() {
    var formatter = null;
    var name = null;
    var isMeOrGlobal = this._identity$1.isMe || this._identity$1.isWhatsNew;

    switch (this._context$1) {
        case 1:
            // also set isMeOrGlobal to true because we don't need an IC here.
            formatter = '/strings/raErrorNoContent-Notifications';
            isMeOrGlobal = true;
            break;
        case 2:
            formatter = (isMeOrGlobal) ? '/strings/raErrorNoContent-Photos' : '/strings/raErrorNoContent-PhotosContact';
            break;
        case 3:
            formatter = (isMeOrGlobal) ? '/strings/raErrorNoContent-WN' : '/strings/raErrorNoContent-RA';
            break;
    }

    if (!isMeOrGlobal) {
        // initialize a new IC we can use to get the name.
        var control = new People.RecentActivity.UI.Core.ContactControl(this._identity$1.getDataContext(), false);
        name = control.getElement(1);
        control.activate(name);
        this._controls$1.push(control);
    }

    // set the message where-ever we need to display it.
    this._display$1.setEmptyMessage(formatter, (name != null) ? [ name ] : new Array(0));
};

People.RecentActivity.UI.Core.ErrorMessageControl.prototype._updateErrorFailure$1 = function() {
    var formatter = null;

    switch (this._operation$1) {
        case 1:
            formatter = '/strings/raErrorIntermittentRead';
            break;
        case 2:
            formatter = '/strings/raErrorIntermittentWrite';
            break;
    }

    // figure out the name of the network we need to display.
    this._display$1.setGenericMessage(formatter, [ this._getNetworkName$1() ]);
};

People.RecentActivity.UI.Core.ErrorMessageControl.prototype._updateErrorPermissions$1 = function() {
    var formatter = null;

    switch (this._operation$1) {
        case 1:
            formatter = '/strings/raErrorPermissionsRead';
            break;
        case 2:
            formatter = '/strings/raErrorPermissionsWrite';
            break;
    }

    if (!this._location$1) {
        formatter += 'Inline';
    }

    this._display$1.setPermissionsMessage(
        formatter,
        [this._getNetworkName$1()],
        Jx.res.getString('/strings/raErrorPermissionsButton'),
        this._onPermissionsButtonClicked$1.bind(this));
};

People.RecentActivity.UI.Core.ErrorMessageControl.prototype._updateErrorOffline$1 = function() {
    var formatter = null;

    if (this._location$1 === 1) {
        // this is a subtle error message, no formatter elements needed.
        formatter = '/strings/raErrorConnectivitySubtle';
    }
    else {
        switch (this._operation$1) {
            case 1:
                formatter = '/strings/raErrorConnectivityRead';
                break;
            case 2:
                formatter = '/strings/raErrorConnectivityWrite';
                break;
        }    
    }

    this._display$1.setConnectivityMessage(formatter, []);
};

People.RecentActivity.UI.Core.ErrorMessageControl.prototype._getNetwork$1 = function() {
    /// <returns type="People.RecentActivity.Network"></returns>
    // simply get the network of the current ID.
    return this._identity$1.networks.findById(this._currentNetwork$1);
};

People.RecentActivity.UI.Core.ErrorMessageControl.prototype._getNetworkName$1 = function() {
    /// <returns type="HTMLElement"></returns>
    // get the network and then simply return the name.
    var network = this._getNetwork$1();
    return document.createTextNode((network != null) ? network.name : '');
};

People.RecentActivity.UI.Core.ErrorMessageControl.prototype._getMostSevereError$1 = function() {
    // fetch all the result codes and figure out which is the most important.
    this._currentCode$1 = People.RecentActivity.Core.ResultCode.success;
    this._currentNetwork$1 = null;

    var errors = this._current$1.errorMap;
    for (var k in errors) {
        var result = { key: k, value: errors[k] };
        if (result.value > this._currentCode$1) {
            this._currentCode$1 = result.value;
            this._currentNetwork$1 = result.key;
        }    
    }

    if (this._currentCode$1 === People.RecentActivity.Core.ResultCode.success) {
        // if we're still here and we didn't get a specialized error code, then use the aggregated one.
        // also use the first available network, more than likely this is the correct one to use.
        this._currentCode$1 = this._current$1.code;
        this._currentNetwork$1 = this._identity$1.networks.item(0).id;
    }
};

People.RecentActivity.UI.Core.ErrorMessageControl.prototype._onPermissionsButtonClicked$1 = function() {
    var network = this._getNetwork$1();
    if (network != null) {
        // get the associated account.
        var manager = Jx.root.getPlatform().accountManager;
        var account = manager.getAccountBySourceId(network.id, '');
        if (account != null) {
            // set up a new reconnect control and launch into the reconnect flow.
            var launcher = new People.Accounts.FlowLauncher(Jx.root.getPlatform(), Microsoft.WindowsLive.Platform.ApplicationScenario.people, 'social', Jx.root.getJobSet());
            launcher.launchManageFlow(account, true);
        }    
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Helpers\HtmlHelper.js" />
/// <reference path="..\Helpers\LocalizationHelper.js" />
/// <reference path="Control.js" />
/// <reference path="ErrorMessageDisplay.js" />

People.RecentActivity.UI.Core.ErrorMessageInlineDisplay = function(control) {
    /// <summary>
    ///     Provides a base class for error message locations.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Core.Control">The control.</param>
    /// <field name="_control$1" type="People.RecentActivity.UI.Core.Control">The control we can use to display the error.</field>
    /// <field name="_button$1" type="People.RecentActivity.UI.Core.Control">The permissiosn button, if any.</field>
    People.RecentActivity.UI.Core.ErrorMessageDisplay.call(this);
    Debug.assert(control != null, 'control');
    this._control$1 = control;
};

Jx.inherit(People.RecentActivity.UI.Core.ErrorMessageInlineDisplay, People.RecentActivity.UI.Core.ErrorMessageDisplay);


People.RecentActivity.UI.Core.ErrorMessageInlineDisplay.prototype._control$1 = null;
People.RecentActivity.UI.Core.ErrorMessageInlineDisplay.prototype._button$1 = null;

People.RecentActivity.UI.Core.ErrorMessageInlineDisplay.prototype.clear = function() {
    /// <summary>
    ///     Clears the current error.
    /// </summary>
    if (this._button$1 != null) {
        this._button$1.dispose();
        this._button$1 = null;
    }

    this._control$1.text = '';
};

People.RecentActivity.UI.Core.ErrorMessageInlineDisplay.prototype.setEmptyMessage = function(formatter, elements) {
    /// <summary>
    ///     Sets the empty message.
    /// </summary>
    /// <param name="formatter" type="String">The formatter string.</param>
    /// <param name="elements" type="Array" elementType="Object" elementDomElement="true">The elements.</param>
    this._setMessage$1(formatter, elements);
};

People.RecentActivity.UI.Core.ErrorMessageInlineDisplay.prototype.setConnectivityMessage = function(formatter, elements) {
    /// <summary>
    ///     Sets the connectivity error message.
    /// </summary>
    /// <param name="formatter" type="String">The formatter.</param>
    /// <param name="elements" type="Array" elementType="Object" elementDomElement="true">The elements.</param>
    this._setMessage$1(formatter, elements);
};

People.RecentActivity.UI.Core.ErrorMessageInlineDisplay.prototype.setGenericMessage = function(formatter, elements) {
    /// <summary>
    ///     Sets the generic error message.
    /// </summary>
    /// <param name="formatter" type="String">The formatter.</param>
    /// <param name="elements" type="Array" elementType="Object" elementDomElement="true">The elements.</param>
    this._setMessage$1(formatter, elements);
};

People.RecentActivity.UI.Core.ErrorMessageInlineDisplay.prototype.setPermissionsMessage = function(formatter, elements, buttonText, buttonCallback) {
    /// <summary>
    ///     Sets the permissioning error message.
    /// </summary>
    /// <param name="formatter" type="String">The formatter.</param>
    /// <param name="elements" type="Array" elementType="Object" elementDomElement="true">The elements.</param>
    /// <param name="buttonText" type="String">The button text.</param>
    /// <param name="buttonCallback" type="Function">The button callback.</param>
    Debug.assert(formatter != null, 'formatter');
    Debug.assert(elements != null, 'elements');
    // add another element for the button with the given text.
    var button = new People.RecentActivity.UI.Core.Control(People.RecentActivity.UI.Core.HtmlHelper.createElement('<div class="ra-fauxButton ra-fauxInheritButton ra-errorButton" role="button"></div>'));
    button.attach('click', function() {
        buttonCallback();
    });
    button.text = buttonText;
    People.Animation.addTapAnimation(button.element);
    var elem = [];
    elem.push.apply(elem, elements);
    elem.push(button.element);
    this._setMessage$1(formatter, elem);
    this._button$1 = button;
};

People.RecentActivity.UI.Core.ErrorMessageInlineDisplay.prototype._setMessage$1 = function(formatter, elements) {
    /// <param name="formatter" type="String"></param>
    /// <param name="elements" type="Array" elementType="Object" elementDomElement="true"></param>
    Debug.assert(formatter != null, 'formatter');
    Debug.assert(elements != null, 'elements');
    this.clear();
    this._control$1.appendChild(People.RecentActivity.UI.Core.LocalizationHelper.loadCompoundElement(formatter, elements));
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Imports\IdentityControl\IdentityElementContextOptions.js" />
/// <reference path="..\..\..\Model\Entity.js" />
/// <reference path="..\..\..\Model\EntityType.js" />
/// <reference path="..\Helpers\HtmlHelper.js" />
/// <reference path="ContactControl.js" />
/// <reference path="Control.js" />

People.RecentActivity.UI.Core.FormattedTextControl = function(element, context, hidden) {
    /// <summary>
    ///     Provides a control for formatting text.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element to wrap.</param>
    /// <param name="context" type="String">The context.</param>
    /// <param name="hidden" type="Boolean">Whether the entities should be hidden from the screenreader.</param>
    /// <field name="_controls$1" type="Array">The controls.</field>
    /// <field name="_context$1" type="String">The context.</field>
    /// <field name="_hidden" type="Boolean">Whether the entities should be hidden from the screenreader.</field>
    People.RecentActivity.UI.Core.Control.call(this, element);

    Debug.assert(Jx.isNonEmptyString(context), '!string.IsNullOrEmpty(context)');

    this._controls$1 = [];
    this._context$1 = context;
    this._hidden = hidden;

    this.render();
};

Jx.inherit(People.RecentActivity.UI.Core.FormattedTextControl, People.RecentActivity.UI.Core.Control);

People.RecentActivity.UI.Core.FormattedTextControl.fromExistingElement = function(element, context, entities) {
    /// <summary>
    ///     Creates a new <see cref="T:People.RecentActivity.UI.Core.FormattedTextControl" /> from an existing element.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="context" type="String">The context.</param>
    /// <param name="entities" type="Array" elementType="Entity">The entities.</param>
    /// <returns type="People.RecentActivity.UI.Core.FormattedTextControl"></returns>
    Debug.assert(element != null, 'element != null');
    Debug.assert(Jx.isNonEmptyString(context), '!string.IsNullOrEmpty(context)');
    Debug.assert(entities != null, 'entities != null');

    var control = new People.RecentActivity.UI.Core.FormattedTextControl(element, context, true);

    // update all the interactive entities.
    control._reactivateInteractiveControls$1(entities);

    return control;
};


People.RecentActivity.UI.Core.FormattedTextControl.prototype._controls$1 = null;
People.RecentActivity.UI.Core.FormattedTextControl.prototype._context$1 = null;
People.RecentActivity.UI.Core.FormattedTextControl.prototype._hidden = false;

People.RecentActivity.UI.Core.FormattedTextControl.prototype.update = function(text, entities) {
    /// <summary>
    ///     Updates the text and entities.
    /// </summary>
    /// <param name="text" type="String">The text.</param>
    /// <param name="entities" type="Array" elementType="Entity">The entities.</param>
    Debug.assert(entities != null, 'entities != null');

    // dispose the existing elements and controls.
    this._disposeElements$1();
    this._disposeControls$1();

    if (Jx.isNonEmptyString(text)) {
        this._updateText$1(text, entities);
    }
};

People.RecentActivity.UI.Core.FormattedTextControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    this._disposeElements$1();
    this._disposeControls$1();
    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Core.FormattedTextControl.prototype._disposeControls$1 = function() {
    for (var n = 0; n < this._controls$1.length; n++) {
        var control = this._controls$1[n];
        // dispose each control.
        control.dispose();
    }

    this._controls$1.length = 0;
};

People.RecentActivity.UI.Core.FormattedTextControl.prototype._disposeElements$1 = function() {
    // remove all the children from the element.
    var element = this.element;
    while (element.childNodes.length > 0) {
        element.removeChild(element.firstChild);
    }
};

People.RecentActivity.UI.Core.FormattedTextControl.prototype._reactivateInteractiveControls$1 = function(entities) {
    /// <param name="entities" type="Array" elementType="Entity"></param>
    Debug.assert(entities != null, 'entities != null');

    var element = this.element;

    for (var i = 0, len = entities.length; i < len; i++) {
        var entity = entities[i];

        // a contact entity is interactive in that is has some JS backing it (for tooltips, etc.).
        // all other entities such as links and hashtags are just plain HTML/CSS backed elements,
        // thus we don't need to reactivate them.
        if (entity.type === People.RecentActivity.EntityType.contact) {
            this._formatExistingContactEntity$1(People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, 'entity-' + i), entity);
        }    
    }
};

People.RecentActivity.UI.Core.FormattedTextControl.prototype._updateText$1 = function(text, entities) {
    /// <param name="text" type="String"></param>
    /// <param name="entities" type="Array" elementType="Entity"></param>
    Debug.assert(entities != null, 'entities != null');

    if (text) {
        var direction = /*@static_cast(Jx.Bidi.Values)*/Jx.Bidi.getTextDirection(text);
        if (direction === Jx.Bidi.Values.rtl) {
            this._element.style.direction = "rtl";
        } else if (direction === Jx.Bidi.Values.ltr) {
            this._element.style.direction = "ltr";
        }
    }

    if (!entities.length) {
        // if there are no entities, we can just set the text.
        this.text = text;
        return;
    }

    var fragment = document.createDocumentFragment();
    var index = 0;

    for (var i = 0, count = entities.length; i < count; i++) {
        var entity = entities[i];
        var length = entity.length;
        var offset = entity.offset;

        // do a quick sanity check to make sure entities are sorted.
        Debug.assert(offset >= index, 'Entities are not sorted.');

        if (offset !== index) {
            // fetch the text between our current index and entity offset and append it.
            fragment.appendChild(document.createTextNode(text.substring(index, offset)));
        }

        this._formatEntity$1(i, fragment, text, entity);

        // skip to the next bit of text.
        index = offset + length;
    }

    if (index !== text.length) {
        // there's text at the end that we still need to append.
        fragment.appendChild(document.createTextNode(text.substr(index)));
    }

    this.element.appendChild(fragment);
};

People.RecentActivity.UI.Core.FormattedTextControl.prototype._formatEntity$1 = function(index, fragment, text, entity) {
    /// <param name="index" type="Number" integer="true"></param>
    /// <param name="fragment" type="DocumentFragment"></param>
    /// <param name="text" type="String"></param>
    /// <param name="entity" type="People.RecentActivity.Entity"></param>
    Debug.assert(index >= 0, 'index >= 0');
    Debug.assert(fragment != null, 'fragment != null');
    Debug.assert(entity != null, 'entity != null');

    var substr = text.substr(entity.offset, entity.length);

    switch (entity.type) {
        case People.RecentActivity.EntityType.contact:
            // format the contact entity by creating a new ContactControl.
            this._formatContactEntity$1(index, substr, fragment, entity);
            break;

        case People.RecentActivity.EntityType.link:
            // format the link entity by appending a link.
            this._formatLinkEntity$1(index, fragment, entity);
            break;

        case People.RecentActivity.EntityType.hashTag:
            // format the hash tag by appending a link.
            this._formatHashTagEntity$1(index, substr, fragment, entity);
            break;

        default:
            // this is an unknown entity, just append the text.
            Debug.assert(false, 'Unknown entity found: ' + entity.type);
            fragment.appendChild(document.createTextNode(substr));
            break;
    }
};

People.RecentActivity.UI.Core.FormattedTextControl.prototype._formatExistingContactEntity$1 = function(existing, entity) {
    /// <param name="existing" type="HTMLElement"></param>
    /// <param name="entity" type="People.RecentActivity.Entity"></param>
    Debug.assert(existing != null, 'existing != null');
    Debug.assert(entity != null, 'entity != null');

    // take the inner text as the fallback string.
    var text = existing.innerText.trim();
    var control = new People.RecentActivity.UI.Core.ContactControl((entity.data).getDataContext());
    this._controls$1.push(control);

    var element = control.getElement(2, People.RecentActivity.Imports.create_identityElementContextOptions(this._context$1, text), -1);

    // append the element to the existing element again.
    existing.innerHTML = '';
    existing.appendChild(element);

    control.activate(element);
};

People.RecentActivity.UI.Core.FormattedTextControl.prototype._formatContactEntity$1 = function(index, text, fragment, entity) {
    /// <param name="index" type="Number" integer="true"></param>
    /// <param name="text" type="String"></param>
    /// <param name="fragment" type="DocumentFragment"></param>
    /// <param name="entity" type="People.RecentActivity.Entity"></param>
    Debug.assert(index >= 0, 'index >= 0');
    Debug.assert(fragment != null, 'fragment != null');
    Debug.assert(entity != null, 'entity != null');
    Debug.assert(entity.type === People.RecentActivity.EntityType.contact, 'entity.Type == EntityType.Contact');

    // initialize a new contact control for this contact.
    var element = document.createElement('span');
    element.id = 'entity-' + index;

    var control = new People.RecentActivity.UI.Core.ContactControl((entity.data).getDataContext());
    this._controls$1.push(control);

    var controlElement = control.getElement(2, People.RecentActivity.Imports.create_identityElementContextOptions(this._context$1, text), -1);

    // append the IC to the element, and then append that to the fragment.
    element.appendChild(controlElement);
    fragment.appendChild(element);

    control.activate(controlElement, this._hidden);
};

People.RecentActivity.UI.Core.FormattedTextControl.prototype._formatLinkEntity$1 = function(index, fragment, entity) {
    /// <param name="index" type="Number" integer="true"></param>
    /// <param name="fragment" type="DocumentFragment"></param>
    /// <param name="entity" type="People.RecentActivity.Entity"></param>
    Debug.assert(index >= 0, 'index >= 0');
    Debug.assert(fragment != null, 'fragment != null');
    Debug.assert(entity != null, 'entity != null');
    Debug.assert(entity.type === People.RecentActivity.EntityType.link, 'entity.Type == EntityType.Link');

    var info = entity.data;

    var element = People.RecentActivity.UI.Core.HtmlHelper.createElement('<a class="ra-link" role="link" tabindex="0"></a>');
    element.href = info.url;
    element.id = 'entity-' + index;
    element.innerText = info.displayUrl;
    element.tabIndex = -1;
    element.setAttribute('aria-hidden', this._hidden);

    fragment.appendChild(element);
};

People.RecentActivity.UI.Core.FormattedTextControl.prototype._formatHashTagEntity$1 = function(index, text, fragment, entity) {
    /// <param name="index" type="Number" integer="true"></param>
    /// <param name="text" type="String"></param>
    /// <param name="fragment" type="DocumentFragment"></param>
    /// <param name="entity" type="People.RecentActivity.Entity"></param>
    Debug.assert(index >= 0, 'index >= 0');
    Debug.assert(fragment != null, 'fragment != null');
    Debug.assert(entity != null, 'entity != null');
    Debug.assert(entity.type === People.RecentActivity.EntityType.hashTag, 'entity.Type == EntityType.HashTag');

    var element = People.RecentActivity.UI.Core.HtmlHelper.createElement('<a class="ra-link ra-hashTag" role="link" tabindex="0"></a>');
    element.href = entity.data;
    element.id = 'entity-' + index;
    element.innerText = text;
    element.tabIndex = -1;
    element.setAttribute('aria-hidden', this._hidden);

    fragment.appendChild(element);
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\..\Model\Entity.js" />

People.RecentActivity.UI.Core.FormattedTextEntityClickedEventArgs = function(sender, entity) {
    /// <summary>
    ///     Provides event arguments for the <see cref="T:People.RecentActivity.UI.Core.FormattedTextEntityClickedEventArgs" /> class.
    /// </summary>
    /// <param name="sender" type="Object">The sender.</param>
    /// <param name="entity" type="People.RecentActivity.Entity">The entity.</param>
    /// <field name="_entity$1" type="People.RecentActivity.Entity">The entity.</field>
    /// <field name="_preventDefault$1" type="Boolean">Whether the default action should not be taken.</field>
    People.RecentActivity.EventArgs.call(this, sender);
    Debug.assert(entity != null, 'entity != null');
    this._entity$1 = entity;
};

Jx.inherit(People.RecentActivity.UI.Core.FormattedTextEntityClickedEventArgs, People.RecentActivity.EventArgs);


People.RecentActivity.UI.Core.FormattedTextEntityClickedEventArgs.prototype._entity$1 = null;
People.RecentActivity.UI.Core.FormattedTextEntityClickedEventArgs.prototype._preventDefault$1 = false;

Object.defineProperty(People.RecentActivity.UI.Core.FormattedTextEntityClickedEventArgs.prototype, "entity", {
    get: function() {
        /// <summary>
        ///     Gets the entity.
        /// </summary>
        /// <value type="People.RecentActivity.Entity"></value>
        return this._entity$1;
    }
});

Object.defineProperty(People.RecentActivity.UI.Core.FormattedTextEntityClickedEventArgs.prototype, "preventDefault", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the default action should be prevented.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._preventDefault$1;
    },
    set: function(value) {
        this._preventDefault$1 = value;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Helpers\AriaHelper.js" />
/// <reference path="..\Helpers\HtmlHelper.js" />

People.RecentActivity.UI.Core.GlobalProgressControl = function() {
    /// <summary>
    ///     Provides a global progress control.
    /// </summary>
    /// <field name="_tokens" type="Array" static="true">The list of currently running items.</field>
    /// <field name="_progress" type="HTMLElement" static="true">The progress control.</field>
};


People.RecentActivity.UI.Core.GlobalProgressControl._tokens = null;
People.RecentActivity.UI.Core.GlobalProgressControl._progress = null;

People.RecentActivity.UI.Core.GlobalProgressControl.add = function(token) {
    /// <summary>
    ///     Adds an item.
    /// </summary>
    /// <param name="token" type="Object">The item to add.</param>
    var tokens = People.RecentActivity.UI.Core.GlobalProgressControl._tokens;
    tokens.push(token);
    if (People.RecentActivity.UI.Core.GlobalProgressControl._progress == null) {
        // create a new progress element, add it to the body, fade it in.
        var element = People.RecentActivity.UI.Core.HtmlHelper.createElement('<progress class="ra-progress-global"></progress>');
        People.RecentActivity.UI.Core.AriaHelper.setLabel(element, Jx.res.getString('/strings/raProgressUpdating'));
        People.RecentActivity.UI.Core.GlobalProgressControl._progress = element;
        window.msSetImmediate(function() {
            if (People.RecentActivity.UI.Core.GlobalProgressControl._progress === element) {
                // we now need to show the progress element.
                document.body.appendChild(element);
            }

        });
    }
};

People.RecentActivity.UI.Core.GlobalProgressControl.remove = function(token) {
    /// <summary>
    ///     Removes an item.
    /// </summary>
    /// <param name="token" type="Object">The item to remove.</param>
    var tokens = People.RecentActivity.UI.Core.GlobalProgressControl._tokens;
    var index = tokens.indexOf(token);
    if (index !== -1) {
        tokens.splice(index, 1);
        if (!tokens.length) {
            // remove the current element from the DOM.
            People.RecentActivity.UI.Core.GlobalProgressControl._removeFromDom();
        }    
    }
};

People.RecentActivity.UI.Core.GlobalProgressControl.reset = function() {
    /// <summary>
    ///     Resets the progress element.
    /// </summary>
    var tokens = People.RecentActivity.UI.Core.GlobalProgressControl._tokens;
    if (tokens.length > 0) {
        People.RecentActivity.UI.Core.GlobalProgressControl._tokens.length = 0;
        People.RecentActivity.UI.Core.GlobalProgressControl._removeFromDom();
    }
};

People.RecentActivity.UI.Core.GlobalProgressControl._removeFromDom = function() {
    var element = People.RecentActivity.UI.Core.GlobalProgressControl._progress;
    if (element != null) {
        // udpate the ARIA label, we're done!
        People.RecentActivity.UI.Core.AriaHelper.setLabel(element, Jx.res.getString('/strings/raProgressCompleted'));
        // unset set the field so we can do whatever we want with it.
        People.RecentActivity.UI.Core.GlobalProgressControl._progress = null;
        var parent = element.parentNode;
        if (parent != null) {
            // remove the progress control from the body.
            parent.removeChild(element);
        }    
    }
};


(function() {
    People.RecentActivity.UI.Core.GlobalProgressControl._tokens = [];
})();
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\EventArgs.js" />
/// <reference path="..\Helpers\HtmlHelper.js" />
/// <reference path="Control.js" />

People.RecentActivity.UI.Core.ImageControl = function(element) {
    /// <summary>
    ///     Provides an image control that handles some of the error and delay loading cases.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <field name="_isOneByOneError$1" type="Boolean">Whether a 1x1 image is an error condition.</field>
    /// <field name="_isDelayed$1" type="Boolean">
    ///     Whether loading the image should be delayed until the item has been
    ///     added to the real DOM.
    
    /// </field>
    /// <field name="_isBackground$1" type="Boolean">Whether the image should be applied as background image.</field>
    /// <field name="_isLoaded$1" type="Boolean">Whether the image was loaded.</field>
    /// <field name="_isLoading$1" type="Boolean">Whether the image is loading.</field>
    /// <field name="_shim$1" type="People.RecentActivity.UI.Core.Control">The delayed image.</field>
    /// <field name="_source$1" type="String">The image source.</field>
    People.RecentActivity.UI.Core.Control.call(this, element);
    // hide the image until it has been loaded.
    this.isVisible = false;
};

Jx.inherit(People.RecentActivity.UI.Core.ImageControl, People.RecentActivity.UI.Core.Control);

Debug.Events.define(People.RecentActivity.UI.Core.ImageControl.prototype, "imageloaded", "imagefailed");

People.RecentActivity.UI.Core.ImageControl.prototype._isOneByOneError$1 = false;
People.RecentActivity.UI.Core.ImageControl.prototype._isDelayed$1 = false;
People.RecentActivity.UI.Core.ImageControl.prototype._isBackground$1 = false;
People.RecentActivity.UI.Core.ImageControl.prototype._isLoaded$1 = false;
People.RecentActivity.UI.Core.ImageControl.prototype._isLoading$1 = false;
People.RecentActivity.UI.Core.ImageControl.prototype._shim$1 = null;
People.RecentActivity.UI.Core.ImageControl.prototype._source$1 = null;

Object.defineProperty(People.RecentActivity.UI.Core.ImageControl.prototype, "isOneByOneError", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether a 1x1 image is an error. Must be set before <see cref="P:People.RecentActivity.UI.Core.ImageControl.Source" />.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isOneByOneError$1;
    },
    set: function(value) {
        this._isOneByOneError$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Core.ImageControl.prototype, "isBackground", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the image should be applied as a background image.
        ///     Must be set before <see cref="P:People.RecentActivity.UI.Core.ImageControl.Source" />.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isBackground$1;
    },
    set: function(value) {
        this._isBackground$1 = true;
    }
});

Object.defineProperty(People.RecentActivity.UI.Core.ImageControl.prototype, "isDelayed", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the source should be delay loaded until the
        ///     image has been added to the DOM. Must be set before <see cref="P:People.RecentActivity.UI.Core.ImageControl.Source" />.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isDelayed$1;
    },
    set: function(value) {
        this._isDelayed$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Core.ImageControl.prototype, "isDimensionsAvailable", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the image dimensions have been loaded.
        /// </summary>
        /// <value type="Boolean"></value>
        return (this.height > 0) && (this.width > 0);
    }
});

Object.defineProperty(People.RecentActivity.UI.Core.ImageControl.prototype, "isLoaded", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the image has been loaded.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isLoaded$1;
    }
});

Object.defineProperty(People.RecentActivity.UI.Core.ImageControl.prototype, "source", {
    get: function() {
        /// <summary>
        ///     Gets or sets the source.
        /// </summary>
        /// <value type="String"></value>
        return this._source$1;
    },
    set: function(value) {
        if (this._source$1 !== value) {
            this._source$1 = value;
            if (this._isLoading$1) {
                // we're currently already loading an image, so stop that action first.
                // dispose the shim in case we initialized that.
                this._disposeShim$1();
                // detach event handlers on ourselves so we don't double-dip later.
                this._detachEventHandlers$1();
            }

            this._isLoaded$1 = false;
            this._isLoading$1 = true;
            var image = this.element;
            if (this._isDelayed$1) {
                // spin off a seperate image that loads normally behind the scenes, and then load a 1x1 transparent image
                // from disk. this is useful for scenarios where MoCo waits for images to be loaded before rendering items.
                var element = document.createElement('img');
                this._shim$1 = new People.RecentActivity.UI.Core.Control(element);
                this._shim$1.attach('load', this._onImageLoaded$1.bind(this));
                this._shim$1.attach('error', this._onImageFailed$1.bind(this));
                // once the shim has been constructed and events are attached, load the image.
                element.src = value;
                image.src = People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-1x1.gif');
            }
            else {
                this.attach('load', this._onImageLoaded$1.bind(this));
                this.attach('error', this._onImageFailed$1.bind(this));
                if (this._isBackground$1) {
                    image.src = People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-1x1.gif');
                    image.style.backgroundImage = "url('" + value + "')";
                    image.style['msHighContrastAdjust'] = 'none';
                }
                else {
                    image.src = value;
                }

                // make sure the image is shown.
                image.style.opacity = '1';
            }        
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Core.ImageControl.prototype, "height", {
    get: function() {
        /// <summary>
        ///     Gets the natural height of the image.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        if (this._shim$1 != null) {
            // even though we're delayed, we could still try to get the shim height.
            var image = this._shim$1.element;
            return image.naturalHeight;
        }
        else {
            var image = this.element;
            return image.naturalHeight;
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Core.ImageControl.prototype, "width", {
    get: function() {
        /// <summary>
        ///     Gets the natural width of the image.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        if (this._shim$1 != null) {
            // even though we're delayed, we could still try to get the shim width.
            var image = this._shim$1.element;
            return image.naturalWidth;
        }
        else {
            var image = this.element;
            return image.naturalWidth;
        }

    }
});

People.RecentActivity.UI.Core.ImageControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    this._disposeShim$1();
    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Core.ImageControl.prototype._swapImages$1 = function() {
    // swap the images.
    var dest = this.element;
    if (this._isBackground$1) {
        dest.style.backgroundImage = "url('" + this._source$1 + "')";
        dest.style['msHighContrastAdjust'] = 'none';
    }
    else {
        dest.src = this._source$1;
    }

    // once the magic swap has happend, we should get rid of our shim.
    this._disposeShim$1();
    // fade in the element, if necessary.
    People.Animation.fadeIn(dest);
};

People.RecentActivity.UI.Core.ImageControl.prototype._onImageLoaded$1 = function(ev) {
    /// <param name="ev" type="Event"></param>
    this._isLoading$1 = false;
    this._isLoaded$1 = true;
    if (this._isOneByOneError$1) {
        var image = (this._shim$1 != null) ? this._shim$1.element : this.element;
        var height = image.naturalHeight;
        var width = image.naturalWidth;
        if ((width <= 1) && (height <= 1)) {
            // this is a bogus image, we sometimes get these from Facebook.
            this._onImageFailed$1(ev);
            return;
        }    
    }

    // detach event handlers.
    this._detachEventHandlers$1();
    this.isVisible = true;
    if (this._shim$1 != null) {
        // swap the images from the shim to the real thing.
        this._swapImages$1();
    }

    this.raiseEvent("imageloaded", new People.RecentActivity.EventArgs(this));
    this.onPropertyChanged('IsLoaded');
};

People.RecentActivity.UI.Core.ImageControl.prototype._onImageFailed$1 = function(ev) {
    /// <param name="ev" type="Event"></param>
    this._isLoading$1 = false;
    this._isLoaded$1 = true;
    // just dispose the shim. don't do any swapping, etc.
    this._detachEventHandlers$1();
    this._disposeShim$1();
    this.raiseEvent("imagefailed", new People.RecentActivity.EventArgs(this));
    this.onPropertyChanged('IsLoaded');
};

People.RecentActivity.UI.Core.ImageControl.prototype._detachEventHandlers$1 = function() {
    this.detach('load');
    this.detach('error');
};

People.RecentActivity.UI.Core.ImageControl.prototype._disposeShim$1 = function() {
    if (this._shim$1 != null) {
        this._shim$1.dispose();
        this._shim$1 = null;
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Helpers\AriaHelper.js" />
/// <reference path="..\Helpers\HtmlHelper.js" />
/// <reference path="Control.js" />

People.RecentActivity.UI.Core.NavigatableControl = function(element, keyNext, keyPrev) {
    /// <summary>
    ///     Provides a simple navigatable (keyboard) control.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="keyNext" type="Number" integer="true">The keycode for the next key.</param>
    /// <param name="keyPrev" type="Number" integer="true">The keycode for the previous key.</param>
    /// <field name="_keyNext$1" type="Number" integer="true">The next key.</field>
    /// <field name="_keyPrev$1" type="Number" integer="true">The previous key.</field>
    /// <field name="_controls$1" type="Array">The controls.</field>
    /// <field name="_activeItem$1" type="People.RecentActivity.UI.Core.Control">The currently active item.</field>
    People.RecentActivity.UI.Core.Control.call(this, element);

    Debug.assert(element != null, 'element != null');
    Debug.assert(keyNext !== keyPrev, 'keyNext != keyPrev');

    this._controls$1 = [];
    
    if (People.RecentActivity.UI.Core.HtmlHelper.isRightToLeft) {
        if (((keyNext === WinJS.Utilities.Key.leftArrow) || (keyNext === WinJS.Utilities.Key.rightArrow)) &&
            ((keyPrev === WinJS.Utilities.Key.leftArrow) || (keyPrev === WinJS.Utilities.Key.rightArrow))) {
            // swap the two keys on RTL.
            var temp = keyNext;
            keyNext = keyPrev;
            keyPrev = temp;
        }   
    }

    this._keyNext$1 = keyNext;
    this._keyPrev$1 = keyPrev;

    // add the roles to the element.
    this.role = 'list';
};

Jx.inherit(People.RecentActivity.UI.Core.NavigatableControl, People.RecentActivity.UI.Core.Control);

People.RecentActivity.UI.Core.NavigatableControl.prototype._keyNext$1 = 0;
People.RecentActivity.UI.Core.NavigatableControl.prototype._keyPrev$1 = 0;
People.RecentActivity.UI.Core.NavigatableControl.prototype._controls$1 = null;
People.RecentActivity.UI.Core.NavigatableControl.prototype._activeItem$1 = null;

Object.defineProperty(People.RecentActivity.UI.Core.NavigatableControl.prototype, "activeItem", {
    get: function() {
        /// <summary>
        ///     Gets or sets the active item.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Core.Control"></value>
        return this._activeItem$1;
    },
    set: function(value) {
        if (value !== this._activeItem$1) {
            if (this._activeItem$1 != null) {
                // we have a current active item, clear the tab index, etc.
                this._activeItem$1.tabIndex = -1;
            }

            this._activeItem$1 = value;

            if (this._activeItem$1 != null) {
                // find the associated item and add the tab index.
                this._activeItem$1.tabIndex = 0;
            }        
        }

    }
});

People.RecentActivity.UI.Core.NavigatableControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    this._controls$1.length = 0;
    this._activeItem$1 = null;

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Core.NavigatableControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    this.attach('keydown', this._onKeyDown$1.bind(this));

    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
};

People.RecentActivity.UI.Core.NavigatableControl.prototype.addTabControl = function(control) {
    /// <summary>
    ///     Adds a control.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Core.Control">The control to add.</param>
    Debug.assert(control != null, 'control');

    if (this._controls$1.indexOf(control) === -1) {
        this._controls$1.push(control);

        if (this._activeItem$1 == null) {
            // if this is the first control added, lets set the active item!
            this.activeItem = this._controls$1[0];
        }

        this._updateAria$1();
    }
};

People.RecentActivity.UI.Core.NavigatableControl.prototype.insertTabControl = function(control, index) {
    /// <summary>
    ///     Inserts a control.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Core.Control">The control to insert.</param>
    /// <param name="index" type="Number" integer="true">The index.</param>
    Debug.assert(control != null, 'control');
    Debug.assert(index >= 0, 'index');

    var ix = this._controls$1.indexOf(control);
    if (ix !== -1) {
        // if the control already exists, remove it so we can re-insert it.
        this._controls$1.splice(ix, 1);
    }

    this._controls$1.splice(index, 0, control);

    if (this._activeItem$1 == null) {
        // if this is the first time a control is added, set the active item.
        this.activeItem = this._controls$1[0];
    }

    // update the set size and position.
    this._updateAria$1();
};

People.RecentActivity.UI.Core.NavigatableControl.prototype.removeTabControl = function(control) {
    /// <summary>
    ///     Removes a control.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Core.Control">The control to remove.</param>
    Debug.assert(control != null, 'control');

    var index = this._controls$1.indexOf(control);
    if (index !== -1) {
        this._controls$1.splice(index, 1);

        if (control === this._activeItem$1) {
            var isActive = control.isActive;

            // unset the active item (either to the first item in the list, or to nothing if there is nothing left.)
            this.activeItem = this._controls$1[(this._controls$1.length > 0) ? 0 : -1];

            if (isActive) {
                // also focus on the new active element.
                this._activeItem$1.focus();
            }
        }

        // update the ARIA properties
        this._updateAria$1();
    }
};

People.RecentActivity.UI.Core.NavigatableControl.prototype._updateAria$1 = function() {
    for (var i = 0, len = this._controls$1.length; i < len; i++) {
        var element = this._controls$1[i].element;

        People.RecentActivity.UI.Core.AriaHelper.setPositionInSet(element, i + 1);
        People.RecentActivity.UI.Core.AriaHelper.setSetSize(element, len);
    }
};

People.RecentActivity.UI.Core.NavigatableControl.prototype._onKeyDown$1 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev');

    var index = this._controls$1.indexOf(this._activeItem$1);

    if (ev.keyCode === this._keyNext$1) {
        index++;
    }
    else if (ev.keyCode === this._keyPrev$1) {
        index--;
    }
    else {
        // don't handle this keystroke.
        return;
    }

    // normalize the index to make sure we don't go out of bounds.
    index = Math.min(this._controls$1.length - 1, Math.max(0, index));

    // set the new active item, then focus on it.
    this.activeItem = this._controls$1[index];
    this._activeItem$1.focus();

    // prevent default actions from happening.
    ev.cancelBubble = true;
    ev.preventDefault();
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Helpers\HtmlHelper.js" />
/// <reference path="Control.js" />

People.RecentActivity.UI.Core.PsaUpsellControl = function() {
    /// <summary>
    ///     Provides a PSA Upsell control. The instantiater is responsible for showing/hiding this control.
    /// </summary>
    var elementHtml = "<div class='ra-psa'>" +
                        "<div class='ra-psaTitle' id='psa-title'></div>" +
                        "<div class='ra-psaText' id='psa-text'></div>" +
                        "<div class='ra-psaButton' id='psa-button' tabindex='0' role='button'></div>" +
                      "</div>";
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(elementHtml));
};

Jx.inherit(People.RecentActivity.UI.Core.PsaUpsellControl, People.RecentActivity.UI.Core.Control);

People.RecentActivity.UI.Core.PsaUpsellControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the control is being rendered.
    /// </summary>
    // initialize the UX and then attach a handler for clicks.
    var element = this.element;
    var psaTitle = People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, "psa-title");
    psaTitle.innerText = Jx.res.getString("/strings/raPSAUpsellTitle");
    var psaText = People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, "psa-text");
    psaText.innerText = Jx.res.getString("/strings/raPSAUpsellText");
    var psaButton = People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, "psa-button");
    psaButton.innerText = Jx.res.getString("/accountsStrings/upsellOK");
    psaButton.addEventListener("click", this._onClicked, false);
    psaButton.addEventListener("keyup", this._onKeyUp, false);
    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
};

People.RecentActivity.UI.Core.PsaUpsellControl.prototype.onDisposed = function () {
    /// <summary>
    ///     Occurs when the control is being disposed.
    /// </summary>
    if (this.element) {
        var psaButton = People.RecentActivity.UI.Core.HtmlHelper.findElementById(this.element, "psa-button");
        if (psaButton) {
            psaButton.removeEventListener("click", this._onClicked, false);
            psaButton.removeEventListener("keyup", this._onKeyUp, false);
            People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
        }
    }
};

People.RecentActivity.UI.Core.PsaUpsellControl.prototype._onKeyUp = function (ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, "ev != null");
    if (ev.keyCode === WinJS.Utilities.Key.enter ||
        ev.keyCode === WinJS.Utilities.Key.space) {
            People.Accounts.showAccountSettingsPage(Jx.root.getPlatform(), Microsoft.WindowsLive.Platform.ApplicationScenario.people, People.Accounts.AccountSettingsPage.upsells);
    }
};

People.RecentActivity.UI.Core.PsaUpsellControl.prototype._onClicked = function(e) {
    /// <param name="e" type="Event"></param>
    Debug.assert(e != null, "e != null");
    People.Accounts.showAccountSettingsPage(Jx.root.getPlatform(), Microsoft.WindowsLive.Platform.ApplicationScenario.people, People.Accounts.AccountSettingsPage.upsells);
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.EventManager = function() {
    /// <summary>
    ///     Provides events for global objects such as the Document and Window.
    /// </summary>
    /// <field name="_windowHeight" type="Number" integer="true" static="true">The window height.</field>
    /// <field name="_windowWidth" type="Number" integer="true" static="true">The window width.</field>
};

People.RecentActivity.UI.Core.EventManager.events = {};
Jx.mix(People.RecentActivity.UI.Core.EventManager.events, Jx.Events);
Jx.mix(People.RecentActivity.UI.Core.EventManager.events, People.Social.Events);

Debug.Events.define(People.RecentActivity.UI.Core.EventManager.events, "documentkeydown", "windowonline", "windowoffline", "windowresized");

People.RecentActivity.UI.Core.EventManager._windowHeight = 0;
People.RecentActivity.UI.Core.EventManager._windowWidth = 0;

People.RecentActivity.UI.Core.EventManager._onDocumentKeyDown = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');
    People.RecentActivity.UI.Core.EventManager.events.raiseEvent("documentkeydown", ev);
};

People.RecentActivity.UI.Core.EventManager._onWindowOnline = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');
    People.RecentActivity.UI.Core.EventManager.events.raiseEvent("windowonline", ev);
};

People.RecentActivity.UI.Core.EventManager._onWindowOffline = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');
    People.RecentActivity.UI.Core.EventManager.events.raiseEvent("windowoffline", ev);
};

People.RecentActivity.UI.Core.EventManager._onWindowResized = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');
    var height = window.innerHeight;
    var width = window.innerWidth;
    if ((height !== People.RecentActivity.UI.Core.EventManager._windowHeight) || (width !== People.RecentActivity.UI.Core.EventManager._windowWidth)) {
        People.RecentActivity.UI.Core.EventManager._windowHeight = height;
        People.RecentActivity.UI.Core.EventManager._windowWidth = width;
        People.RecentActivity.UI.Core.EventManager.events.raiseEvent("windowresized", ev);
    }
};


(function() {
    document.addEventListener('keydown', People.RecentActivity.UI.Core.EventManager._onDocumentKeyDown);
    window.addEventListener('online', People.RecentActivity.UI.Core.EventManager._onWindowOnline);
    window.addEventListener('offline', People.RecentActivity.UI.Core.EventManager._onWindowOffline);
    window.addEventListener('resize', People.RecentActivity.UI.Core.EventManager._onWindowResized);
    People.RecentActivity.UI.Core.EventManager._windowHeight = window.innerHeight;
    People.RecentActivity.UI.Core.EventManager._windowWidth = window.innerWidth;
})();
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.AnimationHelper = function() {
    /// <summary>
    ///     Provides helper methods for animations.
    /// </summary>
};

People.RecentActivity.UI.Core.AnimationHelper.transitionContent = function(incoming, outgoing) {
    /// <summary>
    ///     Performs an outgoing and incoming animation.
    /// </summary>
    /// <param name="incoming" type="HTMLElement">The incoming element.</param>
    /// <param name="outgoing" type="HTMLElement">The outgoing element.</param>
    /// <returns type="WinJS.Promise"></returns>
    Debug.assert((incoming != null) || (outgoing != null), 'incoming != null || outgoing != null');
    if (outgoing != null) {
        // there is outgoing content, so do the exitContent animation first.
        var promise = People.Animation.exitContent(outgoing);
        promise.then(function() {
            if (incoming != null) {
                return People.Animation.enterContent(incoming);
            }

            return null;
        });
        return promise;
    }
    else if (incoming != null) {
        return People.Animation.enterContent(incoming);
    }

    return null;
};

People.RecentActivity.UI.Core.AnimationHelper.crossFadeContent = function(incoming, outgoing) {
    /// <summary>
    ///     Cross-fades content.
    /// </summary>
    /// <param name="incoming" type="HTMLElement">The incoming content.</param>
    /// <param name="outgoing" type="HTMLElement">The outgoing content.</param>
    /// <returns type="WinJS.Promise"></returns>
    Debug.assert((incoming != null) || (outgoing != null), 'incoming != null || outgoing != null');
    if (incoming != null) {
        // make sure incoming has an opacity of 0
        incoming.style.opacity = '0';
    }

    if (outgoing != null) {
        var promise = People.Animation.fadeOut(outgoing);
        promise.then(function() {
            if (incoming != null) {
                return People.Animation.fadeIn(incoming);
            }

            return null;
        });
        return promise;
    }
    else if (incoming != null) {
        return People.Animation.fadeIn(incoming);
    }

    return null;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.AriaHelper = function() {
    /// <summary>
    ///     Provides helper methods for ARIA.
    /// </summary>
};

People.RecentActivity.UI.Core.AriaHelper.setExpanded = function(element, expanded) {
    /// <summary>
    ///     Sets whether an element is expanded, or whether an another element it controls has been expanded (such as a menu.)
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="expanded" type="Boolean">Whether the element is expanded.</param>
    Debug.assert(element != null, 'element != null');

    element.setAttribute('aria-expanded', expanded);
};

People.RecentActivity.UI.Core.AriaHelper.setSetSize = function(element, size) {
    /// <summary>
    ///     Sets the set size.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="size" type="Number" integer="true">The size.</param>
    Debug.assert(element != null, 'element != null');

    if (size < 0) {
        element.removeAttribute('aria-setsize');
    }
    else {
        element.setAttribute('aria-setsize', size);
    }
};

People.RecentActivity.UI.Core.AriaHelper.setPositionInSet = function(element, pos) {
    /// <summary>
    ///     Sets the set size.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="pos" type="Number" integer="true">The position.</param>
    Debug.assert(element != null, 'element != null');

    if (pos < 0) {
        element.removeAttribute('aria-posinset');
    }
    else {
        element.setAttribute('aria-posinset', pos);
    }
};

People.RecentActivity.UI.Core.AriaHelper.setFlowTo = function(element, flowTo) {
    /// <summary>
    ///     Sets the flow-to of an element.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="flowTo" type="String">The ID of the element to flow to.</param>
    Debug.assert(element != null, 'element != null');

    element.setAttribute('aria-flowto', flowTo);
};

People.RecentActivity.UI.Core.AriaHelper.setFlowFrom = function(element, flowFrom) {
    /// <summary>
    ///     Sets the flow-from of an element.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="flowFrom" type="String">The ID of the element to flow from.</param>
    Debug.assert(element != null, 'element');

    element.setAttribute('x-ms-aria-flowfrom', flowFrom);
};

People.RecentActivity.UI.Core.AriaHelper.getLabel = function(element) {
    /// <summary>
    ///     Gets the label of an element.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <returns type="String"></returns>
    Debug.assert(element != null, 'element != null');

    var label = element.getAttribute('aria-label');
    if (!Jx.isNonEmptyString(label)) {
        // normalize empty strings to "null".
        return null;
    }

    return label;
};

People.RecentActivity.UI.Core.AriaHelper.setLabel = function(element, label) {
    /// <summary>
    ///     Sets the label of an element.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="label" type="String">The label.</param>
    Debug.assert(element != null, 'element != null');

    element.setAttribute('aria-label', label);
};

People.RecentActivity.UI.Core.AriaHelper.getLabelledBy = function(element) {
    /// <summary>
    ///     Gets the labelled-by of an element.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <returns type="String"></returns>
    Debug.assert(element != null, 'element != null');

    var label = element.getAttribute('aria-labelledby');
    if (!Jx.isNonEmptyString(label)) {
        // normalize empty strings to "null".
        return null;
    }

    return label;
};

People.RecentActivity.UI.Core.AriaHelper.setLabelledBy = function(element, labelledBy) {
    /// <summary>
    ///     Sets the labelled-by value of an element.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="labelledBy" type="String">The ID of an another element.</param>
    Debug.assert(element != null, 'element != null');

    element.setAttribute('aria-labelledby', labelledBy);
};

People.RecentActivity.UI.Core.AriaHelper.getRole = function(element) {
    /// <summary>
    ///     Gets the role of an element.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <returns type="String"></returns>
    Debug.assert(element != null, 'element != null');

    var role = element.getAttribute('role');
    if (!Jx.isNonEmptyString(role)) {
        // normalize an empty string to "null".
        return null;
    }

    return role;
};

People.RecentActivity.UI.Core.AriaHelper.setRole = function(element, role) {
    /// <summary>
    ///     Sets the role of an element.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="role" type="String">The role.</param>
    Debug.assert(element != null, 'element != null');

    element.setAttribute('role', role);
};

People.RecentActivity.UI.Core.AriaHelper.getHidden = function(element) {
    /// <summary>
    ///     Gets a value indicating whether the element is hidden.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <returns type="Boolean"></returns>
    Debug.assert(element != null, 'element != null');

    return People.RecentActivity.UI.Core.AriaHelper._getBoolProperty(element, 'aria-hidden');
};

People.RecentActivity.UI.Core.AriaHelper.setHidden = function(element, hidden) {
    /// <summary>
    ///     Sets whether the element is hidden.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="hidden" type="Boolean">Whether the element is hidden.</param>
    Debug.assert(element != null, 'element != null');

    if (hidden) {
        element.setAttribute('aria-hidden', hidden);
    }
    else {
        element.removeAttribute('aria-hidden');
    }
};

People.RecentActivity.UI.Core.AriaHelper.getIsDisabled = function(element) {
    /// <summary>
    ///     Gets whether the element is disabled.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <returns type="Boolean"></returns>
    Debug.assert(element != null, 'element != null');

    return People.RecentActivity.UI.Core.AriaHelper._getBoolProperty(element, 'aria-disabled');
};

People.RecentActivity.UI.Core.AriaHelper.setIsDisabled = function(element, disabled) {
    /// <summary>
    ///     Sets whether the element is disabled.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="disabled" type="Boolean">Whether the element is disabled.</param>
    Debug.assert(element != null, 'element != null');

    element.setAttribute('aria-disabled', disabled);
};

People.RecentActivity.UI.Core.AriaHelper.setOwns = function(element, owns) {
    /// <summary>
    ///     Sets the owns property of an element.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="owns" type="String">The ID of an another element.</param>
    Debug.assert(element != null, 'element != null');

    if (Jx.isNonEmptyString(owns)) {
        element.setAttribute('aria-owns', owns);
    }
    else {
        element.removeAttribute('aria-owns');
    }
};

People.RecentActivity.UI.Core.AriaHelper.setHasPopup = function(element, hasPopup) {
    /// <summary>
    ///     Sets whether the element has a popup.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="hasPopup" type="Boolean">Whether the element has a popup.</param>
    Debug.assert(element != null, 'element != null');

    element.setAttribute('aria-haspopup', hasPopup);
};

People.RecentActivity.UI.Core.AriaHelper._getBoolProperty = function(element, prop) {
    /// <summary>
    ///     Gets the value of a property as a boolean.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="prop" type="String">The name of the property.</param>
    /// <returns type="Boolean"></returns>
    Debug.assert(element != null, 'element != null');
    Debug.assert(Jx.isNonEmptyString(prop), '!string.IsNullOrEmpty(prop)');

    var value = element.getAttribute(prop);
    if (value == null) {
        return false;
    }

    return Boolean.parse(value);
};

People.RecentActivity.UI.Core.AriaHelper._getIntProperty = function(element, prop) {
    /// <summary>
    ///     Gets the value of a property as an integer.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="prop" type="String">The property.</param>
    /// <returns type="Number" integer="true"></returns>
    Debug.assert(element != null, 'element != null');
    Debug.assert(Jx.isNonEmptyString(prop), '!string.IsNullOrEmpty(prop)');

    var value = element.getAttribute(prop);
    if (value == null) {
        return -1;
    }

    return parseInt(value);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Controls\Control.js" />
/// <reference path="AriaHelper.js" />

People.RecentActivity.UI.Core.HtmlHelper = function() {
    /// <summary>
    ///     Provides some basic helpers for HTML fragments.
    /// </summary>
    /// <field name="_rootImageRegEx" type="RegExp" static="true">The root path regular expression for images.</field>
    /// <field name="_rootImagePath" type="String" static="true">The root path for images.</field>
    /// <field name="_clickTargetRegex" type="RegExp" static="true">The regular expression used to find click targets.</field>
    /// <field name="_pixelRegex" type="RegExp" static="true">The regular epxression used to check for pixel values.</field>
    /// <field name="_nodes" type="Object" static="true">The cached nodes.</field>
};


People.RecentActivity.UI.Core.HtmlHelper._rootImageRegEx = new RegExp('~/images/', 'gi');
People.RecentActivity.UI.Core.HtmlHelper._rootImagePath = Include.replacePaths('$(imageResources)/');
People.RecentActivity.UI.Core.HtmlHelper._clickTargetRegex = new RegExp('(ra-contact|ra-handle|ra-link|ic-name|ic-tile)', 'i');
People.RecentActivity.UI.Core.HtmlHelper._pixelRegex = new RegExp('^-?\\d+(\\.\\d+)?px$', 'i');
People.RecentActivity.UI.Core.HtmlHelper._nodes = {};

Object.defineProperty(People.RecentActivity.UI.Core.HtmlHelper, "isLeftToRight", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the document is in LTR mode.
        /// </summary>
        /// <value type="Boolean"></value>
        return !People.RecentActivity.UI.Core.HtmlHelper.isRightToLeft;
    }
});

Object.defineProperty(People.RecentActivity.UI.Core.HtmlHelper, "isRightToLeft", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the document is in RTL mode.
        /// </summary>
        /// <value type="Boolean"></value>
        return People.RecentActivity.UI.Core.HtmlHelper.getDirection() === 'rtl';
    }
});

People.RecentActivity.UI.Core.HtmlHelper.createElement = function(html) {
    /// <summary>
    ///     Creates an element from the HTML fragment.
    /// </summary>
    /// <param name="html" type="String">The HTML fragment.</param>
    /// <returns type="HTMLElement"></returns>
    Debug.assert(html != null, 'html != null');
    if (!!Jx.isUndefined(People.RecentActivity.UI.Core.HtmlHelper._nodes[html])) {
        // create a new node for this blob of HTML.
        var container = document.createElement('div');
        container.innerHTML = html.replace(People.RecentActivity.UI.Core.HtmlHelper._rootImageRegEx, People.RecentActivity.UI.Core.HtmlHelper._rootImagePath);
        var element = container.children[0];
        container.removeChild(element);
        // cache the element.
        People.RecentActivity.UI.Core.HtmlHelper._nodes[html] = element;
    }

    // return a cloned node of an existing cached copy.
    return People.RecentActivity.UI.Core.HtmlHelper._nodes[html].cloneNode(true);
};

People.RecentActivity.UI.Core.HtmlHelper.findElementById = function(element, id) {
    /// <summary>
    ///     Finds an element by ID.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element to search.</param>
    /// <param name="id" type="String">The ID of the element to find.</param>
    /// <returns type="HTMLElement"></returns>
    Debug.assert(element != null, 'element != null');
    Debug.assert(Jx.isNonEmptyString(id), '!string.IsNullOrEmpty(id)');
    return element.querySelector('#' + id);
};

People.RecentActivity.UI.Core.HtmlHelper.findElementByClass = function(element, className) {
    /// <summary>
    ///     Finds an element by class.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element to search.</param>
    /// <param name="className" type="String">The class name of the element to find.</param>
    /// <returns type="HTMLElement"></returns>
    Debug.assert(element != null, 'element != null');
    Debug.assert(Jx.isNonEmptyString(className), '!string.IsNullOrEmpty(className)');
    return element.querySelector('.' + className);
};

People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById = function(element, id) {
    /// <summary>
    ///     Finds a control by ID. If no <see cref="T:People.RecentActivity.UI.Core.Control" /> has been created yet,
    ///     a new <see cref="T:People.RecentActivity.UI.Core.Control" /> instance will be initialized.
    /// </summary>
    /// <param name="element" type="HTMLElement">The parent element.</param>
    /// <param name="id" type="String">The Id of the control.</param>
    /// <returns type="People.RecentActivity.UI.Core.Control"></returns>
    Debug.assert(element != null, 'element != null');
    Debug.assert(Jx.isNonEmptyString(id), '!string.IsNullOrEmpty(id)');
    var child = People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, id);
    if (child != null) {
        return People.RecentActivity.UI.Core.Control.fromElement(child);
    }

    return null;
};

People.RecentActivity.UI.Core.HtmlHelper.resolvePath = function(path) {
    /// <summary>
    ///     Resolves a path.
    /// </summary>
    /// <param name="path" type="String">The path to resolve.</param>
    /// <returns type="String"></returns>
    Debug.assert(Jx.isNonEmptyString(path), '!string.IsNullOrEmpty(path)');
    return path.replace(People.RecentActivity.UI.Core.HtmlHelper._rootImageRegEx, People.RecentActivity.UI.Core.HtmlHelper._rootImagePath);
};

People.RecentActivity.UI.Core.HtmlHelper.isClickTarget = function(element) {
    /// <summary>
    ///     Gets a value indicating whether the given element is a click target.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <returns type="Boolean"></returns>
    Debug.assert(element != null, 'element != null');
    if (element.nodeType === 1) {
        // check for certain tag names
        var tagName = element.tagName;
        if ((tagName === 'A') || (tagName === 'BUTTON') || (tagName === 'INPUT')) {
            return true;
        }

        // check for the role of the element.
        var role = People.RecentActivity.UI.Core.AriaHelper.getRole(element);
        if ((role === 'button') || (role === 'link')) {
            return true;
        }

        // check for other targets based on the class name.
        return People.RecentActivity.UI.Core.HtmlHelper._clickTargetRegex.test(element.className);
    }

    return false;
};

People.RecentActivity.UI.Core.HtmlHelper.snapToLineHeight = function(element, height) {
    /// <summary>
    ///     Snaps the height to the line-height of the element, always returning a rounded-up value.
    ///     That is, if line-height is 20px and height is 50px, the returned value will be 60px (ceil(50 / 20) * 20).
    /// </summary>
    /// <param name="element" type="HTMLElement">The element to snap to.</param>
    /// <param name="height" type="Number">The height.</param>
    /// <returns type="Number"></returns>
    Debug.assert(element != null, 'element');
    var style = element.currentStyle;
    var lineHeight = People.RecentActivity.UI.Core.HtmlHelper.convertToPixels(element, style.lineHeight);
    var lines = Math.ceil(height / lineHeight);
    return lines * lineHeight;
};

People.RecentActivity.UI.Core.HtmlHelper.getVerticalMargin = function(element) {
    /// <summary>
    ///     Gets the vertical margins.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <returns type="Number"></returns>
    Debug.assert(element != null, 'element');
    var currentStyle = element.currentStyle;
    return People.RecentActivity.UI.Core.HtmlHelper.convertToPixels(element, currentStyle.marginTop) + People.RecentActivity.UI.Core.HtmlHelper.convertToPixels(element, currentStyle.marginBottom);
};

People.RecentActivity.UI.Core.HtmlHelper.getHorizonalMargin = function(element) {
    /// <summary>
    ///     Gets the horizonal margin of an element.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <returns type="Number"></returns>
    Debug.assert(element != null, 'element');
    var currentStyle = element.currentStyle;
    return People.RecentActivity.UI.Core.HtmlHelper.convertToPixels(element, currentStyle.marginLeft) + People.RecentActivity.UI.Core.HtmlHelper.convertToPixels(element, currentStyle.marginRight);
};

People.RecentActivity.UI.Core.HtmlHelper.getVerticalPadding = function(element) {
    /// <summary>
    ///     Gets the vertical padding.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <returns type="Number"></returns>
    Debug.assert(element != null, 'element');
    var currentStyle = element.currentStyle;
    return People.RecentActivity.UI.Core.HtmlHelper.convertToPixels(element, currentStyle.paddingTop) + People.RecentActivity.UI.Core.HtmlHelper.convertToPixels(element, currentStyle.paddingBottom);
};

People.RecentActivity.UI.Core.HtmlHelper.getHorizontalPadding = function(element) {
    /// <summary>
    ///     Gets the horizontal padding.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <returns type="Number"></returns>
    Debug.assert(element != null, 'element');
    var currentStyle = element.currentStyle;
    return People.RecentActivity.UI.Core.HtmlHelper.convertToPixels(element, currentStyle.paddingLeft) + People.RecentActivity.UI.Core.HtmlHelper.convertToPixels(element, currentStyle.paddingRight);
};

People.RecentActivity.UI.Core.HtmlHelper.getDirection = function() {
    /// <summary>
    ///     Gets the direction of the document.
    /// </summary>
    /// <returns type="String"></returns>
    return window.getComputedStyle(document.body).direction;
};

People.RecentActivity.UI.Core.HtmlHelper.getTotalScrollHeight = function(element) {
    /// <summary>
    ///     Gets the total scroll height.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <returns type="Number"></returns>
    Debug.assert(element != null, 'element != null');
    var currentStyle = element.currentStyle;
    return element.scrollHeight + People.RecentActivity.UI.Core.HtmlHelper.convertToPixels(element, currentStyle.marginTop) + People.RecentActivity.UI.Core.HtmlHelper.convertToPixels(element, currentStyle.marginBottom);
};

People.RecentActivity.UI.Core.HtmlHelper.convertToPixels = function(element, value) {
    /// <summary>
    ///     Converts the given value into pixels, taking into account that some CSS values
    ///     may represent floating point numbers.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="value" type="String">The value.</param>
    /// <returns type="Number"></returns>
    Debug.assert(element != null, 'element != null');
    if (!Jx.isNonEmptyString(value)) {
        return 0;
    }

    if (People.RecentActivity.UI.Core.HtmlHelper._pixelRegex.test(value)) {
        // this is a pixel value, so we can just parse it right away.
        return parseFloat(value);
    }
    else {
        // fall back to the WinJS helper function, which does the right thing by converting em, ex, etc. to pixels.
        return WinJS.Utilities.convertToPixels(element, value);
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\NetworkId.js" />
/// <reference path="..\..\..\Model\Configuration.js" />

People.RecentActivity.UI.Core.LinkHelper = function() {
    /// <summary>
    ///     Methods to help when working with links.
    /// </summary>
    /// <field name="_twitterShortLinkNoSchemeLength" type="Number" integer="true" static="true">The length of a Twitter short link without the scheme (e.g. no "http").</field>
    /// <field name="_twitterLinkMatch" type="RegExp" static="true">The regular expression used to match valid Twitter links.</field>
};


People.RecentActivity.UI.Core.LinkHelper._twitterShortLinkNoSchemeLength = 18;
People.RecentActivity.UI.Core.LinkHelper._twitterLinkMatch = new RegExp("(^|[^/!@=#])((https?)://[^\\s!_()<>/]+\\.[A-Z]{2,}(--[A-Z0-9]+)?(?:(?:/(?:\\([^&`!()[\\]{};:'\",<>?\u00ab\u00bb\u201c\u201d\u2018\u2019\\s]*\\)|[^&`!()[\\]{};:'\",<>?\u00ab\u00bb\u201c\u201d\u2018\u2019\\s]*/|[^@&`!()[\\]{};:'\",<>?\u00ab\u00bb\u201c\u201d\u2018\u2019\\s])*(?:\\([^&`!()[\\]{};:'\",<>?\u00ab\u00bb\u201c\u201d\u2018\u2019\\s]*\\)|[^&`!()[\\]{};:'\",<>?\u00ab\u00bb\u201c\u201d\u2018\u2019\\s]*/|[^@&`!()[\\]{};:'\".,<>?\u00ab\u00bb\u201c\u201d\u2018\u2019\\s]))|/)?(?:\\?(?:\\([^`!()[\\]{};:'\",<>?\u00ab\u00bb\u201c\u201d\u2018\u2019\\s]*\\)|[^`!()[\\]{};:'\",<>?\u00ab\u00bb\u201c\u201d\u2018\u2019\\s])*(?:\\([^`!()[\\]{};:'\",<>?\u00ab\u00bb\u201c\u201d\u2018\u2019\\s]*\\)|[^`!()[\\]{};:'\".,<>?\u00ab\u00bb\u201c\u201d\u2018\u2019\\s]))?)", 'gi');

People.RecentActivity.UI.Core.LinkHelper.calculateContentLength = function(text, sourceId) {
    /// <summary>
    ///     Get the content length for a given network.
    /// </summary>
    /// <param name="text" type="String">The text content.</param>
    /// <param name="sourceId" type="String">The network source ID.</param>
    /// <returns type="Number" integer="true"></returns>
    text = text.trim();
    switch (sourceId) {
        case People.RecentActivity.Core.NetworkId.twitter:
            return People.RecentActivity.UI.Core.LinkHelper._calculateTwitterCharacterCount(text);
        default:
            return text.length;
    }
};

People.RecentActivity.UI.Core.LinkHelper.isVideoLink = function(url) {
    /// <summary>
    ///     Determine whether a given URL is a link to a video.
    /// </summary>
    /// <param name="url" type="String">The URL to test.</param>
    /// <returns type="Boolean"></returns>
    var videoTransforms = People.RecentActivity.Configuration.videoUrlTransforms;
    for (var n = 0; n < videoTransforms.length; n++) {
        var transform = videoTransforms[n];
        if (transform.isMatch(url)) {
            return true;
        }    
    }

    return false;
};

People.RecentActivity.UI.Core.LinkHelper._calculateTwitterCharacterCount = function(text) {
    /// <summary>
    ///     Calculates the length of a Twitter post taking link shortening into account.
    /// </summary>
    /// <param name="text" type="String">The text of the message.</param>
    /// <returns type="Number" integer="true"></returns>
    var count = text.length;
    var match;
    while ((match = People.RecentActivity.UI.Core.LinkHelper._twitterLinkMatch.exec(text)) != null) {
        var link = match[2];
        var scheme = match[3];
        count -= link.length - (scheme.length + 18);
    }

    return count;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\..\..\Core\Helpers\DateTimeHelper.js" />

People.RecentActivity.UI.Core.LocalizationHelper = function() {
    /// <summary>
    ///     Provides a helper for localization.
    /// </summary>
    /// <field name="_dayOfWeekFormatter" type="Windows.Globalization.DateTimeFormatting.DateTimeFormatter" static="true">Provides a formatter for the day of the week.</field>
};


People.RecentActivity.UI.Core.LocalizationHelper._dayOfWeekFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter(0, 0, 0, 1);

People.RecentActivity.UI.Core.LocalizationHelper.getCountString = function(idZero, idOne, idMany, count) {
    /// <summary>
    ///     Gets a string with a formatted number. The string returned depends on the value
    ///     of the number. Distinguishes between "one", "many" and "zero".
    /// </summary>
    /// <param name="idZero" type="String">The ID of the string for <c>count == 0</c></param>
    /// <param name="idOne" type="String">The ID of the string for <c>count == 1</c></param>
    /// <param name="idMany" type="String">The ID of the string for <c>count &gt;= 2</c></param>
    /// <param name="count" type="Number" integer="true">The count.</param>
    /// <returns type="String"></returns>
    var id = null;
    switch (count) {
        case 0:
            id = idZero;
            break;
        case 1:
            id = idOne;
            break;
        default:
            id = idMany;
            break;
    }

    if (Jx.isNonEmptyString(id)) {
        return Jx.res.loadCompoundString(id, count);
    }

    return '';
};

People.RecentActivity.UI.Core.LocalizationHelper.isRelativeTimestamp = function(timestamp) {
    /// <summary>
    ///     Gets a value indicating whether the string returned by <see cref="M:People.RecentActivity.UI.Core.LocalizationHelper.GetTimeString(System.Date)" />
    ///     for <c>timestamp</c> is a relative textual representation or not.
    /// </summary>
    /// <param name="timestamp" type="Date">The timestamp.</param>
    /// <returns type="Boolean"></returns>
    var now = new Date();
    return (now.getDate() === timestamp.getDate()) && (now.getMonth() === timestamp.getMonth()) && (now.getFullYear() === timestamp.getFullYear());
};

People.RecentActivity.UI.Core.LocalizationHelper.getTimeString = function(timestamp) {
    /// <summary>
    ///     Gets a string representing the amount of time that has elapsed since the
    ///     given <see cref="T:System.Date" />. For example, "3 hours ago".
    /// </summary>
    /// <param name="timestamp" type="Date">The timestamp.</param>
    /// <returns type="String"></returns>
    var loc = Jx.res;
    // figure out if this was before or after midnight of today.
    var now = new Date();
    if ((now.getDate() !== timestamp.getDate()) || (now.getMonth() !== timestamp.getMonth()) || (now.getFullYear() !== timestamp.getFullYear())) {
        // check if this was yesterday, or more than a week ago.
        // this results in milliseconds, then divide by 1000 for seconds, and 86400 to get # of days.
        var diff = Math.ceil((now.getTime() - timestamp.getTime()) / (1000 * 86400));
        if (diff <= 6) {
            // this was posted on a day of the past week.
            return People.RecentActivity.UI.Core.LocalizationHelper._dayOfWeekFormatter.format(timestamp);
        }
        else {
            // this was posted way, way ago.
            return Windows.Globalization.DateTimeFormatting.DateTimeFormatter.shortDate.format(timestamp);
        }

    }
    else {
        // this is today, so use our normal logic for showing "a moment ago", etc.
        var seconds = People.RecentActivity.Core.DateTimeHelper.subtract(new Date(), timestamp) / 1000;
        if (seconds < 120) {
            // "about a minute ago".
            return loc.getString('/strings/raTimeMinuteAgo');
        }
        else {
            var minutes = Math.floor(seconds / 60);
            if (minutes < 60) {
                // "x minutes ago"
                return loc.loadCompoundString('/strings/raTimeMinutesAgo', minutes);
            }
            else {
                // "an hour ago", "x hours ago"
                var hours = Math.floor(seconds / 3600);
                if (hours === 1) {
                    return loc.getString('/strings/raTimeHourAgo');
                }
                else {
                    return loc.loadCompoundString('/strings/raTimeHoursAgo', hours);
                }            
            }        
        }    
    }
};

People.RecentActivity.UI.Core.LocalizationHelper.loadCompoundElement = function(stringId, values, tagName) {
    /// <summary>
    ///     Loads a compound element.
    /// </summary>
    /// <param name="stringId" type="String">The ID of the string.</param>
    /// <param name="values" type="Array" elementType="Object" elementDomElement="true">The replacement values.</param>
    /// <param name="tagName" type="String">The tag name of the element to wrap the resource in. Default is <c>span</c>.</param>
    /// <returns type="HTMLElement"></returns>
    Debug.assert(Jx.isNonEmptyString(stringId), '!string.IsNullOrEmpty(stringId)');
    Debug.assert(values != null, 'values != null');
    return People.RecentActivity.UI.Core.LocalizationHelper.loadLiteralCompoundElement(Jx.res.getString(stringId), values, tagName);
};

People.RecentActivity.UI.Core.LocalizationHelper.loadLiteralCompoundElement = function(literal, values, tagName) {
    /// <summary>
    ///     Loads a compound element.
    /// </summary>
    /// <param name="literal" type="String">The string to format.</param>
    /// <param name="values" type="Array" elementType="Object" elementDomElement="true">The replacement values.</param>
    /// <param name="tagName" type="String">The tag name of the element to wrap the resource in. The default is <c>span</c>.</param>
    /// <returns type="HTMLElement"></returns>
    Debug.assert(values != null, 'values != null');
    var fragment = document.createDocumentFragment();
    // find all instances of "one or more % followed by digit(s)"
    var expr = /%+(\d{1,2})/g;
    var result;
    var offset = 0;
    while ((result = expr.exec(literal)) != null) {
        // found the next instance
        var index = result.index;

        // This code helps us do the right thing with %%1 (which shouldn't be replaced).  
        // Any extra preceding % characters are added to the text value and put in the text node.
        var numberOfSpecialCharacter = result[0].lastIndexOf("%") + 1;
        var textToAppend = "";
        // Only perform the replacement if we saw an odd number of %, otherwise we only saw a series of %% followed by a number.
        var performReplacement = ((numberOfSpecialCharacter % 2) === 1);

        if (performReplacement) {
            // Append text that was between the last replacement and the current replacement
            textToAppend = literal.substring(offset, index);

            var numberOfDouble = Math.floor(numberOfSpecialCharacter / 2);
            for (i = 0; i < numberOfDouble ; i++) {
                textToAppend += "%%";
            }
        } else {
            // False alarm, no replacement, add any text that was between the last replacement and the current, plus the current match.
            textToAppend = literal.substring(offset, index + result[0].length);
        }

        // Append any text 
        if (textToAppend.length > 0) {
            // Now that we have the final output, perform the last set of unescapes for %%, etc
            textToAppend = Jx.res.replaceOtherEscapes(textToAppend);
            fragment.appendChild(document.createTextNode(textToAppend));
        }

        // Perform the replacement
        if (performReplacement) {
            var formatter = parseInt(result[1]) - 1;
            fragment.appendChild(values[formatter]);
        }

        // update the offset for our next search.
        offset = index + result[0].length;
    }

    if (offset !== literal.length) {
        // append the last bit of info. perform the last set of unescapes for %%, etc
        var lastText = Jx.res.replaceOtherEscapes(literal.substr(offset));
        fragment.appendChild(document.createTextNode(lastText));
    }

    // finally create a new element out of it.
    if (Jx.isNullOrUndefined(tagName)) {
        tagName = 'span';
    }

    var element = document.createElement(tagName);
    element.appendChild(fragment);
    return element;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.MoCoHelper = function() {
    /// <summary>
    ///     Provides MoCo helpers.
    /// </summary>
};

People.RecentActivity.UI.Core.MoCoHelper.getItem = function(ds, index) {
    /// <summary>
    ///     Invokes an item.
    /// </summary>
    /// <param name="ds" type="WinJS.Binding.List">The data source.</param>
    /// <param name="index" type="Number" integer="true">The index.</param>
    /// <returns type="Object"></returns>
    Debug.assert(ds != null, 'ds != null');
    Debug.assert(index >= 0, 'index != null');

    if (index < ds.length) {
        return ds.getAt(index);
    }

    return null;
};

People.RecentActivity.UI.Core.MoCoHelper.getItemFromEvent = function(ds, details) {
    /// <summary>
    ///     Invokes an item.
    /// </summary>
    /// <param name="ds" type="WinJS.Binding.List">The data source.</param>
    /// <param name="details" type="Object">The event details.</param>
    /// <returns type="Object"></returns>
    Debug.assert(ds != null, 'ds != null');
    Debug.assert(details != null, 'details != null');

    return People.RecentActivity.UI.Core.MoCoHelper.getItem(ds, (details).itemIndex);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.ScrollHelper = function() {
    /// <summary>
    ///     Provides a helper for scrolling.
    /// </summary>
};

People.RecentActivity.UI.Core.ScrollHelper.scrollIntoView = function(element) {
    /// <summary>
    ///     Provides a custom implementation of <c>scrollIntoView</c>, which takes into account
    ///     whether the element is already visible within the viewport.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element to scroll into view.</param>
    Debug.assert(element != null, 'element != null');
    var right = element.offsetLeft + element.offsetWidth;
    var bottom = element.offsetTop + element.offsetHeight;
    // traverse the parents of the element and check whether the element is within view each time.
    var parent = element.parentNode;
    var parentOffset = element.offsetParent;
    while (parent != null) {
        // do the minimum to scroll the element into view. that is, let the right or bottom edge align with the same edge of the parent container.
        // also make sure we don't scroll if the item is already in view. this behavior is different from the DOM scrollIntoView() function.
        var clientHeight = parent.clientHeight;
        var clientWidth = parent.clientWidth;
        if (right > parent.scrollLeft + clientWidth) {
            parent.scrollLeft = right - clientWidth;
        }

        if (bottom > parent.scrollTop + clientHeight) {
            parent.scrollTop = bottom - clientHeight;
        }

        // fetch the new offsets so we can check against the next parent.
        if (parent === parentOffset) {
            // only increase the left/top if this is an offset parent.
            right += parent.offsetLeft;
            bottom += parent.offsetTop;
            parentOffset = parent.offsetParent;
        }

        parent = parent.parentNode;
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Model\FeedObject.js" />
/// <reference path="..\..\..\Model\FeedObjectType.js" />
/// <reference path="..\Navigation\SelfPageAlbumData.js" />
/// <reference path="..\Navigation\SelfPageNavigationData.js" />

People.RecentActivity.UI.Core.SelfPageNavigationHelper = function() {
    /// <summary>
    ///     Provides helpers for navigating to self pages.
    /// </summary>
};

People.RecentActivity.UI.Core.SelfPageNavigationHelper.getNavigateUrl = function(id, data) {
    /// <summary>
    ///     Gets the navigate URL.
    /// </summary>
    /// <param name="id" type="String">The ID.</param>
    /// <param name="data" type="People.RecentActivity.UI.Core.selfPageNavigationData">The data.</param>
    /// <returns type="String"></returns>
    return People.Nav.getRASelfpageUri(id, data);
};

People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigate = function(id, data) {
    /// <summary>
    ///     Navigates to a self page.
    /// </summary>
    /// <param name="id" type="String">The ID of the person.</param>
    /// <param name="data" type="People.RecentActivity.UI.Core.selfPageNavigationData">The data.</param>
    People.Nav.navigate(People.Nav.getRASelfpageUri(id, data));
};

People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigateBack = function() {
    /// <summary>
    ///     Navigates back to the previous page.
    /// </summary>
    if (People.Nav.canGoBack()) {
        People.Nav.back();
    }
    else {
        // navigate back to "Home".
        People.Nav.navigate(People.Nav.getViewAddressBookUri(null));
    }
};

People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigateToObject = function(obj, info, isCommentScenario, isParentScenario) {
    /// <summary>
    ///     Navigates to the self-page of the given object.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
    /// <param name="info" type="Object">The info.</param>
    /// <param name="isCommentScenario" type="Boolean">Whether this is a comment scenario (i.e. focus should be set on the comment input box).</param>
    /// <param name="isParentScenario" type="Boolean">Whether we're navigating to the parent of the object. <c>obj</c> MUST be a feed entry.</param>
    Debug.assert(obj != null, 'obj');
    Debug.assert(!isParentScenario || (obj.objectType === People.RecentActivity.FeedObjectType.entry), 'obj.Type != Entry');
    var network = obj.network;
    var identity = network.identity;
    var data = People.RecentActivity.UI.Core.create_selfPageNavigationData(obj.sourceId, People.RecentActivity.UI.Core.SelfPageNavigationHelper._getObjectId(obj, isParentScenario), (obj.objectType).toString());
    if (identity.isTemporary) {
        // this is an item for a temporary person, so pass that along as well.
        data.temporaryContact = identity.getDataContext();
    }

    if (info == null) {
        // attempt to get some extra info.
        info = People.RecentActivity.UI.Core.SelfPageNavigationHelper._getObjectData(obj);
    }

    data.data = info;
    data.fallbackUrl = obj.url;
    data.isCommentScenario = isCommentScenario;
    data.isWhatsNew = identity.isWhatsNew;
    People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigate((identity.isWhatsNew || identity.isTemporary) ? network.user.personId : identity.id, data);
};

People.RecentActivity.UI.Core.SelfPageNavigationHelper._getObjectData = function(obj) {
    /// <param name="obj" type="People.RecentActivity.FeedObject"></param>
    /// <returns type="Object"></returns>
    Debug.assert(obj != null, 'obj');
    switch (obj.objectType) {
        case People.RecentActivity.FeedObjectType.photo:
            // when going to a photo, we need to indicate we need to jump into the one-up experience.
            return People.RecentActivity.UI.Core.create_selfPageAlbumData(true, (obj).id);
    }

    return null;
};

People.RecentActivity.UI.Core.SelfPageNavigationHelper._getObjectId = function(obj, isParentScenario) {
    /// <param name="obj" type="People.RecentActivity.FeedObject"></param>
    /// <param name="isParentScenario" type="Boolean"></param>
    /// <returns type="String"></returns>
    Debug.assert(obj != null, 'obj');
    switch (obj.objectType) {
        case People.RecentActivity.FeedObjectType.entry:
            return (isParentScenario) ? (obj).parentId : obj.id;
        case People.RecentActivity.FeedObjectType.photo:
            return (obj).album.albumId;
        case People.RecentActivity.FeedObjectType.photoAlbum:
            return (obj).albumId;
    }

    return obj.id;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.UriHelper = function() {
    /// <summary>
    ///     Provides a helper for URIs.
    /// </summary>
};

People.RecentActivity.UI.Core.UriHelper.launchUri = function(uri) {
    /// <summary>
    ///     Launches the URI in the default browser.
    /// </summary>
    /// <param name="uri" type="String">The URI to launch.</param>
    Debug.assert(Jx.isNonEmptyString(uri), '!string.IsNullOrEmpty(uri)');
    try {
        // attempt to launch the URI.
        Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(uri)).then();
    }
    catch (ex) {
        // we failed to open the URI -- this usually means the URI we got was invalid
        Jx.log.write(2, "Failed to open URI: '" + uri + "' -- Exception: " + ex.toString());
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.InputManager = function() {
    /// <summary>
    ///     Provides an input manager.
    /// </summary>
    /// <field name="_inputPane" type="Windows.UI.ViewManagement.InputPane">The input pane.</field>
    /// <field name="_inputPaneShowingHandler" type="Windows.UI.ViewManagement.Function">The handler for the "show soft keyboard" event.</field>
    /// <field name="_inputPaneHidingHandler" type="Windows.UI.ViewManagement.Function">The handler for the "hide soft keyboard" event.</field>
    // listen for events about the soft keyboard. if it comes up the whole content needs to move.
    this._inputPaneShowingHandler = this._onInputPaneShowing.bind(this);
    this._inputPaneHidingHandler = this._onInputPaneHiding.bind(this);
    this._inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView();
    this._inputPane.addEventListener('hiding', this._inputPaneHidingHandler);
    this._inputPane.addEventListener('showing', this._inputPaneShowingHandler);
};

Jx.mix(People.RecentActivity.UI.Core.InputManager.prototype, Jx.Events);
Jx.mix(People.RecentActivity.UI.Core.InputManager.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.UI.Core.InputManager.prototype, "showing", "hiding");

People.RecentActivity.UI.Core.InputManager.prototype._inputPane = null;
People.RecentActivity.UI.Core.InputManager.prototype._inputPaneShowingHandler = null;
People.RecentActivity.UI.Core.InputManager.prototype._inputPaneHidingHandler = null;

People.RecentActivity.UI.Core.InputManager.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    if (this._inputPane != null) {
        if (this._inputPaneHidingHandler != null) {
            this._inputPane.removeEventListener('hiding', this._inputPaneHidingHandler);
            this._inputPaneHidingHandler = null;
        }

        if (this._inputPaneShowingHandler != null) {
            this._inputPane.removeEventListener('showing', this._inputPaneShowingHandler);
            this._inputPaneShowingHandler = null;
        }

        this._inputPane = null;
    }
};

People.RecentActivity.UI.Core.InputManager.prototype._onInputPaneShowing = function(e) {
    /// <summary>
    ///     Handles the <see cref="T:Windows.UI.ViewManagement.InputPane" /> "showing" event.
    /// </summary>
    /// <param name="e" type="Windows.UI.ViewManagement.InputPaneEvent">The event arguments.</param>
    Debug.assert(e != null, 'e != null');
    this.raiseEvent("showing", e);
};

People.RecentActivity.UI.Core.InputManager.prototype._onInputPaneHiding = function(e) {
    /// <summary>
    ///     Handles the <see cref="T:Windows.UI.ViewManagement.InputPane" /> "hiding" event.
    /// </summary>
    /// <param name="e" type="Windows.UI.ViewManagement.InputPaneEvent">The event arguments.</param>
    Debug.assert(e != null, 'e != null');
    this.raiseEvent("hiding", e);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="EventManager.js" />

People.RecentActivity.UI.Core.KeyboardRefresher = function() {
    /// <summary>
    ///     Provides capability to refresh controls using keyboard.
    /// </summary>
    /// <field name="_controls" type="Array" static="true">The controls.</field>
};


People.RecentActivity.UI.Core.KeyboardRefresher._controls = [];

People.RecentActivity.UI.Core.KeyboardRefresher.addControl = function(control) {
    /// <summary>
    ///     Adds a control to listen for keyboard refresh.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Core.IKeyboardRefreshable">The control.</param>
    Debug.assert(control != null, 'control != null');
    if (People.RecentActivity.UI.Core.KeyboardRefresher._controls.indexOf(control) === -1) {
        People.RecentActivity.UI.Core.KeyboardRefresher._controls.push(control);
        if (People.RecentActivity.UI.Core.KeyboardRefresher._controls.length === 1) {
            People.RecentActivity.UI.Core.EventManager.events.addListener("documentkeydown", People.RecentActivity.UI.Core.KeyboardRefresher._onKeyDown);
        }    
    }
};

People.RecentActivity.UI.Core.KeyboardRefresher.removeControl = function(control) {
    /// <summary>
    ///     Removes a control to listen for keyboard refresh.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Core.IKeyboardRefreshable">The control.</param>
    Debug.assert(control != null, 'control != null');
    var index = People.RecentActivity.UI.Core.KeyboardRefresher._controls.indexOf(control);
    if (index !== -1) {
        People.RecentActivity.UI.Core.KeyboardRefresher._controls.splice(index, 1);
        if (!People.RecentActivity.UI.Core.KeyboardRefresher._controls.length) {
            People.RecentActivity.UI.Core.EventManager.events.removeListenerSafe("documentkeydown", People.RecentActivity.UI.Core.KeyboardRefresher._onKeyDown);
        }    
    }
};

People.RecentActivity.UI.Core.KeyboardRefresher._onKeyDown = function(ev) {
    /// <param name="ev" type="Event"></param>
    switch (ev.keyCode) {
        case WinJS.Utilities.Key.F5:
            for (var n = 0; n < People.RecentActivity.UI.Core.KeyboardRefresher._controls.length; n++) {
                var control = People.RecentActivity.UI.Core.KeyboardRefresher._controls[n];
                control.refresh();
            }

            break;
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Core.EventListener = function(element) {
    /// <summary>
    ///     Provides a simple event listener.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <field name="_element" type="HTMLElement">The element.</field>
    /// <field name="_handlers" type="Object">The list of handlers.</field>
    Debug.assert(element != null, 'element != null');
    this._element = element;
    this._handlers = {};
};


People.RecentActivity.UI.Core.EventListener.prototype._element = null;
People.RecentActivity.UI.Core.EventListener.prototype._handlers = null;

People.RecentActivity.UI.Core.EventListener.prototype.attach = function(ev, handler) {
    /// <summary>
    ///     Attaches an event handler.
    /// </summary>
    /// <param name="ev" type="String">The name of the event.</param>
    /// <param name="handler" type="Function">The event handler.</param>
    Debug.assert(Jx.isNonEmptyString(ev), '!string.IsNullOrEmpty(ev)');
    Debug.assert(handler != null, 'handler != null');
    this._element.addEventListener(ev, handler, false);
    this._handlers[ev] = handler;
};

People.RecentActivity.UI.Core.EventListener.prototype.detach = function(ev) {
    /// <summary>
    ///     Detaches an event handler.
    /// </summary>
    /// <param name="ev" type="String">The name of the event.</param>
    Debug.assert(Jx.isNonEmptyString(ev), '!string.IsNullOrEmpty(ev)');
    if (!Jx.isUndefined(this._handlers[ev])) {
        this._element.removeEventListener(ev, this._handlers[ev], false);
        delete this._handlers[ev];
    }
};

People.RecentActivity.UI.Core.EventListener.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    for (var k in this._handlers) {
        var entry = { key: k, value: this._handlers[k] };
        this._element.removeEventListener(entry.key, entry.value, false);
    }

    People.Social.clearKeys(this._handlers);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="Controls\Control.js" />

People.RecentActivity.UI.Core.Page = function(element) {
    /// <summary>
    ///     Provides a basic page with enter and exit animations.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element to wrap.</param>
    People.RecentActivity.UI.Core.Control.call(this, element);
};

Jx.inherit(People.RecentActivity.UI.Core.Page, People.RecentActivity.UI.Core.Control);

People.RecentActivity.UI.Core.Page.prototype.enter = function() {
    /// <summary>
    ///     Animates the page's entry into the UI.
    /// </summary>
    /// <returns type="WinJS.Promise"></returns>
    if (!this.isRendered || this.isDisposed) {
        return WinJS.Promise.wrap(null);
    }

    this.isVisible = true;
    return this.onEnter();
};

People.RecentActivity.UI.Core.Page.prototype.exit = function() {
    /// <summary>
    ///     Animates the page's exit from the UI.
    /// </summary>
    /// <returns type="WinJS.Promise"></returns>
    var that = this;
    
    if (!this.isRendered || this.isDisposed) {
        return WinJS.Promise.wrap(null);
    }

    return this.onExit().then(function() {
        that.isVisible = false;
        return null;
    });
};

People.RecentActivity.UI.Core.Page.prototype.onEnter = function() {
    /// <summary>
    ///     Occurs when the control is entering the UI.
    /// </summary>
    /// <returns type="WinJS.Promise"></returns>
    return People.Animation.enterPage(this.element);
};

People.RecentActivity.UI.Core.Page.prototype.onExit = function() {
    /// <summary>
    ///     Occurs when the control is exiting the UI.
    /// </summary>
    /// <returns type="WinJS.Promise"></returns>
    return People.Animation.exitPage(this.element);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\..\Imports\LayoutState.js" />

People.RecentActivity.UI.Core.SnapManager = function() {
    /// <summary>
    ///     Manages controls which support snap.
    /// </summary>
    /// <field name="_controls" type="Array" static="true">The controls.</field>
    /// <field name="_handler" type="People.Function" static="true">The handler.</field>
};


People.RecentActivity.UI.Core.SnapManager._controls = [];
People.RecentActivity.UI.Core.SnapManager._handler = null;

Object.defineProperty(People.RecentActivity.UI.Core.SnapManager, "currentLayout", {
    get: function() {
        /// <summary>
        ///     Gets the current app layout.
        /// </summary>
        /// <value type="People.RecentActivity.Imports.LayoutState"></value>
        return Jx.root.getLayoutState();
    }
});

People.RecentActivity.UI.Core.SnapManager.addControl = function(control) {
    /// <summary>
    ///     Adds a control which supports snap to the manager.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Core.ISnappable">The control.</param>
    Debug.assert(control != null, 'control != null');
    if (People.RecentActivity.UI.Core.SnapManager._controls.indexOf(control) === -1) {
        People.RecentActivity.UI.Core.SnapManager._controls.push(control);
        if (People.RecentActivity.UI.Core.SnapManager._controls.length === 1) {
            // we're the first to request snap support, so attach the event.
            Jx.root.getLayout().addLayoutChangedEventListener(People.RecentActivity.UI.Core.SnapManager._handler, null);
        }    
    }
};

People.RecentActivity.UI.Core.SnapManager.removeControl = function(control) {
    /// <summary>
    ///     Removes a control which supports snap from the manager.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Core.ISnappable"></param>
    Debug.assert(control != null, 'control != null');
    var index = People.RecentActivity.UI.Core.SnapManager._controls.indexOf(control);
    if (index !== -1) {
        People.RecentActivity.UI.Core.SnapManager._controls.splice(index, 1);
        if (!People.RecentActivity.UI.Core.SnapManager._controls.length) {
            // there are no more listeners for snap updates.
            Jx.root.getLayout().removeLayoutChangedEventListener(People.RecentActivity.UI.Core.SnapManager._handler, null);
        }    
    }
};

People.RecentActivity.UI.Core.SnapManager.unsnap = function() {
    /// <summary>
    ///     Unsnaps the current app.
    /// </summary>
    /// <returns type="Boolean"></returns>
    return Jx.root.getLayout().unsnap();
};

People.RecentActivity.UI.Core.SnapManager._onLayoutChanged = function(state) {
    /// <param name="state" type="People.RecentActivity.Imports.LayoutState"></param>
    for (var n = 0; n < People.RecentActivity.UI.Core.SnapManager._controls.length; n++) {
        var snappable = People.RecentActivity.UI.Core.SnapManager._controls[n];
        snappable.onLayoutChanged(state);
    }
};


(function() {
    People.RecentActivity.UI.Core.SnapManager._handler = People.RecentActivity.UI.Core.SnapManager._onLayoutChanged.bind(this);
})();
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\..\Core\Events\EventArgs.js" />

People.RecentActivity.UI.Core.TimestampUpdateTimer = function() {
    /// <summary>
    ///     Provides a global update timer for timestamps.
    /// </summary>
    /// <field name="_updateTimeout" type="Number" integer="true" static="true">The timeout, in milliseconds, that determines how often timestamps are updated.</field>
    /// <field name="_updateTimer" type="Number" integer="true" static="true">The global update time.</field>
    /// <field name="_events" type="Object" static="true">The update handlers.</field>
    /// <field name="_eventHandlerCount" type="Number" integer="true" static="true">The number of handlers.</field>
};


People.RecentActivity.UI.Core.TimestampUpdateTimer._updateTimeout = 30000;
People.RecentActivity.UI.Core.TimestampUpdateTimer._updateTimer = -1;
People.RecentActivity.UI.Core.TimestampUpdateTimer._events = null;
People.RecentActivity.UI.Core.TimestampUpdateTimer._eventHandlerCount = 0;

People.RecentActivity.UI.Core.TimestampUpdateTimer.subscribe = function(callback, context) {
    /// <summary>
    ///     Subscribes to the update timer.
    /// </summary>
    /// <param name="callback" type="People.RecentActivity.Function"></param>
    /// <param name="context" type="Object"></param>
    Jx.addListener(People.RecentActivity.UI.Core.TimestampUpdateTimer._events, 'timerelapsed', callback, context);
    People.RecentActivity.UI.Core.TimestampUpdateTimer._eventHandlerCount++;
    if (People.RecentActivity.UI.Core.TimestampUpdateTimer._updateTimer === -1) {
        // set up a new (slow) timer to eventually update the timestamps.
        People.RecentActivity.UI.Core.TimestampUpdateTimer._updateTimer = setInterval(People.RecentActivity.UI.Core.TimestampUpdateTimer._onGlobalUpdateTimerElapsed, 30000);
    }
};

People.RecentActivity.UI.Core.TimestampUpdateTimer.unsubscribe = function(callback, context) {
    /// <summary>
    ///     Unsubscribes from the timer.
    /// </summary>
    /// <param name="callback" type="People.RecentActivity.Function">The callback.</param>
    /// <param name="context" type="Object">The context.</param>
    if (People.Social.removeListenerSafe(People.RecentActivity.UI.Core.TimestampUpdateTimer._events, 'timerelapsed', callback, context)) {
        People.RecentActivity.UI.Core.TimestampUpdateTimer._eventHandlerCount--;
        if (!People.RecentActivity.UI.Core.TimestampUpdateTimer._eventHandlerCount) {
            // clear the timer, nothing is listening to it anymore.
            clearInterval(People.RecentActivity.UI.Core.TimestampUpdateTimer._updateTimer);
            People.RecentActivity.UI.Core.TimestampUpdateTimer._updateTimer = -1;
        }    
    }
};

People.RecentActivity.UI.Core.TimestampUpdateTimer._onGlobalUpdateTimerElapsed = function() {
    Jx.raiseEvent(People.RecentActivity.UI.Core.TimestampUpdateTimer._events, 'timerelapsed', new People.RecentActivity.EventArgs(null));
};


(function() {
    // use a proxy object for event signaling (so we don't have to duplicate Jx event functionality.)
    People.RecentActivity.UI.Core.TimestampUpdateTimer._events = {};
    People.RecentActivity.UI.Core.TimestampUpdateTimer._eventHandlerCount = 0;
    Debug.Events.define(People.RecentActivity.UI.Core.TimestampUpdateTimer._events, 'timerelapsed');
})();
});