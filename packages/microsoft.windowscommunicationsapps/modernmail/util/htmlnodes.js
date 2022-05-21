
//
// Copyright (C) Microsoft Corporation. All rights reserved.
//
/*global Mail,Jx,Debug,People*/
/*jshint browser:true*/

(function () {
    "use strict";

    var Bidi = Jx.Bidi;

    Mail.setActiveElement = function (elementId) {
        return Mail.isTopmost() && Jx.safeSetActive(document.getElementById(elementId));
    };

    Mail.setActiveHTMLElement = function (element) {
        return Mail.isTopmost() && Jx.safeSetActive(element);
    };

    Mail.setActiveElementBySelector = function (selector, rootElement) {
        /// <param name="rootElement" type="HTMLElement" />
        Debug.assert(!Jx.isNullOrUndefined(rootElement));
        return Mail.isTopmost() && Jx.safeSetActive(rootElement.querySelector(selector));
    };

    Mail.setAttribute = function (element, attributeName, attributeValue) {
        /// <param name="element" type="HTMLElement" />
        /// <param name="attributeName" type="String" />
        /// <param name="attributeValue" type="String" />
        Debug.assert(Jx.isHTMLElement(element));
        Debug.assert(Jx.isNonEmptyString(attributeName));
        Debug.assert(Jx.isString(attributeValue));

        if (element.getAttribute(attributeName) !== attributeValue) {
            element.setAttribute(attributeName, attributeValue);
        }
    };

    Mail.isElementOrDescendant = function (element, ancestor) {
        Debug.assert(Jx.isHTMLElement(element));
        Debug.assert(Jx.isHTMLElement(ancestor));

        while (element && element !== ancestor) {
            element = element.parentElement;
        }
        return element === ancestor;
    };

    Mail.isElementEditable = function (element) {
        Debug.assert(Jx.isHTMLElement(element));
        return element.tagName === "TEXTAREA" ||
               element.tagName === "INPUT" && (["button", "checkbox", "radio"].indexOf(element.type.toLowerCase()) === -1);
    };

    Mail.isTopmost = function () {
        return !document.querySelector(".overlay-root") && // Add Account dialog
               !document.querySelector(".navPaneFlyout:not(.invisible)") && // BLUE:290301  Find a better way
               !People.Accounts.AccountSettingsControl.isShowing(); // setting pane
    };

    Mail.safeRemoveNode = function (element, deep) {
        Debug.assert(Jx.isHTMLElement(element));
        Debug.assert(Jx.isBoolean(deep));

        var succeeded = null;

        try {
            succeeded = element.removeNode(deep);
        } catch (e) {
            Jx.log.exception("safeRemoveNode() failed for element with Id = " + element.id, e);
        }

        return succeeded;
    };

    Mail.applyDirection = function (el, text) {
        /// <summary>
        /// Applies the direction based on the appSettings to the element.
        /// </summary>
        /// <param name="el" type="HTMLElement"></param>
        /// <param name="text" type="String"></param>
        Debug.assert(Jx.isHTMLElement(el));
        Debug.assert(Jx.isString(text));

        if (Mail.Utilities.haveRtlLanguage()) {
            var dirSetting = Mail.Globals.appSettings.readingDirection;
            if (dirSetting === Mail.AppSettings.Direction.auto) {
                var direction = Bidi.getTextDirection(text);
                if (direction !== Bidi.Values.none) {
                    el.style.direction = direction;
                } else {
                    el.style.direction = document.body.currentStyle.direction;
                }
            } else {
                el.style.direction = dirSetting;
            }
        } else {
            el.style.direction = document.body.currentStyle.direction;
        }
    };

}());
