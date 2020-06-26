//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    WinJS.Namespace.define("AppMagic.CSSRuleUtility", {
        _styleSheet: null, addRule: function(cssRules) {
                var stylesheet = this._getStyleSheet();
                var rule = "";
                for (var prop in cssRules.ruleValues)
                    rule = rule + prop + ": " + cssRules.ruleValues[prop] + ";";
                try {
                    stylesheet.addRule(cssRules.ruleName, rule)
                }
                catch(ex) {}
            }, removeRule: function(cssRule) {
                for (var stylesheet = this._getStyleSheet(), rulesLen = stylesheet.rules.length, i = rulesLen - 1; i >= 0; i--)
                    if (stylesheet.rules[i].selectorText === cssRule) {
                        stylesheet.removeRule && stylesheet.removeRule(i);
                        return
                    }
            }, overwriteRule: function(cssOldRuleName, cssNewRule) {
                var stylesheet = this._getStyleSheet();
                this.addRule(cssNewRule);
                this.removeRule(cssOldRuleName)
            }, _getStyleSheet: function() {
                if (!this._styleSheet) {
                    var styleElement = document.createElement("style");
                    styleElement.type = "text/css";
                    document.head.appendChild(styleElement);
                    this._styleSheet = styleElement.sheet
                }
                return this._styleSheet
            }
    })
})();