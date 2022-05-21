
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug*/
Jx.delayDefine(Mail, "AriaFlows", function () {
    "use strict";

    var AriaFlows = Mail.AriaFlows = function (component, excluded) {
        Debug.assert(Jx.isObject(component));
        Debug.assert(Jx.isNullOrUndefined(excluded) || Jx.isNonEmptyString(excluded));

        this.initComponent();
        this._child = component;
        this.appendChild(component);

        this._excluded = excluded;
        this._job = null;

        this._startId = "ariaFlowStart" + this._id;
        this._endId = "ariaFlowEnd" + this._id;
    };
    Jx.inherit(AriaFlows, Jx.Component);
    var prototype = AriaFlows.prototype;

    prototype.getUI = function (ui) {
        ui.html = "<div id='" + this._id + "'>" +
                      "<div id='" + this._startId + "' aria-hidden='true'></div>" +
                      Jx.getUI(this._child).html +
                      "<div id='" + this._endId + "' aria-hidden='true'></div>" +
                  "</div>";
    };

    prototype.onActivateUI = function () {
        this.on("contentUpdated", this._queueUpdate, this);
        this._queueUpdate();
    };

    prototype.onDeactivateUI = function () {
        Jx.dispose(this._job);
        this.detach("contentUpdated", this._queueUpdate, this);
    };

    prototype._queueUpdate = function () {
        Jx.dispose(this._job);
        this._job = Jx.scheduler.addJob(null, Mail.Priority.updateAriaFlow, null, this._update, this);
    };

    prototype._update = function () {
        var root = document.getElementById(this._id);

        var allElements = root.querySelectorAll("[role]");
        var flowElements = [], excludedElements = [];
        var excluded = this._excluded;
        for (var i = 0, len = allElements.length; i < len; ++i) {
            var element = allElements[i];
            if (element.getAttribute("role") !== "list") { // Don't involve container elements in our flow shenanigans
                if ((Jx.isNonEmptyString(excluded) && element.msMatchesSelector(excluded)) ||
                     getComputedStyle(element).display === "none") {
                    excludedElements.push(element);
                } else {
                    flowElements.push(element);
                }
            }
        }

        var setSize = 0;
        for (i = 0, len = flowElements.length; i < len; ++i) {
            if (flowElements[i].getAttribute("role") === "option") {
                setSize++;
            }
        }

        var posInSet = 0;
        for (i = 0, len = flowElements.length; i < len; ++i) {
            element = flowElements[i];
            Mail.setAttribute(element, "x-ms-aria-flowfrom", (i > 0) ? ensureId(flowElements[i - 1]) : this._startId);
            Mail.setAttribute(element, "aria-flowto", (i < len - 1) ? ensureId(flowElements[i + 1]) : this._endId);
            if (element.getAttribute("role") === "option") {
                posInSet++;
                Mail.setAttribute(element, "aria-posinset", posInSet.toString());
                Mail.setAttribute(element, "aria-setsize", setSize.toString());
            } else {
                element.removeAttribute("aria-posinset");
                element.removeAttribute("aria-setsize");
            }
            element.removeAttribute("aria-hidden");
        }

        for (i = 0, len = excludedElements.length; i < len; ++i) {
            var element = excludedElements[i];
            element.removeAttribute("x-ms-aria-flowfrom");
            element.removeAttribute("aria-flowto");
            element.removeAttribute("aria-posinset");
            element.removeAttribute("aria-setsize");
            Mail.setAttribute(element, "aria-hidden", "true");
        }
    };

    function ensureId(element) {
        Debug.assert(Jx.isHTMLElement(element));
        var id = element.id;
        if (!id) {
            id = element.id = "ariaFlowStep" + Jx.uid();
        }
        return id;
    }
});
