
//
// Copyright (C) Microsoft. All rights reserved.
//
//
/// <reference path="../JSUtil/Include.js"/>
/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People, "IdentityControlNodeFactory", function () {
    
    var P = window.People;

    var IdentityControlNodeFactory = P.IdentityControlNodeFactory = /*@constructor*/function (elementType, elementOptions, controlOptions) {
        ///<summary>The IdentityControlNodeFactory creates identity controls with the given options using cloning</summary>
        ///<param name="elementType" type="Function"/> 
        ///<param name="elementOptions" optional="true" type="Object"/>
        ///<param name="controlOptions" optional="true" type="Object"/>
        controlOptions = controlOptions || {};
        controlOptions.role = "option";
        controlOptions.tabIndex = "-1";
        controlOptions.createJobSet = controlOptions.createJobSet || false;

        var control = this._control = new P.IdentityControl(null, null, controlOptions);
        var element = document.createElement("div");
        element.innerHTML = control.getUI(elementType, elementOptions);
        this._element = element.firstChild;
    };
    IdentityControlNodeFactory.prototype.create = function (jobSet) {
        ///<summary>Creates a clone of the template</summary>
        ///<param name="jobSet" type="P.JobSet"/>
        ///<returns type="IdentityControlNode"/>
        Debug.assert(Jx.isObject(jobSet));
        Debug.assert(Jx.isHTMLElement(this._element));
        Debug.assert(Jx.isObject(this._control));

        var clonedElement = this._element.cloneNode(true);
        var clonedControl = this._control.clone(clonedElement, null, jobSet);
        return new IdentityControlNode(clonedControl, clonedElement);
    };

    var IdentityControlNode = /*@constructor*/function (identityControl, element) {
        ///<summary>IdentityControlNode implements Node and Handler as defined by VirtualizedGrid by using an identity
        ///control</summary>
        ///<param name="identityControl" type="P.IdentityControl"/>
        ///<param name="element" type="HTMLElement"/>
        Debug.assert(Jx.isObject(identityControl));
        Debug.assert(Jx.isHTMLElement(element));

        this._identityControl = identityControl;
        this._element = element;
        element.id = this.id = "ic" + Jx.uid();
    };
    IdentityControlNode.prototype._identityControl = null;
    IdentityControlNode.prototype._element = null;
    IdentityControlNode.prototype.id = "";
    IdentityControlNode.prototype.getHandler = function () {
        return this;
    };
    IdentityControlNode.prototype.getElement = function () {
        return this._element;
    };
    IdentityControlNode.prototype.getAlignmentOffset = function () {
        var tile = this._element.querySelector(".ic-tile");
        return getComputedStyle(tile).direction === "ltr" ? tile.offsetLeft : (this._element.offsetWidth - tile.offsetLeft - tile.offsetWidth);
    };
    IdentityControlNode.prototype.setDataContext = function (dataObject) {
        this._identityControl.updateDataSource(dataObject);
    };
    IdentityControlNode.prototype.nullify = function () {
        this._identityControl.updateDataSource(null);
    };
    IdentityControlNode.prototype.dispose = function () {
        this._identityControl.shutdownUI();
    };
});
