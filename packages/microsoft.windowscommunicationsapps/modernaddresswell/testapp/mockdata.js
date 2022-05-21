
// This file contains functions to create mock data for the Address Well Test App

// Global variables used to save original functions before mocking them
var originalQueryRelevantContacts = null;
var originalQueryContactsByInput = null;

var mockData;

// Global variable updated by the managed automation to determine results returned for any query.
var numQueryResults = -1;

// Global variable updated by the managed automation to explicitly specify the results of a query. Will be used if non-empty.
var mockQueryResults = [];

// Global variable updated by the managed automation to specify whether or not auto-resolution should succeed.
var autoResolveSuccess = false;

function createMockContact(id, name, emails, tileUrl) {
    /// <summary>
    /// Creates a mock AddressWell.Contact object 
    /// </summary>
    /// <param name="id" type="String">Object ID</param>
    /// <param name="name" type="String">Visible name of contact</param>
    /// <param name="emails" type="Array">Array of string emails for contact</param>
    /// <param name="tileUrl" type="String">URL to tile</param>

    var mockPerson = {
        objectId: id,
        calculatedUIName: name,
        getUserTile: function () {
            return null;
        }
    };

    // Need to create a recipient for each email
    var recipients = [];

    for (var i = 0; i < emails.length; i++) {
        recipients.push({
            calculatedUIName: name,
            emailAddress: emails[i],
            person: mockPerson,
            isJsRecipient: true
        });
    }

    return new AddressWell.Contact(mockPerson, recipients, tileUrl);
}

function createMockRecipient(id, name, email, tileUrl) {
    /// <summary>
    /// Creates a mock IRecipient object 
    /// </summary>
    /// <param name="id" type="String">Object ID</param>
    /// <param name="name" type="String">Visible name of recipient</param>
    /// <param name="email" type="String">The email for recipient</param>
    /// <param name="tileUrl" type="String">URL to tile</param>

    var mockPerson = {
        objectId: id,
        calculatedUIName: name,
        getUserTile: function () {
            return null;
        }
    };


    var recipient = {
        calculatedUIName: name,
        emailAddress: email[0],
        person: mockPerson,
        isJsRecipient: true
    };

    return recipient;
}

function SetupMockData () {
    /// <summary>
    /// Similar to mocking functions in a unit test, this operation saves the real implementation 
    /// of queryRelevantContacts and queryContactsByInput in variables and replaces them with mock functions
    /// </summary>

    if (originalQueryRelevantContacts === null && originalQueryContactsByInput === null) {
        originalQueryRelevantContacts = AddressWell.Controller.prototype._queryRelevantContacts;
        originalQueryContactsByInput = AddressWell.Controller.prototype._queryContactsByInputAsync;
        AddressWell.Controller.prototype._queryRelevantContacts = AddressWell.Controller.prototype._queryMockSesameStreetCharacters;
        AddressWell.Controller.prototype._queryContactsByInputAsync = AddressWell.Controller.prototype._mockQueryContactsByInput;
        AddressWell.Controller.prototype._wordWheelSearch = AddressWell.Controller.prototype._mockWordWheelSearch;
    }

    // Generate mock contacts
    if (!mockData) {
        mockData = [
            createMockContact("m100", "Abby Cadabby", ["abbycadabby@sesame.com", "anotherabby@sesame.com"], null),
            createMockContact("m101", "Aloysius Snuffleupagus", ["aloysius@sesame.com", "aloysius@sesame1.com", "aloysius@sesame2.com", "aloysius@sesame3.com"], null),
            createMockContact("m102", "Baby Natasha", ["babynatasha@sesame.com"], null),
            createMockContact("m103", "Bert", ["bert@sesame.com", "bert@email1.com", "bert@email2.com", "bert@email3.com", "bert@email4.com"], null),
            createMockContact("m104", "Buster", ["buster@sesame.com"], null),
            createMockContact("m105", "Betty Lou", ["BettyLou@sesame.com"], null),
            createMockContact("m106", "Big Bird", ["BigBird@sesame.com", "big@bird1.com", "big@bird2.com", "big@bird3.com", "big@bird4.com", "big@bird5.com"], null),
            createMockContact("m107", "Elmo", ["Elmo@sesame.com", "anotherelmo@sesame.com", "elmo@awesome.com"], null),
            createMockContact("m108", "Empty Tile Man", ["Empty@Tile.com"], null),
            createMockContact("m109", "Cookie Monster", ["cookie@monster.com"], null),
            createMockContact("m110", "Countess von Backwards", ["countess@backwards.com"], null),
            createMockContact("m111", null, ["curlybear@fabrikam.com"], null),
            createMockContact("m112", "Ernie", ["ernie@sesame.com"], null),
            createMockContact("m113", "Forgetful Jones", ["forgetful@jones.com"], null),
            createMockContact("m114", "Zoe", ["zoe@sesame.com"], null),
            createMockContact("m115", "Two-Headed Monster", ["twoheaded@monster.com"], null),
            createMockContact("m116", "Oscar", ["oscar@sesame.com"], null),
            createMockContact("m117", "Guy Smiley", ["guy@smiley.com"], null),
            createMockContact("m118", "Barkley the Dog", ["barkley@dog.com"], null),
            createMockContact("m119", "Null", ["NoTile2@fabrikam.com"], null),
            createMockContact("m120", "Baby Bear", ["baby@bear.com"], null),
            createMockContact("m121", "Rosita", ["rosita@sesame.com", "rosita2@sesame.com"], null),
            createMockContact("m122", "Mumford the Magician", ["mumford@magician.com"], null),
            createMockContact("m123", "Little Bird", ["little@bird.com"], null),
            createMockContact("m124", "Herry Monster", ["herry@monster.com"], null),
            createMockContact("m125", "Kingston Livingston III", ["kingston@livingston.com"], null),
            createMockContact("m126", "Bruno", ["bruno@sesame.com"], null),
            createMockContact("m127", null, ["honkers@dingers.com"], null),
            createMockContact("m128", "Colambo", ["colambo@sesame.com"], null),
            createMockContact("m129", "Kermit the Frog", ["kermit@sesame.com"], null)
        ];
    }
};

