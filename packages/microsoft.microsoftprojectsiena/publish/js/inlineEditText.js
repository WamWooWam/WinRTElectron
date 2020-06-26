//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(global) {"use strict";
    ko.bindingHandlers.inlineEditText = {init: function(element, valueAccessor) {
            var observableText = valueAccessor();
            var text = ko.utils.unwrapObservable(observableText);
            var onTextUpdated = function(newValue) {
                    newValue === null && (newValue = "");
                    element.innerText = newValue
                };
            observableText.subscribe(function(newValue) {
                newValue === null && (newValue = "");
                newValue !== text && (text = newValue, onTextUpdated(text))
            });
            onTextUpdated(text)
        }}
})(this);