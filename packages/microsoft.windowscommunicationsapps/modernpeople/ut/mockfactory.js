
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\ContactInfo.js" />
/// <reference path="..\Core\NetworkInfo.js" />
/// <reference path="..\Core\NetworkReactionInfo.js" />
/// <reference path="..\Core\NetworkReactionInfoType.js" />
/// <reference path="..\Providers\FeedProviderFactory.js" />
/// <reference path="..\Providers\IdentityType.js" />
/// <reference path="MockLog.js" />
/// <reference path="MockProvider.js" />

People.RecentActivity.UnitTests.MockFactory = function() {
    /// <summary>
    ///     Provides a mock factory for unit tests.
    /// </summary>
    /// <field name="_defaultReactions$1" type="Array" elementType="networkReactionInfo" static="true"></field>
    /// <field name="_reactions$1" type="Array" elementType="networkReactionInfo"></field>
    /// <field name="_commentsEnabled$1" type="Boolean"></field>
    People.RecentActivity.Providers.FeedProviderFactory.call(this);
};

Jx.inherit(People.RecentActivity.UnitTests.MockFactory, People.RecentActivity.Providers.FeedProviderFactory);


People.RecentActivity.UnitTests.MockFactory._defaultReactions$1 = [ People.RecentActivity.Core.create_networkReactionInfo('REACTIONTYPE_ID_1', People.RecentActivity.Core.NetworkReactionInfoType.like, 'REACTIONTYPE_NAME_1', 'feed-icon', 'selfpage-icon', 'css-class', false, false) ];
People.RecentActivity.UnitTests.MockFactory.prototype._reactions$1 = null;
People.RecentActivity.UnitTests.MockFactory.prototype._commentsEnabled$1 = false;

Object.defineProperty(People.RecentActivity.UnitTests.MockFactory.prototype, "commentsEnabled", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether comments are enabled.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._commentsEnabled$1;
    },
    set: function(value) {
        this._commentsEnabled$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.MockFactory.prototype, "reactions", {
    get: function() {
        /// <summary>
        ///     Gets or sets the reactions.
        /// </summary>
        /// <value type="Array" elementType="networkReactionInfo"></value>
        if (this._reactions$1 != null) {
            return this._reactions$1;
        }

        return People.RecentActivity.UnitTests.MockFactory._defaultReactions$1;
    },
    set: function(value) {
        this._reactions$1 = value;
    }
});

People.RecentActivity.UnitTests.MockFactory.prototype.createFeedProvider = function(identityId, identityType, network, events) {
    /// <summary>
    ///     Creates a feed provider.
    /// </summary>
    /// <param name="identityId" type="String"></param>
    /// <param name="identityType" type="People.RecentActivity.Providers.IdentityType"></param>
    /// <param name="network" type="People.RecentActivity.Core.networkInfo"></param>
    /// <param name="events" type="People.RecentActivity.Core.IFeedProviderEvents"></param>
    /// <returns type="People.RecentActivity.Core.IFeedProvider"></returns>
    People.RecentActivity.UnitTests.MockLog.add('MockFactory.CreateFeedProvider', [ identityId, network, events ]);
    if (identityId === 'PERSON_ID') {
        var networks = this._getUnitTestNetworkInfo$1();
        if (network.id === networks[0].id) {
            return new People.RecentActivity.UnitTests.MockProvider(identityId, events);
        }

    }
    else if (identityId === '0123456789') {
        var networks = this._getUINetworkInfo$1();
        if (network.id === networks[0].id) {
            return People.RecentActivity.Providers.FeedProviderFactory.prototype.createFeedProvider.call(this, identityId, identityType, network, events);
        }    
    }

    return null;
};

People.RecentActivity.UnitTests.MockFactory.prototype.getNetworks = function(personId) {
    /// <summary>
    ///     Gets the networks of a person.
    /// </summary>
    /// <param name="personId" type="String"></param>
    /// <returns type="Array" elementType="networkInfo"></returns>
    People.RecentActivity.UnitTests.MockLog.add('MockFactory.GetNetworks', [ personId ]);
    if (personId === 'PERSON_ID') {
        return this._getUnitTestNetworkInfo$1();
    }
    else if (personId === '0123456789') {
        // we use this ID for UI testing, so return a few more networks.
        return this._getUINetworkInfo$1();
    }

    return new Array(0);
};

People.RecentActivity.UnitTests.MockFactory.prototype._getUnitTestNetworkInfo$1 = function() {
    /// <returns type="Array" elementType="networkInfo"></returns>
    var user = People.RecentActivity.Core.create_contactInfo('CONTACT_ID_1', 'CONTACT_SOURCE_1', null, 'CONTACT_NAME_1', 'http://picture-1', false);
    return [ People.RecentActivity.Core.create_networkInfo('NETWORK_ID', null, null, 'NETWORK_NAME', false, this.commentsEnabled, false, this.reactions, user) ];
};

People.RecentActivity.UnitTests.MockFactory.prototype._getUINetworkInfo$1 = function() {
    /// <returns type="Array" elementType="networkInfo"></returns>
    var user = People.RecentActivity.Core.create_contactInfo('0123456789', 'UI', null, 'John Doe', 'http://www.example.com/picture', false);
    var reaction = People.RecentActivity.Core.create_networkReactionInfo('WL_LIKE', People.RecentActivity.Core.NetworkReactionInfoType.like, '/strings/raItemReaction-WL-', 'feed-icon', 'selfpage-icon', 'css-class', false, false);
    return [ People.RecentActivity.Core.create_networkInfo('WL', null, null, 'Windows Live', false, true, false, [ reaction ], user) ];
};