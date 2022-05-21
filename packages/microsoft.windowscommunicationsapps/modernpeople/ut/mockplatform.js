
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Platform\ConnectedNetworkChangedEventType.js" />
/// <reference path="..\Platform\ContactId.js" />
/// <reference path="..\Platform\Platform.js" />
/// <reference path="..\Platform\PsaStatus.js" />
/// <reference path="TestData.js" />
/// <reference path="TestUtils.js" />

People.RecentActivity.UnitTests.MockPlatform = function() {
    /// <summary>
    ///     Represents a mock contact platform for unit tests.
    /// </summary>
    People.RecentActivity.Platform.Platform.call(this);
};

Jx.inherit(People.RecentActivity.UnitTests.MockPlatform, People.RecentActivity.Platform.Platform);

People.RecentActivity.UnitTests.MockPlatform.prototype.getContactInfoDetails = function(info) {
    /// <summary>
    ///     Gets additional contact details.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.contactInfo">The info.</param>
    var contact = People.RecentActivity.UnitTests.TestUtils.getUserContactInfo();
    if (info.id === contact.id) {
        info.name = contact.name;
        info.picture = contact.picture;
        info.personId = this.getUserPersonId();
    }
    else {
        for (var n = 0, coll = People.RecentActivity.UnitTests.TestData.contacts; n < coll.length; n++) {
            var contactInfo = coll[n];
            if (contactInfo.id === info.id) {
                info.name = contactInfo.name;
                info.picture = contactInfo.picture;
            }        
        }    
    }
};

People.RecentActivity.UnitTests.MockPlatform.prototype.getContactId = function(personId, networkId) {
    /// <summary>
    ///     Gets a <see cref="T:People.RecentActivity.Platform.ContactId" /> for the given person+network combination.
    /// </summary>
    /// <param name="personId" type="String">The ID of the person.</param>
    /// <param name="networkId" type="String">The network ID.</param>
    /// <returns type="People.RecentActivity.Platform.ContactId"></returns>
    var contact = People.RecentActivity.UnitTests.TestUtils.getUserContactInfo();
    return new People.RecentActivity.Platform.ContactId(contact.id, contact.sourceId);
};

People.RecentActivity.UnitTests.MockPlatform.prototype.getUserPersonId = function() {
    /// <summary>
    ///     Gets me person id.
    /// </summary>
    /// <returns type="String"></returns>
    return 'Me';
};

People.RecentActivity.UnitTests.MockPlatform.prototype.onInitialize = function() {
    /// <summary>
    ///     Called when the platform is initialized.
    /// </summary>
    var contact = People.RecentActivity.UnitTests.TestUtils.getUserContactInfo();
    this.onConnectedNetworkChanged(People.RecentActivity.Platform.ConnectedNetworkChangedEventType.connected, contact.sourceId, null, People.RecentActivity.UnitTests.TestUtils.getNetworkInfo(contact.sourceId).name, 'FACEBOOK_TOKEN', contact.id, People.RecentActivity.Platform.PsaStatus.connected, People.RecentActivity.Platform.PsaStatus.connected);
};

People.RecentActivity.UnitTests.MockPlatform.prototype.getSourceId = function(contact) {
    /// <summary>
    ///     Gets the source id for a contact.
    /// </summary>
    /// <param name="contact" type="Microsoft.WindowsLive.Platform.Contact">The contact.</param>
    /// <returns type="String"></returns>
    return contact.network.sourceId;
};

People.RecentActivity.UnitTests.MockPlatform.prototype.getObjectId = function(contact) {
    /// <summary>
    ///     Gets the object ID for a contact.
    /// </summary>
    /// <param name="contact" type="Microsoft.WindowsLive.Platform.Contact">The contact.</param>
    /// <returns type="String"></returns>
    return null;
};

People.RecentActivity.UnitTests.MockPlatform.prototype.getNetworkName = function(contact) {
    /// <summary>
    ///     Gets the network name of the contact.
    /// </summary>
    /// <param name="contact" type="Microsoft.WindowsLive.Platform.Contact">The contact.</param>
    /// <returns type="String"></returns>
    return 'Facebook';
};

People.RecentActivity.UnitTests.MockPlatform.prototype.getNetworkIcon = function(contact) {
    /// <summary>
    ///     Gets the network icon of the contact.
    /// </summary>
    /// <param name="contact" type="Microsoft.WindowsLive.Platform.Contact">The contact.</param>
    /// <returns type="String"></returns>
    return 'Facebook.gif';
};

People.RecentActivity.UnitTests.MockPlatform.prototype.getUserPersonCid = function() {
    /// <summary>
    ///     Gets the user person cid.
    /// </summary>
    /// <returns type="String"></returns>
    return 'me_cid';
};

People.RecentActivity.UnitTests.MockPlatform.prototype.getConnectableNetworks = function() {
    /// <summary>
    ///     Gets the info for the user's connectable networks.
    /// </summary>
    /// <returns type="Array" elementType="networkInfo"></returns>
    return new Array(0);
};