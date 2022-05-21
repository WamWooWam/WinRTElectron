
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../JSUtil/Include.js"/>
/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>
/// <disable>JS2076.IdentifierIsMiscased</disable>

/*global Microsoft,Jx,Debug,People*/

Jx.delayDefine(People, "IdentityControlActions", function () {

    var P = People;

    var IdentityControlActions = P.IdentityControlActions = {};

    function getPerson(/*@dynamic*/dataObject) {
        ///<summary>Gets the person object for a given data object</summary>
        ///<param name="dataObject">The Person, Contact, Recipient or object literal</param>
        ///<returns type="String"/>
        var objectType = dataObject.objectType;
        var person = null;

        switch (objectType) {
            case "Person":
                person = dataObject;
                break;
                
            case "Recipient":
                person = dataObject.person;
                break;
        }

        return person;
    }

    function getUrl(/*@dynamic*/dataObject) {
        ///<summary>Gets an URL for the default click action for the given contact</summary>
        ///<param name="dataObject">The Person, Contact, Recipient or object literal</param>
        ///<returns type="String"/>
        var objectType = dataObject.objectType;

        Jx.bici.increment(Microsoft.WindowsLive.Instrumentation.Ids.People.identityControlActivate, 1);

        var url;
        switch (objectType) {
            case "MeContact": url = P.Nav.getMeUri(); break;
            case "Contact": Debug.assert(false, "No default action for contacts.  onClick should be specified in the options, or interactive should be set to false"); break;
            case "Person": url = P.Nav.getViewPersonUri(dataObject.objectId); break;
            case "literal": url = P.Nav.getViewPersonUri(null, dataObject); break;
            case "Recipient": url = P.Nav.getViewRecipientUri(dataObject); break;
            case "SearchPerson": url = P.Nav.getViewPersonUri(dataObject.objectId, dataObject); break;
            default: Debug.assert(false, "Unrecognized object: " + objectType); break;
        }

        return url;
    }

    IdentityControlActions.primaryAction = function (/*@dynamic*/dataObject, /*@type(HTMLElement)*/node) {
        var person = getPerson(dataObject);

        if (!P.Nav.inPeopleApp() && person) {
            P.ContactCard.show(person, node);
        } else {
            var url = getUrl(dataObject);
            if (Jx.isNonEmptyString(url)) {
                P.Nav.navigate(url);
            }
        }
    };

});
