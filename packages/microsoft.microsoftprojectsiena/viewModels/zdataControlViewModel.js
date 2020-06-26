//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var DataControlViewModel = WinJS.Class.derive(AppMagic.AuthoringTool.ViewModels.EntityViewModel, function DataControlViewModel_ctor(doc, entityManager, dataControlModel, controlManager, ruleFactory, zoom) {
            AppMagic.AuthoringTool.ViewModels.EntityViewModel.call(this, doc, entityManager, dataControlModel, controlManager, ruleFactory, zoom)
        }, {
            _created: !1, _initialize: function() {
                    AppMagic.AuthoringTool.ViewModels.EntityViewModel.prototype._initialize.call(this);
                    this.parent.ruleButtonManager.addNestedRules(this._propertyRuleMap)
                }, notifyPropertyChanged: function(propertyName, newValue) {
                    AppMagic.AuthoringTool.ViewModels.EntityViewModel.prototype.notifyPropertyChanged.call(this, propertyName, newValue);
                    this.parent.ruleButtonManager.notifyPropertyChanged(propertyName, newValue)
                }, getChildRules: function(categoryId) {
                    return this.ruleCategories[categoryId].rules
                }, create: function() {
                    this._controlManager.waitForControlCreation(this._control.parent.name).then(function() {
                        this._created || (this._created = !0, this._controlManager.create(null, this._control))
                    }.bind(this))
                }, parent: {get: function() {
                        var parentModel = this._control.parent;
                        return parentModel ? this._entityManager.visualFromModel(parentModel) : null
                    }}
        });
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {DataControlViewModel: DataControlViewModel})
})();