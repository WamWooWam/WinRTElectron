//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var E_UNEXPECTED = -2147418113,
        E_NOTIMPL = -2147467263;
    ko.bindingHandlers.mediaattr = {update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var attrMap = ko.utils.unwrapObservable(valueAccessor());
            for (var attrName in attrMap)
                if (attrMap.hasOwnProperty(attrName)) {
                    var attrValue = ko.utils.unwrapObservable(attrMap[attrName]);
                    try {
                        element[attrName] = attrValue
                    }
                    catch(err) {
                        if (!(err instanceof Error && (err.number === E_UNEXPECTED || err.number === E_NOTIMPL)))
                            throw err;
                    }
                }
        }};
    ko.bindingHandlers.winjsattr = {update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var attrMap = ko.utils.unwrapObservable(valueAccessor());
            for (var attrName in attrMap)
                if (attrMap.hasOwnProperty(attrName)) {
                    var attrValue = ko.utils.unwrapObservable(attrMap[attrName]);
                    element.winControl[attrName] = attrValue
                }
        }};
    var originalRender = ko.nativeTemplateEngine.prototype.renderTemplateSource;
    ko.nativeTemplateEngine.prototype.renderTemplateSource = function(templateSource, bindingContext, options) {
        return AppMagic.Utility.execUnsafeLocalFunction(function() {
                return originalRender(templateSource, bindingContext, options)
            })
    };
    ko.bindingHandlers.winjsControl = {
        init: function(element) {
            return element.renderedHtmlControlUri ? {} : {controlsDescendantBindings: !0}
        }, update: function(element, valueAccessor) {
                var uri = ko.utils.unwrapObservable(valueAccessor());
                uri !== element.renderedHtmlControlUri && (element.renderedHtmlControlUri && (ko.virtualElements.emptyNode(element), element.renderedHtmlControlUri = null), uri.length > 0 && (element.renderedHtmlControlUri = uri, AppMagic.MarkupService.instance.render(uri, element)))
            }
    };
    ko.bindingHandlers.property = {update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var propertyMap = ko.utils.unwrapObservable(valueAccessor());
            for (var propertyName in propertyMap)
                if (propertyMap.hasOwnProperty(propertyName)) {
                    var propertyValue = ko.utils.unwrapObservable(propertyMap[propertyName]);
                    element[propertyName] = propertyValue
                }
        }};
    ko.bindingHandlers.observableProperty = {update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var propertyMap = ko.utils.unwrapObservable(valueAccessor());
            for (var propertyName in propertyMap)
                if (propertyMap.hasOwnProperty(propertyName)) {
                    var wrapped = propertyMap[propertyName],
                        propertyValue = ko.utils.unwrapObservable(wrapped),
                        propertyTarget = element[propertyName];
                    propertyTarget ? propertyTarget(propertyValue) : (element[propertyName] = ko.observable(propertyValue), ko.isObservable(wrapped) && element[propertyName].subscribe(function(newValue) {
                        this(newValue)
                    }, wrapped))
                }
        }}
})();