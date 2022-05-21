
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Share, Jx, Windows, Debug*/

Share.QuickLinkData = function (platform) {
    ///<summary>
    /// Share.QuickLinkData constructor.  Call using new.
    /// Stores and retrieves the account last used to share to a given quicklink.
    ///</summary>
    ///<param name="platform" type="Microsoft.WindowsLive.Platform.Client">The platform object to use</param>

    this._platform = platform;
    this._dataContainer = Jx.appData.localSettings().container("ShareToMailQuickLinkData");
};

// Private Variables
Share.QuickLinkData.prototype._platform = null;

Share.QuickLinkData.prototype._calculateDaysBetween = function (date1, date2) {
    // Calculate the number of days between two dates
    var differenceInMilliseconds = Math.abs(date1.getTime() - date2.getTime());
    return Math.round(differenceInMilliseconds / 86400000 /*number of milliseconds in a day*/);
};

Share.QuickLinkData.prototype._getCurrentDate = function () {
    // We split out this function so the tests can override it
    return new Date();
};

// Public Variables

Share.QuickLinkData.prototype.associateFromAccount = function (quickLinkId, fromAccount) {
    /// <summary>
    /// Associates a from account with a particular quick link ID, replacing the old associated account (if any)
    /// </summary>
    /// <param name="quickLinkId" type="String">The quick link ID of the quick link being associated</param>
    /// <param name="fromAccount" type="Microsoft.WindowsLive.Platform.IAccount">The account to associate with the quick link</param>

    var association = new Windows.Storage.ApplicationDataCompositeValue();
    association.fromAccountId = fromAccount.objectId;
    association.lastUseDate = this._getCurrentDate();

    this._dataContainer.set(quickLinkId, association);
};

Share.QuickLinkData.prototype.getAssociatedFromAccount = function (quickLinkId) {
    /// <summary>
    /// Retrieves the from account that was previously associated with a given quick link
    /// </summary>
    /// <param name="quickLinkId" type="String">The quick link ID for which to retrieve the associated from account</param>
    /// <returns type="Microsoft.WindowsLive.Platform.IAccount">The from account associated with the given quick link, or null if none is available</returns>

    // Check if we've set this association before
    var association = this._dataContainer.get(quickLinkId);
    if (!Jx.isNullOrUndefined(association)) {
        Debug.assert(Jx.isNonEmptyString(association.fromAccountId));

        // Retrieve the associated from account from the platform
        var fromAccountId = association.fromAccountId,
            fromAccount = this._platform.accountManager.loadAccount(fromAccountId);

        // This may still be null if the account has been deleted
        return fromAccount;
    }

    // No valid associated account, return null
    return null;
};

Share.QuickLinkData.prototype.clean = function (maxListSize, daysToKeep) {
    /// <summary>
    /// Clears out the list of old quick link associations to prevent it from getting too bloated
    /// </summary>
    /// <param name="maxListSize" type="Number">The maximum size of the list. If the list is smaller than this number, it won't be cleaned at all.</param>
    /// <param name="daysToKeep" type="Number">The number of days old that marks the threshold for what makes an "old" association.</param>

    // Only bother cleaning if we have more than the max size
    var associationList = this._dataContainer.getValues();
    if (associationList.size > maxListSize) {
        // Determine which values are too old to keep around any more
        var idsToRemove = [];
        for (var property in associationList) {
            // We don't want inherited properties, only native ones
            if (associationList.hasOwnProperty(property)) {
                // The value of "property" is a quick link ID
                var association = associationList[property];
                Debug.assert(Jx.isDate(association.lastUseDate));
                // If this quick link was last used more than daysToKeep days ago, we're going to remove it
                if (this._calculateDaysBetween(association.lastUseDate, this._getCurrentDate()) > daysToKeep) {
                    idsToRemove.push(property);
                }
            }
        }

        // Remove the old keys
        for (var i = 0; i < idsToRemove.length; i++) {
            associationList.remove(idsToRemove[i]);
        }
    }
};
