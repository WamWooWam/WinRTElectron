
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true*/
/*global Debug,Mail,Microsoft,Jx,WinJS*/

Jx.delayDefine(Mail, "ViewIntroductionHeader", function () {
    "use strict";

    var Platform = Microsoft.WindowsLive.Platform;
    var MailViewType = Platform.MailViewType;

    function getCount(viewName, settings) {
        ///<returns type="Number">The number of times the intro message for a given view has been seen</returns>
        Debug.assert(Jx.isNonEmptyString(viewName));
        Debug.assert(Jx.isObject(settings));

        var value = parseInt(settings.getLocalSettings().container("ViewIntroCounts").get(viewName), 10);
        return Jx.isValidNumber(value) ? value : 0;
    }

    function setCount(viewName, settings, count) {
        ///<summary>Sets a value to be returned by a future call to getCount</summary>
        Debug.assert(Jx.isNonEmptyString(viewName));
        Debug.assert(Jx.isObject(settings));
        Debug.assert(Jx.isNumber(count));
        settings.getLocalSettings().container("ViewIntroCounts").set(viewName, count.toString());
    }

    function BaseIntro(viewName, view, settings) {
        ///<summary>The intro messages for various views each have their own intricacies.  BaseIntro represents the
        ///shared default behavior, individual views can override _isSupported and _shouldAutoDismiss with additional
        ///behavior.</summary>
        Debug.assert(Jx.isNonEmptyString(viewName));
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isObject(settings));

        this.initEvents();

        this._viewName = viewName;
        this._view = view;
        this._settings = settings;

        this._disposer = new Mail.Disposer();
        this._incremented = false;

        this._show = false;
        this._update();
    }
    Jx.augment(BaseIntro, Jx.Events);
    Debug.Events.define(BaseIntro.prototype, "updated");
    BaseIntro.prototype.dispose = function () {
        Jx.dispose(this._disposer);
    };
    BaseIntro.prototype.shouldShow = function () {
        ///<returns type="Boolean">Called externally, represents the aggregate of _isSupported, _isDismissed and
        ///_shouldAutoDismiss.  Updated by calls to _update.</summary>
        return this._show;
    };
    BaseIntro.prototype.getText = function () {
        ///<returns type="Boolean">Called externally, returns the text of the intro message.  May contain a %1 which will
        ///be replaced by a settings link</returns>
        return Jx.res.getString("mail" + this._viewName + "Intro");
    };
    BaseIntro.prototype.dismiss = function () {
        ///<summary>Can be called externally based on a button click or internally based on _shouldAutoDismiss.  Once
        ///dismissed, an intro will never show again.</summary>
        this._settings["dismissed" + this._viewName + "Intro"] = true;
        this._update();
    };
    BaseIntro.prototype._isSupported = function () {
        ///<summary>Derived views may only be supported under special conditions (e.g. based on account type)</summary>
        return true;
    };
    BaseIntro.prototype._isDismissed = function () {
        ///<summary>Checks whether the intro has been dismissed (either manually or automatically) previously.</summary>
        return this._settings["dismissed" + this._viewName + "Intro"] ||
               this._settings.isRetailExperience;
    };
    BaseIntro.prototype._shouldAutoDismiss = function () {
        ///<summary>Checks whether the intro should be automatically dismissed.  The default is that the intro for a view
        ///is automatically dismissed when it has already been seen 3 times, but individual views may override or augment
        ///this functionality</summary>
        var settings = this._settings;
        var count = getCount(this._viewName, settings);

        if (!this._incremented) {
            this._incremented = true;
            count++;
            setCount(this._viewName, settings, count);
        }

        return count > 3;
    };
    BaseIntro.prototype._update = function () {
        ///<summary>Sets the initial visibility of the intro, and updates it when circumstances change (platform change
        ///events).</summary>
        var show = !this._isDismissed() && this._isSupported();
        if (show && this._shouldAutoDismiss()) {
            show = false;
            this.dismiss();
        }

        if (show !== this._show) {
            this._show = show;
            this.raiseEvent("updated", { shouldShow: show });
        }
    };

    function InboxIntro(view, settings) {
        ///<summary>The inbox intro is only supported in Outlook.com accounts, and has has special autodismiss rules</summary>
        this._eas = null;
        this._enabledCategories = null;
        BaseIntro.call(this, "Inbox", view, settings);
    }
    Jx.inherit(InboxIntro, BaseIntro);
    InboxIntro.prototype._isSupported = function () {
        ///<summary>Note that we override _isSupported here and not _shouldAutoDismiss.  We don't want to dismiss
        ///an intro permanently just because you visited that view in an unsupported account.  Note also that we 
        ///subscribe for changes:  accounts don't know until first sync whether they are WLAS.</summary>
        var supported = BaseIntro.prototype._isSupported.call(this);
        if (supported) {
            var eas = this._eas;
            if (!eas) {
                var account = this._view.account;
                if (account) {
                    eas = this._eas = account.platformObject.getServerByType(Platform.ServerType.eas);
                    if (eas) {
                        this._disposer.add(new Mail.EventHook(eas, "changed", this._update, this));
                    }
                }
            }

            supported = eas && eas.isWlasSupported;
        }
        return supported;
    };
    InboxIntro.prototype._shouldAutoDismiss = function () {
        var dismiss = BaseIntro.prototype._shouldAutoDismiss.call(this);

        if (dismiss) {
            // We won't autodismiss the Inbox intro based on count alone until both newsletter and social views
            // have been visited at least once.  This ensures the user really gets a chance to understand how 
            // their messages have been organized, and the opportunity to disable.
            var settings = this._settings;
            dismiss = (getCount("Newsletter", settings) >= 1) && (getCount("Social", settings) >= 1);
        }

        if (!dismiss) {
            // If either category is disabled, the intro will be immediately dismissed.
            var enabledCategories = this._enabledCategories;
            if (!enabledCategories) {
                var account = this._view.account;
                if (account) {
                    var categoryViews = account.queryViews(Platform.MailViewScenario.systemCategories);
                    if (categoryViews) {
                        enabledCategories = this._enabledCategories = Mail.ViewFilters.filterEnabled(categoryViews);
                        enabledCategories.unlock();
                        this._disposer.addMany(
                            categoryViews,
                            enabledCategories,
                            new Mail.EventHook(enabledCategories, "collectionchanged", this._update, this)
                        );
                    }
                }
            }

            Debug.assert(enabledCategories.count <= 2); // If we ever add more categories, we'd need a FilterByType[newsletter, social] above to maintain this behavior.
            dismiss = (enabledCategories.count < 2);
        }

        return dismiss;
    };

    function AllFavoritesIntro(view, settings) {
        ///<summary>The All Favorites view hints that we have autopinned some frequent contacts for the user.  We want
        ///to dismiss this message if we haven't.  That's only necessary if the user visits the view before autopinning
        ///completes, otherwise they'd just be presented the flyout directly.</summary>
        this._account = null;
        BaseIntro.call(this, "AllFavorites", view, settings);
    }
    Jx.inherit(AllFavoritesIntro, BaseIntro);
    AllFavoritesIntro.prototype._shouldAutoDismiss = function () {
        var dismiss = BaseIntro.prototype._shouldAutoDismiss.call(this);
        if (!dismiss) {
            // We'll pivot this decision off of peopleViewComplete.  So the user will see this message until that property
            // is set, at which point we may autodismiss.
            var account = this._account;
            if (!account) {
                account = this._account = this._view.account;
                if (account) {
                    this._disposer.add(new Mail.EventHook(account, "changed", this._onAccountChanged, this));
                }
            }

            if (account && account.peopleViewComplete) {
                // We won't subscribe the collection for changes.  If the user unpins someone while they are looking 
                // at the all favorites view, there is no reason to dismiss the message.
                var peopleViews = account.queryViews(Platform.MailViewScenario.allPeople);

                dismiss = true;
                for (var i = 0; i < peopleViews.count; i++) {
                    if (peopleViews.item(i).isPinnedToNavPane) {
                        dismiss = false;
                        break;
                    }
                }
                Jx.dispose(peopleViews);
            }
        }

        return dismiss;
    };
    AllFavoritesIntro.prototype._onAccountChanged = function (ev) {
        if (Mail.Validators.hasPropertyChanged(ev, "peopleViewComplete")) {
            this._update();
        }
    };

    function createIntro(view, settings) {
        switch (view.type) {
        case MailViewType.inbox:
            return new InboxIntro(view, settings);
        case MailViewType.newsletter:
            return new BaseIntro("Newsletter", view, settings);
        case MailViewType.social:
            return new BaseIntro("Social", view, settings);
        case MailViewType.allPinnedPeople:
            return new AllFavoritesIntro(view, settings);
        default:
            return null;
        }
    }

    var ViewIntroductionHeader = Mail.ViewIntroductionHeader = function (settings) {
        ///<summary>The ViewIntroductionHeader is the Jx Component that renders the intro message</summary>
        this.initComponent();
        this._settings = settings;
        this._container = null;
        this._disposer = null;
        this._view = null;
        this._intro = null;
        this._visible = false;
        this._animationPromise = null;
    };
    Jx.inherit(ViewIntroductionHeader, Jx.Component);

    ViewIntroductionHeader.prototype.getUI = function (ui) {
        ui.html = "<div id='" + this._id + "' class='mailMessageListViewIntro'>" +
                      "<div class='descriptionText' role='note'></div>" +
                      "<div class='buttonContainer'>" +
                          "<button class='dismiss' tabIndex='0'>" + Jx.res.getString("mailOkButton") + "</button>" +
                      "</div>" +
                  "</div>";
    };

    ViewIntroductionHeader.prototype.setContainer = function (container) {
        ///<summary>Instead of setting classes on its own element, the intro will set a showViewIntro class on this
        ///container element.  This is because other components may adjust their styling based on the presence of the
        ///intro (particularly the search mode rendering). The peers of this container element are animated when
        ///the intro is hidden.</summary>
        Debug.assert(Jx.isHTMLElement(container));
        this._container = container;
    };

    ViewIntroductionHeader.prototype.onDeactivateUI = function () {
        Jx.dispose(this._disposer);
    };

    ViewIntroductionHeader.prototype.waitForAnimation = function () {
        return Jx.Promise.fork(this._animationPromise);
    };

    ViewIntroductionHeader.prototype.setView = function (view) {
        ///<summary>When the message list switches to a new view, it will call this method, which will decide
        ///what intro message to show and whether to show it</summary>
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));

        Jx.dispose(this._disposer);
        this._disposer = null;

        this._view = view;
        var intro = this._intro = createIntro(view, this._settings);
        if (intro) {
            this._disposer = new Mail.Disposer(
                intro,
                new Mail.EventHook(intro, "updated", this._onUpdate, this)
            );
        }

        var shouldShow = intro && intro.shouldShow();
        if (shouldShow) {
            this._show();
        } else {
            this._hide(false /* not animated */);
        }
    };

    ViewIntroductionHeader.prototype._show = function () {
        ///<summary>Displays the intro message</summary>
        var disposer = this._disposer;
        var element = this._getElement();

        var textElement = element.querySelector(".descriptionText");
        textElement.innerHTML = Jx.escapeHtml(this._intro.getText()).replace("%1", function () {
            return "<span class='settingsLink' role='button' tabIndex='0'>" + Jx.escapeHtml(Jx.res.getString("mailViewIntroSettingsLink")) + "</span>";
        });

        var link = textElement.querySelector(".settingsLink");
        if (link) {
            disposer.add(new Jx.Clicker(link, this._onSettingsClick, this));
        }

        disposer.add(new Mail.EventHook(element.querySelector(".dismiss"), "click", this._onDismissClick, this));

        if (!this._visible) {
            this._container.classList.add("showViewIntro");
            this._visible = true;
        }
    };

    ViewIntroductionHeader.prototype._hide = function (animated) {
        ///<summary>Hides the intro message, optionally animating it away</summary>
        Debug.assert(Jx.isBoolean(animated));

        if (this._visible) {
            this._visible = false;
            if (!animated) {
                this._container.classList.remove("showViewIntro");
            } else {
                var element = this._getElement();
                var affected = Array.prototype.filter.call(this._container.parentElement.children, function (el) { return el !== element; });
                var animation = WinJS.UI.Animation.createCollapseAnimation(element, affected);
                element.classList.add("collapsing");

                var animationPromise = this._animationPromise = animation.execute();
                this._disposer.add(new Mail.Disposable(animationPromise, "cancel"));
                animationPromise.done(function () {
                    this._animationPromise = null;
                    element.classList.remove("collapsing");
                    this._container.classList.remove("showViewIntro");
                }.bind(this));
            }
        }
    };

    ViewIntroductionHeader.prototype._onUpdate = function (ev) {
        ///<summary>Called when the intro message internal state changes, which may cause us to show or hide the
        ///message</summary>
        var shouldShow = ev.shouldShow;
        if (shouldShow !== this._visible) {
            if (shouldShow) {
                this._show();
            } else {
                this._hide(true /* animated */);
            }
        }
    };

    ViewIntroductionHeader.prototype._getElement = function () {
        return document.getElementById(this._id);
    };

    ViewIntroductionHeader.prototype._onSettingsClick = function (ev) {
        Mail.AppSettings.openAccountUI(this._view.account.platformObject);
        ev.preventDefault();
    };

    ViewIntroductionHeader.prototype._onDismissClick = function () {
        this._intro.dismiss();
    };


    ViewIntroductionHeader.reset = function () {
        [ "Inbox", "Newsletter", "Social", "AllFavorites" ].forEach(function (viewName) {
            Debug.assert(Jx.isBoolean(Mail.Globals.appSettings["dismissed" + viewName + "Intro"]));
            Mail.Globals.appSettings["dismissed" + viewName + "Intro"] = false;
        });
        Mail.Globals.appSettings.getLocalSettings().deleteContainer("ViewIntroCounts");
    };


});
