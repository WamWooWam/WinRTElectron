
//
// Copyright (C) Microsoft. All rights reserved.
//

Jx.delayDefine(People, "loadUrlRenderer", function () {

    var P = window.People;
    var R = P.UiFormRenderers;

    P.loadUrlRenderer = Jx.fnEmpty;

    function splitProtocol(value) {
        /// <param name="value" type="String">The string url value to be split</param>
        /// <returns type="Array" >A string array containing the parts of the url with index 0 being the protocol</returns>
        var result = ["", "", "", ""];
        if (value) {
            var trimValue = value.replace(/^\s+|\s+$/g, "");

            // split off the Protocol
            var idx = trimValue.indexOf(":");
            if (idx > 0) {
                result[0] = trimValue.substr(0, idx);
                if (trimValue.length > idx + 1) {
                    result[1] = trimValue.substr(idx + 1);
                }
            } else {
                result[1] = trimValue;
            }

            // Skip over leading slashes
            var startPos = 0;
            while (result[1][startPos] === "/") {
                startPos++;
            }

            // split off any sub path
            idx = result[1].indexOf("/", startPos);
            if (idx > 0) {
                result[2] = result[1].substr(idx);
                result[1] = result[1].substr(0, idx);
            }

            // Split off any port #
            idx = result[1].indexOf(":");
            if (idx > 0) {
                result[3] = result[1].substr(idx);
                result[1] = result[1].substr(0, idx);
            }
        }
        return result;
    };

    function isValid(value) {
        /// <param name="value" type="String">A string representing a url.</param>
        /// <returns type="Boolean" >true if http is defined otherwise false</returns>
        var result = splitProtocol(value);
        if (result[0].length === 0 || result[0].toLowerCase() === "http") {
            return true;
        }

        return false;
    };

    function decorate(value) {
        /// <param name="value" type="String">The string url value to be decorated with any missing http or trailing .com</param>
        /// <returns type="String" >The url with any missing leading http or trailing .com included</returns>
        var parts = splitProtocol(value);
        if (parts[0].length === 0) {
            parts[0] = "http";
        }
        var prefix = parts[1].substr(0, 2);
        if (prefix !== "//" && prefix !== "\\\\") {
            parts[1] = "//" + parts[1];
        }

        return parts[0] + ":" + parts[1] + parts[3] + parts[2];
    }


    function urlFieldView(uiform, container, value, fieldTitle) {
        /// <summary>
        /// Url field render
        /// </summary>
        /// <param name="container" type="HTMLElement" optional="false">
        /// This is the container where the value should be rendered for display
        /// </param>
        /// <param name="value" type="Object" optional="false">
        /// This is the value to be rendered.
        /// </param>

        if (isValid(value)) {
            uiform.setCssStyle(container, "link");
        }
        container.innerText = value;
        container.setAttribute('aria-label', fieldTitle);

        return true;
    };

    function urlSectionView(uiform, container, valueContainer, fieldAttr, fieldValue, fieldTitle, displayValue) {
        /// <summary>
        /// Set a field formatter for the given type, the passed fieldFormatFunction will be
        /// called to display any fields of the defined type.
        /// </summary>
        /// <param name="container" type="HTMLElement" optional="false">
        /// The container where the field title and value has been rendered.
        /// </param>
        /// <param name="fieldAttr" type="Object" optional="false">
        /// This is the field attributes for the field.
        /// </param>
        /// <param name="fieldValue" type="Function" optional="false">
        /// This is the field formatter / renderer function that is called to populate a container div with the value.
        /// The signature of the function is function(/*.
        /// </param>

        if (!isValid(fieldValue)) {
            return container;
        }
        var toolTip = fieldTitle + "\n" + displayValue;
        var uri = decorate(fieldValue);
        R.setSectionAttributes(container),
        R.setComplexTooltip(container, uri, toolTip);
        R.hookupDomEvent(container, fieldValue, [{label: Jx.res.getString("/strings/profileFieldViewLink"), uri: uri}]);
        return container;
    };

    R.addRenderer("url", urlFieldView, urlSectionView);

});
