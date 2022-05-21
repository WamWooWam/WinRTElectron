
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// TestMockPeople: The class is a simple container of test people.
(function () {
    
    var D = Mocks.Microsoft.WindowsLive.Platform.Data;
    var U = window.People.UnitTest;

    U.TestMockIMePeople = /*@constructor*/function() {
        this._provider = new D.JsonProvider({
            MeContact: {
                all: [
                    {
                        objectId: 'fred01',
                        firstName: 'Fred',
                        middleName: 'W',
                        lastName: 'Flintstone',
                        significantOther: 'Wilma',
                        homePhoneNumber: '1800-Bedrock',
                        mobilePhoneNumber: '000-000-0001',
                        personalEmailAddress: 'yell@window.rock',
                        homeLocation: {
                            street :'301 Cobblestone Way',
                            city: 'Bedrock'
                        },
                        companyName: 'Hanna Barbera',
                        businessEmailAddress: 'flintstone@hannabarbera.com',
                        businessLocation: {
                            street : 'C/O Warner Animation, Attn. Chief Privacy Officer, 4000 Warner Blvd., Bldg. 34R',
                            city: 'Burbank',
                            state: 'CA',
                            zipCode: '91522'
                        },
                        userTile: { 
                            appdataURI: 'UnitTest/Images/fred_flintstone_236.jpg'
                        },

                        canEdit: true,
                    }, {
                        objectId: 'barney01',
                        firstName: 'Barney',
                        middleName: '',
                        lastName: 'Rubble',
                        significantOther: 'Betty',
                        homePhoneNumber: '1800-Bedrock2',
                        mobilePhoneNumber: '000-000-0001',
                        personalEmailAddress: 'barney@window.rock',
                        homeLocation: {
                            street :'303 Cobblestone Way',
                            city: 'Bedrock'
                        },
                        businessLocation: {
                            street :'Slate Rock and Gravel Company, The Rockhead and Quarry Cave Construction Company',
                            city: 'Bedrock',
                            state: 'AA',
                            zipCode: '00000-0000',
                            country: 'Looney Tunes'
                        },
                        companyName: 'Hanna Barbera',
                        businessEmailAddress: 'barney@hannabarbera.com',
                        userTile: {
                            appdataURI: 'UnitTest/Images/barney_rubble_224.png'
                        },

                        canEdit: true,
                    }, {
                        objectId: 'acme01',
                        companyName: 'Acme Corporation',
                        businessLocation: {
                            street :'303 Cobblestone Way',
                            city: 'Bedrock'
                        },
                        businessEmailAddress: 'sales@acme.com',
                        businessPhoneNumber: '206-555-3855',
                        notes: 'Acme Corporation makes everything!',
                        webSite: 'http://www.acme.com'
                    }
                ]
            }
        });

    };

    U.TestMockIMePeople.prototype.getIMe = function(key) {
            return this._provider.getObjectById(key);
    };

} ());
