
// Copyright (C) Microsoft Corporation.  All rights reserved.

///<reference path="../../Shared/JSUtil/Namespace.js"/>
///<reference path="../../../Shared/Jx/Core/Jx.js"/>
///<reference path="../../../Shared/Jx/Core/Loc.js"/>
///<reference path="./uiFieldRenderers.js"/>
///<reference path="./AddressHelper.js"/>

Jx.delayDefine(People, ["UiFormMapHelper", "loadLocationRenderer"], function () {

    var P = window.People;
    var R = P.UiFormRenderers;

    P.loadLocationRenderer = Jx.fnEmpty;
    
    var _addressHelper = null;

    P.UiFormMapHelper = {
        getMapUrl: function (location) {

            function _appendAddressDetails(addressStr, details) {
                /// <param name="addressStr" type="String" />
                /// <param name="details" type="String" />
                if (Jx.isNonEmptyString(details)) {
                    var lineDetails = details.split('\n');
                    for (var line = 0, len = lineDetails.length; line < len; line++) {
                        if (addressStr.length > 0) {
                            addressStr += " ";
                        }
                        addressStr += lineDetails[line].replace(/[\ud800-\udfff]/g, "");
                    }
                }
                return addressStr;
            }

            var url = "bingmaps:";

            if (location && location.value) {
                var locationValue = location.value;
                var address = _appendAddressDetails('', locationValue.street);
                address = _appendAddressDetails(address, locationValue.city);
                address = _appendAddressDetails(address, locationValue.state);
                address = _appendAddressDetails(address, locationValue.zipCode);
                address = _appendAddressDetails(address, locationValue.country);

                if (location.metadata) {
                    var addressTypePrefixMap = { homeLocation: "_", businessLocation: "__", otherLocation: "___" };
                    var addressTypePrefix = addressTypePrefixMap[location.metadata.type];
                    if (addressTypePrefix) {
                        url += "?contact=";
                        url += location.metadata.contactName ? location.metadata.contactName : "";
                        url += addressTypePrefix;
                    } else {
                        url += "//?where=";
                    }
                } else {
                    url += "//?where=";
                }

                url += encodeURIComponent(address);
            } else {
                url += "//";
            }

            return url;
        }
    };

    function setAriaLabel(container, ariaLabelIds) {
        var count = ariaLabelIds.length;
        var labeledBy = "";
        for (var lp = 0; lp < count; lp++) {
            labeledBy += ariaLabelIds[lp] + " ";
        }
        container.setAttribute('aria-labelledby', labeledBy);
    };

    function locationView(uiform, container, value, fieldTitle) {
        /// <summary>
        /// Location field formatter.
        /// </summary>
        /// <param name="uiform" type="People.UiForm" optional="false">
        /// This is a reference to the host uiform object.
        /// </param>
        /// <param name="container" type="HTMLElement" optional="false">
        /// This is the container that the formatter should render the location field into.
        /// </param>
        /// <param name="value" type="Microsoft.WindowsLive.Platform.Location" optional="false">
        /// This is the location object that should be rendered.
        /// </param>

        var hasDisplayed = false;
        var parentId = container.id;
        var ariaLabelIds = [];
        var html = "";

        if (value) {
            if (!_addressHelper) {
                _addressHelper = new P.AddressHelper();
            }
            html = _addressHelper.formatViewAddressAsHtml(value, parentId + "-", ariaLabelIds);
            if (html) {
                WinJS.Utilities.setInnerHTML(container, html);
                hasDisplayed = true;

            }
        }

        setAriaLabel(container, ariaLabelIds);

        return hasDisplayed;
    };

    function mapLocationView(uiform, container, value, fieldTitle) {
        /// <summary>
        /// Location field formatter with an additional "link" class added to indicate that this is a hot link field.
        /// </summary>
        /// <param name="uiform" type="uiform" optional="false">
        /// This is a reference to the host uiform object.
        /// </param>
        /// <param name="container" type="HTMLElement" optional="false">
        /// This is the container that the formatter should render the location field into.
        /// </param>
        /// <param name="value" type="Object" optional="false">
        /// This is the location object that should be rendered.
        /// </param>

        if (locationView(uiform, container, value, fieldTitle)) {
            uiform.setCssStyle(container, "link");
            return true;
        }
        return false;
    };

    function mapSectionView(uiform, container, valueContainer, fieldAttr, fieldValue, fieldTitle) {
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
        Debug.assert(fieldValue);

        if (!_addressHelper) {
            _addressHelper = new P.AddressHelper();
        }
        var addressStringStored = _addressHelper.formatViewAddressAsString(fieldValue, false);
        var toolTip = fieldTitle + "\n" + addressStringStored;
        var location = {
            value: fieldValue,
        }
        var uri = P.UiFormMapHelper.getMapUrl(location);

        R.setSectionAttributes(container);
        R.setComplexTooltip(container, uri, toolTip);
        // Normalize line endings so that copy and paste results appear with appropriate line breaks
        var normalizedAddressStringStored = addressStringStored.replace(/\r\n|\r|\n/g, '\r\n');
        R.hookupDomEvent(container, normalizedAddressStringStored, [{label: Jx.res.getString("/strings/profileFieldMapAddress"), uri: uri}]);
        return container;
    };

    // A location view is for presentation but does not support any action
    R.addRenderer("location", locationView);

    // Map location is a location view that is also actionable
    R.addRenderer("mapLocation", mapLocationView, mapSectionView);
});
