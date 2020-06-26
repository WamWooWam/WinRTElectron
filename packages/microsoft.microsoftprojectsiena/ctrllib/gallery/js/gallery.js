//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var Gallery;
        (function(Gallery) {
            var GalleryControl = function() {
                    function GalleryControl() {
                        this.isPublishOrPreview = null;
                        this._priorityVisibleIndex = null
                    }
                    return GalleryControl.prototype.onLoad = function() {
                            this.OpenAjax.initReplicatedContextManager(this.OpenAjax.notifyOutputPropertyValueChanged.bind(this.OpenAjax, "AllItems"), this.OpenAjax.notifyOutputPropertyValueChanged.bind(this.OpenAjax, "Selected"), this._outputRowChanged.bind(this));
                            this.isPublishOrPreview = ko.computed(function() {
                                return !AppMagic.AuthoringTool.Runtime.isAuthoring || AppMagic.context.documentViewModel && AppMagic.context.documentViewModel.isPreview
                            })
                        }, GalleryControl.prototype.initControlContext = function(controlContext) {
                            controlContext._replicatedContext = this.OpenAjax.replicatedContextManager.replicatedContextFor(controlContext.bindingContext);
                            controlContext._skipRenderingItems = !1;
                            controlContext._isLoaded = !0;
                            this._processItems(controlContext);
                            this._resetSelectedItem(controlContext)
                        }, GalleryControl.prototype.onBeforeChangeItems = function(evt, controlContext) {
                                controlContext._skipRenderingItems = AppMagic.Utility.deepCompare(evt.oldValue, evt.newValue, {_src: !0})
                            }, GalleryControl.prototype.onChangeItems = function(evt, controlContext) {
                                if (!controlContext._skipRenderingItems) {
                                    this._processItems(controlContext);
                                    controlContext.realized && (controlContext._galleryViewModel.renderGallery(), this._priorityVisibleIndex !== null && this._priorityVisibleIndex > 0 && (controlContext._galleryViewModel.setVisibleIndex(this._priorityVisibleIndex), this._priorityVisibleIndex = null));
                                    var bindingContext = controlContext.bindingContext;
                                    AppMagic.Utility.executeOnceAsync(this._resetSelectedItem.bind(this, controlContext), this.OpenAjax.getId() + "_setSelectedItem_" + bindingContext.id, 1, function() {
                                        return controlContext._isLoaded
                                    })
                                }
                            }, GalleryControl.prototype.onBeforeGetAllItems = function(evt, controlContext) {
                                var allItemsTable = controlContext._replicatedContext.getOutputTable();
                                controlContext.modelProperties.AllItems.setValue(allItemsTable, !0)
                            }, GalleryControl.prototype.onBeforeGetSelected = function(evt, controlContext) {
                                var selectedItem = controlContext._replicatedContext.getSelectedItem();
                                controlContext.modelProperties.Selected.setValue(selectedItem, !0)
                            }, GalleryControl.prototype.onBeforeGetSelectedItems = function(evt, controlContext) {
                                var selectedItemsTable = controlContext._replicatedContext.getSelectedItemsTable();
                                controlContext.modelProperties.SelectedItems.setValue(selectedItemsTable, !0)
                            }, GalleryControl.prototype.onChangeVisible = function(evt, controlContext) {
                                controlContext.realized && (controlContext._galleryViewModel.updateNextAndPrevVisibility(), controlContext.properties.Visible() && controlContext._galleryViewModel.renderGallery())
                            }, GalleryControl.prototype.onChangeShowNavigation = function(evt, controlContext) {
                                controlContext.realized && controlContext._galleryViewModel.updateNextAndPrevVisibility()
                            }, GalleryControl.prototype.onChangeDirection = function(evt, controlContext) {
                                controlContext.realized && controlContext._galleryViewModel.renderGallery()
                            }, GalleryControl.prototype.onChangeLayout = function(evt, controlContext) {
                                this._adjustTemplateSize(controlContext);
                                controlContext.realized && controlContext._galleryViewModel.renderGallery()
                            }, GalleryControl.prototype.onChangeDefault = function(evt, controlContext) {
                                var _this = this;
                                var bindingContext = controlContext.bindingContext;
                                AppMagic.Utility.executeOnceAsync(function() {
                                    var i = _this._resetSelectedItem(controlContext) + 1;
                                    i > 0 && controlContext.realized && (controlContext._galleryViewModel.setVisibleIndex(i), controlContext.properties.VisibleIndex() === 0 && (_this._priorityVisibleIndex = i))
                                }, this.OpenAjax.getId() + "_setSelectedItem_" + bindingContext.id, 1, function() {
                                    return controlContext._isLoaded
                                })
                            }, GalleryControl.prototype.onChangeWidth = function(evt, controlContext) {
                                this._adjustTemplateSize(controlContext);
                                controlContext.realized && controlContext._galleryViewModel.handleScrollOrResize()
                            }, GalleryControl.prototype.onChangeHeight = function(evt, controlContext) {
                                this._adjustTemplateSize(controlContext);
                                controlContext.realized && controlContext._galleryViewModel.handleScrollOrResize()
                            }, GalleryControl.prototype.onChangeTemplateSize = function(evt, controlContext) {
                                this._adjustTemplateSize(controlContext);
                                controlContext.realized && controlContext._galleryViewModel.handleTemplateResize()
                            }, GalleryControl.prototype.onChangeTemplatePadding = function(evt, controlContext) {
                                this._adjustTemplateSize(controlContext);
                                controlContext.realized && controlContext._galleryViewModel.handleTemplateResize()
                            }, GalleryControl.prototype.getTemplateContainer = function(controlContext) {
                                return controlContext._galleryViewModel.templateElement
                            }, GalleryControl.prototype.initView = function(container, controlContext) {
                                var galleryContext = new Gallery.GalleryViewModel(this, controlContext);
                                AppMagic.Utility.createOrSetPrivate(controlContext, "_galleryViewModel", galleryContext);
                                ko.cleanNode(container);
                                ko.applyBindings(galleryContext, container);
                                controlContext._galleryViewModel.renderGallery()
                            }, GalleryControl.prototype.disposeView = function(container, controlContext) {
                                controlContext._galleryViewModel.dispose();
                                controlContext._galleryViewModel = null
                            }, GalleryControl.prototype.disposeControlContext = function(controlContext) {
                                controlContext._replicatedContext.clearInputTable();
                                controlContext._replicatedContext = null;
                                controlContext._isLoaded = !1
                            }, GalleryControl.prototype.onUnload = function() {
                                this.OpenAjax.disposeReplicatedContextManager();
                                this.isPublishOrPreview.dispose();
                                this.isPublishOrPreview = null
                            }, GalleryControl.prototype._adjustTemplateSize = function(controlContext) {
                                var props = controlContext.modelProperties,
                                    paddingAdjustment = props.TemplatePadding.getValue() * 2;
                                props.Layout.getValue() === "vertical" ? (props.TemplateWidth.setValue(props.Width.getValue() - paddingAdjustment), props.TemplateHeight.setValue(props.TemplateSize.getValue())) : (props.TemplateWidth.setValue(props.TemplateSize.getValue()), props.TemplateHeight.setValue(props.Height.getValue() - paddingAdjustment))
                            }, GalleryControl.prototype._processItems = function(controlContext) {
                                var items = controlContext.modelProperties.Items.getValue();
                                controlContext._replicatedContext.applyInputTable(items || [])
                            }, GalleryControl.prototype._outputRowChanged = function(controlContext, rowId, outputRow) {
                                controlContext.modelProperties.Selected.getValue() === outputRow && this.OpenAjax.notifyOutputPropertyValueChanged("Selected", controlContext.bindingContext)
                            }, GalleryControl.prototype._resetSelectedItem = function(controlContext) {
                                var replicatedContext = this.OpenAjax.replicatedContextManager.replicatedContextFor(controlContext.bindingContext);
                                var len = replicatedContext.getBindingContextCount(),
                                    defaultRowIndex = -1;
                                if (controlContext.realized && len > 0) {
                                    var defaultItem = controlContext.modelProperties.Default.getValue();
                                    if (defaultRowIndex = defaultItem !== null ? replicatedContext.getRecordIndex(defaultItem) : 0, defaultRowIndex >= 0) {
                                        var defaultBindingContext = controlContext._replicatedContext.bindingContextAt(defaultRowIndex);
                                        replicatedContext.notifyBindingContextSelectionInteraction(defaultBindingContext, !1)
                                    }
                                }
                                return defaultRowIndex < 0 && replicatedContext.clearBindingContextSelection(), defaultRowIndex
                            }, GalleryControl
                }();
            Gallery.GalleryControl = GalleryControl
        })(Gallery = Controls.Gallery || (Controls.Gallery = {}))
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var Gallery;
        (function(Gallery) {
            Gallery.BROWSER_MAX_WIDTH_LIMIT = 1e6;
            Gallery.BROWSER_MAX_WIDTH_THRESHOLD = 5e4;
            Gallery.BROWSER_INCREMENTAL_OFFSET = Gallery.BROWSER_MAX_WIDTH_LIMIT - Gallery.BROWSER_MAX_WIDTH_THRESHOLD * 3;
            var GalleryRenderer = function() {
                    function GalleryRenderer(galleryControl, controlContext, galleryViewModel) {
                        this._savedTemplateSize = null;
                        this._pageOffset = 0;
                        this._galleryControl = galleryControl;
                        this._controlContext = controlContext;
                        this._galleryViewModel = galleryViewModel;
                        this._surrogateElement = document.createElement("div");
                        this._asyncRenderingManager = new Controls.AsyncRenderingManager;
                        this._iteratedWindow = galleryViewModel.getViewElement("appmagic-gallery-iterated-window")
                    }
                    return Object.defineProperty(GalleryRenderer.prototype, "pageOffset", {
                            get: function() {
                                return this._pageOffset
                            }, set: function(value) {
                                    this._pageOffset = value
                                }, enumerable: !0, configurable: !0
                        }), GalleryRenderer.prototype.renderIncremental = function() {
                            this._galleryViewModel.setItemsElementSize();
                            var len = this._controlContext._replicatedContext.getBindingContextCount(),
                                windowIndices = this._galleryViewModel.getWindowIndices(len);
                            this._savedTemplateSize !== windowIndices.templateSize && (this._updateWindow(windowIndices, windowIndices.min), this._savedTemplateSize = windowIndices.templateSize);
                            len > 0 ? this._initiateAsynchronousRendering(windowIndices) : this._updateWindow(windowIndices, 0)
                        }, GalleryRenderer.prototype.startRenderIncremental = function() {
                                AppMagic.AuthoringTool.DomUtil.empty(this._iteratedWindow);
                                this._galleryViewModel.setItemsElementSize();
                                var len = this._controlContext._replicatedContext.getBindingContextCount(),
                                    windowIndices = this._galleryViewModel.getWindowIndices(len);
                                this._savedTemplateSize = windowIndices.templateSize;
                                var startingMin = null,
                                    startingMax = null;
                                if (len > 0) {
                                    for (var startingIds = {}, missingIndices = [], realizedIndices = {}, i = windowIndices.min; i <= windowIndices.max; i++) {
                                        var realized = this._controlContext._replicatedContext.bindingContextRealizedAt(i);
                                        if (realized && (!this._controlContext.isTemplate || i > 0)) {
                                            var realizedBindingContext = this._controlContext._replicatedContext.bindingContextAt(i);
                                            startingIds[realizedBindingContext.id] = !0;
                                            realizedIndices[i] = !0;
                                            startingMax = i;
                                            startingMin === null && (startingMin = startingMax);
                                            this._iteratedWindow.appendChild(realizedBindingContext.container)
                                        }
                                    }
                                    if (startingMin !== null)
                                        for (i = startingMin + 1; i <= startingMax - 1; i++)
                                            realizedIndices[i] || missingIndices.push(i);
                                    else
                                        startingMin = 0,
                                        startingMax = -1;
                                    this._unrealizeAllExcept(startingIds);
                                    this._updateWindow(windowIndices, startingMin);
                                    this._asyncRenderingManager.reset(startingMin, startingMax, missingIndices);
                                    this._initiateAsynchronousRendering(windowIndices)
                                }
                                else
                                    this._asyncRenderingManager.reset(),
                                    this._unrealizeAll(),
                                    this._updateWindow(windowIndices, 0)
                            }, GalleryRenderer.prototype.dispose = function() {
                                this._unrealizeAll();
                                this._surrogateElement = null;
                                this._asyncRenderingManager.dispose();
                                this._asyncRenderingManager = null
                            }, GalleryRenderer.prototype.instantiateItemContainerTemplate = function(parentNode) {
                                var templateName = "appmagic-template-galleryitem-container",
                                    dependentObservable = ko.renderTemplate(templateName, this._galleryViewModel, {name: templateName}, parentNode);
                                return dependentObservable
                            }, GalleryRenderer.prototype._initiateAsynchronousRendering = function(windowIndices) {
                                this._asyncRenderingManager.renderAsync(windowIndices.min, windowIndices.max, this._realize.bind(this), this._unrealize.bind(this), this._updateWindow.bind(this, windowIndices))
                            }, GalleryRenderer.prototype._realize = function(realizeIndex, minIndex) {
                                if (!this._controlContext.isTemplate || realizeIndex !== 0) {
                                    var rowBindingContext = this._controlContext._replicatedContext.bindingContextAt(realizeIndex);
                                    var itemContainer;
                                    if (rowBindingContext.realized ? itemContainer = rowBindingContext.container : (this.instantiateItemContainerTemplate(this._surrogateElement), itemContainer = this._surrogateElement.firstElementChild), this._iteratedWindow.firstElementChild)
                                        if (realizeIndex === minIndex)
                                            this._iteratedWindow.insertBefore(itemContainer, this._iteratedWindow.firstElementChild);
                                        else {
                                            var i = realizeIndex - minIndex;
                                            this._iteratedWindow.childElementCount >= i ? this._iteratedWindow.insertBefore(itemContainer, this._iteratedWindow.children[i]) : this._iteratedWindow.appendChild(itemContainer)
                                        }
                                    else
                                        this._iteratedWindow.appendChild(itemContainer);
                                    rowBindingContext.realized || Controls.ReplicatedContextManager.realizeRowView(itemContainer, rowBindingContext)
                                }
                            }, GalleryRenderer.prototype._unrealize = function(unrealizeIndex) {
                                if (!this._controlContext.isTemplate || unrealizeIndex !== 0) {
                                    var rowBindingContext = this._controlContext._replicatedContext.bindingContextAt(unrealizeIndex);
                                    this._iteratedWindow.removeChild(rowBindingContext.container);
                                    Controls.ReplicatedContextManager.unrealizeRowView(rowBindingContext)
                                }
                            }, GalleryRenderer.prototype._unrealizeAll = function() {
                                this._unrealizeAllExcept({})
                            }, GalleryRenderer.prototype._unrealizeAllExcept = function(keepRealizedBindingContexts) {
                                var realizedBindingContexts = this._controlContext._replicatedContext.getRealizedBindingContexts();
                                for (var id in realizedBindingContexts)
                                    if (!(keepRealizedBindingContexts && keepRealizedBindingContexts[id])) {
                                        var rowBindingContext = realizedBindingContexts[id];
                                        Controls.ReplicatedContextManager.unrealizeRowView(rowBindingContext)
                                    }
                            }, GalleryRenderer.prototype._updateWindow = function(windowIndices, currentMinIndex) {
                                var windowPosition = (this._controlContext.isTemplate && currentMinIndex > 0 ? currentMinIndex - 1 : currentMinIndex) * windowIndices.templateSize - this._pageOffset,
                                    newOffset = 0;
                                windowPosition > Gallery.BROWSER_MAX_WIDTH_LIMIT - Gallery.BROWSER_MAX_WIDTH_THRESHOLD ? newOffset = Gallery.BROWSER_INCREMENTAL_OFFSET : this._pageOffset > 0 && windowPosition < Gallery.BROWSER_MAX_WIDTH_THRESHOLD && (newOffset = -Gallery.BROWSER_INCREMENTAL_OFFSET);
                                this._pageOffset += newOffset;
                                windowPosition -= newOffset;
                                this._galleryViewModel.layout() === "vertical" ? (this._iteratedWindow.style.left = "0", this._iteratedWindow.style.right = "0", this._iteratedWindow.style.top = windowPosition + "px", newOffset !== 0 && (this._galleryViewModel.rootElement.scrollTop -= newOffset)) : (this._controlContext.modelProperties.Direction.getValue() === "end" ? (this._iteratedWindow.style.right = windowPosition + "px", this._iteratedWindow.style.left = "0") : (this._iteratedWindow.style.right = "0", this._iteratedWindow.style.left = windowPosition + "px"), this._iteratedWindow.style.top = "0", newOffset !== 0 && (this._galleryViewModel.rootElement.scrollLeft -= newOffset))
                            }, GalleryRenderer
                }();
            Gallery.GalleryRenderer = GalleryRenderer
        })(Gallery = Controls.Gallery || (Controls.Gallery = {}))
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var Gallery;
        (function(Gallery) {
            var Template = function() {
                    function Template(){}
                    return Template.prototype.initControlContext = function(controlContext) {
                            controlContext._parentReplicatedContext = this.OpenAjax.parentReplicatedContextManager.replicatedContextFor(controlContext.bindingContext.parent);
                            controlContext._selectionChangedListener = function(isSelected) {
                                return controlContext.modelProperties.IsSelected.setValue(isSelected)
                            };
                            controlContext._parentReplicatedContext.addSelectionChangedListener(controlContext.bindingContext, controlContext._selectionChangedListener)
                        }, Template.prototype.disposeControlContext = function(controlContext) {
                            controlContext._parentReplicatedContext.removeSelectionChangedListener(controlContext.bindingContext, controlContext._selectionChangedListener);
                            delete controlContext._selectionChangedListener;
                            controlContext._parentReplicatedContext = null
                        }, Template.prototype.initView = function(container, controlContext) {
                                container.className = "appmagic-gallery-template-view";
                                container.style.backgroundColor = controlContext.properties.TemplateFill();
                                controlContext.properties.TemplateFill.subscribe(function(newValue) {
                                    return container.style.backgroundColor = newValue
                                });
                                controlContext.isTemplate || (controlContext._clickListener = function(evt) {
                                    return controlContext._parentReplicatedContext.notifyBindingContextSelectionInteraction(controlContext.bindingContext, !1)
                                }, container.addEventListener("click", controlContext._clickListener))
                            }, Template.prototype.disposeView = function(container, controlContext) {
                                controlContext.isTemplate || (container.removeEventListener("click", controlContext._clickListener), delete controlContext._clickListener)
                            }, Template.prototype.initViewContainer = function(container, controlContext) {
                                return null
                            }, Template
                }();
            Gallery.Template = Template
        })(Gallery = Controls.Gallery || (Controls.Gallery = {}))
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var Gallery;
        (function(Gallery) {
            var GalleryViewModel = function() {
                    function GalleryViewModel(galleryControl, controlContext) {
                        this._offset = null;
                        this.layout = null;
                        this.ownerDescendantSelected = null;
                        this._container = null;
                        this._root = null;
                        this._galleryContainer = null;
                        this._itemsElement = null;
                        this._templateItem = null;
                        this._templateContainer = null;
                        this._template = null;
                        this._hiddenArea = null;
                        this._templateWidth = null;
                        this._templateHeight = null;
                        this._templateSize = null;
                        this._itemsLength = null;
                        this._templateItemDisplay = null;
                        this._templateContainerMarginTop = null;
                        this._templateContainerMarginLeft = null;
                        this._templateContainerMarginRight = null;
                        this._itemsMarginLeftRight = null;
                        this._itemsMarginTopBottom = null;
                        this._transition = null;
                        this._direction = null;
                        this._snapType = null;
                        this._snapPointX = null;
                        this._snapPointY = null;
                        this._originOffsetX = null;
                        this._originOffsetY = null;
                        this._publishOrPreviewSubscription = null;
                        this._prevVisibility = null;
                        this._nextVisibility = null;
                        this._prevText = null;
                        this._nextText = null;
                        this._layoutSubscription = null;
                        this._ownerDescendantSelectedSubscription = null;
                        this._isLoaded = !1;
                        this._templateContainerClickListener = null;
                        this._galleryControl = galleryControl;
                        this._controlContext = controlContext;
                        this._bindingContext = controlContext.bindingContext;
                        this._galleryRenderer = new Gallery.GalleryRenderer(this._galleryControl, this._controlContext, this);
                        this._hasScrolled = !1;
                        this._initContentElements();
                        this._initComputedValues();
                        this._publishOrPreviewSubscription = this._galleryControl.isPublishOrPreview.subscribe(this.onPublishOrPreview.bind(this));
                        this._prevVisibility = ko.observable(!1);
                        this._nextVisibility = ko.observable(!1);
                        this.onPublishOrPreview();
                        this._layoutSubscription = this.layout.subscribe(function() {
                            this.setItemsElementSize();
                            this._scrollToVisibleIndex()
                        }.bind(this));
                        this._controlContext.isTemplate && (this._initAuthoringTemplate(), AppMagic.AuthoringTool.Runtime.isAuthoring && this._initAuthoringButtons());
                        this._isLoaded = !0
                    }
                    return Object.defineProperty(GalleryViewModel.prototype, "rootElement", {
                            get: function() {
                                return this._root
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(GalleryViewModel.prototype, "templateElement", {
                            get: function() {
                                return this._template
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(GalleryViewModel.prototype, "nestedTemplateSelected", {
                                get: function() {
                                    return this.nestedTemplate && this.nestedTemplate.selected
                                }, enumerable: !0, configurable: !0
                            }), GalleryViewModel.prototype.getViewElement = function(className) {
                                var elements = this._controlContext.container.getElementsByClassName(className);
                                return elements[0]
                            }, GalleryViewModel.prototype.onPublishOrPreview = function() {
                                this._galleryControl.isPublishOrPreview() ? WinJS.Utilities.addClass(this._templateItem, "preview") : WinJS.Utilities.removeClass(this._templateItem, "preview")
                            }, GalleryViewModel.prototype.onClickEditTemplateButton = function() {
                                this.nestedTemplate.select();
                                this._showTemplateOrFirstItem()
                            }, GalleryViewModel.prototype.renderGallery = function() {
                                this._root.onscroll = null;
                                this._galleryRenderer.startRenderIncremental();
                                this._root.onscroll = this.handleScrollOrResize.bind(this);
                                this.updateNextAndPrevVisibility()
                            }, GalleryViewModel.prototype.handleKeyDown = function(context, evt) {
                                return evt.key === "End" ? (this.setVisibleIndex(this._itemsLength()), this._galleryRenderer.startRenderIncremental(), evt.preventDefault, !1) : evt.key === "Home" ? (this.setVisibleIndex(1), this._galleryRenderer.startRenderIncremental(), evt.preventDefault, !1) : !0
                            }, GalleryViewModel.prototype.handleScrollOrResize = function() {
                                this._hasScrolled = !0;
                                this._updateVisibleIndex();
                                this._galleryRenderer.renderIncremental()
                            }, GalleryViewModel.prototype.handleTemplateResize = function() {
                                this.setItemsElementSize();
                                this._scrollToVisibleIndex();
                                this._galleryRenderer.renderIncremental()
                            }, GalleryViewModel.prototype.setItemsElementSize = function() {
                                var len = this._itemsLength(),
                                    props = this._controlContext.modelProperties,
                                    verticalLayout = this.layout() === "vertical",
                                    endMargin = 0;
                                len > 0 && props.Snap.getValue() && (endMargin = verticalLayout ? props.Height.getValue() % this._templateSize() : props.Width.getValue() % this._templateSize());
                                endMargin = Math.max(endMargin, props.TemplatePadding.getValue());
                                var itemsElementLength = Math.min(Gallery.BROWSER_MAX_WIDTH_LIMIT, this._templateSize() * len + endMargin - this._galleryRenderer.pageOffset);
                                if (itemsElementLength < 0) {
                                    var adjustment = Math.ceil(-itemsElementLength / Gallery.BROWSER_INCREMENTAL_OFFSET) * Gallery.BROWSER_INCREMENTAL_OFFSET;
                                    isFinite(adjustment) || (adjustment = this._galleryRenderer.pageOffset);
                                    this._galleryRenderer.pageOffset -= adjustment;
                                    itemsElementLength += adjustment
                                }
                                verticalLayout ? (this._itemsElement.style.width = "auto", this._itemsElement.style.height = itemsElementLength + "px") : (this._itemsElement.style.width = itemsElementLength + "px", this._itemsElement.style.height = "auto");
                                this.updateNextAndPrevVisibility()
                            }, GalleryViewModel.prototype.getWindowIndices = function(len) {
                                var result = {
                                        min: 0, max: 0, templateSize: this._templateSize()
                                    },
                                    verticalLayout = this.layout() === "vertical",
                                    viewSize = verticalLayout ? this._controlContext.properties.Height() : this._controlContext.properties.Width(),
                                    itemsInView = viewSize / result.templateSize,
                                    maxOffset = Math.floor(len - itemsInView) * result.templateSize,
                                    physicalOffset = this._hasScrolled ? verticalLayout ? this._root.scrollTop : this._root.scrollLeft : 0,
                                    offset = Math.min(maxOffset, physicalOffset + this._galleryRenderer.pageOffset),
                                    itemsInOffset = offset / result.templateSize,
                                    itemPadding = itemsInView / 2;
                                return itemsInView > 0 && (result.max = Math.max(0, Math.min(len - 1, Math.ceil(itemsInOffset + itemsInView + itemPadding))), result.min = Math.max(Math.floor(itemsInOffset - itemPadding), 0)), result
                            }, GalleryViewModel.prototype.setVisibleIndex = function(oneBasedIndex) {
                                this._controlContext.modelProperties.VisibleIndex.setValue(Core.Utility.clamp(oneBasedIndex, 1, this._itemsLength()));
                                this._scrollToVisibleIndex()
                            }, GalleryViewModel.prototype.updateNextAndPrevVisibility = function() {
                                if (this._prevVisibility && this._nextVisibility) {
                                    var isVertical = this.layout() === "vertical",
                                        props = this._controlContext.modelProperties;
                                    if (this._itemsLength() <= 1 || !props.Visible.getValue() || !props.ShowNavigation.getValue()) {
                                        this._prevVisibility(!1);
                                        this._nextVisibility(!1);
                                        return
                                    }
                                    var direction = !0;
                                    typeof this._direction == "function" && (direction = this._direction() === "ltr");
                                    isVertical ? this._controlContext.modelProperties.Height.getValue() < this._templateSize() ? this._root.offsetHeight === this._root.scrollHeight ? (this._prevVisibility(!1), this._nextVisibility(!1)) : this._calculateWithVisibleIndex(direction) : this._root.offsetHeight === this._root.scrollHeight ? (this._prevVisibility(!1), this._nextVisibility(!1)) : this._root.scrollTop === 0 ? (this._prevVisibility(!direction), this._nextVisibility(direction)) : this._root.scrollTop + this._root.offsetHeight >= this._root.scrollHeight - 1 - this._controlContext.modelProperties.TemplatePadding.getValue() ? (this._prevVisibility(direction), this._nextVisibility(!direction)) : (this._prevVisibility(!0), this._nextVisibility(!0)) : this._controlContext.modelProperties.Width.getValue() < this._templateSize() ? this._root.offsetWidth === this._root.scrollWidth ? (this._prevVisibility(!1), this._nextVisibility(!1)) : this._calculateWithVisibleIndex(direction) : this._root.offsetWidth === this._root.scrollWidth ? (this._prevVisibility(!1), this._nextVisibility(!1)) : this._root.scrollLeft === 0 ? (this._prevVisibility(!direction), this._nextVisibility(direction)) : this._root.scrollLeft + this._root.offsetWidth >= this._root.scrollWidth - 1 - this._controlContext.modelProperties.TemplatePadding.getValue() ? (this._prevVisibility(direction), this._nextVisibility(!direction)) : (this._prevVisibility(!0), this._nextVisibility(!0))
                                }
                            }, GalleryViewModel.prototype.dispose = function() {
                                this._root.onscroll = null;
                                this._bindingContext = null;
                                this.layout.dispose();
                                this.layout = null;
                                this._galleryRenderer.dispose();
                                this._galleryRenderer = null;
                                this._root = null;
                                this._galleryContainer = null;
                                this._itemsElement = null;
                                this._templateItem = null;
                                this._template = null;
                                this._hiddenArea = null;
                                this.nestedTemplate = null;
                                this._templateWidth.dispose();
                                this._templateWidth = null;
                                this._isLoaded = !1;
                                this._templateHeight.dispose();
                                this._templateHeight = null;
                                this._templateSize.dispose();
                                this._templateSize = null;
                                this._itemsLength.dispose();
                                this._itemsLength = null;
                                this._templateItemDisplay.dispose();
                                this._templateItemDisplay = null;
                                this._templateContainerMarginTop.dispose();
                                this._templateContainerMarginTop = null;
                                this._templateContainerMarginLeft.dispose();
                                this._templateContainerMarginLeft = null;
                                this._templateContainerMarginRight.dispose();
                                this._templateContainerMarginRight = null;
                                this._itemsMarginLeftRight.dispose();
                                this._itemsMarginTopBottom = null;
                                this._transition.dispose();
                                this._transition = null;
                                this._direction.dispose();
                                this._direction = null;
                                this._snapType.dispose();
                                this._snapType = null;
                                this._snapPointX.dispose();
                                this._snapPointX = null;
                                this._snapPointY.dispose();
                                this._snapPointY = null;
                                this._publishOrPreviewSubscription.dispose();
                                this._publishOrPreviewSubscription = null;
                                this._prevVisibility = null;
                                this._nextVisibility = null;
                                this._prevText.dispose();
                                this._prevText = null;
                                this._nextText.dispose();
                                this._nextText = null;
                                this._layoutSubscription.dispose();
                                this._layoutSubscription = null;
                                this._controlContext.isTemplate && (this._templateContainer.removeEventListener("click", this._templateContainerClickListener), this._templateContainerClickListener = null, AppMagic.AuthoringTool.Runtime.isAuthoring && (this._ownerDescendantSelectedSubscription.dispose(), this._ownerDescendantSelectedSubscription = null, this.ownerDescendantSelected.dispose(), this.ownerDescendantSelected = null), this._templateContainer = null, this._galleryControl.OpenAjax.controlManager.removeNestedCanvas(this._galleryControl.OpenAjax.getId(), 0))
                            }, GalleryViewModel.prototype._initContentElements = function() {
                                this._root = this.getViewElement("appmagic-gallery");
                                this._galleryContainer = this.getViewElement("appmagic-gallery-container");
                                this._itemsElement = this.getViewElement("appmagic-gallery-items");
                                this._templateItem = this.getViewElement("appmagic-gallery-template-item");
                                this._template = this.getViewElement("appmagic-gallery-template");
                                this._hiddenArea = this.getViewElement("appmagic-gallery-hiddenarea")
                            }, GalleryViewModel.prototype._initComputedValues = function() {
                                var viewProps = this._controlContext.properties,
                                    layout = this.layout = ko.computed(function() {
                                        return viewProps.Layout() === "vertical" ? "vertical" : "horizontal"
                                    });
                                this._offset = ko.observable(0);
                                var controlContext = this._controlContext;
                                this._templateWidth = ko.computed(function() {
                                    return layout() === "vertical" ? "100%" : viewProps.TemplateWidth() + "px"
                                });
                                this._templateHeight = ko.computed(function() {
                                    return layout() === "vertical" ? viewProps.TemplateHeight() + "px" : "100%"
                                });
                                this._templateSize = ko.computed(function() {
                                    return Math.max(0, viewProps.TemplatePadding() + (layout() === "vertical" ? viewProps.TemplateHeight() : viewProps.TemplateWidth()))
                                });
                                this._itemsLength = ko.computed(function() {
                                    var items = this._controlContext.properties.Items();
                                    return items ? items.length : 0
                                }.bind(this));
                                this._templateItemDisplay = ko.computed(function() {
                                    return this._galleryControl.isPublishOrPreview() && this._itemsLength() === 0 ? "none" : ""
                                }, this);
                                var direction = this._direction = ko.computed(function() {
                                        var dir = "ltr";
                                        if (layout() === "horizontal") {
                                            var value = viewProps.Direction();
                                            value !== null && value.toLowerCase() === "end" && (dir = "rtl")
                                        }
                                        return dir
                                    });
                                this._templateContainerMarginTop = ko.computed(function() {
                                    return layout() === "vertical" ? viewProps.TemplatePadding() + "px" : "0"
                                });
                                this._templateContainerMarginLeft = ko.computed(function() {
                                    return direction() === "rtl" ? "0" : layout() === "vertical" ? "0" : viewProps.TemplatePadding() + "px"
                                });
                                this._templateContainerMarginRight = ko.computed(function() {
                                    return direction() === "ltr" ? "0" : layout() === "vertical" ? "0" : viewProps.TemplatePadding() + "px"
                                });
                                this._itemsMarginLeftRight = ko.computed(function() {
                                    return layout() === "vertical" ? viewProps.TemplatePadding() + "px" : "auto"
                                });
                                this._itemsMarginTopBottom = ko.computed(function() {
                                    return layout() === "vertical" ? "auto" : viewProps.TemplatePadding() + "px"
                                });
                                this._transition = ko.computed(function() {
                                    var value = viewProps.Transition();
                                    if (value !== null) {
                                        value = value.toLowerCase();
                                        switch (value) {
                                            case"push":
                                                return "selectPush";
                                            case"pop":
                                                return "selectPop"
                                        }
                                    }
                                    return ""
                                });
                                this._snapType = ko.computed(function() {
                                    return viewProps.Snap() ? "mandatory" : "none"
                                });
                                this._snapPointX = ko.computed(function() {
                                    var width = viewProps.TemplateWidth() + viewProps.TemplatePadding() + "px";
                                    return layout() === "horizontal" && viewProps.Snap() ? "snapInterval(0px, " + width + ")" : ""
                                });
                                this._snapPointY = ko.computed(function() {
                                    var height = viewProps.TemplateHeight() + viewProps.TemplatePadding() + "px";
                                    return layout() === "vertical" && viewProps.Snap() ? "snapInterval(0px, " + height + ")" : ""
                                });
                                this._prevText = ko.computed(function() {
                                    return layout() === "vertical" ? AppMagic.AuthoringTool.SegoeGlyphs.up : AppMagic.AuthoringTool.SegoeGlyphs.left
                                });
                                this._nextText = ko.computed(function() {
                                    return layout() === "vertical" ? AppMagic.AuthoringTool.SegoeGlyphs.down : AppMagic.AuthoringTool.SegoeGlyphs.right
                                })
                            }, GalleryViewModel.prototype._updateVisibleIndex = function() {
                                var verticalLayout = this.layout() === "vertical",
                                    offset = verticalLayout ? this._root.scrollTop : this._root.scrollLeft;
                                this._offset(offset);
                                var calculatedIndex = Math.floor(this._templateSize() === 0 ? 0 : offset / this._templateSize()) + 1;
                                calculatedIndex !== this._controlContext.modelProperties.VisibleIndex.getValue() && this._controlContext.modelProperties.VisibleIndex.setValue(calculatedIndex);
                                this.updateNextAndPrevVisibility()
                            }, GalleryViewModel.prototype._scrollToVisibleIndex = function() {
                                var zeroBasedIndex = this._controlContext.modelProperties.VisibleIndex.getValue() - 1;
                                zeroBasedIndex < 0 && (zeroBasedIndex = 0);
                                var totalOffset = this._templateSize() * zeroBasedIndex,
                                    newPageOffset = Math.floor(totalOffset / Gallery.BROWSER_INCREMENTAL_OFFSET) * Gallery.BROWSER_INCREMENTAL_OFFSET;
                                this._galleryRenderer.pageOffset = newPageOffset;
                                var newOffset = totalOffset % Gallery.BROWSER_INCREMENTAL_OFFSET;
                                this.layout() === "vertical" ? (this._root.scrollLeft = 0, this._root.scrollTop = newOffset) : (this._root.scrollLeft = newOffset, this._root.scrollTop = 0)
                            }, GalleryViewModel.prototype._resizeAuthoringTemplate = function(x, y, width, height) {
                                var padding = this._controlContext.properties.TemplatePadding(),
                                    adjustedX = x - this._originOffsetX(),
                                    adjustedY = y - this._originOffsetY(),
                                    oldX = this._controlContext.modelProperties.X.getValue(),
                                    oldY = this._controlContext.modelProperties.Y.getValue();
                                this._galleryControl.OpenAjax.updatePropertyValue("Y", adjustedY, !0);
                                var oldTemplateSize = this._controlContext.modelProperties.TemplateSize.getValue();
                                if (this.layout() === "horizontal") {
                                    this._galleryControl.OpenAjax.updatePropertyValue("Height", height + padding * 2, !0);
                                    var galleryWidth = this._controlContext.modelProperties.Width.getValue();
                                    this._direction() === "rtl" ? galleryWidth += width - oldTemplateSize - oldX + adjustedX : (galleryWidth += oldX - adjustedX, this._galleryControl.OpenAjax.updatePropertyValue("X", adjustedX, !0));
                                    this._galleryControl.OpenAjax.updatePropertyValue("Width", galleryWidth, !0);
                                    width > galleryWidth - padding && (width = galleryWidth - padding);
                                    this._galleryControl.OpenAjax.updatePropertyValue("TemplateSize", width, !0)
                                }
                                else {
                                    this._galleryControl.OpenAjax.updatePropertyValue("X", adjustedX, !0);
                                    this._galleryControl.OpenAjax.updatePropertyValue("Width", width + padding * 2, !0);
                                    var galleryHeight = this._controlContext.modelProperties.Height.getValue();
                                    galleryHeight += oldY - adjustedY;
                                    this._galleryControl.OpenAjax.updatePropertyValue("Height", galleryHeight, !0);
                                    height > galleryHeight - padding && (height = galleryHeight - padding);
                                    this._galleryControl.OpenAjax.updatePropertyValue("TemplateSize", height, !0)
                                }
                            }, GalleryViewModel.prototype._initAuthoringTemplate = function() {
                                var _this = this;
                                this._originOffsetX = ko.computed(function() {
                                    var offsetX = _this._controlContext.properties.TemplatePadding();
                                    return _this.layout() === "horizontal" && (offsetX -= _this._offset(), _this._direction() === "rtl" && (offsetX = _this._controlContext.properties.Width() - _this._controlContext.properties.TemplateWidth() - offsetX)), offsetX
                                });
                                this._originOffsetY = ko.computed(function() {
                                    var offsetY = _this._controlContext.properties.TemplatePadding();
                                    return _this.layout() === "vertical" && (offsetY -= _this._offset()), offsetY
                                });
                                this.nestedTemplate = this._galleryControl.OpenAjax.controlManager.createNestedCanvas(this._galleryControl.OpenAjax.getId(), 0, this._template, this._controlContext.properties.TemplateWidth, this._controlContext.properties.TemplateHeight, {
                                    childCanvasId: 1, replicateControls: !0, originOffsetX: this._originOffsetX, originOffsetY: this._originOffsetY, templateWidth: this._controlContext.properties.TemplateWidth, templateHeight: this._controlContext.properties.TemplateHeight, resizeCanvas: this._resizeAuthoringTemplate.bind(this)
                                });
                                AppMagic.AuthoringTool.Runtime.isAuthoring && (this.ownerDescendantSelected = ko.computed(function() {
                                    return _this.nestedTemplate.ownerDescendantSelected
                                }), this._ownerDescendantSelectedSubscription = this.ownerDescendantSelected.subscribe(function(value) {
                                    value && _this._showTemplateOrFirstItem()
                                }));
                                this._galleryRenderer.instantiateItemContainerTemplate(this._templateItem);
                                this._templateContainer = this._templateItem.firstElementChild;
                                var authoringAreaBindingContext = this._galleryControl.OpenAjax.replicatedContextManager.authoringAreaBindingContext;
                                this._templateContainerClickListener = function(evt) {
                                    var len = _this._controlContext._replicatedContext.getBindingContextCount();
                                    if (len > 0) {
                                        var rowBindingContext = _this._controlContext._replicatedContext.bindingContextAt(0);
                                        _this._controlContext._replicatedContext.notifyBindingContextSelectionInteraction(rowBindingContext, !1)
                                    }
                                };
                                this._templateContainer.addEventListener("click", this._templateContainerClickListener);
                                authoringAreaBindingContext.container = this._templateContainer;
                                this._template.parentElement.removeChild(this._template);
                                this._templateContainer.appendChild(this._template)
                            }, GalleryViewModel.prototype._showTemplateOrFirstItem = function() {
                                this.layout() === "vertical" ? this._root.scrollTop = 0 : this._root.scrollLeft = 0
                            }, GalleryViewModel.prototype._initAuthoringButtons = function() {
                                var authoringButtonsContent = document.createElement("div"),
                                    templateName = "appmagic-template-gallery-authoringbuttons";
                                ko.renderTemplate(templateName, this, {name: templateName}, authoringButtonsContent);
                                this._galleryContainer.appendChild(authoringButtonsContent.firstElementChild)
                            }, GalleryViewModel.prototype.nextOrPrevious = function(addOrSubtract) {
                                var step = this._controlContext.modelProperties.NavigationStep.getValue() * (this._direction() === "rtl" ? -1 : 1) * addOrSubtract,
                                    currentVisibleIndex = this._controlContext.modelProperties.VisibleIndex.getValue();
                                this._controlContext.modelProperties.VisibleIndex.setValue(currentVisibleIndex + step);
                                this._scrollToVisibleIndex()
                            }, GalleryViewModel.prototype._calculateWithVisibleIndex = function(direction) {
                                var visibleIndex = this._controlContext.modelProperties.VisibleIndex.getValue();
                                visibleIndex === 1 ? (this._prevVisibility(!direction), this._nextVisibility(direction)) : visibleIndex >= this._itemsLength() ? (this._prevVisibility(direction), this._nextVisibility(!direction)) : (this._prevVisibility(!0), this._nextVisibility(!0))
                            }, Object.defineProperty(GalleryViewModel.prototype, "controlContext", {
                                get: function() {
                                    return this._controlContext
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GalleryViewModel.prototype, "snapType", {
                                get: function() {
                                    return this._snapType
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GalleryViewModel.prototype, "snapPointX", {
                                get: function() {
                                    return this._snapPointX
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GalleryViewModel.prototype, "snapPointY", {
                                get: function() {
                                    return this._snapPointY
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GalleryViewModel.prototype, "direction", {
                                get: function() {
                                    return this._direction
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GalleryViewModel.prototype, "itemsMarginTopBottom", {
                                get: function() {
                                    return this._itemsMarginTopBottom
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GalleryViewModel.prototype, "itemsMarginLeftRight", {
                                get: function() {
                                    return this._itemsMarginLeftRight
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GalleryViewModel.prototype, "templateItemDisplay", {
                                get: function() {
                                    return this._templateItemDisplay
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GalleryViewModel.prototype, "transition", {
                                get: function() {
                                    return this._transition
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GalleryViewModel.prototype, "prevText", {
                                get: function() {
                                    return this._prevText
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GalleryViewModel.prototype, "prevVisibility", {
                                get: function() {
                                    return this._prevVisibility
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GalleryViewModel.prototype, "nextText", {
                                get: function() {
                                    return this._nextText
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GalleryViewModel.prototype, "nextVisibility", {
                                get: function() {
                                    return this._nextVisibility
                                }, enumerable: !0, configurable: !0
                            }), Object.defineProperty(GalleryViewModel.prototype, "isPublishOrPreview", {
                                get: function() {
                                    return this._galleryControl.isPublishOrPreview()
                                }, enumerable: !0, configurable: !0
                            }), GalleryViewModel
                }();
            Gallery.GalleryViewModel = GalleryViewModel
        })(Gallery = Controls.Gallery || (Controls.Gallery = {}))
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));