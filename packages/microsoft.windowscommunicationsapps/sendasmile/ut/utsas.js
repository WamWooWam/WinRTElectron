
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    setup = function () {
        /// <summary>
        /// Saves variables that will be changed by the tests
        /// </summary>

        SasManager._config = {
            enableFeedback: false,
            application: { lookup: function (app) {
                return { addSettingsLink: true,
                    enableLogCollection: false,
                    addAppBarButton: true,
                    surveyId: 2000
                };
            }
            },
            privacyUrl: ""
        };
    };

    Tx.test("SasUnitTests.testConstructor", function (tc) {
        /// <summary>
        /// Tests new Jx.Sas()
        /// </summary>
        setup();

        var mySas = new Jx.Sas("test", "elTesto");

        tc.areEqual(mySas._localizedAppName, "elTesto", "Localized app name set incorrectly");
        tc.areEqual(mySas._id, "SendASmile", "Id set incorrectly");
        tc.isNotNull(mySas._feedback, "Feedback property bag should have been initialized");
        tc.areEqual(mySas._feedback.application, "test", "Wrong application name used");
    });


})();


