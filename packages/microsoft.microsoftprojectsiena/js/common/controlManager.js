//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(global) {"use strict";
    var MaximumZindex = AppMagic.Constants.zIndex.visualMaximum,
        ControlManager = WinJS.Class.derive(AppMagic.Utility.Disposable, function ControlManager_ctor(requirementsMgr) {
            Contracts.checkObject(requirementsMgr);
            AppMagic.Utility.Disposable.call(this);
            this._controlInstances = Object.create(null);
            this._controlCreationWaitingPromises = Object.create(null);
            this._requirementsManager = requirementsMgr;
            this._manageControlZindex = !0;
            OpenAjax.widget.setControlManager(this)
        }, {
            _manageControlZindex: null, _controlCreationWaitingPromises: null, _controlInstances: null, _requirementsManager: null, _getOrCreateWaitingPromise: function(promiseLookup, controlName) {
                    if (Contracts.checkPureObject(promiseLookup), Contracts.checkNonEmpty(controlName), controlName in promiseLookup)
                        return promiseLookup[controlName].promise;
                    var completedFunc,
                        waitingPromise = new WinJS.Promise(function(comp) {
                            completedFunc = comp
                        });
                    return promiseLookup[controlName] = {
                            promise: waitingPromise, completed: completedFunc
                        }, waitingPromise
                }, _completeWaitingPromise: function(promiseLookup, controlName, returnValue) {
                    Contracts.checkPureObject(promiseLookup);
                    Contracts.checkNonEmpty(controlName);
                    Contracts.checkDefined(returnValue);
                    controlName in promiseLookup && (Contracts.checkFunction(promiseLookup[controlName].completed), promiseLookup[controlName].completed(returnValue), delete promiseLookup[controlName])
                }, controlInstances: {get: function() {
                        return this._controlInstances
                    }}, waitForControlCreation: function(controlName) {
                    return (Contracts.checkNonEmpty(controlName), controlName in this._controlInstances) ? WinJS.Promise.wrap(this._controlInstances[controlName]) : this._getOrCreateWaitingPromise(this._controlCreationWaitingPromises, controlName)
                }, create: function(container, icontrol) {
                    Contracts.checkValue(icontrol);
                    Contracts.checkValue(icontrol.name);
                    Contracts.checkValue(icontrol.template);
                    var parentName = null;
                    icontrol.parent && (Contracts.checkNonEmpty(icontrol.parent.name), parentName = icontrol.parent.name);
                    Contracts.check(!this._controlInstances[icontrol.name]);
                    var ctrlName = icontrol.name,
                        template = icontrol.template;
                    return this._requirementsManager.ensureRequirements(template.requirements).then(function() {
                            var controlClassName = this.getClassName(template),
                                ctrl = AppMagic.Controls.ControlFactory.build(controlClassName, ctrlName, icontrol, this);
                            return ctrl.OpenAjax.initializeControl(container), this._controlInstances[ctrlName] = ctrl, this._completeWaitingPromise(this._controlCreationWaitingPromises, ctrlName, ctrl), ctrl
                        }.bind(this)).then(function(control) {
                            if (!AppMagic.Utility.isScreen(template.className) && template.positionable) {
                                var getPositioningProperty = control.OpenAjax._isReplicable ? function(propName) {
                                        return control.OpenAjax._authoringAreaControlContext.properties[propName]()
                                    } : function(propName) {
                                        return control.OpenAjax.globalControlContext.properties[propName]()
                                    };
                                container.style.position = "absolute";
                                container.setAttribute("appmagic-content-control-name", ctrlName);
                                var width = ko.computed(function() {
                                        return getPositioningProperty(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Width) + "px"
                                    }),
                                    updateWidth = function() {
                                        container.style.width = width()
                                    };
                                width.subscribe(updateWidth);
                                var height = ko.computed(function() {
                                        return getPositioningProperty(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Height) + "px"
                                    }),
                                    updateHeight = function() {
                                        container.style.height = height()
                                    };
                                height.subscribe(updateHeight);
                                var x = ko.computed(function() {
                                        return getPositioningProperty(AppMagic.AuthoringTool.OpenAjaxPropertyNames.X) + "px"
                                    }),
                                    updateX = function() {
                                        container.style.left = x()
                                    };
                                x.subscribe(updateX);
                                var y = ko.computed(function() {
                                        return getPositioningProperty(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Y) + "px"
                                    }),
                                    updateY = function() {
                                        container.style.top = y()
                                    };
                                if (y.subscribe(updateY), this._manageControlZindex) {
                                    var zindex = ko.computed(function() {
                                            return getPositioningProperty(AppMagic.AuthoringTool.OpenAjaxPropertyNames.ZIndex)
                                        }),
                                        updateZIndex = function() {
                                            container.style.zIndex = (MaximumZindex - zindex()).toString()
                                        };
                                    zindex.subscribe(updateZIndex)
                                }
                                var visible = ko.computed(function() {
                                        return getPositioningProperty(AppMagic.AuthoringTool.OpenAjaxPropertyNames.Visible)
                                    }),
                                    updateVisible = function() {
                                        container.style.display = visible() ? "" : "none"
                                    };
                                visible.subscribe(updateVisible);
                                updateVisible();
                                updateX();
                                updateY();
                                updateHeight();
                                updateWidth();
                                this._manageControlZindex && updateZIndex()
                            }
                            return control
                        }.bind(this))
                }, getClassName: function(template) {
                    return Contracts.checkValue(template), template.className
                }, createNestedCanvas: function(parentVisualName, id, element, width, height) {
                    Contracts.checkNonEmpty(parentVisualName);
                    Contracts.checkNumber(id);
                    Contracts.checkValue(element);
                    element.id = parentVisualName + "nestedcanvas" + id.toString()
                }, changeOutputType: function(){}, changeOutputTypeUsingDocType: function(controlId, propertyName, dataWithLocMap, schema){}, getInputDataType: function(controlId, propertyName) {
                    return "e"
                }, getInputDataTypeJSON: function(controlId, propertyName) {
                    return "{}"
                }
        });
    WinJS.Namespace.define("AppMagic.Controls", {ControlManager: ControlManager});
    WinJS.Namespace.define("AppMagic.Controls.Shapes", {});
    WinJS.Namespace.define("AppMagic.Controls.ControlFactory", {build: function(className, ctrlName, icontrol, ctrlMgr, onValueChangedFn, runOptimizedReplicatedDataFlowFn, onEventFn, entityPropertyChangedFn, updatePropertyRuleFn) {
            Contracts.checkNonEmpty(className);
            Contracts.checkNonEmpty(ctrlName);
            Contracts.checkValue(icontrol);
            Contracts.checkValue(ctrlMgr);
            typeof onValueChangedFn == "undefined" && (onValueChangedFn = AppMagic.AuthoringTool.Runtime.onValueChanged.bind(AppMagic.AuthoringTool.Runtime));
            Contracts.checkFunction(onValueChangedFn);
            typeof runOptimizedReplicatedDataFlowFn == "undefined" && (runOptimizedReplicatedDataFlowFn = AppMagic.AuthoringTool.Runtime.runOptimizedReplicatedDataFlow.bind(AppMagic.AuthoringTool.Runtime));
            Contracts.checkFunction(runOptimizedReplicatedDataFlowFn);
            typeof onEventFn == "undefined" && (onEventFn = AppMagic.AuthoringTool.Runtime.onEvent.bind(AppMagic.AuthoringTool.Runtime));
            Contracts.checkFunction(onEventFn);
            typeof entityPropertyChangedFn == "undefined" && (entityPropertyChangedFn = AppMagic.context && AppMagic.context.document ? AppMagic.context.documentViewModel.notifyEntityPropertyChanged.bind(AppMagic.context.documentViewModel) : null);
            Contracts.checkFunctionOrNull(entityPropertyChangedFn);
            typeof updatePropertyRuleFn == "undefined" && (updatePropertyRuleFn = AppMagic.context && AppMagic.context.document ? AppMagic.context.documentViewModel.updatePropertyRule.bind(AppMagic.context.documentViewModel) : null);
            Contracts.checkFunctionOrNull(updatePropertyRuleFn);
            for (var CtrlCtor = global, fragments = className.split("."), len = fragments.length, i = 0; CtrlCtor && i < len; i++)
                CtrlCtor = CtrlCtor[fragments[i]];
            Contracts.checkValue(CtrlCtor);
            Contracts.check(typeof CtrlCtor == "function");
            var ctrl = new CtrlCtor;
            return Contracts.checkValue(ctrl), ctrl.OpenAjax = new AppMagic.Controls.ControlWidget(ctrlName, ctrl, icontrol, ctrlMgr, onValueChangedFn, runOptimizedReplicatedDataFlowFn, onEventFn, entityPropertyChangedFn, updatePropertyRuleFn, AppMagic.AuthoringTool.Runtime.activeScreenIndex), ctrl
        }})
})(this);