

(function (undefined) {
    "use strict";
    WinJS.Namespace.define("MvvmJS.UI", {

        TemplateSelector: Skype.UI.ObservableControl.define(function (element, options) {
            this._doInsert = this._doInsert.bind(this);

            this.initialize(element, options);
        }, {
            _renderedTemplate: null,
            _renderedModel: {
                value: null,
                writable: true,
                skipDispose: true
            },

            initialize: function (element, options) {
                this.element = element;
                this._animate = MvvmJS.UI.TemplateSelector.Animations[options.animate ? options.animate : "default"];

                this.regBind(this, "model", this._handleModelChanged.bind(this));
                this.regBind(this, "selector", this._handleSelectorChanged.bind(this));

                this.selector = options && options.selector;
            },

            _handleModelChanged: function (newValue) {
                this.render();
            },
            _handleSelectorChanged: function (newValue) {
                if (newValue) {
                    var selectorType = newValue.type;
                    var SelectorClass = (selectorType instanceof String ? WinJS.Utilities.getMember(selectorType) : selectorType);
                    newValue.type = null;
                    this._selector = new SelectorClass(newValue);
                    this.regBind(this._selector, "template", this.render.bind(this));
                }
            },

            selectTemplate: function () {
                if (this.model && this._selector) {
                    this._selector.select(this.model);
                }
            },
            refresh: function () {
                if (this._renderedModel && this._renderedTemplate) {
                    this._renderedModel = null;
                    this._renderedTemplate = null;
                    this.render();
                }
            },
            render: function () {
                if (this.isDisposed) {
                    return;
                }

                var renderModel = this.model;
                this.selectTemplate();
                var template = this._selector && this._selector.template;
                if (this._renderedModel !== renderModel || this._renderedTemplate !== template) {
                    this._renderedModel = renderModel;
                    this._renderedTemplate = template;
                    if (renderModel && !renderModel.isDisposed && typeof template === "string") {
                        var loadTemplatePromise;
                        if (template.indexOf("#") !== -1) {
                            loadTemplatePromise = MvvmJS.UI.loadTemplateAsync(template);
                        } else {
                            loadTemplatePromise = WinJS.Promise.wrap(this.element.querySelector("[data-templateid='" + template + "']").winControl);
                        }
                        loadTemplatePromise.then(this._doRendering.bind(this, template, renderModel));
                    } else {
                        Skype.UI.Util.empty(this.element);
                    }
                }
            },
            _doRendering: function (template, renderModel, templateControl) {
                if (this.isDisposed) {
                    return;
                }
                if (this._renderedModel === renderModel && this._renderedTemplate === template) {
                    var wrap = WinJS.Promise.wrap({ data: renderModel });
                    var result = templateControl.renderItem(wrap);
                    result.renderComplete.then(this._doInsert);
                }

            },
            _doInsert: function (newChild) {
                if (this.isDisposed) {
                    return;
                }

                if (this.element) {
                    this._animate(this.element, this._lastElement, newChild);
                }
                this._lastElement = newChild;
            },

            tileUpdateAnimationQueue: null,
            tileUpdateAnimationQueueSkipDispose: true
        }, {
            selector: null,
            model: {
                value: null,
                skipDispose: true
            },
            

        }, {
            Animations: {
                "default": function (parent, oldChild, newChild) {
                    if (oldChild) {
                        Skype.UI.Util.removeFromDOM(oldChild);
                    }
                    parent.appendChild(newChild);
                },
                tileUpdate: function (parent, oldChild, newChild) { 

                    function executeNextInQueue() {
                        var currentTileUpdate;
                        if (this.tileUpdateAnimationQueue.length) {
                            currentTileUpdate = this.tileUpdateAnimationQueue[0];
                        } else {
                            return;
                        }

                        var curOldChild = parent.firstElementChild; 
                        parent.appendChild(currentTileUpdate.newChild); 

                        
                        var peekAnimation = WinJS.UI.Animation.createPeekAnimation([curOldChild, currentTileUpdate.newChild]);
                        
                        curOldChild.style.top = currentTileUpdate.sHeight;
                        currentTileUpdate.newChild.style.top = currentTileUpdate.sHeight;
                        
                        var animationPromise = peekAnimation.execute();
                        var that = this;
                        animationPromise.then(function () {
                            if (that.isDisposed) { 
                                roboSky.write("Animation,TileUpdate,finished");
                                return;
                            }

                            that.tileUpdateAnimationQueue.shift(); 
                            Skype.UI.Util.removeFromDOM(curOldChild);

                            currentTileUpdate.newChild.style.top = ""; 
                            if (that.tileUpdateAnimationQueue.length) {
                                executeNextInQueue();
                            }
                            roboSky.write("Animation,TileUpdate,finished");
                        });
                    }
                    executeNextInQueue = executeNextInQueue.bind(this);

                    if (!oldChild) {
                        parent.appendChild(newChild);
                    } else {
                        if (parent.firstElementChild) {
                            var height = parent.firstElementChild.offsetHeight; 
                            var sHeight = "-{0}px".format(height);

                            this.tileUpdateAnimationQueue = this.tileUpdateAnimationQueue || [];
                            
                            this.tileUpdateAnimationQueue.push({
                                newChild: newChild,
                                sHeight: sHeight
                            });
                            
                            if (this.tileUpdateAnimationQueue.length === 1) {
                                executeNextInQueue();
                            }
                        }
                    }
                }
            },

            renderItem: WinJS.Utilities.markSupportedForProcessing(function (itemPromise, element) {
                try {
                    if (!this._renderItem) {
                        var options = this.selector;
                        if (!options) {
                            throw "Missing render item options";
                        }

                        var selectorType = options && options.type;
                        var SelectorClass = (selectorType instanceof String ? WinJS.Utilities.getMember(selectorType) : selectorType);
                        var selector = new SelectorClass(options);

                        this._renderItem = function (model, elm) {
                            if (model.data && !model.data.isDisposed) {
                                return selector.select(model.data).then(function(path) {
                                    return MvvmJS.UI.loadTemplateAsync(path);
                                }).then(function (template) {
                                    if (model.data && !model.data.isDisposed) {
                                        return template.renderItem(WinJS.Promise.as(model));
                                    } else {
                                        return {
                                            element: document.createElement("div"),
                                            renderComplete: WinJS.Promise.as() 
                                        };
                                    }
                                });
                            } else {
                                return {
                                    element: document.createElement("div")
                                };
                            }
                        };
                    }
                    return WinJS.Promise.timeout().then(function () {
                        return itemPromise;
                    }).then(function (item) {
                        return this._renderItem(item, element);
                    }.bind(this));
                } catch (e) {

                }

                return {
                    element: document.createElement("div")
                };
            }),

        })
    });
    var propertySelector = MvvmJS.Class.define(function (options) {
        WinJS.UI.setOptions(this, options);
    }, {
        property: null,
        pattern: null,
        _model: {
            value: null,
            skipDispose: true,
            writable: true
        },

        _select: function (model) {
            var member = WinJS.Utilities.getMember(this.property, model);
            this.template = this.pattern.format(member);
        },

        select: function (model) {
            if (this._model) {
                this.unregObjectBinds(this._model);
            }
            this._model = model;
            if (this._model.bind) {
                this.regBind(this._model, this.property, this._refreshTemplate.bind(this));
            } else {
                var member = WinJS.Utilities.getMember(this.property, this._model);
                this._refreshTemplate(member);
            }
            return WinJS.Promise.as(this.template);
        },
        _refreshTemplate: function (value) {
            this.template = this.pattern.format(value);
        }
    }, {
        template: null
    });
    var constantSelector = MvvmJS.Class.define(function (options) {
        WinJS.UI.setOptions(this, options);
    }, {

        select: function (model) {
            return WinJS.Promise.as(this.template);
        }
    }, {
        template: null
    });

    WinJS.Namespace.define("MvvmJS.UI.TemplateSelector", {
        PropertySelector: WinJS.Class.mix(propertySelector, Skype.Class.disposableMixin),
        ConstantSelector: WinJS.Class.mix(constantSelector, Skype.Class.disposableMixin)
    });

})();