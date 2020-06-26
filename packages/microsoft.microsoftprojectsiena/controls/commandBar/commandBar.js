//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var DesignButtonConstants = {
            dividers: 1, nonDesignButtons: 6, whitespace: 1
        },
        CommandBarView = WinJS.Class.define(function CommandBarView_ctor(element) {
            this._element = element;
            var viewModel = ko.computed(function() {
                    return this._viewModel
                }, this);
            copyPasteFlyout.winControl.addEventListener("afterhide", function() {
                this._viewModel.commandBarShortcuts.selectedIndex(-1)
            }.bind(this));
            arrangeFlyout.winControl.addEventListener("afterhide", function() {
                this._viewModel.commandBarShortcuts.selectedIndex(-1)
            }.bind(this));
            orderFlyout.winControl.addEventListener("afterhide", function() {
                this._viewModel.commandBarShortcuts.selectedIndex(-1)
            }.bind(this));
            alignFlyout.winControl.addEventListener("afterhide", function() {
                this._viewModel.commandBarShortcuts.selectedIndex(-1)
            }.bind(this));
            ko.applyBindings(viewModel, element);
            var refreshCategories = function() {
                    this._refreshCategoryElements();
                    this._refreshCategorySizes("instant");
                    viewModel().ruleButtonPanel.addEventListener("categoryContentChanged", this._refreshCategorySizes.bind(this, "animate"));
                    viewModel().addEventListener("categoryContentChanged", this._refreshCategorySizes.bind(this, "animate"))
                }.bind(this);
            viewModel.subscribe(refreshCategories, this);
            setImmediate(function() {
                refreshCategories();
                this._updateMaximumVisiblePropertyButtons()
            }.bind(this));
            ko.computed(function() {
                return AppMagic.context.documentViewModel.isPreview
            }).subscribe(function(value) {
                value || this._refreshCategorySizes("instant")
            }, this);
            window.addEventListener("resize", this._updateMaximumVisiblePropertyButtons.bind(this), !1);
            var documentViewModel = ko.computed(function() {
                    return AppMagic.context.documentViewModel
                });
            documentViewModel.subscribe(this._updateMaximumVisiblePropertyButtons, this)
        }, {
            _animating: 0, _categoryElements: null, _element: null, _savedAverageWidth: 0, _ensureCategoryElements: function() {
                    if (!this._categoryElements) {
                        this._categoryElements = [document.getElementById("dataCategoryPanel"), document.getElementById("designCategoryPanel"), document.getElementById("behaviorCategoryPanel"), document.getElementById("selectionCategoryPanel"), ];
                        for (var i = 0, len = this._categoryElements.length; i < len; i++) {
                            var categoryElement = this._categoryElements[i];
                            var contentElement = this._getContentElement(categoryElement)
                        }
                    }
                }, _getContentElement: function(categoryElement) {
                    var contentElement = categoryElement.querySelector(".content");
                    return contentElement
                }, _refreshCategoryElements: function() {
                    this._categoryElements = null;
                    this._ensureCategoryElements()
                }, _refreshCategorySizes: function(type) {
                    this._ensureCategoryElements();
                    var selectedCategoryElement = this._categoryElements[this._viewModel.ruleButtonPanel.selectedCategory];
                    type === "animate" && (this._animating++, this._animating === 1 && this._viewModel.ruleButtonPanel.notifyCategoryAnimationState("animating"), this._getContentElement(selectedCategoryElement).style.opacity = "0");
                    AppMagic.Utility.executeImmediatelyAsync(function() {
                        for (var i = 0, len = this._categoryElements.length; i < len; i++) {
                            var categoryElement = this._categoryElements[i];
                            type === "animate" ? WinJS.Utilities.addClass(categoryElement, "animate") : WinJS.Utilities.removeClass(categoryElement, "animate");
                            var contentElement = this._getContentElement(categoryElement),
                                width = contentElement.clientWidth;
                            width > 0 && (width += parseInt(contentElement.currentStyle.marginLeft) + parseInt(contentElement.currentStyle.marginRight));
                            categoryElement.style.width = width.toString() + "px"
                        }
                        type === "animate" && WinJS.UI.Animation.fadeIn(this._getContentElement(selectedCategoryElement)).then(function() {
                            this._animating--;
                            this._animating === 0 && this._viewModel.ruleButtonPanel.notifyCategoryAnimationState("finished")
                        }.bind(this))
                    }.bind(this))
                }, _getAverageButtonWidth: function() {
                    var buttons = WinJS.Utilities.query(".button", this._element),
                        totalWidth = 0,
                        buttonCount = 0;
                    return (buttons.forEach(function(button) {
                            if (button.parentNode && button.parentNode.className === "content") {
                                var buttonWidth = WinJS.Utilities.getTotalWidth(button);
                                buttonWidth > 0 && (buttonCount++, totalWidth += buttonWidth)
                            }
                        }), totalWidth === 0) ? this._savedAverageWidth : (this._savedAverageWidth = totalWidth / buttonCount, this._savedAverageWidth)
                }, _updateMaximumVisiblePropertyButtons: function() {
                    var averageWidth = this._getAverageButtonWidth();
                    var maximumCount = document.body.offsetWidth / averageWidth;
                    maximumCount -= DesignButtonConstants.dividers;
                    maximumCount -= DesignButtonConstants.nonDesignButtons;
                    maximumCount -= DesignButtonConstants.whitespace;
                    this._viewModel.ruleButtonPanel.maximumVisibleCategoryButtons = Math.max(1, Math.floor(maximumCount));
                    this._refreshCategorySizes("instant")
                }, _viewModel: {get: function() {
                        return AppMagic.context.documentViewModel.commandBar
                    }}
        }, {});
    AppMagic.UI.Pages.define("/controls/commandBar/commandBar.html", CommandBarView)
})();