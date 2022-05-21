
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Tx,People,Include*/

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\socialCore\ContactInfo.js" />
/// <reference path="..\..\socialModel\ContactCache.js" />

Include.initializeFileScope(function () {
    //Provides tests for the <see cref="T:People.RecentActivity.ContactCache" /> class.

    Tx.test("contactCacheTests.testFindOrCreateContact", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.ContactCache.FindOrCreateContact(People.RecentActivity.Core.ContactInfo)" />
        /// </summary>
        var info1 = People.RecentActivity.Core.create_contactInfo('CCT_CONTACT_ID_1', 'CCT_CONTACT_SID_1', null, 'CCT_CONTACT_NAME_1', null, false);
        var info2 = People.RecentActivity.Core.create_contactInfo('CCT_CONTACT_ID_2', 'CCT_CONTACT_SID_2', null, 'CCT_CONTACT_NAME_2', null, false);
        // make sure we get the same reference twice.
        var contact = People.RecentActivity.ContactCache.findOrCreateContact(info1);
        tc.isNotNull(contact);
        tc.areEqual(contact, People.RecentActivity.ContactCache.findContact(info1));
        tc.areEqual(contact, People.RecentActivity.ContactCache.findOrCreateContact(info1));
        // make sure findcontact returns null for unknown contacts.
        tc.isNull(People.RecentActivity.ContactCache.findContact(info2));
    });

});