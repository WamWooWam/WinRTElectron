//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var RequirementsManager = WinJS.Class.define(function RequirementsManager_ctor() {
            this._injectionCache = {}
        }, {
            _injectionCache: null, _shouldInclude: function(req) {
                    return Contracts.checkValue(req), !req.authoringOnly && req.shouldInclude
                }, ensureRequirements: function(requirements) {
                    Contracts.checkValue(requirements);
                    var asyncRequirements = [],
                        count;
                    typeof requirements == "object" && (typeof requirements.length == "number" ? count = requirements.length : typeof requirements.size == "number" && (count = requirements.size));
                    Contracts.checkNumber(count, "The requirements parameter must contain a length or a size");
                    for (var i = 0; i < count; i++) {
                        var req = requirements[i];
                        this._shouldInclude(req) && asyncRequirements.push(this.loadRequirement(req))
                    }
                    return WinJS.Promise.join(asyncRequirements)
                }, loadRequirement: function(req) {
                    if (Contracts.checkValue(req), Contracts.checkValue(req.resource, "When calling loadRequirements, the 'req' parameter object must contain a resource element"), Contracts.checkNumber(req.requirementType, "When calling loadRequirements, the 'req' parameter object must contain a valid requirementType element"), this._injectionCache[req.resource])
                        return this._injectionCache[req.resource];
                    var promise;
                    switch (req.requirementType) {
                        case Microsoft.AppMagic.Authoring.ControlRequirementType.javaScript:
                            promise = AppMagic.AuthoringTool.DomUtil.injectScript(req.resource);
                            break;
                        case Microsoft.AppMagic.Authoring.ControlRequirementType.css:
                            promise = AppMagic.AuthoringTool.DomUtil.injectCss(req.resource);
                            break;
                        case Microsoft.AppMagic.Authoring.ControlRequirementType.markup:
                            promise = AppMagic.AuthoringTool.DomUtil.injectMarkup(req.resource);
                            break;
                        default:
                            Contracts.check(!1, ["Unknown requirement type '", req.requirementType, "' encountered."].join(""));
                            break
                    }
                    return promise ? (this._injectionCache[req.resource] = WinJS.Promise.as(promise), this._injectionCache[req.resource]) : WinJS.Promise.wrapError("The requirementManager class was called incorrectly")
                }
        });
    WinJS.Namespace.define("AppMagic.Controls", {RequirementsManager: RequirementsManager})
})();