function TearDownMockData () {
    /// <summary>
    /// Restoring function that have been mocked earlier to their original implementations.
    /// </summary>

    if (originalQueryRelevantContacts !== null && originalQueryContactsByInput !== null) {
        AddressWell.Controller.prototype._queryRelevantContacts = originalQueryRelevantContacts;
        AddressWell.Controller.prototype._queryContactsByInputAsync = originalQueryContactsByInput;
        originalQueryRelevantContacts = null;
        originalQueryContactsByInput = null;
    }
};

// This function overrides the current implementation in AddressWellController because the test app desires random real data even in the case of using real data
AddressWell.Controller.prototype._queryRelevantContacts = function (desiredNumber, currentRecipients) {
    /// <summary>
    /// Queries the Contact Platform given the number of relevant contacts to display and a list of current recipients in the relevant context.
    /// </summary>
    /// <param name="desiredNumber" type="Number">The given number of relevant contacts desired.</param>
    /// <param name="currentRecipients" type="Array">An array of IRecipient objects to be considered in the relevant context.</param>
    /// <returns type="Array">A collection of contacts</returns>

    var contacts = [];

    // In the case the caller wants to config the number of tiles to replace during each relevancy refresh
    // We will pick the minimum out of the config number and the given desired number
    if (this._mockDataTilesToReplace >= 0) {
        desiredNumber = Math.min(this._mockDataTilesToReplace, desiredNumber);
    }
    return contacts;
};

AddressWell.Controller.prototype._queryMockSesameStreetCharacters = function (desiredNumber, currentRecipients) {
    /// <summary>
    /// Returns a collection of random sesame street contacts for testing purpose.
    /// </summary>
    /// <param name="desiredNumber" type="Number">The given number of relevant contacts desired.</param>
    /// <param name="currentRecipients" type="Array">An array of IRecipient objects to be considered in the relevant context.</param>
    /// <returns type="Array">A collection of contacts</returns>

    var contacts = [];

    if (mockQueryResults.length > 0) {
        // If there are mock query results set, preference using those above all else.
        for (var i = 0; i < mockQueryResults.length; i++) {
            var mockContact = mockQueryResults[i];
            contacts.push(createMockContact(mockContact.id, mockContact.name, mockContact.emails, mockContact.tileUrl));
        }

        return contacts;
    }
    else {
        // We let the test automation override the number returned. 
        if (numQueryResults >= 0) {
            desiredNumber = numQueryResults;
        }

        // Only proceed if we wish to replace at least one tile
        if (desiredNumber > 0) {

            // Since we don't have alot of test data, we limit the number that we can populate
            desiredNumber = Math.min(desiredNumber, mockData.length);

            // Do a loop to populate the contacts
            for (var i = 0; i < desiredNumber; i++) {
                var /* @dynamic */testData = mockData[i];
                contacts.push(testData);
            }
        }

        return contacts;
    }
};

