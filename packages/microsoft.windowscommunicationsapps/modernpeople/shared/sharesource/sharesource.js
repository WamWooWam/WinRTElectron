
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../JsUtil/include.js" />
/// <reference path="../JsUtil/namespace.js" />

Jx.delayDefine(People, "ShareSource", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var S = P.ShareSource = {};

    var DataRequestedEventArgs = S.DataRequestedEventArgs = function (e) {
        /// <param name="e" type="Windows.ApplicationModel.DataTransfer.DataRequestedEventArgs">Data request from Share contract</param>
        this.request = e.request;
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    DataRequestedEventArgs.prototype.request = null;
    DataRequestedEventArgs.prototype.handled = false;

    S.sharePersonCallback = function (person, e) {
        ///<param name="person" type="Microsoft.WindowsLive.Platform.Person"/>
        ///<param name="e" type="People.ShareSource.DataRequestedEventArgs"/>
        NoShip.People.etw("sharePerson_start");
        Debug.assert(!e.handled, "Should only be at most one share handler registered at a time.");
        e.handled = true;

        // Set the metadata -- title and thumbnail.
        e.request.data.properties.title = person.calculatedUIName;
        var userTileForThumbnail = person.getUserTile(Microsoft.WindowsLive.Platform.UserTileSize.small, false);
        if (Jx.isObject(userTileForThumbnail) && Jx.isNonEmptyString(userTileForThumbnail.appdataURI)) {
            var userTileUri = new Windows.Foundation.Uri(userTileForThumbnail.appdataURI);
            e.request.data.properties.thumbnail = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(userTileUri);
        }

        // Query the platform for the user's adddress -- both Text and Html require this.
        var contacts = [];
        var linkedContactCollection = person.linkedContacts;
        for (var i = 0, len = linkedContactCollection.count; i < len; i++) {
            contacts.push(linkedContactCollection.item(i));
        }
        var locationFields = P.Contact.createUniqueFields(contacts, "mapLocation");
        var locations = locationFields.map(function (/*@type(_ContactUniqueField)*/field) { return { value: field.fieldValue }; });
        var mostRelevantLocationEntity = P.Location.getBestLocation(locations);
        var mostRelevantLocation = mostRelevantLocationEntity ? mostRelevantLocationEntity.value : null;
        
        S.sharePersonAsText(person, mostRelevantLocation, e.request);
        S.sharePersonAsHtml(person, mostRelevantLocation, e.request);

        NoShip.People.etw("sharePerson_end");
    };

    S.sharePersonAsText = function (person, mostRelevantLocation, request) {
        ///<param name="person" type="Microsoft.WindowsLive.Platform.Person"/>
        ///<param name="mostRelevantLocation" type="Microsoft.WindowsLive.Platform.Location"/>
        ///<param name="request" type="People.ShareSource.DataRequest"/>

        // Example content:
        // Bill Gates 
        // billg@microsoft.com
        // (555) 555-5555
        // 1 Microsoft Way, Redmond, WA
        // United States
        var textShareData = person.calculatedUIName + "\n";
        if (Jx.isNonEmptyString(person.mostRelevantEmail)) {
            textShareData += person.mostRelevantEmail + "\n";
        }
        if (Jx.isNonEmptyString(person.mostRelevantPhone)) {
            textShareData += person.mostRelevantPhone + "\n";
        }
        if (Jx.isObject(mostRelevantLocation)) {
            var addressHelper = new P.AddressHelper();
            var addressAsString = addressHelper.formatViewAddressAsString(mostRelevantLocation);
            if (Jx.isNonEmptyString(addressAsString)) {
                textShareData += addressAsString + "\n";
            }
        }

        request.data.setText(textShareData);
    };

    S.sharePersonAsHtml = function (person, mostRelevantLocation, request) {
        ///<param name="person" type="Microsoft.WindowsLive.Platform.Person"/>
        ///<param name="mostRelevantLocation" type="Microsoft.WindowsLive.Platform.Location"/>
        ///<param name="userTileForHtml" type="Microsoft.WindowsLive.Platform.UserTile"/>
        ///<param name="request" type="People.ShareSource.DataRequest"/>

        // In order to facilitate easy modification down the road, we construct the HTML fragment in one shot
        // and remove divs/inject contents afterwards.

        // Note that to simplify the process of handing the HTML over via Share, we're using the WinRT HtmlFormatHelper.
        // This ensures that the HTML we return is in the right format to be consumed by a share target. However,
        // HtmlFormatHelper only takes HTML fragments as input -- we can't pass in our own <head> tag. This means our CSS
        // has to be inline on the elements.
        var htmlContentRoot = document.createElement("body");
        htmlContentRoot.innerHTML =
            "<div style='padding: 3px'>" +
                // The contact card consists of two blocks side-by-side with a small space between them.

                // User tile block
                "<div id='userTile' style='display: inline-block; vertical-align: middle; margin-right: 4px;'>" +
                    "<img id='userTileImage' src='usertileimage'/>" +
                "</div>" +

                // Contact info block
                // Use 125% line height to keep the fields separated, except for Address.
                // Address is typically multi-line, so 100% height helps it look like a single field.
                "<div style='display: inline-block; vertical-align: middle; line-height: 125%;'>" +
                    "<div id='contactName'></div>" +
                    "<div id='contactEmail'></div>" +
                    "<div id='contactPhone'></div>" +
                    "<div id='contactAddress' style='line-height: 100%;'></div>" +
                "</div>" +
            "</div>";

        // Populate the divs for items we have, remove the divs for items we don't have.

        // Note that we're asking for the "medium" user tile. If the medium tile isn't in our cache, this is
        // going to fail -- we'll either fall back to a smaller tile (likely) or get nothing at all. The next
        // time this person is shared we'll probably have the medium tile in our cache. It's unfortunate that
        // first-time sharing a user will often result in the small tile being shared, but there isn't much
        // we can do given the tiny window of opportunity to respond to share requests. One alternative would
        // be to request the full-sized tile (or whatever it is that the landing page displays), and then
        // resize it in the HTML, but that has its own problems.
        var userTileForHtml = person.getUserTile(Microsoft.WindowsLive.Platform.UserTileSize.medium, false);
        if (Jx.isObject(userTileForHtml) && Jx.isNonEmptyString(userTileForHtml.appdataURI)) {
            var userTileUri = new Windows.Foundation.Uri(userTileForHtml.appdataURI);
            request.data.resourceMap["usertileimage"] = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(userTileUri);

            // Give the image alt-text equal to the contact's name.
            htmlContentRoot.querySelector("#userTileImage").setAttribute("alt", person.calculatedUIName);
        } else {
            htmlContentRoot.querySelector("#userTile").removeNode(true);
        }

        // Name is the one thing we'll always have (it falls back to an email address in the worst case).
        htmlContentRoot.querySelector("#contactName").innerText = person.calculatedUIName;

        var emailDiv = htmlContentRoot.querySelector("#contactEmail");
        var emailSanitizedString = Jx.escapeHtml(person.mostRelevantEmail);
        if (Jx.isNonEmptyString(person.mostRelevantEmail)) {
            emailDiv.innerHTML = "<a href='mailto:'" + emailSanitizedString + ">" + emailSanitizedString + "</a>";
        } else {
            emailDiv.removeNode(true);
        }

        var phoneDiv = htmlContentRoot.querySelector("#contactPhone");
        if (Jx.isNonEmptyString(person.mostRelevantPhone)) {
            phoneDiv.innerText = person.mostRelevantPhone;
        } else {
            phoneDiv.removeNode(true);
        }

        var addressDiv = htmlContentRoot.querySelector("#contactAddress");
        if (Jx.isObject(mostRelevantLocation)) {
            var addressHelper = new P.AddressHelper();
            addressDiv.innerHTML = addressHelper.formatViewAddressAsHtml(mostRelevantLocation);
        } else {
            addressDiv.removeNode(true);
        }

        var finalHtml = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(htmlContentRoot.innerHTML);

        request.data.setHtmlFormat(finalHtml);
    };
});
