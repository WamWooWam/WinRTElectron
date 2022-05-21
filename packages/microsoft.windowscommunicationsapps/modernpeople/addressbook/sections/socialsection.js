
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="Section.js"/>
/// <reference path="StaticSection.js"/>
/// <reference path="../../Shared/IdentityControl/IdentityControl.js"/>
/// <reference path="../../Shared/Navigation/UriGenerator.js"/>
/// <reference path="../../Social/Common/Social.Utilities.js"/>
/// <reference path="../../Shared/Platform/PlatformCache.js"/>
/// <reference path="SocialSection.ref.js"/>
/// <dictionary>whats</dictionary>

Jx.delayDefine(People, "SocialSection", function () {

    var P = window.People;
    var Plat = Microsoft.WindowsLive.Platform;

    P.SocialSection = /* @constructor*/function (platformCache, upsellSettings) {
        ///<summary>The Social section displays the user's own tile, and summary data about Notifications and What's New</summary>
        ///<param name="platformCache" type="P.PlatformCache"/>
        P.StaticSection.call(this, "socialSection", "/strings/abSocialSectionTitle");
        this._platformCache = platformCache;
        this._animation = /*@static_cast(WinJS.Promise)*/null;
        this._isEntering = false;
        var stringIds = {
            phase1InstructionsId: "/strings/upsellInstructions",
            phase1DismissId: "/strings/upsellPhase1Dismiss",
            phase2InstructionsId: "/strings/upsellPhase2Instructions"
        };

        var options = {
            getAssetText: function (/*@type(AssetSource)*/asset) { return asset.serviceContactsName; },
            delayRender: true,
            phase1Ctor: Jx.Component
        };
        this._upsellControl = new P.Accounts.UpsellControl(platformCache.getPlatform(),
                                                           Plat.ApplicationScenario.people,
                                                           upsellSettings,
                                                           stringIds,
                                                           options);

        // Start to load the social model, we will need to pull of latest notification later..
        People.loadSocialModel();
        People.loadSocialUICore();

        // List for the upsell's dismissal
        Jx.EventManager.addListener(this._upsellControl, "upsellDismissed", this._onUpsellDismissed.bind(this), this);
    };
    Jx.inherit(P.SocialSection, P.StaticSection);

    P.SocialSection.prototype._onUpsellDismissed = function () {
        var upsellContainer = this._contentElement.querySelector(".upsell-container");
        Jx.addClass(upsellContainer, "upsell-hidden");
        this._upsellControl.shutdownUI();
        this._upsellControl = null;
    };

    P.SocialSection.prototype.getContent = function () {
        ///<summary>Retreives the HTML for the social section.  This is performed very early during startup, we'll take care not to touch the platform until render</summary>

        var identityControlHtml;

        var jobSet = this.getJobSet();
        var identityControl = this._identityControl = new P.IdentityControl(null, jobSet);

        this._unreadNotifications = P.Social.unreadNotifications;
        Jx.addListener(this._unreadNotifications, "changed", this._onNotificationCountChanged, this);
        var notificationsContent = this._getNotificationsContent();
        var notificationsClassName = Jx.isNonEmptyString(notificationsContent) ? "ab-notifications-container" : "ab-notifications-container ab-notifications-disabled";

        identityControlHtml = identityControl.getUI(P.IdentityElements.TileLayout, {
            className: "ic-me",
            size: (this.getOrientation() === P.Orientation.horizontal) ? 120 : 80,
            primaryContent: MeTextElement,
            secondaryContent: {
                element: NotificationsElement,
                className: notificationsClassName,
                content: notificationsContent
            }
        });

        this._latestNotification = new People.RecentActivity.UI.Modules.Feed.LatestNotification(jobSet, this._platformCache);

        return "<div class='socialSectionGrid'>" +
                    "<div class='socialSectionBackground'></div>" +
                    identityControlHtml +
                    this._latestNotification.getUI() +
                    Jx.getUI(this._upsellControl).html +
                "</div>";
    };

    P.SocialSection.prototype.render = function () {
        ///<summary>Similar to activateUI, but driven by the stitcher, this function will hook events and begin talking to the platform</summary>
        P.StaticSection.prototype.render.call(this);

        this._notificationCountContainer = this._contentElement.querySelector(".ab-notifications-container");
        this._notificationCountContainer.tabIndex = 0;
        this._notificationCountContainer.addEventListener("click", this._onNotificationTextClicked, false);
        this._notificationCountContainer.addEventListener("keypress", this._onKeyPress, false);
        this._identityControl.activateUI(this._contentElement);
        this._identityControl.updateDataSource(this._platformCache.getDefaultMeContact());
        this._latestNotification.activateUI(this._contentElement.querySelector(".notificationList"));

        var jobSet = this.getJobSet();
        jobSet.addUIJob(this._unreadNotifications, this._unreadNotifications.refreshCount, null, P.Priority.notifications);
        this._upsellControl.activateUI();
    };

    P.SocialSection.prototype.deactivateUI = function () {
        ///<summary>Called when this component is being torn down</summary>
        P.StaticSection.prototype.deactivateUI.call(this);
        this._pendingChange = false;
        if (this._animation) {
            this._animation.cancel();
        }
        if (this._identityControl) {
            this._identityControl.shutdownUI();
        }
        if (this._unreadNotifications) {
            Jx.removeListener(this._unreadNotifications, "changed", this._onNotificationCountChanged, this);
        }
        if (this._latestNotification) {
            this._latestNotification.deactivateUI();
        }
        if (this._notificationCountContainer) {
            this._notificationCountContainer.removeEventListener("click", this._onNotificationTextClicked, false);
            this._notificationCountContainer.removeEventListener("keypress", this._onKeyPress, false);
            this._notificationCountContainer = null;
        }
    };

    P.SocialSection.prototype._onNotificationTextClicked = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');
        People.Nav.navigate(People.Nav.getNotificationUri(null));
    };

    P.SocialSection.prototype._onKeyPress = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');
        if (ev.keyCode === WinJS.Utilities.Key.enter ||
            ev.keyCode === WinJS.Utilities.Key.space) {
            People.Nav.navigate(People.Nav.getNotificationUri(null));
        }
    };

    var notificationStrings = [
    /*0*/{ singleLine: "/strings/abNotificationsSingleLineNone" },
    /*1*/{ singleLine: "/strings/abNotificationsSingleLineSingular" },
    /*2*/{ singleLine: "/strings/abNotificationsSingleLinePlural" }
    ];
    P.SocialSection.prototype._getNotificationsContent = function () {
        /// <returns type="String">HTML content for the notifications button</returns>
        if (!this._unreadNotifications.isEnabled()) {
            return "";
        } else {
            var count = this._unreadNotifications.getCount();
            var strings = notificationStrings[Math.min(count, 2)];
            return "<div class='ab-notifications-content'>" +
                        "<div class='ab-notifications-singleLine ab-tooltip-check'>" +
                            Jx.escapeHtml(Jx.res.loadCompoundString(strings["singleLine"], count)) +
                        "</div>" +
                   "</div>";
        }
    };

    P.SocialSection.prototype.contentReadyAsync = function () {
        this._isEntering = true;
        var animatingElements = [];
        var meTile = this._contentElement.querySelector(".ic-me");
        if (meTile) {
            animatingElements.push(meTile);
        }

        var latestNotification = this._contentElement.querySelector(".notificationList");
        if (latestNotification) {
            animatingElements.push(latestNotification);
        }

        var upsell = this._contentElement.querySelector(".upsell-container");
        if (upsell) {
            animatingElements.push(upsell);
        }
        return animatingElements;
    };

    P.SocialSection.prototype.onEnterComplete = function () {
        Debug.assert(this._animation === null);
        this._isEntering = false;
        this._onAnimationComplete();
    };

    P.SocialSection.prototype._onNotificationCountChanged = function () {
        ///<summary>Called when the unread social notifications count changes, or when a network that supports
        ///notifications is added/removed</summary>
        if (Boolean(this._animation) || this._isEntering) {
            // If we receive another change while animating, we'll wait for the animation to complete and then apply it.
            this._pendingChange = true;
        } else {
            var promise;
            var container = this._notificationCountContainer;
            // Show/hide the control on enable/disable
            var enabled = this._unreadNotifications.isEnabled();
            if (Jx.hasClass(container, "ab-notifications-disabled") === enabled) {
                if (enabled) {
                    container.innerHTML = this._getNotificationsContent();
                    var expandAnimation = WinJS.UI.Animation.createExpandAnimation(container, this._contentElement.children);
                    Jx.removeClass(container, "ab-notifications-disabled");
                    promise = expandAnimation.execute();
                } else {
                    var collapseAnimation = WinJS.UI.Animation.createCollapseAnimation(container, this._contentElement.children);
                    container.style.position = "absolute";
                    container.style.opacity = "0";
                    promise = collapseAnimation.execute().then(function () {
                        container.style.position = "";
                        container.style.opacity = "";
                        Jx.addClass(container, "ab-notifications-disabled");
                    });
                }
            } else if (enabled) {
                // Cross-fade the content on count change
                var oldElement = container.lastChild;
                oldElement.style.position = "absolute";

                container.insertAdjacentHTML("beforeend", this._getNotificationsContent());
                var newElement = container.lastChild;
                newElement.style.opacity = "0";

                promise = WinJS.UI.Animation.crossFade(newElement, oldElement).then(function () {
                    container.removeChild(oldElement);
                });
            }

            if (promise) {
                this._animation = promise;
                promise.done(this._onAnimationComplete.bind(this));
            }
        }
    };

    P.SocialSection.prototype._onAnimationComplete = function () {
        /// <summary>If another change was received while animating, apply it</summary>
        this._animation = null;
        if (this._pendingChange) {
            this._pendingChange = false;
            this._onNotificationCountChanged();
        } else {
            this.getJobSet().addUIJob(this, this._tooltipCheck, null, P.Priority.accessibility);
        }
    };

    P.SocialSection.prototype._tooltipCheck = function () {
        var elements = this._contentElement.querySelectorAll(".ab-tooltip-check");
        Array.prototype.forEach.call(elements, function (element) {
            /// <param name="element" type="HTMLElement"/>
            element.style.overflow = "visible";
            if (element.scrollWidth > element.clientWidth) {
                element.title = element.innerText;
            } else {
                element.title = "";
            }
            element.style.overflow = "";
        }, this);
    };

    P.SocialSection.prototype.appendSemanticZoomCollection = function (/* @dynamic*/collection) {
        var socialSection = new P.ArrayCollection("SocialSection");
        socialSection.appendItem({
            type: "zoomedOutSocialHeader",
            data: null,
            collection: null
        });
        socialSection.loadComplete();
        collection.appendItem({
            collection: socialSection
        });
    };
    P.SocialSection.prototype.dehydrate = function () { };

    function MeTextElement() { };
    MeTextElement.prototype.getUI = function (host, locator, options) {
        var chevron = Jx.isRtl() ? "\uE096" : "\uE097";
        return P.IdentityElements.makeElement("a", locator, "ic-meName ic-text", options, Jx.escapeHtml(Jx.res.getString("/strings/abMe"))) +
                "<a class='ic-meName ic-text ic-chevron' aria-hidden='true'>" + chevron + "</a>";
    };
    MeTextElement.prototype.activateUI = function () { };
    MeTextElement.prototype.shutdownUI = function () { };

    function NotificationsElement() { };
    NotificationsElement.prototype.getUI = function (host, locator, /*@dynamic*/options) {
        return P.IdentityElements.makeElement("div", locator, "ic-text", options, options.content);
    };
    NotificationsElement.prototype.activateUI = function () { };
    NotificationsElement.prototype.shutdownUI = function () { };

});