AddressWell.Controller.prototype._mockWordWheelSearch = function (input) {
    /// <summary>
    /// Performs a mocked experience for wordwheeling based on a given input.
    /// </summary>
    /// <param name="input" type="String">The given user input.</param>
    /// <returns type="WinJS.Promise">Returns a promise which completes once the results are populated.</returns>
    this._onWordWheelSearchComplete(getMockWordWheelResultsAsRecipients(input));
   
};

AddressWell.Controller.prototype._mockQueryContactsByInput = function (input) {
    /// <summary>
    /// Performs a mocked experience for wordwheeling based on a given input.
    /// </summary>
    /// <param name="input" type="String">The given user input.</param>
    /// <returns type="WinJS.Promise">Returns a promise which completes once the results are populated.</returns>

    this._lvCollection = {
        removeEventListener: function () { },
        dispose: function () { }
    };
    // Search ID is 0 initially
    this._lvSearchId = 0;

    var resultCount = AddressWell.maxWordWheelContacts;

    // Allow the test automation to override the number of results returned.
    if (numQueryResults >= 0)
    {
        resultCount = numQueryResults;
    }

    var me = this;
    return new WinJS.Promise(
        /* init */ function AddressWellController_queryContactsByInputInit(complete, error) {
            ///<param name="complete" type="Function">Completed callback</param>
            ///<param name="error" type="Function">Error callback</param>

            me._lvResults = getMockWordWheelResultsAsContacts(input);

            // Search ID is 0 after the function is done
            complete(0);
        },
        /* onCancel */ function AddressWellController_queryContactsByInputCancel() { /* This promise function does not support cancellation */ }
        );
};

AddressWell.Controller.prototype._mockAutoResolveRecipient = function (eventData) {
    /// <summary>
    /// Performs a mocked experience for auto resolving a recipient - always defaults to unresolved.
    /// </summary>
    /// <param name="eventData">The event data object</param>
    var unresolvedRecipient = eventData.recipient;

    if (autoResolveSuccess) {
        var contact = createMockContact("id0", unresolvedRecipient.emailAddress, [unresolvedRecipient.emailAddress + "@mail.com"], null);
        AddressWell.AutoResolver.prototype.resolveAgainstCurrentResults(unresolvedRecipient, [contact]);
    }
    else {
        unresolvedRecipient.updateState(AddressWell.RecipientState.unresolvable);
    }
};

function getMockWordWheelResultsAsRecipients(input) {
    return getMockWordWheelResults(input, createMockRecipient);
};

function getMockWordWheelResultsAsContacts(input) {
    return getMockWordWheelResults(input, createMockContact);
};

function getMockWordWheelResults(input, fnMockGenerator) {
    var contactResults = [];

    // Test data has the following properties:
    // - Test data starts with the input that has been typed in (this allows us to see that it is changing as the user types)
    // - Test data returns email-only results if the input contains "@" (this allows us to test the no name case)
    // - Test data returns no results if the input contains "." (this allows us to test the no results case)

    if (input.indexOf(".") === -1) {
        if (input.indexOf("@") === -1) {
            for (var index = 0; index < AddressWell.maxWordWheelContacts; index++) {
                contactResults.push(fnMockGenerator(
                    "0", /* Use this to identify fake person id */
                    input + "Name" + index,
                    [input + "MyEmail" + index.toString() + "@mail.com"], /* Set up a fake email address */
                    null /* Null user tile */));
            }
        } else {
            // Returns email-only results if the input contained "@"
            for (var j = 0; j < AddressWell.maxWordWheelContacts; j++) {
                contactResults.push(fnMockGenerator(
                    "0", /* Use this to identify fake person id */
                    null,
                    ["MyEmail" + j.toString() + "@mail.com"], /* Set up a fake email address */
                    null /* Null user tile */));
            }
        }
    }
    // Return no results if the input contained "."

    return contactResults;
};