/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function(undefined) {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {TemplateSelector: MS.Entertainment.UI.Framework.defineUserControl(null, function templateSelectorConstructor(element, options){}, {
            _renderedTemplate: null, _renderedModel: null, controlName: "TemplateSelector", initialize: function initialize() {
                    var that = this;
                    this.bind("model", function() {
                        that.render()
                    });
                    this.bind("selectors", function(newValue, oldValue) {
                        if (oldValue !== undefined)
                            that.render()
                    })
                }, selectTemplate: function selectTemplate() {
                    var i = 0;
                    var selector;
                    var template;
                    var count = (Array.isArray(this.selectors)) ? this.selectors.length : 0;
                    for (i = 0; i < count; i++) {
                        selector = this.selectors[i];
                        if (selector)
                            template = selector(this.model);
                        if (template)
                            break
                    }
                    return template
                }, refresh: function refresh() {
                    if (this._renderedModel && this._renderedTemplate) {
                        this._renderedModel = null;
                        this._renderedTemplate = null;
                        this.render()
                    }
                }, render: function render() {
                    var renderModel = this.model;
                    var template = this.selectTemplate();
                    if (this._renderedModel !== renderModel || this._renderedTemplate !== template) {
                        this._renderedModel = renderModel;
                        this._renderedTemplate = template;
                        if (renderModel && typeof template === "string")
                            MS.Entertainment.UI.Framework.loadTemplate(template).then(function finalizeRender(templateProvider) {
                                if (this._renderedModel === renderModel && this._renderedTemplate === template) {
                                    MS.Entertainment.Utilities.empty(this.domElement);
                                    return templateProvider.render(renderModel, this.domElement)
                                }
                            }.bind(this));
                        else
                            MS.Entertainment.Utilities.empty(this.domElement)
                    }
                }
        }, {
            selectors: null, model: null
        })})
})()
