
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="%OBJECT_ROOT%\JavaScript\References\%BUILDTYPE%\%BUILDTARGET%\BiciIdl_Public.js" />

Jx.delayDefine(People, "Bici", function () {

    window.People.Bici = {
        // Datapoint: SocialReactionUpdated
        // Parameter: ReactionType

        ReactionType: {
            favorite: 2,
            mail: 4,
            message: 5,
            address: 6,
            // details: 7, Obsolete (was for View profile "all details")
            pin: 8,
            edit: 9,
            call: 10,
            sms: 11,
            audioCall: 12,
            videoCall: 13,
            webProfile: 14,
        },
        
        // Datapoint: SocialPageViewed
        // Parameter: PageName
        allPage: 10,
        mePage: 11,
        landingPage: 12,
        createContact: 13,
        editMePicture: 14,
        linkPerson: 15,
        search: 16,
        viewMeProfile: 17,
        editProfile: 18,

        // Datapoint: AccountDialogOverall or AccountDialogStep
        // Parameter: ConfigSource
        ConfigSource: {
            catalogConfig: 1,
            accountsConfig: 2,
            autoDiscoverByEmail: 3,
            autoDiscoverByUserDomain: 4,
            pop: 5,
            manual: 6,
            notAttempted: 7,
            oauth2: 8
        },

        // Datapoint: AccountDialogOverall or AccountDialogStep
        // Parameter: EntryPoint
        EntryPoint: {
            other: 0,
            canvas: 1,
            accountSettings: 2,
            easiFlow: 3
        },

        // Datapoint: AccountDialogOverall or AccountDialogStep
        // Parameter: SyncProtocol
        SyncProtocol: {
            unknown: 0,
            eas: 1,
            imap: 2,
            pop: 3
        }
    };
});
